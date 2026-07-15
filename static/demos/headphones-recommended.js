// "Headphones Recommended" — a Phaser 4.1.0 title/idle scene.
//
// Ported from the original Phaser 3 CodePen to run on Phaser 4.1.0 (loaded as a
// browser global from the CDN by routes/demos/headphones-recommended.tsx, same
// as the goofy-game demo). Phaser 4.1.0 keeps every API this scene uses —
// bitmapText, RetroFont.Parse/TEXT_SET3, the 3.60-style particle
// emitter, per-sprite local anims (AnimationState.create), getLeftCenter/
// getRightCenter/getTopCenter and the animationcomplete-<key> events — so the
// port is mostly packaging. Behavioural fixes vs. the original: alpha uses
// FloatBetween (Between floored the 0.75–0.85 range to ints), startFullscreen
// is guarded (it rejects inside a sandboxed launcher iframe), tints are set via
// setTint() to match the rest of the repo's Phaser 4 code, and the title's
// RetroFont glyph frames are inset half a texel (with plain bitmapText) so the
// gutterless atlas doesn't bleed adjacent cells into the title's top/bottom at
// Scale.FIT.
//
// Assets are pulled from the original author's CodePen asset host.

const SCREEN_WIDTH = 360;
const SCREEN_HEIGHT = 640;
let currentColorIdx = 0;
const gameOptions = {
  circleColors: [0xff353b, 0x55eeff],
  starColors: [0xd4af37],
  musicNoteColors: [
    0x55eeff,
    0x5403f700,
    0xd627bc,
    0xd4af37,
    0xeeaa00,
    0xeecc66,
    0xfcdb06,
  ],
  goldColors: [0xffbb33, 0xd4af37, 0xfcdb06, 0xeeaa00, 0xeecc66],
};

// ── currentMusicPlayer sync ─────────────────────────────────────────────────
// AZLegendGolden (the "AZ Legend" music player) registers itself over the
// shared `music-player:` postMessage protocol and, while a track plays, streams
// the analyser bands that drive its on-screen light rig. We mirror that feed
// here so the falling stars glow the same colour the AZLegendGolden lights are
// showing, pulsing in lock-step with the music.
//
// The feed reaches us either way the player is embedded: as a sibling inside
// the CMG launcher (the launcher forwards `music-player:frequency` down into
// this game frame) or embedded directly by an in-game OSD (the player posts to
// its parent — this window). We just listen for the message from whichever
// window is the current music player.
const MUSIC_PREFIX = "music-player:";
const IDLE_STAR_COLOR = 0xd4af37; // gold — the look when no player is feeding us
// AZLegendGolden's light rig cycles four colour families (7 animation frames
// each) as its `mid` band rises: yellow → blue → green → purple. The player
// broadcasts the rig frame it just drew (`lightFrame`/`lightFrames`), so the
// stars land on the exact colour its lights are showing. Older players only
// send the `light` band; for those we re-derive the frame with drawLights()'s
// math on our own clock — right rate, arbitrary phase (performance.now()
// epochs differ per window). See audio-visualizer.js drawLights().
const LIGHT_FRAME_COUNT = 28; // fallback: 4 families × 7 frames
const LIGHT_FAMILY_COLORS = [0xffcf33, 0x55aaff, 0x55ff88, 0xbb66ff];

const musicSync = {
  currentMusicPlayer: null, // window of the registered AZLegendGolden player
  bass: 0,
  mid: 0,
  high: 0,
  energy: 0,
  light: 0, // the mid band — the value AZLegendGolden feeds into its light rig
  lightFrame: -1, // rig frame straight from the player (-1 = not provided)
  lightFrameCount: 0, // rig frame count from the player (0 = not provided)
  lastMessage: -Infinity,
};

function nowMs() {
  return (typeof performance !== "undefined" && performance.now)
    ? performance.now()
    : Date.now();
}

function clamp01(value) {
  const v = +value;
  if (!(v > 0)) return 0;
  return v < 1 ? v : 1;
}

// True while the current music player is actively feeding us frequency data.
// Falls stale ~2s after the last playing message (playback paused / player
// closed). The window is deliberately generous: the player broadcasts from its
// requestAnimationFrame loop, and a browser that throttles a cross-origin
// iframe's rAF (mobile Chrome under load / energy saver) can stretch the gap
// between messages to a second or more — a tight window would flap the stars
// back to idle gold between messages even though a track is playing.
function musicActive() {
  return nowMs() - musicSync.lastMessage < 2000;
}

