# Progress - Quake-2-master/game/m_boss31.c

## Session 2026-05-06

- Lot traite: bloc pain `jorg_frames_pain3` global/table/declarative, `jorg_move_pain3`, `jorg_frames_pain2` global/table/declarative, `jorg_move_pain2`, `jorg_frames_pain1` global/table/declarative, `jorg_move_pain1`, `jorg_pain`.
- Verdict: Valide.
- Comparaison C/TS: `jorg_frames_pain3` conserve 25 frames `ai_move`, distances `[-28,-6,-3,-9,0,0,0,0,-7,1,-11,-4,0,0,10,11,0,10,3,10,7,17,0,0,0]`, callbacks `jorg_step_left` aux indices 2 et 20, `jorg_step_right` aux indices 4 et 24. `jorg_move_pain3` conserve `FRAME_pain301..FRAME_pain325` et `endfunc jorg_run`. `jorg_frames_pain2`/`jorg_frames_pain1` conservent 3 frames `ai_move` a distance 0 sans callback; `jorg_move_pain2` conserve `FRAME_pain201..FRAME_pain203`, `jorg_move_pain1` conserve `FRAME_pain101..FRAME_pain103`, tous deux avec `endfunc jorg_run`. `jorg_pain` conserve skin half-health, `s.sound = 0`, debounce, suppressions aleatoires des petits degats et attaques, skip nightmare, sons pain1/2/3 et choix de move par degats.
- Commentaires d'en-tete: commentaire de `jorg_pain` verifie et complete avec la note `g_local.random()`; tables/moves declaratifs couverts par les noms preserves et les harness source-parity/cible.
- Runtime: integre. `SP_monster_jorg` assigne `self.pain = jorg_pain`; le flux degats runtime appelle le callback pain, puis `M_MoveFrame` consomme les pain moves depuis `G_RunFrame`/`monster_think`; les callbacks de pas et sons sont emis via le runtime.
- apps/web: integre. `apps/web` ne remplace pas la logique Jorg; le flux full-game/local host consomme snapshots et `soundEvents` runtime pour les animations/sons de douleur.
- renderer-three: integre. Ce lot produit des frames visibles de modele Jorg via `s.frame`/`oldframe`/`backlerp`; `packages/renderer-three` consomme ces sorties par `refresh-entity-sync` et `applyMd2AliasFrameLerp`, couvert par le test three-renderer.
- Tests lances:
  - `npm run verify:m-boss31`
  - `npm run verify:m-boss31:source-parity`
  - `npm run verify:m-boss31:header`
  - `npm run verify:full-game:server-host`
  - `npm run verify:web-render-order`
  - `npm run verify:full-game:three-renderer`
  - `npm run typecheck`
- Corrections appliquees:
  - `packages/game/src/m_boss31.ts`: commentaire d'en-tete de `jorg_pain` complete avec la note `g_local.random()`.
  - `scripts/verify/quake2-m-boss31.ts`: assertions ciblees pour tables/moves pain et registre save des trois moves pain.
  - `scripts/verify/quake2-m-boss31-header.ts`: assertion `FRAME_pain325`.

## Session 2026-05-06

