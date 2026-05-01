# Progress - Quake-2-master/game/g_misc.c

## Dernier lot valide

- 2026-05-01: `START_OFF` / `light_use` / `SP_light`.
- Checklist appliquee:
  - Source C comparee a `packages/game/src/g_misc.ts`: `START_OFF` conserve la valeur macro `1`; `light_use` alterne `CS_LIGHTS + style` entre `"m"` et `"a"` en inversant le bit; `SP_light` libere les lights sans `targetname` ou en deathmatch, n'installe `light_use` que pour `style >= 32`, puis initialise `"a"` ou `"m"` selon `START_OFF`.
  - Commentaires d'en-tete Strict ajoutes pour `light_use` et `SP_light`.
  - Branchement runtime verifie: `light` est enregistre dans `g_spawn.ts`, exporte via `index.ts`, cree par `ED_CallSpawn`; `light_use` est atteignable par `G_UseTargets`/callback `use`; les configstrings gameplay sont videes par `G_RunFrame` vers `gi.configstring` dans le flux serveur.
  - `apps/web`: flux full-game verifie via `SV_Frame` puis copie des `sv.configstrings` vers le client dans `full-game-server-host`; correction appliquee au flux local/browser pour drainer les configstrings gameplay et reparsir les `CS_LIGHTS` en lightstyles client.
  - `renderer-three`: integration attendue car les lightstyles modifient l'eclairage visible des surfaces BSP; consommation presente via `CL_BuildRefreshFrame.lightStyles` puis `gl-world-scene-adapter`/`setLightstyles`.
- Corrections appliquees:
  - `packages/game/src/g_misc.ts`: headers de portage ajoutes.
  - `packages/client/src/local-gameplay-sync.ts`: propagation des configstrings gameplay locales vers `client.cl.configstrings`, avec reparse `CL_SetLightstyle` pour `CS_LIGHTS`.
  - `scripts/verify/quake2-g-misc.ts`: branches `SP_light` et toggle `light_use` couvertes.
  - `scripts/verify/quake2-local-gameplay-sync.ts`: couverture de la propagation lightstyle locale jusqu'au `ClientRefreshFrame`.
- Tests lances:
  - `npm run verify:g-misc` OK.
  - `npx tsx ./scripts/verify/quake2-local-gameplay-sync.ts` OK.
  - `npm run verify:full-game:three-renderer` OK.
  - `npm run verify:gl-light` OK.
  - `npm run verify:gl-rsurf` OK.
  - `npm run typecheck` OK.
  - `npm run verify:cl-parse` bloque avant scenario sur import existant introuvable `packages/client/src/parse.js`.

- Prochain lot recommande: `func_wall_use` / `SP_func_wall`.

- 2026-05-01: `SP_info_null` / `SP_info_notnull`.
- Checklist appliquee:
  - Source C comparee a `packages/game/src/g_misc.ts`: `SP_info_null` libere le marqueur positionnel avec `G_FreeEdict`; `SP_info_notnull` conserve le marqueur non-solide en copiant `s.origin` vers `absmin` et `absmax`.
  - Commentaires d'en-tete Strict ajoutes pour `SP_info_null` et `SP_info_notnull`.
  - Branchement runtime verifie: `info_null` et `info_notnull` sont enregistres dans `g_spawn.ts`, exportes par `index.ts`, et dispatches par `ED_CallSpawn`.
  - `apps/web`: aucune logique parallele trouvee; ces entites sont des marqueurs serveur de map, sans commande/HUD/son/snapshot visible attendu cote navigateur.
  - `renderer-three`: pas de sortie visible attendue. `info_null` est libere, `info_notnull` n'est ni lie ni solide et ne produit aucun modele, frame, image, particule, beam, dlight, temp entity, areabits, camera ou scene.
- Corrections appliquees:
  - `packages/game/src/g_misc.ts`: commentaires d'en-tete de portage ajoutes.
  - `scripts/verify/quake2-g-misc.ts`: couverture directe et dispatch spawn pour les deux marqueurs.
