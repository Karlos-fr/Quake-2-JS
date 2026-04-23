/**
 * File: common.ts
 * Source: Quake II original / qcommon/common.c
 * Purpose: Port the common argument, redirect and info-string helper routines used by both client and server bootstrap code.
 *
 * Porting policy:
 * - Preserve original behavior first.
 * - Preserve original names whenever possible.
 * - Avoid structural refactors unless documented.
 *
 * Deviations:
 * - Uses explicit runtime state instead of file-static globals.
 * - Returns formatted lines for helper outputs instead of printing directly.
 *
 * Notes:
 * - This file is intended to stay conceptually close to the original C source.
 */

import {
  MAX_INFO_KEY,
  MAX_INFO_STRING,
  MAX_TOKEN_CHARS
} from "./q-shared.js";

const MAX_NUM_ARGVS = 50;

/**
 * Category: New
 * Purpose: Store the common runtime state gradually ported from `common.c`.
 *
 * Constraints:
 * - Must keep argv state and redirect state explicit for deterministic tests.
 */
export interface CommonRuntime {
  com_argc: number;
  com_argv: string[];
  rd_target: number;
  rd_buffer: string;
  rd_buffersize: number;
  rd_flush: ((target: number, buffer: string) => void) | null;
}

/**
 * Category: New
 * Purpose: Preserve the parsed token/result pair produced by the `COM_Parse` port.
 *
 * Constraints:
 * - Must keep both the token and the caller's next scan position explicit.
 */
export interface ComParseResult {
  token: string;
  nextIndex: number | null;
}

/**
 * Category: New
 * Purpose: Create an isolated common runtime state for future `Qcommon_Init` integration.
 *
 * Constraints:
 * - Must start with an empty argv list and no active redirect.
 */
export function createCommonRuntime(): CommonRuntime {
  return {
    com_argc: 0,
    com_argv: [],
    rd_target: 0,
    rd_buffer: "",
    rd_buffersize: 0,
    rd_flush: null
  };
}

/**
 * Original name: COM_InitArgv
 * Source: qcommon/common.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Initializes the global argument array from startup argv values.
 *
 * Porting notes:
 * - Stores argv inside the explicit runtime object.
 */
export function COM_InitArgv(runtime: CommonRuntime, argv: string[]): void {
  if (argv.length > MAX_NUM_ARGVS) {
    throw new Error("COM_InitArgv: argc > MAX_NUM_ARGVS");
  }

  runtime.com_argc = argv.length;
  runtime.com_argv = argv.map((value) => (!value || value.length >= MAX_TOKEN_CHARS ? "" : value));
}

/**
 * Original name: COM_Argc
 * Source: qcommon/common.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Returns the current startup argc value.
 *
 * Porting notes:
 * - Reads from explicit runtime state.
 */
export function COM_Argc(runtime: CommonRuntime): number {
  return runtime.com_argc;
}

/**
 * Original name: COM_Argv
 * Source: qcommon/common.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Returns one startup argument or an empty string when out of range.
 *
 * Porting notes:
 * - Preserves the original empty-string fallback.
 */
export function COM_Argv(runtime: CommonRuntime, arg: number): string {
  if (arg < 0 || arg >= runtime.com_argc || runtime.com_argv[arg] === undefined) {
    return "";
  }

  return runtime.com_argv[arg];
}

/**
 * Original name: COM_ClearArgv
 * Source: qcommon/common.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Clears one startup argument slot.
 *
 * Porting notes:
 * - Preserves the original no-op behavior on invalid indexes.
 */
export function COM_ClearArgv(runtime: CommonRuntime, arg: number): void {
  if (arg < 0 || arg >= runtime.com_argc || runtime.com_argv[arg] === undefined) {
    return;
  }

  runtime.com_argv[arg] = "";
}

/**
 * Original name: COM_AddParm
 * Source: qcommon/common.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Appends one startup argument to the current argv list.
 *
 * Porting notes:
 * - Throws on overflow instead of calling `Com_Error`.
 */
export function COM_AddParm(runtime: CommonRuntime, parm: string): void {
  if (runtime.com_argc === MAX_NUM_ARGVS) {
    throw new Error("COM_AddParm: MAX_NUM_ARGVS");
  }

  runtime.com_argv[runtime.com_argc] = parm;
  runtime.com_argc += 1;
}

