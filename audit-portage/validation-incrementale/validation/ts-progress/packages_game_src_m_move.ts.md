# Progress TS - packages/game/src/m_move.ts

## Etat courant

- Statut: Termine
- Dernier lot valide: fonctions de mouvement monstre `M_CheckBottom`, `SV_movestep`, `M_ChangeYaw`, `SV_StepDirection`, `SV_FixCheckBottom`, `SV_NewChaseDir`, `SV_CloseEnough`, `M_MoveToGoal`, `M_walkmove`, avec helpers locaux.
- Validation TS: fonctions portees `Couvert C/H` via `audit-portage/validation-incrementale/validation/matrices/game_m_move.c.md`; helpers locaux classes `Adapter` ou `New`.

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

Aucun pour ce fichier: matrice TS actuelle close.

## Session 2026-05-28

- Lot traite: `M_CheckBottom`, `M_CheckBottomReal`, `SV_movestep`, `M_ChangeYaw`, `SV_StepDirection`, `SV_FixCheckBottom`, `SV_NewChaseDir`, `SV_CloseEnough`, `M_MoveToGoal`, `M_walkmove`, `relinkMonster`, `setEntityOrigin`, `addVec3`, `ensureCollision`, `asGameEntity`, `randomInt`.
- Preuves:
  - La matrice C/H `game_m_move.c.md` marque les 9 fonctions portees comme `Valide` avec cible proprietaire `packages/game/src/m_move.ts`.
  - Les exports TS correspondent aux proprietaires attendus et sont branches via `g_ai.ts`, `g_phys.ts`, `g_misc.ts`, `g_monster.ts`, `m_mutant.ts` et le reexport `packages/game/src/index.ts`.
  - `M_CheckBottomReal` est un helper local du bloc `realcheck` de `M_CheckBottom`, classe `Adapter` sans ownership C/H distinct.
  - Les autres helpers sont classes `New` avec `Original name: N/A` et `Source: N/A (...)`.
  - Recherche doublons: pas de second portage proprietaire de ces fonctions C; les helpers homonymes locaux dans d'autres fichiers restent des helpers locaux de leur fichier.
- Corrections:
  - Entetes TS completes pour `M_CheckBottomReal` et les helpers locaux.
  - Matrice TS mise a `Reste a auditer: 0`.
- Tests:
  - `npm run verify:m-move` OK.
  - `npm run verify:g-ai` OK.
  - `npm run verify:g-phys` OK.
  - `npm run verify:full-game:server-host` OK.
  - `npm run typecheck` OK.
  - `git diff --check` OK avec avertissements CRLF habituels.

## Blocages

Aucun.
