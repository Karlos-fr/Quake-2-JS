/**
 * File: generate-ts-stubs.mjs
 * Purpose: Generate TypeScript port stubs from extracted C signatures.
 *
 * This file is not a direct source port.
 * It is a stub-generation tool that prepares traceable TypeScript entry points for future manual porting.
 *
 * Dependencies:
 * - node:fs
 * - node:path
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const SIGNATURES_FILE = path.resolve("tools", "c-analyzer", "out", "source-signatures.json");
const OUTPUT_ROOT = path.resolve("generated", "ts-stubs");

/**
 * Category: NewTooling
 * Purpose: Parse arguments, select files and generate stub modules.
 *
 * Constraints:
 * - Must support generating one target or the full signature set.
 */
function main() {
  const signatures = JSON.parse(readFileSync(SIGNATURES_FILE, "utf8"));
  const args = process.argv.slice(2);
  const targetArgIndex = args.indexOf("--target");
  const onlyWithSymbols = args.includes("--only-with-symbols");

  const target = targetArgIndex >= 0 ? args[targetArgIndex + 1] : undefined;
  const files = selectFiles(signatures.files, target, onlyWithSymbols);

  if (files.length === 0) {
    throw new Error(`No source file matched the stub generation request${target ? `: ${target}` : ""}`);
  }

  for (const file of files) {
    const outputPath = getOutputPath(file.relativePath);
    mkdirSync(path.dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, renderStubFile(file), "utf8");
  }

  console.log(`Generated ${files.length} TypeScript stub file(s) into ${OUTPUT_ROOT}`);
}

/**
 * Category: NewTooling
 * Purpose: Filter the source signature list according to the generation request.
 *
 * Constraints:
 * - Must keep stable source order.
 */
function selectFiles(files, target, onlyWithSymbols) {
  const filtered = target
    ? files.filter((file) => file.relativePath === target)
    : files;

  if (!onlyWithSymbols) {
    return filtered;
  }

  return filtered.filter((file) => file.functions.length > 0 || file.structs.length > 0 || file.enums.length > 0);
}

/**
 * Category: NewTooling
 * Purpose: Compute the generated TypeScript stub path for a source file.
 *
 * Constraints:
 * - Must preserve the original relative path shape as much as possible.
 */
function getOutputPath(relativePath) {
  const parsed = path.parse(relativePath);
  return path.join(OUTPUT_ROOT, parsed.dir, `${parsed.name}.ts`);
}

/**
 * Category: NewTooling
 * Purpose: Render a full TypeScript stub file for a source entry.
 *
 * Constraints:
 * - Must emit project-standard headers.
 * - Must keep original names visible.
 */
function renderStubFile(file) {
  const lines = [];

  lines.push("/**");
  lines.push(` * File: ${path.basename(getOutputPath(file.relativePath))}`);
  lines.push(` * Source: Quake II original / ${file.relativePath}`);
  lines.push(" * Purpose: Generated TypeScript port stub derived from extracted C signatures.");
  lines.push(" *");
  lines.push(" * Porting policy:");
  lines.push(" * - Preserve original behavior first.");
  lines.push(" * - Preserve original names whenever possible.");
  lines.push(" * - Avoid structural refactors unless documented.");
  lines.push(" *");
  lines.push(" * Deviations:");
  lines.push(" * - This file is a generated stub and not yet a functional port.");
  lines.push(" *");
  lines.push(" * Notes:");
  lines.push(" * - Replace placeholder types progressively while porting the source.");
  lines.push(" */");
  lines.push("");

  if (file.enums.length > 0) {
    lines.push(...renderEnums(file.enums));
  }

  if (file.structs.length > 0) {
    lines.push(...renderStructs(file.structs));
  }

  if (file.functions.length > 0) {
    lines.push(...renderFunctions(file.functions, file.relativePath));
  }

  if (file.enums.length === 0 && file.structs.length === 0 && file.functions.length === 0) {
    lines.push("/**");
    lines.push(" * Category: NewTooling");
    lines.push(" * Purpose: Placeholder stub for a source file that currently yields no extractable signatures.");
    lines.push(" *");
    lines.push(" * Constraints:");
    lines.push(" * - Keep the source linkage intact for future manual analysis.");
    lines.push(" */");
    lines.push("export {};");
  }

  return `${lines.join("\n")}\n`;
}

