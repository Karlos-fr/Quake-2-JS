/**
 * File: g_misc.ts
 * Source: Quake II original / game/g_misc.c
 * Purpose: Port the first decorative and world-object spawn routines required to preserve visible non-brush entities.
 *
 * Porting policy:
 * - Preserve original behavior first.
 * - Preserve original names whenever possible.
 * - Avoid structural refactors unless documented.
 *
 * Deviations:
 * - Train-driven helpers used by `misc_viper` and `misc_strogg_ship` are not ported yet.
 * - `misc_teleporter` spawns its trigger helper but leaves teleport touch logic for a later phase.
 *
 * Notes:
 * - This file is intended to stay close to the original C source.
 */

import { EF_GIB, EF_TELEPORTER, RF_FRAMELERP, RF_TRANSLUCENT } from "../../qcommon/src/index.js";
import {
  FRAMETIME,
  MOVETYPE_NONE,
  MOVETYPE_PUSH,
  MOVETYPE_TOSS,
  SOLID_BSP,
  SOLID_NOT,
  SOLID_TRIGGER,
  SVF_NOCLIENT,
  SVF_MONSTER,
  linkGameEntity,
  refreshEntitySpatialState,
  registerGameModel,
  registerGameSound,
  spawnGameEntity,
  type GameEntity,
  type GameRuntime
} from "./runtime.js";

/**
 * Original name: misc_banner_think
 * Source: game/g_misc.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Advances the banner animation by one MD2 frame every server frame.
 */
export function misc_banner_think(ent: GameEntity, runtime: GameRuntime): void {
  ent.s.frame = (ent.s.frame + 1) % 16;
  ent.think = misc_banner_think;
  ent.nextthink = runtime.time + FRAMETIME;
}

/**
 * Original name: SP_misc_banner
 * Source: game/g_misc.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Spawns the animated hanging banner decorative entity.
 *
 * Porting notes:
 * - Uses the local gameplay asset registry in place of `gi.modelindex`.
 */
export function SP_misc_banner(ent: GameEntity, runtime: GameRuntime): void {
  ent.movetype = MOVETYPE_NONE;
  ent.solid = SOLID_NOT;
  ent.s.modelindex = registerGameModel(runtime, "models/objects/banner/tris.md2");
  ent.s.frame = Math.trunc(Math.random() * 16) % 16;
  ent.think = misc_banner_think;
  ent.nextthink = runtime.time + FRAMETIME;
  refreshEntitySpatialState(ent);
  linkGameEntity(runtime, ent);
}

/**
 * Original name: misc_satellite_dish_think
 * Source: game/g_misc.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Runs the dish animation until frame 37 inclusive.
 */
export function misc_satellite_dish_think(self: GameEntity, runtime: GameRuntime): void {
  self.s.frame += 1;
  if (self.s.frame < 38) {
    self.think = misc_satellite_dish_think;
    self.nextthink = runtime.time + FRAMETIME;
  }
}

/**
 * Original name: misc_satellite_dish_use
 * Source: game/g_misc.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Restarts the dish animation from frame zero.
 */
export function misc_satellite_dish_use(
  self: GameEntity,
  _other: GameEntity | null,
  _activator: GameEntity | null,
  runtime: GameRuntime
): void {
  self.s.frame = 0;
  self.think = misc_satellite_dish_think;
  self.nextthink = runtime.time + FRAMETIME;
}

/**
 * Original name: SP_misc_satellite_dish
 * Source: game/g_misc.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Spawns the static dish entity that can later animate when used.
 */
export function SP_misc_satellite_dish(ent: GameEntity, runtime: GameRuntime): void {
  ent.movetype = MOVETYPE_NONE;
  ent.solid = SOLID_BSP;
  ent.mins = [-64, -64, 0];
  ent.maxs = [64, 64, 128];
  ent.s.modelindex = registerGameModel(runtime, "models/objects/satellite/tris.md2");
  ent.use = misc_satellite_dish_use;
  refreshEntitySpatialState(ent);
  linkGameEntity(runtime, ent);
}

/**
 * Original name: SP_light_mine1
 * Source: game/g_misc.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Spawns the first decorative mine light model.
 */
export function SP_light_mine1(ent: GameEntity, runtime: GameRuntime): void {
  ent.movetype = MOVETYPE_NONE;
  ent.solid = SOLID_BSP;
  ent.s.modelindex = registerGameModel(runtime, "models/objects/minelite/light1/tris.md2");
  refreshEntitySpatialState(ent);
  linkGameEntity(runtime, ent);
}

/**
 * Original name: SP_light_mine2
 * Source: game/g_misc.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Spawns the second decorative mine light model.
 */
