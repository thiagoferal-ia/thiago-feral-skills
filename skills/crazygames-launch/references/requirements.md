# CrazyGames requirements (Basic and Full launch)

Last checked: 2026-11-14 against docs.crazygames.com. Rules change — when something matters for a
decision (a limit, a ban), re-read the linked page if you have web access and say if it changed.

Sources: [intro] requirements/intro · [tech] requirements/technical · [gameplay] requirements/gameplay ·
[ads] requirements/ads · [acct] requirements/account-integration · [covers] requirements/game-covers ·
[blm] resources/basic-launch-metrics · [faq] faq · [terms] developer terms 18.08.2025
(all under https://docs.crazygames.com/ except the terms PDF on files.crazygames.com).

## Contents
1. Pipeline: Basic → Full
2. Requirements table
3. Technical
4. Gameplay and content
5. Ads (Full launch)
6. Money: revenue, exclusivity, payouts
7. After submission

## 1. Pipeline: Basic → Full
- **QA check** first: bugs, no English, clones/asset flips, inappropriate themes, kids-targeted content,
  above PEGI 12 → rejected. [faq]
- **Basic launch**: small, temporary release. SDK optional. **Ads and purchases are off.** [intro]
  - Runs 7–21 days: ends when the game has been live ≥ 7 days **and** has ≥ 500 plays, otherwise at 21 days. [blm]
  - Metrics (benchmarks for strong games): average playtime per session (10+ min), day-1 retention
    (10–15%), 1-minute conversion (80%+; these games load in < 10 s and weigh < 20 MB), and — for
    launches starting on or after 23 Nov 2026 — **thumbnail click-through rate** (top 20% of the
    category). The cover and the first seconds of the video directly drive that last one. [blm]
  - Updates during Basic launch are auto-approved / go live at the next daily refresh. [blm][faq]
  - Outcomes: move to Full, retry with clear improvements, or stop. Minor changes usually give the same result. [faq]
- **Full launch**: second QA review against Full requirements, SDK mandatory, ads on, bigger audience. [faq]

## 2. Requirements table [intro]
| | Basic | Full |
|---|---|---|
| Technical | initial ≤ 50 MB, total ≤ 250 MB (≤ 50 MB total without SDK), ≤ 1500 files | + SDK, gameplayStart/Stop |
| Gameplay | basic visual QA, PEGI 12 | full visual QA, new players land in gameplay (≤ 1 click) |
| Ads | none (CrazyGames ads disabled, no external ads) | SDK ads only, by the rules, works with AdBlock |
| Accounts (if any) | no external login | progress tied to CrazyGames account, CG username/avatar, auto-login |
| Multiplayer (if any) | optional | rooms, invite link, instant multiplayer, disableChat respected |
| Purchases | not available | invite only, through CrazyGames' Xsolla |

## 3. Technical [tech]
- Sizes: initial ≤ 50 MB (≤ 20 MB to be shown on the **mobile homepage**), total ≤ 250 MB, ≤ 1500 files.
  With the SDK, "initial" = everything loaded before the first `gameplayStart`. Without the SDK the total counts.
- Files loaded from elsewhere are judged by time-to-gameplay, which must be ≤ 20 s.
- **Relative paths only.** The game is served from a CDN subfolder.
- Upload (observed in the portal, Nov 2026): **.zip is rejected** ("Archive files are not supported") —
  use *Select folder* or drag the files. `index.html` must be at the top of what you upload.
- Browsers: Chrome/Edge expected; games bad on Safari get disabled there; must run on a 4 GB Chromebook.
- Input: mouse + keyboard; touch if mobile is supported. Desktop must be playable in landscape
  (portrait games are allowed with side bars).
- Detect mobile with SDK `user.systemInfo.device.type`, **not** touch detection.
- Mobile: orientation declared in the form (site asks players to rotate — no orientation lock needed);
  `user-select: none` on body; resume iOS AudioContext inside a tap; Unity is off on iOS by default.
- CrazyGames app: fullscreen, respect safe areas with the SDK's `--safe-area-inset-*` CSS variables
  (not `env(...)`), hide online features when `isOfflineMode`.
- Sitelock (optional): allow `crazygames.com` and every subdomain, `capacitor://*.crazygames.com`
  (iOS app) and `'self'`. Without the capacitor entry the iOS app shows a white screen.
- Physics must behave the same at 60, 144 and 165 Hz. [gameplay]

## 4. Gameplay and content [gameplay][acct]
- **English is required** (use `systemInfo.locale`, fall back to English).
- Readable at devicePixelRatio 1 in small 16:9 iframes (QA sizes include 821x462 and 907x510 desktop, 800x450 mobile).
- **No custom fullscreen button.** CrazyGames provides fullscreen.
- **No cross-promotion / links out.** Allowed exceptions (never the main call to action): privacy policy
  and terms; community links (Discord, website) in a menu if they don't lead to a playable web version;
  Steam/Epic links for desktop games only on the main menu or end of a demo; links to CrazyGames pages;
  games of the same series. **App Store links are never allowed in-game.**
- **No external login.** Guest play is fine; no own username/avatar system.
- Personal data beyond SDK events → show new players a terms/privacy notice (a simple notice, not a blocking popup).
- Original content; PEGI 12. Full launch: land in gameplay in one click at most.
- Avoid Escape (exits fullscreen) and Ctrl/Cmd+W; support AZERTY. preventDefault wheel, arrows,
  space and contextmenu so the page does not scroll.
- Audio: `game.settings.muteAudio` overrides the in-game toggle; mute when an ad **starts**.

## 5. Ads — Full launch only [ads]
- Midgame only at natural breaks (level end, death, map change); never during play or on menu/shop
  buttons. Pause and block input until `adFinished`/`adError`; continue correctly after an error.
  The SDK enforces one midgame per ~3 min (early requests are ignored).
- No ads before a reasonable amount of gameplay; no deceptive or chained ads.
- Rewarded: optional, occasional, never required to finish a level; skip button same size/style as the
  watch button; video icon on the watch button; a non-ad alternative; reward only on finish.
- Banners: only on screens open ≥ 5 s on average, never during gameplay, max 2 per screen, never over UI.
- AdBlock: never block play; no dead rewarded buttons.
- **Basic launch with ads integrated**: the game must run perfectly with ads disabled (no freezes between
  levels, no dead "watch ad" buttons) — or it is rejected without feedback.

## 6. Money [terms][faq]
- Revenue share on SDK ads, computed monthly; **no percentage is published.** Paid only in Full launch,
  with the SDK on its latest version, no other portal branding, no outside ads, original game.
- Non-exclusive by default: the game may live on other sites.
- **+50% for 2 months** if the game is exclusive to CrazyGames among browser game sites for the first
  2 months after Full launch (Steam and app stores do not count).
- Payouts monthly via Tipalti from €100. **Billing details (Account > Billing) are needed before you can submit.**
- Technical support opens at 50k combined plays.

## 7. After submission [faq][blm]
- Acceptance comes by email. Review time for new games is not published (reports range from days to a
  few weeks — present it as uncertain). Updates are usually processed the same working day.
- Player feedback (negative ratings ask for a reason) shows in the portal.
- New version: *Submit new version* in the game page → same steps. Avoid it while the first review is
  pending unless something is broken.
- Moving to Full: SDK with gameplayStart/Stop at every break, Data module (or another save) if there is
  progress, User module if there are accounts, ads by the rules, works with AdBlock, gameplay in ≤ 1 click,
  multiplayer items if any. Then a second QA review.
- A/B tests of covers/videos exist in Full launch (one at a time, up to 14 days).