- Tests lances:
  - `npm run verify:g-misc` OK.
  - `npm run verify:g-spawn` OK.
  - `npm run verify:full-game:three-renderer` OK.
  - `npm run typecheck` OK.

- 2026-05-01: `TH_viewthing` / `SP_viewthing`.
- Checklist appliquee:
  - Source C comparee a `packages/game/src/g_misc.ts`: `TH_viewthing` conserve le frame loop `(frame + 1) % 7` et `nextthink = time + FRAMETIME`; `SP_viewthing` conserve le diagnostic `viewthing spawned`, `MOVETYPE_NONE`, `SOLID_BBOX`, `RF_FRAMELERP`, bbox `[-16,-16,-24]` / `[16,16,32]`, modele `models/objects/banner/tris.md2`, link, think `TH_viewthing` et premier `nextthink = time + 0.5`.
  - Commentaires d'en-tete Strict verifies pour `TH_viewthing` et `SP_viewthing`.
  - Branchement runtime verifie: `viewthing` est enregistre dans `g_spawn.ts`, exporte par `index.ts`, cree au spawn map, link comme bbox visible et anime par `G_RunFrame`/`G_RunEntity`/`SV_RunThink`.
  - `apps/web`: aucune logique parallele trouvee; le navigateur doit seulement consommer les snapshots/runtime full-game ou local qui contiennent l'entite visible et sa frame.
  - `renderer-three`: integration attendue car sortie visible MD2 + frame; consommation presente via packet entities -> `CL_BuildRefreshFrame` -> `refresh-entity-sync` -> adapter Three, sans logique gameplay cote renderer.
- Corrections appliquees:
  - `packages/game/src/g_misc.ts`: commentaire d'en-tete et diagnostic runtime source pour `SP_viewthing`.
  - `scripts/verify/quake2-g-misc.ts`: couverture directe du spawn, modele, bbox, link runtime, diagnostic et frame loop.
- Tests lances:
  - `npm run verify:g-misc` OK.
  - `npm run verify:full-game:three-renderer` OK.
  - `npm run typecheck` OK.

- 2026-05-01: `SP_point_combat`.
- Checklist appliquee:
  - Source C comparee a `packages/game/src/g_misc.ts`: en deathmatch, `SP_point_combat` appelle `G_FreeEdict` et s'arrete; hors deathmatch, il configure `SOLID_TRIGGER`, installe `point_combat_touch`, pose les bornes `[-8,-8,-16]` / `[8,8,16]`, force `SVF_NOCLIENT`, rafraichit l'etat spatial et link l'entite.
  - Commentaire d'en-tete Strict ajoute pour `SP_point_combat`.
  - Branchement runtime verifie: `point_combat` est enregistre dans `g_spawn.ts`, exporte par `index.ts`, cree au spawn map, utilise par `monster_start_go` comme `combattarget`, puis atteint via touch/runtime pendant les frames serveur.
  - `apps/web`: aucune logique parallele trouvee; le web consomme les positions et etats issus du runtime via les flux full-game/local et `ClientRefreshFrame`.
  - `renderer-three`: integration attendue indirectement car les combat points pilotent les objectifs et pauses de monstres visibles; le renderer consomme les sorties via packet entities -> refresh frame -> adapter Three, sans compensation gameplay.
- Corrections appliquees:
  - `packages/game/src/g_misc.ts`: commentaire d'en-tete `SP_point_combat`.
  - `scripts/verify/quake2-g-misc.ts`: couverture directe de la configuration spawn et du free deathmatch.
- Tests lances:
  - `npm run verify:g-misc` OK.
  - `npm run verify:g-monster` OK.
  - `npm run verify:full-game:three-renderer` OK.
  - `npm run typecheck` OK.

## Lot precedent

