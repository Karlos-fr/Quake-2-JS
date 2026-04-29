/**
 * File: quake2-sky-phase5.ts
 * Purpose: Verify web-facing sky integration behaviors such as replacing the active sky and handling null snapshots safely.
 *
 * This file is not a direct source port.
 * It is a verification harness for phase 5 of the sky plan.
 *
 * Dependencies:
 * - packages/filesystem
 * - packages/renderer-three
 * - three
 */

import fs from "node:fs";
import path from "node:path";
import { Mesh, PerspectiveCamera } from "three";
import type { QuakeSkySnapshot } from "../../packages/renderer-common/src/index.js";
import { createVirtualFilesystem, mountPak } from "../../packages/filesystem/src/index.js";
import { createQuakeSkyResolver, createThreeSkySceneAdapter } from "../../packages/renderer-three/src/index.js";

const DEFAULT_PAK_PATH = path.join(process.cwd(), "Quake 2", "baseq2", "pak0.pak");

main();

/**
 * Category: New
 * Purpose: Verify sky replacement and removal behavior expected by the web app integration layer.
 */
function main(): void {
  const pakPath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_PAK_PATH;
  if (!fs.existsSync(pakPath)) {
    throw new Error(`pak0.pak introuvable: ${pakPath}`);
  }

  const filesystem = createVirtualFilesystem();
  mountPak(filesystem, new Uint8Array(fs.readFileSync(pakPath)), "pak0.pak");

  const adapter = createThreeSkySceneAdapter(createQuakeSkyResolver(filesystem));
  const camera = new PerspectiveCamera(75, 1, 4, 20000);
  camera.position.set(32, 64, 96);

  const firstSnapshot: QuakeSkySnapshot = {
    name: "unit1_",
    rotate: 0,
    axis: [0, 0, 0]
  };
  const secondSnapshot: QuakeSkySnapshot = {
    name: "space1",
    rotate: 2,
    axis: [0, 1, 1]
  };

  adapter.update(firstSnapshot, camera, 1);
  assertChildCount(adapter.root.children.length, 1, "apres premier ciel");
  const firstMeshName = adapter.root.children[0]?.name ?? "";
  if (!firstMeshName.includes("unit1_")) {
    throw new Error(`nom de skybox inattendu apres premier ciel: ${firstMeshName}`);
  }

  adapter.update(secondSnapshot, camera, 2);
  assertChildCount(adapter.root.children.length, 1, "apres remplacement de ciel");
  const secondMeshName = adapter.root.children[0]?.name ?? "";
  if (!secondMeshName.includes("space1")) {
    throw new Error(`nom de skybox inattendu apres remplacement: ${secondMeshName}`);
  }

  adapter.update(null, camera, 3);
  assertChildCount(adapter.root.children.length, 0, "apres retrait du ciel");

  adapter.update(firstSnapshot, camera, 4);
  assertChildCount(adapter.root.children.length, 1, "apres recreation du ciel");

  adapter.update(firstSnapshot, camera, 5, [{
    axis: 2,
    mins: [-0.25, -0.5],
    maxs: [0.75, 0.5],
    image: null,
    vertices: [
      { position: [-1, -1, 1], uv: [0.1, 0.2] },
      { position: [-1, 1, 1], uv: [0.1, 0.8] },
      { position: [1, 1, 1], uv: [0.9, 0.8] },
      { position: [1, -1, 1], uv: [0.9, 0.2] }
    ]
  }]);
  assertChildCount(adapter.root.children.length, 1, "apres ciel clippe R_DrawSkyBox");
  const clippedMesh = adapter.root.children[0];
  if (!(clippedMesh instanceof Mesh)) {
    throw new Error("mesh de ciel clippe manquant");
  }
  if (clippedMesh.userData.refGl?.source !== "R_DrawSkyBox") {
    throw new Error(`source ciel inattendue: ${clippedMesh.userData.refGl?.source}`);
  }
  if (clippedMesh.geometry.getAttribute("position").count !== 4) {
    throw new Error("geometrie ciel clippe inattendue");
  }
  if (clippedMesh.geometry.groups[0]?.materialIndex !== 2) {
    throw new Error("materialIndex ciel clippe inattendu");
  }

  console.log("Verification phase 5 ciel OK:");
  console.log(`- premier ciel -> ${firstMeshName}`);
  console.log(`- remplacement -> ${secondMeshName}`);
  console.log("- retrait/recreation -> OK");
}

/**
 * Category: New
 * Purpose: Assert one expected child count on the sky adapter root.
 */
function assertChildCount(actual: number, expected: number, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: nombre d'enfants inattendu ${actual} != ${expected}`);
  }
}
