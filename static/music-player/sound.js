// sound.js — drop-in replacement for 2019-turbo/src/sound.js that routes BGM
// through the embedded AZ Legend music player instead of Phaser's sound
// manager. Same exports: initSound, play, stop, bgmPlay, stopBgm, stopAll,
// pauseAll, resumeAll.
//
// BGM keys (anything present in options.bgm) are sent to the player, which
// runs in a hidden iframe and is driven over postMessage (protocol in
// azlegend static/public/app/scripts/app.js). Loop regions come along as
// track metadata, so the player handles the [start, end] looping the old
// Phaser marker code did. Non-BGM keys (voices / SEs) stay local, played as
// plain HTMLAudio one-shots so they never interrupt the music.
//
// Usage (in place of the original initSound(game)):
//   initSound(game, {
//     playerUrl: "https://azlegend.example/player.html",
//     albumId: "2019-bgm",
//     albumTitle: "2019 BGM",
//     bgm: { boss_bison_bgm: { url: ".../boss_bison_bgm.mp3", start: 914888, end: 6111881, volume: 0.5 } },
//     tracks: { se_decision: { url: ".../se_decision.mp3", volume: 0.5 } },
//     isMuted: () => gameState.lowModeFlg,
//   })
// start/end are microseconds, matching BGM_INFO in 2019-turbo constants.js.

const MESSAGE_PREFIX = "music-player:";
const MICROS = 1e6;

const config = {
  playerUrl: null,
  albumId: "game-bgm",
  albumTitle: "Game BGM",
  bgm: {},
  tracks: {},
  isMuted: () => false,
  visible: false,
};

let frame = null;
let playerOrigin = "*";
let readyResolve = null;
let readyPromise = null;
let lastState = null;
let currentBgmKey = null;
const seCache = new Map(); // key -> HTMLAudioElement
let requestSeq = 0;
const pendingState = new Map(); // requestId -> resolve

function muted() {
  try {
    return !!config.isMuted();
  } catch (_e) {
    return false;
  }
}

function post(message) {
  frame?.contentWindow?.postMessage(message, playerOrigin);
}

function bgmAlbum() {
  return {
    id: config.albumId,
    title: config.albumTitle,
    tracks: Object.entries(config.bgm).map(([key, info]) => ({
      id: key,
      title: key,
      url: info.url,
      volume: info.volume,
      loopStart: Number.isFinite(info.start) ? info.start / MICROS : 0,
      loopEnd: Number.isFinite(info.end) ? info.end / MICROS : undefined,
    })),
  };
}

function onMessage(event) {
  const data = event.data;
  if (!data || typeof data.type !== "string" || !data.type.startsWith(MESSAGE_PREFIX)) return;
  if (frame && event.source !== frame.contentWindow) return;

  const command = data.type.slice(MESSAGE_PREFIX.length);
  if (data.state) lastState = data.state;

  if (command === "ready") {
    playerOrigin = event.origin || "*";
    post({
      type: MESSAGE_PREFIX + "add-albums",
      albums: [bgmAlbum()],
      select: config.albumId,
    });
  } else if (command === "event" && data.event === "albums-changed") {
    const album = (data.state?.albums || []).find((a) => a.id === config.albumId);
    if (album && readyResolve) {
      readyResolve(album);
      readyResolve = null;
    }
  } else if (command === "state" && data.requestId !== undefined) {
    const resolve = pendingState.get(data.requestId);
    if (resolve) {
      pendingState.delete(data.requestId);
      resolve(data.state);
    }
  }
}

export function configureSound(options = {}) {
  Object.assign(config, options);
}

// `game` is accepted for signature compatibility with the Phaser version but
// is unused — the embedded player replaces game.sound entirely for BGM.
export function initSound(_game, options = {}) {
  configureSound(options);
  if (!config.playerUrl) {
    throw new Error("initSound: options.playerUrl (embedded player URL) is required");
  }
  if (readyPromise) return readyPromise;

  readyPromise = new Promise((resolve) => {
    readyResolve = resolve;
  });

  window.addEventListener("message", onMessage);

  frame = document.createElement("iframe");
  frame.id = "music-player-frame";
  frame.setAttribute("allow", "autoplay");
  if (!config.visible) {
    frame.style.cssText = "position:fixed;width:0;height:0;border:0;visibility:hidden;";
  } else {
    frame.style.cssText = "position:fixed;right:0;bottom:0;width:480px;height:360px;border:0;z-index:9999;";
  }
  const url = new URL(config.playerUrl, window.location.href);
  url.searchParams.set("albums", "none"); // skip the artist's default albums
  frame.src = url.href;
  document.body.appendChild(frame);

  return readyPromise;
}

export function soundReady() {
  return readyPromise || Promise.reject(new Error("initSound not called"));
}

export function getPlayerState() {
  const requestId = ++requestSeq;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pendingState.delete(requestId);
      reject(new Error("music player state timed out"));
    }, 5000);
    pendingState.set(requestId, (state) => {
      clearTimeout(timer);
      resolve(state);
    });
    post({ type: MESSAGE_PREFIX + "get-state", requestId });
  });
}

function localSe(key) {
  const info = config.tracks[key];
  if (!info || !info.url) return null;
  if (seCache.has(key)) return seCache.get(key);
  const audio = new Audio(info.url);
  audio.volume = Number.isFinite(info.volume) ? info.volume : 1;
  seCache.set(key, audio);
  return audio;
}

export function play(key) {
  if (muted()) return null;
  if (config.bgm[key]) {
    post({ type: MESSAGE_PREFIX + "play", album: config.albumId, track: key });
    currentBgmKey = key;
    return key;
  }
  const audio = localSe(key);
  if (!audio) return null;
  audio.currentTime = 0;
  audio.play().catch(() => {/* gesture-gated */});
  return audio;
}

export function stop(key) {
  if (config.bgm[key]) {
    stopBgm(key);
    return;
  }
  const audio = seCache.get(key);
  if (audio && !audio.paused) audio.pause();
}

// Play once from the top, then loop the [start, end] region — the loop
// region rides on the track metadata, so the player enforces it.
export function bgmPlay(key) {
  if (muted() || !config.bgm[key]) return;
  currentBgmKey = key;
  post({ type: MESSAGE_PREFIX + "play", album: config.albumId, track: key });
}

export function stopBgm(key) {
  if (key !== undefined && key !== currentBgmKey) return;
  currentBgmKey = null;
  post({ type: MESSAGE_PREFIX + "stop" });
}

export function stopAll() {
  if (muted()) return;
  currentBgmKey = null;
  post({ type: MESSAGE_PREFIX + "stop" });
  seCache.forEach((audio) => {
    if (!audio.paused) audio.pause();
  });
}

export function pauseAll() {
  if (muted()) return;
  post({ type: MESSAGE_PREFIX + "pause" });
  seCache.forEach((audio) => {
    if (!audio.paused) audio.pause();
  });
}

export function resumeAll() {
  if (muted()) return;
  post({ type: MESSAGE_PREFIX + "resume" });
}

export function currentBgm() {
  return currentBgmKey;
}

export function playerStateSnapshot() {
  return lastState;
}
