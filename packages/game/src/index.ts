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
  GAME_API_VERSION,
  MAX_ENT_CLUSTERS,
  solid_t
} from "./game.js";

export {
  AI_BRUTAL,
  AI_COMBAT_POINT,
  AI_DUCKED,
  AI_GOOD_GUY,
  AI_HOLD_FRAME,
  AI_LOST_SIGHT,
  AI_MEDIC,
  AI_NOSTEP,
  AI_PURSUIT_LAST_SEEN,
  AI_PURSUE_NEXT,
  AI_PURSUE_TEMP,
  AI_RESURRECTING,
  AI_SOUND_TARGET,
  AI_STAND_GROUND,
  AI_TEMP_STAND_GROUND,
  ANIM_ATTACK,
  ANIM_BASIC,
  ANIM_DEATH,
  ANIM_JUMP,
  ANIM_PAIN,
  ANIM_REVERSE,
  ANIM_WAVE,
  ARMOR_BODY,
  ARMOR_COMBAT,
  ARMOR_JACKET,
  ARMOR_NONE,
  ARMOR_SHARD,
  AS_MELEE,
  AS_MISSILE,
  AS_SLIDING,
  AS_STRAIGHT,
  BODY_QUEUE_SIZE,
  CENTER_HANDED,
  CLOFS,
  FALL_TIME,
  FFL_NOSPAWN,
  FFL_SPAWNTEMP,
  fieldtype_t,
  FOFS,
  GAMEVERSION,
  GIB_METALLIC,
  GIB_ORGANIC,
  ITEM_INDEX,
  ITEM_NO_TOUCH,
  ITEM_TARGETS_USED,
  ITEM_TRIGGER_SPAWN,
  IT_AMMO,
  IT_ARMOR,
  IT_KEY,
  IT_POWERUP,
  IT_STAY_COOP,
  IT_WEAPON,
  LLOFS,
  MELEE_DISTANCE,
  movetype_t,
  PNOISE_IMPACT,
  PNOISE_SELF,
  PNOISE_WEAPON,
  RANGE_FAR,
  RANGE_MELEE,
  RANGE_MID,
  RANGE_NEAR,
  SFL_CROSS_TRIGGER_1,
  SFL_CROSS_TRIGGER_2,
  SFL_CROSS_TRIGGER_3,
  SFL_CROSS_TRIGGER_4,
  SFL_CROSS_TRIGGER_5,
  SFL_CROSS_TRIGGER_6,
  SFL_CROSS_TRIGGER_7,
  SFL_CROSS_TRIGGER_8,
  SFL_CROSS_TRIGGER_MASK,
  SPAWNFLAG_NOT_COOP,
  SPAWNFLAG_NOT_DEATHMATCH,
  SPAWNFLAG_NOT_EASY,
  SPAWNFLAG_NOT_HARD,
  SPAWNFLAG_NOT_MEDIUM,
  STOFS,
  TAG_GAME,
  TAG_LEVEL,
  createGameLocals,
  createLevelLocals,
  createSpawnTemp,
  damage_t,
  svc_inventory,
  svc_layout,
  svc_muzzleflash,
  svc_muzzleflash2,
  svc_stufftext,
  svc_temp_entity,
  world
} from "./g-local.js";

export {
  FRAME_stand201,
  FRAME_stand202,
  FRAME_stand203,
  FRAME_stand204,
  FRAME_stand205,
  FRAME_stand206,
  FRAME_stand207,
  FRAME_stand208,
  FRAME_stand209,
  FRAME_stand210,
  FRAME_stand211,
  FRAME_stand212,
  FRAME_stand213,
  FRAME_stand214,
  FRAME_stand215,
  FRAME_stand216,
  FRAME_stand217,
  FRAME_stand218,
  FRAME_stand219,
  FRAME_stand220,
  FRAME_stand221,
  FRAME_stand222,
  FRAME_stand223,
  FRAME_stand224,
  FRAME_stand225,
  FRAME_stand226,
  FRAME_stand227,
  FRAME_stand228,
  FRAME_stand229,
  FRAME_stand230,
  FRAME_stand231,
  FRAME_stand232,
  FRAME_stand233,
  FRAME_stand234,
  FRAME_stand235,
  FRAME_stand236,
  FRAME_stand237,
  FRAME_stand238,
  FRAME_stand239,
  FRAME_stand240,
  FRAME_stand241,
  FRAME_stand242,
  FRAME_stand243,
  FRAME_stand244,
  FRAME_stand245,
  FRAME_stand246,
  FRAME_stand247,
  FRAME_stand248,
  FRAME_stand249,
  FRAME_stand250,
  FRAME_stand251,
  FRAME_stand252,
  FRAME_stand253,
  FRAME_stand254,
  FRAME_stand255,
  FRAME_stand256,
  FRAME_stand257,
  FRAME_stand258,
  FRAME_stand259,
  FRAME_stand260,
  MODEL_SCALE
} from "./m_rider.js";

