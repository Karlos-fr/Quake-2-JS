/**
 * File: index.ts
 * Purpose: Expose the Three.js rendering bridge helpers for Quake II runtime data.
 *
 * This file is not a direct source port.
 * It is a package entry point for the Three.js backend package.
 *
 * Dependencies:
 * - packages/renderer-three/src/bsp-group-builder.ts
 */

export { buildThreeBspGroup } from "./bsp-group-builder.js";
export { createThreeBrushModelSync } from "./brush-model-sync.js";
export { createQuakeTextureResolver } from "./quake-texture-resolver.js";
export { applyMd2Frame, buildMd2Mesh, loadMd2Model } from "./md2-mesh-builder.js";
export { buildEntityPreviewGroup, updateEntityPreviewGroup } from "./entity-preview-builder.js";
export { createThreeHudLayer } from "./hud-renderer.js";
export { createQuakeHudResourceResolver } from "./hud-resource-resolver.js";

export type { BrushModelSnapshot, ThreeBrushModelSync } from "./brush-model-sync.js";
export type { BspModelOriginResolver, BspTextureResolver, ThreeBspBuildOptions } from "./bsp-group-builder.js";
export type { EntityPreviewGroup } from "./entity-preview-builder.js";
export type { ThreeHudLayer } from "./hud-renderer.js";
export type { HudTextTexture, QuakeHudResourceResolver } from "./hud-resource-resolver.js";
export type { Md2MeshBuildOptions, Md2MeshInstance } from "./md2-mesh-builder.js";
export type { QuakeTextureResolver } from "./quake-texture-resolver.js";
