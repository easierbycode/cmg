// "Soft Mod" — a self-contained Phaser 4.2.1 cinematic re-imagining of the
// original-Xbox MechAssault soft-mod (Penguin Script → Winbond TSOP flash →
// reboot). Booted by the launcher's opposite-corner easter egg (top-left +
// bottom-right tap — the mirror of the normal OSD corner gesture). See
// routes/demos/softmod.tsx for the host page and the storyboard this follows.
//
// Everything is procedural: all textures are generated at runtime (Graphics /
// canvas gradients → generateTexture), so the demo ships no asset files —
// same no-bundle shape as the vertical-shooter / headphones-recommended demos.
// A tiny WebAudio synth provides the hum / blips / boot chime; it's best-effort
// and unlocks on the first pointer/key so autoplay policy can't break the
// visuals.

/* global Phaser */

const GAME_W = 1280;
const GAME_H = 720;

// Palette ------------------------------------------------------------------
const BLUE_CORE = 0xdff2ff; // white-blue orb core
const BLUE_MID = 0x4fb4ff; // orb body
const BLUE_DEEP = 0x0a3a7a; // orb halo / lights
const XB_GREEN = 0x9bca3e; // Xbox "nuclear" green
const XB_GREEN_D = 0x3f6b14;
const TERM_GREEN = "#5dff8a";
const AMBER = "#ffcc44";

// ─── tiny WebAudio synth ────────────────────────────────────────────────────
// Just enough to make the sequence feel alive: a rising orb whoosh, UI blips,
// flash ticks and a four-note boot chime. All guarded — if WebAudio is blocked
// the cinematic still runs silently.
const Sfx = (() => {
  let ctx = null;
  function ac() {
    if (ctx) return ctx;
    try {
      ctx = new (globalThis.AudioContext || globalThis.webkitAudioContext)();
    } catch (_) {
      ctx = null;
    }
    return ctx;
  }
  function unlock() {
    const c = ac();
    if (c && c.state !== "running") c.resume().catch(() => {});
  }
  function tone(freq, dur, type = "sine", gain = 0.12, when = 0) {
    const c = ac();
    if (!c) return;
    const t0 = c.currentTime + when;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  }
  return {
    unlock,
    blip() {
      tone(660, 0.06, "square", 0.05);
    },
    select() {
      tone(880, 0.08, "square", 0.06);
      tone(1320, 0.1, "square", 0.05, 0.04);
    },
    tick() {
      tone(1800, 0.025, "square", 0.02);
    },
    whoosh() {
      const c = ac();
      if (!c) return;
      const t0 = c.currentTime;
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(90, t0);
      o.frequency.exponentialRampToValueAtTime(720, t0 + 2.4);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.09, t0 + 0.6);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.6);
      o.connect(g);
      g.connect(c.destination);
      o.start(t0);
      o.stop(t0 + 2.7);
    },
    boom() {
      tone(60, 0.7, "sine", 0.22);
      tone(120, 0.5, "sine", 0.12);
    },
    chime() {
      // A short ascending arpeggio standing in for the Xbox boot chime.
      const notes = [392, 523.25, 659.25, 783.99];
      notes.forEach((f, i) => {
        tone(f, 0.5, "triangle", 0.08, i * 0.12);
        tone(f * 2, 0.4, "sine", 0.04, i * 0.12);
      });
    },
  };
})();

// ─── texture helpers ────────────────────────────────────────────────────────
// Radial-gradient soft disc, used for the orb, point lights and particles.
function makeGlow(scene, key, size, inner, outer) {
  if (scene.textures.exists(key)) return;
  const cv = document.createElement("canvas");
  cv.width = cv.height = size;
  const g = cv.getContext("2d");
  const r = size / 2;
  const grd = g.createRadialGradient(r, r, 0, r, r, r);
  grd.addColorStop(0, inner);
  grd.addColorStop(0.45, outer);
  grd.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grd;
  g.beginPath();
  g.arc(r, r, r, 0, Math.PI * 2);
  g.fill();
  scene.textures.addCanvas(key, cv);
}

// A single CRT scanline tile (2px tall: one dark line) → tiled over a screen.
function makeScanlines(scene, key) {
  if (scene.textures.exists(key)) return;
  const cv = document.createElement("canvas");
  cv.width = 4;
  cv.height = 3;
  const g = cv.getContext("2d");
  g.fillStyle = "rgba(0,0,0,0.5)";
  g.fillRect(0, 2, 4, 1);
  scene.textures.addCanvas(key, cv);
}

