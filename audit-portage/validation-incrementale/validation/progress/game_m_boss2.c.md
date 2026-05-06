# Progress - Quake-2-master/game/m_boss2.c

## Session 2026-05-03

- Lot traite: `boss2_search` seul, branche `random() < 0.5`, emission `sound_search1`, branchement `monsterinfo.search`.
- Verdict: Valide.
- Comparaison C/TS: `void boss2_search(edict_t *self)` est porte comme `boss2_search(self, runtime)`; la seule branche comportementale correspond a `random() < 0.5` / `Math.random() < 0.5` et emet le son precache `bosshovr/bhvunqv1.wav` sur `CHAN_VOICE`, volume 1, `ATTN_NONE`, `timeofs` 0. Le harness couvre aussi la borne `0.5` sans emission.
- Commentaires d'en-tete: commentaire de fonction ajoute dans `packages/game/src/m_boss2.ts` avec `Original name`, `Source`, `Category: Ported`, `Fidelity level: Strict` et comportement.
- Runtime: integre. `SP_monster_boss2` assigne `self.monsterinfo.search = boss2_search`; `g_ai.ts` appelle `monsterinfo.search` depuis le flux `ai_stand` reachable par `G_RunFrame` / `monster_think`; `ED_CallSpawn` branche `monster_boss2` vers `SP_monster_boss2`. Le harness verifie le callback de spawn et l'emission conditionnelle.
- apps/web: integre. `apps/web` ne remplace pas la logique; il consomme les `soundEvents` runtime via `drainLocalGameplaySounds` / `flushLocalGameplaySounds` et joue le chemin WAV resolu.
- renderer-three: non applicable justifie pour ce lot. `boss2_search` ne produit qu'un son one-shot et ne modifie aucun modele, frame, image, particule, beam, dlight, temp entity, areabits, camera ou donnee de scene.
- Tests lances:
  - `npm run verify:m-boss2:source-parity`
  - `npm run verify:m-boss2`
  - `npm run verify:m-boss2:header`
  - `npm run verify:full-game:server-host`
  - `npm run verify:web-render-order`
  - `npm run verify:full-game:three-renderer`
  - `npm run typecheck`
- Corrections appliquees: ajout du commentaire d'en-tete de `boss2_search`; ajout d'une assertion de non-emission pour `Math.random() === 0.5` dans `scripts/verify/quake2-m-boss2.ts`.

- Lot traite: globals sonores initiaux `sound_pain1`, `sound_pain2`, `sound_pain3`, `sound_death`, `sound_search1`.
- Verdict: Valide.
- Comparaison C/TS: les cinq `static int sound_*` C sont portes comme handles `let sound_* = 0` et constantes de chemin `SOUND_*`; les chemins et l'ordre de `gi.soundindex` dans `SP_monster_boss2` correspondent au precache TypeScript `precacheBoss2Assets`.
- Commentaires d'en-tete: entites globales, pas de commentaire de fonction requis; l'entete de fichier TS declare la source et la deviation runtime `gi.*`. Le commentaire de `SP_monster_boss2` a ete verifie comme point de precache runtime.
- Runtime: integre. `monster_boss2` est branche par `g_spawn.ts` vers `SP_monster_boss2`; le precache alimente `runtime.assets.soundPaths`; `boss2_pain`, `boss2_die` et `boss2_search` emettent les `soundEvents` attendus, avec callbacks `pain`, `die` et `monsterinfo.search` verifies dans le harness.
- apps/web: integre. Le flux web consomme les `soundEvents` gameplay via `drainLocalGameplaySounds` / `flushLocalGameplaySounds` et resout les chemins depuis `gameplayRuntime.assets.soundPaths`; aucune logique parallele boss2 constatee.
- renderer-three: non applicable justifie pour ce lot. Les entites auditees ne produisent que des sons one-shot, pas de modele/frame/image/particule/beam/dlight/temp entity/areabits/camera/scene a consommer par le renderer.
- Tests lances:
  - `npm run verify:m-boss2:source-parity`
  - `npm run verify:m-boss2`
  - `npm run verify:m-boss2:header`
  - `npm run verify:full-game:server-host`
  - `npm run verify:web-render-order`
  - `npm run verify:full-game:three-renderer`
  - `npm run typecheck`
- Corrections appliquees: ajout d'assertions dans `scripts/verify/quake2-m-boss2.ts` pour prouver le branchement runtime des callbacks `pain`, `die` et `monsterinfo.search`.

