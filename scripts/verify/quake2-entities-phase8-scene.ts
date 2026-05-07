/**
 * File: quake2-entities-phase8-scene.ts
 * Purpose: Verify one synthetic animated scene combining world-entity animation rules, entity events and temp-entity refresh output.
 *
 * This file is not a direct source port.
 * It is a verification harness for closing phase 8 of the visible-entities plan.
 *
 * Dependencies:
 * - packages/client
 * - packages/qcommon
 */

import {
  CL_AddTEntPacket,
  CL_BuildPacketEntitySnapshots,
  CL_BuildRefreshFrame,
  CL_FireEntityEvents,
  createClientRuntime
} from "../../packages/client/src/index.js";
import {
  CS_MODELS,
  EF_BFG,
  EF_PENT,
  EF_POWERSCREEN,
  EF_ANIM_ALLFAST,
  EF_TELEPORTER,
  RF_SHELL_GREEN,
  RF_SHELL_RED,
  RF_TRANSLUCENT,
  temp_event_t,
  createEntityState
} from "../../packages/qcommon/src/index.js";

main();

/**
 * Category: New
 * Purpose: Execute a synthetic mixed scene covering animated entities plus temp-entity integration.
 */
function main(): void {
  const runtime = createSeededRuntime();
  seedAnimatedEntities(runtime);
  verifyEntityEvents(runtime);
  verifyPacketEntityRendering();
  seedTempEntityPackets(runtime);
  verifyRefreshScene(runtime);

  console.log("Verification phase 8 scene - animated entities and temp-entity links OK");
}

/**
 * Category: New
 * Purpose: Verify `CL_AddPacketEntities`-equivalent refresh output for shells, linked models and powerscreen reset rules.
 */
function verifyPacketEntityRendering(): void {
  const runtime = createClientRuntime();
  runtime.cl.frame.valid = true;
  runtime.cl.frame.serverframe = 4;
  runtime.cl.frame.num_entities = 2;
  runtime.cl.frame.parse_entities = 0;
  runtime.cl.time = 1500;
  runtime.cl.lerpfrac = 0.5;
  runtime.cl.playernum = 99;
  runtime.cl.frame.playerstate.fov = 90;

  runtime.cl.configstrings[CS_MODELS + 1] = "models/items/quad/tris.md2";
  runtime.cl.configstrings[CS_MODELS + 2] = "models/items/shell/tris.md2";
  runtime.cl.configstrings[CS_MODELS + 3] = "models/items/linked3/tris.md2";
  runtime.cl.configstrings[CS_MODELS + 4] = "models/items/linked4/tris.md2";

  const shelled = createEntityState();
  shelled.number = 7;
  shelled.modelindex = 1;
  shelled.modelindex2 = 0x80 | 2;
  shelled.modelindex3 = 3;
  shelled.modelindex4 = 4;
  shelled.frame = 5;
  shelled.effects = EF_PENT | EF_BFG | EF_POWERSCREEN;
  shelled.origin = [100, 0, 0];

  const viewer = createEntityState();
  viewer.number = 1;
  viewer.modelindex = 1;
  viewer.effects = EF_PENT;
  viewer.origin = [200, 0, 0];
  runtime.cl.playernum = 0;

  runtime.cl_parse_entities[0] = cloneEntityState(shelled);
  runtime.cl_parse_entities[1] = cloneEntityState(viewer);
  copyIntoCentity(runtime, shelled);
  copyIntoCentity(runtime, viewer);

  const snapshots = CL_BuildPacketEntitySnapshots(runtime);
  assertNumber(snapshots.length, 2, "CL_AddPacketEntities snapshot count");
  assertBoolean((snapshots[0]?.effects ?? 0) !== shelled.effects, true, "EF_PENT should be converted before rendering");

  const refresh = CL_BuildRefreshFrame(runtime, { predictMovement: false });
  const shellBase = refresh.entities.find((entity) => entity.entityNumber === 7 && entity.linkedModelSlot === 0);
  const colorShell = refresh.entities.find((entity) => entity.entityNumber === 7 && entity.linkedModelSlot === 1);
  const translucentLinked = refresh.entities.find((entity) => entity.entityNumber === 7 && entity.linkedModelSlot === 2);
  const linked3 = refresh.entities.find((entity) => entity.entityNumber === 7 && entity.linkedModelSlot === 3);
  const powerScreen = refresh.entities.find((entity) => entity.entityNumber === 7 && entity.linkedModelSlot === 5);

  assertNumber(refresh.entities.filter((entity) => entity.entityNumber === 1).length, 0, "viewer entity should not be emitted");
  assertNumber(shellBase?.alpha ?? 0, 0.3, "EF_BFG main entity alpha");
  assertBoolean(((shellBase?.flags ?? 0) & RF_TRANSLUCENT) !== 0, true, "EF_BFG main entity translucent flag");
  assertBoolean(((colorShell?.flags ?? 0) & RF_SHELL_RED) !== 0, true, "EF_PENT color shell renderfx");
  assertBoolean(((colorShell?.flags ?? 0) & RF_TRANSLUCENT) !== 0, true, "color shell translucent flag");
  assertNumber(translucentLinked?.modelindex ?? -1, 2, "modelindex2 high bit stripped");
  assertNumber(translucentLinked?.alpha ?? 0, 0.32, "translucent linked model alpha");
  assertNumber(linked3?.alpha ?? 0, 1, "linked model alpha reset");
  assertNumber(linked3?.flags ?? -1, 0, "linked model flags reset");
  assertBoolean(((powerScreen?.flags ?? 0) & RF_SHELL_GREEN) !== 0, true, "powerscreen shell flag");
  assertNumber(runtime.cl_entities[7].lerp_origin[0], 100, "centity lerp_origin updated");
}

