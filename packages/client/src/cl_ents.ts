/**
 * File: cl_ents.ts
 * Source: Quake II original / client/cl_ents.c
 * Purpose: Port the first entity-frame event and interpolation helpers that sit between parsed server frames and renderer adapters.
 *
 * Porting policy:
 * - Preserve original behavior first.
 * - Preserve original names whenever possible.
 * - Avoid structural refactors unless documented.
 *
 * Deviations:
 * - Produces structured snapshots instead of pushing directly into the software/OpenGL refresh list.
 * - Leaves particles, lights and renderer resource resolution to later adapter layers.
 *
 * Notes:
 * - This file is intended to stay conceptually close to the original C source.
 */

import {
  anglemod,
  EF_ANIM01,
  EF_ANIM23,
  EF_ANIM_ALL,
  EF_ANIM_ALLFAST,
  EF_BFG,
  EF_COLOR_SHELL,
  EF_DOUBLE,
  EF_HALF_DAMAGE,
  EF_PENT,
  EF_PLASMA,
  EF_QUAD,
  EF_ROTATE,
  EF_SPHERETRANS,
  EF_SPINNINGLIGHTS,
  EF_TELEPORTER,
  EF_TRACKERTRAIL,
  LerpAngle,
  RF_BEAM,
  RF_FRAMELERP,
  RF_SHELL_BLUE,
  RF_SHELL_DOUBLE,
  RF_SHELL_HALF_DAM,
  RF_SHELL_RED,
  RF_TRANSLUCENT,
  RF_VIEWERMODEL,
  type entity_state_t,
  entity_event_t,
  type vec3_t
} from "../../qcommon/src/index.js";
import { MAX_PARSE_ENTITIES, type ClientRuntime, type frame_t } from "./client.js";
import { CL_BuildEntityEventEffects, type ClientActionEffect } from "./cl_fx.js";

/**
 * Category: New
 * Purpose: Describe one entity event extracted from the parsed packet entity stream.
 *
 * Constraints:
 * - Must preserve the original event id and source entity state.
 */
export interface ClientEntityEvent {
  number: number;
  event: number;
  effects: number;
  state: entity_state_t;
}

/**
 * Category: New
 * Purpose: Describe one interpolated entity snapshot ready for later renderer adapters.
 *
 * Constraints:
 * - Must preserve Quake II interpolation, animation frame and effect-derived flags.
 */
export interface ClientInterpolatedEntity {
  number: number;
  state: entity_state_t;
  previous: entity_state_t;
  origin: vec3_t;
  oldorigin: vec3_t;
  angles: vec3_t;
  frame: number;
  oldframe: number;
  backlerp: number;
  effects: number;
  renderfx: number;
  flags: number;
  alpha: number;
  skinnum: number;
  modelindex: number;
  modelindex2: number;
  modelindex3: number;
  modelindex4: number;
  viewerEntity: boolean;
  customPlayerSkin: boolean;
  customWeaponModel: boolean;
}

/**
 * Original name: CL_FireEntityEvents
 * Source: client/cl_ents.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Extracts per-frame entity events from the parsed packet entity stream.
 *
 * Porting notes:
 * - Returns structured events and optionally forwards them through a callback instead of invoking effect systems directly.
 */
export function CL_FireEntityEvents(
  runtime: ClientRuntime,
  frame: frame_t,
  onEntityEvent?: (event: ClientEntityEvent) => void
): ClientEntityEvent[] {
  const events: ClientEntityEvent[] = [];

  for (let pnum = 0; pnum < frame.num_entities; pnum += 1) {
    const index = (frame.parse_entities + pnum) & (MAX_PARSE_ENTITIES - 1);
    const state = runtime.cl_parse_entities[index];

    if (state.event !== 0) {
      const event: ClientEntityEvent = {
        number: state.number,
        event: state.event,
        effects: state.effects,
        state: cloneEntityState(state)
      };
      events.push(event);
      onEntityEvent?.(event);
    }

    if ((state.effects & EF_TELEPORTER) !== 0) {
      const event: ClientEntityEvent = {
        number: state.number,
        event: 0,
        effects: state.effects,
        state: cloneEntityState(state)
      };
      events.push(event);
      onEntityEvent?.(event);
    }
  }

  return events;
}

