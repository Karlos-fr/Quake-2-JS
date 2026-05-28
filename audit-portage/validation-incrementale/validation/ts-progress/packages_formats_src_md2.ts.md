# Progress TS - packages/formats/src/md2.ts

- Statut: Termine
- Lot valide: fichier complet, 33 symboles.
- Prochain lot recommande: aucun.

## Decisions

- `packages/formats/src/md2.ts` est accepte comme ownership TS legitime pour le bloc MD2 de `Quake-2-master/qcommon/qfiles.h`: la matrice C/H `qcommon_qfiles.h.md` designe explicitement ce fichier comme cible proprietaire, et `qfiles.h` est un header de formats de fichiers partage entre runtime et outils.
- Les constantes et structs MD2 portees depuis `qfiles.h` sont marquees `Couvert C/H` seulement lorsque la matrice C/H les marque `Valide` avec `packages/formats/src/md2.ts` comme cible.
- `parseMd2` est classe `Category: Adapter`, avec `Original name: N/A`, pour eviter de masquer le portage proprietaire de `dmdl_t`. Il materialise le format MD2 en objet structure pour le client et le renderer.
- Les tailles binaires et helpers de lecture/validation sont `Category: New` avec `Original name: N/A` et `Source: N/A (...)` explicites.

## Tests

- `npm run verify:qfiles`
- `npm run verify:gl-model:header`
- `npm run verify:gl-model:phase9`
- `npm run verify:refresh-entity:alias-flags`
- `npm run typecheck`

## Integration

- Runtime: integre via `packages/client/src/precache.ts` pour l'enumeration defensive des skins MD2 et via les flux modele client.
- apps/web: integre indirectement par le runtime complet et le chargement des assets/pak consommes par le jeu web.
- renderer-three: integre via `gl_model.ts`, `md2-mesh-builder.ts`, `refresh-entity-sync.ts` et `gl_mesh.ts`; `packages/formats/src/md2.ts` reste proprietaire du format binaire, pas de l'adapter renderer.
