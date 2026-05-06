/**
 * File: quake2-cl-fx.ts
 * Purpose: Verify focused client/cl_fx.c particle effect ports and their refresh-facing output.
 */

import { strict as assert } from "node:assert";

import {
  CL_AddDLights,
  CL_AddLightStyles,
  CL_AddParticles,
  CL_AllocDlight,
  CL_BigTeleportParticles,
  CL_BlasterParticles,
  CL_BlasterTrail,
  CL_BubbleTrail,
  CL_BuildEntityEventEffects,
  CL_BuildMuzzleFlash2Effects,
  CL_BuildMuzzleFlashEffects,
  CL_BuildTempEntityEffects,
  CL_ClearDlights,
  CL_ClearLightStyles,
  CL_ClearParticles,
  CL_DiminishingTrail,
  CL_ExecuteTempEntityEffects,
  CL_ExplosionParticles,
  CL_ExecutePacketEntityEffects,
  CL_FlagTrail,
  CL_FlyParticles,
  CL_IonripperTrail,
  CL_ItemRespawnParticles,
  CL_LogoutEffect,
  MakeNormalVectors,
  CL_NewDlight,
  CL_ParticleEffect,
  CL_ParticleEffect2,
  CL_ParticleEffect3,
  CL_QuadTrail,
  CL_RailTrail,
  CL_RocketTrail,
  CL_RunDLights,
  CL_RunLightStyles,
  CL_SetLightstyle,
  CL_TeleporterParticles
} from "../../packages/client/src/cl_fx.js";
import {
  ATTN_NORM,
  CHAN_AUTO,
  CHAN_WEAPON,
  BYTE_DIRS,
  CS_LIGHTS,
  EF_FLIES,
  EF_GIB,
  EF_GREENGIB,
  EF_GRENADE,
  EF_IONRIPPER,
  EF_ROCKET,
  EF_TELEPORTER,
  EF_FLAG1,
  EF_FLAG2,
  entity_event_t,
  MAX_LIGHTSTYLES,
  MAX_QPATH,
  MZ_BLASTER,
  MZ_CHAINGUN2,
  MZ_LOGIN,
  MZ_LOGOUT,
  MZ_MACHINEGUN,
  MZ_RESPAWN,
  MZ_SHOTGUN,
  MZ_SILENCED,
  temp_event_t,
  type vec3_t
} from "../../packages/qcommon/src/index.js";
import { createClientRuntime as createRuntime, type ClientRuntime } from "../../packages/client/src/client.js";
import { MAX_DLIGHTS, MAX_PARTICLES } from "../../packages/client/src/client.js";
import type { ClientEntityEvent } from "../../packages/client/src/cl_ents.js";
import { CL_BuildRefreshFrame } from "../../packages/client/src/refresh.js";

main();

function main(): void {
  verifyClearParticles();
  verifyParticleEffectRuntimeParticles();
  verifyParticleEffect2RuntimeParticles();
  verifyParticleEffect3RuntimeParticles();
  verifyParticleEffect3TempEntityRuntimeBranch();
  verifyTeleporterRuntimeParticles();
  verifyExplosionRuntimeParticles();
  verifyExplosionTempEntityRuntimeBranch();
  verifyBigTeleportRuntimeParticles();
  verifyBigTeleportTempEntityRuntimeBranch();
  verifyBlasterRuntimeParticles();
  verifyBlasterTempEntityRuntimeBranch();
  verifyBlasterTrailRuntimeParticles();
  verifyQuadTrailRuntimeParticles();
  verifyFlagTrailRuntimeParticles();
  verifyDiminishingTrailRuntimeParticles();
  verifyRocketTrailRuntimeParticles();
  verifyRailTrailRuntimeParticles();
  verifyIonripperTrailRuntimeParticles();
  verifyBubbleTrailRuntimeParticles();
  verifyFlyParticlesRuntimeParticles();
  verifyFlyParticlesPacketEntityRuntimeBranch();
  verifyMakeNormalVectors();
  verifyLogoutEffectRuntimeParticles();
  verifyItemRespawnRuntimeParticles();
  verifyTeleporterEntityEventMetadata();
  verifyItemRespawnEntityEventMetadata();
  verifyLightstyleManagement();
  verifyDlightManagement();
  verifyPlayerMuzzleFlashEffects();
  verifyMonsterMuzzleFlash2Effects();
  console.log("quake2-cl-fx: ok");
}

function verifyClearParticles(): void {
  const runtime = createRuntime();
  assert.equal(runtime.cl.cl_numparticles, MAX_PARTICLES, "cl_numparticles should preserve MAX_PARTICLES");

  runtime.cl.active_particles = 7;
  runtime.cl.free_particles = 13;
  runtime.cl.particles[0].next = 42;
  runtime.cl.particles[0].org = [1, 2, 3];
  runtime.cl.particles[MAX_PARTICLES - 1].next = 123;

  CL_ClearParticles(runtime);

  assert.equal(runtime.cl.active_particles, -1, "CL_ClearParticles should clear active_particles");
  assert.equal(runtime.cl.free_particles, 0, "CL_ClearParticles should reset free_particles to particles[0]");
  assert.equal(runtime.cl.particles[0].next, 1, "CL_ClearParticles should link particles[0] to particles[1]");
  assert.equal(
    runtime.cl.particles[MAX_PARTICLES - 1].next,
    -1,
    "CL_ClearParticles should terminate the free particle list"
  );

  let count = 0;
  let current = runtime.cl.free_particles;
  const visited = new Set<number>();
  while (current >= 0) {
    assert.equal(visited.has(current), false, "CL_ClearParticles free list should not cycle");
    visited.add(current);
    count += 1;
    current = runtime.cl.particles[current].next;
  }

  assert.equal(count, runtime.cl.cl_numparticles, "CL_ClearParticles should expose cl_numparticles free slots");
}

function verifyParticleEffectRuntimeParticles(): void {
  const runtime = createRuntime();
  const origin: vec3_t = [10, 20, 30];
  const direction: vec3_t = [1, 2, -1];
  runtime.cl.time = 2468;
  const randomUnit = 9 / 0x7fffffff;

  withMockRandom(randomUnit, () => {
    CL_ParticleEffect(runtime, origin, direction, 0x70, 3);
  });

  const particles = collectActiveParticles(runtime);
  assert.equal(particles.length, 3, "CL_ParticleEffect should allocate the requested particle count");
  assert.equal(runtime.cl.free_particles, 3, "CL_ParticleEffect free list should advance by count");
  assert.ok(particles.every((particle) => particle.time === runtime.cl.time), "CL_ParticleEffect should preserve cl.time");
  assert.ok(particles.every((particle) => particle.color === 0x71), "CL_ParticleEffect color should preserve color + (rand&7)");
  assert.ok(
    particles.every((particle) => (
      particle.org[0] === origin[0] - 3 + (9 * direction[0])
      && particle.org[1] === origin[1] - 3 + (9 * direction[1])
      && particle.org[2] === origin[2] - 3 + (9 * direction[2])
    )),
    "CL_ParticleEffect should apply jitter and local d * dir displacement"
  );
  const expectedVelocity = ((randomUnit * 2) - 1) * 20;
  assert.ok(
    particles.every((particle) => (
      almostEqual(particle.vel[0], expectedVelocity)
      && almostEqual(particle.vel[1], expectedVelocity)
      && almostEqual(particle.vel[2], expectedVelocity)
    )),
    "CL_ParticleEffect velocity crand scale mismatch"
  );
  assert.ok(particles.every((particle) => particle.accel[0] === 0 && particle.accel[1] === 0 && particle.accel[2] === -40), "CL_ParticleEffect gravity mismatch");
  const expectedAlphavel = -1.0 / (0.5 + (randomUnit * 0.3));
  assert.ok(particles.every((particle) => particle.alpha === 1.0 && almostEqual(particle.alphavel, expectedAlphavel)), "CL_ParticleEffect alpha decay mismatch");

  const renderParticles = CL_AddParticles(runtime);
  assert.equal(renderParticles.length, 3, "CL_ParticleEffect particles should reach the refresh particle list");
}

function verifyParticleEffect2RuntimeParticles(): void {
  const runtime = createRuntime();
  const origin: vec3_t = [-12, 24, 48];
  const direction: vec3_t = [3, -2, 1];
  runtime.cl.time = 3579;
  const randomUnit = 9 / 0x7fffffff;

  withMockRandom(randomUnit, () => {
    CL_ParticleEffect2(runtime, origin, direction, 0xa5, 4);
  });

  const particles = collectActiveParticles(runtime);
  assert.equal(particles.length, 4, "CL_ParticleEffect2 should allocate the requested particle count");
  assert.equal(runtime.cl.free_particles, 4, "CL_ParticleEffect2 free list should advance by count");
  assert.ok(particles.every((particle) => particle.time === runtime.cl.time), "CL_ParticleEffect2 should preserve cl.time");
  assert.ok(particles.every((particle) => particle.color === 0xa5), "CL_ParticleEffect2 should preserve the fixed color");
  assert.ok(
    particles.every((particle) => (
      particle.org[0] === origin[0] - 3 + (1 * direction[0])
      && particle.org[1] === origin[1] - 3 + (1 * direction[1])
      && particle.org[2] === origin[2] - 3 + (1 * direction[2])
    )),
    "CL_ParticleEffect2 should apply jitter and local d = rand&7 displacement"
  );
  const expectedVelocity = ((randomUnit * 2) - 1) * 20;
  assert.ok(
    particles.every((particle) => (
      almostEqual(particle.vel[0], expectedVelocity)
      && almostEqual(particle.vel[1], expectedVelocity)
      && almostEqual(particle.vel[2], expectedVelocity)
    )),
    "CL_ParticleEffect2 velocity crand scale mismatch"
  );
  assert.ok(particles.every((particle) => particle.accel[0] === 0 && particle.accel[1] === 0 && particle.accel[2] === -40), "CL_ParticleEffect2 gravity mismatch");
  const expectedAlphavel = -1.0 / (0.5 + (randomUnit * 0.3));
  assert.ok(particles.every((particle) => particle.alpha === 1.0 && almostEqual(particle.alphavel, expectedAlphavel)), "CL_ParticleEffect2 alpha decay mismatch");

  const renderParticles = CL_AddParticles(runtime);
  assert.equal(renderParticles.length, 4, "CL_ParticleEffect2 particles should reach the refresh particle list");
}

