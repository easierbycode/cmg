/**
 * CMG Sprite Picker - Content Script
 * Injected on sprite resource sites. Provides:
 * 1. Pick mode toggle (⊕) to select sprite-sheet images for detection
 * 2. Overlay canvas with detected sprite bounding boxes
 * 3. A CMG-OSD-styled panel to review picks and beam them to SpriteX's View
 *    tab via the CMG launcher (background/service-worker.js → bridge).
 */
(function () {
  "use strict";

  let pickMode = false;
  let overlayContainer = null;
  let overlayCanvas = null;
  let overlayCtx = null;
  let sourceCanvas = null; // offscreen canvas with the loaded image
  let detected = [];
  let selected = new Set();
  let detectionResult = null; // { bgColor, tolerance, usedKeyOut }
  let panelEl = null;
  let toggleBtn = null;
  let targetImg = null;
  let processing = false;

  // ==================== Toggle Button ====================

  function createToggleButton() {
    toggleBtn = document.createElement("button");
    toggleBtn.className = "cmgsp-toggle-btn";
    toggleBtn.textContent = "⊕"; // crosshair circle
    toggleBtn.title = "CMG Sprite Picker: Click to enter pick mode";
    toggleBtn.addEventListener("click", () => {
      pickMode = !pickMode;
      toggleBtn.classList.toggle("active", pickMode);
      toggleBtn.title = pickMode
        ? "CMG Sprite Picker: Click an image to detect sprites"
        : "CMG Sprite Picker: Click to enter pick mode";
      document.body.classList.toggle("cmgsp-pick-mode", pickMode);
      if (!pickMode) clearHighlights();
    });
    document.body.appendChild(toggleBtn);
  }

  // ==================== Image Hover Highlighting ====================

  let lastHovered = null;

  document.addEventListener(
    "mouseover",
    (ev) => {
      if (!pickMode) return;
      const img = ev.target.closest("img");
      if (img && img.naturalWidth > 64 && img.naturalHeight > 64) {
        if (lastHovered && lastHovered !== img)
          lastHovered.classList.remove("cmgsp-img-highlight");
        img.classList.add("cmgsp-img-highlight");
        lastHovered = img;
      }
    },
    true
  );

  document.addEventListener(
    "mouseout",
    (ev) => {
      if (!pickMode) return;
      const img = ev.target.closest("img");
      if (img) img.classList.remove("cmgsp-img-highlight");
    },
    true
  );

  function clearHighlights() {
    document.querySelectorAll(".cmgsp-img-highlight").forEach((el) => {
      el.classList.remove("cmgsp-img-highlight");
    });
  }

  // ==================== Image Click -> Detection ====================

  document.addEventListener(
    "click",
    (ev) => {
      if (!pickMode || processing) return;
      const img = ev.target.closest("img");
      if (!img || img.naturalWidth <= 64 || img.naturalHeight <= 64) return;

      ev.preventDefault();
      ev.stopPropagation();
      detectOnImage(img);
    },
    true
  );

  // Listen for context menu "Detect Sprites in This Image"
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "DETECT_IMAGE" && msg.srcUrl) {
      const imgs = document.querySelectorAll("img");
      for (const img of imgs) {
        if (img.src === msg.srcUrl || img.currentSrc === msg.srcUrl) {
          detectOnImage(img);
          return;
        }
      }
      // Image not found as <img> -- try fetching directly
      detectOnUrl(msg.srcUrl);
    }
  });

  async function detectOnImage(img) {
    processing = true;
    targetImg = img;
    clearOverlay();
    showPanel();
    setPanelStatus("loading", "FETCHING IMAGE…");

    try {
      // Use the service worker to fetch the image (bypasses CORS)
      const resp = await chrome.runtime.sendMessage({
        type: "FETCH_IMAGE",
        url: img.src || img.currentSrc,
      });

      if (resp.error) throw new Error(resp.error);
      await runDetection(resp.dataURL, img);
    } catch (err) {
      setPanelStatus("error", "DETECTION FAILED: " + err.message);
    } finally {
      processing = false;
    }
  }

  async function detectOnUrl(url) {
    processing = true;
    targetImg = null;
    clearOverlay();
    showPanel();
    setPanelStatus("loading", "FETCHING IMAGE…");

    try {
      const resp = await chrome.runtime.sendMessage({
        type: "FETCH_IMAGE",
        url: url,
      });
      if (resp.error) throw new Error(resp.error);
      await runDetection(resp.dataURL, null);
    } catch (err) {
      setPanelStatus("error", "DETECTION FAILED: " + err.message);
    } finally {
      processing = false;
    }
  }

  async function runDetection(dataURL, img) {
    setPanelStatus("loading", "DETECTING SPRITES…");

    // Load the image
    const loadedImg = new Image();
    loadedImg.src = dataURL;
    await new Promise((resolve, reject) => {
      loadedImg.onload = resolve;
      loadedImg.onerror = reject;
    });

    const w = loadedImg.naturalWidth;
    const h = loadedImg.naturalHeight;

    // Draw to offscreen canvas
    sourceCanvas = document.createElement("canvas");
    sourceCanvas.width = w;
    sourceCanvas.height = h;
    const ctx = sourceCanvas.getContext("2d", { willReadFrequently: true });
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(loadedImg, 0, 0);

    // Run detection
    const result = window.SpriteDetect.smartDetectSprites(ctx, w, h);
    detected = result.sprites;
    detectionResult = result;
    selected = new Set();

    if (detected.length === 0) {
      setPanelStatus("info", "NO SPRITES DETECTED IN THIS IMAGE.");
      return;
    }

    // Create overlay on the image
    if (img) {
      createOverlay(img, w, h);
    }

    drawOverlay();
    updatePanel();
    setPanelStatus("info", `DETECTED ${detected.length} SPRITES · CLICK TO SELECT`);
  }

  // ==================== Overlay ====================

  function createOverlay(img, naturalW, naturalH) {
    clearOverlay();

    const rect = img.getBoundingClientRect();
    overlayContainer = document.createElement("div");
    overlayContainer.className = "cmgsp-overlay-container";

    // Position overlay exactly over the image
    overlayContainer.style.left = rect.left + window.scrollX + "px";
    overlayContainer.style.top = rect.top + window.scrollY + "px";
    overlayContainer.style.width = rect.width + "px";
    overlayContainer.style.height = rect.height + "px";

    overlayCanvas = document.createElement("canvas");
    overlayCanvas.width = naturalW;
    overlayCanvas.height = naturalH;
    overlayCanvas.style.width = rect.width + "px";
    overlayCanvas.style.height = rect.height + "px";
    overlayCtx = overlayCanvas.getContext("2d");
    overlayCtx.imageSmoothingEnabled = false;

    overlayCanvas.addEventListener("click", onOverlayClick);

    overlayContainer.appendChild(overlayCanvas);
    document.body.appendChild(overlayContainer);

    // Reposition on scroll/resize
    const reposition = () => {
      if (!overlayContainer || !img.isConnected) return;
      const r = img.getBoundingClientRect();
      overlayContainer.style.left = r.left + window.scrollX + "px";
      overlayContainer.style.top = r.top + window.scrollY + "px";
      overlayContainer.style.width = r.width + "px";
      overlayContainer.style.height = r.height + "px";
      overlayCanvas.style.width = r.width + "px";
      overlayCanvas.style.height = r.height + "px";
    };
    window.addEventListener("scroll", reposition, { passive: true });
    window.addEventListener("resize", reposition, { passive: true });
    overlayContainer._cleanup = () => {
      window.removeEventListener("scroll", reposition);
      window.removeEventListener("resize", reposition);
    };
  }

  function clearOverlay() {
    if (overlayContainer) {
      if (overlayContainer._cleanup) overlayContainer._cleanup();
      overlayContainer.remove();
      overlayContainer = null;
      overlayCanvas = null;
      overlayCtx = null;
    }
  }

  function onOverlayClick(ev) {
    if (!overlayCanvas || !detected.length) return;
    const rect = overlayCanvas.getBoundingClientRect();
    const scaleX = overlayCanvas.width / rect.width;
    const scaleY = overlayCanvas.height / rect.height;
    const x = Math.floor((ev.clientX - rect.left) * scaleX);
    const y = Math.floor((ev.clientY - rect.top) * scaleY);

    const idx = detected.findIndex(
      (s) => x >= s.x && x < s.x + s.w && y >= s.y && y < s.y + s.h
    );

    if (idx >= 0) {
      if (selected.has(idx)) selected.delete(idx);
      else selected.add(idx);
      drawOverlay();
      updatePanel();
    }
  }

  function drawOverlay() {
    if (!overlayCtx || !overlayCanvas) return;
    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    overlayCtx.lineWidth = 1;

    // CMG palette: lime for detected, glossy yellow for selected.
    for (let i = 0; i < detected.length; i++) {
      const s = detected[i];
      overlayCtx.strokeStyle = selected.has(i)
        ? "rgba(246, 255, 74, 0.95)"
        : "rgba(156, 255, 107, 0.75)";
      overlayCtx.strokeRect(s.x + 0.5, s.y + 0.5, s.w - 1, s.h - 1);
    }
  }

  // ==================== Selection Panel ====================

  function showPanel() {
    if (panelEl) return;
    panelEl = document.createElement("div");
    panelEl.className = "cmgsp-panel";
    panelEl.innerHTML = `
      <div class="cmgsp-hd">
        <span class="cmgsp-title">SPRITE PICKER</span>
        <button class="cmgsp-x" title="Close">✕</button>
      </div>
      <div class="cmgsp-body">
        <div class="cmgsp-sect">SELECTED SPRITES</div>
        <div class="cmgsp-thumbs"></div>
        <div class="cmgsp-sect">SPRITE NAME</div>
        <input class="cmgsp-name-input" type="text" value="sprite" spellcheck="false" />
        <button class="cmgsp-send-btn">SEND TO SPRITEX</button>
        <div class="cmgsp-row-btns">
          <button class="cmgsp-btn cmgsp-select-all-btn">ALL</button>
          <button class="cmgsp-btn cmgsp-clear-btn">CLEAR</button>
        </div>
        <div class="cmgsp-status"></div>
      </div>
      <div class="cmgsp-foot">
        <span><b>⊕</b> PICK</span>
        <span><b>CLICK</b> SELECT</span>
        <span class="cmgsp-foot-hint">SEND → SPRITEX VIEW</span>
      </div>
    `;

    panelEl.querySelector(".cmgsp-x").addEventListener("click", () => {
      closeAll();
    });

    panelEl.querySelector(".cmgsp-send-btn").addEventListener("click", sendToSpriteX);
    panelEl.querySelector(".cmgsp-select-all-btn").addEventListener("click", () => {
      for (let i = 0; i < detected.length; i++) selected.add(i);
      drawOverlay();
      updatePanel();
    });
    panelEl.querySelector(".cmgsp-clear-btn").addEventListener("click", () => {
      selected.clear();
      drawOverlay();
      updatePanel();
    });

    document.body.appendChild(panelEl);
  }

  function closeAll() {
    clearOverlay();
    if (panelEl) {
      panelEl.remove();
      panelEl = null;
    }
    detected = [];
    selected.clear();
    sourceCanvas = null;
    pickMode = false;
    if (toggleBtn) toggleBtn.classList.remove("active");
    document.body.classList.remove("cmgsp-pick-mode");
  }

  function sortedSelection() {
    return [...selected].sort((a, b) => {
      const sa = detected[a];
      const sb = detected[b];
      if (sa.y !== sb.y) return sa.y - sb.y;
      return sa.x - sb.x;
    });
  }

  function updatePanel() {
    if (!panelEl) return;
    const thumbsContainer = panelEl.querySelector(".cmgsp-thumbs");
    thumbsContainer.innerHTML = "";

    if (!selected.size) {
      thumbsContainer.innerHTML =
        '<span class="cmgsp-empty">NO SPRITES SELECTED</span>';
      return;
    }

    sortedSelection().forEach((i) => {
      const s = detected[i];
      const c = document.createElement("canvas");
      c.width = s.w;
      c.height = s.h;
      const cctx = c.getContext("2d");
      cctx.imageSmoothingEnabled = false;
      cctx.drawImage(sourceCanvas, s.x, s.y, s.w, s.h, 0, 0, s.w, s.h);

      const img = document.createElement("img");
      img.src = c.toDataURL("image/png");
      img.className = "cmgsp-thumb";
      img.style.width = Math.min(64, s.w * 2) + "px";
      img.style.height = "auto";
      img.title = `${s.w}x${s.h} @ (${s.x},${s.y}) — click to remove`;
      img.addEventListener("click", () => {
        selected.delete(i);
        drawOverlay();
        updatePanel();
      });
      thumbsContainer.appendChild(img);
    });
  }

  function setPanelStatus(type, msg) {
    if (!panelEl) return;
    const el = panelEl.querySelector(".cmgsp-status");
    if (type === "loading") {
      el.innerHTML = `<span class="cmgsp-spinner"></span>${msg}`;
    } else if (type === "error") {
      el.innerHTML = `<span class="cmgsp-err">${msg}</span>`;
    } else {
      el.textContent = msg;
    }
  }

  // ==================== Send to SpriteX ====================

  async function sendToSpriteX() {
    if (!selected.size || !sourceCanvas) {
      setPanelStatus("error", "NO SPRITES SELECTED");
      return;
    }

    const baseRaw = panelEl.querySelector(".cmgsp-name-input").value || "sprite";
    const base = baseRaw.replace(/[^\w-]/g, "").slice(0, 40) || "sprite";

    setPanelStatus("loading", "SENDING TO SPRITEX…");

    // Extract selected sprites as data URLs (reading order: top-left first)
    const selectedBoxes = sortedSelection().map((i) => detected[i]);

    const opts = detectionResult?.usedKeyOut
      ? {
          bgColor: detectionResult.bgColor,
          tolerance: detectionResult.tolerance,
        }
      : {};

    const dataURLs = window.SpriteDetect.extractSpriteDataURLs(
      sourceCanvas,
      selectedBoxes,
      opts
    );

    const sprites = Object.values(dataURLs).map((dataURL, idx) => ({
      name: `${base}_${idx}`,
      dataURL: dataURL,
      w: selectedBoxes[idx].w,
      h: selectedBoxes[idx].h,
    }));

    try {
      const resp = await chrome.runtime.sendMessage({
        type: "SEND_SPRITES",
        sprites,
      });

      if (resp.error) throw new Error(resp.error);
      setPanelStatus(
        "info",
        `SENT ${sprites.length} SPRITE${sprites.length === 1 ? "" : "S"} → SPRITEX VIEW TAB`
      );
    } catch (err) {
      setPanelStatus("error", "SEND FAILED: " + err.message);
    }
  }

  // ==================== Init ====================

  createToggleButton();
})();
