# Progress - Quake-2-master/qcommon/qfiles.h

## Etat courant

- Statut: En cours
- Dernier lot valide: bloc MD2 initial et header complet (`IDALIASHEADER`, `ALIAS_VERSION`, limites MD2, `dstvert_t`, `dtriangle_t`, `dtrivertx_t`, macros `DTRIVERTX_*`, `daliasframe_t`, `dmdl_t` et champs directs jusqu'a `ofs_end`).
- Matrice: `audit-portage/validation-incrementale/validation/matrices/qcommon_qfiles.h.md`

## Derniere session

- Lot traite: bloc MD2 initial et adjacent coherent, depuis `IDALIASHEADER` jusqu'a `dmdl_t.ofs_end`.
- Source comparee: `Quake-2-master/qcommon/qfiles.h`.
- Cibles comparees: `packages/formats/src/md2.ts`, `packages/formats/src/index.ts`, `packages/client/src/precache.ts`, `packages/renderer-three/src/gl-model-loader.ts`, `packages/renderer-three/src/md2-mesh-builder.ts`, `apps/web/src/web-shell.ts`.
- Decision: ownership MD2 corrige vers `packages/formats/src/md2.ts` dans la matrice pour les constantes et champs qui pointaient encore vers `qfiles.ts` ou `sp2.ts`. Les macros `MAX_TRIANGLES`, `MAX_VERTS`, `MAX_FRAMES`, `MAX_SKINNAME` et `DTRIVERTX_*` sont maintenant exportees depuis `md2.ts` puis `packages/formats/src/index.ts`.
- Commentaires: en-tete fichier MD2 et en-tetes de portage verifies pour `dstvert_t`, `dtriangle_t`, `dtrivertx_t`, `daliasframe_t`, `dmdl_t` et `parseMd2`; pas de commentaire de fonction C a ajouter pour les macros/structs.
- Runtime: attendu et verifie. `parseMd2` est appele par le precache client pour enumerer les skins a telecharger, et par `Mod_LoadAliasModel`/`Mod_ForName` pour charger les alias models depuis les identifiants MD2.
- apps/web: attendu indirectement et verifie. Le shell web expose les stats de rendu MD2 et le flux full-game utilise le runtime/renderer plutot qu'une logique parallele de parsing MD2.
- renderer-three: attendu et verifie. `gl-model-loader`, `md2-mesh-builder` et `refresh-entity-sync` consomment les modeles, frames, skins, glcmds, vertex indices et lightnormalindex pour les sorties visibles MD2.
- Tests ajoutes: assertions ciblees dans `scripts/verify/quake2-qfiles.ts` pour les constantes MD2, macros `DTRIVERTX_*` et le header `dmdl_t` complet.
- Tests lances: `npm run verify:qfiles`, `npm run verify:gl-model:phase9`, `npm run verify:gl-mesh`, `npm run verify:refresh-entity:alias-flags`, `npm run verify:full-game:three-renderer`, `npm run verify:cl-main`, `npm run verify:entities:phase11`, `npm run golden:pak0`, `npm run typecheck`.

## Prochain lot recommande

- Bloc SP2 initial: `IDSPRITEHEADER`, `SPRITE_VERSION`, `dsprframe_t` et champs directs, puis `dsprite_t` si le lot reste coherent.

## Blocages

- Aucun.
