/**
 * File: g_spawn.ts
 * Source: Quake II original / game/g_spawn.c
 * Purpose: Port the first spawn registry and team-linking routines required by brush gameplay plus visible world entities.
 *
 * Porting policy:
 * - Preserve original behavior first.
 * - Preserve original names whenever possible.
 * - Avoid structural refactors unless documented.
 *
 * Deviations:
 * - Spawn callbacks remain owned by their source modules; this registry only mirrors `game/g_spawn.c` dispatch.
 * - The server-facing `SpawnEntities` entry point receives the split `g_main.ts` context as an adapter boundary.
 *
 * Notes:
 * - This file is intended to stay close to the original spawn and team-linking flow.
 */

import { parseEntityLump, type BspEntity } from "../../formats/src/qfiles.js";
import {
  CS_CDTRACK,
  CS_ITEMS,
  CS_LIGHTS,
  CS_MAXCLIENTS,
  CS_NAME,
  CS_SKY,
  CS_SKYAXIS,
  CS_SKYROTATE,
  CS_STATUSBAR
} from "../../qcommon/src/index.js";
import type { GameMainContext } from "./g_main.js";
import {
  MOVETYPE_PUSH,
  SOLID_BSP,
  SPAWNFLAG_NOT_COOP,
  SPAWNFLAG_NOT_DEATHMATCH,
  SPAWNFLAG_NOT_EASY,
  SPAWNFLAG_NOT_HARD,
  SPAWNFLAG_NOT_MEDIUM,
  TAG_LEVEL
} from "./g_local.js";
import {
  SP_func_button,
  SP_func_conveyor,
  SP_func_door,
  SP_func_door_rotating,
  SP_func_door_secret,
  SP_func_killbox,
  SP_func_plat,
  SP_func_rotating,
  SP_func_timer,
  SP_func_train,
  SP_func_water,
  SP_trigger_elevator
} from "./g_func.js";
import {
  FindItem,
  GetGameItems,
  PrecacheItem,
  SetItemNames,
  SP_item_health,
  SP_item_health_large,
  SP_item_health_mega,
  SP_item_health_small,
  SpawnItem
} from "./g_items.js";
import {
  SP_func_areaportal,
  SP_func_clock,
  SP_func_explosive,
  SP_func_object,
  SP_func_wall,
  SP_light_mine1,
  SP_light_mine2,
  SP_light,
  SP_path_corner,
  SP_point_combat,
  SP_target_character,
  SP_target_string,
  SP_viewthing,
  SP_info_notnull,
  SP_info_null,
  SP_misc_banner,
  SP_misc_blackhole,
  SP_misc_bigviper,
  SP_misc_deadsoldier,
  SP_misc_easterchick,
  SP_misc_easterchick2,
  SP_misc_eastertank,
  SP_misc_explobox,
  SP_misc_gib_arm,
  SP_misc_gib_head,
  SP_misc_gib_leg,
  SP_misc_satellite_dish,
  SP_misc_strogg_ship,
  SP_misc_teleporter,
  SP_misc_teleporter_dest,
  SP_misc_viper,
  SP_misc_viper_bomb,
  SP_monster_commander_body
} from "./g_misc.js";
import { SP_misc_insane } from "./m_insane.js";
import { SP_monster_berserk } from "./m_berserk.js";
import { SP_monster_boss2 } from "./m_boss2.js";
import { SP_monster_boss3_stand } from "./m_boss3.js";
import { SP_monster_jorg } from "./m_boss31.js";
import { SP_monster_brain } from "./m_brain.js";
import { SP_monster_chick } from "./m_chick.js";
import { SP_monster_flipper } from "./m_flipper.js";
import { SP_monster_floater } from "./m_float.js";
import { SP_monster_flyer } from "./m_flyer.js";
import { SP_monster_gladiator } from "./m_gladiator.js";
import { SP_monster_gunner } from "./m_gunner.js";
import { SP_monster_hover } from "./m_hover.js";
import { SP_monster_infantry } from "./m_infantry.js";
import { SP_monster_medic } from "./m_medic.js";
import { SP_monster_mutant } from "./m_mutant.js";
import { SP_monster_parasite } from "./m_parasite.js";
import { SP_monster_soldier, SP_monster_soldier_light, SP_monster_soldier_ss } from "./m_soldier.js";
import { SP_monster_supertank } from "./m_supertank.js";
import { SP_monster_tank } from "./m_tank.js";
import { SP_misc_actor, SP_target_actor } from "./m_actor.js";
import {
  SP_target_blaster,
  SP_target_changelevel,
  SP_target_crosslevel_target,
  SP_target_crosslevel_trigger,
  SP_target_earthquake,
  SP_target_explosion,
  SP_target_goal,
  SP_target_help,
  SP_target_laser,
  SP_target_lightramp,
  SP_target_secret,
  SP_target_speaker,
  SP_target_spawner,
  SP_target_splash,
  SP_target_temp_entity,
} from "./g_target.js";
import {
  SP_trigger_always,
  SP_trigger_counter,
  SP_trigger_gravity,
  SP_trigger_hurt,
  SP_trigger_key,
  SP_trigger_monsterjump,
  SP_trigger_multiple,
  SP_trigger_once,
  SP_trigger_push,
  SP_trigger_relay
} from "./g_trigger.js";
import { SP_turret_base, SP_turret_breach, SP_turret_driver } from "./g_turret.js";
import {
  SP_info_player_coop,
  SP_info_player_deathmatch,
  SP_info_player_intermission,
  SP_info_player_start,
  InitBodyQue,
  SaveClientData
} from "./p_client.js";
import { PlayerTrail_Init } from "./p_trail.js";
import {
  FL_TEAMSLAVE,
  attachGameClient,
  createRuntimeEntity,
  createGameRuntimeFromBspEntities,
  freeGameEntity,
  registerGameSound
} from "./runtime.js";
import type { GameEntity, GameRuntime } from "./runtime.js";
import { G_Spawn } from "./g_utils.js";

