# Progress TS - packages/qcommon/src/qcommon.ts

## Etat courant

- Statut: Termine
- Symboles TS: 109
- Couvert C/H: 82
- Valide: 19
- Non applicable: 8
- A auditer: 0
- Entetes incomplets: 0

## Lot traite

Gros lot complet du fichier: constantes qcommon, types reseau, runtime adapters qcommon, helpers NET/CRC/common, reexports Netchan et helpers locaux.

## Preuves

- Matrices C/H croisees: `qcommon_qcommon.h.md`, `qcommon_common.c.md`, `qcommon_crc.c.md`, `qcommon_net_chan.c.md`.
- Ownership confirme pour les symboles proprietaires de `packages/qcommon/src/qcommon.ts`.
- Les reexports `Netchan_*` sont classes `Non applicable` dans cette matrice car le proprietaire comportemental est `packages/qcommon/src/net_chan.ts`.
- Les symboles `Category: New` ont des metadonnees explicites `Original name: N/A` et `Source declaree: N/A (...)` dans le TS et la matrice.
- `sequenceCheckTable` de la matrice a ete corrige vers le symbole TS reel `chktbl`, port de `qcommon/common.c`.

## Tests de reference

- `npm run verify:qcommon:header`
- `npm run verify:crc`
- `npm run verify:crc:header`
- `npm run verify:net-chan`
- `npm run typecheck`

## Integration runtime / apps-web / renderer-three

- Runtime: integre via les helpers qcommon, les hooks host/net injectables, `Qcommon_Init`, `Qcommon_Frame`, CRC, NET et reexports netchan.
- apps/web: consomme le runtime qcommon via le flux full-game et server-host; pas de correction web dediee dans ce lot.
- renderer-three: consomme les sorties runtime/client/serveur; aucun flux rendu direct n'est produit par les metadonnees ou helpers locaux de ce fichier.

## Prochain lot

Aucun pour `packages/qcommon/src/qcommon.ts` dans la matrice TS actuelle. Reprendre separement `packages/qcommon/src/net_chan.ts` si l'on veut auditer le proprietaire comportemental des `Netchan_*`.
