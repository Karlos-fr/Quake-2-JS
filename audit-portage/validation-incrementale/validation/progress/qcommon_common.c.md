# Progress - Quake-2-master/qcommon/common.c

## Statut

- Statut: En cours
- Dernier lot valide: `CopyString`, `Info_Print`, locaux associes, puis bloc zone memory `Z_MAGIC`/`zhead_s`/`z_chain`, `Z_Free`, `Z_Stats_f`, `Z_FreeTags`, `Z_TagMalloc`, `Z_Malloc` et doublon matriciel `Z_TagMalloc`.
- Prochain lot recommande: `COM_BlockSequenceCheckByte`, table `chktbl`, `COM_BlockSequenceCRCByte` et locaux `n`/`p`/`x`/`chkb`/`crc`, puis `frand`/`crand` si le lot reste coherent.

## Preuves session

- Source C lue: `Quake-2-master/qcommon/common.c`, fonction `MSG_WriteDeltaEntity()`.
- Cible TS lue/corrigee: `packages/qcommon/src/messages.ts`, fonction `MSG_WriteDeltaEntity`.
- Commentaire d'en-tete verifie: `Original name`, `Source`, `Category`, `Fidelity level`, `Behavior` et `Porting notes` presents.
- Runtime: appels verifies depuis `packages/server/src/sv_ents.ts`, `packages/server/src/sv_user.ts` et `packages/client/src/cl_main.ts`; consommation client via `CL_ParsePacketEntities`/`CL_DeltaEntity`.
- apps/web: flux attendu via le serveur local et `CL_ParseServerMessage`, sans logique parallele d'encodage des deltas.
- renderer-three: sorties visibles attendues consommees indirectement via les entites parsees, `ClientRefreshFrame`, `refresh-entity-sync`, `three-beam-sync`, dlights/particles/temp entities selon les champs deltas.

## Tests

- `npm run verify:qcommon:header`: OK
- `npm run verify:cl-parse`: OK
- `npm run verify:full-game:server-snapshots`: OK
- `npm run verify:full-game:render-source`: OK
- `npm run verify:full-game:three-renderer`: OK
- `npm run typecheck`: OK
- `npm run verify:server:ents`: bloque avant execution sur import manquant `packages/formats/src/bsp.js`.

## Session - 2026-05-08 - CopyString, Info_Print et zone memory Z_*

