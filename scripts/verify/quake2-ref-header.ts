/**
 * File: quake2-ref-header.ts
 * Purpose: Verify that the TypeScript target for `client/ref.h` preserves the shared renderer declarations.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for a strict header port.
 *
 * Dependencies:
 * - packages/client/src/ref.ts
 * - packages/client/src/index.ts
 */

import { strict as assert } from "node:assert";

import {
  API_VERSION,
  ENTITY_FLAGS,
  POWERSUIT_SCALE,
  REF_MAX_DLIGHTS,
  REF_MAX_ENTITIES,
  REF_MAX_PARTICLES,
  REF_MAX_LIGHTSTYLES,
  SHELL_BG_COLOR,
  SHELL_BLUE_COLOR,
  SHELL_CYAN_COLOR,
  SHELL_DOUBLE_COLOR,
  SHELL_GREEN_COLOR,
  SHELL_HALF_DAM_COLOR,
  SHELL_RB_COLOR,
  SHELL_RED_COLOR,
  SHELL_RG_COLOR,
  SHELL_WHITE_COLOR,
  createRefDlight,
  createRefEntity,
  createRefLightstyle,
  createRefParticle,
  createRefDef,
  createRefExport,
  createRefImport
} from "../../packages/client/src/index.js";

assert.equal(REF_MAX_DLIGHTS, 32, "MAX_DLIGHTS mismatch");
assert.equal(REF_MAX_ENTITIES, 128, "MAX_ENTITIES mismatch");
assert.equal(REF_MAX_PARTICLES, 4096, "MAX_PARTICLES mismatch");
assert.equal(REF_MAX_LIGHTSTYLES, 256, "MAX_LIGHTSTYLES mismatch");
assert.equal(POWERSUIT_SCALE, 4.0, "POWERSUIT_SCALE mismatch");
assert.equal(SHELL_RED_COLOR, 0xF2, "SHELL_RED_COLOR mismatch");
assert.equal(SHELL_GREEN_COLOR, 0xD0, "SHELL_GREEN_COLOR mismatch");
assert.equal(SHELL_BLUE_COLOR, 0xF3, "SHELL_BLUE_COLOR mismatch");
assert.equal(SHELL_RG_COLOR, 0xDC, "SHELL_RG_COLOR mismatch");
assert.equal(SHELL_RB_COLOR, 0x68, "SHELL_RB_COLOR mismatch");
assert.equal(SHELL_BG_COLOR, 0x78, "SHELL_BG_COLOR mismatch");
assert.equal(SHELL_DOUBLE_COLOR, 0xDF, "SHELL_DOUBLE_COLOR mismatch");
assert.equal(SHELL_HALF_DAM_COLOR, 0x90, "SHELL_HALF_DAM_COLOR mismatch");
assert.equal(SHELL_CYAN_COLOR, 0x72, "SHELL_CYAN_COLOR mismatch");
assert.equal(SHELL_WHITE_COLOR, 0xD7, "SHELL_WHITE_COLOR mismatch");
assert.equal(ENTITY_FLAGS, 68, "ENTITY_FLAGS mismatch");
assert.equal(API_VERSION, 3, "API_VERSION mismatch");

const entity = createRefEntity();
assert.deepEqual(entity.origin, [0, 0, 0], "createEntity origin mismatch");
assert.equal(entity.skin, null, "createEntity skin mismatch");

const dlight = createRefDlight();
assert.deepEqual(dlight.color, [0, 0, 0], "createDlight color mismatch");

const particle = createRefParticle();
assert.equal(particle.color, 0, "createParticle color mismatch");

const lightstyle = createRefLightstyle();
assert.deepEqual(lightstyle.rgb, [0, 0, 0], "createLightstyle rgb mismatch");

const refdef = createRefDef();
assert.equal(refdef.lightstyles.length, REF_MAX_LIGHTSTYLES, "createRefDef lightstyles length mismatch");
assert.equal(refdef.areabits, null, "createRefDef areabits mismatch");
assert.equal(refdef.num_entities, 0, "createRefDef num_entities mismatch");

const refExport = createRefExport();
assert.equal(refExport.api_version, API_VERSION, "createRefExport api_version mismatch");
assert.equal(refExport.Init(null, null), false, "createRefExport Init default mismatch");
assert.deepEqual(refExport.DrawGetPicSize("conback"), { width: 0, height: 0 }, "createRefExport DrawGetPicSize mismatch");
assert.equal(refExport.RegisterModel("tris.md2"), null, "createRefExport RegisterModel mismatch");

const refImport = createRefImport();
assert.equal(refImport.Cmd_Argc(), 0, "createRefImport Cmd_Argc mismatch");
assert.equal(refImport.Cmd_Argv(1), "", "createRefImport Cmd_Argv mismatch");
assert.equal(refImport.FS_LoadFile("pak0.pak"), null, "createRefImport FS_LoadFile mismatch");
assert.equal(refImport.Vid_GetModeInfo(3), null, "createRefImport Vid_GetModeInfo mismatch");

console.log("quake2-ref-header: ok");
