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

import { MAX_TOKEN_CHARS } from "./q-shared.js";

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