type SpawnFunction = (entity: GameEntity, runtime: GameRuntime) => void;

/**
 * Original name: spawn_t
 * Source: game/g_spawn.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Maps one map classname to the spawn routine called by `ED_CallSpawn`.
 *
 * Porting notes:
 * - Function pointers are represented by typed TypeScript callbacks.
 */
export interface SpawnEntry {
  name: string;
  spawn: SpawnFunction;
}

/**
 * Original name: single_statusbar
 * Source: game/g_spawn.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Defines the original single-player status bar layout program sent through `CS_STATUSBAR`.
 */
export const single_statusbar =
  "yb\t-24 "
  + "xv\t0 "
  + "hnum "
  + "xv\t50 "
  + "pic 0 "
  + "if 2 "
  + "\txv\t100 "
  + "\tanum "
  + "\txv\t150 "
  + "\tpic 2 "
  + "endif "
  + "if 4 "
  + "\txv\t200 "
  + "\trnum "
  + "\txv\t250 "
  + "\tpic 4 "
  + "endif "
  + "if 6 "
  + "\txv\t296 "
  + "\tpic 6 "
  + "endif "
  + "yb\t-50 "
  + "if 7 "
  + "\txv\t0 "
  + "\tpic 7 "
  + "\txv\t26 "
  + "\tyb\t-42 "
  + "\tstat_string 8 "
  + "\tyb\t-50 "
  + "endif "
  + "if 9 "
  + "\txv\t262 "
  + "\tnum\t2\t10 "
  + "\txv\t296 "
  + "\tpic\t9 "
  + "endif "
  + "if 11 "
  + "\txv\t148 "
  + "\tpic\t11 "
  + "endif ";

/**
 * Original name: dm_statusbar
 * Source: game/g_spawn.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Defines the original deathmatch status bar layout program sent through `CS_STATUSBAR`.
 */
