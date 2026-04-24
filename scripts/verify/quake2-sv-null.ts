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
  configureServerHost,
  resetServerHost,
  SV_Frame as SV_FrameFromIndex,
  SV_Init as SV_InitFromIndex,
  SV_Shutdown as SV_ShutdownFromIndex
} from "../../packages/server/src/index.js";
import { SV_Frame, SV_Init, SV_Shutdown } from "../../packages/server/src/host.js";

assert.equal(SV_Init, SV_InitFromIndex, "packages/server index must re-export SV_Init from host bridge");
assert.equal(SV_Shutdown, SV_ShutdownFromIndex, "packages/server index must re-export SV_Shutdown from host bridge");
assert.equal(SV_Frame, SV_FrameFromIndex, "packages/server index must re-export SV_Frame from host bridge");

assert.equal(SV_Init(), undefined, "SV_Init must remain an empty no-op");
assert.equal(SV_Shutdown("final message", true), undefined, "SV_Shutdown must ignore parameters and remain a no-op");
assert.equal(SV_Shutdown("", false), undefined, "SV_Shutdown must remain a no-op for both reconnect modes");
assert.equal(SV_Frame(0), undefined, "SV_Frame must remain an empty no-op");
assert.equal(SV_Frame(16.5), undefined, "SV_Frame must not perform work for arbitrary frame times");

const events: string[] = [];
configureServerHost({
  SV_Init: () => {
    events.push("init");
  },
  SV_Shutdown: (finalmsg, reconnect) => {
    events.push(`shutdown:${finalmsg}:${reconnect}`);
  },
  SV_Frame: (msec) => {
    events.push(`frame:${msec}`);
  }
});

SV_Init();
SV_Shutdown("bye", true);
SV_Frame(33);
assert.deepEqual(
  events,
  ["init", "shutdown:bye:true", "frame:33"],
  "host bridge should forward top-level SV_* calls to configured bindings"
);

resetServerHost();
assert.equal(SV_Frame(99), undefined, "resetServerHost should restore the no-op default");

console.log("quake2-sv-null: ok");
