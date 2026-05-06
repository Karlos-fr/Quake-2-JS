# Progress - Quake-2-master/game/m_gladiator.h

## Lot valide pendant cette session

- `FRAME_stand1` a `FRAME_stand7`
- `FRAME_walk1` a `FRAME_walk16`
- `FRAME_run1` a `FRAME_run6`
- `FRAME_melee1` a `FRAME_melee17`
- Session 2026-05-06: `FRAME_attack1` a `FRAME_attack9`, `FRAME_pain1` a `FRAME_pain6`, `FRAME_death1` a `FRAME_death22`, `FRAME_painup1` a `FRAME_painup7`, `MODEL_SCALE`

## Preuves de validation

- Comparaison directe avec `Quake-2-master/game/m_gladiator.h`: valeurs 0 a 45 identiques dans `packages/game/src/m_gladiator.ts`.
- Session 2026-05-06: comparaison directe avec `Quake-2-master/game/m_gladiator.h`: valeurs 46 a 89 et `MODEL_SCALE` identiques dans `packages/game/src/m_gladiator.ts`.
- Ownership confirme: constantes portees dans `packages/game/src/m_gladiator.ts`, fichier TS proprietaire de `m_gladiator.h` et `m_gladiator.c`.
- Doublons: pas de port concurrent pour ces constantes hors exports normaux du module proprietaire; les noms generiques `FRAME_*` existent dans d'autres monstres mais dans leurs modules propres.
- Commentaires d'en-tete: entites macro sans commentaire de fonction requis; l'en-tete de `m_gladiator.ts` declare bien la source `game/m_gladiator.h and game/m_gladiator.c`.
- Runtime: les bornes de frames sont consommees par `gladiator_move_stand`, `gladiator_move_walk`, `gladiator_move_run` et `gladiator_move_attack_melee`; ces moves sont atteignables via `SP_monster_gladiator`, `ED_CallSpawn`, `G_RunFrame`/`M_MoveFrame`, callbacks `monsterinfo.stand/walk/run/melee`, et restauration save.
- Session 2026-05-06: les bornes restantes sont consommees par `gladiator_move_attack_gun`, `gladiator_move_pain`, `gladiator_move_pain_air`, `gladiator_move_death`; `MODEL_SCALE` est applique dans `SP_monster_gladiator`. Ces flux sont atteignables via `monsterinfo.attack`, `pain`, `die`, `M_MoveFrame`, callbacks de move et restauration save.
- `apps/web`: pas de logique parallele gladiator; le navigateur passe par le flux full-game/runtime et consomme la refresh frame produite.
- `packages/renderer-three`: les frames sont visibles via les entites runtime `modelindex/frame/oldframe` construites par le client puis consommees par le renderer Three; pas de branchement specifique gladiator attendu dans le renderer.

## Tests lances

- `npm run verify:m-gladiator:header`
- `npm run verify:m-gladiator`
- `npm run verify:m-gladiator:source-parity`
- `npm run verify:full-game:render-source`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

## Decisions

- Le test `scripts/verify/quake2-m-gladiator-header.ts` a ete etendu pour verifier explicitement toutes les constantes du lot `stand/walk/run/melee`, et pas seulement des points de controle disperses.
- Session 2026-05-06: le test `scripts/verify/quake2-m-gladiator-header.ts` a ete etendu pour verifier explicitement toutes les constantes restantes `attack/pain/death/painup` et `MODEL_SCALE`.

## Prochain lot recommande

Aucun lot restant dans `game_m_gladiator.h.md`: toutes les lignes sont `Valide`.

## Blocages

Aucun.
