// Goofy Game (Space-time DB) — Phaser 4 scene with SpacetimeDB multiplayer.
//
// A SpacetimeDB-backed remake of the WebSocket-relay Goofy demo
// (static/demos/goofy-game.js). Instead of a dumb fan-out relay with all
// room/coin/brick logic living client-side, the authoritative shared state
// lives in a SpacetimeDB module (demos/goofy-game-st/server):
//
//   * player — one row per client (globe angle/radius, facing, anim state,
//     banked coins). We upsert ours a few times a second via `update_player`;
//     every other row is rendered as an interpolated remote Goofy.
//   * brick  — sparse "this brick was hit" rows. The letter layout is
//     computed deterministically on every client (identical math + constants
//     + fixed 800x800 world), so a brick is addressed by a stable
//     "<phase>:<idx>" key. Popping/consuming calls `hit_brick`; the resulting
//     rows drive the pop/explosion on every screen.
//   * coin   — coins orbiting the globe, ids assigned by the server.
//     `spawn_coin` ejects them; `collect_coin` deletes one and banks it for
//     the collector, so a coin can't be double-counted.
//   * world  — a single row holding the shared phase index (`set_phase`).
//
// The transport is SpacetimeDB's self-contained JSON WebSocket subprotocol
// (`v1.json.spacetimedb`) — no generated bindings, no bundler, matching this
// repo's "one static JS file per demo" convention. If the module isn't
// reachable (not published yet, offline, blocked), the badge says so and the
// game runs fully playable in solo mode.
//
// Configure the target once via the URL, e.g.
//   /demos/goofy-game-st?stdb=wss://maincloud.spacetimedb.com&module=cmg-goofy-game
// The choice is remembered in localStorage. Defaults: SpacetimeDB Maincloud +
// module "cmg-goofy-game".

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
const NET_SEND_MS = 80;          // ~12 Hz update_player reducer rate.
const REMOTE_LERP = 0.35;        // Visual smoothing for incoming peer state.
const REMOTE_STALE_MS = 6000;    // Drop a peer we've stopped hearing from.

// Coin constants.
const COINS_PER_POP = 4;         // Coins a player banks each time they pop a block.
const ORBIT_SURFACE_OFFSET = 4;  // Orbiting coins sit just above the globe surface.
const COIN_SETTLE_MS = 650;      // Time for ejected coins to fall from the box to the surface.
const COIN_COLLECT_PX = 16;      // A walking goofy collects a coin within this distance.
const ORBIT_MIN_SPEED = 0.08;    // rad/s — slow drift around the globe.
const ORBIT_MAX_SPEED = 0.22;
const MAX_EJECT_COINS = 10;      // Cap the burst so a big stash doesn't spawn hundreds of coins.

// SpacetimeDB target. Query params override, then localStorage, then defaults.
const DEFAULT_STDB_URI = 'wss://maincloud.spacetimedb.com';
const DEFAULT_STDB_MODULE = 'cmg-goofy-game';

function resolveStdbTarget() {
  let uri = DEFAULT_STDB_URI;
  let mod = DEFAULT_STDB_MODULE;
  try {
    const qs = new URLSearchParams(location.search);
    const qUri = qs.get('stdb') || qs.get('stdbUri');
    const qMod = qs.get('module') || qs.get('stdbModule');
    if (qUri) { uri = qUri; localStorage.setItem('goofy-st-uri', qUri); }
    else if (localStorage.getItem('goofy-st-uri')) uri = localStorage.getItem('goofy-st-uri');
    if (qMod) { mod = qMod; localStorage.setItem('goofy-st-module', qMod); }
    else if (localStorage.getItem('goofy-st-module')) mod = localStorage.getItem('goofy-st-module');
  } catch (_) { /* no URL/localStorage — use defaults */ }
  return { uri: uri.replace(/\/+$/, ''), module: mod };
}

// Column order for each table, so a row that arrives as a positional array
// (SpacetimeDB's default product-type JSON) can be turned into a named record.
// Named-object rows are passed through unchanged.
const TABLE_COLUMNS = {
  player: ['identity', 'online', 'angle', 'radius', 'direction', 'state', 'coins', 'color', 'last_update'],
  brick: ['key', 'phase', 'idx', 'kind', 'consumed', 'hits', 'coin_limit'],
  coin: ['id', 'owner', 'angle', 'angular_vel', 'sx', 'sy', 'sradius'],
  world: ['id', 'phase'],
};
const TABLE_PK = { player: 'identity', brick: 'key', coin: 'id', world: 'id' };

