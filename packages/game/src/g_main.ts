/**
 * File: g_main.ts
 * Source: Quake II original / game/g_main.c
 * Purpose: Port of the main gameplay module entry points and exported game API wiring.
 *
 * Porting policy:
 * - Preserve original behavior first.
 * - Preserve original names whenever possible.
 * - Avoid structural refactors unless documented.
 *
 * Deviations:
 * - The original file-scope globals are grouped into an explicit `GameMainContext`.
 * - Unported persistence entry points (`WriteGame`, `ReadGame`, `WriteLevel`, `ReadLevel`) currently emit diagnostics instead of touching save files.
 * - `SpawnEntities` uses the existing entity-lump parser and an explicit runtime rebuild step.
 *
 * Notes:
 * - This file is intended to stay close to the original C source.
 */

import { parseEntityLump, type BspEntity } from "../../formats/src/bsp.js";
import {
  CVAR_ARCHIVE,
  CVAR_LATCH,
  CVAR_NOSET,
  CVAR_SERVERINFO,
  CVAR_USERINFO,
  DF_SAME_LEVEL,
  PRINT_HIGH,
  type cvar_t,
  type qboolean,
  type usercmd_t
} from "../../qcommon/src/index.js";
import { GAME_API_VERSION, type edict_t, type game_export_t, type game_import_t } from "./game.js";
import {
  FL_FLY,
  FL_SWIM,
  GAMEVERSION,
  SVF_MONSTER,
  TAG_GAME,
  TAG_LEVEL,
  createGameLocals,
  createLevelLocals,
  type game_locals_t,
  type level_locals_t
} from "./g-local.js";
import { AI_SetSightClient } from "./g_ai.js";
import { InitItems } from "./g_items.js";
import { G_RunEntity } from "./g_phys.js";
import { M_CheckGround } from "./g_monster.js";
import type { GameHudHooks } from "./p_hud.js";
import { BeginIntermission } from "./p_hud.js";
import type { GamePlayerClientHooks } from "./p_client.js";
import {
  ClientBegin,
  ClientBeginServerFrame,
  ClientConnect,
  ClientDisconnect,
  ClientThink,
  ClientUserinfoChanged,
  InitBodyQue
} from "./p_client.js";
import { ClientEndServerFrame } from "./p_view.js";
import { ED_CallSpawn, G_FindTeams } from "./g_spawn.js";
import { G_Find, G_Spawn } from "./g_utils.js";
import {
  attachGameClient,
  createGameRuntimeFromBspEntities,
  linkGameEntity,
  type GameEntity,
  type GameRuntime
} from "./runtime.js";
import {
  ServerCommand as ServerCommand_Svcmds,
  createGameServerCommandState,
  type GameServerCommandState
} from "./g_svcmds.js";

/**
 * Category: New
 * Purpose: Group the Quake II gameplay cvars touched directly by the first `g_main.c` port.
 */
export interface GameMainCvars {
  deathmatch: cvar_t | null;
  coop: cvar_t | null;
  dmflags: cvar_t | null;
  skill: cvar_t | null;
  fraglimit: cvar_t | null;
  timelimit: cvar_t | null;
  password: cvar_t | null;
  spectator_password: cvar_t | null;
  maxclients: cvar_t | null;
  maxspectators: cvar_t | null;
  maxentities: cvar_t | null;
  g_select_empty: cvar_t | null;
  dedicated: cvar_t | null;
  filterban: cvar_t | null;
  sv_gravity: cvar_t | null;
  sv_maxvelocity: cvar_t | null;
  sv_maplist: cvar_t | null;
}

/**
 * Category: New
 * Purpose: Carry the explicit gameplay-module context that replaces the original `g_main.c` globals.
 */
export interface GameMainContext {
  gi: game_import_t;
  runtime: GameRuntime;
  game: game_locals_t;
  level: level_locals_t;
  serverCommands: GameServerCommandState;
  cvars: GameMainCvars;
  hooks: GameMainHooks;
}

/**
 * Category: New
 * Purpose: Group the still-external callbacks used by the first `g_main.c` port.
 */
export interface GameMainHooks extends GamePlayerClientHooks, GameHudHooks {
  writeFile?: (path: string, contents: string) => boolean;
  onClientCommand?: (ent: GameEntity, runtime: GameRuntime) => void;
}

/**
 * Category: New
 * Purpose: Configure one `GetGameApi` context build.
 */
