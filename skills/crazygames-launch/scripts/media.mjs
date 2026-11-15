#!/usr/bin/env node
// Store media for CrazyGames, built with ffmpeg (no other dependencies).
//
//   node media.mjs probe  <file>
//   node media.mjs video  <clip> --orientation landscape|portrait --out <file.mp4> [--start 0] [--end <s>] [--max 19.5] [--fit crop|pad] [--first-frame <cover.jpg>] [--hold 0.8]
//   node media.mjs cover  <image> --kind landscape|portrait|square --out <file.jpg> [--fit crop|pad] [--logo <png>] [--logo-pos auto|center|left|right|top|bottom]
//   node media.mjs zones  <image|video> --kind landscape|portrait|square --out <preview.png> [--at <s>]
//   node media.mjs sheet  <video> --out <sheet.jpg> [--every 1.5] [--cols 4]
//
// Sizes: landscape video 1920x1080, portrait video 1080x1620 (2:3 — the portal rejects 9:16),
// covers 1920x1080 / 800x1200 / 800x800. Videos come out as H.264 MP4, silent, 30 fps, <= 20 s.

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const [cmd, input, ...rest] = process.argv.slice(2);
const opt = (name, def) => { const i = rest.indexOf(`--${name}`); return i >= 0 ? rest[i + 1] : def; };

const SIZES = {
  video: { landscape: [1920, 1080], portrait: [1080, 1620] },
  cover: { landscape: [1920, 1080], portrait: [800, 1200], square: [800, 800] },
};
// Top-left area the portal covers with its badges ("Show label zone" in the Details step).
// Measured from the portal preview; keep titles and key art out of it, and confirm with the toggle.
const LABEL = {
  'cover-landscape': [0.40, 0.19], 'cover-portrait': [0.39, 0.10], 'cover-square': [0.34, 0.29],
  'video-landscape': [0.40, 0.20], 'video-portrait': [0.40, 0.10],
};

function ff(bin, argv, { quiet = true } = {}) {
  const r = spawnSync(bin, argv, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.error && r.error.code === 'ENOENT') {
    console.error(`${bin} not found. Install FFmpeg (winget install Gyan.FFmpeg · brew install ffmpeg · apt install ffmpeg) and retry.`);
    process.exit(3);
  }
  if (r.status !== 0) { console.error(r.stderr || r.stdout); process.exit(r.status || 1); }
  if (!quiet) process.stdout.write(r.stdout);
  return r.stdout;
}

function probe(file) {
  const j = JSON.parse(ff('ffprobe', ['-v', 'error', '-show_entries', 'format=duration:stream=codec_type,codec_name,width,height,r_frame_rate', '-of', 'json', file]));
  const v = (j.streams || []).find((s) => s.codec_type === 'video') || {};
  const a = (j.streams || []).some((s) => s.codec_type === 'audio');
  let duration = Number(j.format?.duration);
  if (!Number.isFinite(duration)) {
    // MediaRecorder WebM files often carry no duration: count it by decoding.
    const out = spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-f', 'null', '-', '-stats'], { encoding: 'utf8' }).stderr || '';
    const m = [...out.matchAll(/time=(\d+):(\d+):([\d.]+)/g)].pop();
    duration = m ? +m[1] * 3600 + +m[2] * 60 + +m[3] : NaN;
  }
  return { file, width: v.width, height: v.height, codec: v.codec_name, fps: v.r_frame_rate, duration: Math.round(duration * 100) / 100, audio: a };
}

const need = (v, msg) => { if (!v) { console.error(msg); process.exit(2); } return v; };

