# Audit branchement ref_gl -> ThreeJS

## Synthese

Le port `ref_gl` est bien present et plusieurs sorties critiques arrivent jusqu'au renderer ThreeJS. Le runtime web ne passe pas par un appel unique `ref.RenderFrame(...)` : il orchestre volontairement le rendu par adapters separes.

Verdict global :

- `OK branche` pour le HUD 2D, le crosshair, les cinematics raw, le monde BSP, les brush models, les lightmaps, les surfaces alpha non-warp, l'eau/warp, le sky visible, les entites MD2, les sprites, les flags alias rares et les particules.
- `OK avec deviation` pour l'orchestration web splittee et l'equivalent `R_SetGL2D`.
- `Partiel` pour certains effets debug.
- `Corrige` pour `R_PolyBlend` / `R_Flash` via un overlay Three plein ecran branche dans le runtime web splitte.
- `Corrige` pour `R_DrawBeam` via un adapter Three qui consomme le hook source.
- `Corrige` pour `R_RenderDlights` via un adapter Three qui consomme le chemin flashblend source.
- `Corrige` pour `R_DrawEntitiesOnList` comme dispatch source des entites alias/sprite/brush.

Le risque principal n'est donc plus "le port n'est pas utilise", mais "certaines branches de `gl-rmain.ts` sont contournees par des adapters web directs".

## Matrice fichier par fichier

| Port TS | Source originale | Sorties produites | Consommateur reel | Verdict |
| --- | --- | --- | --- | --- |
| `gl-draw.ts` | `ref_gl/gl_draw.c` | `DrawPic`, `DrawChar`, `DrawStretchPic`, `DrawStretchRaw`, scrap atlas | `ref-gl-host.ts`, `three-gl-draw-adapter.ts`, `SCR_DrawHudRef` | `OK branche` |
| `gl-image.ts` | `ref_gl/gl_image.c` | textures, palettes, alpha, scrap, filters | `ref-gl-host.ts`, `three-gl-draw-adapter.ts`, `gl-rmisc.ts`, world/entity adapters | `OK support` |
| `gl-model-loader.ts` | `ref_gl/gl_model.c` | BSP, inline models, MD2, SP2, images associees | `gl-world-scene-adapter.ts`, `refresh-entity-sync.ts`, tests loader | `OK branche` |
| `gl-model.ts` | `ref_gl/gl_model.h` | structures modeles, surfaces, flags | `gl-rsurf.ts`, `gl-light.ts`, `gl-warp.ts`, `gl-rmain.ts`, adapters Three | `OK support` |
| `gl-rsurf.ts` | `ref_gl/gl_rsurf.c` | world surfaces, alpha surfaces, brush models, lightmaps | `gl-world-scene-adapter.ts` | `OK branche` |
| `gl-light.ts` | `ref_gl/gl_light.c` | lightmaps, dynamic light push, flashblend dlights, lightpoint | `gl-world-scene-adapter.ts`, `three-dlight-sync.ts`, hooks rsurf/lightmap | `OK branche` |
| `gl-warp.ts` | `ref_gl/gl_warp.c` | sky surfaces, skybox, water/warp, flowing | `gl-world-scene-adapter.ts`, `sky-scene-adapter.ts` | `OK branche` |
| `gl-rmain.ts` | `ref_gl/gl_rmain.c` | `R_RenderFrame`, entities, sprites, particles, beams, polyblend | `ref-gl-host.ts`, `particle-sync.ts`, `refresh-entity-sync.ts`, `three-beam-sync.ts`, `three-polyblend-overlay.ts`, web loop split | `Partiel, entities/beams/polyblend corriges` |
| `gl-mesh.ts` | `ref_gl/gl_mesh.c` | alias lighting, culling, frame validation, flags | `refresh-entity-sync.ts`, `md2-mesh-builder.ts` | `OK branche` |
| `gl-rmisc.ts` | `ref_gl/gl_rmisc.c` | default state, particle texture, no-texture, screenshot | `ref-gl-host.ts`, `gl-world-scene-adapter.ts` | `OK support` |
| `gl-local.ts` | `ref_gl/gl_local.h` | globals/types/cvars renderer | ports `ref_gl` et host | `OK support` |
| `qgl.ts` | `ref_gl/qgl.h` | contrat QGL/QWGL | `ref-gl-bootstrap.ts`, `ref-gl-host.ts`, image/rmisc | `OK support` |
| `warpsin.ts` | `ref_gl/warpsin.h` | table turbulence | `gl-warp.ts` | `OK support` |
| `anormtab.ts` | `ref_gl/anormtab.h` | table shadedots alias | `gl-mesh.ts` | `OK support` |

## Sorties non branchees

| Sortie | Fichiers concernes | Impact visible | Correction recommandee |
| --- | --- | --- | --- |
| Aucune sortie critique restante a ce stade | - | - | - |

## Sorties partiellement branchees