- Lot traite: `CopyString`, son local `out`, `Info_Print`, ses locaux `key`/`value`/`o`/`l`/`o`, puis le bloc zone memory `Z_MAGIC`, `zhead_s`, champs `magic`/`tag`/`size`, `z_chain`, `Z_Free`, `Z_Stats_f`, `Z_FreeTags`, `Z_TagMalloc`, `Z_Malloc` et le doublon matriciel `Z_TagMalloc`.
- Source C relue: `CopyString` alloue via `Z_Malloc(strlen+1)` puis `strcpy`; `Info_Print` ignore un `\` initial, padde les cles a 20 colonnes, imprime `MISSING VALUE` sur valeur absente et conserve les cles longues sans padding; la zone C utilise un `zhead_t` chainee avec `Z_MAGIC`, compte bytes/blocs, libere par reference, par tag, et expose `z_stats`.
- Cible TS relue/corrigee: `CopyString` reste dans `packages/qcommon/src/qcommon.ts` avec source d'en-tete precisee vers `qcommon/common.c` / `qcommon.h`; `Info_Print` reste owner dans `packages/qcommon/src/common.ts`; `Z_Stats_f` a ete ajoute dans `packages/qcommon/src/qcommon.ts` et exporte via `packages/qcommon/src/index.ts`; `Qcommon_Init` peut maintenant enregistrer `z_stats` quand un `CommandRuntime` est fourni.
- Ecarts documentes: `CopyString` retourne une string JS owned-value; `Info_Print` retourne des lignes au lieu d'appeler directement `Com_Printf`; la zone memory remplace le header C et la liste chainee par `zone_allocations: Map<Uint8Array, { tag, size }>` et `Z_Stats_f` compte les payload bytes JS, pas `sizeof(zhead_t)`.
- Ownership/doublons: aucun doublon proprietaire trouve pour `CopyString`, `Info_Print` ou `Z_*`; le doublon matriciel `Z_TagMalloc` couvre la meme fonction; les locaux et champs C de structure/liste sont marques `Non applicable` avec justification de remplacement TS.
- Runtime verifie: `CopyString` reste expose et consomme par les ports qcommon/cvar/cmd selon les besoins de copie; `Info_Print` est appele par `CL_Userinfo_f`, `SV_Serverinfo_f`, `SV_DumpUser_f` et `SV_ShowServerinfo_f`; `Z_*` est atteint via les APIs exportees, `Z_FreeTags` agit sur les allocations taggees, et `z_stats` est branche par `Qcommon_Init(runtime, cmd)` puis executable via `Cmd_ExecuteString`.
- apps/web verifie/corrige: `apps/web/src/full-game.ts` appelle maintenant `Qcommon_Init(qcommon, cmd)` afin que la commande runtime `z_stats` soit disponible dans le flux web; les sorties console/info passent par les hooks `onPrintf`/console existants, sans logique parallele de formatage `Info_Print`.
- renderer-three verifie: aucune sortie visible directe n'est attendue pour `CopyString`, `Info_Print` ou la zone memory; les seules sorties sont console/commandes/debug allocation, et les sorties visibles renderer restent indirectes via les flux client/serveur deja produits par le runtime.
- Tests renforces: `scripts/verify/quake2-qcommon-header.ts` couvre `CopyString`, `Info_Print` valeur vide/chaine vide, metadata zone, `Z_Stats_f`, liberation multi-allocation par tag et commande `z_stats`; `scripts/verify/quake2-full-game-three-renderer.ts` accepte l'initialisation qcommon avec runtime de commandes.
- Tests session OK: `npm run verify:qcommon:header`, `npm run verify:cmd`, `npm run verify:cvar`, `npm run verify:cl-main`, `npm run verify:full-game:render-source`, `npm run verify:full-game:three-renderer`, `npm run typecheck`.
- Test session bloque hors lot: `npm run verify:full-game:server-host` echoue sur `loading should still activate before wait` (`0 !== 1`), sans lien detecte avec le bloc `qcommon/common.c` modifie.

## Session - 2026-05-08 - Bloc arguments COM_* et memsearch

- Lot traite: `MAX_NUM_ARGVS`, globals `com_argc`/`com_argv`, `COM_CheckParm`, son local `i`, `COM_Argc`, `COM_Argv`, `COM_ClearArgv`, `COM_InitArgv`, son local `i`, le doublon matriciel `com_argv`, `COM_AddParm`, `memsearch` et son local `i`.
- Source C relue: `MAX_NUM_ARGVS` vaut 50; `com_argc` et `com_argv[MAX_NUM_ARGVS+1]` portent l'etat argv global; `COM_CheckParm` scanne a partir de `argv[1]`; `COM_Argv` retourne `""` sur index invalide ou slot nul; `COM_ClearArgv` vide un slot valide; `COM_InitArgv` refuse `argc > MAX_NUM_ARGVS` et remplace les args nuls ou trop longs par `""`; `COM_AddParm` append et refuse la capacite pleine; `memsearch` retourne le premier index du byte cherche ou `-1`.
- Cible TS relue/corrigee: `packages/qcommon/src/common.ts` est l'owner unique du bloc; noms originaux conserves. Les en-tetes des fonctions du lot pointent maintenant vers `Quake-2-master/qcommon/common.c`. `MAX_NUM_ARGVS` est exporte pour preuve explicite et `memsearch` est porte strictement en `Uint8Array` avec scan borne par `count`.
- Ecarts documentes: l'etat global C est stocke dans `CommonRuntime`; les erreurs fatales deviennent des exceptions JS; `COM_AddParm` corrige le texte d'erreur typo du C; `memsearch` masque `search` en byte et borne le scan a la longueur du tableau pour eviter un acces hors buffer JS.
- Ownership/doublons: aucun doublon proprietaire `COM_*` trouve; les consommateurs passent par `packages/qcommon/src/common.ts` et `cmd.ts`. Les entrees `i` sont des variables locales generees et marquees `Non applicable`; le doublon `com_argv` matriciel est couvert par le meme etat runtime.
- Runtime verifie: `createQcommonRuntime` appelle `COM_InitArgv`; `Cbuf_AddEarlyCommands` consomme `COM_Argc`/`COM_Argv`/`COM_ClearArgv` pour les triplets `+set`; `Cbuf_AddLateCommands` consomme `COM_Argc`/`COM_Argv` pour les commandes tardives. `COM_AddParm` et `COM_CheckParm` sont exposes comme helpers portes, mais aucun flux runtime actuel ne les appelle directement.
- apps/web verifie: le full-game web passe par `Qcommon_Init` et les commandes runtime/console, sans injection argv navigateur ni logique parallele qui remplace `COM_*`; aucune integration launch-argv web n'est attendue pour ce lot tant qu'aucune configuration de lancement web n'existe.
- renderer-three verifie: aucune sortie visible directe attendue; ce lot gere uniquement argv/bootstrap/debug scan. Les sorties visibles renderer restent produites par les flux client/serveur apres execution des commandes, pas par ces helpers directement.
- Tests renforces: `scripts/verify/quake2-qcommon-header.ts` couvre maintenant `COM_CheckParm` qui ignore `argv[0]`, `COM_ClearArgv` sur index valide, la constante `MAX_NUM_ARGVS`, les limites d'overflow basees sur cette constante et `memsearch` trouve/absent/masque byte.
- Tests session OK: `npm run verify:qcommon:header`, `npm run verify:cmd`, `npm run verify:full-game:server-host`, `npm run verify:full-game:three-renderer`.
- Test session bloque hors lot: `npm run typecheck` echoue dans `apps/web/src/full-game.ts` sur `onAddToServerList: (address, info)` avec deux `noImplicitAny`; ce fichier avait des modifications preexistantes hors mission et n'a pas ete modifie dans ce lot.

## Session - 2026-05-08 - Bloc sizebuf SZ_*

- Lot traite: `SZ_Init`, `SZ_Clear`, `SZ_GetSpace`, `SZ_Write`, `SZ_Print`, le doublon genere de `SZ_Write`, le local `len` de `SZ_Print` et les deux appels libc `memcpy` generes comme faux positifs.
- Source C/H relue: `qcommon.h` definit `sizebuf_t` (`allowoverflow`, `overflowed`, `data`, `maxsize`, `cursize`, `readcount`) et les prototypes `SZ_*`; `common.c` initialise par `memset`, conserve le backing buffer dans `SZ_Clear`, gere les overflows fatals/autorises dans `SZ_GetSpace`, copie les octets dans `SZ_Write` et concatene une chaine NUL-terminee dans `SZ_Print` en reutilisant un NUL terminal existant.
- Cible TS relue/corrigee: `packages/memory/src/sizebuf.ts` est l'owner unique du bloc; noms originaux conserves; commentaires d'en-tete verifies et precises vers `Quake-2-master/qcommon/common.c` ou `Quake-2-master/qcommon/qcommon.h`. Les ecarts documentes restent volontaires: `Uint8Array` remplace les pointeurs bruts, les erreurs JS remplacent `Com_Error`, `SZ_Write` prend la longueur depuis la source byte-array, et `SZ_Print` encode les strings JS en octets.
- Ownership/doublons: aucun autre port proprietaire `SZ_*` trouve; le `SZ_Write` duplique dans la matrice est couvert par la meme fonction TS; `len` est local a `SZ_Print`; `memcpy` est un appel libc non proprietaire remplace par `Uint8Array.set`.
- Runtime verifie: les primitives sont atteignables depuis les flux normaux `Qcommon_Frame`/client/serveur via `Netchan_Setup`, `Netchan_Transmit`, `Netchan_Process`, `CL_SendCmd`, `SV_WriteFrameToClient`, multicast/datagram server et commandes console; les buffers `allowoverflow`/`overflowed` sont consommes notamment par netchan et `SV_SendClientMessages`.
- apps/web verifie: `apps/web/src/full-game-server-host.ts` utilise `SZ_Write`, `SZ_Clear` et `MSG_BeginReading` pour transporter les datagrammes serveur vers `client.net_message`; le web declenche le runtime porte et ne remplace pas ces operations par une logique parallele.
- renderer-three verifie: pas d'appel direct attendu depuis `renderer-three`; les sorties visibles attendues passent indirectement par les messages ecrits/lus avec `SZ_*` (frames, areabits, entites, temp entities, camera/scene) puis sont consommees par les tests full-game renderer.
- Tests renforces: `scripts/verify/quake2-qcommon-header.ts` verifie maintenant que `SZ_Clear` preserve `allowoverflow` et `readcount`, et que `SZ_Print` gere la chaine vide et la reutilisation du NUL terminal.
- Tests session OK: `npm run verify:qcommon:header`, `npm run verify:net-chan`, `npm run verify:server:send`, `npm run verify:full-game:server-host`, `npm run verify:full-game:three-renderer`, `npm run typecheck`.

## Session - 2026-05-07 - Delta usercmd et MSG_ReadData

- Lot traite: `MSG_ReadDeltaUsercmd`, son local `bits`, `MSG_ReadData`, son local `i`, puis extension coherente a `MSG_WriteDeltaUsercmd` et son local `bits`.
- Source C relue: `MSG_WriteDeltaUsercmd` calcule les bits `CM_*`, ecrit les champs modifies dans l'ordre C puis ecrit toujours `msec` et `lightlevel`; `MSG_ReadDeltaUsercmd` copie `from` vers `move`, lit les memes bits/champs puis lit toujours `msec` et `lightlevel`; `MSG_ReadData` boucle sur `len` appels a `MSG_ReadByte`.
- Cible TS relue: `packages/qcommon/src/messages.ts` porte les trois fonctions avec en-tetes complets (`Original name`, `Source`, `Category`, `Fidelity level`, `Behavior`, `Porting notes`). Les deviations TS sont documentees: `MSG_ReadDeltaUsercmd` retourne une copie au lieu de muter un out pointer; `MSG_ReadData` retourne un `Uint8Array`.
- Ownership/doublons: ownership confirme dans `packages/qcommon/src/messages.ts`; aucun doublon proprietaire trouve. Les constantes `CM_*` viennent du header/protocol partage et sont deja verifiees par valeurs C dans `verify:qcommon:header`.
- Runtime verifie: ecriture atteignable depuis `CL_SendCmd` dans `packages/client/src/cl_input.ts`; lecture atteignable depuis `SV_ExecuteClientMessage` dans `packages/server/src/sv_user.ts`, replay des trois commandes `clc_move`, checksum, `ClientThink` et prediction/commandes client.
- apps/web verifie: le flux authoritative input passe par `apps/web/src/full-game-server-host.ts` et les tests full-game, sans logique web parallele qui remplace l'encodage/decodage usercmd porte.
- renderer-three verifie: pas d'appel direct attendu; les usercmds modifient camera/playerstate/deplacement entites via serveur/client, puis les sorties visibles sont consommees par le renderer via render-source/Three.
- Tests session OK: `npm run verify:qcommon:header`, `npm run verify:cl-input`, `npm run verify:server:user`, `npm run verify:full-game:authoritative-input`, `npm run verify:full-game:server-host`, `npm run verify:full-game:three-renderer`, `npm run verify:cl-parse`.

## Decisions

- Correction appliquee: ajout du rejet TypeScript pour `to.number >= MAX_EDICTS`, equivalent au `Com_Error(ERR_FATAL, "Entity number >= MAX_EDICTS")` original.
- Tests renforces: encodage complet des champs entity delta, skip sans `force`, ecriture forcee et garde-fou `MAX_EDICTS`.

## Session - 2026-05-07 - Primitives MSG_Read*

- Lot traite: `MSG_BeginReading`, `MSG_ReadChar`, `MSG_ReadByte`, `MSG_ReadShort`, `MSG_ReadLong`, `MSG_ReadFloat`, `MSG_ReadString`, `MSG_ReadStringLine`, `MSG_ReadCoord`, `MSG_ReadPos`, `MSG_ReadAngle`, `MSG_ReadAngle16`; locaux generes `c`, union `b`/`f`/`l`, buffers statiques `string`, et appel externe `SHORT2ANGLE`.
- Source C relue: `MSG_BeginReading` remet `readcount` a zero; les lectures scalaires retournent `-1` en depassement tout en incrementant `readcount`; les shorts/longs/floats sont little-endian; `MSG_ReadString` et `MSG_ReadStringLine` bornent a 2047 caracteres et s'arretent sur EOF/null, plus newline pour `StringLine`; coord/pos/angle appliquent les facteurs C.
- Cible TS relue: `packages/memory/src/sizebuf.ts` porte `MSG_BeginReading`; `packages/qcommon/src/messages.ts` porte les primitives de lecture avec commentaires d'en-tete complets (`Original name`, `Source`, `Category`, `Fidelity level`, `Behavior`, `Porting notes`). Les deviations TS sont justifiees: `MSG_ReadPos` retourne un tuple au lieu d'un out pointer, `MSG_ReadString*` retournent une string JS, `MSG_ReadFloat` utilise `DataView`.
- Ownership/doublons: aucune fonction proprietaire du lot n'est dupliquee ailleurs; `SHORT2ANGLE` est un helper externe de `q_shared.h` et n'a pas ete traite comme entite proprietaire de `common.c`.
- Runtime verifie: primitives atteignables depuis `Netchan_Process`, `CL_ParseServerMessage`, `SV_ReadPackets`/`SV_ConnectionlessPacket`, `SV_ExecuteClientMessage`, parsing client des frames/playerstate/packetentities/temp entities/layout/configstrings, et `Qcommon_Frame` via les flux client/serveur.
- apps/web verifie: `apps/web/src/full-game-server-host.ts` appelle le runtime porte, copie le message serveur vers `client.net_message`, lance `MSG_BeginReading` puis `CL_ParseServerMessage`; aucune logique web parallele ne remplace les lectures message.
- renderer-three verifie: les primitives ne parlent pas directement au renderer, mais alimentent les sorties visibles attendues via parsing client: entites, modeles, frames, beams, dlights, particules/temp entities, `areabits`, playerstate/camera et scene, consommes par `ClientRefreshFrame` et les adapters `renderer-three`.
- Tests renforces: ajout d'une assertion explicite `MSG_BeginReading` dans `scripts/verify/quake2-qcommon-header.ts`.
- Tests session OK: `npm run verify:qcommon:header`, `npm run verify:cl-parse`, `npm run verify:server:runtime`, `npm run verify:full-game:server-host`, `npm run verify:full-game:render-source`, `npm run verify:full-game:three-renderer`, `npm run verify:web-render-order`, `npm run typecheck`.

## Complement session - 2026-05-02

- Lot limite a `MSG_WriteDeltaEntity()` uniquement; aucun temporaire local, `MSG_WriteByte` ou autre entite de `qcommon/common.c` traite.
- Source C relue: garde `number`, calcul des bits delta, `U_OLDORIGIN` pour nouvelle entite ou `RF_BEAM`, cascade `U_MOREBITS*`, ordre d'ecriture des champs reseau.
- Cible TS relue: commentaire d'en-tete complet, ownership `packages/qcommon/src/messages.ts`, garde `MAX_EDICTS`, branches et ordre d'ecriture equivalents au C.
- Runtime verifie: appelee par `SV_EmitPacketEntities`, baselines client et demo serveur; consommee par `CL_ParseServerMessage` -> `CL_ParsePacketEntities` -> `CL_DeltaEntity`.
- apps/web verifie: flux attendu via `full-game-server-host.ts` (`SV_WriteFrameToClient` puis `CL_ParseServerMessage`) et render loop, sans encodeur delta parallele.
- renderer-three verifie: les deltas alimentent `ClientRefreshFrame`; les sorties visibles attendues sont consommees via `refresh-entity-sync`, `three-beam-sync`, `three-dlight-sync`, particules, areabits/camera/scene selon les champs.
- Tests session OK: `npm run verify:qcommon:header`, `npm run verify:cl-parse`, `npm run verify:full-game:server-snapshots`, `npm run verify:full-game:render-source`, `npm run verify:full-game:three-renderer`, `npm run verify:web-render-order`, `npm run typecheck`.

## Revalidation session - 2026-05-02

- Lot traite: `MSG_WriteDeltaEntity()` uniquement. `bits`, `MSG_WriteByte` et les autres entites de `qcommon/common.c` n'ont pas ete traitees.
- Matrice relue: la ligne `MSG_WriteDeltaEntity` reste `Valide`; aucune modification de matrice necessaire, notes laissees vides.
- Source C relue: rejets `!to->number` et `to->number >= MAX_EDICTS`, flags delta pour origin/angles/skin/frame/effects/renderfx/solid/event/model/sound, `U_OLDORIGIN` sur nouvelle entite ou `RF_BEAM`, cascade `U_MOREBITS*`, puis ordre d'ecriture des champs reseau.
- Cible TS relue: `packages/qcommon/src/messages.ts` conserve l'ownership attendu, l'en-tete `Original name`/`Source`/`Category`/`Fidelity level`/`Behavior`/`Porting notes`, les deux gardes d'erreur et l'ordre d'encodage equivalent.
- Runtime verifie: flux serveur `SV_EmitPacketEntities`/`SV_WriteFrameToClient` et baselines, puis consommation client `CL_ParseServerMessage` -> `CL_ParseFrame` -> `CL_ParsePacketEntities` -> `CL_DeltaEntity`/`CL_ParseDelta`.
- apps/web verifie: `full-game-server-host.ts` declenche le flux porte via `SV_WriteFrameToClient`, copie le message dans `client.net_message`, appelle `CL_ParseServerMessage`, et ne remplace pas l'encodeur delta par une logique parallele.
- renderer-three verifie: les consequences visibles des deltas alimentent `CL_BuildRefreshFrame` (`entities`, modeles, frames, skins, effets, renderfx, lights, particules, beams, areabits et camera/scene), puis les adapters `refresh-entity-sync`, `three-beam-sync`, `three-dlight-sync`, `particle-sync` et `gl-world-scene-adapter`.
- Tests session OK: `npm run verify:qcommon:header`, `npm run verify:cl-parse`, `npm run verify:full-game:server-snapshots`, `npm run verify:full-game:render-source`, `npm run verify:full-game:three-renderer`, `npm run verify:web-render-order`, `npm run typecheck`.
- `AVANCEMENT_GLOBAL.md`: non modifie; la ligne `qcommon/common.c` reste coherente pour une revalidation sans nouveau statut.

## Revalidation session - 2026-05-03

- Lot traite: `MSG_WriteDeltaEntity()` uniquement. Les temporaires locaux et autres entites de `qcommon/common.c` n'ont pas ete traites.
- Matrice mise a jour: ligne `MSG_WriteDeltaEntity` passee de `Valide` a `Non conforme`.
- Source C/H relue: `common.c` calcule les flags delta puis encode les octets `U_MOREBITS*`; `qcommon.h` definit `U_EFFECTS8 = 1<<14`, `U_MOREBITS2 = 1<<15`, `U_SKIN8 = 1<<16`, `U_OLDORIGIN = 1<<24`, `U_SKIN16 = 1<<25`, `U_SOUND = 1<<26`, `U_SOLID = 1<<27`.
- Cible TS relue: `packages/qcommon/src/messages.ts` conserve l'ownership et l'en-tete requis, mais depend de `packages/qcommon/src/protocol.ts`, ou les masques `U_EFFECTS8` a `U_SOLID` sont decales d'un bit vers le bas par rapport au C.
- Preuve de non-conformite: harnais inline `npx tsx -` sur un delta `MSG_WriteDeltaEntity` representatif; bits emis TS `0x2c0d9b1`, bits attendus d'apres `qcommon.h` `0x58199b1`.
- Runtime: la fonction est bien atteignable depuis `SV_EmitPacketEntities`, baselines client et demo serveur; consommation client via `CL_ParseServerMessage` -> `CL_ParseFrame` -> `CL_ParsePacketEntities` -> `CL_DeltaEntity`. Le branchement existe, mais il transporte un protocole TS non strict tant que `protocol.ts` reste decale.
- apps/web: le flux attendu est branche via `full-game-server-host.ts` (`SV_WriteFrameToClient` puis `CL_ParseServerMessage`) et ne remplace pas l'encodeur delta par une logique parallele. Impact ouvert: le navigateur consomme le meme protocole TS non strict.
- renderer-three: les sorties visibles attendues (entites, modeles, frames, skins, renderfx, beams, dlights, particules, areabits et camera/scene via `ClientRefreshFrame`) sont consommees par les adapters renderer; impact ouvert uniquement si compatibilite binaire C attendue en entree ou sortie.
- Tests session OK mais insuffisants pour la stricte parite C: `npm run verify:qcommon:header`, `npm run verify:cl-parse`. Ces tests comparent les bits attendus avec les constantes TS et ne detectent pas le decalage vs `qcommon.h`.
- Correction non appliquee dans cette mission: modifier `packages/qcommon/src/protocol.ts` releve de la matrice `qcommon_qcommon.h.md`, pas du port proprietaire `packages/qcommon/src/messages.ts` autorise ici.
- Prochain lot recommande: corriger/valider les masques `U_*` dans `Quake-2-master/qcommon/qcommon.h` / `packages/qcommon/src/protocol.ts`, ajuster les tests avec valeurs numeriques C, puis revalider `MSG_WriteDeltaEntity()`.
- `AVANCEMENT_GLOBAL.md`: non modifie; le coordinateur doit mettre la ligne `qcommon/common.c` en `A revoir` ou `Partiel/Non conforme` selon sa politique globale.

## Revalidation session - 2026-05-07

- Lot traite: conflit d'ownership `U_*`/`qcommon.h` signale et limite aux corrections/tests necessaires pour `qcommon/common.c`; revalidation de `MSG_WriteDeltaEntity()` et de son local genere `bits`.
- Source C/H relue: `common.c` calcule les flags delta et encode les octets `U_MOREBITS*`; `qcommon.h` definit les masques C stricts, notamment `U_EFFECTS8 = 0x00004000`, `U_MOREBITS2 = 0x00008000`, `U_SKIN8 = 0x00010000`, `U_OLDORIGIN = 0x01000000`, `U_SKIN16 = 0x02000000`, `U_SOUND = 0x04000000`, `U_SOLID = 0x08000000`.
- Cible TS relue: `packages/qcommon/src/protocol.ts` expose maintenant les valeurs C strictes; `packages/qcommon/src/messages.ts` conserve l'ownership attendu pour `MSG_WriteDeltaEntity`, le commentaire d'en-tete requis, les gardes `!number`/`MAX_EDICTS`, les branches de flags et l'ordre d'ecriture C.
- Tests renforces: `scripts/verify/quake2-qcommon-header.ts` compare les `U_*` a des valeurs numeriques C independantes et verifie les en-tetes delta `0x058199b1` et `0x0fffdeaf`; `scripts/verify/quake2-cl-parse.ts` ecrit le test packetentities avec `U_MOREBITS1` + second octet, conforme au protocole C.
- Runtime verifie: `MSG_WriteDeltaEntity` est appelee depuis `SV_EmitPacketEntities`, baselines serveur/client et messages demo; la consommation client passe par `CL_ParseServerMessage` -> `CL_ParseFrame` -> `CL_ParsePacketEntities` -> `CL_DeltaEntity`/`CL_ParseDelta`.
- apps/web verifie: `full-game-server-host.ts` declenche `SV_WriteFrameToClient`, recopie le message dans `client.net_message` et appelle le parsing client porte sans encodeur delta parallele.
- renderer-three verifie: les sorties visibles attendues des deltas (entites, modeles, frames, skins, renderfx, beams, dlights, particules, areabits, camera/scene) alimentent `ClientRefreshFrame` puis les adapters renderer.
- Tests session OK: `npm run verify:qcommon:header`, `npm run verify:cl-parse`, `npm run verify:server:ents`, `npm run verify:full-game:server-host`, `npm run verify:full-game:server-snapshots`, `npm run verify:full-game:render-source`, `npm run verify:full-game:three-renderer`, `npm run verify:web-render-order`, `npm run typecheck`.
- Matrice mise a jour: `MSG_WriteDeltaEntity` passe `Valide`; le `bits` local associe passe `Non applicable`.
