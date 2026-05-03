/**
 * File: quake2-p-client.ts
 * Purpose: Verify the player-client lifecycle helpers ported from `game/p_client.c`.
 *
 * This file is not a direct source port.
 * It is a focused verification harness for default runtime wiring in `p_client.ts`.
 *
 * Dependencies:
 * - packages/game
 */

import { strict as assert } from "node:assert";

import { DF_QUAD_DROP } from "../../packages/qcommon/src/index.js";
import {
  BODY_QUEUE_SIZE,
  DEAD_DEAD,
  DROPPED_PLAYER_ITEM,
  MOD_BFG_BLAST,
  MOD_BFG_EFFECT,
  MOD_BFG_LASER,
  MOD_BLASTER,
  MOD_BARREL,
  MOD_BOMB,
  MOD_CHAINGUN,
  MOD_CRUSH,
  MOD_EXIT,
  MOD_EXPLOSIVE,
  MOD_FALLING,
  MOD_FRIENDLY_FIRE,
  MOD_G_SPLASH,
  MOD_GRENADE,
  MOD_HANDGRENADE,
  MOD_HELD_GRENADE,
  MOD_HG_SPLASH,
  MOD_HIT,
  MOD_HYPERBLASTER,
  MOD_LAVA,
  MOD_MACHINEGUN,
  MOD_R_SPLASH,
  MOD_RAILGUN,
  MOD_ROCKET,
  MOD_SHOTGUN,
  MOD_SLIME,
  MOD_SPLASH,
  MOD_SSHOTGUN,
  MOD_SUICIDE,
  MOD_TARGET_BLASTER,
  MOD_TARGET_LASER,
  MOD_TELEFRAG,
  MOD_TRIGGER_HURT,
  MOD_WATER,
  damage_t
} from "../../packages/game/src/g_local.js";
import { FindItem } from "../../packages/game/src/g_items.js";
import {
  ClientConnect,
  ClientObituary,
  CopyToBodyQue,
  InitBodyQue,
  TossClientWeapon,
  player_die
} from "../../packages/game/src/p_client.js";
import {
  attachGameClient,
  createGameRuntimeFromBspEntities,
  drainGameSoundEvents,
  spawnGameEntity,
  type GameRuntime
} from "../../packages/game/src/runtime.js";

main();

function main(): void {
  verifyBodyQueueUsesOriginalSizeAndWraps();
  verifyClientConnectRespectsAutosavedPersistentState();
  verifyClientObituaryWeaponMeansOfDeath();
  verifyClientObituaryWorldMeansOfDeath();
  verifyTossClientWeaponUsesDefaultDropItem();
  verifyPlayerDieUsesDefaultSoundAndGibs();

  console.log("Verification p_client - player lifecycle defaults OK");
}

function verifyClientObituaryWeaponMeansOfDeath(): void {
  const cases: Array<[number, string]> = [
    [MOD_BLASTER, "victim was blasted by attacker\n"],
    [MOD_SHOTGUN, "victim was gunned down by attacker\n"],
    [MOD_SSHOTGUN, "victim was blown away by attacker's super shotgun\n"],
    [MOD_MACHINEGUN, "victim was machinegunned by attacker\n"],
    [MOD_CHAINGUN, "victim was cut in half by attacker's chaingun\n"],
    [MOD_GRENADE, "victim was popped by attacker's grenade\n"],
    [MOD_G_SPLASH, "victim was shredded by attacker's shrapnel\n"],
    [MOD_ROCKET, "victim ate attacker's rocket\n"],
    [MOD_R_SPLASH, "victim almost dodged attacker's rocket\n"],
    [MOD_HYPERBLASTER, "victim was melted by attacker's hyperblaster\n"],
    [MOD_RAILGUN, "victim was railed by attacker\n"],
    [MOD_BFG_LASER, "victim saw the pretty lights from attacker's BFG\n"],
    [MOD_BFG_BLAST, "victim was disintegrated by attacker's BFG blast\n"],
    [MOD_BFG_EFFECT, "victim couldn't hide from attacker's BFG\n"],
    [MOD_HANDGRENADE, "victim caught attacker's handgrenade\n"],
    [MOD_HG_SPLASH, "victim didn't see attacker's handgrenade\n"],
    [MOD_HELD_GRENADE, "victim feels attacker's pain\n"],
    [MOD_TELEFRAG, "victim tried to invade attacker's personal space\n"]
  ];

  for (const [mod, expected] of cases) {
    const runtime = createHarnessRuntime();
    runtime.deathmatch = true;
    runtime.meansOfDeath = mod;
    const victim = spawnGameEntity(runtime);
    attachGameClient(victim);
    victim.client!.pers.netname = "victim";
    const attacker = spawnGameEntity(runtime);
    attachGameClient(attacker);
    attacker.client!.pers.netname = "attacker";

    const prints: string[] = [];
    ClientObituary(victim, null, attacker, runtime, {
      onPrint: (_level, message) => {
        prints.push(message);
      }
    });

    assert.deepEqual(prints, [expected], `ClientObituary message mismatch for mod ${mod}`);
    assert.equal(victim.enemy, attacker, `ClientObituary should assign attacker enemy for mod ${mod}`);
    assert.equal(attacker.client!.resp.score, 1, `ClientObituary should credit attacker for mod ${mod}`);
  }
}