export const dm_statusbar =
  "yb\t-24 "
  + "xv\t0 "
  + "hnum "
  + "xv\t50 "
  + "pic 0 "
  + "if 2 "
  + "\txv\t100 "
  + "\tanum "
  + "\txv\t150 "
  + "\tpic 2 "
  + "endif "
  + "if 4 "
  + "\txv\t200 "
  + "\trnum "
  + "\txv\t250 "
  + "\tpic 4 "
  + "endif "
  + "if 6 "
  + "\txv\t296 "
  + "\tpic 6 "
  + "endif "
  + "yb\t-50 "
  + "if 7 "
  + "\txv\t0 "
  + "\tpic 7 "
  + "\txv\t26 "
  + "\tyb\t-42 "
  + "\tstat_string 8 "
  + "\tyb\t-50 "
  + "endif "
  + "if 9 "
  + "\txv\t246 "
  + "\tnum\t2\t10 "
  + "\txv\t296 "
  + "\tpic\t9 "
  + "endif "
  + "if 11 "
  + "\txv\t148 "
  + "\tpic\t11 "
  + "endif "
  + "xr\t-50 "
  + "yt 2 "
  + "num 3 14 "
  + "if 17 "
  + "xv 0 "
  + "yb -58 "
  + "string2 \"SPECTATOR MODE\" "
  + "endif "
  + "if 16 "
  + "xv 0 "
  + "yb -68 "
  + "string \"Chasing\" "
  + "xv 64 "
  + "stat_string 16 "
  + "endif ";

/**
 * Original name: spawns
 * Source: game/g_spawn.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Lists the original classname-to-spawn-function dispatch table used by `ED_CallSpawn`.
 *
 * Porting notes:
 * - Callback functions are imported from their owning TS modules; this table does not claim ownership of them.
 */
