# Progress TS - packages/game/src/p_trail.ts

- Fichier TS: `packages/game/src/p_trail.ts`
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_game_src_p_trail.ts.md`
- Statut: En cours

## Dernier lot traite

- 2026-05-28: `TRAIL_LENGTH`, `NEXT`, `PREV`.
- Decision: `Couvert C/H` pour les trois symboles. Les macros source `TRAIL_LENGTH`, `NEXT` et `PREV` sont validees dans `game_p_trail.c.md` avec proprietaire `packages/game/src/p_trail.ts`; le TS porte la valeur `8` et les formules de ring buffer `((n) + 1) & (TRAIL_LENGTH - 1)` / `((n) - 1) & (TRAIL_LENGTH - 1)`.
- Correction: ajout des entetes TS `Original name`, `Source`, `Category: Ported`, `Fidelity level: Strict` pour les trois symboles; matrice TS alignee avec la matrice C/H.
- Verification ownership/doublon: `TRAIL_LENGTH` est exporte par `p_trail.ts` et reexporte par `packages/game/src/index.ts`; `NEXT` et `PREV` restent des helpers locaux proprietaires de `p_trail.ts`; aucune autre definition TS trouvee dans `packages/`.
- Tests: `npm run verify:p-trail`; `npm run typecheck`.

- 2026-05-26: `vectoyaw` importe dans `p_trail.ts`.
- Decision: `Non applicable` pour ce fichier TS. Le symbole n'est pas defini dans `p_trail.ts`; il est seulement importe depuis `./g_utils.js`.
- Preuve: `audit-portage/validation-incrementale/validation/matrices/game_g_utils.c.md` marque `vectoyaw` comme `Valide` avec proprietaire `packages/game/src/g_utils.ts`; `packages/game/src/g_utils.ts` exporte la fonction avec entete `Original name: vectoyaw`, `Source: game/g_utils.c`, `Category: Ported`.
- Verification ownership/doublon: pas de correction code; le doublon potentiel de la matrice TS etait un import consommateur, pas un second portage proprietaire.
- Tests: non lances, changement documentaire uniquement.

## Prochain lot recommande

- Valider `PlayerTrail_Init`, `PlayerTrail_Add` et `PlayerTrail_New` contre `game_p_trail.c.md`, avec attention aux globals C deplaces dans `runtime.playerTrail`.

## Blocages

- Aucun.
