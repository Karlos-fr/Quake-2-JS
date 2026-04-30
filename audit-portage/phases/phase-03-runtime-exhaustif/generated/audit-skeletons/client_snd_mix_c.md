# Inventaire runtime Phase 03 - Quake-2-master/client/snd_mix.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/client/src/snd_mix.ts
- Cibles TS declarees : packages/client/src/snd_mix.ts, packages/client/src/snd_loc.ts, packages/client/src/snd_dma.ts, packages/client/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| macro | PAINTBUFFER_SIZE | 25 | a-auditer | |
| global | snd_out | 29 | a-auditer | |
| function | S_WriteLinearBlastStereo16 | 31 | a-auditer | |
| function | S_WriteLinearBlastStereo16 | 36 | a-auditer | |
| global | i | 38 | a-auditer | |
| global | val | 39 | a-auditer | |
| global | snd_out | 49 | a-auditer | |
| global | snd_out | 57 | a-auditer | |
| function | S_TransferStereo16 | 108 | a-auditer | |
| global | lpos | 110 | a-auditer | |
| global | lpaintedtime | 111 | a-auditer | |
| function | S_TransferPaintBuffer | 143 | a-auditer | |
| global | out_idx | 145 | a-auditer | |
| global | count | 146 | a-auditer | |
| global | out_mask | 147 | a-auditer | |
| global | p | 148 | a-auditer | |
| global | step | 149 | a-auditer | |
| global | val | 150 | a-auditer | |
| global | pbuf | 151 | a-auditer | |
| global | i | 157 | a-auditer | |
| global | count | 158 | a-auditer | |
| global | out | 181 | a-auditer | |
| global | out | 196 | a-auditer | |
| function | S_PaintChannelFrom8 | 221 | a-auditer | |
| function | S_PaintChannelFrom16 | 222 | a-auditer | |
| function | S_PaintChannels | 224 | a-auditer | |
| global | i | 226 | a-auditer | |
| global | end | 227 | a-auditer | |
| global | s | 268 | a-auditer | |
| global | stop | 269 | a-auditer | |
| function | S_PaintChannelFrom16 | 317 | a-auditer | |
| function | S_InitScaletable | 350 | a-auditer | |
| global | scale | 353 | a-auditer | |
| function | S_PaintChannelFrom8 | 368 | a-auditer | |
| global | data | 370 | a-auditer | |
| global | sfx | 372 | a-auditer | |
| global | i | 373 | a-auditer | |
| function | S_PaintChannelFrom16 | 472 | a-auditer | |
| global | data | 474 | a-auditer | |
| global | sfx | 477 | a-auditer | |
| global | i | 478 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

