/**
 * File: quake2-g-utils-source-parity.ts
 * Purpose: Verify source/TS RNG parity for `game/g_utils.c` while validating
 * `g_local.h` random/crandom macro consumers.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for `packages/game/src/g_utils.ts`.
 */

import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";

const source = readFileSync("Quake-2-master/game/g_utils.c", "utf8");
const tsSource = readFileSync("packages/game/src/g_utils.ts", "utf8");
const sourceWithoutComments = stripComments(source);
const tsWithoutComments = stripComments(tsSource);

const pickTargetSource = getFunctionBlock(sourceWithoutComments, "G_PickTarget");
const pickTargetTs = getTsFunctionBlock(tsWithoutComments, "G_PickTarget");

assert.doesNotMatch(sourceWithoutComments, /\brandom\s*\(/, "g_utils.c must not have active random() macro consumers");
assert.doesNotMatch(sourceWithoutComments, /\bcrandom\s*\(/, "g_utils.c must not have active crandom() macro consumers");
assert.match(pickTargetSource, /return\s+choice\s*\[\s*rand\s*\(\s*\)\s*%\s*num_choices\s*\]\s*;/, "G_PickTarget C should use integer rand() % num_choices");
assert.doesNotMatch(tsWithoutComments, /from\s+"\.\/g_local\.js"/, "g_utils.ts should not import g_local random helpers for integer rand() use");
assert.doesNotMatch(pickTargetTs, /(?:^|[^\w.])random\s*\(/, "G_PickTarget TS should not call g_local.random()");
assert.doesNotMatch(pickTargetTs, /\bcrandom\s*\(/, "G_PickTarget TS should not call g_local.crandom()");
assert.match(pickTargetTs, /Math\.floor\s*\(\s*Math\.random\s*\(\s*\)\s*\*\s*choices\.length\s*\)/, "G_PickTarget TS should choose a bounded integer index");
assert.ok(
  tsSource.includes("integer") &&
    tsSource.includes("RNG use") &&
    tsSource.includes("not the `g_local.h` floating `random()`/`crandom()` macros"),
  "G_PickTarget header should document the rand() vs macro distinction"
);

function stripComments(input: string): string {
  return input
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");
}

function getFunctionBlock(input: string, name: string): string {
  const pattern = new RegExp(`\\b[\\w_\\*\\s]+\\b${name}\\s*\\([^)]*\\)\\s*\\{`);
  const match = pattern.exec(input);
  assert.ok(match, `${name} C function not found`);
  return readBalancedBlock(input, match.index + match[0].lastIndexOf("{"));
}

function getTsFunctionBlock(input: string, name: string): string {
  const pattern = new RegExp(`export\\s+function\\s+${name}\\s*\\([^)]*\\)\\s*[:\\w\\s\\|<>]*\\{`);
  const match = pattern.exec(input);
  assert.ok(match, `${name} TS function not found`);
  return readBalancedBlock(input, match.index + match[0].lastIndexOf("{"));
}

function readBalancedBlock(input: string, openBraceIndex: number): string {
  let depth = 0;
  for (let index = openBraceIndex; index < input.length; index += 1) {
    const char = input[index];
    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return input.slice(openBraceIndex, index + 1);
      }
    }
  }
  throw new Error("Unterminated function block");
}
