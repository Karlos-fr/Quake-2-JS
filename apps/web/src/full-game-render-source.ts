/**
 * File: full-game-render-source.ts
 * Purpose: Build the server-backed render source consumed by the full-game Three/ref_gl loop.
 *
 * This file is not a direct source port.
 * It is an adapter layer between the authoritative Quake II client state and the browser renderer.
 *
 * Dependencies:
 * - packages/client
 * - packages/qcommon
 * - apps/web full-game-render-loop
 */

import {
  CS_MODELS,
  Cvar_VariableValue,
  type CvarRuntime
} from "../../../packages/qcommon/src/index.js";
import { CL_BuildRefreshFrame } from "../../../packages/client/src/refresh.js";
import { SCR_BuildScreenState } from "../../../packages/client/src/cl_scrn.js";
import { CL_BuildSkySnapshot } from "../../../packages/client/src/sky.js";
import type {
  BrushModelSnapshot,
  ClientRuntime
} from "../../../packages/client/src/index.js";
import type { FullGameRenderSource } from "./full-game-render-loop.js";

export interface FullGameServerRenderSourceOptions {
  cvar: CvarRuntime;
  predictMovement?: boolean;
  drawGun?: boolean;
}

/**
 * Category: New
 * Purpose: Resolve the authoritative BSP path from the parsed client world-model configstring.
 *
 * Constraints:
 * - Must prefer `CS_MODELS + 1`, because it is the server snapshot contract consumed by the client.
 * - May fall back to a pending host map request before the first configstring frame is active.
 */
export function getFullGameServerMapPath(client: ClientRuntime, fallbackMapRequest: string | null = null): string | null {
  const worldModel = client.cl.configstrings[CS_MODELS + 1];
  const mapName = normalizeServerMapName(worldModel || fallbackMapRequest || "");
  return mapName ? `maps/${mapName}.bsp` : null;
}

/**
 * Category: New
 * Purpose: Project the parsed authoritative client snapshot into the renderer source contract.
 *
 * Constraints:
 * - Must keep gameplay ownership on the local server.
 * - Must read renderable entities, HUD state, sky and sounds from the parsed client state.
 */
export function createFullGameServerRenderSource(
  runtime: ClientRuntime,
  options: FullGameServerRenderSourceOptions
): FullGameRenderSource {
  const refreshFrame = CL_BuildRefreshFrame(runtime, {
    predictMovement: options.predictMovement ?? true,
    drawGun: options.drawGun ?? true
  });

  return {
    runtime,
    refreshFrame,
    screenState: SCR_BuildScreenState(runtime),
    skySnapshot: CL_BuildSkySnapshot(runtime),
    getBrushModelSnapshots: () => buildServerBackedBrushModelSnapshots(runtime),
    getCvarValue: (name) => Cvar_VariableValue(options.cvar, name),
    resolveSoundPath: (soundIndex) => resolveClientSoundPath(runtime, soundIndex)
  };
}

/**
 * Category: New
 * Purpose: Derive inline brush model transforms from the server-authored packet entities.
 *
 * Constraints:
 * - Must use the original `CS_MODELS + modelindex` configstring as the model name source.
 * - Must include only BSP inline models whose names follow the Quake II `*N` convention.
 */
export function buildServerBackedBrushModelSnapshots(client: ClientRuntime): BrushModelSnapshot[] {
  const snapshots: BrushModelSnapshot[] = [];
  const frame = client.cl.frame;
  const parseEntities = client.cl_parse_entities;

  for (let index = 0; index < frame.num_entities; index += 1) {
    const parseIndex = (frame.parse_entities + index) & (parseEntities.length - 1);
    const entity = parseEntities[parseIndex];
    const model = resolveClientModelPath(client, entity.modelindex);
    if (!model?.startsWith("*")) {
      continue;
    }

    snapshots.push({
      model,
      origin: [...entity.origin],
      angles: [...entity.angles],
      flags: entity.renderfx
    });
  }

  return snapshots;
}

/**
 * Category: New
 * Purpose: Resolve a client sound precache entry back to the web-loadable Quake sound path.
 *
 * Constraints:
 * - Must support both transitional string precaches and concrete `sfx_t`-like sound handles.
 */
export function resolveClientSoundPath(client: ClientRuntime, soundIndex: number): string | null {
  return resolveClientSoundPathValue(client.cl.sound_precache[soundIndex]);
}

/**
 * Category: New
 * Purpose: Resolve one opaque client sound precache value without depending on a concrete sound backend.
 */
export function resolveClientSoundPathValue(value: unknown): string | null {
  if (typeof value === "string") {
    return value.length > 0 ? value : null;
  }

  if (typeof value !== "object" || value === null || !("name" in value)) {
    return null;
  }

  const name = (value as { name?: unknown }).name;
  return typeof name === "string" && name.length > 0 ? name : null;
}

function resolveClientModelPath(client: ClientRuntime, modelIndex: number): string | null {
  if (modelIndex <= 0) {
    return null;
  }

  const configstring = client.cl.configstrings[CS_MODELS + modelIndex];
  if (configstring?.length) {
    return configstring;
  }

  const registered = client.cl.model_draw[modelIndex];
  return typeof registered === "string" && registered.length > 0 ? registered : null;
}

function normalizeServerMapName(value: string): string | null {
  let name = value.trim().replaceAll("\\", "/");
  if (!name) {
    return null;
  }

  if (name.startsWith("*")) {
    name = name.slice(1);
  }

  const spawnpointIndex = name.indexOf("$");
  if (spawnpointIndex >= 0) {
    name = name.slice(0, spawnpointIndex);
  }

  if (name.toLowerCase().startsWith("maps/")) {
    name = name.slice(5);
  }

  if (name.toLowerCase().endsWith(".bsp")) {
    name = name.slice(0, -4);
  }

  return name.length > 0 ? name : null;
}
