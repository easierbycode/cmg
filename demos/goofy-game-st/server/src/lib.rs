//! Goofy Game — SpacetimeDB module.
//!
//! Authoritative shared state for the multiplayer Goofy demo. Every connected
//! browser owns one `player` row (its Goofy on the globe) and mutates the
//! shared world through reducers; SpacetimeDB streams the resulting row changes
//! to everyone subscribed. The web client (static/demos/goofy-game-st.js)
//! renders purely from these tables:
//!
//!   * `player` — one row per client: position on the globe, facing, anim state
//!     and banked coin count. Keyed by the caller's `Identity`.
//!   * `brick`  — sparse "deviation" state for the letter bricks/blocks: a row
//!     exists only once a brick has been hit. The client computes the full
//!     deterministic letter layout locally (same math on every client) and
//!     applies these rows to mark bricks consumed / blocks progressing.
//!   * `coin`   — coins orbiting the globe. Server assigns the id (auto_inc);
//!     `collect_coin` deletes the row and credits the collector, so a coin can
//!     never be banked twice across clients.
//!   * `world`  — a single row (id 0) holding the current phase index, so every
//!     client shows the same message arc.
//!
//! All positions are in the client's fixed 800x800 world space, which is
//! identical on every client (the globe texture + scale are constants), so raw
//! coordinates are safe to share.

use spacetimedb::{reducer, table, Identity, ReducerContext, Table, Timestamp};

#[table(name = player, public)]
pub struct Player {
    #[primary_key]
    identity: Identity,
    online: bool,
    /// Angle of the Goofy around the globe centre (radians).
    angle: f32,
    /// Distance from the globe centre (px) — grows while jumping/launching.
    radius: f32,
    /// Facing / travel direction: -1 or +1.
    direction: i32,
    /// "walking" | "jumping" | "launching".
    state: String,
    coins: u32,
    /// Tint colour (0xRRGGBB) the client picked for itself; 0 = untinted P1.
    color: u32,
    last_update: Timestamp,
}

#[table(name = brick, public)]
pub struct Brick {
    /// "<phase>:<idx>" — stable per-brick key. `idx` is the brick's position in
    /// the client's deterministically-built collidable list for that phase.
    #[primary_key]
    key: String,
    phase: u32,
    idx: u32,
    /// "brick" (part of a letter) or "block" (the pop-able "?" box).
    kind: String,
    consumed: bool,
    hits: u32,
    /// Hits a block absorbs before it launches whoever struck it.
    coin_limit: u32,
}

#[table(name = coin, public)]
pub struct Coin {
    #[primary_key]
    #[auto_inc]
    id: u64,
    owner: Identity,
    /// Starting orbit angle (radians) and drift speed (rad/s).
    angle: f32,
    angular_vel: f32,
    /// Spawn point (px) — the client eases the coin from here down to the
    /// globe surface, then drifts it around the surface.
    sx: f32,
    sy: f32,
    sradius: f32,
}

#[table(name = world, public)]
pub struct World {
    #[primary_key]
    id: u32,
    phase: u32,
}

const WALKING: &str = "walking";

fn ensure_world(ctx: &ReducerContext) {
    if ctx.db.world().id().find(0).is_none() {
        ctx.db.world().insert(World { id: 0, phase: 0 });
    }
}

#[reducer(init)]
pub fn init(ctx: &ReducerContext) {
    ensure_world(ctx);
}

#[reducer(client_connected)]
pub fn identity_connected(ctx: &ReducerContext) {
    ensure_world(ctx);
    if let Some(mut p) = ctx.db.player().identity().find(ctx.sender) {
        p.online = true;
        p.last_update = ctx.timestamp;
        ctx.db.player().identity().update(p);
    } else {
        ctx.db.player().insert(Player {
            identity: ctx.sender,
            online: true,
            angle: -std::f32::consts::FRAC_PI_2,
            radius: 0.0,
            direction: 1,
            state: WALKING.to_string(),
            coins: 0,
            color: 0,
            last_update: ctx.timestamp,
        });
    }
}

