/**
 * File: quake2-m-gladiator-header.ts
 * Purpose: Verify the declarative port of the generated gladiator monster model header.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the TypeScript port.
 *
 * Dependencies:
 * - packages/game/src/m_gladiator.ts
 */

import {
  FRAME_attack1,
  FRAME_death22,
  FRAME_melee10,
  FRAME_melee11,
  FRAME_melee12,
  FRAME_melee13,
  FRAME_melee14,
  FRAME_melee15,
  FRAME_melee16,
  FRAME_melee17,
  FRAME_melee1,
  FRAME_melee2,
  FRAME_melee3,
  FRAME_melee4,
  FRAME_melee5,
  FRAME_melee6,
  FRAME_melee7,
  FRAME_melee8,
  FRAME_melee9,
  FRAME_painup7,
  FRAME_run1,
  FRAME_run2,
  FRAME_run3,
  FRAME_run4,
  FRAME_run5,
  FRAME_run6,
  FRAME_stand1,
  FRAME_stand2,
  FRAME_stand3,
  FRAME_stand4,
  FRAME_stand5,
  FRAME_stand6,
  FRAME_stand7,
  FRAME_walk1,
  FRAME_walk10,
  FRAME_walk11,
  FRAME_walk12,
  FRAME_walk13,
  FRAME_walk14,
  FRAME_walk15,
  FRAME_walk16,
  FRAME_walk2,
  FRAME_walk3,
  FRAME_walk4,
  FRAME_walk5,
  FRAME_walk6,
  FRAME_walk7,
  FRAME_walk8,
  FRAME_walk9,
  MODEL_SCALE
} from "../../packages/game/src/m_gladiator.js";

/**
 * Category: New
 * Purpose: Fail fast when a declarative frame constant differs from the original header values.
 *
 * Constraints:
 * - Keep the checks sparse but representative across the generated table.
 */
function assertEqual<T>(label: string, actual: T, expected: T): void {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

assertEqual("FRAME_stand1", FRAME_stand1, 0);
assertEqual("FRAME_stand2", FRAME_stand2, 1);
assertEqual("FRAME_stand3", FRAME_stand3, 2);
assertEqual("FRAME_stand4", FRAME_stand4, 3);
assertEqual("FRAME_stand5", FRAME_stand5, 4);
assertEqual("FRAME_stand6", FRAME_stand6, 5);
assertEqual("FRAME_stand7", FRAME_stand7, 6);
assertEqual("FRAME_walk1", FRAME_walk1, 7);
assertEqual("FRAME_walk2", FRAME_walk2, 8);
assertEqual("FRAME_walk3", FRAME_walk3, 9);
assertEqual("FRAME_walk4", FRAME_walk4, 10);
assertEqual("FRAME_walk5", FRAME_walk5, 11);
assertEqual("FRAME_walk6", FRAME_walk6, 12);
assertEqual("FRAME_walk7", FRAME_walk7, 13);
assertEqual("FRAME_walk8", FRAME_walk8, 14);
assertEqual("FRAME_walk9", FRAME_walk9, 15);
assertEqual("FRAME_walk10", FRAME_walk10, 16);
assertEqual("FRAME_walk11", FRAME_walk11, 17);
assertEqual("FRAME_walk12", FRAME_walk12, 18);
assertEqual("FRAME_walk13", FRAME_walk13, 19);
assertEqual("FRAME_walk14", FRAME_walk14, 20);
assertEqual("FRAME_walk15", FRAME_walk15, 21);
assertEqual("FRAME_walk16", FRAME_walk16, 22);
assertEqual("FRAME_run1", FRAME_run1, 23);
assertEqual("FRAME_run2", FRAME_run2, 24);
assertEqual("FRAME_run3", FRAME_run3, 25);
assertEqual("FRAME_run4", FRAME_run4, 26);
assertEqual("FRAME_run5", FRAME_run5, 27);
assertEqual("FRAME_run6", FRAME_run6, 28);
assertEqual("FRAME_melee1", FRAME_melee1, 29);
assertEqual("FRAME_melee2", FRAME_melee2, 30);
assertEqual("FRAME_melee3", FRAME_melee3, 31);
assertEqual("FRAME_melee4", FRAME_melee4, 32);
assertEqual("FRAME_melee5", FRAME_melee5, 33);
assertEqual("FRAME_melee6", FRAME_melee6, 34);
assertEqual("FRAME_melee7", FRAME_melee7, 35);
assertEqual("FRAME_melee8", FRAME_melee8, 36);
assertEqual("FRAME_melee9", FRAME_melee9, 37);
assertEqual("FRAME_melee10", FRAME_melee10, 38);
assertEqual("FRAME_melee11", FRAME_melee11, 39);
assertEqual("FRAME_melee12", FRAME_melee12, 40);
assertEqual("FRAME_melee13", FRAME_melee13, 41);
assertEqual("FRAME_melee14", FRAME_melee14, 42);
assertEqual("FRAME_melee15", FRAME_melee15, 43);
assertEqual("FRAME_melee16", FRAME_melee16, 44);
assertEqual("FRAME_melee17", FRAME_melee17, 45);
assertEqual("FRAME_attack1", FRAME_attack1, 46);
assertEqual("FRAME_death22", FRAME_death22, 82);
assertEqual("FRAME_painup7", FRAME_painup7, 89);
assertEqual("MODEL_SCALE", MODEL_SCALE, 1.0);

console.log("quake2-m-gladiator-header: ok");
