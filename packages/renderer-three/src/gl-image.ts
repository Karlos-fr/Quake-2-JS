/**
 * File: gl-image.ts
 * Source: Quake II original / ref_gl/gl_image.c
 * Purpose: Port the GL image manager used by the original refresh module.
 *
 * Porting policy:
 * - Preserve original behavior first.
 * - Preserve original names whenever possible.
 * - Avoid structural refactors unless documented.
 *
 * Deviations:
 * - Replaces renderer globals with an explicit runtime object.
 * - Uses existing Quake file parsers for PCX/TGA/WAL decoding instead of duplicating byte readers.
 * - Defers GPU upload work to backend hooks while preserving image registration, scrap packing and filter logic.
 *
 * Notes:
 * - This file is the principal attachment point for `ref_gl/gl_image.c`.
 * - This tranche focuses on image registration, scrap allocation, palette/gamma state and binding/filter behavior.
 */

import { parsePcx, parseTga, parseWal } from "../../formats/src/index.js";
import { ERR_DROP, ERR_FATAL, MAX_QPATH, PRINT_ALL, PRINT_DEVELOPER } from "../../qcommon/src/index.js";
import type { image_t } from "./gl-model.js";

export const TEXNUM_LIGHTMAPS = 1024;
export const TEXNUM_SCRAPS = 1152;
export const TEXNUM_IMAGES = 1153;
export const MAX_GLTEXTURES = 1024;
export const MAX_SCRAPS = 1;
export const BLOCK_WIDTH = 256;
export const BLOCK_HEIGHT = 256;

export const GL_TEXTURE0_SGIS = 0x835e;
export const GL_TEXTURE1_SGIS = 0x835f;
export const GL_TEXTURE_ENV = 0x2300;
export const GL_TEXTURE_ENV_MODE = 0x2200;
export const GL_REPLACE = 0x1e01;
export const GL_TEXTURE_2D = 0x0de1;
export const GL_SHARED_TEXTURE_PALETTE_EXT = 0x81fb;
export const GL_RGB = 0x1907;
export const GL_RGBA = 0x1908;
export const GL_RGB8 = 0x8051;
export const GL_RGB5 = 0x8050;
export const GL_RGB4 = 0x804f;
export const GL_R3_G3_B2 = 0x2a10;
export const GL_RGBA8 = 0x8058;
export const GL_RGB5_A1 = 0x8057;
export const GL_RGBA4 = 0x8056;
export const GL_RGBA2 = 0x8055;
export const GL_LINEAR = 0x2601;
export const GL_NEAREST = 0x2600;
export const GL_NEAREST_MIPMAP_NEAREST = 0x2700;
export const GL_LINEAR_MIPMAP_NEAREST = 0x2701;
export const GL_NEAREST_MIPMAP_LINEAR = 0x2702;
export const GL_LINEAR_MIPMAP_LINEAR = 0x2703;
export const GL_COLOR_INDEX = 0x1900;
export const GL_COLOR_INDEX8_EXT = 0x80e5;
export const GL_UNSIGNED_BYTE = 0x1401;
export const GL_RENDERER_VOODOO = 0x00000001;
export const GL_RENDERER_VOODOO2 = 0x00000002;

/**
 * Original name: imagetype_t
 * Source: ref_gl/gl_local.h
 * Category: Ported
 * Fidelity level: Strict
 */
export enum imagetype_t {
  it_skin,
  it_sprite,
  it_wall,
  it_pic,
  it_sky
}

export interface GlImage {
  name: string;
  type: imagetype_t;
  width: number;
  height: number;
  upload_width: number;
  upload_height: number;
  registration_sequence: number;
  texturechain: unknown;
  texnum: number;
  sl: number;
  tl: number;
  sh: number;
  th: number;
  scrap: boolean;
  has_alpha: boolean;
  paletted: boolean;
}

export interface GlImageUploadSource {
  bits: 8 | 32;
  pixels: Uint8Array | Uint32Array;
  width: number;
  height: number;
  mipmap: boolean;
  is_sky: boolean;
}

export interface GlImageUploadResult {
  upload_width: number;
  upload_height: number;
  has_alpha: boolean;
  paletted: boolean;
}

