# Inventaire runtime Phase 03 - Quake-2-master/client/cl_parse.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/client/src/cl_parse.ts
- Cibles TS declarees : packages/client/src/cl_parse.ts, packages/client/src/download.ts, packages/client/src/sky.ts, packages/client/src/sound-registration.ts, packages/client/src/cl_scrn.ts, packages/client/src/sound.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| global | svc_strings | 24 | a-auditer | |
| function | CL_DownloadFileName | 53 | a-auditer | |
| function | Com_sprintf | 58 | a-auditer | |
| function | CL_CheckOrDownloadFile | 69 | a-auditer | |
| global | name | 72 | a-auditer | |
| global | len | 102 | a-auditer | |
| function | CL_Download_f | 132 | a-auditer | |
| global | filename | 134 | a-auditer | |
| function | CL_RegisterSounds | 176 | a-auditer | |
| global | i | 178 | a-auditer | |
| function | CL_ParseDownload | 200 | a-auditer | |
| global | name | 203 | a-auditer | |
| global | r | 204 | a-auditer | |
| global | oldn | 261 | a-auditer | |
| global | newn | 262 | a-auditer | |
| function | CL_ParseServerData | 298 | a-auditer | |
| global | fs_gamedirvar | 300 | a-auditer | |
| global | str | 301 | a-auditer | |
| global | i | 302 | a-auditer | |
| function | CL_ParseBaseline | 359 | a-auditer | |
| global | es | 361 | a-auditer | |
| global | bits | 362 | a-auditer | |
| global | newnum | 363 | a-auditer | |
| global | nullstate | 364 | a-auditer | |
| function | CL_LoadClientinfo | 380 | a-auditer | |
| global | i | 382 | a-auditer | |
| global | t | 383 | a-auditer | |
| global | model_name | 384 | a-auditer | |
| global | skin_name | 385 | a-auditer | |
| global | model_filename | 386 | a-auditer | |
| global | skin_filename | 387 | a-auditer | |
| global | weapon_filename | 388 | a-auditer | |
| function | CL_ParseClientinfo | 501 | a-auditer | |
| global | s | 503 | a-auditer | |
| function | CL_ParseConfigString | 519 | a-auditer | |
| global | i | 521 | a-auditer | |
| global | s | 522 | a-auditer | |
| function | CL_ParseStartSoundPacket | 581 | a-auditer | |
| global | pos_v | 583 | a-auditer | |
| global | pos | 584 | a-auditer | |
| global | sound_num | 586 | a-auditer | |
| global | volume | 587 | a-auditer | |
| global | attenuation | 588 | a-auditer | |
| global | flags | 589 | a-auditer | |
| global | ofs | 590 | a-auditer | |
| global | volume | 598 | a-auditer | |
| global | attenuation | 603 | a-auditer | |
| global | ofs | 608 | a-auditer | |
| global | pos | 632 | a-auditer | |
| function | SHOWNET | 641 | a-auditer | |
| function | CL_ParseServerMessage | 652 | a-auditer | |
| global | cmd | 654 | a-auditer | |
| global | s | 655 | a-auditer | |
| global | i | 656 | a-auditer | |
| function | SHOWNET | 691 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