function verifyParticleEffect3RuntimeParticles(): void {
  const runtime = createRuntime();
  const origin: vec3_t = [32, -16, 8];
  const direction: vec3_t = [-2, 1, 3];
  runtime.cl.time = 4680;
  const randomUnit = 9 / 0x7fffffff;

  withMockRandom(randomUnit, () => {
    CL_ParticleEffect3(runtime, origin, direction, 0x6f, 2);
  });

  const particles = collectActiveParticles(runtime);
  assert.equal(particles.length, 2, "CL_ParticleEffect3 should allocate the requested particle count");
  assert.equal(runtime.cl.free_particles, 2, "CL_ParticleEffect3 free list should advance by count");
  assert.ok(particles.every((particle) => particle.time === runtime.cl.time), "CL_ParticleEffect3 should preserve cl.time");
  assert.ok(particles.every((particle) => particle.color === 0x6f), "CL_ParticleEffect3 should preserve the fixed color");
  assert.ok(
    particles.every((particle) => (
      particle.org[0] === origin[0] - 3 + (1 * direction[0])
      && particle.org[1] === origin[1] - 3 + (1 * direction[1])
      && particle.org[2] === origin[2] - 3 + (1 * direction[2])
    )),
    "CL_ParticleEffect3 should apply jitter and local d = rand&7 displacement"
  );
  const expectedVelocity = ((randomUnit * 2) - 1) * 20;
  assert.ok(
    particles.every((particle) => (
      almostEqual(particle.vel[0], expectedVelocity)
      && almostEqual(particle.vel[1], expectedVelocity)
      && almostEqual(particle.vel[2], expectedVelocity)
    )),
    "CL_ParticleEffect3 velocity crand scale mismatch"
  );
  assert.ok(particles.every((particle) => particle.accel[0] === 0 && particle.accel[1] === 0 && particle.accel[2] === 40), "CL_ParticleEffect3 positive gravity mismatch");
  const expectedAlphavel = -1.0 / (0.5 + (randomUnit * 0.3));
  assert.ok(particles.every((particle) => particle.alpha === 1.0 && almostEqual(particle.alphavel, expectedAlphavel)), "CL_ParticleEffect3 alpha decay mismatch");

  const renderParticles = CL_AddParticles(runtime);
  assert.equal(renderParticles.length, 2, "CL_ParticleEffect3 particles should reach the refresh particle list");
}

function verifyParticleEffect3TempEntityRuntimeBranch(): void {
  const runtime = createRuntime();
  runtime.cl.time = 9753;

  withMockRandom(9 / 0x7fffffff, () => {
    CL_ExecuteTempEntityEffects(runtime, {
      type: temp_event_t.TE_TUNNEL_SPARKS,
      position: [1, 2, 3],
      directionByte: 0,
      color: 0x44,
      count: 5
    });
  });

  const particles = collectActiveParticles(runtime);
  assert.equal(particles.length, 5, "TE_TUNNEL_SPARKS should dispatch to CL_ParticleEffect3");
  assert.ok(particles.every((particle) => particle.color === 0x44), "TE_TUNNEL_SPARKS should preserve packet color");
  assert.ok(particles.every((particle) => particle.accel[2] === 40), "TE_TUNNEL_SPARKS should use CL_ParticleEffect3 positive gravity");
}

function verifyTeleporterRuntimeParticles(): void {
  const runtime = createRuntime();
  runtime.cl.time = 6789;
  const origin: vec3_t = [96, 48, 24];

  withMockRandom(0, () => {
    CL_TeleporterParticles(runtime, origin);
  });

  const particles = collectActiveParticles(runtime);
  assert.equal(particles.length, 8, "CL_TeleporterParticles should allocate the original 8 particles");
  assert.equal(runtime.cl.free_particles, 8, "CL_TeleporterParticles free list should advance by 8");
  assert.ok(particles.every((particle) => particle.time === runtime.cl.time), "teleporter particles should preserve cl.time");
  assert.ok(particles.every((particle) => particle.color === 0xdb), "teleporter particle color mismatch");
  assert.ok(particles.every((particle) => particle.org[0] === origin[0] - 16), "teleporter x jitter mismatch");
  assert.ok(particles.every((particle) => particle.org[1] === origin[1] - 16), "teleporter y jitter mismatch");
  assert.ok(particles.every((particle) => particle.org[2] === origin[2] - 8), "teleporter z jitter mismatch");
  assert.ok(particles.every((particle) => particle.vel[0] === -14 && particle.vel[1] === -14), "teleporter horizontal velocity mismatch");
  assert.ok(particles.every((particle) => particle.vel[2] === 80), "teleporter upward velocity mismatch");
  assert.ok(particles.every((particle) => particle.accel[0] === 0 && particle.accel[1] === 0 && particle.accel[2] === -40), "teleporter gravity mismatch");
  assert.ok(particles.every((particle) => particle.alpha === 1.0 && particle.alphavel === -0.5), "teleporter alpha decay mismatch");

  const renderParticles = CL_AddParticles(runtime);
  assert.equal(renderParticles.length, 8, "CL_TeleporterParticles particles should reach the refresh particle list");
}

function verifyExplosionRuntimeParticles(): void {
  const runtime = createRuntime();
  runtime.cl.time = 2468;
  const origin: vec3_t = [40, -8, 120];

  withMockRandom(0, () => {
    CL_ExplosionParticles(runtime, origin);
  });

  const particles = collectActiveParticles(runtime);
  assert.equal(particles.length, 256, "CL_ExplosionParticles should allocate the original 256 particles");
  assert.equal(runtime.cl.free_particles, 256, "CL_ExplosionParticles free list should advance by 256");
  assert.ok(particles.every((particle) => particle.time === runtime.cl.time), "explosion particles should preserve cl.time");
  assert.ok(particles.every((particle) => particle.color === 0xe0), "explosion particle color mismatch");
  assert.ok(particles.every((particle) => particle.org[0] === origin[0] - 16), "explosion x jitter mismatch");
  assert.ok(particles.every((particle) => particle.org[1] === origin[1] - 16), "explosion y jitter mismatch");
  assert.ok(particles.every((particle) => particle.org[2] === origin[2] - 16), "explosion z jitter mismatch");
  assert.ok(particles.every((particle) => particle.vel[0] === -192), "explosion x velocity mismatch");
  assert.ok(particles.every((particle) => particle.vel[1] === -192), "explosion y velocity mismatch");
  assert.ok(particles.every((particle) => particle.vel[2] === -192), "explosion z velocity mismatch");
  assert.ok(particles.every((particle) => particle.accel[0] === 0 && particle.accel[1] === 0 && particle.accel[2] === -40), "explosion gravity mismatch");
  assert.ok(particles.every((particle) => particle.alpha === 1.0 && particle.alphavel === -1.6), "explosion alpha decay mismatch");

  const renderParticles = CL_AddParticles(runtime);
  assert.equal(renderParticles.length, 256, "CL_ExplosionParticles particles should reach the refresh particle list");
}

function verifyExplosionTempEntityRuntimeBranch(): void {
  const runtime = createRuntime();
  runtime.cl.time = 1357;
  const origin: vec3_t = [1, 2, 3];

  withMockRandom(0, () => {
    CL_ExecuteTempEntityEffects(runtime, {
      type: temp_event_t.TE_ROCKET_EXPLOSION,
      position: origin
    });
  });

  const particles = collectActiveParticles(runtime);
  assert.equal(particles.length, 256, "TE_ROCKET_EXPLOSION should dispatch to CL_ExplosionParticles");
  assert.ok(particles.every((particle) => particle.color === 0xe0), "TE_ROCKET_EXPLOSION particle color mismatch");
  assert.ok(particles.every((particle) => particle.org[0] === origin[0] - 16), "TE_ROCKET_EXPLOSION particle origin mismatch");

  const effects = CL_BuildTempEntityEffects({
    type: temp_event_t.TE_ROCKET_EXPLOSION,
    position: origin
  });
  const burst = effects.find((effect) => effect.kind === "explosion-particles");
  assert.ok(burst, "TE_ROCKET_EXPLOSION should expose explosion particles to apps/web metadata");
  assert.equal(burst.category, "particle", "explosion particles should remain tagged as particles");
  assert.deepEqual(burst.position, origin, "explosion particle metadata should preserve origin");
  assert.equal(burst.count, 256, "explosion particle metadata should preserve particle count");
  assert.equal(burst.color, 0xe0, "explosion particle metadata should preserve color base");
  assert.equal(burst.magnitude, 16, "explosion particle metadata should preserve origin jitter");
  assert.equal(burst.spacing, 192, "explosion particle metadata should preserve velocity span");
}

function verifyMonsterMuzzleFlash2Effects(): void {
  const runtime = createRuntime();
  runtime.cl.time = 2000;
  runtime.cl_entities[12].current.origin = [100, 200, 300];
  runtime.cl_entities[12].current.angles = [0, 0, 0];

  withMockRandom(0, () => {
    const infantry = CL_BuildMuzzleFlash2Effects({
      entity: 12,
      flashNumber: 26
    }, runtime);

    assert.equal(infantry[0]?.kind, "infantry-machinegun", "CL_ParseMuzzleFlash2 infantry kind mismatch");
    assert.equal(infantry[0]?.light?.radius, 200, "CL_ParseMuzzleFlash2 default radius mismatch");
    assert.equal(infantry[0]?.light?.durationMs, 0, "CL_ParseMuzzleFlash2 default die mismatch");
    assert.equal(infantry[0]?.light?.minlight, 32, "CL_ParseMuzzleFlash2 minlight mismatch");
    assert.deepEqual(infantry[0]?.light?.color, [1, 1, 0], "CL_ParseMuzzleFlash2 infantry color mismatch");
    assert.deepEqual(infantry[0]?.position, [126.6, 192.9, 313.1], "CL_ParseMuzzleFlash2 monster_flash_offset origin mismatch");
    assert.deepEqual(
      infantry.slice(1).map((effect) => effect.kind),
      ["particle-effect", "smoke-and-flash", "infantry-machinegun"],
      "CL_ParseMuzzleFlash2 infantry side-effect sequence mismatch"
    );
    assert.deepEqual(infantry[1], {
      category: "muzzleflash2",
      kind: "particle-effect",
      entity: 12,
      position: [126.6, 192.9, 313.1],
      color: 0,
      count: 40,
      packet: { entity: 12, flashNumber: 26 }
    }, "CL_ParseMuzzleFlash2 particle-effect metadata mismatch");
    assert.equal(infantry[3]?.sound?.name, "infantry/infatck1.wav", "CL_ParseMuzzleFlash2 soundname mismatch");
    assert.equal(infantry[3]?.sound?.attenuation, ATTN_NORM, "CL_ParseMuzzleFlash2 sound attenuation mismatch");

    const dlight = CL_AllocDlight(runtime, 12);
    dlight.origin = [...infantry[0]!.position!];
    dlight.radius = infantry[0]!.light!.radius;
    dlight.minlight = infantry[0]!.light!.minlight ?? 0;
    dlight.die = runtime.cl.time + infantry[0]!.light!.durationMs;
    dlight.color = [...infantry[0]!.light!.color];
    const refreshFrame = CL_BuildRefreshFrame(runtime, { predictMovement: false });
    assert.ok(
      refreshFrame.lights.some((light) => light.sourceEntity === 12 && light.intensity === 200 && light.kind === "dlight"),
      "CL_ParseMuzzleFlash2 dlight should reach ClientRefreshFrame.lights"
    );

    const tank = CL_BuildMuzzleFlash2Effects({
      entity: 12,
      flashNumber: 4
    }, runtime);
    assert.equal(tank.at(-1)?.sound?.name, "tank/tnkatk2a.wav", "CL_ParseMuzzleFlash2 random tank soundname mismatch");

    const widowBeam = CL_BuildMuzzleFlash2Effects({
      entity: 12,
      flashNumber: 195
    }, runtime);
    assert.equal(widowBeam[0]?.light?.radius, 300, "CL_ParseMuzzleFlash2 long beam radius mismatch");
    assert.equal(widowBeam[0]?.light?.durationMs, 200, "CL_ParseMuzzleFlash2 long beam die mismatch");
    assert.equal(widowBeam.length, 1, "CL_ParseMuzzleFlash2 widow beam should not emit sound or smoke metadata");
  });
}

