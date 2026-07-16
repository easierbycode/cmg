// "Vertical Shooter" — a self-contained Phaser 4.2.1 vertical shoot-'em-up that
// shows off a toggleable CRT post-processing shader ("TATE Mode").
//
// TATE (縦) is the portrait orientation arcade shmups ran in. The CRT shader is
// a port of OpenEmu's tate_shmup_time.glsl (scanlines + nearest-neighbour crisp
// pixels + an RGB-triad phosphor mask, tuned for a 224×320 TurboGrafx vertical
// game) to Phaser 4's *Filters* system — the renderer rewrite in Phaser 4
// replaced Phaser 3's PostFXPipeline with camera FilterLists driven by
// RenderNodes, so the shader is registered as a custom BaseFilterShader render
// node and applied through a Phaser.Filters.Controller on the main camera.
//
// Everything is generated procedurally (Graphics → generateTexture), so the
// demo needs no asset files — same self-contained, no-bundle shape as the
// headphones-recommended / goofy-game demos.
//
// Plugin bridge: just like the launcher's URL-param "cheats", a game advertises
// the live toggles it supports to the launcher's in-game Guide/OSD by
// postMessage'ing { type: 'cmg-plugins', plugins: [...] } to the parent on
// boot. The OSD renders each as a toggle; flipping it posts
// { type: 'cmg-plugin-set', id, value } back into this frame, which we apply
// live (no reload). Here the single plugin is "TATE Mode" → the CRT filter.

// Native render resolution — baked into the CRT shader so scanline/triad
// frequency is 1:1 with the framebuffer. 224×320 is the TurboGrafx TATE res the
// original shader was tuned for.
const GAME_W = 224;
const GAME_H = 320;

const PLUGIN_ID = "tate";
const TATE_DEFAULT = true; // CRT on by default — it's the headline of the demo.

// ─── CRT shader (ported from tate_shmup_time.glsl) ──────────────────────────
// Phaser 4 filter fragment-shader contract: the camera's rendered output is
// `uniform sampler2D uMainSampler`, sampled at `varying vec2 outTexCoord`
// (GLSL ES 1.00 — `#version 100`, so `varying` / `texture2D` / `gl_FragColor`).
// The original's resolution uniform is baked in as a const here.
const TATE_FRAG = `
precision mediump float;
uniform sampler2D uMainSampler;
varying vec2 outTexCoord;

const vec2 resolution = vec2(${GAME_W}.0, ${GAME_H}.0);

void main() {
    vec2 uv = outTexCoord;
    vec2 fragCoord = uv * resolution;

    // Sample base linear color
    vec4 color = texture2D(uMainSampler, uv);

    // Horizontal scanlines (soft but visible)
    float scanline = 0.85 + 0.15 * sin(fragCoord.y * 3.14159);
    color.rgb *= scanline;

    // Nearest-neighbour sample for clean pixels, blended toward crisp
    vec2 px = 1.0 / resolution;
    vec2 nearestUV = (floor(uv / px) + 0.5) * px;
    vec4 nearestColor = texture2D(uMainSampler, nearestUV);
    color = mix(color, nearestColor, 0.9);

    // RGB triad phosphor mask (vertical strips)
    float triad = mod(floor(fragCoord.x), 3.0);
    vec3 mask = vec3(
        triad == 0.0 ? 1.0 : 0.7,
        triad == 1.0 ? 1.0 : 0.7,
        triad == 2.0 ? 1.0 : 0.7
    );
    color.rgb *= mask;

    gl_FragColor = color;
}`;

const TATE_NODE = "FilterTateCRT";

