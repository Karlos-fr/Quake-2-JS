# Progress TS - packages/client/src/cl_tent.ts

- Fichier TS: `packages/client/src/cl_tent.ts`
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_client_src_cl_tent.ts.md`
- Statut: En cours
- Dernier lot traite: constantes locales `MODEL_*`/`PIC_*`, interfaces refresh `Client*Render`/`ClientTEntRefresh`, `CL_ClearTEnts`, `CL_RegisterTEntSounds`, `CL_RegisterTEntModels`, `CL_AddTEntPacket`, `CL_BuildTEntRefresh`, `CL_AddTEnts`, `buildBeams`.
- Decision importante: `CL_AddTEntPacket` est un adapter non proprietaire de `CL_ParseTEnt`; le proprietaire C/H reste `packages/client/src/cl_parse.ts` / `CL_ParseTEnt`. `CL_BuildTEntRefresh` est un adapter structure pour le refresh; le symbole nominal proprietaire conserve est `CL_AddTEnts`.
- Tests de reference lances: `npm run verify:cl-tent`.
- Blocages: aucun pour ce lot.
- Prochain lot recommande: continuer avec `CL_AddBeams`, `buildPlayerBeams`, `CL_AddPlayerBeams`, `buildLasers`, `CL_AddLasers`, `buildExplosions`, `CL_AddExplosions`, `buildTempLights`, `buildForceWalls`, `createBeamRender`, `createHeatbeamRender`.
