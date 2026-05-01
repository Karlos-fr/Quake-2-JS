# Progress - Quake-2-master/game/g_misc.c

## Dernier lot valide

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

## Dernier lot valide

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

## Dernier lot valide

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

## Dernier lot valide

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

## Dernier lot valide

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

- `debris_die`, puis `ThrowDebris` et local `chunk`.
