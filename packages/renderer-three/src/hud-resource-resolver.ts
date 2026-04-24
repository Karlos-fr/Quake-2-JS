/**
 * File: hud-resource-resolver.ts
 * Purpose: Resolve Quake II HUD pictures and glyph resources from the mounted virtual filesystem for the Three.js HUD backend.
 *
 * This file is not a direct source port.
 * It is an adapter layer between Quake II HUD resource names and browser-ready Three.js textures.
 *
 * Dependencies:
 * - packages/filesystem
 * - packages/formats
 * - packages/renderer-common
 * - three
 */

import {
  CanvasTexture,
  DataTexture,
  LinearFilter,
  NearestFilter,
  RGBAFormat,
  SRGBColorSpace,
  Texture,
  UnsignedByteType
} from "three";
import { readMountedFile, type VirtualFilesystem } from "../../filesystem/src/index.js";
import { parsePcx } from "../../formats/src/index.js";
import type { HudGlyphSetDescriptor, HudPaletteColor } from "../../renderer-common/src/index.js";

/**
 * Category: New
 * Purpose: Describe one resolved HUD text texture built from the Quake II glyph sheet.
 *
 * Constraints:
 * - Must preserve nearest-neighbor sampling for pixel clarity.
 */
export interface HudTextTexture {
  texture: Texture;
  width: number;
  height: number;
}

/**
 * Category: New
 * Purpose: Resolve Quake II HUD resource names to Three.js textures and glyph-backed text textures.
 *
 * Constraints:
 * - Must cache decoded picture textures across frames.
 * - Must keep glyph rendering consistent with the original `DrawChar` atlas semantics.
 */
export interface QuakeHudResourceResolver {
  resolvePicture: (name: string) => Texture | null;
  resolvePaletteColor: (index: number) => HudPaletteColor;
  resolveGlyphSet: () => HudGlyphSetDescriptor;
  buildTextTexture: (text: string) => HudTextTexture | null;
}

const GLYPH_PATH = "pics/conchars.pcx";
const SHARED_PALETTE_PATH = "pics/colormap.pcx";

/**
 * Category: New
 * Purpose: Build a HUD resource resolver backed by the mounted Quake II virtual filesystem.
 *
 * Constraints:
 * - Must support both `pics/<name>.pcx` resources and already-qualified absolute-style asset paths.
 */
export function createQuakeHudResourceResolver(filesystem: VirtualFilesystem): QuakeHudResourceResolver {
  const pictureCache = new Map<string, Texture | null>();
  const textCache = new Map<string, HudTextTexture | null>();
  const glyphAtlas = loadGlyphAtlas(filesystem);
  const paletteRgb = loadHudPalette(filesystem, glyphAtlas);

  return {
    resolvePicture: (name) => {
      if (pictureCache.has(name)) {
        return pictureCache.get(name) ?? null;
      }

      const texture = loadHudPictureTexture(filesystem, name);
      pictureCache.set(name, texture);
      return texture;
    },
    resolvePaletteColor: (index) => resolvePaletteColor(paletteRgb, index),
    resolveGlyphSet: () => ({
      kind: "glyphs",
      name: "conchars",
      charWidth: 8,
      charHeight: 8,
      columns: 16,
      rows: 16,
      supportsHighBit: true,
      origin: {
        sourceFile: "client/console.c + client/cl_scrn.c + client/cl_inv.c",
        originalSymbol: "DrawChar / DrawHUDString / Inv_DrawString",
        notes: "8x8 console/HUD glyph rendering used by Quake II text paths."
      }
    }),
    buildTextTexture: (text) => {
      if (textCache.has(text)) {
        return textCache.get(text) ?? null;
      }

      const resolved = buildHudTextTexture(text, glyphAtlas);
      textCache.set(text, resolved);
      return resolved;
    }
  };
}

/**
 * Category: New
 * Purpose: Load the palette used by Quake II indexed HUD fills.
 */
function loadHudPalette(filesystem: VirtualFilesystem, glyphAtlas: ReturnType<typeof parsePcx> | null): Uint8Array | null {
  const paletteFile = readMountedFile(filesystem, SHARED_PALETTE_PATH);
  if (paletteFile) {
    try {
      return parsePcx(paletteFile.bytes, paletteFile.path).paletteRgb;
    } catch {
      // Fall through to the glyph atlas palette when the shared palette asset is unavailable or malformed.
    }
  }

  return glyphAtlas?.paletteRgb ?? null;
}

