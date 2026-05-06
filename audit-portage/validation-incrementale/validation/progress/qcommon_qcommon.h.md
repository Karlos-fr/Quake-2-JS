# Progress - Quake-2-master/qcommon/qcommon.h

## Etat courant

- Statut: En cours
- Dernier lot valide: bloc lecture simple `MSG_ReadChar` a `MSG_ReadData`, incluant `MSG_ReadDeltaUsercmd` et `MSG_ReadDir`.
- Matrice: `audit-portage/validation-incrementale/validation/matrices/qcommon_qcommon.h.md`

## Derniere session

- Lot traite: bloc lecture simple dans `packages/qcommon/src/messages.ts`: `MSG_ReadChar`, `MSG_ReadByte`, `MSG_ReadShort`, `MSG_ReadLong`, `MSG_ReadFloat`, `MSG_ReadString`, `MSG_ReadStringLine`, `MSG_ReadCoord`, `MSG_ReadPos`, `MSG_ReadAngle`, `MSG_ReadAngle16`, `MSG_ReadDeltaUsercmd`, `MSG_ReadDir`, `MSG_ReadData`.
- Source comparee: declarations `Quake-2-master/qcommon/qcommon.h` et implementations `Quake-2-master/qcommon/common.c`.
- Cible comparee: `packages/qcommon/src/messages.ts`, avec `MSG_BeginReading` deja valide dans `packages/memory/src/sizebuf.ts`.
- Decision: portage valide. Les lectures conservent les noms originaux, l'ownership `messages.ts` est coherent et aucun doublon proprietaire concurrent n'a ete trouve. Les fonctions preservent les valeurs de depassement `-1`, l'increment de `readcount` meme en depassement, l'endianness little-endian, les conversions signed/unsigned, les limites de chaine 2048, l'arret newline de `MSG_ReadStringLine`, les echelles coord/angle, la copie delta usercmd depuis `from`, et l'extension `MSG_ReadDir` via `bytedirs`. Les ecarts TS restent documentes: retours `vec3_t`/`Uint8Array`/`string` au lieu de pointeurs de sortie C, et exception JS pour l'index dir invalide au lieu de `Com_Error(ERR_DROP)`.
- Runtime: attendu et verifie. Les lectures sont atteignables depuis les flux normaux qcommon/client/server/netchan: `Netchan_Process`, `CL_ParseServerMessage`/`CL_ParseFrame`, `CL_ParsePacketEntities`, `SV_ReadPackets`/`SV_ExecuteClientMessage` et `SV_UserMove`.
- apps/web: attendu et verifie. Le host full-game web declenche les flux client/serveur portes et consomme les messages reseau sans logique parallele remplacant `messages.ts`.
- renderer-three: attendu indirectement pour les lectures qui produisent des sorties visibles: positions, angles camera/refdef, playerstate, entites visibles, modeles, frames, skins, areabits, temp entities, beams, dlights et particules. Verifie via parse client et flux full-game three renderer.
- Commentaires: en-tetes de `MSG_ReadChar`, `MSG_ReadByte`, `MSG_ReadShort`, `MSG_ReadLong`, `MSG_ReadFloat`, `MSG_ReadString`, `MSG_ReadStringLine`, `MSG_ReadCoord`, `MSG_ReadPos`, `MSG_ReadAngle`, `MSG_ReadAngle16`, `MSG_ReadDeltaUsercmd`, `MSG_ReadDir`, `MSG_ReadData` verifies dans `packages/qcommon/src/messages.ts`.
- Tests ajoutes: assertions ciblees dans `scripts/verify/quake2-qcommon-header.ts` pour `MSG_ReadStringLine`, `MSG_ReadData`, depassements de lecture, `MSG_ReadDeltaUsercmd` sans bits modifies et `MSG_ReadDir` invalide.
- Tests lances: `npm run verify:qcommon:header`, `npm run verify:cl-input`, `npm run verify:cl-parse`, `npm run verify:server:user`, `npm run verify:server:main`, `npm run verify:net-chan`, `npm run verify:full-game:server-host`, `npm run verify:full-game:three-renderer`, `npm run typecheck`.

