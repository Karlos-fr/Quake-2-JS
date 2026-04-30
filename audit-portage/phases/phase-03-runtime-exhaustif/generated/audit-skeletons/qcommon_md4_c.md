# Inventaire runtime Phase 03 - Quake-2-master/qcommon/md4.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/qcommon/src/md4.ts
- Cibles TS declarees : packages/qcommon/src/md4.ts, packages/qcommon/src/qcommon.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| global | POINTER | 6 | a-auditer | |
| global | UINT2 | 9 | a-auditer | |
| global | UINT4 | 13 | a-auditer | |
| global | UINT4 | 15 | a-auditer | |
| struct | MD4_CTX | 32 | a-auditer | |
| global | buffer | 35 | a-auditer | |
| function | MD4Init | 38 | a-auditer | |
| function | MD4Update | 39 | a-auditer | |
| function | MD4Final | 40 | a-auditer | |
| macro | S11 | 59 | a-auditer | |
| macro | S12 | 60 | a-auditer | |
| macro | S13 | 61 | a-auditer | |
| macro | S14 | 62 | a-auditer | |
| macro | S21 | 63 | a-auditer | |
| macro | S22 | 64 | a-auditer | |
| macro | S23 | 65 | a-auditer | |
| macro | S24 | 66 | a-auditer | |
| macro | S31 | 67 | a-auditer | |
| macro | S32 | 68 | a-auditer | |
| macro | S33 | 69 | a-auditer | |
| macro | S34 | 70 | a-auditer | |
| function | MD4Transform | 72 | a-auditer | |
| function | Encode | 73 | a-auditer | |
| function | Decode | 74 | a-auditer | |
| global | PADDING | 76 | a-auditer | |
| macro | F | 81 | a-auditer | |
| macro | G | 82 | a-auditer | |
| macro | H | 83 | a-auditer | |
| macro | ROTATE_LEFT | 86 | a-auditer | |
| macro | FF | 90 | a-auditer | |
| macro | GG | 92 | a-auditer | |
| macro | HH | 94 | a-auditer | |
| function | MD4Init | 98 | a-auditer | |
| function | MD4Update | 110 | a-auditer | |
| global | i | 137 | a-auditer | |
| function | MD4Final | 145 | a-auditer | |
| global | bits | 147 | a-auditer | |
| function | MD4Transform | 170 | a-auditer | |
| function | Encode | 241 | a-auditer | |
| function | Decode | 255 | a-auditer | |
| function | Com_BlockChecksum | 265 | a-auditer | |
| global | digest | 267 | a-auditer | |
| global | val | 268 | a-auditer | |
| global | ctx | 269 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