export const spawns: SpawnEntry[] = [
  { name: "worldspawn", spawn: SP_worldspawn },
  { name: "info_player_start", spawn: SP_info_player_start },
  { name: "info_player_deathmatch", spawn: SP_info_player_deathmatch },
  { name: "info_player_coop", spawn: SP_info_player_coop },
  { name: "info_player_intermission", spawn: SP_info_player_intermission },
  { name: "item_health", spawn: SP_item_health },
  { name: "item_health_small", spawn: SP_item_health_small },
  { name: "item_health_large", spawn: SP_item_health_large },
  { name: "item_health_mega", spawn: SP_item_health_mega },
  { name: "func_plat", spawn: SP_func_plat },
  { name: "func_door", spawn: SP_func_door },
  { name: "func_door_rotating", spawn: SP_func_door_rotating },
  { name: "func_rotating", spawn: SP_func_rotating },
  { name: "func_button", spawn: SP_func_button },
  { name: "func_water", spawn: SP_func_water },
  { name: "func_train", spawn: SP_func_train },
  { name: "trigger_elevator", spawn: SP_trigger_elevator },
  { name: "func_timer", spawn: SP_func_timer },
  { name: "func_conveyor", spawn: SP_func_conveyor },
  { name: "func_door_secret", spawn: SP_func_door_secret },
  { name: "func_killbox", spawn: SP_func_killbox },
  { name: "func_wall", spawn: SP_func_wall },
  { name: "func_object", spawn: SP_func_object },
  { name: "func_areaportal", spawn: SP_func_areaportal },
  { name: "func_clock", spawn: SP_func_clock },
  { name: "func_explosive", spawn: SP_func_explosive },
  { name: "light", spawn: SP_light },
  { name: "path_corner", spawn: SP_path_corner },
  { name: "point_combat", spawn: SP_point_combat },
  { name: "target_temp_entity", spawn: SP_target_temp_entity },
  { name: "target_speaker", spawn: SP_target_speaker },
  { name: "target_help", spawn: SP_target_help },
  { name: "target_secret", spawn: SP_target_secret },
  { name: "target_goal", spawn: SP_target_goal },
  { name: "target_explosion", spawn: SP_target_explosion },
  { name: "target_changelevel", spawn: SP_target_changelevel },
  { name: "target_splash", spawn: SP_target_splash },
  { name: "target_spawner", spawn: SP_target_spawner },
  { name: "target_blaster", spawn: SP_target_blaster },
  { name: "target_crosslevel_trigger", spawn: SP_target_crosslevel_trigger },
  { name: "target_crosslevel_target", spawn: SP_target_crosslevel_target },
  { name: "target_laser", spawn: SP_target_laser },
  { name: "target_lightramp", spawn: SP_target_lightramp },
  { name: "target_earthquake", spawn: SP_target_earthquake },
  { name: "target_character", spawn: SP_target_character },
  { name: "target_string", spawn: SP_target_string },
  { name: "target_actor", spawn: SP_target_actor },
  { name: "viewthing", spawn: SP_viewthing },
  { name: "info_null", spawn: SP_info_null },
  { name: "func_group", spawn: SP_info_null },
  { name: "info_notnull", spawn: SP_info_notnull },
  { name: "trigger_once", spawn: SP_trigger_once },
  { name: "trigger_multiple", spawn: SP_trigger_multiple },
  { name: "trigger_relay", spawn: SP_trigger_relay },
  { name: "trigger_key", spawn: SP_trigger_key },
  { name: "trigger_counter", spawn: SP_trigger_counter },
  { name: "trigger_always", spawn: SP_trigger_always },
  { name: "trigger_push", spawn: SP_trigger_push },
  { name: "trigger_hurt", spawn: SP_trigger_hurt },
  { name: "trigger_gravity", spawn: SP_trigger_gravity },
  { name: "trigger_monsterjump", spawn: SP_trigger_monsterjump },
  { name: "turret_breach", spawn: SP_turret_breach },
  { name: "turret_base", spawn: SP_turret_base },
  { name: "turret_driver", spawn: SP_turret_driver },
  { name: "misc_banner", spawn: SP_misc_banner },
  { name: "misc_blackhole", spawn: SP_misc_blackhole },
  { name: "misc_eastertank", spawn: SP_misc_eastertank },
  { name: "misc_easterchick", spawn: SP_misc_easterchick },
  { name: "misc_easterchick2", spawn: SP_misc_easterchick2 },
  { name: "monster_commander_body", spawn: SP_monster_commander_body },
  { name: "misc_explobox", spawn: SP_misc_explobox },
  { name: "misc_actor", spawn: SP_misc_actor },
  { name: "misc_insane", spawn: SP_misc_insane },
  { name: "monster_berserk", spawn: SP_monster_berserk },
  { name: "monster_boss2", spawn: SP_monster_boss2 },
  { name: "monster_boss3_stand", spawn: SP_monster_boss3_stand },
  { name: "monster_jorg", spawn: SP_monster_jorg },
  { name: "monster_brain", spawn: SP_monster_brain },
  { name: "monster_chick", spawn: SP_monster_chick },
  { name: "monster_flipper", spawn: SP_monster_flipper },
  { name: "monster_floater", spawn: SP_monster_floater },
  { name: "monster_flyer", spawn: SP_monster_flyer },
  { name: "monster_gladiator", spawn: SP_monster_gladiator },
  { name: "monster_gunner", spawn: SP_monster_gunner },
  { name: "monster_hover", spawn: SP_monster_hover },
  { name: "monster_infantry", spawn: SP_monster_infantry },
  { name: "monster_medic", spawn: SP_monster_medic },
  { name: "monster_mutant", spawn: SP_monster_mutant },
  { name: "monster_parasite", spawn: SP_monster_parasite },
  { name: "monster_soldier_light", spawn: SP_monster_soldier_light },
  { name: "monster_soldier", spawn: SP_monster_soldier },
  { name: "monster_soldier_ss", spawn: SP_monster_soldier_ss },
  { name: "monster_supertank", spawn: SP_monster_supertank },
  { name: "monster_tank", spawn: SP_monster_tank },
  { name: "monster_tank_commander", spawn: SP_monster_tank },
  { name: "misc_deadsoldier", spawn: SP_misc_deadsoldier },
  { name: "misc_satellite_dish", spawn: SP_misc_satellite_dish },
  { name: "misc_teleporter", spawn: SP_misc_teleporter },
  { name: "misc_teleporter_dest", spawn: SP_misc_teleporter_dest },
  { name: "misc_bigviper", spawn: SP_misc_bigviper },
  { name: "misc_viper", spawn: SP_misc_viper },
  { name: "misc_viper_bomb", spawn: SP_misc_viper_bomb },
  { name: "misc_strogg_ship", spawn: SP_misc_strogg_ship },
  { name: "misc_gib_arm", spawn: SP_misc_gib_arm },
  { name: "misc_gib_leg", spawn: SP_misc_gib_leg },
  { name: "misc_gib_head", spawn: SP_misc_gib_head },
  { name: "light_mine1", spawn: SP_light_mine1 },
  { name: "light_mine2", spawn: SP_light_mine2 }
];

