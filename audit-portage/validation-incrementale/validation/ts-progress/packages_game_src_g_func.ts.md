# Progress TS - packages/game/src/g_func.ts

- Statut: En cours
- Dernier lot valide: 75 lignes `Couvert C/H` de la matrice TS confirmees par croisement avec `game_g_func.c.md`.
- Prochain lot recommande: traiter les lignes restantes `A verifier` / `Entete incomplet` hors scope de cette session.
- Tests de reference:
  - `npm run verify:g-func`
  - `npm run typecheck`
- Blocages:
  - Aucun pour le lot `Couvert C/H`.
- Decisions:
  - Les 75 symboles portes audites conservent `Validation TS: Couvert C/H`: chaque symbole TS a un en-tete `Original name` correspondant, une `Source declaree` `Quake-2-master/game/g_func.c`, `Category: Ported`, un ownership `packages/game/src/g_func.ts`, et une ligne proprietaire `Valide` dans `game_g_func.c.md`.
  - Aucun doublon d'en-tete `Original name` n'a ete trouve dans les fichiers TS pour ces 75 symboles.
  - Les notes generiques des lignes `Couvert C/H` ont ete videes dans la matrice TS; les preuves detaillees restent dans la matrice C/H.
