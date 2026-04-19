/**
 * File: parse.ts
 * Source: Quake II original / client/cl_parse.c and client/cl_ents.c
 * Purpose: Port the first Quake II client message parsing routines for server data, configstrings, baselines and frames.
 *
 * Porting policy:
 * - Preserve original behavior first.
 * - Preserve original names whenever possible.
 * - Avoid structural refactors unless documented.
 *
 * Deviations:
 * - Defers sound, refresh, temporary entity and inventory side effects to optional hooks.
 * - Uses explicit runtime objects instead of file-static globals.
 *
 * Notes:
 * - This file is intended to stay conceptually close to the original C source.
 */

import {
  MSG_ReadAngle,
  MSG_ReadAngle16,
  MSG_ReadByte,
  MSG_ReadChar,
  MSG_ReadCoord,
  MSG_ReadData,
  MSG_ReadLong,
  MSG_ReadPos,
  MSG_ReadShort,
  MSG_ReadString,
  MSG_WriteByte,
  MSG_WriteString,
  PRINT_CHAT,
  createEntityState,
  entity_event_t,
  pmtype_t,
  temp_event_t,
  CS_PLAYERSKINS,
  MAX_CONFIGSTRINGS,
  MAX_CLIENTS,
  MAX_EDICTS,
  MAX_ITEMS,
  MAX_STATS
} from "../../qcommon/src/index.js";
import {
  BASEDIRNAME,
  clc_ops_e,
  PROTOCOL_VERSION,
  PS_BLEND,
  PS_FOV,
  PS_KICKANGLES,
  PS_M_DELTA_ANGLES,
  PS_M_FLAGS,
  PS_M_GRAVITY,
  PS_M_ORIGIN,
  PS_M_TIME,
  PS_M_TYPE,
  PS_M_VELOCITY,
  PS_RDFLAGS,
  PS_VIEWANGLES,
  PS_VIEWOFFSET,
  PS_WEAPONFRAME,
  PS_WEAPONINDEX,
  svc_ops_e,
  svc_strings,
  U_ANGLE1,
  U_ANGLE2,
  U_ANGLE3,
  U_EFFECTS8,
  U_EFFECTS16,
  U_EVENT,
  U_FRAME8,
  U_FRAME16,
  U_MODEL,
  U_MODEL2,
  U_MODEL3,
  U_MODEL4,
  U_MOREBITS1,
  U_MOREBITS2,
  U_MOREBITS3,
  U_NUMBER16,
  U_OLDORIGIN,
  U_ORIGIN1,
  U_ORIGIN2,
  U_ORIGIN3,
  U_REMOVE,
  U_RENDERFX8,
  U_RENDERFX16,
  U_SKIN8,
  U_SKIN16,
  U_SOLID,
  U_SOUND,
  UPDATE_MASK
} from "../../qcommon/src/index.js";
import { type ClientRuntime, type frame_t } from "./types.js";
import { MAX_PARSE_ENTITIES, connstate_t, createFrame } from "./types.js";
import { CL_FireEntityEvents, type ClientEntityEvent } from "./entities.js";
import { CL_AddTEntPacket, CL_ClearTEnts } from "./tent.js";
import { CL_CheckPredictionError } from "./view.js";

/**
 * Category: New
 * Purpose: Describe optional side-effect callbacks used while the client parser is still being ported incrementally.
 *
 * Constraints:
 * - Must keep parser behavior testable without renderer or sound backends.
 */
export interface ClientParseHooks {
  onPrint?: (line: string) => void;
  onDisconnect?: (reason: string) => void;
  onReconnect?: () => void;
  onStufftext?: (text: string) => void;
  onCenterPrint?: (text: string) => void;
  onLayout?: (text: string) => void;
  onConfigString?: (index: number, value: string) => void;
  onClientinfo?: (player: number, clientinfo: ClientRuntime["cl"]["clientinfo"][number]) => void;
  onServerData?: (levelName: string) => void;
  onSoundPacket?: (packet: ClientSoundPacket) => void;
  onMuzzleFlash?: (packet: ClientMuzzleFlashPacket) => void;
  onMuzzleFlash2?: (packet: ClientMuzzleFlash2Packet) => void;
  onTempEntity?: (packet: ClientTempEntityPacket) => void;
  onDownloadBlock?: (block: ClientDownloadBlock) => void;
  onEntityEvent?: (event: ClientEntityEvent) => void;
  onFrameParsed?: (frame: frame_t) => void;
  onUnsupportedCommand?: (command: number) => void;
}

/**
 * Category: New
 * Purpose: Describe one parsed Quake II `svc_sound` payload before it is forwarded to an audio backend.
 *
 * Constraints:
 * - Must preserve entity-relative and positioned variants.
 */
export interface ClientSoundPacket {
  flags: number;
  sound_num: number;
  volume: number;
  attenuation: number;
  ofs: number;
  ent: number;
  channel: number;
  pos: [number, number, number] | null;
}

/**
 * Category: New
 * Purpose: Describe one parsed Quake II download block emitted by `svc_download`.
 *
 * Constraints:
 * - Must preserve the server-provided percent and payload bytes.
 */
export interface ClientDownloadBlock {
  size: number;
  percent: number;
  bytes: Uint8Array;
  missing: boolean;
}

/**
 * Category: New
 * Purpose: Describe one parsed `svc_muzzleflash` payload before client-side visual/audio effects are applied.
 *
 * Constraints:
 * - Must preserve the entity number and original weapon byte including silenced state.
 */
export interface ClientMuzzleFlashPacket {
  entity: number;
  weapon: number;
  silenced: boolean;
}

/**
 * Category: New
 * Purpose: Describe one parsed `svc_muzzleflash2` payload.
 *
 * Constraints:
 * - Must preserve the source entity number and monster flash id.
 */
export interface ClientMuzzleFlash2Packet {
  entity: number;
  flashNumber: number;
}

/**
 * Category: New
 * Purpose: Describe one parsed `svc_temp_entity` payload in a renderer/audio-backend-friendly structure.
 *
 * Constraints:
 * - Must preserve the temp event type and all bytes consumed from the message stream.
 */
export interface ClientTempEntityPacket {
  type: number;
  count?: number;
  color?: number;
  entity?: number;
  entity2?: number;
  id?: number;
  magnitude?: number;
  position?: [number, number, number];
  position2?: [number, number, number];
  offset?: [number, number, number];
  directionByte?: number;
  durationMs?: number;
  beamKind?: "beam" | "beam2" | "player-beam" | "lightning" | "laser" | "steam" | "widow" | "nuke";
}

/**
 * Original name: CL_ClearState
 * Source: client/cl_main.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Clears the level-scoped client state before entering a new server/game state.
 *
 * Porting notes:
 * - Preserves entity and parse entity storage while resetting values in place.
 */
export function CL_ClearState(runtime: ClientRuntime): void {
  runtime.cl = {
    ...runtime.cl,
    ...createFrameClearedClientState(runtime)
  };

  for (const entity of runtime.cl_entities) {
    entity.baseline = createEntityState();
    entity.current = createEntityState();
    entity.prev = createEntityState();
    entity.serverframe = 0;
    entity.trailcount = 0;
    entity.lerp_origin = [0, 0, 0];
    entity.fly_stoptime = 0;
  }

  for (let index = 0; index < runtime.cl_parse_entities.length; index += 1) {
    runtime.cl_parse_entities[index] = createEntityState();
  }

  CL_ClearTEnts(runtime);
}

