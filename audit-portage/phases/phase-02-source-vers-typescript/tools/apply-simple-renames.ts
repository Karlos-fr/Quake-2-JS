/**
 * File: apply-simple-renames.ts
 * Purpose: Apply the safe phase-02.D rename subset and update import specifiers.
 *
 * This script is intentionally allowlisted. It does not apply every proposal
 * from phase-02-rename-plan.md; ambiguous proposals remain blocked for review.
 */

import { mkdir, readFile, readdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";

interface RenameItem {
  from: string;
  to: string;
}

const repoRoot = process.cwd();

const renames: RenameItem[] = [
  { from: "packages/client/src/cinematic.ts", to: "packages/client/src/cl_cin.ts" },
  { from: "packages/client/src/entities.ts", to: "packages/client/src/cl_ents.ts" },
  { from: "packages/client/src/effects.ts", to: "packages/client/src/cl_fx.ts" },
  { from: "packages/client/src/input.ts", to: "packages/client/src/cl_input.ts" },
  { from: "packages/client/src/inventory.ts", to: "packages/client/src/cl_inv.ts" },
  { from: "packages/client/src/main.ts", to: "packages/client/src/cl_main.ts" },
  { from: "packages/client/src/newfx.ts", to: "packages/client/src/cl_newfx.ts" },
  { from: "packages/client/src/parse.ts", to: "packages/client/src/cl_parse.ts" },
  { from: "packages/client/src/screen.ts", to: "packages/client/src/cl_scrn.ts" },
  { from: "packages/client/src/tent.ts", to: "packages/client/src/cl_tent.ts" },
  { from: "packages/client/src/sound-local.ts", to: "packages/client/src/snd_loc.ts" },
  { from: "packages/client/src/types.ts", to: "packages/client/src/client.ts" },
  { from: "packages/client/src/input-device.ts", to: "packages/client/src/input.ts" },
  { from: "packages/game/src/g-local.ts", to: "packages/game/src/g_local.ts" },
  { from: "packages/math/src/index.ts", to: "packages/math/src/q_shared.ts" },
  { from: "packages/qcommon/src/collision.ts", to: "packages/qcommon/src/cmodel.ts" },
  { from: "packages/qcommon/src/q-shared.ts", to: "packages/qcommon/src/q_shared.ts" },
  { from: "packages/qcommon/src/net-chan.ts", to: "packages/qcommon/src/net_chan.ts" },
  { from: "packages/filesystem/src/virtual-filesystem.ts", to: "packages/filesystem/src/files.ts" },
  { from: "packages/formats/src/bsp.ts", to: "packages/formats/src/qfiles.ts" },
  { from: "packages/renderer-three/src/gl-draw.ts", to: "packages/renderer-three/src/gl_draw.ts" },
  { from: "packages/renderer-three/src/gl-image.ts", to: "packages/renderer-three/src/gl_image.ts" },
  { from: "packages/renderer-three/src/gl-light.ts", to: "packages/renderer-three/src/gl_light.ts" },
  { from: "packages/renderer-three/src/gl-local.ts", to: "packages/renderer-three/src/gl_local.ts" },
  { from: "packages/renderer-three/src/gl-mesh.ts", to: "packages/renderer-three/src/gl_mesh.ts" },
  { from: "packages/renderer-three/src/gl-rmain.ts", to: "packages/renderer-three/src/gl_rmain.ts" },
  { from: "packages/renderer-three/src/gl-rmisc.ts", to: "packages/renderer-three/src/gl_rmisc.ts" },
  { from: "packages/renderer-three/src/gl-rsurf.ts", to: "packages/renderer-three/src/gl_rsurf.ts" },
  { from: "packages/renderer-three/src/gl-warp.ts", to: "packages/renderer-three/src/gl_warp.ts" },
];

function absolute(repoPath: string): string {
  const resolved = path.resolve(repoRoot, repoPath);
  if (!resolved.startsWith(repoRoot)) {
    throw new Error(`Refusing path outside repo: ${repoPath}`);
  }
  return resolved;
}

async function exists(repoPath: string): Promise<boolean> {
  try {
    await readFile(absolute(repoPath));
    return true;
  } catch {
    return false;
  }
}

async function walkFiles(root: string, predicate: (filePath: string) => boolean): Promise<string[]> {
  const files: string[] = [];
  async function walk(current: string): Promise<void> {
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === "node_modules" || entry.name === ".git") {
        continue;
      }
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(entryPath);
      } else if (entry.isFile() && predicate(entryPath)) {
        files.push(entryPath);
      }
    }
  }
  await walk(root);
  return files.sort();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function updateText(text: string, renameMap: RenameItem[]): string {
  let next = text;
  for (const item of renameMap) {
    const oldStem = path.posix.basename(item.from, ".ts");
    const newStem = path.posix.basename(item.to, ".ts");
    next = next.replaceAll(item.from, item.to);
    next = next.replaceAll(item.from.replaceAll("/", "\\"), item.to.replaceAll("/", "\\"));
    next = next.replaceAll(`/${oldStem}.js`, `/${newStem}.js`);
    next = next.replaceAll(`/${oldStem}'`, `/${newStem}'`);
    next = next.replaceAll(`/${oldStem}"`, `/${newStem}"`);
    next = next.replace(new RegExp(`((?:\\.\\.?/)+)${escapeRegExp(oldStem)}(?=(?:['"]|\\.js['"]))`, "g"), `$1${newStem}`);
    next = next.replace(new RegExp(`(File:\\s*)${escapeRegExp(path.posix.basename(item.from))}`, "g"), `$1${path.posix.basename(item.to)}`);
  }
  return next;
}

async function main(): Promise<void> {
  for (const item of renames) {
    const fromExists = await exists(item.from);
    const toExists = await exists(item.to);
    if (!fromExists && toExists) {
      continue;
    }
    if (!fromExists) {
      throw new Error(`Source file is missing: ${item.from}`);
    }
    if (toExists) {
      throw new Error(`Destination file already exists: ${item.to}`);
    }
    await mkdir(path.dirname(absolute(item.to)), { recursive: true });
  }

  for (const item of renames) {
    if (!(await exists(item.from)) && await exists(item.to)) {
      continue;
    }
    await rename(absolute(item.from), absolute(item.to));
  }

  const files = [
    ...(await walkFiles(path.join(repoRoot, "packages"), (filePath) => path.extname(filePath) === ".ts")),
    ...(await walkFiles(path.join(repoRoot, "apps"), (filePath) => path.extname(filePath) === ".ts")),
    absolute("PORTAGE_QUAKE2.md"),
  ];

  for (const filePath of files) {
    const text = await readFile(filePath, "utf8");
    const next = updateText(text, renames);
    if (next !== text) {
      await writeFile(filePath, next, "utf8");
    }
  }

  console.log(`Applied ${renames.length} simple phase-02.D renames.`);
}

await main();
