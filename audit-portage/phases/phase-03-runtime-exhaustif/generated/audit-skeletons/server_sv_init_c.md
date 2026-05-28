# Inventaire runtime Phase 03 - Quake-2-master/server/sv_init.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/server/src/sv_init.ts
- Cibles TS declarees : packages/server/src/sv_init.ts, packages/server/src/index.ts, packages/server/src/runtime.ts, packages/server/src/sv_game.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| global | sv | 24 | a-auditer | |
| function | SV_FindIndex | 32 | a-auditer | |
| global | i | 34 | a-auditer | |
| function | SV_ModelIndex | 64 | a-auditer | |
| function | SV_FindIndex | 66 | a-auditer | |
| function | SV_SoundIndex | 69 | a-auditer | |
| function | SV_FindIndex | 71 | a-auditer | |
| function | SV_ImageIndex | 74 | a-auditer | |
| function | SV_FindIndex | 76 | a-auditer | |
| function | SV_CreateBaseline | 89 | a-auditer | |
| global | svent | 91 | a-auditer | |
| global | entnum | 92 | a-auditer | |
| function | SV_CheckForSavegame | 117 | a-auditer | |
| global | name | 119 | a-auditer | |
| global | f | 120 | a-auditer | |
| global | i | 121 | a-auditer | |
| global | previousState | 148 | a-auditer | |
| function | SV_SpawnServer | 169 | a-auditer | |
| global | i | 171 | a-auditer | |
| global | checksum | 172 | a-auditer | |
| function | SV_InitGame | 289 | a-auditer | |
| global | i | 291 | a-auditer | |
| global | ent | 292 | a-auditer | |
| global | idmaster | 293 | a-auditer | |
| function | SV_Map | 393 | a-auditer | |
| global | level | 395 | a-auditer | |
| global | ch | 396 | a-auditer | |
| global | l | 397 | a-auditer | |
| global | spawnpoint | 398 | a-auditer | |
| function | Cvar_Set | 416 | a-auditer | |
| global | spawnpoint | 430 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