export interface GameMainContextOptions {
  runtime?: GameRuntime;
  hooks?: GameMainHooks;
}

/**
 * Original name: ShutdownGame
 * Source: game/g_main.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Emits the original shutdown banner and releases the game/tag pools through the engine import API.
 */
export function ShutdownGame(context: GameMainContext): void {
  context.gi.dprintf("==== ShutdownGame ====\n");
  context.gi.FreeTags(TAG_LEVEL);
  context.gi.FreeTags(TAG_GAME);
}

/**
 * Original name: ClientEndServerFrames
 * Source: game/g_main.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Finalizes the player-visible state for all active clients after the main entity frame has run.
 *
 * Porting notes:
 * - Uses a currently reduced `ClientEndServerFrame` implementation until `game/p_view.c` is ported.
 */
export function ClientEndServerFrames(context: GameMainContext): void {
  context.runtime.helpchanged = context.game.helpchanged;

  for (let index = 0; index < context.runtime.maxclients; index += 1) {
    const ent = context.runtime.entities[1 + index] ?? null;
    if (!ent?.inuse || !ent.client) {
      continue;
    }

    ClientEndServerFrame(ent, context.runtime);
  }
}

/**
 * Original name: InitGame
 * Source: game/g_main.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Initializes the gameplay runtime-facing cvars and the shared item count exposed by the game module.
 */
export function InitGame(context: GameMainContext): void {
  context.gi.dprintf("==== InitGame ====\n");

  context.cvars.deathmatch = context.gi.cvar("deathmatch", "0", CVAR_LATCH);
  context.cvars.coop = context.gi.cvar("coop", "0", CVAR_LATCH);
  context.cvars.dmflags = context.gi.cvar("dmflags", "0", CVAR_SERVERINFO);
  context.cvars.skill = context.gi.cvar("skill", "1", CVAR_LATCH);
  context.cvars.fraglimit = context.gi.cvar("fraglimit", "0", CVAR_SERVERINFO);
  context.cvars.timelimit = context.gi.cvar("timelimit", "0", CVAR_SERVERINFO);
  context.cvars.password = context.gi.cvar("password", "", CVAR_USERINFO);
  context.cvars.spectator_password = context.gi.cvar("spectator_password", "", CVAR_USERINFO);
  context.cvars.maxclients = context.gi.cvar("maxclients", "4", CVAR_SERVERINFO | CVAR_LATCH);
  context.cvars.maxspectators = context.gi.cvar("maxspectators", "4", CVAR_SERVERINFO);
  context.cvars.maxentities = context.gi.cvar("maxentities", "1024", CVAR_LATCH);
  context.cvars.g_select_empty = context.gi.cvar("g_select_empty", "0", CVAR_ARCHIVE);
  context.cvars.dedicated = context.gi.cvar("dedicated", "0", CVAR_NOSET);
  context.cvars.filterban = context.gi.cvar("filterban", "1", 0);
  context.cvars.sv_gravity = context.gi.cvar("sv_gravity", "800", 0);
  context.cvars.sv_maxvelocity = context.gi.cvar("sv_maxvelocity", "2000", 0);
  context.cvars.sv_maplist = context.gi.cvar("sv_maplist", "", 0);

  context.game.num_items = InitItems();
  applyMainCvarsToRuntime(context);
}

/**
 * Original name: SpawnEntities
 * Source: game/g_main.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Rebuilds the gameplay runtime from one textual entity lump and reserves the canonical player-edict prefix.
 *
 * Porting notes:
 * - Keeps player edicts at slots `1..maxclients`, then appends BSP entities after the worldspawn.
 */
export function SpawnEntities(context: GameMainContext, mapname: string, entstring: string, spawnpoint: string): void {
  const parsedEntities = parseEntityLump(entstring);
  const nextRuntime = createGameRuntimeFromBspEntities(buildServerEntityList(parsedEntities, context.runtime.maxclients));

  syncMainRuntimeState(context.runtime, nextRuntime);
  applyMainCvarsToRuntime(context);

  context.runtime.spawnpoint = spawnpoint;
  context.game.spawnpoint = spawnpoint;
  context.level.mapname = mapname;
  context.level.framenum = 0;
  context.level.time = 0;

  for (let index = 1; index <= context.runtime.maxclients; index += 1) {
    const player = context.runtime.entities[index]!;
    player.inuse = false;
    player.classname = "player";
    if (!player.client) {
      attachGameClient(player);
    }
    linkGameEntity(context.runtime, player);
  }

  for (let index = context.runtime.maxclients + 1; index < context.runtime.entities.length; index += 1) {
    const entity = context.runtime.entities[index];
    if (!entity) {
      continue;
    }

    linkGameEntity(context.runtime, entity);
    ED_CallSpawn(entity, context.runtime);
  }

  G_FindTeams(context.runtime);
  InitBodyQue(context.runtime);
}

