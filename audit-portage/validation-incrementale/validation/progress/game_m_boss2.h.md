# Progress - Quake-2-master/game/m_boss2.h

## Etat courant

- Statut: En cours
- Dernier lot valide: `FRAME_stand30` a `FRAME_walk20` inclus.
- Prochain lot recommande: `FRAME_attack1` a `FRAME_attack40`.

## Session courante

- Lot traite: trois premiers blocs naturels du header genere: `FRAME_stand30..FRAME_stand50`, `FRAME_stand1..FRAME_stand29`, `FRAME_walk1..FRAME_walk20`.
- Ownership: constantes portees dans `packages/game/src/m_boss2.ts`, exportees via `packages/game/src/index.ts`.
- Comparaison H vs TS: valeurs numeriques alignees avec `Quake-2-master/game/m_boss2.h` pour la plage `0..69`.
- Commentaires d'en-tete: pas de fonction portee dans ce lot; l'en-tete de fichier `m_boss2.ts` documente la provenance `game/m_boss2.h` et `game/m_boss2.c`.
- Runtime: constantes consommees par `boss2_move_stand`, `boss2_move_fidget`, `boss2_move_walk` et `boss2_move_run`, atteignables via `SP_monster_boss2` puis callbacks `monsterinfo.stand/walk/run` et `M_MoveFrame`.
- apps/web: consommation attendue indirecte via le runtime full-game et les snapshots; pas de logique boss2 parallele requise pour ces constantes.
- renderer-three: les sorties visibles attendues sont `entity.frame`, `oldframe`, `backlerp` et le modele alias MD2; consommation generique par le renderer, pas d'adapter boss2 specifique requis.
- Tests de reference: `npm run verify:m-boss2:header`, `npm run verify:m-boss2`, `npm run verify:web-render-order`, `npm run verify:full-game:three-renderer`.

## Decisions

- Les constantes de header sont validees par plage dans `scripts/verify/quake2-m-boss2-header.ts` afin de prouver les valeurs numeriques obtenues pendant la session.
- Colonne `Notes` laissee vide dans la matrice: aucun ecart important a remonter pour ce lot.
