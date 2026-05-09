# Progress TS - packages/client/src/menu-misc.ts

- Fichier TS: `packages/client/src/menu-misc.ts`
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_client_src_menu-misc.ts.md`
- Lot courant: fichier complet, 4 symboles (`M_Menu_Video_f`, `M_Quit_Key`, `M_Quit_Draw`, `M_Menu_Quit_f`).
- Dernier lot valide: classement TS croise complet du fichier.
- Prochain lot recommande: aucun.
- Tests de reference: `npm run verify:menu`; `npm run verify:full-game:commands`; `npm run verify:full-game:demo-cleanup`; `npm run typecheck`.
- Blocages: aucun.
- Decisions:
  - Les quatre symboles sont `Category: Ported`, exportes, avec `Original name` identique au symbole TS et `Source declaree: Quake-2-master/client/menu.c`.
  - La matrice C/H `client_menu.c.md` contient les lignes de definition `Valide` pour `M_Menu_Video_f`, `M_Quit_Key`, `M_Quit_Draw` et `M_Menu_Quit_f`; les lignes prototype separees sont `Non applicable`.
  - `packages/client/src/menu-misc.ts` est le proprietaire attendu pour ces entites `client/menu.c`; aucun doublon TS trouve pour ces `Original name`.
  - `apps/web` consomme ces chemins via le runtime menu et les hooks video/quit; `renderer-three` reste concerne comme adapter de draw/ref, sans ownership client deplace.