/**
 * Original name: G_RunFrame
 * Source: game/g_main.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Advances the gameplay world by one frame, then finalizes all active client views/HUD state.
 */
export function G_RunFrame(context: GameMainContext): void {
  context.runtime.framenum += 1;
  context.runtime.time += 0.1;
  syncLevelFromRuntime(context);
  AI_SetSightClient(context.runtime);

  if (context.level.exitintermission) {
    ExitLevel(context);
    return;
  }

  for (let index = 0; index < context.runtime.entities.length; index += 1) {
    const ent = context.runtime.entities[index] ?? null;
    if (!ent?.inuse) {
      continue;
    }

    context.runtime.current_entity = ent;
    ent.s.old_origin = [...ent.s.origin];

    if (ent.groundentity && ent.groundentity.linkcount !== ent.groundentity_linkcount) {
      ent.groundentity = null;
      if ((ent.flags & (FL_SWIM | FL_FLY)) === 0 && (ent.svflags & SVF_MONSTER) !== 0) {
        M_CheckGround(ent, context.runtime);
      }
    }

    if (index > 0 && index <= context.runtime.maxclients) {
      ClientBeginServerFrame(ent, context.runtime, context.hooks);
      continue;
    }

    G_RunEntity(ent, context.runtime);
  }

  context.runtime.current_entity = null;
  syncLevelFromRuntime(context);
  CheckDMRules(context);
  ClientEndServerFrames(context);
}

/**
 * Original name: CreateTargetChangeLevel
 * Source: game/g_main.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Creates a temporary `target_changelevel` entity wired to the chosen destination map.
 */
export function CreateTargetChangeLevel(context: GameMainContext, map: string): GameEntity {
  const ent = G_Spawn(context.runtime);
  ent.classname = "target_changelevel";
  context.level.nextmap = map;
  ent.map = context.level.nextmap;
  return ent;
}

/**
 * Original name: EndDMLevel
 * Source: game/g_main.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Chooses the next deathmatch map using the original same-level, maplist and target-changelevel precedence.
 */
export function EndDMLevel(context: GameMainContext): void {
  if ((context.runtime.dmflags & DF_SAME_LEVEL) !== 0) {
    BeginIntermission(CreateTargetChangeLevel(context, context.level.mapname), context.runtime, context.hooks);
    syncLevelFromRuntime(context);
    return;
  }

  const maplist = context.cvars.sv_maplist?.string ?? "";
  if (maplist.length > 0) {
    const maps = tokenizeMapList(maplist);
    const currentIndex = maps.findIndex((map) => stringsEqualIgnoreCase(map, context.level.mapname));
    if (currentIndex >= 0) {
      const nextMap = maps[currentIndex + 1] ?? maps[0] ?? context.level.mapname;
      BeginIntermission(CreateTargetChangeLevel(context, nextMap), context.runtime, context.hooks);
      syncLevelFromRuntime(context);
      return;
    }
  }

  if (context.level.nextmap.length > 0) {
    BeginIntermission(CreateTargetChangeLevel(context, context.level.nextmap), context.runtime, context.hooks);
    syncLevelFromRuntime(context);
    return;
  }

  const changelevel = G_Find(context.runtime, null, "classname", "target_changelevel");
  if (!changelevel) {
    BeginIntermission(CreateTargetChangeLevel(context, context.level.mapname), context.runtime, context.hooks);
    syncLevelFromRuntime(context);
    return;
  }

  BeginIntermission(changelevel, context.runtime, context.hooks);
  syncLevelFromRuntime(context);
}

/**
 * Original name: CheckDMRules
 * Source: game/g_main.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Ends the current deathmatch when the configured time or frag limit is reached.
 */