/**
 * Original name: CL_ParseEntityBits
 * Source: client/cl_ents.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Reads one entity update header and returns the entity number and bitfield.
 *
 * Porting notes:
 * - Returns both values as an object instead of using an out pointer.
 */
export function CL_ParseEntityBits(runtime: ClientRuntime): { bits: number; number: number } {
  let total = MSG_ReadByte(runtime.net_message);

  if (total & U_MOREBITS1) {
    total |= MSG_ReadByte(runtime.net_message) << 8;
  }
  if (total & U_MOREBITS2) {
    total |= MSG_ReadByte(runtime.net_message) << 16;
  }
  if (total & U_MOREBITS3) {
    total |= MSG_ReadByte(runtime.net_message) << 24;
  }

  const number = (total & U_NUMBER16) !== 0
    ? MSG_ReadShort(runtime.net_message)
    : MSG_ReadByte(runtime.net_message);

  return { bits: total, number };
}

/**
 * Original name: CL_ParseDelta
 * Source: client/cl_ents.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Applies one entity delta against a previous or baseline state.
 *
 * Porting notes:
 * - Mutates the destination entity state passed by reference, matching the original porting shape.
 */
export function CL_ParseDelta(runtime: ClientRuntime, from: ReturnType<typeof createEntityState>, to: ReturnType<typeof createEntityState>, number: number, bits: number): void {
  copyEntityState(from, to);
  to.old_origin = [...from.origin];
  to.number = number;

  if (bits & U_MODEL) {
    to.modelindex = MSG_ReadByte(runtime.net_message);
  }
  if (bits & U_MODEL2) {
    to.modelindex2 = MSG_ReadByte(runtime.net_message);
  }
  if (bits & U_MODEL3) {
    to.modelindex3 = MSG_ReadByte(runtime.net_message);
  }
  if (bits & U_MODEL4) {
    to.modelindex4 = MSG_ReadByte(runtime.net_message);
  }
  if (bits & U_FRAME8) {
    to.frame = MSG_ReadByte(runtime.net_message);
  }
  if (bits & U_FRAME16) {
    to.frame = MSG_ReadShort(runtime.net_message);
  }

  if ((bits & U_SKIN8) !== 0 && (bits & U_SKIN16) !== 0) {
    to.skinnum = MSG_ReadLong(runtime.net_message);
  } else if (bits & U_SKIN8) {
    to.skinnum = MSG_ReadByte(runtime.net_message);
  } else if (bits & U_SKIN16) {
    to.skinnum = MSG_ReadShort(runtime.net_message);
  }

  if ((bits & (U_EFFECTS8 | U_EFFECTS16)) === (U_EFFECTS8 | U_EFFECTS16)) {
    to.effects = MSG_ReadLong(runtime.net_message);
  } else if (bits & U_EFFECTS8) {
    to.effects = MSG_ReadByte(runtime.net_message);
  } else if (bits & U_EFFECTS16) {
    to.effects = MSG_ReadShort(runtime.net_message);
  }

  if ((bits & (U_RENDERFX8 | U_RENDERFX16)) === (U_RENDERFX8 | U_RENDERFX16)) {
    to.renderfx = MSG_ReadLong(runtime.net_message);
  } else if (bits & U_RENDERFX8) {
    to.renderfx = MSG_ReadByte(runtime.net_message);
  } else if (bits & U_RENDERFX16) {
    to.renderfx = MSG_ReadShort(runtime.net_message);
  }

  if (bits & U_ORIGIN1) {
    to.origin[0] = MSG_ReadCoord(runtime.net_message);
  }
  if (bits & U_ORIGIN2) {
    to.origin[1] = MSG_ReadCoord(runtime.net_message);
  }
  if (bits & U_ORIGIN3) {
    to.origin[2] = MSG_ReadCoord(runtime.net_message);
  }
  if (bits & U_ANGLE1) {
    to.angles[0] = MSG_ReadAngle(runtime.net_message);
  }
  if (bits & U_ANGLE2) {
    to.angles[1] = MSG_ReadAngle(runtime.net_message);
  }
  if (bits & U_ANGLE3) {
    to.angles[2] = MSG_ReadAngle(runtime.net_message);
  }
  if (bits & U_OLDORIGIN) {
    to.old_origin = MSG_ReadPos(runtime.net_message);
  }
  if (bits & U_SOUND) {
    to.sound = MSG_ReadByte(runtime.net_message);
  }
  to.event = (bits & U_EVENT) !== 0 ? MSG_ReadByte(runtime.net_message) : 0;
  if (bits & U_SOLID) {
    to.solid = MSG_ReadShort(runtime.net_message);
  }
}

/**
 * Original name: CL_ParsePlayerstate
 * Source: client/cl_ents.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Reads one delta-compressed player state into the target frame.
 *
 * Porting notes:
 * - Preserves the original field-by-field update order.
 */
export function CL_ParsePlayerstate(runtime: ClientRuntime, oldframe: frame_t | null, newframe: frame_t): void {
  const state = newframe.playerstate;
  const source = oldframe ? oldframe.playerstate : createFrame().playerstate;
  copyPlayerState(source, state);

  const flags = MSG_ReadShort(runtime.net_message);

  if (flags & PS_M_TYPE) {
    state.pmove.pm_type = MSG_ReadByte(runtime.net_message) as pmtype_t;
  }
  if (flags & PS_M_ORIGIN) {
    state.pmove.origin[0] = MSG_ReadShort(runtime.net_message);
    state.pmove.origin[1] = MSG_ReadShort(runtime.net_message);
    state.pmove.origin[2] = MSG_ReadShort(runtime.net_message);
  }
  if (flags & PS_M_VELOCITY) {
    state.pmove.velocity[0] = MSG_ReadShort(runtime.net_message);
    state.pmove.velocity[1] = MSG_ReadShort(runtime.net_message);
    state.pmove.velocity[2] = MSG_ReadShort(runtime.net_message);
  }
  if (flags & PS_M_TIME) {
    state.pmove.pm_time = MSG_ReadByte(runtime.net_message);
  }
  if (flags & PS_M_FLAGS) {
    state.pmove.pm_flags = MSG_ReadByte(runtime.net_message);
  }
  if (flags & PS_M_GRAVITY) {
    state.pmove.gravity = MSG_ReadShort(runtime.net_message);
  }
  if (flags & PS_M_DELTA_ANGLES) {
    state.pmove.delta_angles[0] = MSG_ReadShort(runtime.net_message);
    state.pmove.delta_angles[1] = MSG_ReadShort(runtime.net_message);
    state.pmove.delta_angles[2] = MSG_ReadShort(runtime.net_message);
  }

  if (runtime.cl.attractloop) {
    state.pmove.pm_type = pmtype_t.PM_FREEZE;
  }

  if (flags & PS_VIEWOFFSET) {
    state.viewoffset[0] = MSG_ReadChar(runtime.net_message) * 0.25;
    state.viewoffset[1] = MSG_ReadChar(runtime.net_message) * 0.25;
    state.viewoffset[2] = MSG_ReadChar(runtime.net_message) * 0.25;
  }
  if (flags & PS_VIEWANGLES) {
    state.viewangles[0] = MSG_ReadAngle16(runtime.net_message);
    state.viewangles[1] = MSG_ReadAngle16(runtime.net_message);
    state.viewangles[2] = MSG_ReadAngle16(runtime.net_message);
  }
  if (flags & PS_KICKANGLES) {
    state.kick_angles[0] = MSG_ReadChar(runtime.net_message) * 0.25;
    state.kick_angles[1] = MSG_ReadChar(runtime.net_message) * 0.25;
    state.kick_angles[2] = MSG_ReadChar(runtime.net_message) * 0.25;
  }
  if (flags & PS_WEAPONINDEX) {
    state.gunindex = MSG_ReadByte(runtime.net_message);
  }
  if (flags & PS_WEAPONFRAME) {
    state.gunframe = MSG_ReadByte(runtime.net_message);
    state.gunoffset[0] = MSG_ReadChar(runtime.net_message) * 0.25;
    state.gunoffset[1] = MSG_ReadChar(runtime.net_message) * 0.25;
    state.gunoffset[2] = MSG_ReadChar(runtime.net_message) * 0.25;
    state.gunangles[0] = MSG_ReadChar(runtime.net_message) * 0.25;
    state.gunangles[1] = MSG_ReadChar(runtime.net_message) * 0.25;
    state.gunangles[2] = MSG_ReadChar(runtime.net_message) * 0.25;
  }
  if (flags & PS_BLEND) {
    state.blend[0] = MSG_ReadByte(runtime.net_message) / 255;
    state.blend[1] = MSG_ReadByte(runtime.net_message) / 255;
    state.blend[2] = MSG_ReadByte(runtime.net_message) / 255;
    state.blend[3] = MSG_ReadByte(runtime.net_message) / 255;
  }
  if (flags & PS_FOV) {
    state.fov = MSG_ReadByte(runtime.net_message);
  }
  if (flags & PS_RDFLAGS) {
    state.rdflags = MSG_ReadByte(runtime.net_message);
  }

  const statbits = MSG_ReadLong(runtime.net_message);
  for (let index = 0; index < MAX_STATS && index < state.stats.length; index += 1) {
    if ((statbits & (1 << index)) !== 0) {
      state.stats[index] = MSG_ReadShort(runtime.net_message);
    }
  }
}

