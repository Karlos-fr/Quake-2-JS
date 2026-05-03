# Progress - Quake-2-master/game/m_actor.c

## Etat courant

- Statut: En cours
- Dernier lot traite: bloc flipoff `actor_frames_flipoff`, `actor_move_flipoff`
- Verdict: `Valide` pour les quatre entrees de matrice du lot

## Checklist appliquee au lot

- Identification: `actor_frames_stand` global/table/declarative, `actor_move_stand`, et les deux lignes dupliquees `actor_stand` sont proprietaires de `game/m_actor.c`, cibles dans `packages/game/src/m_actor.ts`, exports accessibles via `actorFrames`.
- Comparaison C vs TS: les 40 frames C `ai_stand, 0, NULL` correspondent a `makeFrames(ai_stand, new Array<number>(40).fill(0))`; `actor_move_stand` conserve `FRAME_stand101` a `FRAME_stand140`, la table stand et `NULL`/`undefined` en `endfunc`; `actor_stand` affecte `currentmove` puis randomise `s.frame` pendant `runtime.time < 1.0` dans le meme intervalle inclusif que le C.
- Commentaires d'en-tete: commentaire de `actor_stand` verifie (`Original name`, `Source`, `Category: Ported`, `Fidelity level: Strict`, comportement); pas de commentaire de fonction requis pour les donnees declaratives, le commentaire de fichier documente le port.
- Runtime: branchement verifie depuis `SP_misc_actor` (`monsterinfo.stand = actor_stand`, `currentmove = actor_move_stand`) et depuis `walkmonster_start`/`g_monster.ts` via `monsterinfo.stand?.(self, runtime)`, atteignable par spawn `misc_actor`, host full-game et frame runtime.
- apps/web: pas de logique parallele attendue pour ce bloc gameplay; `apps/web` doit declencher le flux via le host full-game/local et consommer les snapshots/refresh issus du runtime, couvert par `verify:local-gameplay-sync`, `verify:full-game:server-host` et `verify:web-render-order`.
- renderer-three: le bloc stand produit une sortie visible indirecte (`s.modelindex`/`s.frame` de `misc_actor`); consommation attendue via snapshots client, `V_AddPacketEntities`/refresh entities, puis alias MD2 frame dans `renderer-three`, couverte par `verify:full-game:three-renderer`. Aucun manque renderer ouvert dans ce lot.

## Session 2026-05-03 - bloc walk

- Identification: `actor_frames_walk` global/table/declarative, `actor_move_walk`, et `actor_walk` sont proprietaires de `game/m_actor.c`, cibles dans `packages/game/src/m_actor.ts`, exports accessibles via `actorFrames`.
- Comparaison C vs TS: les 11 frames C `ai_walk` conservent les distances `[0, 6, 10, 3, 2, 7, 10, 1, 4, 0, 0]` et `NULL`/`undefined` pour `thinkfunc`; `actor_move_walk` conserve `FRAME_walk01` a `FRAME_walk08`, la table walk et `NULL`/`undefined` en `endfunc`; `actor_walk` affecte seulement `currentmove = actor_move_walk`.
- Commentaires d'en-tete: commentaire de `actor_walk` verifie (`Original name`, `Source`, `Category: Ported`, `Fidelity level: Strict`, comportement); pas de commentaire de fonction requis pour les donnees declaratives, le commentaire de fichier documente le port.
- Runtime: branchement verifie depuis `SP_misc_actor` (`monsterinfo.walk = actor_walk`) et `actor_use`, puis `target_actor_touch`/AI movement; atteignable par spawn `misc_actor`, callbacks runtime et frame serveur.
- apps/web: pas de logique parallele attendue pour ce bloc gameplay; `apps/web` doit declencher le flux via le host full-game/local et consommer les snapshots/refresh issus du runtime, couvert par `verify:local-gameplay-sync`, `verify:full-game:server-host` et `verify:web-render-order`.
- renderer-three: le bloc walk produit une sortie visible indirecte (`s.modelindex`/`s.frame` de `misc_actor` en deplacement); consommation attendue via snapshots client, refresh entities, puis alias MD2 frame dans `renderer-three`, couverte par `verify:full-game:three-renderer`. Aucun manque renderer ouvert dans ce lot.
- Correction: ajout d'assertions ciblees dans `scripts/verify/quake2-m-actor.ts`.

## Session 2026-05-03 - bloc run

