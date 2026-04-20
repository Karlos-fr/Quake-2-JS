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
  AREA_SOLID,
  AREA_TRIGGERS,
  BoxEdicts,
  classifyGameEntity,
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
  MOVETYPE_TOSS,
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
  isDynamicBoxEntity,
  isInlineBspEntity,
  isRuntimeTriggerEntity,
  linkGameEntity,
  registerGameImage,
  registerGameModel,
  registerGameSound,
  refreshEntitySpatialState,
  runPendingThinks,
  spawnGameEntity,
  unlinkGameEntity,
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
  FindItem,
  FindItemByClassname,
  GetItemByIndex,
  InitItems,
  PrecacheItem,
  SP_item_health,
  SP_item_health_large,
  SP_item_health_mega,
  SP_item_health_small,
  SetItemNames,
  SpawnItem,
  droptofloor
} from "./g_items.js";

export {
  SP_light_mine1,
  SP_light_mine2,
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
  SP_monster_commander_body,
  commander_body_drop,
  commander_body_think,
  commander_body_use,
  misc_banner_think,
  misc_blackhole_think,
  misc_blackhole_use,
  misc_easterchick2_think,
  misc_easterchick_think,
  misc_eastertank_think,
  misc_satellite_dish_think,
  misc_satellite_dish_use,
  misc_strogg_ship_use,
  misc_viper_use
} from "./g_misc.js";

export {
  G_RunEntity,
  G_RunFrame,
  SV_Impact,
  SV_Physics_None,
  SV_Physics_Pusher,
  SV_Push,
  SV_PushEntity,
  SV_RunThink,
  SV_TestEntityPosition,
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
  trigger_enable,
  trigger_relay_use
} from "./g_trigger.js";

export {
  G_TouchSolids,
  G_TouchTriggers,
  touchTriggerEntities
} from "./touch.js";

export type {
  GameItemDefinition,
  GameItemDropKind,
  GameItemPickupKind,
  GameItemUseKind,
  GameItemWeaponThinkKind
} from "./g_items.js";

export type {
  GameEntity,
  GameEntityBlocked,
  GameEntityFieldName,
  GameEntityKind,
  GameEntityDie,
  GameEntityThink,
  GameAssetRegistry,
  GameCollisionBridge,
  GameMoveInfo,
  GameEntityTouch,
  GameEntityUse,
  GameRuntime,
  GameRuntimeLogEntry
} from "./runtime.js";
