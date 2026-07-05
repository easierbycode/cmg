<script>
  import { onMount, onDestroy } from 'svelte';
  import Osd from './Osd.svelte';

  // Primary game-list source is the deployed app's manifest. A launcher binary
  // serves its own embedded copy from localhost, so it must reach out to the
  // deploy to learn about newly-added games — same deployed-URL-first approach
  // as scripts/2028-ai/boot-entry.js uses for foo.json.
  const DEPLOY_ORIGIN = 'https://cmg.easierbycode.deno.net';

  const MAIN_MENU = [
    { id: 'memory',   label: 'Memory',   tag: '01 / sys.core', num: '0x01' },
    { id: 'games',    label: 'Games',    tag: '02 / disc.io',  num: '0x02' },
    { id: 'settings', label: 'Settings', tag: '03 / config',   num: '0x03' },
  ];

  const TG16_ID = '__tg16__';
  const PSX_ID  = '__psx__';
  const SATURN_ID = '__saturn__';
  const NES_ID = '__nes__';
  const DEMOS_ID = '__demos__';
  const CMGNET_ID = '__cmgnet__';
  const ARCADE_ID = '__arcade__';
  // Baked-in fallback snapshot of the Demos list (Games → Demos). At runtime
  // loadManifest() replaces it with the manifest's `demos` (OTA), so adding a
  // demo to data/demos.json + pushing reaches every launcher with no rebuild.
  // Demos are Fresh routes under /demos/*; their `url` resolves against the
  // manifest origin, so the demo page stays co-origin with /api/ws-goofy.
  const SEED_DEMOS = [
    { id: 'akuma', name: 'Akuma', title: 'AKUMA', sub: 'Three.js · WASD', size: '— MB', date: 'demo', url: '/demos/akuma' },
    { id: 'goofy-game', name: 'Goofy Game', title: 'GOOFY GAME', sub: 'multiplayer · WS', size: '— MB', date: 'demo', url: '/demos/goofy-game' },
    { id: 'headphones-recommended', name: 'Headphones Recommended', title: 'HEADPHONES RECOMMENDED', sub: 'Phaser 4.1.0 · idle', size: '— MB', date: 'demo', url: '/demos/headphones-recommended' },
    { id: 'vertical-shooter', name: 'Vertical Shooter', title: 'VERTICAL SHOOTER', sub: 'Phaser 4.1.0 · TATE CRT', size: '— MB', date: 'demo', url: '/demos/vertical-shooter' },
  ];
  // Baked-in fallback snapshot of the game list — the offline / pre-manifest
  // seed. At runtime loadManifest() replaces it with the deployed OTA manifest
  // (static/games.manifest.json, generated from data/games.json by
  // scripts/build-games-manifest.ts). To add or edit a game, change
  // data/games.json — that is what deploys to every launcher; this inline copy
  // only renders when both manifest fetches fail (fully offline).
  const SEED_GAMES = [
    { id: '2019-turbo',                                            name: '2019 Turbo',          title: '2019 TURBO',          sub: 'Pixi.js · Turbo', icon: null,                                   size: '— MB',    date: '06.13.26' },
    { id: '2019-es7',                                              name: '2028',                title: '2028',                sub: 'ES7 // Phaser 3', icon: '/icons/2028-icon.png',                size: '12.4 MB', date: '07.28.22' },
    { id: 'games/2028-ai',                                         name: '2028.Ai',             title: '2028.AI',             sub: 'Phaser 4 // offline', icon: '/icons/2028-icon.png',            size: '21 MB',   date: '05.28.26', url: '/games/2028-ai' },
    { id: 'games/evil-invaders/index.html?turbo=1&audio=1',        name: 'Evil Invaders',       title: 'EVIL INVADERS',       sub: 'Classic',         icon: '/icons/evil-invaders-icon.png',       size: '9.6 MB',  date: '04.04.23', url: '/games/evil-invaders/index.html?turbo=1&audio=1' },
    { id: 'monkey-kombat',                                         name: 'Monkey Kombat',       title: 'MONKEY KOMBAT',       sub: '🐵ᕗ ─=≡ΣO))',     icon: null,                                   size: '6.4 MB',  date: '05.19.26' },
    { id: 'evil-invaders-phaser4/?scene=MutoidScene&loop=2',       name: 'Mutoid',              title: 'MUTOID',              sub: 'Phaser 4 // loop:2', icon: '/icons/evil-invaders-icon.png',     size: '11.8 MB', date: '06.21.25' },
    { id: 'pacman-halloween-2025',                                 name: 'PAC-MAN Halloween',   title: 'PAC-MAN: HALLOWEEN',  sub: 'Seasonal',        icon: null,                                   size: '14.2 MB', date: '10.31.25' },
    { id: 'evil-invaders',                                         name: 'Peachy Skies',        title: 'PEACHY SKIES',        sub: 'Turbo + Audio',   icon: '/icons/headphone-invader-icon.png',   size: '8.2 MB',  date: '10.13.24' },
    { id: 'hellophaser/v3',                                        name: 'RonaGun',             title: 'RONAGUN',             sub: 'Phaser v3 demo',  icon: null,                                   size: '3.1 MB',  date: '08.08.22' },
    { id: 'shmup-party-phaser3',                                   name: 'Sh’M↑ Party',         title: 'SH\'M↑ PARTY',        sub: 'Multiplayer',     icon: '/icons/shmup-party-icon.png',          size: '7.9 MB',  date: '02.14.24' },
    { id: 'squad-game',                                            name: 'Squad Game',          title: 'SQUAD GAME',          sub: '👨🏽‍💻 👾💾🖳 👩🏽‍💻',  icon: '/icons/squad-game.png',                size: '5.7 MB',  date: '11.02.23' },
    { id: DEMOS_ID,                                                name: 'Demos',               title: 'DEMOS',               sub: 'DEMO // submenu', icon: null,                                   size: '— MB',    date: 'DEMO',    submenu: true },
    { id: CMGNET_ID,                                               name: 'CMG Network',         title: 'CMG NETWORK',         sub: 'NET // e-shop',   icon: null,                                   size: '— MB',    date: 'NET',     submenu: true },
    { id: ARCADE_ID,                                               name: 'Arcade',              title: 'ARCADE',              sub: 'MAME // submenu', icon: null,                                   size: '— MB',    date: 'MAME',    submenu: true },
    { id: NES_ID,                                                  name: 'Nintendo',            title: 'NINTENDO',            sub: 'NES // submenu',  icon: null,                                   size: '— MB',    date: 'NES',     submenu: true },
    { id: PSX_ID,                                                  name: 'PlayStation',         title: 'PLAYSTATION',         sub: 'PSX // submenu',  icon: null,                                   size: '— MB',    date: 'PSX',     submenu: true },
    { id: SATURN_ID,                                               name: 'Sega Saturn',         title: 'SEGA SATURN',         sub: 'SS // submenu',   icon: null,                                   size: '— MB',    date: 'SS',      submenu: true },
    { id: TG16_ID,                                                 name: 'TurboGrafx-16',       title: 'TURBOGRAFX-16',       sub: 'PCE // submenu',  icon: null,                                   size: '— MB',    date: 'PCE',     submenu: true },
  ];

  // Submenu tiles (Demos / PlayStation / TurboGrafx-16) are fixed client
  // features, not OTA games — the manifest carries only real games — so we take
  // them from the seed and re-append them after each manifest load.
  const SUBMENUS = SEED_GAMES.filter((g) => g.submenu);
  // Reactive base game list (the real OTA games, no submenus): starts as the
  // baked seed, then replaced at runtime by the fetched manifest (see
  // loadManifest). The rendered GAMES list is derived from this — see below.
  let manifestGames = $state(SEED_GAMES.filter((g) => !g.submenu));
  // Origin the active manifest came from; in-repo game `url`s resolve against it
  // ('' = same-origin / relative — the seed and same-origin fallback case).
  let manifestOrigin = $state('');
  // Reactive Demos list (Games → Demos) — seeded, then replaced by the
  // manifest's `demos`. Same OTA path as GAMES.
  let DEMOS = $state(SEED_DEMOS);

  let screen = $state('dashboard'); // 'dashboard' | 'games' | 'arcade' | 'tg16' | 'nes' | 'psx' | 'saturn' | 'demos'
  let menuSel = $state(1);           // start on Games
  let gameSel = $state(0);
  let clockStr = $state('--:--:--');
  let gameSrc = $state(null);
  let gameOn = $state(false);
  // ─── Music app sidebar (a CMG Network entry with kind:'music') ─────────────
  // Unlike a normal CMG Network game — which takes over the full screen via
  // gameSrc/gameOn — a music app opens in a docked sidebar overlay that runs IN
  // PARALLEL to whatever is already playing: the game underneath keeps running
  // and receiving input while the music app plays alongside it. Held in its own
  // state so opening/closing it never touches gameSrc/gameOn.
  let musicSrc = $state(null);
  let musicId = $state(null);
  let musicTitle = $state('');
  let musicOpen = $state(false);
  // Opposite-corner easter egg: the "normal secret touch" (bottom-left +
  // top-right) opens the OSD; touching the OPPOSITE corners (top-left +
  // bottom-right) boots the soft-mod cinematic overlay instead.
  let softmodOn = $state(false);
  let bootGone = $state(false);
  let menuEls = $state([]);
  let gameRowEls = $state([]);
  let gameListEl = $state(null);

  let tg16Games = $state([]);
  let tg16Sel = $state(0);
  let tg16RowEls = $state([]);
  let arcadeGames = $state([]);
  let arcadeSel = $state(0);
  let arcadeRowEls = $state([]);
  let psxGames = $state([]);
  let psxSel = $state(0);
  let psxRowEls = $state([]);
  let psxByodError = $state('');
  let psxFileInput = $state(null);
  let psxByodBtnEl = $state(null);
  let saturnGames = $state([]);
  let saturnSel = $state(0);
  let saturnRowEls = $state([]);
  let saturnByodError = $state('');
  let saturnFileInput = $state(null);
  let saturnByodBtnEl = $state(null);
  // NES — preloaded ROMs (manifest) plus an always-present BYOC ("Bring Your
  // Own Cartridge") row pinned after them at index nesGames.length.
  let nesGames = $state([]);
  let nesSel = $state(0);
  let nesRowEls = $state([]);
  let nesByocError = $state('');
  let nesFileInput = $state(null);
  let demosSel = $state(0);
  let demosRowEls = $state([]);
  let cmgnetGames = $state([]);
  let cmgnetSel = $state(0);
  let cmgnetRowEls = $state([]);
  // id → { downloading, pct, cached, error } — drives the e-shop GET/INSTALLED
  // badges and the per-row download progress bar.
  let cmgnetStatus = $state({});
  // Installed CMG Network games "graduate" into the main Games list. A title is
  // installed once its files are cached (cmgnetStatus[id].cached). We tag the
  // graduated entries with __cmgnet so launchGame routes them through
  // launchCmgnet (run offline from cache) instead of the easierbycode.com/<id>
  // path, and so the Games screen can offer an Uninstall action.
  let installedCmgnet = $derived(
    cmgnetGames
      // cached → graduated; skip any id already present as an OTA game so GAMES
      // never carries two rows with the same id (the keyed {#each} would throw).
      .filter((g) => cmgnetStatus[g.id]?.cached && !manifestGames.some((m) => m.id === g.id))
      .map((g) => ({ ...g, __cmgnet: true }))
  );
  // The rendered Games list: OTA games, then graduated network installs, then
  // the fixed console/e-shop submenus (kept last). Reassigning manifestGames or
  // installing/uninstalling a network game re-derives this.
  let GAMES = $derived([...manifestGames, ...installedCmgnet, ...SUBMENUS]);
  // CMG Network hides anything already installed (it now lives in Games);
  // uninstalling drops it back into this list.
  let cmgnetVisible = $derived(cmgnetGames.filter((g) => !cmgnetStatus[g.id]?.cached));
  // Music apps from the catalog (kind:'music'). They open in the sidebar overlay
  // (openMusic) instead of the full-screen game frame, and are surfaced as
  // toggles in the in-game Guide so they can be popped open on top of a running
  // game. They never enter the GET/INSTALLED download flow (no caching), so they
  // stay in cmgnetVisible and never graduate into the Games list.
  let musicApps = $derived(cmgnetGames.filter((g) => g && g.kind === 'music'));
  let isTouch = $state(false);
  let controlsShown = $state(false);
  let padHadConnection = $state(false);
  let padConnected = $state(false);
  let isTg16Game = $derived(typeof gameSrc === 'string' && (gameSrc.startsWith('/turbografx16/') || gameSrc.startsWith('/psx/') || gameSrc.startsWith('/saturn/') || gameSrc.startsWith('/nes/') || gameSrc.startsWith('/arcade/')));
  let hasEmulatorControls = $derived(typeof gameSrc === 'string' && (gameSrc.startsWith('/turbografx16/') || gameSrc.startsWith('/psx/') || gameSrc.startsWith('/saturn/') || gameSrc.startsWith('/nes/')));
  // First touch in-game dismisses transient chrome (kept for the tg16 message
  // path). The upper-right close button is gone — Exit Game in the OSD replaces it.
  let chromeDismissed = $state(false);

  // ─── In-game OSD ("Guide") ───────────────────────────────────────────────
  // Opened by SELECT + Down (gamepad) or a two-finger bottom-left + top-right
  // tap (touch). Game section = Exit Game + Controller Settings; Look section =
  // the design's tweaks (persisted to localStorage, applied to the dashboard).
  let osdOpen = $state(false);
  let osdSel = $state(0);
  // The Guide is a two-level menu: the root list ('main') and the Cheats
  // sub-page ('cheats'). osdItems is derived off this so gamepad/keyboard nav,
  // which indexes into osdItems, transparently follows whichever page is shown.
  let osdView = $state('main');
  const osdNav = { vDir: 0, hDir: 0 }; // edge-latch for gamepad nav while open
  // Per-section collapse state (keyed by section name). A collapsed section
  // renders only its header row; its child rows are filtered out of osdItems.
  // 'Look' starts collapsed so the Guide opens compact — expand to reveal tweaks.
  // Persisted to localStorage (like the Look tweaks) so a chosen collapse/expand
  // sticks across reloads; the defaults only seed first-run / cleared storage.
  const OSD_COLLAPSE_KEY = 'cmg-osd-collapsed';
  const OSD_COLLAPSE_DEFAULTS = { Look: true };
  function loadCollapsed() {
    try { return { ...OSD_COLLAPSE_DEFAULTS, ...JSON.parse(localStorage.getItem(OSD_COLLAPSE_KEY) || '{}') }; }
    catch (_) { return { ...OSD_COLLAPSE_DEFAULTS }; }
  }
  let osdCollapsed = $state(loadCollapsed());

  // Cheats are boot-time URL params on the running game's iframe. A game
  // advertises which ones it supports by postMessage'ing
  // { type: 'cmg-cheats', cheats: [...] } on boot (handled in onWindowMessage);
  // the OSD shows the Cheats submenu only while a game has broadcast a set, so
  // it's automatically scoped to the games that opt in. Toggling a cheat
  // rewrites gameSrc's query string and the iframe reloads with it applied.
  let osdCheats = $state([]);
  // Plugins are the live-toggle sibling of cheats. A game advertises which ones
  // it supports by postMessage'ing { type: 'cmg-plugins', plugins: [...] } on
  // boot (handled in onWindowMessage). Unlike cheats (boot-time URL params that
  // reload the iframe), a plugin toggle is applied live: flipping it posts
  // { type: 'cmg-plugin-set', id, value } back into the running frame, which the
  // game acts on without a reload (e.g. the Vertical Shooter demo's TATE Mode
  // CRT shader). The dashboard holds the last-known value; the game is only the
  // source of truth at boot, after which the OSD is the sole place it changes.
  let osdPlugins = $state([]);
  // Actions are momentary OSD buttons a game advertises by postMessage'ing
  // { type: 'cmg-actions', actions: [{ id, label }] } on boot (handled in
  // onWindowMessage). Activating one posts { type: 'cmg-action', id } back into
  // the running frame, which the game turns into an in-game action — e.g.
  // shmup-party advertises "Controls" and opens its own remapping UI. Like
  // cheats/plugins this is opt-in per game, so the rows only exist while a game
  // has broadcast a set.
  let osdActions = $state([]);
  // Harden the game-supplied payload before it drives the menu: whitelist kind,
  // clamp counts/lengths, coerce slider bounds. Each item keeps a stable `key`
  // for the keyed {#each}. Returns [] on anything malformed.
  function sanitizeCheats(raw) {
    if (!Array.isArray(raw)) return [];
    const out = [];
    const seen = new Set();
    for (const c of raw.slice(0, 12)) {
      if (!c || typeof c.param !== 'string' || !c.param) continue;
      const param = c.param.slice(0, 32);
      // One row per param: the keyed {#each} keys on 'cheat-'+param, and Svelte
      // throws at runtime on a duplicate key — so collapse repeats defensively.
      if (seen.has(param)) continue;
      seen.add(param);
      const label = (typeof c.label === 'string' && c.label) ? c.label.slice(0, 40) : param;
      const kind = c.kind === 'slider' ? 'slider' : 'toggle';
      if (kind === 'slider') {
        const min = Number.isFinite(c.min) ? c.min : 0;
        const max = Number.isFinite(c.max) ? Math.max(min, c.max) : Math.max(min, 9);
        const step = Number.isFinite(c.step) && c.step > 0 ? c.step : 1;
        const unit = typeof c.unit === 'string' ? c.unit.slice(0, 4) : '';
        // commit:true → the OSD applies the value (rewriting gameSrc, which
        // reloads the game) on the slider's change event, not on every oninput,
        // so dragging the slider doesn't reboot the game on each intermediate step.
        out.push({ key: 'cheat-' + param, param, kind, label, min, max, step, unit, commit: true });
      } else {
        out.push({ key: 'cheat-' + param, param, kind, label });
      }
    }
    return out;
  }
  // Parse gameSrc (absolute https://… for external games, root-relative /…/ for
  // in-repo ones) into a URL so we can read/rewrite a single query param.
  function cheatUrl() {
    if (!gameSrc) return null;
    try { return new URL(gameSrc, gameSrc.startsWith('/') ? window.location.origin : undefined); }
    catch (_) { return null; }
  }
  function cheatParam(param) {
    const u = cheatUrl(); return u ? u.searchParams.get(param) : null;
  }
  // value === null deletes the param; otherwise it is set. Re-serialize keeping
  // the original absolute/relative shape so same-origin games stay same-origin.
  function setCheat(param, value) {
    const u = cheatUrl(); if (!u) return;
    if (value === null) u.searchParams.delete(param);
    else u.searchParams.set(param, String(value));
    const relative = gameSrc.startsWith('/') && u.origin === window.location.origin;
    gameSrc = relative ? u.pathname + u.search + u.hash : u.href;
  }
  // Harden a game-advertised plugin set (mirrors sanitizeCheats). Each plugin is
  // a live toggle keyed on a stable id; malformed entries are dropped. Returns
  // [] on anything not an array. Plugins are currently toggle-only.
  function sanitizePlugins(raw) {
    if (!Array.isArray(raw)) return [];
    const out = [];
    const seen = new Set();
    for (const p of raw.slice(0, 8)) {
      if (!p || typeof p.id !== 'string' || !p.id) continue;
      const id = p.id.slice(0, 32);
      if (seen.has(id)) continue;
      seen.add(id);
      const label = (typeof p.label === 'string' && p.label) ? p.label.slice(0, 40) : id;
      out.push({ key: 'plugin-' + id, id, kind: 'toggle', label, value: !!p.value });
    }
    return out;
  }
  // Toggle a plugin: record the new value locally (so the OSD reflects it) and
  // tell the running game to apply it live.
  function setPlugin(id, value) {
    osdPlugins = osdPlugins.map((p) => (p.id === id ? { ...p, value: !!value } : p));
    const iframe = document.getElementById('gameframe');
    // targetOrigin '*' is deliberate here (unlike postToGameframe / the BYOD
    // replies, which use window.location.origin): plugin-capable demos can load
    // cross-origin from the manifest/DEPLOY_ORIGIN, where a strict origin would
    // silently drop the toggle. The payload is a benign boolean, so '*' is safe —
    // do not tighten it to window.location.origin or cross-origin demos break.
    try { iframe?.contentWindow?.postMessage({ type: 'cmg-plugin-set', id, value: !!value }, '*'); }
    catch (_) { /* ignore */ }
  }
  // Harden a game-advertised action set (mirrors sanitizePlugins). Each action is
  // a momentary button keyed on a stable id; malformed entries are dropped.
  function sanitizeActions(raw) {
    if (!Array.isArray(raw)) return [];
    const out = [];
    const seen = new Set();
    for (const a of raw.slice(0, 8)) {
      if (!a || typeof a.id !== 'string' || !a.id) continue;
      const id = a.id.slice(0, 32);
      if (seen.has(id)) continue;
      seen.add(id);
      const label = (typeof a.label === 'string' && a.label) ? a.label.slice(0, 40) : id;
      out.push({ key: 'action-' + id, id, label });
    }
    return out;
  }
  // Tell the running game an OSD action button was activated. '*' targetOrigin
  // for the same reason as setPlugin: action-capable games can load cross-origin
  // from the manifest/DEPLOY_ORIGIN. The payload is a benign id, so '*' is safe.
  function sendGameAction(id) {
    const iframe = document.getElementById('gameframe');
    try { iframe?.contentWindow?.postMessage({ type: 'cmg-action', id }, '*'); }
    catch (_) { /* ignore */ }
  }

  // ── Twin-Stick mode ───────────────────────────────────────────────────────
  // Re-expresses the pad as a dual-analog controller for twin-stick shooters:
  // D-pad → left stick (move), face buttons → right stick (aim; top=up,
  // right=right, bottom=down, left=left). The Guide shows the toggle when a
  // game opts in, three ways:
  //   - built-in default list (TWIN_STICK_DEFAULT_IDS — defaults ON),
  //   - a `twinStick` flag on its catalog/manifest entry
  //     (true, or { default: true } — mirrors the codemonkey.json shape),
  //   - a boot-time postMessage { type: 'cmg-twinstick', default?: bool },
  //     same pattern as cmg-cheats/cmg-plugins.
  // Same-origin games (CMG Network cache, in-repo) get it applied by patching
  // the frame's navigator.getGamepads with CMGGamepadCompat.twinStick over the
  // launcher's own (SNES-normalized) pads — zero game changes needed.
  // Cross-origin games can't be patched; they receive
  // { type: 'cmg-twinstick-set', value } (sent in both cases) and apply it
  // themselves. The choice persists per game in localStorage.
  const TWIN_STICK_DEFAULT_IDS = new Set(['shmup-party-phaser3', 'shmup-party-phaser4']);
  let twinStickAvail = $state(false);
  let twinStickOn = $state(false);
  let twinGameId = null;
  let twinStickUserSet = false;

  function twinStickKey(id) { return 'cmg-twinstick:' + id; }

  function initTwinStick(id, item) {
    twinGameId = id || null;
    twinStickUserSet = false;
    const flag = item ? item.twinStick : undefined;
    const catalogAvail = flag === true || (!!flag && typeof flag === 'object');
    const catalogDefault = flag === true || !!(flag && flag.default);
    const builtin = !!id && TWIN_STICK_DEFAULT_IDS.has(id);
    twinStickAvail = builtin || catalogAvail;
    let on = builtin || catalogDefault;
    try {
      const saved = id ? localStorage.getItem(twinStickKey(id)) : null;
      if (saved !== null) on = saved === '1';
    } catch (_) { /* ignore */ }
    twinStickOn = twinStickAvail && on;
  }

  function setTwinStick(v) {
    twinStickOn = !!v;
    twinStickUserSet = true;
    if (twinGameId) {
      try { localStorage.setItem(twinStickKey(twinGameId), twinStickOn ? '1' : '0'); } catch (_) { /* ignore */ }
    }
    applyTwinStick();
  }

  // A game frame is patchable only when same-origin. Decide from the frame's
  // src URL rather than probing contentWindow.document: the probe throws a
  // catchable SecurityError, but Chrome still logs a "Blocked a frame …"
  // console error at the access point even when it's caught — pure noise on
  // every cross-origin game load.
  function frameIsSameOrigin(iframe) {
    try {
      const src = iframe?.getAttribute('src') || '';
      if (!src) return false;
      return new URL(src, window.location.href).origin === window.location.origin;
    } catch (_) { return false; }
  }

  // Patch (same-origin) and/or notify (any origin) the running game frame.
  // The patched getGamepads reads twinStickOn live, so it installs once per
  // frame document and the toggle takes effect without a reload.
  function applyTwinStick() {
    // Fall back to the class selector: on the iframe's own load event the
    // gameOn-gated id may not be applied yet.
    const iframe = document.getElementById('gameframe') ||
      document.querySelector('.game-iframe iframe');
    const w = iframe && iframe.contentWindow;
    if (!w) return;
    if (frameIsSameOrigin(iframe)) {
      try {
        if (!w.__cmgTwinStickWrapped) {
          w.__cmgTwinStickWrapped = true;
          const orig = typeof w.navigator.getGamepads === 'function'
            ? w.navigator.getGamepads.bind(w.navigator)
            : () => [];
          w.navigator.getGamepads = () => {
            if (!twinStickOn) return orig();
            try { return window.CMGGamepadCompat.twinStick(navigator.getGamepads() || []); }
            catch (_) { return orig(); }
          };
        }
      } catch (_) { /* frame navigated mid-flight — the postMessage below still lands */ }
    }
    // Cross-origin games apply the toggle themselves off this message.
    try { w.postMessage({ type: 'cmg-twinstick-set', value: twinStickOn }, '*'); } catch (_) { /* ignore */ }
  }
  const HUE_SWATCHES = [
    { hex: '#7CFF4F', hue: 130 }, // green (default)
    { hex: '#4FB8FF', hue: 235 }, // blue
    { hex: '#FF6FB1', hue: 350 }, // pink
    { hex: '#FFB13D', hue: 60 },  // amber
    { hex: '#C18BFF', hue: 290 }, // violet
    { hex: '#56F0E2', hue: 190 }, // cyan
  ];
  const TWEAK_KEY = 'cmg-tweaks';
  const TWEAK_DEFAULTS = { hue: 130, breatheSpeed: 1, scanlines: true, discoMode: false };
  function loadTweaks() {
    try { return { ...TWEAK_DEFAULTS, ...JSON.parse(localStorage.getItem(TWEAK_KEY) || '{}') }; }
    catch (_) { return { ...TWEAK_DEFAULTS }; }
  }
  let tweaks = $state(loadTweaks());
  function setTweak(key, value) {
    tweaks = { ...tweaks, [key]: value };
    try { localStorage.setItem(TWEAK_KEY, JSON.stringify(tweaks)); } catch (_) {}
  }

  // Flat, ordered list the OSD renders and gamepad/keyboard nav indexes into.
  // Each section is introduced by a navigable header row (kind:'section'); when
  // that section is collapsed only the header is emitted, so nav and rendering
  // both transparently skip the hidden children.
  let osdItems = $derived.by(() => {
    const out = [];
    const addSection = (name, children) => {
      if (!children.length) return;
      out.push({ key: `sect-${name}`, kind: 'section', section: name, label: name, collapsed: !!osdCollapsed[name] });
      if (!osdCollapsed[name]) out.push(...children);
    };

    // Cheats sub-page: a Back row plus one control per URL-param cheat, each
    // reflecting the param's current state on the running game's iframe.
    if (osdView === 'cheats') {
      addSection('Cheats', [
        { key: 'cheats-back', kind: 'button', label: '‹ Back' },
        ...osdCheats.map((c) =>
          c.kind === 'toggle'
            ? { ...c, value: cheatParam(c.param) === '1' }
            : { ...c, value: Number(cheatParam(c.param)) || 0 }
        ),
      ]);
      return out;
    }

    const game = [
      { key: 'exit', kind: 'button', label: 'Exit Game' },
      { key: 'controller', kind: 'button', label: 'Controller Settings' },
    ];
    // Game-advertised OSD action buttons (opt-in per game over cmg-actions).
    // Activating one posts { type:'cmg-action', id } back into the frame.
    for (const a of osdActions) game.push({ key: a.key, kind: 'button', label: a.label, action: a.id });
    // EmulatorJS control bar toggle is only meaningful for EmulatorJS cores.
    if (hasEmulatorControls) {
      game.push({ key: 'emucontrols', kind: 'toggle', label: 'Emulator Controls', value: controlsShown });
    }
    // Twin-Stick mode appears only for games that opt in (built-in list,
    // catalog `twinStick` flag, or a cmg-twinstick broadcast).
    if (twinStickAvail) {
      game.push({ key: 'twinstick', kind: 'toggle', label: 'Twin-Stick Mode', value: twinStickOn });
    }
    // The Cheats submenu appears only when the running game has advertised a
    // cheat set over postMessage (osdCheats) — opt-in, per game.
    if (osdCheats.length) {
      game.push({ key: 'cheats', kind: 'button', label: 'Cheats' });
    }
    addSection('Game', game);

    // Game-advertised live plugins render as toggles under a "Plugins" header.
    // Like Cheats, this is opt-in per game — the section only exists while the
    // running game has broadcast a plugin set.
    addSection('Plugins', osdPlugins.map((p) => (
      { key: p.key, kind: 'toggle', label: p.label, value: p.value, plugin: p.id }
    )));

    // Music apps (CMG Network kind:'music') render as toggles so a player can
    // pop the music sidebar open/closed on top of the running game straight from
    // the Guide. Section only exists while the catalog advertises a music app.
    addSection('Music', musicApps.map((m) => (
      { key: 'music-' + m.id, kind: 'toggle', label: m.title || m.name, value: musicOpen && musicId === m.id, music: m.id }
    )));

    addSection('Look', [
      { key: 'hue', kind: 'color', label: 'Glow color', value: tweaks.hue, options: HUE_SWATCHES },
      { key: 'breathe', kind: 'slider', label: 'Breathe speed', value: tweaks.breatheSpeed, min: 0.4, max: 2.2, step: 0.1, unit: '×' },
      { key: 'scanlines', kind: 'toggle', label: 'Scanlines', value: tweaks.scanlines },
      { key: 'disco', kind: 'toggle', label: 'Disco mode', value: tweaks.discoMode },
    ]);
    return out;
  });

  // Keep the selection in range when the list shrinks under it — e.g. a game
  // re-advertises a smaller cheat/plugin set while the Guide is open. The nav
  // handlers also clamp on keypress, but this self-heals the highlight the
  // instant the derived list changes. (osdItems doesn't read osdSel, so no loop.)
  $effect(() => {
    if (osdSel > osdItems.length - 1) osdSel = Math.max(0, osdItems.length - 1);
  });

  // Index of the first non-header row, so resetting the selection lands on an
  // actionable item rather than a section header (which would only collapse it).
  function firstSelectable(items) {
    const i = items.findIndex((it) => it.kind !== 'section');
    return i < 0 ? 0 : i;
  }
  function toggleSection(name) {
    osdCollapsed = { ...osdCollapsed, [name]: !osdCollapsed[name] };
    try { localStorage.setItem(OSD_COLLAPSE_KEY, JSON.stringify(osdCollapsed)); } catch (_) {}
    sfx.nav();
  }
  function openOsd() {
    osdView = 'main'; osdSel = firstSelectable(osdItems); osdNav.vDir = 0; osdNav.hDir = 0; osdOpen = true; sfx.enter();
    // Pull keyboard focus out of the game frame so the launcher's own onKey
    // handler drives OSD navigation. A focus-stealing game — especially a
    // cross-origin one, whose keys the launcher can neither read nor forward
    // into — otherwise swallows every arrow/Enter/Esc while the Guide is up.
    if (gameOn) { try { document.getElementById('gameframe')?.blur(); window.focus(); } catch (_) { /* ignore */ } }
  }
  // B / Esc backs out of the Cheats sub-page to the root before it closes the
  // whole Guide; the ✕ button and tap-out always close outright.
  function osdBack() {
    if (osdView === 'cheats') { osdView = 'main'; osdSel = firstSelectable(osdItems); sfx.back(); return; }
    closeOsd();
  }
  function closeOsd() {
    osdOpen = false; osdView = 'main'; sfx.back();
    // Hand focus back so the game resumes receiving input. EmulatorJS games
    // (isTg16Game) deliberately keep focus on the launcher — the dashboard polls
    // the pad and forwards synthesized keys into that same-origin frame — so
    // refocusing the frame there would break input; skip them.
    if (gameOn && !isTg16Game) { try { document.getElementById('gameframe')?.focus(); } catch (_) { /* ignore */ } }
  }
  function setOsdValue(i, v) {
    const it = osdItems[i]; if (!it) return;
    // Cheat rows carry a `param`: toggles add/remove ?param=1, the stage slider
    // sets ?stage=N (0 kept — it is a valid first stage). Reloads the iframe.
    if (it.param) { setCheat(it.param, it.kind === 'toggle' ? (v ? '1' : null) : v); return; }
    // Plugin rows carry a `plugin` id — flip it live in the running game.
    if (it.plugin) { setPlugin(it.plugin, !!v); return; }
    // Music rows carry a `music` id — open/close the sidebar overlay (the game
    // underneath keeps running).
    if (it.music) { if (v) openMusic(musicApps.find((m) => m.id === it.music)); else closeMusic(); return; }
    if (it.key === 'hue') setTweak('hue', v);
    else if (it.key === 'breathe') setTweak('breatheSpeed', Math.round(v * 10) / 10);
    else if (it.key === 'scanlines') setTweak('scanlines', !!v);
    else if (it.key === 'disco') setTweak('discoMode', !!v);
    else if (it.key === 'emucontrols') controlsShown = !!v;
    else if (it.key === 'twinstick') setTwinStick(!!v);
  }
  function adjustOsd(i, dir) {
    const it = osdItems[i]; if (!it) return;
    if (it.kind === 'section') {
      // Left collapses, right expands — only act when it changes state.
      if ((dir < 0) !== !!osdCollapsed[it.section]) toggleSection(it.section);
    } else if (it.kind === 'slider') {
      const v = Math.max(it.min, Math.min(it.max, Math.round((it.value + dir * it.step) * 10) / 10));
      setOsdValue(i, v); sfx.nav();
    } else if (it.kind === 'color') {
      const idx = Math.max(0, it.options.findIndex((o) => o.hue === it.value));
      setOsdValue(i, it.options[(idx + dir + it.options.length) % it.options.length].hue); sfx.nav();
    } else if (it.kind === 'toggle') {
      setOsdValue(i, dir > 0); sfx.nav();
    }
  }
  function activateOsd(i) {
    const it = osdItems[i]; if (!it) return;
    if (it.kind === 'section') { toggleSection(it.section); return; }
    if (it.kind === 'toggle') { setOsdValue(i, !it.value); sfx.nav(); return; }
    if (it.kind === 'color' || it.kind === 'slider') { adjustOsd(i, 1); return; }
    // Game-advertised action button: relay it into the frame and hand focus back
    // so the game's own UI (e.g. shmup's Controls remapper) receives input.
    if (it.action) {
      sfx.enter();
      osdOpen = false; osdView = 'main';
      sendGameAction(it.action);
      if (gameOn && !isTg16Game) { try { document.getElementById('gameframe')?.focus(); } catch (_) {} }
      return;
    }
    if (it.key === 'exit') { sfx.enter(); osdOpen = false; closeGame(); }
    else if (it.key === 'controller') { sfx.enter(); osdOpen = false; try { window.openControllerConfigurator?.(); } catch (_) {} }
    else if (it.key === 'cheats') { sfx.enter(); osdView = 'cheats'; osdSel = firstSelectable(osdItems); }
    else if (it.key === 'cheats-back') { osdView = 'main'; osdSel = firstSelectable(osdItems); sfx.back(); }
  }

  // Two-finger corner gesture (bottom-left + top-right at once) opens the OSD on
  // touch, where the SELECT + Down chord isn't available.
  const cornerState = { bl: false, tr: false };
  function cornerDown(c) {
    cornerState[c] = true;
    if (cornerState.bl && cornerState.tr) { cornerState.bl = false; cornerState.tr = false; openOsd(); }
  }
  function cornerUp(c) { cornerState[c] = false; }

  // Mirror gesture on the OTHER diagonal (top-left + bottom-right) launches the
  // soft-mod cinematic. Kept separate from cornerState so the two diagonals
  // never interfere.
  const softCornerState = { tl: false, br: false };
  function softCornerDown(c) {
    softCornerState[c] = true;
    if (softCornerState.tl && softCornerState.br) {
      softCornerState.tl = false; softCornerState.br = false; openSoftmod();
    }
  }
  function softCornerUp(c) { softCornerState[c] = false; }
  function openSoftmod() {
    if (softmodOn) return;
    if (osdOpen) closeOsd();
    sfx.boot();
    softmodOn = true;
  }
  function closeSoftmod() { softmodOn = false; }

  $effect(() => {
    if (screen !== 'games') return;
    const el = gameRowEls[gameSel];
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });

  $effect(() => {
    if (screen !== 'tg16') return;
    const el = tg16RowEls[tg16Sel];
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });

  $effect(() => {
    if (screen !== 'arcade') return;
    const el = arcadeRowEls[arcadeSel];
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });

  $effect(() => {
    if (screen !== 'psx') return;
    const el = psxRowEls[psxSel];
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });

  $effect(() => {
    if (screen !== 'saturn') return;
    const el = saturnRowEls[saturnSel];
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });

  $effect(() => {
    if (screen !== 'nes') return;
    const el = nesRowEls[nesSel];
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });

  $effect(() => {
    if (screen !== 'demos') return;
    const el = demosRowEls[demosSel];
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });

  $effect(() => {
    if (screen !== 'cmgnet') return;
    const el = cmgnetRowEls[cmgnetSel];
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });

  // Keep selections in range as the Games list grows (a download graduates a
  // title) and the CMG Network list shrinks (it hides installs). Without this a
  // completed background download could leave cmgnetSel pointing past the end.
  $effect(() => {
    if (gameSel > GAMES.length - 1) gameSel = Math.max(GAMES.length - 1, 0);
  });
  $effect(() => {
    if (cmgnetSel > cmgnetVisible.length - 1) cmgnetSel = Math.max(cmgnetVisible.length - 1, 0);
  });

  // Auto-focus the BYOD button when entering the empty PSX screen so gamepad
  // A can click it. Note: browsers require a *user* gesture to open the native
  // file picker — gamepad input doesn't count. Focusing means a real keyboard
  // Enter on a USB keyboard will trigger the picker; programmatic .click()
  // from gamepad polling will be silently denied in some browsers.
  $effect(() => {
    if (screen !== 'psx' || psxGames.length !== 0) return;
    queueMicrotask(() => { try { psxByodBtnEl?.focus(); } catch (_) {} });
  });

  $effect(() => {
    if (screen !== 'saturn' || saturnGames.length !== 0) return;
    queueMicrotask(() => { try { saturnByodBtnEl?.focus(); } catch (_) {} });
  });

  let currentGame = $derived(GAMES[gameSel]);
  let currentTg16 = $derived(tg16Games[tg16Sel]);
  let currentArcade = $derived(arcadeGames[arcadeSel]);
  let currentPsx = $derived(psxGames[psxSel]);
  let currentSaturn = $derived(saturnGames[saturnSel]);
  // undefined when nesSel is on the pinned BYOC row (index === nesGames.length).
  let currentNes = $derived(nesGames[nesSel]);
  let onNesByocRow = $derived(nesSel >= nesGames.length);
  let currentDemo = $derived(DEMOS[demosSel]);
  let currentCmgnet = $derived(cmgnetVisible[cmgnetSel]);
  let clockShort = $derived(clockStr.slice(0, 5));
  let counterText = $derived(
    String(gameSel + 1).padStart(2, '0') + ' / ' + String(GAMES.length).padStart(2, '0')
  );
  let tg16CounterText = $derived(
    tg16Games.length === 0
      ? '00 / 00'
      : String(tg16Sel + 1).padStart(2, '0') + ' / ' + String(tg16Games.length).padStart(2, '0')
  );
  let arcadeCounterText = $derived(
    arcadeGames.length === 0
      ? '00 / 00'
      : String(arcadeSel + 1).padStart(2, '0') + ' / ' + String(arcadeGames.length).padStart(2, '0')
  );
  let psxCounterText = $derived(
    psxGames.length === 0
      ? '00 / 00'
      : String(psxSel + 1).padStart(2, '0') + ' / ' + String(psxGames.length).padStart(2, '0')
  );
  let saturnCounterText = $derived(
    saturnGames.length === 0
      ? '00 / 00'
      : String(saturnSel + 1).padStart(2, '0') + ' / ' + String(saturnGames.length).padStart(2, '0')
  );
  let nesCounterText = $derived(
    onNesByocRow
      ? 'BYOC'
      : String(nesSel + 1).padStart(2, '0') + ' / ' + String(nesGames.length).padStart(2, '0')
  );
  let demosCounterText = $derived(
    String(demosSel + 1).padStart(2, '0') + ' / ' + String(DEMOS.length).padStart(2, '0')
  );
  let cmgnetCounterText = $derived(
    cmgnetVisible.length === 0
      ? '00 / 00'
      : String(cmgnetSel + 1).padStart(2, '0') + ' / ' + String(cmgnetVisible.length).padStart(2, '0')
  );

  // WebAudio blips
  let ac = null;
  function getAc() {
    if (!ac) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return null;
      ac = new Ctor();
    }
    return ac;
  }
  function blip(freq = 440, dur = 0.07, type = 'square', vol = 0.06) {
    try {
      const a = getAc(); if (!a) return;
      if (a.state === 'suspended') a.resume();
      const o = a.createOscillator(), g = a.createGain();
      o.type = type; o.frequency.value = freq;
      g.gain.value = 0; o.connect(g); g.connect(a.destination);
      const t = a.currentTime;
      g.gain.linearRampToValueAtTime(vol, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.start(t); o.stop(t + dur + 0.02);
    } catch (e) { /* ignore */ }
  }
  const sfx = {
    nav:   () => blip(540, 0.05, 'square', 0.05),
    enter: () => { blip(660, 0.07, 'square', 0.06); setTimeout(() => blip(990, 0.10, 'square', 0.05), 60); },
    back:  () => { blip(440, 0.06, 'square', 0.05); setTimeout(() => blip(330, 0.08, 'square', 0.05), 50); },
    boot:  () => { blip(220, 0.12, 'sawtooth', 0.04); setTimeout(() => blip(440, 0.15, 'sawtooth', 0.04), 120); setTimeout(() => blip(880, 0.25, 'sawtooth', 0.04), 280); },
  };

  function initial(name) {
    const s = name.replace(/[^A-Z0-9]/gi, '').slice(0, 2).toUpperCase();
    return s || '··';
  }

  function pickMenu(idx) {
    const m = MAIN_MENU[idx];
    sfx.enter();
    menuSel = idx;
    if (m.id === 'games') {
      screen = 'games';
    } else {
      const el = menuEls[idx];
      if (el?.animate) {
        el.animate(
          [
            { transform: 'translateX(0)' },
            { transform: 'translateX(-1.2%)' },
            { transform: 'translateX(1.2%)' },
            { transform: 'translateX(0)' },
          ],
          { duration: 280, easing: 'ease-out' }
        );
      }
      sfx.back();
    }
  }

  function goBack() {
    sfx.back();
    if (screen === 'arcade' || screen === 'tg16' || screen === 'nes' || screen === 'psx' || screen === 'saturn' || screen === 'demos' || screen === 'cmgnet') screen = 'games';
    else screen = 'dashboard';
  }

  // Footer A/B are <div>s, not <button>s, so a touchscreen tap doesn't reliably
  // produce a synthesized click — the onclick never fires on the Steam Deck
  // touchscreen. Bind pointerup instead (fires uniformly for touch, pen, and
  // mouse) and call preventDefault so no late synthesized click double-fires
  // the handler. Returns a handler bound to the given action.
  function tapHandler(action) {
    return (e) => {
      e.preventDefault();
      action();
    };
  }

  function launchGame(id) {
    if (id === TG16_ID) {
      sfx.enter();
      screen = 'tg16';
      return;
    }
    if (id === ARCADE_ID) {
      sfx.enter();
      screen = 'arcade';
      return;
    }
    if (id === PSX_ID) {
      sfx.enter();
      screen = 'psx';
      return;
    }
    if (id === SATURN_ID) {
      sfx.enter();
      screen = 'saturn';
      return;
    }
    if (id === NES_ID) {
      sfx.enter();
      screen = 'nes';
      return;
    }
    if (id === DEMOS_ID) {
      sfx.enter();
      screen = 'demos';
      return;
    }
    if (id === CMGNET_ID) {
      sfx.enter();
      screen = 'cmgnet';
      return;
    }
    // A graduated CMG Network install lives in this list too — run it from cache
    // via launchCmgnet (which handles its own sfx / stream / cache logic).
    const netItem = GAMES.find((g) => g.id === id && g.__cmgnet);
    if (netItem) { launchCmgnet(netItem); return; }
    sfx.enter();
    chromeDismissed = false;
    // In-repo games carry an explicit `url` (Fresh route); everything else is
    // served externally from easierbycode.com keyed by `id`. Resolve in-repo
    // URLs against the origin the manifest came from, so a launcher on an older
    // binary still loads a newly-added in-repo game from the deploy; offline it
    // falls back to its embedded same-origin copy.
    const item = GAMES.find((g) => g.id === id);
    initTwinStick(id, item);
    if (item && item.url) {
      gameSrc = manifestOrigin ? new URL(item.url, manifestOrigin).href : item.url;
    } else {
      gameSrc = 'https://easierbycode.com/' + id;
    }
    setTimeout(() => { gameOn = true; }, 30);
  }

  function launchDemo(url) {
    if (!url) return;
    sfx.enter();
    chromeDismissed = false;
    // Resolve against the manifest origin (like launchGame) so a newly-added
    // demo loads from the deploy on an existing launcher binary. The demo page
    // stays co-origin with the /api/ws-goofy relay either way (goofy connects to
    // location.host), so multiplayer keeps working over the deploy's relay.
    gameSrc = manifestOrigin ? new URL(url, manifestOrigin).href : url;
    setTimeout(() => { gameOn = true; }, 30);
  }

  function launchTg16(file) {
    if (!file) return;
    sfx.enter();
    chromeDismissed = false;
    gameSrc = '/turbografx16/play.html?rom=' + encodeURIComponent(file);
    setTimeout(() => { gameOn = true; }, 30);
  }

  function launchArcade(game) {
    if (!game?.file) return;
    sfx.enter();
    chromeDismissed = false;
    const params = new URLSearchParams({ rom: game.file });
    if (Array.isArray(game.bios) && game.bios.length) params.set('bios', game.bios.join(','));
    gameSrc = '/arcade/play.html?' + params.toString();
    setTimeout(() => { gameOn = true; }, 30);
  }

  function launchPsx(file) {
    if (!file) return;
    sfx.enter();
    chromeDismissed = false;
    gameSrc = '/psx/play.html?rom=' + encodeURIComponent(file);
    setTimeout(() => { gameOn = true; }, 30);
  }

  function launchSaturn(file) {
    if (!file) return;
    sfx.enter();
    chromeDismissed = false;
    gameSrc = '/saturn/play.html?rom=' + encodeURIComponent(file);
    setTimeout(() => { gameOn = true; }, 30);
  }

  function launchNes(file) {
    if (!file) return;
    sfx.enter();
    chromeDismissed = false;
    gameSrc = '/nes/play.html?rom=' + encodeURIComponent(file);
    setTimeout(() => { gameOn = true; }, 30);
  }

  // ─── CMG Network (e-shop: stream first, then run offline from cache) ────────
  // Catalog lives in /codemonkey.json (this repo). First launch streams the
  // hosted build (game.streamUrl) and kicks off a background download of the zip
  // (game.downloadUrl), unzipped + cached under /cmg-net/<id>/… and served back
  // offline by static/cmg-sw.js. Later launches run straight from that cache.
  const CMG_CACHE = 'cmg-net-v1';

  // Where index.html lands inside the cached tree (the zip keeps its own folder,
  // e.g. ryu/index.html). `entry` wins; else derive from `subdir`.
  function cmgnetEntry(game) {
    if (game?.entry) return game.entry;
    const sub = game?.subdir;
    return sub && sub !== 'root' ? sub + '/index.html' : 'index.html';
  }

  async function cmgnetIsCached(game) {
    if (!game) return false;
    try {
      const cache = await caches.open(CMG_CACHE);
      return !!(await cache.match('/cmg-net/' + game.id + '/' + cmgnetEntry(game)));
    } catch (_e) {
      return false;
    }
  }

  function cmgMime(path) {
    const ext = (path.split('.').pop() || '').toLowerCase();
    const map = {
      html: 'text/html; charset=utf-8', js: 'text/javascript; charset=utf-8',
      mjs: 'text/javascript; charset=utf-8', json: 'application/json; charset=utf-8',
      wasm: 'application/wasm', css: 'text/css; charset=utf-8',
      png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif',
      webp: 'image/webp', svg: 'image/svg+xml', ico: 'image/x-icon',
      mp3: 'audio/mpeg', ogg: 'audio/ogg', wav: 'audio/wav',
      ttf: 'font/ttf', woff: 'font/woff', woff2: 'font/woff2',
    };
    return map[ext] || 'application/octet-stream';
  }

  // JSZip is loaded on demand from the CDN (only when a download runs) via a
  // <script> tag, so the unzip dependency never enters the esbuild bundle.
  let jszipPromise = null;
  function loadJsZip() {
    if (window.JSZip) return Promise.resolve(window.JSZip);
    if (jszipPromise) return jszipPromise;
    jszipPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
      s.onload = () => resolve(window.JSZip);
      s.onerror = () => { jszipPromise = null; reject(new Error('JSZip failed to load')); };
      document.head.appendChild(s);
    });
    return jszipPromise;
  }

  async function cmgnetDownload(game, { force = false } = {}) {
    if (!game?.downloadUrl) return;
    const id = game.id;
    // `force` (used by Update) re-downloads even when already cached.
    if (!force && (cmgnetStatus[id]?.downloading || cmgnetStatus[id]?.cached)) return;
    cmgnetStatus[id] = { downloading: true, pct: 0, cached: false, error: '', updateAvailable: false };
    try {
      const JSZip = await loadJsZip();
      const res = await fetch(game.downloadUrl, { mode: 'cors' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      // Stream the body so we can show real download progress (0–80%).
      const total = Number(res.headers.get('content-length')) || 0;
      const reader = res.body.getReader();
      const chunks = [];
      let received = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        if (total) cmgnetStatus[id] = { downloading: true, pct: Math.round((received / total) * 80), cached: false, error: '' };
      }
      // Unzip + cache each file under /cmg-net/<id>/… (80–100%).
      const zip = await JSZip.loadAsync(new Blob(chunks));
      const cache = await caches.open(CMG_CACHE);
      const names = Object.keys(zip.files).filter((n) => !zip.files[n].dir);
      let i = 0;
      for (const name of names) {
        let body = await zip.files[name].async('uint8array');
        // Godot self-registers a cross-origin-isolation SW when this flag is on;
        // it conflicts with cmg-sw and a cached iframe can't be cross-origin
        // isolated anyway (the top launcher isn't), so turn it off — the cached
        // game runs single-threaded.
        if (/\.html$/i.test(name)) {
          const text = new TextDecoder().decode(body)
            .replace(/"ensureCrossOriginIsolationHeaders"\s*:\s*true/g, '"ensureCrossOriginIsolationHeaders":false');
          body = new TextEncoder().encode(text);
        }
        await cache.put('/cmg-net/' + id + '/' + name, new Response(body, { headers: { 'Content-Type': cmgMime(name) } }));
        i++;
        cmgnetStatus[id] = { downloading: true, pct: 80 + Math.round((i / names.length) * 20), cached: false, error: '' };
      }
      // This title is about to leave the (cached-filtered) CMG Network list. If
      // it sat above the cursor, decrement so the cursor stays on the same game
      // instead of having a different row slide silently under it.
      const removingIdx = cmgnetVisible.findIndex((g) => g.id === id);
      if (removingIdx !== -1 && removingIdx < cmgnetSel) cmgnetSel = Math.max(cmgnetSel - 1, 0);
      cmgnetStatus[id] = { downloading: false, pct: 100, cached: true, error: '', updateAvailable: false };
      // Record the commit this build came from, so a later check can tell when a
      // newer one is available on GitHub. Only meaningful for source-tracked games.
      if (game.source === 'github') {
        const sha = await cmgnetLatestSha(game);
        if (sha) { await cmgnetWriteSha(id, sha); cmgnetStatus[id] = { ...cmgnetStatus[id], installedSha: sha }; }
      }
    } catch (e) {
      cmgnetStatus[id] = { downloading: false, pct: 0, cached: false, error: String((e && e.message) || e) };
    }
  }

  // Launch the selected e-shop game from its locally-cached copy.
  function playCmgnet(game) {
    gameSrc = '/cmg-net/' + game.id + '/' + cmgnetEntry(game);
    setTimeout(() => { gameOn = true; }, 30);
  }
  // ─── Music app sidebar (CMG Network kind:'music') ──────────────────────────
  function musicUrl(app) {
    return app?.streamUrl || app?.url || (app?.id ? 'https://easierbycode.com/' + app.id : null);
  }
  // Open a music app in the docked sidebar. Deliberately does NOT touch
  // gameSrc/gameOn, so a game already on screen keeps running and receiving
  // input underneath while the music app plays in parallel.
  function openMusic(app) {
    const url = musicUrl(app);
    if (!url) return;
    sfx.enter();
    musicId = app.id;
    musicTitle = app.title || app.name || 'MUSIC';
    musicSrc = url;
    musicOpen = true;
  }
  function closeMusic() {
    if (!musicOpen) return;
    musicOpen = false;
    sfx.back();
    // Keep the iframe mounted through the slide-out, then drop it so its audio
    // stops (mirrors the .game-iframe unmount delay). Guard against a reopen
    // during the slide-out clobbering the freshly-opened app.
    const closingId = musicId;
    setTimeout(() => {
      if (!musicOpen && musicId === closingId) { musicSrc = null; musicId = null; }
    }, 350);
  }
  function launchCmgnet(game) {
    if (!game) return;
    // Music apps open in the parallel sidebar overlay, not the full-screen frame,
    // and never stream/download/cache like a normal e-shop title.
    if (game.kind === 'music') { openMusic(game); return; }
    sfx.enter();
    chromeDismissed = false;
    initTwinStick(game.id, game);
    if (cmgnetStatus[game.id]?.cached) {
      // Already downloaded — served from Cache Storage by cmg-sw.js.
      playCmgnet(game);
    } else if (game.streamUrl) {
      // First play with a hosted build: stream it now and cache the zip in the
      // background so the next launch runs offline.
      gameSrc = game.streamUrl;
      setTimeout(() => { gameOn = true; }, 30);
      cmgnetDownload(game);
    } else {
      // No hosted stream — download the build locally first (progress shows on
      // the row), then play it from cache.
      cmgnetDownload(game).then(() => { if (cmgnetStatus[game.id]?.cached) playCmgnet(game); });
    }
  }

  // Throttle uninstalls: the currentGame-based entry points (gamepad X, keyboard
  // Delete — which auto-repeats when held — and the footer chip) act on whatever
  // row is selected, and an uninstall re-derives the Games list under the cursor.
  // A short cooldown stops a held key or double-tap from cascading onto the row
  // that slides into place.
  let lastUninstallTs = 0;

  // Uninstall a graduated network game: drop every cached file under
  // /cmg-net/<id>/, then reconcile its status with what's actually left in the
  // cache, so it leaves the Games list and reappears in CMG Network.
  async function cmgnetUninstall(game) {
    if (!game) return;
    const now = Date.now();
    if (now - lastUninstallTs < 400) return;
    lastUninstallTs = now;
    const id = game.id;
    const prefix = '/cmg-net/' + id + '/';
    try {
      const cache = await caches.open(CMG_CACHE);
      const keys = await cache.keys();
      await Promise.all(
        keys
          .filter((req) => {
            // req.url is the stored Request's absolute (percent-encoded) URL;
            // decode the pathname so the match holds even if id/filenames carried
            // characters the URL parser would have escaped.
            try { return decodeURIComponent(new URL(req.url).pathname).startsWith(prefix); }
            catch (_e) { return false; }
          })
          .map((req) => cache.delete(req))
      );
    } catch (_e) {
      // Best-effort purge; the cache re-check below decides the listing.
    }
    // Reflect the cache's real state instead of assuming success: only de-list
    // if the game's entry is actually gone. A failed/partial purge keeps it
    // shown as installed, so it can't vanish now and reappear on next launch
    // (where loadCmgnetList would re-detect the leftover cache).
    const stillCached = await cmgnetIsCached(game);
    const next = { ...cmgnetStatus };
    if (stillCached) next[id] = { downloading: false, pct: 100, cached: true, error: 'uninstall failed' };
    else delete next[id];
    cmgnetStatus = next;
    sfx.back();
  }

  async function loadCmgnetList() {
    // Deploy-origin-first, same-origin fallback — same OTA shape as loadManifest.
    const tryFetch = async (base) => {
      const r = await fetch(base + '/codemonkey.json?ts=' + Date.now(), { cache: 'no-store' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const data = await r.json();
      const games = Array.isArray(data) ? data : (Array.isArray(data?.games) ? data.games : null);
      if (!games) throw new Error('bad catalog');
      return games;
    };
    let games = null;
    try { games = await tryFetch(DEPLOY_ORIGIN); }
    catch (_e1) { try { games = await tryFetch(''); } catch (_e2) { return; } }
    cmgnetGames = games;
    if (cmgnetSel >= cmgnetGames.length) cmgnetSel = 0;
    // Reflect already-downloaded games as INSTALLED in the e-shop, restoring the
    // commit each was installed at so update checks have a baseline.
    for (const g of games) {
      if (await cmgnetIsCached(g)) {
        const installedSha = await cmgnetReadSha(g.id);
        cmgnetStatus[g.id] = { downloading: false, pct: 100, cached: true, error: '', installedSha };
      }
    }
    // Then ask GitHub (in the background, non-blocking) whether a newer build
    // exists for each installed source-controlled game. Offline / rate-limited
    // checks just leave the game showing INSTALLED.
    for (const g of games) {
      if (cmgnetStatus[g.id]?.cached && g.source === 'github') cmgnetCheckUpdate(g);
    }
  }

  // --- CMG Network: GitHub-backed updates ------------------------------------
  // "Is there a newer build?" is answered by the game repo's latest commit on its
  // branch. cmgnetDownload records the sha it installed (as a cached marker file);
  // cmgnetCheckUpdate compares that to GitHub's current sha and flags
  // updateAvailable; cmgnetUpdate wipes the cached files and re-downloads.
  function cmgnetRepo(game) {
    // Accept a full URL (https://github.com/owner/repo[.git]) or owner/repo.
    const raw = (game?.repo || '').trim().replace(/\.git$/, '');
    if (!raw) return null;
    const m = raw.match(/(?:github\.com[/:])?([^/\s]+)\/([^/\s]+)\/?$/);
    return m ? { owner: m[1], repo: m[2] } : null;
  }
  const cmgnetShaKey = (id) => '/cmg-net/' + id + '/.cmg-sha';
  async function cmgnetReadSha(id) {
    try {
      const cache = await caches.open(CMG_CACHE);
      const r = await cache.match(cmgnetShaKey(id));
      return r ? (await r.text()).trim() : null;
    } catch (_e) { return null; }
  }
  async function cmgnetWriteSha(id, sha) {
    try {
      const cache = await caches.open(CMG_CACHE);
      await cache.put(cmgnetShaKey(id), new Response(sha || '', { headers: { 'Content-Type': 'text/plain' } }));
    } catch (_e) { /* ignore */ }
  }
  // Latest commit sha for the game's branch. The vnd.github.sha media type makes
  // the response body the bare sha string (cheap, no JSON parse). Returns null on
  // any failure (offline, 404, rate limit) so callers can no-op gracefully.
  async function cmgnetLatestSha(game) {
    const r = cmgnetRepo(game);
    if (!r) return null;
    const branch = game.branch || 'main';
    try {
      const res = await fetch(
        'https://api.github.com/repos/' + r.owner + '/' + r.repo + '/commits/' + encodeURIComponent(branch),
        { headers: { 'Accept': 'application/vnd.github.sha' }, cache: 'no-store' },
      );
      if (!res.ok) return null;
      const sha = (await res.text()).trim();
      return /^[0-9a-f]{7,40}$/i.test(sha) ? sha : null;
    } catch (_e) { return null; }
  }
  async function cmgnetCheckUpdate(game) {
    if (!game || game.source !== 'github') return;
    const id = game.id;
    if (!cmgnetStatus[id]?.cached) return;        // only installed games can update
    const installed = cmgnetStatus[id]?.installedSha ?? await cmgnetReadSha(id);
    const latest = await cmgnetLatestSha(game);
    if (!latest) return;                          // offline / rate-limited — leave as-is
    // Only flag an update when we know what's installed AND it differs. A missing
    // baseline (installed before sha tracking) stays INSTALLED to avoid false
    // "update available" prompts.
    cmgnetStatus[id] = { ...cmgnetStatus[id], latestSha: latest, updateAvailable: !!installed && installed !== latest };
  }
  async function cmgnetUpdate(game) {
    if (!game) return;
    const id = game.id;
    if (cmgnetStatus[id]?.downloading) return;
    sfx.enter();
    // Wipe the game's cached files (including the sha marker) so the fresh build
    // fully replaces the old one, then re-download.
    try {
      const cache = await caches.open(CMG_CACHE);
      const keys = await cache.keys();
      await Promise.all(
        keys.filter((req) => new URL(req.url).pathname.startsWith('/cmg-net/' + id + '/'))
            .map((req) => cache.delete(req)),
      );
    } catch (_e) { /* ignore */ }
    cmgnetStatus[id] = { downloading: false, pct: 0, cached: false, error: '', updateAvailable: false };
    await cmgnetDownload(game, { force: true });
    // If this game is currently on screen, reload it from the refreshed cache.
    if (cmgnetStatus[id]?.cached && typeof gameSrc === 'string' && gameSrc.startsWith('/cmg-net/' + id + '/')) {
      const iframe = document.getElementById('gameframe');
      try { if (iframe) iframe.src = '/cmg-net/' + id + '/' + cmgnetEntry(game); } catch (_e) { /* ignore */ }
    }
  }

  function registerCmgSw() {
    if (!('serviceWorker' in navigator)) return;
    try { navigator.serviceWorker.register('/cmg-sw.js'); } catch (_e) {}
  }

  async function loadManifest() {
    // OTA launcher content (games + demos). Prefer the deployed manifest (so a
    // launcher binary learns about newly-added games/demos over the network),
    // then the same-origin copy (the web app, and an offline launcher's embedded
    // fallback), else keep the baked seeds. Deployed-URL-first, like boot-entry.js.
    const asList = (v) => (Array.isArray(v) ? v : null);
    const tryFetch = async (base) => {
      const r = await fetch(base + '/games.manifest.json?ts=' + Date.now(), { cache: 'no-store' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const data = await r.json();
      // Accept { games, demos } or a bare games array (older manifest shape).
      const games = asList(data) || asList(data && data.games);
      if (!games || !games.length) throw new Error('empty manifest');
      const demos = asList(data && data.demos) || [];
      return { games, demos, base };
    };
    let res = null;
    try {
      res = await tryFetch(DEPLOY_ORIGIN);
    } catch (_e1) {
      try {
        res = await tryFetch('');
      } catch (_e2) {
        return; // both sources failed — keep the baked-in seeds
      }
    }
    manifestOrigin = res.base;
    // Write the backing $state; GAMES is a $derived that appends installedCmgnet
    // and SUBMENUS. (Assigning GAMES directly would only set a transient derived
    // override that the next cmgnetStatus change discards — reverting to seed.)
    manifestGames = res.games;
    if (res.demos.length) DEMOS = res.demos;
    if (gameSel >= GAMES.length) gameSel = 0;
    if (demosSel >= DEMOS.length) demosSel = 0;
  }

  async function loadTg16List() {
    try {
      // The manifest is generated at build time by scripts/build-tg16-manifest.ts
      // and served as a plain static file (works on Deno Deploy where the source
      // tree isn't readable via Deno.readDir from a runtime handler).
      const r = await fetch('/TurboGrafx-16/manifest.json');
      if (!r.ok) return;
      const list = await r.json();
      tg16Games = Array.isArray(list) ? list : [];
      if (tg16Sel >= tg16Games.length) tg16Sel = 0;
    } catch (_e) {
      tg16Games = [];
    }
  }

  async function loadArcadeList() {
    try {
      const r = await fetch('/arcade/manifest.json');
      if (!r.ok) return;
      const list = await r.json();
      arcadeGames = Array.isArray(list) ? list : [];
      if (arcadeSel >= arcadeGames.length) arcadeSel = 0;
    } catch (_e) {
      arcadeGames = [];
    }
  }

  async function loadPsxList() {
    try {
      const r = await fetch('/PlayStation/manifest.json');
      if (!r.ok) return;
      const list = await r.json();
      psxGames = Array.isArray(list) ? list : [];
      if (psxSel >= psxGames.length) psxSel = 0;
    } catch (_e) {
      psxGames = [];
    }
  }

  async function loadSaturnList() {
    try {
      const r = await fetch('/SegaSaturn/manifest.json');
      if (!r.ok) return;
      const list = await r.json();
      saturnGames = Array.isArray(list) ? list : [];
      if (saturnSel >= saturnGames.length) saturnSel = 0;
    } catch (_e) {
      saturnGames = [];
    }
  }

  async function loadNesList() {
    try {
      const r = await fetch('/Nintendo/manifest.json');
      if (!r.ok) return;
      const list = await r.json();
      nesGames = Array.isArray(list) ? list : [];
      // The BYOC row sits at index nesGames.length, so that is the valid max.
      if (nesSel > nesGames.length) nesSel = 0;
    } catch (_e) {
      nesGames = [];
    }
  }

  // BYOD — Bring Your Own Disc.
  //
  // The user can upload PSX images via the file input that appears when the
  // PlayStation list is empty. We hand EmulatorJS a real File object (rather
  // than a blob URL) because EmulatorJS uses `file.name` to detect the format
  // — a blob URL has no extension, which makes pcsx_rearmed reject the data
  // as an unknown format.
  //
  // Single-file formats (.pbp / .chd / .iso / lone .bin) pass through directly.
  // Multi-file uploads (.cue + .bin, or .m3u + .cue + .bin) get bundled into a
  // STORE-mode zip in-browser; EmulatorJS extracts the zip into its in-memory
  // FS so the libretro core finds every track.
  function basename(p) { return String(p).split(/[\\/]/).pop() || ''; }

  function refsInCue(text) {
    const out = [];
    const re = /^\s*FILE\s+(?:"([^"]+)"|(\S+))/gim;
    let m;
    while ((m = re.exec(text)) !== null) out.push(m[1] || m[2]);
    return out;
  }
  function refsInM3u(text) {
    return text.split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#'));
  }

  // Minimal STORE-mode (uncompressed) ZIP writer. Files are bundled at the
  // archive root with their original basenames so a .cue's `FILE "track.bin"`
  // reference resolves once EmulatorJS extracts everything.
  const CRC_TABLE = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) c = (c >>> 1) ^ (0xEDB88320 & -(c & 1));
      t[i] = c >>> 0;
    }
    return t;
  })();
  function crc32(bytes) {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i++) c = (c >>> 8) ^ CRC_TABLE[(c ^ bytes[i]) & 0xFF];
    return (c ^ 0xFFFFFFFF) >>> 0;
  }
  function makeStoreZip(entries /* [{ name, data: Uint8Array }] */) {
    const enc = new TextEncoder();
    const localHeaders = [];
    const centralEntries = [];
    let offset = 0;
    for (const e of entries) {
      const nameBytes = enc.encode(e.name);
      const c = crc32(e.data);
      const lfh = new Uint8Array(30 + nameBytes.length);
      const lv = new DataView(lfh.buffer);
      lv.setUint32(0, 0x04034b50, true);
      lv.setUint16(4, 0x14, true);
      lv.setUint16(6, 0, true);
      lv.setUint16(8, 0, true);          // method = store
      lv.setUint16(10, 0, true);
      lv.setUint16(12, 0x21, true);      // date = 1980-01-01
      lv.setUint32(14, c, true);
      lv.setUint32(18, e.data.length, true);
      lv.setUint32(22, e.data.length, true);
      lv.setUint16(26, nameBytes.length, true);
      lv.setUint16(28, 0, true);
      lfh.set(nameBytes, 30);
      localHeaders.push(lfh, e.data);

      const cdh = new Uint8Array(46 + nameBytes.length);
      const cv = new DataView(cdh.buffer);
      cv.setUint32(0, 0x02014b50, true);
      cv.setUint16(4, 0x14, true);
      cv.setUint16(6, 0x14, true);
      cv.setUint16(8, 0, true);
      cv.setUint16(10, 0, true);
      cv.setUint16(12, 0, true);
      cv.setUint16(14, 0x21, true);
      cv.setUint32(16, c, true);
      cv.setUint32(20, e.data.length, true);
      cv.setUint32(24, e.data.length, true);
      cv.setUint16(28, nameBytes.length, true);
      cv.setUint16(30, 0, true);
      cv.setUint16(32, 0, true);
      cv.setUint16(34, 0, true);
      cv.setUint16(36, 0, true);
      cv.setUint32(38, 0, true);
      cv.setUint32(42, offset, true);
      cdh.set(nameBytes, 46);
      centralEntries.push(cdh);

      offset += lfh.length + e.data.length;
    }
    const cdSize = centralEntries.reduce((s, c) => s + c.length, 0);
    const cdOffset = offset;
    const eocd = new Uint8Array(22);
    const ev = new DataView(eocd.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(8, entries.length, true);
    ev.setUint16(10, entries.length, true);
    ev.setUint32(12, cdSize, true);
    ev.setUint32(16, cdOffset, true);
    ev.setUint16(20, 0, true);
    return new Blob([...localHeaders, ...centralEntries, eocd], { type: 'application/zip' });
  }

  async function handleByodFiles(files) {
    psxByodError = '';
    const list = Array.from(files || []);
    if (list.length === 0) return;

    const byName = new Map();
    for (const f of list) byName.set(basename(f.name).toLowerCase(), f);

    // Pick the primary entry — prefer m3u, then cue, then pbp/chd/iso, then bin.
    const order = [/\.m3u$/i, /\.cue$/i, /\.pbp$/i, /\.chd$/i, /\.iso$/i, /\.bin$/i];
    let main = null;
    for (const re of order) {
      main = list.find((f) => re.test(f.name));
      if (main) break;
    }
    if (!main) {
      psxByodError = 'Pick a .pbp, .chd, .iso, .cue (+ .bin), or .m3u file.';
      return;
    }

    // Validate companion files referenced by m3u/cue are also in the upload.
    const missing = [];
    try {
      if (/\.m3u$/i.test(main.name)) {
        const m3uText = await main.text();
        const cueRefs = refsInM3u(m3uText);
        if (cueRefs.length === 0) missing.push('(m3u has no disc entries)');
        for (const ref of cueRefs) {
          const cueFile = byName.get(basename(ref).toLowerCase());
          if (!cueFile) { missing.push(ref); continue; }
          const cueText = await cueFile.text();
          for (const r of refsInCue(cueText)) {
            if (!byName.has(basename(r).toLowerCase())) missing.push(r);
          }
        }
      } else if (/\.cue$/i.test(main.name)) {
        const cueText = await main.text();
        for (const r of refsInCue(cueText)) {
          if (!byName.has(basename(r).toLowerCase())) missing.push(r);
        }
      }
    } catch (e) {
      psxByodError = 'Could not parse files: ' + (e && e.message ? e.message : e);
      return;
    }
    if (missing.length > 0) {
      psxByodError = 'Missing companion files for ' + main.name + ': ' +
        missing.slice(0, 4).join(', ') +
        (missing.length > 4 ? `, +${missing.length - 4} more` : '') +
        '. Re-select with all referenced files.';
      return;
    }

    // Resolve to a single File EmulatorJS can ingest:
    //   - Single-file formats → pass through unchanged so file.name keeps its extension.
    //   - Multi-file → bundle into a STORE-mode zip; EmulatorJS extracts it.
    const isMulti = /\.(m3u|cue)$/i.test(main.name);
    let psxFile;
    try {
      if (!isMulti) {
        psxFile = main;
      } else {
        const entries = [];
        // Place the entry file (m3u/cue) first so EmulatorJS picks it as the boot file.
        entries.push({ name: main.name, data: new Uint8Array(await main.arrayBuffer()) });
        for (const [key, file] of byName) {
          if (key === main.name.toLowerCase()) continue;
          entries.push({ name: file.name, data: new Uint8Array(await file.arrayBuffer()) });
        }
        const zipBlob = makeStoreZip(entries);
        const zipName = main.name.replace(/\.[^.]+$/, '.zip');
        psxFile = new File([zipBlob], zipName, { type: 'application/zip' });
      }
    } catch (e) {
      psxByodError = 'Could not bundle files: ' + (e && e.message ? e.message : e);
      return;
    }

    // Stash the File on window so play.html (same-origin iframe) can read it
    // directly. EmulatorJS accepts a File for EJS_gameUrl and uses file.name
    // to detect the ROM format.
    try {
      window.__psxByodFile = psxFile;
      sessionStorage.setItem('psx-byod', JSON.stringify({ name: main.name.replace(/\.[^.]+$/, '') }));
    } catch (e) {
      psxByodError = 'BYOD handoff failed: ' + (e && e.message ? e.message : e);
      return;
    }

    sfx.enter();
    chromeDismissed = false;
    gameSrc = '/psx/play.html?byod=1';
    setTimeout(() => { gameOn = true; }, 30);
  }

  function onByodChange(e) {
    const input = e.currentTarget;
    handleByodFiles(input.files);
    // Allow re-picking the same set after a cancel by clearing the value.
    setTimeout(() => { try { input.value = ''; } catch (_) {} }, 0);
  }

  function openByodPicker() {
    // Click the visible button (rather than the hidden input) so the activation
    // context is anchored to a user-visible element. Falls back to the input.
    try { psxByodBtnEl?.click(); return; } catch (_) {}
    try { psxFileInput?.click(); } catch (_) {}
  }

  // Saturn BYOD — a copy of the PSX path (Saturn shares PSX's disc formats, so
  // the format-agnostic helpers above — basename/refsInCue/refsInM3u/makeStoreZip
  // — are reused as-is). Only the handoff (global, session key, gameSrc) differs.
  async function handleSaturnByodFiles(files) {
    saturnByodError = '';
    const list = Array.from(files || []);
    if (list.length === 0) return;

    const byName = new Map();
    for (const f of list) byName.set(basename(f.name).toLowerCase(), f);

    // Pick the primary entry — prefer m3u, then cue, then chd/iso, then bin.
    const order = [/\.m3u$/i, /\.cue$/i, /\.chd$/i, /\.iso$/i, /\.bin$/i];
    let main = null;
    for (const re of order) {
      main = list.find((f) => re.test(f.name));
      if (main) break;
    }
    if (!main) {
      saturnByodError = 'Pick a .chd, .iso, .cue (+ .bin), or .m3u file.';
      return;
    }

    // Validate companion files referenced by m3u/cue are also in the upload.
    const missing = [];
    try {
      if (/\.m3u$/i.test(main.name)) {
        const m3uText = await main.text();
        const cueRefs = refsInM3u(m3uText);
        if (cueRefs.length === 0) missing.push('(m3u has no disc entries)');
        for (const ref of cueRefs) {
          const cueFile = byName.get(basename(ref).toLowerCase());
          if (!cueFile) { missing.push(ref); continue; }
          const cueText = await cueFile.text();
          for (const r of refsInCue(cueText)) {
            if (!byName.has(basename(r).toLowerCase())) missing.push(r);
          }
        }
      } else if (/\.cue$/i.test(main.name)) {
        const cueText = await main.text();
        for (const r of refsInCue(cueText)) {
          if (!byName.has(basename(r).toLowerCase())) missing.push(r);
        }
      }
    } catch (e) {
      saturnByodError = 'Could not parse files: ' + (e && e.message ? e.message : e);
      return;
    }
    if (missing.length > 0) {
      saturnByodError = 'Missing companion files for ' + main.name + ': ' +
        missing.slice(0, 4).join(', ') +
        (missing.length > 4 ? `, +${missing.length - 4} more` : '') +
        '. Re-select with all referenced files.';
      return;
    }

    // Single-file formats pass through; multi-file get zipped (see handleByodFiles).
    const isMulti = /\.(m3u|cue)$/i.test(main.name);
    let saturnFile;
    try {
      if (!isMulti) {
        saturnFile = main;
      } else {
        const entries = [];
        entries.push({ name: main.name, data: new Uint8Array(await main.arrayBuffer()) });
        for (const [key, file] of byName) {
          if (key === main.name.toLowerCase()) continue;
          entries.push({ name: file.name, data: new Uint8Array(await file.arrayBuffer()) });
        }
        const zipBlob = makeStoreZip(entries);
        const zipName = main.name.replace(/\.[^.]+$/, '.zip');
        saturnFile = new File([zipBlob], zipName, { type: 'application/zip' });
      }
    } catch (e) {
      saturnByodError = 'Could not bundle files: ' + (e && e.message ? e.message : e);
      return;
    }

    try {
      window.__saturnByodFile = saturnFile;
      sessionStorage.setItem('saturn-byod', JSON.stringify({ name: main.name.replace(/\.[^.]+$/, '') }));
    } catch (e) {
      saturnByodError = 'BYOD handoff failed: ' + (e && e.message ? e.message : e);
      return;
    }

    sfx.enter();
    chromeDismissed = false;
    gameSrc = '/saturn/play.html?byod=1';
    setTimeout(() => { gameOn = true; }, 30);
  }

  function onSaturnByodChange(e) {
    const input = e.currentTarget;
    handleSaturnByodFiles(input.files);
    setTimeout(() => { try { input.value = ''; } catch (_) {} }, 0);
  }

  function openSaturnByodPicker() {
    try { saturnByodBtnEl?.click(); return; } catch (_) {}
    try { saturnFileInput?.click(); } catch (_) {}
  }

  // BYOC — Bring Your Own Cartridge (NES).
  //
  // NES cartridges are single-file ROMs (.nes / .fds / .unif / a lone .zip), so
  // unlike the PSX/Saturn disc path there is nothing to bundle: we hand the
  // chosen File straight to play.html. EmulatorJS accepts a File for
  // EJS_gameUrl and reads file.name to detect the format. Available even when
  // preloaded ROMs exist (the BYOC row is pinned after the list).
  async function handleByocFiles(files) {
    nesByocError = '';
    const list = Array.from(files || []);
    if (list.length === 0) return;

    const order = [/\.nes$/i, /\.fds$/i, /\.unif$/i, /\.unf$/i, /\.zip$/i];
    let main = null;
    for (const re of order) {
      main = list.find((f) => re.test(f.name));
      if (main) break;
    }
    if (!main) {
      nesByocError = 'Pick a .nes (or .fds / .unif / .zip) cartridge file.';
      return;
    }

    // Stash the File on window so play.html (same-origin iframe) can read it in
    // its own realm via the postMessage handoff (see onWindowMessage).
    try {
      window.__nesByocFile = main;
      sessionStorage.setItem('nes-byoc', JSON.stringify({ name: main.name.replace(/\.[^.]+$/, '') }));
    } catch (e) {
      nesByocError = 'BYOC handoff failed: ' + (e && e.message ? e.message : e);
      return;
    }

    sfx.enter();
    chromeDismissed = false;
    gameSrc = '/nes/play.html?byoc=1';
    setTimeout(() => { gameOn = true; }, 30);
  }

  function onByocChange(e) {
    const input = e.currentTarget;
    handleByocFiles(input.files);
    // Allow re-picking the same file after a cancel by clearing the value.
    setTimeout(() => { try { input.value = ''; } catch (_) {} }, 0);
  }

  function openByocPicker() {
    try { nesFileInput?.click(); } catch (_) {}
  }

  function closeGame() {
    // TG16 persists a save state on exit. Ask the iframe to snapshot, then hold
    // the unmount until it acks (tg16-save-state-done) so removing the iframe
    // can't abort a slow IndexedDB write — capped so a missing ack never wedges
    // the unmount, and floored at 500ms so the fade-out still plays. Other
    // consoles ignore the message and just use the fade delay.
    const wasTg16 = typeof gameSrc === 'string' && gameSrc.startsWith('/turbografx16/');
    let unmounted = false;
    const unmount = () => { if (!unmounted) { unmounted = true; gameSrc = null; } };
    if (wasTg16) {
      let acked = false, faded = false;
      const onAck = (e) => {
        if ((e.data || {}).type !== 'tg16-save-state-done') return;
        window.removeEventListener('message', onAck);
        acked = true;
        if (faded) unmount();
      };
      window.addEventListener('message', onAck);
      // Send while the iframe is still mounted with id="gameframe" — setting
      // gameOn=false below reactively drops that id, so post first.
      postToGameframe('tg16-save-state');
      setTimeout(() => { faded = true; if (acked) unmount(); }, 500);
      // Hard cap: unmount even if the ack never arrives (e.g. write failed).
      setTimeout(() => { window.removeEventListener('message', onAck); unmount(); }, 3000);
    } else {
      setTimeout(unmount, 500);
    }
    gameOn = false;
    controlsShown = false;
    chromeDismissed = false;
    // Drop the prior game's advertised cheats; the next game re-broadcasts its
    // own on boot. closeGame is the single chokepoint between games (the list
    // is only reachable when no game is on), so this alone prevents stale carry-over.
    osdCheats = [];
    osdPlugins = [];
    osdActions = [];
    twinStickAvail = false;
    twinStickOn = false;
    twinGameId = null;
    twinStickUserSet = false;
    try { delete window.__psxByodFile; } catch (_) {}
    try { sessionStorage.removeItem('psx-byod'); } catch (_) {}
    try { delete window.__saturnByodFile; } catch (_) {}
    try { sessionStorage.removeItem('saturn-byod'); } catch (_) {}
    try { delete window.__nesByocFile; } catch (_) {}
    try { sessionStorage.removeItem('nes-byoc'); } catch (_) {}
    // A music app deliberately OUTLIVES the game it was opened over: exiting the
    // game leaves the sidebar playing (back at the menu, and on into the next
    // game) until it's closed explicitly (✕, the Guide toggle, or B/Esc off-game).
    sfx.back();
  }

  function postToGameframe(type) {
    const iframe = document.getElementById('gameframe');
    try { iframe?.contentWindow?.postMessage({ type }, window.location.origin); } catch (_e) { /* ignore */ }
  }

  function onIconError(e, name) {
    const img = e.currentTarget;
    const parent = img.parentNode;
    if (parent) parent.innerHTML = '<span class="ph">' + initial(name) + '</span>';
  }

  let clockTimer;
  let bootTimer;
  let padRaf = null;
  const padSeenBtns = new Set();
  const padSeenAxes = new Set();

  // ?paddebug=1 — on-screen gamepad monitor for devices without devtools
  // (handhelds, TVs). Shows the browser's RAW pad state alongside the
  // compat-plugin-normalized view, so quirky button/axis layouts can be
  // reported from the couch.
  const padDebugOn = typeof location !== 'undefined' && /[?&]paddebug=1/.test(location.search);
  let padDebugText = $state('');

  function padDebugTick() {
    if (!padDebugOn) return;
    const fmt = (p, tag) => {
      if (!p) return null;
      const btns = [];
      for (let i = 0; i < p.buttons.length; i++) if (p.buttons[i]?.pressed) btns.push(i);
      const axs = [];
      for (let i = 0; i < p.axes.length; i++) {
        const v = p.axes[i];
        if (typeof v === 'number' && Math.abs(v) > 0.2) axs.push(`${i}:${v.toFixed(2)}`);
      }
      return `${tag} #${p.index} map:${p.mapping || '""'} b:${p.buttons.length} a:${p.axes.length}\n` +
        `  pressed:[${btns.join(',')}] axes:[${axs.join(' ')}]\n  ${(p.id || '').slice(0, 48)}`;
    };
    const lines = [];
    try {
      for (const p of (window.CMGGamepadCompat?.raw?.() || [])) {
        const s = fmt(p, 'RAW ');
        if (s) lines.push(s);
      }
    } catch (_) { /* ignore */ }
    try {
      for (const p of ((navigator.getGamepads && navigator.getGamepads()) || [])) {
        const s = fmt(p, 'NORM');
        if (s) lines.push(s);
      }
    } catch (_) { /* ignore */ }
    padDebugText = lines.join('\n') || 'no pads detected';
  }
  const padState = {
    btn: new Set(),
    axisDir: 0,
    lastNavAt: 0,
    // Hold-to-repeat feel: long enough that a deliberate single tap (which
    // often lasts 300ms+) never auto-repeats, then a steady scroll.
    initialDelayMs: 400,
    repeatMs: 150,
    holdingSince: 0,
    comboLatched: false,
    dirSeenAt: 0,
    lastPollAt: 0,
  };
  const PAD_DEADZONE = 0.55;
  const SNES_PAD_RE = /SNES Controller|Nintendo.*SNES|057e.{0,8}2017/i;
  const XBOX_PAD_RE = /Xbox|XInput|Microsoft|Legion Go/i;

  function padPriority(p) {
    const id = p?.id || '';
    if (SNES_PAD_RE.test(id)) return 3;
    if (XBOX_PAD_RE.test(id)) return 2;
    return 1;
  }

  function pickPrimaryPad(pads) {
    let best = null;
    let bestScore = -1;
    for (const p of pads) {
      if (!p?.connected) continue;
      const score = padPriority(p);
      if (score > bestScore) {
        best = p;
        bestScore = score;
      }
    }
    return best;
  }

  function decodePadHat(v) {
    const none = { up: false, down: false, left: false, right: false };
    if (typeof v !== 'number' || v < -1.05 || v > 1.05) return none;
    // Only accept values on the hat's 8-step grid — 0 (an untouched axis on
    // some stacks) sits between steps and would decode as a phantom "down".
    const scaled = (v + 1) * 3.5;
    if (Math.abs(scaled - Math.round(scaled)) > 0.25) return none;
    const pos = Math.round(scaled);
    const labels = ['up', 'upright', 'right', 'downright', 'down', 'downleft', 'left', 'upleft'];
    const d = labels[pos] || '';
    return {
      up: d === 'up' || d === 'upright' || d === 'upleft',
      down: d === 'down' || d === 'downright' || d === 'downleft',
      left: d === 'left' || d === 'downleft' || d === 'upleft',
      right: d === 'right' || d === 'upright' || d === 'downright',
    };
  }

  function readPadDirs(pad) {
    const dirs = { up: false, down: false, left: false, right: false };
    if (!pad) return dirs;
    const btn = (i) => !!pad.buttons[i]?.pressed;
    // SNES pads: the compat plugin rebuilds 12-15 from the hat, and the raw
    // slots past 15 can hold Select/Start on some platforms — reading them as
    // a D-pad turns Select/Start into phantom up/down presses.
    const isSnes = SNES_PAD_RE.test(pad?.id || '');
    dirs.up = btn(12) || (!isSnes && (btn(16) || btn(18) || btn(20)));
    dirs.down = btn(13) || (!isSnes && (btn(17) || btn(19) || btn(21)));
    dirs.left = btn(14);
    dirs.right = btn(15);
    const ax = pad.axes || [];
    if (typeof ax[6] === 'number' && Math.abs(ax[6]) <= 1.05) {
      if (ax[6] <= -PAD_DEADZONE) dirs.left = true;
      else if (ax[6] >= PAD_DEADZONE) dirs.right = true;
    }
    if (typeof ax[7] === 'number' && Math.abs(ax[7]) <= 1.05) {
      if (ax[7] <= -PAD_DEADZONE) dirs.up = true;
      else if (ax[7] >= PAD_DEADZONE) dirs.down = true;
    }
    const hat = decodePadHat(ax[9]);
    dirs.up ||= hat.up; dirs.down ||= hat.down; dirs.left ||= hat.left; dirs.right ||= hat.right;
    return dirs;
  }

  function navUp() {
    if (screen === 'dashboard') menuSel = Math.max(menuSel - 1, 0);
    else if (screen === 'games') gameSel = Math.max(gameSel - 1, 0);
    else if (screen === 'arcade') arcadeSel = Math.max(arcadeSel - 1, 0);
    else if (screen === 'tg16') tg16Sel = Math.max(tg16Sel - 1, 0);
    else if (screen === 'psx') psxSel = Math.max(psxSel - 1, 0);
    else if (screen === 'saturn') saturnSel = Math.max(saturnSel - 1, 0);
    else if (screen === 'nes') nesSel = Math.max(nesSel - 1, 0);
    else if (screen === 'demos') demosSel = Math.max(demosSel - 1, 0);
    else if (screen === 'cmgnet') cmgnetSel = Math.max(cmgnetSel - 1, 0);
    sfx.nav();
  }
  function navDown() {
    if (screen === 'dashboard') menuSel = Math.min(menuSel + 1, MAIN_MENU.length - 1);
    else if (screen === 'games') gameSel = Math.min(gameSel + 1, GAMES.length - 1);
    else if (screen === 'arcade') arcadeSel = Math.min(arcadeSel + 1, Math.max(arcadeGames.length - 1, 0));
    else if (screen === 'tg16') tg16Sel = Math.min(tg16Sel + 1, Math.max(tg16Games.length - 1, 0));
    else if (screen === 'psx') psxSel = Math.min(psxSel + 1, Math.max(psxGames.length - 1, 0));
    else if (screen === 'saturn') saturnSel = Math.min(saturnSel + 1, Math.max(saturnGames.length - 1, 0));
    else if (screen === 'nes') nesSel = Math.min(nesSel + 1, nesGames.length);
    else if (screen === 'demos') demosSel = Math.min(demosSel + 1, Math.max(DEMOS.length - 1, 0));
    else if (screen === 'cmgnet') cmgnetSel = Math.min(cmgnetSel + 1, Math.max(cmgnetVisible.length - 1, 0));
    sfx.nav();
  }
  function navTop() {
    if (screen === 'dashboard') menuSel = 0;
    else if (screen === 'games') gameSel = 0;
    else if (screen === 'arcade') arcadeSel = 0;
    else if (screen === 'tg16') tg16Sel = 0;
    else if (screen === 'psx') psxSel = 0;
    else if (screen === 'saturn') saturnSel = 0;
    else if (screen === 'nes') nesSel = 0;
    else if (screen === 'demos') demosSel = 0;
    else if (screen === 'cmgnet') cmgnetSel = 0;
    sfx.nav();
  }
  function navBottom() {
    if (screen === 'dashboard') menuSel = MAIN_MENU.length - 1;
    else if (screen === 'games') gameSel = GAMES.length - 1;
    else if (screen === 'arcade') arcadeSel = Math.max(arcadeGames.length - 1, 0);
    else if (screen === 'tg16') tg16Sel = Math.max(tg16Games.length - 1, 0);
    else if (screen === 'psx') psxSel = Math.max(psxGames.length - 1, 0);
    else if (screen === 'saturn') saturnSel = Math.max(saturnGames.length - 1, 0);
    else if (screen === 'nes') nesSel = nesGames.length;
    else if (screen === 'demos') demosSel = Math.max(DEMOS.length - 1, 0);
    else if (screen === 'cmgnet') cmgnetSel = Math.max(cmgnetVisible.length - 1, 0);
    sfx.nav();
  }
  function actA() {
    if (gameOn) return;
    if (screen === 'dashboard') pickMenu(menuSel);
    else if (screen === 'games') launchGame(GAMES[gameSel].id);
    else if (screen === 'arcade') launchArcade(arcadeGames[arcadeSel]);
    else if (screen === 'tg16') launchTg16(tg16Games[tg16Sel]?.file);
    else if (screen === 'psx') {
      if (psxGames.length === 0) openByodPicker();
      else launchPsx(psxGames[psxSel]?.file);
    }
    else if (screen === 'saturn') {
      if (saturnGames.length === 0) openSaturnByodPicker();
      else launchSaturn(saturnGames[saturnSel]?.file);
    }
    else if (screen === 'nes') {
      if (onNesByocRow) openByocPicker();
      else launchNes(nesGames[nesSel]?.file);
    }
    else if (screen === 'demos') launchDemo(DEMOS[demosSel]?.url);
    else if (screen === 'cmgnet') launchCmgnet(cmgnetVisible[cmgnetSel]);
  }
  function actB() {
    if (gameOn) closeGame();
    // A music sidebar opened from the catalog (no game running) closes on B — its
    // only gamepad close path off-game, since the Guide (which owns the in-game
    // toggle) isn't reachable without a game. Closes the topmost overlay first.
    else if (musicOpen) closeMusic();
    else if (screen === 'games' || screen === 'arcade' || screen === 'tg16' || screen === 'nes' || screen === 'psx' || screen === 'saturn' || screen === 'demos' || screen === 'cmgnet') goBack();
  }
  // CMG Network only: pull the latest build from GitHub for the selected game,
  // when one is installed and an update was detected.
  // Update a graduated network game in the Games list when a newer build is
  // available (installed games now live there, not in CMG Network).
  function actUpdate() {
    if (gameOn || screen !== 'games') return;
    const g = currentGame;
    if (g && g.__cmgnet && cmgnetStatus[g.id]?.updateAvailable) cmgnetUpdate(g);
  }

  // Custom gamepad polling drives dashboard nav (vertical). When a game iframe
  // is active, body.playing is set and the launcher's gamepad-support.js takes
  // over and dispatches keys into iframe#gameframe — we yield to it.
  function pollPad() {
    padRaf = requestAnimationFrame(pollPad);
    padDebugTick();
    const pads = (navigator.getGamepads && navigator.getGamepads()) || [];
    let pad = pickPrimaryPad(pads);
    if (gameOn) {
      // While a game is up we yield input to gamepad-support.js (it dispatches
      // keys into #gameframe). Here we only watch for the OSD open-chord, and
      // drive OSD navigation while it's open — body.osd-open makes
      // gamepad-support yield, so these presses don't leak into the game.
      padState.axisDir = 0;
      if (softmodOn) { padState.btn.clear(); padState.comboLatched = false; osdNav.vDir = 0; osdNav.hDir = 0; return; }
      if (!pad) { padState.btn.clear(); padState.comboLatched = false; osdNav.vDir = 0; osdNav.hDir = 0; return; }
      const pressedNow = new Set();
      pad.buttons.forEach((btn, i) => { if (btn?.pressed) pressedNow.add(i); });
      const justPressed = (i) => pressedNow.has(i) && !padState.btn.has(i);

      if (osdOpen) {
        // Vertical: D-pad 12/13 or left-stick Y → move selection (edge-latched).
        const dirs = readPadDirs(pad);
        const nowOsd = performance.now();
        let v = 0;
        if (dirs.up) v = -1;
        else if (dirs.down) v = 1;
        else { const ay = pad.axes[1] ?? 0; if (ay < -PAD_DEADZONE) v = -1; else if (ay > PAD_DEADZONE) v = 1; }
        // Same bounce/dropout filter as the launcher-list nav: hold the last
        // direction through sub-80ms neutral blips so a bouncy D-pad doesn't
        // move the selection several rows per tap.
        if (v === 0 && osdNav.vDir !== 0 && nowOsd - (osdNav.vSeenAt || 0) < 80) v = osdNav.vDir;
        if (v !== 0) osdNav.vSeenAt = nowOsd;
        if (v !== 0 && v !== osdNav.vDir) {
          osdSel = Math.max(0, Math.min(osdItems.length - 1, osdSel + v));
          sfx.nav();
        }
        osdNav.vDir = v;
        // Horizontal: D-pad 14/15 or left-stick X → adjust the focused control.
        let h = 0;
        if (dirs.left) h = -1;
        else if (dirs.right) h = 1;
        else { const ax = pad.axes[0] ?? 0; if (ax < -PAD_DEADZONE) h = -1; else if (ax > PAD_DEADZONE) h = 1; }
        if (h === 0 && osdNav.hDir !== 0 && nowOsd - (osdNav.hSeenAt || 0) < 80) h = osdNav.hDir;
        if (h !== 0) osdNav.hSeenAt = nowOsd;
        if (h !== 0 && h !== osdNav.hDir) adjustOsd(osdSel, h);
        osdNav.hDir = h;
        if (justPressed(0)) activateOsd(osdSel);              // A
        else if (justPressed(1) || justPressed(8)) osdBack(); // B or Select (Cheats → root → close)
        padState.btn = pressedNow;
        return;
      }

      // OSD closed: SELECT + Down opens it (SELECT + R is the SNES-adapter
      // fallback for pads whose D-pad isn't recognized).
      const dirs = readPadDirs(pad);
      const selectBtn = !!pad.buttons[8]?.pressed;
      const rShoulder = !!pad.buttons[5]?.pressed;
      const dpadDown = dirs.down;
      const ayDown = (pad.axes[1] ?? 0) > PAD_DEADZONE;
      const combo = selectBtn && (dpadDown || ayDown || rShoulder);
      if (combo && !padState.comboLatched) { padState.comboLatched = true; openOsd(); }
      else if (!combo) padState.comboLatched = false;
      osdNav.vDir = 0; osdNav.hDir = 0;
      padState.btn = pressedNow;
      return;
    }
    if (!pad) { padState.btn.clear(); padState.axisDir = 0; if (padConnected) padConnected = false; return; }
    if (!padConnected) padConnected = true;
    if (!padHadConnection) {
      padHadConnection = true;
      try { getAc()?.resume(); } catch (_) {}
      // One-shot diagnostic: log mapping/axes/button counts so non-standard
      // controllers (SNES → USB adapters, etc.) can be debugged remotely.
      try {
        console.log('[pad] connected:', pad.id, 'mapping:', pad.mapping,
          'axes:', pad.axes.length, 'buttons:', pad.buttons.length);
      } catch (_) {}
    }

    // Diagnostic: log the first time each individual button is pressed and
    // each individual axis crosses out of neutral, so we can see exactly which
    // indices a quirky browser/controller is using for D-pad. Capped per index
    // so a held button doesn't spam the console.
    for (let i = 0; i < pad.buttons.length; i++) {
      if (pad.buttons[i]?.pressed && !padSeenBtns.has(i)) {
        padSeenBtns.add(i);
        try { console.log(`[pad] button ${i} pressed`); } catch (_) {}
      }
    }
    for (let i = 0; i < pad.axes.length; i++) {
      const v = pad.axes[i];
      if (typeof v !== 'number') continue;
      // 0.4 * deadzone catches mild analog drift / partial D-pad pushes.
      // Cap at 1.05 to ignore "no input" sentinels like 1.28.
      if (Math.abs(v) > PAD_DEADZONE * 0.4 && Math.abs(v) <= 1.05 && !padSeenAxes.has(i)) {
        padSeenAxes.add(i);
        try { console.log(`[pad] axes[${i}] active, value=${v.toFixed(3)}`); } catch (_) {}
      }
    }

    const now = performance.now();
    // Detect vertical input across as many layouts as we've seen:
    //   - Standard mapping: D-pad on buttons 12 / 13.
    //   - Firefox non-standard: D-pad often shifts past the face buttons
    //     (button indices 16-19, or different ordering).
    //   - Analog stick Y on axes[1] (or axes[3] / axes[5] on some pads).
    //   - axes[7]: digital -1/0/+1 D-pad Y on some adapters.
    //   - axes[9]: encoded hat switch on others.
    // SNES pads: trust only the plugin-normalized 12/13 — the raw slots past
    // 15 can hold Select/Start on some platforms, which made Select/Start
    // scroll the launcher.
    const isSnesPad = SNES_PAD_RE.test(pad?.id || '');
    const upButtonIdxs = isSnesPad ? [12] : [12, 16, 18, 20];
    const downButtonIdxs = isSnesPad ? [13] : [13, 17, 19, 21];
    const dpadUp = upButtonIdxs.some((i) => !!pad.buttons[i]?.pressed);
    const dpadDown = downButtonIdxs.some((i) => !!pad.buttons[i]?.pressed);
    let dir = 0;
    if (dpadUp) dir = -1;
    else if (dpadDown) dir = 1;
    if (dir === 0) {
      // Iterate candidate Y axes — bail on the first one that's clearly off-neutral.
      const yAxes = [1, 3, 5, 7];
      for (const i of yAxes) {
        const v = pad.axes[i];
        if (typeof v !== 'number') continue;
        if (Math.abs(v) > 1.05) continue; // neutral sentinel (e.g. 1.28)
        if (v < -PAD_DEADZONE) { dir = -1; break; }
        if (v > PAD_DEADZONE) { dir = 1; break; }
      }
    }
    if (dir === 0) {
      // Hat-switch decode via the shared grid-validated decoder — a raw
      // angle read here decoded an untouched axes[9] of exactly 0 as a
      // constant "down".
      const hat = decodePadHat(pad.axes[9]);
      if (hat.up) dir = -1;
      else if (hat.down) dir = 1;
    }

    // Bounce/dropout filter: a one-or-two-frame neutral blip in the middle of
    // a press (contact bounce, or duplicate pad entries alternating state)
    // re-fires the edge nav, which reads as several presses per tap. Hold the
    // last direction through sub-80ms dropouts so only a real release
    // re-arms the edge.
    if (dir === 0 && padState.axisDir !== 0 && now - padState.dirSeenAt < 80) {
      dir = padState.axisDir;
    }
    if (dir !== 0) padState.dirSeenAt = now;

    // A stalled frame (heavy re-render, tab jank) can make one tap look like a
    // long hold: the next poll arrives with heldFor already past the repeat
    // threshold and fires a phantom repeat. Restart hold timing after any gap
    // long enough that the intervening pad state was unobserved.
    const frameGap = now - (padState.lastPollAt || now);
    padState.lastPollAt = now;
    if (frameGap > 200) padState.holdingSince = now;

    if (dir !== 0 && dir !== padState.axisDir) {
      // Edge-triggered nav, rate-limited: bounce trains with gaps past the
      // dropout window otherwise land as several distinct edges per tap.
      if (now - padState.lastNavAt >= 150 || padState.lastNavAt === 0) {
        if (dir < 0) navUp(); else navDown();
        padState.lastNavAt = now;
      }
      padState.holdingSince = now;
    } else if (dir !== 0 && dir === padState.axisDir) {
      const heldFor = now - padState.holdingSince;
      const sinceLast = now - padState.lastNavAt;
      if (heldFor >= padState.initialDelayMs && sinceLast >= padState.repeatMs) {
        if (dir < 0) navUp(); else navDown();
        padState.lastNavAt = now;
      }
    }
    padState.axisDir = dir;

    const pressedNow = new Set();
    pad.buttons.forEach((btn, i) => { if (btn?.pressed) pressedNow.add(i); });
    const justPressed = (i) => pressedNow.has(i) && !padState.btn.has(i);
    if (justPressed(0) || justPressed(9)) actA();   // A or Start
    if (justPressed(1) || justPressed(8)) actB();   // B or Back/Select
    // X — uninstall a graduated network game from the Games list.
    if (justPressed(2) && screen === 'games' && currentGame?.__cmgnet) cmgnetUninstall(currentGame);
    if (justPressed(3)) actUpdate();                // Y — update a graduated game (when one is available)
    // Shoulder/trigger navigation — fallback when D-pad isn't recognized
    // (e.g. Firefox + non-standard SNES adapters). Safe for SNES pads too:
    // the compat plugin guarantees normalized 6/7 are either real L2/R2
    // triggers or cleared (the joydev layout's Select/Start move to 8/9).
    if (justPressed(5)) navDown();                  // R shoulder
    if (justPressed(4)) navUp();                    // L shoulder
    if (justPressed(7)) navBottom();                // R2 — jump to bottom
    if (justPressed(6)) navTop();                   // L2 — jump to top
    padState.btn = pressedNow;
  }

  function unlockAudio() { try { getAc()?.resume(); } catch (e) { /* ignore */ } }

  function onKey(e) {
    if (gameOn) {
      if (osdOpen) {
        // Keyboard nav of the OSD (mirrors the gamepad mapping).
        if (e.key === 'ArrowDown') { osdSel = Math.min(osdSel + 1, osdItems.length - 1); sfx.nav(); e.preventDefault(); }
        else if (e.key === 'ArrowUp') { osdSel = Math.max(osdSel - 1, 0); sfx.nav(); e.preventDefault(); }
        else if (e.key === 'ArrowLeft') { adjustOsd(osdSel, -1); e.preventDefault(); }
        else if (e.key === 'ArrowRight') { adjustOsd(osdSel, 1); e.preventDefault(); }
        else if (e.key === 'Enter' || e.key === ' ') { activateOsd(osdSel); e.preventDefault(); }
        else if (e.key === 'Escape' || e.key === 'Backspace' || e.key === 'b' || e.key === 'B' || e.code === 'Backquote' || e.key === '`' || e.key === '~') { osdBack(); e.preventDefault(); }
        return;
      }
      // The ` / ~ key (Backquote) and Escape open the OSD — a keyboard stand-in
      // for the SELECT + Down gamepad chord, usable when no gamepad is detected
      // (e.g. Flatpak Chrome under Steam). play.html posts tg16-toggle-controls
      // back when the game iframe holds focus instead.
      if (e.code === 'Backquote' || e.key === '`' || e.key === '~' || e.keyCode === 192 || e.key === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        openOsd();
        return;
      }
      return;
    }
    // Off-game, a music sidebar (opened from the catalog) closes on Esc / B /
    // Backspace before any screen navigation — the topmost overlay goes first.
    if (musicOpen && (e.key === 'Escape' || e.key === 'Backspace' || e.key === 'b' || e.key === 'B')) {
      closeMusic(); e.preventDefault(); return;
    }
    if (screen === 'dashboard') {
      if (e.key === 'ArrowDown') { menuSel = Math.min(menuSel + 1, MAIN_MENU.length - 1); sfx.nav(); }
      else if (e.key === 'ArrowUp') { menuSel = Math.max(menuSel - 1, 0); sfx.nav(); }
      else if (e.key === 'Enter' || e.key === ' ') pickMenu(menuSel);
    } else if (screen === 'games') {
      if (e.key === 'ArrowDown') { gameSel = Math.min(gameSel + 1, GAMES.length - 1); sfx.nav(); }
      else if (e.key === 'ArrowUp') { gameSel = Math.max(gameSel - 1, 0); sfx.nav(); }
      else if (e.key === 'Enter' || e.key === ' ') launchGame(GAMES[gameSel].id);
      else if (e.key === 'Delete' && currentGame?.__cmgnet) cmgnetUninstall(currentGame);
      else if ((e.key === 'u' || e.key === 'U') && currentGame?.__cmgnet) actUpdate();
      else if (e.key === 'Escape' || e.key === 'Backspace' || e.key === 'b' || e.key === 'B' || e.key === 'c' || e.key === 'C') goBack();
    } else if (screen === 'arcade') {
      if (e.key === 'ArrowDown') { arcadeSel = Math.min(arcadeSel + 1, Math.max(arcadeGames.length - 1, 0)); sfx.nav(); }
      else if (e.key === 'ArrowUp') { arcadeSel = Math.max(arcadeSel - 1, 0); sfx.nav(); }
      else if (e.key === 'Enter' || e.key === ' ') launchArcade(arcadeGames[arcadeSel]);
      else if (e.key === 'Escape' || e.key === 'Backspace' || e.key === 'b' || e.key === 'B' || e.key === 'c' || e.key === 'C') goBack();
    } else if (screen === 'tg16') {
      if (e.key === 'ArrowDown') { tg16Sel = Math.min(tg16Sel + 1, Math.max(tg16Games.length - 1, 0)); sfx.nav(); }
      else if (e.key === 'ArrowUp') { tg16Sel = Math.max(tg16Sel - 1, 0); sfx.nav(); }
      else if (e.key === 'Enter' || e.key === ' ') launchTg16(tg16Games[tg16Sel]?.file);
      else if (e.key === 'Escape' || e.key === 'Backspace' || e.key === 'b' || e.key === 'B' || e.key === 'c' || e.key === 'C') goBack();
    } else if (screen === 'psx') {
      if (e.key === 'ArrowDown') { psxSel = Math.min(psxSel + 1, Math.max(psxGames.length - 1, 0)); sfx.nav(); }
      else if (e.key === 'ArrowUp') { psxSel = Math.max(psxSel - 1, 0); sfx.nav(); }
      else if (e.key === 'Enter' || e.key === ' ') {
        if (psxGames.length === 0) openByodPicker();
        else launchPsx(psxGames[psxSel]?.file);
      }
      else if (e.key === 'Escape' || e.key === 'Backspace' || e.key === 'b' || e.key === 'B' || e.key === 'c' || e.key === 'C') goBack();
    } else if (screen === 'saturn') {
      if (e.key === 'ArrowDown') { saturnSel = Math.min(saturnSel + 1, Math.max(saturnGames.length - 1, 0)); sfx.nav(); }
      else if (e.key === 'ArrowUp') { saturnSel = Math.max(saturnSel - 1, 0); sfx.nav(); }
      else if (e.key === 'Enter' || e.key === ' ') {
        if (saturnGames.length === 0) openSaturnByodPicker();
        else launchSaturn(saturnGames[saturnSel]?.file);
      }
      else if (e.key === 'Escape' || e.key === 'Backspace' || e.key === 'b' || e.key === 'B' || e.key === 'c' || e.key === 'C') goBack();
    } else if (screen === 'nes') {
      if (e.key === 'ArrowDown') { nesSel = Math.min(nesSel + 1, nesGames.length); sfx.nav(); }
      else if (e.key === 'ArrowUp') { nesSel = Math.max(nesSel - 1, 0); sfx.nav(); }
      else if (e.key === 'Enter' || e.key === ' ') {
        if (onNesByocRow) openByocPicker();
        else launchNes(nesGames[nesSel]?.file);
      }
      else if (e.key === 'Escape' || e.key === 'Backspace' || e.key === 'b' || e.key === 'B' || e.key === 'c' || e.key === 'C') goBack();
    } else if (screen === 'demos') {
      if (e.key === 'ArrowDown') { demosSel = Math.min(demosSel + 1, Math.max(DEMOS.length - 1, 0)); sfx.nav(); }
      else if (e.key === 'ArrowUp') { demosSel = Math.max(demosSel - 1, 0); sfx.nav(); }
      else if (e.key === 'Enter' || e.key === ' ') launchDemo(DEMOS[demosSel]?.url);
      else if (e.key === 'Escape' || e.key === 'Backspace' || e.key === 'b' || e.key === 'B' || e.key === 'c' || e.key === 'C') goBack();
    } else if (screen === 'cmgnet') {
      if (e.key === 'ArrowDown') { cmgnetSel = Math.min(cmgnetSel + 1, Math.max(cmgnetVisible.length - 1, 0)); sfx.nav(); }
      else if (e.key === 'ArrowUp') { cmgnetSel = Math.max(cmgnetSel - 1, 0); sfx.nav(); }
      else if (e.key === 'Enter' || e.key === ' ') launchCmgnet(cmgnetVisible[cmgnetSel]);
      else if (e.key === 'Escape' || e.key === 'Backspace' || e.key === 'b' || e.key === 'B' || e.key === 'c' || e.key === 'C') goBack();
    }
  }

  // Inject a capture-phase OSD-trigger forwarder INTO a same-origin game frame.
  // Once a game grabs keyboard focus the launcher's own window listener goes
  // deaf, so a listener living inside the frame is the only thing that still
  // sees ` / ~ / Esc. EmulatorJS frames (isTg16Game) already self-forward via
  // play.html — skip them to avoid a double toggle. Cross-origin frames (e.g.
  // monkey-kombat on easierbycode.com) throw on contentWindow access and are
  // skipped here; those forward the key by postMessage instead (see below).
  function injectOsdKeyForwarder(e) {
    const iframe = e?.currentTarget || document.getElementById('gameframe');
    if (!iframe || isTg16Game) return;
    // Origin pre-check (see frameIsSameOrigin): probing a cross-origin frame
    // throws a catchable error but still logs a console "Blocked a frame …".
    if (!frameIsSameOrigin(iframe)) return;
    try {
      const w = iframe.contentWindow;
      if (!w || w.__cmgOsdForwarder) return;
      w.__cmgOsdForwarder = true;
      w.addEventListener('keydown', (ev) => {
        if (ev.code === 'Backquote' || ev.key === '`' || ev.key === '~' || ev.keyCode === 192 || ev.key === 'Escape') {
          ev.preventDefault();
          ev.stopImmediatePropagation();
          if (osdOpen) closeOsd(); else openOsd();
        }
      }, true);
    } catch (_) { /* cross-origin frame — can't inject; it must postMessage instead */ }
  }

  // The soft-mod cinematic overlay (same-origin /demos/softmod) posts this when
  // its simulated reboot finishes — close the overlay (the "rebooted" console).
  function onSoftmodMessage(e) {
    if (!softmodOn) return;
    const frame = document.getElementById('softmodframe');
    if (!frame || e.source !== frame.contentWindow) return;
    if (e?.data?.type === 'softmod-done') closeSoftmod();
  }

  function onWindowMessage(e) {
    // Identify our own mounted game frame by window reference. That comparison
    // holds even for a cross-origin game (window identities compare across
    // origins) — unlike the origin string — which lets a cross-origin game
    // (e.g. monkey-kombat) forward its OSD key here. A page we didn't mount
    // can't be e.source, so this alone is a strong guard for benign signals.
    const iframe = document.querySelector('.game-iframe iframe');
    if (!iframe || e.source !== iframe.contentWindow) return;
    const sameOrigin = !e.origin || e.origin === window.location.origin;
    const d = e?.data || {};
    // Benign, idempotent UI signals — safe to honor from our own frame at any
    // origin (worst case the Guide menu just opens).
    if (d.type === 'tg16-toggle-controls') {
      // ` / ~ inside the focused game frame (see play.html / the snippet a
      // cross-origin game posts) — toggle the OSD so the in-game menu (incl.
      // Exit) stays reachable even when no gamepad is seen.
      if (osdOpen) closeOsd(); else openOsd();
      return;
    }
    if (d.type === 'tg16-first-touch') { chromeDismissed = true; return; }
    if (d.type === 'cmg-cheats') {
      // The running game advertises the boot-time URL-param cheats it honours,
      // which the Guide turns into a Cheats submenu. Benign — worst case it
      // shows toggles that reload the same game — so accept it from our own
      // frame at any origin (like tg16-toggle-controls). Payload is sanitized.
      osdCheats = sanitizeCheats(d.cheats);
      return;
    }
    if (d.type === 'cmg-plugins') {
      // The running game advertises the live toggles it supports, which the
      // Guide renders inline as a Plugins section. Benign — worst case it shows
      // a toggle whose cmg-plugin-set reply the game ignores — so accept it from
      // our own frame at any origin (like cmg-cheats). Payload is sanitized.
      // Unlike cheats (whose value is re-derived from the iframe URL each render),
      // a plugin's value is held here, so the OSD is its source of truth after
      // boot. Preserve the current value for any id we already track and take the
      // game-advertised value only for new ids — that way a re-advertise (boot
      // re-broadcast, scene restart) can't silently revert a user's toggle.
      const prev = new Map(osdPlugins.map((p) => [p.id, p.value]));
      osdPlugins = sanitizePlugins(d.plugins).map((p) =>
        prev.has(p.id) ? { ...p, value: prev.get(p.id) } : p
      );
      return;
    }
    if (d.type === 'cmg-twinstick') {
      // The running game advertises Twin-Stick support (optionally with a
      // default). Benign — worst case a toggle appears whose effect the game
      // ignores — so accept it from our own frame at any origin, like
      // cmg-cheats. A saved per-game choice or an in-session user toggle
      // always wins over the advertised default.
      twinStickAvail = true;
      if (!twinStickUserSet) {
        let on = d.default !== false;
        try {
          const saved = twinGameId ? localStorage.getItem(twinStickKey(twinGameId)) : null;
          if (saved !== null) on = saved === '1';
        } catch (_) { /* ignore */ }
        twinStickOn = on;
      }
      applyTwinStick();
      return;
    }
    if (d.type === 'cmg-actions') {
      // The running game advertises momentary OSD buttons (e.g. "Controls"),
      // which the Guide renders inline in the Game section. Benign — worst case
      // it shows a button whose cmg-action reply the game ignores — so accept it
      // from our own frame at any origin (like cmg-plugins). Payload is sanitized.
      osdActions = sanitizeActions(d.actions);
      return;
    }
    // Sensitive actions — closing the game and BYOD disc-file transfer — stay
    // same-origin only; never honor them from a cross-origin frame.
    if (!sameOrigin) return;
    if (d.type === 'tg16-exit') closeGame();
    else if (d.type === 'psx-byod-ready') {
      // Send the BYOD disc File over to the play iframe via structured clone
      // so EmulatorJS receives a same-realm File (its `instanceof File` check
      // would fail for a cross-realm reference).
      const file = window.__psxByodFile;
      if (!file) return;
      let name = file.name.replace(/\.[^.]+$/, '');
      try {
        const raw = sessionStorage.getItem('psx-byod');
        if (raw) name = JSON.parse(raw).name || name;
      } catch (_) {}
      try { e.source.postMessage({ type: 'psx-byod-file', file, name }, window.location.origin); } catch (_) {}
    }
    else if (d.type === 'saturn-byod-ready') {
      const file = window.__saturnByodFile;
      if (!file) return;
      let name = file.name.replace(/\.[^.]+$/, '');
      try {
        const raw = sessionStorage.getItem('saturn-byod');
        if (raw) name = JSON.parse(raw).name || name;
      } catch (_) {}
      try { e.source.postMessage({ type: 'saturn-byod-file', file, name }, window.location.origin); } catch (_) {}
    }
    else if (d.type === 'nes-byoc-ready') {
      const file = window.__nesByocFile;
      if (!file) return;
      let name = file.name.replace(/\.[^.]+$/, '');
      try {
        const raw = sessionStorage.getItem('nes-byoc');
        if (raw) name = JSON.parse(raw).name || name;
      } catch (_) {}
      try { e.source.postMessage({ type: 'nes-byoc-file', file, name }, window.location.origin); } catch (_) {}
    }
  }

  onMount(() => {
    const tick = () => {
      const d = new Date();
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      const s = String(d.getSeconds()).padStart(2, '0');
      clockStr = h + ':' + m + ':' + s;
    };
    tick();
    clockTimer = setInterval(tick, 1000);

    isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints || 0) > 0;

    sfx.boot();
    document.addEventListener('click', unlockAudio, { once: true });
    bootTimer = setTimeout(() => { bootGone = true; }, 1600);

    window.addEventListener('keydown', onKey);
    window.addEventListener('message', onWindowMessage);
    window.addEventListener('message', onSoftmodMessage);
    window.addEventListener('gamepadconnected', onPadConnect);
    window.addEventListener('gamepaddisconnected', onPadDisconnect);
    refreshPadConnected();
    padRaf = requestAnimationFrame(pollPad);

    loadManifest();
    loadArcadeList();
    loadTg16List();
    loadPsxList();
    loadSaturnList();
    loadNesList();
    registerCmgSw();
    loadCmgnetList();
  });

  function refreshPadConnected() {
    const pads = (navigator.getGamepads && navigator.getGamepads()) || [];
    let any = false;
    for (const p of pads) { if (p && p.connected) { any = true; break; } }
    padConnected = any;
  }
  function onPadConnect() { padHadConnection = true; refreshPadConnected(); }
  function onPadDisconnect() { refreshPadConnected(); }

  $effect(() => {
    if (padConnected) document.body.classList.add('pad-on');
    else document.body.classList.remove('pad-on');
  });

  $effect(() => {
    if (!gameOn || !hasEmulatorControls) return;
    // Driven by the OSD's "Emulator Controls" toggle — shows/hides EmulatorJS's
    // in-iframe control bar.
    postToGameframe(controlsShown ? 'tg16-show-controls' : 'tg16-hide-controls');
  });

  $effect(() => {
    // While a game iframe is active, gamepad-support.js routes gamepad → keyboard
    // into iframe#gameframe. It only dispatches when body.playing is set.
    if (gameOn) document.body.classList.add('playing');
    else document.body.classList.remove('playing');
  });

  // Reflect OSD visibility on <body> so gamepad-support.js's isAnyOverlayOpen()
  // yields gamepad→key input to the game while the Guide is open.
  $effect(() => {
    if (osdOpen) document.body.classList.add('osd-open');
    else document.body.classList.remove('osd-open');
  });

  // The soft-mod cinematic is a top-level launcher overlay too: while it is up,
  // gamepad-support.js must not forward gameplay input into the underlying frame.
  $effect(() => {
    if (softmodOn) document.body.classList.add('softmod-open');
    else document.body.classList.remove('softmod-open');
  });

  // Apply the Look tweaks to the dashboard chrome (and the OSD, via the shared
  // CSS vars). Persisted in setTweak(); re-applied whenever they change.
  $effect(() => {
    const root = document.documentElement;
    if (!tweaks.discoMode) {
      const h = tweaks.hue;
      root.style.setProperty('--green-glow', `oklch(0.78 0.26 ${h})`);
      root.style.setProperty('--green', `oklch(0.86 0.22 ${h})`);
      root.style.setProperty('--tile-edge', `oklch(0.78 0.22 ${h} / 0.55)`);
      root.style.setProperty('--green-deep', `oklch(0.4 0.18 ${h})`);
    }
    root.style.setProperty('--breathe-mult', String(tweaks.breatheSpeed));
    document.body.classList.toggle('no-scan', !tweaks.scanlines);
  });

  // Disco mode — cycle the glow hue while enabled.
  $effect(() => {
    if (!tweaks.discoMode) return;
    let h = tweaks.hue;
    const root = document.documentElement;
    const id = setInterval(() => {
      h = (h + 4) % 360;
      root.style.setProperty('--green-glow', `oklch(0.78 0.26 ${h})`);
      root.style.setProperty('--green', `oklch(0.86 0.22 ${h})`);
      root.style.setProperty('--tile-edge', `oklch(0.78 0.22 ${h} / 0.55)`);
    }, 120);
    return () => clearInterval(id);
  });

  onDestroy(() => {
    if (clockTimer) clearInterval(clockTimer);
    if (bootTimer) clearTimeout(bootTimer);
    if (padRaf) cancelAnimationFrame(padRaf);
    document.removeEventListener('click', unlockAudio);
    window.removeEventListener('keydown', onKey);
    window.removeEventListener('message', onWindowMessage);
    window.removeEventListener('message', onSoftmodMessage);
    window.removeEventListener('gamepadconnected', onPadConnect);
    window.removeEventListener('gamepaddisconnected', onPadDisconnect);
    document.body.classList.remove('playing');
    document.body.classList.remove('pad-on');
    document.body.classList.remove('osd-open');
    document.body.classList.remove('softmod-open');
  });
