/**
 * File: g_func.ts
 * Source: Quake II original / game/g_func.c
 * Purpose: Port the first door and platform lifecycles needed by Quake II trigger-driven brush entities.
 *
 * Porting policy:
 * - Preserve original behavior first.
 * - Preserve original names whenever possible.
 * - Avoid structural refactors unless documented.
 *
 * Deviations:
 * - Spawns simplified door trigger helper entities without full spatial linkage.
 * - Uses the local gameplay runtime instead of `gi.linkentity` / full engine services.
 *
 * Notes:
 * - This file is intended to stay close to the original door and platform state flow.
 */

import { G_Find, G_UseTargets } from "./g_utils.js";
import {
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
  SOLID_BSP,
  SOLID_TRIGGER,
  STATE_BOTTOM,
  STATE_DOWN,
  STATE_TOP,
  STATE_UP,
  SVF_MONSTER,
  freeGameEntity,
  getRuntimeEntityLabel,
  spawnGameEntity
} from "./runtime.js";
import type { GameEntity, GameRuntime } from "./runtime.js";

const ACCELERATION_DISTANCE_SCALE = 0.5;

/**
 * Original name: Move_Done
 * Source: game/g_func.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Stops linear movement and fires the registered move end callback.
 */
export function Move_Done(ent: GameEntity, runtime: GameRuntime): void {
  ent.velocity = [0, 0, 0];
  ent.moveinfo.endfunc?.(ent, runtime);
}

/**
 * Original name: Move_Final
 * Source: game/g_func.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Applies the last fractional frame of a linear pusher movement.
 */
export function Move_Final(ent: GameEntity, runtime: GameRuntime): void {
  if (ent.moveinfo.remaining_distance === 0) {
    Move_Done(ent, runtime);
    return;
  }

  const scale = ent.moveinfo.remaining_distance / FRAMETIME;
  ent.velocity = scaleVec3(ent.moveinfo.dir, scale);
  ent.think = Move_Done;
  ent.nextthink = runtime.time + FRAMETIME;
}

/**
 * Original name: Move_Begin
 * Source: game/g_func.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Starts the constant-speed linear movement branch for one brush model.
 */
export function Move_Begin(ent: GameEntity, runtime: GameRuntime): void {
  if ((ent.moveinfo.speed * FRAMETIME) >= ent.moveinfo.remaining_distance) {
    Move_Final(ent, runtime);
    return;
  }

  ent.velocity = scaleVec3(ent.moveinfo.dir, ent.moveinfo.speed);
  const frames = Math.floor((ent.moveinfo.remaining_distance / ent.moveinfo.speed) / FRAMETIME);
  ent.moveinfo.remaining_distance -= frames * ent.moveinfo.speed * FRAMETIME;
  ent.nextthink = runtime.time + (frames * FRAMETIME);
  ent.think = Move_Final;
}

/**
 * Original name: plat_CalcAcceleratedMove
 * Source: game/g_func.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Computes the accelerated move profile used by platforms and configurable doors.
 */
export function plat_CalcAcceleratedMove(moveinfo: GameEntity["moveinfo"]): void {
  moveinfo.move_speed = moveinfo.speed;

  if (moveinfo.remaining_distance < moveinfo.accel) {
    moveinfo.current_speed = moveinfo.remaining_distance;
    return;
  }

  const accel_dist = accelerationDistance(moveinfo.speed, moveinfo.accel);
  let decel_dist = accelerationDistance(moveinfo.speed, moveinfo.decel);

  if ((moveinfo.remaining_distance - accel_dist - decel_dist) < 0) {
    const f = (moveinfo.accel + moveinfo.decel) / (moveinfo.accel * moveinfo.decel);
    moveinfo.move_speed = (-2 + Math.sqrt(4 - 4 * f * (-2 * moveinfo.remaining_distance))) / (2 * f);
    decel_dist = accelerationDistance(moveinfo.move_speed, moveinfo.decel);
  }

  moveinfo.decel_distance = decel_dist;
}

/**
 * Original name: plat_Accelerate
 * Source: game/g_func.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Advances one accelerated movement profile by one server frame.
 */
