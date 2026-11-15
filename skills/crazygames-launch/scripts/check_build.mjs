#!/usr/bin/env node
// Static pre-flight check of a web game build against CrazyGames requirements.
// No dependencies. Reads every text file of the build and reports problems that the
// portal's QA tool or the review team would catch, plus which SDK calls were found.
//
// Usage: node check_build.mjs <buildDir|build.zip> [--json] [--launch basic|full]
//
// It is a heuristic: minified or engine-packed code can hide calls, so "not found"
// means "look for it", not "proven missing". The portal QA tool has the final word.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import os from 'node:os';

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const launch = (args[args.indexOf('--launch') + 1] || 'basic').toLowerCase() === 'full' ? 'full' : 'basic';
let input = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--launch');
if (!input) { console.error('Usage: node check_build.mjs <buildDir|build.zip> [--json] [--launch basic|full]'); process.exit(2); }
input = path.resolve(input);

const findings = []; // { level: 'error'|'warn'|'info'|'ok', id, text, files? }
const add = (level, id, text, files) => findings.push({ level, id, text, ...(files?.length ? { files: files.slice(0, 8) } : {}) });

// ---------- locate the build ----------
let root = input;
if (fs.statSync(input).isFile() && input.toLowerCase().endsWith('.zip')) {
  // The portal does not accept archives: extract next to the zip so the folder can be uploaded.
  root = input.slice(0, -4);
  if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true });
    try {
      if (process.platform === 'win32') {
        execFileSync('powershell', ['-NoProfile', '-Command', `Expand-Archive -LiteralPath '${input}' -DestinationPath '${root}'`]);
      } else {
        execFileSync('unzip', ['-q', input, '-d', root]);
      }
    } catch (e) { console.error('Could not extract the zip: ' + e.message); process.exit(2); }
  }
  add('warn', 'zip', `The portal rejects .zip uploads ("Archive files are not supported"). Extracted to ${root} — upload that folder's contents with "Select folder" or drag the files.`);
}

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
  const p = path.join(dir, d.name);
  return d.isDirectory() ? walk(p) : [p];
});
let files = walk(root);
if (!fs.existsSync(path.join(root, 'index.html'))) {
  const nested = files.filter((f) => path.basename(f).toLowerCase() === 'index.html').sort((a, b) => a.length - b.length)[0];
  if (nested) {
    add('error', 'index-root', `index.html is not at the top of the upload. Upload the folder ${path.relative(root, path.dirname(nested)) || '.'} instead, so index.html sits at the root.`);
    root = path.dirname(nested);
    files = walk(root);
  } else {
    add('error', 'index-root', 'No index.html found. CrazyGames needs an index.html at the root of the upload.');
  }
}

const rel = (f) => path.relative(root, f).split(path.sep).join('/');
const size = (f) => fs.statSync(f).size;
const MB = (b) => Math.round((b / 1048576) * 100) / 100;
const total = files.reduce((s, f) => s + size(f), 0);

