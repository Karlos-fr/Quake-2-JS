# Progress TS croise - packages/memory/src/binary-io.ts

## Dernier lot valide

- 2026-05-08: fonctions d'ecriture `setSignedByte`, `setUnsignedByte`, `setLittleShort`, `setLittleLong`, `setLittleFloat`.
- Verdict: helpers locaux `Category: New`, sans entite C/H proprietaire; en-tetes explicites `Original name: N/A` et `Source: N/A (local helper)`.
- Croisement C/H: les portages proprietaires `MSG_WriteByte`, `MSG_WriteShort`, `MSG_WriteLong`, `MSG_WriteFloat` restent dans `packages/qcommon/src/messages.ts`; `LittleShort`, `LittleLong`, `LittleFloat` restent dans `packages/qcommon/src/common.ts`.
- Doublons/ownership: pas de doublon porteur C/H pour ce lot; ownership acceptable dans `packages/memory` comme helpers binaires bas niveau exportes.
- Integration runtime/apps/web/renderer-three: helpers consommes par le runtime client pour l'ecriture de chunks demo et par des harnais de fixtures renderer; aucune integration directe apps/web ou renderer-three attendue pour ces primitives sans sortie visible propre.

- 2026-05-01: fonctions de lecture `getSignedByte`, `getUnsignedByte`, `getLittleShort`, `getLittleLong`, `getLittleFloat`.
- Verdict: helpers locaux `Category: New`, sans entite C/H proprietaire; en-tetes explicites `Original name: N/A` et `Source: N/A (local helper)`.
- Doublons: aucun couple `Original name` + `Source declaree` porteur C/H; doublon local homonyme note hors lot dans `packages/formats/src/tga.ts`.
- Integration runtime/apps/web/renderer-three: non applicable comme flux runtime propre; helpers consommes par les parsers formats et le loader renderer-three.

## Tests de reference

- Test cible inline des ecritures `set*` et lectures `get*`
- `npm run verify:qfiles`
- `npm run verify:gl-model:phase9`
- `npm run typecheck`

## Blocages

- Aucun.

## Prochain lot recommande

- Aucun pour `packages/memory/src/binary-io.ts`.
