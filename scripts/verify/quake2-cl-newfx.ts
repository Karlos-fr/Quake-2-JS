/**
 * File: quake2-cl-newfx.ts
 * Purpose: Verify focused client/cl_newfx.c particle and dlight ports.
 */

import { strict as assert } from "node:assert";

import {
  CL_BlasterParticles2,
  CL_BlasterTrail2,
  CL_BubbleTrail2,
  CL_ColorFlash,
  CL_ColorExplosionParticles,
  CL_DebugTrail,
  CL_Flashlight,
  CL_ForceWall,
  CL_FlameEffects,
  CL_GenericParticleEffect,
  CL_Heatbeam,
  CL_MonsterPlasma_Shell,
  CL_Nukeblast,
  CL_ParticleSmokeEffect,
  CL_ParticleSteamEffect,
  CL_ParticleSteamEffect2,
  CL_SmokeTrail,
  CL_TagTrail,
  CL_TrackerTrail,
  CL_Tracker_Explode,
  CL_Tracker_Shell,
  CL_WidowSplash,
  CL_Widowbeamout
} from "../../packages/client/src/cl_newfx.js";
import { CL_AddDLights, CL_AddParticles, CL_ExecuteTempEntityEffects } from "../../packages/client/src/cl_fx.js";
import { connstate_t, createClientRuntime, createClientSustain, type ClientRuntime } from "../../packages/client/src/client.js";
import { CL_BuildRefreshFrame } from "../../packages/client/src/refresh.js";
import { temp_event_t, VIDREF_SOFT, type vec3_t } from "../../packages/qcommon/src/index.js";

main();

function main(): void {
  verifyFlashlightAndColorFlashRuntime();
  verifyColorFlashSoftRendererBranch();
  verifyTrailRuntimeParticles();
  verifySmokeForceFlameAndGenericParticles();
  verifyHeatbeamRingsRuntimeParticles();
  verifySteamSmokeAndBlasterParticles();
  verifyTrackerWidowNukeAndColorParticles();
  verifyTempEntityRuntimeBranches();
  verifyRefreshFrameParticleConsumption();
  console.log("quake2-cl-newfx: ok");
}

function verifyFlashlightAndColorFlashRuntime(): void {
  const runtime = createClientRuntime();
  runtime.cl.time = 1200;

  CL_Flashlight(runtime, [10, 20, 30], 7);
  let lights = CL_AddDLights(runtime);
  assert.equal(lights.length, 1, "CL_Flashlight should allocate one dlight");
  assert.deepEqual(lights[0]?.origin, [10, 20, 30], "CL_Flashlight origin mismatch");
  assert.equal(lights[0]?.intensity, 400, "CL_Flashlight radius mismatch");
  assert.equal(lights[0]?.minlight, 250, "CL_Flashlight minlight mismatch");
  assert.deepEqual(lights[0]?.color, [1, 1, 1], "CL_Flashlight color mismatch");
  assert.equal(lights[0]?.sourceEntity, 7, "CL_Flashlight should preserve the keyed entity");

  CL_ColorFlash(runtime, [4, 5, 6], 7, 150, -1, -1, -1);
  lights = CL_AddDLights(runtime);
  assert.equal(lights.length, 1, "CL_ColorFlash should reuse a keyed dlight");
  assert.deepEqual(lights[0]?.origin, [4, 5, 6], "CL_ColorFlash origin mismatch");
  assert.equal(lights[0]?.intensity, 150, "CL_ColorFlash GL radius mismatch");
  assert.deepEqual(lights[0]?.color, [-1, -1, -1], "CL_ColorFlash GL negative color should be preserved");
}

function verifyColorFlashSoftRendererBranch(): void {
  const runtime = createClientRuntime();
  runtime.cl.time = 2200;
  runtime.cl.vidref_val = VIDREF_SOFT;

  CL_ColorFlash(runtime, [1, 2, 3], 0, 150, -1, -0.5, -0.25);
  const lights = CL_AddDLights(runtime);
  assert.equal(lights.length, 1, "soft CL_ColorFlash should allocate one dlight");
  assert.equal(lights[0]?.intensity, -150, "soft CL_ColorFlash should negate intensity for negative colors");
  assert.deepEqual(lights[0]?.color, [1, 0.5, 0.25], "soft CL_ColorFlash should negate negative color components");
}