export function SP_light_mine2(ent: GameEntity, runtime: GameRuntime): void {
  ent.movetype = MOVETYPE_NONE;
  ent.solid = SOLID_BSP;
  ent.s.modelindex = registerGameModel(runtime, "models/objects/minelite/light2/tris.md2");
  refreshEntitySpatialState(ent);
  linkGameEntity(runtime, ent);
}

/**
 * Original name: SP_misc_bigviper
 * Source: game/g_misc.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Spawns the large stationary viper ship decorative model.
 */
export function SP_misc_bigviper(ent: GameEntity, runtime: GameRuntime): void {
  ent.movetype = MOVETYPE_NONE;
  ent.solid = SOLID_BSP;
  ent.mins = [-176, -120, -24];
  ent.maxs = [176, 120, 72];
  ent.s.modelindex = registerGameModel(runtime, "models/ships/bigviper/tris.md2");
  refreshEntitySpatialState(ent);
  linkGameEntity(runtime, ent);
}

/**
 * Original name: misc_blackhole_use
 * Source: game/g_misc.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Removes the black hole entity when activated.
 *
 * Porting notes:
 * - The temporary entity effect commented out in the original source stays omitted here too.
 */
export function misc_blackhole_use(
  ent: GameEntity,
  _other: GameEntity | null,
  _activator: GameEntity | null,
  _runtime: GameRuntime
): void {
  ent.inuse = false;
}

/**
 * Original name: misc_blackhole_think
 * Source: game/g_misc.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Loops the black hole animation over frames 0..18.
 */
export function misc_blackhole_think(self: GameEntity, runtime: GameRuntime): void {
  if (++self.s.frame < 19) {
    self.think = misc_blackhole_think;
    self.nextthink = runtime.time + FRAMETIME;
    return;
  }

  self.s.frame = 0;
  self.think = misc_blackhole_think;
  self.nextthink = runtime.time + FRAMETIME;
}

/**
 * Original name: SP_misc_blackhole
 * Source: game/g_misc.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Spawns the translucent animated black hole decorative entity.
 */
export function SP_misc_blackhole(ent: GameEntity, runtime: GameRuntime): void {
  ent.movetype = MOVETYPE_NONE;
  ent.solid = SOLID_NOT;
  ent.mins = [-64, -64, 0];
  ent.maxs = [64, 64, 8];
  ent.s.modelindex = registerGameModel(runtime, "models/objects/black/tris.md2");
  ent.s.renderfx = RF_TRANSLUCENT;
  ent.use = misc_blackhole_use;
  ent.think = misc_blackhole_think;
  ent.nextthink = runtime.time + 2 * FRAMETIME;
  refreshEntitySpatialState(ent);
  linkGameEntity(runtime, ent);
}

/**
 * Original name: misc_eastertank_think
 * Source: game/g_misc.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Advances the tank easter animation over frames 254..292.
 */
export function misc_eastertank_think(self: GameEntity, runtime: GameRuntime): void {
  if (++self.s.frame < 293) {
    self.think = misc_eastertank_think;
    self.nextthink = runtime.time + FRAMETIME;
    return;
  }

  self.s.frame = 254;
  self.think = misc_eastertank_think;
  self.nextthink = runtime.time + FRAMETIME;
}

/**
 * Original name: SP_misc_eastertank
 * Source: game/g_misc.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Spawns the animated easter tank decorative monster model.
 */
export function SP_misc_eastertank(ent: GameEntity, runtime: GameRuntime): void {
  ent.movetype = MOVETYPE_NONE;
  ent.solid = SOLID_BSP;
  ent.mins = [-32, -32, -16];
  ent.maxs = [32, 32, 32];
  ent.s.modelindex = registerGameModel(runtime, "models/monsters/tank/tris.md2");
  ent.s.frame = 254;
  ent.think = misc_eastertank_think;
  ent.nextthink = runtime.time + 2 * FRAMETIME;
  refreshEntitySpatialState(ent);
  linkGameEntity(runtime, ent);
}

/**
 * Original name: misc_easterchick_think
 * Source: game/g_misc.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Advances the first easter chick animation over frames 208..246.
 */
export function misc_easterchick_think(self: GameEntity, runtime: GameRuntime): void {
  if (++self.s.frame < 247) {
    self.think = misc_easterchick_think;
    self.nextthink = runtime.time + FRAMETIME;
    return;
  }

  self.s.frame = 208;
  self.think = misc_easterchick_think;
  self.nextthink = runtime.time + FRAMETIME;
}

