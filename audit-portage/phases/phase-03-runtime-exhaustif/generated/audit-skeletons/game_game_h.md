# Inventaire runtime Phase 03 - Quake-2-master/game/game.h

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/game/src/game.ts
- Cibles TS declarees : packages/game/src/game.ts, packages/game/src/runtime.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| macro | GAME_API_VERSION | 42 | a-auditer | |
| macro | SVF_NOCLIENT | 46 | a-auditer | |
| macro | SVF_DEADMONSTER | 47 | a-auditer | |
| macro | SVF_MONSTER | 48 | a-auditer | |
| enum | solid_t | 52 | a-auditer | |
| struct | link_s | 63 | a-auditer | |
| macro | MAX_ENT_CLUSTERS | 68 | a-auditer | |
| struct | gclient_s | 77 | a-auditer | |
| global | ps | 79 | a-auditer | |
| global | ping | 80 | a-auditer | |
| struct | edict_s | 86 | a-auditer | |
| global | s | 88 | a-auditer | |
| global | inuse | 90 | a-auditer | |
| global | linkcount | 91 | a-auditer | |
| global | area | 94 | a-auditer | |
| global | num_clusters | 96 | a-auditer | |
| global | clusternums | 97 | a-auditer | |
| global | headnode | 98 | a-auditer | |
| global | svflags | 103 | a-auditer | |
| global | solid | 106 | a-auditer | |
| global | clipmask | 107 | a-auditer | |
| global | owner | 108 | a-auditer | |
| struct | game_import_t | 121 | a-auditer | |
| struct | game_export_t | 200 | a-auditer | |
| global | apiversion | 202 | a-auditer | |
| global | edict_size | 249 | a-auditer | |
| global | num_edicts | 250 | a-auditer | |
| global | max_edicts | 251 | a-auditer | |
| function | GetGameApi | 254 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

