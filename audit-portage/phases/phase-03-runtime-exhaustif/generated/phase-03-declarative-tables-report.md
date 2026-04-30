# Rapport tables declaratives Phase 03.D

Extraction et comparaison statique des tables declaratives critiques. Ce rapport ne remplace pas l'audit comportemental, mais transforme les absences en findings explicites.

## Resume

- Tables extraites : 289
- Tables comparees : 289
- Tables matched : 289
- Tables partielles : 0
- Tables sans cible TS : 0
- Tables a revoir : 0
- Categories obligatoires non extraites : cvars, network-messages, temp-entities, effects-renderfx, configstrings, precaches

## Comparaison

| Categorie | Source | Table | Statut | TS cible | Entrees | Match | Manquantes | Findings |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| protocol-or-effect-enum | Quake-2-master/client/cl_tent.c:24 | enum | matched | packages/client/src/cl_tent.ts | 3 | 3 | 0 | extractor:enum-constant-heuristic<br>extractor-confidence:medium |
| items-ammo-weapons | Quake-2-master/game/g_items.c:1134 | itemlist | matched | packages/game/src/g_items.ts | 323 | 323 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| spawn-functions | Quake-2-master/game/g_spawn.c:1 | spawns | matched | packages/game/src/g_spawn.ts | 108 | 108 | 0 |  |
| spawn-functions | Quake-2-master/game/g_spawn.c:148 | spawns | matched | packages/game/src/g_spawn.ts | 214 | 214 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_actor.c:39 | actor_frames_stand | matched | packages/game/src/m_actor.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_actor.c:97 | actor_frames_walk | matched | packages/game/src/m_actor.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_actor.c:119 | actor_frames_run | matched | packages/game/src/m_actor.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_actor.c:157 | actor_frames_pain1 | matched | packages/game/src/m_actor.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_actor.c:165 | actor_frames_pain2 | matched | packages/game/src/m_actor.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_actor.c:173 | actor_frames_pain3 | matched | packages/game/src/m_actor.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_actor.c:181 | actor_frames_flipoff | matched | packages/game/src/m_actor.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_actor.c:200 | actor_frames_taunt | matched | packages/game/src/m_actor.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_actor.c:309 | actor_frames_death1 | matched | packages/game/src/m_actor.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_actor.c:321 | actor_frames_death2 | matched | packages/game/src/m_actor.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_actor.c:382 | actor_frames_attack | matched | packages/game/src/m_actor.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_berserk.c:51 | berserk_frames_stand | matched | packages/game/src/m_berserk.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_berserk.c:66 | berserk_frames_stand_fidget | matched | packages/game/src/m_berserk.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_berserk.c:103 | berserk_frames_walk | matched | packages/game/src/m_berserk.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_berserk.c:150 | berserk_frames_run1 | matched | packages/game/src/m_berserk.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_berserk.c:182 | berserk_frames_attack_spike | matched | packages/game/src/m_berserk.ts | 3 | 3 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_berserk.c:204 | berserk_frames_attack_club | matched | packages/game/src/m_berserk.ts | 3 | 3 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_berserk.c:228 | berserk_frames_attack_strike | matched | packages/game/src/m_berserk.ts | 3 | 3 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_berserk.c:280 | berserk_frames_pain1 | matched | packages/game/src/m_berserk.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_berserk.c:290 | berserk_frames_pain2 | matched | packages/game/src/m_berserk.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_berserk.c:347 | berserk_frames_death1 | matched | packages/game/src/m_berserk.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_berserk.c:367 | berserk_frames_death2 | matched | packages/game/src/m_berserk.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_boss2.c:154 | boss2_frames_stand | matched | packages/game/src/m_boss2.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_boss2.c:180 | boss2_frames_fidget | matched | packages/game/src/m_boss2.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_boss2.c:215 | boss2_frames_walk | matched | packages/game/src/m_boss2.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_boss2.c:241 | boss2_frames_run | matched | packages/game/src/m_boss2.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_boss2.c:266 | boss2_frames_attack_pre_mg | matched | packages/game/src/m_boss2.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_boss2.c:282 | boss2_frames_attack_mg | matched | packages/game/src/m_boss2.ts | 3 | 3 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_boss2.c:293 | boss2_frames_attack_post_mg | matched | packages/game/src/m_boss2.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_boss2.c:302 | boss2_frames_attack_rocket | matched | packages/game/src/m_boss2.ts | 3 | 3 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_boss2.c:328 | boss2_frames_pain_heavy | matched | packages/game/src/m_boss2.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_boss2.c:351 | boss2_frames_pain_light | matched | packages/game/src/m_boss2.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_boss2.c:360 | boss2_frames_death | matched | packages/game/src/m_boss2.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_boss31.c:83 | jorg_frames_stand | matched | packages/game/src/m_boss31.ts | 4 | 4 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_boss31.c:166 | jorg_frames_run | matched | packages/game/src/m_boss31.ts | 3 | 3 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_boss31.c:189 | jorg_frames_start_walk | matched | packages/game/src/m_boss31.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_boss31.c:199 | jorg_frames_walk | matched | packages/game/src/m_boss31.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_boss31.c:218 | jorg_frames_end_walk | matched | packages/game/src/m_boss31.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_boss31.c:242 | jorg_frames_pain3 | matched | packages/game/src/m_boss31.ts | 3 | 3 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_boss31.c:272 | jorg_frames_pain2 | matched | packages/game/src/m_boss31.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_boss31.c:280 | jorg_frames_pain1 | matched | packages/game/src/m_boss31.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_boss31.c:288 | jorg_frames_death1 | matched | packages/game/src/m_boss31.ts | 3 | 3 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_boss31.c:343 | jorg_frames_attack2 | matched | packages/game/src/m_boss31.ts | 3 | 3 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_boss31.c:361 | jorg_frames_start_attack1 | matched | packages/game/src/m_boss31.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_boss31.c:374 | jorg_frames_attack1 | matched | packages/game/src/m_boss31.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_boss31.c:385 | jorg_frames_end_attack1 | matched | packages/game/src/m_boss31.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_boss32.c:73 | makron_frames_stand | matched | packages/game/src/m_boss32.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_boss32.c:143 | makron_frames_run | matched | packages/game/src/m_boss32.ts | 3 | 3 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_boss32.c:189 | makron_frames_walk | matched | packages/game/src/m_boss32.ts | 3 | 3 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_boss32.c:217 | makron_frames_pain6 | matched | packages/game/src/m_boss32.ts | 3 | 3 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_boss32.c:249 | makron_frames_pain5 | matched | packages/game/src/m_boss32.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_boss32.c:258 | makron_frames_pain4 | matched | packages/game/src/m_boss32.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_boss32.c:267 | makron_frames_death2 | matched | packages/game/src/m_boss32.ts | 5 | 5 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_boss32.c:367 | makron_frames_death3 | matched | packages/game/src/m_boss32.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_boss32.c:392 | makron_frames_sight | matched | packages/game/src/m_boss32.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_boss32.c:429 | makron_frames_attack3 | matched | packages/game/src/m_boss32.ts | 3 | 3 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_boss32.c:442 | makron_frames_attack4 | matched | packages/game/src/m_boss32.ts | 3 | 3 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_boss32.c:473 | makron_frames_attack5 | matched | packages/game/src/m_boss32.ts | 5 | 5 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_brain.c:67 | brain_frames_stand | matched | packages/game/src/m_brain.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_brain.c:114 | brain_frames_idle | matched | packages/game/src/m_brain.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_brain.c:161 | brain_frames_walk1 | matched | packages/game/src/m_brain.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_brain.c:244 | brain_frames_defense | matched | packages/game/src/m_brain.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_brain.c:258 | brain_frames_pain3 | matched | packages/game/src/m_brain.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_brain.c:269 | brain_frames_pain2 | matched | packages/game/src/m_brain.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_brain.c:282 | brain_frames_pain1 | matched | packages/game/src/m_brain.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_brain.c:339 | brain_frames_duck | matched | packages/game/src/m_brain.ts | 4 | 4 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_brain.c:365 | brain_frames_death2 | matched | packages/game/src/m_brain.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_brain.c:375 | brain_frames_death1 | matched | packages/game/src/m_brain.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_brain.c:431 | brain_frames_attack1 | matched | packages/game/src/m_brain.ts | 5 | 5 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_brain.c:481 | brain_frames_attack2 | matched | packages/game/src/m_brain.ts | 4 | 4 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_brain.c:516 | brain_frames_run | matched | packages/game/src/m_brain.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_chick.c:64 | chick_frames_fidget | matched | packages/game/src/m_chick.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_chick.c:107 | chick_frames_stand | matched | packages/game/src/m_chick.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_chick.c:148 | chick_frames_start_run | matched | packages/game/src/m_chick.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_chick.c:163 | chick_frames_run | matched | packages/game/src/m_chick.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_chick.c:180 | chick_frames_walk | matched | packages/game/src/m_chick.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_chick.c:220 | chick_frames_pain1 | matched | packages/game/src/m_chick.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_chick.c:230 | chick_frames_pain2 | matched | packages/game/src/m_chick.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_chick.c:240 | chick_frames_pain3 | matched | packages/game/src/m_chick.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_chick.c:307 | chick_frames_death2 | matched | packages/game/src/m_chick.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_chick.c:335 | chick_frames_death1 | matched | packages/game/src/m_chick.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_chick.c:418 | chick_frames_duck | matched | packages/game/src/m_chick.ts | 4 | 4 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_chick.c:480 | chick_frames_start_attack1 | matched | packages/game/src/m_chick.ts | 3 | 3 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_chick.c:499 | chick_frames_attack1 | matched | packages/game/src/m_chick.ts | 4 | 4 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_chick.c:519 | chick_frames_end_attack1 | matched | packages/game/src/m_chick.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_chick.c:549 | chick_frames_slash | matched | packages/game/src/m_chick.ts | 3 | 3 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_chick.c:563 | chick_frames_end_slash | matched | packages/game/src/m_chick.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_chick.c:598 | chick_frames_start_slash | matched | packages/game/src/m_chick.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| muzzle-flashes | Quake-2-master/game/m_flash.c:27 | monster_flash_offset | matched | packages/game/src/m_flash.ts | 0 | 0 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium<br>no-comparable-entries-extracted<br>table-name-present-but-no-comparable-entries |
| monster-tables | Quake-2-master/game/m_flipper.c:44 | flipper_frames_stand | matched | packages/game/src/m_flipper.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_flipper.c:58 | flipper_frames_run | matched | packages/game/src/m_flipper.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_flipper.c:94 | flipper_frames_run_start | matched | packages/game/src/m_flipper.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_flipper.c:111 | flipper_frames_walk | matched | packages/game/src/m_flipper.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_flipper.c:145 | flipper_frames_start_run | matched | packages/game/src/m_flipper.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_flipper.c:160 | flipper_frames_pain2 | matched | packages/game/src/m_flipper.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_flipper.c:170 | flipper_frames_pain1 | matched | packages/game/src/m_flipper.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_flipper.c:193 | flipper_frames_attack | matched | packages/game/src/m_flipper.ts | 3 | 3 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_flipper.c:261 | flipper_frames_death | matched | packages/game/src/m_flipper.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_float.c:83 | floater_frames_stand1 | matched | packages/game/src/m_float.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_float.c:140 | floater_frames_stand2 | matched | packages/game/src/m_float.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_float.c:205 | floater_frames_activate | matched | packages/game/src/m_float.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_float.c:240 | floater_frames_attack1 | matched | packages/game/src/m_float.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_float.c:259 | floater_frames_attack2 | matched | packages/game/src/m_float.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_float.c:289 | floater_frames_attack3 | matched | packages/game/src/m_float.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_float.c:328 | floater_frames_death | matched | packages/game/src/m_float.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_float.c:346 | floater_frames_pain1 | matched | packages/game/src/m_float.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_float.c:358 | floater_frames_pain2 | matched | packages/game/src/m_float.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_float.c:371 | floater_frames_pain3 | matched | packages/game/src/m_float.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_float.c:388 | floater_frames_walk | matched | packages/game/src/m_float.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_float.c:445 | floater_frames_run | matched | packages/game/src/m_float.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_flyer.c:68 | flyer_frames_stand | matched | packages/game/src/m_flyer.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_flyer.c:119 | flyer_frames_walk | matched | packages/game/src/m_flyer.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_flyer.c:169 | flyer_frames_run | matched | packages/game/src/m_flyer.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_flyer.c:237 | flyer_frames_start | matched | packages/game/src/m_flyer.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_flyer.c:248 | flyer_frames_stop | matched | packages/game/src/m_flyer.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_flyer.c:271 | flyer_frames_rollright | matched | packages/game/src/m_flyer.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_flyer.c:285 | flyer_frames_rollleft | matched | packages/game/src/m_flyer.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_flyer.c:299 | flyer_frames_pain3 | matched | packages/game/src/m_flyer.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_flyer.c:308 | flyer_frames_pain2 | matched | packages/game/src/m_flyer.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_flyer.c:317 | flyer_frames_pain1 | matched | packages/game/src/m_flyer.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_flyer.c:331 | flyer_frames_defense | matched | packages/game/src/m_flyer.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_flyer.c:342 | flyer_frames_bankright | matched | packages/game/src/m_flyer.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_flyer.c:354 | flyer_frames_bankleft | matched | packages/game/src/m_flyer.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_flyer.c:400 | flyer_frames_attack2 | matched | packages/game/src/m_flyer.ts | 3 | 3 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_flyer.c:441 | flyer_frames_start_melee | matched | packages/game/src/m_flyer.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_flyer.c:452 | flyer_frames_end_melee | matched | packages/game/src/m_flyer.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_flyer.c:461 | flyer_frames_loop_melee | matched | packages/game/src/m_flyer.ts | 3 | 3 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_gladiator.c:64 | gladiator_frames_stand | matched | packages/game/src/m_gladiator.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_gladiator.c:82 | gladiator_frames_walk | matched | packages/game/src/m_gladiator.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_gladiator.c:109 | gladiator_frames_run | matched | packages/game/src/m_gladiator.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_gladiator.c:140 | gladiator_frames_attack_melee | matched | packages/game/src/m_gladiator.ts | 3 | 3 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_gladiator.c:184 | gladiator_frames_attack_gun | matched | packages/game/src/m_gladiator.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_gladiator.c:217 | gladiator_frames_pain | matched | packages/game/src/m_gladiator.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_gladiator.c:228 | gladiator_frames_pain_air | matched | packages/game/src/m_gladiator.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_gladiator.c:281 | gladiator_frames_death | matched | packages/game/src/m_gladiator.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_gunner.c:66 | gunner_frames_fidget | matched | packages/game/src/m_gunner.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_gunner.c:132 | gunner_frames_stand | matched | packages/game/src/m_gunner.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_gunner.c:175 | gunner_frames_walk | matched | packages/game/src/m_gunner.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_gunner.c:198 | gunner_frames_run | matched | packages/game/src/m_gunner.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_gunner.c:220 | gunner_frames_runandshoot | matched | packages/game/src/m_gunner.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_gunner.c:237 | gunner_frames_pain3 | matched | packages/game/src/m_gunner.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_gunner.c:247 | gunner_frames_pain2 | matched | packages/game/src/m_gunner.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_gunner.c:260 | gunner_frames_pain1 | matched | packages/game/src/m_gunner.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_gunner.c:319 | gunner_frames_death | matched | packages/game/src/m_gunner.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_gunner.c:396 | gunner_frames_duck | matched | packages/game/src/m_gunner.ts | 4 | 4 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_gunner.c:474 | gunner_frames_attack_chain | matched | packages/game/src/m_gunner.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_gunner.c:496 | gunner_frames_fire_chain | matched | packages/game/src/m_gunner.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_gunner.c:509 | gunner_frames_endfire_chain | matched | packages/game/src/m_gunner.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_gunner.c:521 | gunner_frames_attack_grenade | matched | packages/game/src/m_gunner.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_hover.c:65 | hover_frames_stand | matched | packages/game/src/m_hover.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_hover.c:100 | hover_frames_stop1 | matched | packages/game/src/m_hover.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_hover.c:114 | hover_frames_stop2 | matched | packages/game/src/m_hover.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_hover.c:127 | hover_frames_takeoff | matched | packages/game/src/m_hover.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_hover.c:162 | hover_frames_pain3 | matched | packages/game/src/m_hover.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_hover.c:176 | hover_frames_pain2 | matched | packages/game/src/m_hover.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_hover.c:193 | hover_frames_pain1 | matched | packages/game/src/m_hover.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_hover.c:226 | hover_frames_land | matched | packages/game/src/m_hover.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_hover.c:232 | hover_frames_forward | matched | packages/game/src/m_hover.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_hover.c:272 | hover_frames_walk | matched | packages/game/src/m_hover.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_hover.c:312 | hover_frames_run | matched | packages/game/src/m_hover.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_hover.c:352 | hover_frames_death1 | matched | packages/game/src/m_hover.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_hover.c:368 | hover_frames_backward | matched | packages/game/src/m_hover.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_hover.c:397 | hover_frames_start_attack | matched | packages/game/src/m_hover.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_hover.c:405 | hover_frames_attack1 | matched | packages/game/src/m_hover.ts | 3 | 3 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_hover.c:414 | hover_frames_end_attack | matched | packages/game/src/m_hover.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_infantry.c:48 | infantry_frames_stand | matched | packages/game/src/m_infantry.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_infantry.c:81 | infantry_frames_fidget | matched | packages/game/src/m_infantry.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_infantry.c:141 | infantry_frames_walk | matched | packages/game/src/m_infantry.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_infantry.c:163 | infantry_frames_run | matched | packages/game/src/m_infantry.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_infantry.c:185 | infantry_frames_pain1 | matched | packages/game/src/m_infantry.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_infantry.c:200 | infantry_frames_pain2 | matched | packages/game/src/m_infantry.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_infantry.c:315 | infantry_frames_death1 | matched | packages/game/src/m_infantry.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_infantry.c:341 | infantry_frames_death2 | matched | packages/game/src/m_infantry.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_infantry.c:371 | infantry_frames_death3 | matched | packages/game/src/m_infantry.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_infantry.c:456 | infantry_frames_duck | matched | packages/game/src/m_infantry.ts | 4 | 4 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_infantry.c:497 | infantry_frames_attack1 | matched | packages/game/src/m_infantry.ts | 3 | 3 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_infantry.c:532 | infantry_frames_attack2 | matched | packages/game/src/m_infantry.ts | 3 | 3 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_insane.c:68 | insane_frames_stand_normal | matched | packages/game/src/m_insane.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_insane.c:79 | insane_frames_stand_insane | matched | packages/game/src/m_insane.ts | 3 | 3 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_insane.c:114 | insane_frames_uptodown | matched | packages/game/src/m_insane.ts | 3 | 3 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_insane.c:163 | insane_frames_downtoup | matched | packages/game/src/m_insane.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_insane.c:187 | insane_frames_jumpdown | matched | packages/game/src/m_insane.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_insane.c:198 | insane_frames_down | matched | packages/game/src/m_insane.ts | 5 | 5 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_insane.c:264 | insane_frames_walk_normal | matched | packages/game/src/m_insane.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_insane.c:283 | insane_frames_walk_insane | matched | packages/game/src/m_insane.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_insane.c:315 | insane_frames_stand_pain | matched | packages/game/src/m_insane.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_insane.c:331 | insane_frames_stand_death | matched | packages/game/src/m_insane.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_insane.c:353 | insane_frames_crawl | matched | packages/game/src/m_insane.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_insane.c:368 | insane_frames_crawl_pain | matched | packages/game/src/m_insane.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_insane.c:382 | insane_frames_crawl_death | matched | packages/game/src/m_insane.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_insane.c:394 | insane_frames_cross | matched | packages/game/src/m_insane.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_insane.c:414 | insane_frames_struggle_cross | matched | packages/game/src/m_insane.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_medic.c:122 | medic_frames_stand | matched | packages/game/src/m_medic.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_medic.c:224 | medic_frames_walk | matched | packages/game/src/m_medic.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_medic.c:247 | medic_frames_run | matched | packages/game/src/m_medic.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_medic.c:284 | medic_frames_pain1 | matched | packages/game/src/m_medic.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_medic.c:297 | medic_frames_pain2 | matched | packages/game/src/m_medic.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_medic.c:378 | medic_frames_death | matched | packages/game/src/m_medic.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_medic.c:473 | medic_frames_duck | matched | packages/game/src/m_medic.ts | 4 | 4 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_medic.c:505 | medic_frames_attackHyperBlaster | matched | packages/game/src/m_medic.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_medic.c:535 | medic_frames_attackBlaster | matched | packages/game/src/m_medic.ts | 3 | 3 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_medic.c:662 | medic_frames_attackCable | matched | packages/game/src/m_medic.ts | 5 | 5 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_mutant.c:82 | mutant_frames_stand | matched | packages/game/src/m_mutant.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_mutant.c:159 | mutant_frames_idle | matched | packages/game/src/m_mutant.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_mutant.c:190 | mutant_frames_walk | matched | packages/game/src/m_mutant.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_mutant.c:212 | mutant_frames_start_walk | matched | packages/game/src/m_mutant.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_mutant.c:231 | mutant_frames_run | matched | packages/game/src/m_mutant.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_mutant.c:286 | mutant_frames_attack | matched | packages/game/src/m_mutant.ts | 4 | 4 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_mutant.c:376 | mutant_frames_jump | matched | packages/game/src/m_mutant.ts | 3 | 3 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_mutant.c:459 | mutant_frames_pain1 | matched | packages/game/src/m_mutant.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_mutant.c:469 | mutant_frames_pain2 | matched | packages/game/src/m_mutant.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_mutant.c:480 | mutant_frames_pain3 | matched | packages/game/src/m_mutant.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_mutant.c:545 | mutant_frames_death1 | matched | packages/game/src/m_mutant.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_mutant.c:559 | mutant_frames_death2 | matched | packages/game/src/m_mutant.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_parasite.c:86 | parasite_frames_start_fidget | matched | packages/game/src/m_parasite.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_parasite.c:95 | parasite_frames_fidget | matched | packages/game/src/m_parasite.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_parasite.c:106 | parasite_frames_end_fidget | matched | packages/game/src/m_parasite.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_parasite.c:143 | parasite_frames_stand | matched | packages/game/src/m_parasite.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_parasite.c:171 | parasite_frames_run | matched | packages/game/src/m_parasite.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_parasite.c:183 | parasite_frames_start_run | matched | packages/game/src/m_parasite.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_parasite.c:190 | parasite_frames_stop_run | matched | packages/game/src/m_parasite.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_parasite.c:218 | parasite_frames_walk | matched | packages/game/src/m_parasite.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_parasite.c:230 | parasite_frames_start_walk | matched | packages/game/src/m_parasite.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_parasite.c:237 | parasite_frames_stop_walk | matched | packages/game/src/m_parasite.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_parasite.c:259 | parasite_frames_pain1 | matched | packages/game/src/m_parasite.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_parasite.c:366 | parasite_frames_drain | matched | packages/game/src/m_parasite.ts | 4 | 4 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_parasite.c:390 | parasite_frames_break | matched | packages/game/src/m_parasite.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_parasite.c:459 | parasite_frames_death | matched | packages/game/src/m_parasite.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_soldier.c:63 | soldier_frames_stand1 | matched | packages/game/src/m_soldier.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_soldier.c:100 | soldier_frames_stand3 | matched | packages/game/src/m_soldier.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_soldier.c:230 | soldier_frames_walk1 | matched | packages/game/src/m_soldier.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_soldier.c:268 | soldier_frames_walk2 | matched | packages/game/src/m_soldier.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_soldier.c:298 | soldier_frames_start_run | matched | packages/game/src/m_soldier.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_soldier.c:305 | soldier_frames_run | matched | packages/game/src/m_soldier.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_soldier.c:341 | soldier_frames_pain1 | matched | packages/game/src/m_soldier.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_soldier.c:351 | soldier_frames_pain2 | matched | packages/game/src/m_soldier.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_soldier.c:363 | soldier_frames_pain3 | matched | packages/game/src/m_soldier.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_soldier.c:386 | soldier_frames_pain4 | matched | packages/game/src/m_soldier.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| muzzle-flashes | Quake-2-master/game/m_soldier.c:458 | blaster_flash | matched | packages/game/src/m_soldier.ts | 27 | 27 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_soldier.c:609 | soldier_frames_attack2 | matched | packages/game/src/m_soldier.ts | 5 | 5 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_soldier.c:665 | soldier_frames_attack3 | matched | packages/game/src/m_soldier.ts | 4 | 4 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_soldier.c:692 | soldier_frames_attack4 | matched | packages/game/src/m_soldier.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_soldier.c:753 | soldier_frames_attack6 | matched | packages/game/src/m_soldier.ts | 3 | 3 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_soldier.c:818 | soldier_frames_duck | matched | packages/game/src/m_soldier.ts | 4 | 4 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_soldier.c:894 | soldier_frames_death1 | matched | packages/game/src/m_soldier.ts | 3 | 3 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_soldier.c:938 | soldier_frames_death2 | matched | packages/game/src/m_soldier.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_soldier.c:981 | soldier_frames_death3 | matched | packages/game/src/m_soldier.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_soldier.c:1035 | soldier_frames_death4 | matched | packages/game/src/m_soldier.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_soldier.c:1098 | soldier_frames_death5 | matched | packages/game/src/m_soldier.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_soldier.c:1129 | soldier_frames_death6 | matched | packages/game/src/m_soldier.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_supertank.c:68 | supertank_frames_stand | matched | packages/game/src/m_supertank.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_supertank.c:139 | supertank_frames_run | matched | packages/game/src/m_supertank.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_supertank.c:167 | supertank_frames_forward | matched | packages/game/src/m_supertank.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_supertank.c:208 | supertank_frames_turn_right | matched | packages/game/src/m_supertank.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_supertank.c:231 | supertank_frames_turn_left | matched | packages/game/src/m_supertank.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_supertank.c:255 | supertank_frames_pain3 | matched | packages/game/src/m_supertank.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_supertank.c:264 | supertank_frames_pain2 | matched | packages/game/src/m_supertank.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_supertank.c:273 | supertank_frames_pain1 | matched | packages/game/src/m_supertank.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_supertank.c:282 | supertank_frames_death1 | matched | packages/game/src/m_supertank.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_supertank.c:311 | supertank_frames_backward | matched | packages/game/src/m_supertank.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_supertank.c:334 | supertank_frames_attack4 | matched | packages/game/src/m_supertank.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_supertank.c:345 | supertank_frames_attack3 | matched | packages/game/src/m_supertank.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_supertank.c:377 | supertank_frames_attack2 | matched | packages/game/src/m_supertank.ts | 3 | 3 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_supertank.c:409 | supertank_frames_attack1 | matched | packages/game/src/m_supertank.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_supertank.c:421 | supertank_frames_end_attack1 | matched | packages/game/src/m_supertank.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_tank.c:80 | tank_frames_stand | matched | packages/game/src/m_tank.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_tank.c:127 | tank_frames_start_walk | matched | packages/game/src/m_tank.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_tank.c:136 | tank_frames_walk | matched | packages/game/src/m_tank.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_tank.c:157 | tank_frames_stop_walk | matched | packages/game/src/m_tank.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_tank.c:179 | tank_frames_start_run | matched | packages/game/src/m_tank.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_tank.c:188 | tank_frames_run | matched | packages/game/src/m_tank.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_tank.c:209 | tank_frames_stop_run | matched | packages/game/src/m_tank.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_tank.c:247 | tank_frames_pain1 | matched | packages/game/src/m_tank.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_tank.c:256 | tank_frames_pain2 | matched | packages/game/src/m_tank.ts | 1 | 1 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_tank.c:266 | tank_frames_pain3 | matched | packages/game/src/m_tank.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_tank.c:424 | tank_frames_attack_blast | matched | packages/game/src/m_tank.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_tank.c:445 | tank_frames_reattack_blast | matched | packages/game/src/m_tank.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_tank.c:456 | tank_frames_attack_post_blast | matched | packages/game/src/m_tank.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_tank.c:487 | tank_frames_attack_strike | matched | packages/game/src/m_tank.ts | 4 | 4 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_tank.c:530 | tank_frames_attack_pre_rocket | matched | packages/game/src/m_tank.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_tank.c:558 | tank_frames_attack_fire_rocket | matched | packages/game/src/m_tank.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_tank.c:572 | tank_frames_attack_post_rocket | matched | packages/game/src/m_tank.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_tank.c:602 | tank_frames_attack_chain | matched | packages/game/src/m_tank.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| monster-tables | Quake-2-master/game/m_tank.c:716 | tank_frames_death1 | matched | packages/game/src/m_tank.ts | 2 | 2 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |
| commands | Quake-2-master/server/sv_user.c:451 | ucmds | matched | packages/server/src/sv_user.ts | 18 | 18 | 0 | extractor:array-table-heuristic<br>extractor-confidence:medium |