- Identification: `actor_frames_run` global/table/declarative, `actor_move_run`, et `actor_run` sont proprietaires de `game/m_actor.c`, cibles dans `packages/game/src/m_actor.ts`, exports accessibles via `actorFrames`.
- Comparaison C vs TS: les 12 frames C `ai_run` conservent les distances `[4, 15, 15, 8, 20, 15, 8, 17, 12, -2, -2, -1]` et `NULL`/`undefined` pour `thinkfunc`; `actor_move_run` conserve `FRAME_run02` a `FRAME_run07`, la table run et `NULL`/`undefined` en `endfunc`; `actor_run` conserve les branches C pain debounce sans ennemi (`actor_walk` si `movetarget`, sinon `actor_stand`), `AI_STAND_GROUND` vers `actor_stand`, puis `currentmove = actor_move_run`.
- Commentaires d'en-tete: commentaire de `actor_run` verifie (`Original name`, `Source`, `Category: Ported`, `Fidelity level: Strict`, comportement); pas de commentaire de fonction requis pour les donnees declaratives, le commentaire de fichier documente le port.
- Runtime: branchement verifie depuis `SP_misc_actor` (`monsterinfo.run = actor_run`), depuis les `endfunc` des mouvements pain/flipoff/taunt/attack, et depuis `target_actor_touch`; atteignable par spawn `misc_actor`, callbacks runtime et frame serveur.
- apps/web: pas de logique parallele attendue pour ce bloc gameplay; `apps/web` doit declencher le flux via le host full-game/local et consommer les snapshots/refresh issus du runtime, couvert par `verify:local-gameplay-sync`, `verify:full-game:server-host` et `verify:web-render-order`.
- renderer-three: le bloc run produit une sortie visible indirecte (`s.modelindex`/`s.frame` de `misc_actor` en course/attaque); consommation attendue via snapshots client, refresh entities, puis alias MD2 frame dans `renderer-three`, couverte par `verify:full-game:three-renderer`. Aucun manque renderer ouvert dans ce lot.
- Correction: ajout d'assertions ciblees dans `scripts/verify/quake2-m-actor.ts`.

## Session 2026-05-03 - bloc pain1

