# Inventaire runtime Phase 03 - Quake-2-master/client/snd_loc.h

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/client/src/snd_loc.ts
- Cibles TS declarees : packages/client/src/snd_loc.ts, packages/client/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| struct | portable_samplepair_t | 23 | a-auditer | |
| global | left | 25 | a-auditer | |
| global | right | 26 | a-auditer | |
| struct | sfxcache_t | 29 | a-auditer | |
| global | length | 31 | a-auditer | |
| global | loopstart | 32 | a-auditer | |
| global | speed | 33 | a-auditer | |
| global | width | 34 | a-auditer | |
| global | stereo | 35 | a-auditer | |
| global | data | 36 | a-auditer | |
| struct | sfx_s | 39 | a-auditer | |
| global | name | 41 | a-auditer | |
| global | registration_sequence | 42 | a-auditer | |
| global | truename | 44 | a-auditer | |
| struct | playsound_s | 50 | a-auditer | |
| global | sfx | 53 | a-auditer | |
| global | volume | 54 | a-auditer | |
| global | attenuation | 55 | a-auditer | |
| global | entnum | 56 | a-auditer | |
| global | entchannel | 57 | a-auditer | |
| global | fixed_origin | 58 | a-auditer | |
| global | origin | 59 | a-auditer | |
| global | begin | 60 | a-auditer | |
| struct | dma_t | 63 | a-auditer | |
| global | channels | 65 | a-auditer | |
| global | samples | 66 | a-auditer | |
| global | submission_chunk | 67 | a-auditer | |
| global | samplepos | 68 | a-auditer | |
| global | samplebits | 69 | a-auditer | |
| global | speed | 70 | a-auditer | |
| global | buffer | 71 | a-auditer | |
| struct | channel_t | 75 | a-auditer | |
| global | sfx | 77 | a-auditer | |
| global | leftvol | 78 | a-auditer | |
| global | rightvol | 79 | a-auditer | |
| global | end | 80 | a-auditer | |
| global | pos | 81 | a-auditer | |
| global | looping | 82 | a-auditer | |
| global | entnum | 83 | a-auditer | |
| global | entchannel | 84 | a-auditer | |
| global | origin | 85 | a-auditer | |
| global | dist_mult | 86 | a-auditer | |
| global | master_vol | 87 | a-auditer | |
| global | fixed_origin | 88 | a-auditer | |
| global | autosound | 89 | a-auditer | |
| struct | wavinfo_t | 92 | a-auditer | |
| global | rate | 94 | a-auditer | |
| global | width | 95 | a-auditer | |
| global | channels | 96 | a-auditer | |
| global | loopstart | 97 | a-auditer | |
| global | samples | 98 | a-auditer | |
| global | dataofs | 99 | a-auditer | |
| function | SNDDMA_Init | 112 | a-auditer | |
| function | SNDDMA_GetDMAPos | 115 | a-auditer | |
| function | SNDDMA_Shutdown | 118 | a-auditer | |
| function | SNDDMA_BeginPainting | 120 | a-auditer | |
| function | SNDDMA_Submit | 122 | a-auditer | |
| macro | MAX_CHANNELS | 126 | a-auditer | |
| global | channels | 127 | a-auditer | |
| global | paintedtime | 129 | a-auditer | |
| global | s_rawend | 130 | a-auditer | |
| macro | MAX_RAW_SAMPLES | 138 | a-auditer | |
| global | s_volume | 141 | a-auditer | |
| global | s_nosound | 142 | a-auditer | |
| global | s_loadas8bit | 143 | a-auditer | |
| global | s_khz | 144 | a-auditer | |
| global | s_show | 145 | a-auditer | |
| global | s_mixahead | 146 | a-auditer | |
| global | s_testsound | 147 | a-auditer | |
| global | s_primary | 148 | a-auditer | |
| function | GetWavinfo | 150 | a-auditer | |
| function | S_InitScaletable | 152 | a-auditer | |
| function | S_LoadSound | 154 | a-auditer | |
| function | S_IssuePlaysound | 156 | a-auditer | |
| function | S_PaintChannels | 158 | a-auditer | |
| function | S_PickChannel | 161 | a-auditer | |
| function | S_Spatialize | 164 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

