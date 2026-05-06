# Progress - Quake-2-master/qcommon/qcommon.h

## Etat courant

- Statut: En cours
- Dernier lot valide: bloc cvar header dans `packages/qcommon/src/cvar.ts`: `cvar_vars`, `Cvar_Get`, `Cvar_Set`, `Cvar_ForceSet`, `Cvar_FullSet`, `Cvar_SetValue`, `Cvar_VariableValue`, `Cvar_VariableString`, `Cvar_CompleteVariable`, `Cvar_GetLatchedVars`, `Cvar_Command`, `Cvar_WriteVariables`, `Cvar_Init`, `Cvar_Userinfo`, `Cvar_Serverinfo`, plus le global adjacent `userinfo_modified`.
- Matrice: `audit-portage/validation-incrementale/validation/matrices/qcommon_qcommon.h.md`

## Derniere session

- Lot traite: bloc cvar header dans `packages/qcommon/src/cvar.ts`: `cvar_vars`, `Cvar_Get`, `Cvar_Set`, `Cvar_ForceSet`, `Cvar_FullSet`, `Cvar_SetValue`, `Cvar_VariableValue`, `Cvar_VariableString`, `Cvar_CompleteVariable`, `Cvar_GetLatchedVars`, `Cvar_Command`, `Cvar_WriteVariables`, `Cvar_Init`, `Cvar_Userinfo`, `Cvar_Serverinfo`, et `userinfo_modified`.
- Source comparee: declarations `Quake-2-master/qcommon/qcommon.h`, implementations `Quake-2-master/qcommon/cvar.c`.
- Cible comparee: `packages/qcommon/src/cvar.ts`, exports publics `packages/qcommon/src/index.ts`, usages client/server/web, harnais `scripts/verify/quake2-cvar.ts` et `scripts/verify/quake2-qcommon-header.ts`.
- Decision: portage valide pour 16 entrees de matrice. Le global C `cvar_vars` et `userinfo_modified` sont portes comme etat explicite de `CvarRuntime`. Les fonctions conservent creation en tete de liste, OR des flags sur variable existante, validation info name/value, restrictions `NOSET`, latch selon etat serveur, `ForceSet`, formatage `SetValue`, completion exacte puis prefixe, serialisation archive, commandes `set`/`cvarlist`, et info strings user/server. Les ecarts TS sont documentes: runtime explicite, hooks pour `Com_Printf`/gamedir/autoexec, `Cvar_Command` retourne un resultat structure au lieu d'imprimer directement, `Cvar_WriteVariables` retourne le texte au lieu d'ecrire dans un fichier.
- Runtime: attendu et verifie. Ce bloc est atteignable depuis `Qcommon_Init`/`Cvar_Init`, les commandes console via `Cmd_ExecuteString`/fallback `Cvar_Command`, les flux client/server (`CL_Frame`, `SV_Frame`, `SV_InitGame`, `SV_SpawnServer`, game import cvar/cvar_set/cvar_forceset), userinfo/serverinfo et ecriture config/archive.
- apps/web: attendu et verifie. `apps/web` declenche ces flux via les hosts full-game/server-host et les tests config/gamedir; aucune logique parallele ne remplace `cvar.ts`.
- renderer-three: pas de consommation directe attendue pour les primitives cvar elles-memes; elles ne produisent pas directement modeles, frames, images, particules, beams, dlights, temp entities, areabits, camera ou scene. Elles configurent indirectement serveur/client/renderer, et le flux full-game three-renderer a ete verifie.
- Commentaires: en-tetes des fonctions portees du lot verifies dans `packages/qcommon/src/cvar.ts`; commentaires de fichier documentent les deviations runtime-state/hooks.
- Tests ajoutes: assertions directes dans `scripts/verify/quake2-qcommon-header.ts` pour `cvar_vars`, `userinfo_modified`, `Cvar_Get`, `Cvar_Set`, `Cvar_ForceSet`, `Cvar_FullSet`, `Cvar_SetValue`, `Cvar_VariableValue`, `Cvar_VariableString`, `Cvar_CompleteVariable`, `Cvar_GetLatchedVars`, `Cvar_Command`, `Cvar_WriteVariables`, `Cvar_Init`, `Cvar_Userinfo`, `Cvar_Serverinfo`.
- Tests lances: `npm run verify:qcommon:header`, `npm run verify:cvar`.

