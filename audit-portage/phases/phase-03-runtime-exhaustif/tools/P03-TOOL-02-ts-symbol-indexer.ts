import { buildTsSymbolIndex, generatedPath, writeJson } from "./p03-runtime-toolkit.ts";

await writeJson(generatedPath("phase-03-ts-symbol-index.json"), await buildTsSymbolIndex());
console.log("Wrote audit-portage/phases/phase-03-runtime-exhaustif/generated/phase-03-ts-symbol-index.json");
