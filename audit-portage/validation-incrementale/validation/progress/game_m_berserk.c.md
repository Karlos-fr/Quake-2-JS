# Progress - Quake-2-master/game/m_berserk.c

## Session 2026-05-03

- Lot traite: globals sonores initiaux `sound_pain`, `sound_die`, `sound_idle`, `sound_punch`, `sound_sight`, `sound_search`.
- Verdict: Valide.
- Comparaison C/TS: les six `static int sound_*` C sont portes comme handles `let sound_* = 0` et constantes de chemin `SOUND_*`; les chemins et l'ordre de `gi.soundindex` dans `SP_monster_berserk` correspondent au precache TypeScript `precacheBerserkAssets`.
- Commentaires d'en-tete: entites globales, pas de commentaire de fonction requis; l'entete de fichier TS declare la source et la deviation runtime `gi.*`.
- Runtime: integre. `monster_berserk` est branche par `g_spawn.ts` vers `SP_monster_berserk`; le precache alimente `runtime.assets.soundPaths` et les callbacks berserk emettent des `soundEvents`.
- apps/web: integre. Le flux web consomme les `soundEvents` gameplay et resout les chemins sons depuis `gameplayRuntime.assets.soundPaths`; aucune logique parallele berserk constatee.
- renderer-three: non applicable justifie pour ce lot. Les entites auditees ne produisent que des sons one-shot, pas de modele/frame/image/particule/beam/dlight/temp entity/areabits/camera/scene a consommer par le renderer.
- Tests lances:
  - `npm run verify:m-berserk:source-parity`
  - `npm run verify:m-berserk`
  - `npm run verify:m-berserk:header`
- Corrections appliquees: aucune correction TS necessaire.

## Session 2026-05-03 - `berserk_sight` / `berserk_search`

- Lot traite: fonctions `berserk_sight` et `berserk_search`, emissions sonores et branchement runtime via `monsterinfo.sight` / `monsterinfo.search`.
- Verdict: Valide.
- Comparaison C/TS: `berserk_sight` conserve l'emission `CHAN_VOICE`, son `sound_sight`, volume `1`, attenuation `ATTN_NORM`, `timeofs` 0; `berserk_search` conserve les memes parametres avec `sound_search`. Le parametre C `other` de `berserk_sight` reste ignore comme dans le comportement source.
- Commentaires d'en-tete: commentaires TS verifies pour les deux fonctions avec `Original name`, `Source`, `Category: Ported`, `Fidelity level` et comportement.
- Runtime: integre. `SP_monster_berserk` assigne `self.monsterinfo.sight = berserk_sight` et `self.monsterinfo.search = berserk_search`; le harness prouve l'appel direct et l'appel via les callbacks `monsterinfo`.
- apps/web: integre. Ces fonctions produisent des `soundEvents` gameplay; le flux web les draine depuis le runtime et resout les chemins precaches. Aucune logique parallele berserk constatee.
- renderer-three: non applicable justifie pour ce lot. Les fonctions ne produisent que des sons one-shot, sans modele, frame, image, particule, beam, dlight, temp entity, areabits, camera ou scene a consommer par `packages/renderer-three`.
- Tests lances:
  - `npm run verify:m-berserk`
  - `npm run verify:m-berserk:header`
  - `npm run verify:m-berserk:source-parity`
  - `npm run verify:full-game:server-host`
  - `npm run verify:web-render-order`
  - `npm run verify:full-game:three-renderer`
  - `npm run typecheck`
- Corrections appliquees: ajout d'assertions dans `scripts/verify/quake2-m-berserk.ts` pour prouver le branchement `monsterinfo.sight` / `monsterinfo.search` et les sons emis par ces callbacks.

## Session 2026-05-03 - `berserk_fidget`

- Lot traite: fonction `berserk_fidget` seule, avec emission `sound_idle`, branches `AI_STAND_GROUND` / `random()` et effet `currentmove = berserk_move_stand_fidget`.
- Verdict: Valide pour la definition; la ligne de declaration forward C homonyme est marquee `Non applicable`.
- Comparaison C/TS: la branche `AI_STAND_GROUND` retourne sans effet; la branche aleatoire retourne quand `random() > 0.15`; le passage en fidget assigne `berserk_move_stand_fidget` et emet `sound_idle` sur `CHAN_WEAPON`, volume `1`, attenuation `ATTN_IDLE`, `timeofs` 0.
- Commentaires d'en-tete: commentaire TS de `berserk_fidget` verifie et mis a jour pour documenter l'usage de `g_local.random()`.
- Runtime: integre. `berserk_move_stand.frame[0].thinkfunc` pointe vers `berserk_fidget`; le test prouve l'appel via cette frame et l'appel direct de la fonction.
- apps/web: integre. La fonction produit un `soundEvent` gameplay et change un `currentmove` qui alimente les frames visibles via le runtime serveur/client; le flux full-game/web consomme ces sorties sans logique parallele berserk.
- renderer-three: integre indirectement. Le son n'est pas une sortie visible, mais le changement `currentmove` doit produire des frames MD2 visibles dans les snapshots/refresh; le renderer Three consomme ces entites/frames via le flux full-game existant.
- Tests lances:
  - `npm run verify:m-berserk`
  - `npm run verify:m-berserk:header`
  - `npm run verify:m-berserk:source-parity`
  - `npm run verify:full-game:server-host`
  - `npm run verify:web-render-order`
  - `npm run verify:full-game:three-renderer`
  - `npm run typecheck`
