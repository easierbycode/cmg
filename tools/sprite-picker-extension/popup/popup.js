/**
 * CMG Sprite Picker - Popup Script
 * Shows CMG launcher connection status and quick actions.
 */
(function () {
  "use strict";

  const statusEl = document.getElementById("cmgStatus");
  const injectBtn = document.getElementById("injectBtn");
  const refreshBtn = document.getElementById("refreshBtn");

  async function checkConnection() {
    statusEl.textContent = "CHECKING…";
    statusEl.className = "status disconnected";

    try {
      const resp = await chrome.runtime.sendMessage({ type: "PING_CMG" });
      if (resp.connected) {
        statusEl.textContent = "LAUNCHER ONLINE · TAB " + resp.tabId;
        statusEl.className = "status connected";
      } else {
        statusEl.textContent = "LAUNCHER NOT FOUND — OPEN THE CMG DASHBOARD";
        statusEl.className = "status disconnected";
      }
    } catch (err) {
      statusEl.textContent = "ERROR: " + err.message;
      statusEl.className = "status disconnected";
    }
  }

  // Inject content scripts on the current active tab (for non-matching sites)
  injectBtn.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["lib/sprite-detect.js", "content/content.js"],
      });
      await chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ["content/content.css"],
      });
      statusEl.textContent = "PICKER INJECTED ON CURRENT TAB";
      statusEl.className = "status connected";
    } catch (err) {
      statusEl.textContent = "INJECT FAILED: " + err.message;
      statusEl.className = "status disconnected";
    }
  });

  refreshBtn.addEventListener("click", checkConnection);

  checkConnection();
})();
