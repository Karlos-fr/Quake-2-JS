# Inventaire runtime Phase 03 - Quake-2-master/game/g_weapon.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/game/src/g_weapon.ts
- Cibles TS declarees : packages/game/src/g_weapon.ts, packages/game/src/g_combat.ts, packages/game/src/g_utils.ts, packages/game/src/g_items.ts, packages/game/src/runtime.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| function | check_dodge | 32 | a-auditer | |
| global | tr | 36 | a-auditer | |
| global | eta | 37 | a-auditer | |
| function | fire_hit | 63 | a-auditer | |
| global | tr | 65 | a-auditer | |
| global | v | 67 | a-auditer | |
| global | point | 68 | a-auditer | |
| global | range | 69 | a-auditer | |
| global | dir | 70 | a-auditer | |
| global | aim | 89 | a-auditer | |
| function | fire_lead | 134 | a-auditer | |
| global | tr | 136 | a-auditer | |
| global | dir | 137 | a-auditer | |
| global | end | 139 | a-auditer | |
| global | r | 140 | a-auditer | |
| global | u | 141 | a-auditer | |
| global | water_start | 142 | a-auditer | |
| global | water | 143 | a-auditer | |
| global | content_mask | 144 | a-auditer | |
| global | color | 170 | a-auditer | |
| global | color | 182 | a-auditer | |
| global | color | 189 | a-auditer | |
| global | tr | 255 | a-auditer | |
| function | fire_bullet | 277 | a-auditer | |
| function | fire_shotgun | 290 | a-auditer | |
| global | i | 292 | a-auditer | |
| function | blaster_touch | 306 | a-auditer | |
| global | mod | 308 | a-auditer | |
| global | mod | 327 | a-auditer | |
| function | fire_blaster | 345 | a-auditer | |
| global | bolt | 347 | a-auditer | |
| global | tr | 348 | a-auditer | |
| function | Grenade_Explode | 398 | a-auditer | |
| global | origin | 400 | a-auditer | |
| global | mod | 401 | a-auditer | |
| global | points | 409 | a-auditer | |
| global | mod | 421 | a-auditer | |
| global | mod | 430 | a-auditer | |
| function | Grenade_Touch | 455 | a-auditer | |
| function | fire_grenade | 486 | a-auditer | |
| global | grenade | 488 | a-auditer | |
| function | fire_grenade2 | 519 | a-auditer | |
| global | grenade | 521 | a-auditer | |
| function | rocket_touch | 569 | a-auditer | |
| global | origin | 571 | a-auditer | |
| global | n | 572 | a-auditer | |
| function | fire_rocket | 620 | a-auditer | |
| global | rocket | 622 | a-auditer | |
| function | fire_rail | 658 | a-auditer | |
| global | from | 660 | a-auditer | |
| global | end | 661 | a-auditer | |
| global | tr | 662 | a-auditer | |
| global | ignore | 663 | a-auditer | |
| global | mask | 664 | a-auditer | |
| global | water | 665 | a-auditer | |
| global | ignore | 686 | a-auditer | |
| function | bfg_explode | 721 | a-auditer | |
| global | ent | 723 | a-auditer | |
| global | points | 724 | a-auditer | |
| global | dist | 726 | a-auditer | |
| function | bfg_touch | 765 | a-auditer | |
| function | bfg_think | 804 | a-auditer | |
| global | ent | 806 | a-auditer | |
| global | ignore | 807 | a-auditer | |
| global | dmg | 812 | a-auditer | |
| global | tr | 813 | a-auditer | |
| global | dmg | 818 | a-auditer | |
| function | fire_bfg | 882 | a-auditer | |
| global | bfg | 884 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