function verifyPlayerMuzzleFlashEffects(): void {
  const runtime = createRuntime();
  runtime.cl.time = 1000;
  runtime.cl_entities[4].current.origin = [10, 20, 30];
  runtime.cl_entities[4].current.angles = [0, 0, 0];

  withMockRandom(0, () => {
    const blaster = CL_BuildMuzzleFlashEffects({
      entity: 4,
      weapon: MZ_BLASTER,
      silenced: false
    }, runtime);
    assert.equal(blaster[0]?.kind, "blaster", "CL_ParseMuzzleFlash MZ_BLASTER kind mismatch");
    assert.equal(blaster[0]?.light?.radius, 200, "CL_ParseMuzzleFlash unsilenced radius mismatch");
    assert.deepEqual(blaster[0]?.light?.color, [1, 1, 0], "CL_ParseMuzzleFlash blaster color mismatch");
    assert.equal(blaster[0]?.light?.minlight, 32, "CL_ParseMuzzleFlash minlight mismatch");
    assert.equal(blaster[1]?.sound?.name, "weapons/blastf1a.wav", "CL_ParseMuzzleFlash blaster sound mismatch");
    assert.equal(blaster[1]?.sound?.volume, 1, "CL_ParseMuzzleFlash unsilenced volume mismatch");

    const dlight = CL_AllocDlight(runtime, 4);
    dlight.origin = [...blaster[0]!.position!];
    dlight.radius = blaster[0]!.light!.radius;
    dlight.minlight = blaster[0]!.light!.minlight ?? 0;
    dlight.die = runtime.cl.time + blaster[0]!.light!.durationMs;
    dlight.color = [...blaster[0]!.light!.color];
    const refreshFrame = CL_BuildRefreshFrame(runtime, { predictMovement: false });
    assert.ok(
      refreshFrame.lights.some((light) => light.sourceEntity === 4 && light.intensity === 200 && light.kind === "dlight"),
      "CL_ParseMuzzleFlash dlight should reach ClientRefreshFrame.lights"
    );

    const silenced = CL_BuildMuzzleFlashEffects({
      entity: 4,
      weapon: MZ_BLASTER | MZ_SILENCED,
      silenced: true
    }, runtime);
    assert.equal(silenced[0]?.light?.radius, 100, "CL_ParseMuzzleFlash silenced radius mismatch");
    assert.equal(silenced[1]?.sound?.volume, 0.2, "CL_ParseMuzzleFlash silenced volume mismatch");

    const machinegun = CL_BuildMuzzleFlashEffects({
      entity: 4,
      weapon: MZ_MACHINEGUN,
      silenced: false
    }, runtime);
    assert.equal(machinegun[1]?.sound?.name, "weapons/machgf1b.wav", "CL_ParseMuzzleFlash machinegun soundname mismatch");

    const shotgun = CL_BuildMuzzleFlashEffects({
      entity: 4,
      weapon: MZ_SHOTGUN,
      silenced: false
    }, runtime);
    assert.deepEqual(shotgun.slice(1).map((effect) => effect.sound), [
      { name: "weapons/shotgf1b.wav", channel: CHAN_WEAPON, attenuation: ATTN_NORM, volume: 1 },
      { name: "weapons/shotgr1b.wav", channel: CHAN_AUTO, attenuation: ATTN_NORM, volume: 1, delayMs: 100 }
    ], "CL_ParseMuzzleFlash shotgun sound sequence mismatch");

    const chaingun2 = CL_BuildMuzzleFlashEffects({
      entity: 4,
      weapon: MZ_CHAINGUN2,
      silenced: false
    }, runtime);
    assert.equal(chaingun2[0]?.light?.radius, 225, "CL_ParseMuzzleFlash chaingun2 radius mismatch");
    assert.equal(chaingun2[0]?.light?.durationMs, 100, "CL_ParseMuzzleFlash chaingun2 long die mismatch");
    assert.deepEqual(chaingun2.slice(1).map((effect) => effect.sound?.delayMs ?? 0), [0, 50], "CL_ParseMuzzleFlash chaingun2 delays mismatch");

    const login = CL_BuildMuzzleFlashEffects({
      entity: 4,
      weapon: MZ_LOGIN,
      silenced: false
    }, runtime);
    assert.equal(login[0]?.light?.durationMs, 1000, "CL_ParseMuzzleFlash login die mismatch");
    assert.ok(login.some((effect) => effect.kind === "logout-effect"), "CL_ParseMuzzleFlash login should append CL_LogoutEffect particles");
    assert.equal(login.at(-1)?.sound?.volume, 1, "CL_ParseMuzzleFlash login sound ignores silenced volume");
  });
}

function verifyDlightManagement(): void {
  const runtime = createRuntime();
  runtime.cl.time = 1000;
  runtime.cls.frametime = 0.1;

  assert.equal(runtime.cl.dlights.length, MAX_DLIGHTS, "cl_dlights array length mismatch");

  const first = CL_AllocDlight(runtime, 7);
  first.origin = [1, 2, 3];
  first.color = [0.2, 0.4, 0.6];
  first.radius = 120;
  first.die = 2000;
  first.decay = 50;
  first.minlight = 12;

  const sameKey = CL_AllocDlight(runtime, 7);
  assert.equal(sameKey, first, "CL_AllocDlight should reuse an exact key slot first");
  assert.equal(sameKey.key, 7, "CL_AllocDlight reused key mismatch");
  assert.deepEqual(sameKey.origin, [0, 0, 0], "CL_AllocDlight should clear reused slots");
  assert.equal(sameKey.radius, 0, "CL_AllocDlight should zero reused radius");

  sameKey.die = 1500;
  sameKey.radius = 80;
  const expired = runtime.cl.dlights[1]!;
  expired.key = 99;
  expired.die = 999;
  expired.radius = 40;

  const reusedExpired = CL_AllocDlight(runtime, 0);
  assert.equal(reusedExpired, expired, "CL_AllocDlight should reuse the first expired slot for key 0");
  assert.equal(reusedExpired.key, 0, "CL_AllocDlight expired slot key mismatch");
  assert.equal(reusedExpired.radius, 0, "CL_AllocDlight should clear expired slot radius");

  for (const dlight of runtime.cl.dlights) {
    dlight.die = runtime.cl.time + 1000;
    dlight.radius = 10;
  }
  const fallback = CL_AllocDlight(runtime, 0);
  assert.equal(fallback, runtime.cl.dlights[0], "CL_AllocDlight should fall back to slot 0 when none are free");

  CL_NewDlight(runtime, 11, 4, 5, 6, 90, 250);
  const created = runtime.cl.dlights.find((dlight) => dlight.key === 11);
  assert.ok(created, "CL_NewDlight should allocate a keyed light");
  assert.deepEqual(created.origin, [4, 5, 6], "CL_NewDlight origin mismatch");
  assert.equal(created.radius, 90, "CL_NewDlight radius mismatch");
  assert.equal(created.die, 1250, "CL_NewDlight die time mismatch");

  CL_ClearDlights(runtime);
  assert.equal(runtime.cl.dlights.length, MAX_DLIGHTS, "CL_ClearDlights length mismatch");
  assert.ok(runtime.cl.dlights.every((dlight) => dlight.radius === 0), "CL_ClearDlights radius reset mismatch");
  assert.ok(runtime.cl.dlights.every((dlight) => dlight.key === 0), "CL_ClearDlights key reset mismatch");

  const expiredFirst = runtime.cl.dlights[0]!;
  const laterLive = runtime.cl.dlights[1]!;
  expiredFirst.radius = 20;
  expiredFirst.die = runtime.cl.time - 1;
  laterLive.radius = 70;
  laterLive.die = runtime.cl.time + 1000;
  laterLive.decay = 100;
  CL_RunDLights(runtime);
  assert.equal(expiredFirst.radius, 0, "CL_RunDLights should expire the first dead light");
  assert.equal(laterLive.radius, 70, "CL_RunDLights should preserve later lights after the original early return");

  laterLive.decay = 100;
  CL_RunDLights(runtime);
  assert.equal(laterLive.radius, 60, "CL_RunDLights decay mismatch");

  laterLive.color = [-1, -1, -1];
  laterLive.minlight = 4;
  const lights = CL_AddDLights(runtime);
  assert.equal(lights.length, 1, "CL_AddDLights active count mismatch");
  assert.deepEqual(lights[0], {
    origin: [0, 0, 0],
    intensity: 60,
    color: [-1, -1, -1],
    minlight: 4,
    sourceEntity: 0,
    kind: "dlight"
  }, "CL_AddDLights output mismatch");

  const refreshFrame = CL_BuildRefreshFrame(runtime, { predictMovement: false });
  assert.ok(
    refreshFrame.lights.some((light) => light.kind === "dlight" && light.intensity === 50),
    "CL_AddDLights should reach the refresh frame after runtime decay"
  );
}

function verifyBigTeleportRuntimeParticles(): void {
  const runtime = createRuntime();
  runtime.cl.time = 8642;
  const origin: vec3_t = [128, -64, 32];

  withMockRandom(0, () => {
    CL_BigTeleportParticles(runtime, origin);
  });

  const particles = collectActiveParticles(runtime);
  assert.equal(particles.length, 4096, "CL_BigTeleportParticles should allocate the original 4096 particles");
  assert.equal(runtime.cl.free_particles, -1, "CL_BigTeleportParticles should exhaust the original particle pool");
  assert.ok(particles.every((particle) => particle.time === runtime.cl.time), "big teleport particles should preserve cl.time");
  assert.ok(particles.every((particle) => particle.color === 16), "big teleport colortable index mismatch");
  assert.ok(particles.every((particle) => particle.org[0] === origin[0]), "big teleport x origin mismatch");
  assert.ok(particles.every((particle) => particle.org[1] === origin[1]), "big teleport y origin mismatch");
  assert.ok(particles.every((particle) => particle.org[2] === origin[2] + 8), "big teleport z origin mismatch");
  assert.ok(particles.every((particle) => particle.vel[0] === 70 && particle.vel[1] === 0), "big teleport horizontal velocity mismatch");
  assert.ok(particles.every((particle) => particle.vel[2] === -100), "big teleport vertical velocity mismatch");
  assert.ok(particles.every((particle) => particle.accel[0] === -100 && particle.accel[1] === 0 && particle.accel[2] === 160), "big teleport acceleration mismatch");
  assert.ok(particles.every((particle) => particle.alpha === 1.0 && particle.alphavel === -0.6), "big teleport alpha decay mismatch");

  const renderParticles = CL_AddParticles(runtime);
  assert.equal(renderParticles.length, 4096, "CL_BigTeleportParticles particles should reach the refresh particle list");
}