/**
 * Original name: CL_FireEntityEvents / CL_EntityEvent
 * Source: client/cl_ents.c and client/cl_fx.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Builds the client-side Quake II effects implied by the current frame entity events.
 *
 * Porting notes:
 * - Keeps the existing event extraction path and then applies the `CL_EntityEvent` translation helper.
 */
export function CL_BuildFrameEntityEventEffects(
  runtime: ClientRuntime,
  frame: frame_t = runtime.cl.frame,
  options: {
    clFootsteps?: boolean;
  } = {}
): ClientActionEffect[] {
  const events = CL_FireEntityEvents(runtime, frame);
  const effects: ClientActionEffect[] = [];

  for (const event of events) {
    effects.push(...CL_BuildEntityEventEffects(event, {
      clFootsteps: options.clFootsteps ?? runtime.cl.cl_footsteps
    }));
  }

  return effects;
}

/**
 * Category: New
 * Purpose: Collect the entity states referenced by one parsed frame in network order.
 *
 * Constraints:
 * - Must preserve frame parse order and return value copies.
 */
export function CL_GetFrameEntityStates(runtime: ClientRuntime, frame: frame_t = runtime.cl.frame): entity_state_t[] {
  const entities: entity_state_t[] = [];

  for (let pnum = 0; pnum < frame.num_entities; pnum += 1) {
    const index = (frame.parse_entities + pnum) & (MAX_PARSE_ENTITIES - 1);
    entities.push(cloneEntityState(runtime.cl_parse_entities[index]));
  }

  return entities;
}

/**
 * Original name: CL_AddPacketEntities
 * Source: client/cl_ents.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Builds the first renderer-facing packet entity snapshots from the current client frame.
 *
 * Porting notes:
 * - Must preserve Quake II interpolation and effect-derived animation rules.
 * - Leaves linked lights, particle trails and refresh registration to later phases.
 */