export interface GlImageHooks {
  loadFile?: (path: string) => Uint8Array | null;
  bindTexture?: (texnum: number, tmu: number) => void;
  selectTexture?: (texture: number) => void;
  texEnv?: (tmu: number, mode: number) => void;
  setTextureFilter?: (texnum: number, minFilter: number, magFilter: number) => void;
  deleteTexture?: (texnum: number) => void;
  uploadScrapTexture?: (texnum: number, width: number, height: number, data: Uint8Array) => void;
  uploadImage?: (image: GlImage, source: GlImageUploadSource) => GlImageUploadResult | null;
  setSharedTexturePalette?: (paletteRgb: Uint8Array) => void;
  Con_Printf?: (printLevel: number, message: string) => void;
  Sys_Error?: (errLevel: number, message: string) => never;
}

export interface GlImageRuntime {
  gltextures: GlImage[];
  numgltextures: number;
  registration_sequence: number;
  gl_filter_min: number;
  gl_filter_max: number;
  gl_solid_format: number;
  gl_alpha_format: number;
  gl_tex_solid_format: number;
  gl_tex_alpha_format: number;
  intensity_value: number;
  vid_gamma_value: number;
  qglColorTableEXT: boolean;
  gl_ext_palettedtexture_value: boolean;
  gl_round_down_value: boolean;
  gl_picmip_value: number;
  gl_nobind_value: boolean;
  currenttextures: [number, number];
  currenttmu: number;
  inverse_intensity: number;
  d_16to8table: Uint8Array | null;
  d_8to24table: Uint32Array;
  intensitytable: Uint8Array;
  gammatable: Uint8Array;
  scrap_allocated: Int32Array[];
  scrap_texels: Uint8Array[];
  scrap_dirty: boolean;
  scrap_uploads: number;
  draw_chars: GlImage | null;
  r_notexture: GlImage | null;
  r_particletexture: GlImage | null;
  renderer_flags: number;
  hooks: GlImageHooks;
}

interface TextureModeRecord {
  name: string;
  minimize: number;
  maximize: number;
}

interface TextureFormatModeRecord {
  name: string;
  mode: number;
}

const modes: TextureModeRecord[] = [
  { name: "GL_NEAREST", minimize: GL_NEAREST, maximize: GL_NEAREST },
  { name: "GL_LINEAR", minimize: GL_LINEAR, maximize: GL_LINEAR },
  { name: "GL_NEAREST_MIPMAP_NEAREST", minimize: GL_NEAREST_MIPMAP_NEAREST, maximize: GL_NEAREST },
  { name: "GL_LINEAR_MIPMAP_NEAREST", minimize: GL_LINEAR_MIPMAP_NEAREST, maximize: GL_LINEAR },
  { name: "GL_NEAREST_MIPMAP_LINEAR", minimize: GL_NEAREST_MIPMAP_LINEAR, maximize: GL_NEAREST },
  { name: "GL_LINEAR_MIPMAP_LINEAR", minimize: GL_LINEAR_MIPMAP_LINEAR, maximize: GL_LINEAR }
];

const gl_alpha_modes: TextureFormatModeRecord[] = [
  { name: "default", mode: 4 },
  { name: "GL_RGBA", mode: GL_RGBA },
  { name: "GL_RGBA8", mode: GL_RGBA8 },
  { name: "GL_RGB5_A1", mode: GL_RGB5_A1 },
  { name: "GL_RGBA4", mode: GL_RGBA4 },
  { name: "GL_RGBA2", mode: GL_RGBA2 }
];

const gl_solid_modes: TextureFormatModeRecord[] = [
  { name: "default", mode: 3 },
  { name: "GL_RGB", mode: GL_RGB },
  { name: "GL_RGB8", mode: GL_RGB8 },
  { name: "GL_RGB5", mode: GL_RGB5 },
  { name: "GL_RGB4", mode: GL_RGB4 },
  { name: "GL_R3_G3_B2", mode: GL_R3_G3_B2 }
];

/**
 * Category: New
 * Purpose: Create the explicit runtime replacing the mutable `gl_image.c` globals.
 */
