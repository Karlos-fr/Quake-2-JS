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
assert.equal(entity.model, null, "createEntity model mismatch");
assert.deepEqual(entity.angles, [0, 0, 0], "createEntity angles mismatch");
assert.deepEqual(entity.origin, [0, 0, 0], "createEntity origin mismatch");
assert.equal(entity.frame, 0, "createEntity frame mismatch");
assert.deepEqual(entity.oldorigin, [0, 0, 0], "createEntity oldorigin mismatch");
assert.equal(entity.oldframe, 0, "createEntity oldframe mismatch");
assert.equal(entity.backlerp, 0, "createEntity backlerp mismatch");
assert.equal(entity.skinnum, 0, "createEntity skinnum mismatch");
assert.equal(entity.lightstyle, 0, "createEntity lightstyle mismatch");
assert.equal(entity.alpha, 0, "createEntity alpha mismatch");
assert.equal(entity.skin, null, "createEntity skin mismatch");
assert.equal(entity.flags, 0, "createEntity flags mismatch");

const dlight = createRefDlight();
assert.deepEqual(dlight.origin, [0, 0, 0], "createDlight origin mismatch");
assert.deepEqual(dlight.color, [0, 0, 0], "createDlight color mismatch");
assert.equal(dlight.intensity, 0, "createDlight intensity mismatch");

const particle = createRefParticle();
assert.deepEqual(particle.origin, [0, 0, 0], "createParticle origin mismatch");
assert.equal(particle.color, 0, "createParticle color mismatch");
assert.equal(particle.alpha, 0, "createParticle alpha mismatch");

const lightstyle = createRefLightstyle();
assert.deepEqual(lightstyle.rgb, [0, 0, 0], "createLightstyle rgb mismatch");
assert.equal(lightstyle.white, 0, "createLightstyle white mismatch");

const refdef = createRefDef();
assert.equal(refdef.x, 0, "createRefDef x mismatch");
assert.equal(refdef.y, 0, "createRefDef y mismatch");
assert.equal(refdef.width, 0, "createRefDef width mismatch");
assert.equal(refdef.height, 0, "createRefDef height mismatch");
assert.equal(refdef.fov_x, 0, "createRefDef fov_x mismatch");
assert.equal(refdef.fov_y, 0, "createRefDef fov_y mismatch");
assert.deepEqual(refdef.vieworg, [0, 0, 0], "createRefDef vieworg mismatch");
assert.deepEqual(refdef.viewangles, [0, 0, 0], "createRefDef viewangles mismatch");
assert.deepEqual(refdef.blend, [0, 0, 0, 0], "createRefDef blend mismatch");
assert.equal(refdef.time, 0, "createRefDef time mismatch");
assert.equal(refdef.rdflags, 0, "createRefDef rdflags mismatch");
assert.equal(refdef.lightstyles.length, REF_MAX_LIGHTSTYLES, "createRefDef lightstyles length mismatch");
assert.equal(refdef.areabits, null, "createRefDef areabits mismatch");
assert.equal(refdef.num_entities, 0, "createRefDef num_entities mismatch");
assert.deepEqual(refdef.entities, [], "createRefDef entities mismatch");
assert.equal(refdef.num_dlights, 0, "createRefDef num_dlights mismatch");
assert.deepEqual(refdef.dlights, [], "createRefDef dlights mismatch");
assert.equal(refdef.num_particles, 0, "createRefDef num_particles mismatch");
assert.deepEqual(refdef.particles, [], "createRefDef particles mismatch");

