/**
 * File: tent.ts
 * Source: Quake II original / client/cl_tent.c and client/client.h
 * Purpose: Port the persistent temporary-entity state used by client beams, explosions, lasers and sustains.
 *
 * Porting policy:
 * - Preserve original behavior first.
 * - Preserve original names whenever possible.
 * - Avoid structural refactors unless documented.
 *
 * Deviations:
 * - Stores model references as asset-path strings instead of renderer handles.
 * - Emits structured refresh-facing beam and explosion data instead of calling renderer entry points directly.
 *
 * Notes:
 * - This file is intended to stay conceptually close to the original temp-entity pipeline.
 */

import {
  AngleVectors,
  DirFromByte,
  RF_BEAM,
  RF_FULLBRIGHT,
  RF_TRANSLUCENT,
  UPDATE_MASK,
  temp_event_t,
  type vec3_t
} from "../../qcommon/src/index.js";
import type { ClientTempEntityPacket } from "./parse.js";
import type { ClientDynamicLight } from "./refresh.js";
import type { ClientViewValues } from "./view.js";
import {
  createClientBeam,
  createClientExplosion,
  createClientForceWall,
  createClientLaser,
  createClientSustain,
  createClientTempLight,
  type ClientRuntime,
  type client_beam_t,
  type client_explosion_t
} from "./types.js";

const MODEL_PARASITE_SEGMENT = "models/monsters/parasite/segment/tris.md2";
const MODEL_GRAPPLE_CABLE = "models/ctf/segment/tris.md2";
const MODEL_LIGHTNING = "models/proj/lightning/tris.md2";
const MODEL_HEATBEAM = "models/proj/beam/tris.md2";
const MODEL_EXPLODE = "models/objects/explode/tris.md2";
const MODEL_FLASH = "models/objects/flash/tris.md2";
const MODEL_EXPLO4 = "models/objects/r_explode/tris.md2";
const MODEL_EXPLO4_BIG = "models/objects/r_explode2/tris.md2";
const MODEL_BFG_EXPLO = "sprites/s_bfg2.sp2";

/**
 * Category: New
 * Purpose: Describe one refresh-facing persistent beam reconstructed from temp-entity state.
 *
 * Constraints:
 * - Must preserve beam endpoints, timeout family and model identity.
 */
export interface ClientBeamRender {
  kind: "beam" | "player-beam" | "laser";
  model: string | null;
  start: vec3_t;
  end: vec3_t;
  origin: vec3_t;
  angles: vec3_t;
  offset: vec3_t;
  endtime: number;
  entity: number;
  entity2: number;
  flags: number;
  alpha: number;
  skinnum: number;
  frame: number;
  segmentLength: number;
  pathLength: number;
}

/**
 * Category: New
 * Purpose: Describe one refresh-facing force-wall segment emitted from `TE_FORCEWALL`.
 *
 * Constraints:
 * - Must preserve endpoints and original color index.
 */
export interface ClientForceWallRender {
  start: vec3_t;
  end: vec3_t;
  color: number;
  endtime: number;
}

/**
 * Category: New
 * Purpose: Describe one refresh-facing sustain effect emitted from `CL_ProcessSustain`.
 *
 * Constraints:
 * - Must preserve sustain family, timing and the main spatial parameters needed by later renderer adapters.
 */
export interface ClientSustainRender {
  kind: "steam" | "widow" | "nuke";
  origin: vec3_t;
  direction: vec3_t;
  color: number;
  count: number;
  magnitude: number;
  endtime: number;
  nextthink: number;
  radius: number;
  intensity: number;
}

/**
 * Category: New
 * Purpose: Describe one refresh-facing persistent explosion reconstructed from temp-entity state.
 *
 * Constraints:
 * - Must preserve the current animation frame, model and alpha.
 */
export interface ClientExplosionRender {
  model: string;
  origin: vec3_t;
  angles: vec3_t;
  frame: number;
  oldframe: number;
  backlerp: number;
  alpha: number;
  flags: number;
  skinnum: number;
}

/**
 * Category: New
 * Purpose: Group the refresh-facing temp-entity output ported from `CL_AddTEnts`.
 *
 * Constraints:
 * - Must keep beams, explosions and temp lights explicit for later renderer adapters.
 */
export interface ClientTEntRefresh {
  beams: ClientBeamRender[];
  explosions: ClientExplosionRender[];
  lights: ClientDynamicLight[];
  forceWalls: ClientForceWallRender[];
  sustains: ClientSustainRender[];
}

/**
 * Original name: CL_ClearTEnts
 * Source: client/cl_tent.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Clears all persistent temp-entity slot arrays.
 *
 * Porting notes:
 * - Reinitializes the per-family arrays in place using the local TS slot builders.
 */