// Register the CRT shader as a custom render node on the WebGL renderer, once
// per renderer. RenderNodeManager.getNode lazily does `new Ctor(manager)`, so
// the constructor must take the manager and forward our frag source to
// BaseFilterShader(name, manager, fragKey, fragSource).
function registerTateNode(game) {
  const renderer = game.renderer;
  if (!renderer || renderer.type !== Phaser.WEBGL) return false; // Canvas: no filters
  const RN = Phaser.Renderer && Phaser.Renderer.WebGL && Phaser.Renderer.WebGL.RenderNodes;
  if (!RN || !RN.BaseFilterShader || !renderer.renderNodes) return false;
  try {
    class TateCRTShader extends RN.BaseFilterShader {
      constructor(manager) {
        super(TATE_NODE, manager, null, TATE_FRAG);
      }
    }
    // addNodeConstructor throws if the key already exists (e.g. scene restart) —
    // swallow that so re-entry is a no-op.
    try {
      renderer.renderNodes.addNodeConstructor(TATE_NODE, TateCRTShader);
    } catch (_) { /* already registered */ }
    return true;
  } catch (e) {
    console.warn("[vshooter] TATE filter unavailable:", e);
    return false;
  }
}

// ─── Procedural textures ────────────────────────────────────────────────────
function makeTextures(scene) {
  const g = scene.add.graphics();

  // Player ship — cyan arrow with a white cockpit and engine glow.
  g.clear();
  g.fillStyle(0x123a4a, 1); g.fillTriangle(8, 16, 0, 16, 4, 12); // left engine
  g.fillStyle(0x123a4a, 1); g.fillTriangle(8, 16, 16, 16, 12, 12); // right engine
  g.fillStyle(0x55eeff, 1); g.fillTriangle(8, 0, 0, 16, 16, 16);   // hull
  g.fillStyle(0xeaffff, 1); g.fillTriangle(8, 4, 5, 12, 11, 12);   // cockpit
  g.fillStyle(0xffb13d, 1); g.fillRect(7, 16, 2, 3);               // exhaust
  g.generateTexture("ship", 16, 20);

  // Enemy A — magenta invader diamond.
  g.clear();
  g.fillStyle(0xff4f9d, 1); g.fillTriangle(8, 0, 1, 8, 15, 8);
  g.fillStyle(0xff4f9d, 1); g.fillTriangle(1, 8, 15, 8, 8, 16);
  g.fillStyle(0x3a0e26, 1); g.fillRect(4, 7, 2, 2); g.fillRect(10, 7, 2, 2); // eyes
  g.generateTexture("enemy", 16, 16);

  // Enemy B — amber wedge (faster, weaker).
  g.clear();
  g.fillStyle(0xffc24a, 1); g.fillTriangle(8, 14, 0, 2, 16, 2);
  g.fillStyle(0xfff0c0, 1); g.fillTriangle(8, 10, 4, 3, 12, 3);
  g.generateTexture("enemy2", 16, 16);

  // Player bullet — bright vertical capsule.
  g.clear();
  g.fillStyle(0xeaffff, 1); g.fillRoundedRect(0, 0, 3, 10, 1.5);
  g.fillStyle(0x9ffcff, 1); g.fillRect(1, 0, 1, 10);
  g.generateTexture("pbullet", 3, 10);

  // Enemy bullet — round orange pellet.
  g.clear();
  g.fillStyle(0xff7733, 1); g.fillCircle(4, 4, 4);
  g.fillStyle(0xffd9a0, 1); g.fillCircle(4, 4, 1.6);
  g.generateTexture("ebullet", 8, 8);

  // Explosion puff — white→fades via tint/alpha.
  g.clear();
  g.fillStyle(0xffffff, 1); g.fillCircle(8, 8, 8);
  g.fillStyle(0xffe08a, 1); g.fillCircle(8, 8, 4);
  g.generateTexture("puff", 16, 16);

  // Star — single soft dot for the parallax field.
  g.clear();
  g.fillStyle(0xffffff, 1); g.fillRect(0, 0, 2, 2);
  g.generateTexture("star", 2, 2);

  g.destroy();
}

// ─── Scene ──────────────────────────────────────────────────────────────────
class ShooterScene extends Phaser.Scene {
  constructor() {
    super("shooter");
  }