- Lot traite: bloc walk `jorg_frames_start_walk` global/table/declarative, `jorg_move_start_walk`, `jorg_frames_walk` global/table/declarative, `jorg_move_walk`, `jorg_frames_end_walk` global/table/declarative, `jorg_move_end_walk`, `jorg_walk`.
- Verdict: Valide.
- Comparaison C/TS: `jorg_frames_start_walk` conserve 5 frames `ai_walk` avec distances `[5, 6, 7, 9, 15]`; `jorg_move_start_walk` conserve `FRAME_walk01..FRAME_walk05` et `endfunc NULL`. `jorg_frames_walk` conserve 14 frames `ai_walk` avec distances `[17, 0, 0, 0, 12, 8, 10, 33, 0, 0, 0, 9, 9, 9]`; `jorg_move_walk` conserve `FRAME_walk06..FRAME_walk19` et `endfunc NULL`. `jorg_frames_end_walk` conserve 6 frames `ai_walk` avec distances `[11, 0, 0, 0, 8, -8]`; `jorg_move_end_walk` conserve `FRAME_walk20..FRAME_walk25` et `endfunc NULL`. `jorg_walk` assigne `jorg_move_walk`.
- Commentaires d'en-tete: commentaire ajoute pour `jorg_walk`; les tables/moves declaratifs sont couverts par les noms preserves et les harness source-parity/cible.
- Runtime: integre. `SP_monster_jorg` assigne `monsterinfo.walk = jorg_walk`; `jorg_walk` bascule sur `jorg_move_walk`; les frames walk sont consommees par `M_MoveFrame` depuis `G_RunFrame`/`monster_think`, avec `ai_walk` et mise a jour visible de `s.frame`.
- apps/web: integre. `apps/web` ne remplace pas la logique Jorg; le flux full-game consomme les snapshots produits par le runtime et les tests web/full-game couvrent l'ordre de rendu.
- renderer-three: integre. Ce lot produit des frames visibles de modele Jorg via `s.frame`/`oldframe`/`backlerp`; `packages/renderer-three` les consomme par le flux generique alias model, couvert par le test three-renderer.
- Tests lances:
  - `npm run verify:m-boss31`
  - `npm run verify:m-boss31:source-parity`
  - `npm run verify:m-boss31:header`
  - `npm run verify:full-game:server-host`
  - `npm run verify:web-render-order`
  - `npm run verify:full-game:three-renderer`
  - `npm run typecheck`
- Corrections appliquees:
  - `packages/game/src/m_boss31.ts`: ajout du commentaire d'en-tete de `jorg_walk`.
  - `scripts/verify/quake2-m-boss31.ts`: assertions ciblees pour les tables/moves walk et le registre save des trois moves walk.

## Session 2026-05-06

- Lot traite: bloc stand/run `jorg_frames_stand` global/table/declarative, `jorg_move_stand`, `jorg_stand`, `jorg_frames_run` global/table/declarative, `jorg_move_run`, `jorg_run`.
- Verdict: Valide.
- Comparaison C/TS: `jorg_frames_stand` conserve 51 frames `ai_stand`, distances et callbacks C (`jorg_idle`, `jorg_step_left`, `jorg_step_right`) aux memes indices; `jorg_move_stand` conserve `FRAME_stand01..FRAME_stand51` et `endfunc NULL`. `jorg_stand` assigne `jorg_move_stand`. `jorg_frames_run` conserve 14 frames `ai_run`, distances `[17,0,0,0,12,8,10,33,0,0,0,9,9,9]`, callbacks de pas aux indices 0 et 7; `jorg_move_run` conserve `FRAME_walk06..FRAME_walk19` et `endfunc NULL`. `jorg_run` conserve la branche `AI_STAND_GROUND` vers stand sinon run.
- Commentaires d'en-tete: commentaires ajoutes pour `jorg_stand` et `jorg_run`; les tables/moves declaratifs sont couverts par les noms preserves et les harness source-parity/cible.
- Runtime: integre. `SP_monster_jorg` assigne `monsterinfo.stand = jorg_stand`, `monsterinfo.run = jorg_run`, initialise `currentmove = jorg_move_stand`; les frames stand/run sont consommees par `M_MoveFrame` depuis `G_RunFrame`/`monster_think`, avec callbacks sonores existants.
- apps/web: integre. `apps/web` ne remplace pas la logique Jorg; le flux full-game consomme les snapshots/sons produits par le runtime.
- renderer-three: integre. Ce lot produit des frames visibles de modele Jorg via `s.frame`/`oldframe`/`backlerp`; le renderer-three les consomme par le flux generique alias model et les tests full-game/three couvrent l'adapter.
- Tests lances:
  - `npm run verify:m-boss31`
  - `npm run verify:m-boss31:source-parity`
  - `npm run verify:m-boss31:header`
  - `npm run verify:full-game:server-host`
  - `npm run verify:web-render-order`
  - `npm run verify:full-game:three-renderer`
  - `npm run typecheck`