export function createGlImageRuntime(hooks: GlImageHooks = {}): GlImageRuntime {
  return {
    gltextures: Array.from({ length: MAX_GLTEXTURES }, () => createGlImage()),
    numgltextures: 0,
    registration_sequence: 0,
    gl_filter_min: GL_LINEAR_MIPMAP_NEAREST,
    gl_filter_max: GL_LINEAR,
    gl_solid_format: 3,
    gl_alpha_format: 4,
    gl_tex_solid_format: 3,
    gl_tex_alpha_format: 4,
    intensity_value: 2,
    vid_gamma_value: 1,
    qglColorTableEXT: false,
    gl_ext_palettedtexture_value: false,
    gl_round_down_value: false,
    gl_picmip_value: 0,
    gl_nobind_value: false,
    currenttextures: [0, 0],
    currenttmu: 0,
    inverse_intensity: 0.5,
    d_16to8table: null,
    d_8to24table: new Uint32Array(256),
    intensitytable: new Uint8Array(256),
    gammatable: new Uint8Array(256),
    scrap_allocated: Array.from({ length: MAX_SCRAPS }, () => new Int32Array(BLOCK_WIDTH)),
    scrap_texels: Array.from({ length: MAX_SCRAPS }, () => new Uint8Array(BLOCK_WIDTH * BLOCK_HEIGHT)),
    scrap_dirty: false,
    scrap_uploads: 0,
    draw_chars: null,
    r_notexture: null,
    r_particletexture: null,
    renderer_flags: 0,
    hooks
  };
}

/**
 * Category: New
 * Purpose: Create one empty image slot matching the `image_t` fields consumed by the renderer.
 */
export function createGlImage(overrides: Partial<GlImage> = {}): GlImage {
  return {
    name: "",
    type: imagetype_t.it_pic,
    width: 0,
    height: 0,
    upload_width: 0,
    upload_height: 0,
    registration_sequence: 0,
    texturechain: null,
    texnum: 0,
    sl: 0,
    tl: 0,
    sh: 1,
    th: 1,
    scrap: false,
    has_alpha: false,
    paletted: false,
    ...overrides
  };
}

export function setDrawCharsImage(runtime: GlImageRuntime, image: GlImage | null): void {
  runtime.draw_chars = image;
}

export function setRendererFlags(runtime: GlImageRuntime, flags: number): void {
  runtime.renderer_flags = flags;
}

export function setNoBindEnabled(runtime: GlImageRuntime, enabled: boolean): void {
  runtime.gl_nobind_value = enabled;
}

export function setPaletteExtensionState(runtime: GlImageRuntime, enabled: boolean, palettedTextureEnabled: boolean): void {
  runtime.qglColorTableEXT = enabled;
  runtime.gl_ext_palettedtexture_value = palettedTextureEnabled;
}

export function setRoundDownEnabled(runtime: GlImageRuntime, enabled: boolean): void {
  runtime.gl_round_down_value = enabled;
}

export function setPicmipValue(runtime: GlImageRuntime, value: number): void {
  runtime.gl_picmip_value = Math.max(0, Math.trunc(value));
}

export function setVidGammaValue(runtime: GlImageRuntime, value: number): void {
  runtime.vid_gamma_value = value;
}

export function setIntensityValue(runtime: GlImageRuntime, value: number): void {
  runtime.intensity_value = value;
}

export function setProtectedImages(runtime: GlImageRuntime, notexture: GlImage | null, particletexture: GlImage | null): void {
  runtime.r_notexture = notexture;
  runtime.r_particletexture = particletexture;
}

/**
 * Original name: GL_SetTexturePalette
 * Source: ref_gl/gl_image.c
 * Category: Ported
 * Fidelity level: Close
 */
export function GL_SetTexturePalette(runtime: GlImageRuntime, palette: Uint32Array | readonly number[]): void {
  const values = palette instanceof Uint32Array ? palette : Uint32Array.from(palette);
  const temptable = new Uint8Array(768);

  for (let i = 0; i < 256; i += 1) {
    const color = values[i] ?? 0;
    temptable[i * 3] = color & 0xff;
    temptable[i * 3 + 1] = (color >> 8) & 0xff;
    temptable[i * 3 + 2] = (color >> 16) & 0xff;
  }

  if (runtime.qglColorTableEXT && runtime.gl_ext_palettedtexture_value) {
    runtime.hooks.setSharedTexturePalette?.(temptable);
  }
}

/**
 * Original name: GL_EnableMultitexture
 * Source: ref_gl/gl_image.c
 * Category: Ported
 * Fidelity level: Close
 */