export function plat_Accelerate(moveinfo: GameEntity["moveinfo"]): void {
  if (moveinfo.remaining_distance <= moveinfo.decel_distance) {
    if (moveinfo.remaining_distance < moveinfo.decel_distance) {
      if (moveinfo.next_speed) {
        moveinfo.current_speed = moveinfo.next_speed;
        moveinfo.next_speed = 0;
        return;
      }
      if (moveinfo.current_speed > moveinfo.decel) {
        moveinfo.current_speed -= moveinfo.decel;
      }
    }
    return;
  }

  if (moveinfo.current_speed === moveinfo.move_speed) {
    if ((moveinfo.remaining_distance - moveinfo.current_speed) < moveinfo.decel_distance) {
      const p1_distance = moveinfo.remaining_distance - moveinfo.decel_distance;
      const p2_distance = moveinfo.move_speed * (1.0 - (p1_distance / moveinfo.move_speed));
      const distance = p1_distance + p2_distance;
      moveinfo.current_speed = moveinfo.move_speed;
      moveinfo.next_speed = moveinfo.move_speed - moveinfo.decel * (p2_distance / distance);
      return;
    }
  }

  if (moveinfo.current_speed < moveinfo.speed) {
    const old_speed = moveinfo.current_speed;
    moveinfo.current_speed += moveinfo.accel;
    if (moveinfo.current_speed > moveinfo.speed) {
      moveinfo.current_speed = moveinfo.speed;
    }

    if ((moveinfo.remaining_distance - moveinfo.current_speed) >= moveinfo.decel_distance) {
      return;
    }

    const p1_distance = moveinfo.remaining_distance - moveinfo.decel_distance;
    const p1_speed = (old_speed + moveinfo.move_speed) / 2.0;
    const p2_distance = moveinfo.move_speed * (1.0 - (p1_distance / p1_speed));
    const distance = p1_distance + p2_distance;
    moveinfo.current_speed = (p1_speed * (p1_distance / distance)) + (moveinfo.move_speed * (p2_distance / distance));
    moveinfo.next_speed = moveinfo.move_speed - moveinfo.decel * (p2_distance / distance);
  }
}

/**
 * Original name: Think_AccelMove
 * Source: game/g_func.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Updates one accelerated pusher movement for the next server frame.
 */
export function Think_AccelMove(ent: GameEntity, runtime: GameRuntime): void {
  ent.moveinfo.remaining_distance -= ent.moveinfo.current_speed;

  if (ent.moveinfo.current_speed === 0) {
    plat_CalcAcceleratedMove(ent.moveinfo);
  }

  plat_Accelerate(ent.moveinfo);

  if (ent.moveinfo.remaining_distance <= ent.moveinfo.current_speed) {
    Move_Final(ent, runtime);
    return;
  }

  ent.velocity = scaleVec3(ent.moveinfo.dir, ent.moveinfo.current_speed * 10);
  ent.nextthink = runtime.time + FRAMETIME;
  ent.think = Think_AccelMove;
}

/**
 * Original name: Move_Calc
 * Source: game/g_func.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Prepares one linear brush move toward the requested destination.
 */
export function Move_Calc(ent: GameEntity, dest: [number, number, number], func: (entity: GameEntity, runtime: GameRuntime) => void, runtime: GameRuntime): void {
  ent.velocity = [0, 0, 0];
  ent.moveinfo.dir = [
    dest[0] - ent.origin[0],
    dest[1] - ent.origin[1],
    dest[2] - ent.origin[2]
  ];
  ent.moveinfo.remaining_distance = normalizeVec3(ent.moveinfo.dir);
  ent.moveinfo.endfunc = func;

  if (ent.moveinfo.speed === ent.moveinfo.accel && ent.moveinfo.speed === ent.moveinfo.decel) {
    const currentMover = ((ent.flags & FL_TEAMSLAVE) !== 0 ? ent.teammaster : ent);
    if (runtime.current_entity === currentMover) {
      Move_Begin(ent, runtime);
    } else {
      ent.nextthink = runtime.time + FRAMETIME;
      ent.think = Move_Begin;
    }
  } else {
    ent.moveinfo.current_speed = 0;
    ent.think = Think_AccelMove;
    ent.nextthink = runtime.time + FRAMETIME;
  }
}

/**
 * Original name: AngleMove_Done
 * Source: game/g_func.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Stops angular movement and fires the registered move end callback.
 */
export function AngleMove_Done(ent: GameEntity, runtime: GameRuntime): void {
  ent.avelocity = [0, 0, 0];
  ent.moveinfo.endfunc?.(ent, runtime);
}

/**
 * Original name: AngleMove_Final
 * Source: game/g_func.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Applies the last angular frame for a rotating brush model.
 */
export function AngleMove_Final(ent: GameEntity, runtime: GameRuntime): void {
  const move = ent.moveinfo.state === STATE_UP
    ? subtractVec3(ent.moveinfo.end_angles, ent.angles)
    : subtractVec3(ent.moveinfo.start_angles, ent.angles);

  if (isZeroVec3(move)) {
    AngleMove_Done(ent, runtime);
    return;
  }

  ent.avelocity = scaleVec3(move, 1.0 / FRAMETIME);
  ent.think = AngleMove_Done;
  ent.nextthink = runtime.time + FRAMETIME;
}

/**
 * Original name: AngleMove_Begin
 * Source: game/g_func.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Starts the constant-speed angular movement branch for rotating doors.
 */
export function AngleMove_Begin(ent: GameEntity, runtime: GameRuntime): void {
  const destdelta = ent.moveinfo.state === STATE_UP
    ? subtractVec3(ent.moveinfo.end_angles, ent.angles)
    : subtractVec3(ent.moveinfo.start_angles, ent.angles);
  const len = vec3Length(destdelta);
  const traveltime = len / ent.moveinfo.speed;

  if (traveltime < FRAMETIME) {
    AngleMove_Final(ent, runtime);
    return;
  }

  const frames = Math.floor(traveltime / FRAMETIME);
  ent.avelocity = scaleVec3(destdelta, 1.0 / traveltime);
  ent.nextthink = runtime.time + frames * FRAMETIME;
  ent.think = AngleMove_Final;
}

