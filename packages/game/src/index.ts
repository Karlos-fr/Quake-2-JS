/**
 * File: index.ts
 * Purpose: Expose the first gameplay runtime helpers used by the Quake II door/trigger port.
 *
 * This file is not a direct source port.
 * It is a package entry point for gameplay-facing runtime modules.
 *
 * Dependencies:
 * - packages/game/src/runtime.ts
 * - packages/game/src/g_utils.ts
 */

export {
  DOOR_CRUSHER,
  DOOR_NOMONSTER,
  DOOR_REVERSE,
  DOOR_START_OPEN,
  DOOR_TOGGLE,
  DOOR_X_AXIS,
  DOOR_Y_AXIS,
  FL_TEAMSLAVE,
  FRAMETIME,
  MOVETYPE_NONE,
  MOVETYPE_PUSH,
  PLAT_LOW_TRIGGER,
  SOLID_NOT,
  SOLID_BSP,
  SOLID_TRIGGER,
  STATE_BOTTOM,
  STATE_DOWN,
  STATE_TOP,
  STATE_UP,
  SVF_MONSTER,
  SVF_NOCLIENT,
  createGameRuntimeFromBspMap,
  createGameRuntimeFromBspEntities,
  createRuntimeEntity,
  findRuntimeEntitiesByTargetname,
  getRuntimeEntityLabel,
  runPendingThinks,
  spawnGameEntity,
  useGameEntity
} from "./runtime.js";

export {
  G_Find,
  G_UseTargets
} from "./g_utils.js";

export {
  ED_CallSpawn,
  G_FindTeams,
  initializeDoorPlanEntities
} from "./g_spawn.js";

export {
  G_RunEntity,
  G_RunFrame,
  SV_Physics_None,
  SV_Physics_Pusher,
  SV_Push,
  SV_RunThink,
  runGameFrames
} from "./g_phys.js";

export {
  SP_func_door,
  SP_func_door_rotating,
  AngleMove_Begin,
  AngleMove_Calc,
  AngleMove_Done,
  AngleMove_Final,
  Move_Begin,
  Move_Calc,
  Move_Done,
  Move_Final,
  Think_CalcMoveSpeed,
  Think_AccelMove,
  Think_SpawnDoorTrigger,
  Touch_DoorTrigger,
  Touch_Plat_Center,
  door_blocked,
  door_go_down,
  door_go_up,
  door_hit_bottom,
  door_hit_top,
  door_killed,
  door_touch,
  door_use,
  door_use_areaportals,
  Use_Plat,
  SP_func_plat,
  plat_blocked,
  plat_go_down,
  plat_go_up,
  plat_hit_bottom,
  plat_hit_top,
  plat_spawn_inside_trigger
} from "./g_func.js";

export {
  SP_trigger_multiple,
  SP_trigger_once,
  SP_trigger_relay,
  Touch_Multi,
  Use_Multi,
  multi_trigger,
  trigger_relay_use
} from "./g_trigger.js";

export {
  touchTriggerEntities
} from "./touch.js";

export type {
  GameEntity,
  GameEntityBlocked,
  GameEntityFieldName,
  GameEntityDie,
  GameEntityThink,
  GameMoveInfo,
  GameEntityTouch,
  GameEntityUse,
  GameRuntime,
  GameRuntimeLogEntry
} from "./runtime.js";
