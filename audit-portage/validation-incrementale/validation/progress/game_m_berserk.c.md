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

## Session 2026-05-06 - bloc walk declaratif

- Lot traite: `berserk_frames_walk` global/table/declarative et `berserk_move_walk`.
- Verdict: Valide.
- Comparaison C/TS: la table walk conserve les 12 entrees C `ai_walk`, distances `9.1, 6.3, 4.9, 6.7, 6.0, 8.2, 7.2, 6.1, 4.9, 4.7, 4.7, 4.8`, sans `thinkfunc`; `berserk_move_walk` conserve `FRAME_walkc1`, `FRAME_walkc11`, la table walk et aucun `endfunc`.
- Commentaires d'en-tete: lot declaratif/global, pas de commentaire de fonction requis; `berserk_walk` reste reserve au prochain lot.
- Runtime: integre. Le test ajoute prouve un `currentmove = berserk_move_walk` avance par `G_RunFrame`/`monster_think` dans la plage visible `FRAME_walkc1`..`FRAME_walkc11`, boucle vers `FRAME_walkc1`, et verifie l'enregistrement `findGameSaveMove("berserk_move_walk")`.
- apps/web: integre. Le flux web utilise le serveur local porte et consomme les snapshots/runtime; aucune logique parallele berserk constatee pour remplacer ces frames walk.
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
  - `scripts/verify/quake2-m-berserk.ts`: ajout d'assertions ciblant le flux runtime du move walk et son enregistrement de sauvegarde.

## Session 2026-05-06 - `berserk_walk`

- Lot traite: fonction `berserk_walk` seule, avec affectation `berserk_move_walk` et branchement `monsterinfo.walk`.
- Verdict: Valide.
- Comparaison C/TS: la fonction C assigne seulement `self->monsterinfo.currentmove = &berserk_move_walk`; la fonction TS conserve le meme effet avec `self.monsterinfo.currentmove = berserk_move_walk`, sans entree supplementaire, retour, branche, son, flag ou effet de bord additionnel.
- Commentaires d'en-tete: commentaire TS de `berserk_walk` verifie avec `Original name`, `Source`, `Category: Ported`, `Fidelity level` et comportement.
- Runtime: integre. `SP_monster_berserk` assigne `monsterinfo.walk = berserk_walk`; le test ajoute prouve que `G_RunFrame` atteint ce callback via `ai_stand` quand `pausetime` expire et bascule `currentmove` vers `berserk_move_walk`.
- apps/web: integre. Le navigateur declenche ce flux via le serveur local porte (`SV_Frame`/`G_RunFrame`) et consomme les snapshots/runtime; aucune logique parallele berserk constatee.
- renderer-three: integre. La fonction selectionne un move qui produit des frames MD2 visibles (`s.frame`) pour le modele berserk; les snapshots client conservent `frame/oldframe/backlerp` et `packages/renderer-three` les consomme via `refresh-entity-sync` / `applyMd2AliasFrameLerp`.
- Tests lances:
  - `npm run verify:m-berserk`
  - `npm run verify:m-berserk:source-parity`
  - `npm run verify:m-berserk:header`
  - `npm run verify:full-game:server-host`
  - `npm run verify:web-render-order`
  - `npm run verify:full-game:three-renderer`
  - `npm run typecheck`
- Corrections appliquees:
  - `scripts/verify/quake2-m-berserk.ts`: ajout d'assertions ciblant le branchement `monsterinfo.walk` et son atteignabilite depuis `G_RunFrame` via `ai_stand`.

## Session 2026-05-06 - bloc run1 declaratif et `berserk_run`

- Lot traite: `berserk_frames_run1` global/table/declarative, `berserk_move_run1` et `berserk_run`.
- Verdict: Valide.
- Comparaison C/TS: la table run1 conserve les 6 entrees `ai_run` et distances `21, 11, 21, 25, 18, 19`; `berserk_move_run1` conserve `FRAME_run1`, `FRAME_run6`, la table run1 et aucun `endfunc`; `berserk_run` conserve la branche `AI_STAND_GROUND` vers `berserk_move_stand` et la branche normale vers `berserk_move_run1`.
- Commentaires d'en-tete: commentaire TS de `berserk_run` verifie avec `Original name`, `Source`, `Category: Ported`, `Fidelity level` et comportement; table/global declaratifs sans commentaire de fonction requis.
- Runtime: integre. `SP_monster_berserk` assigne `monsterinfo.run = berserk_run`; le test ajoute prouve le callback `monsterinfo.run`, les deux branches `AI_STAND_GROUND`/run, l'enregistrement `findGameSaveMove("berserk_move_run1")`, et la boucle visible `FRAME_run6` -> `FRAME_run1` via `G_RunFrame`/`monster_think`.
- apps/web: integre. Le navigateur declenche ce flux via le serveur local porte (`SV_Frame`/`G_RunFrame`) et consomme les snapshots/runtime; aucune logique parallele berserk constatee.
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
  - `scripts/verify/quake2-m-berserk.ts`: ajout d'assertions ciblant le flux runtime du move run1, le branchement `monsterinfo.run`, la branche `AI_STAND_GROUND` et l'enregistrement de sauvegarde.

