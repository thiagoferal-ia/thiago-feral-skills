#!/usr/bin/env node
// Quick pass, in place with backup: strip metadata and/or change volume, with a limiter so the boost never clips.
// Usage: node quick.mjs <file|folder> [--gain-pct 25 | --gain-db 2] [--keep-tags] [--ceiling -1] [--backup <folder>]
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, listAudio, probe, loudness, run, tmpDir, cleanup, fmt } from './lib.mjs';

const args = parseArgs();
const input = args._[0];
if (!input) { console.error('Uso: node quick.mjs <arquivo|pasta> [--gain-pct 25 | --gain-db 2] [--keep-tags] [--ceiling -1] [--backup <pasta>]'); process.exit(1); }

const gainDb = args['gain-db'] !== undefined ? Number(args['gain-db'])
  : args['gain-pct'] !== undefined ? 20 * Math.log10(1 + Number(args['gain-pct']) / 100) : 0;
const strip = !args['keep-tags'];
const ceiling = args.ceiling !== undefined ? Number(args.ceiling) : -1.0;
if (!gainDb && !strip) { console.error('Nada a fazer: informe --gain-pct/--gain-db ou não use --keep-tags.'); process.exit(1); }

const files = listAudio(input);
const root = fs.statSync(input).isDirectory() ? input : path.dirname(input);
const backup = args.backup || path.join(root, '_backup-original');
fs.mkdirSync(backup, { recursive: true });

const LOSSY_STEPS = [96, 128, 160, 192, 224, 256, 320];
function codecArgs(p, ext) {
  const kbps = p.bitRate ? Math.round(p.bitRate / 1000) : 320;
  const snap = LOSSY_STEPS.find((s) => s >= kbps - 4) || 320; // never go below the source bitrate
  switch (ext) {
    case '.mp3': return ['-c:a', 'libmp3lame', '-b:a', `${snap}k`];
    case '.m4a': case '.aac': return ['-c:a', 'aac', '-b:a', `${snap}k`];
    case '.ogg': return ['-c:a', 'libvorbis', '-b:a', `${snap}k`];
    case '.opus': return ['-c:a', 'libopus', '-b:a', `${Math.min(snap, 256)}k`];
    case '.flac': return ['-c:a', 'flac'];
    default: return ['-c:a', /s32|s24|24/.test(`${p.bits}`) || p.bits === 24 ? 'pcm_s24le' : 'pcm_s16le'];
  }
}

const tmp = tmpDir();
const rows = [];
try {
  for (const f of files) {
    const ext = path.extname(f).toLowerCase();
    const p = probe(f);
    const before = loudness(f);
    const bk = path.join(backup, path.basename(f));
    if (!fs.existsSync(bk)) fs.copyFileSync(f, bk);

    const sr = p.sampleRate;
    const up = Math.min(sr * 4, 192000);
    const tmpOut = path.join(tmp, `out${ext}`);
    let limitDb = ceiling;
    let after;
    for (let i = 0; i < 3; i++) {
      const af = gainDb
        ? `volume=${gainDb.toFixed(3)}dB,aresample=${up}:resampler=soxr,alimiter=limit=${Math.pow(10, limitDb / 20).toFixed(4)}:attack=5:release=80:level=false,aresample=${sr}:resampler=soxr`
        : 'anull';
      const meta = strip
        ? ['-map', '0:a', '-map_metadata', '-1', '-map_chapters', '-1', '-fflags', '+bitexact', ...(ext === '.mp3' ? ['-id3v2_version', '0', '-write_id3v1', '0'] : [])]
        : ['-map', '0', '-map_metadata', '0', '-c:v', 'copy', ...(ext === '.mp3' ? ['-id3v2_version', '3'] : [])];
      run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', bk, ...meta, '-af', af, ...codecArgs(p, ext), '-ar', String(sr), tmpOut]);
      after = loudness(tmpOut);
      if (!gainDb || after.TP <= ceiling + 0.1) break;
      limitDb -= (after.TP - ceiling) + 0.05;
    }
    fs.copyFileSync(tmpOut, f);
    const left = Object.keys(probe(f).tags).filter((k) => !/^encoder$/i.test(k));
    rows.push({ file: path.basename(f), before, after, tagsLeft: left.length });
    process.stderr.write(`ok: ${path.basename(f)}\n`);
  }
} finally { cleanup(tmp); }

console.log(`Ganho: ${gainDb ? `+${gainDb.toFixed(2)} dB` : 'nenhum'} | Metadados: ${strip ? 'removidos (incluindo capa)' : 'mantidos'} | Teto: ${ceiling} dBTP | Backup: ${backup}\n`);
console.log('| Arquivo | LUFS antes → depois | Pico real antes → depois | Tags restantes |');
console.log('|---|---|---|---|');
for (const r of rows) console.log(`| ${r.file} | ${fmt(r.before.I)} → ${fmt(r.after.I)} | ${fmt(r.before.TP)} → ${fmt(r.after.TP)} | ${r.tagsLeft} |`);