/**
 * Original name: CL_ParseBaseline
 * Source: client/cl_parse.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Parses and stores one baseline entity.
 *
 * Porting notes:
 * - Reuses the already ported entity delta parser against a null state.
 */
export function CL_ParseBaseline(runtime: ClientRuntime): void {
  const { bits, number } = CL_ParseEntityBits(runtime);
  const nullstate = createEntityState();
  const baseline = runtime.cl_entities[number].baseline;
  CL_ParseDelta(runtime, nullstate, baseline, number, bits);
}

/**
 * Original name: CL_ParseStartSoundPacket
 * Source: client/cl_parse.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Parses one `svc_sound` packet into a normalized sound event payload.
 *
 * Porting notes:
 * - Returns structured data through a hook instead of calling `S_StartSound`.
 */
export function CL_ParseStartSoundPacket(runtime: ClientRuntime, hooks: ClientParseHooks = {}): ClientSoundPacket {
  const flags = MSG_ReadByte(runtime.net_message);
  const sound_num = MSG_ReadByte(runtime.net_message);

  const volume = (flags & 1) !== 0 ? MSG_ReadByte(runtime.net_message) / 255 : 1.0;
  const attenuation = (flags & 2) !== 0 ? MSG_ReadByte(runtime.net_message) / 64 : 1.0;
  const ofs = (flags & 16) !== 0 ? MSG_ReadByte(runtime.net_message) / 1000 : 0;

  let ent = 0;
  let channel = 0;
  if ((flags & 8) !== 0) {
    const packedChannel = MSG_ReadShort(runtime.net_message);
    ent = packedChannel >> 3;
    if (ent > MAX_EDICTS) {
      throw new Error(`CL_ParseStartSoundPacket: ent = ${ent}`);
    }
    channel = packedChannel & 7;
  }

  const pos = (flags & 4) !== 0 ? MSG_ReadPos(runtime.net_message) : null;
  const packet: ClientSoundPacket = {
    flags,
    sound_num,
    volume,
    attenuation,
    ofs,
    ent,
    channel,
    pos
  };

  hooks.onSoundPacket?.(packet);
  return packet;
}

/**
 * Original name: CL_ParseDownload
 * Source: client/cl_parse.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Parses one download block from the server and updates in-progress download state.
 *
 * Porting notes:
 * - Defers temp-file writes and rename logic to future platform adapters.
 */
export function CL_ParseDownload(runtime: ClientRuntime, hooks: ClientParseHooks = {}): ClientDownloadBlock {
  const size = MSG_ReadShort(runtime.net_message);
  const percent = MSG_ReadByte(runtime.net_message);

  if (size === -1) {
    const missingBlock: ClientDownloadBlock = {
      size,
      percent,
      bytes: new Uint8Array(0),
      missing: true
    };
    hooks.onDownloadBlock?.(missingBlock);
    return missingBlock;
  }

  const bytes = MSG_ReadData(runtime.net_message, size);
  runtime.cls.downloadpercent = percent;
  if (percent === 100) {
    runtime.cls.downloadpercent = 0;
  }

  const block: ClientDownloadBlock = {
    size,
    percent,
    bytes,
    missing: false
  };
  hooks.onDownloadBlock?.(block);
  return block;
}

/**
 * Original name: CL_ParseMuzzleFlash
 * Source: client/cl_fx.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Parses one player weapon muzzle flash event.
 *
 * Porting notes:
 * - Returns a structured packet and defers light, sound and particle side effects to hooks.
 */
export function CL_ParseMuzzleFlash(runtime: ClientRuntime, hooks: ClientParseHooks = {}): ClientMuzzleFlashPacket {
  const entity = MSG_ReadShort(runtime.net_message);
  if (entity < 1 || entity >= MAX_EDICTS) {
    throw new Error(`CL_ParseMuzzleFlash: bad entity ${entity}`);
  }

  const weapon = MSG_ReadByte(runtime.net_message);
  const packet: ClientMuzzleFlashPacket = {
    entity,
    weapon,
    silenced: (weapon & 128) !== 0
  };
  hooks.onMuzzleFlash?.(packet);
  return packet;
}

/**
 * Original name: CL_ParseMuzzleFlash2
 * Source: client/cl_fx.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Parses one monster muzzle flash event.
 *
 * Porting notes:
 * - Returns a structured packet and defers all effect spawning to hooks.
 */
export function CL_ParseMuzzleFlash2(runtime: ClientRuntime, hooks: ClientParseHooks = {}): ClientMuzzleFlash2Packet {
  const entity = MSG_ReadShort(runtime.net_message);
  if (entity < 1 || entity >= MAX_EDICTS) {
    throw new Error(`CL_ParseMuzzleFlash2: bad entity ${entity}`);
  }

  const flashNumber = MSG_ReadByte(runtime.net_message);
  const packet: ClientMuzzleFlash2Packet = {
    entity,
    flashNumber
  };
  hooks.onMuzzleFlash2?.(packet);
  return packet;
}

