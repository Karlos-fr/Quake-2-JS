/**
 * File: messages.ts
 * Source: Quake II original / qcommon/common.c
 * Purpose: Port the core Quake II message read and write primitives used by client and server networking.
 *
 * Porting policy:
 * - Preserve original behavior first.
 * - Preserve original names whenever possible.
 * - Avoid structural refactors unless documented.
 *
 * Deviations:
 * - Returns JavaScript strings instead of static C buffers.
 * - Uses Uint8Array writes and reads instead of raw pointer arithmetic.
 *
 * Notes:
 * - This file is intended to stay close to the original C source.
 */

import {
  MSG_BeginReading,
  SZ_GetSpace,
  SZ_Write,
  type sizebuf_t
} from "../../memory/src/index.js";
import {
  ANGLE2SHORT,
  SHORT2ANGLE,
  type vec3_t
} from "./q-shared.js";

const READ_STRING_LIMIT = 2048;
const COORD_SCALE = 8;
const BYTE_ANGLE_SCALE = 256 / 360;

/**
 * Original name: MSG_WriteChar
 * Source: qcommon/common.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Writes a signed 8-bit value into a Quake II message buffer.
 *
 * Porting notes:
 * - Preserves the original one-byte truncation behavior.
 */
export function MSG_WriteChar(sb: sizebuf_t, c: number): void {
  SZ_GetSpace(sb, 1)[0] = c & 0xff;
}

/**
 * Original name: MSG_WriteByte
 * Source: qcommon/common.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Writes an unsigned 8-bit value into a Quake II message buffer.
 *
 * Porting notes:
 * - Preserves the original one-byte truncation behavior.
 */
export function MSG_WriteByte(sb: sizebuf_t, c: number): void {
  SZ_GetSpace(sb, 1)[0] = c & 0xff;
}

/**
 * Original name: MSG_WriteShort
 * Source: qcommon/common.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Writes a signed 16-bit little-endian value into a Quake II message buffer.
 *
 * Porting notes:
 * - Preserves the original low-byte then high-byte write order.
 */
export function MSG_WriteShort(sb: sizebuf_t, c: number): void {
  const buf = SZ_GetSpace(sb, 2);
  buf[0] = c & 0xff;
  buf[1] = (c >> 8) & 0xff;
}

/**
 * Original name: MSG_WriteLong
 * Source: qcommon/common.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Writes a signed 32-bit little-endian value into a Quake II message buffer.
 *
 * Porting notes:
 * - Preserves the original byte order.
 */
export function MSG_WriteLong(sb: sizebuf_t, c: number): void {
  const buf = SZ_GetSpace(sb, 4);
  buf[0] = c & 0xff;
  buf[1] = (c >> 8) & 0xff;
  buf[2] = (c >> 16) & 0xff;
  buf[3] = (c >> 24) & 0xff;
}

/**
 * Original name: MSG_WriteFloat
 * Source: qcommon/common.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Writes a 32-bit IEEE float using Quake II little-endian message storage.
 *
 * Porting notes:
 * - Uses DataView for stable float packing.
 */
export function MSG_WriteFloat(sb: sizebuf_t, f: number): void {
  const encoded = new Uint8Array(4);
  new DataView(encoded.buffer).setFloat32(0, f, true);
  SZ_Write(sb, encoded);
}

/**
 * Original name: MSG_WriteString
 * Source: qcommon/common.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Writes a null-terminated string, or an empty string if the source is nullish.
 *
 * Porting notes:
 * - Accepts null and undefined as JavaScript equivalents of a null C pointer.
 */
export function MSG_WriteString(sb: sizebuf_t, value?: string | null): void {
  if (value === null || value === undefined) {
    SZ_Write(sb, new Uint8Array([0]));
    return;
  }

  const encoded = new Uint8Array(value.length + 1);
  for (let index = 0; index < value.length; index += 1) {
    encoded[index] = value.charCodeAt(index) & 0xff;
  }
  encoded[value.length] = 0;
  SZ_Write(sb, encoded);
}

/**
 * Original name: MSG_WriteCoord
 * Source: qcommon/common.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Writes a coordinate compressed to a signed short at 1/8 precision.
 *
 * Porting notes:
 * - Keeps the original integer truncation behavior.
 */