function verifyTrailRuntimeParticles(): void {
  const start: vec3_t = [0, 0, 0];
  const end: vec3_t = [10, 0, 0];

  let runtime = createClientRuntime();
  runtime.cl.time = 3000;
  withMockRandom(9 / 0x7fffffff, () => CL_DebugTrail(runtime, start, end));
  let particles = collectActiveParticles(runtime);
  assert.equal(particles.length, 4, "CL_DebugTrail should emit particles every 3 units while len > 0");
  assert.ok(particles.every((particle) => particle.color === 0x75), "CL_DebugTrail color should be 0x74 + (rand&7)");
  assert.ok(particles.every((particle) => particle.alphavel === -0.1), "CL_DebugTrail alpha velocity mismatch");
  assert.equal(CL_AddParticles(runtime).length, 4, "CL_DebugTrail particles should reach refresh output");

  runtime = createClientRuntime();
  runtime.cl.time = 3100;
  withMockRandom(9 / 0x7fffffff, () => CL_BubbleTrail2(runtime, start, [24, 0, 0], 8));
  particles = collectActiveParticles(runtime);
  assert.equal(particles.length, 3, "CL_BubbleTrail2 should honor caller spacing");
  assert.ok(particles.every((particle) => particle.color === 5), "CL_BubbleTrail2 color should be 4 + (rand&7)");
  assert.ok(particles.every((particle) => particle.vel[2] > 10), "CL_BubbleTrail2 should add upward velocity after random jitter");
}

function verifySmokeForceFlameAndGenericParticles(): void {
  const origin: vec3_t = [8, 16, 24];
  const dir: vec3_t = [1, 0, 0];

  let runtime = createClientRuntime();
  runtime.cl.time = 4000;
  withMockRandom(9 / 0x7fffffff, () => CL_SmokeTrail(runtime, [0, 0, 0], [16, 0, 0], 0x70, 8, 8));
  let particles = collectActiveParticles(runtime);
  assert.equal(particles.length, 2, "CL_SmokeTrail should emit by spacing while len > 0");
  assert.ok(particles.every((particle) => particle.color === 0x70), "CL_SmokeTrail color run mismatch");
  assert.ok(particles.every((particle) => particle.vel[2] > 14), "CL_SmokeTrail vertical velocity mismatch");

  runtime = createClientRuntime();
  runtime.cl.time = 4100;
  withMockRandom(0.5, () => CL_ForceWall(runtime, [0, 0, 0], [8, 0, 0], 0xd0));
  particles = collectActiveParticles(runtime);
  assert.equal(particles.length, 2, "CL_ForceWall should emit every 4 units when frand > 0.3");
  assert.ok(particles.every((particle) => particle.color === 0xd0), "CL_ForceWall color mismatch");
  assert.ok(particles.every((particle) => particle.vel[2] <= -40), "CL_ForceWall downward velocity mismatch");

  runtime = createClientRuntime();
  runtime.cl.time = 4200;
  withMockRandom(9 / 0x7fffffff, () => CL_FlameEffects(runtime, null, origin));
  particles = collectActiveParticles(runtime);
  assert.equal(particles.length, 10, "CL_FlameEffects should emit (rand&0xf) fire plus (rand&0x7) smoke");
  assert.ok(particles.some((particle) => particle.accel[2] === -40), "CL_FlameEffects fire gravity mismatch");
  assert.ok(particles.some((particle) => particle.vel[2] > 10), "CL_FlameEffects smoke velocity mismatch");

  runtime = createClientRuntime();
  runtime.cl.time = 4300;
  withMockRandom(9 / 0x7fffffff, () => CL_GenericParticleEffect(runtime, origin, dir, 0x60, 3, 7, 15, 0.3));
  particles = collectActiveParticles(runtime);
  assert.equal(particles.length, 3, "CL_GenericParticleEffect should allocate the requested count");
  assert.ok(particles.every((particle) => particle.color === 0x61), "CL_GenericParticleEffect color variation mismatch");
  assert.ok(particles.every((particle) => particle.accel[2] === -40), "CL_GenericParticleEffect gravity mismatch");
}

