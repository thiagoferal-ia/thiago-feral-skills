# The submission form, field by field

Observed in the CrazyGames Developer Portal (developer.crazygames.com) on 2026-11-14 during a real
Basic-launch submission of an HTML5 game. The portal is login-only, so this is the best public record;
if a screen looks different, trust the screen and tell the user what changed.

Before the form: **Account > Billing** must be filled (name or company, address, country), or the
portal will not let you submit.

The form has 4 steps: **1 Upload · 2 QA · 3 Details · 4 Submit**, with a **Basic | Full** switch at the
top right.

## Contents
1. Step 1 — Upload
2. Step 2 — QA (the preview tool, then the checklist)
3. Step 3 — Details
4. Step 4 — Submit, and the game page afterwards
5. Answer sheet template

## 1. Step 1 — Upload
| Field | What to put | Why / how to decide |
|---|---|---|
| Basic / Full | **Basic** for a game that is not on CrazyGames yet | Everyone starts in Basic; Full comes by invitation after the test. |
| Game name | The name shown in the game itself | Must match the title on the covers. |
| Game engine | The engine if listed (Unity, Godot, Construct, GameMaker, Cocos, Defold, GDevelop, Phaser...) else **HTML5** | `check_build.mjs` prints its guess. |
| Upload files | The build **folder** via *Select folder*, or drag the files | A .zip is refused: "Archive files are not supported, please drag and drop the files directly in the upload zone." If *Select folder* puts everything one level down and the portal can't find index.html, open the folder, select all its contents, and drag them in. |
| Does your game save progress? | "Yes, using the Data Module from the CrazyGames SDK" if the game calls `SDK.data`; "Yes, using local storage" (wording may vary) if it uses localStorage; "No" if nothing is saved | The Data module only works when this option is selected. |
| The game supports mobile devices | Tick only if it plays well by touch on a phone | Reviewers test on iOS and Android. |
| The game is an online multiplayer game | Tick only for real-time/online multiplayer | Triggers extra multiplayer requirements. |
| The game supports CrazyGames muting audio through SDK | Tick if the game reads `game.settings.muteAudio` and its listener | The QA panel shows "Mute audio support" when it is detected. |
| Mobile orientation (may appear here or in Details) | BOTH / PORTRAIT / LANDSCAPE | Can only change with a new build. |

## 2. Step 2 — QA
### 2a. The preview tool ("QA environment")
The game opens inside a CrazyGames page with a red warning ("You are playing this game in a QA
environment..."), **QA Settings** toggles (Limit midroll frequency, Include test ads, Skip video and
fallback ads, Enable Unity Cache, Instant Multiplayer, Disable Chat setting, Throw SDK Error, SDK Debug),
an invite-parameters box, and a right-hand panel with tabs **Requirements · Log · Warnings**:
- Basic requirements: initial download < 50 MB, gameplay requirements, no external ads, no external
  login options, plays smoothly on iOS and Android (a **Show QR Code** link opens it on a phone).
- SDK functionality: each call lights green when seen (Happytime, Gameplay Start/Stop, Loading
  Start/Stop, Mute audio support, Get/Set Item...). Grey ad/banner rows are normal in Basic launch.
- Total size, load size, load time.

What to do: play a few minutes (start, win, lose, menu, mute toggle), open **Warnings** and fix anything
listed, scan the QR code and play on a phone, then **Continue**. "Throw SDK Error" is worth one try: the
game must keep working when the SDK fails.