/**
 * Original name: AngleMove_Calc
 * Source: game/g_func.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Prepares one angular brush move and starts it immediately for the active mover.
 */
export function AngleMove_Calc(ent: GameEntity, func: (entity: GameEntity, runtime: GameRuntime) => void, runtime: GameRuntime): void {
  ent.avelocity = [0, 0, 0];
  ent.moveinfo.endfunc = func;
  const currentMover = ((ent.flags & FL_TEAMSLAVE) !== 0 ? ent.teammaster : ent);
  if (runtime.current_entity === currentMover) {
    AngleMove_Begin(ent, runtime);
  } else {
    ent.nextthink = runtime.time + FRAMETIME;
    ent.think = AngleMove_Begin;
  }
}

/**
 * Original name: door_use_areaportals
 * Source: game/g_func.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Resolves linked `func_areaportal` entities targeted by the door and toggles their logical open state.
 *
 * Porting notes:
 * - Logs portal state changes instead of talking to the renderer/server visibility layer.
 */
export function door_use_areaportals(self: GameEntity, open: boolean, runtime: GameRuntime): void {
  if (!self.target) {
    return;
  }

  let entity: GameEntity | null = null;
  while ((entity = G_Find(runtime, entity, "targetname", self.target)) !== null) {
    if (entity.classname !== "func_areaportal") {
      continue;
    }

    runtime.log({
      kind: "use",
      message: `${getRuntimeEntityLabel(self)} areaportal ${open ? "open" : "close"} -> ${getRuntimeEntityLabel(entity)}`,
      entityIndex: self.index,
      entityClassname: self.classname,
      otherIndex: entity.index,
      otherClassname: entity.classname
    });
  }
}

/**
 * Original name: door_hit_top
 * Source: game/g_func.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Marks the door as fully open and schedules the return trip when appropriate.
 */
export function door_hit_top(self: GameEntity, runtime: GameRuntime): void {
  self.moveinfo.state = STATE_TOP;
  runtime.log({
    kind: "think",
    message: `${getRuntimeEntityLabel(self)} hit top`,
    entityIndex: self.index,
    entityClassname: self.classname
  });

  if ((self.spawnflags & DOOR_TOGGLE) !== 0) {
    return;
  }

  if (self.moveinfo.wait >= 0) {
    self.think = door_go_down;
    self.nextthink = runtime.time + self.moveinfo.wait;
  }
}

/**
 * Original name: door_hit_bottom
 * Source: game/g_func.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Marks the door as fully closed and closes linked area portals.
 */
export function door_hit_bottom(self: GameEntity, runtime: GameRuntime): void {
  self.moveinfo.state = STATE_BOTTOM;
  runtime.log({
    kind: "think",
    message: `${getRuntimeEntityLabel(self)} hit bottom`,
    entityIndex: self.index,
    entityClassname: self.classname
  });
  door_use_areaportals(self, false, runtime);
}

/**
 * Original name: door_go_down
 * Source: game/g_func.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Starts the closing phase of one door.
 */
export function door_go_down(self: GameEntity, runtime: GameRuntime): void {
  if (self.max_health > 0) {
    self.health = self.max_health;
  }

  self.moveinfo.state = STATE_DOWN;
  if (self.classname === "func_door") {
    Move_Calc(self, self.moveinfo.start_origin, door_hit_bottom, runtime);
  } else if (self.classname === "func_door_rotating") {
    AngleMove_Calc(self, door_hit_bottom, runtime);
  }
}

/**
 * Original name: door_go_up
 * Source: game/g_func.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Starts the opening phase of one door and fires its linked targets.
 */
export function door_go_up(self: GameEntity, activator: GameEntity | null, runtime: GameRuntime): void {
  if (self.moveinfo.state === STATE_UP) {
    return;
  }

  if (self.moveinfo.state === STATE_TOP) {
    if (self.moveinfo.wait >= 0) {
      self.nextthink = runtime.time + self.moveinfo.wait;
    }
    return;
  }

  self.moveinfo.state = STATE_UP;
  self.activator = activator;
  if (self.classname === "func_door") {
    Move_Calc(self, self.moveinfo.end_origin, door_hit_top, runtime);
  } else if (self.classname === "func_door_rotating") {
    AngleMove_Calc(self, door_hit_top, runtime);
  }
  G_UseTargets(runtime, self, activator);
  door_use_areaportals(self, true, runtime);
}

/**
 * Original name: door_use
 * Source: game/g_func.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Activates one door team, handling toggle semantics and propagating to all team members.
 */
export function door_use(self: GameEntity, _other: GameEntity | null, activator: GameEntity | null, runtime: GameRuntime): void {
  if (self.teammaster && self.teammaster !== self) {
    return;
  }

  if ((self.spawnflags & DOOR_TOGGLE) !== 0 && (self.moveinfo.state === STATE_UP || self.moveinfo.state === STATE_TOP)) {
    forEachDoorTeam(self, (entity) => {
      entity.message = undefined;
      entity.touch = undefined;
      door_go_down(entity, runtime);
    });
    return;
  }

  forEachDoorTeam(self, (entity) => {
    entity.message = undefined;
    entity.touch = undefined;
    door_go_up(entity, activator, runtime);
  });
}