## Session precedente

- Lot traite: `MSG_WriteDeltaUsercmd`, `MSG_WriteDeltaEntity`, constantes `CM_ANGLE1` a `CM_IMPULSE`, et constantes `U_ORIGIN1` a `U_SOLID`.
- Source comparee: declarations `Quake-2-master/qcommon/qcommon.h` et implementations `Quake-2-master/qcommon/common.c`.
- Cible comparee: `packages/qcommon/src/messages.ts`, `packages/qcommon/src/protocol.ts`, constantes `CM_*` exportees par `packages/qcommon/src/qcommon.ts`.
- Decision: portage valide apres correction des constantes `U_*` dans `packages/qcommon/src/protocol.ts`. Les valeurs `U_EFFECTS8`, `U_MOREBITS2`, `U_SKIN8`, `U_FRAME16`, `U_RENDERFX16`, `U_EFFECTS16`, `U_MODEL2`, `U_MODEL3`, `U_MODEL4`, `U_MOREBITS3`, `U_OLDORIGIN`, `U_SKIN16`, `U_SOUND` et `U_SOLID` sont maintenant strictement alignees sur le header C, avec le bit 13 volontairement inutilise. `MSG_WriteDeltaUsercmd` conserve le masque et l'ordre d'ecriture C, y compris `msec` et `lightlevel` toujours emis. `MSG_WriteDeltaEntity` conserve les choix byte/short/long pour number, model indices, frame, skin, effects, renderfx, origin, angles, old_origin, sound, event et solid.
- Runtime: attendu et verifie. `MSG_WriteDeltaUsercmd` est appelee par `CL_SendCmd` et `SV_UserMove` via les flux client/server/netchan. `MSG_WriteDeltaEntity` est appelee par `SV_WriteFrameToClient`, `SV_EmitPacketEntities`, baselines client et server, puis lue par `CL_ParsePacketEntities`/`CL_ParseFrame`.
- apps/web: attendu et verifie. `apps/web/src/full-game-server-host.ts` declenche `SV_WriteFrameToClient`; le host full-game et les snapshots serveur consomment le flux porte sans logique parallele masquant `messages.ts`.
- renderer-three: attendu pour `MSG_WriteDeltaEntity`, car les deltas produisent des sorties visibles: modeles, frames, skins, renderfx, effects, beams, old_origin, sons et positions d'entites. Verifie via parse client, snapshots full-game, refresh entity alias flags et renderer three.
- Commentaires: en-tetes de `MSG_WriteDeltaUsercmd` et `MSG_WriteDeltaEntity` verifies dans `packages/qcommon/src/messages.ts`.
- Tests ajoutes: assertions numeriques `CM_*` et `U_*`, byte layout `MSG_WriteDeltaUsercmd`, headers delta entity normal et complet dans `scripts/verify/quake2-qcommon-header.ts`.
- Tests lances: `npm run verify:qcommon:header`, `npm run verify:cl-input`, `npm run verify:cl-parse`, `npm run verify:server:user`, `npm run verify:server:ents`, `npm run verify:server:send`, `npm run verify:net-chan`, `npm run verify:full-game:server-host`, `npm run verify:full-game:server-snapshots`, `npm run verify:full-game:authoritative-input`, `npm run verify:full-game:three-renderer`, `npm run verify:refresh-entity:alias-flags`.

## Session precedente

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

- Bloc endian et arguments communs: `bigendien`, `BigShort`, `LittleShort`, `BigLong`, `LittleLong`, `BigFloat`, `LittleFloat`, puis `COM_Argc`, `COM_Argv`, `COM_ClearArgv`, `COM_CheckParm`, `COM_AddParm`, `COM_InitArgv` si le lot reste coherent.

## Blocages

- Aucun.
