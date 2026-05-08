# Progress TS - packages/game/src/g_target.ts

- Dernier lot valide: fichier complet `packages/game/src/g_target.ts`.
- Lot traite: 17 lignes deja `Couvert C/H`, 22 lignes portees restantes de `use_target_spawner` a `SP_target_earthquake`, 19 constantes/helpers locaux classes `Category: New`, et l'import non proprietaire `crandom`.
- Tests de reference: `npm run verify:g-target`, `npm run verify:full-game:server-host`, `npm run verify:web-render-order`, `npm run verify:full-game:three-renderer`, `npm run verify:beam-sync`, `npm run typecheck`.
- Blocages: aucun.
- Prochain lot recommande: aucun pour ce fichier.

## Decisions

- 2026-05-08: les fonctions portees de `g_target.ts` sont proprietaires de `Quake-2-master/game/g_target.c` et sont marquees `Couvert C/H` sur preuve de la matrice C/H `game_g_target.c.md`.
- 2026-05-08: les constantes locales de spawnflags/copie bornee et les helpers locaux (`emitRegisteredSound`, `stringsEqualIgnoreCase`, `isLowercaseLetter`, `truncateCString`, `vec3Equal`, `addVec3`, `subtractVec3`, `scaleVec3`, `normalizeVec3`) sont classes `Category: New` avec `Original name: N/A` et `Source declaree: N/A (local constants/local helper)`.
- 2026-05-08: `crandom` est classe `Non applicable` dans cette matrice car il est seulement importe depuis `packages/game/src/g_local.ts`; son origine C est la macro `crandom()` de `Quake-2-master/game/g_local.h`, mais `g_target.ts` n'en est pas le proprietaire TS.
- 2026-05-08: integration runtime confirmee via spawn table `g_spawn.ts`, callbacks use/think, flush runtime sons/temp-entities/configstrings, et harnais `verify:g-target`.
- 2026-05-08: integration apps/web et renderer-three jugee couverte en aval par les flux full-game/server-host, render order, three renderer et beam sync pour les sorties visibles ou audio.