- Corrections appliquees:
  - `packages/game/src/m_berserk.ts`: `berserk_fidget` utilise `g_local.random()` au lieu de `Math.random()` direct.
  - `scripts/verify/quake2-m-berserk.ts`: assertions renforcees pour le seuil C 15-bit, la branche `AI_STAND_GROUND`, le callback de frame et le son idle.

## Session 2026-05-03 - bloc stand

- Lot traite: `berserk_frames_stand` global/table/declarative, `berserk_move_stand` et `berserk_stand`.
- Verdict: Valide.
- Comparaison C/TS: la table stand conserve 5 frames `ai_stand`, distances 0, callback `berserk_fidget` uniquement sur la premiere frame; `berserk_move_stand` conserve `FRAME_stand1`, `FRAME_stand5`, la table stand et aucun `endfunc`; `berserk_stand` assigne `self.monsterinfo.currentmove = berserk_move_stand`.
- Commentaires d'en-tete: commentaire TS de `berserk_stand` verifie avec `Original name`, `Source`, `Category: Ported`, `Fidelity level` et comportement; table/global declaratifs sans commentaire de fonction requis.
- Runtime: integre. `SP_monster_berserk` assigne `monsterinfo.stand = berserk_stand` et initialise `currentmove = berserk_move_stand`; le test ajoute prouve le callback `monsterinfo.stand` et un tick `G_RunFrame` qui passe par `monster_think`/`M_MoveFrame` et boucle la frame visible `FRAME_stand5` -> `FRAME_stand1`.
- apps/web: integre. Le flux web utilise le serveur local porte et consomme les snapshots/runtime; aucune logique parallele berserk constatee pour remplacer ce stand.
- renderer-three: integre. Le lot produit des frames MD2 visibles (`s.frame`) pour le modele berserk; les snapshots client conservent `frame/oldframe/backlerp` et `packages/renderer-three` les consomme via `refresh-entity-sync` / `applyMd2AliasFrameLerp`.
- Tests lances:
  - `npm run verify:m-berserk`
  - `npm run verify:m-berserk:source-parity`
  - `npm run verify:m-berserk:header`
  - `npm run verify:full-game:server-host`
  - `npm run verify:web-render-order`
  - `npm run verify:full-game:three-renderer`
  - `npm run typecheck`
- Corrections appliquees:
  - `scripts/verify/quake2-m-berserk.ts`: ajout d'assertions ciblant `monsterinfo.stand`, le move stand et le passage `G_RunFrame`/`monster_think`.

## Session 2026-05-03 - bloc stand fidget declaratif

- Lot traite: `berserk_frames_stand_fidget` global/table/declarative et `berserk_move_stand_fidget`.
- Verdict: Valide.
- Comparaison C/TS: la table stand fidget conserve 20 frames `ai_stand`, toutes avec distance 0 et sans `thinkfunc`; `berserk_move_stand_fidget` conserve `FRAME_standb1`, `FRAME_standb20`, la table fidget et `endfunc = berserk_stand`.
- Commentaires d'en-tete: lot declaratif/global, pas de commentaire de fonction requis; `berserk_stand` et `berserk_fidget`, fonctions rattachees au branchement du lot, avaient deja leurs commentaires verifies.
- Runtime: integre. `berserk_fidget` assigne `currentmove = berserk_move_stand_fidget`; le test ajoute prouve le passage par `G_RunFrame`/`monster_think`, l'entree dans les frames visibles `FRAME_standb1`, puis le retour `endfunc` vers `berserk_move_stand`/`FRAME_stand1`.
- apps/web: integre. Le flux web utilise le serveur local porte et consomme les snapshots/runtime; aucune logique parallele berserk constatee pour remplacer ce fidget.
- renderer-three: integre. Le lot produit des frames MD2 visibles (`s.frame`) pour le modele berserk; les snapshots client conservent `frame/oldframe/backlerp` et `packages/renderer-three` les consomme via `refresh-entity-sync` / `applyMd2AliasFrameLerp`.
- Tests lances:
  - `npm run verify:m-berserk`
  - `npm run verify:m-berserk:source-parity`
  - `npm run verify:m-berserk:header`
  - `npm run verify:full-game:server-host`
  - `npm run verify:web-render-order`
  - `npm run verify:full-game:three-renderer`
  - `npm run typecheck`
- Corrections appliquees:
  - `scripts/verify/quake2-m-berserk.ts`: ajout d'assertions ciblant le flux runtime du move stand fidget et son enregistrement de sauvegarde.

## Prochain lot recommande

- Valider le bloc walk declaratif: `berserk_frames_walk` global/table/declarative et `berserk_move_walk`; garder `berserk_walk` / run pour une session separee si le lot devient trop large.
