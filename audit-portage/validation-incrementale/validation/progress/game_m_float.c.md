# Progress - Quake-2-master/game/m_float.c

## Session 2026-05-06 - sons initiaux et bloc stand/walk/run

- Lot traite: globals sonores initiaux `sound_attack2`, `sound_attack3`, `sound_death1`, `sound_idle`, `sound_pain1`, `sound_pain2`, `sound_sight`; fonctions sonores `floater_sight` et `floater_idle`; declarations forward initiales; tables/moves/fonctions `floater_frames_stand1`, `floater_move_stand1`, `floater_frames_stand2`, `floater_move_stand2`, `floater_stand`, `floater_frames_walk`, `floater_move_walk`, `floater_frames_run`, `floater_move_run`, `floater_walk`, `floater_run`.
- Verdict: Valide pour le lot; les declarations forward C homonymes sont marquees `Non applicable` avec justification.
- Comparaison C/TS: les sept handles sonores C sont portes comme handles `let sound_* = 0` et constantes de chemins `SOUND_*`; l'ordre de `gi.soundindex` de `SP_monster_floater` est conserve par `precacheFloaterAssets`, avec `SOUND_ATTACK1` et `SOUND_SEARCH` en plus du bloc valide. `floater_sight` conserve `CHAN_VOICE`, `ATTN_NORM`, volume `1`, `timeofs` 0. `floater_idle` conserve `CHAN_VOICE`, `ATTN_IDLE`, volume `1`, `timeofs` 0. Les tables stand1/stand2 conservent 52 frames `ai_stand` a distance 0; walk conserve 52 frames `ai_walk` a distance 5; run conserve 52 frames `ai_run` a distance 13; aucun callback de frame n'est present dans ces tables. Les moves conservent les plages C et `endfunc = NULL`. `floater_stand` conserve la selection `random() <= 0.5`; `floater_walk` affecte `floater_move_walk`; `floater_run` conserve la branche `AI_STAND_GROUND` vers stand1 sinon run.
- Commentaires d'en-tete: commentaires TS verifies pour `floater_sight`, `floater_idle`, `floater_stand`, `floater_walk` et `floater_run` avec `Original name`, `Source`, `Category: Ported`, `Fidelity level` et comportement. Tables/global declaratifs sans commentaire de fonction requis; entete de fichier TS verifiee pour la source et les deviations runtime `gi.*`.
- Runtime: integre. `monster_floater` est branche par `g_spawn.ts` vers `SP_monster_floater`; `SP_monster_floater` precache les sons, affecte `monsterinfo.sight`, `monsterinfo.idle`, `monsterinfo.stand`, `monsterinfo.walk`, `monsterinfo.run`, initialise `currentmove` vers stand1/stand2 puis appelle `flymonster_start`. Les tests prouvent `ED_CallSpawn`, `flymonster_start`/startup think, save registry et transitions de `currentmove`; `M_MoveFrame`/`monster_think` consomment les moves depuis `G_RunFrame`.
- apps/web: integre. Le navigateur declenche ce flux via le runtime full-game/local host et consomme les sorties runtime: sons gameplay precaches/draines et snapshots d'entites; aucune logique parallele `monster_floater` constatee dans `apps/web`.
- renderer-three: integre pour les sorties visibles du lot. Les moves stand/walk/run produisent des frames MD2 visibles du modele `models/monsters/float/tris.md2`; le flux client conserve `modelindex`, `frame`, `oldframe` et `backlerp` dans les snapshots/refresh entities, consommes par `packages/renderer-three`. Pas de particule, beam, dlight, temp entity, areabits, camera ou scene additionnelle attendue pour ce lot.
- Tests lances:
  - `npm run verify:m-float`
  - `npm run verify:m-float:header`
  - `npm run verify:m-float:source-parity`
  - `npm run verify:full-game:server-host`
  - `npm run verify:web-render-order`
  - `npm run verify:full-game:three-renderer`
  - `npm run typecheck`
- Corrections appliquees: aucune correction TS necessaire.

## Prochain lot recommande

- Continuer avec `floater_fire_blaster`, `effect` local associe, puis bloc attaque coherent `floater_frames_attack1` / `floater_move_attack1` si le lot reste raisonnable.
