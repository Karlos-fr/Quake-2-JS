/**
 * File: index.ts
 * Purpose: Expose renderer-agnostic contracts and bridge helpers for Quake II data.
 *
 * This file is not a direct source port.
 * It is a package entry point for renderer-common modules.
 *
 * Dependencies:
 * - packages/renderer-common/src/bsp-surface-builder.ts
 */

export { buildBspSurfaces } from "./bsp-surface-builder.js";

export type { BspSurface, BspSurfaceBuildOptions } from "./bsp-surface-builder.js";