/**
 * Original name: SpawnEntities
 * Source: game/g_spawn.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Rebuilds the gameplay runtime from one textual entity lump and reserves the canonical player-edict prefix.
 *
 * Porting notes:
 * - Keeps player edicts at slots `1..maxclients`, then allocates each BSP entity through `G_Spawn`.
 * - Applies the original skill/deathmatch spawnflag inhibition before dispatching entity spawners.
 * - Uses a direct pre-spawn free for inhibited entities so filtered map entities do not occupy protected body-queue slots.
 * - Receives `GameMainContext` from `g_main.ts` because the split TS port keeps cvars, level locals and game locals there.
 */
export function SpawnEntities(context: GameMainContext, mapname: string, entstring: string, spawnpoint: string): void {
  normalizeSkillCvar(context);
  SaveClientData(context.runtime);
  context.gi.FreeTags(TAG_LEVEL);

  const savedClients = Array.from(
    { length: context.runtime.maxclients },
    (_, index) => context.runtime.entities[index + 1]?.client ?? null
  );

  const parsedEntities = parseEntityLump(entstring);
  const nextRuntime = createGameRuntimeFromBspEntities(buildInitialServerEntityList(parsedEntities, context.runtime.maxclients));
  nextRuntime.collision = context.runtime.collision;
  if (context.runtime.engineLinkEntity) {
    nextRuntime.engineLinkEntity = context.runtime.engineLinkEntity;
  }
  if (context.runtime.engineUnlinkEntity) {
    nextRuntime.engineUnlinkEntity = context.runtime.engineUnlinkEntity;
  }

  syncMainRuntimeState(context.runtime, nextRuntime);
  applyMainCvarsToRuntime(context);

  context.runtime.spawnpoint = spawnpoint;
  context.runtime.mapname = mapname;
  context.runtime.power_cubes = 0;
  context.game.spawnpoint = spawnpoint;
  context.level.mapname = mapname;
  context.level.framenum = 0;
  context.level.time = 0;
  context.level.nextmap = "";
  context.level.level_name = "";
  context.level.power_cubes = 0;

  const worldspawn = context.runtime.entities[0] ?? null;
  if (worldspawn) {
    ED_CallSpawn(worldspawn, context.runtime);
    configureWorldspawn(context, worldspawn, mapname);
  }

  for (let index = 1; index <= context.runtime.maxclients; index += 1) {
    const player = context.runtime.entities[index]!;
    player.inuse = false;
    player.classname = "player";
    player.client = savedClients[index - 1] ?? attachGameClient(player);
    player.s.modelindex = 255;
  }

  let inhibit = 0;
  for (const parsedEntity of parsedEntities.slice(1)) {
    const entity = G_Spawn(context.runtime);
    loadParsedEntityIntoEdict(entity, parsedEntity);

    applySpawnFlagMapHack(context.runtime, entity);
    if (shouldInhibitSpawnEntity(context.runtime, entity)) {
      freeGameEntity(context.runtime, entity);
      inhibit += 1;
      continue;
    }
    entity.spawnflags &= ~SPAWNFLAG_NOT_MASK;

    ED_CallSpawn(entity, context.runtime);
  }

  context.gi.dprintf("%i entities inhibited\n", inhibit);

  G_FindTeams(context.runtime);
  InitBodyQue(context.runtime);
  PlayerTrail_Init(context.runtime);
}

/**
 * Original name: SP_worldspawn
 * Source: game/g_spawn.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Initializes the world entity baseline so edict zero matches the original push/BSP setup.
 *
 * Porting notes:
 * - The wider `configstring`, statusbar and precache side effects are coordinated from `g_main.ts`.
 */
export function SP_worldspawn(ent: GameEntity, _runtime: GameRuntime): void {
  ent.movetype = MOVETYPE_PUSH;
  ent.solid = SOLID_BSP;
  ent.inuse = true;
  ent.s.modelindex = 1;
}

/**
 * Original name: ED_CallSpawn
 * Source: game/g_spawn.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Finds the registered spawn function for one entity classname and calls it.
 *
 * Porting notes:
 * - Item classnames are checked before this table with the original case-sensitive `strcmp` semantics.
 */
