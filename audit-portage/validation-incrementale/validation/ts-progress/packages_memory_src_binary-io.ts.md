# Progress TS croise - packages/memory/src/binary-io.ts

## Dernier lot valide

- 2026-05-01: fonctions de lecture `getSignedByte`, `getUnsignedByte`, `getLittleShort`, `getLittleLong`, `getLittleFloat`.
- Verdict: helpers locaux `Category: New`, sans entite C/H proprietaire; en-tetes explicites `Original name: N/A` et `Source: N/A (local helper)`.
- Doublons: aucun couple `Original name` + `Source declaree` porteur C/H; doublon local homonyme note hors lot dans `packages/formats/src/tga.ts`.
- Integration runtime/apps/web/renderer-three: non applicable comme flux runtime propre; helpers consommes par les parsers formats et le loader renderer-three.

## Tests de reference

- `npm run verify:qfiles`
- `npm run verify:gl-model:phase9`
- `npm run typecheck`

## Blocages

- Aucun.

## Prochain lot recommande

- Valider les fonctions d'ecriture `setSignedByte`, `setUnsignedByte`, `setLittleShort`, `setLittleLong`, `setLittleFloat`.