| Sortie | Etat actuel | Risque |
| --- | --- | --- |
| Sky visible | Corrige : `gl-world-scene-adapter.ts` expose les faces issues de `R_DrawSkyBox`, et `sky-scene-adapter.ts` construit la geometrie visible depuis ces faces. | Le fallback skybox complete reste actif uniquement quand aucune `skyFaces` n'est disponible. |
| `R_PolyBlend` / `R_Flash` | Corrige par `three-polyblend-overlay.ts`; le runtime web applique `refreshFrame.view.blend` avec le cvar `gl_polyblend`, et l'adapter expose aussi un hook `polyBlend` compatible `R_PolyBlend`. | Reste une deviation d'orchestration : la boucle web splittee ne rappelle pas `R_Flash`, mais l'effet visible et le hook source sont couverts. |
| `R_DrawBeam` | Corrige par `three-beam-sync.ts`; le runtime web appelle `beamSync.apply(...)`, qui transforme les refresh beams en `entity_t` et consomme `R_DrawBeam`. | Les beams avec `model` sont segmentes selon `segmentLength`; les lasers restent continus ; le cas lightning court reste mono-segment. |
| `R_RenderDlights` | Corrige par `three-dlight-sync.ts`; le runtime web appelle `dlightSync.apply(...)`, qui cree un `refdef_t`, active le chemin flashblend et consomme `R_RenderDlights`. | L'adapter rend un fan flashblend source-compatible et garde un `PointLight` derive du meme hook pour eclairer la scene Three. |
| `R_DrawEntitiesOnList` | Corrige dans `refresh-entity-sync.ts`; les entites preparees par l'adapter sont converties en `entity_t`, placees dans un `refdef_t`, puis dispatchees par `R_DrawEntitiesOnList`. | L'adapter Three garde la responsabilite des caches MD2/SP2 et du rendu final, mais l'ordre opaque/translucide et le dispatch alias/sprite/brush passent par `gl-rmain`. |

## Doublons adapter suspects

| Adapter | Doublon suspect | Decision actuelle |
| --- | --- | --- |
| `apps/web/src/refresh-debug-layer.ts` | Force walls et sustains rendus comme debug Three direct. | Garder provisoirement ; les beams sont maintenant sortis de cette couche. |
| `sky-scene-adapter.ts` | Consomme maintenant les `skyFaces` de `R_DrawSkyBox` pour la geometrie visible. | Garder le fallback full skybox pour les cas sans monde BSP ou sans surfaces sky visibles. |

## Bugs probables visibles

| Symptome | Statut |
| --- | --- |
| Crosshair absent dans la demo web | Corrige : `SCR_DrawHudRef` dessine maintenant `ch1/ch2/ch3` via `ref.DrawPic`. |
| HUD noir et blanc | Corrige lors de la migration HUD : le chemin `gl-draw` / adapter Three consomme la palette et les textures source. |
| Vitres sans lightmap ou transparence fragile | Corrige : les surfaces alpha non-warp restent lightmapped avec `transparent=true`, `depthWrite=false`, `opacity < 1`. |
| Sprite `RF_TRANSLUCENT` opaque si `alpha=1` | Corrige : le flag source force maintenant le material transparent. |
| Polyblend degats/bonus absent | Corrige : `three-polyblend-overlay.ts` rend un overlay couleur/alpha avant le HUD. |
| Beams/lasers source-inexact | Corrige pour la primitive beam : `three-beam-sync.ts` consomme `R_DrawBeam`. |
| Shell alias statique sans extrusion | Corrige : les entites MD2 avec flags shell passent par `applyMd2AliasFrameLerp` meme sans `RF_FRAMELERP`. |

## Corrections recommandees

1. Garder le test d'ordre `verify:web-render-order` comme garde-fou de l'architecture splittee.
2. Ajouter plus tard une validation visuelle Playwright cible HUD + crosshair + vitre si l'on veut couvrir le rendu final navigateur.

## Tests a ajouter

| Test | But |
| --- | --- |
| Screenshot Playwright cible alias shell/IR | Validation visuelle de non-regression des flags MD2 rares dans le navigateur. |
| Screenshot Playwright cible HUD + crosshair + vitre | Validation visuelle de non-regression apres les corrections source/adapter. |

## Validations deja executees

| Commande | Couverture |
| --- | --- |
| `npm run verify:screen:header` | HUD, inventory, cinematic, crosshair ref draw |
| `npm run verify:gl-draw` | Port `gl_draw` |
| `npm run verify:three-gl-draw-adapter` | Projection `gl_draw` vers Three |
| `npm run verify:ref-gl-host` | Host `refexport_t`, `RenderFrame`, `R_SetGL2D` |
| `npm run verify:three-world-alpha` | Surfaces alpha non-warp et lightmaps |
| `npm run verify:gl-rsurf` | Port surfaces monde |
| `npm run verify:gl-light` | Port lightmaps/lights |
| `npm run verify:doors:phase7` | Brush models inline |
| `npm run verify:three-world-warp-sky` | Sky faces, warp, flowing |
| `npm run verify:gl-warp` | Port warp/sky |
| `npm run verify:sky:phase5` | Integration ciel |
| `npm run verify:refresh-entity:sprite` | Sprites SP2 et transparence |
| `npm run verify:refresh-entity:weapon` | Arme vue, depthhack, alias translucent, dispatch `R_DrawEntitiesOnList` |
| `npm run verify:refresh-entity:alias-flags` | Flags alias shell et IR visibles via l'adapter Three |
| `npm run verify:gl-mesh` | Port alias mesh |
| `npm run verify:particle-sync` | Particules via `R_DrawParticles` |
| `npm run verify:gl-rmain` | Port `gl-rmain`, beams hook, render path |
| `npm run verify:entities:phase8:scene` | Integration entites scene |
| `npm run verify:beam-sync` | Beams/lasers via `R_DrawBeam` |
| `npm run verify:dlight-sync` | Dynamic lights via `R_RenderDlights` |
| `npm run verify:polyblend-overlay` | Overlay `R_PolyBlend` / `R_Flash` runtime web |
| `npm run verify:web-render-order` | Orchestration web splittee |
| `npm run typecheck` | Typage global |
