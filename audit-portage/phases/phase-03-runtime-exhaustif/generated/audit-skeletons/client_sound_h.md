# Inventaire runtime Phase 03 - Quake-2-master/client/sound.h

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/client/src/sound.ts
- Cibles TS declarees : packages/client/src/sound.ts, packages/client/src/index.ts, packages/client/src/snd_dma.ts, packages/client/src/snd_loc.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| function | S_Init | 23 | a-auditer | |
| function | S_Shutdown | 24 | a-auditer | |
| function | S_StartSound | 27 | a-auditer | |
| function | S_StartLocalSound | 28 | a-auditer | |
| function | S_RawSamples | 30 | a-auditer | |
| function | S_StopAllSounds | 32 | a-auditer | |
| function | S_Update | 33 | a-auditer | |
| function | S_Activate | 35 | a-auditer | |
| function | S_BeginRegistration | 37 | a-auditer | |
| function | S_RegisterSound | 38 | a-auditer | |
| function | S_EndRegistration | 39 | a-auditer | |
| function | S_FindName | 41 | a-auditer | |
| function | CL_GetEntitySoundOrigin | 45 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

