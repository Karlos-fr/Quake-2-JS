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

## Session 2026-05-06 - fermeture attaques, pain, death, spawn

- Lot traite: `floater_fire_blaster`; variables locales `effect`; `floater_frames_activate` / `floater_move_activate`; attaques `floater_frames_attack1/2/3`, `floater_move_attack1/2/3`, callbacks `floater_wham`, `floater_zap`, `floater_attack`, `floater_melee`; pain `floater_frames_pain1/2/3`, `floater_move_pain1/2/3`, `floater_pain` et local `n`; death `floater_frames_death`, `floater_move_death`, `floater_dead`, `floater_die`; spawn `SP_monster_floater`; entrees declaratives correspondantes.
- Verdict: Valide pour toutes les entites portees du lot. `effect` et `n` sont marques `Non applicable` car ce sont des variables locales C auditees via leurs fonctions proprietaires.
- Checklist appliquee: ownership confirme sur `packages/game/src/m_float.ts`; pas de doublon proprietaire detecte; noms TS d'origine conserves pour fonctions/moves/tables; comparaison C/TS faite pour sons, frames, callbacks, effets blaster/zap, degats, `monsterinfo.currentmove`, bbox, flags, spawn et precache; commentaires d'en-tete verifies pour toutes les fonctions portees du lot; `g_spawn.ts`, `g_save.ts` et `index.ts` verifies comme branchements/adapters export/save pertinents.
- Comparaison C/TS: `floater_fire_blaster` conserve le choix `EF_HYPERBLASTER` sur `FRAME_attak104` et `FRAME_attak107`, le flash `MZ2_FLOAT_BLASTER_1`, la visee vers `enemy->viewheight`, degat 1 et vitesse 1000. Les tables activate/attack/pain/death conservent les plages de frames, distances 0, callbacks de frame et endfuncs source. `floater_wham` conserve son `CHAN_WEAPON`, son `fire_hit`, `5 + rand() % 6` et kick -50. `floater_zap` conserve l'offset manuel `[18.5, -0.9, 10]`, `TE_SPLASH`, count 32, color 1, multicast PVS, degat energie `5 + rand() % 6` et knockback -10. `floater_attack`, `floater_melee`, `floater_pain`, `floater_dead`, `floater_die` et `SP_monster_floater` conservent les branches source attendues; `floater_move_activate` et `floater_move_death` sont portes comme declaratif source meme si le flux C normal ne les branche pas activement.
- Runtime: integre. `ED_CallSpawn` atteint `SP_monster_floater`; `flymonster_start` arme le demarrage; `G_RunFrame` / `monster_think` / `M_MoveFrame` consomment les moves et callbacks attaque/pain/melee via `monsterinfo`. Les blasters passent par `monster_fire_blaster`, muzzleflash runtime et entite bolt; le zap passe par temp entity `TE_SPLASH` puis `T_Damage`; `BecomeExplosion1` ferme la mort comme le C.
- apps/web: integre. Le flux web/local host consomme le runtime porte, les sons precaches/draines, les snapshots et les temp entities issues du gameplay. Aucune logique parallele `monster_floater` dans `apps/web` ne masque un manque runtime.
- renderer-three: integre pour les sorties visibles attendues. Frames/modeles passent par snapshots/refresh entities et interpolation MD2; blaster/muzzleflash, `TE_SPLASH`, sons et explosion transitent par les flux client/local gameplay consommes en aval. Pas de branchement renderer direct supplementaire attendu dans `m_float.ts`.
- Tests lances:
  - `npm run verify:m-float`
  - `npm run verify:m-float:header`
  - `npm run verify:m-float:source-parity`
  - `npm run verify:full-game:server-host`
  - `npm run verify:web-render-order`
  - `npm run verify:full-game:three-renderer`
  - `npm run verify:full-game:render-source`
  - `npm run verify:full-game:server-snapshots`
  - `npm run verify:full-game:audio-routing`
  - `npm run verify:local-gameplay-sync`
- Corrections appliquees: aucune correction TS necessaire; mise a jour de la matrice et de ce progress file uniquement.

## Prochain lot recommande

- Aucun lot restant dans `game_m_float.c.md`: toutes les lignes sont `Valide` ou `Non applicable`.
