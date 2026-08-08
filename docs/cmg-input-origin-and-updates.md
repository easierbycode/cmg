# Input origin rule & remote updates

**Input rule (root of the 2026-07-28 bug batch):** the launcher synthesizes mapped
gamepad→keyboard events only into a SAME-ORIGIN `iframe#gameframe`
(`static/gamepad-support.js dispatchKeyboardEvent` bails silently cross-origin).
Anything streamed (CMG-net `streamUrl`, deploy-resolved URLs) is deaf to mapped
keys; games reading the Gamepad API directly (shmup twin-stick) still work, and
SELECT+Down OSD always works (launcher-side poll). Fix shipped in 8a148d0:
launchCmgnet downloads-first → plays `/cmg-net/<id>/`, launchGame prefers
same-origin for games in the local manifest (`localGameUrls`); demos stay
deploy-resolved on purpose (ws-goofy relay co-origin).

**cmg-net cache markers** (Cache Storage `cmg-net-v1`): `.cmg-complete` (written
strictly last; without it a game reads as NOT installed — heals poisoned/partial
installs like Mario Land's source-zipball era), `.cmg-src` (downloadUrl+date
stamp; bump `date` or change `downloadUrl` in codemonkey.json to force every
launcher to re-download a zip-backed game remotely), `.cmg-sha` (github HEAD at
install). launchCmgnet auto-applies `updateAvailable` before playing.

**App self-update:** `routes/api/app-update.ts` — GET compares the build stamp
(`static/app-version.json`, written by scripts/compile-launcher.ts before
`deno compile`, gitignored) to the latest GitHub release (tag equality, then
publishedAt > builtAt + 30 min slack); POST downloads the release asset and
atomically renames over `$APPIMAGE`. Settings row "UPDATE CMG". End-to-end use
needs a `v*` tag → CI release (.github/workflows/build-appimage.yml).
`scripts/launcher-env.ts` (imported first in launch-linux/mac) moves GAMES_DIR
to `~/.local/share/cmg/games` when the exec dir is read-only (AppImage).

**AppImage runtime:** launch-linux.ts serves on fixed localhost:8000 and reuses
Chrome profile `~/.config/cmg-chrome-profile` — Cache Storage + localStorage
persist across app versions, so stale cached games survive rebuilds (was the
"old version" mechanism). `deno desktop` builds instead get a random port each
run (storage wiped) — different beast.

**Re-vendor static/games/shmup-party-ps2** (the PS2 web row): clone
easierbycode/shmup-party-ps2, `npm ci`, then
`MSYS2_ENV_CONV_EXCL=BASE_PATH BASE_PATH=/games/shmup-party-ps2/ npm run build`,
copy `dist/play` + `dist/assets` over, update VERSION with the sha. Gotchas on
this machine: Git Bash mangles `BASE_PATH=/…` into `C:/Program Files/Git/…`
without the exclusion (check play/index.html afterwards), and Windows-ARM64
needs `npm i --no-save @rolldown/binding-win32-arm64-msvc@<rolldown version>`
before vite 8 builds. The row has no OTA path — only re-vendor or app updates
refresh it.

**User's device:** Lenovo Legion with built-in pad identifying as "Xbox 360
Controller" (matches the Xbox-class regex, broadened to /Legion|X-Box/ too);
tests AppImages built on-device from a fresh clone (`deno task dashboard:build`
+ `deno task build:linux`). PS2 ISO row (Play! emulator) black-screens on a
known upstream Play! issue (zero draw calls) — not a CMG bug; the web row is
the workaround.

Related: [Phaser versions & repo workflow](phaser-versions-and-repos.md), [Editor/viewer bridge](editor-viewer-bridge.md)
