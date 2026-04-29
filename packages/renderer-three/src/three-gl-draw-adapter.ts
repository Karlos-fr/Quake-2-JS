/**
 * File: three-gl-draw-adapter.ts
 * Purpose: Adapt the ported `ref_gl/gl_draw.c` hook surface to a Three.js HUD scene.
 *
 * This file is not a direct source port.
 * It is an adapter layer between `GlDrawHooks` / `GlImageHooks` and Three.js.
 *
 * Dependencies:
 * - packages/renderer-three/src/gl-draw.ts
 * - packages/renderer-three/src/gl-image.ts
 * - three
 */

import {
  BufferAttribute,
  BufferGeometry,
  DataTexture,
  Group,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  NearestFilter,
  OrthographicCamera,
  RGBAFormat,
  Scene,
  Texture,
  UnsignedByteType,
  Vector3,
  type MagnificationTextureFilter,
  type MinificationTextureFilter
} from "three";
import type { GlDrawHooks, GlDrawQuad, GlDrawRawUpload } from "./gl-draw.js";
import type { GlImageHooks } from "./gl-image.js";

/**
 * Category: New
 * Purpose: Expose the Three.js state and hook bundles needed by the classic `gl_draw` path.
 */
export interface ThreeGlDrawAdapter {
  scene: Scene;
  camera: OrthographicCamera;
  root: Group;
  drawHooks: GlDrawHooks;
  imageHooks: Pick<
    GlImageHooks,
    "bindTexture" | "setTextureFilter" | "deleteTexture" | "uploadTextureData" | "uploadScrapTexture" | "setSharedTexturePalette"
  >;
  setViewport: (width: number, height: number) => void;
  clear: () => void;
  setTexture: (texnum: number, texture: Texture) => void;
  getTexture: (texnum: number) => Texture | null;
  setPaletteRgb: (paletteRgb: Uint8Array | null) => void;
  dispose: () => void;
}

/**
 * Category: New
 * Purpose: Create a Three.js HUD adapter for the ported `gl_draw.c` immediate-mode hooks.
 *
 * Constraints:
 * - Must preserve Quake II top-left pixel coordinates.
 * - Must keep texture upload and draw emission separate so it can plug into `createRefGlHost`.
 */
export function createThreeGlDrawAdapter(): ThreeGlDrawAdapter {
  const scene = new Scene();
  const camera = new OrthographicCamera(0, 1, 1, 0, -100, 100);
  const root = new Group();
  const textures = new Map<number, Texture>();
  const filterState = new Map<number, TextureFilterState>();
  const state = {
    viewportWidth: 1,
    viewportHeight: 1,
    currentTexnum: 0,
    textureEnabled: true,
    blendEnabled: false,
    alphaTestEnabled: true,
    color: [1, 1, 1, 1] as [number, number, number, number],
    paletteRgb: null as Uint8Array | null
  };

  scene.add(root);

  const adapter: ThreeGlDrawAdapter = {
    scene,
    camera,
    root,
    drawHooks: {
      bindTexture: (texnum) => {
        state.currentTexnum = texnum;
      },
      setTextureFilter: (texnum, minFilter, magFilter) => {
        setTextureFilter(textures, filterState, texnum, toThreeFilter(minFilter), toThreeFilter(magFilter));
      },
      setAlphaTestEnabled: (enabled) => {
        state.alphaTestEnabled = enabled;
      },
      setTextureEnabled: (enabled) => {
        state.textureEnabled = enabled;
      },
      setBlendEnabled: (enabled) => {
        state.blendEnabled = enabled;
      },
      setDrawColor: (red, green, blue, alpha) => {
        state.color = [red, green, blue, alpha];
      },
      drawTexturedQuad: (quad) => {
        const texture = state.textureEnabled ? textures.get(state.currentTexnum) : null;
        if (!texture) {
          return;
        }

        root.add(createTexturedQuad(quad, texture, state.viewportHeight, state.alphaTestEnabled, state.blendEnabled));
      },
      drawSolidQuad: (x, y, width, height) => {
        root.add(createSolidQuad(x, y, width, height, state.viewportHeight, state.color, state.blendEnabled));
      },
      uploadRawTexture: (upload) => {
        const texture = createTextureFromUpload(upload, state.paletteRgb);
        applyStoredFilter(texture, filterState.get(state.currentTexnum));
        replaceTexture(textures, state.currentTexnum, texture);
      }
    },
    imageHooks: {
      bindTexture: (texnum) => {
        state.currentTexnum = texnum;
      },
      setTextureFilter: (texnum, minFilter, magFilter) => {
        setTextureFilter(textures, filterState, texnum, toThreeGlMinFilter(minFilter), toThreeGlMagFilter(magFilter));
      },
      deleteTexture: (texnum) => {
        const texture = textures.get(texnum);
        texture?.dispose();
        textures.delete(texnum);
        filterState.delete(texnum);
      },
      uploadTextureData: (upload) => {
        if (upload.level !== 0) {
          return;
        }

        const texture = createTextureFromUpload(upload, state.paletteRgb);
        applyStoredFilter(texture, filterState.get(state.currentTexnum));
        replaceTexture(textures, state.currentTexnum, texture);
      },
      uploadScrapTexture: (texnum, width, height, data) => {
        const texture = createIndexedTexture(data, width, height, state.paletteRgb);
        applyStoredFilter(texture, filterState.get(texnum));
        replaceTexture(textures, texnum, texture);
      },
      setSharedTexturePalette: (paletteRgb) => {
        state.paletteRgb = paletteRgb.slice();
      }
    },
    setViewport: (width, height) => {
      state.viewportWidth = Math.max(1, width);
      state.viewportHeight = Math.max(1, height);
      camera.left = 0;
      camera.right = state.viewportWidth;
      camera.top = state.viewportHeight;
      camera.bottom = 0;
      camera.position.set(0, 0, 10);
      camera.lookAt(new Vector3(0, 0, 0));
      camera.updateProjectionMatrix();
    },
    clear: () => {
      clearGroup(root);
    },
    setTexture: (texnum, texture) => {
      applyStoredFilter(texture, filterState.get(texnum));
      replaceTexture(textures, texnum, texture);
    },
    getTexture: (texnum) => textures.get(texnum) ?? null,
    setPaletteRgb: (paletteRgb) => {
      state.paletteRgb = paletteRgb ? paletteRgb.slice() : null;
    },
    dispose: () => {
      clearGroup(root);
      for (const texture of textures.values()) {
        texture.dispose();
      }
      textures.clear();
      filterState.clear();
    }
  };

  adapter.setViewport(1, 1);
  return adapter;
}

