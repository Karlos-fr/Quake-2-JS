# Progress - Quake-2-master/game/m_actor.c

## Etat courant

- Statut: En cours
- Dernier lot traite: bloc walk `actor_frames_walk`, `actor_move_walk`, `actor_walk`
- Verdict: `Valide` pour les cinq entrees de matrice du lot

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

## Tests de reference

- `npm run verify:m-actor`
- `npm run verify:local-gameplay-sync`
- `npm run verify:full-game:server-host`
- `npm run verify:web-render-order`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

## Prochain lot recommande

Valider le bloc run: `actor_frames_run` (lignes global/table/declarative), `actor_move_run`, puis `actor_run` si le lot reste petit.

## Blocages / decisions

- La matrice contient des doublons `global`/`table` pour les tableaux de frames; les traiter ensemble par bloc d'animation.
- La matrice contient aussi une ligne dupliquee `actor_stand`; les deux lignes ont ete validees ensemble avec la meme preuve.