/**
 * Original name: SP_misc_easterchick
 * Source: game/g_misc.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Spawns the first animated easter chick decorative monster model.
 */
export function SP_misc_easterchick(ent: GameEntity, runtime: GameRuntime): void {
  ent.movetype = MOVETYPE_NONE;
  ent.solid = SOLID_BSP;
  ent.mins = [-32, -32, 0];
  ent.maxs = [32, 32, 32];
  ent.s.modelindex = registerGameModel(runtime, "models/monsters/bitch/tris.md2");
  ent.s.frame = 208;
  ent.think = misc_easterchick_think;
  ent.nextthink = runtime.time + 2 * FRAMETIME;
  refreshEntitySpatialState(ent);
  linkGameEntity(runtime, ent);
}

/**
 * Original name: misc_easterchick2_think
 * Source: game/g_misc.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Advances the second easter chick animation over frames 248..286.
 */
export function misc_easterchick2_think(self: GameEntity, runtime: GameRuntime): void {
  if (++self.s.frame < 287) {
    self.think = misc_easterchick2_think;
    self.nextthink = runtime.time + FRAMETIME;
    return;
  }

  self.s.frame = 248;
  self.think = misc_easterchick2_think;
  self.nextthink = runtime.time + FRAMETIME;
}

/**
 * Original name: SP_misc_easterchick2
 * Source: game/g_misc.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Spawns the second animated easter chick decorative monster model.
 */
export function SP_misc_easterchick2(ent: GameEntity, runtime: GameRuntime): void {
  ent.movetype = MOVETYPE_NONE;
  ent.solid = SOLID_BSP;
  ent.mins = [-32, -32, 0];
  ent.maxs = [32, 32, 32];
  ent.s.modelindex = registerGameModel(runtime, "models/monsters/bitch/tris.md2");
  ent.s.frame = 248;
  ent.think = misc_easterchick2_think;
  ent.nextthink = runtime.time + 2 * FRAMETIME;
  refreshEntitySpatialState(ent);
  linkGameEntity(runtime, ent);
}

/**
 * Original name: commander_body_think
 * Source: game/g_misc.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Plays the commander's decapitated body animation until frame 23.
 *
 * Porting notes:
 * - Sound playback side effects are precached elsewhere but not emitted yet by the local gameplay runtime.
 */
export function commander_body_think(self: GameEntity, runtime: GameRuntime): void {
  if (++self.s.frame < 24) {
    self.think = commander_body_think;
    self.nextthink = runtime.time + FRAMETIME;
    return;
  }

  self.nextthink = 0;
  self.think = undefined;
}

/**
 * Original name: commander_body_use
 * Source: game/g_misc.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Starts the commander's body animation when used.
 */
export function commander_body_use(
  self: GameEntity,
  _other: GameEntity | null,
  _activator: GameEntity | null,
  runtime: GameRuntime
): void {
  self.think = commander_body_think;
  self.nextthink = runtime.time + FRAMETIME;
}

/**
 * Original name: commander_body_drop
 * Source: game/g_misc.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Converts the commander body into a toss entity and nudges it upward.
 *
 * Porting notes:
 * - Full toss physics are already provided by the shared runtime, so this only updates the movetype and origin.
 */
export function commander_body_drop(self: GameEntity, runtime: GameRuntime): void {
  self.movetype = MOVETYPE_TOSS;
  self.origin[2] += 2;
  self.s.origin = [...self.origin];
  refreshEntitySpatialState(self);
  linkGameEntity(runtime, self);
}

/**
 * Original name: SP_monster_commander_body
 * Source: game/g_misc.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Spawns the commander's body decorative alias model with frame lerp enabled.
 *
 * Porting notes:
 * - The takedamage and godmode gameplay fields from the original are not modeled yet in the local runtime.
 */
export function SP_monster_commander_body(self: GameEntity, runtime: GameRuntime): void {
  self.movetype = MOVETYPE_NONE;
  self.solid = SOLID_BSP;
  self.model = "models/monsters/commandr/tris.md2";
  self.s.modelindex = registerGameModel(runtime, self.model);
  self.mins = [-32, -32, 0];
  self.maxs = [32, 32, 48];
  self.use = commander_body_use;
  self.s.renderfx |= RF_FRAMELERP;
  registerGameSound(runtime, "tank/thud.wav");
  registerGameSound(runtime, "tank/pain.wav");
  self.think = commander_body_drop;
  self.nextthink = runtime.time + 5 * FRAMETIME;
  refreshEntitySpatialState(self);
  linkGameEntity(runtime, self);
}

