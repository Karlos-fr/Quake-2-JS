# Progress - Quake-2-master/game/g_trigger.c

## Etat courant

- Statut: En cours
- Dernier lot traite: `InitTrigger`, `multi_wait`, `multi_trigger`, `Use_Multi`, `Touch_Multi`, artefact `return`, `trigger_enable`, `SP_trigger_multiple`, `SP_trigger_once`.
- Verdict du lot: valide pour les fonctions; artefact `return` marque non applicable.

## Preuves session

- C source compare: `Quake-2-master/game/g_trigger.c`
- TS cible compare/corrige: `packages/game/src/g_trigger.ts`
- Runtime verifie: `SpawnEntities` -> `ED_CallSpawn` pour `trigger_once`/`trigger_multiple`, callbacks `touch`/`use`, thinks via `G_RunFrame`.
- `apps/web`: non applicable directement pour ce lot; flux serveur/runtime consomme les triggers, pas de logique parallele attendue.
- `packages/renderer-three`: non applicable pour ce lot; volumes `SVF_NOCLIENT`, pas de modele/particule/temp entity visible produit.

## Tests lances

- `npm run verify:g-trigger`
- `npx tsx ./scripts/verify/quake2-collision-phase7.ts`
- `npm run typecheck`

## Corrections

- `packages/game/src/g_trigger.ts`: `trigger_enable` n'appelle plus implicitement `G_TouchSolids`, absent du code C; l'activation se limite a `solid`, `use` et `linkGameEntity`.

## Prochain lot recommande

- Continuer avec `trigger_relay_use` et `SP_trigger_relay`, puis `trigger_key_use`/`SP_trigger_key` si le lot reste petit.

## Blocages

- Aucun.
