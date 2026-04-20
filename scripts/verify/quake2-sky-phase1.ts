/**
 * File: quake2-sky-phase1.ts
 * Purpose: Verify Quake II client sky configstring parsing against real BSP worldspawn values and map-change resets.
 *
 * This file is not a direct source port.
 * It is a verification harness for phase 1 of the sky plan.
 *
 * Dependencies:
 * - packages/client
 * - packages/filesystem
 * - packages/formats
 * - packages/qcommon
 */

import fs from "node:fs";
import path from "node:path";
import { createClientRuntime, CL_ClearState, CL_ParseConfigString } from "../../packages/client/src/index.js";
import { parseBsp } from "../../packages/formats/src/index.js";
import { createVirtualFilesystem, mountPak, readMountedFile } from "../../packages/filesystem/src/index.js";
import { SZ_Clear } from "../../packages/memory/src/index.js";
import { MSG_BeginReading, MSG_WriteShort, MSG_WriteString } from "../../packages/qcommon/src/index.js";
import { CS_SKY, CS_SKYAXIS, CS_SKYROTATE } from "../../packages/qcommon/src/index.js";

const DEFAULT_PAK_PATH = path.join(process.cwd(), "Quake 2", "baseq2", "pak0.pak");

main();

/**
 * Category: New
 * Purpose: Run the phase-1 sky verification against real Quake II maps and configstring updates.
 */
function main(): void {
  const pakPath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_PAK_PATH;
  if (!fs.existsSync(pakPath)) {
    throw new Error(`pak0.pak introuvable: ${pakPath}`);
  }

  const pakBytes = new Uint8Array(fs.readFileSync(pakPath));
  const filesystem = createVirtualFilesystem();
  mountPak(filesystem, pakBytes, "pak0.pak");

  const runtime = createClientRuntime();
  CL_ClearState(runtime);
  assertSkyState(runtime, "", 0, [0, 0, 0], "etat initial apres CL_ClearState");

  const base1 = readWorldspawnSky(filesystem, "maps/base1.bsp");
  applySkyConfigstrings(runtime, base1.sky, base1.skyrotate, base1.skyaxis);
  assertSkyState(runtime, "unit1_", 0, [0, 0, 0], "base1");

  const space = readWorldspawnSky(filesystem, "maps/space.bsp");
  applySkyConfigstrings(runtime, space.sky, space.skyrotate, space.skyaxis);
  assertSkyState(runtime, "space1", 2, [0, 1, 1], "space");

  const boss2 = readWorldspawnSky(filesystem, "maps/boss2.bsp");
  applySkyConfigstrings(runtime, boss2.sky, boss2.skyrotate, boss2.skyaxis);
  assertSkyState(runtime, "space1", 3, [1, 1, 0], "boss2");

  CL_ClearState(runtime);
  assertSkyState(runtime, "", 0, [0, 0, 0], "reset changement de map");

  applySkyConfigstrings(runtime, base1.sky, base1.skyrotate, base1.skyaxis);
  assertSkyState(runtime, "unit1_", 0, [0, 0, 0], "base1 apres reset");

  console.log("Verification phase 1 ciel OK:");
  console.log(`- base1 -> ${JSON.stringify(base1)}`);
  console.log(`- space -> ${JSON.stringify(space)}`);
  console.log(`- boss2 -> ${JSON.stringify(boss2)}`);
}

/**
 * Category: New
 * Purpose: Read the worldspawn sky properties from one BSP stored in the mounted PAK.
 *
 * Constraints:
 * - Must use the parsed BSP entity lump as the source of truth for map-defined sky metadata.
 */
function readWorldspawnSky(
  filesystem: ReturnType<typeof createVirtualFilesystem>,
  mapPath: string
): { sky: string; skyrotate: string; skyaxis: string } {
  const file = readMountedFile(filesystem, mapPath);
  if (!file) {
    throw new Error(`map introuvable: ${mapPath}`);
  }

  const map = parseBsp(file.bytes, file.path);
  const worldspawn = map.parsedEntities[0]?.properties ?? {};

  return {
    sky: worldspawn.sky ?? "",
    skyrotate: worldspawn.skyrotate ?? "",
    skyaxis: worldspawn.skyaxis ?? ""
  };
}

/**
 * Category: New
 * Purpose: Feed one triplet of sky configstrings through the real Quake II client configstring parser.
 *
 * Constraints:
 * - Must reuse the mutable client message buffer exactly like other parser harnais.
 */
function applySkyConfigstrings(runtime: ReturnType<typeof createClientRuntime>, sky: string, rotate: string, axis: string): void {
  parseOneConfigstring(runtime, CS_SKY, sky);
  parseOneConfigstring(runtime, CS_SKYROTATE, rotate);
  parseOneConfigstring(runtime, CS_SKYAXIS, axis);
}

/**
 * Category: New
 * Purpose: Encode and parse one Quake II configstring message for the current client runtime.
 *
 * Constraints:
 * - Must route through `CL_ParseConfigString` rather than mutating runtime state directly.
 */
function parseOneConfigstring(runtime: ReturnType<typeof createClientRuntime>, index: number, value: string): void {
  SZ_Clear(runtime.net_message);
  MSG_WriteShort(runtime.net_message, index);
  MSG_WriteString(runtime.net_message, value);
  MSG_BeginReading(runtime.net_message);
  CL_ParseConfigString(runtime);
}

/**
 * Category: New
 * Purpose: Assert the structured sky state against one expected configstring-derived value set.
 *
 * Constraints:
 * - Must fail loudly with a context label when fidelity drifts.
 */
function assertSkyState(
  runtime: ReturnType<typeof createClientRuntime>,
  expectedName: string,
  expectedRotate: number,
  expectedAxis: [number, number, number],
  label: string
): void {
  if (runtime.cl.sky.name !== expectedName) {
    throw new Error(`${label}: nom de ciel inattendu '${runtime.cl.sky.name}' != '${expectedName}'`);
  }

  if (runtime.cl.sky.rotate !== expectedRotate) {
    throw new Error(`${label}: rotation de ciel inattendue ${runtime.cl.sky.rotate} != ${expectedRotate}`);
  }

  for (let index = 0; index < 3; index += 1) {
    if (runtime.cl.sky.axis[index] !== expectedAxis[index]) {
      throw new Error(
        `${label}: axe de ciel inattendu ${JSON.stringify(runtime.cl.sky.axis)} != ${JSON.stringify(expectedAxis)}`
      );
    }
  }
}
