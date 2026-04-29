/**
 * File: quake2-three-world-warp-sky.ts
 * Purpose: Verify that ref_gl sky and water/warp outputs are consumed by the Three.js world adapter.
 *
 * This file is not a direct source port.
 * It is a targeted integration harness for `gl_warp.c -> gl-world-scene-adapter.ts`.
 *
 * Dependencies:
 * - packages/filesystem
 * - packages/renderer-three
 * - three
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { Mesh } from "three";
import { createVirtualFilesystem, mountPak } from "../../packages/filesystem/src/index.js";
import { createThreeGlWorldSceneAdapter } from "../../packages/renderer-three/src/index.js";

const DEFAULT_PAK_PATH = path.join(process.cwd(), "Quake 2", "baseq2", "pak0.pak");
const MAP_PATH = "maps/base1.bsp";

main();

/**
 * Category: New
 * Purpose: Exercise real-map sky clipping and turbulent water UV updates through the Three.js adapter.
 */
function main(): void {
  const pakPath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_PAK_PATH;
  if (!fs.existsSync(pakPath)) {
    throw new Error(`pak0.pak introuvable: ${pakPath}`);
  }

  const filesystem = createVirtualFilesystem();
  mountPak(filesystem, new Uint8Array(fs.readFileSync(pakPath)), pakPath);

  const adapter = createThreeGlWorldSceneAdapter(filesystem, MAP_PATH);
  adapter.update(0.1, [0, 0, 0], [], null);

  assert.equal(adapter.skyFaces.length > 0, true, "R_DrawSkyBox sky faces should be exposed by world adapter");

  const warpMesh = findRefGlMesh(adapter.root, "warp");
  assert.ok(warpMesh, "warp mesh missing");
  assert.equal(warpMesh.material.lightMap ?? null, null, "warp surface should not use BSP lightmap");
  assert.equal(warpMesh.userData.refGl?.warp, true, "warp metadata mismatch");

  const uv = warpMesh.geometry.getAttribute("uv");
  const before = Array.from((uv.array as Float32Array).slice(0, Math.min(16, uv.array.length)));
  adapter.update(1.1, [0, 0, 0], [], null);
  const after = Array.from((uv.array as Float32Array).slice(0, before.length));
  assert.notDeepEqual(after, before, "EmitWaterPolys UVs should update over time");

  const flowingMesh = findRefGlMesh(adapter.root, "flowing");
  if (flowingMesh?.material.map) {
    const beforeOffset = flowingMesh.material.map.offset.x;
    adapter.update(2.1, [0, 0, 0], [], null);
    assert.notEqual(flowingMesh.material.map.offset.x, beforeOffset, "flowing texture offset should update over time");
  }

  console.log(`quake2-three-world-warp-sky: ok (${MAP_PATH})`);
}

/**
 * Category: New
 * Purpose: Find the first Three mesh carrying the requested ref_gl surface metadata.
 */
function findRefGlMesh(root: { traverse: (callback: (object: unknown) => void) => void }, flag: "warp" | "flowing"): Mesh | null {
  let found: Mesh | null = null;
  root.traverse((object) => {
    if (found || !(object instanceof Mesh)) {
      return;
    }

    if (object.userData.refGl?.[flag] === true) {
      found = object;
    }
  });
  return found;
}
