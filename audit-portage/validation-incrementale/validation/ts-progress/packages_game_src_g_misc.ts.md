# Progress TS croise - packages/game/src/g_misc.ts

- Fichier TS: `packages/game/src/g_misc.ts`
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_game_src_g_misc.ts.md`
- Statut: Termine

## Dernier lot traite

- Lot: dernier bloc TS restant (`START_OFF`, `CLOCK_MESSAGE_SIZE`, imports `crandom`/`random`, helpers locaux de vecteurs/entites, `initialize_misc_gib`, doublon potentiel `scaleVec3`).
- Decision: fichier TS referme cote croisement.
- `START_OFF` et `CLOCK_MESSAGE_SIZE` sont des macros `game/g_misc.c` deja couvertes par la matrice C/H `game_g_misc.c.md`.
- `crandom` et `randomFloat` correspondent a des imports de `packages/game/src/g_local.ts`; `g_misc.ts` n'est pas le proprietaire.
- Les helpers locaux sont classes `Category: New` avec `Original name: N/A` et `Source declaree: N/A (...)`.
- `scaleVec3` ne revendique plus le portage proprietaire de `VectorScale`; le proprietaire reste `packages/math/src/q_shared.ts`.

## Corrections appliquees

- Commentaires d'en-tete ajoutes ou corriges dans `packages/game/src/g_misc.ts` pour les helpers locaux `New`.
- Matrice TS mise a jour pour supprimer les `A verifier`, le doublon potentiel et l'entete incomplet.

## Tests

- `npm run typecheck`: OK.
- `npm run verify:g-misc`: bloque avant scenario sur `packages/game/src/g_local.ts` avec `ReferenceError: Cannot access 'RUNTIME_MOVETYPE_NONE' before initialization`.

## Integration runtime/apps/web/renderer-three

- Runtime: les helpers restent locaux a `g_misc.ts`; aucune modification comportementale.
- `apps/web`: non applicable, aucune logique web ajoutee ou deplacee.
- `renderer-three`: non applicable, aucune sortie de rendu modifiee.

## Prochain lot recommande

- Aucun pour `packages/game/src/g_misc.ts` cote validation TS croisee.
