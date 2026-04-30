import { buildTestLinks, generatedPath, writeJson } from "./p03-runtime-toolkit.ts";

await writeJson(generatedPath("phase-03-test-links.json"), await buildTestLinks());
console.log("Wrote audit-portage/phases/phase-03-runtime-exhaustif/generated/phase-03-test-links.json");
