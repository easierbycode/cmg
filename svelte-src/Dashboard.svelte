<script>
  import { onMount, onDestroy } from 'svelte';

  const MAIN_MENU = [
    { id: 'memory',   label: 'Memory',   tag: '01 / sys.core', num: '0x01' },
    { id: 'games',    label: 'Games',    tag: '02 / disc.io',  num: '0x02' },
    { id: 'settings', label: 'Settings', tag: '03 / config',   num: '0x03' },
  ];

  const GAMES = [
    { id: '2019-es7',                                              name: '2028',                title: '2028',                sub: 'ES7 // Phaser 3', icon: '/icons/2028-icon.png',                size: '12.4 MB', date: '07.28.22' },
    { id: 'games/evil-invaders/index.html?turbo=1&audio=1',        name: 'Peachy Skies',        title: 'PEACHY SKIES',        sub: 'Turbo + Audio',   icon: '/icons/headphone-invader-icon.png',   size: '8.2 MB',  date: '10.13.24' },
    { id: 'evil-invaders',                                         name: 'Evil Invaders',       title: 'EVIL INVADERS',       sub: 'Classic',         icon: '/icons/evil-invaders-icon.png',       size: '9.6 MB',  date: '04.04.23' },
    { id: 'hellophaser/v3',                                        name: 'RonaGun',             title: 'RONAGUN',             sub: 'Phaser v3 demo',  icon: null,                                   size: '3.1 MB',  date: '08.08.22' },
    { id: 'squad-game',                                            name: 'Squad Game',          title: 'SQUAD GAME',          sub: '👨🏽‍💻 👾💾🖳 👩🏽‍💻',  icon: '/icons/squad-game.png',                size: '5.7 MB',  date: '11.02.23' },
    { id: 'evil-invaders-phaser4/?scene=MutoidScene&loop=2',       name: 'Mutoid',              title: 'MUTOID',              sub: 'Phaser 4 // loop:2', icon: '/icons/evil-invaders-icon.png',     size: '11.8 MB', date: '06.21.25' },
    { id: 'pacman-halloween-2025',                                 name: 'PAC-MAN Halloween',   title: 'PAC-MAN: HALLOWEEN',  sub: 'Seasonal',        icon: null,                                   size: '14.2 MB', date: '10.31.25' },
    { id: 'shmup-party-phaser3',                                   name: 'Sh’M↑ Party',         title: 'SH\'M↑ PARTY',        sub: 'Multiplayer',     icon: '/icons/shmup-party-icon.png',          size: '7.9 MB',  date: '02.14.24' },
    { id: 'monkey-kombat',                                         name: 'Monkey Kombat',       title: 'MONKEY KOMBAT',       sub: '🐵ᕗ ─=≡ΣO))',     icon: null,                                   size: '6.4 MB',  date: '05.19.26' },
  ];

  let screen = $state('dashboard'); // 'dashboard' | 'games'
  let menuSel = $state(1);           // start on Games
  let gameSel = $state(0);
  let clockStr = $state('--:--:--');
  let gameSrc = $state(null);
  let gameOn = $state(false);
  let bootGone = $state(false);
  let menuEls = $state([]);
  let gameRowEls = $state([]);
  let gameListEl = $state(null);

  $effect(() => {
    if (screen !== 'games') return;
    const el = gameRowEls[gameSel];
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });

  let currentGame = $derived(GAMES[gameSel]);
  let clockShort = $derived(clockStr.slice(0, 5));
  let counterText = $derived(
    String(gameSel + 1).padStart(2, '0') + ' / ' + String(GAMES.length).padStart(2, '0')
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
    screen = 'dashboard';
  }

  function launchGame(id) {
    sfx.enter();
    gameSrc = 'https://easierbycode.com/' + id;
    setTimeout(() => { gameOn = true; }, 30);
  }

  function closeGame() {
    gameOn = false;
    setTimeout(() => { gameSrc = null; }, 500);
    sfx.back();
  }

  function onIconError(e, name) {
    const img = e.currentTarget;
    const parent = img.parentNode;
    if (parent) parent.innerHTML = '<span class="ph">' + initial(name) + '</span>';
  }

  let clockTimer;
  let bootTimer;
  let padRaf = null;
  let padHadConnection = false;
  const padState = {
    btn: new Set(),
    axisDir: 0,
    lastNavAt: 0,
    initialDelayMs: 280,
    repeatMs: 110,
    holdingSince: 0,
  };
  const PAD_DEADZONE = 0.55;

  function navUp() {
    if (screen === 'dashboard') menuSel = Math.max(menuSel - 1, 0);
    else if (screen === 'games') gameSel = Math.max(gameSel - 1, 0);
    sfx.nav();
  }
  function navDown() {
    if (screen === 'dashboard') menuSel = Math.min(menuSel + 1, MAIN_MENU.length - 1);
    else if (screen === 'games') gameSel = Math.min(gameSel + 1, GAMES.length - 1);
    sfx.nav();
  }
  function actA() {
    if (gameOn) return;
    if (screen === 'dashboard') pickMenu(menuSel);
    else if (screen === 'games') launchGame(GAMES[gameSel].id);
  }
  function actB() {
    if (gameOn) closeGame();
    else if (screen === 'games') goBack();
  }

  // Custom gamepad polling drives dashboard nav (vertical). When a game iframe
  // is active, body.playing is set and the launcher's gamepad-support.js takes
  // over and dispatches keys into iframe#gameframe — we yield to it.
  function pollPad() {
    padRaf = requestAnimationFrame(pollPad);
    if (gameOn) { padState.btn.clear(); padState.axisDir = 0; return; }
    const pads = (navigator.getGamepads && navigator.getGamepads()) || [];
    let pad = null;
    for (const p of pads) { if (p && p.connected) { pad = p; break; } }
    if (!pad) { padState.btn.clear(); padState.axisDir = 0; return; }
    if (!padHadConnection) { padHadConnection = true; try { getAc()?.resume(); } catch (_) {} }

    const now = performance.now();
    const ay = pad.axes[1] ?? 0;
    const dpadUp = !!pad.buttons[12]?.pressed;
    const dpadDown = !!pad.buttons[13]?.pressed;
    let dir = 0;
    if (dpadUp || ay < -PAD_DEADZONE) dir = -1;
    else if (dpadDown || ay > PAD_DEADZONE) dir = 1;

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

    sfx.boot();
    document.addEventListener('click', unlockAudio, { once: true });
    bootTimer = setTimeout(() => { bootGone = true; }, 1600);

    window.addEventListener('keydown', onKey);
    padRaf = requestAnimationFrame(pollPad);
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
    document.body.classList.remove('playing');
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

  <div class="dashboard {screen === 'games' ? 'gone' : ''}">
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
          <div><span class="k">type</span><b>GAME / IFRAME</b></div>
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
                <span class="name">{g.title}</span>
                <span class="sub">{g.sub}</span>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>

  {#if screen === 'games'}
    <div class="footer left">
      <div class="btn-hint b">B</div>
      <span style="cursor:pointer" onclick={goBack}>Back</span>
    </div>
  {/if}
  <div class="footer">
    <div class="btn-hint">A</div>
    <span>{screen === 'games' ? 'Launch' : 'Select'}</span>
  </div>
</div>

<div class="game-iframe {gameOn ? 'on' : ''}">
  <button type="button" class="close-game" onclick={closeGame}>⨯ Close</button>
  <iframe
    id={gameOn ? 'gameframe' : undefined}
    src={gameSrc ?? 'about:blank'}
    title="game"
    allow="autoplay; fullscreen; gamepad; xr-spatial-tracking"
    allowfullscreen
  ></iframe>
</div>
