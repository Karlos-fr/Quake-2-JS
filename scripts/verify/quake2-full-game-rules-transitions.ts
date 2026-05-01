/**
 * File: quake2-full-game-rules-transitions.ts
 * Purpose: Verify full-game rules transitions stay owned by the ported game/server path.
 */

import { strict as assert } from "node:assert";

import { getFullGameServerMapPath } from "../../apps/web/src/full-game-render-source.js";
import { createClientRuntime } from "../../packages/client/src/index.js";
import {
  BUTTON_ATTACK,
  BUTTON_ANY,
  CS_MODELS,
  PMF_TIME_TELEPORT,
  createCvarRuntime,
  entity_event_t,
  pmtype_t,
  type cvar_t,
  type trace_t
} from "../../packages/qcommon/src/index.js";
import {
  ClientBeginServerFrame,
  ClientThink,
  DEAD_DEAD,
  DEAD_NO,
  G_MainRunFrame,
  InitBodyQue,
  PutClientInServer,
  SP_target_changelevel,
  attachGameClient,
  createGameMainContext,
  createGameRuntimeFromBspEntities,
  player_die,
  spawnGameEntity,
  type GameEntity,
  type game_import_t
} from "../../packages/game/src/index.js";

verifyRendererMapPathComesFromServerWorldModel();
verifyTargetChangelevelQueuesGamemapThroughExitLevel();
verifyIntermissionButtonExitsThroughClientThink();
verifyDeathmatchDeathRespawnsThroughClientBeginServerFrame();

console.log("quake2-full-game-rules-transitions: ok");

function verifyRendererMapPathComesFromServerWorldModel(): void {
  const client = createClientRuntime();

  assert.equal(
    getFullGameServerMapPath(client, "*base1$start"),
    "maps/base1.bsp",
    "renderer map path should normalize pending gamemap requests before configstrings arrive"
  );

  client.cl.configstrings[CS_MODELS + 1] = "maps/unit2.bsp";
  assert.equal(
    getFullGameServerMapPath(client, "base1"),
    "maps/unit2.bsp",
    "renderer map path should prefer the active server world-model configstring"
  );
}

function verifyTargetChangelevelQueuesGamemapThroughExitLevel(): void {
  const addedCommands: string[] = [];
  const runtime = createGameRuntimeFromBspEntities([{ properties: { classname: "worldspawn" } }]);
  runtime.maxclients = 1;
  runtime.time = 2;
  runtime.framenum = 20;

  const player = spawnConnectedPlayer(runtime);
  player.health = 100;

  const context = createGameMainContext(createImports(addedCommands), { runtime });
  const changelevel = spawnGameEntity(runtime);
  changelevel.classname = "target_changelevel";
  changelevel.map = "unit2";
  SP_target_changelevel(changelevel, runtime);

  changelevel.use?.(changelevel, player, player, runtime);
  assert.equal(runtime.intermissiontime, 2, "target_changelevel should enter BeginIntermission");
  assert.equal(runtime.changemap, "unit2", "BeginIntermission should store the destination map");
  assert.equal(runtime.exitintermission, 1, "single-player target_changelevel should request level exit");

  G_MainRunFrame(context);
  assert.equal(addedCommands.pop(), "gamemap \"unit2\"\n", "ExitLevel should queue the source gamemap command");
  assert.equal(runtime.intermissiontime, 0, "ExitLevel should clear intermission state");
  assert.equal(runtime.exitintermission, 0, "ExitLevel should clear exitintermission");
}

function verifyIntermissionButtonExitsThroughClientThink(): void {
  const addedCommands: string[] = [];
  const runtime = createGameRuntimeFromBspEntities([{ properties: { classname: "worldspawn" } }]);
  runtime.maxclients = 1;
  runtime.deathmatch = true;
  runtime.intermissiontime = 1;
  runtime.changemap = "q2dm2";
  runtime.time = 7;
  runtime.framenum = 70;

  const player = spawnConnectedPlayer(runtime);
  const context = createGameMainContext(createImports(addedCommands), { runtime });

  ClientThink(player, createUsercmd(BUTTON_ANY), runtime);
  assert.equal(player.client?.ps.pmove.pm_type, pmtype_t.PM_FREEZE, "ClientThink should freeze clients during intermission");
  assert.equal(runtime.exitintermission, 1, "ClientThink should request intermission exit after the delay and a button press");

  G_MainRunFrame(context);
  assert.equal(addedCommands.pop(), "gamemap \"q2dm2\"\n", "G_RunFrame should route exitintermission through ExitLevel");
}

