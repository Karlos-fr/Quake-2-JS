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

## Prochain lot recommande

- Valider `boss2_run` seul, avec la branche `AI_STAND_GROUND`, les affectations `boss2_move_stand` / `boss2_move_run`, et le branchement `monsterinfo.run`; garder attaques, frames et moves pour des sessions separees.
