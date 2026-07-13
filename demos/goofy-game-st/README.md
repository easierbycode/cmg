# Goofy Game (Space-time DB)

A SpacetimeDB-backed remake of the [Goofy Game](../../routes/demos/goofy-game.tsx)
multiplayer demo. Instead of the dumb WebSocket fan-out relay
(`routes/api/ws-goofy.ts`), the shared world lives in a SpacetimeDB module and
is streamed to every client:

- **player** — one row per client: its Goofy's position on the globe, facing,
  animation state and banked coins.
- **brick** — sparse "this brick was hit" state for the letter bricks/blocks.
  The letter layout is computed deterministically on every client, so a brick
  is addressed by a stable `"<phase>:<idx>"` key.
- **coin** — coins orbiting the globe; the server assigns ids and arbitrates
  collection so a coin is never banked twice.
- **world** — a single row holding the shared phase (message) index.

Client: [`static/demos/goofy-game-st.js`](../../static/demos/goofy-game-st.js).
Route: [`routes/demos/goofy-game-st.tsx`](../../routes/demos/goofy-game-st.tsx).

## Publishing the module

The client talks to SpacetimeDB directly over its JSON WebSocket subprotocol
(`v1.json.spacetimedb`), so **no `spacetime generate` step is needed** for the
browser demo — you only need to publish the module.

```sh
# Install the CLI: https://spacetimedb.com/install
cd demos/goofy-game-st/server

# SpacetimeDB Maincloud (the client's default host):
spacetime login
spacetime publish --server maincloud cmg-goofy-game

# …or a local instance:
spacetime start                 # in another terminal
spacetime publish cmg-goofy-game
```

## Pointing the demo at your module

The client defaults to `wss://maincloud.spacetimedb.com` + module
`cmg-goofy-game`. Override per-visit via query params (remembered in
`localStorage`):

```
/demos/goofy-game-st?stdb=wss://maincloud.spacetimedb.com&module=cmg-goofy-game

# local instance:
/demos/goofy-game-st?stdb=ws://localhost:3000&module=cmg-goofy-game
```

If the module can't be reached (not published, offline, blocked), the badge
shows `offline · solo` and the game stays fully playable on its own — bricks
pop, coins spawn and collect, and the message phases advance locally.

## Controls

- **Keyboard:** ←/→ steer, Space / click jumps.
- **Gamepad:** left stick or D-pad steers, any face button jumps. Any connected
  controller works.
