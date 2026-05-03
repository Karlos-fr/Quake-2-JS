/**
 * File: bsp.ts
 * Purpose: Backward-compatible BSP parser entry point.
 *
 * This file is not a direct source port.
 * The BSP/QFILES implementation was consolidated in qfiles.ts; this module
 * preserves older verify harness imports that still target packages/formats/src/bsp.js.
 */

export * from "./qfiles.js";
export type * from "./qfiles.js";