/**
 * Original name: misc_viper_use
 * Source: game/g_misc.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Makes the viper visible when triggered.
 *
 * Porting notes:
 * - Defers the original `train_use` hand-off to a later movement phase.
 */
export function misc_viper_use(
  self: GameEntity,
  _other: GameEntity | null,
  _activator: GameEntity | null,
  runtime: GameRuntime
): void {
  self.svflags &= ~SVF_NOCLIENT;
  refreshEntitySpatialState(self);
  linkGameEntity(runtime, self);
}

/**
 * Original name: SP_misc_viper
 * Source: game/g_misc.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Spawns the trigger-activated flyby viper entity.
 */
export function SP_misc_viper(ent: GameEntity, runtime: GameRuntime): void {
  if (!ent.target) {
    return;
  }

  if (!ent.speed) {
    ent.speed = 300;
  }

  ent.movetype = MOVETYPE_PUSH;
  ent.solid = SOLID_NOT;
  ent.s.modelindex = registerGameModel(runtime, "models/ships/viper/tris.md2");
  ent.mins = [-16, -16, 0];
  ent.maxs = [16, 16, 32];
  ent.use = misc_viper_use;
  ent.svflags |= SVF_NOCLIENT;
  ent.moveinfo.accel = ent.speed;
  ent.moveinfo.decel = ent.speed;
  ent.moveinfo.speed = ent.speed;
  refreshEntitySpatialState(ent);
  linkGameEntity(runtime, ent);
}

/**
 * Original name: misc_strogg_ship_use
 * Source: game/g_misc.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Makes the Strogg ship visible when triggered.
 *
 * Porting notes:
 * - Defers the original `train_use` continuation to a later phase.
 */
export function misc_strogg_ship_use(
  self: GameEntity,
  _other: GameEntity | null,
  _activator: GameEntity | null,
  runtime: GameRuntime
): void {
  self.svflags &= ~SVF_NOCLIENT;
  refreshEntitySpatialState(self);
  linkGameEntity(runtime, self);
}

/**
 * Original name: SP_misc_strogg_ship
 * Source: game/g_misc.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Spawns the trigger-activated Strogg ship flyby entity.
 */
export function SP_misc_strogg_ship(ent: GameEntity, runtime: GameRuntime): void {
  if (!ent.target) {
    return;
  }

  if (!ent.speed) {
    ent.speed = 300;
  }

  ent.movetype = MOVETYPE_PUSH;
  ent.solid = SOLID_NOT;
  ent.s.modelindex = registerGameModel(runtime, "models/ships/strogg1/tris.md2");
  ent.mins = [-16, -16, 0];
  ent.maxs = [16, 16, 32];
  ent.use = misc_strogg_ship_use;
  ent.svflags |= SVF_NOCLIENT;
  ent.moveinfo.accel = ent.speed;
  ent.moveinfo.decel = ent.speed;
  ent.moveinfo.speed = ent.speed;
  refreshEntitySpatialState(ent);
  linkGameEntity(runtime, ent);
}

/**
 * Original name: SP_misc_teleporter
 * Source: game/g_misc.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Spawns the teleporter pad and its local trigger helper volume.
 *
 * Porting notes:
 * - The touch callback is intentionally left for a later gameplay phase.
 */
export function SP_misc_teleporter(ent: GameEntity, runtime: GameRuntime): void {
  if (!ent.target) {
    return;
  }

  ent.model = "models/objects/dmspot/tris.md2";
  ent.s.modelindex = registerGameModel(runtime, ent.model);
  ent.s.skinnum = 1;
  ent.s.effects = EF_TELEPORTER;
  ent.s.sound = registerGameSound(runtime, "world/amb10.wav");
  ent.solid = SOLID_BSP;
  ent.mins = [-32, -32, -24];
  ent.maxs = [32, 32, -16];
  refreshEntitySpatialState(ent);
  linkGameEntity(runtime, ent);

  const trig = spawnGameEntity(runtime);
  trig.classname = "teleporter_trigger";
  trig.solid = SOLID_TRIGGER;
  trig.target = ent.target;
  trig.owner = ent;
  trig.origin = [...ent.origin];
  trig.mins = [-8, -8, 8];
  trig.maxs = [8, 8, 24];
  trig.svflags |= SVF_NOCLIENT;
  refreshEntitySpatialState(trig);
  linkGameEntity(runtime, trig);
}

/**
 * Original name: SP_misc_teleporter_dest
 * Source: game/g_misc.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Spawns the destination pad model for teleporters.
 */