export function CL_ClearTEnts(runtime: ClientRuntime): void {
  runtime.cl.tents.beams = Array.from({ length: runtime.cl.tents.beams.length }, () => createClientBeam());
  runtime.cl.tents.playerbeams = Array.from({ length: runtime.cl.tents.playerbeams.length }, () => createClientBeam());
  runtime.cl.tents.explosions = Array.from({ length: runtime.cl.tents.explosions.length }, () => createClientExplosion());
  runtime.cl.tents.lasers = Array.from({ length: runtime.cl.tents.lasers.length }, () => createClientLaser());
  runtime.cl.tents.sustains = Array.from({ length: runtime.cl.tents.sustains.length }, () => createClientSustain());
  runtime.cl.tents.tempLights = Array.from({ length: runtime.cl.tents.tempLights.length }, () => createClientTempLight());
  runtime.cl.tents.forceWalls = Array.from({ length: runtime.cl.tents.forceWalls.length }, () => createClientForceWall());
  runtime.cl.tents.registeredSounds = [];
}

/**
 * Original name: CL_RegisterTEntSounds
 * Source: client/cl_tent.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Registers the shared temporary-entity sound set used by impacts, footsteps and explosions.
 *
 * Porting notes:
 * - Stores normalized sound-path strings instead of backend sound handles.
 */
export function CL_RegisterTEntSounds(runtime: ClientRuntime): string[] {
  const registeredSounds = [
    "world/ric1.wav",
    "world/ric2.wav",
    "world/ric3.wav",
    "weapons/lashit.wav",
    "world/spark5.wav",
    "world/spark6.wav",
    "world/spark7.wav",
    "weapons/railgf1a.wav",
    "weapons/rocklx1a.wav",
    "weapons/grenlx1a.wav",
    "weapons/xpld_wat.wav",
    "player/land1.wav",
    "player/fall2.wav",
    "player/fall1.wav",
    "player/step1.wav",
    "player/step2.wav",
    "player/step3.wav",
    "player/step4.wav",
    "weapons/tesla.wav",
    "weapons/disrupthit.wav"
  ];

  runtime.cl.tents.registeredSounds = [...registeredSounds];
  return registeredSounds;
}

/**
 * Original name: CL_ParseTEnt
 * Source: client/cl_tent.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Applies one parsed temp-entity packet to the persistent client temp-entity state.
 *
 * Porting notes:
 * - Reuses the already parsed packet representation from `parse.ts`.
 * - Covers the persistent state families first: beams, player beams, lasers, explosions and sustains.
 */
