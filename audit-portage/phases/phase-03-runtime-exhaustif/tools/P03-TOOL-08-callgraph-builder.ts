import { buildCallGraph, generatedPath, writeJson } from "./p03-runtime-toolkit.ts";

await writeJson(generatedPath("phase-03-callgraph-c.json"), await buildCallGraph("c"));
await writeJson(generatedPath("phase-03-callgraph-ts.json"), await buildCallGraph("ts"));
console.log("Wrote audit-portage/phases/phase-03-runtime-exhaustif/generated/phase-03-callgraph-*.json");
