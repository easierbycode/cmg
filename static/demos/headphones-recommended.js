// "Headphones Recommended" — a Phaser 4.2.1 title/idle scene.
//
// Ported from the original Phaser 3 CodePen to run on Phaser 4.2.1 (loaded as a
// browser global from the CDN by routes/demos/headphones-recommended.tsx, same
// as the goofy-game demo). Phaser 4.2.1 keeps every API this scene uses —
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

// ── bass sync ───────────────────────────────────────────────────────────────
// Two asks, one band. `bass` is the LOWEST band the player publishes: its
// analyser runs fftSize 64 (32 bins) and `bass = average(this.data, 0, 5)` is
// bins 0–4, the bottom sixth of the spectrum. It is ALSO the band the player's
// back wall of TVs runs on — drawBackground() picks which of its five frames is
// on screen with `Math.floor(now / 820 + bass * 5) % backgrounds.length` and
// sets the wall's contrast to `1.05 + bass * 0.45`. Neither `mid` (which drives
// the light rig, and through it our stars above) nor `high` goes anywhere near
// that wall. So "sync the invader to the lowest frequency" and "sync the dancers
// to the TV wall's band" name the SAME signal. Everything below rides one
// number; what differs is how each consumer reads it — the invader as an
// amplitude, the dancers as a rate, because a rate is how the wall itself reads
// it. The wall isn't something this repo draws; see audio-visualizer.js
// drawBackground() in the AZLegendGolden player, which we only mirror.
//
// Raw `bass` is a poor multiplier: those five bins span roughly 0–3.75 kHz at a
// 48 kHz rate — nearly everything a mixed track puts out — so on a loud passage
// the band pins to ~0.6–0.9 and does all its interesting work inside that top
// third. Rebase on a floor and stretch what's left back out to 0–1 so the sync
// reads as modulation rather than a constant "slightly faster". Raise the floor
// if a track leaves the scene running hot; lower it if a sparse mix never lifts
// it off the deck.
const BASS_FLOOR = 0.35;

// The scene's one bass read. 0 whenever no player is feeding us (the 2s
// musicActive() window). That zero is load-bearing: every consumer below is
// written as `original + drive × gain`, so drive 0 reproduces the pre-sync scene
// exactly and the fallback costs nothing — there's no second code path to keep
// in step. clamp01 absorbs a NaN or out-of-range band from a misbehaving player,
// which is what guarantees the [0,1] range every formula assumes.
function bassDrive() {
  if (!musicActive()) return 0;
  return clamp01((musicSync.bass - BASS_FLOOR) / (1 - BASS_FLOOR));
}

// The two smoothing coefficients below are quoted per 60fps frame; emaK converts
// one to the frame actually rendered. A bare per-frame EMA would make every time
// constant here a function of the display: on a 144Hz panel `* 0.3` per frame is
// a ~21ms glide and the trail a ~104ms one, so the trail tracks the fast read
// more closely, the gap between them shrinks and the strobe fires measurably less
// than it does at 60fps. Compounding over `delta / FRAME_MS` frames' worth of
// time keeps both constants the same WALL-CLOCK durations everywhere, which also
// makes the refractory clock (real ms) and the trail comparable quantities rather
// than two different notions of time. delta 0 gives k 0 (no advance) and a long
// stall gives k→1 (snap to the current value), both of which are what we want.
const FRAME_MS = 1000 / 60;
const BASS_FAST_K = 0.3; // ≈50ms glide — fills the gaps between broadcasts
const BASS_SLOW_K = 0.06; // ≈250ms trail — what a transient is measured against

function emaK(k, delta) {
  return 1 - Math.pow(1 - k, delta / FRAME_MS);
}

