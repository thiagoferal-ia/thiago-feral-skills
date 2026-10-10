#!/usr/bin/env node
// Measure every track: loudness, true peak, dynamics, spectral balance, embedded metadata.
// Usage: node analyze.mjs <file|folder> [--json out.json]
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, listAudio, probe, loudness, bands, median, fmt } from './lib.mjs';

const args = parseArgs();
const target = args._[0];
if (!target) { console.error('Uso: node analyze.mjs <arquivo|pasta> [--json saida.json]'); process.exit(1); }

const files = listAudio(target);
if (!files.length) { console.error('Nenhum arquivo de áudio encontrado.'); process.exit(1); }

const rows = [];
for (const f of files) {
  const p = probe(f);
  const l = loudness(f);
  const b = bands(f);
  const tagKeys = Object.keys(p.tags).filter((k) => !/^(encoder|major_brand|minor_version|compatible_brands)$/i.test(k));
  const suno = JSON.stringify(p.tags).toLowerCase().includes('suno');
  rows.push({ file: path.basename(f), path: f, ...l, bands: b, format: { codec: p.codec, sampleRate: p.sampleRate, channels: p.channels, bits: p.bits, bitRate: p.bitRate, duration: p.duration }, tags: tagKeys, hasCover: p.hasCover, suno });
  process.stderr.write(`analisado: ${path.basename(f)}\n`);
}

const medAir = median(rows.map((r) => r.bands.tilt.air));
const medI = median(rows.map((r) => r.I));
for (const r of rows) {
  const notes = [];
  if (r.TP != null && r.TP > -1) notes.push('pico acima de -1 dBTP');
  if (r.LRA != null && r.LRA < 4) notes.push('já muito comprimida');
  if (r.LRA != null && r.LRA > 12) notes.push('muito dinâmica');
  if (r.bands.tilt.sub > -15) notes.push('subgrave excessivo');
  if (r.bands.tilt.mud > 4) notes.push('grave-médio embolado');
  if (r.bands.tilt.harsh > 1) notes.push('médio-agudo áspero');
  if (rows.length > 2 && r.bands.tilt.air < medAir - 5) notes.push('bem mais escura que o resto');
  else if (r.bands.tilt.air < -24) notes.push('agudos apagados');
  if (rows.length > 2 && r.I != null && Math.abs(r.I - medI) > 2) notes.push(`loudness ${r.I > medI ? 'acima' : 'abaixo'} do álbum`);
  if (r.suno) notes.push('tags do Suno embutidas');
  r.notes = notes;
}

const fmtFmt = (x) => `${x.codec} ${Math.round(x.sampleRate / 1000)}k${x.bits ? `/${x.bits}b` : ''}${x.bitRate && /mp3|aac|opus|vorbis/.test(x.codec) ? ` ${Math.round(x.bitRate / 1000)}kbps` : ''}`;
console.log('| Faixa | Formato | LUFS | LRA | Pico real | Grave-médio | Médio-agudo | Ar | Observações |');
console.log('|---|---|---|---|---|---|---|---|---|');
for (const r of rows) {
  console.log(`| ${r.file} | ${fmtFmt(r.format)} | ${fmt(r.I)} | ${fmt(r.LRA)} | ${fmt(r.TP)} | ${fmt(r.bands.tilt.mud)} | ${fmt(r.bands.tilt.harsh)} | ${fmt(r.bands.tilt.air)} | ${r.notes.join('; ') || '—'} |`);
}
console.log(`\nMediana do conjunto: ${fmt(medI)} LUFS, ar ${fmt(medAir)} dB. Grave-médio/médio-agudo/ar = energia da banda relativa a 500 Hz–2 kHz (dB).`);
const withTags = rows.filter((r) => r.tags.length || r.hasCover);
if (withTags.length) console.log(`Metadados presentes em ${withTags.length}/${rows.length} arquivo(s)${rows.some((r) => r.hasCover) ? ' (alguns com capa)' : ''}.`);

if (args.json) fs.writeFileSync(args.json === true ? 'analysis.json' : args.json, JSON.stringify(rows, null, 2));
