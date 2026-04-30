import { buildRuntimeReport, generatedPath } from "./p03-runtime-toolkit.ts";
import { writeFile } from "node:fs/promises";

await writeFile(generatedPath("phase-03-runtime-coverage-report.md"), await buildRuntimeReport(), "utf8");
console.log("Phase 03.F runtime coverage report completed.");
