# Inventaire runtime Phase 03 - Quake-2-master/game/g_save.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/game/src/g_save.ts
- Cibles TS declarees : packages/game/src/g_save.ts, packages/game/src/g_main.ts, packages/game/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| macro | Function | 23 | a-auditer | |
| global | mmove_reloc | 25 | a-auditer | |
| table | fields | 27 | a-auditer | |
| global | levelfields | 122 | a-auditer | |
| table | levelfields | 122 | a-auditer | |
| global | clientfields | 134 | a-auditer | |
| table | clientfields | 134 | a-auditer | |
| function | InitGame | 152 | a-auditer | |
| function | WriteField1 | 226 | a-auditer | |
| global | p | 228 | a-auditer | |
| global | len | 229 | a-auditer | |
| global | index | 230 | a-auditer | |
| global | len | 250 | a-auditer | |
| global | index | 257 | a-auditer | |
| global | index | 264 | a-auditer | |
| global | index | 271 | a-auditer | |
| global | index | 280 | a-auditer | |
| global | index | 289 | a-auditer | |
| function | WriteField2 | 299 | a-auditer | |
| global | len | 301 | a-auditer | |
| global | p | 302 | a-auditer | |
| function | ReadField | 320 | a-auditer | |
| global | p | 322 | a-auditer | |
| global | len | 323 | a-auditer | |
| global | index | 324 | a-auditer | |
| function | WriteClient | 403 | a-auditer | |
| global | field | 405 | a-auditer | |
| function | ReadClient | 434 | a-auditer | |
| global | field | 436 | a-auditer | |
| function | WriteGame | 460 | a-auditer | |
| global | i | 463 | a-auditer | |
| global | str | 464 | a-auditer | |
| function | ReadGame | 487 | a-auditer | |
| global | i | 490 | a-auditer | |
| global | str | 491 | a-auditer | |
| function | WriteEdict | 527 | a-auditer | |
| global | field | 529 | a-auditer | |
| global | temp | 530 | a-auditer | |
| function | WriteLevelLocals | 559 | a-auditer | |
| global | field | 561 | a-auditer | |
| global | temp | 562 | a-auditer | |
| function | ReadEdict | 591 | a-auditer | |
| global | field | 593 | a-auditer | |
| function | ReadLevelLocals | 610 | a-auditer | |
| global | field | 612 | a-auditer | |
| function | WriteLevel | 628 | a-auditer | |
| global | i | 630 | a-auditer | |
| global | ent | 631 | a-auditer | |
| function | ReadLevel | 682 | a-auditer | |
| global | entnum | 684 | a-auditer | |
| global | i | 686 | a-auditer | |
| global | ent | 688 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

