/**
 * File: quake2-p-view.ts
 * Purpose: Verify the first `game/p_view.c` TypeScript attachment point.
 *
 * This file is not a direct source port.
 * It is a targeted verification harness for the currently ported end-of-frame player presentation helpers.
 *
 * Dependencies:
 * - packages/game/src/p_view.ts
 */

import { strict as assert } from "node:assert";

import {
  EF_COLOR_SHELL,
  EF_PENT,
  EF_POWERSCREEN,
  EF_QUAD,
  PMF_DUCKED,
  RDF_UNDERWATER,
  RF_SHELL_BLUE,
  RF_SHELL_GREEN,
  RF_SHELL_RED,
  YAW,
  entity_event_t
} from "../../packages/qcommon/src/index.js";
import { CONTENTS_LAVA, CONTENTS_WATER } from "../../packages/qcommon/src/q_shared.js";
import {
  ANIM_BASIC,
  FL_INWATER,
  FL_GODMODE,
  FL_POWER_ARMOR,
  MOD_FALLING,
  MOD_LAVA,
  MOD_SLIME,
  MOD_WATER,
  MOVETYPE_NOCLIP
} from "../../packages/game/src/g_local.js";
import { FRAME_crwalk1, FRAME_jump1, FRAME_run1 } from "../../packages/game/src/m_player.js";
import {
  ClientEndServerFrame,
  P_DamageFeedback,
  P_FallingDamage,
  P_WorldEffects,
  G_SetClientEffects,
  G_SetClientEvent,
  G_SetClientFrame,
  G_SetClientSound,
  SV_AddBlend,
  SV_CalcBlend,
  SV_CalcGunOffset,
  SV_CalcViewOffset,
  SV_CalcRoll,
  createPlayerViewFrameState
} from "../../packages/game/src/p_view.js";
import { FindItem } from "../../packages/game/src/g_items.js";
import { damage_t } from "../../packages/game/src/index.js";
import { attachGameClient, createGameRuntimeFromBspEntities } from "../../packages/game/src/runtime.js";

const runtime = createGameRuntimeFromBspEntities([{ properties: { classname: "worldspawn" } }]);
runtime.maxclients = 1;
runtime.collision ??= {
  world: {} as never,
  trace: () => ({
    allsolid: false,
    startsolid: false,
    fraction: 1,
    endpos: [0, 0, 0],
    plane: { normal: [0, 0, 1], dist: 0, type: 0, signbits: 0 },
    surface: null,
    contents: 0,
    ent: null
  }),
  pointcontents: () => 0
};

const ent = runtime.entities[0]!;
attachGameClient(ent);
ent.inuse = true;
ent.health = 100;
ent.takedamage = damage_t.DAMAGE_AIM;
ent.s.modelindex = 255;
ent.groundentity = ent;
ent.client!.v_angle = [0, 90, 0];
ent.client!.ps.viewangles = [0, 90, 0];
ent.velocity = [250, 0, 0];

const roll = SV_CalcRoll([0, 1, 0], [0, 100, 0], 2, 200);
assert.equal(roll, 1, "SV_CalcRoll mismatch");

const frame = createPlayerViewFrameState();
frame.forward = [1, 0, 0];
frame.right = [0, 1, 0];
frame.xyspeed = 300;
frame.bobmove = 0.25;
frame.bobcycle = 1;
ent.client!.bobtime = 1.8;
G_SetClientEvent(ent, frame);
assert.equal(ent.s.event, entity_event_t.EV_FOOTSTEP, "G_SetClientEvent must emit footstep");

ent.s.event = 0;
ent.flags |= FL_POWER_ARMOR | FL_GODMODE;
ent.powerarmor_time = 1;
const powerScreen = FindItem("Power Screen");
if (powerScreen) {
  ent.client!.pers.inventory[powerScreen.index] = 1;
}
runtime.time = 0;
ent.client!.quad_framenum = 100;
ent.client!.invincible_framenum = 100;
runtime.framenum = 50;
G_SetClientEffects(ent, runtime);
assert.ok((ent.s.effects & EF_POWERSCREEN) !== 0, "G_SetClientEffects powerscreen mismatch");
assert.ok((ent.s.effects & EF_QUAD) !== 0, "G_SetClientEffects quad mismatch");
assert.ok((ent.s.effects & EF_PENT) !== 0, "G_SetClientEffects pent mismatch");
assert.ok((ent.s.effects & EF_COLOR_SHELL) !== 0, "G_SetClientEffects shell mismatch");
assert.equal(
  ent.s.renderfx & (RF_SHELL_RED | RF_SHELL_GREEN | RF_SHELL_BLUE),
  RF_SHELL_RED | RF_SHELL_GREEN | RF_SHELL_BLUE,
  "G_SetClientEffects godmode shell mismatch"
);

