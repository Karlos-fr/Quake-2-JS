/**
 * File: quake2-gl-model-loader-phase8.ts
 * Purpose: Verify the sprite-loading portion of the TypeScript port of `ref_gl/gl_model.c`.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for `Mod_LoadSpriteModel` and sprite `R_RegisterModel` handling.
 *
 * Dependencies:
 * - packages/renderer-three/src/gl-model-loader.ts
 * - packages/renderer-three/src/gl-model.ts
 */

import { strict as assert } from "node:assert";

import { IDSPRITEHEADER, SPRITE_VERSION } from "../../packages/formats/src/index.js";
import { setLittleLong } from "../../packages/memory/src/binary-io.js";
import { createModel, modtype_t } from "../../packages/renderer-three/src/gl-model.js";
import {
  Mod_LoadSpriteModel,
  R_RegisterModel,
  createGlModelRuntime
} from "../../packages/renderer-three/src/index.js";

const loadedImages: Array<{ name: string; type: string }> = [];
const runtime = createGlModelRuntime({
  findImage: (name, type) => {
    loadedImages.push({ name, type });
    return { name, type };
  },
  loadFile: (path) => (path === "sprites/test.sp2" ? createSpriteBuffer() : null)
});

const mod = createModel();
mod.name = "sprites/test.sp2";
Mod_LoadSpriteModel(runtime, mod, createSpriteBuffer());
assert.equal(mod.type, modtype_t.mod_sprite, "Mod_LoadSpriteModel type mismatch");
assert.equal((mod.extradata as { numframes: number }).numframes, 2, "Mod_LoadSpriteModel frame count mismatch");
assert.deepEqual((mod.extradata as { frames: Array<{ name: string }> }).frames.map((frame) => frame.name), ["pics/a.pcx", "pics/b.pcx"], "Mod_LoadSpriteModel frame names mismatch");
assert.deepEqual(mod.skins[0], { name: "pics/a.pcx", type: "sprite" }, "Mod_LoadSpriteModel first skin mismatch");
assert.deepEqual(mod.skins[1], { name: "pics/b.pcx", type: "sprite" }, "Mod_LoadSpriteModel second skin mismatch");

runtime.mod_known[0] = mod;
runtime.mod_numknown = 1;
runtime.registration_sequence = 7;
loadedImages.length = 0;

const registered = R_RegisterModel(runtime, "sprites/test.sp2");
assert.equal(registered, mod, "R_RegisterModel sprite cache mismatch");
assert.equal(mod.registration_sequence, 7, "R_RegisterModel sprite registration mismatch");
assert.deepEqual(loadedImages, [
  { name: "pics/a.pcx", type: "sprite" },
  { name: "pics/b.pcx", type: "sprite" }
], "R_RegisterModel sprite image refresh mismatch");

console.log("quake2-gl-model-loader-phase8: ok");

function createSpriteBuffer(): Uint8Array {
  const buffer = new Uint8Array(172);
  setLittleLong(buffer, 0, IDSPRITEHEADER);
  setLittleLong(buffer, 4, SPRITE_VERSION);
  setLittleLong(buffer, 8, 2);

  writeFrame(buffer, 12, 32, 16, 4, 8, "pics/a.pcx");
  writeFrame(buffer, 92, 64, 32, 12, 20, "pics/b.pcx");
  return buffer;
}

function writeFrame(buffer: Uint8Array, offset: number, width: number, height: number, originX: number, originY: number, name: string): void {
  setLittleLong(buffer, offset, width);
  setLittleLong(buffer, offset + 4, height);
  setLittleLong(buffer, offset + 8, originX);
  setLittleLong(buffer, offset + 12, originY);

  for (let index = 0; index < 64; index += 1) {
    buffer[offset + 16 + index] = 0;
  }

  for (let index = 0; index < name.length && index < 63; index += 1) {
    buffer[offset + 16 + index] = name.charCodeAt(index);
  }
}