// ---------- size ----------
const biggest = [...files].sort((a, b) => size(b) - size(a)).slice(0, 5).map((f) => `${rel(f)} (${MB(size(f))} MB)`);
const indexPath = path.join(root, 'index.html');
const html = fs.existsSync(indexPath) ? fs.readFileSync(indexPath, 'utf8') : '';
// Files the page loads directly (scripts, styles, preloads). Engines load more later; the QA tool measures the real number.
const direct = new Set(['index.html']);
for (const m of html.matchAll(/(?:src|href)\s*=\s*["']([^"'#?]+)["']/gi)) {
  const p = m[1];
  if (/^(https?:)?\/\//i.test(p) || p.startsWith('data:')) continue;
  const f = path.join(root, p.replace(/^\.?\//, ''));
  if (fs.existsSync(f) && fs.statSync(f).isFile()) direct.add(rel(f));
}
const directBytes = [...direct].reduce((s, r) => s + size(path.join(root, r)), 0);
const engine = detectEngine();
const loadsAllUpfront = ['unity', 'godot', 'gamemaker', 'defold'].includes(engine);
const initialEstimate = loadsAllUpfront ? total : directBytes;
// Limits from docs.crazygames.com/requirements/technical (checked 2026-11): initial <= 50 MB
// (<= 20 MB to appear on the mobile homepage), total <= 250 MB, <= 1500 files. With the SDK the
// initial download is what loads before the first gameplayStart; without the SDK the TOTAL counts.
const sizeLimitNote = `Initial download estimate ${MB(initialEstimate)} MB (${loadsAllUpfront ? 'engine loads its data up front' : 'files index.html loads directly; assets loaded before the first gameplayStart also count'}). Limits: initial <= 50 MB, <= 20 MB to be shown on the mobile homepage, total <= 250 MB.`;
add(initialEstimate / 1048576 > 50 ? 'error' : initialEstimate / 1048576 > 20 ? 'warn' : 'ok', 'size', `Total ${MB(total)} MB in ${files.length} files. ${sizeLimitNote}`);
if (total / 1048576 > 250) add('error', 'total-size', `Total ${MB(total)} MB is over the 250 MB limit.`);
if (files.length > 1500) add('error', 'file-count', `${files.length} files: the limit is 1500. Pack assets into atlases or archives the engine loads.`);
const maps = files.filter((f) => f.endsWith('.map'));
if (maps.length) add('warn', 'sourcemaps', `${maps.length} source map file(s) in the build (${MB(maps.reduce((s, f) => s + size(f), 0))} MB). Remove them: they add size and expose source.`, maps.map(rel));
const odd = files.filter((f) => /[\s#%?]|[^\x20-\x7e]/.test(rel(f)));
if (odd.length) add('warn', 'filenames', 'File names with spaces, #, %, ? or non-ASCII characters can break on the CDN. Rename them.', odd.map(rel));
const junk = files.filter((f) => /(^|\/)(\.DS_Store|Thumbs\.db|desktop\.ini|\.git\/)/i.test(rel(f)) || /\.(psd|blend|aseprite|fla|zip|rar|7z)$/i.test(f));
if (junk.length) add('warn', 'junk', 'Files that do not belong in a web build (OS junk, source art, archives). Remove them.', junk.map(rel));

// ---------- read all text ----------
const TEXT = /\.(html?|js|mjs|cjs|css|json|txt|xml|svg)$/i;
const texts = files.filter((f) => TEXT.test(f) && size(f) < 60 * 1048576).map((f) => ({ f: rel(f), s: fs.readFileSync(f, 'utf8') }));
const grep = (re) => texts.filter((t) => re.test(t.s)).map((t) => t.f);

function detectEngine() {
  const names = files.map((f) => rel(f).toLowerCase());
  const has = (re) => names.some((n) => re.test(n));
  const indexHtml = fs.existsSync(path.join(root, 'index.html')) ? fs.readFileSync(path.join(root, 'index.html'), 'utf8') : '';
  if (has(/\.(loader|framework)\.js(\.br|\.gz|\.unityweb)?$/) || has(/\.wasm(\.br|\.gz|\.unityweb)$/) || /UnityLoader|createUnityInstance/.test(indexHtml)) return 'unity';
  if (has(/\.pck$/) || /Godot|engine\.startGame/.test(indexHtml)) return 'godot';
  if (has(/c3runtime\.js$/) || has(/c2runtime\.js$/)) return 'construct';
  if (has(/(^|\/)html5game\//) || /GameMaker|gml_/.test(indexHtml)) return 'gamemaker';
  if (has(/dmloader\.js$/) || has(/\.arcd$/)) return 'defold';
  if (has(/cocos2d-js|cc\.js$/) || /cocos/i.test(indexHtml)) return 'cocos';
  return 'html5';
}
const all = (re) => texts.some((t) => re.test(t.s));
const phaser = all(/Phaser\.(Game|AUTO)|phaser@|Phaser v\d/);
const pixi = all(/PIXI\.Application|pixi\.js/i);
const three = all(/THREE\.WebGLRenderer|three\.module/);
const playcanvas = all(/playcanvas/i);
const engineName = engine !== 'html5' ? engine : phaser ? 'phaser' : pixi ? 'pixi' : three ? 'three.js' : playcanvas ? 'playcanvas' : 'html5';
add('info', 'engine', `Engine looks like: ${engineName}. In the form pick it if listed, otherwise HTML5.`);

// ---------- SDK ----------
const sdkV3 = grep(/sdk\.crazygames\.com\/crazygames-sdk-v3\.js|CrazyGames\.SDK/);
const sdkV2 = grep(/crazygames-sdk-v[12]\.js|CrazySDK\.getInstance|CrazyGames\.CrazySDK/);
const unityPlugin = grep(/CrazySDK|crazygames/i).filter((f) => /framework|\.jslib|loader/i.test(f));
const sdkFound = sdkV3.length || sdkV2.length || unityPlugin.length;
if (sdkV2.length && !sdkV3.length) add('error', 'sdk-version', 'An old CrazyGames SDK (v1/v2) is referenced. Move to SDK v3.', sdkV2);
if (!sdkFound && total / 1048576 > 50) add('error', 'nosdk-size', `Without the SDK the whole build counts as the initial download: ${MB(total)} MB is over 50 MB. Add the SDK (gameplayStart marks where loading ends) or shrink the build.`);
if (!sdkFound) add(launch === 'full' ? 'error' : 'warn', 'sdk-missing', 'CrazyGames SDK v3 not found. Add <script src="https://sdk.crazygames.com/crazygames-sdk-v3.js"></script> (or the engine plugin) and call await window.CrazyGames.SDK.init() before using it.');
else add('ok', 'sdk', `CrazyGames SDK reference found in: ${[...new Set([...sdkV3, ...sdkV2, ...unityPlugin])].slice(0, 4).join(', ')}`);

const calls = [
  // [id, label, regex, needed in basic, needed in full]
  ['init', 'SDK.init()', /SDK\.init\(|\.init\(\)\s*[;,)]|CrazySDK\.Init/, true, true],
  ['loadingStart', 'game.loadingStart()', /loadingStart/, true, true],
  ['loadingStop', 'game.loadingStop()', /loadingStop/, true, true],
  ['gameplayStart', 'game.gameplayStart()', /gameplayStart|GameplayStart/, true, true],
  ['gameplayStop', 'game.gameplayStop()', /gameplayStop|GameplayStop/, true, true],
  ['happytime', 'game.happytime()', /happytime|HappyTime/i, false, false],
  ['mute', 'settings muteAudio / addSettingsChangeListener', /muteAudio|addSettingsChangeListener|SettingsChange/, false, false],
  ['dataSet', 'data.setItem()', /\.data\.setItem|data\.setItem|DataModule|CrazyGames\.SDK\.data/, false, false],
  ['dataGet', 'data.getItem()', /\.data\.getItem|data\.getItem/, false, false],
  ['midgame', "ad.requestAd('midgame')", /["'`]midgame["'`]|MidgameAd|RequestAd\(\s*CrazyAdType\.Midgame/, false, true],
  ['rewarded', "ad.requestAd('rewarded')", /["'`]rewarded["'`]|RewardedAd|CrazyAdType\.Rewarded/, false, false],
  ['adblock', 'ad.hasAdblock()', /hasAdblock|HasAdblock/, false, false],
  ['banner', 'banner.requestBanner / requestResponsiveBanner', /requestBanner|requestResponsiveBanner|RequestBanner/, false, false],
  ['user', 'user module (getUser / auth)', /getUser\(|showAuthPrompt|addAuthListener/, false, false],
];
const sdk = {};
for (const [id, label, re, basic, full] of calls) {
  const where = grep(re);
  sdk[id] = { label, found: where.length > 0, where: where.slice(0, 3) };
  // The SDK is optional in Basic launch, but once it is in, the QA tool shows these calls.
  const needed = launch === 'full' ? full : basic;
  if (sdkFound && needed && !where.length) add('error', `sdk-${id}`, `${label} not found. The QA tool expects it for ${launch} launch.`);
}
if (sdkFound && !sdk.happytime.found) add('info', 'sdk-happytime', 'game.happytime() not found. Optional: call it on a joyful moment (level won, record broken).');
if (sdkFound && !sdk.mute.found) add('warn', 'sdk-mute', 'No muteAudio / settings listener found. If you tick "supports CrazyGames muting audio through SDK" in the form, the game must react to it.');
const usesLocalStorage = all(/localStorage\.(setItem|getItem)|localStorage\[/);
if (usesLocalStorage && !sdk.dataSet.found) add('warn', 'save', 'The game saves with localStorage only. The form asks how progress is saved; the Data module (SDK) keeps progress for logged-in players across devices. Either migrate or answer "Yes, using local storage".');
if (launch === 'basic' && (sdk.midgame.found || sdk.rewarded.found || sdk.banner.found)) add('info', 'basic-ads', 'Ad calls found. Ads are switched off in Basic launch (the SDK answers with an "adsDisabled" error). Make sure the game keeps working and hides "watch an ad" offers when an ad errors.');
if (launch === 'full' && !sdk.rewarded.found) add('info', 'full-rewarded', 'No rewarded ad found. Optional, but rewarded ads usually earn the most.');

// ---------- forbidden or risky third parties ----------
const thirdParty = [
  ['error', 'other-portal', 'Another portal SDK or ad network is in the build (external ads are not allowed). Remove it from the CrazyGames build.',
    /playgama-bridge|playgama\.com\/bridge|gamedistribution\.com|gd-sdk|poki-sdk|PokiSDK|yandex\.ru\/games|YaGames|gamemonetize|gamepix|y8\.com\/api|adinplay|googlesyndication|adsbygoogle|imasdk\.googleapis|applovin|unityads|admob|ironsrc|wortal|facebook\.com\/instantgames|\bFBInstant\b|kongregate|newgrounds\.io|famobi|lagged\.com|coolmathgames/i],
  ['warn', 'external-login', 'External sign-in code found (Firebase Auth, Google, Facebook, Auth0, PlayFab login...). External login is not allowed; use the CrazyGames user module instead.',
    /firebase\/auth|getAuth\(|signInWith(Popup|Redirect|Credential)|accounts\.google\.com\/gsi|connect\.facebook\.net|auth0\.com|LoginWithCustomID|LoginWithEmail/i],
  ['warn', 'analytics', 'Third-party analytics found (Google Analytics, GameAnalytics, Amplitude...). Usually tolerated, but it must not collect personal data without consent; mention it in the privacy question if asked.',
    /googletagmanager|google-analytics\.com|gtag\(|gameanalytics|amplitude\.com|mixpanel|segment\.io|hotjar|clarity\.ms/i],
];
for (const [level, id, text, re] of thirdParty) {
  const where = grep(re);
  if (where.length) add(level, id, text, where);
}

// ---------- links, domains, sitelock ----------
const urlHits = new Map();
for (const t of texts) {
  for (const m of t.s.matchAll(/https?:\/\/([a-z0-9.-]+\.[a-z]{2,})(\/[^\s"'`)<>]*)?/gi)) {
    const host = m[1].toLowerCase();
    if (/(^|\.)(crazygames\.com|crazygames\.io|w3\.org|schema\.org|xmlns\.com|github\.com\/(phaserjs|pixijs)|example\.com|localhost)$/.test(host)) continue;
    if (/^(www\.)?(w3\.org|apache\.org|opensource\.org|mozilla\.org|creativecommons\.org)$/.test(host)) continue;
    if (!urlHits.has(host)) urlHits.set(host, new Set());
    urlHits.get(host).add(t.f);
  }
}
const fontHosts = [...urlHits.keys()].filter((h) => /fonts\.(googleapis|gstatic)\.com|use\.typekit|fonts\.bunny/.test(h));
if (fontHosts.length) add('warn', 'cdn-fonts', `Fonts load from ${fontHosts.join(', ')}. Bundle them in the build: external requests can be blocked and slow the first load.`);
const cdnHosts = [...urlHits.keys()].filter((h) => /cdn\.jsdelivr|unpkg\.com|cdnjs\.cloudflare|code\.jquery|ajax\.googleapis/.test(h));
if (cdnHosts.length) add('warn', 'cdn-scripts', `Libraries load from a CDN (${cdnHosts.join(', ')}). Bundle them so the game does not depend on another site.`);
const otherHosts = [...urlHits.keys()].filter((h) => !fontHosts.includes(h) && !cdnHosts.includes(h));
if (otherHosts.length) add('info', 'urls', `Other web addresses in the code — check none is a link players can follow or a server the game cannot run without: ${otherHosts.slice(0, 15).join(', ')}${otherHosts.length > 15 ? '…' : ''}. (Many are harmless strings inside libraries.)`);

const links = grep(/window\.open\(|location\.href\s*=\s*["'`]https?:|<a\s[^>]*href\s*=\s*["']https?:|target\s*=\s*["']_blank/i);
if (links.length) add('warn', 'external-links', 'Code that opens other pages (window.open, links, target=_blank). Links out of the game (more games, social, stores) are not allowed on CrazyGames.', links);
const stores = grep(/play\.google\.com\/store|apps\.apple\.com|itunes\.apple\.com|market:\/\/|itms-apps:/i);
if (stores.length) add('error', 'app-store-links', 'App Store / Google Play links found. They are never allowed inside the game on CrazyGames; put store links in the portal form fields instead.', stores);
const sitelock = grep(/location\.(host|hostname|origin)\b|document\.domain|document\.referrer|top\.location|parent\.location|ancestorOrigins/);
if (sitelock.length) add('warn', 'sitelock', 'Code reads the page address (location.host, referrer, top.location...). If it restricts where the game runs, it must allow every CrazyGames domain (crazygames.com and its subdomains, the app, localhost for QA) — or be removed.', sitelock);
const absolute = [...html.matchAll(/(?:src|href)\s*=\s*["'](\/[^/"'][^"']*)["']/gi)].map((m) => m[1]);
if (absolute.length) add('error', 'absolute-paths', `index.html uses root-absolute paths (${absolute.slice(0, 4).join(', ')}). The game is served from a subfolder: use relative paths (./file or file).`);
if (html && !/<meta[^>]+name=["']viewport/i.test(html)) add('warn', 'viewport', 'index.html has no <meta name="viewport">. Mobile browsers will zoom the page.');
if (/alert\(|confirm\(|prompt\(/.test(texts.filter((t) => !/\.min\.js$/.test(t.f)).map((t) => t.s).join('\n').slice(0, 5e7))) {
  add('info', 'dialogs', 'alert()/confirm()/prompt() appears in the code. Native browser dialogs look broken inside the CrazyGames frame; use in-game panels.');
}
// Gameplay rules from docs.crazygames.com/requirements/gameplay and /technical.
const own = texts.filter((t) => !/phaser|three|pixi|vendor|\.min\.js|framework|loader|c3runtime/i.test(t.f));
const ownGrep = (re) => own.filter((t) => re.test(t.s)).map((t) => t.f);
const fsBtn = grep(/requestFullscreen|webkitRequestFullscreen|startFullscreen\(|SetFullscreen|Screen\.fullScreen\s*=/);
if (fsBtn.length) add('info', 'fullscreen', 'Fullscreen code found (often just the engine).  Check by playing: A custom fullscreen button is not allowed (CrazyGames has its own). Engine code that merely supports fullscreen is fine; remove any in-game fullscreen button.', fsBtn);
const touchDetect = ownGrep(/ontouchstart\s+in|maxTouchPoints/);
if (touchDetect.length) add('info', 'touch-detect', 'Touch detection (ontouchstart / maxTouchPoints) found. Do not use it to pick mobile controls — touchscreen laptops exist. Use SDK user.systemInfo.device.type.', touchDetect);
const envSafe = grep(/env\(safe-area-inset/);
if (envSafe.length) add('info', 'safe-area', 'env(safe-area-inset-*) found. In the CrazyGames app iframe it breaks; use the SDK CSS variables --safe-area-inset-*.', envSafe);
if (html && !/user-select\s*:\s*none/.test(texts.filter((t) => /\.(html?|css)$/i.test(t.f)).map((t) => t.s).join('\n'))) {
  add('info', 'user-select', 'No user-select: none on the page. On mobile, long presses can open the text magnifier or the context menu; add it to body (with -webkit- prefix).');
}
const privacy = grep(/privacy|terms of (use|service)/i).filter((f) => !/\.min\.js$|vendor|phaser|three|pixi/i.test(f));
add('info', 'privacy', privacy.length
  ? `Privacy/terms text found (${privacy.slice(0, 3).join(', ')}). Answer "Yes" to the Terms/Privacy QA item only if players can see it in the game.`
  : 'No privacy/terms text found. If the game collects no personal data and has no accounts, answer "N/A" to the Terms/Privacy QA item.');

// ---------- report ----------
const order = { error: 0, warn: 1, info: 2, ok: 3 };
findings.sort((a, b) => order[a.level] - order[b.level]);
const summary = {
  build: root, launch, engine: engineName, totalMB: MB(total), files: files.length,
  initialEstimateMB: MB(initialEstimate), biggest, sdk,
  counts: Object.fromEntries(['error', 'warn', 'info', 'ok'].map((l) => [l, findings.filter((f) => f.level === l).length])),
  findings,
};
if (asJson) { console.log(JSON.stringify(summary, null, 2)); process.exit(0); }

const icon = { error: '✗', warn: '!', info: 'i', ok: '✓' };
console.log(`# CrazyGames build check (${launch} launch)\n`);
console.log(`Build: ${root}`);
console.log(`Engine: ${engineName} · ${files.length} files · ${MB(total)} MB total · initial ≈ ${MB(initialEstimate)} MB`);
console.log(`Largest: ${biggest.join(', ')}\n`);
console.log(`Errors ${summary.counts.error} · Warnings ${summary.counts.warn} · Notes ${summary.counts.info}\n`);
for (const f of findings) {
  console.log(`${icon[f.level]} [${f.level}] ${f.text}`);
  if (f.files) console.log(`    in: ${f.files.join(', ')}`);
}
console.log('\n## SDK calls found');
for (const v of Object.values(sdk)) console.log(`${v.found ? '✓' : '·'} ${v.label}${v.found ? '  (' + v.where.join(', ') + ')' : ''}`);
console.log('\n(Heuristic scan: confirm in the portal QA tool, which records real SDK calls while you play.)');
