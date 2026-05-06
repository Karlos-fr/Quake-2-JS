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
  CENTER_HANDED,
  DEFAULT_BULLET_HSPREAD,
  DEFAULT_BULLET_VSPREAD,
  Drop_Weapon,
  FindItem,
  LEFT_HANDED,
  MOD_CHAINGUN,
  MOD_MACHINEGUN,
  ANIM_ATTACK,
  ANIM_REVERSE,
  DEAD_DYING,
  P_ProjectSource,
  PNOISE_IMPACT,
  PNOISE_SELF,
  PNOISE_WEAPON,
  Pickup_Weapon,
  PlayerNoise,
  Think_Weapon,
  Use_Weapon,
  Weapon_Chaingun,
  Weapon_Grenade,
  Weapon_GrenadeLauncher,
  Weapon_BFG,
  Weapon_HyperBlaster,
  Weapon_Machinegun,
  Weapon_Railgun,
  Weapon_RocketLauncher,
  attachGameClient,
  createGameRuntimeFromBspEntities,
  drainGameSoundEvents,
  drainPlayerMuzzleFlashEvents,
  playerFrames,
  spawnGameEntity,
  weapon_grenade_fire,
  weaponstate_t,
  type GameEntity,
  type GameRuntime
} from "../../packages/game/src/index.js";
import { BUTTON_ATTACK, CHAN_AUTO, CHAN_VOICE, CHAN_WEAPON, DF_INFINITE_AMMO, DF_WEAPONS_STAY, EF_HYPERBLASTER, MZ_BFG, MZ_BLASTER, MZ_CHAINGUN2, MZ_CHAINGUN3, MZ_GRENADE, MZ_HYPERBLASTER, MZ_MACHINEGUN, MZ_RAILGUN, MZ_ROCKET, MZ_SILENCED, PMF_DUCKED } from "../../packages/qcommon/src/index.js";

main();

function main(): void {
  verifyProjectSourceHandedness();
  verifyPickupUseDropAndChangeWeapon();
  verifyThinkWeaponDispatchesWithoutOverrideHooks();
  verifyNoAmmoQueuesOneShotSound();
  verifyPlayerNoiseTypes();
  verifySilencedMuzzleFlashBit();
  verifyMachinegunFireParity();
  verifyMachinegunNoAmmoUsesVoiceChannel();
  verifyChaingunFireParity();
  verifyGrenadeLauncherFireParity();
  verifyRocketLauncherFireParity();
  verifyHyperBlasterFireParity();
  verifyRailgunFireParity();
  verifyBfgFireParity();
  verifyHandGrenadeFireDirectParity();
  verifyHandGrenadeParity();

  console.log("Verification p_weapon - player weapon gameplay OK");
}

function verifyProjectSourceHandedness(): void {
  const runtime = createHarnessRuntime();
  const player = createPlayer(runtime);
  const client = player.client!;
  const point: [number, number, number] = [10, 20, 30];
  const distance: [number, number, number] = [4, 6, 8];
  const forward: [number, number, number] = [1, 0, 0];
  const right: [number, number, number] = [0, 1, 0];

  client.pers.hand = 0;
  assertVec3(P_ProjectSource(client, point, distance, forward, right), [14, 26, 38], "right-handed P_ProjectSource");

  client.pers.hand = LEFT_HANDED;
  assertVec3(P_ProjectSource(client, point, distance, forward, right), [14, 14, 38], "left-handed P_ProjectSource");

  client.pers.hand = CENTER_HANDED;
  assertVec3(P_ProjectSource(client, point, distance, forward, right), [14, 20, 38], "center-handed P_ProjectSource");
}

