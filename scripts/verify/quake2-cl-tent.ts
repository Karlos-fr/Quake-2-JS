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
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  MSG_WriteByte,
  MSG_WriteDir,
  MSG_WriteLong,
  MSG_WritePos,
  MSG_WriteShort,
  RF_BEAM,
  RF_FULLBRIGHT,
  RF_TRANSLUCENT,
  temp_event_t
} from "../../packages/qcommon/src/index.js";
import {
  CL_AddTEntPacket,
  CL_BuildRefreshFrame,
  CL_BuildTEntRefresh,
  CL_ClearTEnts,
  CL_ParseParticles,
  CL_ParseTEnt,
  CL_RegisterTEntModels,
  CL_RegisterTEntSounds,
  MAX_BEAMS,
  MAX_EXPLOSIONS,
  MAX_LASERS,
  MAX_SUSTAINS,
  connstate_t,
  createClientRuntime
} from "../../packages/client/src/index.js";

type HarnessRuntime = ReturnType<typeof createClientRuntime>;

verifySourceIntegration();
verifyTempEntityConstantsAndClear();
verifyRegistrationSets();
verifySmokeAndFlashAllocatesPairedExplosions();
verifyBeamParsingOverrideAndRefresh();
verifyLightningParsingMatchesSourceAndDestination();
verifyPlayerBeamTimingAndHeatbeamRefresh();
verifyLaserParsingAndRefresh();
verifyPlasmaExplosionAllocatesPersistentExplosion();
verifyExplosionRecyclesOldestSlot();
verifyExplosionFrameAndLightProgression();
verifyForceWallAndFlashlightReachRefreshFrame();
verifyParseParticlesPacketAndRefreshParticles();
verifySplashColorTableAndNonPersistentEffects();
verifyHeatbeamSparkDirectionByteRuntimeBranch();
verifySteamSustainParsingAndRuntime();
verifySteamSustainOverflowDoesNotOverwriteActiveSlots();

console.log("quake2-cl-tent: ok");

function verifySourceIntegration(): void {
  const repoRoot = process.cwd();
  const parseSource = readFileSync(join(repoRoot, "packages", "client", "src", "cl_parse.ts"), "utf8");
  const refreshSource = readFileSync(join(repoRoot, "packages", "client", "src", "refresh.ts"), "utf8");
  const fullGameSource = readFileSync(join(repoRoot, "apps", "web", "src", "full-game.ts"), "utf8");
  const beamSyncSource = readFileSync(join(repoRoot, "packages", "renderer-three", "src", "three-beam-sync.ts"), "utf8");
  const debugLayerSource = readFileSync(join(repoRoot, "apps", "web", "src", "refresh-debug-layer.ts"), "utf8");

  assert.ok(parseSource.includes("case svc_ops_e.svc_temp_entity"), "CL_ParseServerMessage should dispatch svc_temp_entity to CL_ParseTEnt");
  assert.ok(parseSource.includes("CL_AddTEntPacket(runtime, packet)"), "CL_ParseTEnt should feed persistent cl_tent state");
  assert.ok(parseSource.includes("CL_ExecuteTempEntityEffects(runtime, packet)"), "CL_ParseTEnt should keep immediate particle/dlight side effects");
  assert.ok(refreshSource.includes("const tempRefresh = CL_BuildTEntRefresh(runtime)"), "CL_BuildRefreshFrame should call CL_AddTEnts/CL_BuildTEntRefresh");
  assert.ok(refreshSource.includes("appendTempExplosions(tempRefresh.explosions, entities)"), "temp explosions should become refresh entities");
  assert.ok(fullGameSource.includes("createFullGameServerRenderSource"), "apps/web should render from authoritative refresh frames");
  assert.ok(fullGameSource.includes("onTempEntity:"), "apps/web should receive CL_ParseTEnt temp entity hooks");
  assert.ok(beamSyncSource.includes("R_DrawBeam(runtime, entity)"), "renderer-three should consume refresh beams through R_DrawBeam");
  assert.ok(debugLayerSource.includes("for (const wall of frame.forceWalls)"), "apps/web should consume force-wall temp output");
  assert.ok(debugLayerSource.includes("for (const sustain of frame.sustains)"), "apps/web should consume sustain temp output");
}