export function ED_CallSpawn(ent: GameEntity, runtime: GameRuntime): void {
  if (!ent.classname) {
    runtime.log({
      kind: "warning",
      message: "ED_CallSpawn: NULL classname",
      entityIndex: ent.index
    });
    return;
  }

  for (const item of GetGameItems()) {
    if (!item.classname) {
      continue;
    }
    if (item.classname === ent.classname) {
      SpawnItem(ent, item, runtime);
      return;
    }
  }

  for (const entry of spawns) {
    if (entry.name !== ent.classname) {
      continue;
    }

    entry.spawn(ent, runtime);
    return;
  }

  runtime.log({
    kind: "warning",
    message: `${ent.classname} doesn't have a spawn function`,
    entityIndex: ent.index,
    entityClassname: ent.classname
  });
}

/**
 * Original name: G_FindTeams
 * Source: game/g_spawn.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Chains together all active entities sharing the same `team` field.
 *
 * Porting notes:
 * - Preserves the original BSP/runtime entity ordering when selecting the team master.
 */
export function G_FindTeams(runtime: GameRuntime): { teamCount: number; entityCount: number } {
  let c = 0;
  let c2 = 0;

  clearTeamLinks(runtime);

  for (let i = 1; i < runtime.entities.length; i += 1) {
    const e = runtime.entities[i];
    if (!e.inuse || !e.team || (e.flags & FL_TEAMSLAVE) !== 0) {
      continue;
    }

    let chain = e;
    e.teammaster = e;
    c += 1;
    c2 += 1;

    for (let j = i + 1; j < runtime.entities.length; j += 1) {
      const e2 = runtime.entities[j];
      if (!e2.inuse || !e2.team || (e2.flags & FL_TEAMSLAVE) !== 0) {
        continue;
      }
      if (e.team !== e2.team) {
        continue;
      }

      c2 += 1;
      chain.teamchain = e2;
      e2.teammaster = e;
      chain = e2;
      e2.flags |= FL_TEAMSLAVE;
    }
  }

  runtime.log({
    kind: "think",
    message: `G_FindTeams linked ${c} teams with ${c2} entities`
  });

  return {
    teamCount: c,
    entityCount: c2
  };
}

/**
 * Category: New
 * Purpose: Apply the currently ported spawn registry to BSP runtime entities and then build team links.
 *
 * Constraints:
 * - Must preserve BSP entity order.
 * - Must run `G_FindTeams` after spawners so team brush entities are linked before the first think frame.
 */
export function initializeDoorPlanEntities(runtime: GameRuntime): void {
  for (const entity of runtime.entities) {
    ED_CallSpawn(entity, runtime);
  }

  G_FindTeams(runtime);
}

/**
 * Category: New
 * Purpose: Reset team runtime links before rebuilding them from the original BSP order.
 */
function clearTeamLinks(runtime: GameRuntime): void {
  for (const entity of runtime.entities) {
    entity.teammaster = null;
    entity.teamchain = null;
    entity.flags &= ~FL_TEAMSLAVE;
  }
}

function applyMainCvarsToRuntime(context: GameMainContext): void {
  context.runtime.deathmatch = Boolean(context.cvars.deathmatch?.value);
  context.runtime.coop = Boolean(context.cvars.coop?.value);
  context.runtime.dmflags = context.cvars.dmflags?.value ?? 0;
  context.runtime.skill = context.cvars.skill?.value ?? 1;
  context.runtime.g_select_empty = Boolean(context.cvars.g_select_empty?.value);
  context.runtime.gravity = context.cvars.sv_gravity?.value ?? context.runtime.gravity;
  context.runtime.maxvelocity = context.cvars.sv_maxvelocity?.value ?? context.runtime.maxvelocity;
  context.runtime.maxclients = Math.max(0, Math.trunc(context.cvars.maxclients?.value ?? context.runtime.maxclients));
  context.runtime.maxentities = Math.max(context.runtime.maxclients + 1, Math.trunc(context.cvars.maxentities?.value ?? context.runtime.maxentities));
  context.game.maxclients = context.runtime.maxclients;
  context.game.maxentities = context.runtime.maxentities;
}

