// Bakes the offline level record for "2028.Ai" from the locally cached foo
// data (originally extracted from the Firebase level "foo" for the PS2 port).
//
// Output shape matches what the level-loader plugin expects on
// globalThis.__OFFLINE_LEVEL__: enemy recipe data plus an inline atlas
// (base64 PNG + frame map) that the plugin stacks beneath the base game atlas
// at runtime, so foo's enemy frames resolve with no network dependency.
//
// Run from the cmg repo root with: node scripts/2028-ai/build-level-data.js
"use strict";

const fs = require("fs");
const path = require("path");

const SRC = path.resolve(__dirname, "../../../2019-es7/src/ps2/assets");
const OUT = path.resolve(__dirname, "../../static/games/2028-ai/level-data.json");

const level = JSON.parse(fs.readFileSync(path.join(SRC, "level_foo.json"), "utf8"));
const atlasJson = JSON.parse(fs.readFileSync(path.join(SRC, "level_foo_atlas.json"), "utf8"));
const atlasPng = fs.readFileSync(path.join(SRC, "level_foo_atlas.png"));

const record = {
    name: "2028.Ai",
    stageKey: level.stageKey || "stage0",
    width: level.width,
    enemylist: level.enemylist,
    enemyData: level.enemyData,
    atlasImageDataURL: "data:image/png;base64," + atlasPng.toString("base64"),
    atlasFrames: atlasJson.frames,
};

fs.writeFileSync(OUT, JSON.stringify(record));
const stat = fs.statSync(OUT);
console.log(
    "wrote " + OUT + " (" + (stat.size / 1024).toFixed(0) + " KB) — " +
    "enemylist=" + record.enemylist.length +
    " enemyData=" + Object.keys(record.enemyData || {}).length +
    " atlasFrames=" + Object.keys(record.atlasFrames || {}).length,
);
