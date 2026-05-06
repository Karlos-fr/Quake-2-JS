# Progress - Quake-2-master/game/m_boss32.h

## Etat courant

- Dernier lot valide: macros `FRAME_death01` a `MODEL_SCALE`, soit toute la matrice restante apres le lot deja valide `FRAME_attak101` a `FRAME_attak213`.
- Verdict: `Valide` pour les 492 constantes/macros du header.
- Fichier TS proprietaire: `packages/game/src/m_boss32.ts`.
- Commentaire d'en-tete: commentaire de module `m_boss32.ts` verifie pour le port conjoint `game/m_boss32.h` et `game/m_boss32.c`; macros declaratives sans commentaire individuel attendu.

## Preuves de la session

- Comparaison C/H vs TS exhaustive: les 492 definitions `FRAME_*` et `MODEL_SCALE` de `Quake-2-master/game/m_boss32.h` existent dans `packages/game/src/m_boss32.ts`, avec noms originaux conserves et valeurs identiques.
- Ownership/renommage/doublons: cible proprietaire confirmee dans `packages/game/src/m_boss32.ts`; `packages/game/src/index.ts` ne fait que re-exporter/importer le module; aucun renommage ni doublon proprietaire detecte pour le header.
- Usages/moves: les familles runtime actives sont branchees par les moves Makron `makron_move_stand`, `makron_move_run`, `makron_move_walk`, `makron_move_pain4/5/6`, `makron_move_death2/3`, `makron_move_sight`, `makron_move_attack3/4/5`. Les premieres familles declaratives `attak101..213`, `death01..50`, `pain101..325`, `stand01..51`, `walk01..25` restent des frames de modele rider non referencees par les moves Makron actifs de `m_boss32.c`.
- Runtime: flux attendu verifie via Jorg/Makron (`m_boss31.ts` importe `MakronPrecache`/`MakronToss`, `MakronToss` planifie `MakronSpawn`, `SP_monster_makron` initialise modele/callbacks, `M_MoveFrame` avance `s.frame`). Les frames visibles sortent dans `entity_state_t.frame/oldframe` via snapshots.
- `apps/web`: le navigateur consomme les sorties via le runtime full-game/local, les snapshots et `apps/web/src/full-game-render-source.ts`; aucune logique parallele specifique aux frames Makron ne masque le runtime.
- `packages/renderer-three`: les sorties visibles attendues sont le modele rider MD2, `frame`, `oldframe`, `skinnum`, `modelindex` et interpolation. Elles sont consommees par `packages/client/src/refresh.ts`, `packages/renderer-three/src/refresh-entity-sync.ts` et `packages/renderer-three/src/md2-mesh-builder.ts`.

## Tests lances

- `npm run verify:m-boss32:header` -> ok.
- `npm run verify:m-boss32:source-parity` -> ok.
- `npm run verify:m-boss32` -> ok.
- `npm run verify:full-game:server-snapshots` -> ok.
- `npm run verify:full-game:three-renderer` -> ok.
- `npm run verify:full-game:render-source` -> ok.
- Controle cible PowerShell: comparaison exhaustive des 492 definitions `#define` du header contre les exports TS -> ok, `missing=0`, `mismatch=0`.

## Blocages

- Aucun.

## Prochain lot recommande

- Aucun pour `Quake-2-master/game/m_boss32.h`: toutes les lignes de la matrice sont `Valide`.
