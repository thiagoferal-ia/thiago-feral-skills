#!/usr/bin/env node
// Loudness-matched A/B excerpts, so the louder version can't win just by being louder.
// Pairs files by track name (ignores numbering and "(Remastered)").
// Usage: node compare.mjs <originals folder|file> <masters folder|file> --out <folder> [--seconds 30] [--level -16]
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, listAudio, probe, loudness, run, matchKey, fmt } from './lib.mjs';

const args = parseArgs();
const [a, b] = args._;
if (!a || !b || !args.out) { console.error('Uso: node compare.mjs <originais> <masters> --out <pasta> [--seconds 30] [--level -16]'); process.exit(1); }
const secs = Number(args.seconds || 30);
const level = Number(args.level || -16);
fs.mkdirSync(args.out, { recursive: true });

const A = listAudio(a);
// When a master exists as WAV and MP3, compare the lossless one.
const B = new Map();
for (const f of listAudio(b)) {
  const k = matchKey(path.basename(f));
  if (!B.has(k) || path.extname(B.get(k)).toLowerCase() === '.mp3') B.set(k, f);
}
const rows = [];
for (const fa of A) {
  const fb = B.get(matchKey(path.basename(fa)));
  if (!fb) continue;
  const dur = probe(fa).duration;
  const start = Math.max(0, Math.min(dur * 0.45, dur - secs)); // around the middle: usually a chorus or full section
  const name = path.basename(fa, path.extname(fa)).replace(/\s*\(Remastered\)$/i, '');
  for (const [tag, src] of [['A original', fa], ['B master', fb]]) {
    const out = path.join(args.out, `${name} - ${tag}.wav`);
    const g = level - loudness(src).I; // static gain only: no processing that would change the sound
    run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-ss', start.toFixed(2), '-t', String(secs), '-i', src,
      '-af', `volume=${g.toFixed(2)}dB,afade=t=in:d=0.3,afade=t=out:st=${secs - 0.5}:d=0.5`, '-map_metadata', '-1', '-c:a', 'pcm_s24le', out]);
  }
  rows.push({ name, start });
}
console.log(`${rows.length} par(es) gerado(s) em ${args.out}, trechos de ${secs}s ajustados para o mesmo volume (${level} LUFS da faixa inteira).`);
for (const r of rows) console.log(`- ${r.name} (a partir de ${fmt(r.start)}s)`);