/**
 * Original name: CL_ParseTEnt
 * Source: client/cl_tent.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Parses one temporary entity event payload from the server message stream.
 *
 * Porting notes:
 * - Currently covers the most common packet layouts and returns a structured packet instead of spawning effects directly.
 * - More specialized temp entities remain to be ported incrementally as `cl_tent.c` advances.
 */
export function CL_ParseTEnt(runtime: ClientRuntime, hooks: ClientParseHooks = {}): ClientTempEntityPacket {
  const type = MSG_ReadByte(runtime.net_message);
  const packet: ClientTempEntityPacket = { type };

  switch (type) {
    case temp_event_t.TE_BLOOD:
    case temp_event_t.TE_GUNSHOT:
    case temp_event_t.TE_SPARKS:
    case temp_event_t.TE_SHOTGUN:
    case temp_event_t.TE_SCREEN_SPARKS:
    case temp_event_t.TE_SHIELD_SPARKS:
    case temp_event_t.TE_BULLET_SPARKS:
    case temp_event_t.TE_GREENBLOOD:
    case temp_event_t.TE_HEATBEAM_SPARKS:
    case temp_event_t.TE_HEATBEAM_STEAM:
    case temp_event_t.TE_ELECTRIC_SPARKS: {
      packet.position = MSG_ReadPos(runtime.net_message);
      packet.directionByte = MSG_ReadByte(runtime.net_message);
      break;
    }
    case temp_event_t.TE_RAILTRAIL:
    case temp_event_t.TE_BLUEHYPERBLASTER:
    case temp_event_t.TE_EXPLOSION1_BIG: {
      packet.position = MSG_ReadPos(runtime.net_message);
      packet.position2 = MSG_ReadPos(runtime.net_message);
      break;
    }
    case temp_event_t.TE_GRENADE_EXPLOSION:
    case temp_event_t.TE_EXPLOSION1:
    case temp_event_t.TE_EXPLOSION2:
    case temp_event_t.TE_ROCKET_EXPLOSION:
    case temp_event_t.TE_ROCKET_EXPLOSION_WATER:
    case temp_event_t.TE_GRENADE_EXPLOSION_WATER:
    case temp_event_t.TE_BFG_EXPLOSION:
    case temp_event_t.TE_BFG_BIGEXPLOSION:
    case temp_event_t.TE_BOSSTPORT:
    case temp_event_t.TE_PLASMA_EXPLOSION:
    case temp_event_t.TE_PLAIN_EXPLOSION:
    case temp_event_t.TE_MOREBLOOD:
    case temp_event_t.TE_CHAINFIST_SMOKE:
    case temp_event_t.TE_TRACKER_EXPLOSION:
    case temp_event_t.TE_TELEPORT_EFFECT:
    case temp_event_t.TE_DBALL_GOAL:
    case temp_event_t.TE_WIDOWSPLASH:
    case temp_event_t.TE_EXPLOSION1_NP:
    case temp_event_t.TE_FLECHETTE: {
      packet.position = MSG_ReadPos(runtime.net_message);
      break;
    }
    case temp_event_t.TE_LASER_SPARKS:
    case temp_event_t.TE_SPLASH:
    case temp_event_t.TE_WELDING_SPARKS:
    case temp_event_t.TE_TUNNEL_SPARKS: {
      packet.count = MSG_ReadByte(runtime.net_message);
      packet.position = MSG_ReadPos(runtime.net_message);
      packet.directionByte = MSG_ReadByte(runtime.net_message);
      packet.color = MSG_ReadByte(runtime.net_message);
      break;
    }
    case temp_event_t.TE_BLASTER:
    case temp_event_t.TE_BLASTER2: {
      packet.position = MSG_ReadPos(runtime.net_message);
      packet.directionByte = MSG_ReadByte(runtime.net_message);
      break;
    }
    case temp_event_t.TE_PARASITE_ATTACK:
    case temp_event_t.TE_MEDIC_CABLE_ATTACK: {
      assignBeamPacket(packet, "beam", parseBeamPacket(runtime));
      break;
    }
    case temp_event_t.TE_FLASHLIGHT: {
      packet.position = MSG_ReadPos(runtime.net_message);
      packet.entity = MSG_ReadShort(runtime.net_message);
      break;
    }
    case temp_event_t.TE_BFG_LASER:
    case temp_event_t.TE_BUBBLETRAIL: {
      assignBeamPacket(packet, "laser", parseLaserPacket(runtime));
      break;
    }
    case temp_event_t.TE_GRAPPLE_CABLE: {
      assignBeamPacket(packet, "beam2", parseBeam2Packet(runtime));
      break;
    }
    case temp_event_t.TE_HEATBEAM:
    case temp_event_t.TE_MONSTER_HEATBEAM: {
      assignBeamPacket(packet, "player-beam", parsePlayerBeamPacket(runtime, type));
      break;
    }
    case temp_event_t.TE_STEAM: {
      assignBeamPacket(packet, "steam", parseSteamPacket(runtime));
      break;
    }
    case temp_event_t.TE_FLASHLIGHT: {
      packet.position = MSG_ReadPos(runtime.net_message);
      packet.entity = MSG_ReadShort(runtime.net_message);
      break;
    }
    case temp_event_t.TE_FORCEWALL:
    case temp_event_t.TE_DEBUGTRAIL:
    case temp_event_t.TE_BUBBLETRAIL2: {
      packet.position = MSG_ReadPos(runtime.net_message);
      packet.position2 = MSG_ReadPos(runtime.net_message);
      if (type === temp_event_t.TE_FORCEWALL) {
        packet.color = MSG_ReadByte(runtime.net_message);
      }
      break;
    }
    case temp_event_t.TE_LIGHTNING: {
      assignBeamPacket(packet, "lightning", parseLightningPacket(runtime));
      break;
    }
    case temp_event_t.TE_WIDOWBEAMOUT: {
      assignBeamPacket(packet, "widow", parseWidowPacket(runtime));
      break;
    }
    case temp_event_t.TE_NUKEBLAST: {
      assignBeamPacket(packet, "nuke", parseNukePacket(runtime));
      break;
    }
    default:
      throw new Error(`CL_ParseTEnt: unsupported type ${type}`);
  }

  CL_AddTEntPacket(runtime, packet);
  hooks.onTempEntity?.(packet);
  return packet;
}

/**
 * Category: New
 * Purpose: Parse the payload layout used by `CL_ParseBeam`.
 *
 * Constraints:
 * - Must consume the exact wire format used by parasite/medic/grapple-like beam temp entities.
 */
function parseBeamPacket(runtime: ClientRuntime): Partial<ClientTempEntityPacket> {
  return {
    entity: MSG_ReadShort(runtime.net_message),
    position: MSG_ReadPos(runtime.net_message),
    position2: MSG_ReadPos(runtime.net_message),
    offset: [0, 0, 0]
  };
}

/**
 * Category: New
 * Purpose: Parse the payload layout used by `CL_ParseBeam2`.
 *
 * Constraints:
 * - Must preserve the explicit beam offset supplied by the server message.
 */
function parseBeam2Packet(runtime: ClientRuntime): Partial<ClientTempEntityPacket> {
  return {
    entity: MSG_ReadShort(runtime.net_message),
    position: MSG_ReadPos(runtime.net_message),
    position2: MSG_ReadPos(runtime.net_message),
    offset: MSG_ReadPos(runtime.net_message)
  };
}