ent.waterlevel = 1;
ent.watertype = CONTENTS_LAVA;
G_SetClientSound(ent, runtime);
assert.ok(ent.s.sound > 0, "G_SetClientSound lava sound mismatch");

ent.waterlevel = 0;
ent.watertype = 0;
ent.client!.pers.weapon = { classname: "weapon_railgun" } as never;
G_SetClientSound(ent, runtime);
assert.ok(ent.s.sound > 0, "G_SetClientSound railgun sound mismatch");

runtime.soundEvents.length = 0;
runtime.helpchanged = 1;
runtime.framenum = 64;
ent.client!.pers.game_helpchanged = 0;
ent.client!.pers.helpchanged = 0;
ent.client!.pers.weapon = null;
G_SetClientSound(ent, runtime);
assert.equal(ent.client!.pers.game_helpchanged, 1, "G_SetClientSound help sync mismatch");
assert.equal(ent.client!.pers.helpchanged, 2, "G_SetClientSound help counter mismatch");
assert.ok(runtime.soundEvents.some((event) => event.soundPath === "misc/pc_up.wav"), "G_SetClientSound help beep mismatch");

ent.client!.anim_priority = ANIM_BASIC;
ent.client!.ps.pmove.pm_flags = PMF_DUCKED;
frame.xyspeed = 200;
G_SetClientFrame(ent, frame);
assert.equal(ent.s.frame, FRAME_crwalk1, "G_SetClientFrame crouch-run mismatch");

ent.client!.ps.pmove.pm_flags = 0;
frame.xyspeed = 200;
G_SetClientFrame(ent, frame);
assert.equal(ent.s.frame, FRAME_run1, "G_SetClientFrame run mismatch");

ent.groundentity = null;
G_SetClientFrame(ent, frame);
assert.equal(ent.s.frame, FRAME_jump1, "G_SetClientFrame jump mismatch");

ent.groundentity = ent;
ent.flags &= ~FL_GODMODE;
ent.client!.invincible_framenum = 0;
ent.client!.damage_blood = 5;
ent.client!.damage_armor = 5;
ent.client!.damage_parmor = 10;
ent.client!.damage_knockback = 20;
ent.client!.damage_from = [0, 10, 0];
ent.client!.damage_alpha = 0;
ent.client!.anim_priority = ANIM_BASIC;
runtime.time = 1;
runtime.framenum = 10;
P_DamageFeedback(ent, runtime, frame);
assert.equal(ent.client!.ps.stats[15], 3, "P_DamageFeedback flash flags mismatch");
assert.ok(ent.client!.damage_alpha >= 0.2, "P_DamageFeedback alpha mismatch");
assert.deepEqual(ent.client!.damage_blend, [0.5, 0.75, 0.25], "P_DamageFeedback blend mismatch");
assert.equal(ent.client!.damage_blood, 0, "P_DamageFeedback blood reset mismatch");
assert.equal(ent.client!.damage_armor, 0, "P_DamageFeedback armor reset mismatch");
assert.equal(ent.client!.damage_parmor, 0, "P_DamageFeedback parmor reset mismatch");
assert.equal(ent.client!.damage_knockback, 0, "P_DamageFeedback knockback reset mismatch");

ent.client!.ps.viewangles = [10, 20, 0];
ent.client!.oldviewangles = [20, 5, 0];
ent.client!.kick_origin = [1, 2, 3];
ent.client!.kick_angles = [4, 5, 6];
ent.client!.v_dmg_pitch = 6;
ent.client!.v_dmg_roll = -4;
ent.client!.v_dmg_time = runtime.time + 0.5;
ent.client!.fall_time = runtime.time + 0.3;
ent.client!.fall_value = 8;
ent.viewheight = 22;
frame.up = [0, 0, 1];
frame.xyspeed = 200;
frame.bobfracsin = 1;
frame.bobcycle = 1;
SV_CalcViewOffset(ent, runtime, frame);
assert.ok(ent.client!.ps.viewoffset[2] > 20, "SV_CalcViewOffset viewheight mismatch");
assert.ok(ent.client!.ps.kick_angles[0] !== 0, "SV_CalcViewOffset kick pitch mismatch");

SV_CalcGunOffset(ent, frame, { gun_x: 2, gun_y: 3, gun_z: 4 });
assert.ok(ent.client!.ps.gunangles[0] !== 0, "SV_CalcGunOffset pitch mismatch");
assert.deepEqual(ent.client!.ps.gunoffset, [3, 2, -4], "SV_CalcGunOffset offset mismatch");

ent.client!.ps.blend = [0, 0, 0, 0];
SV_AddBlend(1, 0, 0, 0.5, ent.client!.ps.blend);
SV_AddBlend(0, 0, 1, 0.25, ent.client!.ps.blend);
assert.ok(ent.client!.ps.blend[3] > 0.5, "SV_AddBlend alpha accumulation mismatch");

