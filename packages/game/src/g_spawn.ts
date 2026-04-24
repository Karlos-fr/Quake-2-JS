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
 * - Only the currently ported classnames are registered in the spawn table.
 * - Unsupported classnames are ignored quietly by the local runtime instead of printing through `gi.dprintf`.
 *
 * Notes:
 * - This file is intended to stay close to the original spawn and team-linking flow.
 */

import { MOVETYPE_PUSH, SOLID_BSP } from "./g-local.js";
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
import { FindItemByClassname, SP_item_health, SP_item_health_large, SP_item_health_mega, SP_item_health_small, SpawnItem } from "./g_items.js";
import {
  SP_func_areaportal,
  SP_func_clock,
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
  SP_info_player_start
} from "./p_client.js";
import { FL_TEAMSLAVE } from "./runtime.js";
import type { GameEntity, GameRuntime } from "./runtime.js";

type SpawnFunction = (entity: GameEntity, runtime: GameRuntime) => void;

interface SpawnEntry {
  name: string;
  spawn: SpawnFunction;
}

const spawns: SpawnEntry[] = [
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
  { name: "func_areaportal", spawn: SP_func_areaportal },
  { name: "func_clock", spawn: SP_func_clock },
  { name: "light", spawn: SP_light },
  { name: "path_corner", spawn: SP_path_corner },
  { name: "point_combat", spawn: SP_point_combat },
  { name: "target_character", spawn: SP_target_character },
  { name: "target_string", spawn: SP_target_string },
  { name: "viewthing", spawn: SP_viewthing },
  { name: "info_null", spawn: SP_info_null },
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
 * - The current port only registers the subset already needed by the door/plat plan.
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

  const item = FindItemByClassname(ent.classname);
  if (item) {
    SpawnItem(ent, item, runtime);
    return;
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
