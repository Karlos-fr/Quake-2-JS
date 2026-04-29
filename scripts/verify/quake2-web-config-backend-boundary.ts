/**
 * File: quake2-web-config-backend-boundary.ts
 * Purpose: Verify that browser config persistence stays behind the web adapter boundary.
 *
 * It is an architecture guard for the config.cfg browser backend decision.
 */

import { strict as assert } from "node:assert";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const repoRoot = process.cwd();
const packagesRoot = join(repoRoot, "packages");
const storagePath = join(repoRoot, "apps", "web", "src", "web-config-storage.ts");
const planPath = join(repoRoot, "PLAN_CONFIG_CFG_NAVIGATEUR.md");

const packageSources = listSourceFiles(packagesRoot);
const localStorageHits = packageSources.filter((path) => readFileSync(path, "utf8").includes("localStorage"));

assert.deepEqual(
  localStorageHits.map(toRepoPath),
  [],
  "runtime packages must not reference browser localStorage directly"
);

const storageSource = readFileSync(storagePath, "utf8");
assert.ok(
  storageSource.includes("export interface WebStorageLike"),
  "web config storage must expose a replaceable storage interface"
);
assert.ok(
  storageSource.includes("export interface WebConfigStorage"),
  "web config storage must expose logical text-file operations"
);
assert.ok(
  storageSource.includes("createWebConfigStorage"),
  "web config storage must keep backend creation in apps/web"
);

const plan = readFileSync(planPath, "utf8");
assert.ok(
  plan.includes("localStorage` est donc un backend de persistance"),
  "plan must document localStorage as a backend, not as the config model"
);
assert.ok(
  plan.includes("IndexedDB"),
  "plan must keep the future mutable VFS backend decision visible"
);
assert.ok(
  plan.includes("Cette phase ne doit pas bloquer `full-game`."),
  "plan must keep the advanced backend out of the full-game critical path"
);

console.log("quake2-web-config-backend-boundary: ok");

function listSourceFiles(root: string): string[] {
  if (!existsSync(root)) {
    return [];
  }

  const files: string[] = [];
  for (const entry of readdirSync(root)) {
    const path = join(root, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      if (entry !== "node_modules" && entry !== "dist") {
        files.push(...listSourceFiles(path));
      }
      continue;
    }

    if (path.endsWith(".ts")) {
      files.push(path);
    }
  }

  return files;
}

function toRepoPath(path: string): string {
  return relative(repoRoot, path).split(sep).join("/");
}
