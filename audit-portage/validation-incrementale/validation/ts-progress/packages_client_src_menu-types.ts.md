# Progress TS - packages/client/src/menu-types.ts

- Statut: Termine
- Dernier lot traite: fichier complet, 26 symboles.
- Validation: 12 symboles `Couvert C/H`, 10 symboles `New` valides, 4 adapters valides.
- Tests de reference: `npm run verify:menu`, `npm run typecheck`.
- Decisions:
  - Les constantes, sons, `menulayer_t` et `PlayerModelInfo` restent proprietaires du portage `client/menu.c` dans `menu-types.ts`.
  - `ClientMenuState` est un adapter de decoupage: les champs qui portent des globals C restent couverts par leurs lignes C/H individuelles.
  - `menuError`, `getServerState` et `startLocalSound` sont des adapters locaux vers les ports proprietaires existants.
  - Les contrats de hooks, types de callback et factories de contexte sont du code nouveau avec `Original name: N/A` et `Source: N/A (...)`.
- Prochain lot recommande: aucun.
- Blocages: aucun.