## Session precedente

- Lot traite: bloc commandes header dans `packages/qcommon/src/cmd.ts`: `EXEC_NOW`, `EXEC_INSERT`, `EXEC_APPEND` (premier bloc commande et doublon genere plus bas dans le header), `Cbuf_Init`, `Cbuf_AddText`, `Cbuf_InsertText`, `Cbuf_ExecuteText`, `Cbuf_AddEarlyCommands`, `Cbuf_AddLateCommands`, `Cbuf_Execute`, `Cbuf_CopyToDefer`, `Cbuf_InsertFromDefer`, `Cmd_Init`, `Cmd_AddCommand`, `Cmd_RemoveCommand`, `Cmd_Exists`, `Cmd_CompleteCommand`, `Cmd_Argc`, `Cmd_Argv`, `Cmd_Args`, `Cmd_TokenizeString`, `Cmd_ExecuteString`, `Cmd_ForwardToServer`.
- Source comparee: declarations `Quake-2-master/qcommon/qcommon.h`, implementations `Quake-2-master/qcommon/cmd.c`.
- Cible comparee: `packages/qcommon/src/cmd.ts`, exports publics `packages/qcommon/src/index.ts`, usages client/server/web, harnais `scripts/verify/quake2-cmd.ts` et `scripts/verify/quake2-qcommon-header.ts`.
- Decision: portage valide pour 26 entrees de matrice. Les constantes `EXEC_*` conservent les valeurs C 0/1/2. Les fonctions `Cbuf_*` conservent l'initialisation 8192 octets, append/insert, overflow imprime et ignore, execution immediate/insert/append, split quote-aware, pause `wait`, commandes early/late `+set`/`+command`, et defer/restore. Les fonctions `Cmd_*` conservent registry, suppression, completion commandes puis aliases, `argc`/`argv`/`args`, tokenisation avec macro expansion, execution commande/alias/fallback et forwarding serveur. Les etats C file-static sont portes dans `CommandRuntime`; les prints, cvars, chargement de fichiers et forwarding serveur passent par hooks explicites.
- Runtime: attendu et verifie. Ce bloc est atteignable depuis l'initialisation `Qcommon_Init`/`Cmd_Init`, les commandes console/client, `CL_Frame`, `SV_Frame`, les forwards vers serveur et les scripts/configs via `exec`.
- apps/web: attendu et verifie. `apps/web` declenche ces flux via le host full-game et les commandes config/gamedir/writeconfig, sans logique parallele remplacant `cmd.ts`.
- renderer-three: pas de consommation directe attendue pour les primitives de commande elles-memes; elles ne produisent pas directement modeles, frames, images, particules, beams, dlights, temp entities, areabits, camera ou scene. Elles peuvent declencher indirectement des commandes renderer/client, et le flux full-game three-renderer a ete verifie.
- Commentaires: en-tetes des fonctions portees du lot verifies dans `packages/qcommon/src/cmd.ts`; commentaires de fichier indiquent les deviations runtime-state/hooks.
- Tests ajoutes: assertions directes dans `scripts/verify/quake2-qcommon-header.ts` pour `EXEC_*`, `Cbuf_Init`, `Cbuf_AddText`, `Cbuf_InsertText`, `Cbuf_ExecuteText`, `Cbuf_Execute`, `Cbuf_CopyToDefer`, `Cbuf_InsertFromDefer`, `Cmd_Init`, `Cmd_AddCommand`, `Cmd_RemoveCommand`, `Cmd_Exists`, `Cmd_CompleteCommand`, `Cmd_Argc`, `Cmd_Argv`, `Cmd_Args`, `Cmd_ExecuteString`.
- Tests lances: `npm run verify:qcommon:header`, `npm run verify:cmd`, `npm run verify:cl-main`, `npm run verify:full-game:server-host`, `npm run verify:full-game:three-renderer`, `npm run verify:web-config-storage`, `npm run verify:web-config-gamedir`, `npm run typecheck`.

## Session precedente