/**
 * Original name: Touch_DoorTrigger
 * Source: game/g_func.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Opens the owning door when an eligible player or monster touches its trigger helper.
 */
export function Touch_DoorTrigger(self: GameEntity, other: GameEntity, runtime: GameRuntime): void {
  if (other.health <= 0) {
    return;
  }

  if ((other.svflags & SVF_MONSTER) === 0 && !other.client) {
    return;
  }

  if (self.owner && (self.owner.spawnflags & DOOR_NOMONSTER) !== 0 && (other.svflags & SVF_MONSTER) !== 0) {
    return;
  }

  if (runtime.time < self.touch_debounce_time) {
    return;
  }

  self.touch_debounce_time = runtime.time + 1.0;
  if (self.owner) {
    door_use(self.owner, other, other, runtime);
  }
}

/**
 * Original name: Think_CalcMoveSpeed
 * Source: game/g_func.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Harmonizes per-door movement speed across one team so they complete together.
 *
 * Porting notes:
 * - Retains the team-speed adjustment logic even though brush movement is still time-simulated.
 */
export function Think_CalcMoveSpeed(self: GameEntity, runtime: GameRuntime): void {
  if (self.teammaster && self.teammaster !== self) {
    return;
  }

  let min = Math.abs(self.moveinfo.distance);
  let entity = self.teamchain;
  while (entity) {
    const distance = Math.abs(entity.moveinfo.distance);
    if (distance < min) {
      min = distance;
    }
    entity = entity.teamchain;
  }

  const safeSpeed = self.moveinfo.speed > 0 ? self.moveinfo.speed : 100;
  const time = min > 0 ? min / safeSpeed : FRAMETIME;

  forEachDoorTeam(self, (member) => {
    const newspeed = time > 0 ? Math.abs(member.moveinfo.distance) / time : member.moveinfo.speed;
    if (newspeed > 0) {
      member.moveinfo.speed = newspeed;
      member.moveinfo.accel = newspeed;
      member.moveinfo.decel = newspeed;
    }
  });

  runtime.log({
    kind: "think",
    message: `${getRuntimeEntityLabel(self)} calc move speed`,
    entityIndex: self.index,
    entityClassname: self.classname
  });
}

/**
 * Original name: Think_SpawnDoorTrigger
 * Source: game/g_func.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Spawns the touch trigger helper used by untargeted doors.
 *
 * Porting notes:
 * - Uses a simplified trigger entity without the full bounds merge from the original world link step.
 */
export function Think_SpawnDoorTrigger(ent: GameEntity, runtime: GameRuntime): void {
  if (ent.teammaster && ent.teammaster !== ent) {
    return;
  }

  const other = spawnGameEntity(runtime);
  other.classname = "door_trigger";
  other.owner = ent;
  other.solid = SOLID_TRIGGER;
  other.movetype = MOVETYPE_NONE;
  other.touch = Touch_DoorTrigger;
  const triggerBounds = computeDoorTriggerBounds(ent);
  other.origin = [0, 0, 0];
  other.mins = [...triggerBounds.mins];
  other.maxs = [...triggerBounds.maxs];
  other.size = [
    other.maxs[0] - other.mins[0],
    other.maxs[1] - other.mins[1],
    other.maxs[2] - other.mins[2]
  ];

  runtime.log({
    kind: "think",
    message: `${getRuntimeEntityLabel(ent)} spawned door trigger #${other.index}`,
    entityIndex: ent.index,
    entityClassname: ent.classname,
    otherIndex: other.index,
    otherClassname: other.classname
  });

  if ((ent.spawnflags & DOOR_START_OPEN) !== 0) {
    door_use_areaportals(ent, true, runtime);
  }

  Think_CalcMoveSpeed(ent, runtime);
}

/**
 * Original name: door_blocked
 * Source: game/g_func.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Reacts to an obstruction and reverses the owning door team unless the door is a crusher.
 */
export function door_blocked(self: GameEntity, other: GameEntity, runtime: GameRuntime): void {
  runtime.log({
    kind: "warning",
    message: `${getRuntimeEntityLabel(self)} blocked by ${getRuntimeEntityLabel(other)}`,
    entityIndex: self.index,
    entityClassname: self.classname,
    otherIndex: other.index,
    otherClassname: other.classname
  });

  if ((self.spawnflags & DOOR_CRUSHER) !== 0) {
    return;
  }

  if (self.moveinfo.wait >= 0) {
    const teammaster = self.teammaster ?? self;
    if (self.moveinfo.state === STATE_DOWN) {
      forEachDoorTeam(teammaster, (entity) => {
        door_go_up(entity, entity.activator, runtime);
      });
    } else {
      forEachDoorTeam(teammaster, (entity) => {
        door_go_down(entity, runtime);
      });
    }
  }
}

/**
 * Original name: door_killed
 * Source: game/g_func.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Resets shootable door health and opens the team when destroyed.
 */
