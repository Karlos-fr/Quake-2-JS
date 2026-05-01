# Progress - Quake-2-master/game/g_save.c

## Dernier lot traite

- 2026-05-01: tables/globales `levelfields` et `clientfields`.

## Verdict du lot

- `levelfields`: valide. Le tableau TS conserve les 5 entrees C dans le meme ordre: `changemap`, `sight_client`, `sight_entity`, `sound_entity`, `sound2_entity`; les offsets `LLOFS`, types `F_LSTRING`/`F_EDICT` et flags zero sont couverts par le harness. Le sentinel C `{NULL, 0, F_INT}` est remplace par la fin du tableau TS.
- `clientfields`: valide. Le tableau TS conserve les 3 entrees C dans le meme ordre: `pers.weapon`, `pers.lastweapon`, `newweapon`; le type `F_ITEM`, les offsets symboliques equivalents et flags zero sont couverts par le harness. Le sentinel C `{NULL, 0, F_INT}` est remplace par la fin du tableau TS.
- Commentaires d'en-tete: non applicable pour ce lot car il ne contient aucune fonction; la presence/portee des globals est prouvee par exports TS et tests.

## Branchement et integrations

- Runtime: attendu et branche. `levelfields` correspond aux metadata lues/ecrites par `snapshotLevel`/`restoreLevel` depuis `WriteLevel`/`ReadLevel`; `clientfields` correspond aux items client lus/ecrits par `snapshotClient`/`restoreClient` depuis `WriteGame`/`ReadGame` et `SaveClientData`.
- apps/web: attendu et branche. `apps/web/src/full-game-server-host.ts` fournit les hooks `readFile`/`writeFile` vers le stockage web et appelle `ge.WriteLevel`/`ge.ReadLevel`; les sauvegardes jeu/client passent par les memes hooks de persistence.
- renderer-three: pas de branchement direct attendu pour ces tables. Elles ne produisent pas elles-memes de modeles, frames, images, particules, beams, dlights, temp entities, areabits, camera ni scene; les sorties visibles proviennent seulement des entites/items/champs restaures, ensuite consommes par les snapshots et adapters Three.

## Corrections appliquees

- Renforcement de `scripts/verify/quake2-g-save.ts`: preuve complete des tables `levelfields` et `clientfields` avec ordre, offsets symboliques, types et flags.

## Tests

- `npm run verify:g-save`: ok le 2026-05-01.
- `npm run typecheck`: ok le 2026-05-01.
- `npm run verify:full-game:server-host`: ok le 2026-05-01.
- `npm run verify:full-game:three-renderer`: ok le 2026-05-01.
- `npm run verify:web-render-order`: ok le 2026-05-01.

## Prochain lot recommande

- Continuer avec `InitGame`, sans inclure `WriteField1` dans le meme petit lot sauf preuve de branchement strictement necessaire.
