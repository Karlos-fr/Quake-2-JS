# Progress - Quake-2-master/game/g_phys.c

- Statut: En cours
- Dernier lot valide: `STOP_EPSILON` et `ClipVelocity` avec locales `backoff` / `change`.
- Prochain lot recommande: `MAX_CLIP_PLANES`, puis debuter `SV_FlyMove` avec les locales `hit`, `dir` et `d` si le lot reste petit.
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