## Session 2026-05-06 - bloc attaque spike

- Lot traite: `berserk_attack_spike`, `berserk_swing`, `berserk_frames_attack_spike` global/table/declarative et `berserk_move_attack_spike`.
- Verdict: Valide.
- Comparaison C/TS: `berserk_attack_spike` conserve l'aim statique `[MELEE_DISTANCE, 0, -24]`, l'appel `fire_hit`, les degats `15 + rand() % 6` portes en `15 + randomInt(6)`, et le kick `400`; `berserk_swing` conserve le son `sound_punch` sur `CHAN_WEAPON`, volume `1`, `ATTN_NORM`, `timeofs` 0; la table conserve 8 frames `ai_charge`, distances 0, callbacks aux index 2 (`berserk_swing`) et 3 (`berserk_attack_spike`); `berserk_move_attack_spike` conserve `FRAME_att_c1`..`FRAME_att_c8` et `endfunc = berserk_run`.
- Commentaires d'en-tete: commentaires TS de `berserk_attack_spike` et `berserk_swing` verifies et precises; table/global declaratifs sans commentaire de fonction requis.
- Runtime: integre. `SP_monster_berserk` assigne `monsterinfo.melee = berserk_melee`; le test ajoute prouve la selection spike depuis `monsterinfo.melee`, le passage `G_RunFrame`/`monster_think` par les frames visibles, l'emission sonore drainee via `gi.sound`, le callback `fire_hit` et le retour `endfunc` vers `berserk_run`/`berserk_move_run1`.
- apps/web: integre. Le navigateur declenche ce flux via le serveur local porte (`SV_Frame`/`G_RunFrame`) et consomme les snapshots/runtime et les sons; aucune logique parallele berserk constatee.
- renderer-three: integre. Le lot produit des frames MD2 visibles (`s.frame`) pour le modele berserk et un son audible; les snapshots client conservent `frame/oldframe/backlerp` et `packages/renderer-three` consomme les entites alias via `refresh-entity-sync` / `applyMd2AliasFrameLerp`.
- Tests lances:
  - `npm run verify:m-berserk`
  - `npm run verify:m-berserk:source-parity`
  - `npm run verify:m-berserk:header`
  - `npm run verify:full-game:server-host`
  - `npm run verify:web-render-order`
  - `npm run verify:full-game:three-renderer`
  - `npm run typecheck`
- Corrections appliquees:
  - `packages/game/src/m_berserk.ts`: notes de portage precisees pour `berserk_attack_spike` et `berserk_swing`.
  - `scripts/verify/quake2-m-berserk.ts`: ajout de preuves ciblees pour le chemin `monsterinfo.melee` -> spike -> son/fire_hit -> `berserk_run`, et stabilisation du test walk contre le fidget aleatoire.

## Session 2026-05-06 - bloc attaque club et chainage melee

