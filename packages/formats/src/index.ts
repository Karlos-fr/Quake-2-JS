/**
 * File: index.ts
 * Purpose: Expose Quake II binary format parsers.
 *
 * This file is not a direct source port.
 * It is a package entry point for binary format modules.
 *
 * Dependencies:
 * - packages/formats/src/pak.ts
 */

export {
  BSPVERSION,
  HEADER_LUMPS,
  IDBSPHEADER,
  LUMP_AREAPORTALS,
  LUMP_AREAS,
  LUMP_BRUSHES,
  LUMP_BRUSHSIDES,
  LUMP_EDGES,
  LUMP_ENTITIES,
  LUMP_FACES,
  LUMP_LEAFBRUSHES,
  LUMP_LEAFFACES,
  LUMP_LEAFS,
  LUMP_LIGHTING,
  LUMP_MODELS,
  LUMP_NODES,
  LUMP_PLANES,
  LUMP_POP,
  LUMP_SURFEDGES,
  LUMP_TEXINFO,
  LUMP_VERTEXES,
  LUMP_VISIBILITY,
  findEntitiesByClassname,
  getEntityOrigin,
  getEntityYaw,
  findPrimarySpawnPoint,
  parseEntityLump,
  parseBsp
} from "./bsp.js";

export {
  IDPAKHEADER,
  MAX_FILES_IN_PACK,
  findPakEntry,
  parsePak,
  readPakEntryData
} from "./pak.js";

export { parsePcx } from "./pcx.js";
export { parseTga } from "./tga.js";
export { ALIAS_VERSION, IDALIASHEADER, parseMd2 } from "./md2.js";
export { parseWal } from "./wal.js";

export type {
  BspMap,
  BspEntity,
  BspSpawnPoint,
  darea_t,
  dareaportal_t,
  dbrush_t,
  dbrushside_t,
  dedge_t,
  dface_t,
  dheader_t,
  dleaf_t,
  dmodel_t,
  dnode_t,
  dplane_t,
  dvertex_t,
  lump_t,
  texinfo_t
} from "./bsp.js";
export type { PakArchive, PakEntry } from "./pak.js";
export type { daliasframe_t, dmdl_t, dstvert_t, dtriangle_t, dtrivertx_t, Md2Model } from "./md2.js";
export type { PcxImage, pcx_t } from "./pcx.js";
export type { TargaHeader, TgaImage } from "./tga.js";
export type { miptex_t, WalTexture } from "./wal.js";
