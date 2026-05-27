# Progress TS - packages/game/src/m_move.ts

## Etat courant

- Statut: En cours
- Dernier lot valide: constantes/globals de tete `STEPSIZE`, `DI_NODIR`, `c_yes`, `c_no`.
- Validation TS: `Couvert C/H` via `audit-portage/validation-incrementale/validation/matrices/game_m_move.c.md`.

## Session 2026-05-26

- Lot traite: `STEPSIZE`, `DI_NODIR`, `CONTENTS_SOLID`, `c_yes`, `c_no`.
- Preuves:
  - `STEPSIZE`, `DI_NODIR`, `c_yes`, `c_no` sont declares dans `Quake-2-master/game/m_move.c`.
  - La matrice C/H `game_m_move.c.md` marque ces quatre entites `Valide` avec cible proprietaire `packages/game/src/m_move.ts`.
  - `packages/game/src/m_move.ts` expose bien les quatre symboles portages attendus; entetes TS ajoutes.
- Correction:
  - `CONTENTS_SOLID` etait une redclaration locale de `q_shared`; remplace par l'import `CONTENTS_SOLID` depuis `../../qcommon/src/index.js`.
  - La ligne TS matrix obsolette `CONTENTS_SOLID` a ete retiree, car ce symbole n'est plus proprietaire dans `m_move.ts`.
- Tests:
  - `npm run verify:m-move` OK.
  - `npm run typecheck` OK.

## Prochain lot recommande

Valider `M_CheckBottom` avec son helper inseparable `M_CheckBottomReal`, en s'appuyant sur la matrice C/H `game_m_move.c.md` et en verifiant que le helper local n'est pas presente comme portage proprietaire distinct.

## Blocages

Aucun.
