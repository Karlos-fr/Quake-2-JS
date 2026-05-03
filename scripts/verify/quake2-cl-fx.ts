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
  CL_BuildEntityEventEffects,
  CL_BuildMuzzleFlash2Effects,
  CL_BuildMuzzleFlashEffects,
  CL_BuildTempEntityEffects,
  CL_ClearDlights,
  CL_ClearLightStyles,
  CL_ClearParticles,
  CL_ExecuteTempEntityEffects,
  CL_ExplosionParticles,
  CL_ItemRespawnParticles,
  CL_LogoutEffect,
  CL_NewDlight,
  CL_ParticleEffect,
  CL_ParticleEffect2,
  CL_ParticleEffect3,
  CL_RunDLights,
  CL_RunLightStyles,
  CL_SetLightstyle,
  CL_TeleporterParticles
} from "../../packages/client/src/cl_fx.js";
import {
  ATTN_NORM,
  CHAN_AUTO,
  CHAN_WEAPON,
  CS_LIGHTS,
  EF_TELEPORTER,
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
