# Progress TS - packages/memory/src/sizebuf.ts

## Session 2026-05-26

- Lot traite: metadata/entetes pour `sizebuf_t`, `createSizeBuffer`, `encodeCString`.
- Statut: `sizebuf_t` marque `Couvert C/H` via `qcommon_qcommon.h.md` ligne `struct sizebuf_s` -> cible `sizebuf_t`; `createSizeBuffer` et `encodeCString` marques `Valide` comme `Category: New` avec `Original name: N/A` et `Source declaree: N/A (...)`.
- Verification: entetes TS alignes; pas de doublon proprietaire trouve pour `createSizeBuffer`/`encodeCString`; `sizebuf_t` est un type commun volontairement dans `packages/memory`.
- Tests de reference: `npm run verify:qcommon:header`.
- Runtime/apps/web/renderer-three: non applicable pour ce lot metadata/helper; le buffer est consomme par qcommon/server/client et apps/web via les flux deja existants, sans sortie renderer directe.
- Prochain lot recommande: valider les fonctions proprietaires deja couvertes C/H en commencant par `SZ_Init`, `SZ_Clear`, `MSG_BeginReading`, puis les fonctions d'ecriture `SZ_GetSpace`, `SZ_Write`, `SZ_Print`.

## Session 2026-05-28

- Lot traite: ownership TS croise de `SZ_Init`, `SZ_Clear`, `MSG_BeginReading`, `SZ_GetSpace`, `SZ_Write`, `SZ_Print`.
- Statut: les six fonctions sont marquees `Couvert C/H` via `qcommon_common.c.md`, qui cible `packages/memory/src/sizebuf.ts` pour chaque entite.
- Verification: entetes TS complets (`Original name`, `Source`, `Category`, `Export`); `packages/memory` accepte comme ownership commun pour les primitives `sizebuf_t`; recherche de doublons proprietaires negative dans `packages/` et `apps/`; `MSG_BeginReading` est seulement reexporte par `packages/qcommon/src/messages.ts`.
- Tests de reference: `npm run verify:qcommon:header`, `npm run verify:net-chan`, `npm run typecheck`.
- Runtime/apps-web/renderer-three: integre via les consommateurs qcommon/server/client et flux full-game; pas de sortie renderer directe produite par ces primitives.
- Prochain lot recommande: aucun dans la matrice TS actuelle de `packages/memory/src/sizebuf.ts`.
