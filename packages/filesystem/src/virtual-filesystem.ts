/**
 * File: virtual-filesystem.ts
 * Source: Quake II original / qcommon/files.c
 * Purpose: Port the Quake II virtual filesystem search path logic over mounted in-memory directories and PAK archives.
 *
 * Porting policy:
 * - Preserve original behavior first.
 * - Preserve original names whenever possible.
 * - Avoid structural refactors unless documented.
 *
 * Deviations:
 * - Uses in-memory mounted directories instead of direct host filesystem access.
 * - Exposes listing helpers as return values instead of printing directly.
 *
 * Notes:
 * - This file is intended to stay conceptually close to the original C source.
 */

import { findPakEntry, parsePak, readPakEntryData } from "../../formats/src/pak.js";
import type { PakArchive, PakEntry } from "../../formats/src/pak.js";

/**
 * Category: New
 * Purpose: Represent one mounted in-memory directory searched by the virtual filesystem.
 *
 * Constraints:
 * - File lookups must remain case-insensitive and slash-normalized.
 */
export interface MountedDirectory {
  path: string;
  files: Map<string, MountedDirectoryFile>;
}

/**
 * Category: New
 * Purpose: Preserve one mounted loose file and its original logical path.
 *
 * Constraints:
 * - Must keep the original path for listing and diagnostics.
 */
export interface MountedDirectoryFile {
  path: string;
  bytes: Uint8Array;
}

/**
 * Category: New
 * Purpose: Represent a mounted PAK in virtual search path order.
 *
 * Constraints:
 * - Later mounts must take precedence over earlier mounts.
 */
export interface MountedPak {
  archive: PakArchive;
}

/**
 * Category: New
 * Purpose: Represent one `link` entry from the original Quake II filesystem.
 *
 * Constraints:
 * - Prefix matching must be case-insensitive after normalization.
 */
export interface FileLink {
  from: string;
  fromlength: number;
  to: string;
}

/**
 * Category: New
 * Purpose: Track one Quake II search path entry, either a directory or a PAK archive.
 *
 * Constraints:
 * - Search order must match list order, with the first entry taking precedence.
 */
export interface SearchPath {
  filename: string;
  pack?: MountedPak;
  directory?: MountedDirectory;
}

/**
 * Category: New
 * Purpose: Describe a resolved file inside the virtual filesystem.
 *
 * Constraints:
 * - Must preserve the resolved search path source for future tooling and diagnostics.
 */
export interface MountedVirtualFile {
  search: SearchPath;
  pak?: MountedPak;
  entry?: PakEntry;
  path: string;
  bytes: Uint8Array;
}

/**
 * Category: New
 * Purpose: Store mounted search paths for future Quake II filesystem lookups.
 *
 * Constraints:
 * - Search order must mimic Quake II override behavior.
 */
export interface VirtualFilesystem {
  packs: MountedPak[];
  searchPaths: SearchPath[];
  fs_links: FileLink[];
  fs_gamedir: string;
  fs_base_searchpaths: SearchPath[];
}

/**
 * Category: New
 * Purpose: Describe one initial mounted file passed while creating or mounting a directory.
 *
 * Constraints:
 * - File keys are logical Quake paths relative to the mounted directory.
 */
export type MountedDirectoryInput = Record<string, Uint8Array> | Iterable<[string, Uint8Array]>;

/**
 * Category: New
 * Purpose: Create an empty virtual filesystem.
 *
 * Constraints:
 * - Mount order must be preserved after creation.
 */
export function createVirtualFilesystem(initialGameDir = "baseq2"): VirtualFilesystem {
  return {
    packs: [],
    searchPaths: [],
    fs_links: [],
    fs_gamedir: normalizeDirectoryPath(initialGameDir),
    fs_base_searchpaths: []
  };
}

/**
 * Original name: FS_AddGameDirectory
 * Source: qcommon/files.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Adds one directory search path at the head of the filesystem and updates `fs_gamedir`.
 *
 * Porting notes:
 * - Uses in-memory mounted directory contents instead of scanning the host filesystem.
 */
