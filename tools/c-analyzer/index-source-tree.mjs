/**
 * File: index-source-tree.mjs
 * Purpose: Build a machine-readable index of the original Quake II source tree for future porting tools.
 *
 * This file is not a direct source port.
 * It is an analysis tool used to inventory source files and headers before stub generation.
 *
 * Dependencies:
 * - node:fs
 * - node:path
 */

import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const SOURCE_ROOT = path.resolve("Quake-2-master");
const OUTPUT_ROOT = path.resolve("tools", "c-analyzer", "out");
const OUTPUT_FILE = path.join(OUTPUT_ROOT, "source-tree-index.json");
const SOURCE_EXTENSIONS = new Set([".c", ".h", ".s", ".asm", ".inc", ".m"]);
const SOURCE_FILENAMES = new Set(["makefile", "makezip", "makezip.bat"]);

/**
 * Category: NewTooling
 * Purpose: Build the full source index and persist it as formatted JSON.
 *
 * Constraints:
 * - Must only include source-like files relevant to the porting workflow.
 * - Must stay deterministic across runs on the same tree.
 */
function main() {
  const entries = collectSourceEntries(SOURCE_ROOT);
  const byModule = summarizeByModule(entries);
  const payload = {
    sourceRoot: SOURCE_ROOT,
    generatedAt: new Date().toISOString(),
    totalFiles: entries.length,
    byModule,
    entries
  };

  mkdirSync(OUTPUT_ROOT, { recursive: true });
  writeFileSync(OUTPUT_FILE, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  console.log(`Indexed ${entries.length} source files into ${OUTPUT_FILE}`);
}

/**
 * Category: NewTooling
 * Purpose: Recursively collect source-like files from the original Quake II tree.
 *
 * Constraints:
 * - Must return results sorted by relative path for stable diffs.
 */
function collectSourceEntries(rootDir) {
  const results = [];
  walkDirectory(rootDir, rootDir, results);
  results.sort((left, right) => left.relativePath.localeCompare(right.relativePath));
  return results;
}

/**
 * Category: NewTooling
 * Purpose: Recursively walk the source tree and append matching files to the result set.
 *
 * Constraints:
 * - Must skip hidden directories created by tooling if they appear later.
 */
function walkDirectory(rootDir, currentDir, results) {
  const children = readdirSync(currentDir, { withFileTypes: true });

  for (const child of children) {
    if (child.name.startsWith(".") && child.name !== ".") {
      continue;
    }

    const absolutePath = path.join(currentDir, child.name);
    if (child.isDirectory()) {
      walkDirectory(rootDir, absolutePath, results);
      continue;
    }

    if (!shouldIndexFile(child.name)) {
      continue;
    }

    const relativePath = toPortablePath(path.relative(rootDir, absolutePath));
    const extension = path.extname(child.name).toLowerCase();
    const content = readFileSync(absolutePath, "utf8");

    results.push({
      relativePath,
      fileName: child.name,
      extension: extension || inferExtensionFromName(child.name),
      module: relativePath.includes("/") ? relativePath.slice(0, relativePath.indexOf("/")) : ".",
      sourceKind: classifySourceKind(child.name, extension),
      lineCount: countLines(content),
      byteSize: statSync(absolutePath).size
    });
  }
}

/**
 * Category: NewTooling
 * Purpose: Decide whether a file belongs in the source index.
 *
 * Constraints:
 * - Must include C, headers and closely related native build/source files.
 */
function shouldIndexFile(fileName) {
  const normalizedName = fileName.toLowerCase();
  return SOURCE_FILENAMES.has(normalizedName) || SOURCE_EXTENSIONS.has(path.extname(normalizedName));
}

/**
 * Category: NewTooling
 * Purpose: Classify the role of a source file for later reporting and stub generation.
 *
 * Constraints:
 * - Must stay simple and deterministic.
 */
function classifySourceKind(fileName, extension) {
  const normalizedName = fileName.toLowerCase();

  if (normalizedName.includes("makefile") || normalizedName === "makezip" || normalizedName === "makezip.bat") {
    return "build";
  }

  switch (extension) {
    case ".c":
      return "c";
    case ".h":
      return "header";
    case ".s":
    case ".asm":
      return "assembly";
    case ".inc":
      return "include";
    case ".m":
      return "objective-c";
    default:
      return "other";
  }
}

/**
 * Category: NewTooling
 * Purpose: Convert Windows paths to portable slash-separated paths for index stability.
 *
 * Constraints:
 * - Must not modify the logical relative path content.
 */
function toPortablePath(value) {
  return value.replaceAll("\\", "/");
}

/**
 * Category: NewTooling
 * Purpose: Count lines in a source file for rough complexity and reporting.
 *
 * Constraints:
 * - Must report zero for empty content.
 */
function countLines(content) {
  if (content.length === 0) {
    return 0;
  }

  return content.split(/\r?\n/).length;
}

/**
 * Category: NewTooling
 * Purpose: Provide a fallback extension tag when a tracked file has no conventional suffix.
 *
 * Constraints:
 * - Must remain stable for build files like makefile.
 */
function inferExtensionFromName(fileName) {
  return fileName.toLowerCase() === "makefile" ? "makefile" : "";
}

/**
 * Category: NewTooling
 * Purpose: Aggregate source counts by top-level module for quick reporting.
 *
 * Constraints:
 * - Must return module names sorted alphabetically for stable output.
 */
function summarizeByModule(entries) {
  const counts = new Map();

  for (const entry of entries) {
    counts.set(entry.module, (counts.get(entry.module) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([module, fileCount]) => ({ module, fileCount }));
}

main();