export function CL_AddTEntPacket(runtime: ClientRuntime, packet: ClientTempEntityPacket): void {
  switch (packet.type) {
    case temp_event_t.TE_PARASITE_ATTACK:
    case temp_event_t.TE_MEDIC_CABLE_ATTACK:
      assignBeam(runtime.cl.tents.beams, packet, MODEL_PARASITE_SEGMENT, runtime.cl.time + 200);
      break;
    case temp_event_t.TE_GRAPPLE_CABLE:
      assignBeam(runtime.cl.tents.beams, packet, MODEL_GRAPPLE_CABLE, runtime.cl.time + 200);
      break;
    case temp_event_t.TE_LIGHTNING:
      assignBeam(runtime.cl.tents.beams, packet, MODEL_LIGHTNING, runtime.cl.time + 200);
      break;
    case temp_event_t.TE_HEATBEAM:
      assignPlayerBeam(runtime, packet, MODEL_HEATBEAM, [2, 7, -3], runtime.cl.time + 100);
      break;
    case temp_event_t.TE_MONSTER_HEATBEAM:
      assignPlayerBeam(runtime, packet, MODEL_HEATBEAM, [0, 0, 0], runtime.cl.time + 100);
      break;
    case temp_event_t.TE_BFG_LASER:
      assignLaser(runtime, packet, 0xd0d1d2d3);
      break;
    case temp_event_t.TE_FLASHLIGHT:
      assignFlashlight(runtime, packet);
      break;
    case temp_event_t.TE_FORCEWALL:
      assignForceWall(runtime, packet);
      break;
    case temp_event_t.TE_BLASTER:
      allocateExplosion(runtime, createImpactExplosion(packet, [1, 1, 0], 0));
      break;
    case temp_event_t.TE_BLASTER2:
      allocateExplosion(runtime, createImpactExplosion(packet, [0, 1, 0], 1));
      break;
    case temp_event_t.TE_FLECHETTE:
      allocateExplosion(runtime, createImpactExplosion(packet, [0.19, 0.41, 0.75], 2));
      break;
    case temp_event_t.TE_EXPLOSION1:
    case temp_event_t.TE_ROCKET_EXPLOSION:
    case temp_event_t.TE_ROCKET_EXPLOSION_WATER:
    case temp_event_t.TE_GRENADE_EXPLOSION:
    case temp_event_t.TE_GRENADE_EXPLOSION_WATER:
    case temp_event_t.TE_EXPLOSION1_BIG:
    case temp_event_t.TE_EXPLOSION1_NP:
    case temp_event_t.TE_PLAIN_EXPLOSION:
      allocateExplosion(runtime, {
        type: "poly",
        model: packet.type === temp_event_t.TE_EXPLOSION1_BIG ? MODEL_EXPLO4_BIG : MODEL_EXPLO4,
        frames: 15,
        light: 350,
        lightcolor: [1, 0.5, 0.5],
        start: runtime.cl.frame.servertime - 100,
        baseframe: 0,
        origin: [...(packet.position ?? [0, 0, 0])],
        angles: [0, 0, 0],
        flags: RF_FULLBRIGHT,
        alpha: 1,
        skinnum: 0
      });
      break;
    case temp_event_t.TE_BFG_EXPLOSION:
      allocateExplosion(runtime, {
        type: "poly",
        model: MODEL_BFG_EXPLO,
        frames: 4,
        light: 350,
        lightcolor: [0, 1, 0],
        start: runtime.cl.frame.servertime - 100,
        baseframe: 0,
        origin: [...(packet.position ?? [0, 0, 0])],
        angles: [0, 0, 0],
        flags: RF_FULLBRIGHT | RF_TRANSLUCENT,
        alpha: 0.3,
        skinnum: 0
      });
      break;
    case temp_event_t.TE_WELDING_SPARKS:
      allocateExplosion(runtime, {
        type: "flash",
        model: MODEL_FLASH,
        frames: 2,
        light: 120,
        lightcolor: [1, 1, 0.3],
        start: runtime.cl.frame.servertime,
        baseframe: 0,
        origin: [...(packet.position ?? [0, 0, 0])],
        angles: [0, 0, 0],
        flags: RF_BEAM,
        alpha: 1,
        skinnum: 0
      });
      break;
    case temp_event_t.TE_STEAM:
      assignSteamSustain(runtime, packet);
      break;
    case temp_event_t.TE_WIDOWBEAMOUT:
      assignTimedSustain(runtime, packet, "widow", packet.id ?? 0, 2100, 1);
      break;
    case temp_event_t.TE_NUKEBLAST:
      assignTimedSustain(runtime, packet, "nuke", 21000, 1000, 1);
      break;
    default:
      break;
  }
}

/**
 * Original name: CL_AddTEnts
 * Source: client/cl_tent.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Builds refresh-facing temp-entity output from persistent temp state.
 *
 * Porting notes:
 * - Emits structured beams, explosions and dynamic lights instead of renderer calls.
 * - Sustains are tracked but not yet visualized until their thinker functions are ported.
 */
export function CL_BuildTEntRefresh(runtime: ClientRuntime): ClientTEntRefresh {
  const beams = [
    ...buildBeams(runtime.cl.tents.beams, runtime.cl.time, "beam"),
    ...buildPlayerBeams(runtime),
    ...buildLasers(runtime)
  ];
  const { explosions, lights } = buildExplosions(runtime);
  const tempLights = buildTempLights(runtime);
  const forceWalls = buildForceWalls(runtime);
  const sustains = buildSustains(runtime);

  return {
    beams,
    explosions,
    lights: [...lights, ...tempLights],
    forceWalls,
    sustains
  };
}

/**
 * Category: New
 * Purpose: Convert one active beam-family slot array into refresh-facing beam records.
 */
function buildBeams(
  slots: client_beam_t[],
  now: number,
  kind: "beam" | "player-beam"
): ClientBeamRender[] {
  return slots
    .filter((slot) => slot.model !== null && slot.endtime >= now)
    .map((slot) => createBeamRender(slot, kind));
}

/**
 * Original name: CL_AddPlayerBeams
 * Source: client/cl_tent.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Rebuilds player-linked beams, especially heatbeam, using the current logical view and gun offsets.
 *
 * Porting notes:
 * - Captures the locked beam origin/orientation and segment sizing for later renderer adapters.
 * - Uses the common right-hand view path for now, matching the current port stage that does not yet expose `hand`.
 */
function buildPlayerBeams(runtime: ClientRuntime): ClientBeamRender[] {
  const results: ClientBeamRender[] = [];
  const view = buildCurrentView(runtime);

  for (const slot of runtime.cl.tents.playerbeams) {
    if (slot.model === null || slot.endtime < runtime.cl.time) {
      continue;
    }

    if (slot.model === MODEL_HEATBEAM) {
      results.push(createHeatbeamRender(runtime, slot, view));
      continue;
    }

    results.push(createBeamRender(slot, "player-beam"));
  }

  return results;
}

