# Inventaire runtime Phase 03 - Quake-2-master/client/cl_cin.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/client/src/cl_cin.ts
- Cibles TS declarees : packages/client/src/cl_cin.ts, packages/client/src/cl_scrn.ts, packages/client/src/client.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| struct | cblock_t | 22 | a-auditer | |
| global | data | 24 | a-auditer | |
| global | count | 25 | a-auditer | |
| struct | cinematics_t | 28 | a-auditer | |
| global | restart_sound | 30 | a-auditer | |
| global | s_rate | 31 | a-auditer | |
| global | s_width | 32 | a-auditer | |
| global | s_channels | 33 | a-auditer | |
| global | width | 35 | a-auditer | |
| global | height | 36 | a-auditer | |
| global | pic | 37 | a-auditer | |
| global | pic_pending | 38 | a-auditer | |
| global | hnodes1 | 41 | a-auditer | |
| global | numhnodes1 | 42 | a-auditer | |
| global | h_used | 44 | a-auditer | |
| global | h_count | 45 | a-auditer | |
| function | SCR_LoadPCX | 64 | a-auditer | |
| global | raw | 66 | a-auditer | |
| global | len | 69 | a-auditer | |
| global | runLength | 128 | a-auditer | |
| function | SCR_StopCinematic | 153 | a-auditer | |
| function | SCR_FinishCinematic | 198 | a-auditer | |
| function | SmallestNode1 | 212 | a-auditer | |
| global | i | 214 | a-auditer | |
| function | Huff1TableInit | 247 | a-auditer | |
| global | prev | 249 | a-auditer | |
| global | j | 250 | a-auditer | |
| global | counts | 252 | a-auditer | |
| global | numhnodes | 253 | a-auditer | |
| function | Huff1Decompress | 298 | a-auditer | |
| global | input | 300 | a-auditer | |
| global | out_p | 301 | a-auditer | |
| global | nodenum | 302 | a-auditer | |
| global | count | 303 | a-auditer | |
| global | inbyte | 305 | a-auditer | |
| function | SCR_ReadNextFrame | 427 | a-auditer | |
| global | r | 429 | a-auditer | |
| global | command | 430 | a-auditer | |
| global | samples | 431 | a-auditer | |
| global | compressed | 432 | a-auditer | |
| global | size | 433 | a-auditer | |
| global | pic | 434 | a-auditer | |
| function | SCR_RunCinematic | 490 | a-auditer | |
| global | frame | 492 | a-auditer | |
| function | SCR_DrawCinematic | 541 | a-auditer | |
| function | SCR_PlayCinematic | 576 | a-auditer | |
| global | palette | 579 | a-auditer | |
| global | old_khz | 581 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