// Onset detection for the ghost's tint flip. A kick is a rising edge, not a
// level: thresholding the band directly would chatter every frame it hovers near
// the line, and a track that simply runs loud would latch on and never flip.
//
// The rise is measured as a DIFFERENCE from the slow trail, not as a ratio of it.
// A ratio cannot work here: the drive is hard-capped at 1 by clamp01, so a
// multiplicative threshold outruns its own signal's ceiling once the trail is
// high — at ratio 1.3 anything above a 0.723 trail needs a >1 read to fire, which
// is impossible. That silently disables the strobe on exactly the bass-heavy
// tracks it's meant for: a real kick from a 0.72 bed to a full-scale 1.0 is a
// large transient the detector simply cannot see. A difference has no ceiling
// interaction — a rise of this much over the trail fires at any level — and it
// still ignores a steady tone, whose trail converges to it leaving no rise.
const BASS_ONSET_RISE = 0.1; // the fast read must clear its own slow trail by this much
const BASS_ONSET_REFRACTORY = 110; // ms between flips — a fast kick still gets through, a wobbly envelope can't fire twice

// Below this drive the ghost keeps its original per-frame shimmer rather than the
// beat-latched strobe. The strobe is only meaningful when there's bass to strobe
// ON: gating it on "is a player connected" instead would freeze the ghost on one
// solid colour through any track whose low end never clears BASS_FLOOR (and
// through every quiet intro and breakdown), which reads as the scene having hung
// — the same failure the throw comment below refuses. This keeps the invariant
// the rest of the sync is built on: at drive 0 every consumer, this one included,
// IS the pre-sync scene. The epsilon (rather than `> 0`) is because bassLevel is
// an EMA — it decays geometrically toward 0 and never quite arrives.
const BASS_IDLE_EPS = 0.02;

// Invader pump: five discrete sizes, 1.00 → 1.08.
const INVADER_SCALE_STEPS = 4;
const INVADER_SCALE_STEP = 0.02;

// Ghost throw, px: ±8 at rest (the scene's original constant) → ±18 flat out.
const GHOST_JITTER_IDLE = 8;
const GHOST_JITTER_GAIN = 10;

// Dancer rate: 1× at rest (DancerBack 9fps / Dancer 5fps, exactly as the classes
// build them) → 2.35× flat out.
//
// anims.timeScale is the right lever and the only clean one. AnimationState
// advances with `accumulator += delta * timeScale * globalTimeScale`, so it
// scales the frame clock in place: live, per-sprite, mid-yoyo, mid-repeat, no
// restart, and no interference with the animationcomplete-<key> chain DancerBack
// hangs its popit-l/popit-r picks off. Because it scales the accumulator rather
// than a per-frame interval, it also scales frames carrying their own
// `duration:` — popit-l and popit-r both do — which anims.msPerFrame would not.
// It's a plain property: AnimationState has no setTimeScale() in Phaser 4.2.1
// (the only setTimeScale in the dist belongs to Tween), so `setTimeScale()`
// would throw. scene.anims.globalTimeScale would work but is a blunt instrument
// — it would drag the music-note bursts along with the dancers.
//
// The wall's `bass * 5` is a phase offset on a free-running clock, not a rate
// multiplier, so this is a deliberate approximation of its feel rather than a
// copy of its math. Emulating the offset honestly would mean either a negative
// timeScale on every decay (which stalls the anim — the accumulator just walks
// backwards and never reaches nextTick) or hand-scrubbing anims.currentFrame,
// which bypasses the accumulator and kills DancerBack's popit chain. On real
// music envelope swing and level correlate strongly, so a level-driven rate
// reads the same to the eye: quiet bars at the original tempo, bass-heavy bars
// churning — which is the wall's perceived behaviour.
const DANCER_RATE_GAIN = 1.35;

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

