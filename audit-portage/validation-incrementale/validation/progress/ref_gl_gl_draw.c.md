# Progress - Quake-2-master/ref_gl/gl_draw.c

## 2026-05-06 - Lot complet gl_draw.c

Entites traitees:
- `Draw_InitLocal`, `Draw_Char`, `Draw_GetPicSize`, `Draw_StretchPic`, `Draw_Pic`, `Draw_TileClear`, `Draw_Fill`, `Draw_FadeScreen`, `Draw_StretchRaw`.
- Parametres/locaux/globals de matrice: `c`, `gl`, `hscale`, `row`, `scrap_dirty`, `t`.

Checklist appliquee:
- Source C comparee avec `packages/renderer-three/src/gl_draw.ts`.
- Ownership confirme: le port proprietaire est dans `packages/renderer-three/src/gl_draw.ts`, avec export public via `packages/renderer-three/src/index.ts`; `three-gl-draw-adapter.ts`, `ref-gl-host.ts` et `apps/web` restent des adapters/hotes.
- Commentaires d'en-tete verifies pour les fonctions portees: `Original name`, `Source`, `Category: Ported`, `Fidelity level` et comportement sont presents.
- Comparaison C vs TS:
  - `Draw_InitLocal` charge `pics/conchars.pcx`, bind la texture et force le filtrage nearest.
  - `Draw_Char` conserve le masquage `num & 255`, le skip espace, le clipping `y <= -8`, les cellules 16x16 et les quads 8x8.
  - `Draw_GetPicSize` retourne largeur/hauteur ou `-1/-1` si image absente.
  - `Draw_StretchPic`, `Draw_Pic` et `Draw_TileClear` conservent lookup pic, warning image manquante, upload scrap si applicable, workaround alpha MCD/Rendition, texcoords et dimensions.
  - `Draw_Fill` conserve la borne palette 0..255, `ERR_FATAL`, conversion `d_8to24table` et remise a blanc.
  - `Draw_FadeScreen` conserve quad plein ecran noir alpha `0.8`.
  - `Draw_StretchRaw` conserve bind texture 0, resampling 256x256, branches RGBA et color-index, filtres linear, coordonnee `t` et workaround alpha renderer.
  - `c` correspond au parametre couleur de `Draw_Fill`; `gl` correspond aux handles image locaux; `hscale`, `row` et `t` correspondent aux locaux de `Draw_StretchRaw`; `scrap_dirty` est porte comme etat runtime explicite et synchronise depuis `gl_image`.
- Runtime verifie:
  - `createRefGlHost` cree/synchronise le runtime `gl_draw`.
  - `R_Init` appelle `Draw_InitLocal` via hook bootstrap.
  - `GetRefAPI` route `DrawGetPicSize`, `DrawPic`, `DrawStretchPic`, `DrawChar`, `DrawTileClear`, `DrawFill`, `DrawFadeScreen` et `DrawStretchRaw` vers les fonctions portees.
- `apps/web` verifie:
  - `full-game.ts` et `main.ts` composent `createThreeGlDrawAdapter`, `createGlImageRuntime` et `createRefGlHost`.
  - `full-game-render-loop.ts` consomme le HUD/root adapter en overlay et ne remplace pas la logique runtime principale.
- `renderer-three` verifie:
  - Sorties visibles attendues: images UI/HUD, console chars, fill/fade screen, tile clear, raw cinematic/image draw.
  - `three-gl-draw-adapter.ts` consomme `drawTexturedQuad`, `drawSolidQuad`, `uploadRawTexture`, les palettes, textures scrap et viewport en scene/camera Three.

Preuves lancees pendant la session:
- `npm run verify:gl-draw`
- `npm run verify:three-gl-draw-adapter`
- `npm run verify:ref-gl-host`
- `npm run verify:full-game:three-renderer`
- `npm run verify:web-render-order`
- `npm run verify:gl-rmain`
- `npm run typecheck`

Resultat:
- Les 15 lignes de `ref_gl_gl_draw.c.md` sont `Valide`.
- Aucun manque runtime, apps/web ou renderer-three detecte pour ce lot.
- Aucun changement TS requis.

Prochain lot recommande:
- Aucun pour `ref_gl/gl_draw.c`; fichier clos.
