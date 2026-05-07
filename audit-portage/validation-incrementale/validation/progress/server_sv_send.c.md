# Progress - Quake-2-master/server/sv_send.c

## Dernier lot valide

- Gros bloc initial `sv_send.c`: `sv_outputbuf`, `SV_FlushRedirect`, `SV_ClientPrintf`, `SV_BroadcastPrintf`, `SV_BroadcastCommand`, `SV_Multicast`, `SV_StartSound`, `SV_SendClientDatagram`, `SV_DemoCompleted`, `SV_RateDrop`.
- Faux positifs de variables locales associees marques `Non applicable`: `argptr`, `string`, `i`, `copy`, `mask`, `j`, `reliable`, `sendchan`, `flags`, `ent`, `origin_v`, `use_phs`, `msg_buf`, `msg`, `total`.

## Preuves de comparaison

- Source C lue: `Quake-2-master/server/sv_send.c`.
- Cible TS lue: `packages/server/src/sv_send.ts`.
- Commentaires d'en-tete verifies pour toutes les fonctions portees du lot.
- `sv_outputbuf` est represente dans `ServerHeaderState.sv_outputbuf`; la redirection rcon est adaptee dans `sv_main.ts` par callback `executeRconCommand`, et `SV_FlushRedirect` reste expose dans `sv_send.ts`.
- `SV_ClientPrintf`/`SV_BroadcastPrintf` conservent le filtrage `messagelevel`, l'ecriture `svc_print`, et le filtrage clients `cs_spawned`.
- `SV_BroadcastCommand` conserve le `svc_stufftext` fiable vers tous les clients actifs quand `sv.state` n'est pas mort.
- `SV_Multicast` conserve le choix ALL/PHS/PVS, fiable/non fiable, demo multicast, filtres client/zone/cluster et remise a zero de `sv.multicast`.
- `SV_StartSound` conserve validations volume/attenuation/timeofs, flags `SND_*`, calcul ent/channel/origin, `CHAN_NO_PHS_ADD`, `CHAN_RELIABLE`, `ATTN_NONE` et multicast PHS/ALL.
- `SV_SendClientDatagram` conserve l'ordre build frame, write frame, append datagram, clear, overflow warning, transmit et historisation rate.
- `SV_DemoCompleted` ferme le demo handle abstrait, remet `sv.demofile` a `null`, puis appelle `SV_Nextserver`.
- `SV_RateDrop` conserve l'exemption loopback, la somme `RATE_MESSAGES`, `surpressCount` et la remise a zero du slot courant.

## Integration

- Runtime: integre via `createServerRuntimeFacade`; `SV_Frame` appelle `SV_SendClientMessages`, `sv_game.ts` route `multicast`, `sound`, `bprintf` et `cprintf` vers `sv_send.ts`, `sv_init.ts` route les updates configstring et commandes fiables.
- `apps/web`: integre via `createFullGameServerHost`; le host local utilise la facade serveur portee et consomme les snapshots/datagrams via `writeLocalClientFrame`.
- `renderer-three`: sorties visibles indirectes valides. `SV_SendClientDatagram` transporte snapshots/areabits/modeles/frames jusqu'au client puis au render source; `SV_StartSound` produit `svc_sound` consomme par `CL_ParseStartSoundPacket` et les hooks audio web, pas par le renderer; `SV_Multicast` transporte aussi temp entities/configstrings selon producteurs amont.

## Tests lances

- `npm run verify:server:send`
- inline `npx tsx -` ciblant `SV_FlushRedirect` `RD_CLIENT` et `RD_PACKET`
- `npm run verify:server:runtime`
- `npm run verify:server:main`
- `npm run verify:server:game`
- `npm run verify:audio:phase11`
- `npm run verify:full-game:server-host`
- `npm run verify:full-game:server-snapshots`
- `npm run verify:full-game:three-renderer`
- `npm run verify:cl-parse`
- `npm run typecheck`

## Prochain lot recommande

- `SV_SendClientMessages` et variables locales associees `i`, `msglen`, `msgbuf`, `r`.
- La fonction est deja couverte partiellement par `verify:server:send`, mais il faut refaire la comparaison detaillee C/TS avant de la marquer.

## Blocages

- Aucun.
