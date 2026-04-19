/**
 * File: types.ts
 * Source: Quake II original / client/client.h
 * Purpose: Port the core Quake II client runtime structures used by client parsing, baselines and frame state.
 *
 * Porting policy:
 * - Preserve original behavior first.
 * - Preserve original names whenever possible.
 * - Avoid structural refactors unless documented.
 *
 * Deviations:
 * - Uses arrays and typed objects instead of raw C fixed-size buffers.
 * - Leaves renderer and sound object pointers as `unknown` placeholders for later adapter work.
 *
 * Notes:
 * - This file is intended to stay conceptually close to the original C source.
 */

import { createSizeBuffer, type sizebuf_t } from "../../memory/src/index.js";
import {
  createEntityState,
  createPlayerState,
  MAX_CLIENTS,
  MAX_CONFIGSTRINGS,
  MAX_EDICTS,
  MAX_IMAGES,
  MAX_ITEMS,
  MAX_LIGHTSTYLES,
  MAX_MAP_AREAS,
  MAX_MODELS,
  MAX_QPATH,
  MAX_SOUNDS,
  type entity_state_t,
  type player_state_t,
  type usercmd_t,
  type vec3_t
} from "../../qcommon/src/index.js";
import { UPDATE_BACKUP } from "../../qcommon/src/index.js";

export const MAX_PARSE_ENTITIES = 1024;
export const CMD_BACKUP = 64;
export const MAX_CLIENTWEAPONMODELS = 20;
export const MAX_EXPLOSIONS = 32;
export const MAX_BEAMS = 32;
export const MAX_LASERS = 32;
export const MAX_SUSTAINS = 32;

/**
 * Original name: kbutton_t
 * Source: client/client.h
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Tracks the pressed keys and timing state backing one continuous Quake II input action.
 *
 * Porting notes:
 * - Preserves the original bit-packed `state` semantics.
 */
export interface kbutton_t {
  down: [number, number];
  downtime: number;
  msec: number;
  state: number;
}

/**
 * Original name: frame_t
 * Source: client/client.h
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Stores one parsed server frame along with player state and packet entities metadata.
 *
 * Porting notes:
 * - Uses a Uint8Array for `areabits` instead of a fixed C byte array.
 */
export interface frame_t {
  valid: boolean;
  serverframe: number;
  servertime: number;
  deltaframe: number;
  areabits: Uint8Array;
  playerstate: player_state_t;
  num_entities: number;
  parse_entities: number;
}

/**
 * Original name: centity_t
 * Source: client/client.h
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Stores baseline, current and previous render-facing entity state for one edict number.
 *
 * Porting notes:
 * - Preserves the original field names and interpolation-related state.
 */
export interface centity_t {
  baseline: entity_state_t;
  current: entity_state_t;
  prev: entity_state_t;
  serverframe: number;
  trailcount: number;
  lerp_origin: vec3_t;
  fly_stoptime: number;
}

/**
 * Category: New
 * Purpose: Preserve the parts of `clientinfo_t` needed by early parsing work before renderer registration exists.
 *
 * Constraints:
 * - Must keep the original textual fields available for future refresh preparation.
 */
export interface clientinfo_t {
  name: string;
  cinfo: string;
  model_name: string;
  skin_name: string;
  model_filename: string;
  skin_filename: string;
  skin: unknown;
  icon: unknown;
  iconname: string;
  model: unknown;
  weaponmodel: unknown[];
  weaponmodel_paths: string[];
  valid: boolean;
}

/**
 * Category: New
 * Purpose: Preserve one client-side temporary beam slot modeled after `beam_t`.
 *
 * Constraints:
 * - Must retain entity binding, timing and endpoints for later refresh reconstruction.
 */
export interface client_beam_t {
  entity: number;
  dest_entity: number;
  model: string | null;
  endtime: number;
  offset: vec3_t;
  start: vec3_t;
  end: vec3_t;
}

/**
 * Category: New
 * Purpose: Preserve one client-side temporary explosion slot modeled after `explosion_t`.
 *
 * Constraints:
 * - Must retain animation timing, model identity and dynamic light metadata.
 */
