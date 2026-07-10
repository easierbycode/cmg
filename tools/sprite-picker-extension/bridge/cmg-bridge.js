/**
 * CMG Sprite Picker - Launcher Bridge
 * Content script injected on CMG launcher origins (localhost dev/desktop and
 * the hosted dashboard). Relays picked sprites from the extension into the
 * dashboard page, which boots SpriteX and preloads them into its View tab
 * (see the "CMG Sprite Picker → SpriteX preload" section of Dashboard.svelte).
 */
(function () {
  "use strict";

  // The launcher's root route mounts #app-root and loads dashboard.bundle.js
  // (routes/index.tsx). Other pages on these origins are games/demos — not us.
  function isCmgDashboard() {
    return !!document.getElementById("app-root") &&
      !!document.querySelector('script[src*="dashboard.bundle"]');
  }

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "CMG_PING") {
      sendResponse({ isCmg: isCmgDashboard() });
      return;
    }

    if (msg.type === "SPRITEX_PRELOAD") {
      if (!isCmgDashboard()) {
        sendResponse({ error: "Not a CMG dashboard tab" });
        return;
      }
      window.postMessage(
        {
          source: "cmg-sprite-picker",
          type: "spritex-preload",
          sprites: msg.sprites,
        },
        window.location.origin,
      );
      sendResponse({ success: true });
    }
  });
})();
