/**
 * File: quake2-m-mutant-source-parity.ts
 * Purpose: Verify `packages/game/src/m_mutant.ts` directly against `Quake-2-master/game/m_mutant.c`.
 *
 * This file is not a direct source port.
 * It is a source-parity harness that keeps the TypeScript mutant move tables aligned with the original C file.
 *
 * Dependencies:
 * - Quake-2-master/game/m_mutant.c
 * - packages/game/src/m_mutant.ts
 */

import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  createGameRuntimeFromBspEntities,
  createRuntimeEntity,
  type GameMonsterMove
} from "../../packages/game/src/index.js";
import * as mutant from "../../packages/game/src/m_mutant.js";

const SOURCE_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../Quake-2-master/game/m_mutant.c"
);
const TS_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../packages/game/src/m_mutant.ts"
);

const source = readFileSync(SOURCE_PATH, "utf8");
const tsSource = readFileSync(TS_PATH, "utf8");
const sourceWithoutComments = stripComments(source);

main();

function main(): void {
  verifySourceFunctionsAreExported();
  verifySourceMoveTables();
  verifySourcePrecacheAssets();
  verifyRandomMacroConsumersUseGLocalRandom();

  console.log("quake2-m-mutant-source-parity: ok");
}

function verifySourceFunctionsAreExported(): void {
  const sourceFunctions = parseSourceFunctionNames(sourceWithoutComments);

  for (const functionName of sourceFunctions) {
    assert.notEqual(
      (mutant as Record<string, unknown>)[functionName],
      undefined,
      `${functionName} should be exported by m_mutant.ts`
    );
  }
}

function verifySourceMoveTables(): void {
  const framesByName = parseFrameTables(sourceWithoutComments);
  const movesByName = parseMoves(sourceWithoutComments);

  for (const [moveName, sourceMove] of movesByName) {
    const tsMove = getExport<GameMonsterMove>(moveName);
    const sourceFrames = framesByName.get(sourceMove.frameTable);
    assert.ok(sourceFrames, `${sourceMove.frameTable} should be present in source`);

    assert.equal(tsMove.firstframe, getFrameConstant(sourceMove.firstframe), `${moveName}: firstframe`);
    assert.equal(tsMove.lastframe, getFrameConstant(sourceMove.lastframe), `${moveName}: lastframe`);
    assert.equal(tsMove.endfunc?.name, sourceMove.endfunc, `${moveName}: endfunc`);
    assert.equal(tsMove.frame.length, sourceFrames.length, `${moveName}: frame length`);

    for (const [index, sourceFrame] of sourceFrames.entries()) {
      const tsFrame = tsMove.frame[index];
      assert.equal(tsFrame.aifunc?.name, sourceFrame.aifunc, `${moveName}: aifunc ${index}`);
      assert.equal(tsFrame.dist, sourceFrame.dist, `${moveName}: dist ${index}`);
      assert.equal(tsFrame.thinkfunc?.name, sourceFrame.thinkfunc, `${moveName}: thinkfunc ${index}`);
    }
  }
}

