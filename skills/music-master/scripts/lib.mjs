// Shared helpers for music-master scripts. Node >= 18, no dependencies; needs ffmpeg + ffprobe.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

export const AUDIO_EXT = ['.wav', '.mp3', '.flac', '.m4a', '.aac', '.ogg', '.opus', '.aiff', '.aif'];

// ---------- argv ----------
export function parseArgs(argv = process.argv.slice(2)) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) out[key] = true;
      else { out[key] = next; i++; }
    } else out._.push(a);
  }
  return out;
}

// ---------- binaries ----------
function findFile(dir, name, depth) {
  if (depth < 0) return null;
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return null; }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isFile() && e.name.toLowerCase() === name.toLowerCase()) return p;
  }
  for (const e of entries) {
    if (e.isDirectory()) { const hit = findFile(path.join(dir, e.name), name, depth - 1); if (hit) return hit; }
  }
  return null;
}

const binCache = {};
export function bin(name) {
  if (binCache[name]) return binCache[name];
  const envPath = process.env[name.toUpperCase()];
  if (envPath && fs.existsSync(envPath)) return (binCache[name] = envPath);
  const exe = process.platform === 'win32' ? `${name}.exe` : name;
  const which = spawnSync(process.platform === 'win32' ? 'where' : 'which', [name], { encoding: 'utf8' });
  if (which.status === 0) {
    const p = which.stdout.split(/\r?\n/)[0].trim();
    if (p) return (binCache[name] = p);
  }
  if (process.platform === 'win32') {
    const base = path.join(os.homedir(), 'AppData', 'Local', 'Microsoft', 'WinGet', 'Packages');
    if (fs.existsSync(base)) {
      for (const d of fs.readdirSync(base)) {
        if (!/ffmpeg/i.test(d)) continue;
        const hit = findFile(path.join(base, d), exe, 4);
        if (hit) return (binCache[name] = hit);
      }
    }
  }
  throw new Error(`${name} não encontrado. Instale o ffmpeg (Windows: winget install Gyan.FFmpeg | macOS: brew install ffmpeg | Linux: apt install ffmpeg) ou defina a variável de ambiente ${name.toUpperCase()} com o caminho do executável.`);
}

// Args go straight to the process (no shell), so quotes, apostrophes and accents in paths are safe.
export function run(name, args, { allowFail = false } = {}) {
  const r = spawnSync(bin(name), args, { encoding: 'utf8', maxBuffer: 1 << 28 });
  if (r.error) throw r.error;
  if (r.status !== 0 && !allowFail) {
    throw new Error(`${name} falhou (código ${r.status}):\n${(r.stderr || '').slice(-3000)}`);
  }
  return r;
}

// ---------- files ----------
export function listAudio(target) {
  const st = fs.statSync(target);
  if (st.isFile()) return [path.resolve(target)];
  return fs.readdirSync(target)
    .filter((f) => AUDIO_EXT.includes(path.extname(f).toLowerCase()) && !f.startsWith('__mm_tmp'))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((f) => path.join(target, f));
}

export function tmpDir() {
  const d = path.join(os.tmpdir(), `music-master-${process.pid}`);
  fs.mkdirSync(d, { recursive: true });
  return d;
}

export function cleanup(dir) {
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch { /* ignore */ }
}

// Windows-forbidden characters become "_", "/" becomes " _ " (matches how Suno exports titles).
export function safeName(title) {
  return title
    .replace(/\s*\/\s*/g, ' _ ')
    .replace(/[\\?:*"<>|]/g, '_')
    .replace(/[. ]+$/, '')
    .trim();
}

// Key used to match a file to a title: no track number, no "(Remastered)", only letters/digits.
export function matchKey(s) {
  return s
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/, '')
    .replace(/\((re)?master(ed|izad[ao])?[^)]*\)/g, '')
    .replace(/^\s*\d+\s*[-._)]\s*/, '')
    .replace(/[^a-z0-9]+/g, '');
}

