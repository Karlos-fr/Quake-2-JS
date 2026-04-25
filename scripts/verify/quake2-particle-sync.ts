/**
 * File: quake2-particle-sync.ts
 * Purpose: Verify that the Three.js particle sync adapter consumes refresh particles through the ported `gl_rmain.c` point path and feeds one WebGPU instanced sprite.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the particle adapter layer.
 *
 * Dependencies:
 * - packages/filesystem
 * - packages/client
 * - packages/renderer-three
 */

import { strict as assert } from "node:assert";

import { createVirtualFilesystem } from "../../packages/filesystem/src/index.js";
import type { ClientRefreshFrame } from "../../packages/client/src/refresh.js";
import { createThreeParticleSync } from "../../packages/renderer-three/src/index.js";

const particleSync = createThreeParticleSync(createVirtualFilesystem(), {
  particleSize: 24,
  getViewportSize: () => ({ width: 800, height: 600 })
});

const refreshFrame: ClientRefreshFrame = {
  view: {
    vieworg: [0, 0, 0],
    viewangles: [0, 0, 0],
    forward: [1, 0, 0],
    right: [0, -1, 0],
    up: [0, 0, 1],
    fov_x: 90,
    blend: [0, 0, 0, 0]
  },
  entities: [],
  lights: [],
  particles: [
    { origin: [10, 0, 20], color: 32, alpha: 0.5 },
    { origin: [20, 5, 40], color: 64, alpha: 1.0 }
  ],
  lightStyles: [],
  beams: [],
  explosions: [],
  forceWalls: [],
  sustains: []
};

const renderedCount = particleSync.apply(refreshFrame);
assert.equal(renderedCount, 2, "particleSync rendered count mismatch");
assert.equal(particleSync.root.children.length, 1, "particleSync instanced sprite count mismatch");

const particleSprite = particleSync.root.children[0] as {
  count: number;
  visible: boolean;
};
assert.equal(particleSprite.visible, true, "particleSync sprite visibility mismatch");
assert.equal(particleSprite.count, 2, "particleSync sprite instance count mismatch");

const emptyCount = particleSync.apply(null);
assert.equal(emptyCount, 0, "particleSync empty count mismatch");
assert.equal(particleSprite.visible, false, "particleSync empty visibility mismatch");
assert.equal(particleSprite.count, 0, "particleSync empty instance count mismatch");

console.log("quake2-particle-sync: ok");
