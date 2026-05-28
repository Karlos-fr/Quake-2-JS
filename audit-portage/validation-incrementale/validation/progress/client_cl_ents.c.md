# Progress - Quake-2-master/client/cl_ents.c

## Dernier lot valide

- 2026-05-28: redécoupage TS applique pour les parseurs `client/cl_ents.c`: `CL_ParseEntityBits`, `CL_ParseDelta`, `CL_ParsePlayerstate`, `CL_ParseFrame`, `CL_DeltaEntity` et `CL_ParsePacketEntities` vivent maintenant dans `packages/client/src/cl_ents.ts`. `packages/client/src/cl_parse.ts` conserve seulement les imports/reexports et le dispatch runtime.
- 2026-05-07: gros premier lot parsing/interpolation des packet entities valide: `bitcounts`, `CL_ParseEntityBits`, locaux `i`/`number`, `CL_ParseDelta`, `CL_DeltaEntity`, local `state`, `CL_ParsePacketEntities`, locaux `newnum`/`bits`/`oldstate`.
- `bitcounts` et les temporaires locaux sont `Non applicable` car ils ne sont pas des entites TS proprietaires; `bitcounts` etait seulement un compteur C de profiling protocole.
- 2026-05-07: lot playerstate/frame valide: `CL_ParsePlayerstate`, temporaires `flags`/`state`/`i`/`statbits`, `memset`, `CL_FireEntityEvents`, temporaire `s1`, `CL_ParseFrame`, temporaires `cmd`/`len`/`old`.
- Les temporaires et `memset` sont `Non applicable`: ils sont couverts par les fonctions portees ou remplaces par les helpers TS `createFrame`/copie playerstate.
- 2026-05-07: lot visible packet entities valide: `vidref_val`, `S_RegisterSexedModel` et locaux (`n`, `p`, `model`, `buffer`), puis `CL_AddPacketEntities` et locaux (`ent`, `s1`, `autorotate`, `i`, `pnum`, `cent`, `autoanim`, `ci`, `bfg_lightramp`, `intensity`).
- `S_RegisterSexedModel` est `Non applicable`: helper mort dans le C original, sans call site; le chemin runtime custom weapon actif passe par `CL_LoadClientinfo`/`clientinfo.weaponmodel` puis `CL_AddPacketEntities`. `vidref_val` est `Non applicable`: branche renderer logiciel legacy remplacee par le chemin GL/web actuel.
- 2026-05-08: lot vue/arme/camera valide: `CL_AddViewWeapon` porte par `appendViewWeapon`, `CL_CalcViewValues` et locaux (`i`, `oldframe`, `delta`).
- Les temporaires locaux sont `Non applicable`: ils sont couverts par les boucles/fallbacks de `appendViewWeapon` et `CL_CalcViewValues`.
- 2026-05-08: lot final refresh/audio valide: `CL_AddEntities` porte par `CL_BuildRefreshFrame`, `CL_GetEntitySoundOrigin` porte par `CL_GetEntitySoundOrigin`.
- Correction appliquee: `CL_BuildRefreshFrame` respecte maintenant le retour immediat C quand `cls.state != ca_active` et n'emet aucune entite/lumiere/particule/beam hors etat actif.

## Preuves de session