function verifyBigTeleportTempEntityRuntimeBranch(): void {
  const runtime = createRuntime();
  runtime.cl.time = 9753;
  const origin: vec3_t = [4, 5, 6];

  withMockRandom(0, () => {
    CL_ExecuteTempEntityEffects(runtime, {
      type: temp_event_t.TE_BOSSTPORT,
      position: origin
    });
  });

  const particles = collectActiveParticles(runtime);
  assert.equal(particles.length, 4096, "TE_BOSSTPORT should dispatch to CL_BigTeleportParticles");
  assert.ok(particles.every((particle) => particle.color === 16), "TE_BOSSTPORT particle color mismatch");
  assert.ok(particles.every((particle) => particle.org[2] === origin[2] + 8), "TE_BOSSTPORT particle origin mismatch");

  const effects = CL_BuildTempEntityEffects({
    type: temp_event_t.TE_BOSSTPORT,
    position: origin
  });
  const burst = effects.find((effect) => effect.kind === "big-teleport-particles");
  assert.ok(burst, "TE_BOSSTPORT should expose big teleport particles to apps/web metadata");
  assert.equal(burst.category, "particle", "big teleport particles should remain tagged as particles");
  assert.deepEqual(burst.position, origin, "big teleport particle metadata should preserve origin");
  assert.equal(burst.count, 4096, "big teleport particle metadata should preserve particle count");
  assert.ok(effects.some((effect) => effect.sound?.name === "misc/bigtele.wav"), "TE_BOSSTPORT should preserve the original big teleport sound");
}

function verifyBlasterRuntimeParticles(): void {
  const runtime = createRuntime();
  runtime.cl.time = 7531;
  const origin: vec3_t = [12, -8, 64];
  const direction: vec3_t = [1, -2, 0.5];
  const randomUnit = 9 / 0x7fffffff;

  withMockRandom(randomUnit, () => {
    CL_BlasterParticles(runtime, origin, direction);
  });

  const particles = collectActiveParticles(runtime);
  assert.equal(particles.length, 40, "CL_BlasterParticles should allocate the original local count = 40 particles");
  assert.equal(runtime.cl.free_particles, 40, "CL_BlasterParticles free list should advance by count");
  assert.ok(particles.every((particle) => particle.time === runtime.cl.time), "CL_BlasterParticles should preserve cl.time");
  assert.ok(particles.every((particle) => particle.color === 0xe1), "CL_BlasterParticles color should preserve 0xe0 + (rand&7)");
  assert.ok(
    particles.every((particle) => (
      particle.org[0] === origin[0] - 3 + (9 * direction[0])
      && particle.org[1] === origin[1] - 3 + (9 * direction[1])
      && particle.org[2] === origin[2] - 3 + (9 * direction[2])
    )),
    "CL_BlasterParticles should apply jitter and local d = rand&15 displacement"
  );
  const expectedCrand = (randomUnit * 2) - 1;
  assert.ok(
    particles.every((particle) => (
      almostEqual(particle.vel[0], (direction[0] * 30) + (expectedCrand * 40))
      && almostEqual(particle.vel[1], (direction[1] * 30) + (expectedCrand * 40))
      && almostEqual(particle.vel[2], (direction[2] * 30) + (expectedCrand * 40))
    )),
    "CL_BlasterParticles velocity should preserve dir * 30 + crand() * 40"
  );
  assert.ok(particles.every((particle) => particle.accel[0] === 0 && particle.accel[1] === 0 && particle.accel[2] === -40), "CL_BlasterParticles gravity mismatch");
  const expectedAlphavel = -1.0 / (0.5 + (randomUnit * 0.3));
  assert.ok(particles.every((particle) => particle.alpha === 1.0 && almostEqual(particle.alphavel, expectedAlphavel)), "CL_BlasterParticles alpha decay mismatch");

  const renderParticles = CL_AddParticles(runtime);
  assert.equal(renderParticles.length, 40, "CL_BlasterParticles particles should reach the refresh particle list");
}

function verifyBlasterTempEntityRuntimeBranch(): void {
  const runtime = createRuntime();
  runtime.cl.time = 8640;
  const origin: vec3_t = [16, 24, 32];

  withMockRandom(9 / 0x7fffffff, () => {
    CL_ExecuteTempEntityEffects(runtime, {
      type: temp_event_t.TE_BLASTER,
      position: origin,
      directionByte: 0
    });
  });

  const particles = collectActiveParticles(runtime);
  assert.equal(particles.length, 40, "TE_BLASTER should dispatch to CL_BlasterParticles");
  assert.ok(particles.every((particle) => particle.color === 0xe1), "TE_BLASTER blaster particle color mismatch");
  assert.equal(runtime.cl.dlights[0].radius, 150, "TE_BLASTER should keep the original impact dlight radius");
  assert.deepEqual(runtime.cl.dlights[0].origin, origin, "TE_BLASTER dlight origin mismatch");
  assert.deepEqual(runtime.cl.dlights[0].color, [1, 1, 0], "TE_BLASTER dlight color mismatch");
  assert.equal(runtime.cl.dlights[0].die, runtime.cl.time + 100, "TE_BLASTER dlight die mismatch");

  const effects = CL_BuildTempEntityEffects({
    type: temp_event_t.TE_BLASTER,
    position: origin,
    directionByte: 0
  });
  const burst = effects.find((effect) => effect.kind === "blaster-particles");
  assert.ok(burst, "TE_BLASTER should expose blaster particles to apps/web metadata");
  assert.equal(burst.category, "particle", "blaster particles should remain tagged as particles");
  assert.deepEqual(burst.position, origin, "blaster particle metadata should preserve origin");
  assert.equal(burst.count, 40, "blaster particle metadata should preserve local count");
  assert.equal(burst.color, 0xe0, "blaster particle metadata should preserve color base");
  assert.ok(effects.some((effect) => effect.sound?.name === "weapons/lashit.wav"), "TE_BLASTER should preserve the original impact sound");
  assert.ok(effects.some((effect) => effect.light?.radius === 150), "TE_BLASTER should expose impact light metadata");
}

function verifyBlasterTrailRuntimeParticles(): void {
  const runtime = createRuntime();
  runtime.cl.time = 9750;
  const start: vec3_t = [0, 0, 0];
  const end: vec3_t = [13, 0, 0];
  const randomUnit = 0.75;
  const expectedCrand = (randomUnit * 2) - 1;

  withMockRandom(randomUnit, () => {
    CL_BlasterTrail(runtime, start, end);
  });

  const particles = collectActiveParticles(runtime);
  assert.equal(particles.length, 3, "CL_BlasterTrail should emit one particle per 5-unit step while len > 0");
  assert.ok(particles.every((particle) => particle.time === runtime.cl.time), "CL_BlasterTrail particle time mismatch");
  assert.ok(particles.every((particle) => particle.color === 0xe0), "CL_BlasterTrail color mismatch");
  assert.ok(particles.every((particle) => particle.alpha === 1.0), "CL_BlasterTrail alpha mismatch");
  assert.ok(particles.every((particle) => particle.accel[0] === 0 && particle.accel[1] === 0 && particle.accel[2] === 0), "CL_BlasterTrail acceleration mismatch");
  assert.ok(
    particles.every((particle) => particle.vel[0] === expectedCrand * 5 && particle.vel[1] === expectedCrand * 5 && particle.vel[2] === expectedCrand * 5),
    "CL_BlasterTrail velocity jitter mismatch"
  );
  const expectedAlphavel = -1.0 / (0.3 + (randomUnit * 0.2));
  assert.ok(particles.every((particle) => almostEqual(particle.alphavel, expectedAlphavel)), "CL_BlasterTrail alpha decay mismatch");

  const emittedX = particles.map((particle) => particle.org[0]).sort((left, right) => left - right);
  assert.deepEqual(emittedX, [0.5, 5.5, 10.5], "CL_BlasterTrail should advance move by the normalized vec * dec");
  assert.ok(particles.every((particle) => particle.org[1] === 0.5 && particle.org[2] === 0.5), "CL_BlasterTrail origin jitter mismatch");

  const metadata = CL_BlasterTrail(start, end);
  assert.equal(metadata[0]?.kind, "blaster-trail", "CL_BlasterTrail metadata kind mismatch");
  assert.deepEqual(metadata[0]?.position, start, "CL_BlasterTrail metadata start mismatch");
  assert.deepEqual(metadata[0]?.position2, end, "CL_BlasterTrail metadata end mismatch");
  assert.equal(metadata[0]?.color, 0xe0, "CL_BlasterTrail metadata color mismatch");
  assert.equal(metadata[0]?.spacing, 5, "CL_BlasterTrail metadata spacing mismatch");

  const renderParticles = CL_AddParticles(runtime);
  assert.equal(renderParticles.length, 3, "CL_BlasterTrail particles should reach the refresh particle list");
}

function verifyQuadTrailRuntimeParticles(): void {
  const runtime = createRuntime();
  runtime.cl.time = 9860;
  const start: vec3_t = [0, 0, 0];
  const end: vec3_t = [13, 0, 0];
  const randomUnit = 0.75;
  const expectedCrand = (randomUnit * 2) - 1;

  withMockRandom(randomUnit, () => {
    CL_QuadTrail(runtime, start, end);
  });

  const particles = collectActiveParticles(runtime);
  assert.equal(particles.length, 3, "CL_QuadTrail should emit one particle per 5-unit step while len > 0");
  assert.ok(particles.every((particle) => particle.time === runtime.cl.time), "CL_QuadTrail particle time mismatch");
  assert.ok(particles.every((particle) => particle.color === 115), "CL_QuadTrail color mismatch");
  assert.ok(particles.every((particle) => particle.alpha === 1.0), "CL_QuadTrail alpha mismatch");
  assert.ok(particles.every((particle) => particle.accel[0] === 0 && particle.accel[1] === 0 && particle.accel[2] === 0), "CL_QuadTrail acceleration mismatch");
  assert.ok(
    particles.every((particle) => particle.vel[0] === expectedCrand * 5 && particle.vel[1] === expectedCrand * 5 && particle.vel[2] === expectedCrand * 5),
    "CL_QuadTrail velocity jitter mismatch"
  );
  const expectedAlphavel = -1.0 / (0.8 + (randomUnit * 0.2));
  assert.ok(particles.every((particle) => almostEqual(particle.alphavel, expectedAlphavel)), "CL_QuadTrail alpha decay mismatch");

  const emittedX = particles.map((particle) => particle.org[0]).sort((left, right) => left - right);
  assert.deepEqual(emittedX, [8, 13, 18], "CL_QuadTrail should advance move by the normalized vec * dec");
  assert.ok(particles.every((particle) => particle.org[1] === 8 && particle.org[2] === 8), "CL_QuadTrail origin jitter mismatch");

  const metadata = CL_QuadTrail(start, end);
  assert.equal(metadata[0]?.kind, "quad-trail", "CL_QuadTrail metadata kind mismatch");
  assert.deepEqual(metadata[0]?.position, start, "CL_QuadTrail metadata start mismatch");
  assert.deepEqual(metadata[0]?.position2, end, "CL_QuadTrail metadata end mismatch");
  assert.equal(metadata[0]?.color, 115, "CL_QuadTrail metadata color mismatch");
  assert.equal(metadata[0]?.spacing, 5, "CL_QuadTrail metadata spacing mismatch");

  const renderParticles = CL_AddParticles(runtime);
  assert.equal(renderParticles.length, 3, "CL_QuadTrail particles should reach the refresh particle list");
}

