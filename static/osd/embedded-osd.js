// Embedded OSD — a self-contained, in-game on-screen-display styled like the
// Xbox 360 dashboard "blades" (Game / Music / Look). Unlike the cmg launcher's
// Svelte OSD (which only exists while a game runs inside the launcher), this
// ships INSIDE the game page, so it works in a standalone exported APK where
// there is no launcher.
//
// Activation: a "secret" two-corner touch — press bottom-left AND top-right at
// the same time — toggles it open (backtick / Escape also work for desktop
// testing). This mirrors console guide buttons on a device with no keyboard.
//
// It is driven entirely by a config object so the same script serves every game:
//
//   window.__CMG_OSD__ = {
//     title: "2019 TURBO",
//     cheats: [                                   // Game blade
//       { param: "bossRush", kind: "toggle", label: "Boss Rush", on: "1" },
//       { param: "stage",    kind: "slider", label: "Start Stage", min: 0, max: 4 },
//       { param: "boss",     kind: "toggle", label: "Akuma Boss", on: "goki" },
//     ],
//     music: { playerUrl: "https://…/player.html", album: {…} },  // Music blade
//     look:  { scanlines: true, vignette: true },                  // Look blade
//   };
//
// Cheats are applied by rewriting the URL query string and reloading — exactly
// how the launcher's cmg-cheats work — so a standalone game picks them up on
// boot with no launcher involvement. The Music blade embeds the AZ Legend player
// (same music-player: postMessage protocol as static/music-player/sound.js) and
// falls back to whatever album the game last broadcast (localStorage
// "azlegend:last-album"). The Look blade toggles cosmetic CRT overlays.
(function () {
  "use strict";
  if (window.__cmgOsdLoaded) return;
  window.__cmgOsdLoaded = true;

  var CFG = window.__CMG_OSD__ || {};
  var qs = new URLSearchParams(location.search);

  var cheats = Array.isArray(CFG.cheats) ? CFG.cheats : [];
  var musicCfg = CFG.music || {};
  var lookCfg = CFG.look || {};
  // Player URL priority: ?osdPlayer= override (handy for testing against a local
  // azlegend checkout) → config → none (Music blade shows a hint if absent).
  var playerUrl = qs.get("osdPlayer") || musicCfg.playerUrl || "";

  // Phaser-launcher navy palette (Claude Design "OSD Mobile"): coordinated,
  // quieter blade accents. `rgb` feeds rgba() tints in CSS; `lt` is the light
  // tint used for the collapsed-strip label.
  var BLADES = [
    { id: "game", label: "Game", accent: "#7aa2ee", rgb: "122,162,238", lt: "#b9ccf6" },
    { id: "music", label: "Music", accent: "#54c9d8", rgb: "84,201,216", lt: "#bdeef4" },
    { id: "look", label: "Look", accent: "#e2b45f", rgb: "226,180,95", lt: "#f2dca8" },
  ];

  var state = { open: false, blade: "game", comboActive: false };

  // ── styles ────────────────────────────────────────────────────────────────
  var style = document.createElement("style");
  style.textContent = [
    ".cmg-osd-root{position:fixed;inset:0;z-index:2147483000;display:none;font-family:'Sora',system-ui,-apple-system,sans-serif;color:#f2ece3;-webkit-font-smoothing:antialiased;-webkit-tap-highlight-color:transparent}",
    ".cmg-osd-root.open{display:block}",
    // Phaser navy backdrop with a soft blue glow in the top-right.
    ".cmg-osd-scrim{position:absolute;inset:0;background:radial-gradient(130% 92% at 100% 0%, rgba(122,162,238,0.18), transparent 55%), linear-gradient(155deg,#0c1030 0%,#141d44 48%,#20355c 100%)}",
    ".cmg-osd-blades{position:absolute;inset:0;display:flex;gap:0;box-sizing:border-box}",
    // A blade collapses to a narrow accent-tinted strip; the active one expands
    // and goes transparent so the navy backdrop shows through (per the mockup).
    ".cmg-osd-blade{position:relative;flex:0 0 46px;overflow:hidden;cursor:pointer;transition:flex-basis .28s cubic-bezier(.4,0,.2,1);display:flex;flex-direction:column;background:linear-gradient(180deg,rgba(var(--acc-rgb),0.16),rgba(var(--acc-rgb),0.04));border-left:1px solid rgba(var(--acc-rgb),0.24)}",
    ".cmg-osd-blade:first-child{border-left:0}",
    ".cmg-osd-blade.active{flex:1 1 auto;cursor:default;background:transparent;border-left:0}",
    ".cmg-osd-blade:not(.active):hover{background:linear-gradient(180deg,rgba(var(--acc-rgb),0.26),rgba(var(--acc-rgb),0.08))}",
    ".cmg-osd-blade .tab{position:relative;flex:0 0 auto;text-align:center;text-transform:uppercase;font-weight:700;letter-spacing:3px;font-size:12px;padding:5px 0 16px;color:var(--acc)}",
    ".cmg-osd-blade:not(.active) .tab{writing-mode:vertical-rl;transform:rotate(180deg);margin:auto;padding:0;font-weight:600;font-size:13px;letter-spacing:2.5px;color:var(--acc-lt)}",
    ".cmg-osd-blade .body{position:relative;flex:1 1 auto;overflow-y:auto;padding:0 16px 20px;display:none}",
    ".cmg-osd-blade.active .body{display:block}",
    ".cmg-osd-h{font-family:'Baloo 2',system-ui,sans-serif;font-size:29px;font-weight:800;line-height:1.05;color:#f2ece3;margin:0 0 18px}",
    ".cmg-osd-h .acc{color:var(--acc)}",
    ".cmg-osd-h .dash{color:#5a648a;font-weight:700}",
    // Glass cards.
    ".cmg-osd-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:15px 17px;margin-bottom:11px;background:rgba(255,255,255,0.045);border:1px solid rgba(131,167,241,0.16);border-radius:16px}",
    ".cmg-osd-row .lbl{font-size:17px;font-weight:700;color:#f2ece3}",
    ".cmg-osd-row .sub{font-size:13px;font-weight:400;color:#9fb0d6;margin-top:4px}",
    ".cmg-osd-sw{position:relative;width:52px;height:30px;border-radius:15px;background:rgba(255,255,255,0.13);flex:0 0 auto;transition:background .18s;cursor:pointer}",
    ".cmg-osd-sw.on{background:var(--acc)}",
    ".cmg-osd-sw::after{content:'';position:absolute;top:2px;left:2px;width:26px;height:26px;border-radius:50%;background:#fff;transition:transform .18s;box-shadow:0 2px 5px rgba(0,0,0,0.35)}",
    ".cmg-osd-sw.on::after{transform:translateX(22px)}",
    ".cmg-osd-slider{display:flex;align-items:center;gap:10px;flex:1 1 auto;min-width:0}",
    ".cmg-osd-slider input{flex:1;min-width:20px;accent-color:var(--acc)}",
    ".cmg-osd-slider .val{min-width:14px;text-align:center;font-weight:700;font-size:16px;color:#f2ece3}",
    ".cmg-osd-btn{appearance:none;font-family:'Sora',sans-serif;border:1px solid rgba(255,255,255,0.18);background:rgba(255,255,255,0.05);color:#f2ece3;font-weight:700;font-size:15px;padding:11px 17px;border-radius:13px;cursor:pointer;display:inline-flex;align-items:center;gap:9px}",
    ".cmg-osd-btn:hover{background:rgba(255,255,255,0.1)}",
    ".cmg-osd-btn.accent{color:#cfe0ff;background:rgba(var(--acc-rgb),0.16);border:1px solid rgba(var(--acc-rgb),0.4);border-radius:11px;padding:9px 14px;font-size:14px}",
    ".cmg-osd-btn.accent:hover{background:rgba(var(--acc-rgb),0.28)}",
    ".cmg-osd-close{position:absolute;top:9px;right:8px;z-index:6;width:32px;height:32px;border-radius:50%;border:1px solid rgba(255,255,255,0.16);background:rgba(10,14,34,0.55);color:#e6ecfb;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center}",
    ".cmg-osd-close:hover{background:rgba(20,26,54,0.85)}",
    ".cmg-osd-hint{position:absolute;bottom:13px;left:0;right:0;text-align:center;font-size:12px;font-weight:400;color:#7f8db3;padding:0 16px}",
    ".cmg-osd-track{display:flex;align-items:center;gap:10px;padding:11px 13px;margin:5px 0;border-radius:10px;background:rgba(255,255,255,0.045);border:1px solid rgba(131,167,241,0.16);cursor:pointer}",
    ".cmg-osd-track.playing{background:rgba(84,201,216,0.22);border-color:rgba(84,201,216,0.4)}",
    ".cmg-osd-track .ti{flex:1 1 auto;font-size:14px;color:#f2ece3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    ".cmg-osd-mrow{display:flex;gap:10px;align-items:center;margin:10px 0}",
    ".cmg-osd-mrow .cmg-osd-btn{min-width:52px;justify-content:center}",
    ".cmg-osd-frame{width:100%;height:0;border:0}",
    ".cmg-osd-empty{color:#9fb0d6;font-size:14px;padding:14px 2px}",
    // CRT overlays applied to the whole page by the Look blade.
    "#cmg-osd-crt{position:fixed;inset:0;z-index:2147482000;pointer-events:none;display:none}",
    "#cmg-osd-crt.scan{display:block;background:repeating-linear-gradient(0deg,rgba(0,0,0,.22),rgba(0,0,0,.22) 1px,transparent 1px,transparent 3px)}",
    "#cmg-osd-crt.vig{display:block;box-shadow:inset 0 0 180px 40px rgba(0,0,0,.65)}",
    "#cmg-osd-crt.scan.vig{background:repeating-linear-gradient(0deg,rgba(0,0,0,.22),rgba(0,0,0,.22) 1px,transparent 1px,transparent 3px)}",
  ].join("\n");
  document.head.appendChild(style);

  // Baloo 2 + Sora (best-effort; falls back to system-ui offline / under CSP).
  var fontLink = document.createElement("link");
  fontLink.rel = "stylesheet";
  fontLink.href =
    "https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Sora:wght@400;500;600;700&display=swap";
  document.head.appendChild(fontLink);

  // CRT overlay element (persists across OSD open/close).
  var crt = document.createElement("div");
  crt.id = "cmg-osd-crt";
  function applyLook() {
    var scan = localStorage.getItem("cmg-osd-scanlines") === "1";
    var vig = localStorage.getItem("cmg-osd-vignette") === "1";
    crt.className = (scan ? "scan " : "") + (vig ? "vig" : "");
  }

  // ── root DOM ────────────────────────────────────────────────────────────────
  var root = document.createElement("div");
  root.className = "cmg-osd-root";
  root.innerHTML = '<div class="cmg-osd-scrim"></div>' +
    '<button class="cmg-osd-close" aria-label="Close">✕</button>' +
    '<div class="cmg-osd-blades"></div>' +
    '<div class="cmg-osd-hint">Press bottom-left + top-right together to toggle • Esc to close</div>';
  var bladesEl = root.querySelector(".cmg-osd-blades");

  BLADES.forEach(function (b) {
    var el = document.createElement("div");
    el.className = "cmg-osd-blade" + (b.id === state.blade ? " active" : "");
    el.dataset.blade = b.id;
    // Per-blade accent drives the strip tint, header, toggles, slider and Apply
    // button via the --acc / --acc-rgb / --acc-lt custom properties.
    el.style.setProperty("--acc", b.accent);
    el.style.setProperty("--acc-rgb", b.rgb);
    el.style.setProperty("--acc-lt", b.lt);
    el.innerHTML = '<div class="tab">' + b.label + "</div>" +
      '<div class="body"></div>';
    el.addEventListener("click", function (e) {
      if (el.classList.contains("active")) return;
      // Ignore clicks that originated on a control inside an active blade.
      selectBlade(b.id);
      e.stopPropagation();
    });
    bladesEl.appendChild(el);
  });

  function bladeBody(id) {
    return bladesEl.querySelector('.cmg-osd-blade[data-blade="' + id + '"] .body');
  }

  function selectBlade(id) {
    state.blade = id;
    Array.prototype.forEach.call(bladesEl.children, function (el) {
      el.classList.toggle("active", el.dataset.blade === id);
    });
    if (id === "music") ensureMusic();
  }

  // Two-tone Baloo 2 blade heading: "<plain> — <accentWord>" (dash only when
  // asked), the accent word tinted in the blade's accent per the mockup.
  function bladeTitle(plain, accentWord, dash) {
    var h = document.createElement("div");
    h.className = "cmg-osd-h";
    h.appendChild(document.createTextNode(plain + " "));
    if (dash) {
      var d = document.createElement("span");
      d.className = "dash";
      d.textContent = "— ";
      h.appendChild(d);
    }
    if (accentWord) {
      var a = document.createElement("span");
      a.className = "acc";
      a.textContent = accentWord;
      h.appendChild(a);
    }
    return h;
  }

  // ── Game blade (cheats) ─────────────────────────────────────────────────────
  function renderGame() {
    var body = bladeBody("game");
    body.innerHTML = "";
    body.appendChild(bladeTitle(CFG.title || "Game", "Cheats", true));

    if (!cheats.length) {
      var e = document.createElement("div");
      e.className = "cmg-osd-empty";
      e.textContent = "No cheats configured for this game.";
      body.appendChild(e);
    }

    cheats.forEach(function (c) {
      var row = document.createElement("div");
      row.className = "cmg-osd-row";
      var left = document.createElement("div");
      var lbl = document.createElement("div");
      lbl.className = "lbl";
      lbl.textContent = c.label || c.param;
      left.appendChild(lbl);
      if (c.sub) {
        var sub = document.createElement("div");
        sub.className = "sub";
        sub.textContent = c.sub;
        left.appendChild(sub);
      }
      row.appendChild(left);

      if (c.kind === "slider") {
        var wrap = document.createElement("div");
        wrap.className = "cmg-osd-slider";
        var input = document.createElement("input");
        input.type = "range";
        input.min = c.min != null ? c.min : 0;
        input.max = c.max != null ? c.max : 9;
        input.step = c.step != null ? c.step : 1;
        var cur = qs.get(c.param);
        input.value = cur != null ? cur : (c.min != null ? c.min : 0);
        var val = document.createElement("span");
        val.className = "val";
        val.textContent = input.value;
        input.addEventListener("input", function () { val.textContent = input.value; });
        wrap.appendChild(input);
        wrap.appendChild(val);
        var apply = document.createElement("button");
        apply.className = "cmg-osd-btn accent";
        apply.textContent = "Apply";
        apply.addEventListener("click", function () {
          applyCheat(c.param, input.value);
        });
        wrap.appendChild(apply);
        row.appendChild(wrap);
      } else {
        // toggle: param present with value c.on means "on".
        var onVal = c.on != null ? String(c.on) : "1";
        var isOn = qs.get(c.param) === onVal;
        var sw = document.createElement("div");
        sw.className = "cmg-osd-sw" + (isOn ? " on" : "");
        sw.addEventListener("click", function () {
          applyCheat(c.param, isOn ? null : onVal);
        });
        row.appendChild(sw);
      }
      body.appendChild(row);
    });

    // Restart applies nothing new but reloads the current query (handy after
    // fiddling, and the only "action" that makes sense with no launcher).
    var restart = document.createElement("button");
    restart.className = "cmg-osd-btn";
    restart.style.marginTop = "10px";
    restart.textContent = "↻ Restart Game";
    restart.addEventListener("click", function () { location.reload(); });
    body.appendChild(restart);
  }

  // Rewrite one query param and reload so the game re-reads it on boot. value
  // === null removes the param (toggle off).
  function applyCheat(param, value) {
    var p = new URLSearchParams(location.search);
    if (value === null || value === "" || value === undefined) p.delete(param);
    else p.set(param, value);
    var q = p.toString();
    location.search = q ? "?" + q : "";
  }

  // ── Music blade (AZ Legend player) ──────────────────────────────────────────
  var music = { frame: null, ready: false, album: null, queue: [], origin: "*", reqSeq: 0, poll: null };
  var MP = "music-player:";

  function musicAlbum() {
    if (musicCfg.album && Array.isArray(musicCfg.album.tracks)) return musicCfg.album;
    try {
      var raw = localStorage.getItem("azlegend:last-album");
      if (raw) {
        var a = JSON.parse(raw);
        if (a && Array.isArray(a.tracks) && a.tracks.length) return a;
      }
    } catch (_e) { /* ignore */ }
    return null;
  }

  function mpost(msg) {
    if (!music.ready) { music.queue.push(msg); return; }
    try { music.frame.contentWindow.postMessage(msg, music.origin); } catch (_e) {}
  }

  function onMusicMessage(ev) {
    var d = ev.data;
    if (!d || typeof d.type !== "string" || d.type.indexOf(MP) !== 0) return;
    if (music.frame && ev.source !== music.frame.contentWindow) return;
    var cmd = d.type.slice(MP.length);
    if (cmd === "ready") {
      music.origin = ev.origin || "*";
      var album = music.album || musicAlbum();
      if (album) {
        try { music.frame.contentWindow.postMessage({ type: MP + "add-albums", albums: [album], select: album.id }, music.origin); } catch (_e) {}
      }
    } else if (cmd === "event" && d.event === "albums-changed") {
      music.ready = true;
      while (music.queue.length) mpost(music.queue.shift());
      renderMusic();
    } else if (cmd === "state") {
      updateNowPlaying(d.state);
    }
  }

  function ensureMusic() {
    var body = bladeBody("music");
    if (music.frame) { requestState(); return; }
    body.innerHTML = "";
    body.appendChild(bladeTitle("Sound", "Mix", false));

    if (!playerUrl) {
      var e = document.createElement("div");
      e.className = "cmg-osd-empty";
      e.textContent = "No music player configured (set music.playerUrl or ?osdPlayer=).";
      body.appendChild(e);
      return;
    }
    music.album = musicAlbum();
    window.addEventListener("message", onMusicMessage);
    var frame = document.createElement("iframe");
    frame.className = "cmg-osd-frame";
    frame.setAttribute("allow", "autoplay");
    frame.style.height = "200px";
    frame.style.borderRadius = "10px";
    frame.style.marginBottom = "12px";
    // Load the player with its own catalog so the Music blade is a full music
    // app; the game's album (if any) is added on top via add-albums on ready.
    frame.src = new URL(playerUrl, location.href).href;
    music.frame = frame;
    body.appendChild(frame);

    // transport + track list containers
    var transport = document.createElement("div");
    transport.className = "cmg-osd-mrow";
    transport.id = "cmg-osd-transport";
    body.appendChild(transport);
    var list = document.createElement("div");
    list.id = "cmg-osd-tracklist";
    body.appendChild(list);
    renderMusic();
    startMusicPoll(); // frame now exists; begin now-playing polling if open
  }

  function renderMusic() {
    var album = music.album || musicAlbum();
    var transport = document.getElementById("cmg-osd-transport");
    var list = document.getElementById("cmg-osd-tracklist");
    if (!transport || !list) return;
    transport.innerHTML = "";
    ["⏮ Prev", "⏯ Play", "⏭ Next"].forEach(function (t, i) {
      var b = document.createElement("button");
      b.className = "cmg-osd-btn";
      b.textContent = t;
      b.addEventListener("click", function () {
        if (i === 0) mpost({ type: MP + "prev" });
        else if (i === 1) mpost({ type: MP + "play" });
        else mpost({ type: MP + "next" });
        setTimeout(requestState, 150);
      });
      transport.appendChild(b);
    });

    list.innerHTML = "";
    if (!album || !album.tracks.length) {
      var e = document.createElement("div");
      e.className = "cmg-osd-empty";
      e.textContent = "No album broadcast by the game yet.";
      list.appendChild(e);
      return;
    }
    album.tracks.forEach(function (tr) {
      var row = document.createElement("div");
      row.className = "cmg-osd-track";
      row.dataset.track = tr.id;
      var ti = document.createElement("div");
      ti.className = "ti";
      ti.textContent = tr.title || tr.id;
      row.appendChild(ti);
      row.addEventListener("click", function () {
        mpost({ type: MP + "play", album: album.id, track: tr.id });
        setTimeout(requestState, 150);
      });
      list.appendChild(row);
    });
    requestState();
  }

  function requestState() {
    if (!music.ready) return;
    mpost({ type: MP + "get-state", requestId: ++music.reqSeq });
  }

  function updateNowPlaying(s) {
    if (!s) return;
    var list = document.getElementById("cmg-osd-tracklist");
    if (!list) return;
    Array.prototype.forEach.call(list.querySelectorAll(".cmg-osd-track"), function (row) {
      var on = !s.paused && row.dataset.track === s.currentTrackId;
      row.classList.toggle("playing", on);
    });
  }

  // ── Look blade ───────────────────────────────────────────────────────────────
  function renderLook() {
    var body = bladeBody("look");
    body.innerHTML = "";
    body.appendChild(bladeTitle("Display", "Look", false));

    var opts = [];
    if (lookCfg.scanlines !== false) opts.push({ key: "cmg-osd-scanlines", label: "CRT Scanlines", sub: "Retro scanline overlay" });
    if (lookCfg.vignette !== false) opts.push({ key: "cmg-osd-vignette", label: "CRT Vignette", sub: "Darkened screen edges" });

    opts.forEach(function (o) {
      var row = document.createElement("div");
      row.className = "cmg-osd-row";
      var left = document.createElement("div");
      var lbl = document.createElement("div");
      lbl.className = "lbl";
      lbl.textContent = o.label;
      left.appendChild(lbl);
      var sub = document.createElement("div");
      sub.className = "sub";
      sub.textContent = o.sub;
      left.appendChild(sub);
      row.appendChild(left);
      var isOn = localStorage.getItem(o.key) === "1";
      var sw = document.createElement("div");
      sw.className = "cmg-osd-sw" + (isOn ? " on" : "");
      sw.addEventListener("click", function () {
        var next = !(localStorage.getItem(o.key) === "1");
        localStorage.setItem(o.key, next ? "1" : "0");
        sw.classList.toggle("on", next);
        applyLook();
      });
      row.appendChild(sw);
      body.appendChild(row);
    });
  }

  // ── open / close ─────────────────────────────────────────────────────────────
  // Poll the player for now-playing while the OSD is open and the player frame
  // exists. Centralized so it starts whether the music blade is opened up-front
  // (openOsd) or lazily later (ensureMusic creates the frame after openOsd ran).
  function startMusicPoll() {
    if (state.open && music.frame && !music.poll) {
      music.poll = setInterval(requestState, 1500);
    }
  }
  function stopMusicPoll() {
    if (music.poll) { clearInterval(music.poll); music.poll = null; }
  }
  function openOsd() {
    if (state.open) return;
    state.open = true;
    renderGame();
    renderLook();
    if (state.blade === "music") ensureMusic();
    root.classList.add("open");
    startMusicPoll();
  }
  function closeOsd() {
    if (!state.open) return;
    state.open = false;
    root.classList.remove("open");
    stopMusicPoll();
  }
  function toggleOsd() { state.open ? closeOsd() : openOsd(); }

  root.querySelector(".cmg-osd-close").addEventListener("click", closeOsd);
  root.querySelector(".cmg-osd-scrim").addEventListener("click", closeOsd);

  // ── secret two-corner touch ──────────────────────────────────────────────────
  // Edge-triggered: fire once when a bottom-left AND a top-right touch coexist.
  function cornersHeld(touches) {
    var W = window.innerWidth, H = window.innerHeight;
    var bl = false, tr = false;
    for (var i = 0; i < touches.length; i++) {
      var t = touches[i];
      if (t.clientX < W * 0.28 && t.clientY > H * 0.72) bl = true;
      if (t.clientX > W * 0.72 && t.clientY < H * 0.28) tr = true;
    }
    return bl && tr;
  }
  function onTouchStart(e) {
    // Toggle only on press, when the combo first forms (latched by comboActive).
    if (cornersHeld(e.touches || []) && !state.comboActive) {
      state.comboActive = true;
      toggleOsd();
    }
  }
  function onTouchRelease(e) {
    // Only clear the latch once the combo is broken so it can re-arm — never
    // toggle on release (lifting one corner re-evaluated the combo and could
    // double-fire the toggle).
    if (!cornersHeld(e.touches || [])) state.comboActive = false;
  }
  // Capture phase so the gesture is detected even over the game canvas. Passive
  // (we don't preventDefault the whole page) but when the OSD is open we swallow
  // touches that land on it so they don't reach the game underneath.
  window.addEventListener("touchstart", onTouchStart, { capture: true, passive: true });
  window.addEventListener("touchend", onTouchRelease, { capture: true, passive: true });
  window.addEventListener("touchcancel", onTouchRelease, { capture: true, passive: true });
  root.addEventListener("touchstart", function (e) { if (state.open) e.stopPropagation(); }, true);

  // Desktop parity. When embedded in the cmg launcher, the launcher already owns
  // the backtick key (it forwards it to open the launcher's own OSD — see the
  // 2028-ai route's OSD_BRIDGE), so only bind backtick-toggle when running
  // standalone to avoid double-opening. Escape-to-close is always safe; the
  // secret touch is the primary trigger in both contexts.
  var standalone = window.top === window.self;
  window.addEventListener("keydown", function (e) {
    if (standalone && (e.key === "`" || e.code === "Backquote")) { e.preventDefault(); toggleOsd(); }
    else if (e.key === "Escape" && state.open) { e.preventDefault(); closeOsd(); }
  }, true);

  // ── boot ─────────────────────────────────────────────────────────────────────
  function boot() {
    document.body.appendChild(crt);
    document.body.appendChild(root);
    applyLook();
    // Expose a tiny API for host pages / tests.
    window.cmgOsd = { open: openOsd, close: closeOsd, toggle: toggleOsd, select: selectBlade };
  }
  if (document.body) boot();
  else document.addEventListener("DOMContentLoaded", boot);
})();