/**
 * Category: New
 * Purpose: Parse the player-linked beam payload used by heatbeam-style temp entities.
 *
 * Constraints:
 * - Must preserve the special optimized offset rules from `CL_ParsePlayerBeam`.
 */
function parsePlayerBeamPacket(runtime: ClientRuntime, type: number): Partial<ClientTempEntityPacket> {
  const entity = MSG_ReadShort(runtime.net_message);
  const position = MSG_ReadPos(runtime.net_message);
  const position2 = MSG_ReadPos(runtime.net_message);

  let offset: [number, number, number];
  if (type === 37) {
    offset = [2, 7, -3];
  } else {
    offset = [0, 0, 0];
  }

  return {
    entity,
    position,
    position2,
    offset,
    durationMs: type === 37 ? 100 : 200
  };
}

/**
 * Category: New
 * Purpose: Parse the dual-entity lightning beam payload.
 *
 * Constraints:
 * - Must preserve both source and destination entity numbers.
 */
function parseLightningPacket(runtime: ClientRuntime): Partial<ClientTempEntityPacket> {
  return {
    entity: MSG_ReadShort(runtime.net_message),
    entity2: MSG_ReadShort(runtime.net_message),
    position: MSG_ReadPos(runtime.net_message),
    position2: MSG_ReadPos(runtime.net_message),
    offset: [0, 0, 0]
  };
}

/**
 * Category: New
 * Purpose: Parse the laser temp entity payload consumed by `CL_ParseLaser`.
 *
 * Constraints:
 * - Must preserve the start and end positions only.
 */
function parseLaserPacket(runtime: ClientRuntime): Partial<ClientTempEntityPacket> {
  return {
    position: MSG_ReadPos(runtime.net_message),
    position2: MSG_ReadPos(runtime.net_message)
  };
}

/**
 * Category: New
 * Purpose: Parse the rogue `CL_ParseSteam` payload in both instant and sustain forms.
 *
 * Constraints:
 * - Must consume the exact bytes for both id `-1` instant effects and sustained effects.
 */
function parseSteamPacket(runtime: ClientRuntime): Partial<ClientTempEntityPacket> {
  const id = MSG_ReadShort(runtime.net_message);
  if (id === -1) {
    return {
      id,
      count: MSG_ReadByte(runtime.net_message),
      position: MSG_ReadPos(runtime.net_message),
      directionByte: MSG_ReadByte(runtime.net_message),
      color: MSG_ReadByte(runtime.net_message) & 0xff,
      magnitude: MSG_ReadShort(runtime.net_message)
    };
  }

  return {
    id,
    count: MSG_ReadByte(runtime.net_message),
    position: MSG_ReadPos(runtime.net_message),
    directionByte: MSG_ReadByte(runtime.net_message),
    color: MSG_ReadByte(runtime.net_message) & 0xff,
    magnitude: MSG_ReadShort(runtime.net_message),
    durationMs: MSG_ReadLong(runtime.net_message)
  };
}

/**
 * Category: New
 * Purpose: Parse the widow sustain-effect payload.
 *
 * Constraints:
 * - Must preserve the sustain id and origin.
 */
function parseWidowPacket(runtime: ClientRuntime): Partial<ClientTempEntityPacket> {
  return {
    id: MSG_ReadShort(runtime.net_message),
    position: MSG_ReadPos(runtime.net_message),
    durationMs: 2100
  };
}

/**
 * Category: New
 * Purpose: Parse the nuke sustain-effect payload.
 *
 * Constraints:
 * - Must preserve the origin and implied sustain duration.
 */
function parseNukePacket(runtime: ClientRuntime): Partial<ClientTempEntityPacket> {
  return {
    id: 21000,
    position: MSG_ReadPos(runtime.net_message),
    durationMs: 1000
  };
}

/**
 * Category: New
 * Purpose: Merge a specialized temp-entity payload into the currently allocated packet object.
 *
 * Constraints:
 * - Must preserve the original outer `type` field while copying parsed fields by value.
 */
function assignBeamPacket(
  target: ClientTempEntityPacket,
  beamKind: NonNullable<ClientTempEntityPacket["beamKind"]>,
  source: Partial<ClientTempEntityPacket>
): void {
  target.beamKind = beamKind;
  if (source.count !== undefined) {
    target.count = source.count;
  }
  if (source.color !== undefined) {
    target.color = source.color;
  }
  if (source.entity !== undefined) {
    target.entity = source.entity;
  }
  if (source.entity2 !== undefined) {
    target.entity2 = source.entity2;
  }
  if (source.id !== undefined) {
    target.id = source.id;
  }
  if (source.magnitude !== undefined) {
    target.magnitude = source.magnitude;
  }
  if (source.position !== undefined) {
    target.position = source.position;
  }
  if (source.position2 !== undefined) {
    target.position2 = source.position2;
  }
  if (source.offset !== undefined) {
    target.offset = source.offset;
  }
  if (source.directionByte !== undefined) {
    target.directionByte = source.directionByte;
  }
  if (source.durationMs !== undefined) {
    target.durationMs = source.durationMs;
  }
}

/**
 * Original name: CL_LoadClientinfo
 * Source: client/cl_parse.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Parses one Quake II player skin/model descriptor into derived clientinfo filenames.
 *
 * Porting notes:
 * - Computes filenames and validity state without registering renderer resources yet.
 */
export function CL_LoadClientinfo(runtime: ClientRuntime, clientinfo: ClientRuntime["cl"]["clientinfo"][number], info: string): void {
  clientinfo.cinfo = info.slice(0, 63);
  clientinfo.name = info;
  clientinfo.model_name = "";
  clientinfo.skin_name = "";
  clientinfo.model_filename = "";
  clientinfo.skin_filename = "";
  clientinfo.iconname = "";
  clientinfo.weaponmodel.fill(null);
  clientinfo.weaponmodel_paths.fill("");
  clientinfo.valid = false;

  const separatorIndex = info.indexOf("\\");
  if (separatorIndex >= 0) {
    clientinfo.name = info.slice(0, separatorIndex);
    info = info.slice(separatorIndex + 1);
  } else {
    clientinfo.name = info;
    info = "";
  }

  if (info.length === 0) {
    clientinfo.model_name = "male";
    clientinfo.skin_name = "grunt";
    clientinfo.model_filename = "players/male/tris.md2";
    clientinfo.skin_filename = "players/male/grunt.pcx";
    clientinfo.iconname = "/players/male/grunt_i.pcx";
    clientinfo.weaponmodel_paths[0] = "players/male/weapon.md2";
    clientinfo.valid = true;
    return;
  }

  let model_name = info;
  const slashIndex = Math.max(model_name.indexOf("/"), model_name.indexOf("\\"));
  if (slashIndex >= 0) {
    model_name = model_name.slice(0, slashIndex);
  }

  let skin_name = info.slice(model_name.length + 1);
  if (skin_name.length === 0) {
    skin_name = "grunt";
  }

  clientinfo.model_name = model_name;
  clientinfo.skin_name = skin_name;
  clientinfo.model_filename = `players/${model_name}/tris.md2`;
  clientinfo.skin_filename = `players/${model_name}/${skin_name}.pcx`;
  clientinfo.iconname = `/players/${model_name}/${skin_name}_i.pcx`;

  for (let index = 0; index < runtime.cl.num_cl_weaponmodels; index += 1) {
    clientinfo.weaponmodel_paths[index] = `players/${model_name}/${runtime.cl.cl_weaponmodels[index]}`;
  }

  clientinfo.valid = true;
}