- Lot traite: bloc utilitaires/protocole dans `packages/qcommon/src/qcommon.ts`, `packages/qcommon/src/common.ts` et `packages/qcommon/src/protocol.ts`: `COM_Init`, `CopyString`, `Info_Print`, `CRC_Init`, `CRC_ProcessByte`, `CRC_Value`, `CRC_Block`, `PROTOCOL_VERSION`, `PORT_MASTER`, `PORT_CLIENT`, `PORT_SERVER`, `UPDATE_BACKUP`, `UPDATE_MASK`, `svc_ops_e`, `clc_ops_e`, `PS_M_TYPE`, `PS_M_ORIGIN`, `PS_M_VELOCITY`, `PS_M_TIME`, `PS_M_FLAGS`, `PS_M_GRAVITY`, `PS_M_DELTA_ANGLES`, `PS_VIEWOFFSET`, `PS_VIEWANGLES`, `PS_KICKANGLES`, `PS_BLEND`, `PS_FOV`, `PS_WEAPONINDEX`, `PS_WEAPONFRAME`, `PS_RDFLAGS`, `SND_VOLUME`, `SND_ATTENUATION`, `SND_POS`, `SND_ENT`, `SND_OFFSET`, `DEFAULT_SOUND_PACKET_VOLUME`, `DEFAULT_SOUND_PACKET_ATTENUATION`.
- Source comparee: declarations `Quake-2-master/qcommon/qcommon.h`, implementations `Quake-2-master/qcommon/common.c` pour `CopyString`/`Info_Print`, implementations `Quake-2-master/qcommon/crc.c` et `crc.h` pour CRC, et constantes/enums protocole du header.
- Cible comparee: `packages/qcommon/src/qcommon.ts`, `packages/qcommon/src/common.ts`, `packages/qcommon/src/protocol.ts`, exports publics `packages/qcommon/src/index.ts`, harnais `scripts/verify/quake2-qcommon-header.ts`, plus usages client/server/web.
- Decision: portage valide pour 36 entrees et `COM_Init` marque `Non applicable`. `COM_Init` est seulement un prototype dans `qcommon.h`, sans definition C ni appel source; le flux d'initialisation reel est `Qcommon_Init`. `CopyString` conserve le contenu exact sous forme de chaine possedee JS. `Info_Print` conserve le decoupage info string, l'alignement a 20 caracteres, les cles longues et le cas `MISSING VALUE`, en retournant des lignes au lieu d'appeler `Com_Printf`. CRC conserve la table, la seed `0xffff`, le process byte et le final xor. Les ports, protocol version, update mask, opcodes `svc`/`clc`, flags playerstate et flags son sont strictement alignes sur les valeurs C.
- Runtime: attendu et verifie. Les constantes protocole sont atteignables depuis les racines client/server/netchan (`CL_Frame`, `SV_Frame`, parse serveur/client, snapshots). `Info_Print` est appele par les commandes client/serveur d'affichage userinfo/serverinfo. CRC est utilise par le checksum de sequence qcommon et expose par les tests CRC dedies. `CopyString` est une primitive commune sans sortie visible propre.
- apps/web: attendu pour `PROTOCOL_VERSION` et les flux full-game serveur/client; verifie via `full-game-server-host` et `full-game-three-renderer`. Pas de logique web parallele remplacant le protocole `qcommon`.
- renderer-three: attendu indirectement pour `PS_*`, `svc_ops_e`, `SND_*` et `UPDATE_*`, car les messages serveur/client alimentent camera/refdef, entites visibles, frames, sons, temp entities, dlights/particules et snapshots consommes ensuite par le renderer. Verifie via parse client et full-game three renderer. `CopyString`, `Info_Print`, ports et CRC ne produisent pas directement de modeles, frames, images, particules, beams, dlights, temp entities, areabits, camera ou scene.
- Commentaires: en-tetes de `CopyString`, `Info_Print`, `CRC_Init`, `CRC_ProcessByte`, `CRC_Value`, `CRC_Block` verifies; commentaires de groupe ajoutes pour `PORT_*`, `PROTOCOL_VERSION`/`UPDATE_*`, `svc_ops_e`, `clc_ops_e`, `PS_*` et `SND_*`.
- Tests ajoutes: assertions ciblees dans `scripts/verify/quake2-qcommon-header.ts` pour tous les opcodes `svc_ops_e`/`clc_ops_e`, tous les flags `PS_*`, tous les flags/defaults `SND_*`, cas CRC init/process/partial/empty, `CopyString` vide/contenu multi-ligne et `Info_Print` normal/missing/cle longue.
- Tests lances: `npm run verify:qcommon:header`, `npm run verify:crc`, `npm run verify:crc:header`, `npm run verify:server:ents`, `npm run verify:cl-parse`, `npm run verify:cl-main`, `npm run verify:server:send`, `npm run verify:server:user`, `npm run verify:audio:phase11`, `npm run verify:full-game:server-host`, `npm run verify:full-game:three-renderer`, `npm run typecheck`.

