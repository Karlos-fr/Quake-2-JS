# Progress TS - packages/game/src/m_boss2.ts

- Statut: Termine
- Dernier lot valide: fichier complet, 259 symboles.
- Prochain lot recommande: aucun pour `m_boss2.ts`.
- Tests de reference: `npm run verify:m-boss2:header`, `npm run verify:m-boss2:source-parity`, `npm run verify:m-boss2`, `npm run verify:full-game:server-host`, `npm run verify:web-render-order`, `npm run verify:full-game:three-renderer`, `npm run typecheck`.

## Session

- Lot traite: fichier complet en lot 20x.
- Resultat matrice: 239 symboles `Couvert C/H`, 20 symboles `Valide`, `Reste a auditer: 0`.
- Ownership: `FRAME_*` et `MODEL_SCALE` sont rattaches a `game_m_boss2.h.md`; les `MZ2_BOSS2_*` a `game_q_shared.h.md`; les fonctions, sons portes et tables/moves boss2 a `game_m_boss2.c.md`.
- Helpers/adapters: `makeFrames`, `makeIndexedFrames`, `indexedThinks`, `precacheBoss2Assets`, `soundOptions`, `setVec3`, `subtractVec3`, `vectorMA`, `normalizeVec3` et `lengthVec3` sont `Category: New` avec `Original name: N/A` et `Source: N/A (...)`; `fireBoss2Rocket`, `fireBoss2Machinegun` et `boss2FlashOffset` sont `Category: Adapter` avec `Original name: N/A`.
- Corrections appliquees: entetes des helpers/adapters prives completes dans `packages/game/src/m_boss2.ts`; sources des entetes de fonctions portees normalisees vers `Quake-2-master/game/m_boss2.c`; matrice TS complete mise a jour; avancement global TS mis a jour.
- Runtime: integre via `g_spawn.ts` (`monster_boss2`), `SP_monster_boss2`, `flymonster_start`, callbacks `monsterinfo`, `G_RunFrame` / `monster_think` / `M_MoveFrame`, tirs machinegun/rocket, sons, douleur et mort.
- apps/web: integre via le host full-game/server-host qui consomme le runtime game porte, les snapshots et les evenements son/muzzle/projectile.
- renderer-three: integre comme consommateur des sorties visibles produites par le runtime/client (modele boss2, frames, skin, projectiles `EF_ROCKET`, muzzleflashes, dlights/trails); non proprietaire de la logique gameplay.
