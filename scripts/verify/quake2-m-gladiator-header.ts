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
  FRAME_attack2,
  FRAME_attack3,
  FRAME_attack4,
  FRAME_attack5,
  FRAME_attack6,
  FRAME_attack7,
  FRAME_attack8,
  FRAME_attack9,
  FRAME_death1,
  FRAME_death10,
  FRAME_death11,
  FRAME_death12,
  FRAME_death13,
  FRAME_death14,
  FRAME_death15,
  FRAME_death16,
  FRAME_death17,
  FRAME_death18,
  FRAME_death19,
  FRAME_death2,
  FRAME_death20,
  FRAME_death21,
  FRAME_death22,
  FRAME_death3,
  FRAME_death4,
  FRAME_death5,
  FRAME_death6,
  FRAME_death7,
  FRAME_death8,
  FRAME_death9,
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
  FRAME_pain1,
  FRAME_pain2,
  FRAME_pain3,
  FRAME_pain4,
  FRAME_pain5,
  FRAME_pain6,
  FRAME_painup1,
  FRAME_painup2,
  FRAME_painup3,
  FRAME_painup4,
  FRAME_painup5,
  FRAME_painup6,
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
 * - Keep explicit checks for every currently validated generated-table entry.
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
assertEqual("FRAME_attack2", FRAME_attack2, 47);
assertEqual("FRAME_attack3", FRAME_attack3, 48);
assertEqual("FRAME_attack4", FRAME_attack4, 49);
assertEqual("FRAME_attack5", FRAME_attack5, 50);
assertEqual("FRAME_attack6", FRAME_attack6, 51);
assertEqual("FRAME_attack7", FRAME_attack7, 52);
assertEqual("FRAME_attack8", FRAME_attack8, 53);
assertEqual("FRAME_attack9", FRAME_attack9, 54);
assertEqual("FRAME_pain1", FRAME_pain1, 55);
assertEqual("FRAME_pain2", FRAME_pain2, 56);
assertEqual("FRAME_pain3", FRAME_pain3, 57);
assertEqual("FRAME_pain4", FRAME_pain4, 58);
assertEqual("FRAME_pain5", FRAME_pain5, 59);
assertEqual("FRAME_pain6", FRAME_pain6, 60);
assertEqual("FRAME_death1", FRAME_death1, 61);
assertEqual("FRAME_death2", FRAME_death2, 62);
assertEqual("FRAME_death3", FRAME_death3, 63);
assertEqual("FRAME_death4", FRAME_death4, 64);
assertEqual("FRAME_death5", FRAME_death5, 65);
assertEqual("FRAME_death6", FRAME_death6, 66);
assertEqual("FRAME_death7", FRAME_death7, 67);
assertEqual("FRAME_death8", FRAME_death8, 68);
assertEqual("FRAME_death9", FRAME_death9, 69);
assertEqual("FRAME_death10", FRAME_death10, 70);
assertEqual("FRAME_death11", FRAME_death11, 71);
assertEqual("FRAME_death12", FRAME_death12, 72);
assertEqual("FRAME_death13", FRAME_death13, 73);
assertEqual("FRAME_death14", FRAME_death14, 74);
assertEqual("FRAME_death15", FRAME_death15, 75);
assertEqual("FRAME_death16", FRAME_death16, 76);
assertEqual("FRAME_death17", FRAME_death17, 77);
assertEqual("FRAME_death18", FRAME_death18, 78);
assertEqual("FRAME_death19", FRAME_death19, 79);
assertEqual("FRAME_death20", FRAME_death20, 80);
assertEqual("FRAME_death21", FRAME_death21, 81);
assertEqual("FRAME_death22", FRAME_death22, 82);
assertEqual("FRAME_painup1", FRAME_painup1, 83);
assertEqual("FRAME_painup2", FRAME_painup2, 84);
assertEqual("FRAME_painup3", FRAME_painup3, 85);
assertEqual("FRAME_painup4", FRAME_painup4, 86);
assertEqual("FRAME_painup5", FRAME_painup5, 87);
assertEqual("FRAME_painup6", FRAME_painup6, 88);
assertEqual("FRAME_painup7", FRAME_painup7, 89);
assertEqual("MODEL_SCALE", MODEL_SCALE, 1.0);

console.log("quake2-m-gladiator-header: ok");