export interface client_explosion_t {
  type: "free" | "explosion" | "misc" | "flash" | "mflash" | "poly" | "poly2";
  model: string | null;
  frames: number;
  light: number;
  lightcolor: [number, number, number];
  start: number;
  baseframe: number;
  origin: vec3_t;
  angles: vec3_t;
  flags: number;
  alpha: number;
  skinnum: number;
}

/**
 * Category: New
 * Purpose: Preserve one client-side temporary laser slot modeled after `laser_t`.
 *
 * Constraints:
 * - Must retain beam endpoints, render flags and timeout.
 */
export interface client_laser_t {
  start: vec3_t;
  end: vec3_t;
  endtime: number;
  flags: number;
  alpha: number;
  skinnum: number;
  frame: number;
}

/**
 * Category: New
 * Purpose: Preserve one client-side sustain slot modeled after `cl_sustain_t`.
 *
 * Constraints:
 * - Must retain timer and payload values until the matching thinker port exists.
 */
export interface client_sustain_t {
  id: number;
  type: "none" | "steam" | "widow" | "nuke";
  endtime: number;
  nextthink: number;
  thinkinterval: number;
  org: vec3_t;
  dir: vec3_t;
  color: number;
  count: number;
  magnitude: number;
}

/**
 * Category: New
 * Purpose: Preserve one transient temp light event such as `CL_Flashlight`.
 *
 * Constraints:
 * - Must retain origin, color, intensity and timeout for later refresh reconstruction.
 */
export interface client_temp_light_t {
  origin: vec3_t;
  color: [number, number, number];
  intensity: number;
  minlight: number;
  endtime: number;
  entity: number;
  kind: "flashlight";
}

/**
 * Category: New
 * Purpose: Preserve one transient force-wall effect segment.
 *
 * Constraints:
 * - Must retain endpoints, color and timeout for later renderer adapters.
 */
export interface client_force_wall_t {
  start: vec3_t;
  end: vec3_t;
  color: number;
  endtime: number;
}

/**
 * Category: New
 * Purpose: Group the persistent temporary-entity arrays ported from `cl_tent.c`.
 *
 * Constraints:
 * - Must keep each family in fixed-size slot arrays close to the original layout.
 */
export interface client_tent_state_t {
  beams: client_beam_t[];
  playerbeams: client_beam_t[];
  explosions: client_explosion_t[];
  lasers: client_laser_t[];
  sustains: client_sustain_t[];
  tempLights: client_temp_light_t[];
  forceWalls: client_force_wall_t[];
  registeredSounds: string[];
}

/**
 * Category: New
 * Purpose: Preserve the client-side screen and HUD transient state used by `cl_scrn.c`.
 *
 * Constraints:
 * - Must keep center-print and loading-plaque state explicit for later UI adapters.
 */
export interface client_screen_state_t {
  scr_centerstring: string;
  scr_centertime_start: number;
  scr_centertime_off: number;
  scr_center_lines: number;
  scr_erase_center: number;
  scr_draw_loading: number;
}

/**
 * Category: New
 * Purpose: Preserve the client-side precache traversal state used by `CL_RequestNextDownload`.
 *
 * Constraints:
 * - Must keep the original counters explicit so the precache loop can resume after each download.
 */
export interface client_precache_state_t {
  precache_check: number;
  precache_spawncount: number;
  precache_tex: number;
  precache_model_skin: number;
}

/**
 * Original name: client_state_t
 * Source: client/client.h
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Stores level-scoped client runtime state cleared on server map change.
 *
 * Porting notes:
 * - Keeps renderer-facing fields as placeholders until later phases.
 */
