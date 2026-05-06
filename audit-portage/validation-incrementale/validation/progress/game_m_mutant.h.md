# Progress - Quake-2-master/game/m_mutant.h

- Statut: Termine
- Dernier lot valide: toutes les macros restantes de `m_mutant.h`: `FRAME_run03`..`FRAME_run08`, `FRAME_stand101`..`FRAME_stand164`, `FRAME_walk01`..`FRAME_walk23`, puis `MODEL_SCALE`
- Tests de reference: `npm run verify:m-mutant:header`, `npm run verify:m-mutant:source-parity`, `npm run verify:m-mutant`, `npm run verify:full-game:render-source`, `npm run verify:full-game:three-renderer`, `npm run typecheck`
- Decisions: les macros de frames sont des constantes de modele consommees indirectement par les `mmove_t` mutant; le flux runtime visible passe par `SP_monster_mutant`/`ED_CallSpawn`, `M_MoveFrame`, `edict.s.frame`, la synchronisation client/server des `entity_state_t`, puis les adapters `apps/web` et `renderer-three` qui consomment les entites refresh MD2 (`modelindex`, `frame`, `oldframe`).
- Blocages: aucun.
- Prochain lot recommande: aucun, toutes les constantes de frame et `MODEL_SCALE` de `m_mutant.h` sont validees.