export function CL_BuildPacketEntitySnapshots(
  runtime: ClientRuntime,
  frame: frame_t = runtime.cl.frame,
  lerpfrac = runtime.cl.lerpfrac
): ClientInterpolatedEntity[] {
  const snapshots: ClientInterpolatedEntity[] = [];
  const autorotate = anglemod(runtime.cl.time / 10);
  const autoanim = Math.trunc((2 * runtime.cl.time) / 1000);

  for (let pnum = 0; pnum < frame.num_entities; pnum += 1) {
    const state = runtime.cl_parse_entities[(frame.parse_entities + pnum) & (MAX_PARSE_ENTITIES - 1)];
    const cent = runtime.cl_entities[state.number];

    let effects = state.effects;
    let renderfx = state.renderfx;
    let frameNumber = state.frame;

    if ((effects & EF_ANIM01) !== 0) {
      frameNumber = autoanim & 1;
    } else if ((effects & EF_ANIM23) !== 0) {
      frameNumber = 2 + (autoanim & 1);
    } else if ((effects & EF_ANIM_ALL) !== 0) {
      frameNumber = autoanim;
    } else if ((effects & EF_ANIM_ALLFAST) !== 0) {
      frameNumber = Math.trunc(runtime.cl.time / 100);
    }

    if ((effects & EF_PENT) !== 0) {
      effects &= ~EF_PENT;
      effects |= EF_COLOR_SHELL;
      renderfx |= RF_SHELL_RED;
    }

    if ((effects & EF_QUAD) !== 0) {
      effects &= ~EF_QUAD;
      effects |= EF_COLOR_SHELL;
      renderfx |= RF_SHELL_BLUE;
    }

    if ((effects & EF_DOUBLE) !== 0) {
      effects &= ~EF_DOUBLE;
      effects |= EF_COLOR_SHELL;
      renderfx |= RF_SHELL_DOUBLE;
    }

    if ((effects & EF_HALF_DAMAGE) !== 0) {
      effects &= ~EF_HALF_DAMAGE;
      effects |= EF_COLOR_SHELL;
      renderfx |= RF_SHELL_HALF_DAM;
    }

    const origin: vec3_t = [0, 0, 0];
    const oldorigin: vec3_t = [0, 0, 0];
    if ((renderfx & (RF_FRAMELERP | RF_BEAM)) !== 0) {
      origin[0] = cent.current.origin[0];
      origin[1] = cent.current.origin[1];
      origin[2] = cent.current.origin[2];
      oldorigin[0] = cent.current.old_origin[0];
      oldorigin[1] = cent.current.old_origin[1];
      oldorigin[2] = cent.current.old_origin[2];
    } else {
      for (let index = 0; index < 3; index += 1) {
        const lerped = cent.prev.origin[index] + lerpfrac * (cent.current.origin[index] - cent.prev.origin[index]);
        origin[index] = lerped;
        oldorigin[index] = lerped;
      }
    }

    const angles: vec3_t = [0, 0, 0];
    if ((effects & EF_ROTATE) !== 0) {
      angles[0] = 0;
      angles[1] = autorotate;
      angles[2] = 0;
    } else if ((effects & EF_SPINNINGLIGHTS) !== 0) {
      angles[0] = 0;
      angles[1] = anglemod(runtime.cl.time / 2) + state.angles[1];
      angles[2] = 180;
    } else {
      for (let index = 0; index < 3; index += 1) {
        angles[index] = LerpAngle(cent.prev.angles[index], cent.current.angles[index], lerpfrac);
      }
    }

    let flags = (effects & EF_COLOR_SHELL) !== 0 ? 0 : renderfx;
    let alpha = 1;
    let skinnum = state.skinnum;

    if (renderfx === RF_TRANSLUCENT) {
      alpha = 0.7;
    }
    if ((effects & EF_BFG) !== 0) {
      flags |= RF_TRANSLUCENT;
      alpha = 0.3;
    }
    if ((effects & EF_PLASMA) !== 0) {
      flags |= RF_TRANSLUCENT;
      alpha = 0.6;
    }
    if ((effects & EF_SPHERETRANS) !== 0) {
      flags |= RF_TRANSLUCENT;
      alpha = (effects & EF_TRACKERTRAIL) !== 0 ? 0.6 : 0.3;
    }
    if ((renderfx & RF_BEAM) !== 0) {
      alpha = 0.3;
      skinnum = (state.skinnum >>> ((Math.trunc(runtime.cl.time / 100) & 3) * 8)) & 0xff;
    }
    if (state.number === runtime.cl.playernum + 1) {
      flags |= RF_VIEWERMODEL;
    }

    snapshots.push({
      number: state.number,
      state: cloneEntityState(state),
      previous: cloneEntityState(cent.prev),
      origin,
      oldorigin,
      angles,
      frame: frameNumber,
      oldframe: cent.prev.frame,
      backlerp: 1 - lerpfrac,
      effects,
      renderfx,
      flags,
      alpha,
      skinnum,
      modelindex: state.modelindex,
      modelindex2: state.modelindex2,
      modelindex3: state.modelindex3,
      modelindex4: state.modelindex4,
      viewerEntity: state.number === runtime.cl.playernum + 1,
      customPlayerSkin: state.modelindex === 255,
      customWeaponModel: state.modelindex2 === 255
    });
  }

  return snapshots;
}

/**
 * Category: New
 * Purpose: Clone one entity state so exported snapshots keep value semantics.
 */
function cloneEntityState(state: entity_state_t): entity_state_t {
  return {
    number: state.number,
    origin: [...state.origin],
    angles: [...state.angles],
    old_origin: [...state.old_origin],
    modelindex: state.modelindex,
    modelindex2: state.modelindex2,
    modelindex3: state.modelindex3,
    modelindex4: state.modelindex4,
    frame: state.frame,
    skinnum: state.skinnum,
    effects: state.effects,
    renderfx: state.renderfx,
    solid: state.solid,
    sound: state.sound,
    event: state.event
  };
}