// The colour AZLegendGolden's light rig is currently showing. Prefer the rig
// frame the player broadcasts (computed with ITS clock, so it IS the frame on
// screen); fall back to re-deriving it locally for older players that only
// send the `light` band.
function currentLightColor() {
  let frame = musicSync.lightFrame;
  let frameCount = musicSync.lightFrameCount;
  if (frame < 0 || frameCount <= 0) {
    frameCount = LIGHT_FRAME_COUNT;
    frame = Math.floor(nowMs() / 86 + musicSync.light * 18) % frameCount;
  }
  const family = Math.floor(
    frame / (frameCount / LIGHT_FAMILY_COLORS.length),
  );
  return LIGHT_FAMILY_COLORS[family] || LIGHT_FAMILY_COLORS[0];
}

function currentStarColor() {
  return musicActive() ? currentLightColor() : IDLE_STAR_COLOR;
}

function onMusicPlayerMessage(event) {
  const data = event.data;
  if (
    !data || typeof data.type !== "string" ||
    !data.type.startsWith(MUSIC_PREFIX)
  ) {
    return;
  }
  const command = data.type.slice(MUSIC_PREFIX.length);
  if (command === "ready" || command === "register") {
    // A music player announced itself — adopt it as the current one.
    musicSync.currentMusicPlayer = event.source || musicSync.currentMusicPlayer;
    return;
  }
  if (command === "frequency") {
    musicSync.currentMusicPlayer = event.source || musicSync.currentMusicPlayer;
    musicSync.bass = clamp01(data.bass);
    musicSync.mid = clamp01(data.mid);
    musicSync.high = clamp01(data.high);
    musicSync.energy = clamp01(data.energy);
    // `light` is the band that drives the rig; fall back to the mid band.
    musicSync.light = clamp01(data.light !== undefined ? data.light : data.mid);
    // The rig frame the player just drew — the authoritative colour source.
    const frame = +data.lightFrame;
    musicSync.lightFrame = Number.isInteger(frame) && frame >= 0 ? frame : -1;
    const frames = +data.lightFrames;
    musicSync.lightFrameCount = Number.isInteger(frames) && frames > 0
      ? frames
      : 0;
    // Only an actively-playing feed refreshes the sync. A paused player just
    // stops refreshing and goes stale via the musicActive() window (rather
    // than force-expiring it, so a second idle player broadcasting alongside
    // an active one can't cancel the live feed).
    if (data.playing !== false) musicSync.lastMessage = nowMs();
  }
}

globalThis.addEventListener("message", onMusicPlayerMessage);

class Stars {
  constructor({ scene, x = 0, y = 0 }) {
    const rect = new Phaser.Geom.Rectangle(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    const particleConfig = {
      alpha: {
        // Brighten with the player's energy while it feeds us; otherwise the
        // original steady twinkle.
        onUpdate: () =>
          Phaser.Math.FloatBetween(0.75, 0.85) +
          (musicActive() ? musicSync.energy * 0.15 : 0),
      },
      bounds: rect,
      collideBottom: false,
      frequency: 100,
      lifespan: 10000,
      speedY: { min: 60, max: 100 },
      scale: { min: 0.1, max: 0.2 },
      tint: {
        // Each star follows the colour AZLegendGolden's light rig is showing,
        // so the stars and the player's lights pulse the same hue together.
        onUpdate: () => currentStarColor(),
      },
      x: { random: [0, SCREEN_WIDTH] },
    };
    scene.add.particles(x, y, "particle", particleConfig);
  }
}

class Dancer extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture = "dancer") {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(3);

    // Local (per-sprite) animation — AnimationState.create, not the global
    // manager — so Dancer and DancerBack can each own a distinct "default".
    this.anims.create({
      key: "default",
      frames: [
        { key: "dancer", frame: 0 },
        { key: "dancer", frame: 1 },
        { key: "dancer", frame: 2 },
        { key: "dancer", frame: 3 },
      ],
      repeat: -1,
      frameRate: 5,
      yoyo: true,
    });

    this.play("default");
  }
}

class DancerBack extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture = "dancer-back") {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(3);

    this.anims.create({
      key: "default",
      frames: [
        { key: "dancer-back", frame: 0 },
        { key: "dancer-back", frame: 1 },
        { key: "dancer-back", frame: 2 },
        { key: "dancer-back", frame: 3 },
        { key: "dancer-back", frame: 4 },
        { key: "dancer-back", frame: 5 },
        { key: "dancer-back", frame: 6 },
        { key: "dancer-back", frame: 7 },
        { key: "dancer-back", frame: 8 },
      ],
      repeat: 3,
      frameRate: 9,
      yoyo: true,
    });

