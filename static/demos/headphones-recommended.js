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

class Stars {
  constructor({ scene, x = 0, y = 0 }) {
    const colors = [0xd4af37];
    const rect = new Phaser.Geom.Rectangle(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    const particleConfig = {
      alpha: {
        onUpdate: () => Phaser.Math.FloatBetween(0.75, 0.85),
      },
      bounds: rect,
      collideBottom: false,
      frequency: 100,
      lifespan: 10000,
      speedY: { min: 60, max: 100 },
      scale: { min: 0.1, max: 0.2 },
      tint: {
        onUpdate: () => Phaser.Utils.Array.GetRandom(colors),
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