// Soft petal/wing for the flutter ring (a tinted glow disc squashed in code).
function makePetal(scene, key) {
  if (scene.textures.exists(key)) return;
  const cv = document.createElement("canvas");
  cv.width = 48;
  cv.height = 48;
  const g = cv.getContext("2d");
  const grd = g.createRadialGradient(24, 24, 0, 24, 24, 24);
  grd.addColorStop(0, "rgba(220,242,255,0.95)");
  grd.addColorStop(0.5, "rgba(79,180,255,0.55)");
  grd.addColorStop(1, "rgba(10,58,122,0)");
  g.fillStyle = grd;
  g.beginPath();
  g.ellipse(24, 24, 22, 12, 0, 0, Math.PI * 2);
  g.fill();
  scene.textures.addCanvas(key, cv);
}

// ─── the cinematic ──────────────────────────────────────────────────────────
class SoftmodScene extends Phaser.Scene {
  constructor() {
    super("softmod");
    this.skipped = false;
  }

  create() {
    const cam = this.cameras.main;
    cam.setBackgroundColor("#000000");

    makeGlow(this, "glow", 256, "rgba(255,255,255,1)", "rgba(180,224,255,0.7)");
    makeGlow(this, "bluelight", 512, "rgba(120,200,255,0.9)", "rgba(10,58,122,0.5)");
    makeGlow(this, "greenlight", 512, "rgba(155,202,62,0.9)", "rgba(40,80,10,0.5)");
    makeGlow(this, "spark", 64, "rgba(255,255,255,1)", "rgba(150,210,255,0.6)");
    makePetal(this, "petal");
    makeScanlines(this, "scan");

    // Per-phase content lives in this container; cleared on each transition.
    this.stage = this.add.container(0, 0);

    // Skip affordance — tap, click or any key jumps to the reboot.
    const hint = this.add
      .text(GAME_W - 24, GAME_H - 20, "tap to skip", {
        fontFamily: "monospace",
        fontSize: "16px",
        color: "#3a5a7a",
      })
      .setOrigin(1, 1)
      .setDepth(1000);
    this.tweens.add({ targets: hint, alpha: 0.25, yoyo: true, repeat: -1, duration: 1200 });

    const unlock = () => Sfx.unlock();
    this.input.on("pointerdown", unlock);
    this.input.keyboard?.on("keydown", unlock);
    const skip = () => this.requestSkip();
    this.input.on("pointerdown", skip);
    this.input.keyboard?.once("keydown-ESC", skip);

    this.run();
  }

  requestSkip() {
    if (this.skipped || this.finished) return;
    this.skipped = true;
    // Tear down whatever is running and jump straight to the reboot bookend.
    this.tweens.killAll();
    this.time.removeAllEvents();
    this.cameras.main.resetFX();
    this.clearStage();
    this.phaseReboot().then(() => this.finish());
  }

