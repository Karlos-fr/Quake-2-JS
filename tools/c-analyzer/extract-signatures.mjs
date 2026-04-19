/**
 * File: extract-signatures.mjs
 * Purpose: Extract function, struct and enum signatures from the original Quake II C source tree.
 *
 * This file is not a direct source port.
 * It is a pragmatic analysis tool intended to feed stub generation and port tracking.
 *
 * Dependencies:
 * - node:fs
 * - node:path
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const SOURCE_ROOT = path.resolve("Quake-2-master");
const INDEX_FILE = path.resolve("tools", "c-analyzer", "out", "source-tree-index.json");
const OUTPUT_ROOT = path.resolve("tools", "c-analyzer", "out");
const OUTPUT_FILE = path.join(OUTPUT_ROOT, "source-signatures.json");
const FUNCTION_KEYWORD_BLACKLIST = new Set(["if", "for", "while", "switch", "return", "sizeof"]);

/**
 * Category: NewTooling
 * Purpose: Load the indexed source list, extract signatures and persist the result as JSON.
 *
 * Constraints:
 * - Must remain deterministic for the same source tree.
 * - Must produce machine-readable output usable by later tooling.
 */
function main() {
  const index = JSON.parse(readFileSync(INDEX_FILE, "utf8"));
  const files = index.entries.filter((entry) => entry.extension === ".c" || entry.extension === ".h");
  const extracted = files.map((entry) => extractFileSignatures(entry.relativePath));
  const payload = {
    sourceRoot: SOURCE_ROOT,
    generatedAt: new Date().toISOString(),
    totalFiles: extracted.length,
    totalFunctions: extracted.reduce((sum, file) => sum + file.functions.length, 0),
    totalStructs: extracted.reduce((sum, file) => sum + file.structs.length, 0),
    totalEnums: extracted.reduce((sum, file) => sum + file.enums.length, 0),
    files: extracted
  };

  mkdirSync(OUTPUT_ROOT, { recursive: true });
  writeFileSync(OUTPUT_FILE, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  console.log(
    `Extracted ${payload.totalFunctions} functions, ${payload.totalStructs} structs and ${payload.totalEnums} enums into ${OUTPUT_FILE}`
  );
}

/**
 * Category: NewTooling
 * Purpose: Extract signatures from a single C or header file.
 *
 * Constraints:
 * - Must preserve the original relative path for traceability.
 */
function extractFileSignatures(relativePath) {
  const absolutePath = path.join(SOURCE_ROOT, relativePath);
  const content = readFileSync(absolutePath, "utf8");
  const strippedContent = stripComments(content);

  return {
    relativePath,
    functions: extractFunctions(strippedContent),
    structs: extractStructs(strippedContent),
    enums: extractEnums(strippedContent)
  };
}

/**
 * Category: NewTooling
 * Purpose: Remove block and line comments so signature regexes operate on cleaner source text.
 *
 * Constraints:
 * - Must preserve line breaks to keep line counting stable enough for later tooling.
 */
function stripComments(content) {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n]/g, " "))
    .replace(/\/\/[^\n\r]*/g, "");
}

/**
 * Category: NewTooling
 * Purpose: Extract top-level function declarations and definitions from stripped C source.
 *
 * Constraints:
 * - Must ignore control-flow statements and most non-function constructs.
 */
function extractFunctions(content) {
  const regex = /(^|\n)\s*([A-Za-z_][\w\s\*\(\)]*?)\s+([A-Za-z_]\w*)\s*\(([\s\S]*?)\)\s*(;|\{)/g;
  const functions = [];

  for (const match of content.matchAll(regex)) {
    const returnType = collapseWhitespace(match[2]);
    const name = match[3];
    const parameters = collapseWhitespace(match[4]);
    const terminator = match[5];

    if (!isLikelyFunctionSignature(returnType, name, parameters)) {
      continue;
    }

    functions.push({
      name,
      returnType,
      parameters,
      kind: terminator === ";" ? "declaration" : "definition"
    });
  }

  return dedupeByNameAndSignature(functions);
}

/**
 * Category: NewTooling
 * Purpose: Extract typedef struct declarations from stripped source text.
 *
 * Constraints:
 * - Must capture both optional source struct names and exported typedef aliases.
 */
function extractStructs(content) {
  const regex = /typedef\s+struct\s+([A-Za-z_]\w*)?\s*\{([\s\S]*?)\}\s*([A-Za-z_]\w*)\s*;/g;
  const structs = [];

  for (const match of content.matchAll(regex)) {
    structs.push({
      sourceName: match[1] ?? null,
      typedefName: match[3],
      fieldCount: countStructFields(match[2])
    });
  }

  return structs;
}

/**
 * Category: NewTooling
 * Purpose: Extract typedef enum declarations from stripped source text.
 *
 * Constraints:
 * - Must capture optional source enum names and exported typedef aliases.
 */
function extractEnums(content) {
  const regex = /typedef\s+enum\s+([A-Za-z_]\w*)?\s*\{([\s\S]*?)\}\s*([A-Za-z_]\w*)\s*;/g;
  const enums = [];

  for (const match of content.matchAll(regex)) {
    enums.push({
      sourceName: match[1] ?? null,
      typedefName: match[3],
      valueCount: countEnumValues(match[2])
    });
  }

  return enums;
}

/**
 * Category: NewTooling
 * Purpose: Decide whether a regex match is likely to be a real function signature.
 *
 * Constraints:
 * - Must reject common control-flow constructs and obvious false positives.
 */
function isLikelyFunctionSignature(returnType, name, parameters) {
  if (FUNCTION_KEYWORD_BLACKLIST.has(name)) {
    return false;
  }

  if (returnType.includes("typedef")) {
    return false;
  }

  if (returnType.includes("=") || returnType.includes("#")) {
    return false;
  }

  if (parameters.includes("{") || parameters.includes("}")) {
    return false;
  }

  return true;
}

/**
 * Category: NewTooling
 * Purpose: Normalize spacing in extracted signature fragments.
 *
 * Constraints:
 * - Must preserve pointer stars and token order while collapsing noisy whitespace.
 */
function collapseWhitespace(value) {
  return value.replace(/\s+/g, " ").trim();
}

/**
 * Category: NewTooling
 * Purpose: Count likely fields inside a typedef struct body.
 *
 * Constraints:
 * - Must remain heuristic and fast rather than fully parse C syntax.
 */
function countStructFields(body) {
  return body
    .split(";")
    .map((part) => collapseWhitespace(part))
    .filter((part) => part.length > 0)
    .length;
}

/**
 * Category: NewTooling
 * Purpose: Count likely enum values inside a typedef enum body.
 *
 * Constraints:
 * - Must ignore empty fragments from trailing commas.
 */
function countEnumValues(body) {
  return body
    .split(",")
    .map((part) => collapseWhitespace(part))
    .filter((part) => part.length > 0)
    .length;
}

/**
 * Category: NewTooling
 * Purpose: Deduplicate repeated function declarations or definitions with the same signature.
 *
 * Constraints:
 * - Must preserve first-seen order.
 */
function dedupeByNameAndSignature(functions) {
  const seen = new Set();
  const result = [];

  for (const item of functions) {
    const key = `${item.name}|${item.returnType}|${item.parameters}|${item.kind}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(item);
  }

  return result;
}

main();