- 2026-05-01: `SP_path_corner`, `point_combat_touch` et locaux `activator`, `savetarget`.
- Checklist appliquee:
  - Source C comparee a `packages/game/src/g_misc.ts`: `SP_path_corner` conserve le refus sans `targetname`, le diagnostic source, `SOLID_TRIGGER`, `path_corner_touch`, bbox `[-8,-8,-8]` / `[8,8,8]`, `SVF_NOCLIENT` et link. `point_combat_touch` conserve la garde `movetarget`, le branchement `target`/`G_PickTarget`, le fallback cible manquante, le hold non swim/fly, le cleanup vers `enemy`, l'effacement `AI_COMBAT_POINT`, le `pathtarget` et l'ordre de choix de l'activator.
  - Commentaires d'en-tete Strict ajoutes pour `SP_path_corner` et `point_combat_touch`.
  - Correction appliquee: `SP_path_corner` journalise maintenant le warning source `path_corner with no targetname` avant `G_FreeEdict`.
  - Branchement runtime verifie: `SP_path_corner` et `SP_point_combat` sont enregistres dans `g_spawn.ts` et exportes; les touches sont atteignables via spawn map, mouvement monstre, `SV_Impact`/touch pendant les frames runtime. `point_combat_touch` est valide ici, mais `SP_point_combat` reste le prochain lot documentaire.
  - `apps/web`: aucune logique parallele trouvee; le web consomme les positions/evenements runtime via snapshots, `full-game-render-source`, `local-client-controller` et `ClientRefreshFrame`.
  - `renderer-three`: integration attendue car trajectoires, pauses, teleports et combat points changent les entites visibles; consommation presente via packet entities -> `CL_BuildRefreshFrame` -> `refresh-entity-sync`; aucune compensation gameplay dans le renderer.
- Corrections appliquees:
  - `packages/game/src/g_misc.ts`: import `vtos`, warning source de `SP_path_corner`, headers `SP_path_corner` et `point_combat_touch`.
  - `scripts/verify/quake2-g-misc.ts`: couverture directe de `SP_path_corner` et des branches `point_combat_touch`.
- Tests lances:
  - `npm run verify:g-misc` OK.
  - `npm run verify:g-monster` OK.
  - `npm run verify:full-game:three-renderer` OK.
  - `npm run typecheck` OK.

## Lot precedent

- 2026-05-01: `path_corner_touch` et locaux `v`, `next`, `savetarget`.
- Checklist appliquee:
  - Source C comparee a `packages/game/src/g_misc.ts`: garde initiale `other->movetarget != self` et `other->enemy`, pathtarget avec sauvegarde/restauration du target, `G_UseTargets`, selection `G_PickTarget`, branche TELEPORT `spawnflags & 1`, assignation `goalentity`/`movetarget`, pause `wait`, terminal stand et calcul `ideal_yaw` correspondent.
  - Locaux compares: `v` est porte par `teleportOrigin` et par `subVec3(...)` pour le yaw; `next` reste un `let` reassigne apres TELEPORT; `savetarget` est porte par `saveTarget` et restaure `self.target` apres usage.
  - Commentaire d'en-tete Strict ajoute pour `path_corner_touch`.
  - Branchement runtime verifie: `monster_start_go` choisit les `path_corner`, `M_MoveToGoal`/mouvement monstre atteint `movetarget`, puis `SV_Impact` appelle le touch pendant `G_RunFrame`; `SP_path_corner` est enregistre dans `g_spawn.ts` et exporte.
  - `apps/web`: aucune logique parallele trouvee; le web consomme les positions/evenements issus des snapshots via `full-game-render-source`, `local-client-controller` et `ClientRefreshFrame`.
  - `renderer-three`: integration attendue car les trajectoires/teleports de monstres changent les entites visibles; consommation presente via packet entities -> `CL_BuildRefreshFrame` -> `refresh-entity-sync`, avec `EV_OTHER_TELEPORT` parse cote client.
- Corrections appliquees:
  - `packages/game/src/g_misc.ts`: commentaire d'en-tete `path_corner_touch`.
  - `scripts/verify/quake2-g-misc.ts`: couverture ajoutee pour pathtarget/restauration, TELEPORT, wait et terminal stand.
- Tests lances:
  - `npm run verify:g-misc` OK.
  - `npm run verify:g-monster` OK.
  - `npm run verify:full-game:three-renderer` OK.
  - `npm run typecheck` OK.

