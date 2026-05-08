# Progress - Quake-2-master/client/cl_parse.c

## Dernier lot valide

Reliquat final `CL_ParseDownload` : adapter write/close/rename fichier.

## Preuves obtenues

- Comparaison C/TS : `Quake-2-master/client/cl_parse.c`, `packages/qcommon/src/protocol.ts`, `packages/client/src/download.ts`, `packages/client/src/sound.ts`, `packages/client/src/cl_parse.ts`.
- Commentaires d'en-tete verifies pour `CL_DownloadFileName`, `CL_CheckOrDownloadFile`, `CL_Download_f`, `CL_RegisterSounds`, `CL_ParseDownload`; `svc_strings` documente cote `protocol.ts`.
- Comparaison C/TS du lot serveur : `CL_ParseServerData`, `CL_ParseBaseline`, `CL_LoadClientinfo`, `CL_ParseClientinfo`, `CL_ParseConfigString` dans `Quake-2-master/client/cl_parse.c` et `packages/client/src/cl_parse.ts`.
- Commentaires d'en-tete verifies pour les cinq fonctions du lot serveur; `Source` pointe vers `client/cl_parse.c`.
- Comparaison C/TS du lot final : `CL_ParseStartSoundPacket`, `SHOWNET`, `CL_ParseServerMessage` dans `Quake-2-master/client/cl_parse.c` et `packages/client/src/cl_parse.ts`.
- Commentaires d'en-tete verifies pour `CL_ParseStartSoundPacket`, `SHOWNET`, `CL_ParseServerMessage`; `Source` pointe vers `client/cl_parse.c`.
- Comparaison C/TS du reliquat `CL_ParseDownload` : le C fait `FS_CreatePath`, `fopen` temp, `fwrite`, `fclose`, `rename` vers le nom final; `packages/client/src/cl_parse.ts` expose maintenant les hooks equivalents `onCreateDownloadPath`, `onOpenDownloadFile`, `onWriteDownloadBytes`, `onCloseDownloadFile`, `onRenameDownloadFile`.
- Commentaire d'en-tete de `CL_ParseDownload` mis a jour : il ne declare plus de report futur du write/rename et documente l'IO hook-based.
- Runtime : `CL_CheckOrDownloadFile` est appele par `CL_RequestNextDownload`; `CL_Download_f` est enregistre par `CL_InitLocal`; `CL_RegisterSounds` est appele par `CL_Snd_Restart_f` et le precache; `CL_ParseDownload` est atteint par `CL_ParseServerMessage` sur `svc_download`.
- Runtime : `CL_ParseServerData`, `CL_ParseBaseline` et `CL_ParseConfigString` sont atteints par `CL_ParseServerMessage`; `CL_ParseConfigString` appelle `CL_ParseClientinfo` uniquement quand `refresh_prepped`, comme le C; `CL_LoadClientinfo` est aussi appele par `CL_PrepRefresh`.
- Runtime : `CL_ParseStartSoundPacket`, `SHOWNET` et `CL_ParseServerMessage` sont atteints par `CL_ReadPackets` depuis `CL_Frame` / `Qcommon_Frame`; `CL_ReadPackets` fournit `cl_shownet` au parseur.
- `apps/web` : `full-game.ts` branche `CL_RegisterSounds` sur le backend audio porte et `full-game-server-host.ts` appelle `CL_ParseServerMessage`; `CL_InitLocal` desactive les autodownloads navigateur via `allowDownload: false`.
- `apps/web` : `full-game-server-host.ts` appelle `CL_ParseServerMessage`; `full-game.ts` fournit maintenant le hook `onSetGameDir` et les hooks de registration models/skins/pics/sounds/inline models consommes par le parseur et `CL_PrepRefresh`.
- `apps/web` : `full-game.ts` route `svc_sound` vers `S_DMA_StartSound` via `onStartSound`; `full-game-server-host.ts` et le chemin autoritatif passent par `CL_ParseServerMessage`, sans logique audio parallele masquante.
- `apps/web` : le chemin autoritatif fournit les hooks fichier de `CL_ParseDownload` via `createWebDownloadFileHooks(saveStorage)`; `fileExists`, `loadBinaryFile` et `getPartialDownloadSize` consultent aussi `saveStorage`, ce qui rend les assets telecharges consommables par les flux web suivants.
- `renderer-three` : les sorties visibles du lot serveur sont consommees via `model_draw`, `model_clip`, `image_precache`, `clientinfo`, `sky` puis `CL_PrepRefresh`, `CL_BuildRefreshFrame`, `gl-world-scene-adapter`, `ref-gl-host` et `sky-scene-adapter`.
- `renderer-three` : `svc_sound` et `SHOWNET` ne produisent pas de sortie visuelle directe; `CL_ParseServerMessage` distribue aussi les temp entities, frames, configstrings, layout, inventaire et areabits deja consommes par le render source et le renderer.
- `renderer-three` : `CL_ParseDownload` ne produit pas directement modeles/frames/images/particules/beams/dlights/temp entities/areabits/camera/scene; son impact visible est indirect via les fichiers d'assets ensuite resolus par `loadBinaryFile`/registration.