function verifySourcePrecacheAssets(): void {
  const spawnBlock = getFunctionBlock("SP_monster_mutant");
  const sourceSounds = Array.from(spawnBlock.matchAll(/gi\.soundindex\s*\(\s*"([^"]+)"\s*\)/g), (match) => match[1]);
  const sourceModel = spawnBlock.match(/gi\.modelindex\s*\(\s*"([^"]+)"\s*\)/)?.[1];

  const runtime = createGameRuntimeFromBspEntities([{ properties: { classname: "worldspawn" } }]);
  const entity = createRuntimeEntity({ classname: "monster_mutant" }, 1);
  runtime.entities[1] = entity;

  mutant.SP_monster_mutant(entity, runtime);

  assert.deepEqual(runtime.assets.soundPaths, sourceSounds, "SP_monster_mutant sound precache order");
  assert.equal(runtime.assets.modelPaths[entity.s.modelindex - 1], sourceModel, "SP_monster_mutant model precache");
}

function verifyRandomMacroConsumersUseGLocalRandom(): void {
  const macroConsumers = [
    "mutant_idle_loop",
    "mutant_check_refire",
    "mutant_jump_touch",
    "mutant_check_jump",
    "mutant_pain",
    "mutant_die"
  ];

  for (const functionName of macroConsumers) {
    assert.match(getFunctionBlock(functionName), /\brandom\s*\(/, `${functionName}: C should use random()`);
    const tsBlock = getTsFunctionBlock(functionName);
    assert.match(tsBlock, /\brandom\s*\(/, `${functionName}: TS should use g_local.random()`);
    assert.doesNotMatch(tsBlock, /Math\.random\s*\(/, `${functionName}: TS should not use Math.random() for C random()`);
  }

  assert.match(getFunctionBlock("mutant_hit_left"), /\brand\s*\(\)\s*%\s*5/, "mutant_hit_left should use rand()%5");
  assert.match(getFunctionBlock("mutant_hit_right"), /\brand\s*\(\)\s*%\s*5/, "mutant_hit_right should use rand()%5");
  assert.match(getTsFunctionBlock("mutant_hit_left"), /randomInt\s*\(\s*5\s*\)/, "mutant_hit_left should keep integer RNG helper");
  assert.match(getTsFunctionBlock("mutant_hit_right"), /randomInt\s*\(\s*5\s*\)/, "mutant_hit_right should keep integer RNG helper");
  assert.doesNotMatch(sourceWithoutComments, /\bcrandom\s*\(/, "m_mutant.c should not consume crandom()");
}

interface SourceFrame {
  aifunc: string;
  dist: number;
  thinkfunc: string | undefined;
}

interface SourceMove {
  firstframe: string;
  lastframe: string;
  frameTable: string;
  endfunc: string | undefined;
}

function parseFrameTables(cSource: string): Map<string, SourceFrame[]> {
  const tables = new Map<string, SourceFrame[]>();
  const tableRegex = /mframe_t\s+(\w+)\s*\[\]\s*=\s*\{([\s\S]*?)\};/g;

  for (const match of cSource.matchAll(tableRegex)) {
    const name = match[1];
    const body = match[2];
    const frames: SourceFrame[] = [];
    const frameRegex = /(ai_\w+)\s*,\s*([A-Za-z0-9_.+-]+)\s*,\s*(NULL|\w+)/g;

    for (const frameMatch of body.matchAll(frameRegex)) {
      frames.push({
        aifunc: frameMatch[1],
        dist: parseDistance(frameMatch[2]),
        thinkfunc: frameMatch[3] === "NULL" ? undefined : frameMatch[3]
      });
    }

    tables.set(name, frames);
  }

  return tables;
}

function parseMoves(cSource: string): Map<string, SourceMove> {
  const moves = new Map<string, SourceMove>();
  const moveRegex = /mmove_t\s+(\w+)\s*=\s*\{\s*(\w+)\s*,\s*(\w+)\s*,\s*(\w+)\s*,\s*(NULL|\w+)\s*\};/g;

  for (const match of cSource.matchAll(moveRegex)) {
    moves.set(match[1], {
      firstframe: match[2],
      lastframe: match[3],
      frameTable: match[4],
      endfunc: match[5] === "NULL" ? undefined : match[5]
    });
  }

  return moves;
}

function getFunctionBlock(functionName: string): string {
  const startMatch = new RegExp(`\\b(?:void|qboolean)\\s+${functionName}\\s*\\(`).exec(source);
  assert.ok(startMatch, `${functionName} should exist in source`);

  const bodyStart = source.indexOf("{", startMatch.index);
  assert.notEqual(bodyStart, -1, `${functionName} should have a body`);

  let depth = 0;
  for (let i = bodyStart; i < source.length; i += 1) {
    const char = source[i];
    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return source.slice(bodyStart, i + 1);
      }
    }
  }

  throw new Error(`${functionName} body was not closed`);
}

function getTsFunctionBlock(functionName: string): string {
  const startMatch = new RegExp(`\\bexport\\s+function\\s+${functionName}\\s*\\(`).exec(tsSource);
  assert.ok(startMatch, `${functionName} should exist in TypeScript`);

  const bodyStart = tsSource.indexOf("{", startMatch.index);
  assert.notEqual(bodyStart, -1, `${functionName} should have a body`);

  let depth = 0;
  for (let i = bodyStart; i < tsSource.length; i += 1) {
    const char = tsSource[i];
    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return tsSource.slice(bodyStart, i + 1);
      }
    }
  }

  throw new Error(`${functionName} TypeScript body was not closed`);
}

function getFrameConstant(name: string): number {
  return getExport<number>(name);
}

function getExport<T>(name: string): T {
  const value = (mutant as Record<string, unknown>)[name];
  assert.notEqual(value, undefined, `${name} should be exported by m_mutant.ts`);
  return value as T;
}

function parseDistance(token: string): number {
  const value = Number(token);
  assert.ok(Number.isFinite(value), `Unsupported distance token ${token}`);
  return value;
}

function parseSourceFunctionNames(cSource: string): string[] {
  return Array.from(cSource.matchAll(/\b(?:void|qboolean)\s+(\w+)\s*\([^;]*\)\s*\{/g), (match) => match[1]);
}

function stripComments(value: string): string {
  return value
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");
}
