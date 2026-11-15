// Canvas recorder for the capture stage (loaded by stage.html, or pasted into any page).
// Records the game's largest <canvas> with MediaRecorder and uploads the file to
// serve.mjs (POST /__cg/save), which writes it to the capture folder.
//
//   await cg.info()                         -> canvas size, frame count check
//   await cg.record({ seconds: 25, name: 'landscape.webm' })
//   cg.start('portrait.webm'); ...play...; await cg.stop()
//   await cg.shot('cover-landscape.png')    -> one frame as PNG (works with WebGL too)
(() => {
  const docs = () => {
    const list = [document];
    for (const f of document.querySelectorAll('iframe')) {
      try { if (f.contentDocument) list.push(f.contentDocument); } catch (e) { /* cross-origin: skip */ }
    }
    return list;
  };
  const canvas = () => {
    let best = null;
    for (const d of docs()) for (const c of d.querySelectorAll('canvas')) {
      if (!best || c.width * c.height > best.width * best.height) best = c;
    }
    if (!best) throw new Error('No <canvas> found. Is the game loaded? DOM-based games need a screen recorder instead.');
    return best;
  };
  const mime = () => ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']
    .find((m) => window.MediaRecorder && MediaRecorder.isTypeSupported(m));
  const upload = async (blob, name) => {
    const r = await fetch('/__cg/save?name=' + encodeURIComponent(name), { method: 'POST', body: blob });
    return r.json();
  };
  let current = null;
  // A hidden tab never delivers video frames: give up instead of hanging, and say why.
  const within = (p, ms) => Promise.race([p, new Promise((r) => setTimeout(() => r('timeout'), ms))]);
  const HIDDEN = 'No frames arrived. The tab is probably hidden (background tabs pause rendering): bring the browser window/pane to the front and retry.';

  window.cg = {
    canvas,
    async info() {
      const c = canvas();
      // Count the page's animation frames for 1 s in the canvas's own window. A hidden tab gives ~0;
      // a window behind other windows is throttled (often 10–30) and makes choppy recordings.
      const win = c.ownerDocument.defaultView || window;
      let frames = 0, run = true;
      const tick = () => { frames++; if (run) win.requestAnimationFrame(tick); };
      win.requestAnimationFrame(tick);
      await new Promise((r) => setTimeout(r, 1000));
      run = false;
      const warning = frames < 5 ? HIDDEN
        : frames < 45 ? `Only ${frames} frames per second: the window is probably behind other windows or the machine is busy. Bring the browser to the front for a smooth video.`
          : undefined;
      return { width: c.width, height: c.height, cssWidth: c.clientWidth, cssHeight: c.clientHeight,
        framesPerSecond: frames, visible: document.visibilityState, mime: mime(), ...(warning ? { warning } : {}) };
    },
    start(name = 'capture.webm', { fps = 30, bitrate = 12e6 } = {}) {
      if (current) throw new Error('Already recording');
      const stream = canvas().captureStream(fps);
      const rec = new MediaRecorder(stream, { mimeType: mime(), videoBitsPerSecond: bitrate });
      const chunks = [];
      rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      rec.start(250);
      current = { rec, chunks, name, t0: performance.now() };
      return `recording ${name}`;
    },
    async stop() {
      if (!current) throw new Error('Not recording');
      const { rec, chunks, name, t0 } = current;
      current = null;
      await new Promise((r) => { rec.onstop = r; rec.stop(); });
      const blob = new Blob(chunks, { type: 'video/webm' });
      if (blob.size < 20000) throw new Error(HIDDEN);
      const res = await upload(blob, name);
      return { ...res, bytes: blob.size, seconds: Math.round((performance.now() - t0) / 100) / 10 };
    },
    async record({ seconds = 25, name = 'capture.webm', fps = 30, bitrate = 12e6 } = {}) {
      this.start(name, { fps, bitrate });
      await new Promise((r) => setTimeout(r, seconds * 1000));
      return this.stop();
    },
    async shot(name = 'shot.png') {
      // Read a frame through a video element: toDataURL on WebGL canvases is often blank.
      const c = canvas();
      const v = document.createElement('video');
      v.muted = true; v.srcObject = c.captureStream(30);
      const played = await within(v.play(), 3000);
      const framed = played === 'timeout' ? 'timeout'
        : await within(new Promise((r) => (v.requestVideoFrameCallback ? v.requestVideoFrameCallback(() => r()) : setTimeout(r, 200))), 3000);
      if (framed === 'timeout' || !v.videoWidth) { v.srcObject.getTracks().forEach((t) => t.stop()); throw new Error(HIDDEN); }
      const out = document.createElement('canvas');
      out.width = v.videoWidth || c.width; out.height = v.videoHeight || c.height;
      out.getContext('2d').drawImage(v, 0, 0, out.width, out.height);
      v.srcObject.getTracks().forEach((t) => t.stop());
      const blob = await new Promise((r) => out.toBlob(r, 'image/png'));
      return { ...(await upload(blob, name)), width: out.width, height: out.height };
    },
  };
})();