## Lot precedent

- 2026-05-01: `BecomeExplosion1`, `BecomeExplosion2`.
- Checklist appliquee:
  - Source C comparee a `packages/game/src/g_misc.ts`: les deux fonctions ecrivent un `svc_temp_entity` equivalent via `emitGameTempEntity`, conservent respectivement `TE_EXPLOSION1` et `TE_EXPLOSION2`, copient `self->s.origin`, utilisent `MULTICAST_PVS`, puis appellent `G_FreeEdict`.
  - Correction appliquee: les logs `runtime.log` non presents dans le C ont ete retires; commentaires d'en-tete Strict ajoutes pour les deux fonctions.
  - Branchement runtime verifie: appels directs depuis morts monstres (`m_flyer`, `m_float`, `m_hover`), plateformes bloquantes (`g_func`), explosions de `g_misc` (`func_explosive`, `misc_explobox`, viper bomb/blackhole); les temp entities sont drainees par `G_RunFrame` vers `gi.WriteByte`/`WritePosition`/`multicast` ou par le bridge local.
  - `apps/web`: aucune logique parallele trouvee; le full-game connecte `onTempEntity`, construit `ClientRefreshFrame` via `full-game-render-source` et passe ce frame a la boucle Three/ref_gl.
  - `renderer-three`: integration attendue car sorties temp entities visibles; consommation presente via `CL_AddTEntPacket`/`CL_BuildTEntRefresh`, `CL_BuildRefreshFrame` ajoute les explosions comme entites refresh et dlights, puis `renderer-three` consomme `refreshFrame.entities`/`lights`.
- Tests lances:
  - `npm run verify:g-misc` OK.
  - `npx tsx ./scripts/verify/quake2-cl-tent.ts` OK.
  - `npx tsx ./scripts/verify/quake2-local-gameplay-sync.ts` OK.
  - `npm run verify:full-game:three-renderer` OK.
  - `npm run typecheck` OK.

## Lot precedent

- 2026-05-01: `debris_die`, `ThrowDebris` et local `chunk`.
- Checklist appliquee:
  - Source C comparee a `packages/game/src/g_misc.ts`: `debris_die` libere l'edict; `ThrowDebris` cree un `chunk` par `G_Spawn`, copie l'origine, enregistre le modele, calcule `v = [100*crandom, 100*crandom, 100 + 100*crandom]`, applique `self.velocity + speed*v`, configure `MOVETYPE_BOUNCE`, `SOLID_NOT`, avelocity randomisee, cleanup `5 + random()*5`, frame 0, flags 0, classname `debris`, `DAMAGE_YES`, callback `debris_die`, puis link runtime.
  - Commentaires d'en-tete ajoutes pour `debris_die` et `ThrowDebris`.
  - Branchement runtime verifie: `ThrowDebris` est appele par `func_explosive_explode` et `barrel_explode`; ces flux sont atteignables via entites `func_explosive`/`misc_explobox`, dommages/use/think, puis les debris lies sont eligibles aux snapshots et avances par la physique.
  - `apps/web`: aucune logique parallele de debris trouvee; le navigateur consomme les entites visibles via les flux local/full-game et `ClientRefreshFrame`.
  - `renderer-three`: integration attendue car les debris sont des modeles MD2 visibles; consommation presente via `ClientRefreshFrame.entities`, configstrings `CS_MODELS + modelindex`, `refresh-entity-sync` et verification renderer.
- Corrections appliquees:
  - `packages/game/src/g_misc.ts`: commentaires d'en-tete de portage ajoutes.
  - `scripts/verify/quake2-g-misc.ts`: test cible ajoute pour le chunk debris visible, sa velocite, son cleanup, son callback `debris_die` et son modelindex.
- Tests lances:
  - `npm run verify:g-misc` OK.
  - `npm run verify:refresh-entity:alias-flags` OK.
  - `npm run verify:full-game:three-renderer` OK.
  - `npm run typecheck` OK.

## Lot precedent

