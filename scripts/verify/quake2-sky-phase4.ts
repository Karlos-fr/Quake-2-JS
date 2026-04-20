/**
 * File: quake2-sky-phase4.ts
 * Purpose: Verify the Three.js sky scene adapter built for Quake II sky rendering.
 *
 * This file is not a direct source port.
 * It is a verification harness for phase 4 of the sky plan.
 *
 * Dependencies:
 * - packages/filesystem
 * - packages/renderer-three
 * - three
 */

import fs from "node:fs";
import path from "node:path";
import { PerspectiveCamera, Quaternion, Vector3 } from "three";
import type { QuakeSkySnapshot } from "../../packages/renderer-common/src/index.js";
import { createVirtualFilesystem, mountPak } from "../../packages/filesystem/src/index.js";
import { createQuakeSkyResolver, createThreeSkySceneAdapter } from "../../packages/renderer-three/src/index.js";

const DEFAULT_PAK_PATH = path.join(process.cwd(), "Quake 2", "baseq2", "pak0.pak");

main();

/**
 * Category: New
 * Purpose: Verify the dedicated sky adapter scene behavior against real Quake II sky assets.
 */
function main(): void {
  const pakPath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_PAK_PATH;
  if (!fs.existsSync(pakPath)) {
    throw new Error(`pak0.pak introuvable: ${pakPath}`);
  }

  const filesystem = createVirtualFilesystem();
  mountPak(filesystem, new Uint8Array(fs.readFileSync(pakPath)), "pak0.pak");
  const resolver = createQuakeSkyResolver(filesystem);
  const adapter = createThreeSkySceneAdapter(resolver);
  const camera = new PerspectiveCamera(75, 1, 4, 20000);
  camera.position.set(128, 256, 384);

  const snapshot: QuakeSkySnapshot = {
    name: "space1",
    rotate: 3,
    axis: [1, 1, 0]
  };

  adapter.update(snapshot, camera, 2);

  if (adapter.root.children.length !== 1) {
    throw new Error(`sky adapter devrait contenir 1 enfant, recu ${adapter.root.children.length}`);
  }

  const skyMesh = adapter.root.children[0];
  if (!("material" in skyMesh) || !Array.isArray(skyMesh.material) || skyMesh.material.length !== 6) {
    throw new Error("sky mesh invalide: 6 materiaux attendus");
  }

  if (!adapter.root.position.equals(camera.position)) {
    throw new Error(`sky root devrait suivre la camera: ${adapter.root.position.toArray()} != ${camera.position.toArray()}`);
  }

  if (skyMesh.quaternion.equals(new Quaternion())) {
    throw new Error("la rotation du ciel devrait etre appliquee quand rotate/axis sont renseignes");
  }

  adapter.update(null, camera, 2);
  if (adapter.root.children.length !== 0) {
    throw new Error("le ciel devrait disparaitre quand le snapshot est null");
  }

  adapter.update(
    {
      name: "unit1_",
      rotate: 0,
      axis: [0, 0, 0]
    },
    camera,
    5
  );

  if (adapter.root.children.length !== 1) {
    throw new Error("un ciel statique valide devrait recreer la skybox");
  }

  const staticSkyMesh = adapter.root.children[0];
  if (!staticSkyMesh.quaternion.equals(new Quaternion())) {
    throw new Error("un ciel sans rotation devrait garder une quaternion identite");
  }

  console.log("Verification phase 4 ciel OK:");
  console.log(`- position camera -> ${new Vector3().copy(adapter.root.position).toArray().join(", ")}`);
  console.log(`- sky dynamique -> ${snapshot.name}`);
  console.log("- sky statique -> unit1_");
}
