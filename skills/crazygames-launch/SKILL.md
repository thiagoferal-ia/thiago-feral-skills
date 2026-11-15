---
name: crazygames-launch
description: Take any HTML5 web game (Phaser, Pixi, Three.js, Unity WebGL, Godot, Construct, GameMaker, plain JS...) through a CrazyGames submission end to end. Checks the build and the CrazyGames SDK against the current rules, prepares the upload folder (the portal refuses zips), makes the three cover images and the two preview videos at the exact sizes the portal demands (1920x1080 and 2:3 1080x1620), writes the listing text, and gives the answer to every form and QA checklist field with the reason, for Basic and Full launch. Use it whenever someone wants to publish, submit, upload or launch a game on CrazyGames, prepare CrazyGames store assets (covers, thumbnails, preview video), integrate or check the CrazyGames SDK, fill the CrazyGames developer portal form or QA checklist, fix a CrazyGames rejection, or move a game from Basic to Full launch — even if they only say "put my game on CrazyGames".
---

# CrazyGames launch

You are guiding a game developer — possibly a beginner — from "I have a web game" to "submitted on
CrazyGames", and on to Full launch later. The portal punishes small mistakes (a zip upload, a 9:16
video, a wrong QA answer), and the developer usually discovers them one screen at a time. Your job is
to find all of them up front, fix what can be fixed, and hand over a folder plus an answer sheet that
make the portal a ten-minute task.

Talk to the developer in their language. Write the store texts (listing, video/cover text) in English:
English is mandatory on CrazyGames and most players read it.

## What you produce
A `crazygames/` folder next to the game project (or where the developer asks):
```
crazygames/
  build/            exact files to upload (index.html at the top)
  covers/           cover-landscape.jpg 1920x1080 · cover-portrait.jpg 800x1200 · cover-square.jpg 800x800
  videos/           landscape.mp4 1920x1080 · portrait.mp4 1080x1620 (≤ 20 s, silent, cover as first frame)
  raw/              recordings, screenshots, contact sheets (not uploaded)
  check-report.md   build/SDK check results and what was fixed
  listing.md        category, tags, description, controls (from assets/listing-template.md)
  form-answers.md   every portal field and QA item with its answer and the reason
```
Tell the developer up front that this is the plan, and keep a short to-do list as you go.

## Scripts (Node 18+, no npm install; FFmpeg for media)
All in `scripts/` next to this file. Run them with `node <skill-dir>/scripts/<name>`.
- `check_build.mjs <build|zip> [--launch basic|full] [--json]` — static scan: index.html at root,
  sizes vs limits, file count, engine guess, SDK calls found, other portal SDKs/ad networks, external
  login, links out, sitelock code, absolute paths, CDN fonts, fullscreen code, and more. Extracts a zip
  if given one. Heuristic: "not found" means "look", not "proven missing".
- `serve.mjs <build> [--port 8787] [--out crazygames/raw] [--isolate]` — serves the build plus
  `/__cg/stage.html?w=W&h=H` (game in an iframe of exactly W×H) and saves uploads from the recorder.
- `recorder.js` (loaded by the stage) — `cg.info()`, `cg.start(name)`/`cg.stop()`, `cg.record({seconds,name})`,
  `cg.shot(name)`; records the largest canvas and saves to `--out`.
- `media.mjs` — `probe`, `video` (resize/crop or pad, trim ≤ 19.5 s, strip audio, `--first-frame cover`),
  `cover` (crop to size, optional `--logo`), `zones` (draws the label zone for review), `sheet`
  (contact sheet to review a video without watching it).
If FFmpeg is missing, tell the developer how to install it (winget/brew/apt) and continue with the
non-media steps meanwhile.

## Workflow

### 1. Understand the situation (ask only what you can't find)
Find the build (a `dist/`, `build/`, Unity/Godot export, or a zip) and figure out:
- Basic or Full launch? Default: **Basic** for a game not yet on CrazyGames. Full only after an invitation.
- Is the build CrazyGames-specific? If the same build also targets other portals, the CrazyGames upload
  must not contain their SDKs or ads — look for a per-portal build mode before changing code.