export interface client_state_t {
  timeoutcount: number;
  timedemo_frames: number;
  timedemo_start: number;
  refresh_prepped: boolean;
  sound_prepped: boolean;
  force_refdef: boolean;
  parse_entities: number;
  cmd: usercmd_t;
  cmds: usercmd_t[];
  cmd_time: number[];
  predicted_origins: number[][];
  predicted_pmove: player_state_t["pmove"];
  predicted_step: number;
  predicted_step_time: number;
  predicted_origin: vec3_t;
  predicted_angles: vec3_t;
  prediction_error: vec3_t;
  frame: frame_t;
  surpressCount: number;
  frames: frame_t[];
  viewangles: vec3_t;
  time: number;
  lerpfrac: number;
  layout: string;
  inventory: number[];
  attractloop: boolean;
  servercount: number;
  gamedir: string;
  playernum: number;
  configstrings: string[];
  model_draw: unknown[];
  model_clip: unknown[];
  sound_precache: unknown[];
  image_precache: unknown[];
  cl_weaponmodels: string[];
  num_cl_weaponmodels: number;
  clientinfo: clientinfo_t[];
  baseclientinfo: clientinfo_t;
  tents: client_tent_state_t;
  screen: client_screen_state_t;
}

/**
 * Original name: connstate_t
 * Source: client/client.h
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Describes the client connection lifecycle state.
 *
 * Porting notes:
 * - Preserves original enum ordering.
 */
export enum connstate_t {
  ca_uninitialized,
  ca_disconnected,
  ca_connecting,
  ca_connected,
  ca_active
}

/**
 * Category: New
 * Purpose: Preserve the minimal `client_static_t` fields needed by early network parsing and connection state.
 *
 * Constraints:
 * - Must keep connection state and protocol fields explicit.
 */
export interface client_static_t {
  state: connstate_t;
  realtime: number;
  frametime: number;
  disable_screen: number;
  disable_servercount: number;
  servername: string;
  connect_time: number;
  serverProtocol: number;
  challenge: number;
  downloadname: string;
  downloadtempname: string;
  downloadnumber: number;
  downloadpercent: number;
  demorecording: boolean;
  demowaiting: boolean;
  precache: client_precache_state_t;
}

/**
 * Category: New
 * Purpose: Expose the minimal client runtime bundle used by early client message parsing.
 *
 * Constraints:
 * - Must keep mutable parsing state explicit for deterministic tests.
 */
export interface ClientRuntime {
  cl: client_state_t;
  cls: client_static_t;
  cl_entities: centity_t[];
  cl_parse_entities: entity_state_t[];
  net_message: sizebuf_t;
  output: string[];
}

/**
 * Category: New
 * Purpose: Create a zero-initialized Quake II frame value.
 *
 * Constraints:
 * - Must preserve C-style zero defaults.
 */
export function createFrame(): frame_t {
  return {
    valid: false,
    serverframe: 0,
    servertime: 0,
    deltaframe: 0,
    areabits: new Uint8Array(MAX_MAP_AREAS / 8),
    playerstate: createPlayerState(),
    num_entities: 0,
    parse_entities: 0
  };
}

/**
 * Category: New
 * Purpose: Create a zero-initialized client entity state record.
 *
 * Constraints:
 * - Must preserve the original interpolation fields.
 */
export function createCentity(): centity_t {
  return {
    baseline: createEntityState(),
    current: createEntityState(),
    prev: createEntityState(),
    serverframe: 0,
    trailcount: 0,
    lerp_origin: [0, 0, 0],
    fly_stoptime: 0
  };
}

/**
 * Category: New
 * Purpose: Create a minimal zero-initialized client info record.
 *
 * Constraints:
 * - Must preserve Quake-style empty string defaults.
 */
export function createClientinfo(): clientinfo_t {
  return {
    name: "",
    cinfo: "",
    model_name: "",
    skin_name: "",
    model_filename: "",
    skin_filename: "",
    skin: null,
    icon: null,
    iconname: "",
    model: null,
    weaponmodel: new Array<unknown>(MAX_CLIENTWEAPONMODELS).fill(null),
    weaponmodel_paths: new Array<string>(MAX_CLIENTWEAPONMODELS).fill(""),
    valid: false
  };
}

/**
 * Category: New
 * Purpose: Create one zero-initialized temp beam slot.
 *
 * Constraints:
 * - Must preserve the original empty-slot semantics.
 */
export function createClientBeam(): client_beam_t {
  return {
    entity: 0,
    dest_entity: 0,
    model: null,
    endtime: 0,
    offset: [0, 0, 0],
    start: [0, 0, 0],
    end: [0, 0, 0]
  };
}