/**
 * Category: New
 * Purpose: Convert active laser slots into refresh-facing beam records.
 */
function buildLasers(runtime: ClientRuntime): ClientBeamRender[] {
  return runtime.cl.tents.lasers
    .filter((slot) => slot.endtime >= runtime.cl.time)
    .map((slot) => ({
      kind: "laser",
      model: null,
      start: [...slot.start],
      end: [...slot.end],
      origin: [...slot.start],
      angles: calculateBeamAngles(subtractVec3(slot.end, slot.start), false),
      offset: [0, 0, 0],
      endtime: slot.endtime,
      entity: 0,
      entity2: 0,
      flags: slot.flags,
      alpha: slot.alpha,
      skinnum: slot.skinnum,
      frame: slot.frame,
      segmentLength: 30,
      pathLength: vectorLength(subtractVec3(slot.end, slot.start))
    }));
}

/**
 * Original name: CL_AddExplosions
 * Source: client/cl_tent.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Advances active explosion slots and emits their current render frame plus dynamic light.
 */
function buildExplosions(runtime: ClientRuntime): { explosions: ClientExplosionRender[]; lights: ClientDynamicLight[] } {
  const explosions: ClientExplosionRender[] = [];
  const lights: ClientDynamicLight[] = [];

  for (const slot of runtime.cl.tents.explosions) {
    if (slot.type === "free" || slot.model === null) {
      continue;
    }

    const frac = (runtime.cl.time - slot.start) / 100;
    let frameIndex = Math.floor(frac);
    let alpha = slot.alpha;
    let flags = slot.flags;
    let skinnum = slot.skinnum;

    if (!updateExplosionForFrame(slot, frameIndex)) {
      resetExplosion(slot);
      continue;
    }

    switch (slot.type) {
      case "misc":
        alpha = 1 - frac / Math.max(1, slot.frames - 1);
        break;
      case "flash":
        alpha = 1;
        break;
      case "poly":
        alpha = (16 - frameIndex) / 16;
        if (frameIndex < 10) {
          skinnum = Math.max(0, frameIndex >> 1);
        } else {
          flags |= RF_TRANSLUCENT;
          skinnum = frameIndex < 13 ? 5 : 6;
        }
        break;
      case "poly2":
        alpha = (5 - frameIndex) / 5;
        flags |= RF_TRANSLUCENT;
        skinnum = 0;
        break;
      default:
        break;
    }

    if (slot.light !== 0) {
      lights.push({
        origin: [...slot.origin],
        intensity: slot.light * alpha,
        color: [...slot.lightcolor],
        sourceEntity: 0,
        kind: "temp-explosion"
      });
    }

    if (frameIndex < 0) {
      frameIndex = 0;
    }

    explosions.push({
      model: slot.model,
      origin: [...slot.origin],
      angles: [...slot.angles],
      frame: slot.baseframe + frameIndex + 1,
      oldframe: slot.baseframe + frameIndex,
      backlerp: 1 - runtime.cl.lerpfrac,
      alpha,
      flags,
      skinnum
    });
  }

  return { explosions, lights };
}

/**
 * Category: New
 * Purpose: Convert active transient temp lights into refresh-facing dynamic lights.
 */
function buildTempLights(runtime: ClientRuntime): ClientDynamicLight[] {
  return runtime.cl.tents.tempLights
    .filter((slot) => slot.endtime >= runtime.cl.time)
    .map((slot) => ({
      origin: [...slot.origin],
      intensity: slot.intensity,
      color: [...slot.color],
      sourceEntity: slot.entity,
      kind: slot.kind
    }));
}

/**
 * Category: New
 * Purpose: Convert active force-wall slots into refresh-facing segment records.
 */
function buildForceWalls(runtime: ClientRuntime): ClientForceWallRender[] {
  return runtime.cl.tents.forceWalls
    .filter((slot) => slot.endtime >= runtime.cl.time)
    .map((slot) => ({
      start: [...slot.start],
      end: [...slot.end],
      color: slot.color,
      endtime: slot.endtime
    }));
}

/**
 * Category: New
 * Purpose: Build a generic beam render record from one active beam slot.
 */
