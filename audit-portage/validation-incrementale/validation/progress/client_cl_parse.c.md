# Progress - Quake-2-master/client/cl_parse.c

## Dernier lot valide

Premier lot `cl_parse.c` : `svc_strings`, helpers de download `CL_DownloadFileName`, `CL_CheckOrDownloadFile`, commande `CL_Download_f`, registration sonore `CL_RegisterSounds`, et validation partielle de `CL_ParseDownload`.

## Preuves obtenues

- Comparaison C/TS : `Quake-2-master/client/cl_parse.c`, `packages/qcommon/src/protocol.ts`, `packages/client/src/download.ts`, `packages/client/src/sound.ts`, `packages/client/src/cl_parse.ts`.
- Commentaires d'en-tete verifies pour `CL_DownloadFileName`, `CL_CheckOrDownloadFile`, `CL_Download_f`, `CL_RegisterSounds`, `CL_ParseDownload`; `svc_strings` documente cote `protocol.ts`.
- Runtime : `CL_CheckOrDownloadFile` est appele par `CL_RequestNextDownload`; `CL_Download_f` est enregistre par `CL_InitLocal`; `CL_RegisterSounds` est appele par `CL_Snd_Restart_f` et le precache; `CL_ParseDownload` est atteint par `CL_ParseServerMessage` sur `svc_download`.
- `apps/web` : `full-game.ts` branche `CL_RegisterSounds` sur le backend audio porte et `full-game-server-host.ts` appelle `CL_ParseServerMessage`; `CL_InitLocal` desactive les autodownloads navigateur via `allowDownload: false`.
- `renderer-three` : aucune consommation directe attendue pour ce lot; les downloads/sounds ne produisent pas directement modeles, frames, images, particules, beams, dlights, areabits, camera ou scene. Les sons passent par l'adapter audio web, pas par `renderer-three`.

## Tests lances

- `npm run verify:cl-parse`
- `npm run verify:full-game:audio-routing`
- `npm run typecheck`

## Decisions

- `svc_strings` est porte dans `packages/qcommon/src/protocol.ts` car la table suit `svc_ops_e`; la valeur TS corrige la typo debug C `svc_muzzlflash2`.
- Les variables `name`, `len`, `filename`, `i`, `r`, `oldn`, `newn` du lot sont des locales C et non des entites proprietaires; elles sont marquees `Non applicable`.
- `CL_ParseDownload` reste `Partiel` : le parsing, `downloadpercent`, la demande `nextdl` et le nettoyage de `cls.download` sont verifies/corriges, mais l'ecriture fichier temporaire et le rename final du C restent a brancher dans un adapter.

## Prochain lot recommande

Reprendre `CL_ParseServerData` et ses locales (`fs_gamedirvar`, `str`, `i`), puis `CL_ParseBaseline` et ses locales si le lot reste coherent.

## Blocages

Aucun blocage sur ce lot.