function verifyTempEntityConstantsAndClear(): void {
  const runtime = createHarnessRuntime();
  assert.equal(runtime.cl.tents.explosions.length, MAX_EXPLOSIONS, "MAX_EXPLOSIONS slot count mismatch");
  assert.equal(runtime.cl.tents.beams.length, MAX_BEAMS, "MAX_BEAMS regular slot count mismatch");
  assert.equal(runtime.cl.tents.playerbeams.length, MAX_BEAMS, "MAX_BEAMS player slot count mismatch");
  assert.equal(runtime.cl.tents.lasers.length, MAX_LASERS, "MAX_LASERS slot count mismatch");
  assert.equal(runtime.cl.tents.sustains.length, MAX_SUSTAINS, "MAX_SUSTAINS slot count mismatch");

  runtime.cl.tents.beams[0]!.entity = 7;
  runtime.cl.tents.beams[0]!.model = "models/test.md2";
  runtime.cl.tents.explosions[0]!.type = "poly";
  runtime.cl.tents.lasers[0]!.endtime = runtime.cl.time + 100;
  runtime.cl.tents.sustains[0]!.id = 99;
  runtime.cl.tents.registeredModels = ["x"];
  runtime.cl.tents.registeredSounds = ["y"];
  CL_ClearTEnts(runtime);

  assert.equal(runtime.cl.tents.beams[0]?.model, null, "CL_ClearTEnts should clear regular beams");
  assert.equal(runtime.cl.tents.explosions[0]?.type, "free", "CL_ClearTEnts should clear explosions");
  assert.equal(runtime.cl.tents.lasers[0]?.endtime, 0, "CL_ClearTEnts should clear lasers");
  assert.equal(runtime.cl.tents.sustains[0]?.id, 0, "CL_ClearTEnts should clear sustains");
  assert.deepEqual(runtime.cl.tents.registeredModels, [], "CL_ClearTEnts should clear registered models");
  assert.deepEqual(runtime.cl.tents.registeredSounds, [], "CL_ClearTEnts should clear registered sounds");
}

function verifyRegistrationSets(): void {
  const runtime = createHarnessRuntime();
  const sounds = CL_RegisterTEntSounds(runtime);
  const models = CL_RegisterTEntModels(runtime);

  assert.deepEqual(sounds.slice(0, 4), [
    "world/ric1.wav",
    "world/ric2.wav",
    "world/ric3.wav",
    "weapons/lashit.wav"
  ], "CL_RegisterTEntSounds leading registration order mismatch");
  assert.ok(sounds.includes("weapons/tesla.wav"), "CL_RegisterTEntSounds should include Rogue lightning sound");
  assert.ok(models.models.includes("models/proj/lightning/tris.md2"), "CL_RegisterTEntModels should include lightning model");
  assert.ok(models.models.includes("models/proj/beam/tris.md2"), "CL_RegisterTEntModels should include heatbeam model");
  assert.ok(models.models.includes("models/proj/widowbeam/tris.md2"), "CL_RegisterTEntModels should include monster heatbeam model");
  assert.deepEqual(models.pics, ["w_machinegun", "a_bullets", "i_health", "a_grenades"], "CL_RegisterTEntModels pic registration mismatch");
}

function verifySmokeAndFlashAllocatesPairedExplosions(): void {
  const runtime = createHarnessRuntime();

  CL_AddTEntPacket(runtime, {
    type: temp_event_t.TE_GUNSHOT,
    position: [4, 5, 6],
    directionByte: 0
  });

  const slots = runtime.cl.tents.explosions.filter((slot) => slot.type !== "free");
  assert.equal(slots.length, 2, "TE_GUNSHOT should allocate smoke and flash explosions");
  assert.equal(slots[0]?.ent.model, "models/objects/smoke/tris.md2", "smoke model mismatch");
  assert.equal(slots[1]?.ent.model, "models/objects/flash/tris.md2", "flash model mismatch");
  assert.equal(slots[0]?.start, runtime.cl.frame.servertime - 100, "smoke start time mismatch");
}

