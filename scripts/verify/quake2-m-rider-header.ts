/**
 * File: quake2-m-rider-header.ts
 * Purpose: Verify that the TypeScript target for `game/m_rider.h` preserves the generated rider frame table.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for a strict header port.
 *
 * Dependencies:
 * - packages/game/src/m_rider.ts
 */

import { strict as assert } from "node:assert";

import {
  FRAME_stand201,
  FRAME_stand230,
  FRAME_stand260,
  MODEL_SCALE
} from "../../packages/game/src/m_rider.js";

assert.equal(FRAME_stand201, 0, "FRAME_stand201 mismatch");
assert.equal(FRAME_stand230, 29, "FRAME_stand230 mismatch");
assert.equal(FRAME_stand260, 59, "FRAME_stand260 mismatch");
assert.equal(MODEL_SCALE, 1.0, "MODEL_SCALE mismatch");

console.log("quake2-m-rider-header: ok");
