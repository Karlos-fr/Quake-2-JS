# Progress - Quake-2-master/game/m_gunner.h

- Statut: En cours
- Dernier lot valide: macros de frames `FRAME_stand01` a `FRAME_stand70`, `FRAME_walk01` a `FRAME_walk24`, `FRAME_run01` a `FRAME_run08`, `FRAME_runs01` a `FRAME_runs06`.
- Preuves session: comparaison directe `Quake-2-master/game/m_gunner.h` vs `packages/game/src/m_gunner.ts`; comparaison des moves `gunner_move_fidget`, `gunner_move_stand`, `gunner_move_walk`, `gunner_move_run`, `gunner_move_runandshoot` avec `Quake-2-master/game/m_gunner.c`; runtime verifie via `SP_monster_gunner` -> `walkmonster_start` -> `M_MoveFrame`; flux visible verifie via sorties `s.frame`/`modelindex` consommees par client, apps/web et renderer-three.
- Tests lances: `npm run verify:m-gunner:header`, `npm run verify:m-gunner`, `npm run verify:m-gunner:source-parity`, `npm run typecheck`.
- Corrections: renforcement de `scripts/verify/quake2-m-gunner-header.ts` avec sentinelles `FRAME_stand70`, `FRAME_walk01`, `FRAME_run08`, `FRAME_runs06`.
- Blocages: aucun.
- Prochain lot recommande: macros `FRAME_attak101` a `FRAME_attak121`, puis `FRAME_attak201` a `FRAME_attak230` si le lot reste coherent avec les moves d'attaque grenade/chaine deja couverts par les tests source-parity.
