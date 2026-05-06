# Progress - Quake-2-master/ref_gl/gl_local.h

## Etat

- Statut: Termine
- Dernier lot valide: fichier header complet cote ownership `gl_local.h`.
- Matrice: `audit-portage/validation-incrementale/validation/matrices/ref_gl_gl_local.h.md`

## Lot traite

- Constantes header: `REF_VERSION`, axes `PITCH/YAW/ROLL`, `MAX_LBM_HEIGHT`, `BACKFACE_EPSILON`, `GL_COLOR_INDEX8_EXT`, `TEXNUM_*`, `MAX_GLTEXTURES`, familles `GL_RENDERER_*`.
- Types/header state: `imagetype_t`, `rserr_t`, `image_s` via `GlImage`, `glconfig_t`, `glstate_t`, `viddef_t`, `glvert_t`, `GlLocalContext`.
- Globals header visibles couverts par `GlLocalContext`: `vid`, `gl_config`, `gl_state`, `ri`, `r_newrefdef`, `r_origin`, `vpn`, `vright`, `vup`, frame/vis counts, texture counters/formats et compteurs visibles.
- Prototypes de fonctions marques `Non applicable` dans cette matrice quand l'implementation appartient a une matrice source `.c` dediee (`gl_image.c`, `gl_draw.c`, `gl_rmain.c`, `gl_rmisc.c`, `gl_rsurf.c`, `gl_light.c`, `gl_warp.c`, `gl_mesh.c`) ou a `qcommon`.

## Preuves

- Comparaison effectuee avec `Quake-2-master/ref_gl/gl_local.h`.
- Cibles TS verifiees: `packages/renderer-three/src/gl_local.ts`, `packages/renderer-three/src/gl_image.ts`, `packages/renderer-three/src/index.ts`, modules ref_gl consommateurs.
- Runtime verifie via `createRefGlHost`, `createRefGlBootstrap`, `createGlRmainRuntime`, `createGlImageRuntime`, `createGlRmiscRuntime`.
- `apps/web` verifie via `createRefGlHost` dans `apps/web/src/main.ts` et `apps/web/src/full-game.ts`.
- `renderer-three` verifie: camera/refdef, images, dlights, world/surfaces et draw adapters consomment les sorties visibles via les modules proprietaires.

## Tests

- `npm run verify:gl-local:header`
- `npm run verify:ref-gl-host`
- `npm run verify:gl-image`
- `npm run verify:gl-light`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

## Prochain lot recommande

- Aucun lot restant dans `ref_gl/gl_local.h`: reprendre les matrices proprietaires encore ouvertes, notamment `ref_gl/gl_image.c`, `ref_gl/gl_mesh.c`, `ref_gl/gl_model.c`, `ref_gl/gl_rmain.c`, `ref_gl/gl_rsurf.c` ou `ref_gl/gl_warp.c`.
