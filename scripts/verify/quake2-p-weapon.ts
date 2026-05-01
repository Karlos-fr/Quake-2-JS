/**
 * File: quake2-p-weapon.ts
 * Purpose: Verify the player-weapon gameplay path ported from `game/p_weapon.c`.
 *
 * This file is not a direct source port.
 * It is a focused verification harness for the `p_weapon.ts` runtime behavior.
 *
 * Dependencies:
 * - packages/game
 */

import {
  ChangeWeapon,
  DEFAULT_BULLET_HSPREAD,
  DEFAULT_BULLET_VSPREAD,
  FindItem,
  MOD_CHAINGUN,
  MOD_MACHINEGUN,
  Think_Weapon,
  Weapon_Chaingun,
  Weapon_Machinegun,
  attachGameClient,
  createGameRuntimeFromBspEntities,
  drainGameSoundEvents,
  drainPlayerMuzzleFlashEvents,
  spawnGameEntity,
  weaponstate_t,
  type GameEntity,
  type GameRuntime
} from "../../packages/game/src/index.js";
import { BUTTON_ATTACK, CHAN_VOICE, DF_INFINITE_AMMO, MZ_CHAINGUN2, MZ_CHAINGUN3, MZ_MACHINEGUN } from "../../packages/qcommon/src/index.js";

main();

function main(): void {
  verifyThinkWeaponDispatchesWithoutOverrideHooks();
  verifyNoAmmoQueuesOneShotSound();
  verifyMachinegunFireParity();
  verifyMachinegunNoAmmoUsesVoiceChannel();
  verifyChaingunFireParity();

  console.log("Verification p_weapon - player weapon gameplay OK");
}

function verifyThinkWeaponDispatchesWithoutOverrideHooks(): void {
  const runtime = createHarnessRuntime();
  const player = createPlayer(runtime);
  const blaster = requireItem("Blaster");

  player.s.modelindex = 255;
  player.client!.pers.weapon = blaster;
  player.client!.weaponstate = weaponstate_t.WEAPON_READY;
  player.client!.buttons = BUTTON_ATTACK;
  player.client!.quad_framenum = runtime.framenum + 1;

  Think_Weapon(player, runtime);

  assertBoolean(runtime.entities.some((entity) => entity.classname === "bolt"), true, "Think_Weapon should spawn one blaster bolt");

  const flashes = drainPlayerMuzzleFlashEvents(runtime);
  assertBoolean(flashes.length > 0, true, "Think_Weapon should queue one player muzzleflash");

  const sounds = drainGameSoundEvents(runtime);
  assertBoolean(
    sounds.some((event) => event.soundPath === "items/damage3.wav"),
    true,
    "Think_Weapon should queue quad damage sound through the runtime sound queue"
  );
}

function verifyNoAmmoQueuesOneShotSound(): void {
  const runtime = createHarnessRuntime();
  const player = createPlayer(runtime);
  const shotgun = requireItem("Shotgun");
  const shells = requireItem("Shells");

  player.s.modelindex = 255;
  player.client!.pers.weapon = shotgun;
  player.client!.ammo_index = shells.index;
  player.client!.weaponstate = weaponstate_t.WEAPON_READY;
  player.client!.buttons = BUTTON_ATTACK;
  player.client!.pers.inventory[shells.index] = 0;

  Think_Weapon(player, runtime);

  const sounds = drainGameSoundEvents(runtime);
  assertBoolean(
    sounds.some((event) => event.soundPath === "weapons/noammo.wav"),
    true,
    "Think_Weapon should queue no-ammo sound instead of only registering it"
  );

  assertString(player.client!.newweapon?.pickupName ?? "", "Blaster", "NoAmmoWeaponChange should still select Blaster fallback");
}

