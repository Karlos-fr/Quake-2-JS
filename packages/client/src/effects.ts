/**
 * File: effects.ts
 * Source: Quake II original / client/cl_fx.c and client/cl_tent.c
 * Purpose: Normalize parsed client action packets into renderer/audio-friendly effect events.
 *
 * Porting policy:
 * - Preserve original behavior first.
 * - Preserve original names whenever possible.
 * - Avoid structural refactors unless documented.
 *
 * Deviations:
 * - Emits structured effect descriptions instead of spawning lights, particles or sounds directly.
 * - Groups several original visual/audio side effects under one normalized action event.
 *
 * Notes:
 * - This file is intended to stay conceptually close to the original client effect pipeline.
 */

import {
  ATTN_NONE,
  ATTN_NORM,
  CHAN_AUTO,
  CHAN_WEAPON,
  temp_event_t,
  type vec3_t
} from "../../qcommon/src/index.js";
import type {
  ClientMuzzleFlash2Packet,
  ClientMuzzleFlashPacket,
  ClientTempEntityPacket
} from "./parse.js";

const MZ_SILENCED = 128;

/**
 * Category: New
 * Purpose: Describe one normalized client action effect event ready for renderer/audio adapters.
 *
 * Constraints:
 * - Must preserve the originating packet family and enough metadata to reproduce later side effects.
 */
export interface ClientActionEffect {
  category: "muzzleflash" | "muzzleflash2" | "temp-entity";
  kind: string;
  entity?: number;
  entity2?: number;
  sound?: {
    name: string;
    channel: number;
    attenuation: number;
  };
  light?: {
    radius: number;
    color: [number, number, number];
    durationMs: number;
  };
  position?: vec3_t;
  position2?: vec3_t;
  offset?: vec3_t;
  color?: number;
  count?: number;
  magnitude?: number;
  durationMs?: number;
  packet: ClientMuzzleFlashPacket | ClientMuzzleFlash2Packet | ClientTempEntityPacket;
}

/**
 * Category: New
 * Purpose: Convert one parsed player muzzle flash packet into normalized effect events.
 *
 * Constraints:
 * - Must preserve silenced state and weapon family.
 */
export function CL_BuildMuzzleFlashEffects(packet: ClientMuzzleFlashPacket): ClientActionEffect[] {
  const weaponId = packet.weapon & ~MZ_SILENCED;
  const definition = getMuzzleFlashDefinition(weaponId);

  return [
    {
      category: "muzzleflash",
      kind: definition.kind,
      entity: packet.entity,
      sound: definition.sound,
      light: {
        radius: packet.silenced ? 100 : definition.light.radius,
        color: definition.light.color,
        durationMs: definition.light.durationMs
      },
      packet
    }
  ];
}

/**
 * Category: New
 * Purpose: Convert one parsed monster muzzle flash packet into normalized effect events.
 *
 * Constraints:
 * - Must preserve the source entity and flash id for later lookup specializations.
 */
export function CL_BuildMuzzleFlash2Effects(packet: ClientMuzzleFlash2Packet): ClientActionEffect[] {
  return [
    {
      category: "muzzleflash2",
      kind: getMuzzleFlash2Kind(packet.flashNumber),
      entity: packet.entity,
      light: {
        radius: 200,
        color: [1, 0.8, 0.2],
        durationMs: 100
      },
      packet
    }
  ];
}

/**
 * Category: New
 * Purpose: Convert one parsed temporary entity packet into normalized effect events.
 *
 * Constraints:
 * - Must preserve packet-specific geometry and effect classification.
 */
