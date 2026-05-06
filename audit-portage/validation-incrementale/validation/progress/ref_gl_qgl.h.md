# Progress - Quake-2-master/ref_gl/qgl.h

## Etat

- Statut: Termine
- Dernier lot valide: fichier complet `qgl.h`.
- Entites validees: `QGL_Init`, `QGL_Shutdown`, `GL_POINT_SIZE_MIN_EXT`, `GL_POINT_SIZE_MAX_EXT`, `GL_POINT_FADE_THRESHOLD_SIZE_EXT`, `GL_DISTANCE_ATTENUATION_EXT`, `GL_SHARED_TEXTURE_PALETTE_EXT`, `GL_TEXTURE0_SGIS`, `GL_TEXTURE1_SGIS`.
- Entites non applicables: faux positifs de parsing `BOOL`, `GLboolean`, `GLenum`, `GLint`, `GLuint`, `HDC`, `HGLRC`, `int`, `PROC`, `void`, garde `__QGL_H__`, macro de convention d'appel `APIENTRY`.

## Preuves de session

- Comparaison source: `Quake-2-master/ref_gl/qgl.h`.
- Cible TS: `packages/renderer-three/src/qgl.ts`, exportee par `packages/renderer-three/src/index.ts`.
- `scripts/verify/quake2-qgl-header.ts` compare l'inventaire complet des 343 procedures `qgl*` et 24 procedures `qwgl*` avec le header C.
- Les constantes EXT/SGIS sont verifiees numeriquement.
- `QGL_Init`/`QGL_Shutdown` resolvent et nettoient le runtime de symboles avec procedures requises/optionnelles.

## Runtime / apps / renderer

- Runtime: integre via `createQglBootstrapHooks`, `createRefGlBootstrap` et les hooks `qglInit`/`qglShutdown` consommes par `R_Init`/`R_Shutdown`.
- apps/web: integre via les providers de symboles GL crees dans `apps/web/src/main.ts` et `apps/web/src/full-game.ts`, puis passes au host ref_gl.
- renderer-three: integre; `qgl.ts` est l'adapter GL du port `ref_gl`, consomme par `ref-gl-host.ts`, `gl_rmain.ts`, `gl_rmisc.ts`, `gl_image.ts`, `gl_draw.ts`, `gl_rsurf.ts` et `gl_warp.ts`. Les sorties visibles concernent etats GL, textures/palette, particules, lightmaps, multitexture et screenshot, verifiees par les tests renderer.

## Corrections

- `packages/renderer-three/src/qgl.ts`: commentaires `QWGL_Init`/`QWGL_Shutdown` corriges en `Category: Adapter` pour ne pas les presenter comme port direct de `QGL_Init`/`QGL_Shutdown`.

## Tests

- `npm run verify:qgl:header`
- `npm run verify:ref-gl-host`
- `npm run verify:gl-rmain`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

## Prochain lot recommande

- Aucun pour `ref_gl/qgl.h`; fichier termine.