export function GL_EnableMultitexture(runtime: GlImageRuntime, enable: boolean): void {
  if (!runtime.qglColorTableEXT && !hasSelectTextureHook(runtime)) {
    return;
  }

  if (enable) {
    GL_SelectTexture(runtime, GL_TEXTURE1_SGIS);
    GL_TexEnv(runtime, GL_REPLACE);
  } else {
    GL_SelectTexture(runtime, GL_TEXTURE1_SGIS);
    GL_TexEnv(runtime, GL_REPLACE);
  }

  GL_SelectTexture(runtime, GL_TEXTURE0_SGIS);
  GL_TexEnv(runtime, GL_REPLACE);
}

/**
 * Original name: GL_SelectTexture
 * Source: ref_gl/gl_image.c
 * Category: Ported
 * Fidelity level: Close
 */
export function GL_SelectTexture(runtime: GlImageRuntime, texture: number): void {
  if (!hasSelectTextureHook(runtime)) {
    return;
  }

  const tmu = texture === GL_TEXTURE0_SGIS ? 0 : 1;
  if (tmu === runtime.currenttmu) {
    return;
  }

  runtime.currenttmu = tmu;
  runtime.hooks.selectTexture?.(texture);
}

/**
 * Original name: GL_TexEnv
 * Source: ref_gl/gl_image.c
 * Category: Ported
 * Fidelity level: Close
 */
export function GL_TexEnv(runtime: GlImageRuntime, mode: number): void {
  runtime.hooks.texEnv?.(runtime.currenttmu, mode);
}

/**
 * Original name: GL_Bind
 * Source: ref_gl/gl_image.c
 * Category: Ported
 * Fidelity level: Close
 */
export function GL_Bind(runtime: GlImageRuntime, texnum: number): void {
  if (runtime.gl_nobind_value && runtime.draw_chars) {
    texnum = runtime.draw_chars.texnum;
  }

  if (runtime.currenttextures[runtime.currenttmu] === texnum) {
    return;
  }

  runtime.currenttextures[runtime.currenttmu] = texnum;
  runtime.hooks.bindTexture?.(texnum, runtime.currenttmu);
}

/**
 * Original name: GL_MBind
 * Source: ref_gl/gl_image.c
 * Category: Ported
 * Fidelity level: Close
 */
export function GL_MBind(runtime: GlImageRuntime, target: number, texnum: number): void {
  GL_SelectTexture(runtime, target);
  const tmu = target === GL_TEXTURE0_SGIS ? 0 : 1;
  if (runtime.currenttextures[tmu] === texnum) {
    return;
  }

  GL_Bind(runtime, texnum);
}

/**
 * Original name: GL_TextureMode
 * Source: ref_gl/gl_image.c
 * Category: Ported
 * Fidelity level: Close
 */
export function GL_TextureMode(runtime: GlImageRuntime, string: string): void {
  const mode = modes.find((entry) => entry.name === string);
  if (!mode) {
    runtime.hooks.Con_Printf?.(PRINT_ALL, "bad filter name\n");
    return;
  }

  runtime.gl_filter_min = mode.minimize;
  runtime.gl_filter_max = mode.maximize;

  for (let i = 0; i < runtime.numgltextures; i += 1) {
    const image = runtime.gltextures[i];
    if (image.type === imagetype_t.it_pic || image.type === imagetype_t.it_sky || image.texnum <= 0) {
      continue;
    }

    GL_Bind(runtime, image.texnum);
    runtime.hooks.setTextureFilter?.(image.texnum, runtime.gl_filter_min, runtime.gl_filter_max);
  }
}

/**
 * Original name: GL_TextureAlphaMode
 * Source: ref_gl/gl_image.c
 * Category: Ported
 * Fidelity level: Close
 */
export function GL_TextureAlphaMode(runtime: GlImageRuntime, string: string): void {
  const mode = gl_alpha_modes.find((entry) => entry.name === string);
  if (!mode) {
    runtime.hooks.Con_Printf?.(PRINT_ALL, "bad alpha texture mode name\n");
    return;
  }

  runtime.gl_tex_alpha_format = mode.mode;
}

/**
 * Original name: GL_TextureSolidMode
 * Source: ref_gl/gl_image.c
 * Category: Ported
 * Fidelity level: Close
 */
export function GL_TextureSolidMode(runtime: GlImageRuntime, string: string): void {
  const mode = gl_solid_modes.find((entry) => entry.name === string);
  if (!mode) {
    runtime.hooks.Con_Printf?.(PRINT_ALL, "bad solid texture mode name\n");
    return;
  }

  runtime.gl_tex_solid_format = mode.mode;
}

