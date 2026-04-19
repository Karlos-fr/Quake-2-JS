/**
 * File: index.ts
 * Purpose: Expose the Quake II virtual filesystem helpers used to mount and query pack archives.
 *
 * This file is not a direct source port.
 * It is a package entry point for filesystem modules.
 *
 * Dependencies:
 * - packages/filesystem/src/virtual-filesystem.ts
 */

export {
  createVirtualFilesystem,
  FS_Dir_f,
  FS_Gamedir,
  FS_Link,
  FS_ListFiles,
  FS_LoadFile,
  FS_NextPath,
  FS_Path_f,
  FS_SetGamedir,
  markBaseSearchPaths,
  mountDirectory,
  mountPak,
  readMountedFile,
  readMountedTextFile
} from "./virtual-filesystem.js";

export type {
  FileLink,
  MountedDirectory,
  MountedDirectoryFile,
  MountedDirectoryInput,
  MountedPak,
  MountedVirtualFile,
  SearchPath,
  VirtualFilesystem
} from "./virtual-filesystem.js";
