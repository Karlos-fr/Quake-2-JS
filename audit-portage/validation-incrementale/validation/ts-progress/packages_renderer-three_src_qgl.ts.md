# Progress TS - packages/renderer-three/src/qgl.ts

## Etat

- Statut: Termine
- Dernier lot valide: fichier complet `qgl.ts` (52 symboles).
- Bilan: 9 `Couvert C/H`, 43 `Valide`, 0 reste a auditer.

## Preuves de session

- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_renderer-three_src_qgl.ts.md`.
- Matrice C/H: `audit-portage/validation-incrementale/validation/matrices/ref_gl_qgl.h.md`.
- Source C/H: `Quake-2-master/ref_gl/qgl.h`.
- Cible TS: `packages/renderer-three/src/qgl.ts`.
- `QGL_Init`, `QGL_Shutdown` et les constantes `GL_*_EXT` / `GL_TEXTURE*_SGIS` sont couverts par la matrice C/H.
- Les inventaires `QGL_PROCEDURES`, `QGL_OPTIONAL_PROCEDURES` et `QWGL_WIN32_PROCEDURES` sont audites directement par `npm run verify:qgl:header`, qui compare 343 procedures `qgl*` et 24 procedures `qwgl*` avec le header source.

## Decisions importantes

- `QWGL_Init` et `QWGL_Shutdown` sont des adapters de l'inventaire Win32 `qwgl*`, pas des portages proprietaires de `QGL_Init` / `QGL_Shutdown`.
- Les runtimes explicites remplacent les globals de pointeurs de fonction C par des objets injectables adaptes au backend WebGL.
- Les enums prives `GL_VENDOR`, `GL_RENDERER`, `GL_VERSION` et `GL_EXTENSIONS` sont des valeurs OpenGL standard utilisees par `qglGetString`; elles ne sont pas des symboles proprietaires de `qgl.h`.
- Les `Category: New` du fichier ont `Original name: N/A` et `Source: N/A (<raison courte>)` dans les en-tetes concernes et dans la matrice.

## Runtime / apps / renderer

- Runtime renderer-three: integre via `createQglBootstrapHooks`, `createRefGlBootstrap`, `R_Init` et `R_Shutdown`.
- apps/web: integre via les providers QGL construits dans `apps/web/src/main.ts` et `apps/web/src/full-game.ts`.
- Le fichier reste l'adapter QGL du port `ref_gl`, consomme par `ref-gl-host.ts`, `gl_rmain.ts`, `gl_rmisc.ts`, `gl_image.ts`, `gl_draw.ts`, `gl_rsurf.ts` et `gl_warp.ts`.

## Corrections

- `packages/renderer-three/src/qgl.ts`: en-tetes `New` completes avec `Original name: N/A` et `Source: N/A (...)`.
- `packages/renderer-three/src/qgl.ts`: en-tetes `QWGL_Init` / `QWGL_Shutdown` completes avec `Original name: N/A` pour eviter le doublon trompeur avec `QGL_Init` / `QGL_Shutdown`.
- Matrice TS et avancement global TS mis a jour.

## Tests

- `npm run verify:qgl:header`
- `npm run verify:ref-gl-host`
- `npm run verify:gl-rmain`
- `npm run typecheck`
- `git diff --check`

## Prochain lot recommande

- Aucun pour `qgl.ts`.
