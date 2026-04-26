/**
 * File: quake-texture-resolver.ts
 * Purpose: Load Quake II WAL textures from the mounted virtual filesystem and expose them as Three.js textures.
 *
 * This file is not a direct source port.
 * It is an adapter layer between Quake II asset formats and the Three.js texture system.
 *
 * Dependencies:
 * - packages/filesystem
 * - packages/formats
 * - three
 */

import { readMountedFile, type VirtualFilesystem } from "../../filesystem/src/index.js";
import { parsePcx, parseWal } from "../../formats/src/index.js";
import {
  ClampToEdgeWrapping,
  DataTexture,
  LinearFilter,
  LinearMipmapNearestFilter,
  RepeatWrapping,
  RGBAFormat,
  SRGBColorSpace,
  UnsignedByteType,
  type Texture
} from "three";
import type { BspTextureResolver } from "./bsp-group-builder.js";

const SHARED_PALETTE_PATH = "pics/colormap.pcx";

/**
 * Category: New
 * Purpose: Hold cached Quake II texture decoding state reused across many BSP surfaces.
 *
 * Constraints:
 * - Must lazily initialize the shared palette.
 */
export interface QuakeTextureResolver {
  resolveTexture: BspTextureResolver;
}

/**
 * Category: New
 * Purpose: Build a BSP texture resolver backed by the mounted Quake II virtual filesystem.
 *
 * Constraints:
 * - Must cache textures by texture name.
 * - Must return null when a texture cannot be decoded.
 */
export function createQuakeTextureResolver(filesystem: VirtualFilesystem): QuakeTextureResolver {
  const cache = new Map<string, Texture | null>();
  let paletteRgb: Uint8Array | null = null;

  return {
    resolveTexture: (textureName) => {
      if (cache.has(textureName)) {
        return cache.get(textureName) ?? null;
      }

      if (paletteRgb === null) {
        paletteRgb = loadSharedPalette(filesystem);
      }

      const file = readMountedFile(filesystem, `textures/${textureName}.wal`);
      if (!file || paletteRgb === null) {
        cache.set(textureName, null);
        return null;
      }

      try {
        const wal = parseWal(file.bytes, file.path);
        const texture = createWalDataTexture(wal.header.width, wal.header.height, wal.mipmaps[0], paletteRgb);
        cache.set(textureName, texture);
        return texture;
      } catch {
        cache.set(textureName, null);
        return null;
      }
    }
  };
}

/**
 * Category: New
 * Purpose: Load the shared Quake II palette from a palette-bearing PCX asset.
 *
 * Constraints:
 * - Must return null when the palette source is unavailable.
 */
function loadSharedPalette(filesystem: VirtualFilesystem): Uint8Array | null {
  const paletteFile = readMountedFile(filesystem, SHARED_PALETTE_PATH);
  if (!paletteFile) {
    return null;
  }

  try {
    return parsePcx(paletteFile.bytes, paletteFile.path).paletteRgb;
  } catch {
    return null;
  }
}

/**
 * Category: New
 * Purpose: Convert one WAL indexed mip level into a Three.js DataTexture.
 *
 * Constraints:
 * - Must preserve palette colors exactly.
 * - Must configure texture sampling for tiled Quake world surfaces.
 */
function createWalDataTexture(width: number, height: number, indices: Uint8Array, paletteRgb: Uint8Array): Texture {
  const rgba = new Uint8Array(width * height * 4);

  for (let index = 0; index < indices.length; index += 1) {
    const paletteIndex = indices[index] * 3;
    const rgbaIndex = index * 4;
    rgba[rgbaIndex] = paletteRgb[paletteIndex];
    rgba[rgbaIndex + 1] = paletteRgb[paletteIndex + 1];
    rgba[rgbaIndex + 2] = paletteRgb[paletteIndex + 2];
    rgba[rgbaIndex + 3] = 255;
  }

  const texture = new DataTexture(rgba, width, height, RGBAFormat, UnsignedByteType);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearMipmapNearestFilter;
  texture.generateMipmaps = true;
  texture.flipY = false;
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  texture.userData.quake = {
    width,
    height,
    clampS: ClampToEdgeWrapping,
    clampT: ClampToEdgeWrapping
  };
  return texture;
}
