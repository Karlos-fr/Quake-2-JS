# Progress TS - packages/client/src/cl_tent.ts

- Fichier TS: `packages/client/src/cl_tent.ts`
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_client_src_cl_tent.ts.md`
- Statut: Termine
- Dernier lot traite: `buildSustains`, `CL_ProcessSustain`, `runSustainThinker`, `buildSustainRender`, `createImpactExplosion`, puis `CL_SmokeAndFlash`, `assignBeam`, `assignPlayerBeam`, `assignLaser`, `assignForceWall`, `assignSteamSustain`, `assignTimedSustain`, `allocateExplosion`, `CL_AllocExplosion`, `updateExplosionForFrame`, `resetExplosion`, `resetSustain`, `directionByteToVector`, `directionByteToImpactAngles`, `randomAngleDegrees`, `randomExplosionBaseframe`.
- Decision importante: `CL_AddTEntPacket` est un adapter non proprietaire de `CL_ParseTEnt`; le proprietaire C/H reste `packages/client/src/cl_parse.ts` / `CL_ParseTEnt`. `CL_BuildTEntRefresh` est un adapter structure pour le refresh; le symbole nominal proprietaire conserve est `CL_AddTEnts`. Dans le lot beams/lasers/explosions, les wrappers publics `CL_AddBeams`, `CL_AddPlayerBeams`, `CL_AddLasers` et `CL_AddExplosions` sont les proprietaires C/H couverts; les builders `buildPlayerBeams`, `buildLasers`, `buildExplosions`, `buildTempLights`, `buildForceWalls`, `createBeamRender` et `createHeatbeamRender` sont des helpers locaux `New`. Le lot `buildCurrentView` a `vectorLength` est egalement classe `New`: helpers locaux de reconstruction refresh pour beams/heatbeams, avec `Original name: N/A` et `Source: N/A (local refresh helper)`. Le dernier lot classe `CL_ProcessSustain`, `CL_SmokeAndFlash` et `CL_AllocExplosion` comme proprietaires C/H couverts par `client_cl_tent.c.md`; les autres symboles restants sont des helpers locaux `New` avec `Original name: N/A` et une `Source: N/A (...)` explicite.
- Tests de reference lances: `npm run verify:cl-tent`.
- Blocages: aucun pour ce lot.
- Prochain lot recommande: aucun pour la matrice TS actuelle.