- Comparaison C/TS effectuee entre `Quake-2-master/client/cl_ents.c` et `packages/client/src/cl_parse.ts`.
- Commentaires d'en-tete verifies pour `CL_ParseEntityBits`, `CL_ParseDelta`, `CL_DeltaEntity`, `CL_ParsePacketEntities`.
- Runtime verifie depuis `CL_ParseServerMessage -> CL_ParseFrame -> CL_ParsePacketEntities`.
- `apps/web` verifie via `createFullGameServerRenderSource` et les snapshots serveur.
- `renderer-three` verifie via la consommation refresh-entity des modeles/frames/sprites/weapon bridge.
- Comparaison C/TS effectuee pour `CL_ParsePlayerstate`, `CL_FireEntityEvents` et `CL_ParseFrame` entre `client/cl_ents.c`, `packages/client/src/cl_parse.ts` et `packages/client/src/cl_ents.ts`.
- Commentaires d'en-tete verifies pour `CL_ParsePlayerstate`, `CL_FireEntityEvents` et `CL_ParseFrame`.
- Runtime verifie depuis `CL_ParseServerMessage -> CL_ParseFrame -> CL_ParsePlayerstate/CL_ParsePacketEntities/CL_FireEntityEvents`.
- `apps/web` verifie via `apps/web/src/full-game-server-host.ts` et `apps/web/src/full-game.ts`: le flux web appelle le parser runtime porte et consomme camera/playerstate/areabits par la render source.
- `renderer-three` verifie via `refresh-entity-sync`, `gl-world-scene-adapter`, `gl_rsurf` et `gl_rmain`: camera/refdef, `rdflags`, `areabits`, modeles/frames et scene sont consommes depuis les sorties runtime.
- Comparaison C/TS effectuee pour `CL_AddPacketEntities` entre `client/cl_ents.c`, `packages/client/src/cl_ents.ts` et `packages/client/src/refresh.ts`; correction appliquee pour la duplication `EF_COLOR_SHELL`, la priorite `modelindex2 == 255`, le reset flags/alpha des modeles lies et le powerscreen.
- Commentaire d'en-tete mis a jour pour `CL_BuildPacketEntitySnapshots` comme port de `CL_AddPacketEntities`.
- Runtime verifie depuis `CL_ParseServerMessage -> CL_ParseFrame`, puis `CL_BuildRefreshFrame -> CL_BuildPacketEntitySnapshots`.
- `apps/web` verifie via `createFullGameServerRenderSource`: le web consomme le refresh frame runtime sans logique parallele.
- `renderer-three` verifie via `refresh-entity-sync`, `gl-world-scene-adapter`, `md2-mesh-builder` et `quake2-web-view-weapon`: modeles, frames, renderfx, skins, weapon model, dlights et scene sont consommes depuis les sorties runtime.
- Comparaison C/TS effectuee pour `CL_AddViewWeapon` et `CL_CalcViewValues` entre `client/cl_ents.c`, `packages/client/src/refresh.ts` et `packages/client/src/view.ts`.
- Commentaires d'en-tete verifies pour `appendViewWeapon` (`Original name: CL_AddViewWeapon`, `Source: client/cl_ents.c`, `Category: Ported`, `Fidelity level: Close`) et `CL_CalcViewValues`.
- Runtime verifie depuis le flux normal `CL_BuildRefreshFrame -> CL_UpdateLerpFraction -> CL_CalcViewValues -> appendViewWeapon`, lui-meme appele par le render source web et par `V_RenderView`.
- `apps/web` verifie via `createFullGameServerRenderSource` et `full-game.ts`: le web consomme la camera/weapon depuis le client runtime et ne remplace pas la logique de vue.
- `renderer-three` verifie via `createThreeRefreshEntitySync`, `refresh-entity-sync`, `gl-world-scene-adapter` et `three-polyblend-overlay`: camera, areabits, blend et weapon model visible sont consommes depuis `ClientRefreshFrame`.
- Comparaison C/TS effectuee pour `CL_AddEntities` et `CL_GetEntitySoundOrigin` entre `client/cl_ents.c`, `packages/client/src/refresh.ts` et `packages/client/src/view.ts`.
- Commentaires d'en-tete verifies pour `CL_BuildRefreshFrame` (`Original name: CL_AddEntities`, `Source: client/cl_ents.c`, `Category: Ported`, `Fidelity level: Close`) et `CL_GetEntitySoundOrigin`.
- Runtime verifie depuis `V_RenderView -> CL_BuildRefreshFrame` et depuis le render source web; `CL_BuildRefreshFrame` calcule le clamp/lerp, la vue, les packet entities, temp entities, particules, dlights, lightstyles et met a jour les `lerp_origin` utilises par `CL_GetEntitySoundOrigin`.
- `apps/web` verifie via `createFullGameServerRenderSource`, `full-game.ts` et `full-game-render-loop`: la frame runtime alimente camera, areabits, entites, beams, particules, dlights et debug refresh sans logique parallele.
- `renderer-three` verifie via `refresh-entity-sync`, `particle-sync`, `three-beam-sync`, `three-dlight-sync` et `gl-world-scene-adapter`: les sorties visibles attendues de `CL_AddEntities` sont consommees.

## Tests lances

- `npm run verify:cl-parse`
- `npm run verify:full-game:render-source`
- `npm run verify:full-game:three-renderer`
- `npm run verify:refresh-entity:alias-flags`
- `npm run verify:refresh-entity:sprite`
- `npm run verify:full-game:server-snapshots`
- `npm run verify:refresh-entity:weapon`
- `npm run typecheck`
- `npm run verify:cl-parse`
- `npm run verify:full-game:render-source`
- `npm run verify:full-game:three-renderer`
- `npx tsx ./scripts/verify/quake2-cl-view.ts`
- `npm run verify:refresh-entity:alias-flags`
- `npm run verify:refresh-entity:sprite`
- `npm run verify:full-game:server-snapshots`
- `npm run verify:entities:phase8:scene`
- `npm run typecheck`
- `npm run verify:entities:phase5`
- `npm run verify:entities:phase8:scene`
- `npm run verify:full-game:render-source`
- `npm run verify:refresh-entity:alias-flags`
- `npm run verify:refresh-entity:sprite`
- `npm run verify:cl-parse`
- `npm run verify:full-game:three-renderer`
- `npm run verify:refresh-entity:weapon`
- `npm run verify:entities:phase8`
- `npm run typecheck`
- `npm run verify:refresh-entity:weapon`
- `npx tsx ./scripts/verify/quake2-cl-view.ts`
- `npm run verify:full-game:render-source`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`
- `npm run verify:cl-parse`
- `npx tsx ./scripts/verify/quake2-cl-view.ts`
- `npm run verify:full-game:render-source`
- `npm run verify:refresh-entity:weapon`
- `npm run verify:beam-sync`
- `npm run verify:particle-sync`
- `npm run verify:dlight-sync`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck` (echec hors lot: `apps/web/src/full-game.ts:950` parametres `address`/`info` implicitement `any`)

## Blocages / remarques

- L'attente instable historique de `verify:entities:phase5` sur `EF_TRAP light intensity` a ete corrigee: le test verifie maintenant la plage C `rand()%100 + 100` et l'origine `+32`.

## Prochain lot recommande

- Aucun lot restant dans `client_cl_ents.c.md`: toutes les entrees sont `Valide` ou `Non applicable`.