function createBeamRender(slot: client_beam_t, kind: "beam" | "player-beam"): ClientBeamRender {
  const origin = [...slot.start] as vec3_t;
  const dist = subtractVec3(slot.end, origin);
  const pathLength = vectorLength(dist);

  return {
    kind,
    model: slot.model,
    start: [...slot.start],
    end: [...slot.end],
    origin,
    angles: calculateBeamAngles(dist, slot.model === MODEL_LIGHTNING),
    offset: [...slot.offset],
    endtime: slot.endtime,
    entity: slot.entity,
    entity2: slot.dest_entity,
    flags: kind === "player-beam" ? RF_FULLBRIGHT : 0,
    alpha: 1,
    skinnum: 0,
    frame: kind === "player-beam" ? 1 : 0,
    segmentLength: slot.model === MODEL_LIGHTNING ? 35 : 30,
    pathLength
  };
}

/**
 * Category: New
 * Purpose: Rebuild one heatbeam render record using the current logical view and gun-offset path.
 */
function createHeatbeamRender(
  runtime: ClientRuntime,
  slot: client_beam_t,
  view: ClientViewValues
): ClientBeamRender {
  const slotStart = [...slot.start] as vec3_t;
  const start = slot.entity === runtime.cl.playernum + 1
    ? computePlayerBeamOrigin(runtime, view, slot.offset)
    : slotStart;
  const end = [...slot.end] as vec3_t;
  const direction = slot.entity === runtime.cl.playernum + 1
    ? computePlayerHeatbeamDirection(view, slot.offset, end, start)
    : subtractVec3(end, start);
  const pathLength = vectorLength(direction);

  return {
    kind: "player-beam",
    model: slot.model,
    start,
    end,
    origin: [...start],
    angles: calculateBeamAngles(direction, true),
    offset: [...slot.offset],
    endtime: slot.endtime,
    entity: slot.entity,
    entity2: slot.dest_entity,
    flags: RF_FULLBRIGHT,
    alpha: 1,
    skinnum: 0,
    frame: slot.entity === runtime.cl.playernum + 1 ? 1 : 2,
    segmentLength: 32,
    pathLength
  };
}

/**
 * Category: New
 * Purpose: Build the current logical view values needed by player-beam reconstruction.
 */
function buildCurrentView(runtime: ClientRuntime): ClientViewValues {
  const ps = runtime.cl.frame.playerstate;
  let oldframe = runtime.cl.frames[(runtime.cl.frame.serverframe - 1) & UPDATE_MASK];
  if (oldframe.serverframe !== runtime.cl.frame.serverframe - 1 || !oldframe.valid) {
    oldframe = runtime.cl.frame;
  }

  const ops = oldframe.playerstate;
  const vieworg: vec3_t = [0, 0, 0];
  for (let index = 0; index < 3; index += 1) {
    vieworg[index] =
      runtime.cl.predicted_origin[index] +
      ops.viewoffset[index] +
      runtime.cl.lerpfrac * (ps.viewoffset[index] - ops.viewoffset[index]);
  }

  const viewangles = [...runtime.cl.predicted_angles] as vec3_t;
  const vectors = AngleVectors(viewangles);

  return {
    vieworg,
    viewangles,
    forward: vectors.forward,
    right: vectors.right,
    up: vectors.up,
    fov_x: ops.fov + runtime.cl.lerpfrac * (ps.fov - ops.fov),
    blend: [...ps.blend]
  };
}

/**
 * Category: New
 * Purpose: Rebuild the player beam origin from view origin, gun offset and heatbeam offset.
 */
function computePlayerBeamOrigin(runtime: ClientRuntime, view: ClientViewValues, offset: vec3_t): vec3_t {
  const ps = runtime.cl.frame.playerstate;
  let oldframe = runtime.cl.frames[(runtime.cl.frame.serverframe - 1) & UPDATE_MASK];
  if (oldframe.serverframe !== runtime.cl.frame.serverframe - 1 || !oldframe.valid) {
    oldframe = runtime.cl.frame;
  }

  const ops = oldframe.playerstate;
  const gunStart: vec3_t = [0, 0, 0];
  for (let index = 0; index < 3; index += 1) {
    gunStart[index] =
      view.vieworg[index] +
      ops.gunoffset[index] +
      runtime.cl.lerpfrac * (ps.gunoffset[index] - ops.gunoffset[index]);
  }

  const origin = addScaledVec3(gunStart, view.right, offset[0]);
  const origin2 = addScaledVec3(origin, view.forward, offset[1]);
  return addScaledVec3(origin2, view.up, offset[2]);
}

/**
 * Category: New
 * Purpose: Rebuild the heatbeam direction locked to the player's forward vector like `CL_AddPlayerBeams`.
 */
function computePlayerHeatbeamDirection(
  view: ClientViewValues,
  offset: vec3_t,
  end: vec3_t,
  start: vec3_t
): vec3_t {
  const dist = subtractVec3(end, start);
  const length = vectorLength(dist);

  let result = scaleVec3(view.forward, length);
  result = addScaledVec3(result, view.right, offset[0]);
  result = addScaledVec3(result, view.forward, offset[1]);
  result = addScaledVec3(result, view.up, offset[2]);
  return result;
}

