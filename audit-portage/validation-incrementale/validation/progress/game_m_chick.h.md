# Progress - Quake-2-master/game/m_chick.h

## Session 2026-05-06

- Lot traite: constantes `FRAME_attak101` a `FRAME_attak216`, `FRAME_death101` a `FRAME_death223`.
- Verdict: `Valide` pour 83 macros.
- Preuves: comparaison directe avec `Quake-2-master/game/m_chick.h` et `packages/game/src/m_chick.ts`; verification des tables `chick_move_start_attack1`, `chick_move_attack1`, `chick_move_end_attack1`, `chick_move_start_slash`, `chick_move_slash`, `chick_move_end_slash`, `chick_move_death1`, `chick_move_death2`; tests `npm run verify:m-chick:header`, `npm run verify:m-chick`, `npm run verify:m-chick:source-parity`, `npm run verify:full-game:render-source`, `npm run verify:full-game:three-renderer`.
- Runtime: integre via `SP_monster_chick` dans `g_spawn.ts`, `M_MoveFrame` et les snapshots serveur/client; les frames visibles sortent par `s.frame`.
- apps/web: integre via le serveur local, `createFullGameServerRenderSource` et `CL_BuildRefreshFrame`; aucune logique web parallele trouvee pour ces frames.
- renderer-three: integre via `createThreeRefreshEntitySync`, qui consomme `modelindex`, `frame`, `oldframe`, `skinnum` et charge le MD2 `models/monsters/bitch/tris.md2`.
- Commentaires: pas de fonction dans ce lot de macros; l'en-tete de `m_chick.ts` documente l'ownership combine `m_chick.h`/`m_chick.c`.
- Corrections TS: aucune.

## Prochain lot recommande

Continuer avec le bloc `FRAME_duck01` a `FRAME_pain321`, en verifiant les mouvements `chick_move_duck`, `chick_move_pain1`, `chick_move_pain2`, `chick_move_pain3` et leurs sorties runtime visibles.
