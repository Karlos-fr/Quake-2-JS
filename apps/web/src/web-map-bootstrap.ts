/**
 * File: web-map-bootstrap.ts
 * Purpose: Hold the browser-side map loading and URL selection helpers used by the Quake2JS demo bootstrap.
 *
 * This file is not a direct source port.
 * It is an adapter layer for browser fetch, URL state and mounted PAK browsing.
 *
 * Dependencies:
 * - packages/filesystem
 */

import type { mountPak } from "../../../packages/filesystem/src/index.js";

/**
 * Original name: N/A
 * Source declaree: N/A (web map bootstrap)
 * Category: New
 * Purpose: Read the requested BSP map path from the browser URL.
 *
 * Constraints:
 * - Must fall back to the provided default map when the query string is absent.
 */
export function getRequestedMapPath(defaultMapPath: string): string {
  const params = new URLSearchParams(window.location.search);
  const map = params.get("map");
  return map && map.length > 0 ? map : defaultMapPath;
}

/**
 * Original name: N/A
 * Source declaree: N/A (web map bootstrap)
 * Category: New
 * Purpose: Persist one selected BSP path in the URL and reload the demo on that level.
 *
 * Constraints:
 * - Must preserve the current page path.
 */
export function setRequestedMapPath(mapPath: string): void {
  const url = new URL(window.location.href);
  url.searchParams.set("map", mapPath);
  window.location.href = url.toString();
}

/**
 * Original name: N/A
 * Source declaree: N/A (web map bootstrap)
 * Category: New
 * Purpose: Try several pak0.pak URLs until one succeeds.
 *
 * Constraints:
 * - Must preserve the candidate order so local dev paths stay preferred.
 */
export async function loadFirstAvailablePak(candidates: string[]): Promise<Uint8Array> {
  let lastError: Error | null = null;

  for (const candidate of candidates) {
    try {
      const response = await fetch(candidate);
      if (!response.ok) {
        throw new Error(`${candidate} -> HTTP ${response.status}`);
      }

      const bytes = new Uint8Array(await response.arrayBuffer());
      return bytes;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(`${error}`);
    }
  }

  throw lastError ?? new Error("Aucune source pak0.pak n'est accessible.");
}

/**
 * Original name: N/A
 * Source declaree: N/A (web map bootstrap)
 * Category: New
 * Purpose: Extract the BSP level list exposed by the currently mounted Quake II PAK archive.
 *
 * Constraints:
 * - Must only return `maps/*.bsp` entries.
 * - Must preserve lexical order for a stable UI.
 */
export function listPakMapPaths(mountedPak: ReturnType<typeof mountPak>): string[] {
  return mountedPak.archive.entries
    .map((entry) => entry.name)
    .filter((entryName) => entryName.startsWith("maps/") && entryName.endsWith(".bsp"))
    .sort((left, right) => left.localeCompare(right));
}

/**
 * Original name: N/A
 * Source declaree: N/A (web map bootstrap)
 * Category: New
 * Purpose: Format one BSP path into a compact UI label for the top-right map selector.
 */
export function getDisplayMapName(mapPath: string): string {
  const slashIndex = mapPath.lastIndexOf("/");
  return slashIndex >= 0 ? mapPath.slice(slashIndex + 1) : mapPath;
}