/**
 * Original name: CL_ParseClientinfo
 * Source: client/cl_parse.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Loads derived clientinfo state for one player from the corresponding playerskin configstring.
 *
 * Porting notes:
 * - Defers renderer registration to later phases.
 */
export function CL_ParseClientinfo(runtime: ClientRuntime, player: number, hooks: ClientParseHooks = {}): void {
  if (player < 0 || player >= MAX_CLIENTS) {
    return;
  }

  const info = runtime.cl.configstrings[player + CS_PLAYERSKINS] ?? "";
  const clientinfo = runtime.cl.clientinfo[player];
  CL_LoadClientinfo(runtime, clientinfo, info);
  hooks.onClientinfo?.(player, clientinfo);
}

/**
 * Original name: CL_ParseLayout
 * Source: client/client.h and client/cl_parse.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Reads and stores the current layout string.
 *
 * Porting notes:
 * - Reuses the shared hook used by direct `svc_layout` parsing.
 */
export function CL_ParseLayout(runtime: ClientRuntime, hooks: ClientParseHooks = {}): string {
  const layout = MSG_ReadString(runtime.net_message);
  runtime.cl.layout = layout;
  hooks.onLayout?.(layout);
  return layout;
}

/**
 * Original name: CL_ParseInventory
 * Source: client/cl_inv.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Reads the current inventory item counts from the message stream.
 *
 * Porting notes:
 * - Updates the fixed inventory array in place.
 */
export function CL_ParseInventory(runtime: ClientRuntime): number[] {
  for (let index = 0; index < MAX_ITEMS; index += 1) {
    runtime.cl.inventory[index] = MSG_ReadShort(runtime.net_message);
  }

  return runtime.cl.inventory;
}

/**
 * Original name: CL_ParseConfigString
 * Source: client/cl_parse.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Updates one configstring slot from the network message.
 *
 * Porting notes:
 * - Defers refresh and sound side effects to hooks for now.
 */
export function CL_ParseConfigString(runtime: ClientRuntime, hooks: ClientParseHooks = {}): void {
  const index = MSG_ReadShort(runtime.net_message);
  if (index < 0 || index >= MAX_CONFIGSTRINGS) {
    throw new Error("CL_ParseConfigString: configstring > MAX_CONFIGSTRINGS");
  }

  const value = MSG_ReadString(runtime.net_message);
  runtime.cl.configstrings[index] = value;
  if (index >= CS_PLAYERSKINS && index < CS_PLAYERSKINS + MAX_CLIENTS) {
    CL_ParseClientinfo(runtime, index - CS_PLAYERSKINS, hooks);
  }
  hooks.onConfigString?.(index, value);
}

/**
 * Original name: CL_ParseServerData
 * Source: client/cl_parse.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Parses the initial serverdata message and resets level-scoped client state.
 *
 * Porting notes:
 * - Throws on protocol mismatch instead of routing through `Com_Error`.
 */
export function CL_ParseServerData(runtime: ClientRuntime, hooks: ClientParseHooks = {}): void {
  CL_ClearState(runtime);
  runtime.cls.state = connstate_t.ca_connected;

  const protocol = MSG_ReadLong(runtime.net_message);
  runtime.cls.serverProtocol = protocol;
  if (protocol !== PROTOCOL_VERSION) {
    throw new Error(`Server returned version ${protocol}, not ${PROTOCOL_VERSION}`);
  }

  runtime.cl.servercount = MSG_ReadLong(runtime.net_message);
  runtime.cl.attractloop = MSG_ReadByte(runtime.net_message) !== 0;

  const gamedir = MSG_ReadString(runtime.net_message);
  runtime.cl.gamedir = gamedir;

  runtime.cl.playernum = MSG_ReadShort(runtime.net_message);
  const levelName = MSG_ReadString(runtime.net_message);
  hooks.onServerData?.(levelName);
}

/**
 * Original name: CL_ParseFrame
 * Source: client/cl_ents.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Parses one frame message including areabits, player state and packet entities.
 *
 * Porting notes:
 * - Preserves validity checks and frame ring-buffer storage.
 */
export function CL_ParseFrame(runtime: ClientRuntime, hooks: ClientParseHooks = {}): void {
  runtime.cl.frame = createFrame();

  runtime.cl.frame.serverframe = MSG_ReadLong(runtime.net_message);
  runtime.cl.frame.deltaframe = MSG_ReadLong(runtime.net_message);
  runtime.cl.frame.servertime = runtime.cl.frame.serverframe * 100;

  if (runtime.cls.serverProtocol !== 26) {
    runtime.cl.surpressCount = MSG_ReadByte(runtime.net_message);
  }

  let old: frame_t | null = null;
  if (runtime.cl.frame.deltaframe <= 0) {
    runtime.cl.frame.valid = true;
    runtime.cls.demowaiting = false;
  } else {
    old = runtime.cl.frames[runtime.cl.frame.deltaframe & UPDATE_MASK];
    if (
      old.valid &&
      old.serverframe === runtime.cl.frame.deltaframe &&
      runtime.cl.parse_entities - old.parse_entities <= MAX_PARSE_ENTITIES - 128
    ) {
      runtime.cl.frame.valid = true;
    }
  }

  if (runtime.cl.time > runtime.cl.frame.servertime) {
    runtime.cl.time = runtime.cl.frame.servertime;
  } else if (runtime.cl.time < runtime.cl.frame.servertime - 100) {
    runtime.cl.time = runtime.cl.frame.servertime - 100;
  }

  const areaBitLength = MSG_ReadByte(runtime.net_message);
  runtime.cl.frame.areabits.fill(0);
  runtime.cl.frame.areabits.set(MSG_ReadData(runtime.net_message, areaBitLength));

  const playerInfoCommand = MSG_ReadByte(runtime.net_message);
  if (playerInfoCommand !== svc_ops_e.svc_playerinfo) {
    throw new Error("CL_ParseFrame: not playerinfo");
  }
  CL_ParsePlayerstate(runtime, old, runtime.cl.frame);

  const packetEntitiesCommand = MSG_ReadByte(runtime.net_message);
  if (packetEntitiesCommand !== svc_ops_e.svc_packetentities) {
    throw new Error("CL_ParseFrame: not packetentities");
  }
  CL_ParsePacketEntities(runtime, old, runtime.cl.frame);

  runtime.cl.frames[runtime.cl.frame.serverframe & UPDATE_MASK] = cloneFrame(runtime.cl.frame);

  if (runtime.cl.frame.valid) {
    if (runtime.cls.state !== connstate_t.ca_active) {
      runtime.cls.state = connstate_t.ca_active;
      runtime.cl.force_refdef = true;
      runtime.cl.predicted_origin[0] = runtime.cl.frame.playerstate.pmove.origin[0] * 0.125;
      runtime.cl.predicted_origin[1] = runtime.cl.frame.playerstate.pmove.origin[1] * 0.125;
      runtime.cl.predicted_origin[2] = runtime.cl.frame.playerstate.pmove.origin[2] * 0.125;
      runtime.cl.predicted_angles = [...runtime.cl.frame.playerstate.viewangles];
    }

    runtime.cl.sound_prepped = true;
    CL_FireEntityEvents(runtime, runtime.cl.frame, hooks.onEntityEvent);
    CL_CheckPredictionError(runtime, {
      incomingAcknowledged: runtime.cl.frame.serverframe,
      predictMovement: true
    });
  }

  hooks.onFrameParsed?.(cloneFrame(runtime.cl.frame));
}

