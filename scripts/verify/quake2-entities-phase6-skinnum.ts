/**
 * File: quake2-entities-phase6-skinnum.ts
 * Purpose: Verify that reference MD2 world models used by visible entities expose the skin variants required by `skinnum` in the original Quake II source.
 *
 * This file is not a direct source port.
 * It is a verification harness for the skinnum-dependent part of the world-entity rendering path.
 *
 * Dependencies:
 * - packages/formats
 */

import fs from "node:fs";
import path from "node:path";
import { findPakEntry, parseMd2, parsePak, readPakEntryData } from "../../packages/formats/src/index.js";

const DEFAULT_PAK_PATH = path.join(process.cwd(), "Quake 2", "baseq2", "pak0.pak");

main();

/**
 * Category: New
 * Purpose: Verify that the teleporter MD2 contains the two skin slots referenced by the original gameplay code.
 */
function main(): void {
  const pakPath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_PAK_PATH;
  if (!fs.existsSync(pakPath)) {
    throw new Error(`pak0.pak introuvable: ${pakPath}`);
  }

  const pak = parsePak(new Uint8Array(fs.readFileSync(pakPath)), pakPath);
  const dmspot = loadMd2Skins(pak, "models/objects/dmspot/tris.md2");

  if (dmspot.length < 2) {
    throw new Error(`models/objects/dmspot/tris.md2 n'expose pas deux skins: ${dmspot.join(", ")}`);
  }

  console.log("Verification phase 6 - skinnum world entity OK");
  console.log(`dmspot skins: ${dmspot.join(", ")}`);
}

/**
 * Category: New
 * Purpose: Load the skin list for one MD2 model from the reference Quake II pak.
 */
function loadMd2Skins(pak: ReturnType<typeof parsePak>, modelPath: string): string[] {
  const entry = findPakEntry(pak, modelPath);
  if (!entry) {
    throw new Error(`${modelPath} introuvable dans ${pak.sourcePath}`);
  }

  return parseMd2(readPakEntryData(pak, entry), modelPath).skins;
}
