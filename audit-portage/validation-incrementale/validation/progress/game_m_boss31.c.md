# Progress - Quake-2-master/game/m_boss31.c

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

- Valider le bloc stand declaratif et transitions de base: `jorg_frames_stand` global/table/declarative, `jorg_move_stand`, `jorg_stand`, puis si le lot reste raisonnable `jorg_frames_run`, `jorg_move_run` et `jorg_run`, avec preuves de frames visibles runtime/web/renderer-three.
