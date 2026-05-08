# Progress TS - packages/game/src/g_main.ts

- Fichier TS: `packages/game/src/g_main.ts`
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_game_src_g_main.ts.md`
- Statut: Termine
- Dernier lot valide: validation croisee complete du fichier `g_main.ts`
- Prochain lot recommande: aucun pour ce fichier; poursuivre avec `packages/game/src/g_spawn.ts` pour les helpers de spawn/worldspawn deplaces.

## Lot traite

- Interfaces TS nouvelles: `GameMainCvars`, `GameMainContext`, `GameMainHooks`, `GameMainContextOptions`.
- Entrees `g_main.c` deja couvertes par matrice C/H: `ShutdownGame`, `ClientEndServerFrames`, `G_RunFrame`, `CreateTargetChangeLevel`, `EndDMLevel`, `CheckDMRules`, `ExitLevel`, `GetGameApi`.
- Entree `InitGame` recroisee avec la matrice proprietaire `game_g_save.c.md`, car le corps C est defini dans `game/g_save.c`.
- Helpers/adapters locaux: `syncGameHelpState`, `createClientConnectHooks`, `createClientUserinfoHooks`, `validateClientConnect`, `createGameMainContext`, `ClientCommand`, `createGameMainCvars`, `applyMainCvarsToRuntime`, `flushRuntimeEngineEvents`, `tempEntityWritesDirection`, `numberPayload`, `vectorPayload`, `GAME_BUILD_DATE`, `syncLevelFromRuntime`, `tokenizeMapList`, `stringsEqualIgnoreCase`.
- Wrappers save/load `WriteGame`, `ReadGame`, `WriteLevel`, `ReadLevel` reclasses comme adapters du slot `GetGameAPI`; le proprietaire du portage reste `packages/game/src/g_save.ts`.
- Lignes obsoletes de la matrice (`normalizeSkillCvar`, `configureWorldspawn`, `precacheWorldspawnSounds`, `precacheGameSound`, `WORLDSPAWN_SOUND_PRECACHE`, `buildServerEntityList`, `SPAWNFLAG_NOT_MASK`, `applySpawnFlagMapHack`, `shouldInhibitSpawnEntity`, `syncMainRuntimeState`) marquees non applicables a `g_main.ts`, car les symboles sont absents du fichier courant et vivent dans `packages/game/src/g_spawn.ts`.

## Decisions

- Les symboles `Category: New` ont des metadonnees explicites `Original name: N/A` et `Source declaree: N/A (...)` dans le code et la matrice.
- Les doublons potentiels save/load sont resolus sans changer le comportement runtime: `g_main.ts` expose les slots, `g_save.ts` reste proprietaire du portage source.
- `SpawnEntities` dans `g_main.ts` est un symbole importe pour le slot exporte; la validation comportementale proprietaire reste rattachee a `g_spawn.ts`.

## Tests

- `npm run verify:g-main` OK.
- `npm run typecheck` OK.

## Integration

- Runtime: integre via `GetGameApi`, `SV_InitGameProgs`, `ge.RunFrame`, slots client/save/load et flush des evenements engine.
- `apps/web`: integre via `apps/web/src/full-game-server-host.ts`, qui instancie `GetGameApiFunction` avec le runtime server-backed et branche save/load.
- `renderer-three`: pas d'integration directe attendue pour les helpers locaux; les sorties visibles passent par snapshots, configstrings, temp entities et flux client/refresh existants.
