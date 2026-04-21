import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const REPO_ROOT = path.resolve(".");
const SOURCE_ROOT = path.resolve("Quake-2-master");
const OUTPUT_ROOT = path.resolve("c-dependency-tools", "data");
const OUTPUT_FILE = path.join(OUTPUT_ROOT, "c-dependency-graph.json");
const MAX_FILES = Number(process.env.C_DEP_MAX_FILES ?? "0");
const FILE_MATCH = process.env.C_DEP_FILE_MATCH ?? "";
const VERBOSE = process.env.C_DEP_VERBOSE === "1";
const SOURCE_EXTENSIONS = new Set([".c", ".h"]);
const CALL_KEYWORD_BLACKLIST = new Set([
  "if",
  "for",
  "while",
  "switch",
  "return",
  "sizeof",
  "typedef",
  "define"
]);

main();

function main() {
  const filePaths = collectSourceFiles(SOURCE_ROOT);
  const matchedPaths = FILE_MATCH ? filePaths.filter((filePath) => filePath.includes(FILE_MATCH)) : filePaths;
  const selectedPaths = MAX_FILES > 0 ? matchedPaths.slice(0, MAX_FILES) : matchedPaths;
  const fileRecords = selectedPaths.map((relativePath, index) => analyzeFile(relativePath, index + 1, selectedPaths.length));
  const resolutionContext = buildResolutionContext(fileRecords);

  for (const fileRecord of fileRecords) {
    finalizeIncludes(fileRecord, resolutionContext);
  }

  const functionOwners = buildFunctionOwners(fileRecords);

  for (const fileRecord of fileRecords) {
    finalizeCallDependencies(fileRecord, functionOwners);
  }

  const graph = buildGraph(fileRecords);
  const payload = {
    sourceRoot: SOURCE_ROOT,
    repoRoot: REPO_ROOT,
    generatedAt: new Date().toISOString(),
    summary: {
      totalFiles: fileRecords.length,
      totalFunctionsDefined: fileRecords.reduce((sum, fileRecord) => sum + fileRecord.functionsDefined.length, 0),
      totalIncludeLinks: graph.links.filter((link) => link.includeCount > 0).length,
      totalCallLinks: graph.links.filter((link) => link.callCount > 0).length,
      totalGraphLinks: graph.links.length
    },
    files: fileRecords,
    graph
  };

  mkdirSync(OUTPUT_ROOT, { recursive: true });
  writeFileSync(OUTPUT_FILE, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  console.log(`Dependency graph generated: ${OUTPUT_FILE}`);
  console.log(`Files: ${payload.summary.totalFiles}`);
  console.log(`Functions defined: ${payload.summary.totalFunctionsDefined}`);
  console.log(`Graph links: ${payload.summary.totalGraphLinks}`);
}

function collectSourceFiles(rootDir) {
  const results = [];
  walkDirectory(rootDir, rootDir, results);
  results.sort((left, right) => left.localeCompare(right));
  return results;
}

function walkDirectory(rootDir, currentDir, results) {
  const children = readdirSync(currentDir, { withFileTypes: true });

  for (const child of children) {
    if (child.name.startsWith(".")) {
      continue;
    }

    const absolutePath = path.join(currentDir, child.name);
    if (child.isDirectory()) {
      walkDirectory(rootDir, absolutePath, results);
      continue;
    }

    if (!SOURCE_EXTENSIONS.has(path.extname(child.name).toLowerCase())) {
      continue;
    }

    results.push(toPortablePath(path.relative(rootDir, absolutePath)));
  }
}

function analyzeFile(relativePath, index, total) {
  if (VERBOSE) {
    console.log(`[analyze] ${index}/${total} ${relativePath}`);
  }

  const absolutePath = path.join(SOURCE_ROOT, relativePath);
  const rawContent = readFileSync(absolutePath, "utf8");
  const strippedContent = stripCommentsAndStrings(rawContent);
  const lineIndex = buildLineIndex(strippedContent);
  const includeDirectives = extractIncludes(rawContent);
  const functionDefinitions = extractFunctionDefinitions(strippedContent, lineIndex);
  const functionCallMap = extractFunctionCalls(functionDefinitions);

  return {
    id: relativePath,
    path: relativePath,
    name: path.basename(relativePath),
    extension: path.extname(relativePath).toLowerCase(),
    module: relativePath.includes("/") ? relativePath.slice(0, relativePath.indexOf("/")) : ".",
    directory: relativePath.includes("/") ? relativePath.slice(0, relativePath.lastIndexOf("/")) : ".",
    byteSize: statSync(absolutePath).size,
    includeDirectives,
    includes: [],
    functionsDefined: functionDefinitions.map((definition) => ({
      name: definition.name,
      signature: collapseWhitespace(definition.signature),
      line: definition.line,
      calls: functionCallMap.get(definition.name) ?? []
    })),
    functionDependencies: [],
    externalIncludes: [],
    unresolvedIncludes: [],
    unresolvedCalls: []
  };
}

function buildResolutionContext(fileRecords) {
  const byPath = new Map();
  const byBaseName = new Map();

  for (const fileRecord of fileRecords) {
    byPath.set(fileRecord.path, fileRecord);

    const list = byBaseName.get(fileRecord.name) ?? [];
    list.push(fileRecord.path);
    byBaseName.set(fileRecord.name, list);
  }

  return { byPath, byBaseName };
}

function finalizeIncludes(fileRecord, resolutionContext) {
  const resolved = [];
  const externalIncludes = [];
  const unresolvedIncludes = [];

  for (const directive of fileRecord.includeDirectives) {
    const target = resolveIncludeTarget(fileRecord, directive, resolutionContext);

    if (target.kind === "internal") {
      resolved.push({
        raw: directive.raw,
        target: target.path,
        includeType: directive.includeType,
        line: directive.line
      });
      continue;
    }

    if (target.kind === "external") {
      externalIncludes.push({
        raw: directive.raw,
        includeType: directive.includeType,
        line: directive.line
      });
      continue;
    }

    unresolvedIncludes.push({
      raw: directive.raw,
      includeType: directive.includeType,
      line: directive.line
    });
  }

  fileRecord.includes = resolved;
  fileRecord.externalIncludes = externalIncludes;
  fileRecord.unresolvedIncludes = unresolvedIncludes;
  delete fileRecord.includeDirectives;
}

function resolveIncludeTarget(fileRecord, directive, resolutionContext) {
  if (directive.includeType === "system") {
    return { kind: "external" };
  }

  const sourceDir = fileRecord.directory === "." ? "" : fileRecord.directory;
  const relativeCandidate = toPortablePath(path.posix.normalize(path.posix.join(sourceDir, directive.raw)));
  if (resolutionContext.byPath.has(relativeCandidate)) {
    return { kind: "internal", path: relativeCandidate };
  }

  if (resolutionContext.byPath.has(directive.raw)) {
    return { kind: "internal", path: directive.raw };
  }

  const basenameMatches = resolutionContext.byBaseName.get(path.basename(directive.raw)) ?? [];
  if (basenameMatches.length === 1) {
    return { kind: "internal", path: basenameMatches[0] };
  }

  return { kind: "unresolved" };
}

function buildFunctionOwners(fileRecords) {
  const owners = new Map();

  for (const fileRecord of fileRecords) {
    for (const fn of fileRecord.functionsDefined) {
      const list = owners.get(fn.name) ?? [];
      list.push(fileRecord.path);
      owners.set(fn.name, list);
    }
  }

  return owners;
}

function finalizeCallDependencies(fileRecord, functionOwners) {
  const dependencyMap = new Map();
  const unresolvedCalls = new Set();

  for (const fn of fileRecord.functionsDefined) {
    for (const calledName of fn.calls) {
      const owners = functionOwners.get(calledName) ?? [];

      if (owners.length === 1) {
        const targetFile = owners[0];
        if (targetFile === fileRecord.path) {
          continue;
        }

        const key = targetFile;
        const entry = dependencyMap.get(key) ?? {
          target: targetFile,
          functions: new Set(),
          callCount: 0
        };

        entry.functions.add(calledName);
        entry.callCount += 1;
        dependencyMap.set(key, entry);
        continue;
      }

      if (owners.length === 0) {
        unresolvedCalls.add(calledName);
      }
    }
  }

  fileRecord.functionDependencies = Array.from(dependencyMap.values())
    .map((entry) => ({
      target: entry.target,
      callCount: entry.callCount,
      functions: Array.from(entry.functions).sort()
    }))
    .sort((left, right) => left.target.localeCompare(right.target));
  fileRecord.unresolvedCalls = Array.from(unresolvedCalls).sort();
}

function buildGraph(fileRecords) {
  const nodes = fileRecords.map((fileRecord) => ({
    id: fileRecord.path,
    label: fileRecord.name,
    path: fileRecord.path,
    module: fileRecord.module,
    extension: fileRecord.extension,
    functionsDefined: fileRecord.functionsDefined.length,
    includeCount: fileRecord.includes.length,
    outgoingDependencyCount: fileRecord.functionDependencies.length
  }));

  const linkMap = new Map();

  for (const fileRecord of fileRecords) {
    for (const include of fileRecord.includes) {
      const entry = getOrCreateLink(linkMap, fileRecord.path, include.target);
      entry.includeCount += 1;
      entry.weight += 1;
      entry.includeDetails.push({
        raw: include.raw,
        line: include.line
      });
    }

    for (const dependency of fileRecord.functionDependencies) {
      const entry = getOrCreateLink(linkMap, fileRecord.path, dependency.target);
      entry.callCount += dependency.callCount;
      entry.weight += dependency.callCount;
      for (const fn of dependency.functions) {
        entry.functions.add(fn);
      }
    }
  }

  const links = Array.from(linkMap.values())
    .map((entry) => ({
      source: entry.source,
      target: entry.target,
      weight: entry.weight,
      includeCount: entry.includeCount,
      callCount: entry.callCount,
      relationTypes: buildRelationTypes(entry),
      functions: Array.from(entry.functions).sort(),
      includeDetails: entry.includeDetails.sort((left, right) => left.line - right.line)
    }))
    .sort((left, right) => {
      const sourceCompare = left.source.localeCompare(right.source);
      return sourceCompare !== 0 ? sourceCompare : left.target.localeCompare(right.target);
    });

  return { nodes, links };
}

function getOrCreateLink(linkMap, source, target) {
  const key = `${source}=>${target}`;
  const existing = linkMap.get(key);

  if (existing) {
    return existing;
  }

  const created = {
    source,
    target,
    weight: 0,
    includeCount: 0,
    callCount: 0,
    functions: new Set(),
    includeDetails: []
  };
  linkMap.set(key, created);
  return created;
}

function buildRelationTypes(link) {
  const relationTypes = [];

  if (link.includeCount > 0) {
    relationTypes.push("include");
  }

  if (link.callCount > 0) {
    relationTypes.push("call");
  }

  return relationTypes;
}

function extractIncludes(content) {
  const lines = content.split(/\r?\n/);
  const includes = [];

  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^\s*#\s*include\s*([<"])([^>"]+)[>"]/);
    if (!match) {
      continue;
    }

    includes.push({
      includeType: match[1] === "<" ? "system" : "local",
      raw: match[2],
      line: index + 1
    });
  }

  return includes;
}