/**
 * Original name: GL_ImageList_f
 * Source: ref_gl/gl_image.c
 * Category: Ported
 * Fidelity level: Close
 */
export function GL_ImageList_f(runtime: GlImageRuntime): void {
  const palstrings = ["RGB", "PAL"] as const;
  let texels = 0;

  runtime.hooks.Con_Printf?.(PRINT_ALL, "------------------\n");
  for (let i = 0; i < runtime.numgltextures; i += 1) {
    const image = runtime.gltextures[i];
    if (image.texnum <= 0) {
      continue;
    }

    texels += image.upload_width * image.upload_height;
    runtime.hooks.Con_Printf?.(
      PRINT_ALL,
      `${imageTypePrefix(image.type)} ${image.upload_width.toString().padStart(3, " ")} ${image.upload_height.toString().padStart(3, " ")} ${palstrings[image.paletted ? 1 : 0]}: ${image.name}\n`
    );
  }

  runtime.hooks.Con_Printf?.(PRINT_ALL, `Total texel count (not counting mipmaps): ${texels}\n`);
}

/**
 * Original name: Scrap_AllocBlock
 * Source: ref_gl/gl_image.c
 * Category: Ported
 * Fidelity level: Strict
 */
export function Scrap_AllocBlock(runtime: GlImageRuntime, w: number, h: number): { texnum: number; x: number; y: number } | null {
  for (let texnum = 0; texnum < MAX_SCRAPS; texnum += 1) {
    let best = BLOCK_HEIGHT;
    let bestX = 0;
    let bestY = 0;

    for (let i = 0; i < BLOCK_WIDTH - w; i += 1) {
      let best2 = 0;
      let j = 0;
      for (; j < w; j += 1) {
        if (runtime.scrap_allocated[texnum][i + j] >= best) {
          break;
        }
        if (runtime.scrap_allocated[texnum][i + j] > best2) {
          best2 = runtime.scrap_allocated[texnum][i + j];
        }
      }

      if (j === w) {
        bestX = i;
        bestY = best = best2;
      }
    }

    if (best + h > BLOCK_HEIGHT) {
      continue;
    }

    for (let i = 0; i < w; i += 1) {
      runtime.scrap_allocated[texnum][bestX + i] = best + h;
    }

    return { texnum, x: bestX, y: bestY };
  }

  return null;
}

/**
 * Original name: Scrap_Upload
 * Source: ref_gl/gl_image.c
 * Category: Ported
 * Fidelity level: Close
 */
export function Scrap_Upload(runtime: GlImageRuntime): void {
  runtime.scrap_uploads += 1;
  GL_Bind(runtime, TEXNUM_SCRAPS);
  runtime.hooks.uploadScrapTexture?.(TEXNUM_SCRAPS, BLOCK_WIDTH, BLOCK_HEIGHT, runtime.scrap_texels[0]);
  runtime.scrap_dirty = false;
}

/**
 * Original name: LoadPCX
 * Source: ref_gl/gl_image.c
 * Category: Ported
 * Fidelity level: Close
 */
export function LoadPCX(runtime: GlImageRuntime, filename: string): { pic: Uint8Array; palette: Uint8Array; width: number; height: number } | null {
  const bytes = runtime.hooks.loadFile?.(filename) ?? null;
  if (!bytes) {
    runtime.hooks.Con_Printf?.(PRINT_DEVELOPER, `Bad pcx file ${filename}\n`);
    return null;
  }

  try {
    const image = parsePcx(bytes, filename);
    return {
      pic: image.indices,
      palette: image.paletteRgb,
      width: image.width,
      height: image.height
    };
  } catch {
    runtime.hooks.Con_Printf?.(PRINT_ALL, `Bad pcx file ${filename}\n`);
    return null;
  }
}

/**
 * Original name: LoadTGA
 * Source: ref_gl/gl_image.c
 * Category: Ported
 * Fidelity level: Close
 */
export function LoadTGA(runtime: GlImageRuntime, name: string): { pic: Uint8Array; width: number; height: number } | null {
  const bytes = runtime.hooks.loadFile?.(name) ?? null;
  if (!bytes) {
    runtime.hooks.Con_Printf?.(PRINT_DEVELOPER, `Bad tga file ${name}\n`);
    return null;
  }

  try {
    const image = parseTga(bytes, name);
    return {
      pic: image.rgba,
      width: image.width,
      height: image.height
    };
  } catch (error) {
    failSysError(runtime, ERR_DROP, error instanceof Error ? error.message : `LoadTGA failed for ${name}`);
  }
}

