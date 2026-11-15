#!/usr/bin/env node
// Static server for a built web game, with no dependencies.
// - Serves the build folder at /
// - Serves this skill's helper pages at /__cg/ (stage.html, recorder.js)
// - Accepts POST /__cg/save?name=<file> and writes the body into --out
//
// Usage: node serve.mjs <buildDir> [--port 8787] [--out <dir>] [--isolate]
// Handles Unity/Godot compressed files (.br, .gz) and .wasm/.data/.pck types.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : def;
};
const root = path.resolve(args.find((a, i) => !a.startsWith('--') && !(args[i - 1] || '').startsWith('--')) || '.');
const port = Number(opt('port', 8787));
const out = path.resolve(opt('out', path.join(root, '..', 'raw')));
const isolate = args.includes('--isolate');
const helpers = path.dirname(fileURLToPath(import.meta.url));

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.wasm': 'application/wasm', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav', '.m4a': 'audio/mp4',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
  '.otf': 'font/otf', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml',
  '.data': 'application/octet-stream', '.pck': 'application/octet-stream', '.bin': 'application/octet-stream',
};

function send(res, file) {
  let ext = path.extname(file).toLowerCase();
  const headers = { 'Cache-Control': 'no-store' };
  // Godot 4 builds with threads need cross-origin isolation (SharedArrayBuffer).
  if (isolate) Object.assign(headers, { 'Cross-Origin-Opener-Policy': 'same-origin', 'Cross-Origin-Embedder-Policy': 'credentialless' });
  if (ext === '.br' || ext === '.gz') {
    headers['Content-Encoding'] = ext === '.br' ? 'br' : 'gzip';
    ext = path.extname(file.slice(0, -ext.length)).toLowerCase();
  }
  headers['Content-Type'] = TYPES[ext] || 'application/octet-stream';
  res.writeHead(200, headers);
  fs.createReadStream(file).pipe(res);
}

http.createServer((req, res) => {
  // Prefix instead of base: a path starting with // would otherwise be read as a host.
  const url = new URL('http://localhost' + (req.url.startsWith('/') ? req.url : '/' + req.url));
  if (req.method === 'POST' && url.pathname === '/__cg/save') {
    const name = path.basename(url.searchParams.get('name') || `capture-${Date.now()}.webm`);
    fs.mkdirSync(out, { recursive: true });
    const file = path.join(out, name);
    const stream = fs.createWriteStream(file);
    req.pipe(stream);
    stream.on('finish', () => {
      console.log(`saved ${file} (${fs.statSync(file).size} bytes)`);
      res.end(JSON.stringify({ saved: file }));
    });
    return;
  }
  const base = url.pathname.startsWith('/__cg/') ? helpers : root;
  const rel = decodeURIComponent(url.pathname.startsWith('/__cg/') ? url.pathname.slice(6) : url.pathname);
  let file = path.join(base, rel);
  if (!file.startsWith(base)) { res.writeHead(403); res.end(); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) { res.writeHead(404); res.end('not found'); return; }
  send(res, file);
}).listen(port, () => {
  console.log(`serving ${root}`);
  console.log(`game:  http://localhost:${port}/`);
  console.log(`stage: http://localhost:${port}/__cg/stage.html?w=1920&h=1080`);
  console.log(`captures go to ${out}`);
});