export function CL_BuildTempEntityEffects(packet: ClientTempEntityPacket): ClientActionEffect[] {
  const effect: ClientActionEffect = {
    category: "temp-entity",
    kind: getTempEntityKind(packet),
    packet
  };

  if (packet.entity !== undefined) {
    effect.entity = packet.entity;
  }
  if (packet.entity2 !== undefined) {
    effect.entity2 = packet.entity2;
  }
  if (packet.position !== undefined) {
    effect.position = packet.position;
  }
  if (packet.position2 !== undefined) {
    effect.position2 = packet.position2;
  }
  if (packet.offset !== undefined) {
    effect.offset = packet.offset;
  }
  if (packet.color !== undefined) {
    effect.color = packet.color;
  }
  if (packet.count !== undefined) {
    effect.count = packet.count;
  }
  if (packet.magnitude !== undefined) {
    effect.magnitude = packet.magnitude;
  }
  if (packet.durationMs !== undefined) {
    effect.durationMs = packet.durationMs;
  }

  switch (packet.type) {
    case temp_event_t.TE_BLASTER:
    case temp_event_t.TE_BLASTER2:
    case temp_event_t.TE_BLUEHYPERBLASTER:
    case temp_event_t.TE_FLECHETTE:
      effect.sound = {
        name: "weapons/lashit.wav",
        channel: CHAN_AUTO,
        attenuation: ATTN_NORM
      };
      effect.light = {
        radius: 150,
        color: packet.type === temp_event_t.TE_BLASTER2 ? [0.2, 1, 0.2] : [1, 1, 0.2],
        durationMs: 100
      };
      break;
    case temp_event_t.TE_RAILTRAIL:
      effect.sound = {
        name: "weapons/railgf1a.wav",
        channel: CHAN_AUTO,
        attenuation: ATTN_NORM
      };
      break;
    case temp_event_t.TE_EXPLOSION1:
    case temp_event_t.TE_EXPLOSION1_BIG:
    case temp_event_t.TE_EXPLOSION1_NP:
    case temp_event_t.TE_ROCKET_EXPLOSION:
    case temp_event_t.TE_ROCKET_EXPLOSION_WATER:
    case temp_event_t.TE_GRENADE_EXPLOSION:
    case temp_event_t.TE_GRENADE_EXPLOSION_WATER:
    case temp_event_t.TE_EXPLOSION2:
    case temp_event_t.TE_PLAIN_EXPLOSION:
    case temp_event_t.TE_PLASMA_EXPLOSION:
      effect.sound = {
        name:
          packet.type === temp_event_t.TE_GRENADE_EXPLOSION_WATER || packet.type === temp_event_t.TE_ROCKET_EXPLOSION_WATER
            ? "weapons/xpld_wat.wav"
            : packet.type === temp_event_t.TE_GRENADE_EXPLOSION || packet.type === temp_event_t.TE_EXPLOSION2
              ? "weapons/grenlx1a.wav"
              : "weapons/rocklx1a.wav",
        channel: CHAN_AUTO,
        attenuation: ATTN_NORM
      };
      effect.light = {
        radius: 350,
        color: [1, 0.5, 0.5],
        durationMs: 100
      };
      break;
    case temp_event_t.TE_BFG_EXPLOSION:
    case temp_event_t.TE_BFG_BIGEXPLOSION:
      effect.light = {
        radius: 350,
        color: [0, 1, 0],
        durationMs: 100
      };
      break;
    case temp_event_t.TE_LIGHTNING:
      effect.sound = {
        name: "weapons/tesla.wav",
        channel: CHAN_WEAPON,
        attenuation: ATTN_NORM
      };
      break;
    case temp_event_t.TE_BOSSTPORT:
      effect.sound = {
        name: "misc/bigtele.wav",
        channel: CHAN_AUTO,
        attenuation: ATTN_NONE
      };
      break;
    case temp_event_t.TE_SCREEN_SPARKS:
    case temp_event_t.TE_SHIELD_SPARKS:
    case temp_event_t.TE_HEATBEAM_SPARKS:
    case temp_event_t.TE_HEATBEAM_STEAM:
    case temp_event_t.TE_ELECTRIC_SPARKS:
      effect.sound = {
        name: "weapons/lashit.wav",
        channel: CHAN_AUTO,
        attenuation: ATTN_NORM
      };
      break;
    case temp_event_t.TE_TRACKER_EXPLOSION:
      effect.sound = {
        name: "weapons/disrupthit.wav",
        channel: CHAN_AUTO,
        attenuation: ATTN_NORM
      };
      effect.light = {
        radius: 150,
        color: [-1, -1, -1],
        durationMs: 100
      };
      break;
    default:
      break;
  }

  return [effect];
}

/**
 * Category: New
 * Purpose: Convert any parsed client action packet into normalized effect events.
 *
 * Constraints:
 * - Must dispatch by packet shape without mutating the source packet.
 */
export function CL_BuildActionEffects(
  packet: ClientMuzzleFlashPacket | ClientMuzzleFlash2Packet | ClientTempEntityPacket
): ClientActionEffect[] {
  if ("weapon" in packet) {
    return CL_BuildMuzzleFlashEffects(packet);
  }
  if ("flashNumber" in packet) {
    return CL_BuildMuzzleFlash2Effects(packet);
  }
  return CL_BuildTempEntityEffects(packet);
}

/**
 * Category: New
 * Purpose: Map one player muzzle flash weapon id to a first normalized definition.
 */
