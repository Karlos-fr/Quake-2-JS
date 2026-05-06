# Progress - Quake-2-master/game/m_medic.h

## Dernier lot valide

- 2026-05-06: validation complete des constantes generees de `m_medic.h`: `FRAME_walk1` a `FRAME_attack60` et `MODEL_SCALE`.

## Preuves de session

- Comparaison C/H vs TS: `scripts/verify/quake2-m-medic-header.ts` compare tous les `#define` de `Quake-2-master/game/m_medic.h` avec les exports de `packages/game/src/m_medic.ts`.
- Runtime gameplay: `npm run verify:m-medic` et `npm run verify:m-medic:source-parity` valident les moves medic, leurs bornes `firstframe`/`lastframe`, les tables de frames et le spawn `monster_medic`.
- apps/web: `npm run verify:full-game:render-source` confirme que le flux web consomme les entites produites par le runtime client/serveur sans logique parallele.
- renderer-three: `npm run verify:refresh-entity:alias-flags` confirme la consommation des champs `frame`/`oldframe` des entites alias visibles par le renderer.
- TypeScript: `npm run typecheck`.

## Decisions

- Les macros de frames ne sont pas des fonctions: commentaire d'en-tete de fonction non applicable. Le commentaire de fichier `packages/game/src/m_medic.ts` identifie `game/m_medic.h` comme source des constantes.
- Integration runtime attendue et presente: `SP_monster_medic` selectionne `medic_move_stand`, les callbacks selectionnent les moves, `M_MoveFrame` affecte `self.s.frame`, puis la chaine serveur/client expose cette frame aux entites visibles.
- Integration `apps/web` attendue et presente via la source de rendu full-game qui lit les entites du client runtime.
- Integration `renderer-three` attendue et presente via la synchronisation refresh entity et le rendu MD2 alias, qui consomment `frame` et `oldframe`.

## Blocages

- Aucun.

## Prochain lot recommande

- Aucun lot restant dans `m_medic.h`: toutes les entrees sont validees.
