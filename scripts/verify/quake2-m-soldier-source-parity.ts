/**
 * File: quake2-m-soldier-source-parity.ts
 * Purpose: Verify `packages/game/src/m_soldier.ts` directly against `Quake-2-master/game/m_soldier.c`.
 *
 * This file is not a direct source port.
 * It is a source-parity harness that keeps the TypeScript soldier move tables aligned with the original C file.
 *
 * Dependencies:
 * - Quake-2-master/game/m_soldier.c
 * - packages/game/src/m_soldier.ts
 */

import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  createGameRuntimeFromBspEntities,
  createRuntimeEntity
} from "../../packages/game/src/index.js";
import type { GameMonsterMove } from "../../packages/game/src/runtime.js";
import * as soldier from "../../packages/game/src/m_soldier.js";

const SOURCE_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../Quake-2-master/game/m_soldier.c"
);

const source = readFileSync(SOURCE_PATH, "utf8");
const sourceWithoutComments = stripDisabledBlocks(stripComments(source));

main();

function main(): void {
  verifySourceFunctionsAreExported();
  verifySourceMoveTables();
  verifySourcePrecacheAssets();
  verifyRandomMacroConsumers();

  console.log("quake2-m-soldier-source-parity: ok");
}

function verifySourceFunctionsAreExported(): void {
  const sourceFunctions = parseSourceFunctionNames(sourceWithoutComments);

  for (const functionName of sourceFunctions) {
    assert.notEqual(
      (soldier as Record<string, unknown>)[functionName],
      undefined,
      `${functionName} should be exported by m_soldier.ts`
    );
  }
}

