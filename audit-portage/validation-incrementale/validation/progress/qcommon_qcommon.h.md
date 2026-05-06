# Progress - Quake-2-master/qcommon/qcommon.h

## Etat courant

- Statut: En cours
- Dernier lot valide: `MSG_WriteChar`, `MSG_WriteByte`, `MSG_WriteShort`, `MSG_WriteLong`, `MSG_WriteFloat`, `MSG_WriteString`, `MSG_WriteCoord`, `MSG_WritePos`, `MSG_WriteAngle`, `MSG_WriteAngle16`, `MSG_WriteDir`.
- Matrice: `audit-portage/validation-incrementale/validation/matrices/qcommon_qcommon.h.md`

## Derniere session

- Lot traite: bloc `MSG_Write*` simple dans `packages/qcommon/src/messages.ts`: `MSG_WriteChar`, `MSG_WriteByte`, `MSG_WriteShort`, `MSG_WriteLong`, `MSG_WriteFloat`, `MSG_WriteString`, `MSG_WriteCoord`, `MSG_WritePos`, `MSG_WriteAngle`, `MSG_WriteAngle16`, `MSG_WriteDir`.
- Source comparee: declarations `Quake-2-master/qcommon/qcommon.h` et implementations `Quake-2-master/qcommon/common.c`.
- Cible comparee: `packages/qcommon/src/messages.ts`, avec helpers `SZ_GetSpace` / `SZ_Write`, `ANGLE2SHORT`, `BYTE_DIRS` et `DotProduct`.
- Decision: portage valide. Les fonctions conservent les noms originaux, l'ownership `packages/qcommon/src/messages.ts` est coherent, aucun doublon proprietaire concurrent trouve. Les ecritures conservent l'ordre little-endian C, la troncature vers zero pour coord/angle, la chaine nullish comme chaine vide terminee par NUL, et la quantification `bytedirs` pour `MSG_WriteDir`. Les appels `Com_Error` conditionnels `PARANOID` du C ne sont pas actifs dans le port courant; les fonctions TS preservent la troncature effective.
- Runtime: attendu et verifie. Le bloc est appele depuis les flux normaux client/serveur/netchan: `Netchan_Transmit` / out-of-band, `CL_SendCmd` / commandes client, `SV_Frame` puis `SV_SendClientMessages`, `SV_WriteFrameToClient`, `PF_Write*`, `SV_StartSound` et messages de connexion/configstrings.
- apps/web: attendu et verifie. `apps/web/src/full-game-server-host.ts` et le host full-game declenchent les flux server/client portes qui produisent et consomment ces messages, sans logique parallele remplacant `messages.ts`.
- renderer-three: pas de consommation directe attendue par ces primitives seules; elles encodent des donnees qui peuvent ensuite devenir visibles (entites, sons, positions, camera, dlights, beams), mais la production/consommation visible appartient aux lots delta entity/client parse/renderer. Le test three-renderer confirme que le flux full-game renderer reste branche.
- Commentaires: en-tetes de `MSG_WriteChar`, `MSG_WriteByte`, `MSG_WriteShort`, `MSG_WriteLong`, `MSG_WriteFloat`, `MSG_WriteString`, `MSG_WriteCoord`, `MSG_WritePos`, `MSG_WriteAngle`, `MSG_WriteAngle16`, `MSG_WriteDir` verifies dans `packages/qcommon/src/messages.ts`.
- Tests ajoutes: assertions byte-a-byte et roundtrip dans `scripts/verify/quake2-qcommon-header.ts` pour char/byte/short/long/float/string/coord/pos/angle/angle16/dir.
- Tests lances: `npm run verify:qcommon:header`, `npm run verify:net-chan`, `npm run verify:full-game:server-host`, `npm run verify:full-game:three-renderer`, `npm run typecheck`.

## Session precedente

