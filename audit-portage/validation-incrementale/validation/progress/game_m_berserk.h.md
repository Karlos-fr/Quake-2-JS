# Progress - Quake-2-master/game/m_berserk.h

## Etat courant

- Statut: En cours
- Dernier lot valide: `FRAME_stand1` a `FRAME_att_c34` (`0..109`)
- Prochain lot recommande: `FRAME_r_att1` a `FRAME_slam23`

## Session courante

- Lot traite: premiers grands blocs consecutifs de constantes frames: stand/standb, walkc/run, att_a/att_b/att_c.
- Ownership: `packages/game/src/m_berserk.ts`, export groupe via `berserkFrames` dans `packages/game/src/index.ts`.
- Comparaison H vs TS: valeurs numeriques `Quake-2-master/game/m_berserk.h` alignees avec `packages/game/src/m_berserk.ts` pour `0..109`.
- Commentaires: fichier TS possede un commentaire d'en-tete de fichier pour le port combine `m_berserk.h`/`m_berserk.c`; pas de commentaire de fonction applicable aux macros de frame.
- Runtime: constantes consommees par les moves Berserk deja branches via `SP_monster_berserk` et `monsterinfo` (`stand`, `walk`, `run`, `melee`) puis `G_RunFrame`.
- apps/web: consommation attendue via runtime full-game/snapshots, sans logique parallele Berserk.
- renderer-three: consommation attendue des frames visibles via le flux generique `entity.frame`, `oldframe`, `backlerp` et modele alias MD2; pas d'adapter Berserk specifique requis.
- Tests de reference passes: `npm run verify:m-berserk:header`, `npm run verify:m-berserk`, `npm run verify:web-render-order`, `npm run verify:full-game:three-renderer`, `npm run typecheck`.

## Blocages

- Aucun blocage connu pour ce lot.
