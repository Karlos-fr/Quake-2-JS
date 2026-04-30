# Inventaire runtime Phase 03 - Quake-2-master/server/sv_ents.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/server/src/sv_ents.ts
- Cibles TS declarees : packages/server/src/sv_ents.ts, packages/server/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| function | SV_EmitPacketEntities | 125 | a-auditer | |
| global | from_num_entities | 130 | a-auditer | |
| global | bits | 131 | a-auditer | |
| global | from_num_entities | 143 | a-auditer | |
| function | MSG_WriteByte | 197 | a-auditer | |
| function | SV_WritePlayerstateToClient | 220 | a-auditer | |
| global | i | 222 | a-auditer | |
| global | pflags | 223 | a-auditer | |
| global | dummy | 225 | a-auditer | |
| global | statbits | 226 | a-auditer | |
| global | ops | 235 | a-auditer | |
| function | SV_WriteFrameToClient | 413 | a-auditer | |
| global | lastframe | 416 | a-auditer | |
| global | fatpvs | 465 | a-auditer | |
| function | SV_FatPVS | 475 | a-auditer | |
| global | leafs | 477 | a-auditer | |
| global | longs | 479 | a-auditer | |
| global | src | 480 | a-auditer | |
| function | SV_BuildClientFrame | 522 | a-auditer | |
| global | ent | 526 | a-auditer | |
| global | clent | 527 | a-auditer | |
| global | frame | 528 | a-auditer | |
| global | state | 529 | a-auditer | |
| global | l | 530 | a-auditer | |
| global | leafnum | 532 | a-auditer | |
| global | c_fullsend | 533 | a-auditer | |
| global | clientphs | 534 | a-auditer | |
| global | bitvector | 535 | a-auditer | |
| global | bitvector | 615 | a-auditer | |
| global | len | 638 | a-auditer | |
| function | SV_RecordDemoMessage | 680 | a-auditer | |
| global | e | 682 | a-auditer | |
| global | ent | 683 | a-auditer | |
| global | nostate | 684 | a-auditer | |
| global | buf | 685 | a-auditer | |
| global | buf_data | 686 | a-auditer | |
| global | len | 687 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

