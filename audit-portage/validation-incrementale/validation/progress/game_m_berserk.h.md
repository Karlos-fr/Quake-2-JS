# Progress - Quake-2-master/game/m_berserk.h

## Etat courant

- Statut: Termine
- Dernier lot valide: `FRAME_r_att1` a `MODEL_SCALE` (`110..243`, puis `MODEL_SCALE`)
- Prochain lot recommande: aucun, fichier clos

## Session courante

- Lot traite: fin du header genere: `FRAME_r_att1` a `FRAME_deathc8`, puis `MODEL_SCALE`.
- Ownership: `packages/game/src/m_berserk.ts`, export groupe via `berserkFrames` dans `packages/game/src/index.ts`.
- Comparaison H vs TS: valeurs numeriques `Quake-2-master/game/m_berserk.h` alignees avec `packages/game/src/m_berserk.ts` pour `110..243`; `MODEL_SCALE` aligne a `1.0`.
- Commentaires: fichier TS possede un commentaire d'en-tete de fichier pour le port combine `m_berserk.h`/`m_berserk.c`; pas de commentaire de fonction applicable aux macros de frame.
- Runtime: constantes consommees par les moves Berserk deja branches via `SP_monster_berserk` et `monsterinfo` (`melee`, `pain`, `die`) puis `G_RunFrame`; les plages de frames non referencees directement restent des constantes generees du header sans branchement specifique attendu.
- apps/web: consommation attendue via runtime full-game/snapshots, sans logique parallele Berserk.
- renderer-three: consommation attendue des frames visibles via le flux generique `entity.frame`, `oldframe`, `backlerp` et modele alias MD2; pas d'adapter Berserk specifique requis.
- Tests de reference passes: `npm run verify:m-berserk:header`, `npm run verify:m-berserk`, `npm run verify:web-render-order`, `npm run verify:full-game:three-renderer`, `npm run typecheck`.

## Blocages

- Aucun blocage connu pour ce lot.