- Lot traite: bloc `sizebuf_s` et fonctions de buffer dans `packages/memory/src/sizebuf.ts`.
- Source comparee: `Quake-2-master/qcommon/qcommon.h` declarations et `Quake-2-master/qcommon/common.c` implementations de `MSG_BeginReading` / `SZ_*`.
- Cible comparee: `packages/memory/src/sizebuf.ts`.
- Decision: ownership corrige vers `packages/memory/src/sizebuf.ts`; le typedef C `struct sizebuf_s` / `sizebuf_t` est porte en interface `sizebuf_t` avec champs originaux. `Uint8Array` remplace le pointeur C `byte *data`; `SZ_GetSpace` retourne une sous-vue `Uint8Array` au lieu d'un pointeur; les erreurs fatales C sont des exceptions JS documentees en fidelity `Close`.
- Runtime: attendu et verifie. Ces primitives sont appelees par les commandes, le netchan, le client, le serveur et les messages reseau depuis des racines `Qcommon_Frame`, `SV_Frame`, `CL_Frame`, traitements de paquets et commandes.
- apps/web: attendu et verifie via `apps/web/src/full-game-server-host.ts`, qui construit/ecrit/efface des `sizebuf_t` et remet la lecture a zero pour les messages client/serveur.
- renderer-three: pas de consommation directe attendue; ce lot ne produit pas lui-meme modeles, frames, images, particules, beams, dlights, temp entities, areabits, camera ou scene. Il transporte indirectement des messages qui peuvent ensuite alimenter ces sorties visibles.
- Commentaires: en-tetes de `sizebuf_t`, `SZ_Init`, `SZ_Clear`, `SZ_GetSpace`, `SZ_Write`, `SZ_Print`, `MSG_BeginReading` verifies dans `packages/memory/src/sizebuf.ts`.
- Tests ajoutes: assertions ciblees dans `scripts/verify/quake2-qcommon-header.ts` pour champs, init, clear, overflow, write, print et begin-reading.
- Tests lances: `npm run verify:qcommon:header`, `npm run verify:net-chan`, `npm run verify:full-game:server-host`, `npm run verify:full-game:three-renderer`, `npm run typecheck`.

## Session precedente

- Lot traite: 15 entrees de matrice correspondant a `VERSION`, `BASEDIRNAME`, aux 5 branches C de `BUILDSTRING` et aux 8 branches C de `CPUSTRING`.
- Source comparee: `Quake-2-master/qcommon/qcommon.h`.
- Cibles comparees: `packages/qcommon/src/qcommon.ts`, `packages/qcommon/src/protocol.ts`.
- Decision: les doublons `BUILDSTRING`/`CPUSTRING` sont des branches preprocesseur exclusives dans le header C. Le port TS conserve un seul export par nom avec un libelle portable documente en fidelity `Close`; `VERSION` et `BASEDIRNAME` restent stricts.
- Runtime: `VERSION` est consomme par les flux console/client et reponse serveur; `BASEDIRNAME` est consomme par client parse/download. `BUILDSTRING` et `CPUSTRING` sont des metadonnees exportees sans flux runtime obligatoire dans le port actuel.
- apps/web: pas d'integration directe attendue pour ces macros; `apps/web` declenche les flux qcommon/client/server qui consomment les constantes de protocole ou de version pertinentes.
- renderer-three: aucune sortie visible attendue; ces macros ne produisent ni modeles, frames, images, particules, beams, dlights, temp entities, areabits, camera ni scene.
- Commentaires: en-tetes existants verifies pour `VERSION`, `BUILDSTRING`, `CPUSTRING`; en-tete ajoute pour `BASEDIRNAME`.
- Tests lances: `npm run verify:qcommon:header`, `npm run typecheck`.

## Prochain lot recommande

- `MSG_WriteDeltaUsercmd` dans `packages/qcommon/src/messages.ts`, puis `MSG_WriteDeltaEntity` dans une session separee si le coordinateur veut garder le delta entity et les constantes `U_*` associees isoles.

## Blocages

- Aucun.