  create() {
    makeTextures(this);

    this.score = 0;
    this.lives = 3;
    this.gameOver = false;
    this.invulnUntil = 0;
    this.lastFire = 0;
    this.lastEnemy = 0;
    this.enemyEvery = 900;

    // Parallax starfield (two layers, plain sprites — cheap and bulletproof).
    this.stars = [];
    for (let i = 0; i < 70; i++) {
      const far = i < 45;
      const s = this.add.image(
        Phaser.Math.Between(0, GAME_W),
        Phaser.Math.Between(0, GAME_H),
        "star",
      );
      s.setTint(far ? 0x4466aa : 0xbfe9ff);
      s.speed = far ? 14 : 34;
      s.setScale(far ? 1 : 1.5);
      s.setAlpha(far ? 0.6 : 0.95);
      this.stars.push(s);
    }

    // Physics groups.
    this.pbullets = this.physics.add.group();
    this.ebullets = this.physics.add.group();
    this.enemies = this.physics.add.group();

    // Player.
    this.player = this.physics.add.sprite(GAME_W / 2, GAME_H - 36, "ship");
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(10, 12).setOffset(3, 4);

    // Input — keyboard + gamepad (read live in update()).
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      up: "W", down: "S", left: "A", right: "D", fire: "SPACE",
    });

    // HUD (regular text — no font asset needed).
    const hudStyle = {
      fontFamily: "monospace",
      fontSize: "12px",
      color: "#bfffd0",
      resolution: 2,
    };
    this.scoreText = this.add.text(6, 5, "SCORE 0", hudStyle).setDepth(10);
    this.livesText = this.add.text(GAME_W - 6, 5, "♥♥♥", hudStyle)
      .setOrigin(1, 0).setDepth(10);
    this.centerText = this.add.text(GAME_W / 2, GAME_H / 2, "", {
      ...hudStyle, fontSize: "16px", color: "#eaffd2", align: "center",
    }).setOrigin(0.5).setDepth(10);

    // Collisions.
    this.physics.add.overlap(this.pbullets, this.enemies, this.onBulletHitsEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.onPlayerHit, null, this);
    this.physics.add.overlap(this.player, this.ebullets, this.onPlayerHit, null, this);

    // ── CRT filter wiring ──
    this.tateController = null;
    this.tateOn = false;
    registerTateNode(this.game);
    this.setTate(tateEnabled);

    // Expose this scene so the plugin-message bridge can drive the toggle, and
    // advertise the plugin to the launcher OSD (twice — once now, once shortly
    // after, in case the parent listener wasn't ready on the first boot frame).
    globalThis.__vshooterScene = this;
    advertisePlugins();
    this.time.delayedCall(300, advertisePlugins);
  }

  // Apply / remove the TATE CRT filter on the main camera. Idempotent.
  setTate(on) {
    tateEnabled = on;
    const cam = this.cameras && this.cameras.main;
    if (!cam || !cam.filters) { this.tateOn = on; return; }
    try {
      if (on) {
        if (!this.tateController) {
          this.tateController = new Phaser.Filters.Controller(cam, TATE_NODE);
          cam.filters.internal.add(this.tateController);
        }
        if (this.tateController.setActive) this.tateController.setActive(true);
        else this.tateController.active = true;
      } else if (this.tateController) {
        if (this.tateController.setActive) this.tateController.setActive(false);
        else this.tateController.active = false;
      }
      this.tateOn = on;
    } catch (e) {
      console.warn("[vshooter] could not toggle TATE:", e);
    }
  }

  readInput() {
    const k = this.keys, c = this.cursors;
    let left = c.left.isDown || k.left.isDown;
    let right = c.right.isDown || k.right.isDown;
    let up = c.up.isDown || k.up.isDown;
    let down = c.down.isDown || k.down.isDown;
    let fire = c.space.isDown || k.fire.isDown;

    // Gamepad (read directly so it works without launcher key-forwarding).
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const p of pads) {
      if (!p) continue;
      const ax = p.axes[0] ?? 0, ay = p.axes[1] ?? 0;
      if (ax < -0.35 || p.buttons[14]?.pressed) left = true;
      if (ax > 0.35 || p.buttons[15]?.pressed) right = true;
      if (ay < -0.35 || p.buttons[12]?.pressed) up = true;
      if (ay > 0.35 || p.buttons[13]?.pressed) down = true;
      if (p.buttons[0]?.pressed || p.buttons[2]?.pressed || p.buttons[7]?.pressed) fire = true;
    }
    return { left, right, up, down, fire };
  }

  update(time, delta) {
    // Starfield scroll (always, even on game over — keeps the scene alive).
    const dt = delta / 1000;
    for (const s of this.stars) {
      s.y += s.speed * dt;
      if (s.y > GAME_H + 2) { s.y = -2; s.x = Phaser.Math.Between(0, GAME_W); }
    }

    if (this.gameOver) {
      const inp = this.readInput();
      if (inp.fire && time > this.restartAt) this.scene.restart();
      return;
    }

    const inp = this.readInput();
    const speed = 150;
    const vx = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
    const vy = (inp.down ? 1 : 0) - (inp.up ? 1 : 0);
    this.player.setVelocity(vx * speed, vy * speed);

    // Player blink while invulnerable.
    if (time < this.invulnUntil) {
      this.player.setVisible(Math.floor(time / 80) % 2 === 0);
    } else {
      this.player.setVisible(true);
    }

    if (inp.fire && time > this.lastFire) {
      this.lastFire = time + 180;
      this.fire();
    }

    // Spawn enemies.
    if (time > this.lastEnemy) {
      this.lastEnemy = time + this.enemyEvery;
      this.enemyEvery = Math.max(360, this.enemyEvery - 8); // ramp difficulty
      this.spawnEnemy();
    }

    // Enemy behaviour: weave + occasional shots; cull off-screen.
    // Phaser 4's Group has no children.iterate(); use getChildren(), and
    // iterate a copy since we destroy members mid-loop.
    for (const e of this.enemies.getChildren().slice()) {
      if (!e || !e.active) continue;
      if (e.weave) e.x = e.baseX + Math.sin((time + e.seed) / 320) * e.weave;
      if (time > e.nextShot && e.y < GAME_H * 0.7) {
        e.nextShot = time + Phaser.Math.Between(900, 2200);
        this.enemyFire(e);
      }
      if (e.y > GAME_H + 16) e.destroy();
    }

    for (const b of this.pbullets.getChildren().slice()) {
      if (b && b.active && b.y < -12) b.destroy();
    }
    for (const b of this.ebullets.getChildren().slice()) {
      if (b && b.active && (b.y > GAME_H + 12 || b.x < -12 || b.x > GAME_W + 12)) b.destroy();
    }
  }

  fire() {
    const b = this.pbullets.create(this.player.x, this.player.y - 12, "pbullet");
    b.setVelocityY(-360);
    b.body.setAllowGravity(false);
  }

  spawnEnemy() {
    const fast = Math.random() < 0.4;
    const x = Phaser.Math.Between(16, GAME_W - 16);
    const e = this.enemies.create(x, -12, fast ? "enemy2" : "enemy");
    e.baseX = x;
    e.seed = Phaser.Math.Between(0, 6280);
    e.weave = fast ? 0 : Phaser.Math.Between(10, 40);
    e.hp = fast ? 1 : 2;
    e.points = fast ? 150 : 100;
    e.body.setAllowGravity(false);
    e.setVelocityY(fast ? 130 : 70);
    e.nextShot = this.time.now + Phaser.Math.Between(500, 1800);
  }

  enemyFire(e) {
    const b = this.ebullets.create(e.x, e.y + 8, "ebullet");
    b.body.setAllowGravity(false);
    // Aim roughly at the player.
    const ang = Phaser.Math.Angle.Between(e.x, e.y, this.player.x, this.player.y);
    const sp = 130;
    b.setVelocity(Math.cos(ang) * sp, Math.max(60, Math.sin(ang) * sp));
  }

  onBulletHitsEnemy(bullet, enemy) {
    if (!bullet.active || !enemy.active) return;
    bullet.destroy();
    enemy.hp -= 1;
    if (enemy.hp > 0) {
      // White hit-flash. setTintFill was removed in Phaser 4 — use a FILL-mode
      // tint, then restore the default MULTIPLY mode when clearing.
      enemy.setTint(0xffffff).setTintMode(Phaser.TintModes.FILL);
      // clearTint() also restores the default MULTIPLY tint mode.
      this.time.delayedCall(60, () => { if (enemy.active) enemy.clearTint(); });
      return;
    }
    this.addScore(enemy.points);
    this.boom(enemy.x, enemy.y, 0xff4f9d);
    enemy.destroy();
  }

  onPlayerHit(player, other) {
    if (this.gameOver || this.time.now < this.invulnUntil) return;
    if (other) other.destroy();
    this.boom(player.x, player.y, 0x55eeff);
    this.lives -= 1;
    this.livesText.setText("♥".repeat(Math.max(0, this.lives)));
    if (this.lives <= 0) {
      this.endGame();
    } else {
      this.invulnUntil = this.time.now + 1500;
      this.player.setPosition(GAME_W / 2, GAME_H - 36).setVelocity(0, 0);
    }
  }

  addScore(n) {
    this.score += n;
    this.scoreText.setText("SCORE " + this.score);
  }

  boom(x, y, color) {
    for (let i = 0; i < 7; i++) {
      const p = this.add.image(x, y, "puff").setTint(color).setDepth(5);
      const a = (i / 7) * Math.PI * 2;
      this.tweens.add({
        targets: p,
        x: x + Math.cos(a) * Phaser.Math.Between(10, 26),
        y: y + Math.sin(a) * Phaser.Math.Between(10, 26),
        scale: { from: 0.9, to: 0.1 },
        alpha: { from: 1, to: 0 },
        duration: 380,
        onComplete: () => p.destroy(),
      });
    }
  }

  endGame() {
    this.gameOver = true;
    this.player.setVisible(false).setVelocity(0, 0);
    this.restartAt = this.time.now + 800;
    this.centerText.setText("GAME OVER\nSCORE " + this.score + "\n\nFIRE TO RETRY");
  }
}

