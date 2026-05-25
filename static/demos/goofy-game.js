// Goofy Game — Phaser 4 scene with WebSocket multiplayer.
//
// First client to connect to /api/ws-goofy is P1, second is P2. Each client
// simulates its own goofy locally and broadcasts its position state at ~30 Hz;
// the remote goofy on the peer's screen is interpolated visually from those
// updates. Touch tap and gamepad bottom face button both trigger jump;
// d-pad / left-stick set walk direction. Inputs only affect the LOCAL goofy.
//
// P2's goofy gets a per-frame HSV tint that cycles through the color wheel so
// the two players are visually distinct.

const ASSET_BASE =
  'https://raw.githubusercontent.com/easierbycode/monkey-kombat/main/assets';

const GLOBE_KEY = 'mario-globe';
const GOOFY_KEY = 'goofy-walk';
const GOOFY_JUMP_KEY = 'goofy-jump';
const BRICK_KEY = 'mario-brick';
const BRICK_PARTICLE_KEY = 'mario-brick-particle';
const BLOCK_KEY = 'mario-block';
const COIN_KEY = 'coin';
const FIREWORK_KEY = 'mario-firework';

const GOOFY_WALK_ANIM = 'goofy-walk-loop';
const BLOCK_PULSE_ANIM = 'mario-block-pulse';
const COIN_SPIN_ANIM = 'mario-coin-spin';
const FIREWORK_ANIM = 'mario-firework-spin';

const GLOBE_SCALE = 0.45;
const GOOFY_SCALE = 0.6;

const ANGULAR_SPEED_RAD_PER_SEC = 1.1;
const GLOBE_ROTATION_FACTOR = 0.25;

const LETTER_CELL_SIZE = 4;
const LETTER_GRID_W = 3;
const LETTER_GRID_H = 5;
const BRICK_SOURCE_PX = 16;
const BASE_LETTER_RADIUS_OFFSET = 38;
const LETTER_SPACING_PADDING = 1.25;

const GOOFY_HEIGHT_PX = 24;

const BASE_JUMP_PEAK_HEIGHT = 30;
const BASE_JUMP_DURATION_SEC = 0.75;
const COLLISION_RADIUS_PX = 6;

const FIREWORK_DISPLAY_MS = 3500;

const STATE_WALKING = 'walking';
const STATE_JUMPING = 'jumping';
const STATE_LAUNCHING = 'launching';

const BLOCK_COIN_HIT_MIN = 6;
const BLOCK_COIN_HIT_MAX = 7;
const LAUNCH_SUCK_MS = 260;
const LAUNCH_SHAKE_MS = 300;
const LAUNCH_FLIGHT_MS = 1400;

// Net constants.
const NET_SEND_MS = 33;          // ~30 Hz broadcast rate for local state.
const REMOTE_LERP = 0.35;        // Visual smoothing for incoming peer state.

const LETTER_PATTERNS = {
  'A': ['.X.', 'X.X', 'XXX', 'X.X', 'X.X'],
  'B': ['XX.', 'X.X', 'XX.', 'X.X', 'XX.'],
  'C': ['XXX', 'X..', 'X..', 'X..', 'XXX'],
  'D': ['XX.', 'X.X', 'X.X', 'X.X', 'XX.'],
  'E': ['XXX', 'X..', 'XX.', 'X..', 'XXX'],
  'F': ['XXX', 'X..', 'XX.', 'X..', 'X..'],
  'G': ['XXX', 'X..', 'X.X', 'X.X', 'XXX'],
  'H': ['X.X', 'X.X', 'XXX', 'X.X', 'X.X'],
  'I': ['XXX', '.X.', '.X.', '.X.', 'XXX'],
  'J': ['..X', '..X', '..X', 'X.X', 'XXX'],
  'K': ['X.X', 'X.X', 'XX.', 'X.X', 'X.X'],
  'L': ['X..', 'X..', 'X..', 'X..', 'XXX'],
  'N': ['X.X', 'XX.', 'X.X', '.XX', 'X.X'],
  'O': ['XXX', 'X.X', 'X.X', 'X.X', 'XXX'],
  'P': ['XX.', 'X.X', 'XX.', 'X..', 'X..'],
  'Q': ['XXX', 'X.X', 'X.X', 'XXX', '..X'],
  'R': ['XX.', 'X.X', 'XX.', 'X.X', 'X.X'],
  'S': ['.XX', 'X..', '.X.', '..X', 'XX.'],
  'T': ['XXX', '.X.', '.X.', '.X.', '.X.'],
  'U': ['X.X', 'X.X', 'X.X', 'X.X', 'XXX'],
  'V': ['X.X', 'X.X', 'X.X', 'X.X', '.X.'],
  'W': ['X.X', 'X.X', 'XXX', 'XXX', '.X.'],
  'X': ['X.X', 'X.X', '.X.', 'X.X', 'X.X'],
  'Y': ['X.X', 'X.X', '.X.', '.X.', '.X.'],
  'Z': ['XXX', '..X', '.X.', 'X..', 'XXX'],
  "'": ['.X.', '.X.', '...', '...', '...'],
};