export function mountDirectory(
  filesystem: VirtualFilesystem,
  path: string,
  files?: MountedDirectoryInput
): MountedDirectory {
  const directory = createMountedDirectory(path, files);
  const search: SearchPath = {
    filename: directory.path,
    directory
  };

  filesystem.fs_gamedir = directory.path;
  filesystem.searchPaths.unshift(search);
  return directory;
}

/**
 * Original name: FS_LoadPackFile
 * Source: qcommon/files.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Mounts one parsed PAK archive into the search path.
 *
 * Porting notes:
 * - Parses directly from a byte array instead of reopening the pack on disk.
 */
export function mountPak(filesystem: VirtualFilesystem, bytes: Uint8Array, path?: string): MountedPak {
  const pak = {
    archive: parsePak(bytes, path)
  };

  const search: SearchPath = {
    filename: path ?? "<memory-pak>",
    pack: pak
  };

  filesystem.packs.unshift(pak);
  filesystem.searchPaths.unshift(search);
  return pak;
}

/**
 * Original name: FS_Link_f
 * Source: qcommon/files.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Adds, replaces or removes one prefix link entry.
 *
 * Porting notes:
 * - Accepts normalized string arguments directly instead of reading command argv.
 */
export function FS_Link(filesystem: VirtualFilesystem, from: string, to: string): void {
  const normalizedFrom = normalizeVirtualPath(from);
  const existing = filesystem.fs_links.find((link) => link.from === normalizedFrom);

  if (existing) {
    if (to.length === 0) {
      filesystem.fs_links = filesystem.fs_links.filter((link) => link !== existing);
      return;
    }

    existing.to = normalizeDirectoryPath(to);
    return;
  }

  filesystem.fs_links.unshift({
    from: normalizedFrom,
    fromlength: normalizedFrom.length,
    to: normalizeDirectoryPath(to)
  });
}

/**
 * Original name: FS_SetGamedir
 * Source: qcommon/files.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Switches the logical game directory used by future writes and directory enumeration.
 *
 * Porting notes:
 * - Updates only the in-memory logical state for now.
 * - Rejects path-like values using the same safety checks as the original code.
 */
export function FS_SetGamedir(filesystem: VirtualFilesystem, dir: string): boolean {
  if (dir.includes("..") || dir.includes("/") || dir.includes("\\") || dir.includes(":")) {
    return false;
  }

  filesystem.fs_gamedir = normalizeDirectoryPath(dir);
  return true;
}

/**
 * Original name: FS_Gamedir
 * Source: qcommon/files.c
 * Category: Ported
 * Fidelity level: Strict
 *
 * Behavior:
 * - Returns the current logical game directory.
 *
 * Porting notes:
 * - Reads from the explicit filesystem object instead of file-static globals.
 */
export function FS_Gamedir(filesystem: VirtualFilesystem): string {
  return filesystem.fs_gamedir;
}

/**
 * Category: New
 * Purpose: Mark the current search paths as the base search path set retained across gamedir changes.
 *
 * Constraints:
 * - Must snapshot the current logical search path objects by reference order.
 */
export function markBaseSearchPaths(filesystem: VirtualFilesystem): void {
  filesystem.fs_base_searchpaths = [...filesystem.searchPaths];
}

/**
 * Original name: FS_FOpenFile
 * Source: qcommon/files.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Resolves one file through links, mounted directories and mounted PAK archives in search order.
 *
 * Porting notes:
 * - Returns an in-memory file descriptor object instead of an open FILE pointer.
 */
export function readMountedFile(filesystem: VirtualFilesystem, filename: string): MountedVirtualFile | undefined {
  const normalizedFilename = normalizeVirtualPath(filename);
  const linked = resolveLinkedFilename(filesystem, normalizedFilename);

  if (linked) {
    const linkedFile = readDirectoryLinkedFile(filesystem, linked);
    if (linkedFile) {
      return linkedFile;
    }
  }

  for (const search of filesystem.searchPaths) {
    if (search.pack) {
      const entry = findPakEntry(search.pack.archive, normalizedFilename);
      if (!entry) {
        continue;
      }

      return {
        search,
        pak: search.pack,
        entry,
        path: entry.name,
        bytes: readPakEntryData(search.pack.archive, entry)
      };
    }

    if (!search.directory) {
      continue;
    }

    const resolvedDirectoryFile = search.directory.files.get(normalizedFilename);
    if (!resolvedDirectoryFile) {
      continue;
    }

    return {
      search,
      path: resolvedDirectoryFile.path,
      bytes: resolvedDirectoryFile.bytes
    };
  }

  return undefined;
}