/**
 * Category: New
 * Purpose: Create the minimal seeded client runtime needed by the synthetic phase-8 scene.
 */
function createSeededRuntime(): ReturnType<typeof createClientRuntime> {
  const runtime = createClientRuntime();
  runtime.cl.frame.valid = true;
  runtime.cl.frame.serverframe = 1;
  runtime.cl.frame.servertime = 1500;
  runtime.cl.frame.num_entities = 2;
  runtime.cl.frame.parse_entities = 0;
  runtime.cl.time = 1500;
  runtime.cl.lerpfrac = 0;
  runtime.cl.playernum = 99;
  runtime.cl.frame.playerstate.fov = 90;
  runtime.cl.frame.playerstate.gunindex = 0;
  runtime.cl.configstrings[33] = "models/objects/dmspot/tris.md2";
  runtime.cl.configstrings[34] = "models/objects/banner/tris.md2";
  return runtime;
}

/**
 * Category: New
 * Purpose: Seed two visible entity states into the current frame so entity animation and event extraction can be tested.
 */
function seedAnimatedEntities(runtime: ReturnType<typeof createClientRuntime>): void {
  const teleporter = createEntityState();
  teleporter.number = 1;
  teleporter.modelindex = 1;
  teleporter.effects = EF_TELEPORTER;
  teleporter.origin = [10, 20, 30];

  const banner = createEntityState();
  banner.number = 2;
  banner.modelindex = 2;
  banner.effects = EF_ANIM_ALLFAST;
  banner.frame = 7;
  banner.event = 13;
  banner.origin = [40, 50, 60];

  runtime.cl_parse_entities[0] = cloneEntityState(teleporter);
  runtime.cl_parse_entities[1] = cloneEntityState(banner);
  copyIntoCentity(runtime, teleporter);
  copyIntoCentity(runtime, banner);
}

/**
 * Category: New
 * Purpose: Verify the client event bridge preserves both explicit entity events and `EF_TELEPORTER` event-like behavior.
 */
function verifyEntityEvents(runtime: ReturnType<typeof createClientRuntime>): void {
  const events = CL_FireEntityEvents(runtime, runtime.cl.frame);
  assertNumber(events.length, 2, "entity event count");
  assertBoolean(events.some((event) => event.number === 1 && (event.effects & EF_TELEPORTER) !== 0), true, "EF_TELEPORTER event exported");
  assertBoolean(events.some((event) => event.number === 2 && event.event === 13), true, "explicit entity event exported");
}

