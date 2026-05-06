# Progress - Quake-2-master/qcommon/net_chan.c

## Session 2026-05-06

Lot traite:
- Globals de demarrage et buffers reseau: `showpackets`, `showdrop`, `qport`, `net_message`, `net_message_buffer`.
- `Netchan_Init`, locaux associes, `Netchan_OutOfBand`, `Netchan_OutOfBandPrint`, `Netchan_Setup`.

Comparaison C/TS:
- `qport`, `net_message` et `net_message_buffer` sont portes dans `QcommonNetRuntime` / `createQcommonNetRuntime`.
- `Netchan_Init` reproduit le calcul qport `Sys_Milliseconds() & 0xffff` via le hook `now`; `showpackets` et `showdrop` existent comme booleens runtime, pas comme cvars crees par `Cvar_Get`.
- `Netchan_OutOfBand` ecrit bien le header `-1`, copie le payload demande et passe par `NET_SendPacket`.
- `Netchan_OutOfBandPrint` encode la chaine TS en octets et reutilise `Netchan_OutOfBand`; l'API TS ne reproduit pas les varargs `vsprintf`, les appels runtime passent des chaines deja formees.
- `Netchan_Setup` remet le canal a zero, copie l'adresse, renseigne `sock`, `qport`, `last_received`, `incoming_sequence`, `outgoing_sequence`, initialise le buffer message et active `allowoverflow`.

Commentaires d'en-tete:
- Verifies pour les fonctions portees du lot dans `packages/qcommon/src/net_chan.ts`: `Original name`, `Source`, `Category`, `Fidelity level`, `Behavior`, `Porting notes` presents quand utile.

Runtime / apps-web / renderer-three:
- Runtime: les fonctions sont atteignables depuis les flux client/serveur portes (`CL_SendConnectPacket`, `CL_ConnectionlessPacket`, `CL_ReadPackets`, `CL_SendCmd`, `SVC_DirectConnect`, `SV_ReadPackets`, `SV_SendClientMessages`, commandes serveur). Les sorties sont des paquets reseau et l'etat de canal, pas des sorties renderer.
- `apps/web`: le flux navigateur passe par `full-game-local-transport.ts` / `full-game.ts`, qui fournit les `QcommonNetRuntime` client/serveur consommes par les modules client/serveur; pas de logique parallele trouvee pour remplacer ces entites.
- `packages/renderer-three`: non applicable justifie pour ce lot; les entites ne produisent pas directement modeles, frames, images, particules, beams, dlights, temp entities, areabits, camera ou scene. Elles transportent seulement les paquets qui alimenteront ensuite les parseurs client.