function verifyBeamParsingOverrideAndRefresh(): void {
  const runtime = createHarnessRuntime();

  writeTempEntity(runtime, temp_event_t.TE_PARASITE_ATTACK, () => {
    MSG_WriteShort(runtime.net_message, 17);
    MSG_WritePos(runtime.net_message, [1, 2, 3]);
    MSG_WritePos(runtime.net_message, [61, 2, 3]);
  });
  const packet = CL_ParseTEnt(runtime);
  assert.equal(packet.beamKind, "beam", "TE_PARASITE_ATTACK beam kind mismatch");
  assert.equal(runtime.cl.tents.beams[0]?.entity, 17, "CL_ParseBeam entity mismatch");
  assert.equal(runtime.cl.tents.beams[0]?.endtime, runtime.cl.time + 200, "CL_ParseBeam endtime mismatch");

  writeTempEntity(runtime, temp_event_t.TE_MEDIC_CABLE_ATTACK, () => {
    MSG_WriteShort(runtime.net_message, 17);
    MSG_WritePos(runtime.net_message, [9, 8, 7]);
    MSG_WritePos(runtime.net_message, [9, 68, 7]);
  });
  CL_ParseTEnt(runtime);

  const activeSlots = runtime.cl.tents.beams.filter((slot) => slot.model !== null);
  const refresh = CL_BuildTEntRefresh(runtime);
  assert.equal(activeSlots.length, 1, "CL_ParseBeam should override same entity");
  assert.deepEqual(runtime.cl.tents.beams[0]?.start, [9, 8, 7], "CL_ParseBeam override start mismatch");
  assert.equal(refresh.beams[0]?.model, "models/monsters/parasite/segment/tris.md2", "CL_AddBeams model mismatch");
  assert.equal(refresh.beams[0]?.segmentLength, 30, "CL_AddBeams non-lightning segment length mismatch");
}

function verifyLightningParsingMatchesSourceAndDestination(): void {
  const runtime = createHarnessRuntime();

  writeTempEntity(runtime, temp_event_t.TE_LIGHTNING, () => {
    MSG_WriteShort(runtime.net_message, 3);
    MSG_WriteShort(runtime.net_message, 4);
    MSG_WritePos(runtime.net_message, [0, 0, 0]);
    MSG_WritePos(runtime.net_message, [0, 0, 30]);
  });
  CL_ParseTEnt(runtime);

  writeTempEntity(runtime, temp_event_t.TE_LIGHTNING, () => {
    MSG_WriteShort(runtime.net_message, 3);
    MSG_WriteShort(runtime.net_message, 4);
    MSG_WritePos(runtime.net_message, [0, 0, 0]);
    MSG_WritePos(runtime.net_message, [0, 0, 30]);
  });
  CL_ParseTEnt(runtime);

  const slots = runtime.cl.tents.beams.filter((slot) => slot.model !== null);
  const refresh = CL_BuildTEntRefresh(runtime);
  assert.equal(slots.length, 1, "CL_ParseLightning should override by source and destination");
  assert.equal(refresh.beams[0]?.model, "models/proj/lightning/tris.md2", "CL_ParseLightning model mismatch");
  assert.equal(refresh.beams[0]?.specialLightningShort, true, "short lightning should use original special case");
  assert.equal(refresh.beams[0]?.flags, RF_FULLBRIGHT, "lightning beam flags mismatch");
}