### 2b. The checklist ("QA Results")
Answer each honestly; the confirmation checkbox at the bottom says wrong answers void the submission.
| Item (as worded) | Usual answer | Mark "Yes" only if |
|---|---|---|
| Initial download size < 50MB | automatic | — |
| First gameplay start | automatic | — |
| First gameplay start implemented correctly | Yes | `gameplayStart` fires when the player can actually play (not on the loading screen), and stop/start pair at every break. |
| Complies to Gameplay requirements | Yes | English, no custom fullscreen button, no links out, readable in a small iframe, nothing above PEGI 12. |
| Runs on all CrazyGames domains | Yes | No sitelock, or a sitelock that allows *.crazygames.com and capacitor://*.crazygames.com; relative paths. |
| Browser checks | Yes | It ran without errors in the preview (check the console / Log tab). |
| Device checks: Mobile (Preview · Show QR) | Yes | You played it on a real phone via the QR code. If mobile is not supported, untick mobile in step 1. |
| No external ads | Yes | The scan found no other ad network or portal SDK. |
| Does not offer external login options | Yes | No Google/Facebook/own accounts. |
| In-game mention of Terms & Conditions and/or Privacy Policy (Yes / No / N/A) | **N/A** when the game collects no personal data beyond the SDK and has no accounts; **Yes** when players can see the notice in-game | — |
Then tick "I confirm that these results are correct..." and **Continue**.

## 3. Step 3 — Details
| Field | What to put |
|---|---|
| Category * | One portal category (Puzzle, Action, Arcade, Adventure, Driving, Shooting, Simulation, Sports, Strategy, Clicker, Card, Board, Trivia, Word, .io, Casual...). |
| Tags * | Max 5, picked from the portal's list ("admin managed" tags are extra and don't count). Pick what players search for: genre, mechanic, mood. |
| Description * | Plain text, **no HTML** (the editor has bold/headers buttons, but keep it simple). English. Hook → features → feel. ~80–160 words. |
| Controls * | Plain text, one line per input: click/tap, drag, keys. |
| Which tools did you use? * | Multi-select: ChatGPT, Claude, Gemini, Grok, DeepSeek, GitHub Copilot, Cursor, Lovable, Bolt, Replit, Rosebud AI, Midjourney, Other, None. Ask the user — it is about how the game was made. |
| Google Play / iOS App Store / Steam | Link + number of downloads, only if the game is on those stores. Otherwise empty. |
| Marketing creatives URL | Optional link to a folder of extra art. Usually empty. |
| Cover images * | Landscape 16:9 1920x1080, Portrait 2:3 800x1200, Square 1:1 800x800. Keep "Show label zone" ticked and check the top-left badge area hides nothing important. |
| Preview videos * | Landscape 1920x1080 and **Portrait 2:3 (1080x1620)** — 1080x1920 is refused with "Incorrect video dimensions... Please upload a 2:3 portrait video". MP4 or MOV, max 20 s. |
| Mobile orientation | Shown again (read-only after the build is created). |
| The game works well in fullscreen | Tick after testing the portal's fullscreen button: the game must resize cleanly. |
Buttons: *Upload new version* · *Preview* · **Save and continue to last step**.

## 4. Step 4 — Submit, and afterwards
Review and send. The game page then shows status **AWAITING REVIEW** with "Waiting for review — We will
notify you once the team has reviewed your game", a Game ID, the submission date, tabs **Game
Versions / Game Info / Art**, and buttons *Submit new version* and *Remove game*.

## 5. Answer sheet template (write this to `crazygames/form-answers.md`)
```markdown
# <Game> — CrazyGames form answers (<date>, <Basic|Full> launch)

## Before you start
- [ ] Account > Billing filled

## Step 1 — Upload
- Launch: Basic
- Game name: ...
- Engine: ...
- Upload: select the folder `crazygames/build` (not a zip)
- Save progress: ... (because ...)
- Mobile: ☑/☐ (because ...) · Multiplayer: ☐ · SDK mute: ☑/☐ (because ...)

## Step 2 — QA
- In the preview: play X minutes, check Warnings, scan the QR code on a phone.
- Checklist: <item> → <answer> (<evidence from the check report>) ...

## Step 3 — Details
- Category / Tags / Description / Controls → see listing.md
- Tools used: ask the developer
- Covers: covers/cover-landscape.jpg, cover-portrait.jpg, cover-square.jpg
- Videos: videos/landscape.mp4, videos/portrait.mp4
- Orientation: ... · Works in fullscreen: ☑ after testing

## Things to verify by hand
- ...
```