</script>

{#if !bootGone}
  <div class="boot"><div class="b-glyph">🐵</div></div>
{/if}

<div class="field" aria-hidden="true">
  <svg class="mesh" viewBox="-500 -500 1000 1000" preserveAspectRatio="xMidYMid slice">
    <defs>
      <radialGradient id="fade" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="rgba(120,255,90,0.0)" />
        <stop offset="55%" stop-color="rgba(120,255,90,0.5)" />
        <stop offset="100%" stop-color="rgba(120,255,90,0.0)" />
      </radialGradient>
    </defs>
    <g stroke="url(#fade)" stroke-width="1" fill="none" opacity="0.6">
      <ellipse cx="0" cy="0" rx="120" ry="42" />
      <ellipse cx="0" cy="0" rx="180" ry="62" />
      <ellipse cx="0" cy="0" rx="240" ry="86" />
      <ellipse cx="0" cy="0" rx="310" ry="115" />
      <ellipse cx="0" cy="0" rx="380" ry="146" />
      <ellipse cx="0" cy="0" rx="450" ry="180" />
    </g>
    <g stroke="url(#fade)" stroke-width="0.6" fill="none" opacity="0.35">
      <line x1="-500" y1="0" x2="500" y2="0" />
      <line x1="0" y1="-200" x2="0" y2="200" />
      <line x1="-440" y1="-160" x2="440" y2="160" />
      <line x1="440" y1="-160" x2="-440" y2="160" />
      <line x1="-250" y1="-180" x2="250" y2="180" />
      <line x1="250" y1="-180" x2="-250" y2="180" />
    </g>
  </svg>
  <svg class="mesh2" viewBox="-500 -500 1000 1000" preserveAspectRatio="xMidYMid slice">
    <g stroke="rgba(120,255,90,0.16)" stroke-width="0.5" fill="none">
      <ellipse cx="0" cy="0" rx="150" ry="380" transform="rotate(20)" />
      <ellipse cx="0" cy="0" rx="150" ry="380" transform="rotate(70)" />
      <ellipse cx="0" cy="0" rx="150" ry="380" transform="rotate(120)" />
      <ellipse cx="0" cy="0" rx="150" ry="380" transform="rotate(170)" />
    </g>
  </svg>
</div>

<div class="noise"></div>
<div class="scan"></div>
<div class="vignette"></div>

<div class="stage">
  <div class="topbar">
    <div class="brand">
      <span class="dot"></span>
      <span>code monkey // dashboard v1.0</span>
    </div>
    <div class="right">
      <span>{clockStr}</span>
      <span>core stable</span>
      <span>sys ▮▮▮▮▮▮▮▱</span>
    </div>
  </div>

  <div class="dashboard {screen === 'dashboard' ? '' : 'gone'}">
    <div class="orb-wrap">
      <div class="orb">
        <div class="ring c"></div>
        <div class="ring b"></div>
        <div class="ring a"></div>
        <div class="core"></div>
        <div class="glyph">🐵</div>
      </div>
    </div>
    <div class="menu">
      {#each MAIN_MENU as m, i (m.id)}
        <div
          bind:this={menuEls[i]}
          class="item {i === menuSel ? 'sel' : ''}"
          onmouseenter={() => { if (i !== menuSel) { menuSel = i; sfx.nav(); } }}
          onclick={() => pickMenu(i)}
        >
          <span class="tag">{m.tag}</span>
          <div class="node"></div>
          <div class="bar">
            <span>{m.label}</span>
            <span class="num">{m.num}</span>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <div class="games-screen {screen === 'games' ? 'shown' : ''}">
    <div class="games-panel">
      <div class="strip-top">
        <span>boot.0728</span>
        <span>signal // ok</span>
        <span>{clockShort}</span>
      </div>

      <div class="disc-col">
        <div class="disc"></div>
        <div class="meta">
          <div><span class="k">name</span><b>{currentGame?.name ?? '—'}</b></div>
          <div><span class="k">size</span><b>{currentGame?.size ?? '—'}</b></div>
          <div><span class="k">type</span><b>{currentGame?.submenu ? 'SUBMENU' : currentGame?.__cmgnet ? 'NET / INSTALLED' : 'GAME / IFRAME'}</b></div>
          <div><span class="k">date</span><b>{currentGame?.date ?? '—'}</b></div>
        </div>
      </div>

      <div class="games-right">
        <div class="games-header">
          <div class="title-bar">GAMES</div>
          <div class="counter">{counterText}</div>
        </div>
        <div class="games-list" bind:this={gameListEl}>
          {#each GAMES as g, i (g.id)}
            <div
              bind:this={gameRowEls[i]}
              class="game-row {i === gameSel ? 'sel' : ''}"
              onmouseenter={() => { if (i !== gameSel) { gameSel = i; sfx.nav(); } }}
              onclick={() => launchGame(g.id)}
            >
              <div class="game-icon">
                <div class="glass">
                  {#if g.icon}
                    <img src={g.icon} alt={g.name} onerror={(e) => onIconError(e, g.name)} />
                  {:else}
                    <span class="ph">{initial(g.name)}</span>
                  {/if}
                </div>
              </div>
              <div class="game-bar">
                <span class="name">{g.title}{g.submenu ? ' ›' : ''}</span>
                {#if g.__cmgnet && cmgnetStatus[g.id]?.updateAvailable}
                  <span class="net-badge upd" role="button" tabindex="0"
                        onclick={(e) => { e.stopPropagation(); cmgnetUpdate(g); }}>↻ UPDATE</span>
                {:else}
                  <span class="sub">{g.sub}</span>
                {/if}
              </div>
              {#if g.__cmgnet}
                <button
                  class="uninstall-btn"
                  type="button"
                  title="Uninstall {g.name}"
                  aria-label="Uninstall {g.name}"
                  onclick={(e) => { e.stopPropagation(); cmgnetUninstall(g); }}
                >✕</button>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>

  <div class="games-screen {screen === 'arcade' ? 'shown' : ''}">
    <div class="games-panel">
      <div class="strip-top">
        <span>core // mame</span>
        <span>emularity</span>
        <span>{clockShort}</span>
      </div>

      <div class="disc-col">
        <div class="disc"></div>
        <div class="meta">
          <div><span class="k">name</span><b>{currentArcade ? currentArcade.name : '—'}</b></div>
          <div><span class="k">size</span><b>{currentArcade ? currentArcade.size : '—'}</b></div>
          <div><span class="k">type</span><b>ARCADE / MAME</b></div>
          <div><span class="k">date</span><b>{currentArcade ? currentArcade.date : '—'}</b></div>
        </div>
      </div>

      <div class="games-right">
        <div class="games-header">
          <div class="title-bar">ARCADE</div>
          <div class="counter">{arcadeCounterText}</div>
        </div>
        <div class="games-list">
          {#if arcadeGames.length === 0}
            <div class="game-row">
              <div class="game-icon"><div class="glass"><span class="ph">··</span></div></div>
              <div class="game-bar"><span class="name">NO ROMS FOUND</span><span class="sub">drop .zip into static/arcade/</span></div>
            </div>
          {:else}
            {#each arcadeGames as g, i (g.file)}
              <div
                bind:this={arcadeRowEls[i]}
                class="game-row {i === arcadeSel ? 'sel' : ''}"
                onmouseenter={() => { if (i !== arcadeSel) { arcadeSel = i; sfx.nav(); } }}
                onclick={() => launchArcade(g)}
              >
                <div class="game-icon">
                  <div class="glass">
                    <span class="ph">{initial(g.name)}</span>
                  </div>
                </div>
                <div class="game-bar">
                  <span class="name">{g.name.toUpperCase()}</span>
                  <span class="sub">{g.size}</span>
                </div>
              </div>
            {/each}
          {/if}
        </div>
      </div>
    </div>
  </div>

  <div class="games-screen {screen === 'tg16' ? 'shown' : ''}">
    <div class="games-panel">
      <div class="strip-top">
        <span>core // mednafen</span>
        <span>emulatorjs</span>
        <span>{clockShort}</span>
      </div>

      <div class="disc-col">
        <div class="disc"></div>
        <div class="meta">
          <div><span class="k">name</span><b>{currentTg16 ? currentTg16.name : '—'}</b></div>
          <div><span class="k">size</span><b>{currentTg16 ? currentTg16.size : '—'}</b></div>
          <div><span class="k">type</span><b>TG16 / .PCE</b></div>
          <div><span class="k">date</span><b>{currentTg16 ? currentTg16.date : '—'}</b></div>
        </div>
      </div>

      <div class="games-right">
        <div class="games-header">
          <div class="title-bar">TURBOGRAFX-16</div>
          <div class="counter">{tg16CounterText}</div>
        </div>
        <div class="games-list">
          {#if tg16Games.length === 0}
            <div class="game-row">
              <div class="game-icon"><div class="glass"><span class="ph">··</span></div></div>
              <div class="game-bar"><span class="name">NO ROMS FOUND</span><span class="sub">drop .pce into static/TurboGrafx-16/</span></div>
            </div>
          {:else}
            {#each tg16Games as g, i (g.file)}
              <div
                bind:this={tg16RowEls[i]}
                class="game-row {i === tg16Sel ? 'sel' : ''}"
                onmouseenter={() => { if (i !== tg16Sel) { tg16Sel = i; sfx.nav(); } }}
                onclick={() => launchTg16(g.file)}
              >
                <div class="game-icon">
                  <div class="glass">
                    <span class="ph">{initial(g.name)}</span>
                  </div>
                </div>
                <div class="game-bar">
                  <span class="name">{g.name.toUpperCase()}</span>
                  <span class="sub">{g.size}</span>
                </div>
              </div>
            {/each}
          {/if}
        </div>
      </div>
    </div>
  </div>

  <div class="games-screen {screen === 'psx' ? 'shown' : ''}">
    <div class="games-panel">
      <div class="strip-top">
        <span>core // psx</span>
        <span>emulatorjs</span>
        <span>{clockShort}</span>
      </div>

      <div class="disc-col">
        <div class="disc"></div>
        <div class="meta">
          <div><span class="k">name</span><b>{currentPsx ? currentPsx.name : '—'}</b></div>
          <div><span class="k">size</span><b>{currentPsx ? currentPsx.size : '—'}</b></div>
          <div><span class="k">type</span><b>PSX / DISC</b></div>
          <div><span class="k">date</span><b>{currentPsx ? currentPsx.date : '—'}</b></div>
        </div>
      </div>

      <div class="games-right">
        <div class="games-header">
          <div class="title-bar">PLAYSTATION</div>
          <div class="counter">{psxCounterText}</div>
        </div>
        <div class="games-list">
          {#if psxGames.length === 0}
            <div class="byod">
              <div class="byod-title">BYOD — Bring Your Own Disc</div>
              <div class="byod-sub">No PSX images in <code>static/PlayStation/</code>. Pick a disc image from disk:</div>
              <input
                type="file"
                bind:this={psxFileInput}
                multiple
                accept=".pbp,.chd,.iso,.cue,.bin,.m3u,application/octet-stream"
                onchange={onByodChange}
                class="byod-input"
              />
              <button
                type="button"
                class="byod-btn"
                bind:this={psxByodBtnEl}
                onclick={() => { try { psxFileInput?.click(); } catch (_) {} }}
              >
                <span class="byod-btn-icon">⬆</span>
                <span>Choose disc files…</span>
              </button>
              <div class="byod-hint">
                .pbp · .chd · .iso load directly.<br>
                .cue / .m3u need their companion .bin files selected together.
              </div>
              {#if psxByodError}
                <div class="byod-err">{psxByodError}</div>
              {/if}
            </div>
          {:else}
            {#each psxGames as g, i (g.file)}
              <div
                bind:this={psxRowEls[i]}
                class="game-row {i === psxSel ? 'sel' : ''}"
                onmouseenter={() => { if (i !== psxSel) { psxSel = i; sfx.nav(); } }}
                onclick={() => launchPsx(g.file)}
              >
                <div class="game-icon">
                  <div class="glass">
                    <span class="ph">{initial(g.name)}</span>
                  </div>
                </div>
                <div class="game-bar">
                  <span class="name">{g.name.toUpperCase()}</span>
                  <span class="sub">{g.size}</span>
                </div>
              </div>
            {/each}
          {/if}
        </div>
      </div>
    </div>
  </div>

  <div class="games-screen {screen === 'saturn' ? 'shown' : ''}">
    <div class="games-panel">
      <div class="strip-top">
        <span>core // segaSaturn</span>
        <span>emulatorjs</span>
        <span>{clockShort}</span>
      </div>

      <div class="disc-col">
        <div class="disc"></div>
        <div class="meta">
          <div><span class="k">name</span><b>{currentSaturn ? currentSaturn.name : '—'}</b></div>
          <div><span class="k">size</span><b>{currentSaturn ? currentSaturn.size : '—'}</b></div>
          <div><span class="k">type</span><b>SATURN / DISC</b></div>
          <div><span class="k">date</span><b>{currentSaturn ? currentSaturn.date : '—'}</b></div>
        </div>
      </div>

      <div class="games-right">
        <div class="games-header">
          <div class="title-bar">SEGA SATURN</div>
          <div class="counter">{saturnCounterText}</div>
        </div>
        <div class="games-list">
          {#if saturnGames.length === 0}
            <div class="byod">
              <div class="byod-title">BYOD — Bring Your Own Disc</div>
              <div class="byod-sub">No Saturn images in <code>static/SegaSaturn/</code>. Pick a disc image from disk:</div>
              <input
                type="file"
                bind:this={saturnFileInput}
                multiple
                accept=".chd,.iso,.cue,.bin,.m3u,.ccd,.mds,application/octet-stream"
                onchange={onSaturnByodChange}
                class="byod-input"
              />
              <button
                type="button"
                class="byod-btn"
                bind:this={saturnByodBtnEl}
                onclick={() => { try { saturnFileInput?.click(); } catch (_) {} }}
              >
                <span class="byod-btn-icon">⬆</span>
                <span>Choose disc files…</span>
              </button>
              <div class="byod-hint">
                .chd · .iso load directly.<br>
                .cue / .m3u need their companion .bin files selected together.<br>
                Needs <code>static/bios/saturn_bios.bin</code> (user-supplied).
              </div>
              {#if saturnByodError}
                <div class="byod-err">{saturnByodError}</div>
              {/if}
            </div>
          {:else}
            {#each saturnGames as g, i (g.file)}
              <div
                bind:this={saturnRowEls[i]}
                class="game-row {i === saturnSel ? 'sel' : ''}"
                onmouseenter={() => { if (i !== saturnSel) { saturnSel = i; sfx.nav(); } }}
                onclick={() => launchSaturn(g.file)}
              >
                <div class="game-icon">
                  <div class="glass">
                    <span class="ph">{initial(g.name)}</span>
                  </div>
                </div>
                <div class="game-bar">
                  <span class="name">{g.name.toUpperCase()}</span>
                  <span class="sub">{g.size}</span>
                </div>
              </div>
            {/each}
          {/if}
        </div>
      </div>
    </div>
  </div>

  <div class="games-screen {screen === 'nes' ? 'shown' : ''}">
    <div class="games-panel">
      <div class="strip-top">
        <span>core // fceumm</span>
        <span>emulatorjs</span>
        <span>{clockShort}</span>
      </div>

      <div class="disc-col">
        <div class="disc"></div>
        <div class="meta">
          <div><span class="k">name</span><b>{onNesByocRow ? 'BYOC' : (currentNes ? currentNes.name : '—')}</b></div>
          <div><span class="k">size</span><b>{onNesByocRow ? '—' : (currentNes ? currentNes.size : '—')}</b></div>
          <div><span class="k">type</span><b>NES / .NES</b></div>
          <div><span class="k">date</span><b>{onNesByocRow ? '—' : (currentNes ? currentNes.date : '—')}</b></div>
        </div>
      </div>

      <div class="games-right">
        <div class="games-header">
          <div class="title-bar">NINTENDO</div>
          <div class="counter">{nesCounterText}</div>
        </div>
        <div class="games-list">
          <input
            type="file"
            bind:this={nesFileInput}
            accept=".nes,.fds,.unif,.unf,.zip,application/octet-stream"
            onchange={onByocChange}
            class="byod-input"
          />
          {#each nesGames as g, i (g.file)}
            <div
              bind:this={nesRowEls[i]}
              class="game-row {i === nesSel ? 'sel' : ''}"
              onmouseenter={() => { if (i !== nesSel) { nesSel = i; sfx.nav(); } }}
              onclick={() => launchNes(g.file)}
            >
              <div class="game-icon">
                <div class="glass">
                  <span class="ph">{initial(g.name)}</span>
                </div>
              </div>
              <div class="game-bar">
                <span class="name">{g.name.toUpperCase()}</span>
                <span class="sub">{g.size}</span>
              </div>
            </div>
          {/each}
          <!-- Pinned BYOC row — always present (index === nesGames.length) so you
               can load your own cartridge even when preloaded ROMs exist. (PSX /
               Saturn show BYOD only on an empty list; NES ships a preload, so the
               affordance is pinned instead.) -->
          <div
            bind:this={nesRowEls[nesGames.length]}
            class="game-row byoc-row {onNesByocRow ? 'sel' : ''}"
            onmouseenter={() => { if (!onNesByocRow) { nesSel = nesGames.length; sfx.nav(); } }}
            onclick={openByocPicker}
          >
            <div class="game-icon">
              <div class="glass">
                <span class="ph">⬆</span>
              </div>
            </div>
            <div class="game-bar">
              <span class="name">BRING YOUR OWN CARTRIDGE</span>
              <span class="sub">load a .nes from disk</span>
            </div>
          </div>
          {#if nesByocError}
            <div class="byod-err">{nesByocError}</div>
          {/if}
        </div>
      </div>
    </div>
  </div>

  <div class="games-screen {screen === 'demos' ? 'shown' : ''}">
    <div class="games-panel">
      <div class="strip-top">
        <span>core // phaser4</span>
        <span>demo // multiplayer</span>
        <span>{clockShort}</span>
      </div>

      <div class="disc-col">
        <div class="disc"></div>
        <div class="meta">
          <div><span class="k">name</span><b>{currentDemo ? currentDemo.name : '—'}</b></div>
          <div><span class="k">size</span><b>{currentDemo ? currentDemo.size : '—'}</b></div>
          <div><span class="k">type</span><b>DEMO / PHASER4</b></div>
          <div><span class="k">date</span><b>{currentDemo ? currentDemo.date : '—'}</b></div>
        </div>
      </div>

      <div class="games-right">
        <div class="games-header">
          <div class="title-bar">DEMOS</div>
          <div class="counter">{demosCounterText}</div>
        </div>
        <div class="games-list">
          {#each DEMOS as d, i (d.id)}
            <div
              bind:this={demosRowEls[i]}
              class="game-row {i === demosSel ? 'sel' : ''}"
              onmouseenter={() => { if (i !== demosSel) { demosSel = i; sfx.nav(); } }}
              onclick={() => launchDemo(d.url)}
            >
              <div class="game-icon">
                <div class="glass">
                  <span class="ph">{initial(d.name)}</span>
                </div>
              </div>
              <div class="game-bar">
                <span class="name">{d.title}</span>
                <span class="sub">{d.sub}</span>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>

  <div class="games-screen {screen === 'cmgnet' ? 'shown' : ''}">
    <div class="games-panel">
      <div class="strip-top">
        <span>core // network</span>
        <span>cmg e-shop</span>
        <span>{clockShort}</span>
      </div>

      <div class="disc-col">
        <div class="disc net"></div>
        <div class="meta">
          <div><span class="k">name</span><b>{currentCmgnet ? currentCmgnet.name : '—'}</b></div>
          <div><span class="k">size</span><b>{currentCmgnet ? currentCmgnet.size : '—'}</b></div>
          <div><span class="k">type</span><b>{currentCmgnet?.kind === 'music' ? 'NET / MUSIC' : 'NET / STREAM'}</b></div>
          <div><span class="k">date</span><b>{currentCmgnet ? currentCmgnet.date : '—'}</b></div>
        </div>
      </div>

      <div class="games-right">
        <div class="games-header">
          <div class="title-bar">CMG NETWORK</div>
          <div class="counter">{cmgnetCounterText}</div>
        </div>
        <div class="games-list">
          {#if cmgnetVisible.length === 0}
            <div class="game-row">
              <div class="game-icon"><div class="glass"><span class="ph">··</span></div></div>
              {#if cmgnetGames.length === 0}
                <div class="game-bar"><span class="name">CATALOG OFFLINE</span><span class="sub">no codemonkey.json reachable</span></div>
              {:else}
                <div class="game-bar"><span class="name">ALL INSTALLED</span><span class="sub">every title is in your Games list</span></div>
              {/if}
            </div>
          {:else}
            {#each cmgnetVisible as g, i (g.id)}
              <div
                bind:this={cmgnetRowEls[i]}
                class="game-row {i === cmgnetSel ? 'sel' : ''}"
                onmouseenter={() => { if (i !== cmgnetSel) { cmgnetSel = i; sfx.nav(); } }}
                onclick={() => launchCmgnet(g)}
              >
                <div class="game-icon">
                  <div class="glass">
                    {#if g.icon}
                      <img src={g.icon} alt={g.name} onerror={(e) => onIconError(e, g.name)} />
                    {:else}
                      <span class="ph">{initial(g.name)}</span>
                    {/if}
                  </div>
                </div>
                <div class="game-bar">
                  <span class="name">{g.title}</span>
                  {#if g.kind === 'music'}
                    <span class="net-badge music">♪ OPEN</span>
                  {:else if cmgnetStatus[g.id]?.downloading}
                    <span class="net-badge dl">⬇ {cmgnetStatus[g.id].pct}%</span>
                  {:else if cmgnetStatus[g.id]?.error}
                    <span class="net-badge err">! RETRY</span>
                  {:else}
                    <span class="net-badge get">GET ⬇</span>
                  {/if}
                </div>
                {#if cmgnetStatus[g.id]?.downloading}
                  <div class="net-prog"><div class="net-prog-fill" style="width:{cmgnetStatus[g.id].pct}%"></div></div>
                {/if}
              </div>
            {/each}
          {/if}
        </div>
      </div>
    </div>
  </div>

  {#if screen === 'games' || screen === 'arcade' || screen === 'tg16' || screen === 'nes' || screen === 'psx' || screen === 'saturn' || screen === 'demos' || screen === 'cmgnet'}
    <div class="footer left tap" role="button" tabindex="0" onpointerup={tapHandler(goBack)}>
      <div class="btn-hint b">B</div>
      <span>Back</span>
    </div>
  {/if}
  {#if screen === 'games' && currentGame?.__cmgnet}
    <div class="footer mid acts">
      {#if cmgnetStatus[currentGame.id]?.updateAvailable}
        <span class="act" role="button" tabindex="0" onpointerup={tapHandler(actUpdate)}>
          <span class="btn-hint y">Y</span><span>Update</span>
        </span>
      {/if}
      <span class="act" role="button" tabindex="0" onpointerup={tapHandler(() => cmgnetUninstall(currentGame))}>
        <span class="btn-hint x">X</span><span>Uninstall</span>
      </span>
    </div>
  {/if}
  <div class="footer tap" role="button" tabindex="0" onpointerup={tapHandler(actA)}>
    <div class="btn-hint">A</div>
    <span>{screen === 'games' || screen === 'arcade' || screen === 'tg16' || screen === 'demos' ? 'Launch' : screen === 'cmgnet' ? (currentCmgnet?.kind === 'music' ? 'Open' : 'Get') : screen === 'psx' ? (psxGames.length === 0 ? 'Browse' : 'Launch') : screen === 'saturn' ? (saturnGames.length === 0 ? 'Browse' : 'Launch') : screen === 'nes' ? (onNesByocRow ? 'Browse' : 'Launch') : 'Select'}</span>
  </div>
</div>

<!-- Only mount the overlay while a game is active. Leaving a navigated,
     full-screen iframe in the DOM (even hidden via opacity:0 + pointer-events:none)
     keeps a touch/scroll-capturing region over the games list on mobile WebKit,
     which kills swipe-scroll after returning to the menu. gameSrc stays set for
     500ms after closeGame() so the fade-out still plays before it unmounts. -->
{#if gameSrc}
  <div class="game-iframe {gameOn ? 'on' : ''}">
    <iframe
      id={gameOn ? 'gameframe' : undefined}
      src={gameSrc}
      title="game"
      allow="autoplay; fullscreen; gamepad; xr-spatial-tracking"
      onload={(e) => { injectOsdKeyForwarder(e); applyTwinStick(); }}
    ></iframe>
  </div>
{/if}

<!-- Music app sidebar — a CMG Network kind:'music' app docked to the right edge,
     layered above a running game (z 101) but below the Guide (z 102/103) so the
     Guide can still open over it. There is no full-screen scrim: the game stays
     visible and interactive at the left and keeps running IN PARALLEL while the
     music app plays. Mounted while musicSrc is set; the iframe is dropped ~350ms
     after close (in closeMusic) so its audio stops once the panel slides out. -->
{#if musicSrc}
  <div class="music-sidebar {musicOpen ? 'on' : ''}" role="dialog" aria-label={musicTitle || 'Music'}>
    <div class="music-hd">
      <span class="music-dot" aria-hidden="true">♪</span>
      <span class="music-title">{musicTitle || 'MUSIC'}</span>
      <button type="button" class="music-x" aria-label="Close music" onclick={closeMusic}>✕</button>
    </div>
    <iframe
      id="musicframe"
      src={musicSrc}
      title={musicTitle || 'music'}
      allow="autoplay; encrypted-media; clipboard-write; fullscreen"
    ></iframe>
  </div>
{/if}

<!-- In-game OSD trigger: two-finger bottom-left + top-right tap. Small corner
     hit-zones layered above the game iframe, rendered only while a game is up
     and the OSD is closed. (Gamepad opens it with SELECT + Down; keyboard with
     ` or Esc.) -->
{#if gameOn && !osdOpen}
  <div class="osd-corner bl" aria-hidden="true"
       onpointerdown={() => cornerDown('bl')} onpointerup={() => cornerUp('bl')}
       onpointercancel={() => cornerUp('bl')} onpointerleave={() => cornerUp('bl')}></div>
  <div class="osd-corner tr" aria-hidden="true"
       onpointerdown={() => cornerDown('tr')} onpointerup={() => cornerUp('tr')}
       onpointercancel={() => cornerUp('tr')} onpointerleave={() => cornerUp('tr')}></div>
{/if}

<!-- Opposite-corner easter egg: top-left + bottom-right two-finger tap boots
     the soft-mod cinematic. Layered in-game (the same context as the OSD
     gesture, just the other diagonal); never shown while it's already playing
     or the OSD is open, and only in-game so it can't block the launcher UI. -->
{#if gameOn && !softmodOn && !osdOpen}
  <div class="osd-corner tl" aria-hidden="true"
       onpointerdown={() => softCornerDown('tl')} onpointerup={() => softCornerUp('tl')}
       onpointercancel={() => softCornerUp('tl')} onpointerleave={() => softCornerUp('tl')}></div>
  <div class="osd-corner br" aria-hidden="true"
       onpointerdown={() => softCornerDown('br')} onpointerup={() => softCornerUp('br')}
       onpointercancel={() => softCornerUp('br')} onpointerleave={() => softCornerUp('br')}></div>
{/if}

<!-- Soft-mod cinematic overlay (self-contained Phaser 4.1.0 scene). Posts
     { type: 'softmod-done' } back here when its simulated reboot finishes. -->
{#if softmodOn}
  <div class="softmod-overlay">
    <iframe id="softmodframe" title="Soft Mod" src="/demos/softmod"
            allow="autoplay" frameborder="0"></iframe>
  </div>
{/if}

{#if padDebugOn}
  <pre class="pad-debug">{padDebugText}</pre>
{/if}

<Osd open={osdOpen} items={osdItems} sel={osdSel}
     onactivate={activateOsd} onsetvalue={setOsdValue}
     onselect={(i) => (osdSel = i)} onclose={closeOsd} />