function verifyHeatbeamRingsRuntimeParticles(): void {
  let runtime = createClientRuntime();
  runtime.cl.time = 6000;
  runtime.cl.particles[0].next = -1;
  withMockRandom(0, () => CL_Heatbeam(runtime, [0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]));
  let particles = collectActiveParticles(runtime);
  assert.equal(particles.length, 1, "CL_Heatbeam should allocate RINGS particles until free list exhaustion");
  assert.deepEqual(particles[0]?.org, [0, -0.5, -0.5], "GL CL_Heatbeam should apply the original right/up half-unit start offset before the first trimmed ring");
  assert.equal(particles[0]?.alpha, 0.5, "CL_Heatbeam particle alpha mismatch");
  assert.equal(particles[0]?.alphavel, -1000.0, "CL_Heatbeam particle alphavel mismatch");
  assert.equal(particles[0]?.color, 223, "CL_Heatbeam color should preserve 223 - (rand&7)");
  assert.deepEqual(particles[0]?.vel, [0, 0, 0], "CL_Heatbeam particles should have zero velocity");
  assert.equal(CL_AddParticles(runtime).length, 1, "CL_Heatbeam particles should reach refresh output");

  runtime = createClientRuntime();
  runtime.cl.time = 6000;
  runtime.cl.vidref_val = VIDREF_SOFT;
  runtime.cl.particles[0].next = -1;
  withMockRandom(0, () => CL_Heatbeam(runtime, [0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]));
  particles = collectActiveParticles(runtime);
  assert.deepEqual(particles[0]?.org, [0, 0, 0], "soft CL_Heatbeam should skip the GL-only right/up start offset before the first trimmed ring");
}

function verifySteamSmokeAndBlasterParticles(): void {
  const origin: vec3_t = [8, 16, 24];
  const dir: vec3_t = [1, 0, 0];

  let runtime = createClientRuntime();
  runtime.cl.time = 7000;
  withMockRandom(9 / 0x7fffffff, () => CL_ParticleSteamEffect(runtime, origin, dir, 0xe0, 3, 60));
  let particles = collectActiveParticles(runtime);
  assert.equal(particles.length, 3, "CL_ParticleSteamEffect should allocate requested steam puffs");
  assert.ok(particles.every((particle) => particle.color === 0xe1), "CL_ParticleSteamEffect color variation mismatch");
  assert.ok(particles.every((particle) => particle.accel[2] === -20), "CL_ParticleSteamEffect half gravity mismatch");
  assert.equal(CL_AddParticles(runtime).length, 3, "CL_ParticleSteamEffect particles should reach refresh output");

  runtime = createClientRuntime();
  runtime.cl.time = 7100;
  const sustain = createClientSustain();
  sustain.org = [...origin];
  sustain.dir = [...dir];
  sustain.color = 8;
  sustain.count = 2;
  sustain.magnitude = 60;
  sustain.nextthink = 7100;
  sustain.thinkinterval = 100;
  withMockRandom(9 / 0x7fffffff, () => CL_ParticleSteamEffect2(runtime, sustain));
  particles = collectActiveParticles(runtime);
  assert.equal(particles.length, 2, "CL_ParticleSteamEffect2 should allocate sustain count");
  assert.equal(sustain.nextthink, 7200, "CL_ParticleSteamEffect2 should advance sustain nextthink");

  runtime = createClientRuntime();
  runtime.cl.time = 7200;
  withMockRandom(9 / 0x7fffffff, () => CL_ParticleSmokeEffect(runtime, origin, dir, 0, 2, 20));
  particles = collectActiveParticles(runtime);
  assert.equal(particles.length, 2, "CL_ParticleSmokeEffect should allocate requested smoke puffs");
  assert.ok(particles.every((particle) => particle.accel[2] === 0), "CL_ParticleSmokeEffect should preserve zero gravity");

  runtime = createClientRuntime();
  runtime.cl.time = 7300;
  withMockRandom(9 / 0x7fffffff, () => CL_BlasterParticles2(runtime, origin, dir, 0xd0));
  particles = collectActiveParticles(runtime);
  assert.equal(particles.length, 40, "CL_BlasterParticles2 should allocate 40 impact particles");
  assert.ok(particles.every((particle) => particle.color === 0xd1), "CL_BlasterParticles2 color variation mismatch");
  assert.ok(particles.every((particle) => particle.accel[2] === -40), "CL_BlasterParticles2 gravity mismatch");

  runtime = createClientRuntime();
  runtime.cl.time = 7400;
  withMockRandom(9 / 0x7fffffff, () => CL_BlasterTrail2(runtime, [0, 0, 0], [16, 0, 0]));
  particles = collectActiveParticles(runtime);
  assert.equal(particles.length, 4, "CL_BlasterTrail2 should emit every 5 units while len > 0");
  assert.ok(particles.every((particle) => particle.color === 0xd0), "CL_BlasterTrail2 color mismatch");
}