export function MSG_WriteCoord(sb: sizebuf_t, f: number): void {
  MSG_WriteShort(sb, Math.trunc(f * COORD_SCALE));
}

/**
 * Original name: MSG_WritePos
 * Source: qcommon/common.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Writes a vec3 position using the compressed coordinate format.
 *
 * Porting notes:
 * - Preserves write order x, y, z.
 */
export function MSG_WritePos(sb: sizebuf_t, pos: vec3_t): void {
  MSG_WriteCoord(sb, pos[0]);
  MSG_WriteCoord(sb, pos[1]);
  MSG_WriteCoord(sb, pos[2]);
}

/**
 * Original name: MSG_WriteAngle
 * Source: qcommon/common.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Writes an angle compressed to one byte.
 *
 * Porting notes:
 * - Preserves the original 0-255 wrap behavior.
 */
export function MSG_WriteAngle(sb: sizebuf_t, f: number): void {
  MSG_WriteByte(sb, Math.trunc(f * BYTE_ANGLE_SCALE) & 255);
}

/**
 * Original name: MSG_WriteAngle16
 * Source: qcommon/common.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Writes an angle compressed to a 16-bit Quake II angle value.
 *
 * Porting notes:
 * - Reuses the shared ANGLE2SHORT helper ported from q_shared.h.
 */
export function MSG_WriteAngle16(sb: sizebuf_t, f: number): void {
  MSG_WriteShort(sb, ANGLE2SHORT(f));
}

/**
 * Original name: MSG_ReadChar
 * Source: qcommon/common.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Reads a signed 8-bit value or returns -1 past the readable end.
 *
 * Porting notes:
 * - Preserves the original readcount increment even on overflow.
 */
export function MSG_ReadChar(msg_read: sizebuf_t): number {
  let c = -1;
  if (msg_read.readcount + 1 <= msg_read.cursize) {
    const value = msg_read.data[msg_read.readcount];
    c = value > 127 ? value - 256 : value;
  }
  msg_read.readcount += 1;
  return c;
}

/**
 * Original name: MSG_ReadByte
 * Source: qcommon/common.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Reads an unsigned 8-bit value or returns -1 past the readable end.
 *
 * Porting notes:
 * - Preserves the original readcount increment even on overflow.
 */
export function MSG_ReadByte(msg_read: sizebuf_t): number {
  let c = -1;
  if (msg_read.readcount + 1 <= msg_read.cursize) {
    c = msg_read.data[msg_read.readcount];
  }
  msg_read.readcount += 1;
  return c;
}

/**
 * Original name: MSG_ReadShort
 * Source: qcommon/common.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Reads a signed 16-bit little-endian value or returns -1 past the readable end.
 *
 * Porting notes:
 * - Preserves the original readcount increment even on overflow.
 */
export function MSG_ReadShort(msg_read: sizebuf_t): number {
  let c = -1;
  if (msg_read.readcount + 2 <= msg_read.cursize) {
    const value = msg_read.data[msg_read.readcount] + (msg_read.data[msg_read.readcount + 1] << 8);
    c = value & 0x8000 ? value - 0x10000 : value;
  }
  msg_read.readcount += 2;
  return c;
}

/**
 * Original name: MSG_ReadLong
 * Source: qcommon/common.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Reads a signed 32-bit little-endian value or returns -1 past the readable end.
 *
 * Porting notes:
 * - Preserves the original readcount increment even on overflow.
 */
export function MSG_ReadLong(msg_read: sizebuf_t): number {
  let c = -1;
  if (msg_read.readcount + 4 <= msg_read.cursize) {
    c =
      msg_read.data[msg_read.readcount] +
      (msg_read.data[msg_read.readcount + 1] << 8) +
      (msg_read.data[msg_read.readcount + 2] << 16) +
      (msg_read.data[msg_read.readcount + 3] << 24);
  }
  msg_read.readcount += 4;
  return c;
}

/**
 * Original name: MSG_ReadFloat
 * Source: qcommon/common.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Reads a 32-bit float or returns -1 past the readable end.
 *
 * Porting notes:
 * - Uses DataView to mirror the original packed byte interpretation.
 */