// Normalise an Identity/ConnectionId/scalar to a stable string key. Both sides
// of a comparison come from the same server in the same encoding, so whatever
// shape it is, stringifying consistently is enough for equality.
function idKey(v) {
  if (v == null) return '';
  if (typeof v === 'string' || typeof v === 'number') return String(v);
  if (typeof v === 'object') {
    return v.__identity__ ?? v.__identity ?? v.Identity ?? v.identity ?? v.hex ?? JSON.stringify(v);
  }
  return String(v);
}

// Minimal SpacetimeDB client over the JSON WebSocket subprotocol. Emits
// onUpsert(table, pk, record) / onDelete(table, pk, record) and exposes
// callReducer(name, argsArray). Tolerant of row-shape variation across
// SpacetimeDB versions (rows may arrive as arrays, objects, or JSON strings).
class StdbClient {
  constructor(uri, module, handlers) {
    this.uri = uri;
    this.module = module;
    this.handlers = handlers;
    this.ws = null;
    this.reqId = 1;
    this.identity = null;
    this.myIdKey = '';
    this.connected = false;
  }

  connect() {
    const url = `${this.uri}/v1/database/${encodeURIComponent(this.module)}/subscribe`;
    let ws;
    try {
      ws = new WebSocket(url, ['v1.json.spacetimedb']);
    } catch (e) {
      this.handlers.onError && this.handlers.onError(e);
      return;
    }
    this.ws = ws;
    ws.addEventListener('open', () => {
      this.connected = true;
      this.subscribe();
      this.handlers.onOpen && this.handlers.onOpen();
    });
    ws.addEventListener('message', (e) => this.onMessage(e.data));
    ws.addEventListener('close', () => {
      this.connected = false;
      this.handlers.onClose && this.handlers.onClose();
    });
    ws.addEventListener('error', () => {
      this.handlers.onError && this.handlers.onError(new Error('ws error'));
    });
  }

  subscribe() {
    this.send({
      Subscribe: {
        query_strings: [
          'SELECT * FROM player',
          'SELECT * FROM brick',
          'SELECT * FROM coin',
          'SELECT * FROM world',
        ],
        request_id: this.reqId++,
      },
    });
  }

  send(obj) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    try { this.ws.send(JSON.stringify(obj)); } catch (_) { /* drop */ }
  }

  callReducer(name, args) {
    this.send({
      CallReducer: {
        reducer: name,
        args: JSON.stringify(args),
        request_id: this.reqId++,
        flags: 0,
      },
    });
  }

  onMessage(data) {
    if (typeof data !== 'string') return;
    let msg;
    try { msg = JSON.parse(data); } catch (_) { return; }
    if (!msg || typeof msg !== 'object') return;

    if (msg.IdentityToken) {
      this.identity = msg.IdentityToken.identity;
      this.myIdKey = idKey(this.identity);
      this.handlers.onIdentity && this.handlers.onIdentity(this.myIdKey);
      return;
    }
    if (msg.InitialSubscription) {
      this.applyUpdate(msg.InitialSubscription.database_update);
      this.handlers.onSubscribed && this.handlers.onSubscribed();
      return;
    }
    if (msg.TransactionUpdate) {
      const st = msg.TransactionUpdate.status;
      const committed = st && (st.Committed || st.committed);
      if (committed) this.applyUpdate(committed);
      return;
    }
    if (msg.TransactionUpdateLight) {
      this.applyUpdate(msg.TransactionUpdateLight.update);
      return;
    }
    // SubscribeApplied / SubscribeMultiApplied carry an initial row set too.
    const applied = msg.SubscribeApplied || msg.SubscribeMultiApplied;
    if (applied) {
      this.applyUpdate(applied.database_update || applied.update || applied.rows);
    }
  }

  applyUpdate(dbUpdate) {
    if (!dbUpdate) return;
    const tables = dbUpdate.tables || dbUpdate.Tables || [];
    for (const t of tables) {
      const name = t.table_name || t.tableName || t.name;
      if (!name || !TABLE_COLUMNS[name]) continue;
      this.applyTable(name, t.updates || t.Updates || []);
    }
  }

  applyTable(name, updates) {
    const dels = [];
    const ins = [];
    for (const u of updates) {
      // Some versions wrap in { Uncompressed: {...} }.
      const q = u.Uncompressed || u.uncompressed || u;
      for (const r of this.rowsOf(q.deletes)) {
        const rec = this.toRecord(name, r);
        if (rec) dels.push(rec);
      }
      for (const r of this.rowsOf(q.inserts)) {
        const rec = this.toRecord(name, r);
        if (rec) ins.push(rec);
      }
    }
    const pk = TABLE_PK[name];
    const insKeys = new Set(ins.map((r) => idKey(r[pk])));
    for (const d of dels) {
      const k = idKey(d[pk]);
      if (!insKeys.has(k)) this.handlers.onDelete(name, k, d);
    }
    for (const i of ins) this.handlers.onUpsert(name, idKey(i[pk]), i);
  }

  rowsOf(side) {
    if (!side) return [];
    if (Array.isArray(side)) return side;
    if (Array.isArray(side.rows)) return side.rows;
    if (Array.isArray(side.rows_data)) return side.rows_data;
    return [];
  }

  toRecord(name, r) {
    let row = r;
    if (typeof row === 'string') {
      try { row = JSON.parse(row); } catch (_) { return null; }
    }
    if (Array.isArray(row)) {
      const cols = TABLE_COLUMNS[name];
      const o = {};
      cols.forEach((c, i) => { o[c] = row[i]; });
      return o;
    }
    if (row && typeof row === 'object') return row;
    return null;
  }
}

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