export function door_killed(self: GameEntity, _inflictor: GameEntity | null, attacker: GameEntity | null, _damage: number, runtime: GameRuntime): void {
  const teammaster = self.teammaster ?? self;
  forEachDoorTeam(teammaster, (entity) => {
    entity.health = entity.max_health;
  });
  door_use(teammaster, attacker, attacker, runtime);
}

/**
 * Original name: door_touch
 * Source: game/g_func.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Emits the locked/remote door message when a player touches the door directly.
 *
 * Porting notes:
 * - Logs the message instead of centerprinting/audio side effects.
 */
export function door_touch(self: GameEntity, other: GameEntity, runtime: GameRuntime): void {
  if (!other.client) {
    return;
  }

  if (runtime.time < self.touch_debounce_time) {
    return;
  }

  self.touch_debounce_time = runtime.time + 5.0;
  runtime.log({
    kind: "message",
    message: `${getRuntimeEntityLabel(self)} touch message -> ${getRuntimeEntityLabel(other)} :: ${self.message ?? ""}`,
    entityIndex: self.index,
    entityClassname: self.classname,
    otherIndex: other.index,
    otherClassname: other.classname
  });
}

/**
 * Original name: SP_func_door
 * Source: game/g_func.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Initializes one translating brush door from BSP entity properties.
 *
 * Porting notes:
 * - Computes travel distance from inline model bounds already attached to the runtime entity.
 * - Defers true pusher movement to the later movement phases.
 */
export function SP_func_door(ent: GameEntity, runtime: GameRuntime): void {
  ent.movetype = MOVETYPE_PUSH;
  ent.solid = SOLID_BSP;
  ent.use = door_use;

  if (!ent.speed) {
    ent.speed = 100;
  }
  if (!ent.accel) {
    ent.accel = ent.speed;
  }
  if (!ent.decel) {
    ent.decel = ent.speed;
  }
  if (!ent.wait) {
    ent.wait = 3;
  }
  if (!ent.dmg) {
    ent.dmg = 2;
  }

  ent.pos1 = [...ent.origin];
  ent.moveinfo.distance = computeDoorDistance(ent);
  ent.pos2 = [
    ent.origin[0] + ent.movedir[0] * ent.moveinfo.distance,
    ent.origin[1] + ent.movedir[1] * ent.moveinfo.distance,
    ent.origin[2] + ent.movedir[2] * ent.moveinfo.distance
  ];

  if ((ent.spawnflags & DOOR_START_OPEN) !== 0) {
    ent.origin = [...ent.pos2];
    ent.pos2 = [...ent.pos1];
    ent.pos1 = [...ent.origin];
  }

  ent.moveinfo.state = STATE_BOTTOM;

  if (ent.health > 0) {
    ent.die = door_killed;
    ent.max_health = ent.health;
  } else if (ent.targetname && ent.message) {
    ent.touch = door_touch;
  }

  ent.moveinfo.speed = ent.speed;
  ent.moveinfo.accel = ent.accel;
  ent.moveinfo.decel = ent.decel;
  ent.moveinfo.wait = ent.wait;
  ent.moveinfo.start_origin = [...ent.pos1];
  ent.moveinfo.end_origin = [...ent.pos2];
  ent.moveinfo.start_angles = [...ent.angles];
  ent.moveinfo.end_angles = [...ent.angles];

  if (!ent.team) {
    ent.teammaster = ent;
  }

  ent.nextthink = runtime.time + FRAMETIME;
  ent.think = ent.health > 0 || Boolean(ent.targetname) ? Think_CalcMoveSpeed : Think_SpawnDoorTrigger;
}

/**
 * Original name: SP_func_door_rotating
 * Source: game/g_func.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Initializes one rotating brush door from BSP entity properties.
 *
 * Porting notes:
 * - Tracks angle endpoints and state transitions even though angular movement is still time-simulated.
 */
export function SP_func_door_rotating(ent: GameEntity, runtime: GameRuntime): void {
  ent.movetype = MOVETYPE_PUSH;
  ent.solid = SOLID_BSP;
  ent.use = door_use;

  if (!ent.speed) {
    ent.speed = 100;
  }
  if (!ent.accel) {
    ent.accel = ent.speed;
  }
  if (!ent.decel) {
    ent.decel = ent.speed;
  }
  if (!ent.wait) {
    ent.wait = 3;
  }
  if (!ent.dmg) {
    ent.dmg = 2;
  }

  const distance = parseDistance(ent.properties.distance, 90);
  ent.pos1 = [...ent.angles];

  if ((ent.spawnflags & DOOR_X_AXIS) !== 0) {
    ent.movedir = [0, 0, 1];
  } else if ((ent.spawnflags & DOOR_Y_AXIS) !== 0) {
    ent.movedir = [1, 0, 0];
  } else {
    ent.movedir = [0, 1, 0];
  }

  if ((ent.spawnflags & DOOR_REVERSE) !== 0) {
    ent.movedir = [-ent.movedir[0], -ent.movedir[1], -ent.movedir[2]];
  }

  ent.pos2 = [
    ent.angles[0] + ent.movedir[0] * distance,
    ent.angles[1] + ent.movedir[1] * distance,
    ent.angles[2] + ent.movedir[2] * distance
  ];
  ent.moveinfo.distance = distance;

  if ((ent.spawnflags & DOOR_START_OPEN) !== 0) {
    ent.angles = [...ent.pos2];
    ent.pos2 = [...ent.pos1];
    ent.pos1 = [...ent.angles];
    ent.movedir = [-ent.movedir[0], -ent.movedir[1], -ent.movedir[2]];
  }

  if (ent.health > 0) {
    ent.die = door_killed;
    ent.max_health = ent.health;
  } else if (ent.targetname && ent.message) {
    ent.touch = door_touch;
  }

  ent.moveinfo.state = STATE_BOTTOM;
  ent.moveinfo.speed = ent.speed;
  ent.moveinfo.accel = ent.accel;
  ent.moveinfo.decel = ent.decel;
  ent.moveinfo.wait = ent.wait;
  ent.moveinfo.start_origin = [...ent.origin];
  ent.moveinfo.end_origin = [...ent.origin];
  ent.moveinfo.start_angles = [...ent.pos1];
  ent.moveinfo.end_angles = [...ent.pos2];

  if (!ent.team) {
    ent.teammaster = ent;
  }

  ent.nextthink = runtime.time + FRAMETIME;
  ent.think = ent.health > 0 || Boolean(ent.targetname) ? Think_CalcMoveSpeed : Think_SpawnDoorTrigger;
}

