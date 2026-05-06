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
  Blaster_Fire,
  CENTER_HANDED,
  Chaingun_Fire,
  DEFAULT_BULLET_HSPREAD,
  DEFAULT_BULLET_VSPREAD,
  DEFAULT_DEATHMATCH_SHOTGUN_COUNT,
  DEFAULT_SHOTGUN_COUNT,
  DEFAULT_SHOTGUN_HSPREAD,
  DEFAULT_SSHOTGUN_COUNT,
  DEFAULT_SHOTGUN_VSPREAD,
  Drop_Weapon,
  FindItem,
  LEFT_HANDED,
  MOD_CHAINGUN,
  MOD_MACHINEGUN,
  MOD_SHOTGUN,
  MOD_SSHOTGUN,
  Machinegun_Fire,
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
  Weapon_Blaster,
  Weapon_Blaster_Fire,
  Weapon_HyperBlaster,
  Weapon_HyperBlaster_Fire,
  Weapon_Machinegun,
  Weapon_Railgun,
  Weapon_RocketLauncher,
  Weapon_RocketLauncher_Fire,
  Weapon_Shotgun,
  Weapon_SuperShotgun,
  attachGameClient,
  createGameRuntimeFromBspEntities,
  drainGameSoundEvents,
  drainPlayerMuzzleFlashEvents,
  playerFrames,
  spawnGameEntity,
  weapon_bfg_fire,
  weapon_grenade_fire,
  weapon_grenadelauncher_fire,
  weapon_railgun_fire,
  weapon_shotgun_fire,
  weapon_supershotgun_fire,
  weaponstate_t,
  type GameEntity,
  type GameRuntime
} from "../../packages/game/src/index.js";
import { BUTTON_ATTACK, CHAN_AUTO, CHAN_VOICE, CHAN_WEAPON, CS_SOUNDS, DF_INFINITE_AMMO, DF_WEAPONS_STAY, EF_BLASTER, EF_HYPERBLASTER, MZ_BFG, MZ_BLASTER, MZ_CHAINGUN1, MZ_CHAINGUN2, MZ_CHAINGUN3, MZ_GRENADE, MZ_HYPERBLASTER, MZ_MACHINEGUN, MZ_RAILGUN, MZ_ROCKET, MZ_SHOTGUN, MZ_SILENCED, MZ_SSHOTGUN, PMF_DUCKED } from "../../packages/qcommon/src/index.js";

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
  verifyShotgunFireParity();
  verifySuperShotgunFireParity();
  verifyGrenadeLauncherFireParity();
  verifyRocketLauncherFireParity();
  verifyBlasterFireParity();
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
  const shots: Array<{ start: readonly number[]; aimdir: readonly number[]; damage: number; kick: number; hspread: number; vspread: number; mod: number }> = [];
  const flashes: number[] = [];

  player.s.origin = [100, 200, 300];
  player.origin = [100, 200, 300];
  player.s.modelindex = 255;
  player.client!.pers.weapon = machinegun;
  player.client!.ammo_index = bullets.index;
  player.client!.pers.inventory[machinegun.index] = 1;
  player.client!.weaponstate = weaponstate_t.WEAPON_FIRING;
  player.client!.ps.gunframe = 4;
  player.client!.buttons = BUTTON_ATTACK;
  player.client!.v_angle = [0, 0, 0];
  player.client!.quad_framenum = runtime.framenum + 1;
  player.client!.silencer_shots = 1;
  player.client!.pers.inventory[bullets.index] = 3;

  withMathRandom([0.5, 0.5, 0.5, 0.5, 0.5, 0.5], () => {
    Weapon_Machinegun(player, runtime, {
      fire_bullet: (_ent, start, aimdir, damage, kick, hspread, vspread, mod) => {
        shots.push({ start, aimdir, damage, kick, hspread, vspread, mod });
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
  assertVec3Close(shots[0].start, [100, 192, 314], "Machinegun offset/start should match C P_ProjectSource", 1e-5);
  assertVec3Close(shots[0].aimdir, [1, 0, 0], "Machinegun aimdir should come from v_angle plus kick_angles", 1e-5);
  assertNumber(flashes[0], MZ_MACHINEGUN | MZ_SILENCED, "Machinegun should emit MZ_MACHINEGUN plus silenced bit");
  assertNumber(player.client!.ps.gunframe, 5, "Machinegun firing should toggle gunframe 4 to 5");
  assertNumber(player.client!.machinegun_shots, 1, "Machinegun should accumulate recoil shots outside deathmatch");
  assertNumber(player.client!.pers.inventory[bullets.index], 2, "Machinegun should consume one bullet");
  assertNumber(player.client!.kick_origin[1], cCrandom(0.5) * 0.35, "Machinegun side kick origin should use g_local.crandom");
  assertNumber(player.client!.kick_angles[1], cCrandom(0.5) * 0.7, "Machinegun side kick angle should use g_local.crandom");
  assertNumber(player.client!.kick_origin[0], cCrandom(0.5) * 0.35, "Machinegun forward kick origin should use g_local.crandom");
  assertNumber(player.s.frame, 46, "Machinegun attack frame should use g_local.random for original frame expression");

  runtime.dmflags |= DF_INFINITE_AMMO;
  player.client!.silencer_shots = 0;
  withMathRandom([0.5, 0.5, 0.5, 0.5, 0.5, 0.5], () => {
    Weapon_Machinegun(player, runtime, {
      fire_bullet: (_ent, start, aimdir, damage, kick, hspread, vspread, mod) => {
        shots.push({ start, aimdir, damage, kick, hspread, vspread, mod });
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

  player.client!.weaponstate = weaponstate_t.WEAPON_READY;
  player.client!.ps.gunframe = 23;
  player.client!.buttons = 0;
  player.client!.latched_buttons = 0;
  shots.length = 0;
  withMathRandom([0.1], () => {
    Weapon_Machinegun(player, runtime, {
      fire_bullet: (_ent, start, aimdir, damage, kick, hspread, vspread, mod) => {
        shots.push({ start, aimdir, damage, kick, hspread, vspread, mod });
      }
    });
  });
  assertNumber(player.client!.ps.gunframe, 23, "Weapon_Machinegun pause_frames should include frame 23");
  assertNumber(shots.length, 0, "Weapon_Machinegun pause frame should not fire while idling");

  player.client!.weaponstate = weaponstate_t.WEAPON_FIRING;
  player.client!.ps.gunframe = 6;
  shots.length = 0;
  Weapon_Machinegun(player, runtime, {
    fire_bullet: (_ent, start, aimdir, damage, kick, hspread, vspread, mod) => {
      shots.push({ start, aimdir, damage, kick, hspread, vspread, mod });
    }
  });
  assertNumber(shots.length, 0, "Weapon_Machinegun fire_frames should only include frames 4 and 5");
  assertNumber(player.client!.ps.gunframe, 7, "Weapon_Machinegun non-fire frame should advance without firing");

  player.client!.weaponstate = weaponstate_t.WEAPON_FIRING;
  player.client!.ps.gunframe = 4;
  player.client!.buttons = BUTTON_ATTACK;
  player.client!.quad_framenum = 0;
  player.client!.pers.inventory[bullets.index] = 2;
  runtime.dmflags = 0;
  shots.length = 0;
  Machinegun_Fire(player, runtime, {
    fire_bullet: (_ent, start, aimdir, damage, kick, hspread, vspread, mod) => {
      shots.push({ start, aimdir, damage, kick, hspread, vspread, mod });
    }
  });
  assertNumber(shots[0].damage, 8, "Machinegun_Fire direct base damage should match C");
  assertNumber(shots[0].kick, 2, "Machinegun_Fire direct base kick should match C");
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
  const shots: Array<{ start: readonly number[]; aimdir: readonly number[]; damage: number; kick: number; hspread: number; vspread: number; mod: number }> = [];
  const flashes: number[] = [];
  const sounds: Array<{ soundPath: string; channel: number }> = [];

  player.s.origin = [100, 200, 300];
  player.origin = [100, 200, 300];
  player.s.modelindex = 255;
  player.client!.pers.weapon = chaingun;
  player.client!.ammo_index = bullets.index;
  player.client!.pers.inventory[chaingun.index] = 1;
  player.client!.weaponstate = weaponstate_t.WEAPON_FIRING;
  player.client!.ps.gunframe = 9;
  player.client!.buttons = BUTTON_ATTACK;
  player.client!.v_angle = [0, 0, 0];
  player.client!.quad_framenum = runtime.framenum + 1;
  player.client!.silencer_shots = 1;
  player.client!.pers.inventory[bullets.index] = 5;

  withMathRandom(Array(10).fill(0.5), () => {
    Weapon_Chaingun(player, runtime, {
      fire_bullet: (_ent, start, aimdir, damage, kick, hspread, vspread, mod) => {
        shots.push({ start, aimdir, damage, kick, hspread, vspread, mod });
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
  assertVec3Close(shots[0].start, [100, 193, 314], "Chaingun first bullet start should match C randomized offset", 1e-3);
  assertVec3Close(shots[0].aimdir, [1, 0, 0], "Chaingun aimdir should come from v_angle", 1e-5);
  assertNumber(flashes[0], MZ_CHAINGUN2 | MZ_SILENCED, "Chaingun should emit MZ_CHAINGUN2 plus silenced bit for two shots");
  assertNumber(player.client!.ps.gunframe, 10, "Chaingun firing should advance gunframe 9 to 10");
  assertNumber(player.client!.pers.inventory[bullets.index], 3, "Chaingun should consume two bullets");
  assertNumber(player.client!.kick_origin[0], cCrandom(0.5) * 0.35, "Chaingun kick origin should use g_local.crandom");
  assertNumber(player.client!.kick_angles[0], cCrandom(0.5) * 0.7, "Chaingun kick angle should use g_local.crandom");
  assertNumber(player.s.frame, playerFrames.FRAME_attack1, "Chaingun standing animation frame should match C parity expression");
  assertNumber(player.client!.anim_end, playerFrames.FRAME_attack8, "Chaingun standing animation end should match C");
  assertNumber(player.client!.silencer_shots, 0, "Chaingun PlayerNoise should consume one silencer shot");
  assertString(runtime.configstrings.get(CS_SOUNDS + player.client!.weapon_sound) ?? "", "weapons/chngnl1a.wav", "Chaingun active fire should set looping chain sound");

  runtime.deathmatch = true;
  player.client!.quad_framenum = 0;
  player.client!.ps.gunframe = 20;
  player.client!.silencer_shots = 0;
  player.client!.pers.inventory[bullets.index] = 5;
  shots.length = 0;
  flashes.length = 0;

  withMathRandom(Array(12).fill(0.5), () => {
    Weapon_Chaingun(player, runtime, {
      fire_bullet: (_ent, start, aimdir, damage, kick, hspread, vspread, mod) => {
        shots.push({ start, aimdir, damage, kick, hspread, vspread, mod });
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
    fire_bullet: (_ent, start, aimdir, damage, kick, hspread, vspread, mod) => {
      shots.push({ start, aimdir, damage, kick, hspread, vspread, mod });
    },
    emitPlayerMuzzleFlash: (_ent, weapon) => {
      flashes.push(weapon);
    }
  });

  assertNumber(player.client!.ps.gunframe, 32, "Chaingun should jump to wind-down frame 32 when attack is released at frame 14");
  assertNumber(player.client!.weapon_sound, 0, "Chaingun wind-down branch should clear looping weapon sound");
  assertNumber(shots.length, 0, "Chaingun wind-down branch should not fire bullets");
  assertNumber(flashes.length, 0, "Chaingun wind-down branch should not emit a muzzleflash");

  player.client!.ps.gunframe = 21;
  player.client!.buttons = BUTTON_ATTACK;
  player.client!.pers.inventory[bullets.index] = 2;
  shots.length = 0;
  flashes.length = 0;

  withMathRandom(Array(10).fill(0.5), () => {
    Chaingun_Fire(player, runtime, {
      fire_bullet: (_ent, start, aimdir, damage, kick, hspread, vspread, mod) => {
        shots.push({ start, aimdir, damage, kick, hspread, vspread, mod });
      },
      emitPlayerMuzzleFlash: (_ent, weapon) => {
        flashes.push(weapon);
      }
    });
  });

  assertNumber(player.client!.ps.gunframe, 15, "Chaingun_Fire should loop frame 21 back to 15 while attack and ammo remain");
  assertNumber(shots.length, 2, "Chaingun_Fire should clamp shot count to available ammo");
  assertNumber(flashes[0], MZ_CHAINGUN2, "Chaingun_Fire should emit MZ_CHAINGUN2 when ammo clamps full spin to two shots");
  assertNumber(player.client!.pers.inventory[bullets.index], 0, "Chaingun_Fire should consume the clamped shot count");

  runtime.deathmatch = false;
  runtime.dmflags |= DF_INFINITE_AMMO;
  player.client!.ps.gunframe = 5;
  player.client!.buttons = BUTTON_ATTACK;
  player.client!.quad_framenum = 0;
  player.client!.pers.inventory[bullets.index] = 1;
  shots.length = 0;
  flashes.length = 0;
  sounds.length = 0;

  withMathRandom(Array(8).fill(0.5), () => {
    Chaingun_Fire(player, runtime, {
      fire_bullet: (_ent, start, aimdir, damage, kick, hspread, vspread, mod) => {
        shots.push({ start, aimdir, damage, kick, hspread, vspread, mod });
      },
      emitPlayerMuzzleFlash: (_ent, weapon) => {
        flashes.push(weapon);
      },
      playWeaponSound: (_ent, soundPath, channel) => {
        sounds.push({ soundPath, channel });
      }
    });
  });

  assertString(sounds[0]?.soundPath ?? "", "weapons/chngnu1a.wav", "Chaingun frame 5 should play the original windup sound");
  assertNumber(sounds[0]?.channel ?? -1, CHAN_AUTO, "Chaingun windup sound should use CHAN_AUTO");
  assertNumber(shots.length, 1, "Chaingun frame 5 should fire one bullet");
  assertNumber(shots[0].damage, 8, "Chaingun_Fire direct solo damage should match C");
  assertNumber(shots[0].kick, 2, "Chaingun_Fire direct solo kick should match C");
  assertNumber(flashes[0], MZ_CHAINGUN1, "Chaingun one-shot frame should emit MZ_CHAINGUN1");
  assertVec3Close(player.mynoise!.s.origin, [100, 193, 314], "Chaingun unsilenced PlayerNoise should use the last bullet start", 1e-3);
  assertNumber(player.client!.pers.inventory[bullets.index], 1, "DF_INFINITE_AMMO should prevent chaingun bullet consumption");

  runtime.dmflags = 0;
  player.client!.ps.gunframe = 21;
  player.client!.buttons = 0;
  player.client!.pers.inventory[bullets.index] = 1;
  shots.length = 0;
  sounds.length = 0;

  Chaingun_Fire(player, runtime, {
    fire_bullet: (_ent, start, aimdir, damage, kick, hspread, vspread, mod) => {
      shots.push({ start, aimdir, damage, kick, hspread, vspread, mod });
    },
    playWeaponSound: (_ent, soundPath, channel) => {
      sounds.push({ soundPath, channel });
    }
  });

  assertNumber(player.client!.ps.gunframe, 22, "Chaingun release at frame 21 should advance to wind-down frame 22");
  assertNumber(player.client!.weapon_sound, 0, "Chaingun wind-down frame 22 should clear the looping sound");
  assertString(sounds[0]?.soundPath ?? "", "weapons/chngnd1a.wav", "Chaingun frame 22 should play the original wind-down sound");
  assertNumber(sounds[0]?.channel ?? -1, CHAN_AUTO, "Chaingun wind-down sound should use CHAN_AUTO");
  assertNumber(shots.length, 1, "Chaingun frame 22 branch should still fire the final clamped shot");

  player.client!.pers.inventory[bullets.index] = 0;
  player.client!.ps.gunframe = 10;
  player.client!.buttons = BUTTON_ATTACK;
  player.client!.newweapon = null;
  player.client!.pers.inventory[bullets.index] = 0;
  player.client!.pers.inventory[requireItem("Shells").index] = 10;
  shots.length = 0;
  sounds.length = 0;

  Chaingun_Fire(player, runtime, {
    fire_bullet: (_ent, start, aimdir, damage, kick, hspread, vspread, mod) => {
      shots.push({ start, aimdir, damage, kick, hspread, vspread, mod });
    },
    playWeaponSound: (_ent, soundPath, channel) => {
      sounds.push({ soundPath, channel });
    }
  });

  assertString(sounds[0]?.soundPath ?? "", "weapons/noammo.wav", "Chaingun no-ammo path should play the original sound");
  assertNumber(sounds[0]?.channel ?? -1, CHAN_VOICE, "Chaingun no-ammo path should use CHAN_VOICE");
  assertString(player.client!.newweapon?.pickupName ?? "", "Shotgun", "Chaingun no-ammo should select the next available weapon");
  assertNumber(shots.length, 0, "Chaingun no-ammo branch should not fire bullets");

  player.client!.weaponstate = weaponstate_t.WEAPON_READY;
  player.client!.ps.gunframe = 38;
  player.client!.buttons = 0;
  player.client!.latched_buttons = 0;
  player.client!.newweapon = null;
  shots.length = 0;
  withMathRandom([0.1], () => {
    Weapon_Chaingun(player, runtime, {
      fire_bullet: (_ent, start, aimdir, damage, kick, hspread, vspread, mod) => {
        shots.push({ start, aimdir, damage, kick, hspread, vspread, mod });
      }
    });
  });
  assertNumber(player.client!.ps.gunframe, 38, "Weapon_Chaingun pause_frames should include frame 38");
  assertNumber(shots.length, 0, "Weapon_Chaingun pause frame should not fire while idling");

  player.client!.weaponstate = weaponstate_t.WEAPON_FIRING;
  player.client!.ps.gunframe = 22;
  shots.length = 0;
  Weapon_Chaingun(player, runtime, {
    fire_bullet: (_ent, start, aimdir, damage, kick, hspread, vspread, mod) => {
      shots.push({ start, aimdir, damage, kick, hspread, vspread, mod });
    }
  });
  assertNumber(shots.length, 0, "Weapon_Chaingun fire_frames should stop at frame 21");
  assertNumber(player.client!.ps.gunframe, 23, "Weapon_Chaingun non-fire frame should advance without firing");
}

function verifyShotgunFireParity(): void {
  const runtime = createHarnessRuntime();
  const player = createPlayer(runtime);
  const shotgun = requireItem("Shotgun");
  const shells = requireItem("Shells");
  const shots: Array<{ start: readonly number[]; aimdir: readonly number[]; damage: number; kick: number; hspread: number; vspread: number; count: number; mod: number }> = [];
  const flashes: number[] = [];

  player.s.modelindex = 255;
  player.s.origin = [100, 200, 300];
  player.origin = [100, 200, 300];
  player.client!.pers.weapon = shotgun;
  player.client!.ammo_index = shells.index;
  player.client!.pers.inventory[shotgun.index] = 1;
  player.client!.pers.inventory[shells.index] = 4;
  player.client!.weaponstate = weaponstate_t.WEAPON_FIRING;
  player.client!.ps.gunframe = 8;
  player.client!.buttons = BUTTON_ATTACK;
  player.client!.v_angle = [0, 0, 0];
  player.client!.quad_framenum = runtime.framenum + 1;
  player.client!.silencer_shots = 1;

  Weapon_Shotgun(player, runtime, {
    fire_shotgun: (_ent, start, aimdir, damage, kick, hspread, vspread, count, mod) => {
      shots.push({ start, aimdir, damage, kick, hspread, vspread, count, mod });
    },
    emitPlayerMuzzleFlash: (_ent, weapon) => {
      flashes.push(weapon);
    }
  });

  assertNumber(shots.length, 1, "Weapon_Shotgun should fire once on frame 8");
  assertVec3(shots[0].start, [100, 192, 314], "Weapon_Shotgun start should use original shotgun muzzle offset");
  assertVec3(shots[0].aimdir, [1, 0, 0], "Weapon_Shotgun aimdir should come from v_angle forward");
  assertNumber(shots[0].damage, 16, "Weapon_Shotgun quad damage should match C");
  assertNumber(shots[0].kick, 32, "Weapon_Shotgun quad kick should match C");
  assertNumber(shots[0].hspread, 500, "Weapon_Shotgun horizontal spread should match C literal 500");
  assertNumber(shots[0].vspread, DEFAULT_SHOTGUN_VSPREAD, "Weapon_Shotgun vertical spread should match C literal 500");
  assertNumber(shots[0].count, DEFAULT_SHOTGUN_COUNT, "Weapon_Shotgun solo pellet count should match C");
  assertNumber(shots[0].mod, MOD_SHOTGUN, "Weapon_Shotgun means-of-death should match C");
  assertNumber(flashes[0], MZ_SHOTGUN | MZ_SILENCED, "Weapon_Shotgun should emit MZ_SHOTGUN plus silenced bit");
  assertNumber(player.client!.ps.gunframe, 9, "Weapon_Shotgun fire frame 8 should advance to frame 9");
  assertNumber(player.client!.kick_origin[0], -2, "Weapon_Shotgun should apply original kick origin");
  assertNumber(player.client!.kick_angles[0], -2, "Weapon_Shotgun should apply original kick angle");
  assertNumber(player.client!.pers.inventory[shells.index], 3, "Weapon_Shotgun should consume one shell");
  assertNumber(player.client!.silencer_shots, 0, "Weapon_Shotgun PlayerNoise should consume one silencer shot");
  assertBoolean(player.mynoise === null, true, "Weapon_Shotgun silenced PlayerNoise should suppress noise entity");

  runtime.deathmatch = true;
  runtime.dmflags |= DF_INFINITE_AMMO;
  player.client!.quad_framenum = 0;
  player.client!.silencer_shots = 0;
  player.client!.ps.gunframe = 8;
  player.client!.pers.inventory[shells.index] = 3;
  shots.length = 0;
  flashes.length = 0;

  Weapon_Shotgun(player, runtime, {
    fire_shotgun: (_ent, start, aimdir, damage, kick, hspread, vspread, count, mod) => {
      shots.push({ start, aimdir, damage, kick, hspread, vspread, count, mod });
    },
    emitPlayerMuzzleFlash: (_ent, weapon) => {
      flashes.push(weapon);
    }
  });

  assertNumber(shots[0].damage, 4, "Weapon_Shotgun base damage should match C");
  assertNumber(shots[0].kick, 8, "Weapon_Shotgun base kick should match C");
  assertNumber(shots[0].count, DEFAULT_DEATHMATCH_SHOTGUN_COUNT, "Weapon_Shotgun deathmatch pellet count should match C");
  assertNumber(flashes[0], MZ_SHOTGUN, "Weapon_Shotgun should emit unsilenced MZ_SHOTGUN");
  assertNumber(player.client!.pers.inventory[shells.index], 3, "DF_INFINITE_AMMO should prevent shotgun shell consumption");
  assertBoolean(player.mynoise === null, true, "Weapon_Shotgun deathmatch PlayerNoise should remain suppressed like C");

  runtime.deathmatch = false;
  player.client!.ps.gunframe = 8;
  shots.length = 0;
  flashes.length = 0;

  weapon_shotgun_fire(player, runtime, {
    fire_shotgun: (_ent, start, aimdir, damage, kick, hspread, vspread, count, mod) => {
      shots.push({ start, aimdir, damage, kick, hspread, vspread, count, mod });
    },
    emitPlayerMuzzleFlash: (_ent, weapon) => {
      flashes.push(weapon);
    }
  });

  assertBoolean(runtime.sound_entity === player.mynoise, true, "weapon_shotgun_fire should emit weapon noise when not silenced");
  assertVec3(player.mynoise!.s.origin, [100, 192, 314], "weapon_shotgun_fire weapon noise should use shotgun muzzle start");

  player.client!.ps.gunframe = 9;
  player.client!.pers.inventory[shells.index] = 3;
  runtime.dmflags = 0;
  shots.length = 0;
  flashes.length = 0;

  weapon_shotgun_fire(player, runtime, {
    fire_shotgun: (_ent, start, aimdir, damage, kick, hspread, vspread, count, mod) => {
      shots.push({ start, aimdir, damage, kick, hspread, vspread, count, mod });
    },
    emitPlayerMuzzleFlash: (_ent, weapon) => {
      flashes.push(weapon);
    }
  });

  assertNumber(player.client!.ps.gunframe, 10, "weapon_shotgun_fire frame 9 quirk should only advance gunframe");
  assertNumber(shots.length, 0, "weapon_shotgun_fire frame 9 quirk should not fire pellets");
  assertNumber(flashes.length, 0, "weapon_shotgun_fire frame 9 quirk should not emit a muzzleflash");
  assertNumber(player.client!.pers.inventory[shells.index], 3, "weapon_shotgun_fire frame 9 quirk should not consume shells");

  player.client!.weaponstate = weaponstate_t.WEAPON_READY;
  player.client!.ps.gunframe = 22;
  player.client!.buttons = 0;
  player.client!.latched_buttons = 0;
  shots.length = 0;
  withMathRandom([0.1], () => {
    Weapon_Shotgun(player, runtime, {
      fire_shotgun: (_ent, start, aimdir, damage, kick, hspread, vspread, count, mod) => {
        shots.push({ start, aimdir, damage, kick, hspread, vspread, count, mod });
      }
    });
  });
  assertNumber(player.client!.ps.gunframe, 22, "Weapon_Shotgun pause_frames should include frame 22");
  assertNumber(shots.length, 0, "Weapon_Shotgun pause frame should not fire while idling");

  player.client!.weaponstate = weaponstate_t.WEAPON_FIRING;
  player.client!.ps.gunframe = 10;
  shots.length = 0;
  Weapon_Shotgun(player, runtime, {
    fire_shotgun: (_ent, start, aimdir, damage, kick, hspread, vspread, count, mod) => {
      shots.push({ start, aimdir, damage, kick, hspread, vspread, count, mod });
    }
  });
  assertNumber(shots.length, 0, "Weapon_Shotgun fire_frames should only include frames 8 and 9");
  assertNumber(player.client!.ps.gunframe, 11, "Weapon_Shotgun non-fire frame should advance without firing");
}

function verifySuperShotgunFireParity(): void {
  const runtime = createHarnessRuntime();
  const player = createPlayer(runtime);
  const superShotgun = requireItem("Super Shotgun");
  const shells = requireItem("Shells");
  const shots: Array<{ start: readonly number[]; aimdir: readonly number[]; damage: number; kick: number; hspread: number; vspread: number; count: number; mod: number }> = [];
  const flashes: number[] = [];

  player.s.modelindex = 255;
  player.s.origin = [100, 200, 300];
  player.origin = [100, 200, 300];
  player.client!.pers.weapon = superShotgun;
  player.client!.ammo_index = shells.index;
  player.client!.pers.inventory[superShotgun.index] = 1;
  player.client!.pers.inventory[shells.index] = 6;
  player.client!.weaponstate = weaponstate_t.WEAPON_FIRING;
  player.client!.ps.gunframe = 7;
  player.client!.buttons = BUTTON_ATTACK;
  player.client!.v_angle = [0, 0, 0];
  player.client!.quad_framenum = runtime.framenum + 1;
  player.client!.silencer_shots = 1;

  Weapon_SuperShotgun(player, runtime, {
    fire_shotgun: (_ent, start, aimdir, damage, kick, hspread, vspread, count, mod) => {
      shots.push({ start, aimdir, damage, kick, hspread, vspread, count, mod });
    },
    emitPlayerMuzzleFlash: (_ent, weapon) => {
      flashes.push(weapon);
    }
  });

  assertNumber(shots.length, 2, "Weapon_SuperShotgun should fire two half-spread shotgun traces on frame 7");
  assertVec3(shots[0].start, [100, 192, 314], "Weapon_SuperShotgun first trace start should use original muzzle offset");
  assertVec3(shots[1].start, [100, 192, 314], "Weapon_SuperShotgun second trace start should reuse original muzzle offset");
  assertVec3Close(shots[0].aimdir, [0.9961946980917455, -0.08715574274765817, 0], "Weapon_SuperShotgun first trace should yaw -5 degrees");
  assertVec3Close(shots[1].aimdir, [0.9961946980917455, 0.08715574274765817, 0], "Weapon_SuperShotgun second trace should yaw +5 degrees");
  for (const shot of shots) {
    assertNumber(shot.damage, 24, "Weapon_SuperShotgun quad damage should match C");
    assertNumber(shot.kick, 48, "Weapon_SuperShotgun quad kick should match C");
    assertNumber(shot.hspread, DEFAULT_SHOTGUN_HSPREAD, "Weapon_SuperShotgun horizontal spread should match C");
    assertNumber(shot.vspread, DEFAULT_SHOTGUN_VSPREAD, "Weapon_SuperShotgun vertical spread should match C");
    assertNumber(shot.count, DEFAULT_SSHOTGUN_COUNT / 2, "Weapon_SuperShotgun should split pellet count in two");
    assertNumber(shot.mod, MOD_SSHOTGUN, "Weapon_SuperShotgun means-of-death should match C");
  }
  assertNumber(flashes[0], MZ_SSHOTGUN | MZ_SILENCED, "Weapon_SuperShotgun should emit MZ_SSHOTGUN plus silenced bit");
  assertNumber(player.client!.ps.gunframe, 8, "Weapon_SuperShotgun fire frame should advance once");
  assertNumber(player.client!.kick_origin[0], -2, "Weapon_SuperShotgun should apply original kick origin");
  assertNumber(player.client!.kick_angles[0], -2, "Weapon_SuperShotgun should apply original kick angle");
  assertNumber(player.client!.pers.inventory[shells.index], 4, "Weapon_SuperShotgun should consume two shells");
  assertNumber(player.client!.silencer_shots, 0, "Weapon_SuperShotgun PlayerNoise should consume one silencer shot");
  assertBoolean(player.mynoise === null, true, "Weapon_SuperShotgun silenced PlayerNoise should suppress noise entity");

  runtime.dmflags |= DF_INFINITE_AMMO;
  player.client!.quad_framenum = 0;
  player.client!.silencer_shots = 0;
  player.client!.ps.gunframe = 7;
  player.client!.pers.inventory[shells.index] = 4;
  shots.length = 0;
  flashes.length = 0;

  Weapon_SuperShotgun(player, runtime, {
    fire_shotgun: (_ent, start, aimdir, damage, kick, hspread, vspread, count, mod) => {
      shots.push({ start, aimdir, damage, kick, hspread, vspread, count, mod });
    },
    emitPlayerMuzzleFlash: (_ent, weapon) => {
      flashes.push(weapon);
    }
  });

  assertNumber(shots.length, 2, "Weapon_SuperShotgun should still fire two traces without quad");
  assertNumber(shots[0].damage, 6, "Weapon_SuperShotgun base damage should match C");
  assertNumber(shots[0].kick, 12, "Weapon_SuperShotgun base kick should match C");
  assertNumber(flashes[0], MZ_SSHOTGUN, "Weapon_SuperShotgun should emit unsilenced MZ_SSHOTGUN");
  assertNumber(player.client!.pers.inventory[shells.index], 4, "DF_INFINITE_AMMO should prevent super-shotgun shell consumption");

  runtime.dmflags = 0;
  player.client!.ps.gunframe = 7;
  shots.length = 0;
  flashes.length = 0;
  weapon_supershotgun_fire(player, runtime, {
    fire_shotgun: (_ent, start, aimdir, damage, kick, hspread, vspread, count, mod) => {
      shots.push({ start, aimdir, damage, kick, hspread, vspread, count, mod });
    },
    emitPlayerMuzzleFlash: (_ent, weapon) => {
      flashes.push(weapon);
    }
  });
  assertBoolean(runtime.sound_entity === player.mynoise, true, "weapon_supershotgun_fire should emit weapon noise when not silenced");
  assertVec3(player.mynoise!.s.origin, [100, 192, 314], "weapon_supershotgun_fire weapon noise should use shotgun muzzle start");

  player.client!.weaponstate = weaponstate_t.WEAPON_READY;
  player.client!.ps.gunframe = 29;
  player.client!.buttons = 0;
  player.client!.latched_buttons = 0;
  shots.length = 0;
  withMathRandom([0.1], () => {
    Weapon_SuperShotgun(player, runtime, {
      fire_shotgun: (_ent, start, aimdir, damage, kick, hspread, vspread, count, mod) => {
        shots.push({ start, aimdir, damage, kick, hspread, vspread, count, mod });
      }
    });
  });
  assertNumber(player.client!.ps.gunframe, 29, "Weapon_SuperShotgun pause_frames should include frame 29");
  assertNumber(shots.length, 0, "Weapon_SuperShotgun pause frame should not fire while idling");

  player.client!.weaponstate = weaponstate_t.WEAPON_FIRING;
  player.client!.ps.gunframe = 8;
  shots.length = 0;
  Weapon_SuperShotgun(player, runtime, {
    fire_shotgun: (_ent, start, aimdir, damage, kick, hspread, vspread, count, mod) => {
      shots.push({ start, aimdir, damage, kick, hspread, vspread, count, mod });
    }
  });
  assertNumber(shots.length, 0, "Weapon_SuperShotgun fire_frames should only include frame 7");
  assertNumber(player.client!.ps.gunframe, 9, "Weapon_SuperShotgun non-fire frame should advance without firing");
}

function verifyRocketLauncherFireParity(): void {
  const runtime = createHarnessRuntime();
  const player = createPlayer(runtime);
  const rocketLauncher = requireItem("Rocket Launcher");
  const rockets = requireItem("Rockets");
  const shots: Array<{ start: [number, number, number]; dir: [number, number, number]; damage: number; speed: number; damageRadius: number; radiusDamage: number }> = [];
  const flashes: number[] = [];

  player.s.modelindex = 255;
  player.s.origin = [0, 0, 0];
  player.client!.pers.weapon = rocketLauncher;
  player.client!.ammo_index = rockets.index;
  player.client!.pers.inventory[rocketLauncher.index] = 1;
  player.client!.weaponstate = weaponstate_t.WEAPON_FIRING;
  player.client!.ps.gunframe = 5;
  player.client!.buttons = BUTTON_ATTACK;
  player.client!.quad_framenum = runtime.framenum + 1;
  player.client!.silencer_shots = 1;
  player.client!.pers.inventory[rockets.index] = 3;

  withMathRandom([0.5], () => {
    Weapon_RocketLauncher_Fire(player, runtime, {
      fire_rocket: (_ent, start, dir, damage, speed, damageRadius, radiusDamage) => {
        shots.push({ start, dir, damage, speed, damageRadius, radiusDamage });
      },
      emitPlayerMuzzleFlash: (_ent, weapon) => {
        flashes.push(weapon);
      }
    });
  });

  assertNumber(shots.length, 1, "Weapon_RocketLauncher_Fire should spawn one rocket");
  assertNumber(shots[0].damage, 440, "Weapon_RocketLauncher_Fire quad randomized direct damage should match C");
  assertNumber(shots[0].speed, 650, "Weapon_RocketLauncher_Fire projectile speed should match C");
  assertNumber(shots[0].damageRadius, 120, "Weapon_RocketLauncher_Fire damage radius should match C");
  assertNumber(shots[0].radiusDamage, 480, "Weapon_RocketLauncher_Fire quad radius damage should match C");
  assertVec3(shots[0].start, [8, -8, player.viewheight - 8], "Weapon_RocketLauncher_Fire should project the original right-handed muzzle");
  assertVec3(shots[0].dir, [1, 0, 0], "Weapon_RocketLauncher_Fire should fire along AngleVectors forward");
  assertNumber(flashes[0], MZ_ROCKET | MZ_SILENCED, "Weapon_RocketLauncher_Fire should emit MZ_ROCKET plus silenced bit");
  assertNumber(player.client!.ps.gunframe, 6, "Weapon_RocketLauncher_Fire should advance gunframe");
  assertNumber(player.client!.kick_origin[0], -2, "Weapon_RocketLauncher_Fire should apply original kick origin");
  assertNumber(player.client!.kick_angles[0], -1, "Weapon_RocketLauncher_Fire should apply original kick angle");
  assertNumber(player.client!.pers.inventory[rockets.index], 2, "Weapon_RocketLauncher_Fire should consume one rocket");

  runtime.dmflags |= DF_INFINITE_AMMO;
  player.client!.quad_framenum = 0;
  player.client!.ps.gunframe = 5;
  player.client!.silencer_shots = 0;
  player.client!.pers.inventory[rockets.index] = 2;
  shots.length = 0;
  flashes.length = 0;

  withMathRandom([0.95], () => {
    Weapon_RocketLauncher(player, runtime, {
      fire_rocket: (_ent, start, dir, damage, speed, damageRadius, radiusDamage) => {
        shots.push({ start, dir, damage, speed, damageRadius, radiusDamage });
      },
      emitPlayerMuzzleFlash: (_ent, weapon) => {
        flashes.push(weapon);
      }
    });
  });

  assertNumber(shots[0].damage, 119, "Rocket launcher direct damage random range should match C");
  assertNumber(shots[0].radiusDamage, 120, "Rocket launcher non-quad radius damage should match C");
  assertVec3(shots[0].start, [8, -8, player.viewheight - 8], "Rocket launcher projectile start should use the original offset");
  assertVec3(shots[0].dir, [1, 0, 0], "Rocket launcher should fire along view forward");
  assertNumber(flashes[0], MZ_ROCKET, "Rocket launcher should emit MZ_ROCKET without silencer bit");
  assertNumber(player.client!.ps.gunframe, 6, "Rocket launcher firing frame should advance through Weapon_Generic");
  assertNumber(player.client!.pers.inventory[rockets.index], 2, "DF_INFINITE_AMMO should prevent rocket consumption");

  player.client!.weaponstate = weaponstate_t.WEAPON_READY;
  player.client!.ps.gunframe = 25;
  player.client!.buttons = 0;
  player.client!.latched_buttons = 0;
  shots.length = 0;
  withMathRandom([0.1], () => {
    Weapon_RocketLauncher(player, runtime, {
      fire_rocket: (_ent, start, dir, damage, speed, damageRadius, radiusDamage) => {
        shots.push({ start, dir, damage, speed, damageRadius, radiusDamage });
      }
    });
  });
  assertNumber(player.client!.ps.gunframe, 25, "Rocket launcher pause_frames should include frame 25");
  assertNumber(shots.length, 0, "Rocket launcher pause_frames should not fire while idling");

  player.client!.weaponstate = weaponstate_t.WEAPON_FIRING;
  player.client!.ps.gunframe = 6;
  shots.length = 0;
  Weapon_RocketLauncher(player, runtime, {
    fire_rocket: (_ent, start, dir, damage, speed, damageRadius, radiusDamage) => {
      shots.push({ start, dir, damage, speed, damageRadius, radiusDamage });
    }
  });
  assertNumber(shots.length, 0, "Rocket launcher fire_frames should only include frame 5");
  assertNumber(player.client!.ps.gunframe, 7, "Rocket launcher non-fire frame should advance without firing");
}

function verifyBlasterFireParity(): void {
  const runtime = createHarnessRuntime();
  const player = createPlayer(runtime);
  const blaster = requireItem("Blaster");
  const shots: Array<{ start: [number, number, number]; dir: [number, number, number]; damage: number; speed: number; effect: number; hyper: boolean }> = [];
  const flashes: number[] = [];

  player.s.modelindex = 255;
  player.s.origin = [100, 200, 300];
  player.client!.v_angle = [0, 0, 0];
  player.client!.pers.weapon = blaster;
  player.client!.ammo_index = 0;
  player.client!.pers.inventory[blaster.index] = 1;
  player.client!.weaponstate = weaponstate_t.WEAPON_FIRING;
  player.client!.ps.gunframe = 5;
  player.client!.buttons = BUTTON_ATTACK;
  player.client!.quad_framenum = runtime.framenum + 1;
  player.client!.silencer_shots = 1;

  Blaster_Fire(player, [2, -3, 4], 10, true, EF_HYPERBLASTER, runtime, {
    fire_blaster: (_ent, start, dir, damage, speed, effect, hyper) => {
      shots.push({ start, dir, damage, speed, effect, hyper });
    },
    emitPlayerMuzzleFlash: (_ent, weapon) => {
      flashes.push(weapon);
    }
  });

  assertNumber(shots.length, 1, "Blaster_Fire should spawn one bolt");
  assertVec3(shots[0].start, [126, 195, 318], "Blaster_Fire should add g_offset to the original muzzle offset");
  assertVec3(shots[0].dir, [1, 0, 0], "Blaster_Fire should fire along AngleVectors forward");
  assertNumber(shots[0].damage, 40, "Blaster_Fire should apply quad damage before spawning the bolt");
  assertNumber(shots[0].speed, 1000, "Blaster_Fire projectile speed should match C");
  assertNumber(shots[0].effect, EF_HYPERBLASTER, "Blaster_Fire should pass through the effect parameter");
  assertBoolean(shots[0].hyper, true, "Blaster_Fire should pass through the hyper flag");
  assertNumber(flashes[0], MZ_HYPERBLASTER | MZ_SILENCED, "Blaster_Fire should emit hyperblaster muzzleflash plus silenced bit");
  assertNumber(player.client!.silencer_shots, 0, "Blaster_Fire PlayerNoise should consume one silencer shot");
  assertBoolean(player.mynoise === null, true, "Blaster_Fire silenced PlayerNoise should not create a noise entity");
  assertNumber(player.client!.kick_origin[0], -2, "Blaster_Fire should apply original kick origin");
  assertNumber(player.client!.kick_angles[0], -1, "Blaster_Fire should apply original kick angle");

  player.client!.quad_framenum = 0;
  player.client!.silencer_shots = 0;
  player.client!.ps.gunframe = 5;
  shots.length = 0;
  flashes.length = 0;

  Weapon_Blaster_Fire(player, runtime, {
    fire_blaster: (_ent, start, dir, damage, speed, effect, hyper) => {
      shots.push({ start, dir, damage, speed, effect, hyper });
    },
    emitPlayerMuzzleFlash: (_ent, weapon) => {
      flashes.push(weapon);
    }
  });

  assertNumber(shots[0].damage, 10, "Weapon_Blaster_Fire solo damage should match C");
  assertNumber(shots[0].effect, EF_BLASTER, "Weapon_Blaster_Fire should pass EF_BLASTER");
  assertBoolean(shots[0].hyper, false, "Weapon_Blaster_Fire should fire a non-hyper bolt");
  assertNumber(flashes[0], MZ_BLASTER, "Weapon_Blaster_Fire should emit MZ_BLASTER");
  assertNumber(player.client!.ps.gunframe, 6, "Weapon_Blaster_Fire should advance gunframe");
  assertBoolean(runtime.sound_entity === player.mynoise, true, "Weapon_Blaster_Fire should emit weapon noise when not silenced");
  assertVec3(player.mynoise!.s.origin, [124, 192, 314], "Weapon_Blaster_Fire should place weapon noise at the muzzle");

  runtime.deathmatch = true;
  player.client!.ps.gunframe = 5;
  shots.length = 0;
  flashes.length = 0;

  Weapon_Blaster(player, runtime, {
    fire_blaster: (_ent, start, dir, damage, speed, effect, hyper) => {
      shots.push({ start, dir, damage, speed, effect, hyper });
    },
    emitPlayerMuzzleFlash: (_ent, weapon) => {
      flashes.push(weapon);
    }
  });

  assertNumber(shots[0].damage, 15, "Weapon_Blaster deathmatch damage should match C");
  assertVec3(shots[0].start, [124, 192, 314], "Weapon_Blaster projectile start should use the original offset");
  assertNumber(flashes[0], MZ_BLASTER, "Weapon_Blaster should emit MZ_BLASTER");
  assertNumber(player.client!.ps.gunframe, 6, "Weapon_Blaster fire_frames should include frame 5");

  runtime.deathmatch = false;
  player.client!.weaponstate = weaponstate_t.WEAPON_READY;
  player.client!.ps.gunframe = 19;
  player.client!.buttons = 0;
  player.client!.latched_buttons = 0;
  shots.length = 0;
  withMathRandom([0.1], () => {
    Weapon_Blaster(player, runtime, {
      fire_blaster: (_ent, start, dir, damage, speed, effect, hyper) => {
        shots.push({ start, dir, damage, speed, effect, hyper });
      }
    });
  });
  assertNumber(player.client!.ps.gunframe, 19, "Weapon_Blaster pause_frames should include frame 19");
  assertNumber(shots.length, 0, "Weapon_Blaster pause frame should not fire while idling");

  player.client!.weaponstate = weaponstate_t.WEAPON_FIRING;
  player.client!.ps.gunframe = 6;
  shots.length = 0;
  Weapon_Blaster(player, runtime, {
    fire_blaster: (_ent, start, dir, damage, speed, effect, hyper) => {
      shots.push({ start, dir, damage, speed, effect, hyper });
    }
  });
  assertNumber(shots.length, 0, "Weapon_Blaster fire_frames should only include frame 5");
  assertNumber(player.client!.ps.gunframe, 7, "Weapon_Blaster non-fire frame should advance without firing");
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

  weapon_grenadelauncher_fire(player, runtime, {
    fire_grenade: (_ent, start, dir, damage, speed, timer, damageRadius) => {
      shots.push({ start, dir, damage, speed, timer, damageRadius });
    },
    emitPlayerMuzzleFlash: (_ent, weapon) => {
      flashes.push(weapon);
    }
  });

  assertNumber(shots.length, 1, "weapon_grenadelauncher_fire should spawn one launched grenade");
  assertNumber(shots[0].damage, 480, "weapon_grenadelauncher_fire quad direct damage should match C");
  assertNumber(shots[0].damageRadius, 160, "weapon_grenadelauncher_fire radius should be damage + 40 before quad");
  assertNumber(shots[0].speed, 600, "weapon_grenadelauncher_fire projectile speed should match C");
  assertNumber(shots[0].timer, 2.5, "weapon_grenadelauncher_fire timer should match C");
  assertVec3(shots[0].start, [8, -8, player.viewheight - 8], "weapon_grenadelauncher_fire should project the original right-handed muzzle");
  assertVec3(shots[0].dir, [1, 0, 0], "weapon_grenadelauncher_fire should fire along AngleVectors forward");
  assertNumber(flashes[0], MZ_GRENADE, "weapon_grenadelauncher_fire should emit MZ_GRENADE");
  assertNumber(player.client!.ps.gunframe, 7, "weapon_grenadelauncher_fire should advance gunframe");
  assertNumber(player.client!.kick_origin[0], -2, "weapon_grenadelauncher_fire should apply original kick origin");
  assertNumber(player.client!.kick_angles[0], -1, "weapon_grenadelauncher_fire should apply original kick angle");
  assertNumber(player.client!.pers.inventory[grenades.index], 2, "weapon_grenadelauncher_fire should consume one grenade");

  player.client!.ps.gunframe = 6;
  player.client!.pers.inventory[grenades.index] = 3;
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

  player.client!.weaponstate = weaponstate_t.WEAPON_READY;
  player.client!.ps.gunframe = 34;
  player.client!.buttons = 0;
  player.client!.latched_buttons = 0;
  shots.length = 0;
  withMathRandom([0.1], () => {
    Weapon_GrenadeLauncher(player, runtime, {
      fire_grenade: (_ent, start, dir, damage, speed, timer, damageRadius) => {
        shots.push({ start, dir, damage, speed, timer, damageRadius });
      }
    });
  });
  assertNumber(player.client!.ps.gunframe, 34, "Grenade launcher pause_frames should include frame 34");
  assertNumber(shots.length, 0, "Grenade launcher pause_frames should not fire while idling");

  runtime.dmflags |= DF_INFINITE_AMMO;
  player.client!.weaponstate = weaponstate_t.WEAPON_FIRING;
  player.client!.quad_framenum = 0;
  player.client!.ps.gunframe = 7;
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

  assertNumber(shots.length, 0, "Grenade launcher fire_frames should only include frame 6");
  assertNumber(player.client!.ps.gunframe, 8, "Grenade launcher non-fire frame should advance without firing");
  assertNumber(player.client!.pers.inventory[grenades.index], 2, "DF_INFINITE_AMMO should prevent grenade consumption");

  player.client!.ps.gunframe = 6;
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
  assertNumber(player.client!.pers.inventory[grenades.index], 2, "DF_INFINITE_AMMO firing frame should prevent grenade consumption");
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

  const directRuntime = createHarnessRuntime();
  const directPlayer = createPlayer(directRuntime);
  const directCells = requireItem("Cells");
  const directShots: Array<{ start: [number, number, number]; dir: [number, number, number]; damage: number; speed: number; effect: number; hyper: boolean }> = [];
  const directFlashes: number[] = [];

  directPlayer.s.origin = [100, 200, 300];
  directPlayer.client!.v_angle = [0, 0, 0];
  directPlayer.client!.pers.weapon = hyperblaster;
  directPlayer.client!.ammo_index = directCells.index;
  directPlayer.client!.ps.gunframe = 6;
  directPlayer.client!.buttons = BUTTON_ATTACK;
  directPlayer.client!.ps.pmove.pm_flags = PMF_DUCKED;
  directPlayer.client!.silencer_shots = 1;
  directPlayer.client!.pers.inventory[directCells.index] = 2;

  Weapon_HyperBlaster_Fire(directPlayer, directRuntime, {
    fire_blaster: (_ent, start, dir, damage, speed, effect, hyper) => {
      directShots.push({ start, dir, damage, speed, effect, hyper });
    },
    emitPlayerMuzzleFlash: (_ent, weapon) => {
      directFlashes.push(weapon);
    }
  });

  assertNumber(directShots.length, 1, "Weapon_HyperBlaster_Fire direct call should spawn one bolt");
  assertVec3Close(directShots[0].start, [120.53589838486225, 192, 316], "Weapon_HyperBlaster_Fire frame 6 should use the original circular muzzle offset");
  assertVec3(directShots[0].dir, [1, 0, 0], "Weapon_HyperBlaster_Fire should fire along AngleVectors forward");
  assertNumber(directShots[0].damage, 20, "Weapon_HyperBlaster_Fire direct solo damage should match C");
  assertNumber(directShots[0].speed, 1000, "Weapon_HyperBlaster_Fire direct projectile speed should match C");
  assertNumber(directShots[0].effect, EF_HYPERBLASTER, "Weapon_HyperBlaster_Fire frame 6 should set EF_HYPERBLASTER directly");
  assertBoolean(directShots[0].hyper, true, "Weapon_HyperBlaster_Fire should pass the hyper flag to Blaster_Fire");
  assertNumber(directFlashes[0], MZ_HYPERBLASTER | MZ_SILENCED, "Weapon_HyperBlaster_Fire should emit hyperblaster muzzleflash plus silenced bit");
  assertNumber(directPlayer.client!.silencer_shots, 0, "Weapon_HyperBlaster_Fire should consume one silencer shot through PlayerNoise");
  assertNumber(directPlayer.client!.anim_priority, ANIM_ATTACK, "Weapon_HyperBlaster_Fire should set attack animation priority");
  assertNumber(directPlayer.s.frame, playerFrames.FRAME_crattak1 - 1, "Weapon_HyperBlaster_Fire ducked animation start frame mismatch");
  assertNumber(directPlayer.client!.anim_end, playerFrames.FRAME_crattak9, "Weapon_HyperBlaster_Fire ducked animation end frame mismatch");

  directRuntime.dmflags |= DF_INFINITE_AMMO;
  directPlayer.client!.ps.gunframe = 8;
  directPlayer.client!.buttons = BUTTON_ATTACK;
  directPlayer.client!.ps.pmove.pm_flags = 0;
  directPlayer.client!.pers.inventory[directCells.index] = 2;
  directShots.length = 0;
  directFlashes.length = 0;

  Weapon_HyperBlaster_Fire(directPlayer, directRuntime, {
    fire_blaster: (_ent, start, dir, damage, speed, effect, hyper) => {
      directShots.push({ start, dir, damage, speed, effect, hyper });
    }
  });

  assertVec3Close(directShots[0].start, [124, 192, 310], "Weapon_HyperBlaster_Fire frame 8 should rotate the muzzle offset below center");
  assertNumber(directShots[0].effect, 0, "Weapon_HyperBlaster_Fire frame 8 should not set EF_HYPERBLASTER");
  assertNumber(directPlayer.client!.pers.inventory[directCells.index], 2, "Weapon_HyperBlaster_Fire should honor DF_INFINITE_AMMO");
  assertNumber(directPlayer.s.frame, playerFrames.FRAME_attack1 - 1, "Weapon_HyperBlaster_Fire standing animation start frame mismatch");
  assertNumber(directPlayer.client!.anim_end, playerFrames.FRAME_attack8, "Weapon_HyperBlaster_Fire standing animation end frame mismatch");
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

  player.s.origin = [100, 200, 300];
  player.origin = [100, 200, 300];
  player.client!.v_angle = [0, 0, 0];
  player.client!.quad_framenum = runtime.framenum + 1;
  player.client!.ps.gunframe = 4;
  player.client!.silencer_shots = 1;
  player.client!.pers.inventory[slugs.index] = 3;
  shots.length = 0;
  flashes.length = 0;

  weapon_railgun_fire(player, runtime, {
    fire_rail: (_ent, start, dir, damage, kick) => {
      shots.push({ start, dir, damage, kick });
    },
    emitPlayerMuzzleFlash: (_ent, weapon) => {
      flashes.push(weapon);
    }
  });

  assertVec3(shots[0].start, [100, 193, 314], "weapon_railgun_fire direct start should match the C offset");
  assertVec3(shots[0].dir, [1, 0, 0], "weapon_railgun_fire direct direction should use AngleVectors forward");
  assertNumber(shots[0].damage, 600, "weapon_railgun_fire direct quad damage should match C");
  assertNumber(shots[0].kick, 1000, "weapon_railgun_fire direct quad kick should match C");
  assertNumber(flashes[0], MZ_RAILGUN | MZ_SILENCED, "weapon_railgun_fire direct muzzleflash should include the silenced bit");
  assertNumber(player.client!.silencer_shots, 0, "weapon_railgun_fire should consume one silencer shot through PlayerNoise");

  runtime.deathmatch = true;
  runtime.dmflags |= DF_INFINITE_AMMO;
  player.client!.quad_framenum = 0;
  player.client!.ps.gunframe = 4;
  player.client!.silencer_shots = 0;
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

  player.client!.weaponstate = weaponstate_t.WEAPON_READY;
  player.client!.ps.gunframe = 56;
  player.client!.buttons = 0;
  player.client!.latched_buttons = 0;
  shots.length = 0;
  withMathRandom([0.1], () => {
    Weapon_Railgun(player, runtime, {
      fire_rail: (_ent, start, dir, damage, kick) => {
        shots.push({ start, dir, damage, kick });
      }
    });
  });
  assertNumber(player.client!.ps.gunframe, 19, "Weapon_Railgun idle-last pause frame 56 should wrap to the C idle first frame");
  assertNumber(shots.length, 0, "Weapon_Railgun idle-last pause frame should not fire while idling");

  player.client!.weaponstate = weaponstate_t.WEAPON_FIRING;
  player.client!.ps.gunframe = 5;
  shots.length = 0;
  Weapon_Railgun(player, runtime, {
    fire_rail: (_ent, start, dir, damage, kick) => {
      shots.push({ start, dir, damage, kick });
    }
  });
  assertNumber(shots.length, 0, "Weapon_Railgun fire_frames should only include frame 4");
  assertNumber(player.client!.ps.gunframe, 6, "Weapon_Railgun non-fire frame should advance without firing");
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
  player.client!.silencer_shots = 1;

  Weapon_BFG(player, runtime, {
    emitPlayerMuzzleFlash: (_ent, weapon) => {
      flashes.push(weapon);
    },
    fire_bfg: (_ent, start, dir, damage, speed, damageRadius) => {
      shots.push({ start, dir, damage, speed, damageRadius });
    }
  });

  assertNumber(flashes[0], MZ_BFG | MZ_SILENCED, "BFG frame 9 should emit the warmup muzzleflash with the silenced bit");
  assertNumber(shots.length, 0, "BFG frame 9 should not launch the projectile yet");
  assertNumber(player.client!.ps.gunframe, 10, "BFG frame 9 should advance after the muzzleflash");
  assertNumber(player.client!.silencer_shots, 0, "BFG frame 9 should consume one silencer shot through PlayerNoise");
  assertBoolean(runtime.sound_entity === player.mynoise, true, "BFG frame 9 should emit weapon noise at player origin");

  player.client!.ps.gunframe = 9;
  player.client!.silencer_shots = 0;
  flashes.length = 0;
  weapon_bfg_fire(player, runtime, {
    emitPlayerMuzzleFlash: (_ent, weapon) => {
      flashes.push(weapon);
    },
    fire_bfg: (_ent, start, dir, damage, speed, damageRadius) => {
      shots.push({ start, dir, damage, speed, damageRadius });
    }
  });
  assertNumber(flashes[0], MZ_BFG, "weapon_bfg_fire direct warmup should emit MZ_BFG");
  assertNumber(player.client!.ps.gunframe, 10, "weapon_bfg_fire direct warmup should advance gunframe");

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
  assertNumber(shots[0].start[1], -8, "BFG projectile start should project the original right offset");
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

  player.client!.weaponstate = weaponstate_t.WEAPON_READY;
  player.client!.ps.gunframe = 39;
  player.client!.buttons = 0;
  player.client!.latched_buttons = 0;
  shots.length = 0;
  withMathRandom([0.1], () => {
    Weapon_BFG(player, runtime, {
      fire_bfg: (_ent, start, dir, damage, speed, damageRadius) => {
        shots.push({ start, dir, damage, speed, damageRadius });
      }
    });
  });
  assertNumber(player.client!.ps.gunframe, 39, "Weapon_BFG pause_frames should include frame 39");
  assertNumber(shots.length, 0, "Weapon_BFG pause frame should not fire while idling");

  player.client!.weaponstate = weaponstate_t.WEAPON_FIRING;
  player.client!.ps.gunframe = 10;
  player.client!.pers.inventory[cells.index] = 50;
  shots.length = 0;
  Weapon_BFG(player, runtime, {
    fire_bfg: (_ent, start, dir, damage, speed, damageRadius) => {
      shots.push({ start, dir, damage, speed, damageRadius });
    }
  });
  assertNumber(shots.length, 0, "Weapon_BFG fire_frames should only include frames 9 and 17");
  assertNumber(player.client!.ps.gunframe, 11, "Weapon_BFG non-fire frame should advance without firing");
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

function assertNumberClose(actual: number, expected: number, label: string, epsilon = 1e-9): void {
  if (Math.abs(actual - expected) > epsilon) {
    throw new Error(`${label}: attendu ${expected}, recu ${actual}`);
  }
}

function assertVec3Close(actual: readonly number[], expected: readonly number[], label: string, epsilon = 1e-9): void {
  for (let index = 0; index < 3; index += 1) {
    assertNumberClose(actual[index] ?? NaN, expected[index] ?? NaN, `${label}[${index}]`, epsilon);
  }
}
