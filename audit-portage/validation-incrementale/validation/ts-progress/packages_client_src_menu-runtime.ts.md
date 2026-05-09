# Progress TS - packages/client/src/menu-runtime.ts

- Statut: Termine
- Dernier lot valide: fichier complet, 8 symboles (`M_PushMenu`, `M_ForceMenuOff`, `M_PopMenu`, `Default_MenuKey`, `registerMenuCommand`, `M_Init`, `M_Draw`, `M_Keydown`).
- Prochain lot recommande: aucun.
- Tests de reference: `npm run verify:menu`, `npm run typecheck`.
- Decisions:
  - Les 7 fonctions portees sont couvertes par les lignes proprietaires `Valide` de `client_menu.c.md`.
  - `registerMenuCommand` est un helper local idempotent, classe `Category: New` avec `Original name: N/A` et `Source: N/A (local helper)`.
- Blocages: aucun.