    this.on("animationcomplete-default", () => {
      const anim = Phaser.Utils.Array.GetRandom([
        "default",
        "popit-l",
        "popit-r",
      ]);
      this.play(anim);
    });
    this.on("animationcomplete-popit-l", () => {
      this.play("default");
    });
    this.on("animationcomplete-popit-r", () => {
      this.play("default");
    });

    this.anims.create({
      key: "popit-l",
      frames: [
        { key: "dancer-back", frame: 1 },
        { key: "dancer-back", frame: 2 },
        { key: "dancer-back", frame: 3, duration: 150 },
        { key: "dancer-back", frame: 2, duration: 100 },
        { key: "dancer-back", frame: 1 },
        { key: "dancer-back", frame: 2, duration: 100 },
        { key: "dancer-back", frame: 3, duration: 150 },
        { key: "dancer-back", frame: 2, duration: 100 },
        { key: "dancer-back", frame: 1 },
        { key: "dancer-back", frame: 2, duration: 100 },
        { key: "dancer-back", frame: 3, duration: 150 },
        { key: "dancer-back", frame: 2 },
        { key: "dancer-back", frame: 1 },
      ],
      frameRate: 9,
    });

    this.anims.create({
      key: "popit-r",
      frames: [
        { key: "dancer-back", frame: 1 },
        { key: "dancer-back", frame: 2 },
        { key: "dancer-back", frame: 3 },
        { key: "dancer-back", frame: 4 },
        { key: "dancer-back", frame: 5 },
        { key: "dancer-back", frame: 6 },
        { key: "dancer-back", frame: 7 },
        { key: "dancer-back", frame: 6, duration: 100 },
        { key: "dancer-back", frame: 5, duration: 150 },
        { key: "dancer-back", frame: 6, duration: 100 },
        { key: "dancer-back", frame: 7 },
        { key: "dancer-back", frame: 6, duration: 100 },
        { key: "dancer-back", frame: 5, duration: 150 },
        { key: "dancer-back", frame: 6, duration: 100 },
        { key: "dancer-back", frame: 7 },
        { key: "dancer-back", frame: 6 },
        { key: "dancer-back", frame: 5 },
        { key: "dancer-back", frame: 4 },
        { key: "dancer-back", frame: 3 },
        { key: "dancer-back", frame: 2 },
        { key: "dancer-back", frame: 1 },
      ],
      frameRate: 9,
    });

