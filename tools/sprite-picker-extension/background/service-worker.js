/**
 * CMG Sprite Picker - Background Service Worker
 * Handles: CORS image proxy, CMG launcher tab discovery, context menus.
 *
 * The launcher side of the pipeline: sprites picked by the content script are
 * relayed to the CMG dashboard tab (bridge/cmg-bridge.js), whose page script
 * (svelte-src/Dashboard.svelte) boots SpriteX in the game frame and preloads
 * the sprites into its View tab.
 */

// Where a CMG launcher tab may live: local dev (deno task dev), a desktop
// launcher binary (also localhost), or the hosted dashboard.
const CMG_TAB_PATTERNS = [
  "http://localhost/*",
  "http://127.0.0.1/*",
  "https://cmg.easierbycode.deno.net/*",
];

// Register context menu on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "cmg-detect-sprites",
    title: "Detect Sprites in This Image",
    contexts: ["image"],
  });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "cmg-detect-sprites" && tab?.id) {
    chrome.tabs.sendMessage(tab.id, {
      type: "DETECT_IMAGE",
      srcUrl: info.srcUrl,
    });
  }
});

// Message router
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "FETCH_IMAGE") {
    fetchImageAsDataURL(msg.url).then(sendResponse).catch((err) => {
      sendResponse({ error: err.message });
    });
    return true; // async response
  }

  if (msg.type === "SEND_SPRITES") {
    sendSpritesToCmg(msg).then(sendResponse).catch((err) => {
      sendResponse({ error: err.message });
    });
    return true;
  }

  if (msg.type === "PING_CMG") {
    findCmgTab().then((tab) => {
      sendResponse({ connected: !!tab, tabId: tab?.id || null, url: tab?.url || null });
    });
    return true;
  }
});

/** Fetch a cross-origin image and return it as a data URL */
async function fetchImageAsDataURL(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
  const blob = await response.blob();
  const buf = await blob.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buf);
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
  }
  return { dataURL: `data:${blob.type || "image/png"};base64,${btoa(binary)}` };
}

/** Ask a tab's bridge whether it is the CMG dashboard. */
function pingTab(tabId) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, { type: "CMG_PING" }, (response) => {
      if (chrome.runtime.lastError) resolve(false); // no bridge in that tab
      else resolve(!!response?.isCmg);
    });
  });
}

/** Find an open CMG launcher (dashboard) tab. */
async function findCmgTab() {
  const tabs = await chrome.tabs.query({ url: CMG_TAB_PATTERNS });
  for (const tab of tabs) {
    if (tab.id && (await pingTab(tab.id))) return tab;
  }
  return null;
}

/** Send picked sprites to the CMG launcher via the bridge content script. */
async function sendSpritesToCmg(msg) {
  const tab = await findCmgTab();
  if (!tab || !tab.id) {
    throw new Error(
      "CMG launcher tab not found. Open the CMG dashboard first (deno task dev → http://localhost:5173).",
    );
  }

  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tab.id, {
      type: "SPRITEX_PRELOAD",
      sprites: msg.sprites,
    }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else if (response?.error) {
        reject(new Error(response.error));
      } else {
        resolve(response || { success: true });
      }
    });
  });
}
