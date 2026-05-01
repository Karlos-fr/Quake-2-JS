# Progress TS - packages/game/src/g_items.ts

- Statut: En cours
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_game_src_g_items.ts.md`
- Fichier TS: `packages/game/src/g_items.ts`
- Derniere session: validation croisee de toutes les lignes `Couvert C/H`.

## Dernier lot valide

- 45 lignes `Couvert C/H` auditees.
- Les entites `GameItemDefinition` et `GameItemArmorInfo` pointent vers `game_g_local.h.md`; les proprietaires C/H `gitem_s` et `gitem_armor_t` y sont `Valide`.
- Les 43 autres entites couvertes pointent vers `game_g_items.c.md`; les proprietaires C/H correspondants y sont `Valide`.
- Les en-tetes TS des entites couvertes declarent `Original name`, `Source`, `Category: Ported` et un niveau de fidelite.
- Aucun doublon de portage proprietaire detecte dans `packages/`; les references hors `g_items.ts` sont des imports ou des consommateurs.
- Ownership coherent: source `game/g_items.c` ou `game/g_local.h`, cible proprietaire `packages/game/src/g_items.ts`.
- Notes generiques videes dans la matrice TS.

## Tests de reference

- `npm run verify:g-items`
- `npm run typecheck`

## Blocages

- Aucun pour les lignes `Couvert C/H` auditees.

## Prochain lot recommande

- Traiter les lignes non couvertes restantes (`A verifier` et entetes incomplets) par familles: constantes/macros locales, types callback, helpers locaux, puis helpers exportes `New`.