/**
 * Original name: plat_hit_top
 * Source: game/g_func.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Marks one platform as fully raised and schedules the return trip after the original delay.
 */
export function plat_hit_top(self: GameEntity, runtime: GameRuntime): void {
  self.moveinfo.state = STATE_TOP;
  runtime.log({
    kind: "think",
    message: `${getRuntimeEntityLabel(self)} plat hit top`,
    entityIndex: self.index,
    entityClassname: self.classname
  });

  self.think = plat_go_down;
  self.nextthink = runtime.time + 3;
}

/**
 * Original name: plat_hit_bottom
 * Source: game/g_func.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Marks one platform as fully lowered.
 */
export function plat_hit_bottom(self: GameEntity, runtime: GameRuntime): void {
  self.moveinfo.state = STATE_BOTTOM;
  runtime.log({
    kind: "think",
    message: `${getRuntimeEntityLabel(self)} plat hit bottom`,
    entityIndex: self.index,
    entityClassname: self.classname
  });
}

/**
 * Original name: plat_go_down
 * Source: game/g_func.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Starts the lowering phase of one platform toward `moveinfo.end_origin`.
 */
export function plat_go_down(self: GameEntity, runtime: GameRuntime): void {
  self.moveinfo.state = STATE_DOWN;
  Move_Calc(self, self.moveinfo.end_origin, plat_hit_bottom, runtime);
}

/**
 * Original name: plat_go_up
 * Source: game/g_func.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Starts the raising phase of one platform toward `moveinfo.start_origin`.
 */
export function plat_go_up(self: GameEntity, runtime: GameRuntime): void {
  self.moveinfo.state = STATE_UP;
  Move_Calc(self, self.moveinfo.start_origin, plat_hit_top, runtime);
}

/**
 * Original name: plat_blocked
 * Source: game/g_func.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Reacts to a blocked platform by damaging or removing obstruction proxies and reversing the platform.
 *
 * Porting notes:
 * - Damage and explosion side effects are reduced to runtime logging plus entity freeing for non-player blockers.
 */
export function plat_blocked(self: GameEntity, other: GameEntity, runtime: GameRuntime): void {
  if ((other.svflags & SVF_MONSTER) === 0 && !other.client) {
    runtime.log({
      kind: "warning",
      message: `${getRuntimeEntityLabel(self)} plat blocked by non-client ${getRuntimeEntityLabel(other)}`,
      entityIndex: self.index,
      entityClassname: self.classname,
      otherIndex: other.index,
      otherClassname: other.classname
    });
    freeGameEntity(runtime, other);
    return;
  }

  runtime.log({
    kind: "warning",
    message: `${getRuntimeEntityLabel(self)} plat blocked by ${getRuntimeEntityLabel(other)}`,
    entityIndex: self.index,
    entityClassname: self.classname,
    otherIndex: other.index,
    otherClassname: other.classname
  });

  if (self.moveinfo.state === STATE_UP) {
    plat_go_down(self, runtime);
  } else if (self.moveinfo.state === STATE_DOWN) {
    plat_go_up(self, runtime);
  }
}

/**
 * Original name: Use_Plat
 * Source: game/g_func.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Lowers one targeted platform when externally activated.
 */
export function Use_Plat(self: GameEntity, _other: GameEntity | null, _activator: GameEntity | null, runtime: GameRuntime): void {
  if (self.think) {
    return;
  }

  plat_go_down(self, runtime);
}

/**
 * Original name: Touch_Plat_Center
 * Source: game/g_func.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Raises one platform when a living player touches its center trigger and delays descent while occupied.
 */
export function Touch_Plat_Center(self: GameEntity, other: GameEntity, runtime: GameRuntime): void {
  if (!other.client) {
    return;
  }

  if (other.health <= 0) {
    return;
  }

  const plat = self.enemy;
  if (!plat) {
    return;
  }

  if (plat.moveinfo.state === STATE_BOTTOM) {
    plat_go_up(plat, runtime);
  } else if (plat.moveinfo.state === STATE_TOP) {
    plat.nextthink = runtime.time + 1;
  }
}