/**
 * Original name: CL_ParseServerMessage
 * Source: client/cl_parse.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Parses one full incoming server message stream command by command.
 *
 * Porting notes:
 * - Leaves unsupported command bodies to hooks so parsing can advance incrementally.
 */
export function CL_ParseServerMessage(runtime: ClientRuntime, hooks: ClientParseHooks = {}): void {
  while (true) {
    if (runtime.net_message.readcount > runtime.net_message.cursize) {
      throw new Error("CL_ParseServerMessage: Bad server message");
    }

    const command = MSG_ReadByte(runtime.net_message);
    if (command === -1) {
      break;
    }

    switch (command) {
      case svc_ops_e.svc_nop:
        break;
      case svc_ops_e.svc_disconnect:
        hooks.onDisconnect?.("Server disconnected");
        throw new Error("Server disconnected");
      case svc_ops_e.svc_reconnect:
        runtime.cls.state = connstate_t.ca_connecting;
        runtime.cls.connect_time = -99999;
        hooks.onReconnect?.();
        break;
      case svc_ops_e.svc_print: {
        const level = MSG_ReadByte(runtime.net_message);
        const text = MSG_ReadString(runtime.net_message);
        if (level === PRINT_CHAT) {
          emitPrint(runtime, text, hooks);
        } else {
          emitPrint(runtime, text, hooks);
        }
        break;
      }
      case svc_ops_e.svc_centerprint:
        hooks.onCenterPrint?.(MSG_ReadString(runtime.net_message));
        break;
      case svc_ops_e.svc_stufftext: {
        const text = MSG_ReadString(runtime.net_message);
        hooks.onStufftext?.(text);
        break;
      }
      case svc_ops_e.svc_serverdata:
        CL_ParseServerData(runtime, hooks);
        break;
      case svc_ops_e.svc_configstring:
        CL_ParseConfigString(runtime, hooks);
        break;
      case svc_ops_e.svc_sound:
        CL_ParseStartSoundPacket(runtime, hooks);
        break;
      case svc_ops_e.svc_muzzleflash:
        CL_ParseMuzzleFlash(runtime, hooks);
        break;
      case svc_ops_e.svc_muzzleflash2:
        CL_ParseMuzzleFlash2(runtime, hooks);
        break;
      case svc_ops_e.svc_temp_entity:
        CL_ParseTEnt(runtime, hooks);
        break;
      case svc_ops_e.svc_spawnbaseline:
        CL_ParseBaseline(runtime);
        break;
      case svc_ops_e.svc_download:
        CL_ParseDownload(runtime, hooks);
        break;
      case svc_ops_e.svc_frame:
        CL_ParseFrame(runtime, hooks);
        break;
      case svc_ops_e.svc_layout: {
        CL_ParseLayout(runtime, hooks);
        break;
      }
      case svc_ops_e.svc_inventory:
        CL_ParseInventory(runtime);
        break;
      case svc_ops_e.svc_playerinfo:
      case svc_ops_e.svc_packetentities:
      case svc_ops_e.svc_deltapacketentities:
        throw new Error("Out of place frame data");
      default:
        hooks.onUnsupportedCommand?.(command);
        throw new Error(`CL_ParseServerMessage: unsupported command ${svc_strings[command] ?? command}`);
    }
  }
}

/**
 * Category: New
 * Purpose: Write one string command into the client message buffer using the original `clc_stringcmd` envelope.
 *
 * Constraints:
 * - Must preserve command serialization order and null-terminated string encoding.
 */
export function CL_WriteStringCmd(runtime: ClientRuntime, text: string): void {
  MSG_WriteByte(runtime.net_message, clc_ops_e.clc_stringcmd);
  MSG_WriteString(runtime.net_message, text);
}

/**
 * Original name: CL_DeltaEntity
 * Source: client/cl_ents.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Parses one entity delta and appends it into the current frame parse ring.
 *
 * Porting notes:
 * - Preserves the original no-lerp conditions and entity ring behavior.
 */
function CL_DeltaEntity(runtime: ClientRuntime, frame: frame_t, newnum: number, oldState: ReturnType<typeof createEntityState>, bits: number): void {
  const entity = runtime.cl_entities[newnum];
  const state = runtime.cl_parse_entities[runtime.cl.parse_entities & (MAX_PARSE_ENTITIES - 1)];
  runtime.cl.parse_entities += 1;
  frame.num_entities += 1;

  CL_ParseDelta(runtime, oldState, state, newnum, bits);

  if (
    state.modelindex !== entity.current.modelindex ||
    state.modelindex2 !== entity.current.modelindex2 ||
    state.modelindex3 !== entity.current.modelindex3 ||
    state.modelindex4 !== entity.current.modelindex4 ||
    Math.abs(state.origin[0] - entity.current.origin[0]) > 512 ||
    Math.abs(state.origin[1] - entity.current.origin[1]) > 512 ||
    Math.abs(state.origin[2] - entity.current.origin[2]) > 512 ||
    state.event === entity_event_t.EV_PLAYER_TELEPORT ||
    state.event === entity_event_t.EV_OTHER_TELEPORT
  ) {
    entity.serverframe = -99;
  }

  if (entity.serverframe !== runtime.cl.frame.serverframe - 1) {
    entity.trailcount = 1024;
    copyEntityState(state, entity.prev);
    if (state.event === entity_event_t.EV_OTHER_TELEPORT) {
      entity.prev.origin = [...state.origin];
      entity.lerp_origin = [...state.origin];
    } else {
      entity.prev.origin = [...state.old_origin];
      entity.lerp_origin = [...state.old_origin];
    }
  } else {
    copyEntityState(entity.current, entity.prev);
  }

  entity.serverframe = runtime.cl.frame.serverframe;
  copyEntityState(state, entity.current);
}

/**
 * Original name: CL_ParsePacketEntities
 * Source: client/cl_ents.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Parses the packet entity stream for one frame.
 *
 * Porting notes:
 * - Preserves the original merge of old frame entities, removals and baselines.
 */
