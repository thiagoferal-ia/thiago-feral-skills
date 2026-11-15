// Sky Hop: tap to hop and keep the ball in the sky.
// CrazyGames build: no sitelock, no external ads/login/links, SDK optional at runtime.
(() => {
  const KEY = 'skyhop-best';
  const c = document.getElementById('c'), x = c.getContext('2d');
  let W = 0, H = 0, dpr = 1;

  // ---------- CrazyGames SDK (the game must keep working if it is missing or fails) ----------
  const sdk = window.CrazyGames && window.CrazyGames.SDK;
  let sdkReady = false, inGameplay = false;
  const cg = (fn) => { if (!sdkReady) return; try { fn(sdk); } catch (e) { /* never let the SDK break the game */ } };
  async function initSdk() {
    if (!sdk) return;
    try {
      // Do not hang on a blocked or slow SDK.
      await Promise.race([sdk.init(), new Promise((_, rej) => setTimeout(() => rej(new Error('sdk timeout')), 3000))]);
      sdkReady = sdk.environment !== 'disabled';
    } catch (e) { sdkReady = false; }
  }
  const gameplayStart = () => { if (!inGameplay) { inGameplay = true; cg((s) => s.game.gameplayStart()); } };
  const gameplayStop = () => { if (inGameplay) { inGameplay = false; cg((s) => s.game.gameplayStop()); } };

  // ---------- Save (Data module on CrazyGames, localStorage elsewhere) ----------
  function readLocal() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function loadBest() {
    let raw = null;
    if (sdkReady) {
      try {
        raw = sdk.data.getItem(KEY);
        if (raw == null && readLocal() != null) { raw = readLocal(); sdk.data.setItem(KEY, raw); } // migrate old local saves
      } catch (e) { raw = readLocal(); }
    } else raw = readLocal();
    return +raw || 0;
  }
  function saveBest(v) {
    try { localStorage.setItem(KEY, String(v)); } catch (e) { /* private mode */ }
    cg((s) => s.data.setItem(KEY, String(v)));
  }

  // ---------- Game state ----------
  // Fixed 60 Hz physics step so the jump feels the same at 60, 144 or 165 Hz.
  const STEP = 1 / 60, GRAVITY = 1800, HOP = -600, R = 20;
  let state = 'loading', y = 0, vy = 0, score = 0, best = 0, overAt = 0, newBest = false;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  addEventListener('resize', resize); resize();

  function reset() { y = H / 3; vy = 0; score = 0; newBest = false; }

  function hop() {
    if (state === 'ready') { state = 'play'; gameplayStart(); }
    else if (state === 'over') {
      if (performance.now() - overAt < 500) return; // avoid an accidental instant restart
      reset(); state = 'play'; gameplayStart();
    }
    if (state === 'play') { vy = HOP; score++; }
  }

  function gameOver() {
    state = 'over'; overAt = performance.now();
    gameplayStop();
    if (score > best) { best = score; newBest = true; saveBest(best); cg((s) => s.game.happytime()); }
  }

  function update(dt) {
    vy += GRAVITY * dt; y += vy * dt;
    if (y < R) { y = R; if (vy < 0) vy = 0; } // keep the ball on screen
    if (y - R > H) gameOver();
  }

  function text(str, px, yy, color = '#fff') {
    x.font = `bold ${px}px "Trebuchet MS", "Arial Rounded MT Bold", Arial, sans-serif`;
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.lineWidth = Math.max(3, px / 8); x.strokeStyle = 'rgba(20, 60, 120, 0.55)';
    x.strokeText(str, W / 2, yy); x.fillStyle = color; x.fillText(str, W / 2, yy);
  }

  function draw() {
    x.fillStyle = '#7ec8ff'; x.fillRect(0, 0, W, H);
    if (state !== 'loading') {
      x.fillStyle = '#fff'; x.beginPath(); x.arc(W / 2, y, R, 0, Math.PI * 2); x.fill();
    }
    const big = Math.max(28, Math.min(64, W / 10)), small = Math.max(18, Math.min(30, W / 22));
    if (state === 'loading') text('Loading...', small, H / 2);
    if (state === 'ready') { text('Sky Hop', big * 1.3, H * 0.2); text('Tap, click or press Space to hop', small, H * 0.62); if (best) text(`Best: ${best}`, small, H * 0.7); }
    if (state === 'play') text(String(score), big, Math.max(40, H * 0.1));
    if (state === 'over') {
      text('Game over', big, H * 0.3);
      text(`Score: ${score}`, small * 1.2, H * 0.42);
      text(newBest ? `New best: ${best}!` : `Best: ${best}`, small, H * 0.5, newBest ? '#ffe066' : '#fff');
      text('Tap to play again', small, H * 0.62);
    }
  }

  let last = 0, acc = 0;
  function loop(t) {
    const dt = Math.min((t - (last || t)) / 1000, 0.1); last = t; // cap: hidden tabs and hitches
    if (state === 'play') { acc += dt; while (acc >= STEP && state === 'play') { update(STEP); acc -= STEP; } }
    else acc = 0;
    draw();
    requestAnimationFrame(loop);
  }

  // ---------- Input: pointer covers mouse and touch; Space/Up for keyboard ----------
  c.addEventListener('pointerdown', (e) => { e.preventDefault(); hop(); });
  addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') { e.preventDefault(); if (!e.repeat) hop(); }
    else if (e.code === 'ArrowDown') e.preventDefault();
  });
  addEventListener('contextmenu', (e) => e.preventDefault());
  addEventListener('wheel', (e) => e.preventDefault(), { passive: false });

  requestAnimationFrame(loop);
  (async () => {
    await initSdk();
    cg((s) => s.game.loadingStart());
    best = loadBest();
    reset();
    cg((s) => s.game.loadingStop());
    state = 'ready';
  })();
})();
