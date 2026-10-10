#!/usr/bin/env node
// Apply an album manifest: renumber files, write tags (+ cover) to WAV/FLAC/MP3, optionally export MP3s.
// Usage: node album.mjs --manifest album.json --dir <masters folder> [--also-rename "<f1>;<f2>"] [--mp3] [--mp3-bitrate 320] [--dry-run]
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, listAudio, run, probe, audioMd5, safeName, matchKey, tmpDir, cleanup } from './lib.mjs';

const args = parseArgs();
if (!args.manifest || !args.dir) {
  console.error('Uso: node album.mjs --manifest album.json --dir <pasta> [--also-rename "<pasta1>;<pasta2>"] [--mp3] [--mp3-bitrate 320] [--dry-run]');
  process.exit(1);
}
const manifestPath = path.resolve(args.manifest);
const M = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const tracks = M.tracks || [];
if (!tracks.length) throw new Error('Manifesto sem faixas.');
const nums = tracks.map((t) => t.n);
if (new Set(nums).size !== nums.length) throw new Error('Números de faixa repetidos no manifesto.');
const total = M.totalTracks || Math.max(...nums);
const pad = Math.max(2, String(total).length);
const albumArtist = M.albumArtist || M.artist;
const cover = M.cover ? path.resolve(path.dirname(manifestPath), M.cover) : null;
if (cover && !fs.existsSync(cover)) throw new Error(`Capa não encontrada: ${cover}`);
const coverMime = cover ? (/\.png$/i.test(cover) ? 'image/png' : 'image/jpeg') : null;

const byKey = new Map();
for (const t of tracks) {
  const k = matchKey(t.file || safeName(t.title));
  if (byKey.has(k)) throw new Error(`Duas faixas do manifesto geram a mesma chave: "${t.title}"`);
  byKey.set(k, t);
}

// ---------- 1) Renumber (two-phase so names never collide) ----------
function planRename(dir) {
  const plan = []; const unmatched = []; const seen = new Set();
  for (const f of listAudio(dir)) {
    const base = path.basename(f, path.extname(f));
    const t = byKey.get(matchKey(base));
    if (!t) { unmatched.push(path.basename(f)); continue; }
    const remastered = /\((Remastered|Remaster|Master)\)\s*$/i.exec(base);
    const name = `${String(t.n).padStart(pad, '0')} - ${safeName(t.title)}${remastered ? ` ${remastered[0].trim()}` : ''}${path.extname(f).toLowerCase()}`;
    if (seen.has(name)) throw new Error(`Dois arquivos em ${dir} viram "${name}".`);
    seen.add(name);
    plan.push({ from: f, to: path.join(dir, name) });
  }
  return { plan, unmatched };
}

const dirs = [args.dir, ...(args['also-rename'] ? String(args['also-rename']).split(';').map((s) => s.trim()).filter(Boolean) : [])];
const plans = dirs.map((d) => ({ dir: d, ...planRename(d) }));
for (const p of plans) {
  const changes = p.plan.filter((x) => x.from !== x.to);
  console.log(`\n## ${p.dir}\n${changes.length ? changes.map((x) => `- ${path.basename(x.from)} → ${path.basename(x.to)}`).join('\n') : '- nenhuma renomeação necessária'}`);
  if (p.unmatched.length) console.log(`- sem correspondência no manifesto (não mexi): ${p.unmatched.join(', ')}`);
  const missing = tracks.filter((t) => !p.plan.some((x) => byKey.get(matchKey(path.basename(x.from, path.extname(x.from)))) === t));
  if (missing.length) console.log(`- faixas do manifesto ausentes nesta pasta: ${missing.map((t) => `${t.n} ${t.title}`).join(', ')}`);
}
if (args['dry-run']) { console.log('\n(simulação: nada foi alterado)'); process.exit(0); }

for (const p of plans) {
  const staged = p.plan.filter((x) => x.from !== x.to).map((x) => {
    const tmpName = path.join(p.dir, `__mm_tmp_${Math.random().toString(36).slice(2)}${path.extname(x.from)}`);
    fs.renameSync(x.from, tmpName);
    return { ...x, tmpName };
  });
  for (const s of staged) fs.renameSync(s.tmpName, s.to);
}

// ---------- 2) Tags ----------
function tagsFor(t) {
  const m = {
    title: t.title, artist: t.artist || M.artist, album_artist: albumArtist, album: M.album,
    date: String(M.year || ''), genre: t.genre || M.genre, track: `${t.n}/${total}`,
    composer: t.composer || M.composer, copyright: t.copyright || M.copyright, grouping: M.grouping,
    comment: t.comment || M.comment,
  };
  if (M.disc) m.disc = String(M.disc);
  for (const k of Object.keys(m)) if (!m[k]) delete m[k];
  return m;
}
const metaArgs = (m) => Object.entries(m).flatMap(([k, v]) => ['-metadata', `${k}=${v}`]);

