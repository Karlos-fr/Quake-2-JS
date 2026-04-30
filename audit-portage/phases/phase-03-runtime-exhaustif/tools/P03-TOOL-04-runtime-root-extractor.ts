import { buildRuntimeRootIndex, generatedPath, writeJson } from "./p03-runtime-toolkit.ts";

await writeJson(generatedPath("phase-03-runtime-roots.json"), await buildRuntimeRootIndex());
console.log("Wrote audit-portage/phases/phase-03-runtime-exhaustif/generated/phase-03-runtime-roots.json");
