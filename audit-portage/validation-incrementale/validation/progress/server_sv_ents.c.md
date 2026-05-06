# Progress - Quake-2-master/server/sv_ents.c

## Etat

- Statut: Termine
- Dernier lot valide: fichier complet `server/sv_ents.c`.
- Compteurs: 36 entrees, 7 `Valide`, 29 `Non applicable`.

## Lot traite

- `SV_EmitPacketEntities`
- `fatpvs`
- `SV_FatPVS`
- `SV_BuildClientFrame`
- `SV_WritePlayerstateToClient`
- `SV_WriteFrameToClient`
- `SV_RecordDemoMessage`
- Faux positifs de matrice: variables locales generees comme globales (`from_num_entities`, `bits`, `i`, `pflags`, `dummy`, `statbits`, `ops`, `lastframe`, `leafs`, `longs`, `src`, `ent`, `clent`, `frame`, `state`, `l`, `leafnum`, `c_fullsend`, `clientphs`, `bitvector`, `len`, `e`, `nostate`, `buf`, `buf_data`).

## Preuves

- Comparaison C/TS effectuee pour entity deltas, playerstate deltas, frame writing, FatPVS, frame visibility/PVS/areabits et demo messages.
- Commentaires d'en-tete verifies pour les fonctions portees; ajoutes pour `SV_FatPVS` et `SV_RecordDemoMessage`.
- Runtime: atteint depuis `SV_SendClientMessages`/`SV_SendClientDatagram`, lui-meme appele par `SV_Frame`; demo atteint depuis `SV_Frame` via `SV_RecordDemoMessage`.
- `apps/web`: `apps/web/src/full-game-server-host.ts` construit et ecrit les frames serveur locales via `SV_BuildClientFrame` et `SV_WriteFrameToClient`.
- `renderer-three`: consommation indirecte via `CL_ParseFrame`, `CL_ParsePacketEntities`, refresh/view, puis adapters renderer pour entites visibles et `areabits`.

## Tests de reference

- `npm run verify:server:ents`
- `npm run verify:server:send`
- `npm run verify:server:runtime`
- `npm run verify:full-game:server-host`
- `npm run verify:full-game:server-snapshots`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

## Prochain lot recommande

Aucun pour `server/sv_ents.c`: toutes les lignes sont `Valide` ou `Non applicable`.