/**
 * Original name: plat_spawn_inside_trigger
 * Source: game/g_func.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Spawns the internal center trigger used by platform lifts.
 */
export function plat_spawn_inside_trigger(ent: GameEntity, runtime: GameRuntime): void {
  const trigger = spawnGameEntity(runtime);
  trigger.classname = "plat_trigger";
  trigger.touch = Touch_Plat_Center;
  trigger.movetype = MOVETYPE_NONE;
  trigger.solid = SOLID_TRIGGER;
  trigger.enemy = ent;
  trigger.origin = [0, 0, 0];

  const lip = parseDistance(ent.properties.lip, 8);
  const mins: [number, number, number] = [
    ent.mins[0] + 25,
    ent.mins[1] + 25,
    ent.mins[2]
  ];
  const maxs: [number, number, number] = [
    ent.maxs[0] - 25,
    ent.maxs[1] - 25,
    ent.maxs[2] + 8
  ];

  mins[2] = maxs[2] - (ent.pos1[2] - ent.pos2[2] + lip);
  if ((ent.spawnflags & PLAT_LOW_TRIGGER) !== 0) {
    maxs[2] = mins[2] + 8;
  }

  if (maxs[0] - mins[0] <= 0) {
    mins[0] = (ent.mins[0] + ent.maxs[0]) * 0.5;
    maxs[0] = mins[0] + 1;
  }
  if (maxs[1] - mins[1] <= 0) {
    mins[1] = (ent.mins[1] + ent.maxs[1]) * 0.5;
    maxs[1] = mins[1] + 1;
  }

  trigger.mins = mins;
  trigger.maxs = maxs;
  trigger.size = [
    trigger.maxs[0] - trigger.mins[0],
    trigger.maxs[1] - trigger.mins[1],
    trigger.maxs[2] - trigger.mins[2]
  ];

  runtime.log({
    kind: "think",
    message: `${getRuntimeEntityLabel(ent)} spawned plat trigger #${trigger.index}`,
    entityIndex: ent.index,
    entityClassname: ent.classname,
    otherIndex: trigger.index,
    otherClassname: trigger.classname
  });
}

/**
 * Original name: SP_func_plat
 * Source: game/g_func.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Initializes one Quake II platform lift and its center trigger from BSP entity properties.
 *
 * Porting notes:
 * - Preserves the original top/bottom origin setup while still using timed arrival simulation until pusher physics lands.
 */
export function SP_func_plat(ent: GameEntity, runtime: GameRuntime): void {
  ent.angles = [0, 0, 0];
  ent.solid = SOLID_BSP;
  ent.movetype = MOVETYPE_PUSH;
  ent.blocked = plat_blocked;

  if (!ent.speed) {
    ent.speed = 20;
  } else {
    ent.speed *= 0.1;
  }

  if (!ent.accel) {
    ent.accel = 5;
  } else {
    ent.accel *= 0.1;
  }

  if (!ent.decel) {
    ent.decel = 5;
  } else {
    ent.decel *= 0.1;
  }

  if (!ent.dmg) {
    ent.dmg = 2;
  }

  const lip = parseDistance(ent.properties.lip, 8);
  const height = parseDistance(ent.properties.height, 0);

  ent.pos1 = [...ent.origin];
  ent.pos2 = [...ent.origin];
  if (height > 0) {
    ent.pos2[2] -= height;
  } else {
    ent.pos2[2] -= (ent.maxs[2] - ent.mins[2]) - lip;
  }

  ent.use = Use_Plat;
  plat_spawn_inside_trigger(ent, runtime);

  if (ent.targetname) {
    ent.moveinfo.state = STATE_UP;
  } else {
    ent.origin = [...ent.pos2];
    ent.moveinfo.state = STATE_BOTTOM;
  }

  ent.moveinfo.speed = ent.speed;
  ent.moveinfo.accel = ent.accel;
  ent.moveinfo.decel = ent.decel;
  ent.moveinfo.wait = ent.wait;
  ent.moveinfo.distance = Math.abs(ent.pos1[2] - ent.pos2[2]);
  ent.moveinfo.start_origin = [...ent.pos1];
  ent.moveinfo.start_angles = [...ent.angles];
  ent.moveinfo.end_origin = [...ent.pos2];
  ent.moveinfo.end_angles = [...ent.angles];
}

/**
 * Category: New
 * Purpose: Derive the linear translation distance of one door from its movedir and brush bounds.
 *
 * Constraints:
 * - Must keep the classic Quake lip subtraction behavior.
 */
function computeDoorDistance(entity: GameEntity): number {
  const lip = parseDistance(entity.properties.lip, 8);
  entity.movedir = parseDoorMovedir(entity.properties);

  const absMovedir = [Math.abs(entity.movedir[0]), Math.abs(entity.movedir[1]), Math.abs(entity.movedir[2])] as const;
  const distance = absMovedir[0] * entity.size[0] + absMovedir[1] * entity.size[1] + absMovedir[2] * entity.size[2] - lip;
  return distance > 0 ? distance : 64;
}

