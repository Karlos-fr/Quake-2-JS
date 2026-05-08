# Progress - Quake-2-master/client/cl_parse.c

## Dernier lot valide

Lot serveur elargi `cl_parse.c` : `CL_ParseServerData`, `CL_ParseBaseline`, `CL_LoadClientinfo`, `CL_ParseClientinfo`, `CL_ParseConfigString`.

## Preuves obtenues

- Comparaison C/TS : `Quake-2-master/client/cl_parse.c`, `packages/qcommon/src/protocol.ts`, `packages/client/src/download.ts`, `packages/client/src/sound.ts`, `packages/client/src/cl_parse.ts`.
- Commentaires d'en-tete verifies pour `CL_DownloadFileName`, `CL_CheckOrDownloadFile`, `CL_Download_f`, `CL_RegisterSounds`, `CL_ParseDownload`; `svc_strings` documente cote `protocol.ts`.
- Comparaison C/TS du lot serveur : `CL_ParseServerData`, `CL_ParseBaseline`, `CL_LoadClientinfo`, `CL_ParseClientinfo`, `CL_ParseConfigString` dans `Quake-2-master/client/cl_parse.c` et `packages/client/src/cl_parse.ts`.
- Commentaires d'en-tete verifies pour les cinq fonctions du lot serveur; `Source` pointe vers `client/cl_parse.c`.
- Runtime : `CL_CheckOrDownloadFile` est appele par `CL_RequestNextDownload`; `CL_Download_f` est enregistre par `CL_InitLocal`; `CL_RegisterSounds` est appele par `CL_Snd_Restart_f` et le precache; `CL_ParseDownload` est atteint par `CL_ParseServerMessage` sur `svc_download`.
- Runtime : `CL_ParseServerData`, `CL_ParseBaseline` et `CL_ParseConfigString` sont atteints par `CL_ParseServerMessage`; `CL_ParseConfigString` appelle `CL_ParseClientinfo` uniquement quand `refresh_prepped`, comme le C; `CL_LoadClientinfo` est aussi appele par `CL_PrepRefresh`.
- `apps/web` : `full-game.ts` branche `CL_RegisterSounds` sur le backend audio porte et `full-game-server-host.ts` appelle `CL_ParseServerMessage`; `CL_InitLocal` desactive les autodownloads navigateur via `allowDownload: false`.
- `apps/web` : `full-game-server-host.ts` appelle `CL_ParseServerMessage`; `full-game.ts` fournit maintenant le hook `onSetGameDir` et les hooks de registration models/skins/pics/sounds/inline models consommes par le parseur et `CL_PrepRefresh`.
- `renderer-three` : les sorties visibles du lot serveur sont consommees via `model_draw`, `model_clip`, `image_precache`, `clientinfo`, `sky` puis `CL_PrepRefresh`, `CL_BuildRefreshFrame`, `gl-world-scene-adapter`, `ref-gl-host` et `sky-scene-adapter`.

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

## Decisions

- `svc_strings` est porte dans `packages/qcommon/src/protocol.ts` car la table suit `svc_ops_e`; la valeur TS corrige la typo debug C `svc_muzzlflash2`.
- Les variables `name`, `len`, `filename`, `i`, `r`, `oldn`, `newn` du lot sont des locales C et non des entites proprietaires; elles sont marquees `Non applicable`.
- `CL_ParseDownload` reste `Partiel` : le parsing, `downloadpercent`, la demande `nextdl` et le nettoyage de `cls.download` sont verifies/corriges, mais l'ecriture fichier temporaire et le rename final du C restent a brancher dans un adapter.
- Les variables `fs_gamedirvar`, `str`, `i`, `es`, `bits`, `newnum`, `nullstate`, `t`, `model_name`, `skin_name`, `model_filename`, `skin_filename`, `weapon_filename`, `s` du lot serveur sont des locales C ou un extern consomme par hook, pas des entites proprietaires.
- `CL_ParseServerData` expose le changement de `game` via hook web; le port TS conserve le nom de gamedir dans `cl.gamedir`.
- `registerClientinfoResources` porte les fallbacks C `male`, `grunt` et weapon model `cyborg -> male`, et `CL_PrepRefresh` utilise ce meme chemin.

## Prochain lot recommande

Reprendre `CL_ParseStartSoundPacket` et ses locales (`pos_v`, `pos`, `sound_num`, `volume`, `attenuation`, `flags`, `ofs`), puis `SHOWNET` / `CL_ParseServerMessage` si le lot reste coherent.

## Blocages

Aucun blocage sur ce lot.