function extractFunctionDefinitions(content, lineIndex) {
  const definitions = [];
  const signatureRegex =
    /(^|\n)\s*([A-Za-z_][A-Za-z0-9_\s\*\(\),]*?)\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(([\s\S]*?)\)\s*\{/g;

  for (const match of content.matchAll(signatureRegex)) {
    const fullMatch = match[0];
    const name = match[3];
    const openBraceIndex = (match.index ?? 0) + fullMatch.lastIndexOf("{");
    const signature = content.slice((match.index ?? 0), openBraceIndex).trim();

    if (!isLikelyFunctionSignature(signature, name)) {
      continue;
    }

    const bodyInfo = readBalancedBlock(content, openBraceIndex, lineAtIndex(lineIndex, openBraceIndex));
    if (!bodyInfo) {
      continue;
    }

    definitions.push({
      name,
      signature,
      line: lineAtIndex(lineIndex, match.index ?? 0),
      body: bodyInfo.body
    });
  }

  return dedupeDefinitions(definitions);
}

function readBalancedBlock(content, startIndex, startLine) {
  let depth = 0;
  let index = startIndex;
  let line = startLine;

  while (index < content.length) {
    const char = content[index];
    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return {
          body: content.slice(startIndex + 1, index),
          endIndex: index + 1,
          endLine: line
        };
      }
    } else if (char === "\n") {
      line += 1;
    }

    index += 1;
  }

  return null;
}

