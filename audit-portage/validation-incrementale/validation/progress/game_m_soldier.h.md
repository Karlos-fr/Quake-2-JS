# Progress - Quake-2-master/game/m_soldier.h

## Etat courant

- Statut: En cours
- Dernier lot valide: `FRAME_attak101`..`FRAME_attak112`, `FRAME_attak201`..`FRAME_attak218`, `FRAME_attak301`..`FRAME_attak309`, `FRAME_attak401`..`FRAME_attak406`, `FRAME_duck01`..`FRAME_duck05`
- Entites validees dans la matrice: 50 / 476
- Blocages: aucun

## Preuves de session

- Comparaison source: `Quake-2-master/game/m_soldier.h` valeurs 0..49 et usages C dans `Quake-2-master/game/m_soldier.c` (`soldier_move_attack1`, `soldier_move_attack2`, `soldier_move_attack3`, `soldier_move_attack4`, `soldier_move_duck`)
- Cible proprietaire: `packages/game/src/m_soldier.ts`
- Header/fichier: en-tete de `m_soldier.ts` verifie, source `game/m_soldier.h`/`game/m_soldier.c`, categorie portee/declarative explicite
- Runtime: frames utilisees par les moves soldier, atteignables via spawn `monster_soldier*`, `G_RunFrame` -> `monster_think` -> `M_MoveFrame`
- apps/web: le flux full-game declenche le runtime porte et expose les snapshots client via `full-game-render-source`
- renderer-three: les frames/modeles/skinnum visibles sont consommes via `ClientRefreshFrame` et `refresh-entity-sync` pour les MD2

## Tests de reference

- `npm run verify:m-soldier:header`
- `npm run verify:m-soldier`
- `npm run verify:m-soldier:source-parity`
- `npm run verify:full-game:render-source`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

## Prochain lot recommande

Continuer avec `FRAME_pain101`..`FRAME_pain105`, `FRAME_pain201`..`FRAME_pain207`, `FRAME_pain301`..`FRAME_pain318`, puis `FRAME_pain401`..`FRAME_pain417` si le lot reste coherent, en couvrant les moves de douleur et leurs branches runtime.
