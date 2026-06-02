// "Akuma" — a Three.js (r0.153) character demo: an Akuma model that idles with a
// looping dance and walks around a floor with WASD.
//
// Ported from Oxynt's "three-mixamo" example (the `akuma` game in
// codemonkey-games-launcher) to run as a self-contained CMG demo, same shape as
// the other demos here: routes/demos/akuma.tsx ships the page shell and this
// module boots the scene. Three.js + FBXLoader load as ES modules from the
// esm.sh CDN; the FBX meshes/animation and their texture are served from
// /demos/akuma/.
//
// Two FBX files are combined: character.fbx carries the skinned meshes, and the
// idle clip is grafted on from character2.fbx (fbx.animations[0] = fbx2's clip),
// then subclipped to frames 0–221 and looped. Differences vs. the original:
// the #info attribution is hidden inside the launcher iframe (via the
// `.inLauncher` hook the original CSS already defines), the canvas tracks
// viewport resizes, asset paths are absolute (/demos/akuma/…) since this runs
// from a Fresh route, and the unused "run" animation / appearance-swap scaffolding
// is dropped.

import * as THREE from "https://esm.sh/three@0.153.0";
import { FBXLoader } from "https://esm.sh/three@0.153.0/examples/jsm/loaders/FBXLoader.js";

// Hide the on-screen attribution/instructions when embedded in the launcher
// (the page CSS keys this off `.inLauncher #info`). Standalone visitors to
// /demos/akuma still see the "WASD to move" hint.
if (self !== top) document.documentElement.classList.add("inLauncher");

const ASSET_BASE = "/demos/akuma";

let character, mixer;
let p = [0, 0];
const clock = new THREE.Clock();

// scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  60,
  globalThis.innerWidth / globalThis.innerHeight,
  1,
  10000,
);
camera.position.set(0, 500, -500);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(globalThis.innerWidth, globalThis.innerHeight);
document.body.appendChild(renderer.domElement);

// basic directional light
const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
dirLight.position.set(0, 200, -200);
scene.add(dirLight);

// floor
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(1000, 1000, 1),
  new THREE.MeshPhongMaterial({ color: 0xffffff }),
);
floor.rotateX((-90 * Math.PI) / 180);
scene.add(floor);

// character (FBX — Unity/Blender export). character2.fbx supplies the idle
// animation; character.fbx supplies the skinned meshes.
//
// The FBX materials embed absolute Windows texture paths (e.g.
// C:\Users\…\ch100_CA0.png), so collapse every texture URL to its basename
// served alongside the model — otherwise the loader also 404s on the embedded
// path before falling back to the basename.
const manager = new THREE.LoadingManager();
manager.setURLModifier((url) => {
  const file = url.match(/[^\\/]+\.(?:png|jpe?g|tga)$/i);
  return file ? `${ASSET_BASE}/${file[0]}` : url;
});
const fbxLoader = new FBXLoader(manager);
fbxLoader.load(`${ASSET_BASE}/character2.fbx`, function (fbx2) {
  fbxLoader.load(`${ASSET_BASE}/character.fbx`, function (fbx) {
    character = fbx;
    fbx.animations[0] = fbx2.animations[0]; // idle
    mixer = new THREE.AnimationMixer(character);
    mixer.clipAction(
      THREE.AnimationUtils.subclip(fbx.animations[0], "idle", 0, 221),
    ).setDuration(6).play();
    mixer._actions[0].enabled = true;
    character.children[0].visible = true;
    character.children[1].visible = true;
    character.children[2].visible = false;
    character.children[3].visible = true;
    character.children[4].visible = true;
    character.children[5].visible = true;
    scene.add(character);
  });
});

// render
renderer.setAnimationLoop(render);
function render() {
  if (character) {
    updateKey();
    character.position.x += p[0];
    character.position.z += p[1];
  }
  const clockDelta = clock.getDelta();
  if (mixer) mixer.update(clockDelta);
  renderer.render(scene, camera);
}

// keep the canvas matched to the (iframe) viewport
globalThis.addEventListener("resize", function () {
  camera.aspect = globalThis.innerWidth / globalThis.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(globalThis.innerWidth, globalThis.innerHeight);
});

// keys — WASD nudges the character one step per keydown and faces that way
let fwd, bkd, rgt, lft, dwn = false;
globalThis.addEventListener("keydown", function (e) {
  switch (e.code) {
    case "KeyW":
      fwd = true;
      break;
    case "KeyS":
      bkd = true;
      break;
    case "KeyD":
      rgt = true;
      break;
    case "KeyA":
      lft = true;
      break;
  }
});
globalThis.addEventListener("keyup", function (e) {
  dwn = false;
  p = [0, 0];
  switch (e.code) {
    case "KeyW":
      fwd = false;
      break;
    case "KeyS":
      bkd = false;
      break;
    case "KeyD":
      rgt = false;
      break;
    case "KeyA":
      lft = false;
      break;
  }
});
function updateKey() {
  if (dwn) return;
  if (fwd) {
    dwn = true;
    character.rotation.y = 0;
    p = [0, 5];
  }
  if (bkd) {
    dwn = true;
    character.rotation.y = Math.PI;
    p = [0, -5];
  }
  if (lft) {
    dwn = true;
    character.rotation.y = Math.PI / 2;
    p = [5, 0];
  }
  if (rgt) {
    dwn = true;
    character.rotation.y = -Math.PI / 2;
    p = [-5, 0];
  }
}