function verifyTrackerWidowNukeAndColorParticles(): void {
  const origin: vec3_t = [4, 5, 6];

  let runtime = createClientRuntime();
  runtime.cl.time = 8000;
  withMockRandom(0, () => CL_TrackerTrail(runtime, [0, 0, 0], [9, 0, 0], 0x2a));
  let particles = collectActiveParticles(runtime);
  assert.equal(particles.length, 3, "CL_TrackerTrail should emit every 3 units while len > 0");
  assert.ok(particles.every((particle) => particle.color === 0x2a), "CL_TrackerTrail color mismatch");
  assert.ok(particles.every((particle) => particle.vel[2] === 5), "CL_TrackerTrail vertical velocity mismatch");

  runtime = createClientRuntime();
  runtime.cl.time = 8100;
  withMockRandom(0, () => CL_TagTrail(runtime, [0, 0, 0], [10, 0, 0], 0x40));
  particles = collectActiveParticles(runtime);
  assert.equal(particles.length, 3, "CL_TagTrail should include len == 0 iteration");
  assert.ok(particles.every((particle) => particle.color === 0x40), "CL_TagTrail color mismatch");

  runtime = createClientRuntime();
  runtime.cl.time = 8200;
  withMockRandom(0, () => CL_Tracker_Shell(runtime, origin));
  particles = collectActiveParticles(runtime);
  assert.equal(particles.length, 300, "CL_Tracker_Shell should allocate 300 instant particles");
  assert.ok(particles.every((particle) => particle.alphavel === -10000), "CL_Tracker_Shell should use INSTANT_PARTICLE");
  assert.ok(particles.every((particle) => particle.color === 0), "CL_Tracker_Shell color mismatch");

  runtime = createClientRuntime();
  runtime.cl.time = 8300;
  withMockRandom(0, () => CL_MonsterPlasma_Shell(runtime, origin));
  particles = collectActiveParticles(runtime);
  assert.equal(particles.length, 40, "CL_MonsterPlasma_Shell should allocate 40 instant particles");
  assert.ok(particles.every((particle) => particle.color === 0xe0), "CL_MonsterPlasma_Shell color mismatch");

  runtime = createClientRuntime();
  runtime.cl.time = 8400;
  withMockRandom(0, () => CL_Tracker_Explode(runtime, origin));
  particles = collectActiveParticles(runtime);
  assert.equal(particles.length, 300, "CL_Tracker_Explode should allocate 300 particles");
  assert.ok(particles.every((particle) => particle.alphavel === -1), "CL_Tracker_Explode alpha velocity mismatch");

  runtime = createClientRuntime();
  runtime.cl.time = 8500;
  const widow = createClientSustain();
  widow.org = [...origin];
  widow.endtime = 10600;
  widow.nextthink = 8500;
  widow.thinkinterval = 1;
  withMockRandom(0, () => CL_Widowbeamout(runtime, widow));
  particles = collectActiveParticles(runtime);
  assert.equal(particles.length, 300, "CL_Widowbeamout should allocate 300 instant particles");
  assert.equal(widow.nextthink, 8500, "CL_Widowbeamout should leave nextthink unchanged like the C thinker");

  runtime = createClientRuntime();
  runtime.cl.time = 8600;
  const nuke = createClientSustain();
  nuke.org = [...origin];
  nuke.endtime = 9600;
  nuke.nextthink = 8600;
  nuke.thinkinterval = 1;
  withMockRandom(0, () => CL_Nukeblast(runtime, nuke));
  particles = collectActiveParticles(runtime);
  assert.equal(particles.length, 700, "CL_Nukeblast should allocate 700 instant particles");
  assert.equal(nuke.nextthink, 8600, "CL_Nukeblast should leave nextthink unchanged like the C thinker");

  runtime = createClientRuntime();
  runtime.cl.time = 8700;
  withMockRandom(0, () => CL_WidowSplash(runtime, origin));
  particles = collectActiveParticles(runtime);
  assert.equal(particles.length, 256, "CL_WidowSplash should allocate 256 particles");
  assert.ok(particles.every((particle) => particle.color === 16), "CL_WidowSplash color table mismatch");

  runtime = createClientRuntime();
  runtime.cl.time = 8800;
  withMockRandom(0, () => CL_ColorExplosionParticles(runtime, origin, 0x60, 4));
  particles = collectActiveParticles(runtime);
  assert.equal(particles.length, 128, "CL_ColorExplosionParticles should allocate 128 particles");
  assert.ok(particles.every((particle) => particle.color === 0x60), "CL_ColorExplosionParticles color run mismatch");
  assert.ok(particles.every((particle) => particle.accel[2] === -40), "CL_ColorExplosionParticles gravity mismatch");
}

