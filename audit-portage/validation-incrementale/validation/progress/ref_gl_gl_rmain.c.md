# Progress - Quake-2-master/ref_gl/gl_rmain.c

## Dernier lot valide

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

- Continuer avec le bloc view setup/culling: `SignbitsForPlane`, `R_CullBox`, `R_SetFrustum`, `R_SetupFrame`, `MYgluPerspective`, `R_SetupGL`.
- Verifier explicitement le flux camera/frustum/areabits vers `gl_rsurf`, `gl_light`, `gl-world-scene-adapter` et `apps/web/src/full-game-render-loop.ts`.

## Blocages / decisions

- Aucun blocage ouvert pour le lot traite.
