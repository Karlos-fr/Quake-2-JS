# Progress TS - packages/game/src/p_hud.ts

- Fichier TS: `packages/game/src/p_hud.ts`
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_game_src_p_hud.ts.md`
- Statut: En cours
- Dernier lot traite: interfaces TS `GameHudHooks` et `GameHudHelpComputerData`
- Prochain lot recommande: croiser `MoveClientToIntermission` avec `Quake-2-master/game/p_hud.c` et `validation/matrices/game_p_hud.c.md`.
- Tests de reference: `npm run verify:p-hud`, `npm run typecheck`
- Blocages: aucun

## 2026-05-28 - Interfaces locales HUD

- `GameHudHooks`: classe `Category: New`, avec `Original name: N/A` et `Source: N/A (local HUD hook contract)` dans l'entete et la matrice. Contrat local d'emission de layout, sans entite C/H proprietaire.
- `GameHudHelpComputerData`: classe `Category: New`, avec `Original name: N/A` et `Source: N/A (local help-computer data contract)` dans l'entete et la matrice. Contrat local pour injecter les donnees globales `game`/`level` lues par le port de `HelpComputer`.
- Integration runtime/apps-web/renderer-three: non applicable pour ce lot de types; les flux concrets restent portes par les fonctions HUD qui les consomment.
