# Progress TS - packages/game/src/p_trail.ts

- Fichier TS: `packages/game/src/p_trail.ts`
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_game_src_p_trail.ts.md`
- Statut: Termine

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

- 2026-05-28: `PlayerTrail_Init`, `PlayerTrail_Add`, `PlayerTrail_New`, `PlayerTrail_PickFirst`, `PlayerTrail_PickNext`, `PlayerTrail_LastSpot`.
- Decision: `Couvert C/H` pour les six fonctions. La matrice `game_p_trail.c.md` marque ces fonctions source comme `Valide` avec proprietaire attendu `packages/game/src/p_trail.ts`.
- Verification entetes: les six fonctions TS ont `Original name`, `Source`, `Category: Ported`, `Fidelity level` et un comportement de tete coherent avec `game/p_trail.c`.
- Verification ownership/doublon: aucune autre definition TS de ces fonctions trouvee dans `packages/`; le package `game` correspond au module source `game`. Les globals C `trail`, `trail_head` et `trail_active` restent portes sur `runtime.playerTrail`, deja valides dans la matrice C/H. `vectoyaw` reste un import consommateur non proprietaire documente.
- Integration: runtime atteint via `SpawnEntities`/`ClientBeginServerFrame`/AI monster trail; `apps/web` consomme indirectement le flux serveur local; `renderer-three` non applicable, ces fonctions ne produisent pas directement de sortie rendu.
- Tests: `npm run verify:p-trail`; `npm run verify:g-ai`; `npm run verify:p-client`; `npm run verify:g-spawn`; `npm run typecheck`.

## Prochain lot recommande

- Aucun.

## Blocages

- Aucun.
