# Progress TS - packages/game/src/local-game-bootstrap.ts

- Statut: Termine
- Dernier lot valide: fichier complet (21 symboles).
- Prochain lot recommande: Aucun.
- Tests de reference:
  - `npm run verify:g-items`
  - `npm run verify:p-weapon`
  - `npm run verify:g-weapon`
  - `npm run verify:local-gameplay-sync`
  - `npx tsx ./scripts/verify/quake2-local-demo-weapons.ts`
  - `npm run verify:full-game:three-renderer`
  - `npm run typecheck`

## Decisions

- Tous les symboles sont `Category: New` avec `Original name: N/A` et `Source: N/A (local gameplay bootstrap)`.
- Le fichier est un bootstrap gameplay local qui reutilise les portages proprietaires `g_items.ts`, `p_weapon.ts` et `g_weapon.ts`; il ne devient pas proprietaire d'entites C/H.
- Les hooks locaux ne masquent pas les proprietaires C/H: `FindItem`, `Add_Ammo`, `Drop_Item`, `SetRespawn`, `ChangeWeapon`, `Use_Weapon`, `Think_Weapon` et les fonctions `fire_*` restent portes dans leurs fichiers sources dedies.

## Integration

- Runtime: integre via `packages/client/src/local-session.ts`, `packages/game/src/index.ts` et les hooks de gameplay local.
- apps/web: integre via `apps/web/src/local-client-controller.ts` pour les raccourcis d'armes et via le flux local-session.
- renderer-three: non proprietaire; il consomme les sorties aval du runtime local (refresh frame, sons/evenements, entites), sans logique gameplay dupliquee.
