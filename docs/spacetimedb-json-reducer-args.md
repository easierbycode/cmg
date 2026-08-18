# SpacetimeDB JSON reducer args

In the goofy-game-st demo's hand-rolled SpacetimeDB JSON client
(`static/demos/goofy-game-st.js`, class `StdbClient`), reducer arguments in a
`CallReducer` frame must encode integers (u32/u64/…) as JSON **numbers**.
Passing a **string** fails server-side deserialisation, e.g.:

`Failed: invalid arguments for reducer collect_coin: invalid type: string "1", expected u64`

The trap: the client's `idKey()` normalises every primary key to a **string** so
it can key the `coins`/`remotes` Maps. So `coin.id` is `"1"`, and
`this.stdb.callReducer('collect_coin', [coin.id])` sends `args: '["1"]'` — a
string — which the `collect_coin(ctx, id: u64)` reducer rejects. Fix (shipped):
`callReducer('collect_coin', [Number(coin.id)])`. This was the "players can't
collect coins — they roll on the floor with no response" bug: the failed reducer
never deleted the coin row, and `claimPending` latched so the coin was ignored
forever.

Empirically (against `wss://maincloud.spacetimedb.com` module `cmg-goofy-game`):
small u64 row values actually arrive as JSON numbers in row data
(`[1,[...],...]`); it's `idKey()` that turns them into strings, not the wire
format. Large u64 (>2^53) can arrive as strings to preserve precision
(`num()`/line ~1548 note that). Either way, coerce to `Number()` for the reducer
arg — safe for small auto_inc ids.

`collect_coin` was the only client reducer echoing a stringified id back;
`hit_brick`/`set_phase`/`update_player`/`spawn_coin` already pass raw numbers,
which is why only coin collection broke.

The optimistic-claim footgun this exposed is now **fixed**: `onMessage` acts on
non-`Committed` statuses, `callReducer` returns its request_id, and a
failed/lost collect unlatches `coin.claimPending` (explicit failure, a ~1s
Phaser timer, or a re-announced coin row).

**Protocol gotcha found while fixing it** — correlating a failure by
`request_id` alone is not enough. A reducer call rejected while _deserialising
its arguments_ comes back with `reducer_call: { request_id: 0, args: "[]" }` —
the server never got far enough to echo either. That is precisely the
u64-as-string shape above, i.e. the case you can least afford to miss. A
committed call echoes its real request_id fine. So: correlate by request_id, and
on failure fall back to the oldest in-flight call of the same `reducer_name`.
Failed updates are only delivered to the caller (check `caller_identity`), so a
name match is safely ours.

Related: [Editor/viewer bridge](editor-viewer-bridge.md),
[2019-turbo testing](2019-turbo-testing.md) (the hidden Browser pane pauses
Phaser, so `this.time.delayedCall` timers never fire — pump
`scene.time.preUpdate/update` directly to test them; `game.loop.step()` alone
does not drain the scene Clock).
