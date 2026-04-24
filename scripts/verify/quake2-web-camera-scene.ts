/**
 * File: quake2-web-camera-scene.ts
 * Purpose: Verify the web demo scene graph includes the camera so camera-attached first-person weapon nodes are renderable.
 *
 * This file is not a direct source port.
 * It is a targeted integration check for the web scene bootstrap.
 *
 * Dependencies:
 * - apps/web/src/main.ts
 */

import fs from "node:fs";
import path from "node:path";
import { strict as assert } from "node:assert";

const mainPath = path.join(process.cwd(), "apps", "web", "src", "main.ts");
const source = fs.readFileSync(mainPath, "utf8");

assert.ok(source.includes("scene.add(camera);"), "web demo must add the camera to the scene graph");
assert.ok(source.includes("refreshEntitySync.attachToCamera(camera);"), "web demo must still attach the view-weapon root to the camera");

console.log("quake2-web-camera-scene: ok");
