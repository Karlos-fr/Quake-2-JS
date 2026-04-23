/**
 * File: quake2-sv-null.ts
 * Purpose: Verify the TypeScript port target for `server/sv_null.c`.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the null server stubs.
 *
 * Dependencies:
 * - packages/server/src/sv_null.ts
 * - packages/server/src/index.ts
 */

import { strict as assert } from "node:assert";

import {
  SV_Frame as SV_FrameFromIndex,
  SV_Init as SV_InitFromIndex,
  SV_Shutdown as SV_ShutdownFromIndex
} from "../../packages/server/src/index.js";
import { SV_Frame, SV_Init, SV_Shutdown } from "../../packages/server/src/sv_null.js";

assert.equal(SV_Init, SV_InitFromIndex, "packages/server index must re-export SV_Init from sv_null");
assert.equal(SV_Shutdown, SV_ShutdownFromIndex, "packages/server index must re-export SV_Shutdown from sv_null");
assert.equal(SV_Frame, SV_FrameFromIndex, "packages/server index must re-export SV_Frame from sv_null");

assert.equal(SV_Init(), undefined, "SV_Init must remain an empty no-op");
assert.equal(SV_Shutdown("final message", true), undefined, "SV_Shutdown must ignore parameters and remain a no-op");
assert.equal(SV_Shutdown("", false), undefined, "SV_Shutdown must remain a no-op for both reconnect modes");
assert.equal(SV_Frame(0), undefined, "SV_Frame must remain an empty no-op");
assert.equal(SV_Frame(16.5), undefined, "SV_Frame must not perform work for arbitrary frame times");

console.log("quake2-sv-null: ok");
