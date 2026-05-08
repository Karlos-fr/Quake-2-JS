# Progress TS - packages/game/src/g_spawn.ts

- Statut: Termine
- Dernier lot valide: inventaire complet `g_spawn.ts`, portages `g_spawn.c` couverts C/H, blocs locaux `SP_worldspawn` et helpers `New`.
- Prochain lot recommande: aucun pour `packages/game/src/g_spawn.ts`.
- Tests de reference: `npm run typecheck` OK; `npm run verify:g-spawn` bloque avant `g_spawn.ts` sur `packages/game/src/g_local.ts` TDZ `RUNTIME_MOVETYPE_NONE`.
- Blocages: verifier/corriger separement l'initialisation `g_local.ts` si les harness game ne demarrent pas dans une prochaine session.

## Session courante

- Lignes traitees: tous les symboles detectes dans `packages/game/src/g_spawn.ts`.
- Verdict: `Termine` cote TS croisee.
- Preuves: `README.md`, `CHECKLIST_VALIDATION_TS.md`, `CHECKLIST_VALIDATION_ENTITES.md`, `ORGANISATION_AGENTS.md`, matrice TS et matrice C/H `game_g_spawn.c.md` lus pendant la session. Source `Quake-2-master/game/g_spawn.c` lue pour les entites portees et les blocs `SP_worldspawn`.
- Couvert C/H: `SpawnEntry`, `single_statusbar`, `dm_statusbar`, `spawns`, `SpawnEntities`, `SP_worldspawn`, `ED_CallSpawn`, `ED_NewString`, `ED_ParseField`, `ED_ParseEdict`, `G_FindTeams`.
- Valide direct: helpers locaux `New`, `spawnFields` comme carte locale de parsing sans ownership sur `game/g_save.c` `fields`, et blocs extraits `precacheWorldspawnSounds` / `precacheWorldspawnModels`.
- Corrections: commentaires de metadonnees ajoutes dans `packages/game/src/g_spawn.ts` pour les entites `Category: New`; matrice TS recreee avec l'inventaire reel du fichier.
- Ownership/doublons: proprietaire attendu `packages/game/src/g_spawn.ts` pour `game/g_spawn.c`; `g_main.ts` ne contient qu'un wrapper `GameExport.SpawnEntities`; `spawnFields` ne masque pas le port proprietaire `fields` de `packages/game/src/g_save.ts`.
- Integration: runtime integre via `GetGameApi`/`SpawnEntities`, `server/src/sv_init.ts`, `ED_CallSpawn`, `G_FindTeams`, harness doors/entities/collision et flux full-game. `apps/web` consomme via le host serveur/full-game sans logique spawn parallele. `renderer-three` consomme indirectement les entites/modeles/configstrings produits par le runtime; aucune logique gameplay renderer a corriger dans ce lot.
- Tests: `npm run typecheck` OK. `npm run verify:g-spawn` KO avant execution utile: `ReferenceError: Cannot access 'RUNTIME_MOVETYPE_NONE' before initialization` dans `packages/game/src/g_local.ts`.
