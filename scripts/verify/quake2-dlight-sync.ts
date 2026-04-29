/**
 * File: quake2-dlight-sync.ts
 * Purpose: Verify that client refresh dynamic lights are rendered through the ported `R_RenderDlights` path.
 *
 * This file is not a direct source port.
 * It is a targeted integration harness for `gl_light.c` dynamic light output into Three.js.
 *
 * Dependencies:
 * - packages/client/src/refresh.ts
 * - packages/renderer-three/src/three-dlight-sync.ts
 * - three
 */

import assert from "node:assert/strict";
import { Group, Mesh, PointLight } from "three";
import type { ClientRefreshFrame } from "../../packages/client/src/refresh.js";
import { createThreeDlightSync } from "../../packages/renderer-three/src/index.js";

main();

/**
 * Category: New
 * Purpose: Exercise one refresh dlight through `R_RenderDlights` and verify the Three.js projection.
 */
function main(): void {
  const sync = createThreeDlightSync();
  assert.equal(sync.apply(null), 0, "empty dlight sync should emit nothing");
  assert.equal(sync.root.children.length, 0, "empty dlight root mismatch");

  const frame = createRefreshFrame();
  const count = sync.apply(frame);
  assert.equal(count, 1, "dlight sync count mismatch");
  assert.equal(sync.root.children.length, 1, "dlight root child count mismatch");

  const group = sync.root.children[0];
  assert.ok(group instanceof Group, "dlight child should be a group");
  assert.equal(group.userData.refGl.source, "R_RenderDlights", "dlight source metadata mismatch");
  assert.equal(group.userData.refGl.radius, 70, "dlight radius metadata mismatch");
  assert.equal(group.userData.refGl.intensity, 200, "dlight intensity metadata mismatch");

  const flashblend = group.children.find((child) => child instanceof Mesh);
  const pointLight = group.children.find((child) => child instanceof PointLight);
  assert.ok(flashblend instanceof Mesh, "dlight flashblend mesh missing");
  assert.ok(pointLight instanceof PointLight, "dlight point light missing");
  assert.equal(flashblend.userData.refGl, undefined, "flashblend metadata should live on group");
  assert.equal(flashblend.geometry.getAttribute("position").count, 18, "flashblend fan vertex count mismatch");
  assert.equal(pointLight.position.z, 32, "dlight point position mismatch");
  assert.equal(pointLight.distance, 400, "dlight point distance mismatch");

  frame.lights = [];
  assert.equal(sync.apply(frame), 0, "cleared dlight sync count mismatch");
  assert.equal(sync.root.children.length, 0, "cleared dlight root mismatch");

  sync.dispose();
  console.log("quake2-dlight-sync: ok");
}

function createRefreshFrame(): ClientRefreshFrame {
  return {
    view: {
      vieworg: [0, 0, 0],
      viewangles: [0, 0, 0],
      forward: [0, 0, 1],
      right: [1, 0, 0],
      up: [0, 1, 0],
      fov_x: 90,
      blend: [0, 0, 0, 0]
    },
    entities: [],
    lights: [{
      origin: [8, 16, 32],
      intensity: 200,
      color: [1, 0.5, 0.25],
      sourceEntity: 1,
      kind: "test"
    }],
    particles: [],
    lightStyles: [],
    beams: [],
    explosions: [],
    forceWalls: [],
    sustains: []
  };
}