/**
 * Category: New
 * Purpose: Convert one beam direction vector into Quake-style beam angles.
 */
function calculateBeamAngles(dist: vec3_t, lightningStyle: boolean): vec3_t {
  if (dist[1] === 0 && dist[0] === 0) {
    return dist[2] > 0 ? [lightningStyle ? -90 : 90, lightningStyle ? 180 : 0, 0] : [lightningStyle ? -270 : 270, lightningStyle ? 180 : 0, 0];
  }

  let yaw: number;
  if (dist[0] !== 0) {
    yaw = Math.atan2(dist[1], dist[0]) * 180 / Math.PI;
  } else if (dist[1] > 0) {
    yaw = 90;
  } else {
    yaw = 270;
  }
  if (yaw < 0) {
    yaw += 360;
  }

  const forward = Math.sqrt(dist[0] * dist[0] + dist[1] * dist[1]);
  let pitch = Math.atan2(dist[2], forward) * -180 / Math.PI;
  if (pitch < 0) {
    pitch += 360;
  }

  if (lightningStyle) {
    return [-pitch, yaw + 180, 0];
  }

  return [pitch, yaw, 0];
}

/**
 * Category: New
 * Purpose: Subtract one vector from another by value.
 */
function subtractVec3(a: vec3_t, b: vec3_t): vec3_t {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

/**
 * Category: New
 * Purpose: Scale one vector by a scalar by value.
 */
function scaleVec3(vector: vec3_t, scalar: number): vec3_t {
  return [vector[0] * scalar, vector[1] * scalar, vector[2] * scalar];
}

/**
 * Category: New
 * Purpose: Add one scaled direction vector to a base vector by value.
 */
function addScaledVec3(base: vec3_t, direction: vec3_t, scalar: number): vec3_t {
  return [
    base[0] + direction[0] * scalar,
    base[1] + direction[1] * scalar,
    base[2] + direction[2] * scalar
  ];
}

/**
 * Category: New
 * Purpose: Compute the Euclidean length of one vector.
 */
function vectorLength(vector: vec3_t): number {
  return Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1] + vector[2] * vector[2]);
}

/**
 * Original name: CL_ProcessSustain
 * Source: client/cl_tent.c and client/cl_newfx.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Advances active sustain timers and emits refresh-facing sustain descriptors when their thinker would run.
 *
 * Porting notes:
 * - Produces structured sustain records instead of particles.
 * - Preserves expiry and `nextthink` stepping semantics from the original loop.
 */
function buildSustains(runtime: ClientRuntime): ClientSustainRender[] {
  const results: ClientSustainRender[] = [];

  for (const sustain of runtime.cl.tents.sustains) {
    if (sustain.id === 0) {
      continue;
    }

    if (sustain.endtime < runtime.cl.time) {
      resetSustain(sustain);
      continue;
    }

    if (runtime.cl.time < sustain.nextthink) {
      continue;
    }

    const render = buildSustainRender(runtime, sustain);
    if (render) {
      results.push(render);
    }

    sustain.nextthink += sustain.thinkinterval;
  }

  return results;
}

/**
 * Category: New
 * Purpose: Convert one active sustain slot into a renderer-facing descriptor.
 */
function buildSustainRender(runtime: ClientRuntime, sustain: ClientRuntime["cl"]["tents"]["sustains"][number]): ClientSustainRender | null {
  switch (sustain.type) {
    case "steam":
      return {
        kind: "steam",
        origin: [...sustain.org],
        direction: [...sustain.dir],
        color: sustain.color,
        count: sustain.count,
        magnitude: sustain.magnitude,
        endtime: sustain.endtime,
        nextthink: sustain.nextthink,
        radius: Math.max(8, sustain.magnitude * 0.35),
        intensity: Math.max(40, sustain.count * 6)
      };
    case "widow": {
      const ratio = 1 - ((sustain.endtime - runtime.cl.time) / 2100);
      return {
        kind: "widow",
        origin: [...sustain.org],
        direction: [0, 0, 1],
        color: 16,
        count: 300,
        magnitude: 45 * Math.max(0, ratio),
        endtime: sustain.endtime,
        nextthink: sustain.nextthink,
        radius: 45 * Math.max(0, ratio),
        intensity: 160
      };
    }
    case "nuke": {
      const ratio = 1 - ((sustain.endtime - runtime.cl.time) / 1000);
      return {
        kind: "nuke",
        origin: [...sustain.org],
        direction: [0, 0, 1],
        color: 110,
        count: 700,
        magnitude: 200 * Math.max(0, ratio),
        endtime: sustain.endtime,
        nextthink: sustain.nextthink,
        radius: 200 * Math.max(0, ratio),
        intensity: 300
      };
    }
    default:
      return null;
  }
}

