# CrazyGames SDK v3 — what to call, and fix recipes

Last checked 2026-11-14 · https://docs.crazygames.com/sdk/intro/

## Contents
1. Setup and environments
2. Calls the portal looks for
3. Modules reference
4. Fix recipes (the problems reviewers reject most)
5. Other engines

## 1. Setup and environments
```html
<script src="https://sdk.crazygames.com/crazygames-sdk-v3.js"></script>
```
```js
await window.CrazyGames.SDK.init(); // wait before any other call, ideally during the loading screen
```
`SDK.environment` (a property): `'local'` on localhost/127.0.0.1 (ads become overlay text, logs on),
`'crazygames'` on the site and the portal preview, `'disabled'` anywhere else (calls throw).
Force local mode with `?useLocalSdk=true`. Test mute with `?muteAudio=true`.

Keep the CrazyGames build separate from builds for other portals: another portal's SDK or ads inside
the CrazyGames upload is a rejection.

## 2. Calls the portal looks for
The QA tool's "SDK functionality" panel lights up each call it sees while you play.
- Basic launch: SDK optional. If present, the panel usually shows Loading Start/Stop, Gameplay
  Start/Stop, Happytime, Mute audio support, Data Get/Set. Ads show nothing (they are disabled).
- Full launch: gameplayStart/Stop mandatory; midgame/rewarded ads per the rules; data module if the
  game saves progress; user module if the game has accounts.
- `gameplayStart` also marks the end of the "initial download" for the size limit.

## 3. Modules
**game**: `loadingStart()`, `loadingStop()`, `gameplayStart()`, `gameplayStop()` (call on every break:
menu, pause, level end, ad; start again when play resumes), `happytime()` (rare joyful moments),
`reportGameCompletedPercentage(n)`, `settings` → `{ muteAudio, disableChat }`,
`addSettingsChangeListener(fn)` / `removeSettingsChangeListener(fn)`; multiplayer: `isInstantMultiplayer`,
`updateRoom({ roomId, isJoinable, inviteParams })`, `leftRoom()`, `inviteLink(params)`,
`getInviteParam(name)`, `inviteParams`, `addJoinRoomListener(fn)`.

**ad**: `requestAd('midgame' | 'rewarded', { adStarted, adFinished, adError })`, `hasAdblock()` → Promise<boolean>.
Error codes: `adsDisabled` (Basic launch, kids site, offline), `unfilled`, `adblock`, `adCooldown`, `other`.

**banner**: `requestBanner({ id, width, height })` (728x90, 300x250, 320x50, 468x60, 320x100),
`requestResponsiveBanner(id)`, `clearBanner(id)`, `clearAllBanners()`. Same container refreshes after 30 s
at most; container must be visible and inside the game. Error `bannersDisabled` in Basic launch.

**user**: `isUserAccountAvailable`, `getUser()` → `{ username, profilePictureUrl, ... }` or null,
`getUserToken()`, `showAuthPrompt()` (only on a player's click), `showAccountLinkPrompt()`,
`addAuthListener(fn)`, `listFriends()`, `systemInfo` → `{ countryCode, locale, device.type, os, browser, applicationType }`.

**data**: `setItem(key, value)`, `getItem(key)`, `removeItem(key)`, `clear()` — localStorage API.
1 MB limit (`dataLimitExcedeed`). Writes are debounced (1–30 s). Guests save locally and their data moves
to the account on login. **Only works if the "Progress Save / save progress with the Data Module" option
is chosen in the submission form** (otherwise `dataModuleDisabled`).

**analytics**: `trackOrder('xsolla', order)` for in-game purchases (invite only).

## 4. Fix recipes

### Loading and gameplay events
```js
const sdk = window.CrazyGames?.SDK;
await sdk.init();
sdk.game.loadingStart();
await loadAssets();
sdk.game.loadingStop();
// when the player can actually play:
sdk.game.gameplayStart();
// on pause, menu, level end, ad start:
sdk.game.gameplayStop();
```
Keep a flag so you never call start twice in a row or stop twice in a row.

### Mute that respects the site
```js
const applyMute = (m) => game.sound.mute = m || playerMutedInSettings;
applyMute(sdk.game.settings.muteAudio);
sdk.game.addSettingsChangeListener((s) => applyMute(s.muteAudio));
```

### Ads that cannot freeze the game (also required in Basic launch)
```js
function showAd(type) {
  return new Promise((resolve) => {
    let settled = false;
    const done = (ok) => { if (!settled) { settled = true; clearTimeout(t); resumeAndUnmute(); resolve(ok); } };
    // If the ad never starts (disabled, blocked, slow), carry on.
    let t = setTimeout(() => done(false), type === 'rewarded' ? 10000 : 3000);
    try {
      sdk.ad.requestAd(type, {
        adStarted: () => { clearTimeout(t); pauseAndMute(); t = setTimeout(() => done(false), 45000); },
        adFinished: () => done(true),
        adError: (e) => { if (e?.code === 'adsDisabled' || e?.code === 'adblock') adsAvailable = false; done(false); },
      });
    } catch { done(false); }
  });
}
```
When `adsAvailable` is false, hide every "watch ad" button and offer the non-ad alternative.

### Save with the Data module, migrating old saves
```js
const KEY = 'save';
let raw = sdk.data.getItem(KEY);
if (raw == null && localStorage.getItem(KEY) != null) {   // player from before the migration
  raw = localStorage.getItem(KEY);
  sdk.data.setItem(KEY, raw);
}
const save = raw ? JSON.parse(raw) : defaults();
const persist = () => sdk.data.setItem(KEY, JSON.stringify(save)); // keep it well under 1 MB
```

### Mobile detection
```js
const isMobile = ['mobile', 'tablet'].includes(sdk.user.systemInfo.device.type);
```

### Language
```js
const lang = (sdk.user.systemInfo.locale || 'en').slice(0, 2); // fall back to English
```

## 5. Other engines (official plugins)
- Unity: https://sdk.crazygames.com/UnityCrazySDK.unitypackage — `CrazySDK.Init(callback)`; drag the
  `Build` (and `StreamingAssets`) folders into the upload area.
- Godot: asset "crazysdk" (Godot asset store) into `res://addons/crazygames`; export HTML5 and rename the
  HTML file to `index.html`. Threaded Godot 4 builds need cross-origin isolation (`serve.mjs --isolate` to test).
- Construct 3: https://sdk.crazygames.com/Construct3CrazySDK-v3.js (worker mode not supported).
- GameMaker: https://github.com/YoYoGames/GMEXT-CrazyGames/releases
- Cocos: https://sdk.crazygames.com/CocosCrazySDK.zip · Defold: https://defold.com/extension-crazygames/
- GDevelop: CrazyGames extension in the GDevelop wiki · Wonderland: tutorial on wonderlandengine.com