/**
 * Original name: GL_LoadPic
 * Source: ref_gl/gl_image.c
 * Category: Ported
 * Fidelity level: Close
 */
export function GL_LoadPic(
  runtime: GlImageRuntime,
  name: string,
  pic: Uint8Array,
  width: number,
  height: number,
  type: imagetype_t,
  bits: 8 | 32
): GlImage {
  const image = allocateImageSlot(runtime);

  if (name.length >= MAX_QPATH) {
    failSysError(runtime, ERR_DROP, `Draw_LoadPic: "${name}" is too long`);
  }

  resetImage(image);
  image.name = name;
  image.registration_sequence = runtime.registration_sequence;
  image.width = width;
  image.height = height;
  image.type = type;

  if (image.type === imagetype_t.it_pic && bits === 8 && image.width < 64 && image.height < 64) {
    const allocation = Scrap_AllocBlock(runtime, image.width, image.height);
    if (allocation) {
      runtime.scrap_dirty = true;

      let k = 0;
      for (let i = 0; i < image.height; i += 1) {
        for (let j = 0; j < image.width; j += 1, k += 1) {
          runtime.scrap_texels[allocation.texnum][(allocation.y + i) * BLOCK_WIDTH + allocation.x + j] = pic[k];
        }
      }

      image.texnum = TEXNUM_SCRAPS + allocation.texnum;
      image.scrap = true;
      image.has_alpha = true;
      image.sl = (allocation.x + 0.01) / BLOCK_WIDTH;
      image.sh = (allocation.x + image.width - 0.01) / BLOCK_WIDTH;
      image.tl = (allocation.y + 0.01) / BLOCK_WIDTH;
      image.th = (allocation.y + image.height - 0.01) / BLOCK_WIDTH;
      image.upload_width = image.width;
      image.upload_height = image.height;
      image.paletted = false;
      return image;
    }
  }

  image.scrap = false;
  image.texnum = TEXNUM_IMAGES + runtime.gltextures.indexOf(image);
  GL_Bind(runtime, image.texnum);

  const uploadSource: GlImageUploadSource = {
    bits,
    pixels: bits === 8 ? pic : toUint32Pixels(pic),
    width,
    height,
    mipmap: image.type !== imagetype_t.it_pic && image.type !== imagetype_t.it_sky,
    is_sky: image.type === imagetype_t.it_sky
  };
  const upload = runtime.hooks.uploadImage?.(image, uploadSource) ?? defaultUploadImage(runtime, uploadSource);
  image.has_alpha = upload.has_alpha;
  image.upload_width = upload.upload_width;
  image.upload_height = upload.upload_height;
  image.paletted = upload.paletted;
  image.sl = 0;
  image.sh = 1;
  image.tl = 0;
  image.th = 1;

  return image;
}

/**
 * Original name: GL_LoadWal
 * Source: ref_gl/gl_image.c
 * Category: Ported
 * Fidelity level: Close
 */
export function GL_LoadWal(runtime: GlImageRuntime, name: string): GlImage | null {
  const bytes = runtime.hooks.loadFile?.(name) ?? null;
  if (!bytes) {
    runtime.hooks.Con_Printf?.(PRINT_ALL, `GL_FindImage: can't load ${name}\n`);
    return runtime.r_notexture;
  }

  const wal = parseWal(bytes, name);
  return GL_LoadPic(runtime, name, wal.mipmaps[0], wal.header.width, wal.header.height, imagetype_t.it_wall, 8);
}

/**
 * Original name: GL_FindImage
 * Source: ref_gl/gl_image.c
 * Category: Ported
 * Fidelity level: Close
 */