/**
 * Original name: COM_CheckParm
 * Source: qcommon/common.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Finds the index of one startup argument, skipping argv[0].
 *
 * Porting notes:
 * - Preserves the original 0 return value when not found.
 */
export function COM_CheckParm(runtime: CommonRuntime, parm: string): number {
  for (let index = 1; index < runtime.com_argc; index += 1) {
    if (runtime.com_argv[index] === parm) {
      return index;
    }
  }

  return 0;
}

/**
 * Original name: Com_BeginRedirect
 * Source: qcommon/common.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Starts buffering common output into a temporary redirect buffer.
 *
 * Porting notes:
 * - Stores the redirect buffer as a string instead of a caller-provided char pointer.
 */
export function Com_BeginRedirect(
  runtime: CommonRuntime,
  target: number,
  buffersize: number,
  flush: (target: number, buffer: string) => void
): void {
  if (!target || !buffersize) {
    return;
  }

  runtime.rd_target = target;
  runtime.rd_buffersize = buffersize;
  runtime.rd_flush = flush;
  runtime.rd_buffer = "";
}

/**
 * Original name: Com_EndRedirect
 * Source: qcommon/common.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Flushes and disables the active redirect buffer.
 *
 * Porting notes:
 * - No-ops safely when no redirect is active.
 */
export function Com_EndRedirect(runtime: CommonRuntime): void {
  if (!runtime.rd_target || !runtime.rd_flush) {
    return;
  }

  runtime.rd_flush(runtime.rd_target, runtime.rd_buffer);
  runtime.rd_target = 0;
  runtime.rd_buffer = "";
  runtime.rd_buffersize = 0;
  runtime.rd_flush = null;
}

/**
 * Category: New
 * Purpose: Emit one common output string either to the redirect buffer or to a provided sink.
 *
 * Constraints:
 * - Must flush before overflow just like the original redirect path.
 */
export function Com_Printf(
  runtime: CommonRuntime,
  message: string,
  sink?: (line: string) => void
): void {
  if (runtime.rd_target && runtime.rd_flush) {
    if (message.length + runtime.rd_buffer.length > runtime.rd_buffersize - 1) {
      runtime.rd_flush(runtime.rd_target, runtime.rd_buffer);
      runtime.rd_buffer = "";
    }

    runtime.rd_buffer += message;
    return;
  }

  sink?.(message);
}

/**
 * Original name: COM_SkipPath
 * Source: game/q_shared.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Returns the substring after the last `/` path separator.
 */
export function COM_SkipPath(pathname: string): string {
  const slash = pathname.lastIndexOf("/");
  return slash >= 0 ? pathname.slice(slash + 1) : pathname;
}

/**
 * Original name: COM_StripExtension
 * Source: game/q_shared.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Removes the first extension marker from the provided path string.
 *
 * Porting notes:
 * - Returns the stripped string instead of writing through an out buffer.
 */
export function COM_StripExtension(input: string): string {
  const dot = input.indexOf(".");
  return dot >= 0 ? input.slice(0, dot) : input;
}

/**
 * Original name: COM_FileBase
 * Source: game/q_shared.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Returns the filename without its directory and extension.
 */
export function COM_FileBase(input: string): string {
  const lastSlash = input.lastIndexOf("/");
  const start = lastSlash >= 0 ? lastSlash + 1 : 0;
  const lastDot = input.lastIndexOf(".");

  if (lastDot <= start) {
    return "";
  }

  return input.slice(start, lastDot);
}

/**
 * Original name: COM_FilePath
 * Source: game/q_shared.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Returns the path up to, but not including, the final `/`.
 */
export function COM_FilePath(input: string): string {
  const lastSlash = input.lastIndexOf("/");
  return lastSlash >= 0 ? input.slice(0, lastSlash) : "";
}

/**
 * Original name: COM_DefaultExtension
 * Source: game/q_shared.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Appends `extension` when the final path segment has no `.` extension.
 */
export function COM_DefaultExtension(path: string, extension: string): string {
  const lastSlash = path.lastIndexOf("/");
  const tail = lastSlash >= 0 ? path.slice(lastSlash + 1) : path;
  if (tail.includes(".")) {
    return path;
  }

  return `${path}${extension}`;
}

/**
 * Original name: COM_Parse
 * Source: game/q_shared.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Parses one token from a Quake-style script string, skipping whitespace and `//` comments.
 *
 * Porting notes:
 * - Returns `{ token, nextIndex }` instead of mutating a `char **`.
 */
