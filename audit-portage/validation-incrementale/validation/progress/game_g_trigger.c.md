# Progress - Quake-2-master/game/g_trigger.c

## Etat courant

- Statut: Termine
- Dernier lot traite: `trigger_monsterjump_touch` et `SP_trigger_monsterjump`.
- Verdict du lot: valide.

## Preuves session

- C source compare: `Quake-2-master/game/g_trigger.c`
- TS cible compare: `packages/game/src/g_trigger.ts`
- Runtime verifie: `SP_trigger_monsterjump` initialise `SOLID_TRIGGER`, `MOVETYPE_NONE`, `SVF_NOCLIENT`, conserve les defaults speed/height, branche `trigger_monsterjump_touch`, parse `height` comme le `st.height` C, convertit l'angle via `InitTrigger`, et reste atteignable via `ED_CallSpawn` puis `G_TouchTriggers`.
- `trigger_monsterjump_touch` verifie: ignore `FL_FLY`, `FL_SWIM`, `SVF_DEADMONSTER` et non-monstre; applique XY meme sans `groundentity`; sur monstre au sol, efface `groundentity` et applique la vitesse Z depuis `movedir[2]`.
- `apps/web`: integration attendue indirecte via runtime serveur/full-game; le trigger serveur modifie la vitesse d'un monstre, puis les snapshots/positions restent consommes par le flux web. Aucune logique parallele attendue dans `apps/web`.
- `packages/renderer-three`: integration attendue indirecte si le monstre touche le trigger, car la position/animation visible de l'entite est consommee via snapshots/scene; le trigger lui-meme reste `SVF_NOCLIENT` et ne produit pas de modele, frame, image, particule, beam, dlight, temp entity, areabit ou camera propre.

## Tests lances

- `npm run verify:g-trigger`
- `npm run verify:full-game:server-host`
- `npm run verify:local-gameplay-sync`
- `npm run verify:web-render-order`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck` (bloque hors lot: `packages/game/src/g_spawn.ts(545,56)` appel avec 1 argument au lieu de 2; `packages/game/src/g_spawn.ts(591,108)` callback `void` non assignable a `never`)

## Corrections

- `scripts/verify/quake2-g-trigger.ts`: renforcement de `verifyTriggerMonsterJump` pour couvrir init spawn, callback, filtres de touch, cas airborne, saut au sol et dispatch runtime `ED_CallSpawn` -> `G_TouchTriggers`.

## Prochain lot recommande

- Aucun lot restant dans `game_g_trigger.c.md`: toutes les lignes sont `Valide` ou `Non applicable`.

## Blocages

- `npm run typecheck` bloque hors lot dans `packages/game/src/g_spawn.ts`: erreur TS2554 ligne 545 et TS2345 ligne 591.