function verifyClientObituaryWorldMeansOfDeath(): void {
  const worldCases: Array<[number, string]> = [
    [MOD_SUICIDE, "victim suicides.\n"],
    [MOD_FALLING, "victim cratered.\n"],
    [MOD_CRUSH, "victim was squished.\n"],
    [MOD_WATER, "victim sank like a rock.\n"],
    [MOD_SLIME, "victim melted.\n"],
    [MOD_LAVA, "victim does a back flip into the lava.\n"],
    [MOD_EXPLOSIVE, "victim blew up.\n"],
    [MOD_BARREL, "victim blew up.\n"],
    [MOD_EXIT, "victim found a way out.\n"],
    [MOD_TARGET_LASER, "victim saw the light.\n"],
    [MOD_TARGET_BLASTER, "victim got blasted.\n"],
    [MOD_BOMB, "victim was in the wrong place.\n"],
    [MOD_SPLASH, "victim was in the wrong place.\n"],
    [MOD_TRIGGER_HURT, "victim was in the wrong place.\n"]
  ];

  for (const [mod, expected] of worldCases) {
    const runtime = createHarnessRuntime();
    runtime.deathmatch = true;
    runtime.meansOfDeath = mod;
    const victim = spawnGameEntity(runtime);
    const client = attachGameClient(victim);
    client.pers.netname = "victim";

    const prints: string[] = [];
    ClientObituary(victim, null, null, runtime, {
      onPrint: (_level, message) => {
        prints.push(message);
      }
    });

    assert.deepEqual(prints, [expected], `ClientObituary world message mismatch for mod ${mod}`);
    assert.equal(victim.enemy, null, `ClientObituary should not assign enemy for world mod ${mod}`);
    assert.equal(client.resp.score, -1, `ClientObituary should penalize victim for world mod ${mod}`);
  }

  const runtime = createHarnessRuntime();
  runtime.deathmatch = true;
  runtime.meansOfDeath = MOD_HELD_GRENADE;
  const victim = spawnGameEntity(runtime);
  const client = attachGameClient(victim);
  client.pers.netname = "victim";

  const prints: string[] = [];
  ClientObituary(victim, null, victim, runtime, {
    onPrint: (_level, message) => {
      prints.push(message);
    }
  });

  assert.deepEqual(prints, ["victim tried to put the pin back in.\n"], "ClientObituary held grenade suicide message mismatch");
  assert.equal(victim.enemy, null, "ClientObituary held grenade suicide must clear enemy");
  assert.equal(client.resp.score, -1, "ClientObituary held grenade suicide should penalize victim");

  const defaultRuntime = createHarnessRuntime();
  defaultRuntime.deathmatch = true;
  defaultRuntime.meansOfDeath = MOD_HIT;
  const defaultVictim = spawnGameEntity(defaultRuntime);
  attachGameClient(defaultVictim).pers.netname = "victim";
  const defaultPrints: string[] = [];
  ClientObituary(defaultVictim, null, null, defaultRuntime, {
    onPrint: (_level, message) => {
      defaultPrints.push(message);
    }
  });
  assert.deepEqual(defaultPrints, ["victim died.\n"], "ClientObituary MOD_HIT world fallback mismatch");

  const friendlyRuntime = createHarnessRuntime();
  friendlyRuntime.deathmatch = true;
  friendlyRuntime.meansOfDeath = MOD_BLASTER | MOD_FRIENDLY_FIRE;
  const friendlyVictim = spawnGameEntity(friendlyRuntime);
  attachGameClient(friendlyVictim).pers.netname = "victim";
  const friendlyAttacker = spawnGameEntity(friendlyRuntime);
  const friendlyAttackerClient = attachGameClient(friendlyAttacker);
  friendlyAttackerClient.pers.netname = "attacker";
  const friendlyPrints: string[] = [];
  ClientObituary(friendlyVictim, null, friendlyAttacker, friendlyRuntime, {
    onPrint: (_level, message) => {
      friendlyPrints.push(message);
    }
  });
  assert.deepEqual(friendlyPrints, ["victim was blasted by attacker\n"], "ClientObituary friendly-fire message mismatch");
  assert.equal(friendlyAttackerClient.resp.score, -1, "ClientObituary friendly fire should penalize attacker");
}

function verifyClientConnectRespectsAutosavedPersistentState(): void {
  const runtime = createHarnessRuntime();
  const player = spawnGameEntity(runtime);
  const client = attachGameClient(player);
  const shotgun = requireItem("Shotgun");
  const blaster = requireItem("Blaster");

  client.pers.weapon = shotgun;
  player.inuse = false;
  runtime.autosaved = false;
  assert.equal(ClientConnect(player, "\\name\\manual", runtime), true, "ClientConnect should accept manual connects");
  assert.equal(client.pers.weapon, blaster, "manual ClientConnect should reinitialize pers.weapon like non-autosaved C loads");

  player.inuse = false;
  client.pers.weapon = shotgun;
  runtime.autosaved = true;
  assert.equal(ClientConnect(player, "\\name\\auto", runtime), true, "ClientConnect should accept autosaved connects");
  assert.equal(client.pers.weapon, shotgun, "autosaved ClientConnect should preserve existing pers.weapon");
}

