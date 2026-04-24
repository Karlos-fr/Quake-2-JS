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
import { DEAD_DEAD, DROPPED_PLAYER_ITEM, damage_t } from "../../packages/game/src/g-local.js";
import { FindItem } from "../../packages/game/src/g_items.js";
import {
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
  verifyTossClientWeaponUsesDefaultDropItem();
  verifyPlayerDieUsesDefaultSoundAndGibs();

  console.log("Verification p_client - player lifecycle defaults OK");
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