- 2026-05-01: `ThrowClientHead` et local `gibname`.
- Checklist appliquee:
  - Source C comparee au port TS deplace dans `packages/game/src/p_client.ts`: le choix aleatoire `gibname` conserve les modeles `head2`/`skull` et les skins 1/0; l'origine Z est augmentee de 32; frame, bbox, `DAMAGE_NO`, `SOLID_NOT`, `EF_GIB`, son, `FL_NO_KNOCKBACK`, `MOVETYPE_BOUNCE`, vitesse ajoutee par `VelocityForDamage`, animation client et nettoyage `think`/`nextthink` des bodies sans client correspondent au C.
  - Commentaire d'en-tete `ThrowClientHead` verifie dans `p_client.ts`; il documente le deplacement depuis le helper `g_misc.c`.
  - Branchement runtime verifie: `player_die` et `body_die` appellent `ThrowClientHead`; ces flux sont atteignables via `T_Damage`/`Killed`/mort joueur et body queue, puis les entites liees sont publiees par snapshots.
  - `apps/web`: aucune logique parallele de client head trouvee; le navigateur consomme les sorties runtime par le flux full-game/local, `modelindex`, effets et snapshots.
  - `renderer-three`: integration attendue car la sortie est un modele MD2 visible avec `EF_GIB`; consommation presente via `ClientRefreshFrame.entities`, resolution `CS_MODELS + modelindex`, `refresh-entity-sync`, et trail `EF_GIB` cote client.
- Corrections appliquees:
  - `scripts/verify/quake2-g-misc.ts`: test cible ajoute pour les deux choix `gibname`, skin, bbox, effets, vitesse, animation client et cleanup body queue.
  - `audit-portage/validation-incrementale/validation/matrices/game_g_misc.c.md`: cible documentee comme port deplace dans `packages/game/src/p_client.ts`.
- Tests lances:
  - `npm run verify:full-game:three-renderer` OK.
  - `npm run verify:g-misc` bloque avant scenario sur import existant `packages/game/src/g_items.ts`: `CONTENTS_SOLID` n'est pas exporte par `packages/qcommon/src/index.js`.
  - `npx tsx ./scripts/verify/quake2-p-client.ts` bloque sur le meme import existant.
  - `npm run verify:refresh-entity:alias-flags` bloque sur le meme import existant.
  - `npm run typecheck` bloque sur `packages/game/src/g_items.ts`: `runtime.collision` possiblement `null`.

## Lot precedent

- 2026-05-01: locaux `gib` / `vscale` de `ThrowGib`, puis `ThrowHead` avec son local `vscale`.
- Checklist appliquee:
  - Source C comparee a `packages/game/src/g_misc.ts`: `gib` reste une entite creee par `G_Spawn`, positionnee dans la bbox source, configuree avec model/effects/damage callbacks, vitesse randomisee puis clipee et liee au runtime; les deux `vscale` conservent `0.5` pour `GIB_ORGANIC` et `1.0` sinon; `ThrowHead` convertit l'entite source elle-meme en gib head, remet skin/frame/bounds/modelindex2, efface `EF_FLIES`, son et `SVF_MONSTER`, conserve `EF_GIB`, `FL_NO_KNOCKBACK`, `DAMAGE_YES`, `gib_die`, type de mouvement, callback touch organique, vitesse, yaw avelocity, cleanup et link.
  - Commentaire d'en-tete ajoute pour `ThrowHead`; commentaire `ThrowGib` deja present et verifie.
  - Branchement runtime verifie: `ThrowHead` est appele par les morts monstres et joueur (`m_*`, `p_client.ts`), `ThrowGib` reste appele par les memes flux; les entites liees sont avancees par `G_RunFrame`/physique et visibles via snapshots.
  - `apps/web`: aucune logique gib/head parallele trouvee; le navigateur consomme le `ClientRefreshFrame` construit depuis le runtime client/full-game (`full-game-render-source`, `full-game-render-loop`).
  - `renderer-three`: integration attendue car sorties visibles MD2 + `EF_GIB`; consommation presente via `refresh-entity-sync`, et les trails `EF_GIB` sont generes cote client par `CL_AddEntityEffects`/`CL_DiminishingTrail`.