- Mobile support, orientation, multiplayer, accounts, how progress is saved.
If there is no build at all, help produce one first (the engine's web export / `npm run build`).

### 2. Check, then fix
Run `check_build.mjs` and read `references/requirements.md` for anything it flags. Then:
- **Errors** block the submission: fix them (or show the developer the exact change if the code isn't
  yours to edit — e.g. a Unity project you can't build). `references/sdk.md` has fix recipes:
  loading/gameplay events, mute, ads that cannot freeze the game, Data-module saves with migration.
- **Warnings** usually matter: explain each in one line and fix or justify it.
- Rebuild and re-run the check after changes. Put the final report and the fixes in `check-report.md`.
Why the strictness: reviewers reject "without feedback" for some of these (external ads, ads that break
with ads disabled), and a rejection costs weeks.

### 3. Prepare the upload folder
Copy the final build into `crazygames/build/` with `index.html` at its top (no wrapper folder, no
source maps, no OS junk). The portal refuses `.zip` files — the developer uploads this folder with
*Select folder* (or drags its contents).

### 4. Run it and play it
Start `serve.mjs` and open the game in a browser (browser automation if you have it). Watch the
console for errors, play a few minutes: start, win, lose, menus, mute. With the SDK, `localhost` runs it
in `local` mode, where ads appear as overlay text. Note anything a reviewer would hit; it goes into the
report. The real test is the portal's QA preview later — the developer must also try it on a phone
through the QR code there.

### 5. Covers and videos
Read `references/media.md` before starting — it has the specs, the capture options and the review
checklist. In short:
- Record each orientation at its real size (`stage.html?w=1920&h=1080`, then `?w=1080&h=1620`), with the
  tab visible, in a clean state (English, no ads/debug UI, a good-looking level), more than 20 s.
- Make the covers first (key art > generated art > clean in-game frames with the logo), check them with
  `media.mjs zones`, then build the videos with `--first-frame` pointing at the matching cover.
- **Look at the results** (open the images and the contact sheets) before calling them done.
If you can't play the game well enough for a good video, say so and ask the developer for a screen
recording — then process it with `media.mjs video`.

### 6. Listing text
Fill `assets/listing-template.md` into `crazygames/listing.md`: category, up to 5 tags, a description
(hook → features → feel, plain text, ~80–160 words, concrete, no hype or keyword stuffing) and controls
(one line per input, desktop and mobile). Base it on what the game actually contains — open the code or
play it; never invent features. The "Which tools did you use?" field is about how the game was made:
ask the developer, don't guess.

### 7. Form answers
Write `crazygames/form-answers.md` from `references/form.md`, field by field, each with the answer and
the reason, citing the check report. For QA checklist items you could not verify yourself (phone test,
fullscreen, the preview's Warnings tab), mark them "verify in the preview" with what to look for — the
developer signs a statement that the answers are true, so never mark an unverified item as passing.

### 8. Hand over
Finish with a short message in the developer's language:
- what is ready and where (the folder tree), and what was fixed in the game;
- the remaining manual steps in order (billing, upload folder, play the preview + QR, paste listing,
  upload covers/videos, submit);
- what happens next: review time is not published (days to a few weeks), Basic launch runs 7–21 days
  and is judged on playtime, day-1 retention, 1-minute conversion and thumbnail CTR; ads and revenue
  only start in Full launch; +50% revenue for 2 months of browser exclusivity after Full launch if the
  game is not on other web portals.

## Full launch (when invited, or when asked to prepare it)
Re-run the check with `--launch full` and work through the Full column of `references/requirements.md`:
gameplayStart/Stop at every break, ads only at natural breaks through the SDK (midgame ≥ ~3 min apart,
rewarded optional with a video icon and a non-ad alternative, pause + mute on `adStarted`), Data module
for progress, user module if there are accounts, works with AdBlock, gameplay within one click.
Then *Submit new version* in the portal with the Full switch.

## Fixing a rejection
Ask for the exact message (screenshot). Map it to `references/requirements.md` / `references/form.md`,
fix, re-check, and explain what changed. For Basic-launch results below the benchmarks, look at the
weakest metric: CTR → cover and first video seconds; conversion → load time and the first minute;
playtime/retention → difficulty curve and goals.

## Gotchas learned the hard way
- `.zip` uploads are refused — upload the folder.
- Portrait video must be **2:3 (1080x1620)**; 1080x1920 is refused.
- Hidden browser tabs freeze requestAnimationFrame: recordings come out frozen. Keep the tab visible.
- `canvas.toDataURL()` on WebGL is often blank: use `cg.shot()`.
- Record in the store language (English) and with ad offers hidden — Basic launch has no ads, so a video
  showing "watch an ad" misrepresents the game.
- With ads integrated, the game must keep working when every ad fails (`adsDisabled`) — no freeze
  between levels, no dead rewarded buttons. Test with the preview's "Throw SDK Error".
- The Data module only saves if "save progress with the Data Module" is picked in the form.
- MediaRecorder WebM files have no duration header; `media.mjs` handles it.
