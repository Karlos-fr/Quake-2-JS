/**
 * File: quake2-m-infantry-source-parity.ts
 * Purpose: Verify `packages/game/src/m_infantry.ts` directly against `Quake-2-master/game/m_infantry.c`.
 *
 * This file is not a direct source port.
 * It is a source-parity harness that keeps the TypeScript infantry move tables aligned with the original C file.
 *
 * Dependencies:
 * - Quake-2-master/game/m_infantry.c
 * - packages/game/src/m_infantry.ts
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
import * as infantry from "../../packages/game/src/m_infantry.js";

const SOURCE_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../Quake-2-master/game/m_infantry.c"
);
const TS_SOURCE_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../packages/game/src/m_infantry.ts"
);

const source = readFileSync(SOURCE_PATH, "utf8");
const sourceWithoutComments = stripComments(source);
const tsSource = readFileSync(TS_SOURCE_PATH, "utf8");

main();

function main(): void {
  verifySourceFunctionsAreExported();
  verifySourceMoveTables();
  verifySourcePrecacheAssets();
  verifySourceRandomMacroConsumers();

  console.log("quake2-m-infantry-source-parity: ok");
}

function verifySourceFunctionsAreExported(): void {
  const sourceFunctions = parseSourceFunctionNames(sourceWithoutComments);

  for (const functionName of sourceFunctions) {
    assert.notEqual(
      (infantry as Record<string, unknown>)[functionName],
      undefined,
      `${functionName} should be exported by m_infantry.ts`
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
  const spawnBlock = getFunctionBlock("SP_monster_infantry");
  const sourceSounds = Array.from(spawnBlock.matchAll(/gi\.soundindex\s*\(\s*"([^"]+)"\s*\)/g), (match) => match[1]);
  const sourceModel = spawnBlock.match(/gi\.modelindex\s*\(\s*"([^"]+)"\s*\)/)?.[1];

  const runtime = createGameRuntimeFromBspEntities([{ properties: { classname: "worldspawn" } }]);
  const entity = createRuntimeEntity({ classname: "monster_infantry" }, 1);
  runtime.entities[1] = entity;

  infantry.SP_monster_infantry(entity, runtime);

  assert.deepEqual(runtime.assets.soundPaths, sourceSounds, "SP_monster_infantry sound precache order");
  assert.equal(runtime.assets.modelPaths[entity.s.modelindex - 1], sourceModel, "SP_monster_infantry model precache");
}

function verifySourceRandomMacroConsumers(): void {
  const randomConsumers = [
    ["infantry_dodge", /random\s*\(\s*\)\s*>\s*0\.25/, /random\s*\(\s*\)\s*>\s*0\.25/]
  ] as const;
  const integerRandomConsumers = [
    ["infantry_pain", /rand\s*\(\s*\)\s*%\s*2/, /randomInt\s*\(\s*2\s*\)/],
    ["infantry_die", /rand\s*\(\s*\)\s*%\s*3/, /randomInt\s*\(\s*3\s*\)/],
    ["infantry_cock_gun", /rand\s*\(\s*\)\s*&\s*15/, /randomInt\s*\(\s*16\s*\)/],
    ["infantry_smack", /rand\s*\(\s*\)\s*%\s*5/, /randomInt\s*\(\s*5\s*\)/]
  ] as const;

  assert.match(tsSource, /import\s*\{[\s\S]*\brandom\b[\s\S]*\}\s*from\s+"\.\/g_local\.js"/, "m_infantry.ts should import g_local.random");

  for (const [functionName, sourcePattern, tsPattern] of randomConsumers) {
    assert.match(getFunctionBlock(functionName), sourcePattern, `${functionName}: source should consume random macro`);
    assert.match(getTsFunctionBlock(functionName), tsPattern, `${functionName}: TS should consume g_local.random helper`);
    assert.doesNotMatch(getTsFunctionBlock(functionName), /Math\.random\s*\(/, `${functionName}: TS should not call Math.random directly`);
  }

  for (const [functionName, sourcePattern, tsPattern] of integerRandomConsumers) {
    assert.match(getFunctionBlock(functionName), sourcePattern, `${functionName}: source should consume C integer rand form`);
    assert.match(getTsFunctionBlock(functionName), tsPattern, `${functionName}: TS should keep integer rand form on randomInt`);
  }
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
  const start = source.indexOf(`void ${functionName}`);
  assert.notEqual(start, -1, `${functionName} should exist in source`);

  const bodyStart = source.indexOf("{", start);
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
  const start = tsSource.search(new RegExp(`(?:export\\s+)?function\\s+${functionName}\\s*\\(`));
  assert.notEqual(start, -1, `${functionName} should exist in TS source`);

  const bodyStart = tsSource.indexOf("{", start);
  assert.notEqual(bodyStart, -1, `${functionName} TS body should exist`);

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

function getFrameConstant(name: string): number {
  return getExport<number>(name);
}

function getExport<T>(name: string): T {
  const value = (infantry as Record<string, unknown>)[name];
  assert.notEqual(value, undefined, `${name} should be exported by m_infantry.ts`);
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