  // ── small async helpers ────────────────────────────────────────────────
  wait(ms) {
    return new Promise((res) => this.time.delayedCall(ms, res));
  }
  fadeOut(ms = 500) {
    return new Promise((res) => {
      this.cameras.main.fadeOut(ms, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", res);
    });
  }
  fadeIn(ms = 500) {
    return new Promise((res) => {
      this.cameras.main.fadeIn(ms, 0, 0, 0);
      this.cameras.main.once("camerafadeincomplete", res);
    });
  }
  clearStage() {
    this.stage.removeAll(true);
    const cam = this.cameras.main;
    cam.setZoom(1);
    cam.setRotation(0);
    cam.centerOn(GAME_W / 2, GAME_H / 2);
  }

  // Master sequence. Each phase resolves when its beat is done; skip() short-
  // circuits the chain by setting this.skipped (checked between phases).
  async run() {
    try {
      await this.phaseOrb();
      if (this.skipped) return;
      await this.transition(() => this.phaseBoot());
      if (this.skipped) return;
      await this.transition(() => this.phaseMenu());
      if (this.skipped) return;
      await this.transition(() => this.phaseSave());
      if (this.skipped) return;
      await this.transition(() => this.phaseTerminal());
      if (this.skipped) return;
      await this.transition(() => this.phaseFlash());
      if (this.skipped) return;
      await this.transition(() => this.phaseComplete());
      if (this.skipped) return;
      await this.transition(() => this.phaseReboot());
      this.finish();
    } catch (_) {
      // Any unexpected error: still hand control back to the launcher.
      this.finish();
    }
  }

  async transition(phaseFn) {
    if (this.skipped) return;
    await this.fadeOut(450);
    if (this.skipped) return;
    this.clearStage();
    await this.fadeIn(450);
    if (this.skipped) return;
    await phaseFn();
  }

  finish() {
    if (this.finished) return;
    this.finished = true;
    try {
      window.parent?.postMessage({ type: "softmod-done" }, "*");
    } catch (_) {
      /* standalone — nothing to notify */
    }
  }

  // ── Phase 1: blue flutter orb intro (lights + camera) ───────────────────
  async phaseOrb() {
    const cx = GAME_W / 2;
    const cy = GAME_H / 2;
    const cam = this.cameras.main;
    const S = this.stage;

    // Deep-space backdrop with a subtle blue vignette.
    const bg = this.add.graphics();
    bg.fillStyle(0x01040c, 1).fillRect(0, 0, GAME_W, GAME_H);
    S.add(bg);
    const vig = this.add.image(cx, cy, "bluelight").setScale(3.4).setAlpha(0.18)
      .setBlendMode(Phaser.BlendModes.ADD);
    S.add(vig);

    // "Lights" — three large soft point lights drifting behind the orb.
    const lights = [];
    for (let i = 0; i < 3; i++) {
      const l = this.add
        .image(cx, cy, "bluelight")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setScale(1.6 + i * 0.5)
        .setAlpha(0.0);
      S.add(l);
      lights.push(l);
      this.tweens.add({ targets: l, alpha: 0.35 - i * 0.07, duration: 1400, delay: i * 250 });
      this.tweens.add({
        targets: l,
        x: cx + Math.cos(i * 2.1) * 240,
        y: cy + Math.sin(i * 2.1) * 150,
        duration: 5200 + i * 600,
        yoyo: true,
        repeat: -1,
        ease: "Sine.inOut",
      });
    }

    // The orb itself — stacked additive discs from deep halo to white core.
    const orb = this.add.container(cx, cy);
    S.add(orb);
    const halo = this.add.image(0, 0, "bluelight").setScale(2.2).setTint(BLUE_DEEP)
      .setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.0);
    const body = this.add.image(0, 0, "glow").setScale(1.5).setTint(BLUE_MID)
      .setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.0);
    const core = this.add.image(0, 0, "glow").setScale(0.75).setTint(BLUE_CORE)
      .setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.0);
    orb.add([halo, body, core]);
    this.tweens.add({ targets: [halo, body, core], alpha: 1, duration: 1200, delay: 350 });
    // Breathing pulse.
    this.tweens.add({
      targets: orb,
      scaleX: 1.08,
      scaleY: 1.08,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
    this.tweens.add({
      targets: core,
      scale: 0.9,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });

    // Flutter ring — petals orbiting and flapping like a cloud of blue wings.
    const ring = this.add.container(cx, cy);
    S.add(ring);
    const PET = 14;
    for (let i = 0; i < PET; i++) {
      const a = (i / PET) * Math.PI * 2;
      const rad = 150 + (i % 3) * 26;
      const p = this.add
        .image(Math.cos(a) * rad, Math.sin(a) * rad, "petal")
        .setBlendMode(Phaser.BlendModes.ADD)
        .setRotation(a + Math.PI / 2)
        .setAlpha(0);
      ring.add(p);
      this.tweens.add({ targets: p, alpha: 0.85, duration: 900, delay: 700 + i * 40 });
      // Flap (squash horizontally) + gentle radial bob.
      this.tweens.add({
        targets: p,
        scaleX: 0.25,
        duration: 280 + (i % 5) * 30,
        yoyo: true,
        repeat: -1,
        ease: "Sine.inOut",
      });
      this.tweens.add({
        targets: p,
        x: Math.cos(a) * (rad + 26),
        y: Math.sin(a) * (rad + 26),
        duration: 1600 + (i % 4) * 200,
        yoyo: true,
        repeat: -1,
        ease: "Sine.inOut",
      });
    }
    this.tweens.add({ targets: ring, angle: 360, duration: 14000, repeat: -1, ease: "Linear" });

    // Shimmering particles streaming off the orb.
    const parts = this.add.particles(cx, cy, "spark", {
      speed: { min: 30, max: 130 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.9, end: 0 },
      lifespan: { min: 900, max: 1800 },
      frequency: 35,
      blendMode: "ADD",
      tint: [BLUE_CORE, BLUE_MID, 0x9fd8ff],
    });
    S.add(parts);

    // Title wordmark.
    const title = this.add
      .text(cx, cy + 250, "F L U T T E R", {
        fontFamily: "Arial Black, Impact, sans-serif",
        fontSize: "44px",
        color: "#bfeaff",
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setShadow(0, 0, "#2f9bff", 24, true, true);
    S.add(title);
    const sub = this.add
      .text(cx, cy + 296, "softmod sequence initializing", {
        fontFamily: "monospace",
        fontSize: "16px",
        color: "#5a87b0",
      })
      .setOrigin(0.5)
      .setAlpha(0);
    S.add(sub);
    this.tweens.add({ targets: [title, sub], alpha: 1, duration: 1400, delay: 1200 });

    // Camera: power-on flicker, slow push-out + drift-rotate, building energy.
    Sfx.whoosh();
    cam.setZoom(1.55);
    cam.setRotation(-0.05);
    const zoomTween = this.tweens.add({ targets: cam, zoom: 1.0, duration: 4600, ease: "Sine.inOut" });
    this.tweens.add({ targets: cam, rotation: 0.0, duration: 4600, ease: "Sine.inOut" });
    cam.flash(700, 120, 190, 255);

    await this.wait(4200);
    if (this.skipped) return;

    // Charge-up → burst. Orb swells, lights flare, camera punches in + white-out.
    Sfx.boom();
    this.tweens.add({ targets: orb, scaleX: 1.5, scaleY: 1.5, duration: 700, ease: "Back.in" });
    this.tweens.add({ targets: ring, scale: 1.4, alpha: 0, duration: 700 });
    this.tweens.add({ targets: lights, alpha: 0.8, scale: 3, duration: 700 });
    // Drive the punch-in with a tween (not cam.zoomTo) — the camera Zoom effect
    // and a still-running zoom property-tween fight over cam.zoom; stopping the
    // push-out tween and tweening the property directly keeps it conflict-free.
    zoomTween?.stop();
    this.tweens.add({ targets: cam, zoom: 2.4, duration: 760, ease: "Quad.in" });
    await this.wait(560);
    if (this.skipped) return;
    cam.flash(520, 230, 244, 255);
    parts.stop();
    await this.wait(360);
  }

  // ── Phase 2: MechAssault "monkey logo" boot (storyboard frame 1) ────────
  async phaseBoot() {
    const cx = GAME_W / 2;
    const cy = GAME_H / 2;
    const S = this.stage;
    const cam = this.cameras.main;

    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 1).fillRect(0, 0, GAME_W, GAME_H);
    bg.fillStyle(0x06140a, 1).fillRect(0, 0, GAME_W, GAME_H);
    S.add(bg);
    // Faint green floor glow.
    const fl = this.add.image(cx, cy + 120, "greenlight").setScale(3).setAlpha(0.25)
      .setBlendMode(Phaser.BlendModes.ADD);
    S.add(fl);

    // Emblem ring + the "monkey" mark inside it.
    const ring = this.add.graphics();
    ring.lineStyle(4, XB_GREEN, 1).strokeCircle(cx, cy - 30, 96);
    ring.lineStyle(2, XB_GREEN_D, 0.8).strokeCircle(cx, cy - 30, 110);
    S.add(ring);
    const monkey = this.add
      .text(cx, cy - 34, "🐵", { fontSize: "104px" })
      .setOrigin(0.5);
    S.add(monkey);

    const wordmark = this.add
      .text(cx, cy + 96, "MECHASSAULT", {
        fontFamily: "Arial Black, Impact, sans-serif",
        fontSize: "58px",
        color: "#cfeeb0",
      })
      .setOrigin(0.5)
      .setShadow(0, 2, "#1d3a0d", 8, true, true);
    S.add(wordmark);
    const tag = this.add
      .text(cx, cy + 142, "S O F T   M O D", {
        fontFamily: "monospace",
        fontSize: "22px",
        color: "#9bca3e",
        letterSpacing: 6,
      })
      .setOrigin(0.5);
    S.add(tag);
    const insert = this.add
      .text(cx, cy + 210, "Insert MechAssault and boot the game.", {
        fontFamily: "monospace",
        fontSize: "18px",
        color: "#6f8f55",
      })
      .setOrigin(0.5);
    S.add(insert);

    this.addScanlines(S);

    // CRT power-on: quick alpha flicker, then settle.
    S.setAlpha(0);
    Sfx.blip();
    const flick = [0.2, 0.9, 0.35, 1];
    flick.forEach((a, i) => this.time.delayedCall(90 * i, () => S.setAlpha(a)));
    this.tweens.add({ targets: insert, alpha: 0.25, yoyo: true, repeat: -1, duration: 700, delay: 600 });
    cam.flash(300, 80, 160, 60);

    await this.wait(2600);
  }

  // ── Phase 3: Penguin Script menu → TSOP FLASH ───────────────────────────
  async phaseMenu() {
    const S = this.stage;
    this.drawConsoleFrame(S, "PENGUIN  SCRIPT  v1.4", "#9bca3e");

    const items = [
      "TSOP FLASH",
      "BACKUP EEPROM",
      "BACKUP HDD KEY",
      "INSTALL DASHBOARD",
      "SYSTEM INFO",
      "REBOOT CONSOLE",
    ];
    const x = 200;
    const y0 = 230;
    const rows = items.map((label, i) => {
      const t = this.add.text(x, y0 + i * 50, label, {
        fontFamily: "monospace",
        fontSize: "30px",
        color: "#7fae4e",
      });
      S.add(t);
      return t;
    });

    // Highlight bar that steps down to TSOP FLASH (index 0 is the target, but
    // step through a couple first so the selection reads as deliberate).
    const bar = this.add.rectangle(GAME_W / 2, y0 + 16, GAME_W - 320, 42, XB_GREEN, 0.18)
      .setStrokeStyle(2, XB_GREEN, 0.7);
    S.add(bar);

    const order = [2, 1, 0]; // settle onto TSOP FLASH (top item)
    for (const idx of order) {
      if (this.skipped) return;
      rows.forEach((r, i) => r.setColor(i === idx ? "#eaffd0" : "#7fae4e"));
      this.tweens.add({ targets: bar, y: y0 + idx * 50 + 16, duration: 180, ease: "Quad.out" });
      Sfx.blip();
      await this.wait(420);
    }
    if (this.skipped) return;
    // Select.
    Sfx.select();
    this.cameras.main.flash(180, 120, 200, 70);
    this.tweens.add({ targets: bar, alpha: 0.5, yoyo: true, repeat: 2, duration: 110 });
    this.footer(S, "▲▼  navigate      A  select");
    await this.wait(900);
  }

  // ── Phase 4: SELECT GAME SAVE → confirm ─────────────────────────────────
  async phaseSave() {
    const S = this.stage;
    this.drawConsoleFrame(S, "SELECT  GAME  SAVE", "#9bca3e");

    const slots = [
      "SLOT 1   < EMPTY >",
      "SLOT 2   < EMPTY >",
      "SLOT 3   MechAssault  72%",
      "SLOT 4   < EMPTY >",
    ];
    const x = 220;
    const y0 = 240;
    const rows = slots.map((label, i) => {
      const t = this.add.text(x, y0 + i * 52, label, {
        fontFamily: "monospace",
        fontSize: "28px",
        color: "#7fae4e",
      });
      S.add(t);
      return t;
    });
    const bar = this.add.rectangle(GAME_W / 2, y0 + 14, GAME_W - 360, 44, XB_GREEN, 0.18)
      .setStrokeStyle(2, XB_GREEN, 0.7);
    S.add(bar);

    rows[0].setColor("#eaffd0");
    Sfx.blip();
    await this.wait(700);
    if (this.skipped) return;
    Sfx.select();
    this.cameras.main.flash(160, 120, 200, 70);

    // Confirm prompt.
    const box = this.add.rectangle(GAME_W / 2, GAME_H / 2 + 60, 560, 150, 0x04140a, 0.92)
      .setStrokeStyle(2, XB_GREEN, 0.9);
    S.add(box);
    const q = this.add
      .text(GAME_W / 2, GAME_H / 2 + 30, "Save soft mod data to SLOT 1?", {
        fontFamily: "monospace",
        fontSize: "24px",
        color: "#cfeeb0",
      })
      .setOrigin(0.5);
    S.add(q);
    const yes = this.add
      .text(GAME_W / 2 - 70, GAME_H / 2 + 86, "YES", {
        fontFamily: "monospace",
        fontSize: "26px",
        color: "#eaffd0",
      })
      .setOrigin(0.5);
    const no = this.add
      .text(GAME_W / 2 + 70, GAME_H / 2 + 86, "NO", {
        fontFamily: "monospace",
        fontSize: "26px",
        color: "#6f8f55",
      })
      .setOrigin(0.5);
    S.add(yes);
    S.add(no);
    await this.wait(650);
    if (this.skipped) return;
    this.tweens.add({ targets: yes, scale: 1.25, yoyo: true, duration: 140, repeat: 1 });
    Sfx.select();
    await this.wait(700);
  }

  // ── Phase 5: terminal — the Tux penguin script streaming ────────────────
  async phaseTerminal() {
    const S = this.stage;
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 1).fillRect(0, 0, GAME_W, GAME_H);
    bg.fillStyle(0x020806, 1).fillRect(0, 0, GAME_W, GAME_H);
    S.add(bg);

    // Tux, in monospace block-art, sitting top-right of the log.
    const tux = [
      "    .--.   ",
      "   |o_o |  ",
      "   |:_/ |  ",
      "  //   \\ \\ ",
      " (|     | )",
      "/'\\_   _/`\\",
      "\\___)=(___/",
    ].join("\n");
    const tuxT = this.add.text(GAME_W - 250, 40, tux, {
      fontFamily: "monospace",
      fontSize: "20px",
      color: "#ffffff",
      lineSpacing: 2,
    });
    S.add(tuxT);
    const tuxTag = this.add
      .text(GAME_W - 205, 230, "penguin.xbe", {
        fontFamily: "monospace",
        fontSize: "16px",
        color: AMBER,
      })
      .setOrigin(0.5, 0);
    S.add(tuxTag);

    const lines = [
      "penguin> mounting hdd:\\  ...............  [ OK ]",
      "penguin> probing LPC flash bus  ..........  [ OK ]",
      "penguin> chip id: Winbond W49F020T (256 KiB)",
      "penguin> backing up factory BIOS -> backup.bin",
      "penguin> verifying eeprom keys  ..........  [ OK ]",
      "penguin> patching dashboard -> evox.xbe",
      "penguin> staging TSOP payload  ...........  [ OK ]",
      "penguin> chip write-enabled. ARMED.",
      "",
      "penguin> launching tsop-flash ...",
    ];
    const x = 60;
    const y0 = 70;
    const log = this.add.text(x, y0, "", {
      fontFamily: "monospace",
      fontSize: "22px",
      color: TERM_GREEN,
      lineSpacing: 8,
    });
    S.add(log);
    const cursor = this.add.text(x, y0, "█", {
      fontFamily: "monospace",
      fontSize: "22px",
      color: TERM_GREEN,
    });
    S.add(cursor);
    this.tweens.add({ targets: cursor, alpha: 0, yoyo: true, repeat: -1, duration: 380 });

    let shown = "";
    for (let i = 0; i < lines.length; i++) {
      if (this.skipped) return;
      shown += (i ? "\n" : "") + lines[i];
      log.setText(shown);
      const lh = 22 + 8;
      cursor.setPosition(x, y0 + i * lh);
      if (lines[i]) Sfx.tick();
      await this.wait(lines[i] ? 360 : 160);
    }
    cursor.setVisible(false);
    await this.wait(700);
  }

  // ── Phase 6: Winbond TSOP flash progress bar ────────────────────────────
  async phaseFlash() {
    const S = this.stage;
    const cx = GAME_W / 2;
    this.drawConsoleFrame(S, "WINBOND  TSOP  FLASH", "#ffcc44", 0x140d02, 0xffcc44);

    const sub = this.add
      .text(cx, 190, "W49F020T  ·  flashing soft mod BIOS", {
        fontFamily: "monospace",
        fontSize: "22px",
        color: "#d9c07a",
      })
      .setOrigin(0.5);
    S.add(sub);

    // Progress bar shell + fill.
    const barX = 200;
    const barY = 330;
    const barW = GAME_W - 400;
    const barH = 56;
    const shell = this.add.graphics();
    shell.lineStyle(3, 0xffcc44, 0.9).strokeRect(barX, barY, barW, barH);
    S.add(shell);
    const fill = this.add.rectangle(barX + 3, barY + 3, 1, barH - 6, 0xffcc44, 1).setOrigin(0, 0);
    S.add(fill);
    const pct = this.add
      .text(cx, barY + barH + 46, "0%", {
        fontFamily: "monospace",
        fontSize: "40px",
        color: "#ffd766",
      })
      .setOrigin(0.5);
    S.add(pct);
    const addr = this.add
      .text(cx, barY - 36, "0x000000", {
        fontFamily: "monospace",
        fontSize: "20px",
        color: "#b9923a",
      })
      .setOrigin(0.5);
    S.add(addr);

    // Blinking "DO NOT POWER OFF" warning.
    const warn = this.add
      .text(cx, GAME_H - 120, "⚠  DO NOT POWER OFF THE CONSOLE  ⚠", {
        fontFamily: "monospace",
        fontSize: "24px",
        color: "#ff5a5a",
      })
      .setOrigin(0.5);
    S.add(warn);
    this.tweens.add({ targets: warn, alpha: 0.2, yoyo: true, repeat: -1, duration: 480 });

    // Drive the bar 0→100 with a tweened proxy so percent / address / ticks
    // all stay in lock-step, then settle on a confirmed write.
    const prog = { v: 0 };
    let lastTick = 0;
    await new Promise((res) => {
      this.tweens.add({
        targets: prog,
        v: 100,
        duration: 5200,
        ease: "Sine.inOut",
        onUpdate: () => {
          const v = prog.v;
          fill.width = Math.max(1, (barW - 6) * (v / 100));
          pct.setText(Math.floor(v) + "%");
          addr.setText("0x" + Math.floor((v / 100) * 0x3ffff).toString(16).toUpperCase().padStart(6, "0"));
          if (v - lastTick >= 4) {
            lastTick = v;
            Sfx.tick();
            this.cameras.main.shake(40, 0.001);
          }
        },
        onComplete: res,
      });
    });
    if (this.skipped) return;
    pct.setText("100%");
    Sfx.select();
    this.cameras.main.flash(220, 255, 210, 90);
    await this.wait(700);
  }

  // ── Phase 7: flash complete → restart ───────────────────────────────────
  async phaseComplete() {
    const S = this.stage;
    const cx = GAME_W / 2;
    const cy = GAME_H / 2;
    this.drawConsoleFrame(S, "FLASH  COMPLETE", "#9bca3e");

    const check = this.add
      .text(cx, cy - 60, "✔", { fontSize: "120px", color: "#9bca3e" })
      .setOrigin(0.5)
      .setScale(0);
    S.add(check);
    this.tweens.add({ targets: check, scale: 1, duration: 420, ease: "Back.out" });
    Sfx.select();

    const ok = this.add
      .text(cx, cy + 60, "Soft mod installed successfully.", {
        fontFamily: "monospace",
        fontSize: "28px",
        color: "#cfeeb0",
      })
      .setOrigin(0.5);
    S.add(ok);
    const slot = this.add
      .text(cx, cy + 104, "Saved to SLOT 1  ·  backup.bin preserved", {
        fontFamily: "monospace",
        fontSize: "20px",
        color: "#7fae4e",
      })
      .setOrigin(0.5);
    S.add(slot);
    await this.wait(1300);
    if (this.skipped) return;

    const reboot = this.add
      .text(cx, GAME_H - 120, "Rebooting console", {
        fontFamily: "monospace",
        fontSize: "24px",
        color: "#ffcc44",
      })
      .setOrigin(0.5);
    S.add(reboot);
    // Animated ellipsis.
    let dots = 0;
    const dotTimer = this.time.addEvent({
      delay: 300,
      repeat: 5,
      callback: () => {
        dots = (dots + 1) % 4;
        reboot.setText("Rebooting console" + ".".repeat(dots));
      },
    });
    await this.wait(1900);
    dotTimer.remove();
  }

  // ── Phase 8: simulated restart → original-Xbox boot logo (last frame) ────
  async phaseReboot() {
    const S = this.stage;
    const cx = GAME_W / 2;
    const cy = GAME_H / 2;
    const cam = this.cameras.main;

    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 1).fillRect(0, 0, GAME_W, GAME_H);
    S.add(bg);

    // Black for a beat — the console is "off".
    await this.wait(650);
    if (this.finished) return;

    Sfx.boom();
    cam.flash(500, 30, 60, 20);

    // The Xbox "jewel": a glowing green sphere with curved bands forming an X.
    const jewel = this.add.container(cx, cy - 20).setScale(0.2).setAlpha(0);
    S.add(jewel);
    const glow = this.add.image(0, 0, "greenlight").setScale(2.2)
      .setBlendMode(Phaser.BlendModes.ADD).setTint(XB_GREEN);
    const sphere = this.add.graphics();
    sphere.fillStyle(0xffffff, 1).fillCircle(0, 0, 86);
    sphere.fillStyle(XB_GREEN, 1).fillCircle(0, 0, 80);
    sphere.fillStyle(0xeafff0, 0.9).fillCircle(-26, -26, 26); // specular highlight
    // Curved "X" bands across the sphere.
    sphere.lineStyle(13, 0xffffff, 1);
    sphere.beginPath();
    sphere.arc(0, 0, 54, Phaser.Math.DegToRad(-58), Phaser.Math.DegToRad(58), false);
    sphere.strokePath();
    sphere.beginPath();
    sphere.arc(0, 0, 54, Phaser.Math.DegToRad(122), Phaser.Math.DegToRad(238), false);
    sphere.strokePath();
    const ring = this.add.graphics();
    ring.lineStyle(6, 0xffffff, 1).strokeCircle(0, 0, 92);
    jewel.add([glow, sphere, ring]);

    const word = this.add
      .text(cx, cy + 150, "XBOX", {
        fontFamily: "Arial Black, Impact, sans-serif",
        fontSize: "76px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setShadow(0, 0, "#9bca3e", 22, true, true);
    S.add(word);

    // Sparkle particles swirling into the jewel as it forms.
    const swirl = this.add.particles(cx, cy - 20, "spark", {
      speed: { min: 60, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 900,
      frequency: 18,
      blendMode: "ADD",
      tint: [0xffffff, XB_GREEN, 0xcdff9a],
    });
    S.add(swirl);

    // Bloom-in with a camera push.
    cam.setZoom(1.4);
    this.tweens.add({ targets: cam, zoom: 1.0, duration: 1600, ease: "Sine.out" });
    this.tweens.add({ targets: jewel, scale: 1, alpha: 1, duration: 900, ease: "Back.out" });
    this.tweens.add({
      targets: jewel,
      angle: 360,
      duration: 6000,
      ease: "Sine.inOut",
    });
    this.time.delayedCall(700, () => {
      Sfx.chime();
      this.tweens.add({ targets: word, alpha: 1, duration: 900 });
      cam.flash(600, 200, 255, 170);
    });
    // Gentle idle pulse on the glow.
    this.tweens.add({
      targets: glow,
      alpha: 0.6,
      scale: 2.5,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });

    await this.wait(2600);
    swirl.stop();
    await this.wait(900);
    await this.fadeOut(900);
  }

  // ── shared chrome helpers ───────────────────────────────────────────────
  drawConsoleFrame(S, title, accentCss, bgColor = 0x04140a, accent = XB_GREEN) {
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 1).fillRect(0, 0, GAME_W, GAME_H);
    bg.fillStyle(bgColor, 1).fillRect(0, 0, GAME_W, GAME_H);
    S.add(bg);
    // Header bar.
    const head = this.add.graphics();
    head.fillStyle(accent, 0.16).fillRect(60, 60, GAME_W - 120, 64);
    head.lineStyle(2, accent, 0.9).strokeRect(60, 60, GAME_W - 120, 64);
    head.lineStyle(2, accent, 0.5).strokeRect(60, 140, GAME_W - 120, GAME_H - 200);
    S.add(head);
    const t = this.add.text(90, 78, title, {
      fontFamily: "monospace",
      fontSize: "30px",
      color: accentCss,
    });
    S.add(t);
    this.addScanlines(S);
  }

  footer(S, text) {
    const f = this.add
      .text(GAME_W / 2, GAME_H - 90, text, {
        fontFamily: "monospace",
        fontSize: "20px",
        color: "#6f8f55",
      })
      .setOrigin(0.5);
    S.add(f);
  }

  addScanlines(S) {
    const scan = this.add
      .tileSprite(0, 0, GAME_W, GAME_H, "scan")
      .setOrigin(0, 0)
      .setAlpha(0.35);
    S.add(scan);
  }
}

// ─── boot ────────────────────────────────────────────────────────────────────
// __PHASER_GAME__ is the canonical handle every cmg game exposes (debugger,
// gamepad-support, controller-configurator).
globalThis.__PHASER_GAME__ = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game-container",
  width: GAME_W,
  height: GAME_H,
  backgroundColor: "#000000",
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: SoftmodScene,
});
