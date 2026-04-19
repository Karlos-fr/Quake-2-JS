/**
 * File: quake2-collision-phase7.ts
 * Purpose: Verify trigger dispatch behavior through the stricter `G_TouchTriggers` and `G_TouchSolids` ports.
 *
 * This file is not a direct source port.
 * It is a verification harness for phase 7 of the collision plan.
 *
 * Dependencies:
 * - packages/game
 */

import {
  G_TouchSolids,
  G_TouchTriggers,
  SOLID_BSP,
  SOLID_NOT,
  SOLID_TRIGGER,
  SVF_MONSTER,
  Touch_Multi,
  createGameRuntimeFromBspEntities,
  linkGameEntity,
  refreshEntitySpatialState,
  spawnGameEntity,
  trigger_enable,
  type GameEntity,
  type GameRuntime
} from "../../packages/game/src/index.js";

main();

/**
 * Category: New
 * Purpose: Run the phase-7 trigger dispatch verification suite.
 */
function main(): void {
  const deadActorResult = verifyDeadActorDoesNotTrigger();
  const playerResult = verifyPlayerTriggers();
  const monsterResult = verifyMonsterFiltering();
  const enableResult = verifyEnabledTriggerTouchesCoveredSolid();

  console.log("Verification collision phase 7");
  console.log(`dead actor touches: ${deadActorResult.join(", ")}`);
  console.log(`player touches: ${playerResult.join(", ")}`);
  console.log(`monster touches: ${monsterResult.join(", ")}`);
  console.log(`enabled trigger touches: ${enableResult.join(", ")}`);

  assertBoolean(deadActorResult.length === 0, true, "dead actor does not trigger");
  assertBoolean(playerResult.includes("phase7_player_trigger:phase7_player"), true, "player trigger fires");
  assertBoolean(monsterResult.includes("phase7_monster_trigger:phase7_monster"), true, "monster trigger fires with spawnflag");
  assertBoolean(monsterResult.includes("phase7_player_only_trigger:phase7_monster"), false, "monster does not fire player-only trigger");
  assertBoolean(enableResult.includes("phase7_enabled_trigger:phase7_occupant"), true, "enabled trigger touches covered solid");
}

/**
 * Category: New
 * Purpose: Verify dead clients and monsters are ignored by `G_TouchTriggers`.
 */
function verifyDeadActorDoesNotTrigger(): string[] {
  const runtime = createRuntime();
  const touches: string[] = [];
  const trigger = spawnTrigger(runtime, "phase7_dead_trigger", [0, 0, 0], touches);
  const actor = spawnActor(runtime, "phase7_dead_actor", [0, 0, 0]);
  actor.client = true;
  actor.health = 0;
  refreshEntitySpatialState(actor);
  linkGameEntity(runtime, actor);

  G_TouchTriggers(runtime, actor);
  void trigger;
  return touches;
}

/**
 * Category: New
 * Purpose: Verify a living player still fires overlapping trigger touches.
 */
function verifyPlayerTriggers(): string[] {
  const runtime = createRuntime();
  const touches: string[] = [];
  spawnTrigger(runtime, "phase7_player_trigger", [0, 0, 0], touches);
  const actor = spawnActor(runtime, "phase7_player", [0, 0, 0]);

  G_TouchTriggers(runtime, actor);
  return touches;
}

/**
 * Category: New
 * Purpose: Verify trigger touch filtering between player-only and monster-enabled triggers.
 */
function verifyMonsterFiltering(): string[] {
  const runtime = createRuntime();
  const touches: string[] = [];
  const playerOnly = spawnTrigger(runtime, "phase7_player_only_trigger", [0, 0, 0], touches);
  playerOnly.spawnflags = 0;
  const monsterTrigger = spawnTrigger(runtime, "phase7_monster_trigger", [0, 0, 0], touches);
  monsterTrigger.spawnflags = 1;

  const monster = spawnActor(runtime, "phase7_monster", [0, 0, 0]);
  monster.client = false;
  monster.svflags |= SVF_MONSTER;
  refreshEntitySpatialState(monster);
  linkGameEntity(runtime, monster);

  G_TouchTriggers(runtime, monster);
  return touches;
}

/**
 * Category: New
 * Purpose: Verify an enabled trigger immediately touches overlapping solids through `G_TouchSolids`.
 */
function verifyEnabledTriggerTouchesCoveredSolid(): string[] {
  const runtime = createRuntime();
  const touches: string[] = [];
  const trigger = spawnTrigger(runtime, "phase7_enabled_trigger", [0, 0, 0], touches);
  trigger.solid = SOLID_NOT;
  refreshEntitySpatialState(trigger);
  linkGameEntity(runtime, trigger);

  const occupant = spawnActor(runtime, "phase7_occupant", [0, 0, 0]);
  trigger_enable(trigger, occupant, occupant, runtime);
  G_TouchSolids(runtime, trigger);

  return touches;
}

/**
 * Category: New
 * Purpose: Build one isolated runtime suitable for trigger dispatch verification.
 */
function createRuntime(): GameRuntime {
  return createGameRuntimeFromBspEntities([{ properties: { classname: "worldspawn" } }]);
}

/**
 * Category: New
 * Purpose: Spawn one trigger volume wired to record touches.
 */
function spawnTrigger(runtime: GameRuntime, classname: string, origin: [number, number, number], touches: string[]): GameEntity {
  const trigger = spawnGameEntity(runtime);
  trigger.classname = classname;
  trigger.solid = SOLID_TRIGGER;
  trigger.origin = [...origin];
  trigger.mins = [-32, -32, -32];
  trigger.maxs = [32, 32, 32];
  trigger.touch = (self, other, touchRuntime) => {
    const previousActivator = self.activator;
    const previousNextThink = self.nextthink;
    Touch_Multi(self, other, touchRuntime);
    if (self.activator === other && (previousActivator !== other || self.nextthink !== previousNextThink)) {
      touches.push(`${self.classname}:${other.classname}`);
    }
  };
  refreshEntitySpatialState(trigger);
  linkGameEntity(runtime, trigger);
  return trigger;
}

/**
 * Category: New
 * Purpose: Spawn one solid actor with a Quake-like player hull.
 */
function spawnActor(runtime: GameRuntime, classname: string, origin: [number, number, number]): GameEntity {
  const actor = spawnGameEntity(runtime);
  actor.classname = classname;
  actor.client = true;
  actor.health = 100;
  actor.movetype = 2;
  actor.solid = SOLID_BSP;
  actor.origin = [...origin];
  actor.mins = [-16, -16, -24];
  actor.maxs = [16, 16, 32];
  refreshEntitySpatialState(actor);
  linkGameEntity(runtime, actor);
  return actor;
}

/**
 * Category: New
 * Purpose: Assert one boolean equality in the verification harness.
 */
function assertBoolean(actual: boolean, expected: boolean, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: attendu ${expected}, obtenu ${actual}`);
  }
}