- Identification: `actor_frames_pain1` global/table/declarative et `actor_move_pain1` sont proprietaires de `game/m_actor.c`, cibles dans `packages/game/src/m_actor.ts`, exports accessibles via `actorFrames`.
- Comparaison C vs TS: les 3 frames C `ai_move` conservent les distances `[-5, 4, 1]` et `NULL`/`undefined` pour `thinkfunc`; `actor_move_pain1` conserve `FRAME_pain101` a `FRAME_pain103`, la table pain1 et `actor_run` en `endfunc`.
- Commentaires d'en-tete: pas de commentaire de fonction requis pour les donnees declaratives; le commentaire de fichier documente le port, et `actor_run` a deja un commentaire d'en-tete verifie comme endfunc cible.
- Runtime: branchement attendu et verifie depuis `actor_pain` (`n == 0` selectionne `actor_move_pain1`) puis progression par `M_MoveFrame`, qui execute `actor_run` en fin de mouvement; atteignable par spawn `misc_actor`, callback `self.pain = actor_pain`, degats runtime et frame serveur.
- apps/web: pas de logique parallele attendue pour ce bloc gameplay; `apps/web` doit declencher le flux via le host full-game/local et consommer les snapshots/refresh issus du runtime, couvert par `verify:local-gameplay-sync`, `verify:full-game:server-host` et `verify:web-render-order`.
- renderer-three: le bloc pain1 produit une sortie visible indirecte (`s.modelindex`/`s.frame` de `misc_actor` pendant l'animation de douleur); consommation attendue via snapshots client, refresh entities, puis alias MD2 frame dans `renderer-three`, couverte par `verify:full-game:three-renderer`. Aucun manque renderer ouvert dans ce lot.
- Correction: ajout d'assertions ciblees dans `scripts/verify/quake2-m-actor.ts`.

## Session 2026-05-03 - bloc pain2

- Identification: `actor_frames_pain2` global/table/declarative et `actor_move_pain2` sont proprietaires de `game/m_actor.c`, cibles dans `packages/game/src/m_actor.ts`, exports accessibles via `actorFrames`.
- Comparaison C vs TS: les 3 frames C `ai_move` conservent les distances `[-4, 4, 0]` et `NULL`/`undefined` pour `thinkfunc`; `actor_move_pain2` conserve `FRAME_pain201` a `FRAME_pain203`, la table pain2 et `actor_run` en `endfunc`.
- Commentaires d'en-tete: pas de commentaire de fonction requis pour les donnees declaratives; le commentaire de fichier documente le port, et `actor_run` a deja un commentaire d'en-tete verifie comme endfunc cible.
- Runtime: branchement attendu et verifie depuis `actor_pain` (`n == 1` selectionne `actor_move_pain2`) puis progression par `M_MoveFrame`, qui execute `actor_run` en fin de mouvement; atteignable par spawn `misc_actor`, callback `self.pain = actor_pain`, degats runtime et frame serveur.
- apps/web: pas de logique parallele attendue pour ce bloc gameplay; `apps/web` doit declencher le flux via le host full-game/local et consommer les snapshots/refresh issus du runtime, couvert par `verify:local-gameplay-sync`, `verify:full-game:server-host` et `verify:web-render-order`.
- renderer-three: le bloc pain2 produit une sortie visible indirecte (`s.modelindex`/`s.frame` de `misc_actor` pendant l'animation de douleur); consommation attendue via snapshots client, refresh entities, puis alias MD2 frame dans `renderer-three`, couverte par `verify:full-game:three-renderer`. Aucun manque renderer ouvert dans ce lot.
- Correction: ajout d'assertions ciblees dans `scripts/verify/quake2-m-actor.ts`.

## Session 2026-05-03 - bloc pain3

- Identification: `actor_frames_pain3` global/table/declarative et `actor_move_pain3` sont proprietaires de `game/m_actor.c`, cibles dans `packages/game/src/m_actor.ts`, exports accessibles via `actorFrames`.
- Comparaison C vs TS: les 3 frames C `ai_move` conservent les distances `[-1, 1, 0]` et `NULL`/`undefined` pour `thinkfunc`; `actor_move_pain3` conserve `FRAME_pain301` a `FRAME_pain303`, la table pain3 et `actor_run` en `endfunc`.
- Commentaires d'en-tete: pas de commentaire de fonction requis pour les donnees declaratives; le commentaire de fichier documente le port, et `actor_run` a deja un commentaire d'en-tete verifie comme endfunc cible.
- Runtime: branchement attendu et verifie depuis `actor_pain` (`n == 2` selectionne `actor_move_pain3`) puis progression par `M_MoveFrame`, qui execute `actor_run` en fin de mouvement; atteignable par spawn `misc_actor`, callback `self.pain = actor_pain`, degats runtime et frame serveur.
- apps/web: pas de logique parallele attendue pour ce bloc gameplay; `apps/web` doit declencher le flux via le host full-game/local et consommer les snapshots/refresh issus du runtime, couvert par `verify:local-gameplay-sync`, `verify:full-game:server-host` et `verify:web-render-order`.
- renderer-three: le bloc pain3 produit une sortie visible indirecte (`s.modelindex`/`s.frame` de `misc_actor` pendant l'animation de douleur); consommation attendue via snapshots client, refresh entities, puis alias MD2 frame dans `renderer-three`, couverte par `verify:full-game:three-renderer`. Aucun manque renderer ouvert dans ce lot.
- Correction: ajout d'assertions ciblees dans `scripts/verify/quake2-m-actor.ts`.

## Session 2026-05-03 - bloc flipoff

- Identification: `actor_frames_flipoff` global/table/declarative et `actor_move_flipoff` sont proprietaires de `game/m_actor.c`, cibles dans `packages/game/src/m_actor.ts`, exports accessibles via `actorFrames`; aucun doublon TS concurrent trouve.
- Comparaison C vs TS: les 14 frames C `ai_turn, 0, NULL` correspondent a `makeFrames(ai_turn, new Array<number>(14).fill(0))`; `actor_move_flipoff` conserve `FRAME_flip01` a `FRAME_flip14`, la table flipoff et `actor_run` en `endfunc`.
- Commentaires d'en-tete: pas de commentaire de fonction requis pour les donnees declaratives; le commentaire de fichier documente le port, et `actor_run` a deja un commentaire d'en-tete verifie comme endfunc cible.
- Runtime: branchement attendu et verifie depuis `actor_pain` quand l'attaquant est un client et que la branche de raillerie est choisie, puis progression par `M_MoveFrame`, qui execute `actor_run` en fin de mouvement; atteignable via spawn `misc_actor`, callback `self.pain = actor_pain`, degats runtime et `G_RunFrame`.
- apps/web: pas de logique parallele attendue pour ce bloc gameplay; `apps/web` doit declencher le flux via le host full-game/local et consommer les snapshots/refresh issus du runtime, couvert par `verify:local-gameplay-sync`, `verify:full-game:server-host` et `verify:web-render-order`.
- renderer-three: le bloc flipoff produit une sortie visible indirecte (`s.modelindex`/`s.frame` de `misc_actor` pendant l'animation); consommation attendue via snapshots client, refresh entities, puis alias MD2 frame dans `renderer-three`, couverte par `verify:full-game:three-renderer`. Aucun manque renderer ouvert dans ce lot.
- Correction: ajout d'assertions ciblees dans `scripts/verify/quake2-m-actor.ts`.

## Tests de reference

- `npm run verify:m-actor`
- `npm run verify:m-actor:header`
- `npm run verify:local-gameplay-sync`
- `npm run verify:full-game:server-host`
- `npm run verify:web-render-order`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

## Prochain lot recommande

Valider le bloc taunt: `actor_frames_taunt` (lignes global/table/declarative) et `actor_move_taunt`, en gardant `messages` et `actor_pain` pour un lot separe si le lot devient trop large.

## Blocages / decisions

- La matrice contient des doublons `global`/`table` pour les tableaux de frames; les traiter ensemble par bloc d'animation.
- La matrice contient aussi une ligne dupliquee `actor_stand`; les deux lignes ont ete validees ensemble avec la meme preuve.
