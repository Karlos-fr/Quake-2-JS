# Progress - Quake-2-master/ref_gl/gl_rmain.c

## Dernier lot valide

- Session du 2026-05-06: gros lot final view setup/culling et rendu principal adjacent.
- Entites validees: `SignbitsForPlane`, `R_CullBox`, `R_SetFrustum`, `R_SetupFrame`, `MYgluPerspective`, `R_SetupGL`, `R_RotateForEntity`, `R_DrawSpriteModel`, `R_DrawNullModel`, `R_DrawEntitiesOnList`, `GL_DrawParticles`, `R_DrawParticles`, `R_PolyBlend`, `R_Flash`, `GL_DrawColoredStereoLinePair`, `GL_DrawStereoPattern`, `R_SetPalette`, `R_DrawBeam`, `NUM_BEAM_SEGS`.
- Entites marquees `Non applicable`: `image_s`, `model_s`, `alpha`, `argptr`, `err`, `fullscreen`, `g`, `i`, `j`, `perpvec`, `point`, `re`, `scale`, `screenaspect`, `shadelight`, `temp`; ce sont des types externes seulement references par prototypes ou des variables locales detectees comme globales.
- Comparaison source: `Quake-2-master/ref_gl/gl_rmain.c` vs `packages/renderer-three/src/gl_rmain.ts`, avec verification des hooks exposes par le port TS.
- Commentaires d'en-tete: verifies sur toutes les fonctions portees du lot; les fonctions critiques indiquent `Original name`, `Source`, `Category`, `Fidelity level`, comportement et notes d'adaptation quand le port remplace l'immediate-mode GL par des hooks.
- Runtime: les fonctions sont atteignables par `R_RenderView` / `R_RenderFrame` et par la table `GetRefAPI`; `R_SetupFrame` alimente camera, clusters et blend, `R_SetFrustum` alimente le culling, `R_SetupGL` expose viewport/projection/modelview, puis les branches entites/particules/beams/sprites/polyblend s'executent dans l'ordre original.
- apps/web: `createRefGlHost` est instancie dans `apps/web/src/main.ts` et `apps/web/src/full-game.ts`; le flux full-game synchronise la camera depuis la refresh frame et `apps/web/src/full-game-render-loop.ts` consomme les sorties visibles via les adapters Three, sans logique web parallele masquante.
- renderer-three: le fichier valide est le port proprietaire; les sorties visibles sont consommees par `refresh-entity-sync`, `three-beam-sync`, `particle-sync`, `three-polyblend-overlay`, `gl-world-scene-adapter`, `gl_rsurf` et les hooks de world/camera/frustum/areabits.
- Tests lances: `npm run verify:gl-rmain`, `npm run verify:ref-gl-host`, `npm run verify:full-game:three-renderer`, `npm run typecheck`.
- Corrections TS: aucune correction runtime; assertions ajoutees dans `scripts/verify/quake2-gl-rmain.ts` pour `R_RotateForEntity`, `R_CullBox` avec `r_nocull`, `R_SetupFrame` avec `RDF_NOWORLDMODEL`, palette explicite et null model fullbright.

- Session du 2026-05-06: premier bloc runtime principal.
- Entites validees: `GetRefAPI`, `R_Register`, `R_Init`, `R_SetMode`, `R_BeginFrame`, `R_RenderView`, `R_RenderFrame`, `R_Clear`, `R_SetGL2D`, `R_SetLightLevel`, `R_Shutdown`, plus les etats runtime `gl_config`, `gl_state`, `r_framecount`, `r_newrefdef`, `r_origin`, `r_visframecount`, `ri`, `trickframe`, `vid`, `vpn`, `vright`, `vup`.
- Comparaison source: `Quake-2-master/ref_gl/gl_rmain.c` vs `packages/renderer-three/src/gl_rmain.ts`, avec branchement hote dans `packages/renderer-three/src/ref-gl-host.ts`.
- Commentaires d'en-tete: verifies sur les fonctions portees du lot, avec `Original name`, `Source`, `Category`, `Fidelity level` et notes de portage quand utiles.
- Runtime: `GetRefAPI` expose la table `refexport_t`; `createRefGlHost` branche `Init`, `BeginFrame`, `RenderFrame`, `EndFrame`, `AppActivate` et les commandes/callbacks attendus.
- apps/web: `apps/web/src/full-game.ts` et le test `verify:full-game:three-renderer` confirment l'usage de `createRefGlHost` dans le flux navigateur; aucune logique web parallele ne remplace ce bloc.
- renderer-three: le lot est lui-meme dans `packages/renderer-three`; les sorties visibles du bloc frame (camera/view state, clear, 2D reset, ordre de rendu, lightlevel) sont exposees par hooks/adapters et couvertes par les tests de `gl_rmain`/host.
- Tests lances: `npm run verify:gl-rmain`, `npm run verify:ref-gl-host`, `npm run verify:full-game:three-renderer`.
- Corrections TS: aucune.

## Prochain lot recommande

- Aucun lot restant dans `ref_gl/gl_rmain.c`: toutes les lignes sont `Valide` ou `Non applicable`.

## Blocages / decisions

- Aucun blocage ouvert pour le lot traite.