function verifyPickupUseDropAndChangeWeapon(): void {
  const runtime = createHarnessRuntime();
  const player = createPlayer(runtime);
  const droppedEntity = spawnGameEntity(runtime);
  const shotgun = requireItem("Shotgun");
  const machinegun = requireItem("Machinegun");
  const shells = requireItem("Shells");
  const bullets = requireItem("Bullets");
  const client = player.client!;
  const dropped: GameEntity[] = [];

  droppedEntity.item = shotgun;
  client.pers.inventory[shotgun.index] = 0;
  client.pers.inventory[shells.index] = 0;
  client.pers.max_shells = 100;
  client.pers.weapon = requireItem("Blaster");

  assertBoolean(Pickup_Weapon(droppedEntity, player, shotgun, runtime), true, "Pickup_Weapon should accept a new shotgun");
  assertNumber(client.pers.inventory[shotgun.index], 1, "Pickup_Weapon should increment weapon inventory");
  assertNumber(client.pers.inventory[shells.index], shells.quantity, "Pickup_Weapon should grant default ammo");
  assertString(client.newweapon?.pickupName ?? "", "Shotgun", "Pickup_Weapon should auto-select first non-blaster weapon");

  client.pers.weapon = shotgun;
  client.pers.inventory[machinegun.index] = 1;
  client.pers.inventory[bullets.index] = 0;
  Use_Weapon(player, machinegun, runtime);
  assertString(client.newweapon?.pickupName ?? "", "Shotgun", "Use_Weapon should reject weapon without ammo");

  client.pers.inventory[bullets.index] = machinegun.quantity;
  Use_Weapon(player, machinegun, runtime);
  assertString(client.newweapon?.pickupName ?? "", "Machinegun", "Use_Weapon should accept weapon with ammo");

  ChangeWeapon(player, runtime);
  assertString(client.pers.weapon?.pickupName ?? "", "Machinegun", "ChangeWeapon should promote newweapon to current weapon");
  assertNumber(client.ammo_index, bullets.index, "ChangeWeapon should update ammo_index");
  assertBoolean(client.ps.gunindex > 0, true, "ChangeWeapon should register the view model");

  client.pers.inventory[machinegun.index] = 1;
  Drop_Weapon(player, machinegun, runtime, {
    Drop_Item: (_ent, item) => {
      const droppedItem = spawnGameEntity(runtime);
      droppedItem.item = item;
      dropped.push(droppedItem);
      return droppedItem;
    }
  });
  assertNumber(dropped.length, 0, "Drop_Weapon should reject dropping the only current weapon");

  client.pers.inventory[machinegun.index] = 2;
  Drop_Weapon(player, machinegun, runtime, {
    Drop_Item: (_ent, item) => {
      const droppedItem = spawnGameEntity(runtime);
      droppedItem.item = item;
      dropped.push(droppedItem);
      return droppedItem;
    }
  });
  assertNumber(dropped.length, 1, "Drop_Weapon should call Drop_Item when allowed");
  assertNumber(client.pers.inventory[machinegun.index], 1, "Drop_Weapon should decrement inventory after dropping");

  runtime.dmflags |= DF_WEAPONS_STAY;
  client.pers.inventory[machinegun.index] = 2;
  Drop_Weapon(player, machinegun, runtime, {
    Drop_Item: () => {
      throw new Error("Drop_Weapon must not drop when DF_WEAPONS_STAY is set");
    }
  });
  assertNumber(client.pers.inventory[machinegun.index], 2, "Drop_Weapon should leave inventory untouched with DF_WEAPONS_STAY");
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

function verifyPlayerNoiseTypes(): void {
  const runtime = createHarnessRuntime();
  const player = createPlayer(runtime);

  player.client!.silencer_shots = 1;
  PlayerNoise(player, [4, 5, 6], PNOISE_WEAPON, runtime);
  assertNumber(player.client!.silencer_shots, 0, "PNOISE_WEAPON should consume one silencer shot");
  assertBoolean(player.mynoise === null, true, "Silenced PNOISE_WEAPON should not create a noise entity");

  PlayerNoise(player, [1, 2, 3], PNOISE_SELF, runtime);
  assertBoolean(runtime.sound_entity === player.mynoise, true, "PNOISE_SELF should update primary sound entity");
  assertNumber(runtime.sound_entity_framenum, runtime.framenum, "PNOISE_SELF should stamp current framenum");
  assertNumber(player.mynoise!.s.origin[0], 1, "PNOISE_SELF should copy origin");

  PlayerNoise(player, [7, 8, 9], PNOISE_IMPACT, runtime);
  assertBoolean(runtime.sound2_entity === player.mynoise2, true, "PNOISE_IMPACT should update secondary sound entity");
  assertNumber(runtime.sound2_entity_framenum, runtime.framenum, "PNOISE_IMPACT should stamp current framenum");
  assertNumber(player.mynoise2!.s.origin[0], 7, "PNOISE_IMPACT should copy origin");

  runtime.deathmatch = true;
  PlayerNoise(player, [10, 11, 12], PNOISE_SELF, runtime);
  assertNumber(player.mynoise!.s.origin[0], 1, "Deathmatch PlayerNoise should return without updating noise");
}

function verifySilencedMuzzleFlashBit(): void {
  const runtime = createHarnessRuntime();
  const player = createPlayer(runtime);
  const blaster = requireItem("Blaster");

  player.s.modelindex = 255;
  player.client!.pers.weapon = blaster;
  player.client!.weaponstate = weaponstate_t.WEAPON_READY;
  player.client!.buttons = BUTTON_ATTACK;
  player.client!.silencer_shots = 2;

  Think_Weapon(player, runtime);

  const flashes = drainPlayerMuzzleFlashEvents(runtime);
  assertNumber(flashes[0]?.weapon ?? 0, MZ_BLASTER | MZ_SILENCED, "silenced blaster should preserve MZ_SILENCED bit");
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

  withMathRandom([0.5, 0.5, 0.5, 0.5, 0.5, 0.5], () => {
    Weapon_Machinegun(player, runtime, {
      fire_bullet: (_ent, _start, _aimdir, damage, kick, hspread, vspread, mod) => {
        shots.push({ damage, kick, hspread, vspread, mod });
      },
      emitPlayerMuzzleFlash: (_ent, weapon) => {
        flashes.push(weapon);
      }
    });
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
  assertNumber(player.client!.kick_origin[1], cCrandom(0.5) * 0.35, "Machinegun side kick origin should use g_local.crandom");
  assertNumber(player.client!.kick_angles[1], cCrandom(0.5) * 0.7, "Machinegun side kick angle should use g_local.crandom");
  assertNumber(player.client!.kick_origin[0], cCrandom(0.5) * 0.35, "Machinegun forward kick origin should use g_local.crandom");
  assertNumber(player.s.frame, 46, "Machinegun attack frame should use g_local.random for original frame expression");

  runtime.dmflags |= DF_INFINITE_AMMO;
  withMathRandom([0.5, 0.5, 0.5, 0.5, 0.5, 0.5], () => {
    Weapon_Machinegun(player, runtime, {
      fire_bullet: (_ent, _start, _aimdir, damage, kick, hspread, vspread, mod) => {
        shots.push({ damage, kick, hspread, vspread, mod });
      },
      emitPlayerMuzzleFlash: (_ent, weapon) => {
        flashes.push(weapon);
      }
    });
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

  withMathRandom(Array(10).fill(0.5), () => {
    Weapon_Chaingun(player, runtime, {
      fire_bullet: (_ent, _start, _aimdir, damage, kick, hspread, vspread, mod) => {
        shots.push({ damage, kick, hspread, vspread, mod });
      },
      emitPlayerMuzzleFlash: (_ent, weapon) => {
        flashes.push(weapon);
      }
    });
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
  assertNumber(player.client!.kick_origin[0], cCrandom(0.5) * 0.35, "Chaingun kick origin should use g_local.crandom");
  assertNumber(player.client!.kick_angles[0], cCrandom(0.5) * 0.7, "Chaingun kick angle should use g_local.crandom");

  runtime.deathmatch = true;
  player.client!.quad_framenum = 0;
  player.client!.ps.gunframe = 20;
  player.client!.pers.inventory[bullets.index] = 5;
  shots.length = 0;
  flashes.length = 0;

  withMathRandom(Array(12).fill(0.5), () => {
    Weapon_Chaingun(player, runtime, {
      fire_bullet: (_ent, _start, _aimdir, damage, kick, hspread, vspread, mod) => {
        shots.push({ damage, kick, hspread, vspread, mod });
      },
      emitPlayerMuzzleFlash: (_ent, weapon) => {
        flashes.push(weapon);
      }
    });
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

function verifyRocketLauncherFireParity(): void {
  const runtime = createHarnessRuntime();
  const player = createPlayer(runtime);
  const rocketLauncher = requireItem("Rocket Launcher");
  const rockets = requireItem("Rockets");
  const shots: Array<{ damage: number; speed: number; damageRadius: number; radiusDamage: number }> = [];
  const flashes: number[] = [];

  player.s.modelindex = 255;
  player.client!.pers.weapon = rocketLauncher;
  player.client!.ammo_index = rockets.index;
  player.client!.pers.inventory[rocketLauncher.index] = 1;
  player.client!.weaponstate = weaponstate_t.WEAPON_FIRING;
  player.client!.ps.gunframe = 5;
  player.client!.buttons = BUTTON_ATTACK;
  player.client!.quad_framenum = runtime.framenum + 1;
  player.client!.pers.inventory[rockets.index] = 3;

  withMathRandom([0.5], () => {
    Weapon_RocketLauncher(player, runtime, {
      fire_rocket: (_ent, _start, _dir, damage, speed, damageRadius, radiusDamage) => {
        shots.push({ damage, speed, damageRadius, radiusDamage });
      },
      emitPlayerMuzzleFlash: (_ent, weapon) => {
        flashes.push(weapon);
      }
    });
  });

  assertNumber(shots.length, 1, "Weapon_RocketLauncher should fire one rocket on frame 5");
  assertNumber(shots[0].damage, 440, "Rocket launcher quad randomized direct damage should match C");
  assertNumber(shots[0].speed, 650, "Rocket launcher projectile speed should match C");
  assertNumber(shots[0].damageRadius, 120, "Rocket launcher damage radius should match C");
  assertNumber(shots[0].radiusDamage, 480, "Rocket launcher quad radius damage should match C");
  assertNumber(flashes[0], MZ_ROCKET, "Rocket launcher should emit MZ_ROCKET");
  assertNumber(player.client!.ps.gunframe, 6, "Rocket launcher firing should advance gunframe");
  assertNumber(player.client!.kick_origin[0], -2, "Rocket launcher should apply original kick origin");
  assertNumber(player.client!.kick_angles[0], -1, "Rocket launcher should apply original kick angle");
  assertNumber(player.client!.pers.inventory[rockets.index], 2, "Rocket launcher should consume one rocket");

  runtime.dmflags |= DF_INFINITE_AMMO;
  player.client!.quad_framenum = 0;
  player.client!.ps.gunframe = 5;
  player.client!.pers.inventory[rockets.index] = 2;
  shots.length = 0;
  flashes.length = 0;

  withMathRandom([0.95], () => {
    Weapon_RocketLauncher(player, runtime, {
      fire_rocket: (_ent, _start, _dir, damage, speed, damageRadius, radiusDamage) => {
        shots.push({ damage, speed, damageRadius, radiusDamage });
      },
      emitPlayerMuzzleFlash: (_ent, weapon) => {
        flashes.push(weapon);
      }
    });
  });

  assertNumber(shots[0].damage, 119, "Rocket launcher direct damage random range should match C");
  assertNumber(shots[0].radiusDamage, 120, "Rocket launcher non-quad radius damage should match C");
  assertNumber(player.client!.pers.inventory[rockets.index], 2, "DF_INFINITE_AMMO should prevent rocket consumption");
}

function verifyGrenadeLauncherFireParity(): void {
  const runtime = createHarnessRuntime();
  const player = createPlayer(runtime);
  const grenadeLauncher = requireItem("Grenade Launcher");
  const grenades = requireItem("Grenades");
  const shots: Array<{ start: [number, number, number]; dir: [number, number, number]; damage: number; speed: number; timer: number; damageRadius: number }> = [];
  const flashes: number[] = [];

  player.s.modelindex = 255;
  player.client!.pers.weapon = grenadeLauncher;
  player.client!.ammo_index = grenades.index;
  player.client!.pers.inventory[grenadeLauncher.index] = 1;
  player.client!.weaponstate = weaponstate_t.WEAPON_FIRING;
  player.client!.ps.gunframe = 6;
  player.client!.buttons = BUTTON_ATTACK;
  player.client!.quad_framenum = runtime.framenum + 1;
  player.client!.pers.inventory[grenades.index] = 3;

  Weapon_GrenadeLauncher(player, runtime, {
    fire_grenade: (_ent, start, dir, damage, speed, timer, damageRadius) => {
      shots.push({ start, dir, damage, speed, timer, damageRadius });
    },
    emitPlayerMuzzleFlash: (_ent, weapon) => {
      flashes.push(weapon);
    }
  });

  assertNumber(shots.length, 1, "Weapon_GrenadeLauncher should fire one grenade on frame 6");
  assertNumber(shots[0].damage, 480, "Grenade launcher quad direct damage should match C");
  assertNumber(shots[0].damageRadius, 160, "Grenade launcher radius should be damage + 40 before quad");
  assertNumber(shots[0].speed, 600, "Grenade launcher projectile speed should match C");
  assertNumber(shots[0].timer, 2.5, "Grenade launcher timer should match C");
  assertNumber(shots[0].start[0], 8, "Grenade launcher projectile start should use original forward offset");
  assertNumber(shots[0].start[2], player.viewheight - 8, "Grenade launcher projectile start should use viewheight offset");
  assertNumber(shots[0].dir[0], 1, "Grenade launcher should fire along view forward");
  assertNumber(flashes[0], MZ_GRENADE, "Grenade launcher should emit MZ_GRENADE");
  assertNumber(player.client!.ps.gunframe, 7, "Grenade launcher firing should advance gunframe");
  assertNumber(player.client!.kick_origin[0], -2, "Grenade launcher should apply original kick origin");
  assertNumber(player.client!.kick_angles[0], -1, "Grenade launcher should apply original kick angle");
  assertNumber(player.client!.pers.inventory[grenades.index], 2, "Grenade launcher should consume one grenade");

  runtime.dmflags |= DF_INFINITE_AMMO;
  player.client!.quad_framenum = 0;
  player.client!.ps.gunframe = 6;
  player.client!.pers.inventory[grenades.index] = 2;
  shots.length = 0;
  flashes.length = 0;

  Weapon_GrenadeLauncher(player, runtime, {
    fire_grenade: (_ent, start, dir, damage, speed, timer, damageRadius) => {
      shots.push({ start, dir, damage, speed, timer, damageRadius });
    },
    emitPlayerMuzzleFlash: (_ent, weapon) => {
      flashes.push(weapon);
    }
  });

  assertNumber(shots[0].damage, 120, "Grenade launcher non-quad damage should match C");
  assertNumber(shots[0].damageRadius, 160, "Grenade launcher non-quad radius should match C");
  assertNumber(flashes[0], MZ_GRENADE, "Grenade launcher infinite-ammo shot should still emit MZ_GRENADE");
  assertNumber(player.client!.pers.inventory[grenades.index], 2, "DF_INFINITE_AMMO should prevent grenade consumption");
}

function verifyHyperBlasterFireParity(): void {
  const runtime = createHarnessRuntime();
  const player = createPlayer(runtime);
  const hyperblaster = requireItem("HyperBlaster");
  const cells = requireItem("Cells");
  const shots: Array<{ damage: number; speed: number; effect: number; hyper: boolean }> = [];
  const flashes: number[] = [];
  const sounds: Array<{ soundPath: string; channel: number }> = [];

  player.s.modelindex = 255;
  player.client!.pers.weapon = hyperblaster;
  player.client!.ammo_index = cells.index;
  player.client!.pers.inventory[hyperblaster.index] = 1;
  player.client!.weaponstate = weaponstate_t.WEAPON_FIRING;
  player.client!.ps.gunframe = 6;
  player.client!.buttons = BUTTON_ATTACK;
  player.client!.quad_framenum = runtime.framenum + 1;
  player.client!.pers.inventory[cells.index] = 3;

  Weapon_HyperBlaster(player, runtime, {
    fire_blaster: (_ent, _start, _dir, damage, speed, effect, hyper) => {
      shots.push({ damage, speed, effect, hyper });
    },
    emitPlayerMuzzleFlash: (_ent, weapon) => {
      flashes.push(weapon);
    }
  });

  assertNumber(shots.length, 1, "Weapon_HyperBlaster should fire one bolt on frame 6");
  assertNumber(shots[0].damage, 80, "HyperBlaster quad damage should match C");
  assertNumber(shots[0].speed, 1000, "HyperBlaster bolt speed should match C");
  assertNumber(shots[0].effect, EF_HYPERBLASTER, "HyperBlaster frame 6 should set EF_HYPERBLASTER");
  assertBoolean(shots[0].hyper, true, "HyperBlaster should mark the bolt as hyper");
  assertNumber(flashes[0], MZ_HYPERBLASTER, "HyperBlaster should emit MZ_HYPERBLASTER");
  assertNumber(player.client!.ps.gunframe, 7, "HyperBlaster firing should advance gunframe 6 to 7");
  assertNumber(player.client!.pers.inventory[cells.index], 2, "HyperBlaster should consume one cell");
  assertBoolean(player.client!.weapon_sound > 0, true, "HyperBlaster should keep the looping hum while firing");

  player.client!.quad_framenum = 0;
  player.client!.ps.gunframe = 11;
  player.client!.pers.inventory[cells.index] = 2;
  shots.length = 0;
  flashes.length = 0;

  Weapon_HyperBlaster(player, runtime, {
    fire_blaster: (_ent, _start, _dir, damage, speed, effect, hyper) => {
      shots.push({ damage, speed, effect, hyper });
    },
    emitPlayerMuzzleFlash: (_ent, weapon) => {
      flashes.push(weapon);
    }
  });

  assertNumber(shots.length, 1, "HyperBlaster frame 11 should still fire");
  assertNumber(shots[0].damage, 20, "HyperBlaster solo damage should match C");
  assertNumber(shots[0].effect, 0, "HyperBlaster frame 11 should not set EF_HYPERBLASTER");
  assertNumber(player.client!.ps.gunframe, 6, "HyperBlaster should loop frame 12 back to 6 when cells remain");
  assertNumber(player.client!.pers.inventory[cells.index], 1, "HyperBlaster loop shot should consume one cell");

  runtime.deathmatch = true;
  player.client!.ps.gunframe = 9;
  player.client!.pers.inventory[cells.index] = 1;
  shots.length = 0;

  Weapon_HyperBlaster(player, runtime, {
    fire_blaster: (_ent, _start, _dir, damage, speed, effect, hyper) => {
      shots.push({ damage, speed, effect, hyper });
    }
  });

  assertNumber(shots[0].damage, 15, "HyperBlaster deathmatch damage should match C");
  assertNumber(shots[0].effect, EF_HYPERBLASTER, "HyperBlaster frame 9 should set EF_HYPERBLASTER");
  assertNumber(player.client!.ps.gunframe, 10, "HyperBlaster should advance gunframe 9 to 10");
  assertNumber(player.client!.pers.inventory[cells.index], 0, "HyperBlaster deathmatch shot should consume the last cell");

  player.client!.buttons = 0;
  player.client!.ps.gunframe = 11;
  player.client!.weapon_sound = 123;

  Weapon_HyperBlaster(player, runtime, {
    playWeaponSound: (_ent, soundPath, channel) => {
      sounds.push({ soundPath, channel });
    }
  });

  assertNumber(player.client!.ps.gunframe, 12, "HyperBlaster release should advance to frame 12");
  assertString(sounds[0]?.soundPath ?? "", "weapons/hyprbd1a.wav", "HyperBlaster release should play the wind-down sound");
  assertNumber(sounds[0]?.channel ?? -1, CHAN_AUTO, "HyperBlaster wind-down sound should use CHAN_AUTO");
  assertNumber(player.client!.weapon_sound, 0, "HyperBlaster wind-down should clear looping weapon sound");

  player.client!.buttons = BUTTON_ATTACK;
  player.client!.ps.gunframe = 6;
  player.client!.pers.inventory[cells.index] = 0;
  sounds.length = 0;

  Weapon_HyperBlaster(player, runtime, {
    playWeaponSound: (_ent, soundPath, channel) => {
      sounds.push({ soundPath, channel });
    }
  });

  assertString(sounds[0]?.soundPath ?? "", "weapons/noammo.wav", "HyperBlaster no-ammo path should play the original sound");
  assertNumber(sounds[0]?.channel ?? -1, CHAN_VOICE, "HyperBlaster no-ammo path should use CHAN_VOICE");
  assertString(player.client!.newweapon?.pickupName ?? "", "Shotgun", "HyperBlaster no-ammo should select the next available weapon");
}

function verifyRailgunFireParity(): void {
  const runtime = createHarnessRuntime();
  const player = createPlayer(runtime);
  const railgun = requireItem("Railgun");
  const slugs = requireItem("Slugs");
  const shots: Array<{ start: [number, number, number]; dir: [number, number, number]; damage: number; kick: number }> = [];
  const flashes: number[] = [];

  player.s.modelindex = 255;
  player.client!.pers.weapon = railgun;
  player.client!.ammo_index = slugs.index;
  player.client!.pers.inventory[railgun.index] = 1;
  player.client!.weaponstate = weaponstate_t.WEAPON_FIRING;
  player.client!.ps.gunframe = 4;
  player.client!.buttons = BUTTON_ATTACK;
  player.client!.quad_framenum = runtime.framenum + 1;
  player.client!.pers.inventory[slugs.index] = 3;

  Weapon_Railgun(player, runtime, {
    fire_rail: (_ent, start, dir, damage, kick) => {
      shots.push({ start, dir, damage, kick });
    },
    emitPlayerMuzzleFlash: (_ent, weapon) => {
      flashes.push(weapon);
    }
  });

  assertNumber(shots.length, 1, "Weapon_Railgun should fire one rail shot on frame 4");
  assertNumber(shots[0].damage, 600, "Railgun quad solo damage should match C");
  assertNumber(shots[0].kick, 1000, "Railgun quad solo kick should match C");
  assertNumber(shots[0].start[0], 0, "Railgun projectile start should use original forward offset");
  assertNumber(shots[0].start[1], -7, "Railgun projectile start should project the original right offset");
  assertNumber(shots[0].start[2], player.viewheight - 8, "Railgun projectile start should use viewheight offset");
  assertNumber(shots[0].dir[0], 1, "Railgun should fire along view forward");
  assertNumber(flashes[0], MZ_RAILGUN, "Railgun should emit MZ_RAILGUN");
  assertNumber(player.client!.ps.gunframe, 5, "Railgun firing should advance gunframe");
  assertNumber(player.client!.kick_origin[0], -3, "Railgun should apply original kick origin");
  assertNumber(player.client!.kick_angles[0], -3, "Railgun should apply original kick angle");
  assertNumber(player.client!.pers.inventory[slugs.index], 2, "Railgun should consume one slug");

  runtime.deathmatch = true;
  runtime.dmflags |= DF_INFINITE_AMMO;
  player.client!.quad_framenum = 0;
  player.client!.ps.gunframe = 4;
  player.client!.pers.inventory[slugs.index] = 2;
  shots.length = 0;
  flashes.length = 0;

  Weapon_Railgun(player, runtime, {
    fire_rail: (_ent, start, dir, damage, kick) => {
      shots.push({ start, dir, damage, kick });
    },
    emitPlayerMuzzleFlash: (_ent, weapon) => {
      flashes.push(weapon);
    }
  });

  assertNumber(shots[0].damage, 100, "Railgun deathmatch damage should match C");
  assertNumber(shots[0].kick, 200, "Railgun deathmatch kick should match C");
  assertNumber(flashes[0], MZ_RAILGUN, "Railgun infinite-ammo shot should still emit MZ_RAILGUN");
  assertNumber(player.client!.pers.inventory[slugs.index], 2, "DF_INFINITE_AMMO should prevent slug consumption");
}

function verifyBfgFireParity(): void {
  const runtime = createHarnessRuntime();
  const player = createPlayer(runtime);
  const bfg = requireItem("BFG10K");
  const cells = requireItem("Cells");
  const shots: Array<{ start: [number, number, number]; dir: [number, number, number]; damage: number; speed: number; damageRadius: number }> = [];
  const flashes: number[] = [];

  player.s.modelindex = 255;
  player.client!.pers.weapon = bfg;
  player.client!.ammo_index = cells.index;
  player.client!.pers.inventory[bfg.index] = 1;
  player.client!.weaponstate = weaponstate_t.WEAPON_FIRING;
  player.client!.ps.gunframe = 9;
  player.client!.buttons = BUTTON_ATTACK;
  player.client!.pers.inventory[cells.index] = 50;

  Weapon_BFG(player, runtime, {
    emitPlayerMuzzleFlash: (_ent, weapon) => {
      flashes.push(weapon);
    },
    fire_bfg: (_ent, start, dir, damage, speed, damageRadius) => {
      shots.push({ start, dir, damage, speed, damageRadius });
    }
  });

  assertNumber(flashes[0], MZ_BFG, "BFG frame 9 should emit the warmup muzzleflash");
  assertNumber(shots.length, 0, "BFG frame 9 should not launch the projectile yet");
  assertNumber(player.client!.ps.gunframe, 10, "BFG frame 9 should advance after the muzzleflash");
  assertBoolean(runtime.sound_entity === player.mynoise, true, "BFG frame 9 should emit weapon noise at player origin");

  player.client!.ps.gunframe = 17;
  player.client!.quad_framenum = runtime.framenum + 1;
  player.client!.pers.inventory[cells.index] = 50;
  flashes.length = 0;
  shots.length = 0;

  withMathRandom([0.75], () => {
    Weapon_BFG(player, runtime, {
      fire_bfg: (_ent, start, dir, damage, speed, damageRadius) => {
        shots.push({ start, dir, damage, speed, damageRadius });
      }
    });
  });

  assertNumber(shots.length, 1, "BFG frame 17 should launch one projectile");
  assertNumber(shots[0].damage, 2000, "BFG quad solo damage should match C");
  assertNumber(shots[0].speed, 400, "BFG projectile speed should match C");
  assertNumber(shots[0].damageRadius, 1000, "BFG damage radius should match C");
  assertNumber(shots[0].start[0], 8, "BFG projectile start should use original forward offset");
  assertNumber(shots[0].start[2], player.viewheight - 8, "BFG projectile start should use viewheight offset");
  assertNumber(shots[0].dir[0], 1, "BFG should fire along view forward");
  assertNumber(player.client!.ps.gunframe, 18, "BFG firing should advance gunframe");
  assertNumber(player.client!.kick_origin[0], -2, "BFG should apply original kick origin");
  assertNumber(player.client!.v_dmg_pitch, -40, "BFG should apply original damage pitch");
  assertNumber(player.client!.v_dmg_roll, cCrandom(0.75) * 8, "BFG should apply original random damage roll");
  assertNumber(player.client!.v_dmg_time, runtime.time + 0.5, "BFG should set the original damage kick time");
  assertNumber(player.client!.pers.inventory[cells.index], 0, "BFG should consume fifty cells");

  runtime.deathmatch = true;
  runtime.dmflags |= DF_INFINITE_AMMO;
  player.client!.quad_framenum = 0;
  player.client!.ps.gunframe = 17;
  player.client!.pers.inventory[cells.index] = 50;
  shots.length = 0;

  Weapon_BFG(player, runtime, {
    fire_bfg: (_ent, start, dir, damage, speed, damageRadius) => {
      shots.push({ start, dir, damage, speed, damageRadius });
    }
  });

  assertNumber(shots[0].damage, 200, "BFG deathmatch damage should match C");
  assertNumber(player.client!.pers.inventory[cells.index], 50, "DF_INFINITE_AMMO should prevent BFG cell consumption");

  runtime.dmflags = 0;
  player.client!.ps.gunframe = 17;
  player.client!.pers.inventory[cells.index] = 49;
  shots.length = 0;

  Weapon_BFG(player, runtime, {
    fire_bfg: (_ent, start, dir, damage, speed, damageRadius) => {
      shots.push({ start, dir, damage, speed, damageRadius });
    }
  });

  assertNumber(shots.length, 0, "BFG should abort the launch if cells dropped below fifty during windup");
  assertNumber(player.client!.ps.gunframe, 18, "BFG aborted launch should still advance gunframe");
  assertNumber(player.client!.pers.inventory[cells.index], 49, "BFG aborted launch should not consume cells");
}

function verifyHandGrenadeParity(): void {
  const runtime = createHarnessRuntime();
  const player = createPlayer(runtime);
  const grenades = requireItem("Grenades");
  const throws: Array<{ damage: number; speed: number; timer: number; damageRadius: number; held: boolean }> = [];
  const sounds: Array<{ soundPath: string; channel: number }> = [];

  player.s.modelindex = 255;
  player.client!.pers.weapon = grenades;
  player.client!.ammo_index = grenades.index;
  player.client!.pers.inventory[grenades.index] = 3;
  player.client!.weaponstate = weaponstate_t.WEAPON_READY;
  player.client!.latched_buttons = BUTTON_ATTACK;

  Weapon_Grenade(player, runtime);

  assertNumber(player.client!.ps.gunframe, 1, "Hand grenade attack should start at frame 1");
  assertNumber(player.client!.weaponstate, weaponstate_t.WEAPON_FIRING, "Hand grenade attack should enter firing state");
  assertNumber(player.client!.grenade_time, 0, "Hand grenade attack should clear grenade_time before cooking");
  assertNumber(player.client!.latched_buttons, 0, "Hand grenade attack should consume the latched attack bit");

  player.client!.ps.gunframe = 5;
  Weapon_Grenade(player, runtime, {
    playWeaponSound: (_ent, soundPath, channel) => {
      sounds.push({ soundPath, channel });
    }
  });
  assertString(sounds[0]?.soundPath ?? "", "weapons/hgrena1b.wav", "Hand grenade frame 5 should play the arm sound");
  assertNumber(sounds[0]?.channel ?? -1, CHAN_WEAPON, "Hand grenade arm sound should use CHAN_WEAPON");
  assertNumber(player.client!.ps.gunframe, 6, "Hand grenade frame 5 should advance");

  player.client!.ps.gunframe = 11;
  player.client!.buttons = BUTTON_ATTACK;
  Weapon_Grenade(player, runtime);
  assertNumber(player.client!.grenade_time, runtime.time + 3.2, "Hand grenade frame 11 should start the original fuse timer");
  assertBoolean(player.client!.weapon_sound > 0, true, "Hand grenade frame 11 should start the cooking loop sound");
  assertNumber(player.client!.ps.gunframe, 11, "Holding attack should keep hand grenade on frame 11");

  runtime.time = player.client!.grenade_time;
  player.client!.grenade_blew_up = false;
  Weapon_Grenade(player, runtime, {
    fire_grenade2: (_ent, _start, _dir, damage, speed, timer, damageRadius, held) => {
      throws.push({ damage, speed, timer, damageRadius, held });
    }
  });
  assertNumber(throws.length, 1, "Overcooked hand grenade should fire in hand once");
  assertBoolean(throws[0].held, true, "Overcooked hand grenade should use held=true");
  assertNumber(throws[0].damage, 125, "Hand grenade base damage should match C");
  assertNumber(throws[0].damageRadius, 165, "Hand grenade radius should be damage + 40");
  assertNumber(throws[0].timer, 0, "Overcooked hand grenade timer should be exhausted");
  assertNumber(throws[0].speed, 800, "Overcooked hand grenade speed should reach max speed");
  assertBoolean(player.client!.grenade_blew_up, true, "Overcooked hand grenade should set grenade_blew_up");
  assertNumber(player.client!.pers.inventory[grenades.index], 2, "Overcooked hand grenade should consume one grenade");

  player.client!.buttons = 0;
  runtime.time = player.client!.grenade_time;
  Weapon_Grenade(player, runtime);
  assertNumber(player.client!.ps.gunframe, 16, "Post-explosion hand grenade should finish back to ready frame");
  assertNumber(player.client!.weaponstate, weaponstate_t.WEAPON_READY, "Post-explosion hand grenade should return to ready state");
  assertNumber(player.client!.grenade_time, 0, "Post-explosion hand grenade should clear grenade_time");

  runtime.time = 10;
  player.client!.weaponstate = weaponstate_t.WEAPON_FIRING;
  player.client!.ps.gunframe = 12;
  player.client!.grenade_time = runtime.time + 1.5;
  player.client!.pers.inventory[grenades.index] = 2;
  player.client!.quad_framenum = runtime.framenum + 1;
  throws.length = 0;

  Weapon_Grenade(player, runtime, {
    fire_grenade2: (_ent, _start, _dir, damage, speed, timer, damageRadius, held) => {
      throws.push({ damage, speed, timer, damageRadius, held });
    }
  });

  assertBoolean(throws[0].held, false, "Released hand grenade should use held=false");
  assertNumber(throws[0].damage, 500, "Hand grenade quad damage should match C");
  assertNumber(throws[0].damageRadius, 165, "Hand grenade quad should not change damage radius");
  assertNumber(throws[0].timer, 1.5, "Released hand grenade timer should use remaining fuse");
  assertNumber(throws[0].speed, 600, "Released hand grenade speed should scale with cooked time");
  assertNumber(player.client!.pers.inventory[grenades.index], 1, "Released hand grenade should consume one grenade");
  assertNumber(player.client!.grenade_time, runtime.time + 1.0, "Released hand grenade should debounce grenade_time");
  assertNumber(player.client!.anim_priority, ANIM_REVERSE, "Released standing hand grenade should use reverse attack animation");

  runtime.dmflags |= DF_INFINITE_AMMO;
  player.client!.quad_framenum = 0;
  player.client!.ps.gunframe = 12;
  player.client!.grenade_time = runtime.time + 1.5;
  player.client!.pers.inventory[grenades.index] = 1;
  throws.length = 0;

  Weapon_Grenade(player, runtime, {
    fire_grenade2: (_ent, _start, _dir, damage, speed, timer, damageRadius, held) => {
      throws.push({ damage, speed, timer, damageRadius, held });
    }
  });
  assertNumber(throws[0].damage, 125, "Hand grenade non-quad damage should remain base damage");
  assertNumber(player.client!.pers.inventory[grenades.index], 1, "DF_INFINITE_AMMO should prevent grenade consumption");

  runtime.dmflags = 0;
  player.client!.weaponstate = weaponstate_t.WEAPON_READY;
  player.client!.buttons = BUTTON_ATTACK;
  player.client!.pers.inventory[grenades.index] = 0;
  sounds.length = 0;

  Weapon_Grenade(player, runtime, {
    playWeaponSound: (_ent, soundPath, channel) => {
      sounds.push({ soundPath, channel });
    }
  });
  assertString(sounds[0]?.soundPath ?? "", "weapons/noammo.wav", "Hand grenade no-ammo path should play the original sound");
  assertNumber(sounds[0]?.channel ?? -1, CHAN_VOICE, "Hand grenade no-ammo path should use CHAN_VOICE");
  assertString(player.client!.newweapon?.pickupName ?? "", "Shotgun", "Hand grenade no-ammo should select the next available weapon");
}

function verifyHandGrenadeFireDirectParity(): void {
  const runtime = createHarnessRuntime();
  const player = createPlayer(runtime);
  const grenades = requireItem("Grenades");
  const throws: Array<{ start: readonly number[]; dir: readonly number[]; damage: number; speed: number; timer: number; damageRadius: number; held: boolean }> = [];

  runtime.time = 20;
  player.s.origin = [100, 200, 300];
  player.origin = [100, 200, 300];
  player.viewheight = 22;
  player.s.modelindex = 255;
  player.client!.v_angle = [0, 0, 0];
  player.client!.pers.weapon = grenades;
  player.client!.ammo_index = grenades.index;
  player.client!.pers.inventory[grenades.index] = 4;
  player.client!.grenade_time = runtime.time + 2.25;
  player.client!.ps.pmove.pm_flags = PMF_DUCKED;

  weapon_grenade_fire(player, false, runtime, {
    fire_grenade2: (_ent, start, dir, damage, speed, timer, damageRadius, held) => {
      throws.push({ start, dir, damage, speed, timer, damageRadius, held });
    }
  });

  assertNumber(throws.length, 1, "weapon_grenade_fire should spawn one hand grenade");
  assertVec3(throws[0].start, [108, 192, 314], "weapon_grenade_fire should project the original hand grenade muzzle");
  assertVec3(throws[0].dir, [1, 0, 0], "weapon_grenade_fire should throw along AngleVectors forward");
  assertNumber(throws[0].damage, 125, "weapon_grenade_fire base damage mismatch");
  assertNumber(throws[0].damageRadius, 165, "weapon_grenade_fire damage radius mismatch");
  assertNumber(throws[0].timer, 2.25, "weapon_grenade_fire fuse timer mismatch");
  assertNumber(throws[0].speed, 500, "weapon_grenade_fire cooked speed mismatch");
  assertBoolean(throws[0].held, false, "weapon_grenade_fire held flag mismatch");
  assertNumber(player.client!.pers.inventory[grenades.index], 3, "weapon_grenade_fire should consume one grenade");
  assertNumber(player.client!.grenade_time, runtime.time + 1.0, "weapon_grenade_fire should debounce grenade_time");
  assertNumber(player.client!.anim_priority, ANIM_ATTACK, "weapon_grenade_fire ducked animation priority mismatch");
  assertNumber(player.s.frame, playerFrames.FRAME_crattak1 - 1, "weapon_grenade_fire ducked animation start frame mismatch");
  assertNumber(player.client!.anim_end, playerFrames.FRAME_crattak3, "weapon_grenade_fire ducked animation end frame mismatch");

  runtime.dmflags |= DF_INFINITE_AMMO;
  player.client!.ps.pmove.pm_flags = 0;
  player.client!.grenade_time = runtime.time + 1.5;
  player.client!.pers.inventory[grenades.index] = 3;
  throws.length = 0;

  weapon_grenade_fire(player, true, runtime, {
    fire_grenade2: (_ent, start, dir, damage, speed, timer, damageRadius, held) => {
      throws.push({ start, dir, damage, speed, timer, damageRadius, held });
    }
  });

  assertNumber(throws[0].speed, 600, "weapon_grenade_fire released speed at half fuse mismatch");
  assertNumber(player.client!.pers.inventory[grenades.index], 3, "weapon_grenade_fire should honor DF_INFINITE_AMMO");
  assertNumber(player.client!.anim_priority, ANIM_REVERSE, "weapon_grenade_fire standing animation priority mismatch");
  assertNumber(player.s.frame, playerFrames.FRAME_wave08, "weapon_grenade_fire standing animation start frame mismatch");
  assertNumber(player.client!.anim_end, playerFrames.FRAME_wave01, "weapon_grenade_fire standing animation end frame mismatch");

  player.deadflag = DEAD_DYING;
  player.client!.anim_priority = 0;
  player.s.frame = 0;
  player.client!.anim_end = 0;
  player.client!.grenade_time = runtime.time + 1.5;
  throws.length = 0;

  weapon_grenade_fire(player, false, runtime, {
    fire_grenade2: (_ent, start, dir, damage, speed, timer, damageRadius, held) => {
      throws.push({ start, dir, damage, speed, timer, damageRadius, held });
    }
  });

  assertNumber(throws.length, 1, "weapon_grenade_fire corpse guard should still throw before animation guard");
  assertNumber(player.client!.anim_priority, 0, "weapon_grenade_fire should skip corpse animation priority");
  assertNumber(player.s.frame, 0, "weapon_grenade_fire should skip corpse animation frame");
  assertNumber(player.client!.anim_end, 0, "weapon_grenade_fire should skip corpse animation end");
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
  const cells = requireItem("Cells");
  const rockets = requireItem("Rockets");
  const grenades = requireItem("Grenades");
  const slugs = requireItem("Slugs");

  client.pers.weapon = blaster;
  client.pers.inventory[blaster.index] = 1;
  client.pers.inventory[shotgun.index] = 1;
  client.pers.inventory[shells.index] = 10;
  client.pers.inventory[bullets.index] = 50;
  client.pers.inventory[cells.index] = 50;
  client.pers.inventory[rockets.index] = 50;
  client.pers.inventory[grenades.index] = 50;
  client.pers.inventory[slugs.index] = 50;

  return player;
}

function withMathRandom(values: number[], callback: () => void): void {
  const original = Math.random;
  let index = 0;
  Math.random = () => values[Math.min(index++, values.length - 1)] ?? 0;
  try {
    callback();
  } finally {
    Math.random = original;
  }
}

function cRandom(value: number): number {
  return Math.floor(value * 0x8000) / 0x7fff;
}

function cCrandom(value: number): number {
  return 2.0 * (cRandom(value) - 0.5);
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

function assertVec3(actual: readonly number[], expected: readonly number[], label: string): void {
  for (let index = 0; index < 3; index += 1) {
    assertNumber(actual[index] ?? NaN, expected[index] ?? NaN, `${label}[${index}]`);
  }
}
