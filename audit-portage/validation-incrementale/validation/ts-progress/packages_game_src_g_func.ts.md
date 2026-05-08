# Progress TS - packages/game/src/g_func.ts

- Statut: Termine
- Dernier lot valide: helpers locaux restants de `g_func.ts` (`computeDoorDistance`, `parseDoorMovedir`, `parseDistance`, helpers vec3/door team/bounds/acceleration) et import non proprietaire `crandom`.
- Prochain lot recommande: Aucun.
- Tests de reference:
  - `npm run verify:g-func`
  - `npm run typecheck`
- Blocages:
  - Aucun pour le lot `Couvert C/H`.
- Decisions:
  - Les 75 symboles portes audites conservent `Validation TS: Couvert C/H`: chaque symbole TS a un en-tete `Original name` correspondant, une `Source declaree` `Quake-2-master/game/g_func.c`, `Category: Ported`, un ownership `packages/game/src/g_func.ts`, et une ligne proprietaire `Valide` dans `game_g_func.c.md`.
  - Aucun doublon d'en-tete `Original name` n'a ete trouve dans les fichiers TS pour ces 75 symboles.
  - Les notes generiques des lignes `Couvert C/H` ont ete videes dans la matrice TS; les preuves detaillees restent dans la matrice C/H.
  - 2026-05-08: `TRAIN_START_ON`, `TRAIN_TOGGLE`, `TRAIN_BLOCK_STOPS`, `SECRET_ALWAYS_SHOOT`, `SECRET_1ST_LEFT` et `SECRET_1ST_DOWN` sont marques `Couvert C/H` par croisement avec les macros `Valide` de `game_g_func.c.md`.
  - 2026-05-08: `ACCELERATION_DISTANCE_SCALE` et `MOVE_SOUND_CHANNEL` sont classes `Category: New` avec `Original name: N/A` et `Source declaree: N/A (local helper)`; ce sont des factorisations locales respectivement de la formule `AccelerationDistance` et du canal sonore `CHAN_NO_PHS_ADD+CHAN_VOICE`.
  - 2026-05-08: `emitMoverSound`, `startMoverLoop` et `stopMoverLoop` sont classes `Category: New` avec `Original name: N/A` et `Source declaree: N/A (local helper)`; ce sont des factorisations locales des blocs C repetes de sons start/end et `s.sound` des movers, sans doublon TS ni export.
  - 2026-05-08: les helpers locaux restants `computeDoorDistance`, `parseDoorMovedir`, `parseDistance`, `addVec3`, `absVec3`, `dotProduct`, `setEntityOrigin`, `computeDoorTriggerBounds`, `getAbsoluteEntityBounds`, `forEachDoorTeam`, `accelerationDistance`, `normalizeVec3`, `scaleVec3`, `subtractVec3`, `vec3Length` et `isZeroVec3` sont classes `Category: New` avec `Original name: N/A` et `Source declaree: N/A (local helper)`; leurs entetes ont ete completes dans `packages/game/src/g_func.ts`.
  - 2026-05-08: `crandom` est classe `Non applicable` dans cette matrice car il est seulement importe depuis `packages/game/src/g_local.ts`; son origine C est la macro `crandom()` de `Quake-2-master/game/g_local.h`, mais `g_func.ts` n'en est pas le proprietaire TS.