function normalizeSkillCvar(context: GameMainContext): void {
  const skill = context.cvars.skill;
  if (!skill) {
    return;
  }

  const skillLevel = Math.max(0, Math.min(3, Math.floor(skill.value)));
  if (skill.value === skillLevel) {
    return;
  }

  const skillString = skillLevel.toFixed(6);
  const forced = context.gi.cvar_forceset("skill", skillString);
  context.cvars.skill = forced ?? skill;
  context.cvars.skill.string = skillString;
  context.cvars.skill.value = skillLevel;
}

function configureWorldspawn(context: GameMainContext, worldspawn: GameEntity, mapname: string): void {
  context.level.level_name = worldspawn.message && worldspawn.message.length > 0
    ? worldspawn.message
    : mapname;
  context.level.nextmap = worldspawn.properties.nextmap ?? "";

  context.gi.configstring(CS_NAME, context.level.level_name);
  context.gi.configstring(CS_SKY, worldspawn.properties.sky ?? "unit1_");
  context.gi.configstring(CS_SKYROTATE, worldspawn.properties.skyrotate ?? "0");
  context.gi.configstring(CS_SKYAXIS, worldspawn.properties.skyaxis ?? "0 0 0");
  context.gi.configstring(CS_CDTRACK, String(worldspawn.sounds));
  context.gi.configstring(CS_MAXCLIENTS, String(context.runtime.maxclients));
  context.gi.configstring(CS_STATUSBAR, context.runtime.deathmatch ? dm_statusbar : single_statusbar);
  for (const [style, pattern] of WORLDSPAWN_LIGHTSTYLES) {
    context.gi.configstring(CS_LIGHTS + style, pattern);
  }

  context.gi.imageindex("i_help");
  context.level.pic_health = context.gi.imageindex("i_health");
  context.runtime.pic_health = context.level.pic_health;
  context.gi.imageindex("help");
  context.gi.imageindex("field_3");

  const itemNames = SetItemNames();
  for (let index = 0; index < itemNames.length; index += 1) {
    context.gi.configstring(CS_ITEMS + index + 1, itemNames[index]);
  }

  const gravity = worldspawn.properties.gravity;
  if (gravity && gravity.length > 0) {
    context.gi.cvar_set("sv_gravity", gravity);
    const parsedGravity = Number.parseFloat(gravity);
    if (Number.isFinite(parsedGravity)) {
      context.runtime.gravity = parsedGravity;
    }
  } else {
    context.gi.cvar_set("sv_gravity", "800");
    context.runtime.gravity = 800;
  }

  precacheWorldspawnSounds(context);
}

/**
 * Original name: SP_worldspawn sound precache block
 * Source: game/g_spawn.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Registers the global player/world/item sounds made available by worldspawn.
 *
 * Porting notes:
 * - The local gameplay runtime owns stable sound indices; `gi.soundindex` is also called so server-backed integrations can populate `CS_SOUNDS`.
 */
function precacheWorldspawnSounds(context: GameMainContext): void {
  precacheGameSound(context, "player/fry.wav");

  const blaster = FindItem("Blaster");
  if (blaster) {
    PrecacheItem(context.runtime, blaster);
    if (blaster.pickupSound) {
      context.gi.soundindex(blaster.pickupSound);
    }
    for (const assetPath of blaster.precaches.split(/\s+/).filter((value) => value.endsWith(".wav"))) {
      context.gi.soundindex(assetPath);
    }
  }

  for (const soundPath of WORLDSPAWN_SOUND_PRECACHE) {
    precacheGameSound(context, soundPath);
  }
}

function precacheGameSound(context: GameMainContext, path: string): void {
  registerGameSound(context.runtime, path);
  context.gi.soundindex(path);
}

function buildInitialServerEntityList(parsedEntities: BspEntity[], maxclients: number): BspEntity[] {
  const worldspawn = parsedEntities[0] ?? { properties: { classname: "worldspawn" } };
  const reservedClients = Array.from({ length: maxclients }, () => ({ properties: { classname: "player" } }));
  return [worldspawn, ...reservedClients];
}

function loadParsedEntityIntoEdict(entity: GameEntity, parsedEntity: BspEntity): void {
  const parsed = createRuntimeEntity(parsedEntity.properties, entity.index);
  Object.assign(entity, parsed);
}

