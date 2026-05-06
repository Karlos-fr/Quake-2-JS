# Progress - Quake-2-master/game/m_flipper.h

## Statut

- Statut: termine cote matrice.
- Dernier lot valide: header complet `FRAME_flpbit01` a `MODEL_SCALE`.
- Prochain lot recommande: aucun pour `m_flipper.h`.

## Lot valide pendant cette session

- `FRAME_flpbit01..FRAME_flpbit20`
- `FRAME_flptal01..FRAME_flptal21`
- `FRAME_flphor01..FRAME_flphor24`
- `FRAME_flpver01..FRAME_flpver29`
- `FRAME_flppn101..FRAME_flppn105`
- `FRAME_flppn201..FRAME_flppn205`
- `FRAME_flpdth01..FRAME_flpdth56`
- `MODEL_SCALE`

Total: 161 macros/constantes validees.

## Preuves

- Comparaison exhaustive `Quake-2-master/game/m_flipper.h` vs `packages/game/src/m_flipper.ts`: 161 definitions, `missing=0`, `mismatch=0`.
- `npm run verify:m-flipper:header`: ok.
- `npm run verify:m-flipper:source-parity`: ok.
- `npm run verify:m-flipper`: ok.
- `npm run verify:full-game:render-source`: ok.
- `npm run verify:full-game:three-renderer`: ok.

## Decisions checklist

- Ownership: `packages/game/src/m_flipper.ts` est le fichier proprietaire pour les constantes de `game/m_flipper.h`; `packages/game/src/index.ts` ne fait que reexporter.
- Noms/doublons: les noms originaux `FRAME_*` et `MODEL_SCALE` sont conserves; aucun doublon proprietaire detecte.
- Commentaires: le commentaire de module de `m_flipper.ts` reference `game/m_flipper.h` et decrit le port des constantes generees et du comportement `monster_flipper`.
- Runtime: les frames sont consommees par les moves `flipper_move_*`, atteignables via `ED_CallSpawn`/`SP_monster_flipper`, `swimmonster_start`, `monster_think` et `M_MoveFrame`.
- `apps/web`: le flux attendu passe par le runtime full-game/local, les snapshots serveur/client et `CL_BuildRefreshFrame`; aucune logique parallele masquante detectee pour ce header declaratif.
- `renderer-three`: les sorties visibles attendues sont le modele MD2 flipper et les champs `frame`, `oldframe`, `backlerp`, `modelindex` et `skinnum`; elles sont consommees via `refresh-entity-sync` et validees par le test Three renderer.

## Blocages

Aucun.
