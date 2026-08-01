# GitHub → CodeMonkey extension

Chrome extension (Manifest V3) that puts an **Add to CodeMonkey** button on
GitHub repository pages. Clicking it asks for a branch and an optional folder,
then opens a `codemonkey://add?repo=…&branch=…&folder=…` link. The OS hands that
link to the launcher registered for the `codemonkey` scheme, which downloads the
repo zipball and installs it into the local game store (the same flow as POST
`/api/games/add-github`).

Ported from
[codemonkey-games-launcher](https://github.com/easierbycode/codemonkey-games-launcher)
and improved: the repo link is canonicalized from the path (deep `/tree/…` pages
work, and the branch you're browsing pre-fills the prompt), and the button only
appears on repo-shaped paths.

## Setup

1. Build and register the launcher as the protocol handler (Windows):

   ```
   deno task build:windows
   deno task register:windows:protocol
   ```

2. Load the extension: `chrome://extensions` → enable Developer mode → **Load
   unpacked** → pick this directory.

3. Open any GitHub repository and click **Add to CodeMonkey**.

The end-to-end flow (button click → protocol link → game installed and listed by
the launcher) is covered by `tests/e2e/protocol_add_github_button_test.ts`.
