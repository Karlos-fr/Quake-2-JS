/**
 * File: quake2-m-flash.ts
 * Purpose: Verify the strict TypeScript port of `game/m_flash.c`.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the shared monster muzzle-flash table.
 *
 * Dependencies:
 * - packages/client/src/monster-flash.ts
 */

import { strict as assert } from "node:assert";

import { getMonsterFlashOffset, monster_flash_offset } from "../../packages/client/src/monster-flash.js";

assert.equal(monster_flash_offset.length, 212, "monster_flash_offset length mismatch");
assert.deepEqual(monster_flash_offset[0], [0, 0, 0], "slot 0 zero sentinel mismatch");
assert.deepEqual(monster_flash_offset[1], [20.7, -18.5, 28.7], "MZ2_TANK_BLASTER_1 mismatch");
assert.deepEqual(monster_flash_offset[57], [24.8, -9.0, 39.0], "MZ2_CHICK_ROCKET_1 corrected offset mismatch");
assert.deepEqual(
  monster_flash_offset[98],
  [31.5 * 1.2, 9.6 * 1.2, 10.1 * 1.2],
  "MZ2_SOLDIER_BLASTER_8 corrected offset mismatch"
);
assert.deepEqual(monster_flash_offset[132], [6.3, -9, 111.2], "MZ2_JORG_BFG_1 mismatch");
assert.deepEqual(monster_flash_offset[195], [69.0, -17.63, 93.77], "MZ2_WIDOW2_BEAMER_1 mismatch");
assert.deepEqual(monster_flash_offset[210], [58.29, 27.11, 92.0], "MZ2_WIDOW2_BEAM_SWEEP_11 mismatch");
assert.deepEqual(monster_flash_offset[211], [0, 0, 0], "terminal zero sentinel mismatch");

assert.notEqual(monster_flash_offset[1], getMonsterFlashOffset(1), "getter must return a copy");
assert.deepEqual(getMonsterFlashOffset(1), [20.7, -18.5, 28.7], "getter value mismatch");
assert.deepEqual(getMonsterFlashOffset(-1), [0, 0, 0], "negative index fallback mismatch");
assert.deepEqual(getMonsterFlashOffset(999), [0, 0, 0], "out-of-range fallback mismatch");

console.log("quake2-m-flash: ok");
