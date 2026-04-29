/**
 * File: quake2-m-flash.ts
 * Purpose: Verify the strict TypeScript port of `game/m_flash.c`.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the shared monster muzzle-flash table.
 *
 * Dependencies:
 * - packages/game/src/m_flash.ts
 */

import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { getMonsterFlashOffset, monster_flash_offset } from "../../packages/game/src/m_flash.js";

const SOURCE_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../Quake-2-master/game/m_flash.c");
const source = readFileSync(SOURCE_PATH, "utf8");
const sourceMonsterFlashOffset = parseMonsterFlashOffset(source);

assert.deepEqual(monster_flash_offset, sourceMonsterFlashOffset, "monster_flash_offset must match game/m_flash.c");
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

function parseMonsterFlashOffset(cSource: string): number[][] {
  const tableStart = cSource.indexOf("vec3_t monster_flash_offset");
  assert.notEqual(tableStart, -1, "monster_flash_offset declaration should exist");

  const bodyStart = cSource.indexOf("{", tableStart);
  assert.notEqual(bodyStart, -1, "monster_flash_offset initializer should start");

  let depth = 0;
  let bodyEnd = -1;
  for (let index = bodyStart; index < cSource.length; index += 1) {
    if (cSource[index] === "{") {
      depth += 1;
    } else if (cSource[index] === "}") {
      depth -= 1;
      if (depth === 0) {
        bodyEnd = index;
        break;
      }
    }
  }
  assert.notEqual(bodyEnd, -1, "monster_flash_offset initializer should end");

  const body = cSource
    .slice(bodyStart + 1, bodyEnd)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");

  const values = body
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean)
    .map(evaluateNumericToken);

  assert.equal(values.length % 3, 0, "monster_flash_offset source values should be vec3 triples");

  const vectors: number[][] = [];
  for (let index = 0; index < values.length; index += 3) {
    vectors.push([values[index], values[index + 1], values[index + 2]]);
  }
  return vectors;
}

function evaluateNumericToken(token: string): number {
  assert.match(token, /^[0-9+\-.*\s]+$/, `unsupported numeric token ${token}`);
  const factors = token.split("*").map((factor) => Number(factor.trim()));
  assert.ok(factors.every((factor) => Number.isFinite(factor)), `invalid numeric token ${token}`);
  return factors.reduce((product, factor) => product * factor, 1);
}