export function COM_Parse(data: string | null, startIndex = 0): ComParseResult {
  if (data === null) {
    return { token: "", nextIndex: null };
  }

  let index = startIndex;

  while (index < data.length) {
    while (index < data.length && data.charCodeAt(index) <= 32) {
      index += 1;
    }

    if (index >= data.length) {
      return { token: "", nextIndex: null };
    }

    if (data[index] === "/" && data[index + 1] === "/") {
      while (index < data.length && data[index] !== "\n") {
        index += 1;
      }
      continue;
    }

    break;
  }

  if (index >= data.length) {
    return { token: "", nextIndex: null };
  }

  if (data[index] === "\"") {
    index += 1;
    let token = "";

    while (index < data.length) {
      const character = data[index];
      index += 1;

      if (character === "\"") {
        return { token, nextIndex: index };
      }

      if (token.length < MAX_TOKEN_CHARS) {
        token += character;
      }
    }

    return { token, nextIndex: index };
  }

  let token = "";
  while (index < data.length && data.charCodeAt(index) > 32) {
    if (token.length < MAX_TOKEN_CHARS) {
      token += data[index];
    }
    index += 1;
  }

  if (token.length === MAX_TOKEN_CHARS) {
    token = "";
  }

  return {
    token,
    nextIndex: index < data.length ? index : null
  };
}

/**
 * Original name: Com_sprintf
 * Source: game/q_shared.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Formats a string and clamps the final result to `size - 1` characters.
 *
 * Porting notes:
 * - Accepts already-materialized arguments instead of C varargs formatting rules.
 */
export function Com_sprintf(size: number, message: string): string {
  if (size <= 0) {
    return "";
  }

  return message.length >= size ? message.slice(0, size - 1) : message;
}

/**
 * Original name: va
 * Source: game/q_shared.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Provides the convenience formatting helper used throughout Quake II utility code.
 *
 * Porting notes:
 * - Concatenates already-rendered string fragments instead of emulating C printf varargs.
 */
export function va(...parts: Array<string | number>): string {
  return parts.join("");
}

/**
 * Original name: BigShort
 * Source: game/q_shared.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Reinterprets one 16-bit integer as big-endian input and returns host-order numeric value.
 */
export function BigShort(value: number): number {
  const buffer = new ArrayBuffer(2);
  const view = new DataView(buffer);
  view.setInt16(0, value, false);
  return view.getInt16(0, isLittleEndianHost());
}

/**
 * Original name: LittleShort
 * Source: game/q_shared.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Reinterprets one 16-bit integer as little-endian input and returns host-order numeric value.
 */
export function LittleShort(value: number): number {
  const buffer = new ArrayBuffer(2);
  const view = new DataView(buffer);
  view.setInt16(0, value, true);
  return view.getInt16(0, isLittleEndianHost());
}

/**
 * Original name: BigLong
 * Source: game/q_shared.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Reinterprets one 32-bit integer as big-endian input and returns host-order numeric value.
 */
export function BigLong(value: number): number {
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  view.setInt32(0, value, false);
  return view.getInt32(0, isLittleEndianHost());
}

/**
 * Original name: LittleLong
 * Source: game/q_shared.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Reinterprets one 32-bit integer as little-endian input and returns host-order numeric value.
 */
export function LittleLong(value: number): number {
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  view.setInt32(0, value, true);
  return view.getInt32(0, isLittleEndianHost());
}

/**
 * Original name: BigFloat
 * Source: game/q_shared.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Reinterprets one 32-bit float as big-endian input and returns host-order numeric value.
 */
export function BigFloat(value: number): number {
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  view.setFloat32(0, value, false);
  return view.getFloat32(0, isLittleEndianHost());
}

/**
 * Original name: LittleFloat
 * Source: game/q_shared.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Reinterprets one 32-bit float as little-endian input and returns host-order numeric value.
 */
export function LittleFloat(value: number): number {
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  view.setFloat32(0, value, true);
  return view.getFloat32(0, isLittleEndianHost());
}

/**
 * Original name: Swap_Init
 * Source: game/q_shared.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Reports whether the host is big-endian, mirroring the original byte-order initialization.
 *
 * Porting notes:
 * - JavaScript engines do not need mutable function-pointer setup, so the port returns the detected mode.
 */
