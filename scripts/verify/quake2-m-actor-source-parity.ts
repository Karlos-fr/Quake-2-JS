/**
 * File: quake2-m-actor-source-parity.ts
 * Purpose: Verify `packages/game/src/m_actor.ts` RNG usage directly against `Quake-2-master/game/m_actor.c`.
 *
 * This file is not a direct source port.
 * It is a source-parity harness for the `g_local.h` random/crandom macro consumer audit.
 *
 * Dependencies:
 * - Quake-2-master/game/m_actor.c
 * - packages/game/src/m_actor.ts
 */

import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const VERIFY_DIR = path.dirname(fileURLToPath(import.meta.url));
const SOURCE_PATH = path.resolve(VERIFY_DIR, "../../Quake-2-master/game/m_actor.c");
const TS_PATH = path.resolve(VERIFY_DIR, "../../packages/game/src/m_actor.ts");

const source = readFileSync(SOURCE_PATH, "utf8");
const tsSource = readFileSync(TS_PATH, "utf8");
const sourceWithoutComments = stripComments(source);
const tsWithoutComments = stripComments(tsSource);

const actorPainSource = getFunctionBlock(sourceWithoutComments, "actor_pain", /void\s+actor_pain\s*\(/);
const actorPainTs = getFunctionBlock(tsWithoutComments, "actor_pain", /export\s+function\s+actor_pain\s*\(/);

assert.match(actorPainSource, /\brandom\s*\(\s*\)\s*<\s*0\.4/, "actor_pain source should use random() for the client taunt branch");
assert.match(actorPainSource, /\brandom\s*\(\s*\)\s*<\s*0\.5/, "actor_pain source should use random() for flipoff/taunt selection");
assert.match(actorPainTs, /\brandom\s*\(\s*\)\s*<\s*0\.4/, "actor_pain TS should use g_local.random() for the client taunt branch");
assert.match(actorPainTs, /\brandom\s*\(\s*\)\s*<\s*0\.5/, "actor_pain TS should use g_local.random() for flipoff/taunt selection");
assert.doesNotMatch(actorPainTs, /Math\.random\s*\(/, "actor_pain TS should not call Math.random() directly for C random() macros");

for (const [functionName, sourcePattern, tsPattern] of [
  ["actor_stand", /rand\s*\(\s*\)\s*%/, /randomInt\s*\(/],
  ["actor_pain", /rand\s*\(\s*\)\s*%\s*3/, /randomInt\s*\(\s*3\s*\)/],
  ["actor_die", /rand\s*\(\s*\)\s*%\s*2/, /randomInt\s*\(\s*2\s*\)/],
  ["actor_attack", /rand\s*\(\s*\)\s*&\s*15/, /randomInt\s*\(/]
] as const) {
  assert.match(getFunctionBlock(sourceWithoutComments, functionName), sourcePattern, `${functionName} source should keep integer rand() usage`);
  assert.match(getFunctionBlock(tsWithoutComments, functionName), tsPattern, `${functionName} TS should keep integer RNG on randomInt`);
}

assert.doesNotMatch(sourceWithoutComments, /\bcrandom\s*\(/, "m_actor.c should not consume crandom()");
assert.match(tsSource, /from\s+"\.\/g_local\.js";/, "m_actor.ts should import g_local symbols including random");
assert.match(tsSource, /Uses the shared `g_local\.random\(\)` helper/, "actor_pain header should document the macro random helper");

console.log("quake2-m-actor-source-parity: ok");

function getFunctionBlock(sourceText: string, functionName: string, signaturePattern?: RegExp): string {
  const start = sourceText.search(signaturePattern ?? new RegExp(`\\b${functionName}\\s*\\(`));
  assert.notEqual(start, -1, `${functionName} should exist`);

  const bodyStart = sourceText.indexOf("{", start);
  assert.notEqual(bodyStart, -1, `${functionName} should have a body`);

  let depth = 0;
  for (let i = bodyStart; i < sourceText.length; i += 1) {
    if (sourceText[i] === "{") {
      depth += 1;
    } else if (sourceText[i] === "}") {
      depth -= 1;
      if (depth === 0) {
        return sourceText.slice(bodyStart, i + 1);
      }
    }
  }

  throw new Error(`${functionName} body was not closed`);
}

function stripComments(value: string): string {
  return value
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");
}