function createTexturedQuad(
  quad: GlDrawQuad,
  sourceTexture: Texture,
  viewportHeight: number,
  alphaTestEnabled: boolean,
  blendEnabled: boolean
): Mesh<BufferGeometry, MeshBasicMaterial> {
  const texture = sourceTexture.clone();
  texture.needsUpdate = true;

  const geometry = createQuadGeometry(quad.width, quad.height, quad.sl, quad.tl, quad.sh, quad.th);
  const material = new MeshBasicMaterial({
    map: texture,
    transparent: true,
    alphaTest: alphaTestEnabled ? 0.5 : 0,
    depthTest: false,
    depthWrite: false
  });
  material.opacity = blendEnabled ? 0.8 : 1;

  const mesh = new Mesh(geometry, material);
  mesh.position.set(quad.x + quad.width / 2, viewportHeight - (quad.y + quad.height / 2), 0);
  return mesh;
}

function createSolidQuad(
  x: number,
  y: number,
  width: number,
  height: number,
  viewportHeight: number,
  color: readonly [number, number, number, number],
  blendEnabled: boolean
): Mesh<BufferGeometry, MeshBasicMaterial> {
  const geometry = createQuadGeometry(width, height, 0, 0, 1, 1);
  const material = new MeshBasicMaterial({
    color: 0xffffff,
    opacity: color[3],
    transparent: blendEnabled || color[3] < 1,
    depthTest: false,
    depthWrite: false
  });
  material.color.setRGB(color[0], color[1], color[2]);

  const mesh = new Mesh(geometry, material);
  mesh.position.set(x + width / 2, viewportHeight - (y + height / 2), 0);
  return mesh;
}

function createQuadGeometry(width: number, height: number, sl: number, tl: number, sh: number, th: number): BufferGeometry {
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(new Float32Array([
    -halfWidth, -halfHeight, 0,
    halfWidth, -halfHeight, 0,
    -halfWidth, halfHeight, 0,
    halfWidth, halfHeight, 0
  ]), 3));
  geometry.setAttribute("uv", new BufferAttribute(new Float32Array([
    sl, th,
    sh, th,
    sl, tl,
    sh, tl
  ]), 2));
  geometry.setIndex([0, 1, 2, 2, 1, 3]);
  return geometry;
}

