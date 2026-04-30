# Inventaire runtime Phase 03 - Quake-2-master/client/ref.h

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/client/src/ref.ts
- Cibles TS declarees : packages/client/src/ref.ts, packages/qcommon/src/q_shared.ts, packages/client/src/cl_scrn.ts, packages/client/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| macro | MAX_DLIGHTS | 23 | a-auditer | |
| macro | MAX_ENTITIES | 24 | a-auditer | |
| macro | MAX_PARTICLES | 25 | a-auditer | |
| macro | MAX_LIGHTSTYLES | 26 | a-auditer | |
| macro | POWERSUIT_SCALE | 28 | a-auditer | |
| macro | SHELL_RED_COLOR | 30 | a-auditer | |
| macro | SHELL_GREEN_COLOR | 31 | a-auditer | |
| macro | SHELL_BLUE_COLOR | 32 | a-auditer | |
| macro | SHELL_RG_COLOR | 34 | a-auditer | |
| macro | SHELL_RB_COLOR | 36 | a-auditer | |
| macro | SHELL_BG_COLOR | 37 | a-auditer | |
| macro | SHELL_DOUBLE_COLOR | 40 | a-auditer | |
| macro | SHELL_HALF_DAM_COLOR | 41 | a-auditer | |
| macro | SHELL_CYAN_COLOR | 42 | a-auditer | |
| macro | SHELL_WHITE_COLOR | 45 | a-auditer | |
| struct | entity_s | 47 | a-auditer | |
| global | model | 49 | a-auditer | |
| global | angles | 50 | a-auditer | |
| global | origin | 55 | a-auditer | |
| global | frame | 56 | a-auditer | |
| global | oldorigin | 61 | a-auditer | |
| global | oldframe | 62 | a-auditer | |
| global | backlerp | 67 | a-auditer | |
| global | skinnum | 68 | a-auditer | |
| global | lightstyle | 70 | a-auditer | |
| global | alpha | 71 | a-auditer | |
| global | flags | 74 | a-auditer | |
| macro | ENTITY_FLAGS | 78 | a-auditer | |
| struct | dlight_t | 80 | a-auditer | |
| global | intensity | 84 | a-auditer | |
| struct | particle_t | 87 | a-auditer | |
| global | color | 90 | a-auditer | |
| global | alpha | 91 | a-auditer | |
| struct | lightstyle_t | 94 | a-auditer | |
| global | rgb | 96 | a-auditer | |
| global | white | 97 | a-auditer | |
| struct | refdef_t | 100 | a-auditer | |
| global | vieworg | 104 | a-auditer | |
| global | viewangles | 105 | a-auditer | |
| global | blend | 106 | a-auditer | |
| global | time | 107 | a-auditer | |
| global | rdflags | 108 | a-auditer | |
| global | areabits | 110 | a-auditer | |
| global | num_entities | 114 | a-auditer | |
| global | num_dlights | 117 | a-auditer | |
| global | num_particles | 120 | a-auditer | |
| macro | API_VERSION | 126 | a-auditer | |
| struct | refexport_t | 131 | a-auditer | |
| global | api_version | 134 | a-auditer | |
| struct | refimport_t | 189 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

