# Progress TS - packages/client/src/cl_tent.ts

- Fichier TS: `packages/client/src/cl_tent.ts`
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_client_src_cl_tent.ts.md`
- Statut: En cours
- Dernier lot traite: `buildCurrentView`, `computePlayerBeamGunStart`, `getHandMultiplier`, `calculateBeamAngles`, `subtractVec3`, `addVec3`, `isZeroVec3`, `scaleVec3`, `addScaledVec3`, `vectorLength`.
- Decision importante: `CL_AddTEntPacket` est un adapter non proprietaire de `CL_ParseTEnt`; le proprietaire C/H reste `packages/client/src/cl_parse.ts` / `CL_ParseTEnt`. `CL_BuildTEntRefresh` est un adapter structure pour le refresh; le symbole nominal proprietaire conserve est `CL_AddTEnts`. Dans le lot beams/lasers/explosions, les wrappers publics `CL_AddBeams`, `CL_AddPlayerBeams`, `CL_AddLasers` et `CL_AddExplosions` sont les proprietaires C/H couverts; les builders `buildPlayerBeams`, `buildLasers`, `buildExplosions`, `buildTempLights`, `buildForceWalls`, `createBeamRender` et `createHeatbeamRender` sont des helpers locaux `New`. Le lot courant `buildCurrentView` a `vectorLength` est egalement classe `New`: helpers locaux de reconstruction refresh pour beams/heatbeams, avec `Original name: N/A` et `Source: N/A (local refresh helper)`.
- Tests de reference lances: `npm run verify:cl-tent`.
- Blocages: aucun pour ce lot.
- Prochain lot recommande: continuer avec `buildSustains`, `CL_ProcessSustain`, `runSustainThinker`, `buildSustainRender`, `createImpactExplosion`.