function verifyBodyQueueUsesOriginalSizeAndWraps(): void {
  const runtime = createHarnessRuntime();
  const player = spawnGameEntity(runtime);
  attachGameClient(player);
  player.inuse = true;
  player.classname = "player";
  player.s.origin = [32, 64, 96];
  player.origin = [32, 64, 96];
  player.s.angles = [0, 90, 0];
  player.angles = [0, 90, 0];
  player.mins = [-16, -16, -24];
  player.maxs = [16, 16, 32];
  player.solid = 1;

  InitBodyQue(runtime);

  const bodies = runtime.entities.filter((entity) => entity.classname === "bodyque");
  assert.equal(bodies.length, BODY_QUEUE_SIZE, "InitBodyQue should allocate the original body queue size");

  let firstBody = null as (typeof player) | null;
  CopyToBodyQue(player, runtime, {
    onBodyQueueCopy: (_source, body) => {
      firstBody = body;
    }
  });
  assert.ok(firstBody, "CopyToBodyQue should target a queued body");
  assert.equal(firstBody.s.number, firstBody.index, "CopyToBodyQue should preserve the body edict number");
  assert.deepEqual(firstBody.s.origin, player.s.origin, "CopyToBodyQue should copy the player origin");
  assert.equal(runtime.body_que, 1, "CopyToBodyQue should advance the body queue");

  for (let i = 1; i < BODY_QUEUE_SIZE; i += 1) {
    CopyToBodyQue(player, runtime);
  }
  assert.equal(runtime.body_que, 0, "CopyToBodyQue should wrap with BODY_QUEUE_SIZE");
}

function verifyTossClientWeaponUsesDefaultDropItem(): void {
  const runtime = createHarnessRuntime();
  runtime.deathmatch = true;
  runtime.dmflags = DF_QUAD_DROP;
  runtime.framenum = 10;
  runtime.time = 3;

  const player = spawnGameEntity(runtime);
  attachGameClient(player);
  const shotgun = requireItem("Shotgun");
  const shells = requireItem("Shells");

  player.client!.pers.weapon = shotgun;
  player.client!.ammo_index = shells.index;
  player.client!.pers.inventory[shells.index] = 4;
  player.client!.quad_framenum = 40;

  TossClientWeapon(player, runtime);

  const droppedWeapon = runtime.entities.find((entity) => entity.classname === shotgun.classname);
  assert.ok(droppedWeapon, "TossClientWeapon should drop the current non-blaster weapon without a hook");
  assert.equal(droppedWeapon.spawnflags, DROPPED_PLAYER_ITEM, "dropped weapon should be marked as DROPPED_PLAYER_ITEM");

  const droppedQuad = runtime.entities.find((entity) => entity.classname === "item_quad");
  assert.ok(droppedQuad, "TossClientWeapon should drop active quad without a hook");
  assert.ok((droppedQuad.spawnflags & DROPPED_PLAYER_ITEM) !== 0, "dropped quad should preserve DROPPED_PLAYER_ITEM");
  assert.ok(droppedQuad.touch, "dropped quad should be touchable like the original Touch_Item path");
}

function verifyPlayerDieUsesDefaultSoundAndGibs(): void {
  const runtime = createHarnessRuntime();
  runtime.deathmatch = true;
  runtime.time = 12;

  const player = spawnGameEntity(runtime);
  attachGameClient(player);
  player.inuse = true;
  player.classname = "player";
  player.health = -50;
  player.client!.pers.netname = "unit";

  player_die(player, null, player, 80, runtime);

  assert.equal(player.deadflag, DEAD_DEAD, "player_die should mark the player dead");
  assert.equal(player.takedamage, damage_t.DAMAGE_NO, "gibbed player should no longer take damage");
  assert.ok(
    player.model === "models/objects/gibs/head2/tris.md2" || player.model === "models/objects/gibs/skull/tris.md2",
    "gibbed player should become the client head/skull entity"
  );

  const meatGibs = runtime.entities.filter((entity) => entity.model === "models/objects/gibs/sm_meat/tris.md2");
  assert.equal(meatGibs.length, 4, "player_die should spawn the four original meat gibs");

  const sounds = drainGameSoundEvents(runtime);
  assert.ok(
    sounds.some((event) => event.soundPath === "misc/udeath.wav"),
    "player_die should queue the default universal death sound"
  );
}

function createHarnessRuntime(): GameRuntime {
  const runtime = createGameRuntimeFromBspEntities([{ properties: { classname: "worldspawn" } }]);
  runtime.maxclients = 1;
  return runtime;
}

function requireItem(pickupName: string) {
  const item = FindItem(pickupName);
  assert.ok(item, `missing item ${pickupName}`);
  return item;
}