/**
 * Category: New
 * Purpose: Decode the first Quake-style movedir semantics used by translating doors.
 *
 * Constraints:
 * - Must support up/down sentinels and regular yaw angles.
 */
function parseDoorMovedir(properties: Record<string, string>): [number, number, number] {
  const angle = Number.parseFloat(properties.angle ?? "0");
  if (angle === -1) {
    return [0, 0, 1];
  }
  if (angle === -2) {
    return [0, 0, -1];
  }

  const radians = (Number.isFinite(angle) ? angle : 0) * (Math.PI / 180);
  return [Math.cos(radians), Math.sin(radians), 0];
}

/**
 * Category: New
 * Purpose: Parse one numeric distance-like key with a fallback.
 */
function parseDistance(value: string | undefined, fallback: number): number {
  const parsed = Number.parseFloat(value ?? "");
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * Category: New
 * Purpose: Reproduce the first door-trigger bounds expansion used by Quake II touch doors.
 *
 * Constraints:
 * - Must cover the full door team bounds.
 * - Must expand by 60 units on X/Y like the original `Think_SpawnDoorTrigger`.
 */
function computeDoorTriggerBounds(entity: GameEntity): { mins: [number, number, number]; maxs: [number, number, number] } {
  const bounds = getAbsoluteEntityBounds(entity);
  const mins: [number, number, number] = [...bounds.mins];
  const maxs: [number, number, number] = [...bounds.maxs];

  let member = entity.teamchain;
  while (member) {
    const memberBounds = getAbsoluteEntityBounds(member);
    mins[0] = Math.min(mins[0], memberBounds.mins[0]);
    mins[1] = Math.min(mins[1], memberBounds.mins[1]);
    mins[2] = Math.min(mins[2], memberBounds.mins[2]);
    maxs[0] = Math.max(maxs[0], memberBounds.maxs[0]);
    maxs[1] = Math.max(maxs[1], memberBounds.maxs[1]);
    maxs[2] = Math.max(maxs[2], memberBounds.maxs[2]);
    member = member.teamchain;
  }

  mins[0] -= 60;
  mins[1] -= 60;
  maxs[0] += 60;
  maxs[1] += 60;

  return { mins, maxs };
}

/**
 * Category: New
 * Purpose: Resolve absolute world bounds for one brush entity using inline-model bounds when available.
 */
function getAbsoluteEntityBounds(entity: GameEntity): { mins: [number, number, number]; maxs: [number, number, number] } {
  if (entity.model?.startsWith("*")) {
    return {
      mins: [...entity.mins],
      maxs: [...entity.maxs]
    };
  }

  return {
    mins: [
      entity.origin[0] + entity.mins[0],
      entity.origin[1] + entity.mins[1],
      entity.origin[2] + entity.mins[2]
    ],
    maxs: [
      entity.origin[0] + entity.maxs[0],
      entity.origin[1] + entity.maxs[1],
      entity.origin[2] + entity.maxs[2]
    ]
  };
}

/**
 * Category: New
 * Purpose: Iterate the linked members of one door team starting from the team master.
 *
 * Constraints:
 * - Must preserve the original teamchain order.
 */
function forEachDoorTeam(self: GameEntity, callback: (entity: GameEntity) => void): void {
  let entity: GameEntity | null = self;
  while (entity) {
    callback(entity);
    entity = entity.teamchain;
  }
}

/**
 * Category: New
 * Purpose: Compute the original Quake acceleration distance helper.
 */
function accelerationDistance(target: number, rate: number): number {
  return target * ((target / rate) + 1) * ACCELERATION_DISTANCE_SCALE;
}

/**
 * Category: New
 * Purpose: Normalize one vector in place and return its original length.
 */
function normalizeVec3(vector: [number, number, number]): number {
  const length = vec3Length(vector);
  if (length === 0) {
    vector[0] = 0;
    vector[1] = 0;
    vector[2] = 0;
    return 0;
  }

  vector[0] /= length;
  vector[1] /= length;
  vector[2] /= length;
  return length;
}

/**
 * Category: New
 * Purpose: Multiply one vector by a scalar without mutating the source.
 */
function scaleVec3(vector: [number, number, number], scalar: number): [number, number, number] {
  return [vector[0] * scalar, vector[1] * scalar, vector[2] * scalar];
}

/**
 * Category: New
 * Purpose: Subtract two vectors without mutating the inputs.
 */
function subtractVec3(left: [number, number, number], right: [number, number, number]): [number, number, number] {
  return [left[0] - right[0], left[1] - right[1], left[2] - right[2]];
}

/**
 * Category: New
 * Purpose: Compute one vector Euclidean length.
 */
function vec3Length(vector: [number, number, number]): number {
  return Math.hypot(vector[0], vector[1], vector[2]);
}

/**
 * Category: New
 * Purpose: Detect a zero vector for movement completion checks.
 */
function isZeroVec3(vector: [number, number, number]): boolean {
  return vector[0] === 0 && vector[1] === 0 && vector[2] === 0;
}
