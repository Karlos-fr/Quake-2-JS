# Inventaire runtime Phase 03 - Quake-2-master/client/cdaudio.h

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/client/src/cdaudio.ts
- Cibles TS declarees : packages/client/src/cdaudio.ts, packages/platform/src/web-cd-audio-adapter.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| function | CDAudio_Init | 21 | a-auditer | |
| function | CDAudio_Shutdown | 22 | a-auditer | |
| function | CDAudio_Play | 23 | a-auditer | |
| function | CDAudio_Stop | 24 | a-auditer | |
| function | CDAudio_Update | 25 | a-auditer | |
| function | CDAudio_Activate | 26 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

