# Progress TS - packages/formats/src/sp2.ts

- Statut: Termine
- Lot valide: fichier complet, 9 symboles.
- Prochain lot recommande: aucun.

## Decisions

- `packages/formats/src/sp2.ts` est accepte comme ownership TS legitime pour le bloc SP2 de `Quake-2-master/qcommon/qfiles.h`: la matrice C/H `qcommon_qfiles.h.md` designe explicitement ce fichier comme cible proprietaire, et `qfiles.h` est un header de formats de fichiers partage entre runtime et renderer.
- `IDSPRITEHEADER`, `SPRITE_VERSION`, `dsprframe_t` et `dsprite_t` sont marques `Couvert C/H` uniquement parce que la matrice C/H les marque `Valide` avec `packages/formats/src/sp2.ts` comme cible.
- `parseSp2` est classe `Category: Adapter`, avec `Original name: N/A`, pour ne pas masquer le portage proprietaire de `dsprite_t`. Il materialise le format SP2 en objet structure pour les loaders renderer.
- `MAX_SKINNAME` est un adapter prive de la constante partagee de `qfiles.h`; le proprietaire exporte canonique reste `packages/formats/src/md2.ts`.
- Les tailles binaires et `decodeCString` sont `Category: New` avec `Original name: N/A` et `Source: N/A (...)` explicites.

## Tests

- `npm run verify:qfiles`
- `npm run verify:gl-model:phase8`
- `npm run verify:refresh-entity:sprite`
- `npm run typecheck`

## Integration

- Runtime: integre via les flux modele/sprite du client qui produisent des references `.sp2` consommees par le renderer; le parser reste un format helper et ne remplace pas la logique runtime.
- apps/web: integre indirectement via le chargement des assets/pak et les render sources du jeu complet.
- renderer-three: integre via `gl-model-loader.ts`, `gl_rmain.ts` et `refresh-entity-sync.ts`; `packages/formats/src/sp2.ts` reste proprietaire du format binaire, pas de l'adapter renderer.