export function CheckDMRules(context: GameMainContext): void {
  syncLevelFromRuntime(context);

  if (context.level.intermissiontime) {
    return;
  }

  if (!context.runtime.deathmatch) {
    return;
  }

  const timelimit = context.cvars.timelimit?.value ?? 0;
  if (timelimit !== 0 && context.level.time >= (timelimit * 60)) {
    context.gi.bprintf(PRINT_HIGH, "Timelimit hit.\n");
    EndDMLevel(context);
    return;
  }

  const fraglimit = context.cvars.fraglimit?.value ?? 0;
  if (fraglimit === 0) {
    return;
  }

  for (let index = 0; index < context.runtime.maxclients; index += 1) {
    const ent = context.runtime.entities[index + 1] ?? null;
    const client = ent?.client;
    if (!ent?.inuse || !client) {
      continue;
    }

    if (client.resp.score >= fraglimit) {
      context.gi.bprintf(PRINT_HIGH, "Fraglimit hit.\n");
      EndDMLevel(context);
      return;
    }
  }
}

/**
 * Original name: ExitLevel
 * Source: game/g_main.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Issues the deferred `gamemap` command and clears the intermission state before the next level starts.
 */
export function ExitLevel(context: GameMainContext): void {
  const changemap = context.level.changemap ?? context.runtime.changemap;
  context.gi.AddCommandString(`gamemap "${changemap ?? ""}"\n`);

  context.level.changemap = null;
  context.runtime.changemap = null;
  context.level.exitintermission = 0;
  context.runtime.exitintermission = 0;
  context.level.intermissiontime = 0;
  context.runtime.intermissiontime = 0;

  ClientEndServerFrames(context);

  for (let index = 0; index < context.runtime.maxclients; index += 1) {
    const ent = context.runtime.entities[index + 1] ?? null;
    const client = ent?.client;
    if (!ent?.inuse || !client) {
      continue;
    }

    if (ent.health > client.pers.max_health) {
      ent.health = client.pers.max_health;
    }
  }
}

/**
 * Original name: GetGameAPI
 * Source: game/g_main.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Builds the gameplay export table expected by the Quake II server and closes it over one explicit TS context.
 */
export function GetGameApi(imports: game_import_t, options: GameMainContextOptions = {}): game_export_t {
  const context = createGameMainContext(imports, options);

  return {
    apiversion: GAME_API_VERSION,
    Init: () => InitGame(context),
    Shutdown: () => ShutdownGame(context),
    SpawnEntities: (mapname, entstring, spawnpoint) => SpawnEntities(context, mapname, entstring, spawnpoint),
    WriteGame: (filename, autosave) => WriteGame(context, filename, autosave),
    ReadGame: (filename) => ReadGame(context, filename),
    WriteLevel: (filename) => WriteLevel(context, filename),
    ReadLevel: (filename) => ReadLevel(context, filename),
    ClientConnect: (ent, userinfo) => ClientConnect(ent, userinfo, context.runtime, context.hooks),
    ClientBegin: (ent) => ClientBegin(ent, context.runtime, context.hooks),
    ClientUserinfoChanged: (ent, userinfo) => {
      ClientUserinfoChanged(ent, userinfo, context.runtime, context.hooks);
    },
    ClientDisconnect: (ent) => ClientDisconnect(ent, context.runtime, context.hooks),
    ClientCommand: (ent) => ClientCommand(context, ent),
    ClientThink: (ent, cmd) => ClientThink(ent, cmd, context.runtime, context.hooks),
    RunFrame: () => G_RunFrame(context),
    ServerCommand: () => {
      const serverContext = context.hooks.writeFile
        ? { gi: context.gi, writeFile: context.hooks.writeFile }
        : { gi: context.gi };
      ServerCommand_Svcmds(context.serverCommands, serverContext);
    },
    get edicts() {
      return context.runtime.entities;
    },
    edict_size: 0,
    get num_edicts() {
      return context.runtime.entities.length;
    },
    get max_edicts() {
      return context.runtime.maxentities;
    }
  };
}

/**
 * Category: New
 * Purpose: Create the explicit runtime context used by the first `g_main.c` port.
 */
export function createGameMainContext(imports: game_import_t, options: GameMainContextOptions = {}): GameMainContext {
  return {
    gi: imports,
    runtime: options.runtime ?? createGameRuntimeFromBspEntities([{ properties: { classname: "worldspawn" } }]),
    game: createGameLocals(),
    level: createLevelLocals(),
    serverCommands: createGameServerCommandState(),
    cvars: createGameMainCvars(),
    hooks: options.hooks ?? {}
  };
}

