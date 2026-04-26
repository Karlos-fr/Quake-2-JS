/**
 * File: quake2-entities-phase8.ts
 * Purpose: Verify the original Quake II world-object animation rhythms already ported from `g_misc.c` and the pickup visual effect flags emitted by `g_items.c`.
 *
 * This file is not a direct source port.
 * It is a verification harness for phase 8 of the visible-entities plan.
 *
 * Dependencies:
 * - packages/game
 * - packages/qcommon
 */

import {
  FRAMETIME,
  FindItemByClassname,
  SP_misc_banner,
  SP_misc_blackhole,
  SP_misc_easterchick,
  SP_misc_easterchick2,
  SP_misc_eastertank,
  SP_monster_commander_body,
  SpawnItem,
  createGameRuntimeFromBspEntities,
  runPendingThinks,
  spawnGameEntity,
  useGameEntity
} from "../../packages/game/src/index.js";
import { EF_ROTATE, RF_GLOW } from "../../packages/qcommon/src/index.js";
import { MOVETYPE_TOSS } from "../../packages/game/src/index.js";
import type { GameEntity, GameRuntime } from "../../packages/game/src/index.js";

main();

/**
 * Category: New
 * Purpose: Execute the phase-8 animation and pickup-flag checks over deterministic local gameplay entities.
 */
function main(): void {
  verifyBannerLoop();
  verifyBlackholeLoop();
  verifyEasterLoops();
  verifyCommanderBodySequence();
  verifyPickupVisualFlags();

  console.log("Verification phase 8 - world-object animation rhythms OK");
}

/**
 * Category: New
 * Purpose: Verify the `misc_banner` frame loop exactly matches the original modulo-16 progression.
 */
function verifyBannerLoop(): void {
  const runtime = createHarnessRuntime();
  const entity = spawnGameEntity(runtime);
  entity.classname = "misc_banner";
  SP_misc_banner(entity, runtime);
  entity.s.frame = 15;
  entity.nextthink = runtime.time + FRAMETIME;

  runPendingThinks(runtime, runtime.time + FRAMETIME);
  assertNumber(entity.s.frame, 0, "misc_banner wraps to frame 0");

  runPendingThinks(runtime, runtime.time + FRAMETIME);
  assertNumber(entity.s.frame, 1, "misc_banner advances to frame 1");
}

/**
 * Category: New
 * Purpose: Verify the `misc_blackhole` frame loop covers 0..18 then wraps to 0.
 */
function verifyBlackholeLoop(): void {
  const runtime = createHarnessRuntime();
  const entity = spawnGameEntity(runtime);
  entity.classname = "misc_blackhole";
  SP_misc_blackhole(entity, runtime);
  entity.s.frame = 18;
  entity.nextthink = runtime.time + FRAMETIME;

  runPendingThinks(runtime, runtime.time + FRAMETIME);
  assertNumber(entity.s.frame, 0, "misc_blackhole wraps to frame 0");
}

/**
 * Category: New
 * Purpose: Verify the original easter-model frame ranges from `g_misc.c` are preserved.
 */
function verifyEasterLoops(): void {
  verifyLoopRange("misc_eastertank", SP_misc_eastertank, 292, 254);
  verifyLoopRange("misc_easterchick", SP_misc_easterchick, 246, 208);
  verifyLoopRange("misc_easterchick2", SP_misc_easterchick2, 286, 248);
}

/**
 * Category: New
 * Purpose: Verify the commander's body keeps the original drop-then-use animation sequencing.
 */
function verifyCommanderBodySequence(): void {
  const runtime = createHarnessRuntime();
  const entity = spawnGameEntity(runtime);
  entity.classname = "monster_commander_body";
  entity.origin = [10, 20, 30];
  SP_monster_commander_body(entity, runtime);

  runPendingThinks(runtime, runtime.time + 5 * FRAMETIME);
  assertNumber(entity.movetype, MOVETYPE_TOSS, "monster_commander_body switches to MOVETYPE_TOSS");
  assertNumber(entity.origin[2], 32, "monster_commander_body drop raises origin by 2");

  useGameEntity(runtime, entity, null, null);
  runPendingThinks(runtime, runtime.time + FRAMETIME);
  assertNumber(entity.s.frame, 1, "monster_commander_body animation starts at frame 1 after use");
}

/**
 * Category: New
 * Purpose: Verify pickup items preserve the original world visual flags from `g_items.c` at spawn time.
 */
function verifyPickupVisualFlags(): void {
  verifyItemFlags("item_quad", EF_ROTATE, RF_GLOW);
  verifyItemFlags("weapon_shotgun", EF_ROTATE, RF_GLOW);
  verifyItemFlags("ammo_shells", 0, RF_GLOW);
}

/**
 * Category: New
 * Purpose: Verify one looping `g_misc.c` animation wraps from its last source frame back to its first source frame.
 */
function verifyLoopRange(
  classname: string,
  spawner: (entity: GameEntity, runtime: GameRuntime) => void,
  finalFrame: number,
  restartFrame: number
): void {
  const runtime = createHarnessRuntime();
  const entity = spawnGameEntity(runtime);
  entity.classname = classname;
  spawner(entity, runtime);
  entity.s.frame = finalFrame;
  entity.nextthink = runtime.time + FRAMETIME;

  runPendingThinks(runtime, runtime.time + FRAMETIME);
  assertNumber(entity.s.frame, restartFrame, `${classname} wraps to its restart frame`);
}

/**
 * Category: New
 * Purpose: Verify one item classname preserves the original spawn-time `s.effects` and `s.renderfx` values.
 */
function verifyItemFlags(classname: string, expectedEffects: number, expectedRenderFx: number): void {
  const runtime = createHarnessRuntime();
  const entity = spawnGameEntity(runtime);
  entity.classname = classname;
  const item = FindItemByClassname(classname);
  if (!item) {
    throw new Error(`Item introuvable: ${classname}`);
  }

  SpawnItem(entity, item, runtime);
  assertNumber(entity.s.effects, expectedEffects, `${classname} s.effects`);
  assertNumber(entity.s.renderfx, expectedRenderFx, `${classname} s.renderfx`);
}

/**
 * Category: New
 * Purpose: Create the minimal runtime needed by the phase-8 harness.
 */
function createHarnessRuntime(): GameRuntime {
  return createGameRuntimeFromBspEntities([{ properties: { classname: "worldspawn" } }]);
}

/**
 * Category: New
 * Purpose: Assert one numeric equality with a readable label.
 */
function assertNumber(actual: number, expected: number, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: attendu ${expected}, recu ${actual}`);
  }
}