/**
 * Category: New
 * Purpose: Recreate the common `TE_BLASTER*` explosion payloads.
 */
function createImpactExplosion(
  packet: ClientTempEntityPacket,
  lightcolor: [number, number, number],
  skinnum: number
): client_explosion_t {
  return {
    type: "misc",
    model: MODEL_EXPLODE,
    frames: 4,
    light: 150,
    lightcolor,
    start: 0,
    baseframe: 0,
    origin: [...(packet.position ?? [0, 0, 0])],
    angles: directionByteToImpactAngles(packet.directionByte),
    flags: RF_FULLBRIGHT | RF_TRANSLUCENT,
    alpha: 1,
    skinnum
  };
}

/**
 * Category: New
 * Purpose: Assign one parsed beam packet into the chosen fixed-size slot array.
 */
function assignBeam(
  slots: client_beam_t[],
  packet: ClientTempEntityPacket,
  model: string,
  endtime: number
): void {
  const entity = packet.entity ?? 0;
  const entity2 = packet.entity2 ?? 0;

  let slot = slots.find((candidate) => candidate.entity === entity && candidate.dest_entity === entity2);
  if (!slot) {
    slot = slots.find((candidate) => candidate.model === null || candidate.endtime < endtime - 200) ?? slots[0];
  }

  slot.entity = entity;
  slot.dest_entity = entity2;
  slot.model = model;
  slot.endtime = endtime;
  slot.start = [...(packet.position ?? [0, 0, 0])];
  slot.end = [...(packet.position2 ?? [0, 0, 0])];
  slot.offset = [...(packet.offset ?? [0, 0, 0])];
}

/**
 * Category: New
 * Purpose: Assign one parsed player beam packet into the dedicated player-beam array.
 */
function assignPlayerBeam(
  runtime: ClientRuntime,
  packet: ClientTempEntityPacket,
  model: string,
  defaultOffset: vec3_t,
  endtime: number
): void {
  assignBeam(
    runtime.cl.tents.playerbeams,
    {
      ...packet,
      offset: packet.offset ?? defaultOffset
    },
    model,
    endtime
  );
}

/**
 * Category: New
 * Purpose: Assign one parsed laser packet into the fixed-size laser array.
 */
function assignLaser(runtime: ClientRuntime, packet: ClientTempEntityPacket, skinnum: number): void {
  const slot =
    runtime.cl.tents.lasers.find((candidate) => candidate.endtime < runtime.cl.time) ??
    runtime.cl.tents.lasers[0];

  slot.start = [...(packet.position ?? [0, 0, 0])];
  slot.end = [...(packet.position2 ?? [0, 0, 0])];
  slot.endtime = runtime.cl.time + 100;
  slot.flags = RF_TRANSLUCENT | RF_BEAM;
  slot.alpha = 0.3;
  slot.skinnum = skinnum;
  slot.frame = 4;
}

/**
 * Category: New
 * Purpose: Recreate `CL_Flashlight` as a transient dynamic-light record.
 */
function assignFlashlight(runtime: ClientRuntime, packet: ClientTempEntityPacket): void {
  const entity = packet.entity ?? 0;
  const slot =
    runtime.cl.tents.tempLights.find((candidate) => candidate.entity === entity) ??
    runtime.cl.tents.tempLights.find((candidate) => candidate.endtime < runtime.cl.time) ??
    runtime.cl.tents.tempLights[0];

  slot.origin = [...(packet.position ?? [0, 0, 0])];
  slot.color = [1, 1, 1];
  slot.intensity = 400;
  slot.minlight = 250;
  slot.endtime = runtime.cl.time + 100;
  slot.entity = entity;
  slot.kind = "flashlight";
}

/**
 * Category: New
 * Purpose: Recreate `CL_ForceWall` as a transient segment effect.
 */
function assignForceWall(runtime: ClientRuntime, packet: ClientTempEntityPacket): void {
  const slot =
    runtime.cl.tents.forceWalls.find((candidate) => candidate.endtime < runtime.cl.time) ??
    runtime.cl.tents.forceWalls[0];

  slot.start = [...(packet.position ?? [0, 0, 0])];
  slot.end = [...(packet.position2 ?? [0, 0, 0])];
  slot.color = packet.color ?? 0;
  slot.endtime = runtime.cl.time + 1000;
}

/**
 * Category: New
 * Purpose: Assign one parsed steam sustain packet when it represents a persistent sustain.
 */
