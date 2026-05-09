# Progress TS - packages/game/src/g_turret.ts

- Statut: Termine
- Lot traite: fichier complet, 21 symboles
- Dernier lot valide: `TURRET_BREACH_FIRE`, `ZERO_VEC3`, les 12 portages propriétaires de `game/g_turret.c`, et les 7 helpers locaux.
- Prochain lot recommande: Aucun.
- Tests de reference: `npm run verify:g-turret`, `npm run verify:full-game:server-host`, `npm run verify:web-render-order`, `npm run verify:full-game:three-renderer`, `npm run typecheck`.

## Decisions

- Les 12 fonctions portées sont `Couvert C/H`: la matrice C/H `game_g_turret.c.md` les marque `Valide` et désigne `packages/game/src/g_turret.ts` comme propriétaire TS attendu.
- `TURRET_BREACH_FIRE`, `ZERO_VEC3`, `parseEntityFloat`, `wrapAngleDelta`, `vectorMA`, `subtractVec3`, `scaleVec3`, `vectorLength` et `clamp` sont `Category: New` avec `Original name: N/A` et `Source declaree: N/A (...)` explicites dans les entêtes et la matrice.
- Aucun doublon propriétaire détecté pour les symboles `game/g_turret.c`; les helpers vectoriels homonymes dans d'autres fichiers restent locaux à leurs modules.
- Intégration runtime: via `g_spawn.ts`/`ED_CallSpawn`, callbacks `think`/`blocked`/`die`, `G_RunFrame`, projectile rocket et événements son.
- Intégration apps/web: via le server host/full-game qui consomme les entités serveur et événements runtime.
- Intégration renderer-three: via les snapshots entités brush/driver/projectile et le flux full-game renderer; `g_turret.ts` ne devient pas propriétaire renderer.

## Blocages

- Aucun.