- Corrections appliquees:
  - `packages/game/src/g_misc.ts`: commentaire d'en-tete `ThrowHead`.
  - `scripts/verify/quake2-g-misc.ts`: test cible `ThrowHead` avec hasard controle pour les champs nettoyes et les deux valeurs `vscale`.
- Tests lances:
  - `npm run verify:g-misc` OK.
  - `npm run verify:refresh-entity:alias-flags` OK.
  - `npm run verify:full-game:three-renderer` OK.
  - `npm run typecheck` OK.

## Lot precedent

- 2026-05-01: comportements gib `gib_think`, `gib_touch`, `gib_die` et `ThrowGib`.
- Checklist appliquee:
  - Source C comparee a `packages/game/src/g_misc.ts`: `gib_think` conserve l'increment de frame, le `FRAMETIME` et le basculement vers cleanup a la frame 10; `gib_die` appelle `G_FreeEdict`; `ThrowGib` conserve spawn, origine dans la bbox, model/effects, `FL_NO_KNOCKBACK`, `DAMAGE_YES`, die callback, choix organique/metallique, vitesse randomisee/clipee, avelocity, cleanup et link.
  - Ecart corrige pour `gib_touch`: le C n'emet le son, n'oriente le gib et n'avance le petit `sm_meat` que si un `plane` est fourni. Le TS accepte maintenant le plan runtime, garde le cas sans plan sans effet visuel/sonore, et calcule `self.s.angles` via `vectoangles(AngleVectors(vectoangles(plane.normal)).right)`.
  - Commentaires d'en-tete ajoutes pour `gib_think`, `gib_touch`, `gib_die` et `ThrowGib`.
  - Branchement runtime verifie: `ThrowGib` est appele par les morts monstres/joueurs et cree des entites dynamiques; `gib_touch` est appele par `SV_Impact` avec `trace.plane` pendant `G_RunFrame`/`G_RunEntity`; `gib_think` et `gib_die` sont callbacks de ces gibs.
  - `apps/web`: pas de logique gib parallele trouvee; le flux web consomme les snapshots et sons runtime via les chemins full-game/local.
  - `renderer-three`: integration attendue car les gibs sont des MD2 visibles avec `EF_GIB`; consommation presente via `ClientRefreshFrame.entities`, `refresh-entity-sync` et les trails `EF_GIB` cote client.
- Corrections appliquees:
  - `packages/game/src/g_misc.ts`: headers de portage ajoutes, `gib_touch` aligne sur le plan d'impact C.
  - `scripts/verify/quake2-g-misc.ts`: tests directs ajoutes pour `gib_touch`, `gib_think` et `gib_die`.
- Tests lances:
  - `npm run verify:g-misc` OK.
  - `npm run verify:refresh-entity:alias-flags` OK.
  - `npm run verify:full-game:three-renderer` OK.
  - `npm run typecheck` OK.
  - `npm run verify:full-game:render-source` tente mais bloque avant scenario sur import existant manquant `packages/client/src/types.js`.

## Lot precedent

- 2026-05-01: helpers gib/debris `VelocityForDamage`, `VectorScale` et `ClipGibVelocity`.
- Checklist appliquee:
  - Source C comparee aux helpers TS dans `packages/game/src/g_misc.ts`: `VelocityForDamage` conserve les tirages `crandom`/`random`, le seuil `damage < 50` et les facteurs `0.7`/`1.2`; `VectorScale` est porte par le helper local `scaleVec3` avec retour tuple; `ClipGibVelocity` conserve les bornes `[-300, 300]` en X/Y et `[200, 500]` en Z.
  - Commentaires d'en-tete ajoutes pour les trois helpers dans `packages/game/src/g_misc.ts`.
  - Branchement runtime verifie: les helpers sont appeles par `ThrowGib`/`ThrowHead`, eux-memes atteignables depuis les morts/gibs de monstres et joueurs; les debris passent par `ThrowDebris` dans les explosions. Les entites dynamiques sont liees au runtime, avancees par `G_RunFrame`/`G_RunEntity`, puis eligibles a `SV_BuildClientFrame` via `modelindex`/`effects`.
  - `apps/web`: pas de logique parallele trouvee pour ces helpers; le flux web consomme les packet entities via le `refreshFrame` full-game/local.
  - `renderer-three`: integration attendue car les gibs/debris sont des modeles MD2 visibles; le renderer consomme les sorties via `refresh-entity-sync` (`refreshFrame.entities`, `modelindex`, `origin`, `angles`, `effects`), sans compensation gameplay.
