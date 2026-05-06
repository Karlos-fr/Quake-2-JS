# Progress - Quake-2-master/game/m_mutant.h

- Statut: En cours
- Dernier lot valide: `FRAME_attack01`..`FRAME_attack15`, `FRAME_death101`..`FRAME_death109`, `FRAME_death201`..`FRAME_death210`, `FRAME_pain101`..`FRAME_pain105`, `FRAME_pain201`..`FRAME_pain206`, `FRAME_pain301`..`FRAME_pain311`
- Tests de reference: `npm run verify:m-mutant:header`, `npm run verify:m-mutant:source-parity`, `npm run verify:m-mutant`, `npm run typecheck`
- Decisions: les macros de frames sont des constantes de modele consommees indirectement par les `mmove_t` mutant; le flux runtime visible passe par `SP_monster_mutant`/`ED_CallSpawn`, `M_MoveFrame`, `edict.s.frame`, la synchronisation client/server des `entity_state_t`, puis les adapters `apps/web` et `renderer-three` qui consomment les entites refresh MD2 (`modelindex`, `frame`, `oldframe`).
- Blocages: aucun sur le lot valide.
- Prochain lot recommande: valider `FRAME_run03`..`FRAME_run08`, puis `FRAME_stand101`..`FRAME_stand164` si le lot reste mecanique et couvert par `verify:m-mutant:header`/`verify:m-mutant`.