function verifyTempEntityRuntimeBranches(): void {
  const runtime = createClientRuntime();
  runtime.cl.time = 5000;

  withMockRandom(9 / 0x7fffffff, () => {
    CL_ExecuteTempEntityEffects(runtime, {
      type: temp_event_t.TE_DEBUGTRAIL,
      position: [0, 0, 0],
      position2: [9, 0, 0]
    });
    CL_ExecuteTempEntityEffects(runtime, {
      type: temp_event_t.TE_BUBBLETRAIL2,
      position: [0, 0, 0],
      position2: [16, 0, 0]
    });
    CL_ExecuteTempEntityEffects(runtime, {
      type: temp_event_t.TE_FLASHLIGHT,
      entity: 3,
      position: [1, 2, 3]
    });
  });

  assert.ok(collectActiveParticles(runtime).length > 0, "cl_newfx temp-entity trails should mutate the runtime particle pool");
  assert.equal(CL_AddDLights(runtime).some((light) => light.sourceEntity === 3), true, "TE_FLASHLIGHT should reach runtime dlights");
}

function verifyRefreshFrameParticleConsumption(): void {
  const runtime = createClientRuntime();
  runtime.cls.state = connstate_t.ca_active;
  runtime.cl.time = 9000;
  runtime.cl.frame.valid = true;
  runtime.cl.frame.serverframe = 1;
  runtime.cl.frame.playerstate.pmove.origin = [0, 0, 0];
  withMockRandom(9 / 0x7fffffff, () => {
    CL_ParticleSteamEffect(runtime, [0, 0, 0], [1, 0, 0], 8, 2, 60);
  });

  const frame = CL_BuildRefreshFrame(runtime);
  assert.equal(frame.particles.length, 2, "CL_BuildRefreshFrame should consume cl_newfx particles for apps/web and renderer-three");
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