function verifyPlayerBeamTimingAndHeatbeamRefresh(): void {
  const runtime = createHarnessRuntime();

  writeTempEntity(runtime, temp_event_t.TE_HEATBEAM, () => {
    MSG_WriteShort(runtime.net_message, runtime.cl.playernum + 1);
    MSG_WritePos(runtime.net_message, [3, 4, 5]);
    MSG_WritePos(runtime.net_message, [128, 4, 27]);
  });
  CL_ParseTEnt(runtime);

  assert.deepEqual(runtime.cl.tents.playerbeams[0]?.offset, [2, 7, -3], "CL_ParsePlayerBeam heatbeam offset mismatch");
  assert.equal(runtime.cl.tents.playerbeams[0]?.endtime, runtime.cl.time + 100, "new player beam endtime mismatch");

  writeTempEntity(runtime, temp_event_t.TE_MONSTER_HEATBEAM, () => {
    MSG_WriteShort(runtime.net_message, runtime.cl.playernum + 1);
    MSG_WritePos(runtime.net_message, [9, 9, 9]);
    MSG_WritePos(runtime.net_message, [128, 4, 27]);
  });
  CL_ParseTEnt(runtime);

  const refresh = CL_BuildTEntRefresh(runtime);
  assert.equal(runtime.cl.tents.playerbeams[0]?.endtime, runtime.cl.time + 200, "overridden player beam endtime mismatch");
  assert.deepEqual(runtime.cl.tents.playerbeams[0]?.offset, [0, 0, 0], "monster heatbeam offset should be zero");
  assert.equal(refresh.beams[0]?.kind, "player-beam", "CL_AddPlayerBeams kind mismatch");
  assert.equal(refresh.beams[0]?.frame, 1, "first-person heatbeam frame mismatch");
  assert.equal(refresh.beams[0]?.segmentLength, 32, "heatbeam segment length mismatch");
  assert.equal(refresh.beams[0]?.roll, runtime.cl.time % 360, "heatbeam roll should follow cl.time");
}

function verifyLaserParsingAndRefresh(): void {
  const runtime = createHarnessRuntime();

  writeTempEntity(runtime, temp_event_t.TE_BFG_LASER, () => {
    MSG_WritePos(runtime.net_message, [1, 1, 1]);
    MSG_WritePos(runtime.net_message, [31, 1, 1]);
  });
  CL_ParseTEnt(runtime);

  const refresh = CL_BuildTEntRefresh(runtime);
  assert.equal(runtime.cl.tents.lasers[0]?.endtime, runtime.cl.time + 100, "CL_ParseLaser endtime mismatch");
  assert.equal(refresh.beams[0]?.kind, "laser", "CL_AddLasers should expose lasers as refresh beams");
  assert.equal(refresh.beams[0]?.flags, RF_TRANSLUCENT | RF_BEAM, "CL_ParseLaser flags mismatch");
  assert.equal(refresh.beams[0]?.alpha, 0.3, "CL_ParseLaser alpha mismatch");
  assert.equal(refresh.beams[0]?.frame, 4, "CL_ParseLaser frame mismatch");
}

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

function verifyExplosionRecyclesOldestSlot(): void {
  const runtime = createHarnessRuntime();

  for (let index = 0; index < MAX_EXPLOSIONS; index += 1) {
    const slot = runtime.cl.tents.explosions[index]!;
    slot.type = "poly";
    slot.ent.model = "models/objects/r_explode/tris.md2";
    slot.start = runtime.cl.time + index;
  }

  runtime.cl.tents.explosions[5]!.start = runtime.cl.time - 500;
  CL_AddTEntPacket(runtime, {
    type: temp_event_t.TE_BFG_EXPLOSION,
    position: [77, 88, 99]
  });

  assert.deepEqual(runtime.cl.tents.explosions[5]?.ent.origin, [77, 88, 99], "CL_AllocExplosion should recycle the oldest slot");
  assert.equal(runtime.cl.tents.explosions[5]?.ent.model, "sprites/s_bfg2.sp2", "recycled explosion model mismatch");
}