// ID3v2.3 frames for the WAV 'id3 ' chunk (what most players and Explorer-like tools read in WAV).
function textFrame(id, text) {
  const data = Buffer.concat([Buffer.from([1, 0xff, 0xfe]), Buffer.from(text, 'utf16le'), Buffer.from([0, 0])]);
  const h = Buffer.alloc(10); h.write(id, 0, 'ascii'); h.writeUInt32BE(data.length, 4);
  return Buffer.concat([h, data]);
}
function apicFrame(file, mime) {
  const img = fs.readFileSync(file);
  const data = Buffer.concat([Buffer.from([0]), Buffer.from(`${mime}\0`, 'latin1'), Buffer.from([3, 0]), img]);
  const h = Buffer.alloc(10); h.write('APIC', 0, 'ascii'); h.writeUInt32BE(data.length, 4);
  return Buffer.concat([h, data]);
}
function id3Chunk(m, t) {
  const map = { title: 'TIT2', artist: 'TPE1', album_artist: 'TPE2', album: 'TALB', grouping: 'TIT1', date: 'TYER', track: 'TRCK', genre: 'TCON', composer: 'TCOM', copyright: 'TCOP', disc: 'TPOS' };
  const frames = Object.entries(map).filter(([k]) => m[k]).map(([k, id]) => textFrame(id, m[k]));
  if (t.isrc) frames.push(textFrame('TSRC', t.isrc));
  if (cover) frames.push(apicFrame(cover, coverMime));
  const body = Buffer.concat(frames);
  const n = body.length;
  const hdr = Buffer.from([0x49, 0x44, 0x33, 3, 0, 0, (n >> 21) & 0x7f, (n >> 14) & 0x7f, (n >> 7) & 0x7f, n & 0x7f]);
  const tag = Buffer.concat([hdr, body]);
  const ch = Buffer.alloc(8); ch.write('id3 ', 0, 'ascii'); ch.writeUInt32LE(tag.length, 4);
  return Buffer.concat([ch, tag, tag.length % 2 ? Buffer.from([0]) : Buffer.alloc(0)]);
}
const coverArgs = (inputIndex) => cover
  ? ['-map', `${inputIndex}:v`, '-c:v', 'copy', '-disposition:v:0', 'attached_pic', '-metadata:s:v', 'title=Album cover', '-metadata:s:v', 'comment=Cover (front)']
  : [];

const tmp = tmpDir();
const results = [];
try {
  for (const f of listAudio(args.dir)) {
    const t = byKey.get(matchKey(path.basename(f, path.extname(f))));
    if (!t) continue;
    const ext = path.extname(f).toLowerCase();
    const m = tagsFor(t);
    const before = audioMd5(f);
    const out = path.join(tmp, `tag${ext}`);

    if (ext === '.wav') {
      run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', f, '-map', '0:a', '-c', 'copy', '-map_metadata', '-1', '-fflags', '+bitexact', ...metaArgs(m), out]);
      const fd = fs.openSync(out, 'r+');
      try {
        const size = fs.fstatSync(fd).size;
        const chunk = id3Chunk(m, t);
        fs.writeSync(fd, chunk, 0, chunk.length, size);
        const riff = Buffer.alloc(4); riff.writeUInt32LE(size + chunk.length - 8);
        fs.writeSync(fd, riff, 0, 4, 4);
      } finally { fs.closeSync(fd); }
    } else {
      const extra = ext === '.mp3' ? ['-id3v2_version', '3', '-write_id3v1', '1', ...(t.isrc ? ['-metadata', `TSRC=${t.isrc}`] : [])] : (t.isrc ? ['-metadata', `ISRC=${t.isrc}`] : []);
      const inputs = cover && ['.mp3', '.flac', '.m4a'].includes(ext) ? ['-i', f, '-i', cover] : ['-i', f];
      // No new cover in the manifest → keep whatever cover the file already has.
      const pic = inputs.length > 2 ? coverArgs(1) : ['-map', '0:v?', '-c:v', 'copy'];
      run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...inputs, '-map', '0:a', '-c:a', 'copy', ...pic, '-map_metadata', '-1', ...metaArgs(m), ...extra, out]);
    }
    if (audioMd5(out) !== before) throw new Error(`Áudio mudaria ao gravar tags em ${path.basename(f)}; arquivo original preservado.`);
    fs.copyFileSync(out, f);
    results.push({ file: path.basename(f), t, m, audio: 'idêntico' });

    if (args.mp3 && ext === '.wav') {
      const mp3 = f.replace(/\.wav$/i, '.mp3');
      const tmpMp3 = path.join(tmp, 'out.mp3');
      const inputs = cover ? ['-i', f, '-i', cover] : ['-i', f];
      run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...inputs, '-map', '0:a', '-map_metadata', '-1', '-c:a', 'libmp3lame', '-b:a', `${args['mp3-bitrate'] || 320}k`,
        ...(cover ? coverArgs(1) : []), '-id3v2_version', '3', '-write_id3v1', '1', ...metaArgs(m), ...(t.isrc ? ['-metadata', `TSRC=${t.isrc}`] : []), tmpMp3]);
      fs.copyFileSync(tmpMp3, mp3);
      results.push({ file: path.basename(mp3), t, m, audio: 'gerado' });
    }
  }
} finally { cleanup(tmp); }

// ---------- 3) Verify by reading back ----------
console.log('\n| Arquivo | Nº | Título | Gênero | Capa | Áudio |');
console.log('|---|---|---|---|---|---|');
for (const r of results.sort((a, b) => a.t.n - b.t.n || a.file.localeCompare(b.file))) {
  const p = probe(path.join(args.dir, r.file));
  const tg = Object.fromEntries(Object.entries(p.tags).map(([k, v]) => [k.toLowerCase(), v]));
  const ok = tg.title === r.m.title && (tg.genre || '') === (r.m.genre || '');
  console.log(`| ${r.file} | ${tg.track || '—'} | ${tg.title || '—'}${ok ? '' : ' ⚠ difere do manifesto'} | ${tg.genre || '—'} | ${p.hasCover ? 'sim' : 'não'} | ${r.audio} |`);
}
