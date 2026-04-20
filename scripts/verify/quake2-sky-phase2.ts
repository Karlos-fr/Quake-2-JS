/**
 * File: quake2-sky-phase2.ts
 * Purpose: Verify the renderer-facing Quake II sky snapshot contract exported by the client package.
 *
 * This file is not a direct source port.
 * It is a verification harness for phase 2 of the sky plan.
 *
 * Dependencies:
 * - packages/client
 * - packages/memory
 * - packages/qcommon
 */

import {
  CL_BuildSkySnapshot,
  CL_ClearState,
  CL_ParseConfigString,
  createClientRuntime
} from "../../packages/client/src/index.js";
import { SZ_Clear } from "../../packages/memory/src/index.js";
import {
  CS_SKY,
  CS_SKYAXIS,
  CS_SKYROTATE,
  MSG_BeginReading,
  MSG_WriteShort,
  MSG_WriteString
} from "../../packages/qcommon/src/index.js";

main();

/**
 * Category: New
 * Purpose: Verify the shared sky snapshot contract built from parsed Quake II configstrings.
 */
function main(): void {
  const runtime = createClientRuntime();
  CL_ClearState(runtime);

  const emptySnapshot = CL_BuildSkySnapshot(runtime);
  if (emptySnapshot !== null) {
    throw new Error(`snapshot vide inattendu: ${JSON.stringify(emptySnapshot)}`);
  }

  parseOneConfigstring(runtime, CS_SKY, "space1");
  parseOneConfigstring(runtime, CS_SKYROTATE, "2");
  parseOneConfigstring(runtime, CS_SKYAXIS, "0 1 1");

  const activeSnapshot = CL_BuildSkySnapshot(runtime);
  if (!activeSnapshot) {
    throw new Error("snapshot de ciel absent alors qu'un ciel est actif");
  }

  if (activeSnapshot.name !== "space1" || activeSnapshot.rotate !== 2) {
    throw new Error(`snapshot de ciel invalide: ${JSON.stringify(activeSnapshot)}`);
  }

  const expectedAxis: [number, number, number] = [0, 1, 1];
  for (let index = 0; index < 3; index += 1) {
    if (activeSnapshot.axis[index] !== expectedAxis[index]) {
      throw new Error(`axe snapshot invalide: ${JSON.stringify(activeSnapshot.axis)}`);
    }
  }

  CL_ClearState(runtime);
  const resetSnapshot = CL_BuildSkySnapshot(runtime);
  if (resetSnapshot !== null) {
    throw new Error(`snapshot non vide apres reset: ${JSON.stringify(resetSnapshot)}`);
  }

  console.log("Verification phase 2 ciel OK:");
  console.log(`- snapshot vide -> ${emptySnapshot}`);
  console.log(`- snapshot actif -> ${JSON.stringify(activeSnapshot)}`);
  console.log(`- snapshot apres reset -> ${resetSnapshot}`);
}

/**
 * Category: New
 * Purpose: Encode and parse one Quake II configstring message through the real client parser.
 *
 * Constraints:
 * - Must not mutate configstrings directly inside the verification harness.
 */
function parseOneConfigstring(runtime: ReturnType<typeof createClientRuntime>, index: number, value: string): void {
  SZ_Clear(runtime.net_message);
  MSG_WriteShort(runtime.net_message, index);
  MSG_WriteString(runtime.net_message, value);
  MSG_BeginReading(runtime.net_message);
  CL_ParseConfigString(runtime);
}