function verifyFlagTrailRuntimeParticles(): void {
  const runtime = createRuntime();
  runtime.cl.time = 9970;
  const start: vec3_t = [0, 0, 0];
  const end: vec3_t = [13, 0, 0];
  const randomUnit = 0.75;
  const expectedCrand = (randomUnit * 2) - 1;

  withMockRandom(randomUnit, () => {
    CL_FlagTrail(runtime, start, end, 242);
  });

  const particles = collectActiveParticles(runtime);
  assert.equal(particles.length, 3, "CL_FlagTrail should emit one particle per 5-unit step while len > 0");
  assert.ok(particles.every((particle) => particle.time === runtime.cl.time), "CL_FlagTrail particle time mismatch");
  assert.ok(particles.every((particle) => particle.color === 242), "CL_FlagTrail color mismatch");
  assert.ok(particles.every((particle) => particle.alpha === 1.0), "CL_FlagTrail alpha mismatch");
  assert.ok(particles.every((particle) => particle.accel[0] === 0 && particle.accel[1] === 0 && particle.accel[2] === 0), "CL_FlagTrail acceleration mismatch");
  assert.ok(
    particles.every((particle) => particle.vel[0] === expectedCrand * 5 && particle.vel[1] === expectedCrand * 5 && particle.vel[2] === expectedCrand * 5),
    "CL_FlagTrail velocity jitter mismatch"
  );
  const expectedAlphavel = -1.0 / (0.8 + (randomUnit * 0.2));
  assert.ok(particles.every((particle) => almostEqual(particle.alphavel, expectedAlphavel)), "CL_FlagTrail alpha decay mismatch");

  const emittedX = particles.map((particle) => particle.org[0]).sort((left, right) => left - right);
  assert.deepEqual(emittedX, [8, 13, 18], "CL_FlagTrail should advance move by the normalized vec * dec");
  assert.ok(particles.every((particle) => particle.org[1] === 8 && particle.org[2] === 8), "CL_FlagTrail origin jitter mismatch");

  const metadata = CL_FlagTrail(start, end, 115);
  assert.equal(metadata[0]?.kind, "flag-trail", "CL_FlagTrail metadata kind mismatch");
  assert.deepEqual(metadata[0]?.position, start, "CL_FlagTrail metadata start mismatch");
  assert.deepEqual(metadata[0]?.position2, end, "CL_FlagTrail metadata end mismatch");
  assert.equal(metadata[0]?.color, 115, "CL_FlagTrail metadata color mismatch");
  assert.equal(metadata[0]?.spacing, 5, "CL_FlagTrail metadata spacing mismatch");

  const renderParticles = CL_AddParticles(runtime);
  assert.equal(renderParticles.length, 3, "CL_FlagTrail particles should reach the refresh particle list");

  const runtimeBranch = createRuntime();
  runtimeBranch.cl.time = 10010;
  runtimeBranch.cl_entities[7].lerp_origin = [0, 0, 0];
  withMockRandom(randomUnit, () => {
    CL_ExecutePacketEntityEffects(runtimeBranch, [{
      number: 7,
      effects: EF_FLAG2,
      origin: end,
      modelindex: 1,
      viewerEntity: false
    }]);
  });
  assert.equal(collectActiveParticles(runtimeBranch).length, 3, "EF_FLAG2 should dispatch to CL_FlagTrail for non-viewer modeled entities");
  assert.ok(collectActiveParticles(runtimeBranch).every((particle) => particle.color === 115), "EF_FLAG2 should use blue flag color 115");

  const noModelRuntime = createRuntime();
  noModelRuntime.cl_entities[7].lerp_origin = [0, 0, 0];
  CL_ExecutePacketEntityEffects(noModelRuntime, [{
    number: 7,
    effects: EF_FLAG1,
    origin: end
  }]);
  assert.equal(collectActiveParticles(noModelRuntime).length, 0, "EF_FLAG1 without a model must not emit flag particles");

  const viewerRuntime = createRuntime();
  viewerRuntime.cl_entities[7].lerp_origin = [0, 0, 0];
  CL_ExecutePacketEntityEffects(viewerRuntime, [{
    number: 7,
    effects: EF_FLAG1,
    origin: end,
    modelindex: 1,
    viewerEntity: true
  }]);
  assert.equal(collectActiveParticles(viewerRuntime).length, 0, "viewer EF_FLAG1 should preserve the C path with light only and no flag particles");
}

function verifyDiminishingTrailRuntimeParticles(): void {
  const runtime = createRuntime();
  runtime.cl.time = 10080;
  const start: vec3_t = [0, 0, 0];
  const end: vec3_t = [1.3, 0, 0];
  const old = runtime.cl_entities[7];
  old.trailcount = 950;
  const randomUnit = 0;
  const expectedCrand = (randomUnit * 2) - 1;

  withMockRandom(randomUnit, () => {
    CL_DiminishingTrail(runtime, start, end, old, EF_GIB);
  });

  const particles = collectActiveParticles(runtime);
  assert.equal(particles.length, 3, "CL_DiminishingTrail should emit one particle per 0.5-unit step while len > 0");
  assert.equal(runtime.cl.free_particles, 3, "CL_DiminishingTrail free list should advance by emitted particles");
  assert.equal(old.trailcount, 935, "CL_DiminishingTrail should decay trailcount by 5 per step down to the C floor");
  assert.ok(particles.every((particle) => particle.time === runtime.cl.time), "CL_DiminishingTrail particle time mismatch");
  assert.ok(particles.every((particle) => particle.color >= 0xe8 && particle.color <= 0xef), "CL_DiminishingTrail gib color family mismatch");
  assert.ok(particles.every((particle) => particle.alpha === 1.0), "CL_DiminishingTrail alpha mismatch");
  assert.ok(particles.every((particle) => particle.accel[0] === 0 && particle.accel[1] === 0 && particle.accel[2] === 0), "CL_DiminishingTrail gib acceleration mismatch");
  assert.ok(
    particles.every((particle) => particle.vel[0] === expectedCrand * 15 && particle.vel[1] === expectedCrand * 15 && particle.vel[2] === (expectedCrand * 15) - 40),
    "CL_DiminishingTrail gib velocity scale/gravity mismatch"
  );
  const expectedAlphavel = -1.0 / (1 + (randomUnit * 0.4));
  assert.ok(particles.every((particle) => almostEqual(particle.alphavel, expectedAlphavel)), "CL_DiminishingTrail gib alpha decay mismatch");

  const emittedX = particles.map((particle) => particle.org[0]).sort((left, right) => left - right);
  assert.deepEqual(emittedX, [-4, -3.5, -3], "CL_DiminishingTrail should advance move by the normalized vec * dec");
  assert.ok(particles.every((particle) => particle.org[1] === -4 && particle.org[2] === -4), "CL_DiminishingTrail gib origin scale mismatch");

  const metadataOld = createRuntime().cl_entities[7];
  metadataOld.trailcount = 950;
  const metadata = CL_DiminishingTrail(start, end, metadataOld, EF_GREENGIB);
  assert.equal(metadata[0]?.kind, "diminishing-trail-greengib", "CL_DiminishingTrail metadata kind mismatch");
  assert.deepEqual(metadata[0]?.position, start, "CL_DiminishingTrail metadata start mismatch");
  assert.deepEqual(metadata[0]?.position2, end, "CL_DiminishingTrail metadata end mismatch");
  assert.equal(metadata[0]?.color, 0xdb, "CL_DiminishingTrail metadata color mismatch");
  assert.equal(metadata[0]?.spacing, 0.5, "CL_DiminishingTrail metadata spacing mismatch");
  assert.equal(metadataOld.trailcount, 935, "CL_DiminishingTrail metadata should mirror C trailcount decay per step");

  const renderParticles = CL_AddParticles(runtime);
  assert.equal(renderParticles.length, 3, "CL_DiminishingTrail particles should reach the refresh particle list");

  const grenadeRuntime = createRuntime();
  grenadeRuntime.cl.time = 10120;
  grenadeRuntime.cl_entities[9].lerp_origin = [0, 0, 0];
  grenadeRuntime.cl_entities[9].trailcount = 850;
  withMockRandom(randomUnit, () => {
    CL_ExecutePacketEntityEffects(grenadeRuntime, [{
      number: 9,
      effects: EF_GRENADE,
      origin: end
    }]);
  });
  const grenadeParticles = collectActiveParticles(grenadeRuntime);
  assert.equal(grenadeParticles.length, 3, "EF_GRENADE should dispatch to CL_DiminishingTrail");
  assert.ok(grenadeParticles.every((particle) => particle.color >= 4 && particle.color <= 11), "EF_GRENADE should use the regular diminishing trail palette");
  assert.ok(grenadeParticles.every((particle) => particle.accel[2] === 20), "EF_GRENADE should use upward diminishing trail acceleration");

  const greengibRuntime = createRuntime();
  greengibRuntime.cl.time = 10160;
  greengibRuntime.cl_entities[10].lerp_origin = [0, 0, 0];
  greengibRuntime.cl_entities[10].trailcount = 850;
  withMockRandom(randomUnit, () => {
    CL_ExecutePacketEntityEffects(greengibRuntime, [{
      number: 10,
      effects: EF_GREENGIB,
      origin: end
    }]);
  });
  assert.ok(collectActiveParticles(greengibRuntime).every((particle) => particle.color >= 0xdb && particle.color <= 0xe2), "EF_GREENGIB should use the green gib palette");
}

