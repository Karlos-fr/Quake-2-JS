/**
 * File: quake2-three-gl-draw-adapter.ts
 * Purpose: Verify the Three.js adapter used by the ported `ref_gl/gl_draw.c` hook surface.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the Three.js `GlDrawHooks` adapter.
 *
 * Dependencies:
 * - packages/renderer-three/src/three-gl-draw-adapter.ts
 */

import { strict as assert } from "node:assert";

import { BufferAttribute, DataTexture, Mesh, MeshBasicMaterial, RGBAFormat, UnsignedByteType } from "three";
import { createThreeGlDrawAdapter } from "../../packages/renderer-three/src/index.js";

const adapter = createThreeGlDrawAdapter();
adapter.setViewport(320, 200);

const texture = new DataTexture(new Uint8Array([
  255, 0, 0, 255,
  0, 255, 0, 255,
  0, 0, 255, 255,
  255, 255, 255, 255
]), 2, 2, RGBAFormat, UnsignedByteType);
texture.needsUpdate = true;
adapter.setTexture(7, texture);

adapter.drawHooks.bindTexture?.(7);
adapter.drawHooks.drawTexturedQuad?.({
  x: 10,
  y: 20,
  width: 30,
  height: 40,
  sl: 0.25,
  tl: 0.125,
  sh: 0.75,
  th: 0.875
});

assert.equal(adapter.root.children.length, 1, "textured quad child count mismatch");
const textured = adapter.root.children[0];
assert.ok(textured instanceof Mesh, "textured quad must be a Mesh");
assert.deepEqual(textured.position.toArray(), [25, 160, 0], "textured quad position mismatch");
const texturedMaterial = textured.material;
assert.ok(texturedMaterial instanceof MeshBasicMaterial, "textured material mismatch");
assert.equal(texturedMaterial.map !== null, true, "textured material map missing");
const uv = textured.geometry.getAttribute("uv") as BufferAttribute;
assert.deepEqual(Array.from(uv.array as Float32Array), [
  0.25, 0.875,
  0.75, 0.875,
  0.25, 0.125,
  0.75, 0.125
], "textured quad UV mismatch");

adapter.drawHooks.setDrawColor?.(0.2, 0.4, 0.6, 0.8);
adapter.drawHooks.drawSolidQuad?.(4, 6, 8, 10);
assert.equal(adapter.root.children.length, 2, "solid quad child count mismatch");
const solid = adapter.root.children[1];
assert.ok(solid instanceof Mesh, "solid quad must be a Mesh");
assert.deepEqual(solid.position.toArray(), [8, 189, 0], "solid quad position mismatch");
const solidMaterial = solid.material;
assert.ok(solidMaterial instanceof MeshBasicMaterial, "solid material mismatch");
assert.equal(solidMaterial.opacity, 0.8, "solid alpha mismatch");
assert.equal(solidMaterial.color.r, 0.2, "solid red mismatch");
assert.equal(solidMaterial.color.g, 0.4, "solid green mismatch");
assert.equal(solidMaterial.color.b, 0.6, "solid blue mismatch");

adapter.imageHooks.bindTexture?.(11, 0);
adapter.imageHooks.uploadTextureData?.({
  level: 0,
  internalFormat: 0,
  width: 1,
  height: 1,
  format: 0,
  type: 0,
  data: new Uint32Array([0xff332211])
});
const uploaded = adapter.getTexture(11);
assert.ok(uploaded instanceof DataTexture, "uploaded image texture missing");
assert.deepEqual(Array.from(uploaded.image.data as Uint8Array), [0x11, 0x22, 0x33, 0xff], "uploaded image bytes mismatch");

const palette = new Uint8Array(256 * 3);
palette[4 * 3] = 10;
palette[4 * 3 + 1] = 20;
palette[4 * 3 + 2] = 30;
adapter.imageHooks.setSharedTexturePalette?.(palette);
adapter.imageHooks.uploadScrapTexture?.(13, 2, 1, new Uint8Array([4, 255]));
const scrap = adapter.getTexture(13);
assert.ok(scrap instanceof DataTexture, "scrap texture missing");
assert.deepEqual(Array.from(scrap.image.data as Uint8Array), [
  10, 20, 30, 255,
  0, 0, 0, 0
], "scrap indexed palette bytes mismatch");

adapter.clear();
assert.equal(adapter.root.children.length, 0, "adapter clear mismatch");
adapter.dispose();

console.log("quake2-three-gl-draw-adapter: ok");