function createTextureFromUpload(upload: GlDrawRawUpload | {
  width: number;
  height: number;
  data: Uint8Array | Uint32Array;
}, paletteRgb: Uint8Array | null): DataTexture {
  const rgba = upload.data instanceof Uint32Array
    ? packedRgbaToBytes(upload.data, upload.width, upload.height)
    : indexedOrRgbaToBytes(upload.data, upload.width, upload.height, paletteRgb);
  const texture = new DataTexture(rgba, upload.width, upload.height, RGBAFormat, UnsignedByteType);
  texture.magFilter = NearestFilter;
  texture.minFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function createIndexedTexture(indices: Uint8Array, width: number, height: number, paletteRgb: Uint8Array | null): DataTexture {
  const texture = new DataTexture(indexedToRgba(indices, paletteRgb), width, height, RGBAFormat, UnsignedByteType);
  texture.magFilter = NearestFilter;
  texture.minFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function packedRgbaToBytes(source: Uint32Array, width: number, height: number): Uint8Array {
  const rgba = new Uint8Array(width * height * 4);
  for (let index = 0; index < Math.min(source.length, width * height); index += 1) {
    const value = source[index] ?? 0;
    const offset = index * 4;
    rgba[offset] = value & 0xff;
    rgba[offset + 1] = (value >> 8) & 0xff;
    rgba[offset + 2] = (value >> 16) & 0xff;
    rgba[offset + 3] = (value >>> 24) & 0xff;
  }
  return rgba;
}

function indexedOrRgbaToBytes(source: Uint8Array, width: number, height: number, paletteRgb: Uint8Array | null): Uint8Array {
  if (source.length >= width * height * 4) {
    return source.slice(0, width * height * 4);
  }

  return indexedToRgba(source, paletteRgb);
}

function indexedToRgba(indices: Uint8Array, paletteRgb: Uint8Array | null): Uint8Array {
  const rgba = new Uint8Array(indices.length * 4);
  for (let index = 0; index < indices.length; index += 1) {
    const paletteIndex = indices[index] ?? 0;
    const offset = index * 4;
    if (paletteRgb) {
      const sourceOffset = paletteIndex * 3;
      rgba[offset] = paletteRgb[sourceOffset] ?? 0;
      rgba[offset + 1] = paletteRgb[sourceOffset + 1] ?? 0;
      rgba[offset + 2] = paletteRgb[sourceOffset + 2] ?? 0;
    } else {
      rgba[offset] = paletteIndex;
      rgba[offset + 1] = paletteIndex;
      rgba[offset + 2] = paletteIndex;
    }
    rgba[offset + 3] = paletteIndex === 255 ? 0 : 255;
  }
  return rgba;
}

function setTextureFilter(
  textures: Map<number, Texture>,
  filterState: Map<number, TextureFilterState>,
  texnum: number,
  minFilter: MinificationTextureFilter,
  magFilter: MagnificationTextureFilter
): void {
  filterState.set(texnum, { minFilter, magFilter });
  const texture = textures.get(texnum);
  if (texture) {
    applyStoredFilter(texture, { minFilter, magFilter });
  }
}

function applyStoredFilter(texture: Texture, filter: TextureFilterState | undefined): void {
  if (!filter) {
    return;
  }

  texture.minFilter = filter.minFilter;
  texture.magFilter = filter.magFilter;
  texture.needsUpdate = true;
}

function toThreeFilter(filter: "nearest" | "linear"): MinificationTextureFilter & MagnificationTextureFilter {
  return filter === "nearest" ? NearestFilter : LinearFilter;
}

function toThreeGlMinFilter(filter: number): MinificationTextureFilter {
  switch (filter) {
    case 0x2600:
    case 0x2700:
    case 0x2702:
      return NearestFilter;
    case 0x2601:
    case 0x2701:
    case 0x2703:
    default:
      return LinearFilter;
  }
}

function toThreeGlMagFilter(filter: number): MagnificationTextureFilter {
  return filter === 0x2600 ? NearestFilter : LinearFilter;
}

function replaceTexture(textures: Map<number, Texture>, texnum: number, texture: Texture): void {
  const old = textures.get(texnum);
  if (old && old !== texture) {
    old.dispose();
  }
  textures.set(texnum, texture);
}

function clearGroup(root: Group): void {
  for (const child of [...root.children]) {
    root.remove(child);
    if (child instanceof Mesh) {
      child.geometry.dispose();
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      for (const material of materials) {
        const maybeMap = material instanceof MeshBasicMaterial ? material.map : null;
        maybeMap?.dispose();
        material.dispose();
      }
    }
  }
}

interface TextureFilterState {
  minFilter: MinificationTextureFilter;
  magFilter: MagnificationTextureFilter;
}
