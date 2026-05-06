# Progress - Quake-2-master/ref_gl/gl_rmisc.c

## Etat courant

- Statut: Termine
- Dernier lot valide: lot complet des 8 lignes de matrice de `ref_gl/gl_rmisc.c`.
- Entites validees: `R_InitParticleTexture`, `GL_ScreenShot_f`, `GL_Strings_f`, `GL_SetDefaultState`, `GL_UpdateSwapInterval`, `_TargaHeader`.
- Entites non applicables: `image_type` et `colormap_size`, lignes generees depuis des champs de `_TargaHeader` et couvertes par l'interface `TargaHeader`.

## Preuves de session

- Source C lue: `Quake-2-master/ref_gl/gl_rmisc.c`.
- Cible TS lue: `packages/renderer-three/src/gl_rmisc.ts`.
- Integration runtime lue: `packages/renderer-three/src/ref-gl-host.ts`, `packages/renderer-three/src/gl_rmain.ts`.
- Integration apps/web lue: `apps/web/src/main.ts`, `apps/web/src/full-game.ts`.
- Integration renderer-three visible lue: `packages/renderer-three/src/gl-world-scene-adapter.ts`.
- Tests lances: `npm run verify:gl-rmisc` OK; `npm run verify:ref-gl-host` OK; `npm run verify:full-game:three-renderer` OK.

## Decisions

- `GL_ScreenShot_f` est porte en hook filesystem/readPixels avec retour payload TGA; le branchement runtime passe par la commande `screenshot` exposee par `GetRefAPI` et relayee dans `ref-gl-host`.
- `GL_Strings_f` est porte et branche via la commande runtime `gl_strings`.
- `GL_SetDefaultState` et `GL_UpdateSwapInterval` sont branches dans le flux `R_Init`/`BeginFrame` via `ref-gl-host`, avec hooks QGL/QWGL.
- `R_InitParticleTexture` charge `***particle***` et `***r_notexture***`, synchronise `GlImageRuntime` et `gl_rmain`; `renderer-three` consomme aussi le fallback visible via `gl-world-scene-adapter`.
- `apps/web` instancie `createRefGlHost` dans les deux flux navigateur inspectes; pas de logique parallele masquant ce port.

## Prochain lot recommande

- Aucun lot restant pour `ref_gl/gl_rmisc.c`; reprendre le prochain fichier `ref_gl` prioritaire dans `AVANCEMENT_GLOBAL.md`.