/**
 * Category: New
 * Purpose: Seed persistent temp-entity state families used by the refresh bridge.
 */
function seedTempEntityPackets(runtime: ReturnType<typeof createClientRuntime>): void {
  CL_AddTEntPacket(runtime, {
    type: temp_event_t.TE_FLASHLIGHT,
    entity: 7,
    position: [100, 0, 0]
  });

  CL_AddTEntPacket(runtime, {
    type: temp_event_t.TE_FORCEWALL,
    position: [0, 0, 0],
    position2: [0, 128, 0],
    color: 208
  });

  CL_AddTEntPacket(runtime, {
    type: temp_event_t.TE_EXPLOSION1,
    position: [32, 32, 32]
  });

  CL_AddTEntPacket(runtime, {
    type: temp_event_t.TE_STEAM,
    id: 42,
    position: [64, 64, 64],
    directionByte: 0,
    count: 8,
    color: 224,
    magnitude: 30,
    durationMs: 500
  });

  CL_AddTEntPacket(runtime, {
    type: temp_event_t.TE_LIGHTNING,
    entity: 3,
    entity2: 4,
    position: [0, 0, 0],
    position2: [0, 0, 128]
  });
}

/**
 * Category: New
 * Purpose: Verify the mixed refresh scene keeps animated entity output and temp-entity families together.
 */
function verifyRefreshScene(runtime: ReturnType<typeof createClientRuntime>): void {
  const refresh = CL_BuildRefreshFrame(runtime, { predictMovement: false });
  const animatedBanner = refresh.entities.find((entity) => entity.entityNumber === 2);

  assertNumber(refresh.entities.length, 3, "refresh entity count");
  assertNumber(animatedBanner?.frame ?? -1, 15, "EF_ANIM_ALLFAST frame");
  assertBoolean(refresh.entities.some((entity) => entity.entityNumber === -1000), true, "temp explosion refresh entity");
  assertBoolean(refresh.lights.length >= 2, true, "refresh lights include temp entities");
  assertNumber(refresh.forceWalls.length, 1, "refresh force-wall count");
  assertNumber(refresh.explosions.length, 1, "refresh explosion count");
  assertNumber(refresh.sustains.length, 1, "refresh sustain count");
  assertNumber(refresh.beams.length, 1, "refresh beam count");
}

/**
 * Category: New
 * Purpose: Copy one seeded entity state into both current and previous centity slots.
 */
function copyIntoCentity(runtime: ReturnType<typeof createClientRuntime>, state: ReturnType<typeof createEntityState>): void {
  const centity = runtime.cl_entities[state.number];
  centity.serverframe = 0;
  centity.current = cloneEntityState(state);
  centity.prev = cloneEntityState(state);
  centity.lerp_origin = [...state.origin];
}

/**
 * Category: New
 * Purpose: Clone one entity state without sharing vector references.
 */
function cloneEntityState(source: ReturnType<typeof createEntityState>): ReturnType<typeof createEntityState> {
  const target = createEntityState();
  target.number = source.number;
  target.origin = [...source.origin];
  target.angles = [...source.angles];
  target.old_origin = [...source.old_origin];
  target.modelindex = source.modelindex;
  target.modelindex2 = source.modelindex2;
  target.modelindex3 = source.modelindex3;
  target.modelindex4 = source.modelindex4;
  target.frame = source.frame;
  target.skinnum = source.skinnum;
  target.effects = source.effects;
  target.renderfx = source.renderfx;
  target.solid = source.solid;
  target.sound = source.sound;
  target.event = source.event;
  return target;
}

/**
 * Category: New
 * Purpose: Assert one numeric equality with a readable label.
 */
function assertNumber(actual: number, expected: number, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: attendu ${expected}, recu ${actual}`);
  }
}

/**
 * Category: New
 * Purpose: Assert one boolean condition with a readable label.
 */
function assertBoolean(actual: boolean, expected: boolean, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: attendu ${expected}, recu ${actual}`);
  }
}