export * as actorFrames from "./m_actor.js";
export * as berserkFrames from "./m_berserk.js";
export * as boss2Frames from "./m_boss2.js";
export * as boss31Frames from "./m_boss31.js";
export * as boss32Frames from "./m_boss32.js";
export * as brainFrames from "./m_brain.js";
export * as chickFrames from "./m_chick.js";
export * as flipperFrames from "./m_flipper.js";
export * as floatFrames from "./m_float.js";
export * as flyerFrames from "./m_flyer.js";
export * as gladiatorFrames from "./m_gladiator.js";
export * as gunnerFrames from "./m_gunner.js";
export * as hoverFrames from "./m_hover.js";
export * as infantryFrames from "./m_infantry.js";
export * as insaneFrames from "./m_insane.js";
export * as medicFrames from "./m_medic.js";
export * as mutantFrames from "./m_mutant.js";
export * as parasiteFrames from "./m_parasite.js";
export * as playerFrames from "./m_player.js";
export * as soldierFrames from "./m_soldier.js";
export * as supertankFrames from "./m_supertank.js";
export * as tankFrames from "./m_tank.js";

export type {
  GameClientServerFields,
  GameEdictServerFields,
  GetGameApi,
  edict_t,
  game_export_t,
  game_import_t,
  gclient_t,
  link_t
} from "./game.js";

export {
  AREA_SOLID,
  AREA_TRIGGERS,
  BoxEdicts,
  classifyGameEntity,
  attachGameClient,
  DOOR_CRUSHER,
  DOOR_NOMONSTER,
  DOOR_REVERSE,
  DOOR_START_OPEN,
  DOOR_TOGGLE,
  DOOR_X_AXIS,
  DOOR_Y_AXIS,
  DEFAULT_DEATHMATCH_SHOTGUN_COUNT,
  DEFAULT_BULLET_HSPREAD,
  DEFAULT_BULLET_VSPREAD,
  DEFAULT_SHOTGUN_COUNT,
  DEFAULT_SHOTGUN_HSPREAD,
  DEFAULT_SHOTGUN_VSPREAD,
  DEFAULT_SSHOTGUN_COUNT,
  DAMAGE_BULLET,
  DAMAGE_ENERGY,
  DAMAGE_NO_KNOCKBACK,
  DAMAGE_RADIUS,
  DAMAGE_TIME,
  DEAD_DEAD,
  DEAD_DYING,
  DEAD_NO,
  DEAD_RESPAWNABLE,
  FL_IMMUNE_LASER,
  FL_TEAMSLAVE,
  FRAMETIME,
  MOVETYPE_BOUNCE,
  MOVETYPE_FLYMISSILE,
  MOD_BLASTER,
  MOD_BFG_BLAST,
  MOD_BFG_EFFECT,
  MOD_BFG_LASER,
  MOD_CHAINGUN,
  MOD_G_SPLASH,
  MOD_GRENADE,
  MOD_HANDGRENADE,
  MOD_HELD_GRENADE,
  MOD_HG_SPLASH,
  MOD_HIT,
  MOD_HYPERBLASTER,
  MOD_MACHINEGUN,
  MOD_RAILGUN,
  MOD_ROCKET,
  MOD_R_SPLASH,
  SOLID_BBOX,
  MOD_SHOTGUN,
  MOD_SSHOTGUN,
  MOVETYPE_NONE,
  MOVETYPE_PUSH,
  MOVETYPE_TOSS,
  WEAP_BFG,
  WEAP_BLASTER,
  WEAP_CHAINGUN,
  WEAP_GRENADELAUNCHER,
  WEAP_GRENADES,
  WEAP_HYPERBLASTER,
  WEAP_MACHINEGUN,
  WEAP_RAILGUN,
  WEAP_ROCKETLAUNCHER,
  WEAP_SHOTGUN,
  WEAP_SUPERSHOTGUN,
  PLAT_LOW_TRIGGER,
  SPLASH_BLUE_WATER,
  SPLASH_BROWN_WATER,
  SPLASH_LAVA,
  SPLASH_SLIME,
  SPLASH_SPARKS,
  SPLASH_UNKNOWN,
  SOLID_NOT,
  SOLID_BSP,
  SOLID_TRIGGER,
  STATE_BOTTOM,
  STATE_DOWN,
  STATE_TOP,
  STATE_UP,
  SVF_DEADMONSTER,
  SVF_MONSTER,
  SVF_NOCLIENT,
  ammo_t,
  createGameRuntimeFromBspMap,
  createGameRuntimeFromBspEntities,
  createRuntimeEntity,
  drainGameSoundEvents,
  emitGameSound,
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
  useGameEntity,
  weaponstate_t
} from "./runtime.js";