function verifyMachinegunFireParity(): void {
  const runtime = createHarnessRuntime();
  const player = createPlayer(runtime);
  const machinegun = requireItem("Machinegun");
  const bullets = requireItem("Bullets");
  const shots: Array<{ damage: number; kick: number; hspread: number; vspread: number; mod: number }> = [];
  const flashes: number[] = [];

  player.s.modelindex = 255;
  player.client!.pers.weapon = machinegun;
  player.client!.ammo_index = bullets.index;
  player.client!.pers.inventory[machinegun.index] = 1;
  player.client!.weaponstate = weaponstate_t.WEAPON_FIRING;
  player.client!.ps.gunframe = 4;
  player.client!.buttons = BUTTON_ATTACK;
  player.client!.quad_framenum = runtime.framenum + 1;
  player.client!.pers.inventory[bullets.index] = 3;

  Weapon_Machinegun(player, runtime, {
    fire_bullet: (_ent, _start, _aimdir, damage, kick, hspread, vspread, mod) => {
      shots.push({ damage, kick, hspread, vspread, mod });
    },
    emitPlayerMuzzleFlash: (_ent, weapon) => {
      flashes.push(weapon);
    }
  });

  assertNumber(shots.length, 1, "Weapon_Machinegun should fire one bullet on frame 4");
  assertNumber(shots[0].damage, 32, "Machinegun quad damage should match C");
  assertNumber(shots[0].kick, 8, "Machinegun quad kick should match C");
  assertNumber(shots[0].hspread, DEFAULT_BULLET_HSPREAD, "Machinegun horizontal spread should match C");
  assertNumber(shots[0].vspread, DEFAULT_BULLET_VSPREAD, "Machinegun vertical spread should match C");
  assertNumber(shots[0].mod, MOD_MACHINEGUN, "Machinegun means-of-death should match C");
  assertNumber(flashes[0], MZ_MACHINEGUN, "Machinegun should emit MZ_MACHINEGUN");
  assertNumber(player.client!.ps.gunframe, 5, "Machinegun firing should toggle gunframe 4 to 5");
  assertNumber(player.client!.machinegun_shots, 1, "Machinegun should accumulate recoil shots outside deathmatch");
  assertNumber(player.client!.pers.inventory[bullets.index], 2, "Machinegun should consume one bullet");

  runtime.dmflags |= DF_INFINITE_AMMO;
  Weapon_Machinegun(player, runtime, {
    fire_bullet: (_ent, _start, _aimdir, damage, kick, hspread, vspread, mod) => {
      shots.push({ damage, kick, hspread, vspread, mod });
    },
    emitPlayerMuzzleFlash: (_ent, weapon) => {
      flashes.push(weapon);
    }
  });

  assertNumber(player.client!.ps.gunframe, 4, "Machinegun firing should toggle gunframe 5 to 4");
  assertNumber(player.client!.pers.inventory[bullets.index], 2, "DF_INFINITE_AMMO should prevent bullet consumption");

  player.client!.buttons = 0;
  player.client!.machinegun_shots = 4;
  Weapon_Machinegun(player, runtime);
  assertNumber(player.client!.machinegun_shots, 0, "Releasing attack should reset machinegun_shots");
  assertNumber(player.client!.ps.gunframe, 5, "Releasing attack should advance gunframe");
}

function verifyMachinegunNoAmmoUsesVoiceChannel(): void {
  const runtime = createHarnessRuntime();
  const player = createPlayer(runtime);
  const machinegun = requireItem("Machinegun");
  const bullets = requireItem("Bullets");
  const sounds: Array<{ soundPath: string; channel: number }> = [];

  player.s.modelindex = 255;
  player.client!.pers.weapon = machinegun;
  player.client!.ammo_index = bullets.index;
  player.client!.pers.inventory[machinegun.index] = 1;
  player.client!.weaponstate = weaponstate_t.WEAPON_READY;
  player.client!.buttons = BUTTON_ATTACK;
  player.client!.pers.inventory[bullets.index] = 0;

  Weapon_Machinegun(player, runtime, {
    playWeaponSound: (_ent, soundPath, channel) => {
      sounds.push({ soundPath, channel });
    }
  });

  assertString(sounds[0]?.soundPath ?? "", "weapons/noammo.wav", "Machinegun no-ammo path should play the original sound");
  assertNumber(sounds[0]?.channel ?? -1, CHAN_VOICE, "Machinegun no-ammo path should use CHAN_VOICE");
  assertString(player.client!.newweapon?.pickupName ?? "", "Shotgun", "Machinegun no-ammo should select the next available weapon");
}