export function GL_FindImage(runtime: GlImageRuntime, name: string | null, type: imagetype_t): GlImage | null {
  if (!name) {
    return null;
  }

  if (name.length < 5) {
    return null;
  }

  for (let i = 0; i < runtime.numgltextures; i += 1) {
    const image = runtime.gltextures[i];
    if (image.name === name) {
      image.registration_sequence = runtime.registration_sequence;
      return image;
    }
  }

  if (name.endsWith(".pcx")) {
    const loaded = LoadPCX(runtime, name);
    if (!loaded) {
      return null;
    }
    return GL_LoadPic(runtime, name, loaded.pic, loaded.width, loaded.height, type, 8);
  }

  if (name.endsWith(".wal")) {
    return GL_LoadWal(runtime, name);
  }

  if (name.endsWith(".tga")) {
    const loaded = LoadTGA(runtime, name);
    if (!loaded) {
      return null;
    }
    return GL_LoadPic(runtime, name, loaded.pic, loaded.width, loaded.height, type, 32);
  }

  return null;
}

/**
 * Original name: R_RegisterSkin
 * Source: ref_gl/gl_image.c
 * Category: Ported
 * Fidelity level: Strict
 */
export function R_RegisterSkin(runtime: GlImageRuntime, name: string): GlImage | null {
  return GL_FindImage(runtime, name, imagetype_t.it_skin);
}

/**
 * Original name: GL_FreeUnusedImages
 * Source: ref_gl/gl_image.c
 * Category: Ported
 * Fidelity level: Close
 */
export function GL_FreeUnusedImages(runtime: GlImageRuntime): void {
  if (runtime.r_notexture) {
    runtime.r_notexture.registration_sequence = runtime.registration_sequence;
  }
  if (runtime.r_particletexture) {
    runtime.r_particletexture.registration_sequence = runtime.registration_sequence;
  }

  for (let i = 0; i < runtime.numgltextures; i += 1) {
    const image = runtime.gltextures[i];
    if (image.registration_sequence === runtime.registration_sequence) {
      continue;
    }
    if (!image.registration_sequence) {
      continue;
    }
    if (image.type === imagetype_t.it_pic) {
      continue;
    }

    if (image.texnum > 0) {
      runtime.hooks.deleteTexture?.(image.texnum);
    }
    resetImage(image);
  }
}

/**
 * Original name: Draw_GetPalette
 * Source: ref_gl/gl_image.c
 * Category: Ported
 * Fidelity level: Close
 */
export function Draw_GetPalette(runtime: GlImageRuntime): number {
  const loaded = LoadPCX(runtime, "pics/colormap.pcx");
  if (!loaded?.palette) {
    failSysError(runtime, ERR_FATAL, "Couldn't load pics/colormap.pcx");
  }

  for (let i = 0; i < 256; i += 1) {
    const r = loaded.palette[i * 3] ?? 0;
    const g = loaded.palette[i * 3 + 1] ?? 0;
    const b = loaded.palette[i * 3 + 2] ?? 0;
    runtime.d_8to24table[i] = (((255 << 24) >>> 0) + (r << 0) + (g << 8) + (b << 16)) >>> 0;
  }

  runtime.d_8to24table[255] &= 0x00ffffff;
  return 0;
}

/**
 * Original name: GL_InitImages
 * Source: ref_gl/gl_image.c
 * Category: Ported
 * Fidelity level: Close
 */
export function GL_InitImages(runtime: GlImageRuntime): void {
  runtime.registration_sequence = 1;

  if (runtime.intensity_value <= 1) {
    runtime.intensity_value = 1;
  }

  runtime.inverse_intensity = 1 / runtime.intensity_value;
  Draw_GetPalette(runtime);

  if (runtime.qglColorTableEXT) {
    runtime.d_16to8table = runtime.hooks.loadFile?.("pics/16to8.dat") ?? null;
    if (!runtime.d_16to8table) {
      failSysError(runtime, ERR_FATAL, "Couldn't load pics/16to8.pcx");
    }
  }

  let g = runtime.vid_gamma_value;
  if ((runtime.renderer_flags & (GL_RENDERER_VOODOO | GL_RENDERER_VOODOO2)) !== 0) {
    g = 1.0;
  }

  for (let i = 0; i < 256; i += 1) {
    if (g === 1) {
      runtime.gammatable[i] = i;
    } else {
      let inf = 255 * Math.pow((i + 0.5) / 255.5, g) + 0.5;
      if (inf < 0) {
        inf = 0;
      }
      if (inf > 255) {
        inf = 255;
      }
      runtime.gammatable[i] = inf;
    }
  }

  for (let i = 0; i < 256; i += 1) {
    let j = Math.trunc(i * runtime.intensity_value);
    if (j > 255) {
      j = 255;
    }
    runtime.intensitytable[i] = j;
  }
}