#[reducer(client_disconnected)]
pub fn identity_disconnected(ctx: &ReducerContext) {
    if let Some(mut p) = ctx.db.player().identity().find(ctx.sender) {
        p.online = false;
        p.last_update = ctx.timestamp;
        ctx.db.player().identity().update(p);
    }
}

#[reducer]
pub fn update_player(
    ctx: &ReducerContext,
    angle: f32,
    radius: f32,
    direction: i32,
    state: String,
    color: u32,
) {
    if let Some(mut p) = ctx.db.player().identity().find(ctx.sender) {
        p.online = true;
        p.angle = angle;
        p.radius = radius;
        p.direction = direction;
        p.state = state;
        p.color = color;
        p.last_update = ctx.timestamp;
        ctx.db.player().identity().update(p);
    } else {
        ctx.db.player().insert(Player {
            identity: ctx.sender,
            online: true,
            angle,
            radius,
            direction,
            state,
            coins: 0,
            color,
            last_update: ctx.timestamp,
        });
    }
}

/// Record a hit on a brick/block. Bricks are consumed on the first hit; blocks
/// accumulate hits (and gain a deterministic `coin_limit` the first time they
/// are struck) so every client agrees on when a block launches its striker.
#[reducer]
pub fn hit_brick(ctx: &ReducerContext, phase: u32, idx: u32, kind: String) {
    let key = format!("{phase}:{idx}");
    if let Some(mut b) = ctx.db.brick().key().find(&key) {
        if b.kind == "block" {
            b.hits += 1;
            b.consumed = true;
            ctx.db.brick().key().update(b);
        }
        return;
    }
    let is_block = kind == "block";
    ctx.db.brick().insert(Brick {
        key,
        phase,
        idx,
        kind,
        consumed: true,
        hits: if is_block { 1 } else { 0 },
        // Deterministic 6 or 7 so the launch moment matches on every client.
        coin_limit: if is_block { 6 + (idx % 2) } else { 0 },
    });
}

/// Spawn one orbiting coin owned by the caller.
#[reducer]
pub fn spawn_coin(
    ctx: &ReducerContext,
    angle: f32,
    angular_vel: f32,
    sx: f32,
    sy: f32,
    sradius: f32,
) {
    ctx.db.coin().insert(Coin {
        id: 0,
        owner: ctx.sender,
        angle,
        angular_vel,
        sx,
        sy,
        sradius,
    });
}

/// Collect a coin: delete it and bank one for the caller. Idempotent — if the
/// coin is already gone (another client collected it first) nothing happens.
#[reducer]
pub fn collect_coin(ctx: &ReducerContext, id: u64) {
    if ctx.db.coin().id().find(id).is_some() {
        ctx.db.coin().id().delete(id);
        if let Some(mut p) = ctx.db.player().identity().find(ctx.sender) {
            p.coins += 1;
            ctx.db.player().identity().update(p);
        }
    }
}

/// Advance the shared phase. Guarded by `expected` so that when several clients
/// finish a phase at once, only the first one actually advances the world; the
/// rest become no-ops. Also clears the finished phase's brick + coin rows so
/// the next phase starts clean.
#[reducer]
pub fn set_phase(ctx: &ReducerContext, expected: u32, next: u32) {
    ensure_world(ctx);
    if let Some(mut w) = ctx.db.world().id().find(0) {
        if w.phase != expected {
            return;
        }
        w.phase = next;
        ctx.db.world().id().update(w);

        let stale: Vec<String> = ctx
            .db
            .brick()
            .iter()
            .filter(|b| b.phase == expected)
            .map(|b| b.key)
            .collect();
        for key in stale {
            ctx.db.brick().key().delete(&key);
        }
        let coin_ids: Vec<u64> = ctx.db.coin().iter().map(|c| c.id).collect();
        for id in coin_ids {
            ctx.db.coin().id().delete(id);
        }
    }
}
