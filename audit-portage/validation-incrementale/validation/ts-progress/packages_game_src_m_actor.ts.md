# Progress TS - packages/game/src/m_actor.ts

- Statut: Termine
- Dernier lot valide: fichier complet.
- Symboles traites: 530.
- Couvert C/H: 521.
- Helpers/New valides: 9.
- Prochain lot recommande: Aucun.

## Decisions

- Les constantes `FRAME_*` et `MODEL_SCALE` sont couvertes par `game_m_actor.h.md`, deja `Valide`, avec `packages/game/src/m_actor.ts` comme proprietaire TS attendu.
- `MZ2_ACTOR_MACHINEGUN_1` est couvert par `game_q_shared.h.md`; l'ownership local est acceptable car la matrice C/H des muzzle flashes le designe explicitement pour l'acteur.
- Les tables, moves et fonctions gameplay `m_actor.c` sont couvertes par `game_m_actor.c.md`, deja `Valide`, sans revalidation comportementale inutile.
- `MONSTER_PAUSE_FOREVER`, `makeFrames`, `actorNameForEntity`, `randomInt`, `setVec3`, `subtractVec3`, `addVec3`, `scaleVec3`, `normalizeVec3` sont du code local `Category: New` avec `Original name: N/A` et `Source: N/A (...)` explicites.

## Tests de reference

- `npm run verify:m-actor`
- `npm run verify:m-actor:header`
- `npm run verify:local-gameplay-sync`
- `npm run verify:full-game:server-host`
- `npm run verify:web-render-order`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

## Blocages

- Aucun.
