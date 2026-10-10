#!/usr/bin/env node
// Master one file or a folder with a genre profile, a single limiter and true-peak verification.
// Usage: node master.mjs <file|folder> --out <folder> --preset <name> [--target -10] [--ceiling -1]
//        [--only "text"] [--first] [--suffix " (Remastered)"] [--bits 24|16] [--format wav|flac] [--overwrite]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs, listAudio, probe, loudness, bands, median, run, tmpDir, cleanup, round, fmt } from './lib.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const PRESETS = JSON.parse(fs.readFileSync(path.join(here, 'presets.json'), 'utf8'));
delete PRESETS._doc;

const args = parseArgs();
const input = args._[0];
if (!input || !args.out) {
  console.error(`Uso: node master.mjs <arquivo|pasta> --out <pasta> --preset <${Object.keys(PRESETS).join('|')}> [--target LUFS] [--ceiling dBTP] [--first | --only texto] [--suffix " (Remastered)"] [--bits 24|16] [--format wav|flac] [--overwrite]`);
  process.exit(1);
}
const presetName = args.preset || 'generic';
const preset = PRESETS[presetName];
if (!preset) { console.error(`Preset desconhecido: ${presetName}. Opções: ${Object.keys(PRESETS).join(', ')}`); process.exit(1); }

const target = args.target !== undefined ? Number(args.target) : preset.target;
const ceiling = args.ceiling !== undefined ? Number(args.ceiling) : -1.0;
const suffix = args.suffix === undefined ? ' (Remastered)' : (args.suffix === true ? '' : args.suffix);
const bits = Number(args.bits || 24);
const format = (args.format || 'wav').toLowerCase();
fs.mkdirSync(args.out, { recursive: true });

let files = listAudio(input);
if (args.only) files = files.filter((f) => path.basename(f).toLowerCase().includes(String(args.only).toLowerCase()));
if (!files.length) { console.error('Nenhum arquivo para processar.'); process.exit(1); }

// Spectral analysis of the whole set first: per-track corrections are judged against the album.
process.stderr.write(`Analisando ${files.length} faixa(s)...\n`);
const pre = files.map((f) => ({ f, p: probe(f), l: loudness(f), b: bands(f) }));
const medAir = median(pre.map((x) => x.b.tilt.air));
const work = args.first ? pre.slice(0, 1) : pre;

function buildChain(x) {
  const t = x.b.tilt;
  const notes = [];
  let air = preset.air;
  if ((pre.length > 2 && t.air < medAir - 5) || t.air < -24) { air += 1.5; notes.push('agudos +1,5 dB extra (faixa escura)'); }
  let mud = preset.mud ? { ...preset.mud } : null;
  if (t.mud > 4) { mud = { f: mud ? mud.f : 250, g: (mud ? mud.g : 0) - 0.5 }; notes.push('corte extra no grave-médio'); }
  const harsh = preset.harsh || (t.harsh > 1 ? { f: 3500, g: -1 } : null);
  if (!preset.harsh && harsh) notes.push('suavizado médio-agudo (3,5 kHz)');

  const parts = [];
  let head = `[0:a]aformat=sample_fmts=fltp,highpass=f=${preset.hp}:p=2`;
  let graph;
  if (x.p.channels >= 2 && preset.monoBelow > 0) {
    // Linkwitz-Riley crossover: low band summed to mono, high band optionally widened; sums back flat.
    const hi = preset.width !== 1 ? `extrastereo=m=${preset.width}:c=false` : 'anull';
    graph = `${head},acrossover=split=${preset.monoBelow}[lo][hi];[lo]pan=stereo|c0=0.5*c0+0.5*c1|c1=0.5*c0+0.5*c1[lom];[hi]${hi}[hiw];[lom][hiw]amix=inputs=2:normalize=0`;
  } else graph = head;
  if (mud) parts.push(`equalizer=f=${mud.f}:t=q:w=1:g=${mud.g}`);
  if (harsh) parts.push(`equalizer=f=${harsh.f}:t=q:w=1:g=${harsh.g}`);
  if (air) parts.push(`highshelf=f=12000:g=${air}`);
  if (preset.deess > 0) parts.push(`deesser=i=${preset.deess}:m=0.5:f=0.5`);
  if (preset.comp) parts.push(`acompressor=threshold=${preset.comp.threshold}dB:ratio=${preset.comp.ratio}:attack=30:release=250:makeup=1`);
  graph += (parts.length ? ',' + parts.join(',') : '') + '[out]';
  return { graph, notes };
}