    this.play("default");
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super("gameScene");
  }

  preload() {
    this.load.setBaseURL("https://assets.codepen.io/11817390/");
    this.load.image("font", "font-bw.png");
    this.load.image("particle", "particle.png");
    this.load.spritesheet("music-notes", "gold-music-notes-v3.png", {
      frameWidth: 53,
      frameHeight: 65,
    });
    this.load.spritesheet("headphone-invader", "headphone-invader.png", {
      frameWidth: 230,
      frameHeight: 190,
    });
    this.load.spritesheet("dancer", "hostage-girl.png", {
      frameWidth: 29,
      frameHeight: 61,
    });
    this.load.spritesheet("dancer-back", "hostage-girl-back.png", {
      frameWidth: 33,
      frameHeight: 61,
    });
  }

  create() {
    new Stars({ scene: this });

    this.titleBack = this.add.sprite(
      SCREEN_WIDTH / 2,
      300,
      "headphone-invader",
    );
    this.titleBack.setTint(gameOptions.circleColors[currentColorIdx]);
    if (currentColorIdx === gameOptions.circleColors.length - 1) {
      currentColorIdx = 0;
    } else {
      currentColorIdx++;
    }

    const invader = this.add.sprite(SCREEN_WIDTH / 2, 300, "headphone-invader");

    const { x: lx, y: lyTop } = invader.getLeftCenter();
    const { x: rx, y: ryTop } = invader.getRightCenter();
    const ly = lyTop + 10;
    const ry = ryTop + 10;
    this.musicNotes = this.add.sprite(lx, ly, "music-notes");
    this.musicNotes2 = this.add.sprite(rx, ry, "music-notes").setFlipX(true);
    this.anims.create({
      key: "music-notes",
      frames: [
        { key: "music-notes", frame: 0 },
        { key: "music-notes", frame: 1 },
        { key: "music-notes", frame: 2 },
        { key: "music-notes", frame: 2 },
        { key: "music-notes", frame: 3, isKeyFrame: true },
        { key: "music-notes", frame: 3, isKeyFrame: true },
        { key: "music-notes", frame: 4 },
        { key: "music-notes", frame: 5 },
        { key: "music-notes", frame: 6 },
        { key: "music-notes", frame: 7 },
      ],
      frameRate: 17,
    });
    this.musicNotes.on("animationcomplete-music-notes", () => {
      this.musicNotes.setPosition(
        Phaser.Math.Between(lx + 7, lx - 17),
        Phaser.Math.Between(ly + 10, ly + 45),
      );
      this.musicNotes.play("music-notes");
    });
    this.musicNotes2.on("animationcomplete-music-notes", () => {
      this.musicNotes2.setPosition(
        Phaser.Math.Between(rx - 7, rx + 17),
        Phaser.Math.Between(ry + 10, ry + 45),
      );
      this.musicNotes2.play("music-notes");
    });

    this.musicNotes.play("music-notes");
    this.musicNotes2.play({ key: "music-notes", delay: 150 });

    this.dancer = new DancerBack(this, SCREEN_WIDTH / 4, 500);
    this.dancer2 = new Dancer(this, (SCREEN_WIDTH / 4) * 3, 500);

    const fontConfig = {
      image: "font",
      height: 16,
      width: 16,
      chars: Phaser.GameObjects.RetroFont.TEXT_SET3,
      charsPerRow: 6,
    };

    // RetroFont packs the glyphs as a gutterless 16×16 grid. At Scale.FIT's
    // fractional display scale the NEAREST sampler would otherwise grab a sliver
    // of the neighbouring cell — clipping each glyph's top and bleeding the cell
    // below in at the bottom. Inset every glyph frame by half a texel so
    // sampling stays inside its cell (no visible glyph pixels are lost).
    // RetroFont.Parse returns { data, frame, texture }; the glyph rects live in
    // data.chars (keyed by char code).
    const fontData = Phaser.GameObjects.RetroFont.Parse(this, fontConfig);
    for (const code in fontData.data.chars) {
      const c = fontData.data.chars[code];
      c.x += 0.5;
      c.y += 0.5;
      c.width -= 1;
      c.height -= 1;
    }
    this.cache.bitmapFont.add("font", fontData);

    const { x, y } = this.titleBack.getTopCenter();

    // Plain bitmapText (the scene needs no per-glyph callback or scrolling, so
    // dynamicBitmapText buys nothing); the atlas-bleed fix is the glyph-frame
    // inset above.
    this.text = this.add
      .bitmapText(x, y / 2, "font", "HEADPHONES RECOMMENDED")
      .setOrigin(0.5);

    this.input.on("pointerdown", () => {
      // Fullscreen is rejected inside a sandboxed iframe (the CMG launcher
      // already runs fullscreen/kiosk), so don't let the rejection bubble.
      try {
        this.scale.startFullscreen();
      } catch (_e) { /* ignore */ }
    });
  }

  update() {
    this.titleBack.setTint(
      Phaser.Utils.Array.GetRandom(gameOptions.circleColors),
    );
    this.musicNotes.setTint(
      Phaser.Utils.Array.GetRandom(gameOptions.musicNoteColors),
    );
    this.musicNotes2.setTint(
      Phaser.Utils.Array.GetRandom(gameOptions.musicNoteColors),
    );
    const dancerTint = Phaser.Utils.Array.GetRandom([
      // YELLOWS
      0xd4af37,
      0xffffac,
      0xffffac,
      0xffffff,
      // REDS
      0xffa8ae,
      0xffa8ae,
      // BLUES
      0xc8ffff,
      0xc8ffff,
      0x55eeff,
      0xc8ffff,
    ]);
    this.dancer.setTint(dancerTint);
    this.dancer2.setTint(dancerTint);
    this.text.setTint(Phaser.Utils.Array.GetRandom(gameOptions.goldColors));

    this.titleBack.setPosition(
      SCREEN_WIDTH / 2 + Phaser.Math.RND.integerInRange(-8, 8),
      300 + Phaser.Math.RND.integerInRange(-8, 8),
    );
  }
}

function start() {
  if (typeof globalThis.Phaser === "undefined") {
    // Phaser global hasn't finished loading yet — retry on the next tick.
    setTimeout(start, 30);
    return;
  }
  const config = {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: "#092344",
    parent: "game-container",
    pixelArt: true,
    physics: {
      default: "arcade",
      arcade: { debug: false },
    },
    scene: [GameScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    input: { active: true },
  };
  globalThis.__currentGame = new Phaser.Game(config);
}

start();
