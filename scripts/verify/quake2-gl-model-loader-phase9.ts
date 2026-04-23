/**
 * File: quake2-gl-model-loader-phase9.ts
 * Purpose: Verify the alias-model portion of the TypeScript port of `ref_gl/gl_model.c`.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for `Mod_LoadAliasModel` and alias `R_RegisterModel` handling.
 *
 * Dependencies:
 * - packages/renderer-three/src/gl-model-loader.ts
 * - packages/renderer-three/src/gl-model.ts
 */

import { strict as assert } from "node:assert";

import { ALIAS_VERSION, IDALIASHEADER } from "../../packages/formats/src/index.js";
import { setLittleFloat, setLittleLong, setLittleShort, setUnsignedByte } from "../../packages/memory/src/binary-io.js";
import { createModel, modtype_t } from "../../packages/renderer-three/src/gl-model.js";
import {
  Mod_LoadAliasModel,
  R_RegisterModel,
  createGlModelRuntime
} from "../../packages/renderer-three/src/index.js";

const loadedImages: Array<{ name: string; type: string }> = [];
const runtime = createGlModelRuntime({
  findImage: (name, type) => {
    loadedImages.push({ name, type });
    return { name, type };
  }
});

const mod = createModel();
mod.name = "models/items/ammo/tris.md2";
Mod_LoadAliasModel(runtime, mod, createAliasBuffer());
assert.equal(mod.type, modtype_t.mod_alias, "Mod_LoadAliasModel type mismatch");
assert.equal((mod.extradata as { header: { num_frames: number } }).header.num_frames, 1, "Mod_LoadAliasModel frame count mismatch");
assert.deepEqual((mod.extradata as { skins: string[] }).skins, ["models/items/ammo/skin.pcx"], "Mod_LoadAliasModel skin names mismatch");
assert.deepEqual(mod.skins[0], { name: "models/items/ammo/skin.pcx", type: "skin" }, "Mod_LoadAliasModel first skin mismatch");
assert.deepEqual(mod.mins, [-32, -32, -32], "Mod_LoadAliasModel mins mismatch");
assert.deepEqual(mod.maxs, [32, 32, 32], "Mod_LoadAliasModel maxs mismatch");

runtime.mod_known[0] = mod;
runtime.mod_numknown = 1;
runtime.registration_sequence = 11;
loadedImages.length = 0;

const registered = R_RegisterModel(runtime, "models/items/ammo/tris.md2");
assert.equal(registered, mod, "R_RegisterModel alias cache mismatch");
assert.equal(mod.registration_sequence, 11, "R_RegisterModel alias registration mismatch");
assert.equal(mod.numframes, 1, "R_RegisterModel alias numframes mismatch");
assert.deepEqual(loadedImages, [{ name: "models/items/ammo/skin.pcx", type: "skin" }], "R_RegisterModel alias skin refresh mismatch");

console.log("quake2-gl-model-loader-phase9: ok");

function createAliasBuffer(): Uint8Array {
  const numSkins = 1;
  const numXyz = 3;
  const numSt = 3;
  const numTris = 1;
  const numFrames = 1;
  const numGlcmds = 0;
  const frameSize = 24 + 16 + numXyz * 4;
  const ofsSkins = 68;
  const ofsSt = ofsSkins + numSkins * 64;
  const ofsTris = ofsSt + numSt * 4;
  const ofsFrames = ofsTris + numTris * 12;
  const ofsGlcmds = ofsFrames + numFrames * frameSize;
  const ofsEnd = ofsGlcmds;
  const buffer = new Uint8Array(ofsEnd);

  setLittleLong(buffer, 0, IDALIASHEADER);
  setLittleLong(buffer, 4, ALIAS_VERSION);
  setLittleLong(buffer, 8, 64);
  setLittleLong(buffer, 12, 64);
  setLittleLong(buffer, 16, frameSize);
  setLittleLong(buffer, 20, numSkins);
  setLittleLong(buffer, 24, numXyz);
  setLittleLong(buffer, 28, numSt);
  setLittleLong(buffer, 32, numTris);
  setLittleLong(buffer, 36, numGlcmds);
  setLittleLong(buffer, 40, numFrames);
  setLittleLong(buffer, 44, ofsSkins);
  setLittleLong(buffer, 48, ofsSt);
  setLittleLong(buffer, 52, ofsTris);
  setLittleLong(buffer, 56, ofsFrames);
  setLittleLong(buffer, 60, ofsGlcmds);
  setLittleLong(buffer, 64, ofsEnd);

  writeCString(buffer, ofsSkins, 64, "models/items/ammo/skin.pcx");

  setLittleShort(buffer, ofsSt + 0, 0);
  setLittleShort(buffer, ofsSt + 2, 0);
  setLittleShort(buffer, ofsSt + 4, 63);
  setLittleShort(buffer, ofsSt + 6, 0);
  setLittleShort(buffer, ofsSt + 8, 0);
  setLittleShort(buffer, ofsSt + 10, 63);

  setLittleShort(buffer, ofsTris + 0, 0);
  setLittleShort(buffer, ofsTris + 2, 1);
  setLittleShort(buffer, ofsTris + 4, 2);
  setLittleShort(buffer, ofsTris + 6, 0);
  setLittleShort(buffer, ofsTris + 8, 1);
  setLittleShort(buffer, ofsTris + 10, 2);

  setLittleFloat(buffer, ofsFrames + 0, 1);
  setLittleFloat(buffer, ofsFrames + 4, 1);
  setLittleFloat(buffer, ofsFrames + 8, 1);
  setLittleFloat(buffer, ofsFrames + 12, 0);
  setLittleFloat(buffer, ofsFrames + 16, 0);
  setLittleFloat(buffer, ofsFrames + 20, 0);
  writeCString(buffer, ofsFrames + 24, 16, "stand01");

  const vertsOffset = ofsFrames + 40;
  setUnsignedByte(buffer, vertsOffset + 0, 0);
  setUnsignedByte(buffer, vertsOffset + 1, 0);
  setUnsignedByte(buffer, vertsOffset + 2, 0);
  setUnsignedByte(buffer, vertsOffset + 3, 0);
  setUnsignedByte(buffer, vertsOffset + 4, 8);
  setUnsignedByte(buffer, vertsOffset + 5, 0);
  setUnsignedByte(buffer, vertsOffset + 6, 0);
  setUnsignedByte(buffer, vertsOffset + 7, 1);
  setUnsignedByte(buffer, vertsOffset + 8, 0);
  setUnsignedByte(buffer, vertsOffset + 9, 8);
  setUnsignedByte(buffer, vertsOffset + 10, 0);
  setUnsignedByte(buffer, vertsOffset + 11, 2);

  return buffer;
}

function writeCString(buffer: Uint8Array, offset: number, maxLength: number, value: string): void {
  for (let index = 0; index < maxLength; index += 1) {
    buffer[offset + index] = 0;
  }

  for (let index = 0; index < value.length && index < maxLength - 1; index += 1) {
    buffer[offset + index] = value.charCodeAt(index);
  }
}