/**
 * Category: New
 * Purpose: Create one zero-initialized temp explosion slot.
 *
 * Constraints:
 * - Must preserve the original `ex_free` startup semantics.
 */
export function createClientExplosion(): client_explosion_t {
  return {
    type: "free",
    model: null,
    frames: 0,
    light: 0,
    lightcolor: [0, 0, 0],
    start: 0,
    baseframe: 0,
    origin: [0, 0, 0],
    angles: [0, 0, 0],
    flags: 0,
    alpha: 0,
    skinnum: 0
  };
}

/**
 * Category: New
 * Purpose: Create one zero-initialized temp laser slot.
 *
 * Constraints:
 * - Must preserve the original timeout-based free-slot semantics.
 */
export function createClientLaser(): client_laser_t {
  return {
    start: [0, 0, 0],
    end: [0, 0, 0],
    endtime: 0,
    flags: 0,
    alpha: 0,
    skinnum: 0,
    frame: 0
  };
}

/**
 * Category: New
 * Purpose: Create one zero-initialized temp sustain slot.
 *
 * Constraints:
 * - Must preserve the original `id == 0` free-slot convention.
 */
export function createClientSustain(): client_sustain_t {
  return {
    id: 0,
    type: "none",
    endtime: 0,
    nextthink: 0,
    thinkinterval: 0,
    org: [0, 0, 0],
    dir: [0, 0, 0],
    color: 0,
    count: 0,
    magnitude: 0
  };
}

/**
 * Category: New
 * Purpose: Create one zero-initialized transient temp light slot.
 *
 * Constraints:
 * - Must preserve timeout-based free-slot semantics.
 */
export function createClientTempLight(): client_temp_light_t {
  return {
    origin: [0, 0, 0],
    color: [0, 0, 0],
    intensity: 0,
    minlight: 0,
    endtime: 0,
    entity: 0,
    kind: "flashlight"
  };
}

/**
 * Category: New
 * Purpose: Create one zero-initialized transient force-wall slot.
 *
 * Constraints:
 * - Must preserve timeout-based free-slot semantics.
 */
export function createClientForceWall(): client_force_wall_t {
  return {
    start: [0, 0, 0],
    end: [0, 0, 0],
    color: 0,
    endtime: 0
  };
}

/**
 * Category: New
 * Purpose: Create the persistent temp-entity state arrays ported from `cl_tent.c`.
 *
 * Constraints:
 * - Must preserve the original slot counts.
 */
export function createClientTentState(): client_tent_state_t {
  return {
    beams: Array.from({ length: MAX_BEAMS }, () => createClientBeam()),
    playerbeams: Array.from({ length: MAX_BEAMS }, () => createClientBeam()),
    explosions: Array.from({ length: MAX_EXPLOSIONS }, () => createClientExplosion()),
    lasers: Array.from({ length: MAX_LASERS }, () => createClientLaser()),
    sustains: Array.from({ length: MAX_SUSTAINS }, () => createClientSustain()),
    tempLights: Array.from({ length: MAX_EXPLOSIONS }, () => createClientTempLight()),
    forceWalls: Array.from({ length: MAX_EXPLOSIONS }, () => createClientForceWall()),
    registeredSounds: []
  };
}

/**
 * Category: New
 * Purpose: Create a zero-initialized client screen state compatible with early `cl_scrn.c` ports.
 *
 * Constraints:
 * - Must preserve the original empty center-print and loading defaults.
 */
export function createClientScreenState(): client_screen_state_t {
  return {
    scr_centerstring: "",
    scr_centertime_start: 0,
    scr_centertime_off: 0,
    scr_center_lines: 0,
    scr_erase_center: 0,
    scr_draw_loading: 0
  };
}

/**
 * Category: New
 * Purpose: Create a zero-initialized client level state compatible with early parser ports.
 *
 * Constraints:
 * - Must keep fixed-length arrays aligned with original capacities.
 */
