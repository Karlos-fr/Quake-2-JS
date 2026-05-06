/**
 * File: quake2-m-gunner-header.ts
 * Purpose: Verify the declarative port of the generated gunner monster model header.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the TypeScript port.
 *
 * Dependencies:
 * - packages/game/src/m_gunner.ts
 */

import {
  FRAME_attak101,
  FRAME_death11,
  FRAME_duck08,
  FRAME_run08,
  FRAME_runs06,
  FRAME_stand01,
  FRAME_stand70,
  FRAME_walk01,
  FRAME_walk24,
  MODEL_SCALE
} from "../../packages/game/src/m_gunner.js";
import * as gunnerHeader from "../../packages/game/src/m_gunner.js";
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

const HEADER_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../Quake-2-master/game/m_gunner.h"
);

assertEqual("FRAME_stand01", FRAME_stand01, 0);
assertEqual("FRAME_stand70", FRAME_stand70, 69);
assertEqual("FRAME_walk01", FRAME_walk01, 70);
assertEqual("FRAME_walk24", FRAME_walk24, 93);
assertEqual("FRAME_run08", FRAME_run08, 101);
assertEqual("FRAME_runs06", FRAME_runs06, 107);
assertEqual("FRAME_attak101", FRAME_attak101, 108);
assertEqual("FRAME_death11", FRAME_death11, 200);
assertEqual("FRAME_duck08", FRAME_duck08, 208);
assertEqual("MODEL_SCALE", MODEL_SCALE, 1.15);

verifyAllHeaderMacros();

console.log("quake2-m-gunner-header: ok");

function verifyAllHeaderMacros(): void {
  const source = readFileSync(HEADER_PATH, "utf8");
  const definitions = Array.from(
    source.matchAll(/^#define\s+([A-Za-z0-9_]+)\s+([0-9.]+)/gm),
    (match) => [match[1], Number(match[2])] as const
  );

  assert.equal(definitions.length, 210, "m_gunner.h macro count");

  for (const [name, expected] of definitions) {
    assert.equal(
      (gunnerHeader as Record<string, unknown>)[name],
      expected,
      `${name} should match Quake-2-master/game/m_gunner.h`
    );
  }
}
