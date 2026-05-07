/**
 * File: quake2-p-weapon-temp-entities.ts
 * Purpose: Verify player weapon wrappers forward temp-entity hooks to the default world weapon implementations.
 *
 * This file is not a direct source port.
 * It is a targeted regression harness for the `p_weapon.ts` -> `g_weapon.ts` hook boundary.
 */

import { strict as assert } from "node:assert";

import {
  attachGameClient,
  createGameRuntimeFromBspEntities,
  createRuntimeEntity,
  type GameEntity,
  type GameRuntime
} from "../../packages/game/src/runtime.js";
import { Machinegun_Fire } from "../../packages/game/src/p_weapon.js";
import { BUTTON_ATTACK, temp_event_t, type trace_t, type vec3_t } from "../../packages/qcommon/src/index.js";

verifyMachinegunDefaultFireEmitsImpactTempEntity();

console.log("quake2-p-weapon-temp-entities: ok");

function verifyMachinegunDefaultFireEmitsImpactTempEntity(): void {
  const runtime = createHarnessRuntime();
  const player = createPlayer(runtime, 1);
  const emitted: Array<{ type: temp_event_t; payload: Record<string, unknown> }> = [];

  Machinegun_Fire(player, runtime, {
    emitTempEntity: (type, payload) => {
      emitted.push({ type, payload });
    }
  });

  assert.equal(emitted.length, 1, "Machinegun_Fire default fire_bullet should emit one impact temp entity");
  assert.equal(emitted[0]?.type, temp_event_t.TE_GUNSHOT, "Machinegun_Fire impact temp entity type mismatch");
  assert.deepEqual(emitted[0]?.payload.origin, [128, 0, 22], "Machinegun_Fire impact temp entity origin mismatch");
  assert.deepEqual(emitted[0]?.payload.dir, [0, 0, 1], "Machinegun_Fire impact temp entity direction mismatch");
}

function createHarnessRuntime(): GameRuntime {
  const runtime = createGameRuntimeFromBspEntities([{ properties: { classname: "worldspawn" } }]);
  let traceCall = 0;
  runtime.collision = {
    trace: () => {
      traceCall += 1;
      return traceCall === 1
        ? makeTrace(1, [24, 8, 14], null)
        : makeTrace(0.5, [128, 0, 22], null);
    },
    pointcontents: () => 0,
    boxEdicts: () => [],
    transformedPointContents: () => 0,
    headnodeVisible: () => true
  };
  return runtime;
}

function createPlayer(runtime: GameRuntime, index: number): GameEntity {
  const player = createRuntimeEntity({ classname: "player" }, index);
  player.inuse = true;
  player.classname = "player";
  player.health = 100;
  player.s.origin = [0, 0, 0];
  player.origin = [...player.s.origin];
  attachGameClient(player);
  player.client!.v_angle = [0, 0, 0];
  player.client!.buttons = BUTTON_ATTACK;
  player.client!.ammo_index = 0;
  player.client!.pers.inventory[0] = 10;
  runtime.entities[index] = player;
  return player;
}

function makeTrace(fraction: number, endpos: vec3_t, ent: GameEntity | null): trace_t {
  return {
    allsolid: false,
    startsolid: false,
    fraction,
    endpos,
    plane: {
      normal: [0, 0, 1],
      dist: 0,
      type: 0,
      signbits: 0,
      pad: [0, 0]
    },
    surface: null,
    contents: 0,
    ent
  };
}