const SPAWNFLAG_NOT_MASK =
  SPAWNFLAG_NOT_EASY |
  SPAWNFLAG_NOT_MEDIUM |
  SPAWNFLAG_NOT_HARD |
  SPAWNFLAG_NOT_DEATHMATCH |
  SPAWNFLAG_NOT_COOP;

function applySpawnFlagMapHack(runtime: GameRuntime, entity: GameEntity): void {
  if (
    stringsEqualIgnoreCase(runtime.mapname, "command") &&
    stringsEqualIgnoreCase(entity.classname, "trigger_once") &&
    stringsEqualIgnoreCase(entity.model ?? "", "*27")
  ) {
    entity.spawnflags &= ~SPAWNFLAG_NOT_HARD;
  }
}

function shouldInhibitSpawnEntity(runtime: GameRuntime, entity: GameEntity): boolean {
  if (runtime.deathmatch) {
    return (entity.spawnflags & SPAWNFLAG_NOT_DEATHMATCH) !== 0;
  }

  const skill = Math.max(0, Math.min(3, Math.trunc(runtime.skill)));
  return (
    (skill === 0 && (entity.spawnflags & SPAWNFLAG_NOT_EASY) !== 0) ||
    (skill === 1 && (entity.spawnflags & SPAWNFLAG_NOT_MEDIUM) !== 0) ||
    ((skill === 2 || skill === 3) && (entity.spawnflags & SPAWNFLAG_NOT_HARD) !== 0)
  );
}

function syncMainRuntimeState(target: GameRuntime, source: GameRuntime): void {
  for (const key of Object.keys(source) as Array<keyof GameRuntime>) {
    (target as Record<keyof GameRuntime, unknown>)[key] = source[key];
  }
}

const WORLDSPAWN_SOUND_PRECACHE = [
  "player/lava1.wav",
  "player/lava2.wav",
  "misc/pc_up.wav",
  "misc/talk1.wav",
  "misc/udeath.wav",
  "items/respawn1.wav",
  "*death1.wav",
  "*death2.wav",
  "*death3.wav",
  "*death4.wav",
  "*fall1.wav",
  "*fall2.wav",
  "*gurp1.wav",
  "*gurp2.wav",
  "*jump1.wav",
  "*pain25_1.wav",
  "*pain25_2.wav",
  "*pain50_1.wav",
  "*pain50_2.wav",
  "*pain75_1.wav",
  "*pain75_2.wav",
  "*pain100_1.wav",
  "*pain100_2.wav",
  "player/gasp1.wav",
  "player/gasp2.wav",
  "player/watr_in.wav",
  "player/watr_out.wav",
  "player/watr_un.wav",
  "player/u_breath1.wav",
  "player/u_breath2.wav",
  "items/pkup.wav",
  "world/land.wav",
  "misc/h2ohit1.wav",
  "items/damage.wav",
  "items/protect.wav",
  "items/protect4.wav",
  "weapons/noammo.wav",
  "infantry/inflies1.wav"
] as const;

const WORLDSPAWN_LIGHTSTYLES = [
  [0, "m"],
  [1, "mmnmmommommnonmmonqnmmo"],
  [2, "abcdefghijklmnopqrstuvwxyzyxwvutsrqponmlkjihgfedcba"],
  [3, "mmmmmaaaaammmmmaaaaaabcdefgabcdefg"],
  [4, "mamamamamama"],
  [5, "jklmnopqrstuvwxyzyxwvutsrqponmlkj"],
  [6, "nmonqnmomnmomomno"],
  [7, "mmmaaaabcdefgmmmmaaaammmaamm"],
  [8, "mmmaaammmaaammmabcdefaaaammmmabcdefmmmaaaa"],
  [9, "aaaaaaaazzzzzzzz"],
  [10, "mmamammmmammamamaaamammma"],
  [11, "abcdefghijklmnopqrrqponmlkjihgfedcba"],
  [63, "a"]
] as const;

function stringsEqualIgnoreCase(left: string, right: string): boolean {
  return left.localeCompare(right, undefined, { sensitivity: "accent", usage: "search" }) === 0;
}
