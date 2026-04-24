/**
 * File: quake2-client-header.ts
 * Purpose: Verify that the TypeScript target for `client/client.h` preserves the header-visible client runtime structures and cross-module declarations.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the mixed client header.
 *
 * Dependencies:
 * - packages/client/src/index.ts
 * - packages/client/src/types.ts
 * - packages/client/src/keys.ts
 */

import { strict as assert } from "node:assert";

import {
  CMD_BACKUP,
  INSTANT_PARTICLE,
  MAX_CLIENTWEAPONMODELS,
  MAX_DLIGHTS,
  MAX_PARSE_ENTITIES,
  MAX_PARTICLES,
  MAX_SUSTAINS,
  connstate_t,
  createCentity,
  createClientRuntime,
  createClientState,
  createClientStatic,
  createClientinfo,
  createFrame,
  createKbutton,
  dltype_t,
  keydest_t
} from "../../packages/client/src/index.js";

assert.equal(CMD_BACKUP, 64, "CMD_BACKUP mismatch");
assert.equal(MAX_CLIENTWEAPONMODELS, 20, "MAX_CLIENTWEAPONMODELS mismatch");
assert.equal(MAX_PARSE_ENTITIES, 1024, "MAX_PARSE_ENTITIES mismatch");
assert.equal(MAX_SUSTAINS, 32, "MAX_SUSTAINS mismatch");
assert.equal(MAX_DLIGHTS, 32, "MAX_DLIGHTS mismatch");
assert.equal(MAX_PARTICLES, 4096, "MAX_PARTICLES mismatch");
assert.equal(INSTANT_PARTICLE, -10000.0, "INSTANT_PARTICLE mismatch");

assert.equal(connstate_t.ca_uninitialized, 0, "connstate_t ca_uninitialized mismatch");
assert.equal(connstate_t.ca_disconnected, 1, "connstate_t ca_disconnected mismatch");
assert.equal(connstate_t.ca_connecting, 2, "connstate_t ca_connecting mismatch");
assert.equal(connstate_t.ca_connected, 3, "connstate_t ca_connected mismatch");
assert.equal(connstate_t.ca_active, 4, "connstate_t ca_active mismatch");

assert.equal(dltype_t.dl_none, 0, "dltype_t dl_none mismatch");
assert.equal(dltype_t.dl_model, 1, "dltype_t dl_model mismatch");
assert.equal(dltype_t.dl_sound, 2, "dltype_t dl_sound mismatch");
assert.equal(dltype_t.dl_skin, 3, "dltype_t dl_skin mismatch");
assert.equal(dltype_t.dl_single, 4, "dltype_t dl_single mismatch");

assert.equal(keydest_t.key_game, 0, "keydest_t key_game mismatch");
assert.equal(keydest_t.key_console, 1, "keydest_t key_console mismatch");
assert.equal(keydest_t.key_message, 2, "keydest_t key_message mismatch");
assert.equal(keydest_t.key_menu, 3, "keydest_t key_menu mismatch");

const frame = createFrame();
assert.equal(frame.valid, false, "createFrame valid mismatch");
assert.equal(frame.areabits.length, 32, "createFrame areabits length mismatch");
assert.equal(frame.num_entities, 0, "createFrame num_entities mismatch");

const centity = createCentity();
assert.deepEqual(centity.lerp_origin, [0, 0, 0], "createCentity lerp_origin mismatch");
assert.equal(centity.trailcount, 0, "createCentity trailcount mismatch");

const clientInfo = createClientinfo();
assert.equal(clientInfo.name, "", "createClientinfo name mismatch");
assert.equal(clientInfo.weaponmodel.length, MAX_CLIENTWEAPONMODELS, "createClientinfo weaponmodel length mismatch");
assert.equal(clientInfo.weaponmodel_paths.length, MAX_CLIENTWEAPONMODELS, "createClientinfo weaponmodel_paths length mismatch");
assert.equal(clientInfo.valid, false, "createClientinfo valid mismatch");

const button = createKbutton();
assert.deepEqual(button.down, [0, 0], "createKbutton down mismatch");
assert.equal(button.state, 0, "createKbutton state mismatch");

const clientState = createClientState();
assert.equal(clientState.cmds.length, CMD_BACKUP, "createClientState cmds length mismatch");
assert.equal(clientState.cmd_time.length, CMD_BACKUP, "createClientState cmd_time length mismatch");
assert.equal(clientState.predicted_origins.length, CMD_BACKUP, "createClientState predicted_origins length mismatch");
assert.equal(clientState.frames.length, 16, "createClientState frames length mismatch");
assert.equal(clientState.dlights.length, MAX_DLIGHTS, "createClientState dlights length mismatch");
assert.equal(clientState.particles.length, MAX_PARTICLES, "createClientState particles length mismatch");
assert.equal(clientState.cl_weaponmodels[0], "weapon.md2", "createClientState default weapon model mismatch");
assert.equal(clientState.num_cl_weaponmodels, 1, "createClientState num_cl_weaponmodels mismatch");
assert.equal(clientState.clientinfo.length > 0, true, "createClientState clientinfo length mismatch");
assert.equal(clientState.tents.sustains.length, MAX_SUSTAINS, "createClientState sustains length mismatch");

const clientStatic = createClientStatic();
assert.equal(clientStatic.state, connstate_t.ca_disconnected, "createClientStatic state mismatch");
assert.equal(clientStatic.servername, "", "createClientStatic servername mismatch");
assert.equal(clientStatic.quakePort, 0, "createClientStatic quakePort mismatch");
assert.equal(clientStatic.download, null, "createClientStatic download handle mismatch");
assert.equal(clientStatic.downloadtype, dltype_t.dl_none, "createClientStatic downloadtype mismatch");
assert.equal(clientStatic.demofile, null, "createClientStatic demofile mismatch");

const runtime = createClientRuntime();
assert.equal(runtime.cl_parse_entities.length, MAX_PARSE_ENTITIES, "createClientRuntime parse_entities length mismatch");
assert.equal(runtime.cl_entities.length > 0, true, "createClientRuntime entities length mismatch");
assert.equal(runtime.cls.downloadtype, dltype_t.dl_none, "createClientRuntime persistent downloadtype mismatch");
assert.equal(runtime.net_message.maxsize, 65536, "createClientRuntime net_message size mismatch");

console.log("quake2-client-header: ok");