export function stripTrackPrefix(base) {
  return base.replace(/\s*\((Remastered|Remaster|Master)\)\s*$/i, '').replace(/^\s*\d+\s*-\s*/, '');
}

// ---------- probing / measuring ----------
export function probe(file) {
  const r = run('ffprobe', ['-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', file]);
  const j = JSON.parse(r.stdout);
  const a = j.streams.find((s) => s.codec_type === 'audio') || {};
  return {
    codec: a.codec_name,
    sampleRate: Number(a.sample_rate) || 48000,
    channels: a.channels || 2,
    bits: a.bits_per_raw_sample ? Number(a.bits_per_raw_sample) : (a.bits_per_sample || null),
    bitRate: Number(a.bit_rate || j.format.bit_rate) || null,
    duration: Number(j.format.duration) || 0,
    hasCover: j.streams.some((s) => s.codec_type === 'video'),
    tags: { ...(j.format.tags || {}) },
  };
}

export function loudness(file) {
  const r = run('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-af', 'ebur128=peak=true', '-f', 'null', '-']);
  const s = r.stderr.slice(r.stderr.lastIndexOf('Summary'));
  const num = (re) => { const m = s.match(re); return m ? parseFloat(m[1]) : null; };
  return { I: num(/I:\s+(-?[\d.]+)/), LRA: num(/LRA:\s+(-?[\d.]+)/), TP: num(/Peak:\s+(-?[\d.]+)/) };
}

// Mean level per frequency band, one decode pass. Cascaded 2-pole filters per edge.
export const BANDS = [
  ['sub<30', 'lowpass=f=30,lowpass=f=30'],
  ['30-120', 'highpass=f=30,lowpass=f=120'],
  ['120-500', 'highpass=f=120,lowpass=f=500'],
  ['500-2k', 'highpass=f=500,lowpass=f=2000'],
  ['2k-6k', 'highpass=f=2000,lowpass=f=6000'],
  ['6k-12k', 'highpass=f=6000,lowpass=f=12000'],
  ['>12k', 'highpass=f=12000,highpass=f=12000'],
];

export function bands(file) {
  const n = BANDS.length;
  const labels = BANDS.map((_, i) => `[b${i}]`).join('');
  const chains = BANDS.map(([, f], i) => `[b${i}]${f},volumedetect${i === 0 ? '[out]' : ',anullsink'}`);
  const graph = `[0:a]asplit=${n}${labels};${chains.join(';')}`;
  const r = run('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-filter_complex', graph, '-map', '[out]', '-f', 'null', '-']);
  const found = [...r.stderr.matchAll(/Parsed_volumedetect_(\d+)[^\n]*mean_volume:\s*(-?[\d.]+|-inf)/g)]
    .map((m) => ({ idx: Number(m[1]), v: m[2] === '-inf' ? -120 : parseFloat(m[2]) }))
    .sort((a, b) => a.idx - b.idx);
  const out = {};
  BANDS.forEach(([name], i) => { out[name] = found[i] ? found[i].v : null; });
  const mid = out['500-2k'];
  out.tilt = {
    sub: round(out['sub<30'] - out['30-120']),
    mud: round(out['120-500'] - mid),
    harsh: round(out['2k-6k'] - mid),
    air: round(out['>12k'] - mid),
  };
  return out;
}

export function audioMd5(file) {
  return run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-i', file, '-map', '0:a', '-f', 'md5', '-']).stdout.trim();
}

export const round = (x, d = 1) => (x == null || Number.isNaN(x) ? null : Math.round(x * 10 ** d) / 10 ** d);
export const median = (arr) => {
  const a = arr.filter((x) => x != null).sort((x, y) => x - y);
  if (!a.length) return null;
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
};
export const fmt = (x) => (x == null ? '—' : x.toFixed(1));