export function Swap_Init(): { bigendien: boolean } {
  return {
    bigendien: !isLittleEndianHost()
  };
}

/**
 * Original name: Info_ValueForKey
 * Source: game/q_shared.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Returns the current value stored under one Quake info-string key.
 */
export function Info_ValueForKey(info: string, key: string): string {
  for (const entry of parseInfoString(info)) {
    if (entry.key === key) {
      return entry.value;
    }
  }

  return "";
}

/**
 * Original name: Info_RemoveKey
 * Source: game/q_shared.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Removes one key from a Quake-style info string while preserving the order of the remaining pairs.
 */
export function Info_RemoveKey(info: string, key: string): string {
  if (key.includes("\\")) {
    return info;
  }

  const parsed = parseInfoString(info).filter((entry) => entry.key !== key);
  return parsed.map((entry) => `\\${entry.key}\\${entry.value}`).join("");
}

/**
 * Original name: Info_Validate
 * Source: game/q_shared.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Rejects info strings containing characters that break Quake II parsing.
 */
export function Info_Validate(info: string): boolean {
  return !info.includes("\"") && !info.includes(";");
}

/**
 * Original name: Info_SetValueForKey
 * Source: game/q_shared.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Inserts or replaces one `\\key\\value` pair in an info string while preserving Quake II validation rules.
 *
 * Porting notes:
 * - Returns the updated string instead of mutating a caller-owned char buffer.
 */
export function Info_SetValueForKey(info: string, key: string, value: string): string {
  if (
    key.includes("\\") || value.includes("\\") ||
    key.includes(";") || value.includes(";") ||
    key.includes("\"") || value.includes("\"")
  ) {
    return info;
  }

  if (key.length > MAX_INFO_KEY - 1 || value.length > MAX_INFO_KEY - 1) {
    return info;
  }

  let next = Info_RemoveKey(info, key);
  if (value.length === 0) {
    return next;
  }

  const pair = `\\${key}\\${value}`;
  if (next.length + pair.length > MAX_INFO_STRING) {
    return next;
  }

  let sanitizedPair = "";
  for (let index = 0; index < pair.length; index += 1) {
    const code = pair.charCodeAt(index) & 127;
    if (code >= 32 && code < 127) {
      sanitizedPair += String.fromCharCode(code);
    }
  }

  next += sanitizedPair;
  return next;
}

/**
 * Original name: Info_Print
 * Source: qcommon/common.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Formats one Quake info string as aligned key/value lines.
 *
 * Porting notes:
 * - Returns formatted lines instead of printing through `Com_Printf`.
 */
export function Info_Print(s: string): string[] {
  const lines: string[] = [];
  let working = s.startsWith("\\") ? s.slice(1) : s;

  while (working.length > 0) {
    const keyStop = working.indexOf("\\");
    const key = keyStop >= 0 ? working.slice(0, keyStop) : working;
    const paddedKey = key.length < 20 ? `${key}${" ".repeat(20 - key.length)}` : key;

    if (keyStop === -1) {
      lines.push(`${paddedKey}MISSING VALUE`);
      return lines;
    }

    working = working.slice(keyStop + 1);

    const valueStop = working.indexOf("\\");
    const value = valueStop >= 0 ? working.slice(0, valueStop) : working;
    lines.push(`${paddedKey}${value}`);

    working = valueStop >= 0 ? working.slice(valueStop + 1) : "";
  }

  return lines;
}

/**
 * Category: New
 * Purpose: Parse a Quake-style info string into ordered key/value pairs.
 *
 * Constraints:
 * - Must tolerate empty strings and malformed tails without throwing.
 */
function parseInfoString(info: string): Array<{ key: string; value: string }> {
  const pairs: Array<{ key: string; value: string }> = [];
  const tokens = info.split("\\").filter((token) => token.length > 0);

  for (let index = 0; index + 1 < tokens.length; index += 2) {
    pairs.push({ key: tokens[index], value: tokens[index + 1] });
  }

  return pairs;
}

/**
 * Category: New
 * Purpose: Detect the host numeric endianness once for the q_shared byte-order helpers.
 */
function isLittleEndianHost(): boolean {
  const buffer = new ArrayBuffer(2);
  const view = new DataView(buffer);
  view.setUint16(0, 1, true);
  return view.getUint16(0, true) === 1;
}