## Tests lances

- `npm run verify:cl-parse`
- `npx tsx ./scripts/verify/quake2-cl-view.ts`
- `npm run verify:full-game:audio-routing`
- `npm run verify:full-game:render-source`
- `npm run verify:full-game:three-renderer`
- `npm run verify:full-game:server-host`
- `npm run verify:full-game:server-snapshots`
- `npm run verify:sky:phase5`
- `npm run typecheck`
- `npm run verify:cl-main`
- Session reliquat `CL_ParseDownload` : `npm run verify:cl-parse`
- Session reliquat `CL_ParseDownload` : `npm run verify:full-game:server-host`
- Session reliquat `CL_ParseDownload` : `npm run verify:full-game:render-source`
- Session reliquat `CL_ParseDownload` : `npm run typecheck`
- Session reliquat `CL_ParseDownload` : `npm run verify:full-game:three-renderer` echoue hors lot sur `pointer lock should accept the clicked renderer viewport child`.

## Decisions

- `svc_strings` est porte dans `packages/qcommon/src/protocol.ts` car la table suit `svc_ops_e`; la valeur TS corrige la typo debug C `svc_muzzlflash2`.
- Les variables `name`, `len`, `filename`, `i`, `r`, `oldn`, `newn` du lot sont des locales C et non des entites proprietaires; elles sont marquees `Non applicable`.
- `CL_ParseDownload` est ferme `Valide` : parsing, `downloadpercent`, `nextdl`, nettoyage `cls.download`, ecriture fichier temporaire, fermeture et rename final sont verifies dans la session. Le port reste hook-based pour remplacer les appels stdio/filesystem C.
- Les variables `fs_gamedirvar`, `str`, `i`, `es`, `bits`, `newnum`, `nullstate`, `t`, `model_name`, `skin_name`, `model_filename`, `skin_filename`, `weapon_filename`, `s` du lot serveur sont des locales C ou un extern consomme par hook, pas des entites proprietaires.
- Les variables `pos_v`, `pos`, `sound_num`, `volume`, `attenuation`, `flags`, `ofs`, `cmd`, `s`, `i` du lot final sont des locales C et non des entites proprietaires; les doublons matriciels sont marques `Non applicable`.
- `SHOWNET` est porte dans `cl_parse.ts` avec lecture de `cl_shownet` via hook; le second `SHOWNET` genere dans la matrice est un doublon matriciel marque `Non applicable`.
- `CL_ParseServerMessage` conserve le dispatch `svc_download`; toutes les lignes de `client_cl_parse.c.md` sont maintenant traitees.
- `CL_ParseServerData` expose le changement de `game` via hook web; le port TS conserve le nom de gamedir dans `cl.gamedir`.
- `registerClientinfoResources` porte les fallbacks C `male`, `grunt` et weapon model `cyborg -> male`, et `CL_PrepRefresh` utilise ce meme chemin.

## Prochain lot recommande

Aucun lot restant dans `client_cl_parse.c.md`; reprendre le prochain fichier prioritaire depuis `AVANCEMENT_GLOBAL.md`.

## Blocages

`npm run verify:full-game:three-renderer` echoue hors lot sur `pointer lock should accept the clicked renderer viewport child`; les tests ciblant `CL_ParseDownload` passent.
