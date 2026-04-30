# Inventaire runtime Phase 03 - Quake-2-master/qcommon/files.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/filesystem/src/files.ts
- Cibles TS declarees : packages/filesystem/src/files.ts, packages/filesystem/src/index.ts, packages/formats/src/pak.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| macro | PAK0_CHECKSUM | 28 | a-auditer | |
| struct | packfile_t | 47 | a-auditer | |
| global | name | 49 | a-auditer | |
| struct | pack_s | 53 | a-auditer | |
| global | filename | 55 | a-auditer | |
| global | numfiles | 57 | a-auditer | |
| global | fs_gamedir | 61 | a-auditer | |
| global | fs_basedir | 62 | a-auditer | |
| global | fs_cddir | 63 | a-auditer | |
| global | fs_gamedirvar | 64 | a-auditer | |
| struct | filelink_s | 66 | a-auditer | |
| global | from | 69 | a-auditer | |
| global | fromlength | 70 | a-auditer | |
| global | to | 71 | a-auditer | |
| struct | searchpath_s | 76 | a-auditer | |
| global | filename | 78 | a-auditer | |
| function | FS_filelength | 104 | a-auditer | |
| global | pos | 106 | a-auditer | |
| global | end | 107 | a-auditer | |
| function | FS_CreatePath | 125 | a-auditer | |
| global | ofs | 127 | a-auditer | |
| function | FS_FCloseFile | 149 | a-auditer | |
| function | Developer_searchpath | 159 | a-auditer | |
| global | ch | 162 | a-auditer | |
| global | file_from_pak | 204 | a-auditer | |
| function | FS_FOpenFile | 206 | a-auditer | |
| global | netpath | 209 | a-auditer | |
| global | pak | 210 | a-auditer | |
| global | i | 211 | a-auditer | |
| global | link | 212 | a-auditer | |
| function | FS_filelength | 226 | a-auditer | |
| function | FS_filelength | 267 | a-auditer | |
| function | FS_FOpenFile | 282 | a-auditer | |
| global | netpath | 285 | a-auditer | |
| global | pak | 286 | a-auditer | |
| global | i | 287 | a-auditer | |
| function | FS_filelength | 302 | a-auditer | |
| function | CDAudio_Stop | 344 | a-auditer | |
| macro | MAX_READ | 345 | a-auditer | |
| function | FS_Read | 346 | a-auditer | |
| global | read | 349 | a-auditer | |
| global | buf | 350 | a-auditer | |
| global | tries | 351 | a-auditer | |
| function | Com_Error | 373 | a-auditer | |
| function | FS_LoadFile | 394 | a-auditer | |
| global | buf | 397 | a-auditer | |
| global | len | 398 | a-auditer | |
| function | FS_FreeFile | 433 | a-auditer | |
| function | FS_LoadPackFile | 448 | a-auditer | |
| global | i | 451 | a-auditer | |
| global | newfiles | 452 | a-auditer | |
| global | numpackfiles | 453 | a-auditer | |
| global | pack | 454 | a-auditer | |
| global | packhandle | 455 | a-auditer | |
| global | info | 456 | a-auditer | |
| global | checksum | 457 | a-auditer | |
| function | FS_AddGameDirectory | 513 | a-auditer | |
| global | i | 515 | a-auditer | |
| global | pak | 517 | a-auditer | |
| global | pakfile | 518 | a-auditer | |
| function | FS_Gamedir | 555 | a-auditer | |
| function | FS_ExecAutoexec | 565 | a-auditer | |
| global | dir | 567 | a-auditer | |
| global | name | 568 | a-auditer | |
| function | Com_sprintf | 574 | a-auditer | |
| function | FS_SetGamedir | 588 | a-auditer | |
| function | FS_Link_f | 645 | a-auditer | |
| global | s | 689 | a-auditer | |
| global | nfiles | 690 | a-auditer | |
| function | FS_Dir_f | 733 | a-auditer | |
| global | path | 735 | a-auditer | |
| global | findname | 736 | a-auditer | |
| global | wildcard | 737 | a-auditer | |
| global | ndirs | 739 | a-auditer | |
| global | tmp | 748 | a-auditer | |
| global | i | 763 | a-auditer | |
| function | Com_Printf | 770 | a-auditer | |
| function | FS_Path_f | 786 | a-auditer | |
| global | l | 789 | a-auditer | |
| function | Com_Printf | 799 | a-auditer | |
| function | FS_NextPath | 814 | a-auditer | |
| global | prev | 817 | a-auditer | |
| function | FS_InitFilesystem | 841 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