function encodeArgs(sr) {
  if (format === 'flac') return ['-c:a', 'flac', '-sample_fmt', bits === 16 ? 's16' : 's32', '-bits_per_raw_sample', String(bits), '-ar', String(sr)];
  return ['-c:a', bits === 16 ? 'pcm_s16le' : 'pcm_s24le', '-ar', String(sr)];
}

const tmp = tmpDir();
const report = [];
try {
  for (const x of work) {
    const base = path.basename(x.f, path.extname(x.f)).replace(/\s*\((Remastered|Remaster|Master)\)\s*$/i, '');
    const outFile = path.join(args.out, `${base}${suffix}.${format}`);
    if (fs.existsSync(outFile) && !args.overwrite) { report.push({ file: path.basename(outFile), skipped: true }); continue; }

    const sr = x.p.sampleRate;
    const { graph, notes } = buildChain(x);
    const stage1 = path.join(tmp, 'stage1.wav');
    run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', x.f, '-filter_complex', graph, '-map', '[out]', '-map_metadata', '-1', '-c:a', 'pcm_f32le', stage1]);
    const I1 = loudness(stage1).I;

    // Single limiter, oversampled for true-peak control; iterate until loudness and ceiling both land.
    const up = Math.min(sr * 4, 192000);
    let gain = target - I1;
    let limitDb = ceiling;
    let final;
    const tmpOut = path.join(tmp, `out.${format}`);
    for (let i = 0; i < 4; i++) {
      const af = `volume=${gain.toFixed(2)}dB,aresample=${up}:resampler=soxr,alimiter=limit=${Math.pow(10, limitDb / 20).toFixed(4)}:attack=5:release=80:level=false,aresample=${sr}:resampler=soxr${bits === 16 ? ':osf=s16:dither_method=triangular' : ''}`;
      run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', stage1, '-af', af, '-map_metadata', '-1', '-fflags', '+bitexact', ...encodeArgs(sr), tmpOut]);
      final = loudness(tmpOut);
      const okI = Math.abs(final.I - target) <= 0.3;
      const okTP = final.TP <= ceiling + 0.1;
      if (okI && okTP) break;
      if (!okTP) limitDb -= (final.TP - ceiling) + 0.05;
      if (!okI) gain += target - final.I;
    }
    fs.renameSync(tmpOut, outFile);

    const warn = [];
    if (gain > 8) warn.push(`ganho alto (+${gain.toFixed(1)} dB)`);
    if (x.l.LRA != null && final.LRA != null && x.l.LRA - final.LRA > 2) warn.push('limitador apertando a dinâmica: considere um alvo mais baixo');
    if (final.TP > ceiling + 0.1) warn.push('pico real acima do teto');
    report.push({ file: path.basename(outFile), gain: round(gain), before: x.l, after: final, notes, warn });
    process.stderr.write(`ok: ${path.basename(outFile)}\n`);
  }
} finally { cleanup(tmp); }

console.log(`Perfil: ${presetName} (${preset.label}) | alvo ${target} LUFS | teto ${ceiling} dBTP | ${format.toUpperCase()} ${bits}-bit\n`);
console.log('| Arquivo | LUFS antes → depois | Pico real depois | LRA antes → depois | Ganho | Ajustes da faixa | Avisos |');
console.log('|---|---|---|---|---|---|---|');
for (const r of report) {
  if (r.skipped) { console.log(`| ${r.file} | já existe (use --overwrite) | | | | | |`); continue; }
  console.log(`| ${r.file} | ${fmt(r.before.I)} → ${fmt(r.after.I)} | ${fmt(r.after.TP)} | ${fmt(r.before.LRA)} → ${fmt(r.after.LRA)} | ${r.gain >= 0 ? '+' : ''}${fmt(r.gain)} dB | ${r.notes.join('; ') || '—'} | ${r.warn.join('; ') || '—'} |`);
}