- Lot traite: `berserk_attack_club`, `berserk_frames_attack_club` global/table/declarative, `berserk_move_attack_club`, plus le chainage coherent depuis `berserk_melee`.
- Verdict: Valide.
- Comparaison C/TS: `berserk_attack_club` conserve l'aim dynamique `VectorSet(aim, MELEE_DISTANCE, self->mins[0], -4)`, l'appel `fire_hit`, les degats `5 + rand() % 6` portes en `5 + randomInt(6)`, et le kick `400`; la table conserve 12 frames `ai_charge`, distances 0, callbacks aux index 4 (`berserk_swing`) et 8 (`berserk_attack_club`); `berserk_move_attack_club` conserve `FRAME_att_c9`..`FRAME_att_c20` et `endfunc = berserk_run`; `berserk_melee` conserve la selection aleatoire spike/club par `rand() % 2`.
- Commentaires d'en-tete: commentaires TS de `berserk_attack_club` et `berserk_melee` verifies avec `Original name`, `Source`, `Category: Ported`, `Fidelity level` et comportement; table/global declaratifs sans commentaire de fonction requis.
- Runtime: integre. `SP_monster_berserk` assigne `monsterinfo.melee = berserk_melee`; le test ajoute prouve la selection club depuis `monsterinfo.melee`, le passage `G_RunFrame`/`monster_think` par les frames visibles, l'emission sonore `berserk_swing`, le callback `fire_hit` avec degats club, l'enregistrement `findGameSaveMove("berserk_move_attack_club")` et le retour `endfunc` vers `berserk_run`/`berserk_move_run1`.
- apps/web: integre. Le navigateur declenche ce flux via le serveur local porte (`SV_Frame`/`G_RunFrame`) et consomme les snapshots/runtime et les `soundEvents`; aucune logique parallele berserk constatee.
- renderer-three: integre. Le lot produit des frames MD2 visibles (`s.frame`) pour le modele berserk et un son audible; les snapshots client conservent `frame/oldframe/backlerp` et `packages/renderer-three` consomme les entites alias via `refresh-entity-sync` / `applyMd2AliasFrameLerp`.
- Tests lances:
  - `npm run verify:m-berserk`
  - `npm run verify:m-berserk:source-parity`
  - `npm run verify:m-berserk:header`
  - `npm run verify:full-game:server-host`
  - `npm run verify:web-render-order`
  - `npm run verify:full-game:three-renderer`
  - `npm run typecheck`
- Corrections appliquees:
  - `scripts/verify/quake2-m-berserk.ts`: ajout de preuves ciblees pour le chemin `monsterinfo.melee` -> club -> son/fire_hit -> `berserk_run`, couverture save registry du move club, et stabilisation du retour stand fidget contre le tirage aleatoire.

## Session 2026-05-06 - bloc attaque strike

- Lot traite: `berserk_strike`, `berserk_frames_attack_strike` global/table/declarative et `berserk_move_attack_strike`, avec reutilisation de `berserk_swing` et `endfunc = berserk_run`.
- Verdict: Valide.
- Comparaison C/TS: `berserk_strike` conserve le comportement source vide avec le `FIXME play impact sound` documente comme hook volontairement sans emission; la table conserve 14 frames `ai_move`, distances `0` pour les 12 premieres frames puis `9.7` et `13.6`, callbacks aux index 3 (`berserk_swing`) et 7 (`berserk_strike`); `berserk_move_attack_strike` conserve `FRAME_att_c21`..`FRAME_att_c34` et `endfunc = berserk_run`.
- Commentaires d'en-tete: commentaire TS de `berserk_strike` verifie avec `Original name`, `Source`, `Category: Ported`, `Fidelity level` et comportement; table/global declaratifs sans commentaire de fonction requis.
- Runtime: Valide avec justification. Le C original ne branche pas ce move depuis `berserk_melee` et le TS conserve cette absence de selection gameplay normale; le test prouve toutefois que le move porte est executable/restaurable, declenche `berserk_swing`, appelle le hook vide `berserk_strike`, conserve les frames visibles et revient via `berserk_run`.
- apps/web: integre pour les sorties produites. Le navigateur declenche le runtime porte (`SV_Frame`/`G_RunFrame`) et consomme les snapshots/runtime et `soundEvents`; aucune logique parallele berserk constatee. Aucune integration web supplementaire n'est attendue tant que le move strike n'est pas selectionne par le gameplay source.
- renderer-three: integre pour les sorties visibles produites. Le lot produit des frames MD2 visibles (`s.frame`) si le move est courant; les snapshots client conservent `frame/oldframe/backlerp` et `packages/renderer-three` consomme les entites alias via `refresh-entity-sync` / `applyMd2AliasFrameLerp`. Pas de particule, beam, dlight, temp entity, areabits, camera ou scene additionnelle pour le FIXME vide.
- Tests lances:
  - `npm run verify:m-berserk`
  - `npm run verify:m-berserk:source-parity`
  - `npm run verify:m-berserk:header`
  - `npm run verify:full-game:server-host`
  - `npm run verify:web-render-order`
  - `npm run verify:full-game:three-renderer`
  - `npm run typecheck`
- Corrections appliquees:
  - `scripts/verify/quake2-m-berserk.ts`: ajout de preuves ciblees pour le move strike, son swing, le hook vide du FIXME impact sound, les distances finales, le retour `berserk_run` et l'enregistrement de sauvegarde.

## Prochain lot recommande

- Valider le bloc douleur `berserk_frames_pain1`, `berserk_move_pain1`, `berserk_frames_pain2`, `berserk_move_pain2` et `berserk_pain`, avec son pain, skin, `pain_debounce_time`, nightmare-skip, selection par degats/random et retour `berserk_run`.