const M_DIAGONAL_PARTICLES = [
  { x: -3,   y: -8   },
  { x: -2,   y: -5.5 },
  { x: -1.2, y: -3   },
  { x: -0.5, y: -0.8 },
];
const M_V_TIP = { x: 0, y: 0.4 };

const DAY_NAMES = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

function buildPhaseTexts() {
  const today = DAY_NAMES[new Date().getDay()];
  return [
    "HAPPY MOTHER'S DAY",
    `HAPPY ${today}`,
    'YOUR PRINCESS IS IN ANOTHER CASTLE',
  ];
}

// HSV → RGB int color, used for the P2 color-cycle tint.
function hsvToColor(h, s, v) {
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  let r, g, b;
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  return (Math.round(r * 255) << 16) | (Math.round(g * 255) << 8) | Math.round(b * 255);
}

// Set/replace text on the role badge in the page header.
function setBadge(text, cls) {
  const el = document.getElementById('role-badge');
  if (!el) return;
  el.textContent = text;
  el.className = cls || '';
}

class GoofyMultiplayerScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GoofyMultiplayer' });
  }

  preload() {
    this.load.atlas(GLOBE_KEY, `${ASSET_BASE}/mario-globe.png`, `${ASSET_BASE}/mario-globe.json`);
    this.load.atlas(GOOFY_KEY, `${ASSET_BASE}/goofy-walk.png`, `${ASSET_BASE}/goofy-walk.json`);
    this.load.atlas(GOOFY_JUMP_KEY, `${ASSET_BASE}/goofy-jump.png`, `${ASSET_BASE}/goofy-jump.json`);
    this.load.atlas(BRICK_KEY, `${ASSET_BASE}/mario-brick.png`, `${ASSET_BASE}/mario-brick.json`);
    this.load.atlas(BRICK_PARTICLE_KEY, `${ASSET_BASE}/mario-brick-particle.png`, `${ASSET_BASE}/mario-brick-particle.json`);
    this.load.atlas(BLOCK_KEY, `${ASSET_BASE}/mario-block.png`, `${ASSET_BASE}/mario-block.json`);
    this.load.atlas(COIN_KEY, `${ASSET_BASE}/coin.png`, `${ASSET_BASE}/coin.json`);
    this.load.atlas(FIREWORK_KEY, `${ASSET_BASE}/mario-firework.png`, `${ASSET_BASE}/mario-firework.json`);
  }

  create() {
    const w = this.game.config.width;
    const h = this.game.config.height;

    this.cameras.main.setBackgroundColor('#1a2238');

    this.globe = this.physics.add.sprite(w / 2, h / 2, GLOBE_KEY, 'atlas_s0');
    this.globe.setScale(GLOBE_SCALE);
    this.globe.setDepth(1);

    this.globeRadius = (this.globe.width * GLOBE_SCALE) / 2;
    this.globe.body.setCircle(this.globe.width / 2);
    this.globe.body.setOffset(0, 0);
    this.globe.body.setImmovable(true);
    this.globe.body.setAllowGravity(false);

    this.createAnimations();

    // Local goofy — controlled by this client's inputs.
    this.local = this.makeGoofy();
    // Remote goofy — only visible once the peer connects. Hidden initially.
    this.remote = this.makeGoofy();
    this.remote.sprite.setVisible(false);
    this.remote.connected = false;

    this.phaseTexts = buildPhaseTexts();
    this.phaseIndex = 0;
    this.advancing = false;
    this.letterContainers = [];
    this.collidables = [];
    this.fireworks = [];
    this.lastSlots = [];

    this.startPhase(0);

    this.input.keyboard.on('keydown-LEFT', () => { if (this.local.state === STATE_WALKING) this.local.direction = -1; });
    this.input.keyboard.on('keydown-RIGHT', () => { if (this.local.state === STATE_WALKING) this.local.direction = 1; });
    this.input.keyboard.on('keydown-SPACE', () => this.startJump(this.local));
    this.input.on('pointerdown', () => this.startJump(this.local));

    // Gamepad: bottom face button jumps, d-pad/left-stick steer.
    if (this.input.gamepad) {
      this.input.gamepad.on('down', (_pad, _button, index) => {
        if (index === 0) {
          this.startJump(this.local);
        } else if (index === 14 && this.local.state === STATE_WALKING) {
          this.local.direction = -1;
        } else if (index === 15 && this.local.state === STATE_WALKING) {
          this.local.direction = 1;
        }
      });
    }

    this.positionGoofy(this.local);
    this.positionGoofy(this.remote);

    this.cameras.main.startFollow(this.local.sprite, true, 0.12, 0.12);
    this.cameras.main.centerOn(this.local.sprite.x, this.local.sprite.y);

    this.connectMultiplayer();
  }

  // Allocates one goofy. role is filled in once a multiplayer assignment
  // arrives; until then we render as P1-style (no tint cycle).
  makeGoofy() {
    const sprite = this.add.sprite(0, 0, GOOFY_KEY, 'atlas_s0');
    sprite.setOrigin(0.5, 1);
    sprite.setScale(GOOFY_SCALE);
    sprite.setDepth(3);
    sprite.play(GOOFY_WALK_ANIM);
    return {
      sprite,
      angle: -Math.PI / 2,
      direction: 1,
      state: STATE_WALKING,
      jumpElapsed: 0,
      jumpRadius: 0,
      // Visual smoothing target for remote players.
      targetAngle: -Math.PI / 2,
      targetJumpRadius: 0,
      role: null,
    };
  }

  connectMultiplayer() {
    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = `${proto}//${location.host}/api/ws-goofy`;
    setBadge('connecting…', 'connecting');

    let ws;
    try {
      ws = new WebSocket(url);
    } catch (e) {
      setBadge('ws error', 'full');
      return;
    }
    this.ws = ws;
    this.netLastSendAt = 0;

    ws.addEventListener('open', () => {
      // The server sends a 'hello' with our role next; nothing to do here.
    });

    ws.addEventListener('message', (e) => {
      let msg;
      try { msg = JSON.parse(e.data); } catch (_) { return; }
      if (msg.type === 'hello') {
        this.local.role = msg.role;
        setBadge(`you are ${msg.role.toUpperCase()}`, '');
      } else if (msg.type === 'peer-joined') {
        this.remote.role = msg.role;
        this.remote.connected = true;
        this.remote.sprite.setVisible(true);
      } else if (msg.type === 'peer-left') {
        this.remote.connected = false;
        this.remote.sprite.setVisible(false);
        this.remote.sprite.clearTint();
      } else if (msg.type === 'state') {
        // Remote authoritative state for the peer's goofy.
        this.remote.targetAngle = msg.angle;
        this.remote.targetJumpRadius = msg.jumpRadius;
        this.remote.direction = msg.direction;
        this.remote.state = msg.state;
        if (!this.remote.connected) {
          this.remote.connected = true;
          this.remote.sprite.setVisible(true);
        }
        // Swap the texture/anim to reflect jumping vs walking.
        if (msg.state === STATE_WALKING && this.remote.sprite.texture.key !== GOOFY_KEY) {
          this.remote.sprite.setTexture(GOOFY_KEY, 'atlas_s0');
          this.remote.sprite.play(GOOFY_WALK_ANIM);
        } else if (msg.state !== STATE_WALKING && this.remote.sprite.texture.key !== GOOFY_JUMP_KEY) {
          this.remote.sprite.anims.stop();
          this.remote.sprite.setTexture(GOOFY_JUMP_KEY, 'atlas_s0');
        }
      } else if (msg.type === 'full') {
        // Latch so the imminent server close doesn't clobber this reason
        // with a generic 'disconnected'.
        this.roomFull = true;
        setBadge('room full (max 2)', 'full');
      }
    });

    ws.addEventListener('close', () => {
      if (!this.roomFull) setBadge('disconnected', 'full');
      this.remote.connected = false;
      this.remote.sprite.setVisible(false);
    });

    ws.addEventListener('error', () => {
      setBadge('ws error', 'full');
    });
  }

  createAnimations() {
    if (!this.anims.exists(GOOFY_WALK_ANIM)) {
      this.anims.create({
        key: GOOFY_WALK_ANIM,
        frames: this.anims.generateFrameNames(GOOFY_KEY, { prefix: 'atlas_s', start: 0, end: 2 }),
        frameRate: 8,
        repeat: -1,
      });
    }
    if (!this.anims.exists(BLOCK_PULSE_ANIM)) {
      this.anims.create({
        key: BLOCK_PULSE_ANIM,
        frames: this.anims.generateFrameNames(BLOCK_KEY, { prefix: 'atlas_s', start: 0, end: 3 }),
        frameRate: 6,
        repeat: -1,
      });
    }
    if (!this.anims.exists(COIN_SPIN_ANIM)) {
      this.anims.create({
        key: COIN_SPIN_ANIM,
        frames: this.anims.generateFrameNames(COIN_KEY, { prefix: 'atlas_s', start: 0, end: 11 }),
        frameRate: 16,
        repeat: -1,
      });
    }
    if (!this.anims.exists(FIREWORK_ANIM)) {
      this.anims.create({
        key: FIREWORK_ANIM,
        frames: this.anims.generateFrameNames(FIREWORK_KEY, { prefix: 'atlas_s', start: 0, end: 1 }),
        frameRate: 10,
        repeat: -1,
      });
    }
  }

  computeLayout(text) {
    const arcDeg = 240;
    const stepDeg = arcDeg / (text.length - 1);
    const stepRad = Phaser.Math.DegToRad(stepDeg);
    const letterWidthPx = LETTER_GRID_W * LETTER_CELL_SIZE;
    const minStepArc = letterWidthPx * LETTER_SPACING_PADDING;

    const baseLetterRadius = this.globeRadius + BASE_LETTER_RADIUS_OFFSET;
    const minLetterRadius = minStepArc / stepRad;
    const letterRadius = Math.max(baseLetterRadius, minLetterRadius);

    const letterRadiusOffset = letterRadius - this.globeRadius;
    const jumpPeakHeight = Math.max(BASE_JUMP_PEAK_HEIGHT, letterRadiusOffset);
    const jumpDurationSec = BASE_JUMP_DURATION_SEC * Math.sqrt(jumpPeakHeight / BASE_JUMP_PEAK_HEIGHT);

    const letterHeightPx = LETTER_GRID_H * LETTER_CELL_SIZE;
    const farthest = letterRadius + letterHeightPx;
    const viewport = Math.min(this.game.config.width, this.game.config.height);
    const zoomFitArc = (viewport * 0.5) / (farthest * 1.1);
    const cameraZoom = Math.min(2.5, Math.max(1.0, zoomFitArc));

    return { arcDeg, letterRadius, jumpPeakHeight, jumpDurationSec, cameraZoom };
  }

  startPhase(index) {
    this.clearPhaseObjects();

    const text = this.phaseTexts[index];
    const layout = this.computeLayout(text);
    this.letterRadius = layout.letterRadius;
    this.jumpPeakHeight = layout.jumpPeakHeight;
    this.jumpDurationSec = layout.jumpDurationSec;

    this.cameras.main.zoomTo(layout.cameraZoom, 400, 'Sine.easeInOut');

    this.createMessageArc(text, layout.arcDeg, layout.letterRadius);

    this.activeCount = this.collidables.length;
    this.advancing = false;
  }

  clearPhaseObjects() {
    for (const c of this.letterContainers) c.destroy(true);
    this.letterContainers.length = 0;
    this.collidables.length = 0;
    for (const f of this.fireworks) f.destroy();
    this.fireworks.length = 0;
    this.lastSlots.length = 0;
  }

  createMessageArc(text, arcDeg, letterRadius) {
    const cx = this.globe.x;
    const cy = this.globe.y;

    const chars = text.split('');
    const stepDeg = arcDeg / (chars.length - 1);
    const startDeg = -90 - arcDeg / 2;

    chars.forEach((char, i) => {
      const deg = startDeg + i * stepDeg;
      const rad = Phaser.Math.DegToRad(deg);
      const x = cx + Math.cos(rad) * letterRadius;
      const y = cy + Math.sin(rad) * letterRadius;
      const upright = rad + Math.PI / 2;

      const container = this.add.container(x, y);
      container.setDepth(2);
      container.setRotation(upright);
      this.letterContainers.push(container);

      this.buildLetter(container, char, x, y, upright);
    });
  }

  buildLetter(container, char, containerX, containerY, rotation) {
    if (char === ' ') {
      const block = this.add.sprite(0, 0, BLOCK_KEY, 'atlas_s0');
      block.setScale(LETTER_CELL_SIZE / BRICK_SOURCE_PX * 1.5);
      block.play(BLOCK_PULSE_ANIM);
      container.add(block);
      this.collidables.push({
        type: 'block',
        worldX: containerX,
        worldY: containerY,
        sprite: block,
        container,
        consumed: false,
        hits: 0,
        hitThisJump: false,
        coinHitLimit: Phaser.Math.Between(BLOCK_COIN_HIT_MIN, BLOCK_COIN_HIT_MAX),
      });
      this.lastSlots.push({ worldX: containerX, worldY: containerY });
      return;
    }

    if (char === 'M') {
      this.buildLetterM(container, containerX, containerY, rotation);
      return;
    }

    const pattern = LETTER_PATTERNS[char];
    if (!pattern) return;

    const brickScale = LETTER_CELL_SIZE / BRICK_SOURCE_PX;
    const colCenter = (LETTER_GRID_W - 1) / 2;
    const rowCenter = (LETTER_GRID_H - 1) / 2;
    const cosR = Math.cos(rotation);
    const sinR = Math.sin(rotation);

    for (let row = 0; row < pattern.length; row++) {
      const line = pattern[row];
      for (let col = 0; col < line.length; col++) {
        if (line[col] !== 'X') continue;
        const localX = (col - colCenter) * LETTER_CELL_SIZE;
        const localY = (row - rowCenter) * LETTER_CELL_SIZE;
        const brick = this.add.image(localX, localY, BRICK_KEY, 'atlas_s0');
        brick.setScale(brickScale);
        container.add(brick);

        const worldX = containerX + localX * cosR - localY * sinR;
        const worldY = containerY + localX * sinR + localY * cosR;
        this.collidables.push({
          type: 'brick',
          worldX,
          worldY,
          sprite: brick,
          container,
          consumed: false,
        });
        this.lastSlots.push({ worldX, worldY });
      }
    }
  }

  buildLetterM(container, containerX, containerY, rotation) {
    const brickScale = LETTER_CELL_SIZE / BRICK_SOURCE_PX;
    const particleScale = brickScale;
    const colCenter = (LETTER_GRID_W - 1) / 2;
    const rowCenter = (LETTER_GRID_H - 1) / 2;
    const cosR = Math.cos(rotation);
    const sinR = Math.sin(rotation);

    const place = (localX, localY, key, scale, flipX) => {
      const sprite = this.add.image(localX, localY, key, 'atlas_s0');
      sprite.setScale(scale);
      if (flipX) sprite.setFlipX(true);
      container.add(sprite);

      const worldX = containerX + localX * cosR - localY * sinR;
      const worldY = containerY + localX * sinR + localY * cosR;
      this.collidables.push({
        type: 'brick',
        worldX,
        worldY,
        sprite,
        container,
        consumed: false,
      });
      this.lastSlots.push({ worldX, worldY });
    };

    for (let row = 0; row < LETTER_GRID_H; row++) {
      for (const col of [0, 2]) {
        const localX = (col - colCenter) * LETTER_CELL_SIZE;
        const localY = (row - rowCenter) * LETTER_CELL_SIZE;
        place(localX, localY, BRICK_KEY, brickScale, false);
      }
    }

    for (const p of M_DIAGONAL_PARTICLES) {
      place(p.x, p.y, BRICK_PARTICLE_KEY, particleScale, false);
      place(-p.x, p.y, BRICK_PARTICLE_KEY, particleScale, true);
    }

    place(M_V_TIP.x, M_V_TIP.y, BRICK_PARTICLE_KEY, particleScale, false);
    place(M_V_TIP.x, M_V_TIP.y, BRICK_PARTICLE_KEY, particleScale, true);
  }

  startJump(g) {
    if (g.state !== STATE_WALKING || this.advancing) return;
    g.state = STATE_JUMPING;
    g.jumpElapsed = 0;
    g.sprite.anims.stop();
    g.sprite.setTexture(GOOFY_JUMP_KEY, 'atlas_s0');

    // Block hits are local-only — a remote goofy that "jumps" on our screen
    // is a visual replay, so we don't reset hitThisJump for them. Only the
    // local jump actually interacts with the world.
    if (g === this.local) {
      for (const c of this.collidables) {
        if (c.type === 'block') c.hitThisJump = false;
      }
    }
  }

  endJump(g) {
    g.state = STATE_WALKING;
    g.jumpRadius = this.globeRadius;
    g.direction *= -1;
    g.sprite.setTexture(GOOFY_KEY, 'atlas_s0');
    g.sprite.play(GOOFY_WALK_ANIM);
  }

  update(_, deltaMs) {
    const dt = deltaMs / 1000;

    // Local simulation — physics, input polling, world collisions.
    if (this.local.state !== STATE_LAUNCHING) {
      if (this.local.state === STATE_WALKING) {
        const pad = this.input.gamepad && this.input.gamepad.pad1;
        if (pad) {
          const lx = pad.leftStick.x;
          if (lx <= -0.3) this.local.direction = -1;
          else if (lx >= 0.3) this.local.direction = 1;
        }
        this.local.angle += this.local.direction * ANGULAR_SPEED_RAD_PER_SEC * dt;
      } else if (this.local.state === STATE_JUMPING) {
        this.local.jumpElapsed += dt;
        const t = this.local.jumpElapsed / this.jumpDurationSec;
        if (t >= 1) {
          this.endJump(this.local);
        } else {
          this.local.jumpRadius = this.globeRadius + this.jumpPeakHeight * Math.sin(Math.PI * t);
          this.checkLetterCollisions(this.local);
        }
      }

      if (this.globe) {
        const surfaceArc = ANGULAR_SPEED_RAD_PER_SEC * GLOBE_ROTATION_FACTOR * dt;
        this.globe.rotation -= this.local.direction * surfaceArc;
      }

      this.positionGoofy(this.local);
    }

    // Remote — interpolate visually toward the last received state.
    if (this.remote.connected) {
      this.remote.angle = Phaser.Math.Angle.RotateTo(
        this.remote.angle,
        this.remote.targetAngle,
        Math.PI * REMOTE_LERP * dt * 8,
      );
      this.remote.jumpRadius += (this.remote.targetJumpRadius - this.remote.jumpRadius) * REMOTE_LERP;
      this.positionGoofy(this.remote);

      // P2 visual: cycle the goofy tint through hues.
      if (this.remote.role === 'p2') {
        const t = (this.time.now / 1000) * 0.5;
        this.remote.sprite.setTint(hsvToColor(t % 1, 1, 1));
      } else if (this.local.role === 'p2') {
        // If WE are p2, the LOCAL goofy is the color-rotating one.
        const t = (this.time.now / 1000) * 0.5;
        this.local.sprite.setTint(hsvToColor(t % 1, 1, 1));
      } else {
        this.remote.sprite.clearTint();
      }
    } else if (this.local.role === 'p2') {
      const t = (this.time.now / 1000) * 0.5;
      this.local.sprite.setTint(hsvToColor(t % 1, 1, 1));
    }

    // Broadcast our state at a fixed rate.
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const now = performance.now();
      if (now - this.netLastSendAt >= NET_SEND_MS) {
        this.netLastSendAt = now;
        try {
          this.ws.send(JSON.stringify({
            type: 'state',
            angle: this.local.angle,
            jumpRadius: this.local.state === STATE_JUMPING ? this.local.jumpRadius : this.globeRadius,
            direction: this.local.direction,
            state: this.local.state,
          }));
        } catch (_) { /* drop */ }
      }
    }
  }

  checkLetterCollisions(g) {
    const cx = this.globe.x;
    const cy = this.globe.y;
    const outwardX = Math.cos(g.angle);
    const outwardY = Math.sin(g.angle);
    const collisionR = g.jumpRadius + GOOFY_HEIGHT_PX * 0.7;
    const probeX = cx + outwardX * collisionR;
    const probeY = cy + outwardY * collisionR;
    const thresholdSq = COLLISION_RADIUS_PX * COLLISION_RADIUS_PX;

    for (const c of this.collidables) {
      if (c.consumed) continue;
      const dx = c.worldX - probeX;
      const dy = c.worldY - probeY;
      if (dx * dx + dy * dy >= thresholdSq) continue;

      if (c.type === 'brick') {
        c.consumed = true;
        this.explodeBrick(c);
        this.onConsumed();
      } else if (c.type === 'block') {
        if (c.hitThisJump) continue;
        c.hitThisJump = true;
        this.hitBlock(c, g);
      }
    }
  }

  hitBlock(c, g) {
    c.hits++;
    if (c.hits === 1) this.onConsumed();
    if (c.hits > c.coinHitLimit) this.launchGoofyFromBlock(c, g);
    else this.popBlock(c);
  }

  onConsumed() {
    this.activeCount--;
    if (this.activeCount <= 0 && !this.advancing) {
      this.advancing = true;
      this.time.delayedCall(450, () => this.runFireworksThenAdvance());
    }
  }

  runFireworksThenAdvance() {
    const slots = this.lastSlots.slice();
    const fireworkScale = LETTER_CELL_SIZE / BRICK_SOURCE_PX * 1.2;

    for (const s of slots) {
      const fw = this.add.sprite(s.worldX, s.worldY, FIREWORK_KEY, 'atlas_s0');
      fw.setScale(fireworkScale);
      fw.setDepth(4);
      fw.play(FIREWORK_ANIM);
      this.fireworks.push(fw);
    }

    this.time.delayedCall(FIREWORK_DISPLAY_MS, () => {
      if (this.phaseIndex < this.phaseTexts.length - 1) {
        this.phaseIndex++;
        this.startPhase(this.phaseIndex);
      } else {
        this.clearPhaseObjects();
        this.advancing = false;
      }
    });
  }

  explodeBrick(c) {
    c.sprite.setVisible(false);

    const N = 5;
    for (let i = 0; i < N; i++) {
      const p = this.add.image(c.worldX, c.worldY, BRICK_PARTICLE_KEY, 'atlas_s0');
      p.setScale(0.5);
      p.setDepth(5);
      const angle = (i / N) * Math.PI * 2 + Math.random() * 0.6;
      const speed = 24 + Math.random() * 28;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed - 30;
      this.tweens.add({
        targets: p,
        x: c.worldX + vx * 0.7,
        y: c.worldY + vy * 0.7 + 80,
        angle: 360 * (Math.random() > 0.5 ? 1 : -1),
        alpha: { from: 1, to: 0 },
        duration: 800,
        ease: 'Quad.In',
        onComplete: () => p.destroy(),
      });
    }
  }

  popBlock(c) {
    const radialAngle = Math.atan2(c.worldY - this.globe.y, c.worldX - this.globe.x);
    const outX = Math.cos(radialAngle);
    const outY = Math.sin(radialAngle);

    this.tweens.add({
      targets: c.sprite,
      scaleX: c.sprite.scaleX * 1.2,
      scaleY: c.sprite.scaleY * 1.2,
      duration: 80,
      yoyo: true,
    });

    const N = 4;
    for (let i = 0; i < N; i++) {
      const coin = this.add.sprite(c.worldX, c.worldY, COIN_KEY, 'atlas_s0');
      coin.setScale(0.6);
      coin.setDepth(6);
      coin.play(COIN_SPIN_ANIM);

      const spread = (i - (N - 1) / 2) * 0.35;
      const angle = radialAngle + spread;
      const dist = 22 + Math.random() * 10;
      const peakX = c.worldX + Math.cos(angle) * dist;
      const peakY = c.worldY + Math.sin(angle) * dist;

      this.tweens.add({
        targets: coin,
        x: peakX,
        y: peakY,
        duration: 350,
        ease: 'Quad.Out',
        onComplete: () => {
          this.tweens.add({
            targets: coin,
            x: peakX + outX * 18,
            y: peakY + outY * 18,
            alpha: 0,
            duration: 450,
            ease: 'Quad.In',
            onComplete: () => coin.destroy(),
          });
        },
      });
    }
  }

  launchGoofyFromBlock(c, g) {
    g.state = STATE_LAUNCHING;
    g.sprite.anims.stop();
    g.sprite.setTexture(GOOFY_JUMP_KEY, 'atlas_s0');
    g.sprite.setFlipX(false);

    const cx = this.globe.x;
    const cy = this.globe.y;

    this.tweens.add({
      targets: g.sprite,
      x: c.worldX,
      y: c.worldY,
      scaleX: GOOFY_SCALE * 0.12,
      scaleY: GOOFY_SCALE * 0.12,
      duration: LAUNCH_SUCK_MS,
      ease: 'Quad.In',
      onComplete: () => {
        g.sprite.setVisible(false);
        this.shakeBlock(c);
        this.time.delayedCall(LAUNCH_SHAKE_MS, () => this.cannonLaunch(c, cx, cy, g));
      },
    });
  }

  shakeBlock(c) {
    this.tweens.add({
      targets: c.sprite,
      x: { from: -2, to: 2 },
      duration: 40,
      yoyo: true,
      repeat: Math.floor(LAUNCH_SHAKE_MS / 80),
      onComplete: () => { c.sprite.x = 0; },
    });
  }

  cannonLaunch(c, cx, cy, g) {
    const boxAngle = Math.atan2(c.worldY - cy, c.worldX - cx);
    const targetAngle = boxAngle + Math.PI;

    g.sprite.setScale(GOOFY_SCALE);
    g.sprite.setVisible(true);
    g.sprite.setFlipY(true);

    const peak = this.globeRadius * 1.2 + 60;
    const launch = { t: 0 };
    let nextTrailT = 0;

    this.tweens.add({
      targets: launch,
      t: 1,
      duration: LAUNCH_FLIGHT_MS,
      ease: 'Sine.easeInOut',
      onUpdate: () => {
        const t = launch.t;
        const angle = boxAngle + Math.PI * t;
        const radius = this.globeRadius + peak * Math.sin(Math.PI * t);
        g.sprite.x = cx + Math.cos(angle) * radius;
        g.sprite.y = cy + Math.sin(angle) * radius;
        g.sprite.rotation = t * Math.PI * 4;

        if (t >= nextTrailT) {
          this.spawnTrailFirework(g.sprite.x, g.sprite.y);
          nextTrailT += 0.07;
        }
      },
      onComplete: () => this.landFromLaunch(targetAngle, g),
    });
  }

  spawnTrailFirework(x, y) {
    const scale = LETTER_CELL_SIZE / BRICK_SOURCE_PX * 1.2;
    const fw = this.add.sprite(x, y, FIREWORK_KEY, 'atlas_s0');
    fw.setScale(scale);
    fw.setDepth(2);
    fw.play(FIREWORK_ANIM);
    this.tweens.add({
      targets: fw,
      alpha: { from: 1, to: 0 },
      scale: scale * 1.6,
      duration: 600,
      ease: 'Quad.Out',
      onComplete: () => fw.destroy(),
    });
  }

  landFromLaunch(targetAngle, g) {
    g.sprite.setFlipY(false);
    g.angle = targetAngle;
    g.jumpRadius = this.globeRadius;
    g.state = STATE_WALKING;
    g.sprite.setTexture(GOOFY_KEY, 'atlas_s0');
    g.sprite.play(GOOFY_WALK_ANIM);
    this.positionGoofy(g);
  }

  positionGoofy(g) {
    if (!g || !g.sprite || !this.globe) return;
    const cx = this.globe.x;
    const cy = this.globe.y;
    const r = (g.state === STATE_JUMPING) ? g.jumpRadius : this.globeRadius;
    g.sprite.x = cx + Math.cos(g.angle) * r;
    g.sprite.y = cy + Math.sin(g.angle) * r;
    g.sprite.rotation = g.angle + Math.PI / 2;
    g.sprite.setFlipX(g.direction < 0);
  }
}

function start() {
  if (typeof globalThis.Phaser === 'undefined') {
    // Phaser hasn't finished loading yet — re-try on next tick.
    setTimeout(start, 30);
    return;
  }
  const config = {
    type: Phaser.WEBGL,
    parent: 'phaser-example',
    width: 800,
    height: 800,
    backgroundColor: '#1a2238',
    antialias: true,
    pixelArt: true,
    mipmapFilter: 'LINEAR_MIPMAP_LINEAR',
    physics: {
      default: 'arcade',
      arcade: { gravity: { y: 0 }, debug: false },
    },
    input: {
      gamepad: true,
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: GoofyMultiplayerScene,
  };
  globalThis.__currentGame = new Phaser.Game(config);
}

start();