runtime.collision!.pointcontents = () => CONTENTS_WATER;
runtime.soundEvents.length = 0;
ent.client!.quad_framenum = runtime.framenum + 30;
SV_CalcBlend(ent, runtime);
assert.ok((ent.client!.ps.rdflags & RDF_UNDERWATER) !== 0, "SV_CalcBlend underwater flag mismatch");
assert.ok(ent.client!.ps.blend[3] > 0, "SV_CalcBlend alpha mismatch");
assert.ok(runtime.soundEvents.some((event) => event.soundPath === "items/damage2.wav"), "SV_CalcBlend fade sound mismatch");

ent.s.event = 0;
ent.health = 100;
ent.groundentity = ent;
ent.client!.oldvelocity = [0, 0, -600];
ent.velocity = [0, 0, 0];
ent.waterlevel = 0;
runtime.time = 2;
runtime.meansOfDeath = 0;
P_FallingDamage(ent, runtime);
assert.equal(ent.s.event, entity_event_t.EV_FALL, "P_FallingDamage event mismatch");
assert.equal(runtime.meansOfDeath, MOD_FALLING, "P_FallingDamage mod mismatch");
assert.ok(ent.client!.fall_time > runtime.time, "P_FallingDamage fall_time mismatch");

runtime.soundEvents.length = 0;
ent.movetype = MOVETYPE_NOCLIP;
ent.air_finished = 0;
P_WorldEffects(ent, runtime);
assert.equal(ent.air_finished, runtime.time + 12, "P_WorldEffects noclip air mismatch");

ent.movetype = 0;
ent.flags &= ~FL_INWATER;
ent.waterlevel = 1;
ent.watertype = CONTENTS_WATER;
ent.client!.old_waterlevel = 0;
P_WorldEffects(ent, runtime);
assert.ok((ent.flags & FL_INWATER) !== 0, "P_WorldEffects enter water flag mismatch");
assert.ok(runtime.soundEvents.some((event) => event.soundPath === "player/watr_in.wav"), "P_WorldEffects enter water sound mismatch");

runtime.soundEvents.length = 0;
ent.watertype = CONTENTS_LAVA;
ent.waterlevel = 1;
ent.client!.enviro_framenum = 0;
ent.client!.invincible_framenum = 0;
ent.pain_debounce_time = 0;
runtime.framenum = 20;
P_WorldEffects(ent, runtime);
assert.equal(runtime.meansOfDeath, MOD_LAVA, "P_WorldEffects lava mod mismatch");

runtime.soundEvents.length = 0;
ent.watertype = CONTENTS_WATER;
ent.waterlevel = 0;
ent.client!.old_waterlevel = 1;
P_WorldEffects(ent, runtime);
assert.ok((ent.flags & FL_INWATER) === 0, "P_WorldEffects exit water flag mismatch");
assert.ok(runtime.soundEvents.some((event) => event.soundPath === "player/watr_out.wav"), "P_WorldEffects exit water sound mismatch");

runtime.soundEvents.length = 0;
ent.health = 20;
ent.dmg = 2;
ent.waterlevel = 3;
ent.watertype = CONTENTS_WATER;
ent.air_finished = runtime.time - 1;
ent.client!.old_waterlevel = 3;
ent.client!.next_drown_time = 0;
runtime.framenum = 21;
P_WorldEffects(ent, runtime);
assert.equal(runtime.meansOfDeath, MOD_WATER, "P_WorldEffects drown mod mismatch");
assert.ok(runtime.soundEvents.some((event) => event.soundPath.startsWith("*gurp") || event.soundPath === "player/drown1.wav"), "P_WorldEffects drown sound mismatch");

ent.client!.kick_origin = [1, 2, 3];
ent.client!.kick_angles = [4, 5, 6];
ent.client!.resp.spectator = false;
ent.client!.pers.selected_item = -1;
ent.client!.damage_blood = 3;
ent.client!.damage_from = [10, 0, 0];
ent.client!.damage_knockback = 12;
ent.velocity = [250, 0, 0];
runtime.collision!.pointcontents = () => 0;
ClientEndServerFrame(ent, runtime);
assert.equal(ent.s.angles[YAW], 90, "ClientEndServerFrame yaw mismatch");
assert.deepEqual(ent.client!.kick_origin, [0, 0, 0], "ClientEndServerFrame kick_origin reset mismatch");
assert.deepEqual(ent.client!.kick_angles, [0, 0, 0], "ClientEndServerFrame kick_angles reset mismatch");
assert.ok(ent.client!.ps.viewoffset[2] !== 0, "ClientEndServerFrame viewoffset mismatch");
assert.ok(ent.client!.ps.gunangles[0] !== 0, "ClientEndServerFrame gunangles mismatch");

console.log("quake2-p-view: ok");
