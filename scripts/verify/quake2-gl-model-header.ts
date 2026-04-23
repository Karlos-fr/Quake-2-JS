/**
 * File: quake2-gl-model-header.ts
 * Purpose: Verify that the TypeScript target for `ref_gl/gl_model.h` preserves the core renderer model declarations.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for a strict header port.
 *
 * Dependencies:
 * - packages/renderer-three/src/gl-model.ts
 * - packages/renderer-three/src/index.ts
 */

import { strict as assert } from "node:assert";

import {
  MAX_MD2SKINS,
  SIDE_BACK,
  SIDE_FRONT,
  SIDE_ON,
  SURF_DRAWBACKGROUND,
  SURF_DRAWSKY,
  SURF_DRAWTURB,
  SURF_PLANEBACK,
  SURF_UNDERWATER,
  VERTEXSIZE,
  createGlPoly,
  createMEdge,
  createMLeaf,
  createMModel,
  createMNode,
  createMSurface,
  createMTexinfo,
  createMVertex,
  createModel,
  getSurfaceStyleCapacity,
  hasSurfaceSamples,
  hasValidModelSkinCount,
  isModelNameWithinQPath,
  isValidGlPoly,
  modtype_t
} from "../../packages/renderer-three/src/index.js";

assert.equal(SIDE_FRONT, 0, "SIDE_FRONT mismatch");
assert.equal(SIDE_BACK, 1, "SIDE_BACK mismatch");
assert.equal(SIDE_ON, 2, "SIDE_ON mismatch");
assert.equal(SURF_PLANEBACK, 2, "SURF_PLANEBACK mismatch");
assert.equal(SURF_DRAWSKY, 4, "SURF_DRAWSKY mismatch");
assert.equal(SURF_DRAWTURB, 0x10, "SURF_DRAWTURB mismatch");
assert.equal(SURF_DRAWBACKGROUND, 0x40, "SURF_DRAWBACKGROUND mismatch");
assert.equal(SURF_UNDERWATER, 0x80, "SURF_UNDERWATER mismatch");
assert.equal(VERTEXSIZE, 7, "VERTEXSIZE mismatch");
assert.equal(MAX_MD2SKINS, 32, "MAX_MD2SKINS mismatch");
assert.equal(getSurfaceStyleCapacity(), 4, "MAXLIGHTMAPS mismatch");

assert.deepEqual(createMVertex().position, [0, 0, 0], "createMVertex mismatch");
assert.deepEqual(createMModel().origin, [0, 0, 0], "createMModel mismatch");
assert.deepEqual(createMEdge().v, [0, 0], "createMEdge mismatch");
assert.equal(createMTexinfo().image, null, "createMTexinfo mismatch");
assert.equal(createMSurface().plane, null, "createMSurface plane mismatch");
assert.equal(createMNode().contents, -1, "createMNode contents mismatch");
assert.deepEqual(createMLeaf().firstmarksurface, [], "createMLeaf firstmarksurface mismatch");

const poly = createGlPoly();
poly.verts.push([0, 0, 0, 0, 0, 0, 0]);
poly.numverts = 1;
assert.equal(isValidGlPoly(poly), true, "isValidGlPoly valid mismatch");

const invalidPoly = createGlPoly();
invalidPoly.numverts = 1;
assert.equal(isValidGlPoly(invalidPoly), false, "isValidGlPoly invalid mismatch");

const surface = createMSurface();
assert.equal(hasSurfaceSamples(surface), false, "hasSurfaceSamples empty mismatch");
surface.samples = new Uint8Array([1, 2, 3]);
assert.equal(hasSurfaceSamples(surface), true, "hasSurfaceSamples populated mismatch");

const model = createModel();
assert.equal(model.type, modtype_t.mod_bad, "createModel type mismatch");
assert.equal(model.skins.length, MAX_MD2SKINS, "createModel skins length mismatch");
assert.equal(hasValidModelSkinCount(model), true, "hasValidModelSkinCount mismatch");

assert.equal(isModelNameWithinQPath("maps/base1.bsp"), true, "short model name mismatch");
assert.equal(isModelNameWithinQPath("x".repeat(64)), false, "MAX_QPATH overflow mismatch");

console.log("quake2-gl-model-header: ok");