export function createClientState(): client_state_t {
  return {
    timeoutcount: 0,
    timedemo_frames: 0,
    timedemo_start: 0,
    refresh_prepped: false,
    sound_prepped: false,
    force_refdef: false,
    parse_entities: 0,
    cmd: createUsercmd(),
    cmds: Array.from({ length: CMD_BACKUP }, () => createUsercmd()),
    cmd_time: new Array<number>(CMD_BACKUP).fill(0),
    predicted_origins: Array.from({ length: CMD_BACKUP }, () => [0, 0, 0]),
    predicted_pmove: createPlayerState().pmove,
    predicted_step: 0,
    predicted_step_time: 0,
    predicted_origin: [0, 0, 0],
    predicted_angles: [0, 0, 0],
    prediction_error: [0, 0, 0],
    frame: createFrame(),
    surpressCount: 0,
    frames: Array.from({ length: UPDATE_BACKUP }, () => createFrame()),
    viewangles: [0, 0, 0],
    time: 0,
    lerpfrac: 0,
    layout: "",
    inventory: new Array<number>(MAX_ITEMS).fill(0),
    attractloop: false,
    servercount: 0,
    gamedir: "",
    playernum: 0,
    configstrings: new Array<string>(MAX_CONFIGSTRINGS).fill(""),
    model_draw: new Array<unknown>(MAX_MODELS).fill(null),
    model_clip: new Array<unknown>(MAX_MODELS).fill(null),
    sound_precache: new Array<unknown>(MAX_SOUNDS).fill(null),
    image_precache: new Array<unknown>(MAX_IMAGES).fill(null),
    cl_weaponmodels: ["weapon.md2"],
    num_cl_weaponmodels: 1,
    clientinfo: Array.from({ length: MAX_CLIENTS }, () => createClientinfo()),
    baseclientinfo: createClientinfo(),
    tents: createClientTentState(),
    screen: createClientScreenState()
  };
}

/**
 * Category: New
 * Purpose: Create a zero-initialized persistent client static state.
 *
 * Constraints:
 * - Must preserve the original disconnected startup state.
 */
export function createClientStatic(): client_static_t {
  return {
    state: connstate_t.ca_disconnected,
    realtime: 0,
    frametime: 0,
    disable_screen: 0,
    disable_servercount: 0,
    servername: "",
    connect_time: 0,
    serverProtocol: 0,
    challenge: 0,
    downloadname: "",
    downloadtempname: "",
    downloadnumber: 0,
    downloadpercent: 0,
    demorecording: false,
    demowaiting: false,
    precache: createClientPrecacheState()
  };
}

/**
 * Category: New
 * Purpose: Create a zero-initialized client precache traversal state.
 *
 * Constraints:
 * - Must preserve C-style zero defaults for the resumable precache loop.
 */
export function createClientPrecacheState(): client_precache_state_t {
  return {
    precache_check: 0,
    precache_spawncount: 0,
    precache_tex: 0,
    precache_model_skin: 0
  };
}

/**
 * Category: New
 * Purpose: Create the minimal client parsing runtime bundle used by current parser ports.
 *
 * Constraints:
 * - Must provide a mutable network message buffer.
 */
export function createClientRuntime(): ClientRuntime {
  return {
    cl: createClientState(),
    cls: createClientStatic(),
    cl_entities: Array.from({ length: MAX_EDICTS }, () => createCentity()),
    cl_parse_entities: Array.from({ length: MAX_PARSE_ENTITIES }, () => createEntityState()),
    net_message: createSizeBuffer(65536),
    output: []
  };
}

/**
 * Category: New
 * Purpose: Create a zero-initialized Quake II key button state.
 *
 * Constraints:
 * - Must preserve the original dual-key tracking layout.
 */
export function createKbutton(): kbutton_t {
  return {
    down: [0, 0],
    downtime: 0,
    msec: 0,
    state: 0
  };
}

/**
 * Category: New
 * Purpose: Create a zero-initialized user command matching Quake II defaults.
 *
 * Constraints:
 * - Must preserve C-style zero values for all movement fields.
 */
function createUsercmd(): usercmd_t {
  return {
    msec: 0,
    buttons: 0,
    angles: [0, 0, 0],
    forwardmove: 0,
    sidemove: 0,
    upmove: 0,
    impulse: 0,
    lightlevel: 0
  };
}