/**
 * Category: New
 * Purpose: Resolve one Quake II 8-bit palette index into normalized renderer color components.
 */
function resolvePaletteColor(paletteRgb: Uint8Array | null, index: number): HudPaletteColor {
  const paletteIndex = Math.max(0, Math.min(255, Math.trunc(index))) * 3;
  if (!paletteRgb) {
    const value = (paletteIndex / 3) / 255;
    return { red: value, green: value, blue: value, alpha: 1 };
  }

  return {
    red: (paletteRgb[paletteIndex] ?? 0) / 255,
    green: (paletteRgb[paletteIndex + 1] ?? 0) / 255,
    blue: (paletteRgb[paletteIndex + 2] ?? 0) / 255,
    alpha: 1
  };
}

/**
 * Category: New
 * Purpose: Load one HUD picture texture using Quake II pic naming rules.
 */
function loadHudPictureTexture(filesystem: VirtualFilesystem, name: string): Texture | null {
  const candidates = buildHudPictureCandidates(name);

  for (const candidate of candidates) {
    const file = readMountedFile(filesystem, candidate);
    if (!file) {
      continue;
    }

    try {
      const image = parsePcx(file.bytes, file.path);
      return createPcxTexture(image.rgba, image.width, image.height);
    } catch {
      continue;
    }
  }

  return null;
}

/**
 * Category: New
 * Purpose: Build the candidate filesystem paths used to resolve one Quake II HUD pic name.
 */
function buildHudPictureCandidates(name: string): string[] {
  const normalized = name.replaceAll("\\", "/").replace(/^\/+/, "");
  if (normalized.length === 0) {
    return [];
  }

  if (normalized.endsWith(".pcx")) {
    return [normalized];
  }

  if (normalized.includes("/")) {
    return [`${normalized}.pcx`, normalized];
  }

  return [`pics/${normalized}.pcx`, `pics/${normalized}`];
}

/**
 * Category: New
 * Purpose: Load the shared Quake II HUD glyph atlas from `conchars.pcx`.
 */
function loadGlyphAtlas(filesystem: VirtualFilesystem): ReturnType<typeof parsePcx> | null {
  const file = readMountedFile(filesystem, GLYPH_PATH);
  if (!file) {
    return null;
  }

  try {
    return parsePcx(file.bytes, file.path);
  } catch {
    return null;
  }
}

/**
 * Category: New
 * Purpose: Build one text texture by copying glyph cells from the original Quake II `conchars` atlas.
 *
 * Constraints:
 * - Must preserve 8x8 glyph placement and support high-bit alternate text.
 */
function buildHudTextTexture(text: string, glyphAtlas: ReturnType<typeof parsePcx> | null): HudTextTexture | null {
  if (!glyphAtlas || text.length === 0) {
    return null;
  }

  const canvas = document.createElement("canvas");
  canvas.width = text.length * 8;
  canvas.height = 8;
  const context = canvas.getContext("2d");
  if (!context) {
    return null;
  }

  const atlasCanvas = document.createElement("canvas");
  atlasCanvas.width = glyphAtlas.width;
  atlasCanvas.height = glyphAtlas.height;
  const atlasContext = atlasCanvas.getContext("2d");
  if (!atlasContext) {
    return null;
  }

  atlasContext.putImageData(new ImageData(new Uint8ClampedArray(glyphAtlas.rgba), glyphAtlas.width, glyphAtlas.height), 0, 0);

  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index) & 0xff;
    const glyphX = (code & 0x0f) * 8;
    const glyphY = ((code >> 4) & 0x0f) * 8;
    context.drawImage(atlasCanvas, glyphX, glyphY, 8, 8, index * 8, 0, 8, 8);
  }

  const texture = new CanvasTexture(canvas);
  texture.magFilter = NearestFilter;
  texture.minFilter = LinearFilter;
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;

  return {
    texture,
    width: canvas.width,
    height: canvas.height
  };
}

/**
 * Category: New
 * Purpose: Convert one decoded PCX image into a Three.js texture suitable for HUD pictures.
 */
function createPcxTexture(rgba: Uint8Array, width: number, height: number): Texture {
  const texture = new DataTexture(rgba, width, height, RGBAFormat, UnsignedByteType);
  texture.magFilter = NearestFilter;
  texture.minFilter = LinearFilter;
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}