## Categories obligatoires sans extraction

- cvars: required-category-not-extracted
- network-messages: required-category-not-extracted
- temp-entities: required-category-not-extracted
- effects-renderfx: required-category-not-extracted
- configstrings: required-category-not-extracted
- precaches: required-category-not-extracted

## Extraction brute

| Categorie | Fichier | Ligne | Table | Entrees extraites | Notes |
| --- | --- | --- | --- | --- | --- |
| protocol-or-effect-enum | Quake-2-master/client/cl_tent.c | 24 | enum | RF_TRANSLUCENT<br>RF_FULLBRIGHT<br>RF_TRANSLUCENT<br>RF_BEAM | enum-constant-heuristic |
| items-ammo-weapons | Quake-2-master/game/g_items.c | 1134 | itemlist | item_armor_body<br>misc/ar1_pkup.wav<br>models/items/armor/body/tris.md2<br>i_bodyarmor<br>Body Armor<br>
	},



	{
		<br>, 
		Pickup_Armor,
		NULL,
		NULL,
		NULL,
		<br>,
		<br>, EF_ROTATE,
		NULL,
		<br>,
	<br>,
		3,
		0,
		NULL,
		IT_ARMOR,
		0,
		&combatarmor_info,
		ARMOR_COMBAT,
 <br>,
		3,
		0,
		NULL,
		IT_ARMOR,
		0,
		&jacketarmor_info,
		ARMOR_JACKET,
 <br>,
		3,
		0,
		NULL,
		IT_ARMOR,
		0,
		NULL,
		ARMOR_SHARD,
 <br>
	},




	{
		<br>, 
		Pickup_PowerArmor,
		Use_PowerArmor,
		Drop_PowerArmor,
		NULL,
		<br>,
		0,
		60,
		NULL,
		IT_ARMOR,
		0,
		NULL,
		0,
 <br>,
		Pickup_PowerArmor,
		Use_PowerArmor,
		Drop_PowerArmor,
		NULL,
		<br>
	},


	
	
	




	{
		<br>, 
		NULL,
		Use_Weapon,
		NULL,
		Weapon_Blaster,
		<br>,
		NULL, 0,
		<br>,
		0,
		0,
		NULL,
		IT_WEAPON\|IT_STAY_COOP,
		WEAP_BLASTER,
		NULL,
		0,
 <br>, 
		Pickup_Weapon,
		Use_Weapon,
		Drop_Weapon,
		Weapon_Shotgun,
		<br>, EF_ROTATE,
		<br>,
		0,
		1,
		<br>,
		IT_WEAPON\|IT_STAY_COOP,
		WEAP_SHOTGUN,
		NULL,
		0,
 <br>, 
		Pickup_Weapon,
		Use_Weapon,
		Drop_Weapon,
		Weapon_SuperShotgun,
		<br>,
		0,
		2,
		<br>,
		IT_WEAPON\|IT_STAY_COOP,
		WEAP_SUPERSHOTGUN,
		NULL,
		0,
 <br>, 
		Pickup_Weapon,
		Use_Weapon,
		Drop_Weapon,
		Weapon_Machinegun,
		<br>,
		IT_WEAPON\|IT_STAY_COOP,
		WEAP_MACHINEGUN,
		NULL,
		0,
 <br>, 
		Pickup_Weapon,
		Use_Weapon,
		Drop_Weapon,
		Weapon_Chaingun,
		<br>,
		IT_WEAPON\|IT_STAY_COOP,
		WEAP_CHAINGUN,
		NULL,
		0,
 <br>,
		Pickup_Ammo,
		Use_Weapon,
		Drop_Ammo,
		Weapon_Grenade,
		<br>, 0,
		<br>,
		3,
		5,
		<br>,
		IT_AMMO\|IT_WEAPON,
		WEAP_GRENADES,
		NULL,
		AMMO_GRENADES,
 <br>,
		Pickup_Weapon,
		Use_Weapon,
		Drop_Weapon,
		Weapon_GrenadeLauncher,
		<br>,
		IT_WEAPON\|IT_STAY_COOP,
		WEAP_GRENADELAUNCHER,
		NULL,
		0,
 <br>,
		Pickup_Weapon,
		Use_Weapon,
		Drop_Weapon,
		Weapon_RocketLauncher,
		<br>,
		IT_WEAPON\|IT_STAY_COOP,
		WEAP_ROCKETLAUNCHER,
		NULL,
		0,
  | array-table-heuristic |
| spawn-functions | Quake-2-master/game/g_spawn.c | 1 | spawns | item_health -> SP_item_health<br>item_health_small -> SP_item_health_small<br>item_health_large -> SP_item_health_large<br>item_health_mega -> SP_item_health_mega<br>info_player_start -> SP_info_player_start<br>info_player_deathmatch -> SP_info_player_deathmatch<br>info_player_coop -> SP_info_player_coop<br>info_player_intermission -> SP_info_player_intermission<br>func_plat -> SP_func_plat<br>func_button -> SP_func_button<br>func_door -> SP_func_door<br>func_door_secret -> SP_func_door_secret<br>func_door_rotating -> SP_func_door_rotating<br>func_rotating -> SP_func_rotating<br>func_train -> SP_func_train<br>func_water -> SP_func_water<br>func_conveyor -> SP_func_conveyor<br>func_areaportal -> SP_func_areaportal<br>func_clock -> SP_func_clock<br>func_wall -> SP_func_wall<br>func_object -> SP_func_object<br>func_timer -> SP_func_timer<br>func_explosive -> SP_func_explosive<br>func_killbox -> SP_func_killbox<br>trigger_always -> SP_trigger_always<br>trigger_once -> SP_trigger_once<br>trigger_multiple -> SP_trigger_multiple<br>trigger_relay -> SP_trigger_relay<br>trigger_push -> SP_trigger_push<br>trigger_hurt -> SP_trigger_hurt<br>trigger_key -> SP_trigger_key<br>trigger_counter -> SP_trigger_counter<br>trigger_elevator -> SP_trigger_elevator<br>trigger_gravity -> SP_trigger_gravity<br>trigger_monsterjump -> SP_trigger_monsterjump<br>target_temp_entity -> SP_target_temp_entity<br>target_speaker -> SP_target_speaker<br>target_explosion -> SP_target_explosion<br>target_changelevel -> SP_target_changelevel<br>target_secret -> SP_target_secret |  |
| spawn-functions | Quake-2-master/game/g_spawn.c | 148 | spawns | item_health<br>item_health_small<br>item_health_large<br>item_health_mega<br>info_player_start<br>info_player_deathmatch<br>info_player_coop<br>info_player_intermission<br>func_plat<br>func_button<br>func_door<br>func_door_secret<br>func_door_rotating<br>func_rotating<br>func_train<br>func_water<br>func_conveyor<br>func_areaportal<br>func_clock<br>func_wall<br>func_object<br>func_timer<br>func_explosive<br>func_killbox<br>trigger_always<br>trigger_once<br>trigger_multiple<br>trigger_relay<br>trigger_push<br>trigger_hurt<br>trigger_key<br>trigger_counter<br>trigger_elevator<br>trigger_gravity<br>trigger_monsterjump<br>target_temp_entity<br>target_speaker<br>target_explosion<br>target_changelevel<br>target_secret | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_actor.c | 39 | actor_frames_stand | ai_stand | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_actor.c | 97 | actor_frames_walk | ai_walk | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_actor.c | 119 | actor_frames_run | ai_run | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_actor.c | 157 | actor_frames_pain1 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_actor.c | 165 | actor_frames_pain2 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_actor.c | 173 | actor_frames_pain3 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_actor.c | 181 | actor_frames_flipoff | ai_turn | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_actor.c | 200 | actor_frames_taunt | ai_turn | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_actor.c | 309 | actor_frames_death1 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_actor.c | 321 | actor_frames_death2 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_actor.c | 382 | actor_frames_attack | ai_charge<br>actor_fire | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_berserk.c | 51 | berserk_frames_stand | ai_stand<br>berserk_fidget | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_berserk.c | 66 | berserk_frames_stand_fidget | ai_stand | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_berserk.c | 103 | berserk_frames_walk | ai_walk | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_berserk.c | 150 | berserk_frames_run1 | ai_run | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_berserk.c | 182 | berserk_frames_attack_spike | ai_charge<br>berserk_swing<br>berserk_attack_spike | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_berserk.c | 204 | berserk_frames_attack_club | ai_charge<br>berserk_swing<br>berserk_attack_club | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_berserk.c | 228 | berserk_frames_attack_strike | ai_move<br>berserk_swing<br>berserk_strike | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_berserk.c | 280 | berserk_frames_pain1 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_berserk.c | 290 | berserk_frames_pain2 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_berserk.c | 347 | berserk_frames_death1 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_berserk.c | 367 | berserk_frames_death2 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_boss2.c | 154 | boss2_frames_stand | ai_stand | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_boss2.c | 180 | boss2_frames_fidget | ai_stand | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_boss2.c | 215 | boss2_frames_walk | ai_walk | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_boss2.c | 241 | boss2_frames_run | ai_run | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_boss2.c | 266 | boss2_frames_attack_pre_mg | ai_charge<br>boss2_attack_mg | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_boss2.c | 282 | boss2_frames_attack_mg | ai_charge<br>Boss2MachineGun<br>boss2_reattack_mg | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_boss2.c | 293 | boss2_frames_attack_post_mg | ai_charge | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_boss2.c | 302 | boss2_frames_attack_rocket | ai_charge<br>ai_move<br>Boss2Rocket | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_boss2.c | 328 | boss2_frames_pain_heavy | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_boss2.c | 351 | boss2_frames_pain_light | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_boss2.c | 360 | boss2_frames_death | ai_move<br>BossExplode | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_boss31.c | 83 | jorg_frames_stand | ai_stand<br>jorg_idle<br>jorg_step_left<br>jorg_step_right | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_boss31.c | 166 | jorg_frames_run | ai_run<br>jorg_step_left<br>jorg_step_right | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_boss31.c | 189 | jorg_frames_start_walk | ai_walk | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_boss31.c | 199 | jorg_frames_walk | ai_walk | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_boss31.c | 218 | jorg_frames_end_walk | ai_walk | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_boss31.c | 242 | jorg_frames_pain3 | ai_move<br>jorg_step_left<br>jorg_step_right | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_boss31.c | 272 | jorg_frames_pain2 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_boss31.c | 280 | jorg_frames_pain1 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_boss31.c | 288 | jorg_frames_death1 | ai_move<br>MakronToss<br>BossExplode | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_boss31.c | 343 | jorg_frames_attack2 | ai_charge<br>jorgBFG<br>ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_boss31.c | 361 | jorg_frames_start_attack1 | ai_charge | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_boss31.c | 374 | jorg_frames_attack1 | ai_charge<br>jorg_firebullet | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_boss31.c | 385 | jorg_frames_end_attack1 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_boss32.c | 73 | makron_frames_stand | ai_stand | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_boss32.c | 143 | makron_frames_run | ai_run<br>makron_step_left<br>makron_step_right | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_boss32.c | 189 | makron_frames_walk | ai_walk<br>makron_step_left<br>makron_step_right | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_boss32.c | 217 | makron_frames_pain6 | ai_move<br>makron_popup<br>makron_taunt | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_boss32.c | 249 | makron_frames_pain5 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_boss32.c | 258 | makron_frames_pain4 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_boss32.c | 267 | makron_frames_death2 | ai_move<br>makron_step_left<br>makron_step_right<br>makron_hit<br>makron_brainsplorch | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_boss32.c | 367 | makron_frames_death3 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_boss32.c | 392 | makron_frames_sight | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_boss32.c | 429 | makron_frames_attack3 | ai_charge<br>makronBFG<br>ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_boss32.c | 442 | makron_frames_attack4 | ai_charge<br>ai_move<br>MakronHyperblaster | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_boss32.c | 473 | makron_frames_attack5 | ai_charge<br>makron_prerailgun<br>MakronSaveloc<br>ai_move<br>MakronRailgun | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_brain.c | 67 | brain_frames_stand | ai_stand | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_brain.c | 114 | brain_frames_idle | ai_stand | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_brain.c | 161 | brain_frames_walk1 | ai_walk | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_brain.c | 244 | brain_frames_defense | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_brain.c | 258 | brain_frames_pain3 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_brain.c | 269 | brain_frames_pain2 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_brain.c | 282 | brain_frames_pain1 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_brain.c | 339 | brain_frames_duck | ai_move<br>brain_duck_down<br>brain_duck_hold<br>brain_duck_up | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_brain.c | 365 | brain_frames_death2 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_brain.c | 375 | brain_frames_death1 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_brain.c | 431 | brain_frames_attack1 | ai_charge<br>brain_swing_right<br>brain_hit_right<br>brain_swing_left<br>brain_hit_left | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_brain.c | 481 | brain_frames_attack2 | ai_charge<br>brain_chest_open<br>brain_tentacle_attack<br>brain_chest_closed | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_brain.c | 516 | brain_frames_run | ai_run | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_chick.c | 64 | chick_frames_fidget | ai_stand<br>ChickMoan | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_chick.c | 107 | chick_frames_stand | ai_stand<br>chick_fidget | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_chick.c | 148 | chick_frames_start_run | ai_run | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_chick.c | 163 | chick_frames_run | ai_run | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_chick.c | 180 | chick_frames_walk | ai_walk | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_chick.c | 220 | chick_frames_pain1 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_chick.c | 230 | chick_frames_pain2 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_chick.c | 240 | chick_frames_pain3 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_chick.c | 307 | chick_frames_death2 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_chick.c | 335 | chick_frames_death1 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_chick.c | 418 | chick_frames_duck | ai_move<br>chick_duck_down<br>chick_duck_hold<br>chick_duck_up | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_chick.c | 480 | chick_frames_start_attack1 | ai_charge<br>Chick_PreAttack1<br>chick_attack1 | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_chick.c | 499 | chick_frames_attack1 | ai_charge<br>ChickRocket<br>ChickReload<br>chick_rerocket | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_chick.c | 519 | chick_frames_end_attack1 | ai_charge | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_chick.c | 549 | chick_frames_slash | ai_charge<br>ChickSlash<br>chick_reslash | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_chick.c | 563 | chick_frames_end_slash | ai_charge | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_chick.c | 598 | chick_frames_start_slash | ai_charge | array-table-heuristic |
| muzzle-flashes | Quake-2-master/game/m_flash.c | 27 | monster_flash_offset |  | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_flipper.c | 44 | flipper_frames_stand | ai_stand | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_flipper.c | 58 | flipper_frames_run | ai_run<br>FLIPPER_RUN_SPEED | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_flipper.c | 94 | flipper_frames_run_start | ai_run | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_flipper.c | 111 | flipper_frames_walk | ai_walk | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_flipper.c | 145 | flipper_frames_start_run | ai_run<br>flipper_run | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_flipper.c | 160 | flipper_frames_pain2 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_flipper.c | 170 | flipper_frames_pain1 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_flipper.c | 193 | flipper_frames_attack | ai_charge<br>flipper_preattack<br>flipper_bite | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_flipper.c | 261 | flipper_frames_death | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_float.c | 83 | floater_frames_stand1 | ai_stand | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_float.c | 140 | floater_frames_stand2 | ai_stand | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_float.c | 205 | floater_frames_activate | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_float.c | 240 | floater_frames_attack1 | ai_charge<br>floater_fire_blaster | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_float.c | 259 | floater_frames_attack2 | ai_charge<br>floater_wham | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_float.c | 289 | floater_frames_attack3 | ai_charge<br>floater_zap | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_float.c | 328 | floater_frames_death | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_float.c | 346 | floater_frames_pain1 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_float.c | 358 | floater_frames_pain2 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_float.c | 371 | floater_frames_pain3 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_float.c | 388 | floater_frames_walk | ai_walk | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_float.c | 445 | floater_frames_run | ai_run | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_flyer.c | 68 | flyer_frames_stand | ai_stand | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_flyer.c | 119 | flyer_frames_walk | ai_walk | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_flyer.c | 169 | flyer_frames_run | ai_run | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_flyer.c | 237 | flyer_frames_start | ai_move<br>flyer_nextmove | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_flyer.c | 248 | flyer_frames_stop | ai_move<br>flyer_nextmove | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_flyer.c | 271 | flyer_frames_rollright | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_flyer.c | 285 | flyer_frames_rollleft | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_flyer.c | 299 | flyer_frames_pain3 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_flyer.c | 308 | flyer_frames_pain2 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_flyer.c | 317 | flyer_frames_pain1 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_flyer.c | 331 | flyer_frames_defense | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_flyer.c | 342 | flyer_frames_bankright | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_flyer.c | 354 | flyer_frames_bankleft | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_flyer.c | 400 | flyer_frames_attack2 | ai_charge<br>flyer_fireleft<br>flyer_fireright | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_flyer.c | 441 | flyer_frames_start_melee | ai_charge<br>flyer_pop_blades | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_flyer.c | 452 | flyer_frames_end_melee | ai_charge | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_flyer.c | 461 | flyer_frames_loop_melee | ai_charge<br>flyer_slash_left<br>flyer_slash_right | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_gladiator.c | 64 | gladiator_frames_stand | ai_stand | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_gladiator.c | 82 | gladiator_frames_walk | ai_walk | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_gladiator.c | 109 | gladiator_frames_run | ai_run | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_gladiator.c | 140 | gladiator_frames_attack_melee | ai_charge<br>gladiator_cleaver_swing<br>GaldiatorMelee | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_gladiator.c | 184 | gladiator_frames_attack_gun | ai_charge<br>GladiatorGun | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_gladiator.c | 217 | gladiator_frames_pain | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_gladiator.c | 228 | gladiator_frames_pain_air | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_gladiator.c | 281 | gladiator_frames_death | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_gunner.c | 66 | gunner_frames_fidget | ai_stand<br>gunner_idlesound | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_gunner.c | 132 | gunner_frames_stand | ai_stand<br>gunner_fidget | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_gunner.c | 175 | gunner_frames_walk | ai_walk | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_gunner.c | 198 | gunner_frames_run | ai_run | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_gunner.c | 220 | gunner_frames_runandshoot | ai_run | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_gunner.c | 237 | gunner_frames_pain3 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_gunner.c | 247 | gunner_frames_pain2 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_gunner.c | 260 | gunner_frames_pain1 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_gunner.c | 319 | gunner_frames_death | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_gunner.c | 396 | gunner_frames_duck | ai_move<br>gunner_duck_down<br>gunner_duck_hold<br>gunner_duck_up | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_gunner.c | 474 | gunner_frames_attack_chain | ai_charge<br>gunner_opengun | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_gunner.c | 496 | gunner_frames_fire_chain | ai_charge<br>GunnerFire | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_gunner.c | 509 | gunner_frames_endfire_chain | ai_charge | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_gunner.c | 521 | gunner_frames_attack_grenade | ai_charge<br>GunnerGrenade | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_hover.c | 65 | hover_frames_stand | ai_stand | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_hover.c | 100 | hover_frames_stop1 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_hover.c | 114 | hover_frames_stop2 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_hover.c | 127 | hover_frames_takeoff | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_hover.c | 162 | hover_frames_pain3 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_hover.c | 176 | hover_frames_pain2 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_hover.c | 193 | hover_frames_pain1 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_hover.c | 226 | hover_frames_land | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_hover.c | 232 | hover_frames_forward | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_hover.c | 272 | hover_frames_walk | ai_walk | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_hover.c | 312 | hover_frames_run | ai_run | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_hover.c | 352 | hover_frames_death1 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_hover.c | 368 | hover_frames_backward | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_hover.c | 397 | hover_frames_start_attack | ai_charge | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_hover.c | 405 | hover_frames_attack1 | ai_charge<br>hover_fire_blaster<br>hover_reattack | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_hover.c | 414 | hover_frames_end_attack | ai_charge | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_infantry.c | 48 | infantry_frames_stand | ai_stand | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_infantry.c | 81 | infantry_frames_fidget | ai_stand | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_infantry.c | 141 | infantry_frames_walk | ai_walk | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_infantry.c | 163 | infantry_frames_run | ai_run | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_infantry.c | 185 | infantry_frames_pain1 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_infantry.c | 200 | infantry_frames_pain2 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_infantry.c | 315 | infantry_frames_death1 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_infantry.c | 341 | infantry_frames_death2 | ai_move<br>InfantryMachineGun | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_infantry.c | 371 | infantry_frames_death3 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_infantry.c | 456 | infantry_frames_duck | ai_move<br>infantry_duck_down<br>infantry_duck_hold<br>infantry_duck_up | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_infantry.c | 497 | infantry_frames_attack1 | ai_charge<br>infantry_cock_gun<br>infantry_fire | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_infantry.c | 532 | infantry_frames_attack2 | ai_charge<br>infantry_swing<br>infantry_smack | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_insane.c | 68 | insane_frames_stand_normal | ai_stand<br>insane_checkdown | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_insane.c | 79 | insane_frames_stand_insane | ai_stand<br>insane_shake<br>insane_checkdown | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_insane.c | 114 | insane_frames_uptodown | ai_move<br>insane_moan<br>insane_fist | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_insane.c | 163 | insane_frames_downtoup | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_insane.c | 187 | insane_frames_jumpdown | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_insane.c | 198 | insane_frames_down | ai_move<br>insane_fist<br>insane_moan<br>insane_scream<br>insane_checkup | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_insane.c | 264 | insane_frames_walk_normal | ai_walk<br>insane_scream | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_insane.c | 283 | insane_frames_walk_insane | ai_walk<br>insane_scream | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_insane.c | 315 | insane_frames_stand_pain | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_insane.c | 331 | insane_frames_stand_death | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_insane.c | 353 | insane_frames_crawl | ai_walk<br>insane_scream | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_insane.c | 368 | insane_frames_crawl_pain | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_insane.c | 382 | insane_frames_crawl_death | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_insane.c | 394 | insane_frames_cross | ai_move<br>insane_moan | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_insane.c | 414 | insane_frames_struggle_cross | ai_move<br>insane_scream | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_medic.c | 122 | medic_frames_stand | ai_stand<br>medic_idle | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_medic.c | 224 | medic_frames_walk | ai_walk | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_medic.c | 247 | medic_frames_run | ai_run | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_medic.c | 284 | medic_frames_pain1 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_medic.c | 297 | medic_frames_pain2 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_medic.c | 378 | medic_frames_death | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_medic.c | 473 | medic_frames_duck | ai_move<br>medic_duck_down<br>medic_duck_hold<br>medic_duck_up | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_medic.c | 505 | medic_frames_attackHyperBlaster | ai_charge<br>medic_fire_blaster | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_medic.c | 535 | medic_frames_attackBlaster | ai_charge<br>medic_fire_blaster<br>medic_continue | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_medic.c | 662 | medic_frames_attackCable | ai_move<br>ai_charge<br>medic_hook_launch<br>medic_cable_attack<br>medic_hook_retract | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_mutant.c | 82 | mutant_frames_stand | ai_stand | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_mutant.c | 159 | mutant_frames_idle | ai_stand<br>mutant_idle_loop | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_mutant.c | 190 | mutant_frames_walk | ai_walk | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_mutant.c | 212 | mutant_frames_start_walk | ai_walk | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_mutant.c | 231 | mutant_frames_run | ai_run<br>mutant_step | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_mutant.c | 286 | mutant_frames_attack | ai_charge<br>mutant_hit_left<br>mutant_hit_right<br>mutant_check_refire | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_mutant.c | 376 | mutant_frames_jump | ai_charge<br>mutant_jump_takeoff<br>mutant_check_landing | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_mutant.c | 459 | mutant_frames_pain1 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_mutant.c | 469 | mutant_frames_pain2 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_mutant.c | 480 | mutant_frames_pain3 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_mutant.c | 545 | mutant_frames_death1 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_mutant.c | 559 | mutant_frames_death2 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_parasite.c | 86 | parasite_frames_start_fidget | ai_stand | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_parasite.c | 95 | parasite_frames_fidget | ai_stand<br>parasite_scratch | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_parasite.c | 106 | parasite_frames_end_fidget | ai_stand<br>parasite_scratch | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_parasite.c | 143 | parasite_frames_stand | ai_stand<br>parasite_tap | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_parasite.c | 171 | parasite_frames_run | ai_run | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_parasite.c | 183 | parasite_frames_start_run | ai_run | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_parasite.c | 190 | parasite_frames_stop_run | ai_run | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_parasite.c | 218 | parasite_frames_walk | ai_walk | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_parasite.c | 230 | parasite_frames_start_walk | ai_walk<br>parasite_walk | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_parasite.c | 237 | parasite_frames_stop_walk | ai_walk | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_parasite.c | 259 | parasite_frames_pain1 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_parasite.c | 366 | parasite_frames_drain | ai_charge<br>parasite_launch<br>parasite_drain_attack<br>parasite_reel_in | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_parasite.c | 390 | parasite_frames_break | ai_charge | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_parasite.c | 459 | parasite_frames_death | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_soldier.c | 63 | soldier_frames_stand1 | ai_stand<br>soldier_idle | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_soldier.c | 100 | soldier_frames_stand3 | ai_stand<br>soldier_cock | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_soldier.c | 230 | soldier_frames_walk1 | ai_walk<br>soldier_walk1_random | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_soldier.c | 268 | soldier_frames_walk2 | ai_walk | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_soldier.c | 298 | soldier_frames_start_run | ai_run | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_soldier.c | 305 | soldier_frames_run | ai_run | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_soldier.c | 341 | soldier_frames_pain1 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_soldier.c | 351 | soldier_frames_pain2 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_soldier.c | 363 | soldier_frames_pain3 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_soldier.c | 386 | soldier_frames_pain4 | ai_move | array-table-heuristic |
| muzzle-flashes | Quake-2-master/game/m_soldier.c | 458 | blaster_flash | MZ2_SOLDIER_BLASTER_1<br>MZ2_SOLDIER_BLASTER_2<br>MZ2_SOLDIER_BLASTER_3<br>MZ2_SOLDIER_BLASTER_4<br>MZ2_SOLDIER_BLASTER_5<br>MZ2_SOLDIER_BLASTER_6<br>MZ2_SOLDIER_BLASTER_7<br>MZ2_SOLDIER_BLASTER_8<br>int<br>shotgun_flash<br>MZ2_SOLDIER_SHOTGUN_1<br>MZ2_SOLDIER_SHOTGUN_2<br>MZ2_SOLDIER_SHOTGUN_3<br>MZ2_SOLDIER_SHOTGUN_4<br>MZ2_SOLDIER_SHOTGUN_5<br>MZ2_SOLDIER_SHOTGUN_6<br>MZ2_SOLDIER_SHOTGUN_7<br>MZ2_SOLDIER_SHOTGUN_8<br>machinegun_flash<br>MZ2_SOLDIER_MACHINEGUN_1<br>MZ2_SOLDIER_MACHINEGUN_2<br>MZ2_SOLDIER_MACHINEGUN_3<br>MZ2_SOLDIER_MACHINEGUN_4<br>MZ2_SOLDIER_MACHINEGUN_5<br>MZ2_SOLDIER_MACHINEGUN_6<br>MZ2_SOLDIER_MACHINEGUN_7<br>MZ2_SOLDIER_MACHINEGUN_8<br>void<br>soldier_fire<br>edict_t<br>self<br>flash_number<br>vec3_t<br>start<br>forward<br>right<br>up<br>aim<br>dir<br>end | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_soldier.c | 609 | soldier_frames_attack2 | ai_charge<br>soldier_fire2<br>soldier_attack2_refire1<br>soldier_cock<br>soldier_attack2_refire2 | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_soldier.c | 665 | soldier_frames_attack3 | ai_charge<br>soldier_fire3<br>soldier_attack3_refire<br>soldier_duck_up | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_soldier.c | 692 | soldier_frames_attack4 | ai_charge<br>soldier_fire4 | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_soldier.c | 753 | soldier_frames_attack6 | ai_charge<br>soldier_fire8<br>soldier_attack6_refire | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_soldier.c | 818 | soldier_frames_duck | ai_move<br>soldier_duck_down<br>soldier_duck_hold<br>soldier_duck_up | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_soldier.c | 894 | soldier_frames_death1 | ai_move<br>soldier_fire6<br>soldier_fire7 | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_soldier.c | 938 | soldier_frames_death2 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_soldier.c | 981 | soldier_frames_death3 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_soldier.c | 1035 | soldier_frames_death4 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_soldier.c | 1098 | soldier_frames_death5 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_soldier.c | 1129 | soldier_frames_death6 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_supertank.c | 68 | supertank_frames_stand | ai_stand | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_supertank.c | 139 | supertank_frames_run | ai_run<br>TreadSound | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_supertank.c | 167 | supertank_frames_forward | ai_walk<br>TreadSound | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_supertank.c | 208 | supertank_frames_turn_right | ai_move<br>TreadSound | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_supertank.c | 231 | supertank_frames_turn_left | ai_move<br>TreadSound | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_supertank.c | 255 | supertank_frames_pain3 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_supertank.c | 264 | supertank_frames_pain2 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_supertank.c | 273 | supertank_frames_pain1 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_supertank.c | 282 | supertank_frames_death1 | ai_move<br>BossExplode | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_supertank.c | 311 | supertank_frames_backward | ai_walk<br>TreadSound | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_supertank.c | 334 | supertank_frames_attack4 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_supertank.c | 345 | supertank_frames_attack3 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_supertank.c | 377 | supertank_frames_attack2 | ai_charge<br>supertankRocket<br>ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_supertank.c | 409 | supertank_frames_attack1 | ai_charge<br>supertankMachineGun | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_supertank.c | 421 | supertank_frames_end_attack1 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_tank.c | 80 | tank_frames_stand | ai_stand | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_tank.c | 127 | tank_frames_start_walk | ai_walk<br>tank_footstep | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_tank.c | 136 | tank_frames_walk | ai_walk<br>tank_footstep | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_tank.c | 157 | tank_frames_stop_walk | ai_walk<br>tank_footstep | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_tank.c | 179 | tank_frames_start_run | ai_run<br>tank_footstep | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_tank.c | 188 | tank_frames_run | ai_run<br>tank_footstep | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_tank.c | 209 | tank_frames_stop_run | ai_run<br>tank_footstep | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_tank.c | 247 | tank_frames_pain1 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_tank.c | 256 | tank_frames_pain2 | ai_move | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_tank.c | 266 | tank_frames_pain3 | ai_move<br>tank_footstep | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_tank.c | 424 | tank_frames_attack_blast | ai_charge<br>TankBlaster | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_tank.c | 445 | tank_frames_reattack_blast | ai_charge<br>TankBlaster | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_tank.c | 456 | tank_frames_attack_post_blast | ai_move<br>tank_footstep | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_tank.c | 487 | tank_frames_attack_strike | ai_move<br>tank_footstep<br>tank_windup<br>TankStrike | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_tank.c | 530 | tank_frames_attack_pre_rocket | ai_charge<br>tank_footstep | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_tank.c | 558 | tank_frames_attack_fire_rocket | ai_charge<br>TankRocket | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_tank.c | 572 | tank_frames_attack_post_rocket | ai_charge<br>tank_footstep | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_tank.c | 602 | tank_frames_attack_chain | ai_charge<br>TankMachineGun | array-table-heuristic |
| monster-tables | Quake-2-master/game/m_tank.c | 716 | tank_frames_death1 | ai_move<br>tank_thud | array-table-heuristic |
| commands | Quake-2-master/server/sv_user.c | 451 | ucmds | new<br>configstrings<br>baselines<br>begin<br>nextserver<br>disconnect<br>info<br>download<br>nextdl<br>SV_New_f<br>SV_Configstrings_f<br>SV_Baselines_f<br>SV_Begin_f<br>SV_Nextserver_f<br>SV_Disconnect_f<br>SV_ShowServerinfo_f<br>SV_BeginDownload_f<br>SV_NextDownload_f | array-table-heuristic |

