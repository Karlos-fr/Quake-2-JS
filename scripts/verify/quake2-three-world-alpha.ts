/**
 * File: quake2-three-world-alpha.ts
 * Purpose: Verify that translucent BSP surfaces produced by the ref_gl world path are not lightmapped in the Three.js adapter.
 *
 * This file is not a direct source port.
 * It is a targeted integration harness for `gl_rsurf.c -> gl-world-scene-adapter.ts`.
 *
 * Dependencies:
 * - packages/filesystem
 * - packages/formats
 * - packages/renderer-three
 * - three
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { Mesh, MeshBasicMaterial } from "three";
import { SURF_TRANS33, SURF_TRANS66 } from "../../packages/formats/src/index.js";
import { findPakEntry, parsePak } from "../../packages/formats/src/pak.js";
import { createVirtualFilesystem, mountPak } from "../../packages/filesystem/src/index.js";
import { createThreeGlWorldSceneAdapter } from "../../packages/renderer-three/src/index.js";

const DEFAULT_PAK_PATH = path.join(process.cwd(), "Quake 2", "baseq2", "pak0.pak");
const MAP_PATHS = ["maps/base1.bsp", "maps/base2.bsp", "maps/base3.bsp"];

main();

/**
 * Category: New
 * Purpose: Probe real Quake II maps for one translucent BSP material built by the ref_gl world adapter.
 */
function main(): void {
  const pakPath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_PAK_PATH;
  if (!fs.existsSync(pakPath)) {
    throw new Error(`pak0.pak introuvable: ${pakPath}`);
  }

  const pakBytes = new Uint8Array(fs.readFileSync(pakPath));
  const pak = parsePak(pakBytes, pakPath);
  const filesystem = createVirtualFilesystem();
  mountPak(filesystem, pakBytes, pakPath);

  for (const mapPath of MAP_PATHS) {
    if (!findPakEntry(pak, mapPath)) {
      continue;
    }

    const adapter = createThreeGlWorldSceneAdapter(filesystem, mapPath);
    const translucent = findTranslucentSurfaceMesh(adapter.root);
    if (!translucent) {
      continue;
    }

    assert.equal(translucent.material.transparent, true, `${mapPath} translucent material flag mismatch`);
    assert.equal(translucent.material.depthWrite, false, `${mapPath} translucent depthWrite mismatch`);
    assert.equal(translucent.material.opacity, expectedAlpha(translucent), `${mapPath} translucent opacity mismatch`);
    assert.equal(translucent.material.lightMap, null, `${mapPath} translucent surfaces should not use lightmaps`);
    assert.equal(translucent.renderOrder > 0, true, `${mapPath} translucent renderOrder mismatch`);
    console.log(`quake2-three-world-alpha: ok (${mapPath})`);
    return;
  }

  throw new Error(`Aucune surface translucide trouvee dans ${MAP_PATHS.join(", ")}`);
}

/**
 * Category: New
 * Purpose: Find one BSP mesh configured as an alpha surface by `gl-world-scene-adapter`.
 */
function findTranslucentSurfaceMesh(root: { traverse: (callback: (object: unknown) => void) => void }): Mesh | null {
  let found: Mesh | null = null;
  root.traverse((object) => {
    if (found || !(object instanceof Mesh) || !(object.material instanceof MeshBasicMaterial)) {
      return;
    }

    const refGl = object.userData.refGl as { warp?: boolean } | undefined;
    if (object.name.startsWith("gl-surface:") && object.material.opacity < 1 && refGl?.warp !== true) {
      found = object;
    }
  });
  return found;
}

function expectedAlpha(mesh: Mesh): number {
  const refGl = mesh.userData.refGl as { texinfoFlags?: number } | undefined;
  const flags = refGl?.texinfoFlags ?? 0;
  if ((flags & SURF_TRANS33) !== 0) {
    return 0.33;
  }
  if ((flags & SURF_TRANS66) !== 0) {
    return 0.66;
  }

  throw new Error("Mesh translucide sans flags SURF_TRANS33/SURF_TRANS66");
}