function verifyRocketTrailRuntimeParticles(): void {
  const runtime = createRuntime();
  runtime.cl.time = 10220;
  const start: vec3_t = [0, 0, 0];
  const end: vec3_t = [1.3, 0, 0];
  const old = runtime.cl_entities[7];
  old.trailcount = 950;
  const randomUnit = 0;
  const expectedCrand = (randomUnit * 2) - 1;

  withMockRandom(randomUnit, () => {
    CL_RocketTrail(runtime, start, end, old);
  });

  const particles = collectActiveParticles(runtime);
  assert.equal(particles.length, 5, "CL_RocketTrail should emit smoke plus fire particles while len > 0");
  assert.equal(old.trailcount, 935, "CL_RocketTrail smoke phase should decay trailcount through CL_DiminishingTrail");
  assert.ok(particles.every((particle) => particle.time === runtime.cl.time), "CL_RocketTrail particle time mismatch");

  const smokeParticles = particles.filter((particle) => particle.color >= 4 && particle.color <= 11);
  const fireParticles = particles.filter((particle) => particle.color >= 0xdc && particle.color <= 0xdf);
  assert.equal(smokeParticles.length, 3, "CL_RocketTrail should preserve the EF_ROCKET smoke trail");
  assert.equal(fireParticles.length, 2, "CL_RocketTrail should preserve the one-unit fire trail");
  assert.ok(smokeParticles.every((particle) => particle.accel[2] === 20), "CL_RocketTrail smoke acceleration mismatch");
  assert.ok(fireParticles.every((particle) => particle.accel[2] === -40), "CL_RocketTrail fire gravity mismatch");
  assert.ok(
    fireParticles.every((particle) => particle.vel[0] === expectedCrand * 20 && particle.vel[1] === expectedCrand * 20 && particle.vel[2] === expectedCrand * 20),
    "CL_RocketTrail fire velocity jitter mismatch"
  );
  assert.ok(fireParticles.every((particle) => almostEqual(particle.alphavel, -1.0)), "CL_RocketTrail fire alpha decay mismatch");

  const fireX = fireParticles.map((particle) => particle.org[0]).sort((left, right) => left - right);
  assert.deepEqual(fireX, [-5, -4], "CL_RocketTrail fire should advance move by the normalized vec * dec");

  const metadataOld = createRuntime().cl_entities[7];
  metadataOld.trailcount = 950;
  const metadata = CL_RocketTrail(start, end, metadataOld);
  assert.equal(metadata[0]?.kind, "diminishing-trail", "CL_RocketTrail metadata smoke kind mismatch");
  assert.equal(metadata[1]?.kind, "rocket-fire-trail", "CL_RocketTrail metadata fire kind mismatch");
  assert.deepEqual(metadata[1]?.position, start, "CL_RocketTrail fire metadata start mismatch");
  assert.deepEqual(metadata[1]?.position2, end, "CL_RocketTrail fire metadata end mismatch");
  assert.equal(metadata[1]?.color, 0xdc, "CL_RocketTrail fire metadata color mismatch");
  assert.equal(metadata[1]?.spacing, 1, "CL_RocketTrail fire metadata spacing mismatch");

  const renderParticles = CL_AddParticles(runtime);
  assert.equal(renderParticles.length, 5, "CL_RocketTrail particles should reach the refresh particle list");

  const runtimeBranch = createRuntime();
  runtimeBranch.cl.time = 10280;
  runtimeBranch.cl_entities[9].lerp_origin = [0, 0, 0];
  runtimeBranch.cl_entities[9].trailcount = 950;
  withMockRandom(randomUnit, () => {
    CL_ExecutePacketEntityEffects(runtimeBranch, [{
      number: 9,
      effects: EF_ROCKET,
      origin: end
    }]);
  });
  assert.equal(collectActiveParticles(runtimeBranch).length, 5, "EF_ROCKET should dispatch to CL_RocketTrail");

  const refreshRuntime = createRuntime();
  refreshRuntime.cl.frame.num_entities = 1;
  refreshRuntime.cl.frame.parse_entities = 0;
  refreshRuntime.cl_parse_entities[0].number = 11;
  refreshRuntime.cl_parse_entities[0].effects = EF_ROCKET;
  refreshRuntime.cl_parse_entities[0].origin = [...end] as vec3_t;
  refreshRuntime.cl_entities[11].current.number = 11;
  refreshRuntime.cl_entities[11].current.origin = [...end] as vec3_t;
  const frame = CL_BuildRefreshFrame(refreshRuntime, { viewerEntity: 0 });
  assert.ok(frame.lights.some((light) => light.kind === "rocket" && light.intensity === 200), "EF_ROCKET should expose the original rocket dlight to refresh");
}

function verifyRailTrailRuntimeParticles(): void {
  const runtime = createRuntime();
  runtime.cl.time = 10340;
  const start: vec3_t = [0, 0, 0];
  const end: vec3_t = [2.5, 0, 0];
  const randomUnit = 0;
  const expectedCrand = (randomUnit * 2) - 1;

  withMockRandom(randomUnit, () => {
    CL_RailTrail(runtime, start, end);
  });

  const particles = collectActiveParticles(runtime);
  assert.equal(particles.length, 7, "CL_RailTrail should emit the core spiral plus 0.75-unit spark trail");
  assert.ok(particles.every((particle) => particle.time === runtime.cl.time), "CL_RailTrail particle time mismatch");

  const coreParticles = particles.filter((particle) => particle.color >= 0x74 && particle.color <= 0x7b);
  const sparkParticles = particles.filter((particle) => particle.color >= 0 && particle.color <= 15);
  assert.equal(coreParticles.length, 3, "CL_RailTrail should preserve the one-particle-per-unit rail core");
  assert.equal(sparkParticles.length, 4, "CL_RailTrail should preserve the 0.75-unit spark pass");
  assert.ok(coreParticles.every((particle) => particle.accel[0] === 0 && particle.accel[1] === 0 && particle.accel[2] === 0), "CL_RailTrail core acceleration mismatch");
  assert.ok(sparkParticles.every((particle) => particle.accel[0] === 0 && particle.accel[1] === 0 && particle.accel[2] === 0), "CL_RailTrail spark acceleration mismatch");
  assert.ok(coreParticles.every((particle) => particle.alpha === 1.0 && almostEqual(particle.alphavel, -1.0)), "CL_RailTrail core alpha decay mismatch");
  assert.ok(sparkParticles.every((particle) => particle.alpha === 1.0 && almostEqual(particle.alphavel, -1.0 / 0.6)), "CL_RailTrail spark alpha decay mismatch");

  const coreX = coreParticles.map((particle) => Number(particle.org[0].toFixed(12))).sort((left, right) => left - right);
  assert.deepEqual(coreX, [0, 1, 2], "CL_RailTrail core should advance move by the normalized vec");
  assert.ok(coreParticles.some((particle) => particle.org[1] === -3 && particle.org[2] === 0), "CL_RailTrail core should use MakeNormalVectors right/up spiral");
  assert.ok(coreParticles.every((particle) => almostEqual(vectorLength(particle.vel), 6)), "CL_RailTrail core velocity should follow dir * 6");

  const sparkX = sparkParticles.map((particle) => Number(particle.org[0].toFixed(12))).sort((left, right) => left - right);
  assert.deepEqual(sparkX, [-3, -2.25, -1.5, -0.75], "CL_RailTrail spark pass should advance by vec * dec");
  assert.ok(
    sparkParticles.every((particle) => particle.org[1] === -3 && particle.org[2] === -3),
    "CL_RailTrail spark origin jitter mismatch"
  );
  assert.ok(
    sparkParticles.every((particle) => particle.vel[0] === expectedCrand * 3 && particle.vel[1] === expectedCrand * 3 && particle.vel[2] === expectedCrand * 3),
    "CL_RailTrail spark velocity jitter mismatch"
  );

  const metadata = CL_RailTrail(start, end);
  assert.equal(metadata[0]?.kind, "rail-core-trail", "CL_RailTrail core metadata kind mismatch");
  assert.equal(metadata[0]?.color, 0x74, "CL_RailTrail core metadata color mismatch");
  assert.equal(metadata[0]?.spacing, 1, "CL_RailTrail core metadata spacing mismatch");
  assert.equal(metadata[1]?.kind, "rail-spark-trail", "CL_RailTrail spark metadata kind mismatch");
  assert.equal(metadata[1]?.color, 0, "CL_RailTrail spark metadata color mismatch");
  assert.equal(metadata[1]?.spacing, 0.75, "CL_RailTrail spark metadata spacing mismatch");

  const renderParticles = CL_AddParticles(runtime);
  assert.equal(renderParticles.length, 7, "CL_RailTrail particles should reach the refresh particle list");

  const tempRuntime = createRuntime();
  tempRuntime.cl.time = 10380;
  withMockRandom(randomUnit, () => {
    CL_ExecuteTempEntityEffects(tempRuntime, {
      type: temp_event_t.TE_RAILTRAIL,
      position: start,
      position2: end
    });
  });
  assert.equal(collectActiveParticles(tempRuntime).length, 7, "TE_RAILTRAIL should dispatch to CL_RailTrail");

  const effects = CL_BuildTempEntityEffects({
    type: temp_event_t.TE_RAILTRAIL,
    position: start,
    position2: end
  });
  assert.ok(effects.some((effect) => effect.kind === "rail-core-trail"), "TE_RAILTRAIL should expose rail core metadata");
  assert.ok(effects.some((effect) => effect.kind === "rail-spark-trail"), "TE_RAILTRAIL should expose rail spark metadata");
  assert.ok(effects.some((effect) => effect.sound?.name === "weapons/railgf1a.wav"), "TE_RAILTRAIL should preserve railgun sound metadata");
}

function verifyIonripperTrailRuntimeParticles(): void {
  const runtime = createRuntime();
  runtime.cl.time = 10420;
  const start: vec3_t = [0, 0, 0];
  const end: vec3_t = [12, 0, 0];

  withMockRandom(0, () => {
    CL_IonripperTrail(runtime, start, end);
  });

  const particles = collectActiveParticles(runtime);
  assert.equal(particles.length, 3, "CL_IonripperTrail should emit one particle every 5 units while len remains positive");
  assert.ok(particles.every((particle) => particle.time === runtime.cl.time), "CL_IonripperTrail particle time mismatch");
  assert.ok(particles.every((particle) => particle.accel[0] === 0 && particle.accel[1] === 0 && particle.accel[2] === 0), "CL_IonripperTrail acceleration mismatch");
  assert.ok(particles.every((particle) => particle.alpha === 0.5 && almostEqual(particle.alphavel, -1.0 / 0.3)), "CL_IonripperTrail alpha decay mismatch");
  assert.ok(particles.every((particle) => particle.color === 0xe4), "CL_IonripperTrail color base mismatch");

  const emittedX = particles.map((particle) => particle.org[0]).sort((left, right) => left - right);
  assert.deepEqual(emittedX, [0, 5, 10], "CL_IonripperTrail should advance move by vec * 5");
  const velocitiesX = particles.map((particle) => particle.vel[0]).sort((left, right) => left - right);
  assert.deepEqual(velocitiesX, [-10, -10, 10], "CL_IonripperTrail should alternate left velocity starting at -10");
  assert.ok(particles.every((particle) => particle.vel[1] === 0 && particle.vel[2] === 0), "CL_IonripperTrail lateral velocity mismatch");

  const metadata = CL_IonripperTrail(start, end);
  assert.equal(metadata[0]?.kind, "ionripper-trail", "CL_IonripperTrail metadata kind mismatch");
  assert.equal(metadata[0]?.color, 0xe4, "CL_IonripperTrail metadata color mismatch");
  assert.equal(metadata[0]?.spacing, 5, "CL_IonripperTrail metadata spacing mismatch");
  assert.deepEqual(metadata[0]?.position, start, "CL_IonripperTrail metadata start mismatch");
  assert.deepEqual(metadata[0]?.position2, end, "CL_IonripperTrail metadata end mismatch");

  const renderParticles = CL_AddParticles(runtime);
  assert.equal(renderParticles.length, 3, "CL_IonripperTrail particles should reach the refresh particle list");

  const runtimeBranch = createRuntime();
  runtimeBranch.cl.time = 10440;
  withMockRandom(0, () => {
    CL_ExecutePacketEntityEffects(runtimeBranch, [{
      number: 12,
      origin: end,
      effects: EF_IONRIPPER,
      modelindex: 1,
      viewerEntity: false
    }]);
  });
  assert.equal(collectActiveParticles(runtimeBranch).length, 3, "EF_IONRIPPER should dispatch to CL_IonripperTrail");

  const refreshRuntime = createRuntime();
  refreshRuntime.cl.frame.num_entities = 1;
  refreshRuntime.cl.frame.parse_entities = 0;
  refreshRuntime.cl_parse_entities[0].number = 12;
  refreshRuntime.cl_parse_entities[0].effects = EF_IONRIPPER;
  refreshRuntime.cl_parse_entities[0].origin = [...end] as vec3_t;
  refreshRuntime.cl_entities[12].current.number = 12;
  refreshRuntime.cl_entities[12].current.origin = [...end] as vec3_t;
  withMockRandom(0, () => {
    const frame = CL_BuildRefreshFrame(refreshRuntime, { viewerEntity: 0 });
    assert.equal(frame.particles.length, 3, "EF_IONRIPPER particles should reach ClientRefreshFrame.particles");
    assert.ok(frame.lights.some((light) => light.kind === "ionripper" && light.intensity === 100), "EF_IONRIPPER should expose the original dlight to refresh");
  });
}