function verifyExplosionFrameAndLightProgression(): void {
  const runtime = createHarnessRuntime();
  runtime.cl.lerpfrac = 0.25;

  CL_AddTEntPacket(runtime, {
    type: temp_event_t.TE_GRENADE_EXPLOSION,
    position: [10, 20, 30]
  });
  runtime.cl.time = runtime.cl.frame.servertime + 100;

  const refresh = CL_BuildTEntRefresh(runtime);
  assert.equal(refresh.explosions[0]?.frame, 33, "CL_AddExplosions frame progression mismatch");
  assert.equal(refresh.explosions[0]?.oldframe, 32, "CL_AddExplosions oldframe mismatch");
  assert.equal(refresh.explosions[0]?.backlerp, 0.75, "CL_AddExplosions backlerp mismatch");
  assert.equal(refresh.explosions[0]?.skinnum, 1, "CL_AddExplosions early skin mismatch");
  assert.equal(refresh.lights[0]?.intensity, 350 * (14 / 16), "CL_AddExplosions dynamic light alpha mismatch");
  assert.deepEqual(refresh.lights[0]?.color, [1, 0.5, 0.5], "CL_AddExplosions light color mismatch");
}

function verifyForceWallAndFlashlightReachRefreshFrame(): void {
  const runtime = createHarnessRuntime();
  runtime.cls.state = connstate_t.ca_active;

  CL_AddTEntPacket(runtime, {
    type: temp_event_t.TE_FORCEWALL,
    position: [1, 2, 3],
    position2: [4, 5, 6],
    color: 0xe0
  });
  CL_AddTEntPacket(runtime, {
    type: temp_event_t.TE_FLASHLIGHT,
    position: [9, 8, 7],
    entity: 12
  });

  const refresh = CL_BuildRefreshFrame(runtime);
  assert.deepEqual(refresh.forceWalls[0]?.start, [1, 2, 3], "TE_FORCEWALL start should reach refresh frame");
  assert.deepEqual(refresh.forceWalls[0]?.end, [4, 5, 6], "TE_FORCEWALL end should reach refresh frame");
  assert.equal(refresh.forceWalls[0]?.color, 0xe0, "TE_FORCEWALL color mismatch");
  assert.equal(refresh.lights.some((light) => light.kind === "dlight" && light.sourceEntity === 12 && light.intensity === 400), true, "TE_FLASHLIGHT should reach refresh lights");
}

function verifyParseParticlesPacketAndRefreshParticles(): void {
  const runtime = createHarnessRuntime();
  runtime.cls.state = connstate_t.ca_active;
  let hooked = false;

  runtime.net_message.cursize = 0;
  runtime.net_message.readcount = 0;
  MSG_WritePos(runtime.net_message, [11, 22, 33]);
  MSG_WriteDir(runtime.net_message, [0, 0, 1]);
  MSG_WriteByte(runtime.net_message, 0xe8);
  MSG_WriteByte(runtime.net_message, 4);
  runtime.net_message.readcount = 0;

  const packet = CL_ParseParticles(runtime, {
    onParticleEffect: (effect) => {
      hooked = true;
      assert.deepEqual(effect.position, [11, 22, 33], "CL_ParseParticles hook position mismatch");
      assert.equal(effect.color, 0xe8, "CL_ParseParticles hook color mismatch");
      assert.equal(effect.count, 4, "CL_ParseParticles hook count mismatch");
    }
  });
  const refresh = CL_BuildRefreshFrame(runtime);

  assert.equal(hooked, true, "CL_ParseParticles should call onParticleEffect");
  assert.deepEqual(packet.position, [11, 22, 33], "CL_ParseParticles position mismatch");
  assert.equal(packet.color, 0xe8, "CL_ParseParticles color mismatch");
  assert.equal(packet.count, 4, "CL_ParseParticles count mismatch");
  assert.equal(refresh.particles.length, 4, "CL_ParseParticles particles should reach refresh particles");
}