## Session precedente

- Lot traite: bloc endian et arguments communs dans `packages/qcommon/src/common.ts`: `bigendien`, `BigShort`, `LittleShort`, `BigLong`, `LittleLong`, `BigFloat`, `LittleFloat`, `COM_Argc`, `COM_Argv`, `COM_ClearArgv`, `COM_CheckParm`, `COM_AddParm`, `COM_InitArgv`.
- Source comparee: declarations `Quake-2-master/qcommon/qcommon.h`, implementations argv `Quake-2-master/qcommon/common.c`, implementations endian `Quake-2-master/game/q_shared.c` reutilisees par `qcommon/common.c` via `Swap_Init`.
- Cible comparee: `packages/qcommon/src/common.ts`, export public `packages/qcommon/src/index.ts`, harnais `scripts/verify/quake2-qcommon-header.ts`.
- Decision: portage valide apres correction de l'ownership de `bigendien` vers `common.ts`. Les fonctions endian conservent les noms originaux et le comportement de dispatch selon endianess hote; `Swap_Init()` renvoie le meme etat `bigendien`. Les fonctions argv conservent l'etat explicite `com_argc`/`com_argv`, la recherche a partir de argv[1], les fallbacks chaine vide, les no-op hors bornes, la limite `MAX_NUM_ARGVS` et le nettoyage des args vides ou trop longs; les erreurs fatales C sont des exceptions JS documentees en fidelity `Close`.
- Runtime: attendu et verifie. Les endian helpers sont utilises par les chemins de chargement/lecture binaire qcommon et renderer via helpers little-endian equivalents; les argv communs sont atteignables par le flux commandes `Cbuf_AddEarlyCommands`/`Cbuf_AddLateCommands` depuis le bootstrap full-game.
- apps/web: attendu pour les arguments de lancement/commandes full-game; verifie via host server web, sans logique parallele remplacant `common.ts`.
- renderer-three: aucune consommation directe attendue pour argv; consommation visible indirecte attendue pour endian/little-endian lors du chargement des modeles, frames, images, areabits et scene BSP/alias. Le renderer utilise les helpers binaires little-endian de `packages/memory`; le flux three-renderer a ete verifie et ne masque pas un manque de ces entites `common.ts`.
- Commentaires: en-tetes de `COM_InitArgv`, `COM_Argc`, `COM_Argv`, `COM_ClearArgv`, `COM_AddParm`, `COM_CheckParm`, `BigShort`, `LittleShort`, `BigLong`, `LittleLong`, `BigFloat`, `LittleFloat`, `Swap_Init` verifies; en-tete `bigendien` ajoute.
- Tests ajoutes: assertions ciblees dans `scripts/verify/quake2-qcommon-header.ts` pour `bigendien`/`Swap_Init`, conversions endian short/long/float, `COM_Argc`, `COM_Argv`, `COM_ClearArgv`, `COM_CheckParm`, `COM_AddParm`, sanitisation `COM_InitArgv` et limites `MAX_NUM_ARGVS`.
- Tests lances: `npm run verify:qcommon:header`, `npm run verify:cmd`, `npm run verify:full-game:server-host`, `npm run verify:full-game:three-renderer`, `npm run typecheck`.

## Session precedente

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

- Bloc net/qcommon header dans `packages/qcommon/src/qcommon.ts`: `PORT_ANY`, `MAX_MSGLEN`, `PACKET_HEADER`, `netadrtype_t`, `netsrc_t`, `netadr_t`, puis `NET_*` si le lot reste coherent.

## Blocages

- Aucun.