function verifyBubbleTrailRuntimeParticles(): void {
  const runtime = createRuntime();
  runtime.cl.time = 10520;
  const start: vec3_t = [0, 0, 0];
  const end: vec3_t = [65, 0, 0];
  const randomUnit = 0;
  const expectedCrand = (randomUnit * 2) - 1;

  withMockRandom(randomUnit, () => {
    CL_BubbleTrail(runtime, start, end);
  });

  const particles = collectActiveParticles(runtime);
  assert.equal(particles.length, 3, "CL_BubbleTrail should emit one bubble every 32 units while i < len");
  assert.ok(particles.every((particle) => particle.time === runtime.cl.time), "CL_BubbleTrail particle time mismatch");
  assert.ok(particles.every((particle) => particle.color === 4), "CL_BubbleTrail color base mismatch");
  assert.ok(particles.every((particle) => particle.alpha === 1.0 && almostEqual(particle.alphavel, -1.0)), "CL_BubbleTrail alpha decay mismatch");
  assert.ok(particles.every((particle) => particle.accel[0] === 0 && particle.accel[1] === 0 && particle.accel[2] === 0), "CL_BubbleTrail acceleration mismatch");
  assert.ok(
    particles.every((particle) => (
      particle.vel[0] === expectedCrand * 5
      && particle.vel[1] === expectedCrand * 5
      && particle.vel[2] === (expectedCrand * 5) + 6
    )),
    "CL_BubbleTrail velocity jitter and upward boost mismatch"
  );

  const emittedX = particles.map((particle) => particle.org[0]).sort((left, right) => left - right);
  assert.deepEqual(emittedX, [-2, 30, 62], "CL_BubbleTrail should advance move by the normalized vec * 32");
  assert.ok(particles.every((particle) => particle.org[1] === -2 && particle.org[2] === -2), "CL_BubbleTrail origin jitter mismatch");

  const metadata = CL_BubbleTrail(start, end);
  assert.equal(metadata[0]?.kind, "bubble-trail", "CL_BubbleTrail metadata kind mismatch");
  assert.deepEqual(metadata[0]?.position, start, "CL_BubbleTrail metadata start mismatch");
  assert.deepEqual(metadata[0]?.position2, end, "CL_BubbleTrail metadata end mismatch");
  assert.equal(metadata[0]?.color, 4, "CL_BubbleTrail metadata color mismatch");
  assert.equal(metadata[0]?.spacing, 32, "CL_BubbleTrail metadata spacing mismatch");

  const renderParticles = CL_AddParticles(runtime);
  assert.equal(renderParticles.length, 3, "CL_BubbleTrail particles should reach the refresh particle list");

  const tempRuntime = createRuntime();
  tempRuntime.cl.time = 10560;
  withMockRandom(randomUnit, () => {
    CL_ExecuteTempEntityEffects(tempRuntime, {
      type: temp_event_t.TE_BUBBLETRAIL,
      position: start,
      position2: end
    });
  });
  assert.equal(collectActiveParticles(tempRuntime).length, 3, "TE_BUBBLETRAIL should dispatch to CL_BubbleTrail");

  const effects = CL_BuildTempEntityEffects({
    type: temp_event_t.TE_BUBBLETRAIL,
    position: start,
    position2: end
  });
  const trail = effects.find((effect) => effect.kind === "bubble-trail");
  assert.ok(trail, "TE_BUBBLETRAIL should expose bubble trail metadata");
  assert.equal(trail.category, "particle", "bubble trail should remain tagged as particles");
  assert.deepEqual(trail.position, start, "bubble trail metadata should preserve start");
  assert.deepEqual(trail.position2, end, "bubble trail metadata should preserve end");
  assert.equal(trail.color, 4, "bubble trail metadata should preserve color base");
  assert.equal(trail.spacing, 32, "bubble trail metadata should preserve spacing");
}

function verifyFlyParticlesRuntimeParticles(): void {
  const runtime = createRuntime();
  runtime.cl.time = 0;
  const origin: vec3_t = [10, 20, 30];

  withMockRandom(0, () => {
    CL_FlyParticles(runtime, origin, 5);
  });

  const particles = collectActiveParticles(runtime);
  assert.equal(particles.length, 3, "CL_FlyParticles should emit every other bytedir index while i < count");
  assert.equal(runtime.cl.free_particles, 3, "CL_FlyParticles free list should advance by emitted particle count");
  assert.ok(particles.every((particle) => particle.time === runtime.cl.time), "CL_FlyParticles particle time mismatch");
  assert.ok(particles.every((particle) => particle.color === 0), "CL_FlyParticles should keep black particle color");
  assert.ok(particles.every((particle) => particle.alpha === 1.0 && particle.alphavel === -100), "CL_FlyParticles alpha decay mismatch");
  assert.ok(particles.every((particle) => particle.vel[0] === 0 && particle.vel[1] === 0 && particle.vel[2] === 0), "CL_FlyParticles velocity should be cleared");
  assert.ok(particles.every((particle) => particle.accel[0] === 0 && particle.accel[1] === 0 && particle.accel[2] === 0), "CL_FlyParticles acceleration should be cleared");

  const expectedOrigins = [0, 2, 4]
    .map((index) => {
      const dist = Math.sin(index) * 64;
      const bytedir = BYTE_DIRS[index];
      return [
        origin[0] + (bytedir[0] * dist) + 16,
        origin[1] + (bytedir[1] * dist),
        origin[2] + (bytedir[2] * dist)
      ].map((component) => Number(component.toFixed(12)));
    })
    .reverse();
  assert.deepEqual(
    particles.map((particle) => particle.org.map((component) => Number(component.toFixed(12)))),
    expectedOrigins,
    "CL_FlyParticles should preserve bytedirs, sin(ltime+i) distance and BEAMLENGTH offset"
  );

  const metadata = CL_FlyParticles(origin, 5);
  assert.equal(metadata[0]?.kind, "fly-particles", "CL_FlyParticles metadata kind mismatch");
  assert.equal(metadata[0]?.category, "particle", "CL_FlyParticles metadata category mismatch");
  assert.deepEqual(metadata[0]?.position, origin, "CL_FlyParticles metadata origin mismatch");
  assert.equal(metadata[0]?.count, 5, "CL_FlyParticles metadata count mismatch");

  const cappedRuntime = createRuntime();
  cappedRuntime.cl.time = 0;
  withMockRandom(0, () => {
    CL_FlyParticles(cappedRuntime, origin, 999);
  });
  assert.equal(collectActiveParticles(cappedRuntime).length, 81, "CL_FlyParticles should cap count at NUMVERTEXNORMALS");

  const renderParticles = CL_AddParticles(runtime);
  assert.equal(renderParticles.length, 3, "CL_FlyParticles particles should reach the refresh particle list");
}

function verifyFlyParticlesPacketEntityRuntimeBranch(): void {
  const runtime = createRuntime();
  runtime.cl.time = 11000;
  const origin: vec3_t = [32, 48, 64];
  runtime.cl_entities[7].fly_stoptime = 61000;

  withMockRandom(0, () => {
    CL_ExecutePacketEntityEffects(runtime, [{
      number: 7,
      origin,
      effects: EF_FLIES,
      modelindex: 1,
      viewerEntity: false
    }]);
  });

  assert.equal(collectActiveParticles(runtime).length, 41, "EF_FLIES should dispatch to CL_FlyEffectRuntime and CL_FlyParticles");

  const refreshRuntime = createRuntime();
  refreshRuntime.cl.time = 11000;
  refreshRuntime.cl.frame.num_entities = 1;
  refreshRuntime.cl.frame.parse_entities = 0;
  refreshRuntime.cl_parse_entities[0].number = 7;
  refreshRuntime.cl_parse_entities[0].effects = EF_FLIES;
  refreshRuntime.cl_parse_entities[0].origin = [...origin] as vec3_t;
  refreshRuntime.cl_parse_entities[0].modelindex = 1;
  refreshRuntime.cl_entities[7].current.number = 7;
  refreshRuntime.cl_entities[7].current.origin = [...origin] as vec3_t;
  refreshRuntime.cl_entities[7].fly_stoptime = 61000;

  withMockRandom(0, () => {
    const frame = CL_BuildRefreshFrame(refreshRuntime, { viewerEntity: 0 });
    assert.equal(frame.particles.length, 41, "EF_FLIES particles should reach ClientRefreshFrame.particles");
  });
}

function verifyMakeNormalVectors(): void {
  const forward: vec3_t = [3 / 13, 4 / 13, 12 / 13];
  const { right, up } = MakeNormalVectors(forward);

  assert.ok(almostEqual(vectorLength(right), 1), "MakeNormalVectors should normalize the projected right vector");
  assert.ok(almostEqual(dotProduct(right, forward), 0), "MakeNormalVectors right vector should be orthogonal to forward");
  assert.ok(almostEqual(dotProduct(up, forward), 0), "MakeNormalVectors up vector should be orthogonal to forward");
  assert.ok(almostEqual(dotProduct(up, right), 0), "MakeNormalVectors up vector should be orthogonal to right");
  assert.deepEqual(
    right.map((component) => Number(component.toFixed(12))),
    [0.911633870904, -0.399971814221, -0.094584529652],
    "MakeNormalVectors should preserve the C rotate/project/normalize calculation"
  );
  assert.deepEqual(
    up.map((component) => Number(component.toFixed(12))),
    [-0.340101819388, -0.863335387677, 0.372803917406],
    "MakeNormalVectors should preserve CrossProduct(right, forward, up)"
  );
}

