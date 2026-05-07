# Progress - Quake-2-master/server/sv_send.c

## Dernier lot valide

- Gros bloc initial `sv_send.c`: `sv_outputbuf`, `SV_FlushRedirect`, `SV_ClientPrintf`, `SV_BroadcastPrintf`, `SV_BroadcastCommand`, `SV_Multicast`, `SV_StartSound`, `SV_SendClientDatagram`, `SV_DemoCompleted`, `SV_RateDrop`.
- Faux positifs de variables locales associees marques `Non applicable`: `argptr`, `string`, `i`, `copy`, `mask`, `j`, `reliable`, `sendchan`, `flags`, `ent`, `origin_v`, `use_phs`, `msg_buf`, `msg`, `total`.
- Lot final `SV_SendClientMessages` valide: flux demo/cinematic/pic, overflow fiable, rate drop, datagram spawned, pulse fiable des clients non spawned.
- Faux positifs de variables locales associees marques `Non applicable`: `i`, `msglen`, `msgbuf`, `r`.

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
- `SV_SendClientMessages` conserve l'initialisation `msglen = 0`, la lecture demo non pausee avec EOF/fin `-1` abstraits par `readDemoMessage === null`, la limite `MAX_MSGLEN`, la boucle sur `maxclients`, le skip `cs_free`, le clear/drop en overflow fiable, le transmit direct cinematic/demo/pic, le rate drop pour `cs_spawned`, `SV_SendClientDatagram`, et le transmit reliable-only quand `netchan.message.cursize` existe ou que `now - last_sent > 1000`.
- `i`, `msglen`, `msgbuf` et `r` sont des temporaires locaux C; la cible TS utilise `let i`, `demoMsg`/`next.length` et l'abstraction `readDemoMessage`, sans entite proprietaire separee.

## Integration

- Runtime: integre via `createServerRuntimeFacade`; `SV_Frame` appelle `SV_SendClientMessages`, `sv_game.ts` route `multicast`, `sound`, `bprintf` et `cprintf` vers `sv_send.ts`, `sv_init.ts` route les updates configstring et commandes fiables.
- `apps/web`: integre via `createFullGameServerHost`; le host local utilise la facade serveur portee et consomme les snapshots/datagrams via `writeLocalClientFrame`.
- `renderer-three`: sorties visibles indirectes valides. `SV_SendClientDatagram` transporte snapshots/areabits/modeles/frames jusqu'au client puis au render source; `SV_StartSound` produit `svc_sound` consomme par `CL_ParseStartSoundPacket` et les hooks audio web, pas par le renderer; `SV_Multicast` transporte aussi temp entities/configstrings selon producteurs amont.
- Pour `SV_SendClientMessages`, `apps/web` est attendu et verifie via le host full-game qui avance `SV_Frame` puis consomme les frames locales. `renderer-three` ne consomme pas la fonction serveur directement, mais les snapshots/datagrams emis par ce flux deviennent des entites/camera/scene client consommees par le renderer.

## Tests lances

- `npm run verify:server:send`
- `npm run verify:server:send` apres ajout d'assertions pause demo et pulse reliable-only
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

- Aucun lot restant dans `server/sv_send.c`: toutes les lignes sont `Valide` ou `Non applicable`.

## Blocages

- Aucun.
