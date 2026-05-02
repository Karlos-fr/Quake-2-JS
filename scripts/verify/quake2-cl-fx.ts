/**
 * File: quake2-cl-fx.ts
 * Purpose: Verify focused client/cl_fx.c particle effect ports and their refresh-facing output.
 */

import { strict as assert } from "node:assert";

import {
  CL_AddLightStyles,
  CL_AddParticles,
  CL_BuildEntityEventEffects,
  CL_ClearLightStyles,
  CL_ItemRespawnParticles,
  CL_LogoutEffect,
  CL_RunLightStyles,
  CL_SetLightstyle
} from "../../packages/client/src/cl_fx.js";
import { CS_LIGHTS, entity_event_t, MAX_LIGHTSTYLES, MAX_QPATH, MZ_LOGIN, MZ_LOGOUT, MZ_RESPAWN, type vec3_t } from "../../packages/qcommon/src/index.js";
import { createClientRuntime as createRuntime, type ClientRuntime } from "../../packages/client/src/client.js";
import type { ClientEntityEvent } from "../../packages/client/src/cl_ents.js";
import { CL_BuildRefreshFrame } from "../../packages/client/src/refresh.js";

main();

function main(): void {
  verifyLogoutEffectRuntimeParticles();
  verifyItemRespawnRuntimeParticles();
  verifyItemRespawnEntityEventMetadata();
  verifyLightstyleManagement();
  console.log("quake2-cl-fx: ok");
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
