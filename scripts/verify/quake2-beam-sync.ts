/**
 * File: quake2-beam-sync.ts
 * Purpose: Verify that client refresh beams are rendered through the ported `R_DrawBeam` path.
 *
 * This file is not a direct source port.
 * It is a targeted integration harness for `gl_rmain.c` beam output into Three.js.
 *
 * Dependencies:
 * - packages/client/src/refresh.ts
 * - packages/filesystem
 * - packages/renderer-three/src/three-beam-sync.ts
 * - three
 */

import assert from "node:assert/strict";
import { LineSegments, LineBasicMaterial } from "three";
import { createVirtualFilesystem } from "../../packages/filesystem/src/index.js";
import type { ClientRefreshFrame } from "../../packages/client/src/refresh.js";
import { RF_BEAM, RF_TRANSLUCENT } from "../../packages/qcommon/src/index.js";
import { createThreeBeamSync } from "../../packages/renderer-three/src/index.js";

main();

/**
 * Category: New
 * Purpose: Exercise one laser-like refresh beam through `R_DrawBeam` and verify the Three.js projection.
 */
function main(): void {
  const sync = createThreeBeamSync(createVirtualFilesystem());
  assert.equal(sync.apply(null), 0, "empty beam sync should emit nothing");
  assert.equal(sync.root.children.length, 0, "empty beam sync root mismatch");

  const frame = createRefreshFrame();
  const count = sync.apply(frame);
  assert.equal(count, 1, "beam sync count mismatch");
  assert.equal(sync.root.children.length, 1, "beam sync child count mismatch");

  const line = sync.root.children[0];
  assert.ok(line instanceof LineSegments, "beam sync should create LineSegments");
  assert.equal(line.userData.refGl.source, "R_DrawBeam", "beam sync source metadata mismatch");
  assert.equal(line.userData.refGl.segmentCount, 6, "beam sync segment metadata mismatch");
  assert.equal(line.userData.refGl.skinnum, 96, "beam sync skinnum metadata mismatch");
  assert.equal(line.userData.refGl.frame, 6, "beam sync frame metadata mismatch");

  const positions = line.geometry.getAttribute("position");
  assert.equal(positions.count, 36, "beam sync line vertex count mismatch");
  assert.equal((positions.array as Float32Array).some((value) => value !== 0), true, "beam sync geometry should be non-zero");

  const material = line.material as LineBasicMaterial;
  assert.equal(material.transparent, true, "beam sync material transparency mismatch");
  assert.equal(material.opacity, 0.3, "beam sync material alpha mismatch");

  frame.beams[0].frame = 0;
  frame.beams[0].segmentLength = 60;
  sync.apply(frame);
  const fallbackLine = sync.root.children[0] as LineSegments;
  assert.equal(fallbackLine.userData.refGl.frame, 12, "beam sync fallback width mismatch");

  frame.beams[0] = {
    ...frame.beams[0],
    kind: "beam",
    model: "models/monsters/parasite/segment/tris.md2",
    start: [0, 0, 0],
    origin: [0, 0, 0],
    end: [0, 0, 90],
    frame: 0,
    segmentLength: 30,
    pathLength: 90,
    specialLightningShort: false
  };
  assert.equal(sync.apply(frame), 3, "model beam should be split into R_DrawBeam segments");
  assert.equal(sync.root.children.length, 3, "model beam child count mismatch");
  for (let index = 0; index < sync.root.children.length; index += 1) {
    const segmentLine = sync.root.children[index] as LineSegments;
    assert.equal(segmentLine.userData.refGl.source, "R_DrawBeam", "model beam source metadata mismatch");
    assert.equal(segmentLine.userData.refGl.beamKind, "beam", "model beam kind metadata mismatch");
    assert.equal(segmentLine.userData.refGl.model, "models/monsters/parasite/segment/tris.md2", "model beam model metadata mismatch");
    assert.equal(segmentLine.userData.refGl.part, index, "model beam part metadata mismatch");
    assert.equal(segmentLine.userData.refGl.partCount, 3, "model beam part count metadata mismatch");
  }

  frame.beams[0].specialLightningShort = true;
  assert.equal(sync.apply(frame), 1, "short lightning beam should stay a single R_DrawBeam segment");

  sync.dispose();
  assert.equal(sync.root.children.length, 0, "beam sync dispose mismatch");

  console.log("quake2-beam-sync: ok");
}

function createRefreshFrame(): ClientRefreshFrame {
  return {
    view: {
      vieworg: [0, 0, 0],
      viewangles: [0, 0, 0],
      forward: [1, 0, 0],
      right: [0, 1, 0],
      up: [0, 0, 1],
      fov_x: 90,
      blend: [0, 0, 0, 0]
    },
    entities: [],
    lights: [],
    particles: [],
    lightStyles: [],
    beams: [{
      kind: "laser",
      model: null,
      start: [0, 0, 0],
      end: [0, 0, 64],
      origin: [0, 0, 0],
      angles: [0, 0, 0],
      offset: [0, 0, 0],
      endtime: 100,
      entity: 1,
      entity2: 0,
      flags: RF_BEAM | RF_TRANSLUCENT,
      alpha: 0.3,
      skinnum: 96,
      frame: 6,
      segmentLength: 30,
      pathLength: 64,
      roll: 0,
      specialLightningShort: false
    }],
    explosions: [],
    forceWalls: [],
    sustains: []
  };
}