/**
 * Category: NewTooling
 * Purpose: Render enum placeholders that preserve typedef names from the source.
 *
 * Constraints:
 * - Must keep the source enum name visible when present.
 */
function renderEnums(enums) {
  const lines = [];

  for (const entry of enums) {
    lines.push("/**");
    lines.push(` * Original name: ${entry.typedefName}`);
    if (entry.sourceName) {
      lines.push(` * Source enum tag: ${entry.sourceName}`);
    }
    lines.push(" * Category: Ported");
    lines.push(" * Fidelity level: Strict");
    lines.push(" *");
    lines.push(" * Behavior:");
    lines.push(` * - Placeholder enum stub generated from the original declaration with ${entry.valueCount} value slot(s).`);
    lines.push(" *");
    lines.push(" * Porting notes:");
    lines.push(" * - Replace the placeholder members with the original enum constants during the real port.");
    lines.push(" */");
    lines.push(`export enum ${entry.typedefName} {`);
    lines.push("  TODO = 0");
    lines.push("}");
    lines.push("");
  }

  return lines;
}

/**
 * Category: NewTooling
 * Purpose: Render interface placeholders for extracted typedef structs.
 *
 * Constraints:
 * - Must preserve the typedef name from the C source.
 */
function renderStructs(structs) {
  const lines = [];

  for (const entry of structs) {
    lines.push("/**");
    lines.push(` * Original name: ${entry.typedefName}`);
    if (entry.sourceName) {
      lines.push(` * Source struct tag: ${entry.sourceName}`);
    }
    lines.push(" * Category: Ported");
    lines.push(" * Fidelity level: Strict");
    lines.push(" *");
    lines.push(" * Behavior:");
    lines.push(` * - Placeholder interface stub generated from a struct with ${entry.fieldCount} field slot(s).`);
    lines.push(" *");
    lines.push(" * Porting notes:");
    lines.push(" * - Replace placeholder fields with the original ordered fields while porting.");
    lines.push(" */");
    lines.push(`export interface ${entry.typedefName} {`);
    lines.push("  // TODO: port original fields in declaration order.");
    lines.push("}");
    lines.push("");
  }

  return lines;
}

/**
 * Category: NewTooling
 * Purpose: Render function stubs that preserve original exported names.
 *
 * Constraints:
 * - Must emit compilable placeholder implementations.
 */
function renderFunctions(functions, relativePath) {
  const lines = [];

  for (const entry of functions) {
    const parameterNames = buildParameterNames(entry.parameters);
    lines.push("/**");
    lines.push(` * Original name: ${entry.name}`);
    lines.push(` * Source: ${relativePath}`);
    lines.push(" * Category: Ported");
    lines.push(" * Fidelity level: Strict");
    lines.push(" *");
    lines.push(" * Behavior:");
    lines.push(" * - Generated function stub preserving the original symbol name and parameter shape.");
    lines.push(" *");
    lines.push(" * Porting notes:");
    lines.push(" * - Replace placeholder parameter and return types with source-faithful definitions during the real port.");
    lines.push(" */");
    lines.push(`export function ${entry.name}(${parameterNames.map((name) => `${name}: unknown`).join(", ")}): unknown {`);
    lines.push(`  throw new Error("${entry.name} is not implemented yet.");`);
    lines.push("}");
    lines.push("");
  }

  return lines;
}

/**
 * Category: NewTooling
 * Purpose: Derive safe parameter names from extracted C parameter lists.
 *
 * Constraints:
 * - Must return stable placeholder names even for complex pointer signatures.
 */
function buildParameterNames(parameters) {
  const cleaned = parameters.trim();
  if (cleaned === "" || cleaned === "void") {
    return [];
  }

  return cleaned.split(",").map((part, index) => {
    const collapsed = part.trim().replace(/\s+/g, " ");
    const tokens = collapsed.split(/[\s\*]+/).filter(Boolean);
    const lastToken = tokens[tokens.length - 1] ?? `arg${index}`;
    const safeName = lastToken.replace(/[^\w]/g, "");

    if (safeName.length === 0 || /^[A-Z_]+$/.test(safeName)) {
      return `arg${index}`;
    }

    return safeName;
  });
}

main();
