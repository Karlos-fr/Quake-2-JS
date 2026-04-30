import { buildCoverageMatrix, buildCoverageMatrixSeed, generatedPath, writeJson } from "./p03-runtime-toolkit.ts";

await writeJson(generatedPath("phase-03-runtime-coverage-matrix.seed.json"), await buildCoverageMatrixSeed());
await writeJson(generatedPath("phase-03-runtime-coverage-matrix.json"), await buildCoverageMatrix());
console.log("Wrote audit-portage/phases/phase-03-runtime-exhaustif/generated/phase-03-runtime-coverage-matrix.json");