function CL_ParsePacketEntities(runtime: ClientRuntime, oldframe: frame_t | null, newframe: frame_t): void {
  newframe.parse_entities = runtime.cl.parse_entities;
  newframe.num_entities = 0;

  let oldindex = 0;
  let oldnum = 99999;
  let oldstate: ReturnType<typeof createEntityState> | null = null;

  if (oldframe && oldframe.num_entities > 0) {
    oldstate = runtime.cl_parse_entities[(oldframe.parse_entities + oldindex) & (MAX_PARSE_ENTITIES - 1)];
    oldnum = oldstate.number;
  }

  while (true) {
    const { bits, number: newnum } = CL_ParseEntityBits(runtime);
    if (newnum >= MAX_EDICTS) {
      throw new Error(`CL_ParsePacketEntities: bad number:${newnum}`);
    }
    if (runtime.net_message.readcount > runtime.net_message.cursize) {
      throw new Error("CL_ParsePacketEntities: end of message");
    }
    if (newnum === 0) {
      break;
    }

    while (oldnum < newnum && oldframe && oldstate) {
      CL_DeltaEntity(runtime, newframe, oldnum, oldstate, 0);
      oldindex += 1;
      if (oldindex >= oldframe.num_entities) {
        oldnum = 99999;
        oldstate = null;
      } else {
        oldstate = runtime.cl_parse_entities[(oldframe.parse_entities + oldindex) & (MAX_PARSE_ENTITIES - 1)];
        oldnum = oldstate.number;
      }
    }

    if ((bits & U_REMOVE) !== 0) {
      oldindex += 1;
      if (!oldframe || oldindex >= oldframe.num_entities) {
        oldnum = 99999;
        oldstate = null;
      } else {
        oldstate = runtime.cl_parse_entities[(oldframe.parse_entities + oldindex) & (MAX_PARSE_ENTITIES - 1)];
        oldnum = oldstate.number;
      }
      continue;
    }

    if (oldnum === newnum && oldstate) {
      CL_DeltaEntity(runtime, newframe, newnum, oldstate, bits);
      oldindex += 1;
      if (!oldframe || oldindex >= oldframe.num_entities) {
        oldnum = 99999;
        oldstate = null;
      } else {
        oldstate = runtime.cl_parse_entities[(oldframe.parse_entities + oldindex) & (MAX_PARSE_ENTITIES - 1)];
        oldnum = oldstate.number;
      }
      continue;
    }

    if (oldnum > newnum) {
      CL_DeltaEntity(runtime, newframe, newnum, runtime.cl_entities[newnum].baseline, bits);
      continue;
    }
  }

  while (oldnum !== 99999 && oldstate) {
    CL_DeltaEntity(runtime, newframe, oldnum, oldstate, 0);
    oldindex += 1;
    if (!oldframe || oldindex >= oldframe.num_entities) {
      oldnum = 99999;
      oldstate = null;
    } else {
      oldstate = runtime.cl_parse_entities[(oldframe.parse_entities + oldindex) & (MAX_PARSE_ENTITIES - 1)];
      oldnum = oldstate.number;
    }
  }
}

/**
 * Category: New
 * Purpose: Emit parser output to both runtime capture and optional hooks.
 *
 * Constraints:
 * - Must keep print order stable for future golden tests.
 */
function emitPrint(runtime: ClientRuntime, text: string, hooks: ClientParseHooks): void {
  runtime.output.push(text);
  hooks.onPrint?.(text);
}

/**
 * Category: New
 * Purpose: Produce the fields reset by `CL_ClearState` while preserving the outer runtime object.
 *
 * Constraints:
 * - Must rebuild frame rings and parse counters to clean startup values.
 */
function createFrameClearedClientState(runtime: ClientRuntime): Omit<ClientRuntime["cl"], "clientinfo" | "baseclientinfo" | "model_draw" | "model_clip" | "sound_precache" | "image_precache" | "configstrings" | "inventory"> & {
  inventory: number[];
  configstrings: string[];
  model_draw: unknown[];
  model_clip: unknown[];
  sound_precache: unknown[];
  image_precache: unknown[];
  clientinfo: ClientRuntime["cl"]["clientinfo"];
  baseclientinfo: ClientRuntime["cl"]["baseclientinfo"];
} {
  return {
    timeoutcount: 0,
    timedemo_frames: 0,
    timedemo_start: 0,
    refresh_prepped: false,
    sound_prepped: false,
    force_refdef: false,
    parse_entities: 0,
    cmd: runtime.cl.cmd,
    cmds: runtime.cl.cmds,
    cmd_time: runtime.cl.cmd_time,
    predicted_origins: runtime.cl.predicted_origins,
    predicted_pmove: runtime.cl.predicted_pmove,
    predicted_step: 0,
    predicted_step_time: 0,
    predicted_origin: [0, 0, 0],
    predicted_angles: [0, 0, 0],
    prediction_error: [0, 0, 0],
    frame: createFrame(),
    surpressCount: 0,
    frames: Array.from({ length: runtime.cl.frames.length }, () => createFrame()),
    viewangles: [0, 0, 0],
    time: 0,
    lerpfrac: 0,
    layout: "",
    inventory: new Array<number>(MAX_ITEMS).fill(0),
    attractloop: false,
    servercount: 0,
    gamedir: BASEDIRNAME,
    playernum: 0,
    configstrings: new Array<string>(MAX_CONFIGSTRINGS).fill(""),
    model_draw: new Array<unknown>(runtime.cl.model_draw.length).fill(null),
    model_clip: new Array<unknown>(runtime.cl.model_clip.length).fill(null),
    sound_precache: new Array<unknown>(runtime.cl.sound_precache.length).fill(null),
    image_precache: new Array<unknown>(runtime.cl.image_precache.length).fill(null),
    cl_weaponmodels: [...runtime.cl.cl_weaponmodels],
    num_cl_weaponmodels: runtime.cl.num_cl_weaponmodels,
    clientinfo: runtime.cl.clientinfo,
    baseclientinfo: runtime.cl.baseclientinfo,
    tents: runtime.cl.tents
  };
}

/**
 * Category: New
 * Purpose: Copy one entity state into another while preserving tuple fields by value.
 *
 * Constraints:
 * - Must avoid sharing mutable vector arrays between states.
 */
function copyEntityState(source: ReturnType<typeof createEntityState>, target: ReturnType<typeof createEntityState>): void {
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
}

/**
 * Category: New
 * Purpose: Copy one player state into another while preserving nested arrays by value.
 *
 * Constraints:
 * - Must avoid sharing mutable arrays across frames.
 */
function copyPlayerState(source: frame_t["playerstate"], target: frame_t["playerstate"]): void {
  target.pmove.pm_type = source.pmove.pm_type;
  target.pmove.origin = [...source.pmove.origin];
  target.pmove.velocity = [...source.pmove.velocity];
  target.pmove.pm_flags = source.pmove.pm_flags;
  target.pmove.pm_time = source.pmove.pm_time;
  target.pmove.gravity = source.pmove.gravity;
  target.pmove.delta_angles = [...source.pmove.delta_angles];
  target.viewangles = [...source.viewangles];
  target.viewoffset = [...source.viewoffset];
  target.kick_angles = [...source.kick_angles];
  target.gunangles = [...source.gunangles];
  target.gunoffset = [...source.gunoffset];
  target.gunindex = source.gunindex;
  target.gunframe = source.gunframe;
  target.blend = [...source.blend];
  target.fov = source.fov;
  target.rdflags = source.rdflags;
  target.stats = [...source.stats];
}

/**
 * Category: New
 * Purpose: Clone one parsed frame so frame ring-buffer storage keeps value semantics.
 *
 * Constraints:
 * - Must deep-copy mutable arrays and nested player state.
 */
function cloneFrame(frame: frame_t): frame_t {
  const clone = createFrame();
  clone.valid = frame.valid;
  clone.serverframe = frame.serverframe;
  clone.servertime = frame.servertime;
  clone.deltaframe = frame.deltaframe;
  clone.areabits = new Uint8Array(frame.areabits);
  copyPlayerState(frame.playerstate, clone.playerstate);
  clone.num_entities = frame.num_entities;
  clone.parse_entities = frame.parse_entities;
  return clone;
}