/**
 * Original name: ClientCommand
 * Source: game/g_main.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Preserves the export slot and keeps the still-unported client command dispatch explicit.
 */
export function ClientCommand(context: GameMainContext, ent: edict_t): void {
  context.hooks.onClientCommand?.(ent, context.runtime);
}

/**
 * Original name: WriteGame
 * Source: game/g_main.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Keeps the savegame export slot explicit until `g_save.c` is ported.
 */
export function WriteGame(context: GameMainContext, filename: string, autosave: qboolean): void {
  void autosave;
  context.gi.dprintf(`WriteGame not implemented yet: ${filename}\n`);
}

/**
 * Original name: ReadGame
 * Source: game/g_main.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Keeps the savegame import slot explicit until `g_save.c` is ported.
 */
export function ReadGame(context: GameMainContext, filename: string): void {
  context.gi.dprintf(`ReadGame not implemented yet: ${filename}\n`);
}

/**
 * Original name: WriteLevel
 * Source: game/g_main.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Keeps the level-save export slot explicit until `g_save.c` is ported.
 */
export function WriteLevel(context: GameMainContext, filename: string): void {
  context.gi.dprintf(`WriteLevel not implemented yet: ${filename}\n`);
}

/**
 * Original name: ReadLevel
 * Source: game/g_main.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Keeps the level-save import slot explicit until `g_save.c` is ported.
 */
export function ReadLevel(context: GameMainContext, filename: string): void {
  context.gi.dprintf(`ReadLevel not implemented yet: ${filename}\n`);
}

function createGameMainCvars(): GameMainCvars {
  return {
    deathmatch: null,
    coop: null,
    dmflags: null,
    skill: null,
    fraglimit: null,
    timelimit: null,
    password: null,
    spectator_password: null,
    maxclients: null,
    maxspectators: null,
    maxentities: null,
    g_select_empty: null,
    dedicated: null,
    filterban: null,
    sv_gravity: null,
    sv_maxvelocity: null,
    sv_maplist: null
  };
}

function applyMainCvarsToRuntime(context: GameMainContext): void {
  context.runtime.deathmatch = Boolean(context.cvars.deathmatch?.value);
  context.runtime.coop = Boolean(context.cvars.coop?.value);
  context.runtime.dmflags = context.cvars.dmflags?.value ?? 0;
  context.runtime.skill = context.cvars.skill?.value ?? 1;
  context.runtime.g_select_empty = Boolean(context.cvars.g_select_empty?.value);
  context.runtime.gravity = context.cvars.sv_gravity?.value ?? context.runtime.gravity;
  context.runtime.maxclients = Math.max(0, Math.trunc(context.cvars.maxclients?.value ?? context.runtime.maxclients));
  context.runtime.maxentities = Math.max(context.runtime.maxclients + 1, Math.trunc(context.cvars.maxentities?.value ?? context.runtime.maxentities));
  context.game.maxclients = context.runtime.maxclients;
  context.game.maxentities = context.runtime.maxentities;
}

function syncLevelFromRuntime(context: GameMainContext): void {
  context.level.framenum = context.runtime.framenum;
  context.level.time = context.runtime.time;
  context.level.intermissiontime = context.runtime.intermissiontime;
  context.level.exitintermission = context.runtime.exitintermission;
  context.level.changemap = context.runtime.changemap;
}

function buildServerEntityList(parsedEntities: BspEntity[], maxclients: number): BspEntity[] {
  const worldspawn = parsedEntities[0] ?? { properties: { classname: "worldspawn" } };
  const reservedClients = Array.from({ length: maxclients }, () => ({ properties: { classname: "player" } }));
  return [worldspawn, ...reservedClients, ...parsedEntities.slice(1)];
}

function syncMainRuntimeState(target: GameRuntime, source: GameRuntime): void {
  for (const key of Object.keys(source) as Array<keyof GameRuntime>) {
    (target as Record<keyof GameRuntime, unknown>)[key] = source[key];
  }
}

function tokenizeMapList(maplist: string): string[] {
  return maplist
    .split(/[ ,\n\r]+/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

function stringsEqualIgnoreCase(left: string, right: string): boolean {
  return left.localeCompare(right, undefined, { sensitivity: "accent", usage: "search" }) === 0;
}