/**
 * Original name: FS_LoadFile
 * Source: qcommon/files.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Loads one file fully into memory from the current search paths.
 *
 * Porting notes:
 * - Reuses the already in-memory mounted file payload.
 */
export function FS_LoadFile(filesystem: VirtualFilesystem, path: string): Uint8Array | undefined {
  return readMountedFile(filesystem, path)?.bytes;
}

/**
 * Category: New
 * Purpose: Read a mounted file as an ASCII-style text string suitable for Quake config scripts.
 *
 * Constraints:
 * - Must preserve low 8-bit byte values when decoding.
 */
export function readMountedTextFile(filesystem: VirtualFilesystem, filename: string): string | undefined {
  const file = readMountedFile(filesystem, filename);
  if (!file) {
    return undefined;
  }

  return decodeTextBytes(file.bytes);
}

/**
 * Original name: FS_Path_f
 * Source: qcommon/files.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Lists the current search path and filesystem links.
 *
 * Porting notes:
 * - Returns formatted output lines instead of printing directly.
 */
export function FS_Path_f(filesystem: VirtualFilesystem): string[] {
  const lines: string[] = ["Current search path:"];

  for (const search of filesystem.searchPaths) {
    if (filesystem.fs_base_searchpaths.includes(search)) {
      lines.push("----------");
    }

    if (search.pack) {
      lines.push(`${search.pack.archive.path ?? search.filename} (${search.pack.archive.entries.length} files)`);
      continue;
    }

    lines.push(search.filename);
  }

  lines.push("");
  lines.push("Links:");

  for (const link of filesystem.fs_links) {
    lines.push(`${link.from} : ${link.to}`);
  }

  return lines;
}

/**
 * Original name: FS_NextPath
 * Source: qcommon/files.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Iterates mounted directory paths, starting with the current gamedir.
 *
 * Porting notes:
 * - Skips PAK search paths exactly like the original helper.
 */
export function FS_NextPath(filesystem: VirtualFilesystem, prevpath: string | null): string | null {
  if (prevpath === null) {
    return filesystem.fs_gamedir;
  }

  let previous = filesystem.fs_gamedir;
  for (const search of filesystem.searchPaths) {
    if (search.pack) {
      continue;
    }

    if (prevpath === previous && search.filename !== prevpath) {
      return search.filename;
    }

    previous = search.filename;
  }

  return null;
}

/**
 * Original name: FS_ListFiles
 * Source: qcommon/files.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Lists visible loose files matching one Quake-style wildcard.
 *
 * Porting notes:
 * - Operates on mounted in-memory directories only.
 * - Deduplicates filenames across search paths by normalized result path.
 */
export function FS_ListFiles(filesystem: VirtualFilesystem, findname: string): string[] {
  const normalizedPattern = normalizeVirtualPath(findname);
  const matches = new Set<string>();

  for (const search of filesystem.searchPaths) {
    if (!search.directory) {
      continue;
    }

    for (const directoryFile of search.directory.files.values()) {
      const candidate = `${search.directory.path}/${normalizeVirtualPath(directoryFile.path)}`;
      if (wildcardMatches(candidate, normalizedPattern)) {
        matches.add(candidate);
      }
    }
  }

  return [...matches].sort();
}

/**
 * Original name: FS_Dir_f
 * Source: qcommon/files.c
 * Category: Ported
 * Fidelity level: Close
 *
 * Behavior:
 * - Lists matching files for each mounted directory path.
 *
 * Porting notes:
 * - Returns output lines instead of printing directly.
 */
export function FS_Dir_f(filesystem: VirtualFilesystem, wildcard = "*.*"): string[] {
  const lines: string[] = [];
  let path: string | null = null;

  while ((path = FS_NextPath(filesystem, path)) !== null) {
    const findname = `${normalizeDirectoryPath(path)}/${normalizeVirtualPath(wildcard)}`;
    lines.push(`Directory of ${findname}`);
    lines.push("----");

    const dirnames = FS_ListFiles(filesystem, findname);
    for (const dirname of dirnames) {
      const slashIndex = dirname.lastIndexOf("/");
      lines.push(slashIndex >= 0 ? dirname.slice(slashIndex + 1) : dirname);
    }

    lines.push("");
  }

  return lines;
}