Tests lances:
- `npm run verify:net-chan` (OK apres correction de l'import du harness vers `net_chan.js`).
- `npm run verify:qcommon:header` (OK).

Corrections appliquees:
- `scripts/verify/quake2-net-chan.ts`: import corrige de `net-chan.js` vers `net_chan.js` pour tester le fichier proprietaire reel.

Decisions / blocages:
- Les fonctions du lot restent `Partiel` quand un doublon complet avec le meme `Original name` existe encore dans `packages/qcommon/src/qcommon.ts`.
- `showpackets` et `showdrop` restent `Partiel`: le comportement de trace est teste via booleens runtime, mais l'enregistrement original `Cvar_Get` n'est pas branche.
- Les entrees `port`, `send`, `send_buf`, `argptr`, `string` sont des locaux C et ne sont pas des entites proprietaires separees.

Prochain lot recommande:
- `Netchan_CanReliable`, `Netchan_NeedReliable`, `send_reliable` local, puis `Netchan_Transmit` si le coordinateur accepte de traiter le meme probleme de doublon `qcommon.ts` dans ce lot.
- Action transversale recommandee avant de fermer les fonctions: supprimer ou transformer les copies `Netchan_*` de `packages/qcommon/src/qcommon.ts` en facade clairement documentee, sans casser `verify:qcommon:header`.

## Session 2026-05-06 - lot fiable / transmit

Lot traite:
- `Netchan_CanReliable`, `Netchan_NeedReliable`, local `send_reliable`.
- `Netchan_Transmit` et locaux generes `send`, `send_buf`, `send_reliable`.
- `Netchan_Process` non traite dans cette session.

Comparaison C/TS:
- `Netchan_CanReliable` reproduit le test C strict: retourne faux tant que `reliable_length` est non nul, vrai sinon.
- `Netchan_NeedReliable` reproduit les deux branches C: retransmettre si l'ack distant prouve la perte du fiable precedent, et envoyer un nouveau fiable quand `reliable_length` est vide et `message.cursize` non nul.
- `Netchan_Transmit` reproduit les effets de bord C compares: overflow fatal + trace, copie du message fiable dans `reliable_buf`, remise a zero de `message.cursize`, toggle `reliable_sequence`, headers `w1`/`w2`, increment `outgoing_sequence`, `last_sent`, ecriture `qport` cote client, copie fiable avant unreliable, drop de l'unreliable si manque de place, envoi via `NET_SendPacket`, trace `showpackets`.
- Les locaux `send`, `send_buf`, `send_reliable` sont des variables de fonction C; pas d'ownership TS separe attendu.

Commentaires d'en-tete:
- Verifies pour `Netchan_CanReliable`, `Netchan_NeedReliable`, `Netchan_Transmit` dans `packages/qcommon/src/net_chan.ts`: `Original name`, `Source`, `Category`, `Fidelity level`, `Behavior` presents.
- Le doublon de portage du lot dans `packages/qcommon/src/qcommon.ts` a ete supprime et remplace par des reexports vers `net_chan.ts`, source proprietaire du fichier `qcommon/net_chan.c`.

Runtime / apps-web / renderer-three:
- Runtime: integre via `CL_SendCmd` / `CL_SendMove` cote client et `SV_SendClientMessages` / `SV_SendClientDatagram` / `SV_FinalMessage` cote serveur, tous appeles par les flux `CL_Frame` et `SV_Frame` portes.
- `apps/web`: integre via `full-game-local-transport.ts` et `full-game-server-host.ts`, qui fournissent les `QcommonNetRuntime` client/serveur et ne remplacent pas la logique fiable de `Netchan_Transmit`.
- `packages/renderer-three`: non applicable justifie pour ce lot; ces entites produisent des paquets reseau et etats de canal, pas de modeles, frames, images, particules, beams, dlights, temp entities, areabits, camera ou scene. Les sorties visibles sont produites plus tard par le parsing client des messages transportes.

Tests lances:
- `npm run verify:net-chan` (OK).
- `npm run verify:qcommon:header` (OK).
- `npm run typecheck` (OK).
- `npm run verify:full-game:local-transport` (OK).
- `npm run verify:full-game:server-host` (OK).
- `npm run verify:full-game:three-renderer` (OK).

Corrections appliquees:
- `packages/qcommon/src/qcommon.ts`: les exports `Netchan_CanReliable`, `Netchan_NeedReliable` et `Netchan_Transmit` sont maintenant des reexports vers `packages/qcommon/src/net_chan.ts`, ce qui retire le doublon de portage pour le lot.
- `scripts/verify/quake2-net-chan.ts`: assertions ajoutees pour attente d'ack fiable, retransmission fiable, overflow fatal et drop de l'unreliable.

Decisions / blocages:
- Les doublons restants `Netchan_Init`, `Netchan_Setup`, `Netchan_OutOfBand`, `Netchan_OutOfBandPrint` et `Netchan_Process` dans `packages/qcommon/src/qcommon.ts` restent hors du lot courant. Les lignes deja `Partiel` ne sont donc pas fermees ici.

Prochain lot recommande:
- `Netchan_Process` avec son local `qport`, puis traiter les doublons restants de `qcommon.ts` ou les transformer en facades vers `net_chan.ts` avant de fermer les lignes encore `Partiel`.

## Session 2026-05-06 - lot process / facades qcommon

Lot traite:
- `Netchan_Process` et son local C `qport`.
- Doublons restants directement rattaches dans `packages/qcommon/src/qcommon.ts`: `Netchan_Init`, `Netchan_Setup`, `Netchan_OutOfBand`, `Netchan_OutOfBandPrint`, `Netchan_Process`.

Comparaison C/TS:
- `Netchan_Process` dans `packages/qcommon/src/net_chan.ts` reproduit la lecture C du header: `MSG_BeginReading`, sequence, ack, lecture du `qport` seulement cote `NS_SERVER`, extraction des bits fiable, nettoyage du bit haut, traces `showpackets`, rejet des paquets stale/dupliques, calcul `dropped`, clear de `reliable_length` sur ack fiable, mise a jour des sequences/acks fiables, toggle `incoming_reliable_sequence`, puis timestamp `last_received`.
- Le local `qport` de `Netchan_Process` n'est pas une entite proprietaire: le C le lit seulement pour consommer les deux octets serveur, sans comparaison dans cette fonction; le filtrage par qport est fait en amont dans `SV_ReadPackets`.
- Les copies `Netchan_*` restantes de `qcommon.ts` ont ete remplacees par des facades/reexports vers `net_chan.ts`, qui est le fichier proprietaire de `qcommon/net_chan.c`.

Commentaires d'en-tete:
- Verifies pour `Netchan_Process` dans `packages/qcommon/src/net_chan.ts`: `Original name`, `Source`, `Category: Ported`, `Fidelity level: Strict`, `Behavior` presents.
- Les commentaires de portage concurrents dans `qcommon.ts` ont ete supprimes avec les doublons; le port officiel reste documente dans `net_chan.ts`.

Runtime / apps-web / renderer-three:
- Runtime: `Netchan_Process` est atteint depuis `CL_ReadPackets` cote client et `SV_ReadPackets` cote serveur, eux-memes appeles par les flux `CL_Frame` / `SV_Frame`; le qport serveur est filtre avant appel dans `SV_ReadPackets`, puis relu ici pour conserver le curseur payload comme en C.
- `apps/web`: integre via `full-game-local-transport.ts` et `full-game-server-host.ts`, qui fournissent les runtimes reseau client/serveur; aucune logique web parallele ne remplace le traitement netchan.
- `packages/renderer-three`: non applicable justifie; le lot produit seulement etat de canal et curseur de message reseau. Il ne produit pas directement modeles, frames, images, particules, beams, dlights, temp entities, areabits, camera ou scene; les sorties visibles sont consommees plus tard apres parsing client.

Tests lances:
- `npm run verify:net-chan` (OK).
- `npm run verify:qcommon:header` (OK).
- `npm run typecheck` (OK).
- `npm run verify:full-game:local-transport` (OK).
- `npm run verify:full-game:server-host` (OK).
- `npm run verify:full-game:three-renderer` (OK).

Corrections appliquees:
- `packages/qcommon/src/qcommon.ts`: remplacement des portages locaux `Netchan_Init`, `Netchan_Setup`, `Netchan_OutOfBand`, `Netchan_OutOfBandPrint` et `Netchan_Process` par des reexports depuis `packages/qcommon/src/net_chan.ts`.
- `audit-portage/validation-incrementale/validation/matrices/qcommon_net_chan.c.md`: `Netchan_Process` valide, local `qport` non applicable, lignes `Netchan_OutOfBand`, `Netchan_OutOfBandPrint` et `Netchan_Setup` fermees apres suppression des doublons.

Decisions / blocages:
- `showpackets`, `showdrop` et `Netchan_Init` restent `Partiel`: les flags existent dans le runtime et les traces sont testees, mais le port ne cree pas encore les cvars originales via `Cvar_Get`.

Prochain lot recommande:
- Fermer le reliquat cvar du fichier: brancher/documenter `showpackets`, `showdrop` et `qport` dans le runtime cvar autour de `Netchan_Init`, puis revalider les trois lignes `Partiel`.