export {
  CanDamage,
  CheckPowerArmor,
  Killed,
  SpawnDamage,
  T_Damage,
  T_RadiusDamage
} from "./g_combat.js";

export {
  ChaseNext,
  ChasePrev,
  GetChaseTarget,
  UpdateChaseCam
} from "./g_chase.js";

export {
  SelectNextItem,
  SelectPrevItem,
  ValidateSelectedItem
} from "./g_cmds.js";

export {
  AI_SetSightClient,
  FacingIdeal,
  FindTarget,
  FoundTarget,
  HuntTarget,
  M_CheckAttack,
  ai_charge,
  ai_checkattack,
  ai_move,
  ai_run,
  ai_run_melee,
  ai_run_missile,
  ai_run_slide,
  ai_stand,
  ai_turn,
  ai_walk,
  infront,
  range,
  visible
} from "./g_ai.js";

export {
  G_Find,
  G_CopyString,
  G_FreeEdict,
  G_InitEdict,
  G_PickTarget,
  G_ProjectSource,
  G_SetMovedir,
  G_Spawn,
  G_UseTargets,
  KillBox,
  findradius,
  tv,
  vectoyaw,
  vectoangles,
  vtos
} from "./g_utils.js";

export {
  ED_CallSpawn,
  G_FindTeams,
  initializeDoorPlanEntities
} from "./g_spawn.js";

export {
  ArmorIndex,
  FindWeaponItemByThink,
  FindItem,
  FindItemByClassname,
  GetArmorInfoByItem,
  GetAmmoItemForWeapon,
  GetGameItems,
  GetItemByIndex,
  InitItems,
  PowerArmorType,
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
  AttackFinished,
  M_CatagorizePosition,
  M_CheckGround,
  M_droptofloor,
  M_FliesOff,
  M_FliesOn,
  M_FlyCheck,
  M_MoveFrame,
  M_SetEffects,
  M_WorldEffects,
  flymonster_start,
  flymonster_start_go,
  monster_death_use,
  monster_fire_bfg,
  monster_fire_blaster,
  monster_fire_bullet,
  monster_fire_grenade,
  monster_fire_railgun,
  monster_fire_rocket,
  monster_fire_shotgun,
  monster_start,
  monster_start_go,
  monster_think,
  monster_triggered_spawn,
  monster_triggered_spawn_use,
  monster_triggered_start,
  monster_use,
  swimmonster_start,
  swimmonster_start_go,
  walkmonster_start,
  walkmonster_start_go
} from "./g_monster.js";

export {
  DI_NODIR,
  STEPSIZE,
  M_ChangeYaw,
  M_CheckBottom,
  M_MoveToGoal,
  M_walkmove,
  SV_CloseEnough,
  SV_FixCheckBottom,
  SV_NewChaseDir,
  SV_StepDirection,
  SV_movestep
} from "./m_move.js";

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
  MAX_IPFILTERS,
  SV_FilterPacket,
  SVCmd_AddIP_f,
  SVCmd_ListIP_f,
  SVCmd_RemoveIP_f,
  SVCmd_WriteIP_f,
  ServerCommand,
  StringToFilter,
  Svcmd_Test_f,
  createGameServerCommandState
} from "./g_svcmds.js";

export {
  ClientEndServerFrames,
  ClientCommand as GameMainClientCommand,
  CheckDMRules,
  CreateTargetChangeLevel,
  EndDMLevel,
  ExitLevel,
  G_RunFrame as G_MainRunFrame,
  GetGameApi as GetGameApiFunction,
  InitGame,
  ReadGame,
  ReadLevel,
  ShutdownGame,
  SpawnEntities,
  WriteGame,
  WriteLevel,
  createGameMainContext
} from "./g_main.js";

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
  Grenade_Explode,
  Grenade_Touch,
  bfg_explode,
  bfg_think,
  bfg_touch,
  blaster_touch,
  fire_bfg,
  fire_blaster,
  fire_bullet,
  fire_grenade,
  fire_grenade2,
  fire_rail,
  fire_rocket,
  fire_shotgun,
  rocket_touch
} from "./g_weapon.js";

export {
  BeginIntermission,
  Cmd_Help_f,
  Cmd_Score_f,
  DeathmatchScoreboard,
  DeathmatchScoreboardMessage,
  G_CheckChaseStats,
  G_SetSpectatorStats,
  G_SetStats,
  HelpComputer,
  MoveClientToIntermission
} from "./p_hud.js";