// ─── Plugin bridge (advertise to / receive from the launcher OSD) ────────────
let tateEnabled = TATE_DEFAULT;

function advertisePlugins() {
  try {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: "cmg-plugins",
        plugins: [
          { id: PLUGIN_ID, label: "TATE Mode", kind: "toggle", value: tateEnabled },
        ],
      }, "*");
    }
  } catch (_) { /* standalone / cross-origin parent — ignore */ }
}

window.addEventListener("message", (e) => {
  // Only honour messages from the launcher that mounted us. The launcher may be
  // cross-origin (packaged build), so this guards by window identity rather than
  // origin — mirroring the dashboard's own e.source check — and no-ops standalone.
  if (window.parent === window || (e.source && e.source !== window.parent)) return;
  const d = (e && e.data) || {};
  if (d.type === "cmg-plugin-set" && d.id === PLUGIN_ID) {
    tateEnabled = !!d.value;
    const scene = globalThis.__vshooterScene;
    if (scene && scene.setTate) scene.setTate(tateEnabled);
  }
});

// ─── Boot ────────────────────────────────────────────────────────────────────
function start() {
  if (typeof globalThis.Phaser === "undefined") {
    setTimeout(start, 30); // Phaser global still loading
    return;
  }
  const config = {
    type: Phaser.WEBGL, // filters need the WebGL renderer
    width: GAME_W,
    height: GAME_H,
    backgroundColor: "#05060f",
    parent: "game-container",
    pixelArt: true,
    physics: { default: "arcade", arcade: { debug: false } },
    scene: [ShooterScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    input: { active: true, gamepad: true },
  };
  globalThis.__currentGame = new Phaser.Game(config);
}

start();