// Ask the launcher to put a track on. This scene is a music visualiser with no
// soundtrack of its own — with nothing playing it just sits on idle gold — so by
// default it requests one rather than making the player go and find the music
// app in the Guide first. The launcher decides whether that's possible: it only
// acts if the catalog actually advertises a music app, and it mounts it
// docked-but-closed (see startMusicForGame in Dashboard.svelte). Games with
// their own BGM simply never send this, which is what keeps the behaviour scoped
// to this demo instead of every title.
//
// Called twice by design. The boot call is usually rejected — an AudioContext
// stays suspended until the page has been interacted with — and the launcher
// leaves the request standing; the pointerdown call is the one that lands,
// because a click anywhere in this frame propagates user activation up to the
// top document, which is what the (autoplay-delegated) player frame needs. When
// the boot call DOES work (the click that launched the game already counted),
// the second is a no-op: the launcher never restarts a track that's playing.
// No-op standalone — with no launcher there's no catalog and no player.
function requestMusicAutostart() {
  if (globalThis.parent === globalThis) return;
  try {
    globalThis.parent.postMessage({ type: "cmg-music-autostart" }, "*");
  } catch (_e) { /* parent gone / blocked */ }
}

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

    // Bass sync state, held on the scene rather than at module scope so a scene
    // restart re-seeds it cleanly. `bassLevel` is our own smoothed read of the
    // band (see update()); `bassSlow` trails it and is what a transient is
    // measured against; `bassFlipAt` is the refractory clock on the ghost's tint.
    this.bassLevel = 0;
    this.bassSlow = 0;
    this.bassFlipAt = -Infinity;

    this.titleBack = this.add.sprite(
      SCREEN_WIDTH / 2,
      300,
      "headphone-invader",
    );
    this.titleBack.setTint(gameOptions.circleColors[currentColorIdx]);
    // The ghost's tint latch — update() flips it on each bass transient. Seeded
    // from this boot's colour *before* the alternator advances below, so frame 1
    // keeps the colour we just set instead of jumping. (Without the latch that
    // create() tint is dead on arrival: update() overwrote it with a coin-flip on
    // the very first frame.) Kept on the scene, not on the module's
    // `currentColorIdx`, so the per-boot alternation stays a per-boot thing
    // rather than "wherever the last kick left it".
    this.ghostColorIdx = currentColorIdx;
    if (currentColorIdx === gameOptions.circleColors.length - 1) {
      currentColorIdx = 0;
    } else {
      currentColorIdx++;
    }

    // Promoted from a local const: update() pumps its scale with the bass, so it
    // has to survive create(). The two getCenter() reads below are unchanged and
    // still run at the rest pose — don't set a base scale here, or the music
    // notes' spawn anchors move with it.
    this.invader = this.add.sprite(SCREEN_WIDTH / 2, 300, "headphone-invader");

    const { x: lx, y: lyTop } = this.invader.getLeftCenter();
    const { x: rx, y: ryTop } = this.invader.getRightCenter();
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

    // Ask for a track up front, and again on the first tap — that tap is the
    // user activation the player needs if the boot request was refused.
    requestMusicAutostart();
    this.input.once("pointerdown", requestMusicAutostart);

    this.input.on("pointerdown", () => {
      // Fullscreen is rejected inside a sandboxed iframe (the CMG launcher
      // already runs fullscreen/kiosk), so don't let the rejection bubble.
      try {
        this.scale.startFullscreen();
      } catch (_e) { /* ignore */ }
    });
  }

  update(_time, delta) {
    // ── the bass read ───────────────────────────────────────────────────────
    // One sample per frame, shared by everything below, so the invader and the
    // dancers read the same instant of the same band instead of each dipping
    // into musicSync at a slightly different point in the frame.
    //
    // Smoothed on OUR clock, not the feed's. The player broadcasts from its own
    // requestAnimationFrame loop, and a browser that throttles a cross-origin
    // iframe — the same case musicActive()'s window is widened for above — can
    // drop that to 10–20Hz. Read raw, we'd see the identical `bass` for four or
    // five consecutive frames and the invader would step in chunks locked to the
    // MESSAGE rate rather than to the music. The EMA fills the gaps: 0.3/frame is
    // roughly a 50ms glide at 60fps, well inside a beat, so a kick still lands as
    // a kick. (The player smooths its own `energy` the same way, at 0.26.)
    //
    // It also disarms the musicActive() cliff for free: bassDrive() drops to 0 in
    // a single frame when the feed goes stale, but everything reads bassLevel,
    // which glides back to its pre-sync value over ~150ms instead of snapping.
    this.bassLevel += (bassDrive() - this.bassLevel) * emaK(BASS_FAST_K, delta);
    const bass = this.bassLevel;

    // Compare the fast read against a slow trail of itself and fire on the
    // overshoot — the standard two-average onset trick. The refractory clock
    // stops one kick firing twice as its envelope wobbles on the way up.
    this.bassSlow += (bass - this.bassSlow) * emaK(BASS_SLOW_K, delta);
    const now = nowMs();
    const onset = bass - this.bassSlow > BASS_ONSET_RISE &&
      now - this.bassFlipAt > BASS_ONSET_REFRACTORY;
    if (onset) this.bassFlipAt = now;

    // ── the invader ─────────────────────────────────────────────────────────
    // Ghost tint. With no bass to strobe on — no player, a stale feed, or a
    // passage with no bottom end — this is the original per-frame red/cyan
    // coin-flip (at 60fps it reads as a shimmer). Once bass arrives we latch the
    // colour and flip it only when a transient lands, so the ghost strobes ON the
    // kick instead of at the refresh rate — the same flicker, except now it
    // carries the beat. The EMA glides across the handover rather than cutting.
    if (bass > BASS_IDLE_EPS) {
      if (onset) {
        this.ghostColorIdx = (this.ghostColorIdx + 1) %
          gameOptions.circleColors.length;
      }
      this.titleBack.setTint(gameOptions.circleColors[this.ghostColorIdx]);
    } else {
      this.titleBack.setTint(
        Phaser.Utils.Array.GetRandom(gameOptions.circleColors),
      );
    }
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

    // ── the dancers ─────────────────────────────────────────────────────────
    // The TV wall's band, read as a rate. `1 +` is the safety property, not just
    // tidiness: a bare `bass * gain` would hit timeScale 0 on any quiet bar and
    // freeze both sprites mid-pose — and worse, stop animationcomplete-default
    // from ever firing, permanently killing DancerBack's popit chain, because the
    // anim would park between frames with no pending tick. At bass 0 this is
    // exactly 1, i.e. the frameRates the classes were built with. The tint above
    // is deliberately left alone: it's the scene's party-lights layer, this is the
    // tempo layer.
    const rate = 1 + bass * DANCER_RATE_GAIN;
    this.dancer.anims.timeScale = rate;
    this.dancer2.anims.timeScale = rate;

    this.text.setTint(Phaser.Utils.Array.GetRandom(gameOptions.goldColors));

    // Head pump. Quantized on purpose: `pixelArt: true` hands this 230×190 sprite
    // a NEAREST sampler, so a continuously-varying scale makes rows and columns
    // crawl as they double and un-double. Five discrete sizes let the head clunk
    // between them like a sprite swap instead — and five is the same number of
    // frames the player's own bass-driven TV wall cycles through. Ghost and head
    // take the IDENTICAL scale so the ghost stays hidden behind the head except
    // where the jitter reveals it; scaling them apart would leave a permanent halo
    // the idle look doesn't have.
    const pump = 1 +
      Math.round(bass * INVADER_SCALE_STEPS) * INVADER_SCALE_STEP;
    this.invader.setScale(pump);
    this.titleBack.setScale(pump);

    // Ghost throw. `original + drive × gain`, like the pump and the dancers' rate:
    // at drive 0 — no player, stale feed, or a bar with no bottom end — it is
    // exactly the ±8 this scene has always jittered, so the fallback needs no
    // branch. Bass only ever ADDS, splaying the ghost to ±18 on a kick. It's
    // deliberately never allowed below 8: the ±8 shimmer is the demo's resting
    // identity, and a ghost that collapsed onto the head through a quiet bar would
    // read as the scene having frozen rather than as the music being quiet.
    const throwPx = Math.round(GHOST_JITTER_IDLE + bass * GHOST_JITTER_GAIN);
    this.titleBack.setPosition(
      SCREEN_WIDTH / 2 + Phaser.Math.RND.integerInRange(-throwPx, throwPx),
      300 + Phaser.Math.RND.integerInRange(-throwPx, throwPx),
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
  // __PHASER_GAME__ is the canonical handle every cmg game exposes (debugger,
  // gamepad-support, controller-configurator); __currentGame is kept for
  // existing callers.
  globalThis.__currentGame = globalThis.__PHASER_GAME__ = new Phaser.Game(
    config,
  );
}

start();