/**
 * Original name: GL_ShutdownImages
 * Source: ref_gl/gl_image.c
 * Category: Ported
 * Fidelity level: Close
 */
export function GL_ShutdownImages(runtime: GlImageRuntime): void {
  for (let i = 0; i < runtime.numgltextures; i += 1) {
    const image = runtime.gltextures[i];
    if (!image.registration_sequence) {
      continue;
    }
    if (image.texnum > 0) {
      runtime.hooks.deleteTexture?.(image.texnum);
    }
    resetImage(image);
  }
}

function allocateImageSlot(runtime: GlImageRuntime): GlImage {
  for (let i = 0; i < runtime.numgltextures; i += 1) {
    const image = runtime.gltextures[i];
    if (!image.texnum) {
      return image;
    }
  }

  if (runtime.numgltextures === MAX_GLTEXTURES) {
    failSysError(runtime, ERR_DROP, "MAX_GLTEXTURES");
  }

  const image = runtime.gltextures[runtime.numgltextures];
  runtime.numgltextures += 1;
  return image;
}

function resetImage(image: GlImage): void {
  image.name = "";
  image.type = imagetype_t.it_pic;
  image.width = 0;
  image.height = 0;
  image.upload_width = 0;
  image.upload_height = 0;
  image.registration_sequence = 0;
  image.texturechain = null;
  image.texnum = 0;
  image.sl = 0;
  image.tl = 0;
  image.sh = 1;
  image.th = 1;
  image.scrap = false;
  image.has_alpha = false;
  image.paletted = false;
}

function imageTypePrefix(type: imagetype_t): string {
  switch (type) {
    case imagetype_t.it_skin:
      return "M";
    case imagetype_t.it_sprite:
      return "S";
    case imagetype_t.it_wall:
      return "W";
    case imagetype_t.it_pic:
      return "P";
    default:
      return " ";
  }
}

function defaultUploadImage(runtime: GlImageRuntime, source: GlImageUploadSource): GlImageUploadResult {
  const uploadSize = calculateUploadSize(runtime, source.width, source.height, source.mipmap);
  let has_alpha = false;

  if (source.bits === 8) {
    const pixels = source.pixels as Uint8Array;
    has_alpha = pixels.includes(255);
  } else {
    const pixels = source.pixels as Uint32Array;
    has_alpha = pixels.some((value) => ((value >>> 24) & 0xff) !== 255);
  }

  const paletted = runtime.qglColorTableEXT && runtime.gl_ext_palettedtexture_value && source.is_sky;
  return {
    upload_width: uploadSize.width,
    upload_height: uploadSize.height,
    has_alpha,
    paletted
  };
}

function calculateUploadSize(runtime: GlImageRuntime, width: number, height: number, mipmap: boolean): { width: number; height: number } {
  let scaled_width = nextPowerOfTwo(width);
  let scaled_height = nextPowerOfTwo(height);

  if (runtime.gl_round_down_value && scaled_width > width && mipmap) {
    scaled_width >>= 1;
  }
  if (runtime.gl_round_down_value && scaled_height > height && mipmap) {
    scaled_height >>= 1;
  }

  if (mipmap) {
    scaled_width >>= runtime.gl_picmip_value;
    scaled_height >>= runtime.gl_picmip_value;
  }

  if (scaled_width > 256) {
    scaled_width = 256;
  }
  if (scaled_height > 256) {
    scaled_height = 256;
  }

  return {
    width: Math.max(1, scaled_width),
    height: Math.max(1, scaled_height)
  };
}

function nextPowerOfTwo(value: number): number {
  let size = 1;
  while (size < value) {
    size <<= 1;
  }
  return size;
}

function hasSelectTextureHook(runtime: GlImageRuntime): boolean {
  return typeof runtime.hooks.selectTexture === "function";
}

function toUint32Pixels(pixels: Uint8Array): Uint32Array {
  const source = pixels.byteOffset === 0 && pixels.byteLength % 4 === 0
    ? pixels
    : pixels.slice();
  return new Uint32Array(source.buffer, source.byteOffset, source.byteLength >> 2);
}

function failSysError(runtime: GlImageRuntime, errLevel: number, message: string): never {
  if (runtime.hooks.Sys_Error) {
    return runtime.hooks.Sys_Error(errLevel, message);
  }

  throw new Error(message);
}
