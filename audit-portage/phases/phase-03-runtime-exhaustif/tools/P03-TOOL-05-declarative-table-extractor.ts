import { buildDeclarativeTables, buildDeclarativeTablesAudit, generatedPath, writeDeclarativeTablesReport, writeJson } from "./p03-runtime-toolkit.ts";

await writeJson(generatedPath("phase-03-declarative-tables.json"), await buildDeclarativeTables());
await writeJson(generatedPath("phase-03-declarative-tables-audit.json"), await buildDeclarativeTablesAudit());
await writeDeclarativeTablesReport();
console.log("Wrote audit-portage/phases/phase-03-runtime-exhaustif/generated/phase-03-declarative-tables.json");
