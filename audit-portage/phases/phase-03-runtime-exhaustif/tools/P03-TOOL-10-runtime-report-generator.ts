import { buildRuntimeReport, generatedPath } from "./p03-runtime-toolkit.ts";
import { writeFile } from "node:fs/promises";

await writeFile(generatedPath("phase-03-runtime-coverage-report.md"), await buildRuntimeReport(), "utf8");
console.log("Wrote audit-portage/phases/phase-03-runtime-exhaustif/generated/phase-03-runtime-coverage-report.md");
