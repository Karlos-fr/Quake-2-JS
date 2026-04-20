/**
 * File: quake2-sky-phase3.ts
 * Purpose: Verify Quake II sky resource discovery and decoding from `env/` assets.
 *
 * This file is not a direct source port.
 * It is a verification harness for phase 3 of the sky plan.
 *
 * Dependencies:
 * - packages/filesystem
 * - packages/renderer-common
 * - packages/renderer-three
 */

import fs from "node:fs";
import path from "node:path";
import { createVirtualFilesystem, mountPak } from "../../packages/filesystem/src/index.js";
import { QUAKE_SKY_FACE_SUFFIXES } from "../../packages/renderer-common/src/index.js";
import { createQuakeSkyResolver } from "../../packages/renderer-three/src/index.js";

const DEFAULT_PAK_PATH = path.join(process.cwd(), "Quake 2", "baseq2", "pak0.pak");

main();

/**
 * Category: New
 * Purpose: Verify canonical Quake II sky resource resolution on real pak assets.
 */
function main(): void {
  const pakPath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_PAK_PATH;
  if (!fs.existsSync(pakPath)) {
    throw new Error(`pak0.pak introuvable: ${pakPath}`);
  }

  const filesystem = createVirtualFilesystem();
  mountPak(filesystem, new Uint8Array(fs.readFileSync(pakPath)), "pak0.pak");
  const resolver = createQuakeSkyResolver(filesystem);

  verifySkySet(resolver, "unit1_");
  verifySkySet(resolver, "space1");

  const missingSet = resolver.resolveAssetSet("missing_sky");
  const missingTextures = resolver.resolveTextureSet("missing_sky");
  if (missingSet !== null || missingTextures !== null) {
    throw new Error("un ciel manquant devrait retourner null sans casser le resolver");
  }

  console.log("Verification phase 3 ciel OK:");
  console.log("- unit1_ -> assets et textures resolves");
  console.log("- space1 -> assets et textures resolves");
  console.log("- missing_sky -> null");
}

/**
 * Category: New
 * Purpose: Verify one full six-face sky asset and texture set.
 *
 * Constraints:
 * - Must require all canonical Quake face suffixes.
 */
function verifySkySet(
  resolver: ReturnType<typeof createQuakeSkyResolver>,
  skyName: string
): void {
  const assetSet = resolver.resolveAssetSet(skyName);
  if (!assetSet) {
    throw new Error(`asset set introuvable pour ${skyName}`);
  }

  if (assetSet.name !== skyName) {
    throw new Error(`nom de sky asset set invalide: ${assetSet.name} != ${skyName}`);
  }

  for (const faceName of QUAKE_SKY_FACE_SUFFIXES) {
    const assetPath = assetSet.faces[faceName];
    if (!assetPath.startsWith(`env/${skyName}${faceName}.`)) {
      throw new Error(`chemin de face invalide pour ${skyName}/${faceName}: ${assetPath}`);
    }
  }

  const textureSet = resolver.resolveTextureSet(skyName);
  if (!textureSet) {
    throw new Error(`texture set introuvable pour ${skyName}`);
  }

  for (const faceName of QUAKE_SKY_FACE_SUFFIXES) {
    const texture = textureSet.textures[faceName];
    const quakeMeta = texture.userData.quake as { width?: number; height?: number; kind?: string } | undefined;
    if (!quakeMeta?.width || !quakeMeta?.height || quakeMeta.kind !== "sky") {
      throw new Error(`texture de face invalide pour ${skyName}/${faceName}`);
    }
  }
}
