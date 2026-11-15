# Covers and preview videos

Specs from https://docs.crazygames.com/requirements/game-covers/ (checked 2026-11-14) plus what the
portal enforced in a real submission.

## Contents
1. Specs
2. Getting footage (capture strategies)
3. Making the videos
4. Making the covers
5. Review checklist

## 1. Specs
**Covers (3, visually consistent):** landscape 1920x1080, portrait 800x1200, square 800x800.
- No borders. **The only text allowed is the game title** (no "New", "Play now", ratings, URLs).
- No icons, store badges or logos of other brands; nothing blurry or pixelated.
- Prefer a character, a big stylized title, or an illustration over a raw screenshot. Must read at
  thumbnail size.
- **Label zone**: the top-left corner, where the site puts badges (roughly 40% of the width × 19% of
  the height on landscape, 39% × 10% on portrait, 34% × 29% on square). Keep the title and faces out of it.
- The thumbnail CTR is a Basic-launch metric (from 23 Nov 2026), so the cover is worth real effort.

**Preview videos (both required):** landscape 1920x1080 and portrait **1080x1620 (2:3)** — the portal
refuses 9:16. MP4 (or MOV), 15–20 s (longer gets cut), ≤ 50 MB, **no audio**, no fast-forward.
- **First frame = the static cover**, so the thumbnail flows into the video (`media.mjs video --first-frame`).
- Show real gameplay. Avoid black screens, logo intros, black bars, the default mouse cursor,
  promotional text, app/social icons, ad popups, debug overlays.
- The same top-left label zone applies (about 40% × 20% landscape, 40% × 10% portrait).

## 2. Getting footage
Record each orientation at its real size, so the game lays itself out for that shape instead of being
cropped later. In order of preference:

1. **The developer gives clips or key art.** Use them; only resize/trim.
2. **Record the canvas in a browser (works for Phaser, Pixi, Three.js, Unity WebGL, Godot, Construct...):**
   - `node scripts/serve.mjs <build> --out crazygames/raw` serves the build and the stage page.
   - Open `http://localhost:8787/__cg/stage.html?w=1920&h=1080` (then `?w=1080&h=1620`). The game runs
     in an iframe of exactly that size; the preview is only scaled on screen.
   - In the page console (browser automation's JavaScript tool): `await cg.info()` (canvas size, fps),
     then `cg.start('landscape.webm')`, play, `await cg.stop()`. Or `await cg.record({ seconds: 25, name })`.
     `await cg.shot('shot-landscape.png')` grabs a clean frame for covers (works with WebGL).
   - **The tab must be visible**: hidden tabs pause requestAnimationFrame and the recording freezes
     (`cg.info()` reports ~0 fps). Bring the browser pane/window to the front.
   - Someone has to play. Options: you drive it with clicks/keys through browser automation (fine
     for turn-based or puzzle games); the game has a debug/demo/autoplay hook you call from the console;
     or the developer plays while you record. For fast action games, ask the developer to play.
   - Prepare a clean state first: English, ads/debug UI off, a level that looks good (not the tutorial),
     enough progress to show variety. Record more than 20 s and cut the best part.
3. **Screen recording by the developer** (OBS, Xbox Game Bar, QuickTime) — then `media.mjs video` fixes
   size and length. If they only have one orientation, `--fit pad` builds the other over a blurred
   copy; it looks weaker than a real recording, so say so.

DOM-based games (no canvas) cannot use `cg`; use option 1 or 3.

## 3. Making the videos
```bash
node scripts/media.mjs video crazygames/raw/landscape.webm --orientation landscape \
  --first-frame crazygames/covers/cover-landscape.jpg --start 1.5 --out crazygames/videos/landscape.mp4
node scripts/media.mjs video crazygames/raw/portrait.webm --orientation portrait \
  --first-frame crazygames/covers/cover-portrait.jpg --out crazygames/videos/portrait.mp4
node scripts/media.mjs sheet crazygames/videos/landscape.mp4 --out crazygames/raw/sheet-landscape.jpg
```
Choose `--start`/`--end` from the contact sheet: open on action, end on a satisfying moment (a win,
a combo, a level clear). The script holds the cover ~0.8 s, cross-fades in, keeps the total ≤ 19.5 s,
strips audio, and prints `ok: true` when size, length and silence are right.

## 4. Making the covers
Best: real key art (from the developer, or made with an image-generation tool if one is available) —
a hero element plus the stylized title, same style as the game. Then:
```bash
node scripts/media.mjs cover art.png --kind landscape --out crazygames/covers/cover-landscape.jpg
node scripts/media.mjs cover art.png --kind portrait  --out crazygames/covers/cover-portrait.jpg
node scripts/media.mjs cover art.png --kind square    --out crazygames/covers/cover-square.jpg
```
Without key art: grab clean frames with `cg.shot()` at 1920x1080, 1600x2400 and 1600x1600 (the game
lays out per shape), and overlay a transparent-background logo with `--logo logo.png` (it is placed away
from the label zone automatically; override with `--logo-pos`). Tell the developer a screenshot cover
is the weakest option and why (CTR metric).
Check each cover with `node scripts/media.mjs zones <cover> --kind <kind> --out <preview.png>` and look
at the preview image.

## 5. Review checklist (look at the images; do not assume)
- Covers: right sizes; title readable at small size; nothing important under the label zone; no extra
  text or borders; the three look like one family.
- Videos: open the contact sheets — real gameplay all the way, first frame is the cover, no black
  frames, no ad/debug popups, no other language than English in the UI, ends on a high point,
  portrait is 1080x1620.
