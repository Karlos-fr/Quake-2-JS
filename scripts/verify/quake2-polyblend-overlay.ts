/**
 * File: quake2-polyblend-overlay.ts
 * Purpose: Verify the Three.js adapter for `ref_gl` `R_PolyBlend` / `R_Flash` output.
 *
 * This file is not a direct source port.
 * It is a targeted integration harness for the split Three.js runtime polyblend overlay.
 *
 * Dependencies:
 * - packages/renderer-three/src/three-polyblend-overlay.ts
 * - packages/renderer-three/src/gl-rmain.ts
 * - three
 */

import assert from "node:assert/strict";
import { Mesh, MeshBasicMaterial } from "three";
import { Cvar_Get, createCvarRuntime } from "../../packages/qcommon/src/cvar.js";
import {
  R_PolyBlend,
  createGlRmainRuntime,
  createThreePolyblendOverlay
} from "../../packages/renderer-three/src/index.js";

main();

/**
 * Category: New
 * Purpose: Exercise direct frame blends and the original `R_PolyBlend` hook payload.
 */
function main(): void {
  const overlay = createThreePolyblendOverlay();
  overlay.setViewport(640, 480);

  const mesh = findOverlayMesh(overlay.root);
  const material = mesh.material as MeshBasicMaterial;
  assert.equal(mesh.visible, false, "polyblend overlay should start hidden");
  assert.equal(overlay.camera.right, 640, "polyblend camera width mismatch");
  assert.equal(overlay.camera.top, 480, "polyblend camera height mismatch");
  assert.equal(mesh.position.x, 320, "polyblend mesh x mismatch");
  assert.equal(mesh.position.y, 240, "polyblend mesh y mismatch");
  assert.equal(mesh.scale.x, 640, "polyblend mesh width scale mismatch");
  assert.equal(mesh.scale.y, 480, "polyblend mesh height scale mismatch");

  overlay.applyBlend([1.5, 0.25, -1, 0.5]);
  assert.equal(mesh.visible, true, "polyblend overlay visible mismatch");
  assert.equal(material.opacity, 0.5, "polyblend alpha mismatch");
  assert.deepEqual(mesh.userData.refGl.blend, [1, 0.25, 0, 0.5], "polyblend clamped metadata mismatch");

  overlay.applyBlend([1, 0, 0, 0.75], false);
  assert.equal(mesh.visible, false, "disabled polyblend should hide overlay");
  assert.equal(material.opacity, 0, "disabled polyblend alpha mismatch");

  overlay.applyFrame({
    view: {
      vieworg: [0, 0, 0],
      viewangles: [0, 0, 0],
      forward: [1, 0, 0],
      right: [0, 1, 0],
      up: [0, 0, 1],
      fov_x: 90,
      blend: [0.1, 0.2, 0.3, 0.4]
    },
    entities: [],
    lights: [],
    particles: [],
    lightStyles: [],
    beams: [],
    explosions: [],
    forceWalls: [],
    sustains: []
  });
  assert.equal(mesh.visible, true, "frame polyblend visible mismatch");
  assert.equal(material.opacity, 0.4, "frame polyblend alpha mismatch");
  assert.deepEqual(mesh.userData.refGl.blend, [0.1, 0.2, 0.3, 0.4], "frame polyblend metadata mismatch");

  const cvar = createCvarRuntime();
  const runtime = createGlRmainRuntime(overlay.hooks);
  runtime.gl_polyblend = Cvar_Get(cvar, "gl_polyblend", "1", 0);
  runtime.v_blend = [0.7, 0.6, 0.5, 0.25];
  R_PolyBlend(runtime);
  assert.equal(mesh.visible, true, "R_PolyBlend hook visible mismatch");
  assert.equal(material.opacity, 0.25, "R_PolyBlend hook alpha mismatch");
  assert.deepEqual(mesh.userData.refGl.blend, [0.7, 0.6, 0.5, 0.25], "R_PolyBlend hook metadata mismatch");

  runtime.gl_polyblend!.value = 0;
  overlay.clear();
  runtime.v_blend = [1, 0, 0, 0.8];
  R_PolyBlend(runtime);
  assert.equal(mesh.visible, false, "disabled source R_PolyBlend should not show overlay");

  overlay.dispose();
  console.log("quake2-polyblend-overlay: ok");
}

function findOverlayMesh(root: { children: unknown[] }): Mesh {
  const mesh = root.children.find((child): child is Mesh =>
    child instanceof Mesh && child.material instanceof MeshBasicMaterial
  );
  assert.ok(mesh, "polyblend overlay mesh missing");
  return mesh;
}