export function MSG_ReadFloat(msg_read: sizebuf_t): number {
  if (msg_read.readcount + 4 > msg_read.cursize) {
    msg_read.readcount += 4;
    return -1;
  }

  const dat = new Uint8Array(4);
  dat[0] = msg_read.data[msg_read.readcount];
  dat[1] = msg_read.data[msg_read.readcount + 1];
  dat[2] = msg_read.data[msg_read.readcount + 2];
  dat[3] = msg_read.data[msg_read.readcount + 3];
  msg_read.readcount += 4;
  return new DataView(dat.buffer).getFloat32(0, true);
}

/**
 * Original name: MSG_ReadString
 * Source: qcommon/common.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Reads a null-terminated string up to the Quake II temporary read buffer limit.
 *
 * Porting notes:
 * - Returns a JavaScript string instead of a shared static C char buffer.
 */
export function MSG_ReadString(msg_read: sizebuf_t): string {
  return readStringInternal(msg_read, false);
}

/**
 * Original name: MSG_ReadStringLine
 * Source: qcommon/common.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Reads a string terminated by null, EOF or newline.
 *
 * Porting notes:
 * - Returns a JavaScript string instead of a shared static C char buffer.
 */
export function MSG_ReadStringLine(msg_read: sizebuf_t): string {
  return readStringInternal(msg_read, true);
}

/**
 * Original name: MSG_ReadCoord
 * Source: qcommon/common.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Reads a coordinate encoded at 1/8 precision.
 *
 * Porting notes:
 * - Preserves the original conversion factor.
 */
export function MSG_ReadCoord(msg_read: sizebuf_t): number {
  return MSG_ReadShort(msg_read) * (1 / COORD_SCALE);
}

/**
 * Original name: MSG_ReadPos
 * Source: qcommon/common.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Reads a compressed vec3 position.
 *
 * Porting notes:
 * - Returns a vec3 tuple rather than mutating an out pointer.
 */
export function MSG_ReadPos(msg_read: sizebuf_t): vec3_t {
  return [MSG_ReadCoord(msg_read), MSG_ReadCoord(msg_read), MSG_ReadCoord(msg_read)];
}

/**
 * Original name: MSG_ReadAngle
 * Source: qcommon/common.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Reads a one-byte angle and converts it to degrees.
 *
 * Porting notes:
 * - Preserves the original 360/256 scale.
 */
export function MSG_ReadAngle(msg_read: sizebuf_t): number {
  return MSG_ReadChar(msg_read) * (360 / 256);
}

/**
 * Original name: MSG_ReadAngle16
 * Source: qcommon/common.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Reads a 16-bit Quake II packed angle and converts it to degrees.
 *
 * Porting notes:
 * - Reuses the shared SHORT2ANGLE helper ported from q_shared.h.
 */
export function MSG_ReadAngle16(msg_read: sizebuf_t): number {
  return SHORT2ANGLE(MSG_ReadShort(msg_read));
}

/**
 * Original name: MSG_ReadData
 * Source: qcommon/common.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Reads a raw byte slice of the requested length from the message stream.
 *
 * Porting notes:
 * - Returns a Uint8Array instead of mutating a caller-provided void pointer.
 */
export function MSG_ReadData(msg_read: sizebuf_t, len: number): Uint8Array {
  const data = new Uint8Array(len);
  for (let index = 0; index < len; index += 1) {
    data[index] = MSG_ReadByte(msg_read) & 0xff;
  }
  return data;
}

export { MSG_BeginReading };

/**
 * Category: New
 * Purpose: Read a Quake II message string using the original temporary-buffer limits.
 *
 * Constraints:
 * - Must stop on EOF, null terminator, and optionally newline.
 */
function readStringInternal(msg_read: sizebuf_t, stopOnNewline: boolean): string {
  let result = "";

  while (result.length < READ_STRING_LIMIT - 1) {
    const c = MSG_ReadChar(msg_read);
    if (c === -1 || c === 0 || (stopOnNewline && c === 10)) {
      break;
    }

    result += String.fromCharCode(c & 0xff);
  }

  return result;
}