// HSV → RGB int color, used for the P2+ color-cycle tint.
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

// Render the per-player coin scoreboard. `rows` is an ordered list of
// { label, isMe, coins, tint } (tint is an int color or null).
function renderScoreboard(rows) {
  const el = document.getElementById('scoreboard');
  if (!el) return;
  el.innerHTML = '';
  for (const r of rows) {
    const row = document.createElement('div');
    row.className = 'score-row' + (r.isMe ? ' me' : '');
    const swatch = document.createElement('span');
    swatch.className = 'score-swatch';
    swatch.style.background = r.tint == null
      ? '#f4f4f4'
      : '#' + (r.tint & 0xffffff).toString(16).padStart(6, '0');
    const name = document.createElement('span');
    name.className = 'score-name';
    name.textContent = r.label + (r.isMe ? ' (you)' : '');
    const coins = document.createElement('span');
    coins.className = 'score-coins';
    coins.textContent = '🪙 ' + r.coins;
    row.append(swatch, name, coins);
    el.appendChild(row);
  }
}

class GoofySpacetimeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GoofySpacetime' });
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

    // Remote peers keyed by identity string. Coins keyed by their id (server
    // id when online, "local:N" in solo mode).
    this.remotes = new Map();
    this.coins = new Map();
    this._localCoinSeq = 0;

    this._scoreKey = '';
    this.online = false;
    this.myIdKey = '';
    this.serverPlayers = new Map(); // identity → last player row (incl. our own)

    this.phaseTexts = buildPhaseTexts();
    this.phaseIndex = 0;
    this.advancing = false;
    this._pendingWorldPhase = null;
    this.letterContainers = [];
    this.collidables = [];
    this.fireworks = [];
    this.lastSlots = [];

    this.startPhase(0);

    this.input.keyboard.on('keydown-LEFT', () => { if (this.local.state === STATE_WALKING) this.local.direction = -1; });
    this.input.keyboard.on('keydown-RIGHT', () => { if (this.local.state === STATE_WALKING) this.local.direction = 1; });
    this.input.keyboard.on('keydown-SPACE', () => this.startJump(this.local));
    this.input.on('pointerdown', () => this.startJump(this.local));

    // Gamepad: bottom/right face buttons jump, d-pad/left-stick steer. `down`
    // fires for whichever pad triggered it, so any connected controller drives
    // the local goofy — no primary-pad gating.
    if (this.input.gamepad) {
      this.input.gamepad.on('down', (_pad, _button, index) => {
        if (index === 0 || index === 1 || index === 2 || index === 3) {
          this.startJump(this.local);       // any face button jumps
        } else if (index === 14 && this.local.state === STATE_WALKING) {
          this.local.direction = -1;        // D-pad left
        } else if (index === 15 && this.local.state === STATE_WALKING) {
          this.local.direction = 1;         // D-pad right
        }
      });
    }

    this.positionGoofy(this.local);

    this.cameras.main.startFollow(this.local.sprite, true, 0.12, 0.12);
    this.cameras.main.centerOn(this.local.sprite.x, this.local.sprite.y);

    this.netLastSendAt = 0;
    this.connectSpacetime();
  }

  // ---- SpacetimeDB wiring -------------------------------------------------

  connectSpacetime() {
    const target = resolveStdbTarget();
    setBadge('connecting…', 'connecting');
    this.stdb = new StdbClient(target.uri, target.module, {
      onOpen: () => setBadge('online · solo', ''),
      onIdentity: (k) => { this.myIdKey = k; },
      onSubscribed: () => { this.online = true; },
      onClose: () => { this.online = false; setBadge('offline · solo', 'full'); },
      onError: () => { this.online = false; setBadge('offline · solo', 'full'); },
      onUpsert: (t, pk, rec) => this.onRowUpsert(t, pk, rec),
      onDelete: (t, pk, rec) => this.onRowDelete(t, pk, rec),
    });
    try {
      this.stdb.connect();
    } catch (_) {
      setBadge('offline · solo', 'full');
    }

    globalThis.addEventListener('pagehide', () => {
      // Best-effort: mark ourselves walking/offline is handled server-side on
      // socket close; nothing to send here.
    });
  }

  onRowUpsert(table, pk, rec) {
    if (table === 'player') this.applyPlayerRow(pk, rec);
    else if (table === 'brick') this.applyBrickRow(rec);
    else if (table === 'coin') this.applyCoinRow(pk, rec);
    else if (table === 'world') this.applyWorldRow(rec);
  }

  onRowDelete(table, pk, rec) {
    if (table === 'player') this.removeRemote(pk);
    else if (table === 'coin') this.removeCoin(pk);
    // brick/world rows are only deleted on phase reset, which we handle via the
    // world row change; no per-row action needed.
  }

  applyPlayerRow(pk, rec) {
    this.serverPlayers.set(pk, rec);
    if (this.myIdKey && pk === this.myIdKey) {
      // Our own row — the authoritative coin count lives here.
      this.serverCoins = rec.coins | 0;
      return;
    }
    if (!(rec.online === false)) {
      let r = this.remotes.get(pk);
      if (!r) {
        r = this.makeRemote();
        r.angle = num(rec.angle, -Math.PI / 2);
        this.remotes.set(pk, r);
      }
      r.targetAngle = num(rec.angle, r.targetAngle);
      r.targetRadius = num(rec.radius, this.globeRadius) || this.globeRadius;
      r.direction = num(rec.direction, 1) < 0 ? -1 : 1;
      r.state = rec.state || STATE_WALKING;
      r.coins = rec.coins | 0;
      r.lastSeen = this.time.now;
      const walking = r.state === STATE_WALKING;
      if (walking && r.sprite.texture.key !== GOOFY_KEY) {
        r.sprite.setTexture(GOOFY_KEY, 'atlas_s0');
        r.sprite.play(GOOFY_WALK_ANIM);
      } else if (!walking && r.sprite.texture.key !== GOOFY_JUMP_KEY) {
        r.sprite.anims.stop();
        r.sprite.setTexture(GOOFY_JUMP_KEY, 'atlas_s0');
      }
    } else {
      this.removeRemote(pk);
    }
  }

  removeRemote(pk) {
    const r = this.remotes.get(pk);
    if (r) { r.sprite.destroy(); this.remotes.delete(pk); }
    this.serverPlayers.delete(pk);
  }

  // A brick/block row: reflect the shared consumed/hit state locally.
  applyBrickRow(rec) {
    if ((rec.phase | 0) !== this.phaseIndex) return;
    const c = this.collidables[rec.idx | 0];
    if (!c) return;
    if (c.type === 'brick') {
      if (!c.consumed) {
        c.consumed = true;
        this.explodeBrick(c);
        this.onConsumed();
      }
    } else if (c.type === 'block') {
      const hits = rec.hits | 0;
      if (!c.blockCounted) { c.blockCounted = true; this.onConsumed(); }
      if (hits > c.hits) {
        c.hits = hits;
        c.coinHitLimit = rec.coin_limit | 0;
        // A remote hit that isn't the launch just pops for the local view.
        if (hits <= c.coinHitLimit) this.popBlock(c);
      }
    }
  }

  applyCoinRow(pk, rec) {
    if (this.coins.has(pk)) return;
    const sradius = num(rec.sradius, this.globeRadius);
    this.coins.set(pk, {
      id: pk,
      mine: this.myIdKey && idKey(rec.owner) === this.myIdKey,
      sprite: this.makeCoinSprite(),
      angle: num(rec.angle, 0),
      angularVel: num(rec.angular_vel, 0),
      radiusStart: sradius,
      settleT: 0,
      settling: true,
      claimPending: false,
      remote: true,
    });
  }

  removeCoin(pk) {
    const c = this.coins.get(pk);
    if (c) { c.sprite.destroy(); this.coins.delete(pk); }
  }

  applyWorldRow(rec) {
    const n = rec.phase | 0;
    if (n === this.phaseIndex) return;
    if (this.advancing) { this._pendingWorldPhase = n; return; }
    this.phaseIndex = n;
    this.startPhase(n);
  }

  // ---- entity factories ---------------------------------------------------

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
      coins: 0,
    };
  }

  makeRemote() {
    const sprite = this.add.sprite(0, 0, GOOFY_KEY, 'atlas_s0');
    sprite.setOrigin(0.5, 1);
    sprite.setScale(GOOFY_SCALE);
    sprite.setDepth(3);
    sprite.play(GOOFY_WALK_ANIM);
    return {
      sprite,
      angle: -Math.PI / 2,
      targetAngle: -Math.PI / 2,
      radius: this.globeRadius,
      targetRadius: this.globeRadius,
      direction: 1,
      state: STATE_WALKING,
      coins: 0,
      lastSeen: this.time.now,
    };
  }

  makeCoinSprite() {
    const s = this.add.sprite(0, 0, COIN_KEY, 'atlas_s0');
    s.setScale(0.6);
    s.setDepth(6);
    s.play(COIN_SPIN_ANIM);
    return s;
  }

  // ---- reducers / net helpers --------------------------------------------

  netHitBrick(c) {
    if (this.online) this.stdb.callReducer('hit_brick', [this.phaseIndex, c.idx, c.type]);
  }

  netSpawnCoin(angle, angularVel, sx, sy, sradius) {
    if (this.online) {
      this.stdb.callReducer('spawn_coin', [angle, angularVel, sx, sy, sradius]);
    } else {
      // Solo: mint a coin locally so the demo is fully playable offline.
      const id = `local:${this._localCoinSeq++}`;
      this.coins.set(id, {
        id,
        mine: true,
        sprite: this.makeCoinSprite(),
        angle,
        angularVel,
        radiusStart: sradius,
        settleT: 0,
        settling: true,
        claimPending: false,
        remote: false,
      });
    }
  }

  netCollectCoin(coin) {
    if (this.online && coin.remote) {
      if (coin.claimPending) return;
      coin.claimPending = true;
      this.stdb.callReducer('collect_coin', [coin.id]);
    } else {
      // Solo (or a coin we spawned locally): bank immediately.
      this.removeCoin(coin.id);
      this.local.coins++;
    }
  }

  netSetPhase(next) {
    if (this.online) this.stdb.callReducer('set_phase', [this.phaseIndex, next]);
  }

  // ---- animations & layout (identical math on every client) --------------

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
    if (!text) { this.advancing = false; return; }
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

  // Push a collidable, stamping it with its deterministic index (its position
  // in the build order) — the key shared with the SpacetimeDB `brick` table.
  pushCollidable(c) {
    c.idx = this.collidables.length;
    c.hitThisJump = false;
    c.blockCounted = false;
    this.collidables.push(c);
  }

  buildLetter(container, char, containerX, containerY, rotation) {
    if (char === ' ') {
      const block = this.add.sprite(0, 0, BLOCK_KEY, 'atlas_s0');
      block.setScale(LETTER_CELL_SIZE / BRICK_SOURCE_PX * 1.5);
      block.play(BLOCK_PULSE_ANIM);
      container.add(block);
      this.pushCollidable({
        type: 'block',
        worldX: containerX,
        worldY: containerY,
        sprite: block,
        container,
        consumed: false,
        hits: 0,
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
        this.pushCollidable({
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
      this.pushCollidable({
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

  // ---- local goofy simulation --------------------------------------------

  startJump(g) {
    if (g.state !== STATE_WALKING || this.advancing) return;
    g.state = STATE_JUMPING;
    g.jumpElapsed = 0;
    g.sprite.anims.stop();
    g.sprite.setTexture(GOOFY_JUMP_KEY, 'atlas_s0');

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
    const now = this.time.now;

    if (this.local.state !== STATE_LAUNCHING) {
      if (this.local.state === STATE_WALKING) {
        // Any connected pad's left stick can steer — scan them all so a
        // second controller works without being the "primary" pad.
        const gp = this.input.gamepad;
        const pads = gp ? (gp.gamepads || [gp.pad1, gp.pad2, gp.pad3, gp.pad4]) : [];
        for (const pad of pads) {
          if (!pad || !pad.leftStick) continue;
          const lx = pad.leftStick.x;
          if (lx <= -0.3) { this.local.direction = -1; break; }
          if (lx >= 0.3) { this.local.direction = 1; break; }
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

    // Remote peers — interpolate toward last received state; drop stale ones.
    for (const [id, r] of this.remotes) {
      if (now - r.lastSeen > REMOTE_STALE_MS) {
        this.removeRemote(id);
        continue;
      }
      r.angle = Phaser.Math.Angle.RotateTo(r.angle, r.targetAngle, Math.PI * REMOTE_LERP * dt * 8);
      r.radius += (r.targetRadius - r.radius) * REMOTE_LERP;
      r.sprite.x = this.globe.x + Math.cos(r.angle) * r.radius;
      r.sprite.y = this.globe.y + Math.sin(r.angle) * r.radius;
      r.sprite.rotation = r.angle + Math.PI / 2;
      r.sprite.setFlipX(r.direction < 0);
    }

    this.updateCoins(dt);
    this.checkCoinCollection();
    this.refreshRoles();

    // Broadcast our state at a fixed rate via the update_player reducer.
    if (this.online) {
      const wall = performance.now();
      if (wall - this.netLastSendAt >= NET_SEND_MS) {
        this.netLastSendAt = wall;
        const dx = this.local.sprite.x - this.globe.x;
        const dy = this.local.sprite.y - this.globe.y;
        this.stdb.callReducer('update_player', [
          Math.atan2(dy, dx),
          Math.hypot(dx, dy),
          this.local.direction,
          this.local.state,
          this._myTint == null ? 0 : (this._myTint & 0xffffff),
        ]);
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
        this.netHitBrick(c);
      } else if (c.type === 'block') {
        if (c.hitThisJump) continue;
        c.hitThisJump = true;
        this.hitBlock(c, g);
      }
    }
  }

  hitBlock(c, g) {
    if (!c.blockCounted) { c.blockCounted = true; this.onConsumed(); }
    c.hits++;
    this.netHitBrick(c);
    if (c.hits > c.coinHitLimit) {
      this.launchGoofyFromBlock(c, g);
    } else {
      // Banked coins fund the burst that gets ejected on the launch hit.
      g.coins += COINS_PER_POP;
      this.popBlock(c);
    }
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
      this.advancing = false;
      // A world-phase change that arrived mid-fireworks wins.
      if (this._pendingWorldPhase != null) {
        const n = this._pendingWorldPhase;
        this._pendingWorldPhase = null;
        if (n !== this.phaseIndex) { this.phaseIndex = n; this.startPhase(n); return; }
      }
      if (this.phaseIndex < this.phaseTexts.length - 1) {
        const next = this.phaseIndex + 1;
        if (this.online) {
          // Let the server (guarded) drive the advance so all clients agree.
          this.netSetPhase(next);
        } else {
          this.phaseIndex = next;
          this.startPhase(next);
        }
      } else {
        this.clearPhaseObjects();
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

    // As the box fires the player out the top, a random number of their banked
    // coins spill out the bottom onto the globe.
    this.ejectCoinsFromBlock(c, g);

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

  // ---- coins --------------------------------------------------------------

  // Eject a random number of the launched player's banked coins out the bottom
  // of the box and onto the globe to orbit.
  ejectCoinsFromBlock(c, g) {
    const have = g.coins;
    if (have <= 0) return;
    const count = Phaser.Math.Between(1, Math.min(have, MAX_EJECT_COINS));
    g.coins -= count;

    const cx = this.globe.x;
    const cy = this.globe.y;
    const boxAngle = Math.atan2(c.worldY - cy, c.worldX - cx);
    const boxRadius = Math.hypot(c.worldX - cx, c.worldY - cy);
    for (let i = 0; i < count; i++) {
      const angle = boxAngle + (Math.random() - 0.5) * 0.7;
      const speed = ORBIT_MIN_SPEED + Math.random() * (ORBIT_MAX_SPEED - ORBIT_MIN_SPEED);
      const angularVel = speed * (Math.random() < 0.5 ? -1 : 1);
      this.netSpawnCoin(angle, angularVel, c.worldX, c.worldY, boxRadius);
    }
  }

  updateCoins(dt) {
    const cx = this.globe.x;
    const cy = this.globe.y;
    const surfaceR = this.globeRadius + ORBIT_SURFACE_OFFSET;
    for (const coin of this.coins.values()) {
      let r = surfaceR;
      if (coin.settling) {
        coin.settleT += (dt * 1000) / COIN_SETTLE_MS;
        if (coin.settleT >= 1) { coin.settleT = 1; coin.settling = false; }
        const e = 1 - (1 - coin.settleT) * (1 - coin.settleT); // ease-out
        r = Phaser.Math.Linear(coin.radiusStart, surfaceR, e);
      } else {
        coin.angle += coin.angularVel * dt;
      }
      coin.sprite.x = cx + Math.cos(coin.angle) * r;
      coin.sprite.y = cy + Math.sin(coin.angle) * r;
    }
  }

  // The local goofy collects coins it walks over.
  checkCoinCollection() {
    if (this.local.state !== STATE_WALKING) return;
    const gx = this.local.sprite.x;
    const gy = this.local.sprite.y;
    const thresholdSq = COIN_COLLECT_PX * COIN_COLLECT_PX;

    for (const coin of this.coins.values()) {
      if (coin.settling || coin.claimPending) continue;
      const dx = coin.sprite.x - gx;
      const dy = coin.sprite.y - gy;
      if (dx * dx + dy * dy >= thresholdSq) continue;
      this.netCollectCoin(coin);
    }
  }

  // Derive roles from the sorted set of live ids (lowest = P1, untinted),
  // tint each goofy accordingly, and refresh the scoreboard.
  refreshRoles() {
    const meId = this.myIdKey || '~self';
    const ids = [meId, ...this.remotes.keys()].sort();
    const t = (this.time.now / 1000) * 0.5;
    const rows = [];
    ids.forEach((id, i) => {
      const isMe = id === meId;
      const tint = i === 0 ? null : hsvToColor((t + i * 0.17) % 1, 1, 1);
      const sprite = isMe ? this.local.sprite : this.remotes.get(id)?.sprite;
      if (sprite) { if (tint == null) sprite.clearTint(); else sprite.setTint(tint); }
      if (isMe) { this._myRole = `P${i + 1}`; this._myTint = tint; }
      const myCoins = this.online && this.serverCoins != null ? this.serverCoins : this.local.coins;
      rows.push({
        label: `P${i + 1}`,
        isMe,
        coins: isMe ? myCoins : (this.remotes.get(id)?.coins ?? 0),
        tint,
      });
    });

    const key = rows.map((r) => `${r.label}:${r.isMe ? 1 : 0}:${r.coins}`).join('|');
    if (key !== this._scoreKey) {
      this._scoreKey = key;
      renderScoreboard(rows);
    }

    const peers = ids.length - 1;
    let status;
    if (this.online) {
      status = `you are ${this._myRole}` + (peers > 0 ? ` · ${peers} peer${peers > 1 ? 's' : ''}` : ' · solo');
    } else {
      status = 'offline · solo';
    }
    if (status !== this._badgeText) {
      this._badgeText = status;
      setBadge(status, this.online ? '' : 'full');
    }
  }
}

// Coerce a possibly-stringy/absent JSON scalar to a finite number, else fall
// back. SpacetimeDB may render some numeric fields as strings (e.g. u64).
function num(v, fallback) {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
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
    scene: GoofySpacetimeScene,
  };
  globalThis.__currentGame = new Phaser.Game(config);
}

start();
