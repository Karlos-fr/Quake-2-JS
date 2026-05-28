# Inventaire runtime Phase 03 - Quake-2-master/client/snd_dma.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/client/src/snd_dma.ts
- Cibles TS declarees : packages/client/src/snd_dma.ts, packages/client/src/index.ts, packages/client/src/snd_loc.ts, packages/client/src/snd_mix.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| function | S_Play | 25 | a-auditer | |
| function | S_SoundList | 26 | a-auditer | |
| function | S_Update_ | 27 | a-auditer | |
| function | S_StopAllSounds | 28 | a-auditer | |
| macro | SOUND_FULLVOLUME | 36 | a-auditer | |
| macro | SOUND_LOOPATTENUATE | 38 | a-auditer | |
| global | s_registration_sequence | 40 | a-auditer | |
| global | channels | 42 | a-auditer | |
| global | snd_initialized | 44 | a-auditer | |
| global | sound_started | 45 | a-auditer | |
| global | dma | 47 | a-auditer | |
| global | listener_origin | 49 | a-auditer | |
| global | listener_forward | 50 | a-auditer | |
| global | listener_right | 51 | a-auditer | |
| global | listener_up | 52 | a-auditer | |
| global | s_registering | 54 | a-auditer | |
| global | soundtime | 56 | a-auditer | |
| global | paintedtime | 57 | a-auditer | |
| macro | MAX_SFX | 63 | a-auditer | |
| global | known_sfx | 64 | a-auditer | |
| global | num_sfx | 65 | a-auditer | |
| macro | MAX_PLAYSOUNDS | 67 | a-auditer | |
| global | s_beginofs | 72 | a-auditer | |
| global | s_volume | 74 | a-auditer | |
| global | s_testsound | 75 | a-auditer | |
| global | s_loadas8bit | 76 | a-auditer | |
| global | s_khz | 77 | a-auditer | |
| global | s_show | 78 | a-auditer | |
| global | s_mixahead | 79 | a-auditer | |
| global | s_primary | 80 | a-auditer | |
| global | s_rawend | 83 | a-auditer | |
| function | S_SoundInfo_f | 92 | a-auditer | |
| function | S_Init | 116 | a-auditer | |
| global | cv | 118 | a-auditer | |
| function | S_Shutdown | 164 | a-auditer | |
| global | i | 166 | a-auditer | |
| function | S_FindName | 205 | a-auditer | |
| global | i | 207 | a-auditer | |
| function | S_AliasName | 256 | a-auditer | |
| global | s | 259 | a-auditer | |
| global | i | 260 | a-auditer | |
| function | S_BeginRegistration | 293 | a-auditer | |
| function | S_RegisterSound | 305 | a-auditer | |
| function | S_EndRegistration | 328 | a-auditer | |
| global | i | 330 | a-auditer | |
| global | size | 332 | a-auditer | |
| function | S_PickChannel | 375 | a-auditer | |
| global | ch_idx | 377 | a-auditer | |
| global | first_to_die | 378 | a-auditer | |
| global | life_left | 379 | a-auditer | |
| function | S_SpatializeOrigin | 425 | a-auditer | |
| global | dot | 427 | a-auditer | |
| global | dist | 428 | a-auditer | |
| global | source_vec | 430 | a-auditer | |
| function | S_Spatialize | 477 | a-auditer | |
| global | origin | 479 | a-auditer | |
| function | CL_GetEntitySoundOrigin | 494 | a-auditer | |
| function | S_AllocPlaysound | 505 | a-auditer | |
| function | S_FreePlaysound | 526 | a-auditer | |
| function | S_IssuePlaysound | 550 | a-auditer | |
| function | S_RegisterSexedSound | 587 | a-auditer | |
| global | n | 589 | a-auditer | |
| global | p | 590 | a-auditer | |
| global | f | 592 | a-auditer | |
| global | model | 593 | a-auditer | |
| global | sexedFilename | 594 | a-auditer | |
| global | maleFilename | 595 | a-auditer | |
| function | S_StartSound | 655 | a-auditer | |
| global | vol | 658 | a-auditer | |
| global | start | 660 | a-auditer | |
| function | S_StartLocalSound | 738 | a-auditer | |
| function | S_ClearBuffer | 760 | a-auditer | |
| global | clear | 762 | a-auditer | |
| global | clear | 772 | a-auditer | |
| function | S_StopAllSounds | 785 | a-auditer | |
| global | i | 787 | a-auditer | |
| function | S_AddLoopSounds | 820 | a-auditer | |
| global | sounds | 823 | a-auditer | |
| global | sfx | 826 | a-auditer | |
| global | num | 828 | a-auditer | |
| global | ent | 829 | a-auditer | |
| function | S_RawSamples | 910 | a-auditer | |
| global | i | 912 | a-auditer | |
| global | scale | 914 | a-auditer | |
| function | S_Update | 1009 | a-auditer | |
| global | i | 1011 | a-auditer | |
| global | total | 1012 | a-auditer | |
| function | GetSoundtime | 1082 | a-auditer | |
| global | samplepos | 1084 | a-auditer | |
| global | buffers | 1085 | a-auditer | |
| global | oldsamplepos | 1086 | a-auditer | |
| global | fullsamples | 1087 | a-auditer | |
| function | S_Update_ | 1112 | a-auditer | |
| global | endtime | 1114 | a-auditer | |
| global | samps | 1115 | a-auditer | |
| function | S_Play | 1159 | a-auditer | |
| global | i | 1161 | a-auditer | |
| global | name | 1162 | a-auditer | |
| function | strcpy | 1174 | a-auditer | |
| function | S_SoundList | 1181 | a-auditer | |
| global | i | 1183 | a-auditer | |
| function | Com_Printf | 1201 | a-auditer | |
| function | Com_Printf | 1209 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