function verifySourceMoveTables(): void {
  const framesByName = parseFrameTables(sourceWithoutComments);
  const movesByName = parseMoves(sourceWithoutComments);

  for (const [moveName, sourceMove] of movesByName) {
    const tsMove = getExport<GameMonsterMove>(moveName);
    const sourceFrames = framesByName.get(sourceMove.frameTable);
    if (!sourceFrames) {
      throw new Error(`${sourceMove.frameTable} should be present in source`);
    }

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
  const lightBlock = getFunctionBlock("SP_monster_soldier_light");
  const soldierBlock = getFunctionBlock("SP_monster_soldier");
  const ssBlock = getFunctionBlock("SP_monster_soldier_ss");

  assertSpawnAssets("monster_soldier_light", soldier.SP_monster_soldier_light, lightBlock);
  assertSpawnAssets("monster_soldier", soldier.SP_monster_soldier, soldierBlock);
  assertSpawnAssets("monster_soldier_ss", soldier.SP_monster_soldier_ss, ssBlock);
}

function verifyRandomMacroConsumers(): void {
  const sourceRandomConsumers = [
    "soldier_idle",
    "soldier_stand",
    "soldier_walk1_random",
    "soldier_walk",
    "soldier_pain",
    "soldier_attack1_refire1",
    "soldier_attack1_refire2",
    "soldier_attack2_refire1",
    "soldier_attack2_refire2",
    "soldier_attack",
    "soldier_sight",
    "soldier_dodge"
  ];
  const sourceCrandomConsumers = ["soldier_fire"];

  for (const functionName of sourceRandomConsumers) {
    assert.match(getFunctionBlock(functionName), /\brandom\s*\(/, `${functionName} should consume source random()`);
    const tsFunction = getTsFunctionBlock(functionName);
    assert.match(tsFunction, /\brandom\s*\(/, `${functionName} should consume g_local.random()`);
    assert.doesNotMatch(tsFunction, /Math\.random\s*\(/, `${functionName} must not call Math.random() directly`);
  }

  for (const functionName of sourceCrandomConsumers) {
    assert.match(getFunctionBlock(functionName), /\bcrandom\s*\(/, `${functionName} should consume source crandom()`);
    const tsFunction = getTsFunctionBlock(functionName);
    assert.match(tsFunction, /\bcrandom\s*\(/, `${functionName} should consume g_local.crandom()`);
    assert.doesNotMatch(tsFunction, /Math\.random\s*\(/, `${functionName} must not call Math.random() directly`);
  }

  assert.match(getFunctionBlock("soldier_fire"), /rand\s*\(\)\s*%\s*8/, "soldier_fire should keep integer rand() source usage");
  assert.match(getTsFunctionBlock("soldier_fire"), /randomInt\s*\(\s*8\s*\)/, "soldier_fire should keep integer randomInt for rand()%8");
  assert.match(getFunctionBlock("soldier_die"), /rand\s*\(\)\s*%\s*5/, "soldier_die should keep integer rand() source usage");
  assert.match(getTsFunctionBlock("soldier_die"), /randomInt\s*\(\s*5\s*\)/, "soldier_die should keep integer randomInt for rand()%5");
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
  const declaration = new RegExp(`\\bvoid\\s+${functionName}\\s*\\([^;]*?\\)\\s*\\{`).exec(sourceWithoutComments);
  if (!declaration) {
    throw new Error(`${functionName} should exist in source`);
  }
  const bodyStart = sourceWithoutComments.indexOf("{", declaration.index);

  let depth = 0;
  for (let i = bodyStart; i < sourceWithoutComments.length; i += 1) {
    const char = sourceWithoutComments[i];
    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return sourceWithoutComments.slice(bodyStart, i + 1);
      }
    }
  }

  throw new Error(`${functionName} body was not closed`);
}

function getTsFunctionBlock(functionName: string): string {
  const tsPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../packages/game/src/m_soldier.ts");
  const tsSource = readFileSync(tsPath, "utf8");
  const declaration = new RegExp(`\\bexport\\s+function\\s+${functionName}\\s*\\(`).exec(tsSource);
  assert.ok(declaration, `${functionName} should exist in m_soldier.ts`);

  const bodyStart = tsSource.indexOf("{", declaration.index);
  assert.notEqual(bodyStart, -1, `${functionName} should have a TS body`);

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

  throw new Error(`${functionName} TS body was not closed`);
}

function assertSpawnAssets(
  classname: string,
  spawn: (entity: ReturnType<typeof createRuntimeEntity>, runtime: ReturnType<typeof createGameRuntimeFromBspEntities>) => void,
  sourceBlock: string
): void {
  const sourceSounds = [
    ...Array.from(getFunctionBlock("SP_monster_soldier_x").matchAll(/gi\.soundindex\s*\(\s*"([^"]+)"\s*\)/g), (match) => match[1]),
    ...Array.from(sourceBlock.matchAll(/gi\.soundindex\s*\(\s*"([^"]+)"\s*\)/g), (match) => match[1])
  ];
  const sourceModels = [
    ...Array.from(getFunctionBlock("SP_monster_soldier_x").matchAll(/gi\.modelindex\s*\(\s*"([^"]+)"\s*\)/g), (match) => match[1]),
    ...Array.from(sourceBlock.matchAll(/gi\.modelindex\s*\(\s*"([^"]+)"\s*\)/g), (match) => match[1])
  ];

  const runtime = createGameRuntimeFromBspEntities([{ properties: { classname: "worldspawn" } }]);
  const entity = createRuntimeEntity({ classname }, 1);
  runtime.entities[1] = entity;

  spawn(entity, runtime);

  assert.deepEqual(runtime.assets.soundPaths, sourceSounds, `${classname} sound precache order`);
  for (const model of sourceModels) {
    assert.ok(runtime.assets.modelIndexByPath.has(model), `${classname} should precache ${model}`);
  }
}

function getFrameConstant(name: string): number {
  return getExport<number>(name);
}

function getExport<T>(name: string): T {
  const value = (soldier as Record<string, unknown>)[name];
  assert.notEqual(value, undefined, `${name} should be exported by m_soldier.ts`);
  return value as T;
}

function parseDistance(token: string): number {
  const value = Number(token);
  assert.ok(Number.isFinite(value), `Unsupported distance token ${token}`);
  return value;
}

function parseSourceFunctionNames(cSource: string): string[] {
  return Array.from(cSource.matchAll(/\bvoid\s+(\w+)\s*\([^;]*\)\s*\{/g), (match) => match[1]);
}

function stripComments(value: string): string {
  return value
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");
}

function stripDisabledBlocks(value: string): string {
  return value.replace(/#if\s+0[\s\S]*?#endif/g, "");
}