- Corrections appliquees:
  - `packages/game/src/m_boss31.ts`: ajout des commentaires d'en-tete de `jorg_stand` et `jorg_run`.
  - `scripts/verify/quake2-m-boss31.ts`: assertions ciblees pour les tables/moves stand/run et le registre save de `jorg_move_run`.

## Session 2026-05-06

- Lot traite: globals sonores initiaux `sound_pain1`, `sound_pain2`, `sound_pain3`, `sound_idle`, `sound_death`, `sound_search1`, `sound_search2`, `sound_search3`, `sound_attack1`, `sound_attack2`, `sound_firegun`, `sound_step_left`, `sound_step_right`, `sound_death_hit`, plus `jorg_search`, le local `r`, et les callbacks sonores simples `jorg_idle`, `jorg_death_hit`, `jorg_step_left`, `jorg_step_right`.
- Verdict: Valide pour les globals sonores et les callbacks valides; `r` est `Non applicable` comme variable locale couverte par `jorg_search`; les declarations forward C des callbacks sonores sont `Non applicable` car les definitions sont validees plus bas.
- Comparaison C/TS: les chemins `gi.soundindex` de `SP_monster_jorg` correspondent a `precacheJorgAssets` dans `packages/game/src/m_boss31.ts`, dans l'ordre source. `jorg_search` conserve les seuils `r <= 0.3`, `r <= 0.6`, puis branche finale, avec `CHAN_VOICE`, volume 1, `ATTN_NORM`, `timeofs` 0. Les callbacks `jorg_idle`, `jorg_death_hit`, `jorg_step_left` et `jorg_step_right` conservent leurs chemins precaches, canaux C et options sonores.
- Commentaires d'en-tete: commentaire existant de `jorg_search` verifie; commentaires ajoutes pour `jorg_idle`, `jorg_death_hit`, `jorg_step_left` et `jorg_step_right` avec `Original name`, `Source`, `Category: Ported`, `Fidelity level` et comportement.
- Runtime: integre. `SP_monster_jorg` est branche par `g_spawn.ts` via `monster_jorg`, precache les sons, assigne `monsterinfo.search = jorg_search` et initialise `jorg_move_stand`; les callbacks de pas/idle sont consommes par les tables de frames et `M_MoveFrame` depuis le flux `G_RunFrame` / `monster_think`.
- apps/web: integre. `apps/web` ne remplace pas la logique Jorg; le flux local/full-game draine les `soundEvents` runtime via `drainLocalGameplaySounds` et les resout depuis `gameplayRuntime.assets.soundPaths`.
- renderer-three: non applicable justifie pour ce lot. Les entites validees ici produisent uniquement des sons one-shot et du precache sonore; elles ne produisent pas de modele, frame, image, particule, beam, dlight, temp entity, areabits, camera ou donnee de scene a consommer par `packages/renderer-three`.
- Tests lances:
  - `npm run verify:m-boss31`
  - `npm run verify:m-boss31:source-parity`
  - `npm run verify:m-boss31:header`
  - `npm run verify:full-game:server-host`
  - `npm run verify:web-render-order`
  - `npm run verify:full-game:three-renderer`
  - `npm run typecheck`
- Corrections appliquees:
  - `packages/game/src/m_boss31.ts`: conservation du handle `sound_firegun` comme dans le `static int` source; ajout des commentaires d'en-tete des callbacks sonores simples.
  - `scripts/verify/quake2-m-boss31.ts`: assertions ciblees pour les emissions `jorg_step_left`, `jorg_step_right` et `jorg_death_hit`.

## Prochain lot recommande

- Valider le bloc death `jorg_frames_death1` global/table/declarative, `jorg_move_death`, `jorg_dead`, puis `jorg_die` si le lot reste coherent.