function verifySplashColorTableAndNonPersistentEffects(): void {
  const runtime = createHarnessRuntime();
  runtime.cls.state = connstate_t.ca_active;

  writeTempEntity(runtime, temp_event_t.TE_SPLASH, () => {
    MSG_WriteByte(runtime.net_message, 5);
    MSG_WritePos(runtime.net_message, [10, 20, 30]);
    MSG_WriteDir(runtime.net_message, [0, 0, 1]);
    MSG_WriteByte(runtime.net_message, 2);
  });
  const packet = CL_ParseTEnt(runtime);
  const refresh = CL_BuildRefreshFrame(runtime);

  assert.equal(packet.count, 5, "TE_SPLASH count mismatch");
  assert.deepEqual(packet.position, [10, 20, 30], "TE_SPLASH position mismatch");
  assert.equal(packet.color, 2, "TE_SPLASH should keep the splash type byte in the packet");
  assert.equal(refresh.particles.length, 5, "TE_SPLASH should spawn count particles");
  assert.ok(
    refresh.particles.every((particle) => particle.color >= 0xb0 && particle.color <= 0xb7),
    "TE_SPLASH type 2 should map through splash_color to 0xb0 before CL_ParticleEffect jitter"
  );
}

function verifyHeatbeamSparkDirectionByteRuntimeBranch(): void {
  const runtime = createHarnessRuntime();
  runtime.cls.state = connstate_t.ca_active;

  writeTempEntity(runtime, temp_event_t.TE_HEATBEAM_SPARKS, () => {
    MSG_WritePos(runtime.net_message, [7, 8, 9]);
    MSG_WriteDir(runtime.net_message, [0, 0, 1]);
  });
  const packet = CL_ParseTEnt(runtime);
  const refresh = CL_BuildRefreshFrame(runtime);

  assert.equal(packet.directionByte !== undefined, true, "TE_HEATBEAM_SPARKS should parse MSG_ReadDir as a direction byte");
  assert.equal(refresh.particles.length, 50, "TE_HEATBEAM_SPARKS should execute CL_ParticleSteamEffect with the fixed count");
  assert.ok(
    refresh.particles.every((particle) => particle.color >= 8 && particle.color <= 15),
    "TE_HEATBEAM_SPARKS should preserve fixed color 8 before CL_ParticleSteamEffect jitter"
  );
}

function verifySteamSustainParsingAndRuntime(): void {
  const runtime = createHarnessRuntime();

  writeTempEntity(runtime, temp_event_t.TE_STEAM, () => {
    MSG_WriteShort(runtime.net_message, 321);
    MSG_WriteByte(runtime.net_message, 5);
    MSG_WritePos(runtime.net_message, [12, 13, 14]);
    MSG_WriteByte(runtime.net_message, 5);
    MSG_WriteByte(runtime.net_message, 0xe0);
    MSG_WriteShort(runtime.net_message, 77);
    MSG_WriteLong(runtime.net_message, 500);
  });
  const packet = CL_ParseTEnt(runtime);
  const refresh = CL_BuildTEntRefresh(runtime);

  assert.equal(packet.id, 321, "CL_ParseSteam id mismatch");
  assert.equal(runtime.cl.tents.sustains[0]?.thinker, "CL_ParticleSteamEffect2", "CL_ParseSteam thinker mismatch");
  assert.equal(runtime.cl.tents.sustains[0]?.endtime, runtime.cl.time + 500, "CL_ParseSteam endtime mismatch");
  assert.equal(refresh.sustains[0]?.kind, "steam", "CL_ProcessSustain should emit steam sustain");
  assert.deepEqual(refresh.sustains[0]?.origin, [12, 13, 14], "CL_ProcessSustain origin mismatch");
  assert.equal(refresh.sustains[0]?.count, 5, "CL_ProcessSustain count mismatch");
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

function writeTempEntity(runtime: HarnessRuntime, type: temp_event_t, writePayload: () => void): void {
  runtime.net_message.cursize = 0;
  runtime.net_message.readcount = 0;
  MSG_WriteByte(runtime.net_message, type);
  writePayload();
  runtime.net_message.readcount = 0;
}

function createHarnessRuntime(): HarnessRuntime {
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
