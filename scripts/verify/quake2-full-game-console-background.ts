/**
 * File: quake2-full-game-console-background.ts
 * Purpose: Verify that `full-game.html` keeps the Quake II console background opaque.
 *
 * This is a targeted browser-adapter verification. The source of truth is the
 * original `pics/conback.pcx` shipped in `pak0.pak`.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { parsePak, findPakEntry, readPakEntryData } from "../../packages/formats/src/pak.js";
import { parsePcx } from "../../packages/formats/src/pcx.js";

const pakPath = path.join(process.cwd(), "Quake 2", "baseq2", "pak0.pak");
const pak = parsePak(new Uint8Array(readFileSync(pakPath)), pakPath);
const conbackEntry = findPakEntry(pak, "pics/conback.pcx");

assert.ok(conbackEntry, "original pak0.pak should contain pics/conback.pcx");

const conback = parsePcx(readPakEntryData(pak, conbackEntry), conbackEntry.name);
let transparentPixels = 0;
for (const index of conback.indices) {
  if (index === 255) {
    transparentPixels += 1;
  }
}

assert.equal(conback.width, 320, "original conback width mismatch");
assert.equal(conback.height, 240, "original conback height mismatch");
assert.equal(transparentPixels, 0, "original conback should not contain transparent palette pixels");

const fullGameSource = readFileSync(path.join(process.cwd(), "apps", "web", "src", "full-game.ts"), "utf8");

assert.ok(
  fullGameSource.includes("function drawOpaqueConsoleBackground"),
  "full-game should explicitly prepare an opaque console background"
);
assert.ok(
  fullGameSource.includes("page.context.fillStyle = \"rgb(0, 0, 0)\";"),
  "full-game console fallback should use an opaque black fill"
);
assert.equal(
  fullGameSource.includes("rgba(0, 0, 0, 0.92)"),
  false,
  "full-game console fallback must not be semi-transparent"
);

console.log("quake2-full-game-console-background: ok");