export {
  ClientEndServerFrame,
  G_SetClientEffects,
  G_SetClientEvent,
  G_SetClientFrame,
  G_SetClientSound,
  P_DamageFeedback,
  P_FallingDamage,
  P_WorldEffects,
  SV_AddBlend,
  SV_CalcBlend,
  SV_CalcGunOffset,
  SV_CalcViewOffset,
  SV_CalcRoll,
  createPlayerViewFrameState
} from "./p_view.js";

export {
  CheckBlock,
  CopyToBodyQue,
  ClientBegin,
  ClientBeginDeathmatch,
  ClientBeginServerFrame,
  ClientConnect,
  ClientDisconnect,
  ClientObituary,
  FetchClientEntData,
  InitBodyQue,
  InitClientPersistant,
  InitClientResp,
  IsFemale,
  IsNeutral,
  ClientThink,
  ClientUserinfoChanged,
  LookAtKiller,
  PM_trace,
  PMpointcontents,
  PrintPmove,
  PlayersRangeFromSpot,
  PutClientInServer,
  SaveClientData,
  SP_CreateCoopSpots,
  SP_FixCoopSpots,
  SP_info_player_coop,
  SP_info_player_deathmatch,
  SP_info_player_intermission,
  SP_info_player_start,
  SelectCoopSpawnPoint,
  SelectDeathmatchSpawnPoint,
  SelectFarthestDeathmatchSpawnPoint,
  SelectRandomDeathmatchSpawnPoint,
  SelectSpawnPoint,
  TossClientWeapon,
  body_die,
  player_pain,
  player_die,
  respawn,
  spectator_respawn,
  UpdateChaseFollowers
} from "./p_client.js";

export type { GameWeaponWorldHooks } from "./g_weapon.js";
export type { GameMonsterHooks } from "./g_monster.js";
export type { GameServerCommandContext, GameServerCommandState, ipfilter_t } from "./g_svcmds.js";
export type { GameMainContext, GameMainContextOptions, GameMainCvars, GameMainHooks } from "./g_main.js";

export {
  G_TouchSolids,
  G_TouchTriggers,
  touchTriggerEntities
} from "./touch.js";

export {
  createLocalGameplayPlayer,
  LOCAL_GAME_WEAPON_HOOKS,
  LOCAL_WEAPON_SLOTS,
  buildLocalWeaponBootstrapData,
  seedLocalWeaponInventory,
  selectLocalWeapon,
  thinkLocalWeapon
} from "./local-game-bootstrap.js";

export {
  Blaster_Fire,
  Chaingun_Fire,
  ChangeWeapon,
  Drop_Weapon,
  Machinegun_Fire,
  NoAmmoWeaponChange,
  P_ProjectSource,
  Pickup_Weapon,
  PlayerNoise,
  Think_Weapon,
  Use_Weapon,
  Weapon_BFG,
  Weapon_Blaster,
  Weapon_Blaster_Fire,
  Weapon_Chaingun,
  Weapon_Generic,
  Weapon_Grenade,
  Weapon_GrenadeLauncher,
  Weapon_HyperBlaster,
  Weapon_HyperBlaster_Fire,
  Weapon_Machinegun,
  Weapon_Railgun,
  Weapon_RocketLauncher,
  Weapon_Shotgun,
  Weapon_SuperShotgun,
  Weapon_RocketLauncher_Fire,
  weapon_bfg_fire,
  weapon_grenade_fire,
  weapon_grenadelauncher_fire,
  weapon_railgun_fire,
  weapon_shotgun_fire,
  weapon_supershotgun_fire
} from "./p_weapon.js";

export {
  PlayerTrail_Add,
  PlayerTrail_Init,
  PlayerTrail_LastSpot,
  PlayerTrail_New,
  PlayerTrail_PickFirst,
  PlayerTrail_PickNext,
  TRAIL_LENGTH
} from "./p_trail.js";

export type {
  GameItemArmorInfo,
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
  GameSoundEvent,
  GameMoveInfo,
  GameEntityTouch,
  GameEntityUse,
  GameRuntime,
  GameRuntimeLogEntry
} from "./runtime.js";

export type {
  client_persistant_t,
  client_respawn_t,
  field_t,
  game_locals_t,
  gitem_armor_t,
  gitem_t,
  level_locals_t,
  mframe_t,
  mmove_t,
  monsterinfo_t,
  spawn_temp_t
} from "./g-local.js";

export type { GameWeaponHooks } from "./p_weapon.js";
export type {
  LocalInventoryGrant,
  LocalItemStringEntry,
  LocalWeaponBootstrapData,
  LocalWeaponSlotKey
} from "./local-game-bootstrap.js";