function extractFunctionCalls(definitions) {
  const callsByFunction = new Map();

  for (const definition of definitions) {
    const calls = [];
    const seen = new Set();
    const regex = /\b([A-Za-z_][A-Za-z0-9_]*)\s*\(/g;

    for (const match of definition.body.matchAll(regex)) {
      const calledName = match[1];
      if (!isLikelyCallName(calledName)) {
        continue;
      }

      if (seen.has(calledName)) {
        continue;
      }

      seen.add(calledName);
      calls.push(calledName);
    }

    calls.sort();
    callsByFunction.set(definition.name, calls);
  }

  return callsByFunction;
}

function dedupeDefinitions(definitions) {
  const seen = new Set();
  const result = [];

  for (const definition of definitions) {
    const key = `${definition.name}|${collapseWhitespace(definition.signature)}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(definition);
  }

  return result;
}

function isLikelyFunctionName(name) {
  if (!name || CALL_KEYWORD_BLACKLIST.has(name)) {
    return false;
  }

  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(name);
}

function isLikelyFunctionSignature(signature, name) {
  if (!signature.includes("(") || !signature.includes(")")) {
    return false;
  }

  if (signature.includes("=") || signature.includes("typedef")) {
    return false;
  }

  if (signature.includes("[") || signature.includes("]")) {
    return false;
  }

  if (signature.includes("if ") || signature.includes("for ") || signature.includes("while ") || signature.includes("switch ")) {
    return false;
  }

  const normalized = collapseWhitespace(signature);
  if (!normalized.includes(name)) {
    return false;
  }

  return true;
}

function isLikelyCallName(name) {
  return isLikelyFunctionName(name) && !CALL_KEYWORD_BLACKLIST.has(name);
}

function stripCommentsAndStrings(content) {
  let result = "";
  let index = 0;
  let state = "code";

  while (index < content.length) {
    const char = content[index];
    const next = content[index + 1] ?? "";

    if (state === "code") {
      if (char === "/" && next === "*") {
        result += "  ";
        index += 2;
        state = "block-comment";
        continue;
      }

      if (char === "/" && next === "/") {
        result += "  ";
        index += 2;
        state = "line-comment";
        continue;
      }

      if (char === "\"") {
        result += "\"";
        index += 1;
        state = "double-quote";
        continue;
      }

      if (char === "'") {
        result += "'";
        index += 1;
        state = "single-quote";
        continue;
      }

      result += char;
      index += 1;
      continue;
    }

    if (state === "block-comment") {
      if (char === "*" && next === "/") {
        result += "  ";
        index += 2;
        state = "code";
      } else {
        result += char === "\n" ? "\n" : " ";
        index += 1;
      }
      continue;
    }

    if (state === "line-comment") {
      if (char === "\n") {
        result += "\n";
        index += 1;
        state = "code";
      } else {
        result += " ";
        index += 1;
      }
      continue;
    }

    if (state === "double-quote") {
      if (char === "\\" && next) {
        result += "  ";
        index += 2;
      } else if (char === "\"") {
        result += "\"";
        index += 1;
        state = "code";
      } else {
        result += char === "\n" ? "\n" : " ";
        index += 1;
      }
      continue;
    }

    if (state === "single-quote") {
      if (char === "\\" && next) {
        result += "  ";
        index += 2;
      } else if (char === "'") {
        result += "'";
        index += 1;
        state = "code";
      } else {
        result += char === "\n" ? "\n" : " ";
        index += 1;
      }
    }
  }

  return result;
}

function countNewlines(value) {
  let count = 0;

  for (let index = 0; index < value.length; index += 1) {
    if (value[index] === "\n") {
      count += 1;
    }
  }

  return count;
}

function buildLineIndex(content) {
  const starts = [0];

  for (let index = 0; index < content.length; index += 1) {
    if (content[index] === "\n") {
      starts.push(index + 1);
    }
  }

  return starts;
}

function lineAtIndex(lineIndex, targetIndex) {
  let low = 0;
  let high = lineIndex.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (lineIndex[mid] <= targetIndex) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return high + 1;
}

function collapseWhitespace(value) {
  return value.replace(/\s+/g, " ").trim();
}

function toPortablePath(value) {
  return value.replaceAll("\\", "/");
}