- Lot traite: `boss2_run` seul, branche `AI_STAND_GROUND`, affectations `boss2_move_stand` / `boss2_move_run`, branchement `monsterinfo.run`.
- Verdict: Valide.
- Comparaison C/TS: `void boss2_run(edict_t *self)` est porte comme `boss2_run(self)`; la branche `self->monsterinfo.aiflags & AI_STAND_GROUND` correspond au test TypeScript `(self.monsterinfo.aiflags & AI_STAND_GROUND) !== 0`, avec affectation vers `boss2_move_stand` quand le flag est present et `boss2_move_run` sinon.
- Commentaires d'en-tete: commentaire de fonction ajoute dans `packages/game/src/m_boss2.ts` avec `Original name`, `Source`, `Category: Ported`, `Fidelity level: Strict` et comportement.
- Runtime: integre. `SP_monster_boss2` assigne `self.monsterinfo.run = boss2_run`; le callback est appelable depuis les flux AI `ai_stand` / `ai_walk` / `ai_run` puis `G_RunFrame` / `monster_think` / `M_MoveFrame`. Le harness verifie l'appel direct et l'appel via `monsterinfo.run`.
- apps/web: integre. `apps/web` ne remplace pas la logique boss2; le comportement passe par le host full-game/local et les snapshots runtime.
- renderer-three: integre. `boss2_run` selectionne des moves qui produisent des frames visibles `s.frame`; elles sont propagees par snapshots client et consommees par le renderer Three via le flux entites/modeles/frames.
- Tests lances:
  - `npm run verify:m-boss2:source-parity`
  - `npm run verify:m-boss2`
  - `npm run verify:m-boss2:header`
  - `npm run verify:full-game:server-host`
  - `npm run verify:web-render-order`
  - `npm run verify:full-game:three-renderer`
  - `npm run typecheck`
- Corrections appliquees: ajout du commentaire d'en-tete de `boss2_run`; ajout d'assertions de branchement `monsterinfo.run` dans `scripts/verify/quake2-m-boss2.ts`.

## Session 2026-05-06

- Lot traite: `boss2_stand` seul, avec l'affectation `boss2_move_stand` et le branchement `monsterinfo.stand`.
- Verdict: Valide.
- Comparaison C/TS: `void boss2_stand(edict_t *self)` affecte uniquement `self->monsterinfo.currentmove = &boss2_move_stand`; le port `boss2_stand(self)` affecte uniquement `self.monsterinfo.currentmove = boss2_move_stand`. Les tables `boss2_frames_stand` / `boss2_move_stand` ont seulement ete utilisees comme cible d'affectation et restent recommandees pour un lot declaratif separe.
- Commentaires d'en-tete: commentaire de fonction ajoute dans `packages/game/src/m_boss2.ts` avec `Original name`, `Source`, `Category: Ported`, `Fidelity level: Strict` et comportement.
- Runtime: integre. `SP_monster_boss2` assigne `self.monsterinfo.stand = boss2_stand`; le callback est atteignable depuis les flux `ai_stand`, `g_monster` et `g_misc`, eux-memes relies au runtime `G_RunFrame` / `monster_think` / `M_MoveFrame`. Le harness verifie l'affectation au spawn, l'appel direct et l'appel via `monsterinfo.stand`.
- apps/web: integre. `apps/web` ne remplace pas la logique boss2; le comportement passe par le host full-game/local et les snapshots runtime.
- renderer-three: integre. `boss2_stand` selectionne un move qui produit des frames visibles `s.frame`; les modeles/frames issus des snapshots client sont consommes par le renderer Three.
- Tests lances:
  - `npm run verify:m-boss2:source-parity`
  - `npm run verify:m-boss2`
  - `npm run verify:m-boss2:header`
  - `npm run verify:full-game:server-host`
  - `npm run verify:web-render-order`
  - `npm run verify:full-game:three-renderer`
  - `npm run typecheck`
- Corrections appliquees: ajout du commentaire d'en-tete de `boss2_stand`; ajout d'assertions de branchement `monsterinfo.stand` dans `scripts/verify/quake2-m-boss2.ts`.