- Correction appliquee: commentaires de portage ajoutes dans `packages/game/src/g_misc.ts`.
- Tests lances:
  - `npm run verify:g-misc` OK.
  - `npm run verify:refresh-entity:alias-flags` OK.
  - `npm run typecheck` OK.
  - `npm run verify:full-game:render-source` tente mais bloque avant scenario sur import existant manquant `packages/client/src/types.js`.

## Correction des partielles

- 2026-04-30: correction de l'integration visible areaportals (`Use_Areaportal`, `SP_func_areaportal`).
  - Correction appliquee: `packages/client/src/refresh.ts` ajoute `ClientRefreshFrame.areabits` clone depuis `runtime.cl.frame.areabits`; `packages/renderer-three/src/gl-world-scene-adapter.ts` recopie ces bits dans la refdef et appelle `setRefdefState` pendant `update`, avant `R_MarkLeaves`/`R_DrawWorld`.
  - Checklist reprise: source C/TS deja comparee sur `Use_Areaportal`/`SP_func_areaportal`; commentaires d'en-tete TS verifies; branchement runtime `CM_SetAreaPortalState` et spawn/export verifies; `apps/web` passe deja `refreshFrame` au world adapter; `renderer-three` consomme maintenant les `areabits` pour le culling visible des zones fermees.
  - Tests lances: `npm run verify:g-misc`, `npm run verify:g-spawn`, `npx tsx ./scripts/verify/quake2-cl-view.ts`, `npm run verify:gl-rsurf`, `npm run verify:particle-sync`, `npm run verify:beam-sync`, `npm run verify:dlight-sync`, `npm run verify:refresh-entity:sprite`, `npm run verify:refresh-entity:alias-flags`, `npm run verify:refresh-entity:weapon`, `npm run typecheck`.

## Passe rapide post-validation

- 2026-04-30: controle limite aux lignes deja `Valide` de la matrice (`Use_Areaportal`, `SP_func_areaportal`). Verdict documentaire alors corrige en `Partiel`: le branchement runtime game etait present (`CM_SetAreaPortalState`, spawn `func_areaportal`, export `index.ts`), mais l'integration visible attendue n'etait pas complete car `ClientRefreshFrame`/`apps/web` ne propageaient pas les `areabits` vers `renderer-three`; point corrige dans la section precedente.

## Lot precedent

- 2026-04-30: `Use_Areaportal` + `SP_func_areaportal`.
- Correction appliquee dans `packages/game/src/g_misc.ts`: `Use_Areaportal` appelle maintenant `CM_SetAreaPortalState` via `runtime.collision.world` quand disponible, en plus du log de harness.
- Commentaires d'en-tete ajoutes pour les deux fonctions.
- Branchement runtime verifie: `func_areaportal` est enregistre dans `packages/game/src/g_spawn.ts`, exporte via `packages/game/src/index.ts`, et atteignable par le spawn system.
- `apps/web`: aucune logique principale dupliquee pour ce lot.
- `renderer-three`: aucune compensation gameplay; le renderer consomme les areabits produits par le flux serveur/collision.

## Tests de reference lances

- `npm run verify:g-misc`
- `npm run verify:g-spawn`
- `npm run typecheck`
- Controle ad hoc `npx tsx` confirmant: `count` bascule 0/1, `portalopen[style]` bascule 0/1, et `CM_AreasConnected` suit l'ouverture/fermeture.

## Blocages

- Aucun pour ce lot.

## Prochain lot recommande

- `START_OFF` / `light_use` / `SP_light` si le lot reste coherent.