function getMuzzleFlashDefinition(weaponId: number): {
  kind: string;
  sound: { name: string; channel: number; attenuation: number };
  light: { radius: number; color: [number, number, number]; durationMs: number };
} {
  switch (weaponId) {
    case 0:
      return createMuzzleDefinition("blaster", "weapons/blastf1a.wav", [1, 1, 0], 200);
    case 2:
      return createMuzzleDefinition("hyperblaster", "weapons/hyprbf1a.wav", [1, 1, 0], 200);
    case 3:
      return createMuzzleDefinition("machinegun", "weapons/machgf1b.wav", [1, 1, 0], 200);
    case 4:
      return createMuzzleDefinition("shotgun", "weapons/shotgf1b.wav", [1, 1, 0], 200);
    case 5:
      return createMuzzleDefinition("supershotgun", "weapons/sshotf1b.wav", [1, 1, 0], 200);
    case 8:
      return createMuzzleDefinition("railgun", "weapons/railgf1a.wav", [0.5, 0.5, 1], 200);
    case 9:
      return createMuzzleDefinition("rocket", "weapons/rocklf1a.wav", [1, 0.5, 0.2], 200);
    case 10:
      return createMuzzleDefinition("grenade", "weapons/grenlf1a.wav", [1, 0.5, 0.2], 200);
    case 11:
      return createMuzzleDefinition("bfg", "weapons/bfg__f1y.wav", [0, 1, 0], 200);
    case 12:
      return createMuzzleDefinition("login", "weapons/grenlf1a.wav", [0, 1, 0], 200);
    case 13:
      return createMuzzleDefinition("logout", "weapons/grenlf1a.wav", [1, 0, 0], 200);
    case 14:
      return createMuzzleDefinition("respawn", "weapons/grenlf1a.wav", [1, 1, 0], 200);
    case 15:
      return createMuzzleDefinition("phalanx", "weapons/plasshot.wav", [1, 0.5, 0.5], 200);
    case 16:
      return createMuzzleDefinition("ionripper", "weapons/rippfire.wav", [1, 0.5, 0.5], 200);
    case 17:
      return createMuzzleDefinition("etf-rifle", "weapons/nail1.wav", [1, 1, 0], 200);
    case 18:
      return createMuzzleDefinition("shotgun2", "weapons/shotg2.wav", [1, 1, 0], 200);
    case 19:
      return createMuzzleDefinition("heatbeam", "weapons/bfg__l1a.wav", [1, 1, 0], 200);
    case 20:
      return createMuzzleDefinition("blaster2", "weapons/blastf1a.wav", [0.2, 1, 0.2], 200);
    case 21:
      return createMuzzleDefinition("tracker", "weapons/disint2.wav", [-1, -1, -1], 200);
    default:
      return createMuzzleDefinition("unknown", "weapons/blastf1a.wav", [1, 1, 0], 200);
  }
}

/**
 * Category: New
 * Purpose: Convert one monster muzzle flash id into a first coarse family name.
 */
function getMuzzleFlash2Kind(flashNumber: number): string {
  if (flashNumber >= 26 && flashNumber <= 38) {
    return "infantry-machinegun";
  }
  if (flashNumber >= 39 && flashNumber <= 44) {
    return "soldier";
  }
  if (flashNumber >= 45 && flashNumber <= 56) {
    return "gunner";
  }
  if (flashNumber >= 64 && flashNumber <= 72) {
    return "supertank";
  }
  if (flashNumber >= 73 && flashNumber <= 81) {
    return "boss2";
  }
  if (flashNumber >= 120 && flashNumber <= 132) {
    return "jorg";
  }
  return "monster-muzzleflash";
}

/**
 * Category: New
 * Purpose: Convert one temp entity packet into a stable readable kind string.
 */
function getTempEntityKind(packet: ClientTempEntityPacket): string {
  if (packet.beamKind) {
    return packet.beamKind;
  }
  return temp_event_t[packet.type]?.toLowerCase() ?? `temp-${packet.type}`;
}

/**
 * Category: New
 * Purpose: Build one reusable muzzle flash definition object.
 */
function createMuzzleDefinition(
  kind: string,
  soundName: string,
  color: [number, number, number],
  radius: number
): {
  kind: string;
  sound: { name: string; channel: number; attenuation: number };
  light: { radius: number; color: [number, number, number]; durationMs: number };
} {
  return {
    kind,
    sound: {
      name: soundName,
      channel: CHAN_WEAPON,
      attenuation: ATTN_NORM
    },
    light: {
      radius,
      color,
      durationMs: 100
    }
  };
}
