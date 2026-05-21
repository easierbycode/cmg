<script>
  import { onMount, onDestroy } from 'svelte';

  const MAIN_MENU = [
    { id: 'memory',   label: 'Memory',   tag: '01 / sys.core', num: '0x01' },
    { id: 'games',    label: 'Games',    tag: '02 / disc.io',  num: '0x02' },
    { id: 'settings', label: 'Settings', tag: '03 / config',   num: '0x03' },
  ];

  const TG16_ID = '__tg16__';
  const PSX_ID  = '__psx__';
  const GAMES = [
    { id: '2019-es7',                                              name: '2028',                title: '2028',                sub: 'ES7 // Phaser 3', icon: '/icons/2028-icon.png',                size: '12.4 MB', date: '07.28.22' },
    { id: 'evil-invaders',                                         name: 'Peachy Skies',        title: 'PEACHY SKIES',        sub: 'Turbo + Audio',   icon: '/icons/headphone-invader-icon.png',   size: '8.2 MB',  date: '10.13.24' },
    { id: 'games/evil-invaders/index.html?turbo=1&audio=1',        name: 'Evil Invaders',       title: 'EVIL INVADERS',       sub: 'Classic',         icon: '/icons/evil-invaders-icon.png',       size: '9.6 MB',  date: '04.04.23' },
    { id: 'hellophaser/v3',                                        name: 'RonaGun',             title: 'RONAGUN',             sub: 'Phaser v3 demo',  icon: null,                                   size: '3.1 MB',  date: '08.08.22' },
    { id: 'squad-game',                                            name: 'Squad Game',          title: 'SQUAD GAME',          sub: '👨🏽‍💻 👾💾🖳 👩🏽‍💻',  icon: '/icons/squad-game.png',                size: '5.7 MB',  date: '11.02.23' },
    { id: 'evil-invaders-phaser4/?scene=MutoidScene&loop=2',       name: 'Mutoid',              title: 'MUTOID',              sub: 'Phaser 4 // loop:2', icon: '/icons/evil-invaders-icon.png',     size: '11.8 MB', date: '06.21.25' },
    { id: 'pacman-halloween-2025',                                 name: 'PAC-MAN Halloween',   title: 'PAC-MAN: HALLOWEEN',  sub: 'Seasonal',        icon: null,                                   size: '14.2 MB', date: '10.31.25' },
    { id: 'shmup-party-phaser3',                                   name: 'Sh’M↑ Party',         title: 'SH\'M↑ PARTY',        sub: 'Multiplayer',     icon: '/icons/shmup-party-icon.png',          size: '7.9 MB',  date: '02.14.24' },
    { id: 'monkey-kombat',                                         name: 'Monkey Kombat',       title: 'MONKEY KOMBAT',       sub: '🐵ᕗ ─=≡ΣO))',     icon: null,                                   size: '6.4 MB',  date: '05.19.26' },
    { id: PSX_ID,                                                  name: 'PlayStation',         title: 'PLAYSTATION',         sub: 'PSX // submenu',  icon: null,                                   size: '— MB',    date: 'PSX',     submenu: true },
    { id: TG16_ID,                                                 name: 'TurboGrafx-16',       title: 'TURBOGRAFX-16',       sub: 'PCE // submenu',  icon: null,                                   size: '— MB',    date: 'PCE',     submenu: true },
  ];

  let screen = $state('dashboard'); // 'dashboard' | 'games' | 'tg16'
  let menuSel = $state(1);           // start on Games
  let gameSel = $state(0);
  let clockStr = $state('--:--:--');
  let gameSrc = $state(null);
  let gameOn = $state(false);
  let bootGone = $state(false);
  let menuEls = $state([]);
  let gameRowEls = $state([]);
  let gameListEl = $state(null);

  let tg16Games = $state([]);
  let tg16Sel = $state(0);
  let tg16RowEls = $state([]);
  let psxGames = $state([]);
  let psxSel = $state(0);
  let psxRowEls = $state([]);
  let psxByodError = $state('');
  let psxFileInput = $state(null);
  let psxByodBtnEl = $state(null);
  let isTouch = $state(false);
  let controlsShown = $state(false);
  let padHadConnection = $state(false);
  let padConnected = $state(false);
  let isTg16Game = $derived(typeof gameSrc === 'string' && (gameSrc.startsWith('/turbografx16/') || gameSrc.startsWith('/psx/')));
  let showCloseBtn = $derived(gameOn && (isTouch || controlsShown));
  let showOsd = $derived(gameOn && (controlsShown || (isTouch && !padHadConnection)));

  function osdCloseGame() { closeGame(); }
  function osdHide() { controlsShown = false; }

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
    if (screen !== 'psx') return;
    const el = psxRowEls[psxSel];
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
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

  let currentGame = $derived(GAMES[gameSel]);
  let currentTg16 = $derived(tg16Games[tg16Sel]);
  let currentPsx = $derived(psxGames[psxSel]);
  let clockShort = $derived(clockStr.slice(0, 5));
  let counterText = $derived(
    String(gameSel + 1).padStart(2, '0') + ' / ' + String(GAMES.length).padStart(2, '0')
  );
  let tg16CounterText = $derived(
    tg16Games.length === 0
      ? '00 / 00'
      : String(tg16Sel + 1).padStart(2, '0') + ' / ' + String(tg16Games.length).padStart(2, '0')
  );
  let psxCounterText = $derived(
    psxGames.length === 0
      ? '00 / 00'
      : String(psxSel + 1).padStart(2, '0') + ' / ' + String(psxGames.length).padStart(2, '0')
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
    if (screen === 'tg16' || screen === 'psx') screen = 'games';
    else screen = 'dashboard';
  }

  function launchGame(id) {
    if (id === TG16_ID) {
      sfx.enter();
      screen = 'tg16';
      return;
    }
    if (id === PSX_ID) {
      sfx.enter();
      screen = 'psx';
      return;
    }
    sfx.enter();
    gameSrc = 'https://easierbycode.com/' + id;
    setTimeout(() => { gameOn = true; }, 30);
  }

  function launchTg16(file) {
    if (!file) return;
    sfx.enter();
    gameSrc = '/turbografx16/play.html?rom=' + encodeURIComponent(file);
    setTimeout(() => { gameOn = true; }, 30);
  }

  function launchPsx(file) {
    if (!file) return;
    sfx.enter();
    gameSrc = '/psx/play.html?rom=' + encodeURIComponent(file);
    setTimeout(() => { gameOn = true; }, 30);
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

  function closeGame() {
    gameOn = false;
    controlsShown = false;
    setTimeout(() => { gameSrc = null; }, 500);
    try { delete window.__psxByodFile; } catch (_) {}
    try { sessionStorage.removeItem('psx-byod'); } catch (_) {}
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
  const padState = {
    btn: new Set(),
    axisDir: 0,
    lastNavAt: 0,
    initialDelayMs: 280,
    repeatMs: 110,
    holdingSince: 0,
    comboLatched: false,
  };
  const PAD_DEADZONE = 0.55;

  function navUp() {
    if (screen === 'dashboard') menuSel = Math.max(menuSel - 1, 0);
    else if (screen === 'games') gameSel = Math.max(gameSel - 1, 0);
    else if (screen === 'tg16') tg16Sel = Math.max(tg16Sel - 1, 0);
    else if (screen === 'psx') psxSel = Math.max(psxSel - 1, 0);
    sfx.nav();
  }
  function navDown() {
    if (screen === 'dashboard') menuSel = Math.min(menuSel + 1, MAIN_MENU.length - 1);
    else if (screen === 'games') gameSel = Math.min(gameSel + 1, GAMES.length - 1);
    else if (screen === 'tg16') tg16Sel = Math.min(tg16Sel + 1, Math.max(tg16Games.length - 1, 0));
    else if (screen === 'psx') psxSel = Math.min(psxSel + 1, Math.max(psxGames.length - 1, 0));
    sfx.nav();
  }
  function navTop() {
    if (screen === 'dashboard') menuSel = 0;
    else if (screen === 'games') gameSel = 0;
    else if (screen === 'tg16') tg16Sel = 0;
    else if (screen === 'psx') psxSel = 0;
    sfx.nav();
  }
  function navBottom() {
    if (screen === 'dashboard') menuSel = MAIN_MENU.length - 1;
    else if (screen === 'games') gameSel = GAMES.length - 1;
    else if (screen === 'tg16') tg16Sel = Math.max(tg16Games.length - 1, 0);
    else if (screen === 'psx') psxSel = Math.max(psxGames.length - 1, 0);
    sfx.nav();
  }
  function actA() {
    if (gameOn) return;
    if (screen === 'dashboard') pickMenu(menuSel);
    else if (screen === 'games') launchGame(GAMES[gameSel].id);
    else if (screen === 'tg16') launchTg16(tg16Games[tg16Sel]?.file);
    else if (screen === 'psx') {
      if (psxGames.length === 0) openByodPicker();
      else launchPsx(psxGames[psxSel]?.file);
    }
  }
  function actB() {
    if (gameOn) closeGame();
    else if (screen === 'games' || screen === 'tg16' || screen === 'psx') goBack();
  }

  // Custom gamepad polling drives dashboard nav (vertical). When a game iframe
  // is active, body.playing is set and the launcher's gamepad-support.js takes
  // over and dispatches keys into iframe#gameframe — we yield to it.
  function pollPad() {
    padRaf = requestAnimationFrame(pollPad);
    const pads = (navigator.getGamepads && navigator.getGamepads()) || [];
    let pad = null;
    for (const p of pads) { if (p && p.connected) { pad = p; break; } }
    if (gameOn) {
      // Yield navigation to gamepad-support.js, but still detect a chord to
      // toggle the close button + in-iframe EmulatorJS controls. Primary
      // chord is SELECT + R shoulder (works on SNES adapters whose D-pad
      // isn't recognized); we also accept SELECT + Down for full-size pads.
      padState.axisDir = 0;
      if (!pad) {
        padState.btn.clear();
        padState.comboLatched = false;
        return;
      }
      const selectBtn = !!pad.buttons[8]?.pressed;
      const rShoulder = !!pad.buttons[5]?.pressed;
      const dpadDown = !!pad.buttons[13]?.pressed;
      const ayDown = (pad.axes[1] ?? 0) > PAD_DEADZONE;
      const combo = selectBtn && (rShoulder || dpadDown || ayDown);
      if (combo && !padState.comboLatched) {
        padState.comboLatched = true;
        controlsShown = !controlsShown;
        sfx.nav();
      } else if (!combo) {
        padState.comboLatched = false;
      }
      // When the OSD is visible, capture A/B face presses to close OSD/game
      // before gamepad-support.js forwards them into the iframe.
      if (controlsShown) {
        const pressedNow = new Set();
        pad.buttons.forEach((btn, i) => { if (btn?.pressed) pressedNow.add(i); });
        const justPressed = (i) => pressedNow.has(i) && !padState.btn.has(i);
        if (justPressed(0)) { closeGame(); }
        else if (justPressed(1)) { controlsShown = false; sfx.back(); }
        padState.btn = pressedNow;
      } else {
        padState.btn.clear();
      }
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
    const upButtonIdxs = [12, 16, 18, 20];
    const downButtonIdxs = [13, 17, 19, 21];
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
      // Hat-switch decode: values near -0.71 / -1.0 are "up",
      // near 0.14 / 0.43 are "down". Values > 1 are the neutral sentinel.
      const hat = pad.axes[9];
      if (typeof hat === 'number' && hat >= -1 && hat <= 1) {
        const angle = (hat + 1) * Math.PI;
        const sy = -Math.cos(angle);
        if (sy < -PAD_DEADZONE) dir = -1;
        else if (sy > PAD_DEADZONE) dir = 1;
      }
    }

    if (dir !== 0 && dir !== padState.axisDir) {
      if (dir < 0) navUp(); else navDown();
      padState.holdingSince = now;
      padState.lastNavAt = now;
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
    // Shoulder/trigger navigation — fallback when D-pad isn't recognized
    // (e.g. Firefox + non-standard SNES adapters).
    if (justPressed(5)) navDown();                  // R shoulder
    if (justPressed(4)) navUp();                    // L shoulder
    if (justPressed(7)) navBottom();                // R2 — jump to bottom
    if (justPressed(6)) navTop();                   // L2 — jump to top
    padState.btn = pressedNow;
  }

  function unlockAudio() { try { getAc()?.resume(); } catch (e) { /* ignore */ } }

  function onKey(e) {
    if (gameOn) {
      if (e.key === 'Escape') closeGame();
      return;
    }
    if (screen === 'dashboard') {
      if (e.key === 'ArrowDown') { menuSel = Math.min(menuSel + 1, MAIN_MENU.length - 1); sfx.nav(); }
      else if (e.key === 'ArrowUp') { menuSel = Math.max(menuSel - 1, 0); sfx.nav(); }
      else if (e.key === 'Enter' || e.key === ' ') pickMenu(menuSel);
    } else if (screen === 'games') {
      if (e.key === 'ArrowDown') { gameSel = Math.min(gameSel + 1, GAMES.length - 1); sfx.nav(); }
      else if (e.key === 'ArrowUp') { gameSel = Math.max(gameSel - 1, 0); sfx.nav(); }
      else if (e.key === 'Enter' || e.key === ' ') launchGame(GAMES[gameSel].id);
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
    }
  }

  function isMessageFromOwnGameIframe(e) {
    // Only trust messages from the game iframe we mounted. Without this guard,
    // any cross-origin window holding a reference to us (e.g. one that opened
    // this tab) could trigger BYOD file exfiltration or remote closeGame().
    if (e.origin && e.origin !== window.location.origin) return false;
    const iframe = document.querySelector('.game-iframe iframe');
    return !!iframe && e.source === iframe.contentWindow;
  }

  function onWindowMessage(e) {
    if (!isMessageFromOwnGameIframe(e)) return;
    const d = e?.data || {};
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
    window.addEventListener('gamepadconnected', onPadConnect);
    window.addEventListener('gamepaddisconnected', onPadDisconnect);
    refreshPadConnected();
    padRaf = requestAnimationFrame(pollPad);

    loadTg16List();
    loadPsxList();
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
    if (!gameOn || !isTg16Game) return;
    postToGameframe(controlsShown || isTouch ? 'tg16-show-controls' : 'tg16-hide-controls');
  });

  $effect(() => {
    // While a game iframe is active, gamepad-support.js routes gamepad → keyboard
    // into iframe#gameframe. It only dispatches when body.playing is set.
    if (gameOn) document.body.classList.add('playing');
    else document.body.classList.remove('playing');
  });

  onDestroy(() => {
    if (clockTimer) clearInterval(clockTimer);
    if (bootTimer) clearTimeout(bootTimer);
    if (padRaf) cancelAnimationFrame(padRaf);
    document.removeEventListener('click', unlockAudio);
    window.removeEventListener('keydown', onKey);
    window.removeEventListener('message', onWindowMessage);
    window.removeEventListener('gamepadconnected', onPadConnect);
    window.removeEventListener('gamepaddisconnected', onPadDisconnect);
    document.body.classList.remove('playing');
    document.body.classList.remove('pad-on');
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
          <div><span class="k">name</span><b>{currentGame.name}</b></div>
          <div><span class="k">size</span><b>{currentGame.size}</b></div>
          <div><span class="k">type</span><b>{currentGame.submenu ? 'SUBMENU' : 'GAME / IFRAME'}</b></div>
          <div><span class="k">date</span><b>{currentGame.date}</b></div>
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
                <span class="sub">{g.sub}</span>
              </div>
            </div>
          {/each}
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

  {#if screen === 'games' || screen === 'tg16' || screen === 'psx'}
    <div class="footer left">
      <div class="btn-hint b">B</div>
      <span style="cursor:pointer" onclick={goBack}>Back</span>
    </div>
  {/if}
  <div class="footer">
    <div class="btn-hint">A</div>
    <span>{screen === 'games' || screen === 'tg16' ? 'Launch' : screen === 'psx' ? (psxGames.length === 0 ? 'Browse' : 'Launch') : 'Select'}</span>
  </div>
</div>

<div class="game-iframe {gameOn ? 'on' : ''}">
  {#if showCloseBtn}
    <button type="button" class="close-game" onclick={closeGame}>⨯ Close</button>
  {/if}
  {#if showOsd}
    <div class="pad-osd">
      <div class="osd-card">
        <div class="osd-label">Controller</div>
        <div class="osd-diamond">
          <div class="osd-btn top" aria-hidden="true">X</div>
          <button type="button" class="osd-btn right tap" aria-label="Hide controls" onclick={osdHide}>A</button>
          <button type="button" class="osd-btn bottom press tap" aria-label="Close game" onclick={osdCloseGame}>B</button>
          <div class="osd-btn left" aria-hidden="true">Y</div>
        </div>
        <div class="osd-legend">
          <div><span class="dot press"></span>B&nbsp;·&nbsp;Close game</div>
          <div><span class="dot"></span>A&nbsp;·&nbsp;Hide</div>
        </div>
      </div>
    </div>
  {/if}
  <iframe
    id={gameOn ? 'gameframe' : undefined}
    src={gameSrc ?? 'about:blank'}
    title="game"
    allow="autoplay; fullscreen; gamepad; xr-spatial-tracking"
    allowfullscreen
  ></iframe>
</div>