function verifyDeathmatchDeathRespawnsThroughClientBeginServerFrame(): void {
  const runtime = createGameRuntimeFromBspEntities([{ properties: { classname: "worldspawn" } }]);
  runtime.maxclients = 1;
  runtime.deathmatch = true;
  runtime.time = 10;
  runtime.framenum = 100;

  const player = spawnConnectedPlayer(runtime);
  InitBodyQue(runtime);
  const hooks = {
    SelectSpawnPoint: () => ({ origin: [32, 64, 96] as [number, number, number], angles: [0, 90, 0] as [number, number, number] }),
    KillBox: () => true
  };

  PutClientInServer(player, runtime, hooks);
  player.health = -1;
  player_die(player, player, player, 100000, runtime, hooks);

  assert.equal(player.deadflag, DEAD_DEAD, "player_die should mark the player dead before respawn");
  assert.equal(player.client?.ps.pmove.pm_type, pmtype_t.PM_DEAD, "player_die should expose dead movement state");

  runtime.time = (player.client?.respawn_time ?? 0) + 0.1;
  ClientThink(player, createUsercmd(BUTTON_ATTACK), runtime, hooks);
  ClientBeginServerFrame(player, runtime, hooks);

  assert.equal(player.deadflag, DEAD_NO, "ClientBeginServerFrame should respawn dead deathmatch players after attack");
  assert.equal(player.s.event, entity_event_t.EV_PLAYER_TELEPORT, "respawn should emit the player teleport event");
  assert.equal((player.client?.ps.pmove.pm_flags ?? 0) & PMF_TIME_TELEPORT, PMF_TIME_TELEPORT, "respawn should apply teleport freeze");
  assert.deepEqual(player.s.origin, [32, 64, 97], "respawn should place the player at the selected spawn point");
}

function spawnConnectedPlayer(runtime: ReturnType<typeof createGameRuntimeFromBspEntities>): GameEntity {
  const player = spawnGameEntity(runtime);
  attachGameClient(player);
  player.inuse = true;
  player.classname = "player";
  player.health = 100;
  player.max_health = 100;
  player.client!.pers.connected = true;
  player.client!.pers.netname = "unit";
  return player;
}

function createUsercmd(buttons: number) {
  return {
    msec: 16,
    buttons,
    angles: [0, 0, 0] as [number, number, number],
    forwardmove: 0,
    sidemove: 0,
    upmove: 0,
    impulse: 0,
    lightlevel: 0
  };
}

function createImports(addedCommands: string[]): game_import_t {
  const cvar = createCvarRuntime();

  return {
    bprintf: () => undefined,
    dprintf: () => undefined,
    cprintf: () => undefined,
    centerprintf: () => undefined,
    sound: () => undefined,
    positioned_sound: () => undefined,
    configstring: () => undefined,
    error: (fmt): never => {
      throw new Error(fmt);
    },
    modelindex: () => 0,
    soundindex: () => 0,
    imageindex: () => 0,
    setmodel: () => undefined,
    trace: (_start, _mins, _maxs, end): trace_t => ({
      allsolid: false,
      startsolid: false,
      fraction: 1,
      endpos: [...end],
      plane: { normal: [0, 0, 1], dist: 0, type: 0, signbits: 0 },
      surface: null,
      contents: 0,
      ent: null
    }),
    pointcontents: () => 0,
    inPVS: () => false,
    inPHS: () => false,
    SetAreaPortalState: () => undefined,
    AreasConnected: () => false,
    linkentity: () => undefined,
    unlinkentity: () => undefined,
    BoxEdicts: () => 0,
    Pmove: () => undefined,
    multicast: () => undefined,
    unicast: () => undefined,
    WriteChar: () => undefined,
    WriteByte: () => undefined,
    WriteShort: () => undefined,
    WriteLong: () => undefined,
    WriteFloat: () => undefined,
    WriteString: () => undefined,
    WritePosition: () => undefined,
    WriteDir: () => undefined,
    WriteAngle: () => undefined,
    TagMalloc: () => ({}),
    TagFree: () => undefined,
    FreeTags: () => undefined,
    cvar: (name, value): cvar_t | null => {
      const existing = cvar.cvar_vars.find((candidate) => candidate.name === name);
      if (existing) {
        return existing;
      }
      const created: cvar_t = {
        name,
        string: value,
        latched_string: null,
        flags: 0,
        modified: false,
        value: Number.parseFloat(value) || 0
      };
      cvar.cvar_vars.push(created);
      return created;
    },
    cvar_set: () => null,
    cvar_forceset: () => null,
    argc: () => 0,
    argv: () => "",
    args: () => "",
    AddCommandString: (text) => {
      addedCommands.push(text);
    },
    DebugGraph: () => undefined
  };
}