const refExport = createRefExport();
assert.deepEqual(
  Object.keys(refExport),
  [
    "api_version",
    "Init",
    "Shutdown",
    "BeginRegistration",
    "RegisterModel",
    "RegisterSkin",
    "RegisterPic",
    "SetSky",
    "EndRegistration",
    "RenderFrame",
    "DrawGetPicSize",
    "DrawPic",
    "DrawStretchPic",
    "DrawChar",
    "DrawTileClear",
    "DrawFill",
    "DrawFadeScreen",
    "DrawStretchRaw",
    "CinematicSetPalette",
    "BeginFrame",
    "EndFrame",
    "AppActivate"
  ],
  "createRefExport callback surface mismatch"
);
assert.equal(refExport.api_version, API_VERSION, "createRefExport api_version mismatch");
assert.equal(refExport.Init(null, null), false, "createRefExport Init default mismatch");
assert.deepEqual(refExport.DrawGetPicSize("conback"), { width: 0, height: 0 }, "createRefExport DrawGetPicSize mismatch");
assert.equal(refExport.RegisterModel("tris.md2"), null, "createRefExport RegisterModel mismatch");
assert.equal(refExport.RegisterSkin("players/male/grunt.pcx"), null, "createRefExport RegisterSkin mismatch");
assert.equal(refExport.RegisterPic("loading"), null, "createRefExport RegisterPic mismatch");
assert.doesNotThrow(() => refExport.Shutdown(), "createRefExport Shutdown default mismatch");
assert.doesNotThrow(() => refExport.BeginRegistration("base1"), "createRefExport BeginRegistration default mismatch");
assert.doesNotThrow(() => refExport.SetSky("unit1_", 0, [0, 0, 1]), "createRefExport SetSky default mismatch");
assert.doesNotThrow(() => refExport.EndRegistration(), "createRefExport EndRegistration default mismatch");
assert.doesNotThrow(() => refExport.RenderFrame(createRefDef()), "createRefExport RenderFrame default mismatch");
assert.doesNotThrow(() => refExport.DrawPic(0, 0, "conback"), "createRefExport DrawPic default mismatch");
assert.doesNotThrow(() => refExport.DrawStretchPic(0, 0, 8, 8, "conback"), "createRefExport DrawStretchPic default mismatch");
assert.doesNotThrow(() => refExport.DrawChar(0, 0, 65), "createRefExport DrawChar default mismatch");
assert.doesNotThrow(() => refExport.DrawTileClear(0, 0, 8, 8, "backtile"), "createRefExport DrawTileClear default mismatch");
assert.doesNotThrow(() => refExport.DrawFill(0, 0, 8, 8, 1), "createRefExport DrawFill default mismatch");
assert.doesNotThrow(() => refExport.DrawFadeScreen(), "createRefExport DrawFadeScreen default mismatch");
assert.doesNotThrow(() => refExport.DrawStretchRaw(0, 0, 8, 8, 8, 8, new Uint8Array(64)), "createRefExport DrawStretchRaw default mismatch");
assert.doesNotThrow(() => refExport.CinematicSetPalette(null), "createRefExport CinematicSetPalette default mismatch");
assert.doesNotThrow(() => refExport.BeginFrame(0), "createRefExport BeginFrame default mismatch");
assert.doesNotThrow(() => refExport.EndFrame(), "createRefExport EndFrame default mismatch");
assert.doesNotThrow(() => refExport.AppActivate(true), "createRefExport AppActivate default mismatch");

const refImport = createRefImport();
assert.deepEqual(
  Object.keys(refImport),
  [
    "Sys_Error",
    "Cmd_AddCommand",
    "Cmd_RemoveCommand",
    "Cmd_Argc",
    "Cmd_Argv",
    "Cmd_ExecuteText",
    "Con_Printf",
    "FS_LoadFile",
    "FS_FreeFile",
    "FS_Gamedir",
    "Cvar_Get",
    "Cvar_Set",
    "Cvar_SetValue",
    "Vid_GetModeInfo",
    "Vid_MenuInit",
    "Vid_NewWindow"
  ],
  "createRefImport callback surface mismatch"
);
assert.doesNotThrow(() => refImport.Sys_Error(0, "ignored"), "createRefImport Sys_Error mismatch");
assert.doesNotThrow(() => refImport.Cmd_AddCommand("unit", () => undefined), "createRefImport Cmd_AddCommand mismatch");
assert.doesNotThrow(() => refImport.Cmd_RemoveCommand("unit"), "createRefImport Cmd_RemoveCommand mismatch");
assert.equal(refImport.Cmd_Argc(), 0, "createRefImport Cmd_Argc mismatch");
assert.equal(refImport.Cmd_Argv(1), "", "createRefImport Cmd_Argv mismatch");
assert.doesNotThrow(() => refImport.Cmd_ExecuteText(0, "echo unit"), "createRefImport Cmd_ExecuteText mismatch");
assert.doesNotThrow(() => refImport.Con_Printf(0, "unit"), "createRefImport Con_Printf mismatch");
assert.equal(refImport.FS_LoadFile("pak0.pak"), null, "createRefImport FS_LoadFile mismatch");
assert.doesNotThrow(() => refImport.FS_FreeFile(new Uint8Array()), "createRefImport FS_FreeFile mismatch");
assert.equal(refImport.FS_Gamedir(), "", "createRefImport FS_Gamedir mismatch");
assert.equal(refImport.Cvar_Get("unit", "0", 0), null, "createRefImport Cvar_Get mismatch");
assert.equal(refImport.Cvar_Set("unit", "1"), null, "createRefImport Cvar_Set mismatch");
assert.doesNotThrow(() => refImport.Cvar_SetValue("unit", 2), "createRefImport Cvar_SetValue mismatch");
assert.equal(refImport.Vid_GetModeInfo(3), null, "createRefImport Vid_GetModeInfo mismatch");
assert.doesNotThrow(() => refImport.Vid_MenuInit(), "createRefImport Vid_MenuInit mismatch");
assert.doesNotThrow(() => refImport.Vid_NewWindow(640, 480), "createRefImport Vid_NewWindow mismatch");

console.log("quake2-ref-header: ok");