- Lot traite: bloc declaratif `boss2_frames_stand` / `boss2_move_stand`, puis `boss2_walk`.
- Verdict: Valide.
- Comparaison C/TS: `mframe_t boss2_frames_stand[]` contient 21 entrees `ai_stand, 0, NULL`; le port `boss2_frames_stand` contient 21 frames avec `ai_stand`, distance 0 et aucun `thinkfunc`. `mmove_t boss2_move_stand = {FRAME_stand30, FRAME_stand50, boss2_frames_stand, NULL}` correspond au port `boss2_move_stand` avec `firstframe`, `lastframe`, table et `endfunc` absent. `void boss2_walk(edict_t *self)` affecte uniquement `&boss2_move_walk`; le port `boss2_walk(self)` affecte uniquement `boss2_move_walk`.
- Commentaires d'en-tete: les entites declaratives global/table ne demandent pas de commentaire de fonction; le commentaire de fonction `boss2_walk` a ete ajoute dans `packages/game/src/m_boss2.ts` avec `Original name`, `Source`, `Category: Ported`, `Fidelity level: Strict` et comportement.
- Runtime: integre. `SP_monster_boss2` initialise `currentmove = boss2_move_stand` et assigne `monsterinfo.walk = boss2_walk`; `M_MoveFrame` consomme `boss2_move_stand` depuis `monster_think`, atteignable par `G_RunFrame`. Le harness verifie la table stand, le wrap `FRAME_stand50` vers `FRAME_stand30`, le callback `monsterinfo.walk` et le save registry.
- apps/web: integre. `apps/web` ne remplace pas la logique boss2; le comportement passe par le host full-game/local, les snapshots client et le render loop web.
- renderer-three: integre. Le lot produit des frames visibles `s.frame` pour le modele boss2; elles sont propagees par snapshots client et consommees par `renderer-three` via les entites alias/modeles/frames.
- Tests lances:
  - `npm run verify:m-boss2:source-parity`
  - `npm run verify:m-boss2`
  - `npm run verify:m-boss2:header`
  - `npm run verify:full-game:server-host`
  - `npm run verify:web-render-order`
  - `npm run verify:full-game:three-renderer`
  - `npm run typecheck`
- Corrections appliquees: ajout du commentaire d'en-tete de `boss2_walk`; ajout d'assertions ciblees dans `scripts/verify/quake2-m-boss2.ts` pour `boss2_frames_stand`, `boss2_move_stand`, `monsterinfo.walk`, `boss2_move_walk` et le wrap de frame stand par `M_MoveFrame`.

- Lot traite: `boss2_frames_death`, `boss2_move_death`, `boss2_dead` et `boss2_die`.
- Verdict: Valide.
- Comparaison C/TS: `boss2_frames_death` contient 49 frames `ai_move, 0`, avec `BossExplode` uniquement sur la derniere frame; `boss2_move_death` conserve `FRAME_death2` -> `FRAME_death50`, la table de mort et l'endfunc `boss2_dead`. `boss2_dead` conserve la bbox finale `[-56,-56,0]` / `[56,56,80]`, `MOVETYPE_TOSS`, `SVF_DEADMONSTER`, `nextthink = 0` et le relink. `boss2_die` emet `sound_death`, pose `DEAD_DEAD`, `DAMAGE_NO`, `count = 0` et selectionne `boss2_move_death`; le bloc C `#if 0` reste inactif comme dans la source compilee.
- Commentaires d'en-tete: commentaires de fonction ajoutes pour `boss2_dead` et `boss2_die` avec `Original name`, `Source`, `Category: Ported`, `Fidelity level: Strict` et comportement. Les tables/moves declaratifs ne demandent pas de commentaire de fonction.
- Runtime: integre. `SP_monster_boss2` assigne `self.die = boss2_die`; les degats runtime peuvent atteindre `self.die` via `T_Damage`. `M_MoveFrame`, appele par `monster_think` depuis `G_RunFrame`, consomme `boss2_move_death`, execute `BossExplode` sur `FRAME_death50`, puis appelle `boss2_dead` comme endfunc au passage sur la frame finale.
- apps/web: integre. `apps/web` ne remplace pas ce flux: le host full-game/local consomme les snapshots et sons produits par le runtime porte.
- renderer-three: integre. Le lot produit des sorties visibles: modele boss2, frames de mort `s.frame`, et temp entities d'explosion via `BossExplode`; les frames passent par snapshots/refresh entities vers `renderer-three`, et les temp entities sont consommees par le flux client/renderer deja verifie.
- Tests lances:
  - `npm run verify:m-boss2`
  - `npm run verify:m-boss2:source-parity`
  - `npm run verify:m-boss2:header`
  - `npm run verify:full-game:server-host`
  - `npm run verify:web-render-order`
  - `npm run verify:full-game:three-renderer`
  - `npm run typecheck`
- Corrections appliquees: ajout des commentaires d'en-tete de `boss2_dead` et `boss2_die`; ajout d'assertions ciblees dans `scripts/verify/quake2-m-boss2.ts` pour la table/move de mort, le relink de corpse, `BossExplode` et l'endfunc `boss2_dead` via `M_MoveFrame`.

## Prochain lot recommande

- Valider le bloc attaque machinegun: `boss2_attack`, local `range`, `boss2_attack_mg`, `boss2_reattack_mg`, puis les tables/moves `boss2_frames_attack_pre_mg`, `boss2_move_attack_pre_mg`, `boss2_frames_attack_mg`, `boss2_move_attack_mg`, `boss2_frames_attack_post_mg`, `boss2_move_attack_post_mg` si le lot reste raisonnable.
