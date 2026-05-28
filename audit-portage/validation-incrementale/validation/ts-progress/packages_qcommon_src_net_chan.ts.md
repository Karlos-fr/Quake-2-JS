# Progress TS - packages/qcommon/src/net_chan.ts

## Session 2026-05-28

- Lot traite: toutes les lignes restantes de la matrice TS: `Netchan_Init`, `Netchan_Setup`, `Netchan_CanReliable`, `Netchan_NeedReliable`, `Netchan_OutOfBand`, `Netchan_OutOfBandPrint`, `Netchan_Transmit`, `Netchan_Process`, puis helpers locaux `cloneNetAdr`, `encodeAscii`, `padPacketSize`.
- Statut: les huit fonctions `Netchan_*` sont marquees `Couvert C/H` via `qcommon_net_chan.c.md`, qui valide chaque entite avec `packages/qcommon/src/net_chan.ts` comme cible proprietaire; les trois helpers locaux sont marques `Valide` comme `Category: New`.
- Verification: entetes TS alignes (`Original name`, `Source`, `Category`, `Export`); `packages/qcommon` est l'ownership attendu pour `qcommon/net_chan.c`; pas de doublon proprietaire `Netchan_*` trouve dans `packages/` ou `apps/`; les helpers/imports `sizebuf`, `messages` et `common` sont des consommateurs ou primitives partagees, pas des proprietaires C/H de `net_chan.c`.
- Tests de reference: `npm run verify:net-chan`, `npm run verify:qcommon:header`, `npm run typecheck`.
- Runtime/apps-web/renderer-three: integre via les flux client/server (`CL_Frame`, reception client, `SV_ReadPackets`, envois serveur) et l'initialisation `apps/web` par `full-game-server-host`; aucune sortie renderer directe, donc `renderer-three` non applicable pour ce fichier.
- Prochain lot recommande: aucun dans la matrice TS actuelle de `packages/qcommon/src/net_chan.ts`.
