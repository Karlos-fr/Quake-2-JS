# Progress - Quake-2-master/game/m_insane.h

## Dernier lot traite

- Session: 2026-05-06
- Lot: `FRAME_stand1` a `FRAME_stand160`, `FRAME_walk27` a `FRAME_walk39`, `FRAME_walk1` a `FRAME_walk26`, et `MODEL_SCALE`.
- Statut: Valide.

## Preuves obtenues

- Source H relue: `Quake-2-master/game/m_insane.h`.
- Cible TS relue: `packages/game/src/m_insane.ts`.
- Comparaison valeurs: `scripts/verify/quake2-m-insane-header.ts` compare maintenant les 283 macros `FRAME_*`/`MODEL_SCALE` du header avec les exports TS; le lot traite est couvert integralement.
- Consommation animation/runtime: `scripts/verify/quake2-m-insane.ts` verifie les moves stand/marche/course lies au lot (`insane_move_stand_normal`, `insane_move_stand_insane`, `insane_move_uptodown`, `insane_move_downtoup`, `insane_move_jumpdown`, `insane_move_down`, `insane_move_walk_normal`, `insane_move_run_normal`, `insane_move_walk_insane`, `insane_move_run_insane`) avec firstframe/lastframe, longueurs, distances et callbacks.
- Branchement runtime: `SP_misc_insane` est branche dans `packages/game/src/g_spawn.ts` pour `misc_insane`; les moves sont atteignables via `walkmonster_start`/`flymonster_start`, `monsterinfo.currentmove`, `M_MoveFrame` et les callbacks `insane_stand`/`insane_walk`/`insane_run`.
- `apps/web`: l'integration attendue est indirecte par le runtime complet/local. Les frames produites par l'etat gameplay sont exposees dans les snapshots client puis dans `refreshFrame`; aucune logique web parallele ne remplace ces constantes.
- `packages/renderer-three`: l'integration attendue est indirecte et visible. Les frames de `s.frame` deviennent `ClientRenderEntity.frame`/`oldframe`, puis sont consommees par `refresh-entity-sync.ts`, `gl_mesh.ts` et `md2-mesh-builder.ts` pour les modeles MD2.
- Tests lances: `npm run verify:m-insane:header`; `npm run verify:m-insane`.

## Decisions

- Les macros declaratives n'exigent pas de commentaire d'en-tete par constante. Le commentaire de fichier `packages/game/src/m_insane.ts` declare la source `game/m_insane.h and game/m_insane.c`, le but et la politique de portage.
- `MODEL_SCALE` est valide avec le meme lot car il est consomme par `SP_misc_insane` via `self.monsterinfo.scale` et applique dans `M_MoveFrame` aux distances d'animation.

## Prochain lot recommande

- Continuer avec les constantes de douleur/death debout: `FRAME_st_pain2` a `FRAME_st_pain12`, puis `FRAME_st_death2` a `FRAME_st_death18` si le lot reste coherent.

## Blocages

- Aucun.
