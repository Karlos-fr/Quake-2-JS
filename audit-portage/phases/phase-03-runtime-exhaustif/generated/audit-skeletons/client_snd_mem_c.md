# Inventaire runtime Phase 03 - Quake-2-master/client/snd_mem.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/client/src/snd_mem.ts
- Cibles TS declarees : packages/client/src/snd_mem.ts, packages/client/src/snd_loc.ts, packages/client/src/snd_dma.ts, packages/client/src/snd_mix.ts, packages/client/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| global | cache_full_cycle | 25 | a-auditer | |
| function | S_Alloc | 27 | a-auditer | |
| function | ResampleSfx | 34 | a-auditer | |
| global | outcount | 36 | a-auditer | |
| global | srcsample | 37 | a-auditer | |
| global | stepscale | 38 | a-auditer | |
| global | i | 39 | a-auditer | |
| global | sample | 82 | a-auditer | |
| function | S_LoadSound | 98 | a-auditer | |
| global | namebuffer | 100 | a-auditer | |
| global | data | 101 | a-auditer | |
| global | len | 103 | a-auditer | |
| global | stepscale | 104 | a-auditer | |
| global | size | 106 | a-auditer | |
| global | name | 107 | a-auditer | |
| global | name | 122 | a-auditer | |
| function | Com_sprintf | 127 | a-auditer | |
| global | data_p | 183 | a-auditer | |
| global | iff_end | 184 | a-auditer | |
| global | last_chunk | 185 | a-auditer | |
| global | iff_data | 186 | a-auditer | |
| global | iff_chunk_len | 187 | a-auditer | |
| function | GetLittleShort | 190 | a-auditer | |
| global | val | 192 | a-auditer | |
| function | GetLittleLong | 199 | a-auditer | |
| global | val | 201 | a-auditer | |
| function | FindNextChunk | 210 | a-auditer | |
| function | FindChunk | 238 | a-auditer | |
| function | DumpChunks | 245 | a-auditer | |
| global | str | 247 | a-auditer | |
| function | GetWavinfo | 266 | a-auditer | |
| global | i | 269 | a-auditer | |
| global | format | 270 | a-auditer | |
| global | samples | 271 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

