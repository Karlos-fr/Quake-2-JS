# Progress - Quake-2-master/game/g_phys.c

- Statut: En cours
- Dernier lot valide: `SV_Physics_Toss`.
- Prochain lot recommande: `sv_stopspeed`, `sv_friction`, `sv_waterfriction`, `SV_AddRotationalFriction` avec locales `n` et `adjustment`.
- Tests de reference: `npm run verify:g-phys`, `npm run typecheck`, `npm run verify:local-gameplay-sync`, `npm run verify:full-game:three-renderer`, `npm run verify:web-render-order`
- Blocages: aucun pour le lot valide.

## Session 2026-05-01 - `SV_TestEntityPosition`

- Lot traite: `SV_TestEntityPosition`, `trace`, `mask` (incluant l'entree `mask` dupliquee par la matrice).
- Comparaison C/TS: le port choisit `ent.clipmask || MASK_SOLID`, appelle le bridge collision avec start=end sur la position courante, puis retourne `runtime.entities[0]` si `trace.startsolid`, equivalent au retour C `g_edicts`; sinon `null`.
- Commentaire d'en-tete: present et conforme (`Original name`, `Source`, `Category: Ported`, `Fidelity level`, comportement et notes de portage).
- Runtime: atteignable depuis `G_RunFrame` / `G_RunEntity` via `SV_Physics_Pusher` -> `SV_Push`, ou directement par les helpers de physique exportes.
- apps/web: le flux full/local game installe un bridge collision dans le runtime gameplay; aucune logique parallele web ne remplace cette fonction.
- renderer-three: pas de sortie directe a consommer; la fonction influence les deplacements de pushers, dont les positions `s.origin` visibles sont ensuite exposees au client puis au renderer.
- Correction: ajout d'assertions ciblees dans `scripts/verify/quake2-g-phys.ts`.
- Tests lances: `npm run verify:g-phys` OK; `npm run typecheck` OK en passe de coordination apres integration des lots paralleles.

## Session 2026-05-01 - `SV_CheckVelocity`

- Lot traite: `SV_CheckVelocity`, locale `i`.
- Comparaison C/TS: le C parcourt les trois composantes et clamp `ent->velocity[i]` sur `+/-sv_maxvelocity->value`; le TS parcourt les trois composantes, utilise `runtime.maxvelocity` dans les chemins physique normaux, et garde la valeur par defaut 2000 pour les appels directs.
- Commentaire d'en-tete: present et mis a jour avec la note de portage sur le passage explicite de `sv_maxvelocity`.
- Runtime: atteignable depuis `G_RunFrame` / `G_RunEntity` via `SV_Physics_Toss` pour `MOVETYPE_TOSS`, `MOVETYPE_BOUNCE`, `MOVETYPE_FLY`, `MOVETYPE_FLYMISSILE`, et via `SV_Physics_Step` pour `MOVETYPE_STEP`; correction ajoutee pour propager `sv_maxvelocity` depuis `g_main.c` vers le runtime.
- apps/web: le flux full/local game utilise le runtime porte; aucune logique web parallele ne remplace ce clamp. Le clamp influence les positions visibles synchronisees vers le client.
- renderer-three: pas de sortie renderer directe; le clamp influence `origin` / `s.origin`, donc camera/scene/entites visibles consomment les positions resultantes via les snapshots et adapters existants.
- Correction: ajout de `runtime.maxvelocity`, synchronisation depuis `sv_maxvelocity`, passage de la valeur a `SV_CheckVelocity`, et assertions ciblees dans `scripts/verify/quake2-g-phys.ts`.
- Tests lances: `npm run verify:g-phys` OK; `npm run typecheck` OK; `npm run verify:local-gameplay-sync` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:web-render-order` OK.

## Session 2026-05-01 - `SV_RunThink`

- Lot traite: `SV_RunThink`, locale `thinktime`.
- Comparaison C/TS: le C lit `ent->nextthink`, retourne `true` si `thinktime <= 0` ou si `thinktime > level.time + 0.001`, remet `nextthink` a 0, exige `ent->think`, appelle le callback, puis retourne `false`; le TS reprend les memes seuils avec `runtime.time`, remet `nextthink` a 0, leve une erreur si le callback manque, journalise l'appel pour verification, appelle `think(ent, runtime)` et retourne `false`.
- Commentaire d'en-tete: present et conforme (`Original name`, `Source`, `Category: Ported`, `Fidelity level: Close`, comportement). Le niveau `Close` reste justifie par le passage explicite du runtime et le log de verification.
- Runtime: atteignable depuis `G_RunFrame` / `G_RunEntity` par toutes les branches physique qui appellent `SV_RunThink` (`PUSH`/teamchain, `NONE`, `NOCLIP`, `TOSS`/`BOUNCE`/`FLY`/`FLYMISSILE`, `STEP`). Les callbacks think peuvent modifier directement des champs visibles (`s.event`, `s.frame`, `s.effects`, `s.sound`, origine/angles), emettre sons/temp entities, ou liberer l'entite.
- apps/web: le flux navigateur utilise le runtime porte via local/full-game; les sorties de callbacks sont consommees par snapshots, drains sons/centerprints/temp entities et synchronisation client. Aucune logique web parallele ne remplace `SV_RunThink`.
- renderer-three: `SV_RunThink` n'a pas de sortie renderer propre, mais les callbacks qu'il declenche peuvent produire modeles/frames/images/particules/beams/dlights/temp entities/areabits/camera/scene indirectement; ces sorties descendent par le client refresh frame et les adapters renderer-three existants.
- Correction: ajout d'assertions ciblees dans `scripts/verify/quake2-g-phys.ts` pour les branches `thinktime <= 0`, futur, du, callback nul, et atteignabilite via `G_RunFrame`.
- Tests lances: `npm run verify:g-phys` OK; `npm run typecheck` OK; `npm run verify:local-gameplay-sync` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:web-render-order` OK.

## Session 2026-05-01 - `SV_Impact`

- Lot traite: `SV_Impact`, locale `e2`.
- Comparaison C/TS: le C recupere `e2 = trace->ent`, appelle `e1->touch(e1, e2, &trace->plane, trace->surface)` si `e1->touch` et `e1->solid != SOLID_NOT`, puis appelle `e2->touch(e2, e1, NULL, NULL)` si `e2->touch` et `e2->solid != SOLID_NOT`; le TS reprend ces deux callbacks avec le runtime explicite et `null/null` pour le second. Le garde `asGameEntity(trace.ent)` est une adaptation defensive du port, sans effet sur les traces runtime normales qui portent une entite.
- Commentaire d'en-tete: present et conforme (`Original name`, `Source`, `Category: Ported`, `Fidelity level: Close`, comportement). Le niveau `Close` reste justifie par le runtime explicite et le garde defensif sur `trace.ent`.
- Runtime: atteignable depuis `G_RunFrame` / `G_RunEntity` par `SV_FlyMove` et `SV_PushEntity` lors des collisions; les callbacks touch peuvent modifier des champs visibles, liberer des entites, emettre sons/temp entities ou declencher de la logique gameplay.
- apps/web: le navigateur utilise le runtime porte en local/full-game; les sorties de callbacks sont consommees par snapshots, brush models, drains de sons, centerprints et temp entities. Aucune logique web parallele ne remplace `SV_Impact`.
- renderer-three: `SV_Impact` n'a pas de sortie renderer propre, mais les callbacks touch qu'il declenche peuvent produire modeles/frames/images/particules/beams/dlights/temp entities/areabits/camera/scene; ces sorties descendent via `ClientRefreshFrame`, `particle-sync`, `three-dlight-sync`, `three-beam-sync` et `gl-world-scene-adapter`.
- Correction: ajout d'assertions ciblees dans `scripts/verify/quake2-g-phys.ts` pour l'ordre/les arguments des callbacks, les gardes `SOLID_NOT`, les emissions son/temp entity, et l'atteignabilite via `G_RunEntity`.
- Tests lances: `npm run verify:g-phys` OK; `npm run typecheck` OK; `npm run verify:local-gameplay-sync` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:web-render-order` OK.

## Session 2026-05-01 - `STOP_EPSILON` / `ClipVelocity`

- Lot traite: `STOP_EPSILON`, `ClipVelocity`, locales `backoff` et `change`.
- Comparaison C/TS: le C definit `STOP_EPSILON` a `0.1`, initialise `blocked`, marque le sol si `normal[2] > 0` et le mur/step si `normal[2] == 0`, calcule `backoff = DotProduct(in, normal) * overbounce`, puis applique `change = normal[i] * backoff` et remet a zero les composantes strictement comprises entre `-STOP_EPSILON` et `STOP_EPSILON`; le TS reprend ces branches, le meme seuil strict, le meme retour de flags, et accepte le cas entree/sortie aliasable attendu par les appels physiques.
- Commentaire d'en-tete: present et conforme pour `ClipVelocity` (`Original name`, `Source`, `Category: Ported`, `Fidelity level: Strict`, comportement). `STOP_EPSILON` est une constante privee de module utilisee par la fonction portee.
- Runtime: `ClipVelocity` est atteignable depuis `G_RunFrame` / `G_RunEntity` via `SV_Physics_Step` -> `SV_FlyMove`, et via `SV_Physics_Toss` pour toss/bounce/fly/flymissile. Le calcul influence `velocity`, puis `origin` / `s.origin`.
- apps/web: le navigateur declenche ce flux par le runtime porte en local/full-game (`advanceLocalGameplayRuntime` -> `G_RunFrame`) et ne contient pas de logique parallele qui remplace `ClipVelocity`.
- renderer-three: pas de sortie renderer directe; les sorties visibles attendues sont les positions/origines et poses derivees apres mouvement physique, consommees par les snapshots client et `renderer-three` (`refresh-entity-sync`, brush models/world scene). Pas de particules, beams, dlights, temp entities, areabits ou camera produits directement par cette entite.
- Correction: ajout d'assertions ciblees dans `scripts/verify/quake2-g-phys.ts` pour le flag floor, le flag step/wall, `overbounce`, le seuil `STOP_EPSILON`, et le cas entree/sortie aliasable.
- Tests lances: `npm run verify:g-phys` OK; `npm run typecheck` OK; `npm run verify:local-gameplay-sync` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:web-render-order` OK.

## Session 2026-05-01 - `MAX_CLIP_PLANES` / debut `SV_FlyMove`

- Lot traite: `MAX_CLIP_PLANES`, `SV_FlyMove`, locales `hit`, `dir` et `d`.
- Comparaison C/TS: le C fixe `MAX_CLIP_PLANES` a 5, `numbumps` a 4, remet `groundentity` a `NULL`, trace depuis l'origine vers `end`, gere `allsolid`, deplacement partiel, flags floor/step, `hit = trace.ent`, appel `SV_Impact`, stockage des plans, resolution par plan puis par crease avec `CrossProduct(planes[0], planes[1], dir)`, `d = DotProduct(dir, ent->velocity)` et `VectorScale(dir, d, ent->velocity)`. Le TS conserve ces branches avec `runtime.collision`, `asGameEntity(trace.ent)`, tableaux `planes`, `crossProduct` et `scaleVec3`.
- Commentaire d'en-tete: present et conforme pour `SV_FlyMove` (`Original name`, `Source`, `Category: Ported`, `Fidelity level: Close`, comportement). Le niveau `Close` reste justifie par le runtime explicite et le bridge collision.
- Runtime: atteignable depuis `G_RunFrame` / `G_RunEntity` via `SV_Physics_Step` pour `MOVETYPE_STEP`, et via `SV_Physics_Toss` pour `MOVETYPE_TOSS`, `MOVETYPE_BOUNCE`, `MOVETYPE_FLY` et `MOVETYPE_FLYMISSILE`. Le lot modifie `velocity`, `origin`, `s.origin`, `groundentity` et peut declencher `SV_Impact`.
- apps/web: le navigateur declenche ce flux par le runtime porte en local/full-game (`advanceLocalGameplayRuntime` puis `G_RunFrame`) et consomme les positions/snapshots/refresh frames resultants; aucune logique web parallele ne remplace `SV_FlyMove`.
- renderer-three: pas de sortie renderer directe propre au calcul; les sorties visibles attendues sont les entites/modeles/brush models/camera-scene via origines et refresh frames apres mouvement. Les particules, beams, dlights, temp entities ou sons peuvent seulement venir des callbacks `SV_Impact` deja routes par les flux client/renderer existants.
- Correction: ajout d'assertions ciblees dans `scripts/verify/quake2-g-phys.ts` pour `hit`/`groundentity`, la resolution `dir`/`d` sur crease, et la limite `MAX_CLIP_PLANES` avec les 4 bumps du C.
- Tests lances: `npm run verify:g-phys` OK; `npm run typecheck` OK; `npm run verify:local-gameplay-sync` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:web-render-order` OK.

## Session 2026-05-01 - suite `SV_FlyMove`

- Lot traite: locales `numplanes`, `planes`, `trace`, `end`, `time_left` et `blocked`.
- Comparaison C/TS: le C initialise `numplanes = 0`, conserve `planes[MAX_CLIP_PLANES]`, calcule `end = ent->s.origin + time_left * velocity`, lit `trace = gi.trace(...)`, reduit `time_left` par `trace.fraction`, remet `numplanes` a 0 apres un deplacement partiel, accumule les plans de collision, et retourne les flags `blocked`; le TS reprend ce flux avec `planes.length`, `runtime.collision.trace`, `setEntityOrigin`, `time_left`, et `blocked`.
- Commentaire d'en-tete: present et conforme pour `SV_FlyMove` (`Original name`, `Source`, `Category: Ported`, `Fidelity level: Close`, comportement). Le niveau `Close` reste justifie par le runtime explicite et le bridge collision.
- Runtime: atteignable depuis `G_RunFrame` / `G_RunEntity` via `SV_Physics_Step` pour `MOVETYPE_STEP`, et via `SV_Physics_Toss` pour `MOVETYPE_TOSS`, `MOVETYPE_BOUNCE`, `MOVETYPE_FLY` et `MOVETYPE_FLYMISSILE`; le lot modifie `velocity`, `origin`, `s.origin`, `groundentity` et peut declencher `SV_Impact`.
- apps/web: le navigateur declenche ce flux par le runtime porte en local/full-game et consomme les positions/snapshots/refresh frames resultants; aucune logique web parallele ne remplace `SV_FlyMove`.
- renderer-three: pas de sortie renderer directe propre a ces locales; les sorties visibles attendues sont les entites/modeles/brush models/camera-scene via origines et refresh frames apres mouvement. Les particules, beams, dlights, temp entities ou sons ne peuvent venir qu'indirectement des callbacks `SV_Impact` deja routes par les flux client/renderer existants.
- Correction: ajout d'un scenario cible dans `scripts/verify/quake2-g-phys.ts` couvrant `trace`, les `end` successifs, la reduction de `time_left`, les flags `blocked`, la synchronisation `origin`/`s.origin`, et le refresh `groundentity` apres un plan floor.
- Tests lances: `npm run verify:g-phys` OK.

## Session 2026-05-01 - `SV_AddGravity`

- Lot traite: `SV_AddGravity`.
- Comparaison C/TS: le C applique `ent->velocity[2] -= ent->gravity * sv_gravity->value * FRAMETIME`; le TS applique maintenant le meme calcul avec le coefficient `ent.gravity`, la valeur `runtime.gravity` issue de `sv_gravity`, et une valeur par defaut 800 pour les appels directs.
- Commentaire d'en-tete: present et mis a jour avec la note de portage sur le passage explicite de `sv_gravity`.
- Runtime: integre via `G_RunFrame` / `G_RunEntity` vers `SV_Physics_Toss` pour toss/bounce, et vers `SV_Physics_Step` pour les entites step non au sol; correction faite pour que ces flux passent `runtime.gravity`.
- apps/web: le navigateur utilise le runtime porte en local/full-game; `sv_gravity` et la cle `worldspawn.gravity` synchronisent `runtime.gravity`, puis les positions/origines resultantes sont exposees aux snapshots/refresh frames. Aucune logique web parallele ne remplace ce calcul.
- renderer-three: pas de sortie renderer directe; les sorties visibles attendues sont les positions/origines des entites, brush models et scene/camera apres mouvement physique. Pas de modeles, frames, images, particules, beams, dlights, temp entities ou areabits produits directement par cette fonction.
- Correction: `packages/game/src/g_phys.ts` utilise `runtime.gravity` pour `SV_AddGravity` dans les flux toss/step et pour le seuil `hitsound`; `scripts/verify/quake2-g-phys.ts` couvre l'appel direct avec gravite non standard et l'appel runtime via `G_RunEntity`.
- Tests lances: `npm run verify:g-phys` OK; `npm run typecheck` OK; `npm run verify:local-gameplay-sync` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:web-render-order` OK.

## Session 2026-05-01 - `SV_PushEntity`

- Lot traite: `SV_PushEntity`, locales `trace` et `mask`, incluant l'entree `mask` dupliquee par la matrice.
- Comparaison C/TS: le C copie `ent->s.origin` dans `start`, calcule `end = start + push`, choisit `ent->clipmask` ou `MASK_SOLID`, trace, copie `trace.endpos` vers `ent->s.origin`, relink l'entite, appelle `SV_Impact` si `trace.fraction != 1.0`, revient a `start` et retry si `trace.ent` a ete liberee alors que `ent` existe encore, puis appelle `G_TouchTriggers` si `ent->inuse`. Le TS reprend ce flux avec `start`, `end`, `mask`, `runtime.collision.trace`, `setEntityOrigin`, `linkGameEntity`, `SV_Impact`, retry via boucle et `touchTriggerEntities`.
- Commentaire d'en-tete: present et conforme (`Original name`, `Source`, `Category: Ported`, `Fidelity level: Close`, comportement). Le niveau `Close` reste justifie par le runtime explicite et le bridge collision.
- Runtime: atteignable depuis `G_RunFrame` / `G_RunEntity` via `SV_Physics_Toss` pour toss/bounce/fly/flymissile et via `SV_Push` pour les pushers; la fonction modifie `origin`/`s.origin`, relink l'entite et peut declencher callbacks touch/triggers.
- apps/web: le navigateur declenche ce flux par le runtime porte en local/full-game; aucune logique web parallele ne remplace `SV_PushEntity`. Les sorties attendues sont les positions/snapshots/sons/temp entities issus des callbacks.
- renderer-three: pas de sortie renderer directe; les sorties visibles attendues sont les entites, modeles/brush models, camera/scene via positions et refresh frames. Les particules, beams, dlights, temp entities ou sons peuvent venir indirectement des callbacks `SV_Impact`/trigger deja routes par les flux client/renderer existants.
- Correction: ajout d'assertions ciblees dans `scripts/verify/quake2-g-phys.ts` pour `trace`, `mask` explicite, fallback `MASK_SOLID`, retry apres entite impactee liberee, relink, conservation de `velocity` et trigger touch.
- Tests lances: `npm run verify:g-phys` OK; `npm run typecheck` OK; `npm run verify:local-gameplay-sync` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:web-render-order` OK.

## Session 2026-05-01 - `pushed_t` / `obstacle`

- Lot traite: `pushed_t`, champs/locales matricielles `ent`, `deltayaw` et global `obstacle`.
- Comparaison C/TS: le C conserve pour chaque entite poussee `ent`, `origin`, `angles` et `deltayaw`, dans une pile `pushed` partagee par toute la team pendant `SV_Physics_Pusher`; `obstacle` garde l'entite bloquante pour le callback `blocked`. Le TS conserve les memes informations dans `pushed_t`, avec `deltaYaw` pour `client.ps.pmove.delta_angles[YAW]`, et utilise maintenant une pile partagee par les appels `SV_Push` d'une meme team pusher.
- Commentaire d'en-tete: `pushed_t`, `capturePushedState` et `rollbackPush` ont des commentaires `Category: New` justifiant l'adaptation TS. Pas de fonction C propre a commenter pour les entrees locales `ent` / `deltayaw` / `obstacle`.
- Runtime: integre via `G_RunFrame` / `G_RunEntity` -> `SV_Physics_Pusher` -> `SV_Push`; correction appliquee pour que le rollback d'un blocage sur un membre de team restaure aussi les mouvements des membres precedents, comme la pile globale C.
- apps/web: le navigateur declenche ce flux par le runtime porte en local/full-game; aucune logique web parallele ne remplace la pile de rollback. Les sorties sont les positions/angles et callbacks `blocked` exposes ensuite par snapshots/evenements.
- renderer-three: pas de sortie renderer directe; les sorties visibles attendues sont les origines/angles des brush models, riders et scene apres rollback ou mouvement pusher. Les modeles/frames/images/particules/beams/dlights/temp entities/areabits/camera ne sont pas produits directement par ce lot, mais les positions finales sont consommees par les refresh frames et adapters renderer existants.
- Correction: `SV_Push` accepte une pile `pushed_t` optionnelle; `SV_Physics_Pusher` partage une pile unique sur toute la team. Ajout d'assertions ciblees couvrant rollback multi-part, restauration `delta_angles[YAW]`, et routage `obstacle` vers `blocked`.
- Tests lances: `npm run verify:g-phys` OK; `npm run verify:collision:phase5` OK apres correction du harness de verification qui utilisait un rider `MOVETYPE_PUSH` au lieu d'une boite dynamique poussable.

## Session 2026-05-01 - `SV_Push`

- Lot traite: `SV_Push`, locale `temp`.
- Comparaison C/TS: le C arrondit chaque composante de `move` sur la grille 1/8 via la locale `temp`, calcule la bbox finale du pusher, deplace le pusher, teste les entites solides liees, deplace les riders ou entites poussees, applique la rotation via `AngleVectors(-amove)`, restaure toute la pile en cas de blocage, puis appelle `G_TouchTriggers` sur les entites poussees en cas de succes. Le TS reprend ce flux avec `clampPushAxis`, `AngleVectors`, `SV_TestEntityPosition`, la pile `pushed_t`, `rollbackPush` et `touchTriggerEntities`.
- Commentaire d'en-tete: present et mis a jour avec la note de portage sur `clampPushAxis` pour la locale C `temp` et la pile partagee des team pushers.
- Runtime: integre via `G_RunFrame` / `G_RunEntity` -> `SV_Physics_Pusher` -> `SV_Push`; le test direct couvre aussi la branche rider bloque puis acceptable a son ancienne position.
- apps/web: le navigateur declenche ce flux via le runtime local/full-game; aucune logique parallele web ne remplace `SV_Push`. Les sorties attendues sont les positions/angles/linking, callbacks `blocked`/touch/trigger et evenements produits indirectement.
- renderer-three: pas de sortie renderer directe; les sorties visibles attendues sont les origines/angles des entites, brush models, riders et scene apres mouvement ou rollback. Elles sont consommees via snapshots/refresh frames, `refresh-entity-sync` et l'adapter de scene; pas de particules, beams, dlights, images, frames ou areabits produits directement par `SV_Push`.
- Correction: suppression du `linkGameEntity` TS dans la branche ou une entite riding est bloquee apres push mais peut rester a son ancienne position, pour respecter le C qui decrement seulement `pushed_p`. Ajout d'assertions ciblees pour l'arrondi `temp` positif/negatif, la conservation de l'ancienne position du rider, le `delta_angles[YAW]` conserve comme en C et l'absence de relink dans cette branche.
- Tests lances: `npm run verify:g-phys` OK; `npm run verify:collision:phase5` OK; `npm run typecheck` OK; `npm run verify:local-gameplay-sync` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:web-render-order` OK.

## Session 2026-05-01 - `SV_Physics_Pusher`

- Lot traite: `SV_Physics_Pusher`.
- Comparaison C/TS: le C ignore les `FL_TEAMSLAVE`, partage la pile `pushed` sur toute la team, deplace seulement les membres avec `velocity` ou `avelocity`, arrete au premier `SV_Push` bloque, verifie la borne `MAX_EDICTS`, bump les `nextthink` de toute la team en cas d'echec, appelle `part->blocked(part, obstacle)` si present, sinon execute `SV_RunThink` pour chaque membre en cas de succes. Le TS reprend ces branches avec `hasMovement`, une pile `pushed_t[]` partagee, `SV_Push(part, move, amove, runtime, pushed)`, bump de `nextthink`, callback `blocked(part, obstacle, runtime)` quand un obstacle existe, puis `SV_RunThink` sur la team au succes. La verification de depassement `MAX_EDICTS` n'est pas transposee telle quelle car la pile TS est dynamique, sans ecriture hors bornes.
- Commentaire d'en-tete: present et conforme (`Original name`, `Source`, `Category: Ported`, `Fidelity level: Close`, comportement).
- Runtime: integre via `G_RunFrame` / `G_RunEntity` pour `MOVETYPE_PUSH` et `MOVETYPE_STOP`; le flux normal traite portes, plateformes et autres pushers, modifie `origin`/`angles`/`s.origin`, relink les entites et peut declencher callbacks `blocked`, `touch` et triggers via `SV_Push`.
- apps/web: le navigateur declenche ce flux par le runtime porte en local/full-game; aucune logique web parallele ne remplace `SV_Physics_Pusher`. Les sorties attendues sont les positions/angles de brush models et les evenements indirects deja consommes par les snapshots/refresh frames/drains runtime.
- renderer-three: pas de sortie renderer propre de type particules, beams, dlights, temp entities, images, frames, areabits ou camera; les sorties visibles attendues sont les origines/angles des entites et brush models deplaces, consommees par `buildBrushModelSnapshots`, `buildInterpolatedBrushModelSnapshots`, `CL_BuildRefreshFrame`, `createThreeRefreshEntitySync` et `gl-world-scene-adapter`.
- Correction: ajout d'assertions ciblees dans `scripts/verify/quake2-g-phys.ts` pour le no-op `FL_TEAMSLAVE`, le succes avec `SV_RunThink`, et l'echec avec rollback, bump de `nextthink` et callback `blocked`.
- Tests lances: `npm run verify:g-phys` OK; `npm run typecheck` OK; `npm run verify:local-gameplay-sync` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:web-render-order` OK.

## Session 2026-05-01 - `SV_Physics_None`

- Lot traite: `SV_Physics_None`.
- Comparaison C/TS: le C appelle uniquement `SV_RunThink(ent)` pour les objets non mobiles; le TS appelle uniquement `SV_RunThink(ent, runtime)`. Aucun mouvement, gravite, collision, relink ou callback touch/trigger n'est ajoute.
- Commentaire d'en-tete: present et conforme (`Original name`, `Source`, `Category: Ported`, `Fidelity level: Strict`, comportement).
- Runtime: integre via `G_RunFrame` / `G_RunEntity` pour `MOVETYPE_NONE`; ce flux couvre les entites statiques qui ont seulement un think regulier.
- apps/web: le navigateur declenche ce flux par le runtime porte en local/full-game; aucune logique web parallele ne remplace `SV_Physics_None`. Les sorties attendues sont uniquement celles que le callback think peut produire ensuite via snapshots, sons, temp entities ou etats runtime.
- renderer-three: pas de sortie renderer directe de type modele, frame, image, particule, beam, dlight, temp entity, areabits, camera ou scene. Si le think modifie des champs visibles ou emet des evenements, les flux client/renderer existants les consomment indirectement.
- Correction: ajout d'assertions ciblees dans `scripts/verify/quake2-g-phys.ts` pour think futur/du, absence de trace collision et absence de modification d'origine/velocite.
- Tests lances: `npm run verify:g-phys` OK; `npm run typecheck` OK; `npm run verify:local-gameplay-sync` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:web-render-order` OK.

## Session 2026-05-01 - `SV_Physics_Noclip`

- Lot traite: `SV_Physics_Noclip`.
- Comparaison C/TS: le C appelle `SV_RunThink(ent)` et retourne si le think est execute, sinon avance `s.angles` par `FRAMETIME * avelocity`, avance `s.origin` par `FRAMETIME * velocity`, puis relink l'entite sans trace collision. Le TS reprend ces branches avec `SV_RunThink(ent, runtime)`, `setEntityPose` pour synchroniser `origin`/`s.origin` et `angles`/`s.angles`, puis `linkGameEntity(runtime, ent)`.
- Commentaire d'en-tete: present et conforme (`Original name`, `Source`, `Category: Ported`, `Fidelity level: Close`, comportement). Le niveau `Close` reste justifie par le runtime explicite et la synchronisation TS des champs miroir.
- Runtime: integre via `G_RunFrame` / `G_RunEntity` pour `MOVETYPE_NOCLIP`; ce flux couvre les entites qui doivent se deplacer sans collision, avec relink spatial apres mouvement.
- apps/web: le navigateur declenche ce flux par le runtime porte en local/full-game; aucune logique web parallele ne remplace `SV_Physics_Noclip`. Les sorties attendues sont les positions/angles et snapshots/refresh frames resultant du runtime.
- renderer-three: pas de sortie renderer directe de type modele, frame, image, particule, beam, dlight, temp entity, areabits ou camera; les sorties visibles attendues sont les origines/angles des entites noclip, consommees indirectement via snapshots, refresh frames et adapters renderer existants.
- Correction: ajout d'assertions ciblees dans `scripts/verify/quake2-g-phys.ts` pour think futur/du, mouvement noclip, synchronisation `s.origin`/`s.angles`, relink et absence de trace collision.
- Tests lances: `npm run verify:g-phys` OK; `npm run typecheck` OK; `npm run verify:local-gameplay-sync` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:web-render-order` OK.

## Session 2026-05-01 - `SV_Physics_Toss`

- Lot traite: `SV_Physics_Toss`, locales `trace`, `move`, `backoff` (incluant l'entree dupliquee par la matrice), `slave`, `wasinwater`, `isinwater` et `old_origin`.
- Comparaison C/TS: le C execute `SV_RunThink`, ignore ensuite les `FL_TEAMSLAVE`, libere `groundentity` sur vitesse verticale positive ou entite sol liberee, retourne si toujours au sol, conserve `old_origin`, clamp la vitesse, applique la gravite sauf `MOVETYPE_FLY`/`MOVETYPE_FLYMISSILE`, avance les angles, pousse l'origine, clippe avec backoff `1.5` pour bounce sinon `1`, stoppe au sol selon normal Z et seuil bounce, gere les transitions eau et recopie l'origine vers les `teamchain`. Le TS reprend ces branches avec runtime explicite, `setEntityAngles`/`setEntityOrigin`, `SV_PushEntity`, `ClipVelocity`, `runtime.collision.pointcontents` et `linkGameEntity`.
- Commentaire d'en-tete: present et mis a jour avec la note de portage sur les sons d'eau positionnes.
- Runtime: integre via `G_RunFrame` / `G_RunEntity` pour `MOVETYPE_TOSS`, `MOVETYPE_BOUNCE`, `MOVETYPE_FLY` et `MOVETYPE_FLYMISSILE`; ce flux modifie origine/angles/vitesse/waterlevel, relink les team slaves, peut declencher `SV_PushEntity`/`SV_Impact` et produit les sons de splash.
- apps/web: le navigateur declenche ce flux via le runtime porte en local/full-game; aucune logique parallele web ne remplace cette physique. Les sorties attendues sont positions/snapshots/sons d'eau/callbacks indirects, consommees par les drains runtime et le client.
- renderer-three: pas de logique gameplay renderer attendue; les sorties visibles sont les origines/angles des entites toss/bounce/fly/flymissile, modeles/frames deja presents et eventuels effets indirects via callbacks. Les sons positionnes restent des sorties audio runtime, pas un rendu Three direct.
- Correction: `packages/game/src/g_phys.ts` emet maintenant les sons `misc/h2ohit1.wav` avec origine explicite comme `gi.positioned_sound`; `scripts/verify/quake2-g-phys.ts` couvre teamslave, onground, groundentity liberee, skip gravite fly/flymissile, bounce backoff/seuil sol, transitions eau avec origine sonore, et propagation teamchain.
- Tests lances: `npm run verify:g-phys` OK; `npm run typecheck` OK; `npm run verify:local-gameplay-sync` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:web-render-order` OK.
