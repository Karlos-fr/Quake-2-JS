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

## Prochain lot recommande

- Valider le bloc declaratif `boss2_frames_stand` / `boss2_move_stand` en lot separe, puis reprendre `boss2_walk` ou `boss2_dead` selon la priorisation du coordinateur.