function verifyChaingunFireParity(): void {
  const runtime = createHarnessRuntime();
  const player = createPlayer(runtime);
  const chaingun = requireItem("Chaingun");
  const bullets = requireItem("Bullets");
  const shots: Array<{ damage: number; kick: number; hspread: number; vspread: number; mod: number }> = [];
  const flashes: number[] = [];

  player.s.modelindex = 255;
  player.client!.pers.weapon = chaingun;
  player.client!.ammo_index = bullets.index;
  player.client!.pers.inventory[chaingun.index] = 1;
  player.client!.weaponstate = weaponstate_t.WEAPON_FIRING;
  player.client!.ps.gunframe = 9;
  player.client!.buttons = BUTTON_ATTACK;
  player.client!.quad_framenum = runtime.framenum + 1;
  player.client!.pers.inventory[bullets.index] = 5;

  Weapon_Chaingun(player, runtime, {
    fire_bullet: (_ent, _start, _aimdir, damage, kick, hspread, vspread, mod) => {
      shots.push({ damage, kick, hspread, vspread, mod });
    },
    emitPlayerMuzzleFlash: (_ent, weapon) => {
      flashes.push(weapon);
    }
  });

  assertNumber(shots.length, 2, "Weapon_Chaingun should fire two bullets after windup frame 9");
  assertNumber(shots[0].damage, 32, "Chaingun quad damage should match C");
  assertNumber(shots[0].kick, 8, "Chaingun quad kick should match C");
  assertNumber(shots[0].hspread, DEFAULT_BULLET_HSPREAD, "Chaingun horizontal spread should match C");
  assertNumber(shots[0].vspread, DEFAULT_BULLET_VSPREAD, "Chaingun vertical spread should match C");
  assertNumber(shots[0].mod, MOD_CHAINGUN, "Chaingun means-of-death should match C");
  assertNumber(flashes[0], MZ_CHAINGUN2, "Chaingun should emit MZ_CHAINGUN2 for two shots");
  assertNumber(player.client!.ps.gunframe, 10, "Chaingun firing should advance gunframe 9 to 10");
  assertNumber(player.client!.pers.inventory[bullets.index], 3, "Chaingun should consume two bullets");

  runtime.deathmatch = true;
  player.client!.quad_framenum = 0;
  player.client!.ps.gunframe = 20;
  player.client!.pers.inventory[bullets.index] = 5;
  shots.length = 0;
  flashes.length = 0;

  Weapon_Chaingun(player, runtime, {
    fire_bullet: (_ent, _start, _aimdir, damage, kick, hspread, vspread, mod) => {
      shots.push({ damage, kick, hspread, vspread, mod });
    },
    emitPlayerMuzzleFlash: (_ent, weapon) => {
      flashes.push(weapon);
    }
  });

  assertNumber(shots.length, 3, "Weapon_Chaingun should fire three bullets at full spin");
  assertNumber(shots[0].damage, 6, "Chaingun deathmatch damage should match C");
  assertNumber(flashes[0], MZ_CHAINGUN3, "Chaingun should emit MZ_CHAINGUN3 for three shots");
  assertNumber(player.client!.pers.inventory[bullets.index], 2, "Chaingun should consume three bullets");

  player.client!.ps.gunframe = 14;
  player.client!.buttons = 0;
  player.client!.weapon_sound = 123;
  shots.length = 0;
  flashes.length = 0;

  Weapon_Chaingun(player, runtime, {
    fire_bullet: (_ent, _start, _aimdir, damage, kick, hspread, vspread, mod) => {
      shots.push({ damage, kick, hspread, vspread, mod });
    },
    emitPlayerMuzzleFlash: (_ent, weapon) => {
      flashes.push(weapon);
    }
  });

  assertNumber(player.client!.ps.gunframe, 32, "Chaingun should jump to wind-down frame 32 when attack is released at frame 14");
  assertNumber(player.client!.weapon_sound, 0, "Chaingun wind-down branch should clear looping weapon sound");
  assertNumber(shots.length, 0, "Chaingun wind-down branch should not fire bullets");
  assertNumber(flashes.length, 0, "Chaingun wind-down branch should not emit a muzzleflash");
}

function createHarnessRuntime(): GameRuntime {
  return createGameRuntimeFromBspEntities([{ properties: { classname: "worldspawn" } }]);
}

function createPlayer(runtime: GameRuntime): GameEntity {
  const player = spawnGameEntity(runtime);
  player.classname = "player";
  player.health = 100;
  player.max_health = 100;
  player.viewheight = 22;
  const client = attachGameClient(player);
  client.ps.gunframe = 0;
  client.weaponstate = weaponstate_t.WEAPON_READY;
  client.buttons = 0;
  client.latched_buttons = 0;

  const blaster = requireItem("Blaster");
  const shells = requireItem("Shells");
  const shotgun = requireItem("Shotgun");
  const bullets = requireItem("Bullets");

  client.pers.weapon = blaster;
  client.pers.inventory[blaster.index] = 1;
  client.pers.inventory[shotgun.index] = 1;
  client.pers.inventory[shells.index] = 10;
  client.pers.inventory[bullets.index] = 50;

  return player;
}

function requireItem(name: string) {
  const item = FindItem(name);
  if (!item) {
    throw new Error(`Item introuvable: ${name}`);
  }
  return item;
}

function assertBoolean(actual: boolean, expected: boolean, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: attendu ${expected}, recu ${actual}`);
  }
}

function assertString(actual: string, expected: string, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: attendu ${expected}, recu ${actual}`);
  }
}

function assertNumber(actual: number, expected: number, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: attendu ${expected}, recu ${actual}`);
  }
}