if (cmd === 'probe') {
  console.log(JSON.stringify(probe(need(input, 'probe <file>')), null, 2));
} else if (cmd === 'video') {
  const o = need(opt('orientation'), '--orientation landscape|portrait');
  const [W, H] = need(SIZES.video[o], 'orientation must be landscape or portrait');
  const out = need(opt('out'), '--out <file.mp4>');
  const info = probe(input);
  const max = Math.min(Number(opt('max', 19.5)), 19.9);
  const start = Number(opt('start', 0));
  const end = opt('end') ? Number(opt('end')) : info.duration;
  const length = Math.min(max, (Number.isFinite(end) ? end : max + start) - start);
  const fit = opt('fit', 'crop');
  // crop: fill the frame and cut the edges. pad: keep the whole picture over a blurred copy of itself.
  const vf = fit === 'pad'
    ? `split[a][b];[a]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},boxblur=30:3,eq=brightness=-0.08[bg];[b]scale=${W}:${H}:force_original_aspect_ratio=decrease[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2,setsar=1,fps=30`
    : `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setsar=1,fps=30`;
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  const cover = opt('first-frame');
  const enc = ['-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out];
  if (cover) {
    // CrazyGames asks for the static cover as the first frame, so the thumbnail turns into the video
    // without a jump: hold the cover, then cross-fade into gameplay. Total length stays within --max.
    const hold = Number(opt('hold', 0.8));
    const fade = 0.4;
    const play = Math.min(length, max - hold);
    ff('ffmpeg', ['-y', '-v', 'error', '-loop', '1', '-t', String(hold + fade), '-i', cover,
      '-ss', String(start), '-t', String(play), '-i', input,
      '-filter_complex',
      `[0:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setsar=1,fps=30,format=yuv420p[c];` +
      `[1:v]${vf},format=yuv420p[g];[c][g]xfade=transition=fade:duration=${fade}:offset=${hold}`,
      ...enc]);
  } else {
    ff('ffmpeg', ['-y', '-v', 'error', '-ss', String(start), '-i', input, '-t', String(length), '-filter_complex', vf, ...enc]);
  }
  const r = probe(out);
  const ok = r.width === W && r.height === H && r.duration <= 20 && !r.audio;
  console.log(JSON.stringify({ ...r, sizeMB: Math.round(fs.statSync(out).size / 1048576 * 10) / 10, sourceAspect: `${info.width}x${info.height}`, fit, ok }, null, 2));
  if (info.width && Math.abs(info.width / info.height - W / H) > 0.2 && fit === 'crop') {
    console.error(`note: source is ${info.width}x${info.height}; crop cut a lot of it. Record at ${W}x${H} (stage.html?w=${W}&h=${H}) or use --fit pad.`);
  }
} else if (cmd === 'cover') {
  const kind = need(opt('kind'), '--kind landscape|portrait|square');
  const [W, H] = need(SIZES.cover[kind], 'kind must be landscape, portrait or square');
  const out = need(opt('out'), '--out <file.jpg>');
  const fit = opt('fit', 'crop');
  const logo = opt('logo');
  let filter = fit === 'pad'
    ? `[0:v]split[a][b];[a]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},boxblur=30:3[bg];[b]scale=${W}:${H}:force_original_aspect_ratio=decrease[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2[base]`
    : `[0:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H}[base]`;
  const argv = ['-y', '-v', 'error', '-i', input];
  if (logo) {
    argv.push('-i', logo);
    // Default spot keeps the logo out of the top-left label zone.
    const pos = opt('logo-pos', 'auto');
    const lw = Math.round(kind === 'landscape' ? W * 0.42 : W * 0.72);
    const spots = {
      center: '(W-w)/2:(H-h)/2', left: `W*0.05:(H-h)/2`, right: `W-w-W*0.05:(H-h)/2`,
      top: `(W-w)/2:H*${LABEL[`cover-${kind}`][1] + 0.03}`, bottom: '(W-w)/2:H-h-H*0.06',
    };
    const auto = kind === 'landscape' ? spots.right : kind === 'portrait' ? spots.top : spots.bottom;
    filter += `;[1:v]scale=${lw}:-1[logo];[base][logo]overlay=${spots[pos] || auto}[out]`;
  } else {
    filter += ';[base]null[out]';
  }
  argv.push('-filter_complex', filter, '-map', '[out]', '-frames:v', '1', '-q:v', '2', out);
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  ff('ffmpeg', argv);
  console.log(JSON.stringify({ out, width: W, height: H, kind, fit, logo: !!logo }));
} else if (cmd === 'zones') {
  const kind = need(opt('kind'), '--kind landscape|portrait|square');
  const out = need(opt('out'), '--out <preview.png>');
  const info = probe(input);
  const isVideo = Number.isFinite(info.duration) && info.duration > 0.5;
  const [fw, fh] = LABEL[`${isVideo ? 'video' : 'cover'}-${kind}`] || LABEL[`cover-${kind}`];
  const argv = ['-y', '-v', 'error'];
  if (isVideo) argv.push('-ss', String(opt('at', Math.min(3, info.duration / 2))));
  argv.push('-i', input, '-vf', `drawbox=x=0:y=0:w=iw*${fw}:h=ih*${fh}:color=0x8a5cf6@0.55:t=fill,drawbox=x=0:y=0:w=iw*${fw}:h=ih*${fh}:color=0xffffff@0.9:t=3`, '-frames:v', '1', out);
  ff('ffmpeg', argv);
  console.log(JSON.stringify({ out, labelZone: { widthFraction: fw, heightFraction: fh, corner: 'top-left' } }));
} else if (cmd === 'sheet') {
  const out = need(opt('out'), '--out <sheet.jpg>');
  const every = Number(opt('every', 1.5));
  const cols = Number(opt('cols', 4));
  const info = probe(input);
  const n = Math.max(1, Math.ceil(info.duration / every));
  const rows = Math.ceil(n / cols);
  const w = info.width >= info.height ? 480 : 270;
  ff('ffmpeg', ['-y', '-v', 'error', '-i', input, '-vf', `fps=1/${every},scale=${w}:-2,tile=${cols}x${rows}`, '-frames:v', '1', out]);
  console.log(JSON.stringify({ out, frames: n, every }));
} else {
  console.log(fs.readFileSync(new URL(import.meta.url), 'utf8').split('\n').slice(1, 12).join('\n'));
  process.exit(cmd ? 2 : 0);
}
