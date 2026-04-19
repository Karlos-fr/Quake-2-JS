/**
 * File: pak.ts
 * Source: Quake II original / qcommon/qfiles.h and qcommon/files.c
 * Purpose: Parse Quake II PAK archives and expose their directory entries.
 *
 * Porting policy:
 * - Preserve original behavior first.
 * - Preserve original names whenever possible.
 * - Avoid structural refactors unless documented.
 *
 * Deviations:
 * - Parses from Uint8Array buffers instead of FILE pointers.
 * - Uses immutable archive metadata objects for safer web/runtime integration.
 *
 * Notes:
 * - This file is intended to stay close to the original PAK format declarations.
 */

import { getLittleLong } from "../../memory/src/binary-io.js";

export const IDPAKHEADER = (("K".charCodeAt(0) << 24) + ("C".charCodeAt(0) << 16) + ("A".charCodeAt(0) << 8) + "P".charCodeAt(0)) | 0;
export const MAX_FILES_IN_PACK = 4096;
const DPACKFILE_SIZE = 64;
const DPACKHEADER_SIZE = 12;
const DPACKFILENAME_SIZE = 56;

/**
 * Original name: packfile_t
 * Source: qcommon/files.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Describes a file entry contained in a Quake II PAK archive.
 *
 * Porting notes:
 * - Adds `normalizedName` to simplify case-insensitive search path behavior.
 */
export interface PakEntry {
  name: string;
  normalizedName: string;
  filepos: number;
  filelen: number;
}

/**
 * Category: New
 * Purpose: Represent a parsed Quake II PAK archive with raw bytes and indexed directory entries.
 *
 * Constraints:
 * - Must keep a direct link to the raw archive bytes for future streaming and slicing.
 */
export interface PakArchive {
  entries: PakEntry[];
  bytes: Uint8Array;
  path?: string;
}

/**
 * Original name: FS_LoadPackFile
 * Source: qcommon/files.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Validates and parses the header and directory of a Quake II PAK file.
 *
 * Porting notes:
 * - Omits checksum validation for now.
 * - Returns a parsed archive object instead of allocating Quake zone memory.
 */
export function parsePak(bytes: Uint8Array, path?: string): PakArchive {
  if (bytes.byteLength < DPACKHEADER_SIZE) {
    throw new Error("parsePak: buffer is too small to contain a PAK header");
  }

  const ident = getLittleLong(bytes, 0);
  if (ident !== IDPAKHEADER) {
    throw new Error(`${path ?? "pak"} is not a packfile`);
  }

  const dirofs = getLittleLong(bytes, 4);
  const dirlen = getLittleLong(bytes, 8);
  const numpackfiles = dirlen / DPACKFILE_SIZE;

  if (!Number.isInteger(numpackfiles)) {
    throw new Error(`${path ?? "pak"} has an invalid directory length`);
  }

  if (numpackfiles > MAX_FILES_IN_PACK) {
    throw new Error(`${path ?? "pak"} has ${numpackfiles} files`);
  }

  if (dirofs < 0 || dirlen < 0 || dirofs + dirlen > bytes.byteLength) {
    throw new Error(`${path ?? "pak"} has a directory outside the file bounds`);
  }

  const entries: PakEntry[] = [];

  for (let index = 0; index < numpackfiles; index += 1) {
    const entryOffset = dirofs + index * DPACKFILE_SIZE;
    const name = decodePakName(bytes.subarray(entryOffset, entryOffset + DPACKFILENAME_SIZE));
    const filepos = getLittleLong(bytes, entryOffset + DPACKFILENAME_SIZE);
    const filelen = getLittleLong(bytes, entryOffset + DPACKFILENAME_SIZE + 4);

    if (filepos < 0 || filelen < 0 || filepos + filelen > bytes.byteLength) {
      throw new Error(`${path ?? "pak"} contains an out-of-bounds entry: ${name}`);
    }

    entries.push({
      name,
      normalizedName: normalizePakPath(name),
      filepos,
      filelen
    });
  }

  return path === undefined
    ? {
        entries,
        bytes
      }
    : {
        entries,
        bytes,
        path
      };
}

/**
 * Category: New
 * Purpose: Find a PAK entry using Quake-like case-insensitive path matching.
 *
 * Constraints:
 * - Must normalize slashes and case before comparing names.
 */
export function findPakEntry(archive: PakArchive, filename: string): PakEntry | undefined {
  const normalizedName = normalizePakPath(filename);
  return archive.entries.find((entry) => entry.normalizedName === normalizedName);
}

/**
 * Category: New
 * Purpose: Read the raw byte content of a parsed PAK entry.
 *
 * Constraints:
 * - Must return an exact byte slice for the entry range.
 */
export function readPakEntryData(archive: PakArchive, entry: PakEntry): Uint8Array {
  return archive.bytes.slice(entry.filepos, entry.filepos + entry.filelen);
}

/**
 * Category: New
 * Purpose: Decode the fixed-width null-terminated PAK entry name field.
 *
 * Constraints:
 * - Must stop at the first zero byte.
 */
function decodePakName(bytes: Uint8Array): string {
  let end = bytes.indexOf(0);
  if (end === -1) {
    end = bytes.length;
  }

  let result = "";
  for (let index = 0; index < end; index += 1) {
    result += String.fromCharCode(bytes[index]);
  }

  return result;
}

/**
 * Category: New
 * Purpose: Normalize PAK lookup paths so search behavior matches Quake II case-insensitive comparisons.
 *
 * Constraints:
 * - Must normalize slash direction and lowercase the result.
 */
function normalizePakPath(value: string): string {
  return value.replaceAll("\\", "/").toLowerCase();
}
