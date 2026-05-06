# Progress - Quake-2-master/game/m_soldier.h

## Etat courant

- Statut: Termine
- Dernier lot valide: `FRAME_pain101`..`FRAME_death610` et `MODEL_SCALE`, en complement du lot deja valide `FRAME_attak101`..`FRAME_duck05`
- Entites validees dans la matrice: 476 / 476
- Blocages: aucun

## Preuves de session

- Comparaison source: `Quake-2-master/game/m_soldier.h` valeurs 0..49 et usages C dans `Quake-2-master/game/m_soldier.c` (`soldier_move_attack1`, `soldier_move_attack2`, `soldier_move_attack3`, `soldier_move_attack4`, `soldier_move_duck`)
- Cible proprietaire: `packages/game/src/m_soldier.ts`
- Header/fichier: en-tete de `m_soldier.ts` verifie, source `game/m_soldier.h`/`game/m_soldier.c`, categorie portee/declarative explicite
- Runtime: frames utilisees par les moves soldier, atteignables via spawn `monster_soldier*`, `G_RunFrame` -> `monster_think` -> `M_MoveFrame`
- apps/web: le flux full-game declenche le runtime porte et expose les snapshots client via `full-game-render-source`
- renderer-three: les frames/modeles/skinnum visibles sont consommes via `ClientRefreshFrame` et `refresh-entity-sync` pour les MD2
- Session finale: comparaison exhaustive des 475 macros `FRAME_*` et de `MODEL_SCALE` entre `Quake-2-master/game/m_soldier.h` et `packages/game/src/m_soldier.ts`; les plages restantes sont declaratives et les frames animees attendues sont branchees via `soldier_move_pain*`, `soldier_move_run`, `soldier_move_attack6`, `soldier_move_stand*`, `soldier_move_walk*`, `soldier_move_death*`, puis `M_MoveFrame`. Les macros generees non referencees par `m_soldier.c` restent exportees avec les valeurs originales, sans integration runtime attendue par le C.

## Tests de reference

- `npm run verify:m-soldier:header`
- `npm run verify:m-soldier`
- `npm run verify:m-soldier:source-parity`
- `npm run verify:full-game:render-source`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

## Prochain lot recommande

Aucun lot restant dans `m_soldier.h`: toutes les constantes de frame et `MODEL_SCALE` sont validees.
