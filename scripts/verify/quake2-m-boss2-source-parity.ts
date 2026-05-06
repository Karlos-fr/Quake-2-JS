/**
 * File: quake2-m-boss2-source-parity.ts
 * Purpose: Verify `packages/game/src/m_boss2.ts` directly against `Quake-2-master/game/m_boss2.c`.
 *
 * This file is not a direct source port.
 * It is a source-parity harness that keeps the TypeScript monster tables aligned with the original C file.
 *
 * Dependencies:
 * - Quake-2-master/game/m_boss2.c
 * - packages/game/src/m_boss2.ts
 */

import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createGameRuntimeFromBspEntities, createRuntimeEntity, type GameMonsterMove } from "../../packages/game/src/index.js";
import * as boss2 from "../../packages/game/src/m_boss2.js";

const SOURCE_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../Quake-2-master/game/m_boss2.c");
const source = readFileSync(SOURCE_PATH, "utf8");
const sourceWithoutComments = stripComments(source);

main();

function main(): void {
  verifySourceFunctionsAreExported();
  verifySourceMoveTables();
  verifySourcePrecacheAssets();
  verifyRandomMacroConsumers();

  console.log("quake2-m-boss2-source-parity: ok");
}

function verifySourceFunctionsAreExported(): void {
  const sourceFunctions = parseSourceFunctionNames(sourceWithoutComments);

  for (const functionName of sourceFunctions) {
    assert.notEqual((boss2 as Record<string, unknown>)[functionName], undefined, `${functionName} should be exported by m_boss2.ts`);
  }
}

function verifySourceMoveTables(): void {
  const framesByName = parseFrameTables(sourceWithoutComments);
  const movesByName = parseMoves(sourceWithoutComments);

  for (const [moveName, sourceMove] of movesByName) {
    const tsMove = getExport<GameMonsterMove>(moveName);
    const sourceFrames = framesByName.get(sourceMove.frameTable);
    assert.ok(sourceFrames, `${sourceMove.frameTable} should be present in source`);

    assert.equal(tsMove.firstframe, getExport<number>(sourceMove.firstframe), `${moveName}: firstframe`);
    assert.equal(tsMove.lastframe, getExport<number>(sourceMove.lastframe), `${moveName}: lastframe`);
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
  const spawnBlock = getFunctionBlock("SP_monster_boss2", sourceWithoutComments);
  const sourceSounds = Array.from(spawnBlock.matchAll(/gi\.soundindex\s*\(\s*"([^"]+)"\s*\)/g), (match) => match[1]);
  const sourceModel = spawnBlock.match(/gi\.modelindex\s*\(\s*"([^"]+)"\s*\)/)?.[1];

  const runtime = createGameRuntimeFromBspEntities([{ properties: { classname: "worldspawn" } }]);
  const entity = createRuntimeEntity({ classname: "monster_boss2" }, 1);
  runtime.entities[1] = entity;

  boss2.SP_monster_boss2(entity, runtime);

  assert.deepEqual(runtime.assets.soundPaths, sourceSounds, "SP_monster_boss2 sound precache order");
  assert.equal(runtime.assets.modelPaths[entity.s.modelindex - 1], sourceModel, "SP_monster_boss2 model precache");
}

function verifyRandomMacroConsumers(): void {
  for (const [functionName, sourcePattern, tsPattern] of [
    ["boss2_search", /\brandom\s*\(\s*\)\s*<\s*0\.5/, /\brandom\s*\(\s*\)\s*<\s*0\.5/],
    ["boss2_attack", /\brandom\s*\(\s*\)\s*<=\s*0\.6/, /\brandom\s*\(\s*\)\s*<=\s*0\.6/],
    ["boss2_reattack_mg", /\brandom\s*\(\s*\)\s*<=\s*0\.7/, /\brandom\s*\(\s*\)\s*<=\s*0\.7/],
    ["Boss2_CheckAttack", /\brandom\s*\(\s*\)\s*<\s*chance/, /\brandom\s*\(\s*\)\s*<\s*chance/]
  ] as const) {
    const sourceFunction = getFunctionBlock(functionName, sourceWithoutComments);
    const tsFunction = getTsFunctionBlock(functionName);
    assert.match(sourceFunction, sourcePattern, `${functionName} source should consume random() macro`);
    assert.match(tsFunction, tsPattern, `${functionName} TS should consume g_local.random()`);
    assert.doesNotMatch(tsFunction, /Math\.random\s*\(/, `${functionName} TS should not call Math.random() directly`);
  }

  const checkAttackTs = getTsFunctionBlock("Boss2_CheckAttack");
  assert.match(checkAttackTs, /2\s*\*\s*random\s*\(\s*\)/, "Boss2_CheckAttack TS should use g_local.random() for attack_finished");
  assert.match(checkAttackTs, /random\s*\(\s*\)\s*<\s*0\.3/, "Boss2_CheckAttack TS should use g_local.random() for fly slide choice");
  assert.doesNotMatch(sourceWithoutComments, /\bcrandom\s*\(/, "m_boss2.c should not consume crandom()");
}

interface SourceFrame {
  aifunc: string | undefined;
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
    const frames: SourceFrame[] = [];
    const frameRegex = /(NULL|ai_\w+)\s*,\s*([A-Za-z0-9_.+-]+)\s*,\s*(NULL|\w+)/g;

    for (const frameMatch of match[2].matchAll(frameRegex)) {
      frames.push({
        aifunc: frameMatch[1] === "NULL" ? undefined : frameMatch[1],
        dist: parseDistance(frameMatch[2]),
        thinkfunc: frameMatch[3] === "NULL" ? undefined : frameMatch[3]
      });
    }

    tables.set(match[1], frames);
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

function getFunctionBlock(functionName: string, cSource: string): string {
  const start = cSource.search(new RegExp(`\\b(?:void|qboolean)\\s+${functionName}\\s*\\([^;{]*\\)\\s*\\{`));
  assert.notEqual(start, -1, `${functionName} should exist in source`);
  const bodyStart = cSource.indexOf("{", start);
  assert.notEqual(bodyStart, -1, `${functionName} should have a body`);

  let depth = 0;
  for (let i = bodyStart; i < cSource.length; i += 1) {
    if (cSource[i] === "{") {
      depth += 1;
    } else if (cSource[i] === "}") {
      depth -= 1;
      if (depth === 0) {
        return cSource.slice(bodyStart, i + 1);
      }
    }
  }

  throw new Error(`${functionName} body was not closed`);
}

function getTsFunctionBlock(functionName: string): string {
  const tsSource = readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../packages/game/src/m_boss2.ts"), "utf8");
  const tsWithoutComments = stripComments(tsSource);
  const start = tsWithoutComments.search(new RegExp(`\\b(?:export\\s+)?function\\s+${functionName}\\s*\\(`));
  assert.notEqual(start, -1, `${functionName} should exist in m_boss2.ts`);
  const bodyStart = tsWithoutComments.indexOf("{", start);
  assert.notEqual(bodyStart, -1, `${functionName} should have a TS body`);

  let depth = 0;
  for (let i = bodyStart; i < tsWithoutComments.length; i += 1) {
    if (tsWithoutComments[i] === "{") {
      depth += 1;
    } else if (tsWithoutComments[i] === "}") {
      depth -= 1;
      if (depth === 0) {
        return tsWithoutComments.slice(bodyStart, i + 1);
      }
    }
  }

  throw new Error(`${functionName} TS body was not closed`);
}

function getExport<T>(name: string): T {
  const value = (boss2 as Record<string, unknown>)[name];
  assert.notEqual(value, undefined, `${name} should be exported by m_boss2.ts`);
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