function verifyLightstyleManagement(): void {
  const runtime = createRuntime();

  assert.equal(runtime.cl.lightstyles.length, MAX_LIGHTSTYLES, "clightstyle_t array length mismatch");
  assert.equal(runtime.cl.lightstyles[0].length, 0, "clightstyle_t default length mismatch");
  assert.deepEqual(runtime.cl.lightstyles[0].value, [0, 0, 0], "clightstyle_t default value mismatch");
  assert.equal(runtime.cl.lightstyles[0].map.length, MAX_QPATH, "clightstyle_t default map buffer mismatch");
  assert.equal(runtime.cl.last_lightstyle_ofs, -1, "lastofs default mismatch");

  runtime.cl.configstrings[CS_LIGHTS + 7] = "amc";
  CL_SetLightstyle(runtime, 7);
  assert.equal(runtime.cl.lightstyles[7].length, 3, "CL_SetLightstyle length mismatch");
  assert.deepEqual(
    runtime.cl.lightstyles[7].map,
    [0, 1, 2 / 12],
    "CL_SetLightstyle map conversion mismatch"
  );

  runtime.cl.time = 0;
  CL_RunLightStyles(runtime);
  assert.deepEqual(runtime.cl.lightstyles[1].value, [1, 1, 1], "CL_RunLightStyles empty style fallback mismatch");
  assert.deepEqual(runtime.cl.lightstyles[7].value, [0, 0, 0], "CL_RunLightStyles offset 0 mismatch");

  runtime.cl.lightstyles[7].value = [0.25, 0.25, 0.25];
  CL_RunLightStyles(runtime);
  assert.deepEqual(runtime.cl.lightstyles[7].value, [0.25, 0.25, 0.25], "CL_RunLightStyles should skip duplicate offsets");

  runtime.cl.time = 200;
  CL_RunLightStyles(runtime);
  assert.deepEqual(runtime.cl.lightstyles[7].value, [2 / 12, 2 / 12, 2 / 12], "CL_RunLightStyles animated sample mismatch");

  const lightStyles = CL_AddLightStyles(runtime);
  assert.equal(lightStyles.length, MAX_LIGHTSTYLES, "CL_AddLightStyles output count mismatch");
  assert.deepEqual(lightStyles[7], { style: 7, rgb: [2 / 12, 2 / 12, 2 / 12] }, "CL_AddLightStyles output mismatch");

  const refreshFrame = CL_BuildRefreshFrame(runtime, { predictMovement: false });
  assert.deepEqual(refreshFrame.lightStyles[7], lightStyles[7], "lightstyles should reach the refresh frame");

  CL_ClearLightStyles(runtime);
  assert.equal(runtime.cl.last_lightstyle_ofs, -1, "CL_ClearLightStyles lastofs reset mismatch");
  assert.ok(runtime.cl.lightstyles.every((style) => style.length === 0), "CL_ClearLightStyles length reset mismatch");
  assert.ok(runtime.cl.lightstyles.every((style) => style.value.every((component) => component === 0)), "CL_ClearLightStyles value reset mismatch");

  runtime.cl.configstrings[CS_LIGHTS + 3] = "x".repeat(MAX_QPATH);
  assert.throws(() => CL_SetLightstyle(runtime, 3), /svc_lightstyle length=64/, "CL_SetLightstyle overlong configstring mismatch");
}

function verifyLogoutEffectRuntimeParticles(): void {
  const origins: vec3_t[] = [[10, 20, 30], [0, 0, 0], [-32, 12, 4]];
  const cases = [
    { type: MZ_LOGIN, colorBase: 0xd0 },
    { type: MZ_LOGOUT, colorBase: 0x40 },
    { type: MZ_RESPAWN, colorBase: 0xe0 }
  ];

  for (let index = 0; index < cases.length; index += 1) {
    const runtime = createRuntime();
    runtime.cl.time = 1234;
    const origin = origins[index]!;
    const testCase = cases[index]!;

    CL_LogoutEffect(runtime, origin, testCase.type);
    const particles = collectActiveParticles(runtime);

    assert.equal(particles.length, 500, "CL_LogoutEffect should allocate the original 500 particles");
    assert.equal(runtime.cl.free_particles, 500, "CL_LogoutEffect free list should advance by 500");
    assert.ok(particles.every((particle) => particle.time === runtime.cl.time), "logout particles should preserve cl.time");
    assert.ok(
      particles.every((particle) => particle.color >= testCase.colorBase && particle.color <= testCase.colorBase + 7),
      "logout particles should stay inside the original palette family"
    );
    assert.ok(particles.every((particle) => particle.org[0] >= origin[0] - 16 && particle.org[0] <= origin[0] + 16), "logout x jitter mismatch");
    assert.ok(particles.every((particle) => particle.org[1] >= origin[1] - 16 && particle.org[1] <= origin[1] + 16), "logout y jitter mismatch");
    assert.ok(particles.every((particle) => particle.org[2] >= origin[2] - 24 && particle.org[2] <= origin[2] + 32), "logout z jitter mismatch");
    assert.ok(particles.every((particle) => particle.accel[0] === 0 && particle.accel[1] === 0 && particle.accel[2] === -40), "logout gravity mismatch");
    assert.ok(particles.every((particle) => particle.alpha === 1.0 && particle.alphavel <= -1 / 1.3 && particle.alphavel >= -1), "logout alpha decay mismatch");

    const renderParticles = CL_AddParticles(runtime);
    assert.equal(renderParticles.length, 500, "CL_LogoutEffect particles should reach the refresh particle list");
  }
}

function verifyItemRespawnRuntimeParticles(): void {
  const runtime = createRuntime();
  const origin: vec3_t = [64, 32, 16];
  runtime.cl.time = 4321;

  CL_ItemRespawnParticles(runtime, origin);
  const particles = collectActiveParticles(runtime);

  assert.equal(particles.length, 64, "CL_ItemRespawnParticles should allocate the original 64 particles");
  assert.equal(runtime.cl.free_particles, 64, "CL_ItemRespawnParticles free list should advance by 64");
  assert.ok(particles.every((particle) => particle.time === runtime.cl.time), "item respawn particles should preserve cl.time");
  assert.ok(particles.every((particle) => particle.color >= 0xd4 && particle.color <= 0xd7), "item respawn palette mismatch");
  assert.ok(particles.every((particle) => particle.org[0] >= origin[0] - 8 && particle.org[0] <= origin[0] + 8), "item respawn x jitter mismatch");
  assert.ok(particles.every((particle) => particle.org[1] >= origin[1] - 8 && particle.org[1] <= origin[1] + 8), "item respawn y jitter mismatch");
  assert.ok(particles.every((particle) => particle.org[2] >= origin[2] - 8 && particle.org[2] <= origin[2] + 8), "item respawn z jitter mismatch");
  assert.ok(particles.every((particle) => particle.accel[0] === 0 && particle.accel[1] === 0 && particle.accel[2] === -8), "item respawn gravity mismatch");
  assert.ok(particles.every((particle) => particle.alpha === 1.0 && particle.alphavel <= -1 / 1.3 && particle.alphavel >= -1), "item respawn alpha decay mismatch");

  const renderParticles = CL_AddParticles(runtime);
  assert.equal(renderParticles.length, 64, "CL_ItemRespawnParticles particles should reach the refresh particle list");
}

function verifyTeleporterEntityEventMetadata(): void {
  const origin: vec3_t = [11, 22, 33];
  const event: ClientEntityEvent = {
    number: 9,
    event: 0,
    effects: EF_TELEPORTER,
    state: {
      number: 9,
      origin,
      angles: [0, 0, 0],
      old_origin: [0, 0, 0],
      modelindex: 1,
      modelindex2: 0,
      modelindex3: 0,
      modelindex4: 0,
      frame: 0,
      skinnum: 0,
      effects: EF_TELEPORTER,
      renderfx: 0,
      solid: 0,
      sound: 0,
      event: 0
    }
  };

  const effects = CL_BuildEntityEventEffects(event);
  const particles = effects.find((effect) => effect.kind === "teleporter-particles");
  assert.ok(particles, "EF_TELEPORTER should expose teleporter particles to apps/web");
  assert.equal(particles.category, "entity-event", "teleporter particles should remain tagged as an entity event");
  assert.deepEqual(particles.position, origin, "teleporter particles should preserve entity origin");
  assert.equal(particles.count, 8, "teleporter metadata should preserve particle count");
  assert.equal(particles.color, 0xdb, "teleporter metadata should preserve color");
}

function verifyItemRespawnEntityEventMetadata(): void {
  const origin: vec3_t = [8, 16, 24];
  const event: ClientEntityEvent = {
    number: 17,
    event: entity_event_t.EV_ITEM_RESPAWN,
    effects: 0,
    state: {
      number: 17,
      origin,
      angles: [0, 0, 0],
      old_origin: [0, 0, 0],
      modelindex: 0,
      modelindex2: 0,
      modelindex3: 0,
      modelindex4: 0,
      frame: 0,
      skinnum: 0,
      effects: 0,
      renderfx: 0,
      solid: 0,
      sound: 0,
      event: entity_event_t.EV_ITEM_RESPAWN
    }
  };

  const effects = CL_BuildEntityEventEffects(event);
  assert.ok(effects.some((effect) => effect.sound?.name === "items/respawn1.wav"), "EV_ITEM_RESPAWN should keep the original respawn sound");
  const particles = effects.find((effect) => effect.kind === "item-respawn-particles");
  assert.ok(particles, "EV_ITEM_RESPAWN should expose item respawn particles to apps/web");
  assert.equal(particles.category, "entity-event", "item respawn particles should remain tagged as an entity event");
  assert.deepEqual(particles.position, origin, "item respawn particles should preserve entity origin");
  assert.equal(particles.count, 64, "item respawn metadata should preserve particle count");
  assert.equal(particles.color, 0xd4, "item respawn metadata should preserve color base");
}

function collectActiveParticles(runtime: ClientRuntime): ClientRuntime["cl"]["particles"] {
  const particles: ClientRuntime["cl"]["particles"] = [];
  let current = runtime.cl.active_particles;
  const visited = new Set<number>();

  while (current >= 0) {
    assert.equal(visited.has(current), false, "particle active list should not cycle");
    visited.add(current);
    const particle = runtime.cl.particles[current];
    particles.push(particle);
    current = particle.next;
  }

  return particles;
}

function withMockRandom<T>(value: number, callback: () => T): T {
  const originalRandom = Math.random;
  Math.random = () => value;
  try {
    return callback();
  } finally {
    Math.random = originalRandom;
  }
}

function almostEqual(actual: number, expected: number, epsilon = 1e-12): boolean {
  return Math.abs(actual - expected) <= epsilon;
}

function dotProduct(a: vec3_t, b: vec3_t): number {
  return (a[0] * b[0]) + (a[1] * b[1]) + (a[2] * b[2]);
}

function vectorLength(vector: vec3_t): number {
  return Math.sqrt(dotProduct(vector, vector));
}