export function SP_misc_teleporter_dest(ent: GameEntity, runtime: GameRuntime): void {
  ent.model = "models/objects/dmspot/tris.md2";
  ent.s.modelindex = registerGameModel(runtime, ent.model);
  ent.s.skinnum = 0;
  ent.solid = SOLID_BSP;
  ent.mins = [-32, -32, -24];
  ent.maxs = [32, 32, -16];
  refreshEntitySpatialState(ent);
  linkGameEntity(runtime, ent);
}

/**
 * Original name: SP_misc_deadsoldier
 * Source: game/g_misc.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Spawns one dead marine body pose selected from the spawnflags.
 *
 * Porting notes:
 * - Deathmatch auto-removal and gibbing death behavior are deferred until the broader combat/runtime phase.
 */
export function SP_misc_deadsoldier(ent: GameEntity, runtime: GameRuntime): void {
  ent.movetype = MOVETYPE_NONE;
  ent.solid = SOLID_BSP;
  ent.s.modelindex = registerGameModel(runtime, "models/deadbods/dude/tris.md2");

  if ((ent.spawnflags & 2) !== 0) {
    ent.s.frame = 1;
  } else if ((ent.spawnflags & 4) !== 0) {
    ent.s.frame = 2;
  } else if ((ent.spawnflags & 8) !== 0) {
    ent.s.frame = 3;
  } else if ((ent.spawnflags & 16) !== 0) {
    ent.s.frame = 4;
  } else if ((ent.spawnflags & 32) !== 0) {
    ent.s.frame = 5;
  } else {
    ent.s.frame = 0;
  }

  ent.mins = [-16, -16, 0];
  ent.maxs = [16, 16, 16];
  refreshEntitySpatialState(ent);
  linkGameEntity(runtime, ent);
}

/**
 * Category: New
 * Purpose: Apply the shared gib spawn baseline used by the `misc_gib_*` ports.
 *
 * Constraints:
 * - Must preserve the original MD2 model, toss movetype and random angular velocity setup.
 */
function initialize_misc_gib(ent: GameEntity, runtime: GameRuntime, modelPath: string): void {
  ent.model = modelPath;
  ent.s.modelindex = registerGameModel(runtime, modelPath);
  ent.solid = SOLID_NOT;
  ent.s.effects |= EF_GIB;
  ent.movetype = MOVETYPE_TOSS;
  ent.svflags |= SVF_MONSTER;
  ent.avelocity = [Math.random() * 200, Math.random() * 200, Math.random() * 200];
  ent.nextthink = runtime.time + 30;
  refreshEntitySpatialState(ent);
  linkGameEntity(runtime, ent);
}

/**
 * Original name: SP_misc_gib_arm
 * Source: game/g_misc.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Spawns the flying arm gib decorative entity.
 *
 * Porting notes:
 * - Gib death cleanup is deferred until the broader combat/gib phase.
 */
export function SP_misc_gib_arm(ent: GameEntity, runtime: GameRuntime): void {
  initialize_misc_gib(ent, runtime, "models/objects/gibs/arm/tris.md2");
}

/**
 * Original name: SP_misc_gib_leg
 * Source: game/g_misc.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Spawns the flying leg gib decorative entity.
 *
 * Porting notes:
 * - Gib death cleanup is deferred until the broader combat/gib phase.
 */
export function SP_misc_gib_leg(ent: GameEntity, runtime: GameRuntime): void {
  initialize_misc_gib(ent, runtime, "models/objects/gibs/leg/tris.md2");
}

/**
 * Original name: SP_misc_gib_head
 * Source: game/g_misc.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Spawns the flying head gib decorative entity.
 *
 * Porting notes:
 * - Gib death cleanup is deferred until the broader combat/gib phase.
 */
export function SP_misc_gib_head(ent: GameEntity, runtime: GameRuntime): void {
  initialize_misc_gib(ent, runtime, "models/objects/gibs/head/tris.md2");
}

/**
 * Original name: SP_misc_viper_bomb
 * Source: game/g_misc.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Spawns the hidden viper bomb entity with its world model and default damage.
 *
 * Porting notes:
 * - Activation, flight prethink and explosion touch are deferred until the train/bomb gameplay phase.
 */
export function SP_misc_viper_bomb(self: GameEntity, runtime: GameRuntime): void {
  self.movetype = MOVETYPE_NONE;
  self.solid = SOLID_NOT;
  self.mins = [-8, -8, -8];
  self.maxs = [8, 8, 8];
  self.s.modelindex = registerGameModel(runtime, "models/objects/bomb/tris.md2");
  if (self.dmg === 0) {
    self.dmg = 1000;
  }
  self.svflags |= SVF_NOCLIENT;
  refreshEntitySpatialState(self);
  linkGameEntity(runtime, self);
}
