# Progress TS - packages/client/src/menu-main-game.ts

- Fichier TS: `packages/client/src/menu-main-game.ts`
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_client_src_menu-main-game.ts.md`
- Statut: Termine
- Dernier lot valide: validation croisee complete des 33 symboles du fichier.
- Prochain lot recommande: Aucun.

## Session 2026-05-09

- Lot traite: main menu, credits, game menu, load/save menu, callbacks et tables associees.
- Validation: 31 symboles ported marques `Couvert C/H` apres verification de `client_menu.c.md`; `parseCreditsBuffer` classe `Category: New` avec metadonnees N/A explicites; `Developer_searchpath` classe `Category: Adapter` vers le hook hote, sans masquer le port proprietaire `packages/filesystem/src/files.ts`.
- Corrections: ajout des commentaires d'en-tete manquants pour `idcredits`, `xatcredits`, `roguecredits`, `parseCreditsBuffer` et le wrapper local `Developer_searchpath`.
- Tests de reference: `npm run verify:menu`, `npm run typecheck`.
- Runtime/apps-web/renderer-three: flux runtime menu couvert par `M_Init`/`M_Keydown`/`M_Draw` et les commandes `menu_*`; integration web indirecte via le runtime client, sans logique parallele attendue dans ce fichier; renderer-three non applicable directement, les sorties sont des appels `ref`/qmenu et non des entites de scene persistantes.
- Blocages: aucun.
