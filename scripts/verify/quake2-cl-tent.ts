/**
 * File: quake2-cl-tent.ts
 * Purpose: Verify the persistent temporary-entity state rebuilt from `client/cl_tent.c`.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for `packages/client/src/tent.ts`.
 *
 * Dependencies:
 * - packages/client
 */

import { strict as assert } from "node:assert";

import { temp_event_t } from "../../packages/qcommon/src/index.js";
import { CL_AddTEntPacket, CL_BuildTEntRefresh, createClientRuntime } from "../../packages/client/src/index.js";

verifyPlasmaExplosionAllocatesPersistentExplosion();
verifySteamSustainOverflowDoesNotOverwriteActiveSlots();

console.log("quake2-cl-tent: ok");

function verifyPlasmaExplosionAllocatesPersistentExplosion(): void {
  const runtime = createHarnessRuntime();

  CL_AddTEntPacket(runtime, {
    type: temp_event_t.TE_PLASMA_EXPLOSION,
    position: [10, 20, 30]
  });

  const refresh = CL_BuildTEntRefresh(runtime);
  assert.equal(refresh.explosions.length, 1, "TE_PLASMA_EXPLOSION should allocate one persistent explosion");
  assert.equal(refresh.explosions[0]?.model, "models/objects/r_explode/tris.md2", "TE_PLASMA_EXPLOSION model mismatch");
  assert.deepEqual(refresh.explosions[0]?.origin, [10, 20, 30], "TE_PLASMA_EXPLOSION origin mismatch");
}

function verifySteamSustainOverflowDoesNotOverwriteActiveSlots(): void {
  const runtime = createHarnessRuntime();

  for (let index = 0; index < runtime.cl.tents.sustains.length; index += 1) {
    const slot = runtime.cl.tents.sustains[index]!;
    slot.id = index + 1;
    slot.type = "steam";
    slot.thinker = "CL_ParticleSteamEffect2";
    slot.endtime = runtime.cl.time + 1000;
    slot.nextthink = runtime.cl.time + 50;
    slot.thinkinterval = 100;
    slot.org = [index, 0, 0];
    slot.dir = [0, 0, 1];
    slot.count = 10;
    slot.color = 0xe0;
    slot.magnitude = 20;
  }

  CL_AddTEntPacket(runtime, {
    type: temp_event_t.TE_STEAM,
    id: 999,
    count: 5,
    position: [128, 64, 32],
    directionByte: 5,
    color: 42,
    magnitude: 77,
    durationMs: 500
  });

  assert.equal(runtime.cl.tents.sustains[0]?.id, 1, "steam sustain overflow should not overwrite the first active slot");
  assert.equal(runtime.cl.tents.sustains.some((slot) => slot.id === 999), false, "steam sustain overflow should not inject a new slot");
}

function createHarnessRuntime() {
  const runtime = createClientRuntime();
  runtime.cl.time = 1000;
  runtime.cl.frame.servertime = 1000;
  runtime.cl.lerpfrac = 0.5;
  runtime.cl.playernum = 0;
  runtime.cl.hand = 0;
  runtime.cl.predicted_origin = [0, 0, 0];
  runtime.cl.predicted_angles = [0, 0, 0];
  runtime.cl.frame.serverframe = 1;
  runtime.cl.frame.valid = true;
  runtime.cl.frame.playerstate.viewoffset = [0, 0, 22];
  runtime.cl.frame.playerstate.gunoffset = [0, 0, 0];
  runtime.cl.frame.playerstate.gunangles = [0, 0, 0];
  runtime.cl.frame.playerstate.blend = [0, 0, 0, 0];
  runtime.cl.frames[0] = runtime.cl.frame;
  return runtime;
}
