/**
 * File: quake2-full-game-render-source.ts
 * Purpose: Verify the full-game server-backed render source reads snapshots, cvars and sounds from the parsed client state.
 */

import { strict as assert } from "node:assert";

import { createClientRuntime, connstate_t } from "../../packages/client/src/client.js";
import { createSfx } from "../../packages/client/src/snd_loc.js";
import {
  CS_MODELS,
  Cmd_Init,
  Cvar_Get,
  Cvar_Init,
  EF_ANIM23,
  RF_TRANSLUCENT,
  createCommandRuntime,
  createCvarRuntime
} from "../../packages/qcommon/src/index.js";
import {
  buildServerBackedBrushModelSnapshots,
  createFullGameServerRenderSource,
  getFullGameServerMapPath,
  resolveClientSoundPath,
  resolveClientSoundPathValue
} from "../../apps/web/src/full-game-render-source.js";

const client = createClientRuntime();
client.cls.state = connstate_t.ca_active;
client.cl.refresh_prepped = true;
client.cl.frame.valid = true;
client.cl.frame.serverframe = 8;
client.cl.frame.servertime = 800;
client.cl.frame.parse_entities = 0;
client.cl.frame.num_entities = 2;
client.cl.time = 800;
client.cl.sky.name = "unit1_";
client.cl.sky.rotate = 12;
client.cl.sky.axis = [0, 0, 1];

client.cl.configstrings[CS_MODELS + 1] = "maps/unit2.bsp";
client.cl.configstrings[CS_MODELS + 2] = "*1";
client.cl.configstrings[CS_MODELS + 3] = "models/objects/debris2/tris.md2";
client.cl.model_draw[2] = { backendModel: "inline-model-handle" };
client.cl.model_draw[3] = "models/objects/debris2/tris.md2";

const brushEntity = client.cl_parse_entities[0];
brushEntity.number = 12;
brushEntity.modelindex = 2;
brushEntity.origin = [64, 128, 16];
brushEntity.angles = [0, 90, 0];
brushEntity.frame = 1;
brushEntity.effects = EF_ANIM23;
brushEntity.renderfx = RF_TRANSLUCENT;
client.cl_entities[12]!.current = {
  ...brushEntity,
  origin: [...brushEntity.origin],
  angles: [...brushEntity.angles],
  old_origin: [...brushEntity.origin]
};
client.cl_entities[12]!.prev = {
  ...client.cl_entities[12]!.current,
  origin: [...brushEntity.origin],
  angles: [...brushEntity.angles],
  old_origin: [...brushEntity.origin],
  frame: 0
};

const aliasEntity = client.cl_parse_entities[1];
aliasEntity.number = 13;
aliasEntity.modelindex = 3;
aliasEntity.origin = [1, 2, 3];
aliasEntity.angles = [4, 5, 6];

client.cl.sound_precache[4] = "world/wind2.wav";
const registeredSound = createSfx();
registeredSound.name = "misc/h2ohit1.wav";
client.cl.sound_precache[5] = registeredSound;

assert.equal(resolveClientSoundPath(client, 4), "world/wind2.wav", "string sound precaches should resolve");
assert.equal(resolveClientSoundPath(client, 5), "misc/h2ohit1.wav", "sfx_t sound precaches should resolve");
assert.equal(resolveClientSoundPathValue({ name: "" }), null, "empty sound handles should be ignored");
assert.equal(resolveClientSoundPath(client, 6), null, "missing sound precaches should resolve to null");

const cmd = createCommandRuntime();
const cvar = createCvarRuntime();
Cmd_Init(cmd);
Cvar_Init(cvar, cmd);
Cvar_Get(cvar, "gl_shadows", "1", 0);

const source = createFullGameServerRenderSource(client, { cvar, predictMovement: false, drawGun: false });
const snapshots = buildServerBackedBrushModelSnapshots(client, source.refreshFrame);
assert.deepEqual(
  snapshots,
  [{
    model: "*1",
    origin: [64, 128, 16],
    angles: [0, 90, 0],
    frame: 3,
    flags: RF_TRANSLUCENT
  }],
  "server-backed brush snapshots should use refresh-frame animation frames from inline model configstrings"
);
assert.equal(source.runtime, client, "render source should expose the parsed client runtime");
assert.equal(source.skySnapshot?.name, "unit1_", "render source should expose the parsed sky config");
assert.equal(source.getCvarValue("gl_shadows"), 1, "render source should read renderer cvars");
assert.deepEqual(source.getBrushModelSnapshots(), snapshots, "render source should reuse server-backed brush snapshots");
assert.equal(source.resolveSoundPath(5), "misc/h2ohit1.wav", "render source should resolve server sound precaches");
assert.ok(source.refreshFrame, "render source should build a client refresh frame");
assert.equal(source.screenState.loading.visible, false, "render source should build HUD/screen state");
assert.equal(getFullGameServerMapPath(client, "base1"), "maps/unit2.bsp", "world model configstring should drive renderer map path");

console.log("quake2-full-game-render-source: ok");
