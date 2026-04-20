/**
 * File: sp2.ts
 * Source: Quake II original / qcommon/qfiles.h
 * Purpose: Parse Quake II SP2 sprite files and expose their frame metadata.
 *
 * Porting policy:
 * - Preserve original behavior first.
 * - Preserve original names whenever possible.
 * - Avoid structural refactors unless documented.
 *
 * Deviations:
 * - Returns structured metadata objects instead of exposing a raw C struct pointer.
 *
 * Notes:
 * - This file is intended to stay close to the original SP2 declarations.
 */

import { getLittleLong } from "../../memory/src/binary-io.js";

export const IDSPRITEHEADER = (("2".charCodeAt(0) << 24) + ("S".charCodeAt(0) << 16) + ("D".charCodeAt(0) << 8) + "I".charCodeAt(0)) | 0;
export const SPRITE_VERSION = 2;

const MAX_SKINNAME = 64;
const DSPRFRAME_SIZE = 80;
const DSPRITE_HEADER_SIZE = 12;

/**
 * Original name: dsprframe_t
 * Source: qcommon/qfiles.h
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Stores one SP2 sprite frame size, origin and PCX path.
 */
export interface dsprframe_t {
  width: number;
  height: number;
  origin_x: number;
  origin_y: number;
  name: string;
}

/**
 * Original name: dsprite_t
 * Source: qcommon/qfiles.h
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Represents the SP2 sprite header and its ordered frame list.
 */
export interface dsprite_t {
  ident: number;
  version: number;
  numframes: number;
  frames: dsprframe_t[];
}

/**
 * Original name: dsprite_t
 * Source: qcommon/qfiles.h
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Validates and parses a Quake II SP2 sprite file into structured frame metadata.
 *
 * Porting notes:
 * - Keeps frame ordering and names exactly so later renderer adapters can resolve sprite images faithfully.
 */
export function parseSp2(bytes: Uint8Array, path?: string): dsprite_t {
  if (bytes.byteLength < DSPRITE_HEADER_SIZE) {
    throw new Error(`${path ?? "sp2"} is too small to contain an SP2 header`);
  }

  const ident = getLittleLong(bytes, 0);
  const version = getLittleLong(bytes, 4);
  const numframes = getLittleLong(bytes, 8);

  if (ident !== IDSPRITEHEADER) {
    throw new Error(`${path ?? "sp2"} is not a Quake II SP2 sprite`);
  }

  if (version !== SPRITE_VERSION) {
    throw new Error(`${path ?? "sp2"} has unsupported sprite version ${version}`);
  }

  if (numframes < 0) {
    throw new Error(`${path ?? "sp2"} has an invalid frame count`);
  }

  const framesOffset = DSPRITE_HEADER_SIZE;
  const framesByteLength = numframes * DSPRFRAME_SIZE;
  if (framesOffset + framesByteLength > bytes.byteLength) {
    throw new Error(`${path ?? "sp2"} has an out-of-bounds frame table`);
  }

  const frames: dsprframe_t[] = [];
  for (let index = 0; index < numframes; index += 1) {
    const offset = framesOffset + index * DSPRFRAME_SIZE;
    frames.push({
      width: getLittleLong(bytes, offset),
      height: getLittleLong(bytes, offset + 4),
      origin_x: getLittleLong(bytes, offset + 8),
      origin_y: getLittleLong(bytes, offset + 12),
      name: decodeCString(bytes.subarray(offset + 16, offset + 16 + MAX_SKINNAME))
    });
  }

  return {
    ident,
    version,
    numframes,
    frames
  };
}

/**
 * Category: New
 * Purpose: Decode a fixed-width null-terminated Quake C string field.
 *
 * Constraints:
 * - Must stop at the first zero byte.
 */
function decodeCString(bytes: Uint8Array): string {
  let end = bytes.indexOf(0);
  if (end === -1) {
    end = bytes.length;
  }

  let result = "";
  for (let index = 0; index < end; index += 1) {
    result += String.fromCharCode(bytes[index]);
  }

  return result;
}