/**
 * Category: New
 * Purpose: Decode low 8-bit file bytes into a JavaScript string without UTF-8 reinterpretation.
 *
 * Constraints:
 * - Must preserve one byte to one code unit semantics.
 */
function decodeTextBytes(bytes: Uint8Array): string {
  let result = "";

  for (let index = 0; index < bytes.length; index += 1) {
    result += String.fromCharCode(bytes[index]);
  }

  return result;
}

/**
 * Category: New
 * Purpose: Build one mounted in-memory directory with normalized file lookup keys.
 *
 * Constraints:
 * - Must preserve the original logical file paths for later listings.
 */
function createMountedDirectory(path: string, files?: MountedDirectoryInput): MountedDirectory {
  const mountedFiles = new Map<string, MountedDirectoryFile>();

  if (files) {
    const entries = Symbol.iterator in Object(files) ? files as Iterable<[string, Uint8Array]> : Object.entries(files);
    for (const [filePath, bytes] of entries) {
      mountedFiles.set(normalizeVirtualPath(filePath), {
        path: normalizeVirtualPath(filePath),
        bytes
      });
    }
  }

  return {
    path: normalizeDirectoryPath(path),
    files: mountedFiles
  };
}

/**
 * Category: New
 * Purpose: Resolve the original Quake II filesystem link prefixes before normal search path iteration.
 *
 * Constraints:
 * - Must perform prefix matching on normalized paths.
 */
function resolveLinkedFilename(filesystem: VirtualFilesystem, filename: string): string | null {
  for (const link of filesystem.fs_links) {
    if (!filename.startsWith(link.from)) {
      continue;
    }

    return `${link.to}/${filename.slice(link.fromlength)}`.replaceAll("//", "/");
  }

  return null;
}

/**
 * Category: New
 * Purpose: Resolve a linked file against mounted in-memory directories.
 *
 * Constraints:
 * - Must only match mounted directory roots because host IO is intentionally absent.
 */
function readDirectoryLinkedFile(filesystem: VirtualFilesystem, linkedFilename: string): MountedVirtualFile | undefined {
  const normalizedLinkedFilename = normalizeVirtualPath(linkedFilename);

  for (const search of filesystem.searchPaths) {
    if (!search.directory) {
      continue;
    }

    const normalizedRoot = normalizeDirectoryPath(search.directory.path);
    if (!normalizedLinkedFilename.startsWith(`${normalizedRoot}/`)) {
      continue;
    }

    const relativePath = normalizedLinkedFilename.slice(normalizedRoot.length + 1);
    const file = search.directory.files.get(relativePath);
    if (!file) {
      continue;
    }

    return {
      search,
      path: file.path,
      bytes: file.bytes
    };
  }

  return undefined;
}

/**
 * Category: New
 * Purpose: Normalize a Quake virtual file path to forward slashes and lowercase for lookups.
 *
 * Constraints:
 * - Must preserve relative path semantics.
 */
function normalizeVirtualPath(value: string): string {
  return value.replaceAll("\\", "/").replaceAll("//", "/").replace(/^\.\/+/, "").toLowerCase();
}

/**
 * Category: New
 * Purpose: Normalize one mounted directory path while preserving directory-like separators.
 *
 * Constraints:
 * - Must trim trailing slashes except for root-like single slash values.
 */
function normalizeDirectoryPath(value: string): string {
  const normalized = normalizeVirtualPath(value);
  if (normalized.length <= 1) {
    return normalized;
  }

  return normalized.endsWith("/") ? normalized.slice(0, -1) : normalized;
}

/**
 * Category: New
 * Purpose: Match one path against a Quake-style `*` and `?` wildcard pattern.
 *
 * Constraints:
 * - Must remain case-insensitive after normalization.
 */
function wildcardMatches(value: string, pattern: string): boolean {
  const escapedPattern = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  const regexPattern = `^${escapedPattern.replaceAll("*", ".*").replaceAll("?", ".")}$`;
  return new RegExp(regexPattern, "i").test(value);
}
