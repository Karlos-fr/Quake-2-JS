# Inventaire runtime Phase 03 - Quake-2-master/qcommon/crc.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/qcommon/src/qcommon.ts
- Cibles TS declarees : packages/qcommon/src/qcommon.ts, packages/qcommon/src/crc.ts, packages/qcommon/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| macro | CRC_INIT_VALUE | 28 | a-auditer | |
| macro | CRC_XOR_VALUE | 29 | a-auditer | |
| global | crctable | 31 | a-auditer | |
| function | CRC_Init | 67 | a-auditer | |
| function | CRC_ProcessByte | 72 | a-auditer | |
| function | CRC_Value | 77 | a-auditer | |
| function | CRC_Block | 82 | a-auditer | |
| global | crc | 84 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