function assignSteamSustain(runtime: ClientRuntime, packet: ClientTempEntityPacket): void {
  if (packet.id === undefined || packet.id === -1) {
    return;
  }

  const slot = runtime.cl.tents.sustains.find((candidate) => candidate.id === 0) ?? runtime.cl.tents.sustains[0];
  slot.id = packet.id;
  slot.type = "steam";
  slot.endtime = runtime.cl.time + (packet.durationMs ?? 0);
  slot.nextthink = runtime.cl.time;
  slot.thinkinterval = 100;
  slot.org = [...(packet.position ?? [0, 0, 0])];
  slot.dir = directionByteToVector(packet.directionByte);
  slot.color = packet.color ?? 0;
  slot.count = packet.count ?? 0;
  slot.magnitude = packet.magnitude ?? 0;
}

/**
 * Category: New
 * Purpose: Assign one parsed timed sustain packet such as widow beam out or nuke blast.
 */
function assignTimedSustain(
  runtime: ClientRuntime,
  packet: ClientTempEntityPacket,
  type: "widow" | "nuke",
  id: number,
  durationMs: number,
  thinkinterval: number
): void {
  const slot = runtime.cl.tents.sustains.find((candidate) => candidate.id === 0) ?? runtime.cl.tents.sustains[0];
  slot.id = id;
  slot.type = type;
  slot.endtime = runtime.cl.time + durationMs;
  slot.nextthink = runtime.cl.time;
  slot.thinkinterval = thinkinterval;
  slot.org = [...(packet.position ?? [0, 0, 0])];
}

/**
 * Category: New
 * Purpose: Allocate or recycle one explosion slot and fill it with normalized explosion data.
 */
function allocateExplosion(runtime: ClientRuntime, value: client_explosion_t): void {
  const slot =
    runtime.cl.tents.explosions.find((candidate) => candidate.type === "free") ??
    runtime.cl.tents.explosions.reduce((oldest, candidate) =>
      candidate.start < oldest.start ? candidate : oldest
    );

  slot.type = value.type;
  slot.model = value.model;
  slot.frames = value.frames;
  slot.light = value.light;
  slot.lightcolor = [...value.lightcolor];
  slot.start = value.start === 0 ? runtime.cl.frame.servertime - 100 : value.start;
  slot.baseframe = value.baseframe;
  slot.origin = [...value.origin];
  slot.angles = [...value.angles];
  slot.flags = value.flags;
  slot.alpha = value.alpha;
  slot.skinnum = value.skinnum;
}

/**
 * Category: New
 * Purpose: Decide whether one explosion slot stays active for the current frame.
 */
function updateExplosionForFrame(slot: client_explosion_t, frameIndex: number): boolean {
  switch (slot.type) {
    case "flash":
      return frameIndex < 1;
    case "misc":
    case "poly":
    case "poly2":
      return frameIndex < slot.frames - 1;
    default:
      return frameIndex < slot.frames - 1;
  }
}

/**
 * Category: New
 * Purpose: Reset one explosion slot back to the free state.
 */
function resetExplosion(slot: client_explosion_t): void {
  slot.type = "free";
  slot.model = null;
  slot.frames = 0;
  slot.light = 0;
  slot.lightcolor = [0, 0, 0];
  slot.start = 0;
  slot.baseframe = 0;
  slot.origin = [0, 0, 0];
  slot.angles = [0, 0, 0];
  slot.flags = 0;
  slot.alpha = 0;
  slot.skinnum = 0;
}

/**
 * Category: New
 * Purpose: Reset one sustain slot back to its free state after expiration.
 */
function resetSustain(slot: ClientRuntime["cl"]["tents"]["sustains"][number]): void {
  slot.id = 0;
  slot.type = "none";
  slot.endtime = 0;
  slot.nextthink = 0;
  slot.thinkinterval = 0;
  slot.org = [0, 0, 0];
  slot.dir = [0, 0, 0];
  slot.color = 0;
  slot.count = 0;
  slot.magnitude = 0;
}

/**
 * Category: New
 * Purpose: Resolve one networked Quake direction byte through the original `anorms.h` lookup table.
 */
function directionByteToVector(directionByte: number | undefined): vec3_t {
  return DirFromByte(directionByte);
}

/**
 * Category: New
 * Purpose: Derive coarse impact angles from the parsed direction byte.
 */
function directionByteToImpactAngles(directionByte: number | undefined): vec3_t {
  const dir = directionByteToVector(directionByte);
  const pitch = Math.acos(Math.max(-1, Math.min(1, dir[2]))) * 180 / Math.PI;
  const yaw = Math.atan2(dir[1], dir[0]) * 180 / Math.PI;
  return [pitch, yaw < 0 ? yaw + 360 : yaw, 0];
}
