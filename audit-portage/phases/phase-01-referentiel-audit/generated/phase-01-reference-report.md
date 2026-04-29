# Rapport automatique Phase 01

Ce rapport est genere automatiquement par `npm run audit:phase1`.
Il reconcilie le suivi, les sources C/H et les fichiers TS sans valider le portage.

## Resume

- Lignes de suivi parsees : 371
- Sources C/H phase 00 : 264
- Fichiers TS phase 00 : 200
- Sources suivies et presentes sur disque : 264
- Sources C/H non suivies : 0
- Entrees de suivi source absentes du disque : 0
- Cibles declarees absentes du disque : 0
- Cibles TS declarees absentes de l'index TS : 0
- Fichiers TS non references par le suivi : 35
- Lignes avec plusieurs cibles TS : 136
- Lignes ciblant apps/web ou packages/platform : 3
- Sources avec cible declaree non conforme au basename strict : 9
- Sources dupliquees dans le suivi : 0
- Sources avec perimetre unknown : 0
- Corrections factuelles applicables en 01.D : 0

## Classification du perimetre source

| Perimetre | Sources |
| --- | --- |
| core-runtime | 132 |
| renderer-ref-gl | 15 |
| platform-native | 61 |
| renderer-soft | 24 |
| ctf | 32 |
| assets-or-docs | 0 |
| unknown | 0 |

## Statuts attendus

| Statut attendu | Sources |
| --- | --- |
| to-port | 142 |
| voluntarily-excluded | 122 |
| to-clarify | 0 |

## Anomalies de reference

| Anomalie | Sources |
| --- | --- |
| multiple-declared-ts-targets | 136 |
| strict-basename-target-missing | 100 |
| declared-target-not-strict-basename | 9 |
| strict-basename-target-multiple | 4 |
| adapter-target-declared | 3 |

## Table de reference normalisee

| Source | Perimetre | Statut | Cible TS principale | TS attendu | Cibles exactes detectees | Audit | Tests | Anomalies |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Quake-2-master/client/adivtab.h | core-runtime | voluntarily-excluded |  | adivtab.ts |  | non |  | strict-basename-target-missing |
| Quake-2-master/client/anorms.h | core-runtime | to-port | packages/qcommon/src/anorms.ts | anorms.ts | packages/qcommon/src/anorms.ts | oui | scripts/verify/quake2-anorms.ts | multiple-declared-ts-targets |
| Quake-2-master/client/asm_i386.h | core-runtime | voluntarily-excluded |  | asm_i386.ts |  | non |  | strict-basename-target-missing |
| Quake-2-master/client/block16.h | core-runtime | voluntarily-excluded |  | block16.ts |  | non |  | strict-basename-target-missing |
| Quake-2-master/client/block8.h | core-runtime | voluntarily-excluded |  | block8.ts |  | non |  | strict-basename-target-missing |
| Quake-2-master/client/cdaudio.h | core-runtime | to-port | packages/client/src/cdaudio.ts | cdaudio.ts | packages/client/src/cdaudio.ts | oui | scripts/verify/quake2-cdaudio.ts | multiple-declared-ts-targets<br>adapter-target-declared |
| Quake-2-master/client/cl_cin.c | core-runtime | to-port | packages/client/src/cl_cin.ts | cl_cin.ts | packages/client/src/cl_cin.ts | oui | scripts/verify/quake2-cinematic-audio-sync.ts<br>scripts/verify/quake2-screen-header.ts | multiple-declared-ts-targets |
| Quake-2-master/client/cl_ents.c | core-runtime | to-port | packages/client/src/cl_ents.ts | cl_ents.ts | packages/client/src/cl_ents.ts | oui | scripts/verify/quake2-alias-orientation-phase6.ts<br>scripts/verify/quake2-entities-phase10-maps.ts<br>scripts/verify/quake2-entities-phase10.ts<br>scripts/verify/quake2-entities-phase11.ts<br>scripts/verify/quake2-entities-phase4.ts<br>scripts/verify/quake2-entities-phase5-map-flags.ts<br>scripts/verify/quake2-entities-phase5.ts<br>scripts/verify/quake2-entities-phase6-skinnum.ts<br>scripts/verify/quake2-entities-phase7-origin-audit.ts<br>scripts/verify/quake2-entities-phase8-scene.ts<br>scripts/verify/quake2-entities-phase8.ts<br>scripts/verify/quake2-entities-phase9.ts | multiple-declared-ts-targets |
| Quake-2-master/client/cl_fx.c | core-runtime | to-port | packages/client/src/cl_fx.ts | cl_fx.ts | packages/client/src/cl_fx.ts | non | scripts/verify/quake2-particle-sync.ts | multiple-declared-ts-targets |
| Quake-2-master/client/cl_input.c | core-runtime | to-port | packages/client/src/cl_input.ts | cl_input.ts | packages/client/src/cl_input.ts | non | scripts/verify/quake2-cl-input.ts<br>scripts/verify/quake2-cl-main.ts | multiple-declared-ts-targets |
| Quake-2-master/client/cl_inv.c | core-runtime | to-port | packages/client/src/cl_inv.ts | cl_inv.ts | packages/client/src/cl_inv.ts | oui | scripts/verify/quake2-screen-header.ts<br>scripts/verify/quake2-three-gl-draw-adapter.ts | multiple-declared-ts-targets |
| Quake-2-master/client/cl_main.c | core-runtime | to-port | packages/client/src/cl_main.ts | cl_main.ts | packages/client/src/cl_main.ts | non | scripts/verify/quake2-cl-main.ts | multiple-declared-ts-targets |
| Quake-2-master/client/cl_newfx.c | core-runtime | to-port | packages/client/src/cl_newfx.ts | cl_newfx.ts | packages/client/src/cl_newfx.ts | non | scripts/verify/quake2-particle-sync.ts | multiple-declared-ts-targets |
| Quake-2-master/client/cl_parse.c | core-runtime | to-port | packages/client/src/cl_parse.ts | cl_parse.ts | packages/client/src/cl_parse.ts | non | scripts/verify/quake2-audio-phase11.ts<br>scripts/verify/quake2-cl-parse.ts<br>scripts/verify/quake2-entities-phase4.ts<br>scripts/verify/quake2-sky-phase1.ts<br>scripts/verify/quake2-sky-phase2.ts | multiple-declared-ts-targets |
| Quake-2-master/client/cl_pred.c | core-runtime | to-port | packages/client/src/view.ts | cl_pred.ts |  | oui | scripts/verify/quake2-cl-pred.ts<br>scripts/verify/quake2-client-pmove-viewheight.ts<br>scripts/verify/quake2-pmove-local-bmodel.ts | strict-basename-target-missing<br>declared-target-not-strict-basename |
| Quake-2-master/client/cl_scrn.c | core-runtime | to-port | packages/client/src/cl_scrn.ts | cl_scrn.ts | packages/client/src/cl_scrn.ts | non | scripts/verify/quake2-cl-scrn.ts<br>scripts/verify/quake2-screen-header.ts<br>scripts/verify/quake2-three-gl-draw-adapter.ts | multiple-declared-ts-targets |
| Quake-2-master/client/cl_tent.c | core-runtime | to-port | packages/client/src/cl_tent.ts | cl_tent.ts | packages/client/src/cl_tent.ts | non | scripts/verify/quake2-entities-phase8-scene.ts<br>scripts/verify/quake2-particle-sync.ts | multiple-declared-ts-targets |
| Quake-2-master/client/cl_view.c | core-runtime | to-port | packages/client/src/view.ts | cl_view.ts |  | non | scripts/verify/quake2-cl-view.ts | multiple-declared-ts-targets<br>strict-basename-target-missing<br>adapter-target-declared<br>declared-target-not-strict-basename |
| Quake-2-master/client/client.h | core-runtime | to-port | packages/client/src/client.ts | client.ts | packages/client/src/client.ts | non | scripts/verify/quake2-client-header.ts | multiple-declared-ts-targets |
| Quake-2-master/client/console.c | core-runtime | to-port | packages/client/src/console.ts | console.ts | packages/client/src/console.ts | non | scripts/verify/quake2-console-header.ts<br>scripts/verify/quake2-console.ts | multiple-declared-ts-targets |
| Quake-2-master/client/console.h | core-runtime | to-port | packages/client/src/console.ts | console.ts | packages/client/src/console.ts | oui | scripts/verify/quake2-console-header.ts<br>scripts/verify/quake2-console.ts | multiple-declared-ts-targets |
| Quake-2-master/client/input.h | core-runtime | to-port | packages/client/src/input.ts | input.ts | packages/client/src/input.ts | oui | scripts/verify/quake2-cl-input.ts<br>scripts/verify/quake2-input-header.ts | multiple-declared-ts-targets |
| Quake-2-master/client/keys.c | core-runtime | to-port | packages/client/src/keys.ts | keys.ts | packages/client/src/keys.ts | non | scripts/verify/quake2-keys-header.ts<br>scripts/verify/quake2-keys.ts | multiple-declared-ts-targets |
| Quake-2-master/client/keys.h | core-runtime | to-port | packages/client/src/keys.ts | keys.ts | packages/client/src/keys.ts | non | scripts/verify/quake2-keys-header.ts<br>scripts/verify/quake2-keys.ts | multiple-declared-ts-targets |
| Quake-2-master/client/menu.c | core-runtime | to-port | packages/client/src/menu.ts | menu.ts | packages/client/src/menu.ts | non | scripts/verify/quake2-menu.ts | multiple-declared-ts-targets |
| Quake-2-master/client/qmenu.c | core-runtime | to-port | packages/client/src/qmenu.ts | qmenu.ts | packages/client/src/qmenu.ts | non | scripts/verify/quake2-qmenu-header.ts<br>scripts/verify/quake2-qmenu.ts | multiple-declared-ts-targets |
| Quake-2-master/client/qmenu.h | core-runtime | to-port | packages/client/src/qmenu.ts | qmenu.ts | packages/client/src/qmenu.ts | oui | scripts/verify/quake2-qmenu-header.ts<br>scripts/verify/quake2-qmenu.ts | multiple-declared-ts-targets |
| Quake-2-master/client/ref.h | core-runtime | to-port | packages/client/src/ref.ts | ref.ts | packages/client/src/ref.ts | oui | scripts/verify/quake2-ref-header.ts | multiple-declared-ts-targets |
| Quake-2-master/client/screen.h | core-runtime | to-port | packages/client/src/cl_scrn.ts | screen.ts |  | oui | scripts/verify/quake2-cl-scrn.ts<br>scripts/verify/quake2-screen-header.ts | multiple-declared-ts-targets<br>strict-basename-target-missing<br>declared-target-not-strict-basename |
| Quake-2-master/client/snd_dma.c | core-runtime | to-port | packages/client/src/snd_dma.ts | snd_dma.ts | packages/client/src/snd_dma.ts | non | scripts/verify/quake2-audio-phase11.ts<br>scripts/verify/quake2-snd-dma.ts | multiple-declared-ts-targets |
| Quake-2-master/client/snd_loc.h | core-runtime | to-port | packages/client/src/snd_loc.ts | snd_loc.ts | packages/client/src/snd_loc.ts | non | scripts/verify/quake2-snd-loc-header.ts | multiple-declared-ts-targets |
| Quake-2-master/client/snd_mem.c | core-runtime | to-port | packages/client/src/snd_mem.ts | snd_mem.ts | packages/client/src/snd_mem.ts | oui | scripts/verify/quake2-snd-dma.ts<br>scripts/verify/quake2-snd-loc-header.ts<br>scripts/verify/quake2-snd-mem.ts | multiple-declared-ts-targets |
| Quake-2-master/client/snd_mix.c | core-runtime | to-port | packages/client/src/snd_mix.ts | snd_mix.ts | packages/client/src/snd_mix.ts | oui | scripts/verify/quake2-snd-dma.ts<br>scripts/verify/quake2-snd-loc-header.ts<br>scripts/verify/quake2-snd-mix.ts | multiple-declared-ts-targets |
| Quake-2-master/client/sound.h | core-runtime | to-port | packages/client/src/sound-public.ts | sound.ts | packages/client/src/sound.ts | oui | scripts/verify/quake2-audio-phase11.ts<br>scripts/verify/quake2-snd-dma.ts<br>scripts/verify/quake2-sound-header.ts | multiple-declared-ts-targets<br>declared-target-not-strict-basename |
| Quake-2-master/client/vid.h | core-runtime | to-port | packages/client/src/vid.ts | vid.ts | packages/client/src/vid.ts | oui | scripts/verify/quake2-menu.ts<br>scripts/verify/quake2-vid-header.ts | multiple-declared-ts-targets |
| Quake-2-master/client/x86.c | core-runtime | voluntarily-excluded |  | x86.ts |  | non |  | strict-basename-target-missing |
| Quake-2-master/ctf/g_ai.c | ctf | voluntarily-excluded |  | g_ai.ts | packages/game/src/g_ai.ts | non |  |  |
| Quake-2-master/ctf/g_chase.c | ctf | voluntarily-excluded |  | g_chase.ts | packages/game/src/g_chase.ts | non |  |  |
| Quake-2-master/ctf/g_cmds.c | ctf | voluntarily-excluded |  | g_cmds.ts | packages/game/src/g_cmds.ts | non |  |  |
| Quake-2-master/ctf/g_combat.c | ctf | voluntarily-excluded |  | g_combat.ts | packages/game/src/g_combat.ts | non |  |  |
| Quake-2-master/ctf/g_ctf.c | ctf | voluntarily-excluded |  | g_ctf.ts |  | non |  | strict-basename-target-missing |
| Quake-2-master/ctf/g_ctf.h | ctf | voluntarily-excluded |  | g_ctf.ts |  | non |  | strict-basename-target-missing |
| Quake-2-master/ctf/g_func.c | ctf | voluntarily-excluded |  | g_func.ts | packages/game/src/g_func.ts | non |  |  |
| Quake-2-master/ctf/g_items.c | ctf | voluntarily-excluded |  | g_items.ts | packages/game/src/g_items.ts | non |  |  |
| Quake-2-master/ctf/g_local.h | ctf | voluntarily-excluded |  | g_local.ts | packages/game/src/g_local.ts | non |  |  |
| Quake-2-master/ctf/g_main.c | ctf | voluntarily-excluded |  | g_main.ts | packages/game/src/g_main.ts | non |  |  |
| Quake-2-master/ctf/g_misc.c | ctf | voluntarily-excluded |  | g_misc.ts | packages/game/src/g_misc.ts | non |  |  |
| Quake-2-master/ctf/g_monster.c | ctf | voluntarily-excluded |  | g_monster.ts | packages/game/src/g_monster.ts | non |  |  |
| Quake-2-master/ctf/g_phys.c | ctf | voluntarily-excluded |  | g_phys.ts | packages/game/src/g_phys.ts | non |  |  |
| Quake-2-master/ctf/g_save.c | ctf | voluntarily-excluded |  | g_save.ts | packages/game/src/g_save.ts | non |  |  |
| Quake-2-master/ctf/g_spawn.c | ctf | voluntarily-excluded |  | g_spawn.ts | packages/game/src/g_spawn.ts | non |  |  |
| Quake-2-master/ctf/g_svcmds.c | ctf | voluntarily-excluded |  | g_svcmds.ts | packages/game/src/g_svcmds.ts | non |  |  |
| Quake-2-master/ctf/g_target.c | ctf | voluntarily-excluded |  | g_target.ts | packages/game/src/g_target.ts | non |  |  |
| Quake-2-master/ctf/g_trigger.c | ctf | voluntarily-excluded |  | g_trigger.ts | packages/game/src/g_trigger.ts | non |  |  |
| Quake-2-master/ctf/g_utils.c | ctf | voluntarily-excluded |  | g_utils.ts | packages/game/src/g_utils.ts | non |  |  |
| Quake-2-master/ctf/g_weapon.c | ctf | voluntarily-excluded |  | g_weapon.ts | packages/game/src/g_weapon.ts | non |  |  |
| Quake-2-master/ctf/game.h | ctf | voluntarily-excluded |  | game.ts | packages/game/src/game.ts | non |  |  |
| Quake-2-master/ctf/m_move.c | ctf | voluntarily-excluded |  | m_move.ts | packages/game/src/m_move.ts | non |  |  |
| Quake-2-master/ctf/m_player.h | ctf | voluntarily-excluded |  | m_player.ts | packages/game/src/m_player.ts | non |  |  |
| Quake-2-master/ctf/p_client.c | ctf | voluntarily-excluded |  | p_client.ts | packages/game/src/p_client.ts | non |  |  |
| Quake-2-master/ctf/p_hud.c | ctf | voluntarily-excluded |  | p_hud.ts | packages/game/src/p_hud.ts | non |  |  |
| Quake-2-master/ctf/p_menu.c | ctf | voluntarily-excluded |  | p_menu.ts |  | non |  | strict-basename-target-missing |
| Quake-2-master/ctf/p_menu.h | ctf | voluntarily-excluded |  | p_menu.ts |  | non |  | strict-basename-target-missing |
| Quake-2-master/ctf/p_trail.c | ctf | voluntarily-excluded |  | p_trail.ts | packages/game/src/p_trail.ts | non |  |  |
| Quake-2-master/ctf/p_view.c | ctf | voluntarily-excluded |  | p_view.ts | packages/game/src/p_view.ts | non |  |  |
| Quake-2-master/ctf/p_weapon.c | ctf | voluntarily-excluded |  | p_weapon.ts | packages/game/src/p_weapon.ts | non |  |  |
| Quake-2-master/ctf/q_shared.c | ctf | voluntarily-excluded |  | q_shared.ts | packages/math/src/q_shared.ts<br>packages/qcommon/src/q_shared.ts | non |  | strict-basename-target-multiple |
| Quake-2-master/ctf/q_shared.h | ctf | voluntarily-excluded |  | q_shared.ts | packages/math/src/q_shared.ts<br>packages/qcommon/src/q_shared.ts | non |  | strict-basename-target-multiple |
| Quake-2-master/game/g_ai.c | core-runtime | to-port | packages/game/src/g_ai.ts | g_ai.ts | packages/game/src/g_ai.ts | non | scripts/verify/quake2-g-ai.ts | multiple-declared-ts-targets |
| Quake-2-master/game/g_chase.c | core-runtime | to-port | packages/game/src/g_chase.ts | g_chase.ts | packages/game/src/g_chase.ts | non | scripts/verify/quake2-g-chase.ts | multiple-declared-ts-targets |
| Quake-2-master/game/g_cmds.c | core-runtime | to-port | packages/game/src/g_cmds.ts | g_cmds.ts | packages/game/src/g_cmds.ts | non | scripts/verify/quake2-g-cmds.ts | multiple-declared-ts-targets |
| Quake-2-master/game/g_combat.c | core-runtime | to-port | packages/game/src/g_combat.ts | g_combat.ts | packages/game/src/g_combat.ts | non | scripts/verify/quake2-g-combat.ts | multiple-declared-ts-targets |
| Quake-2-master/game/g_func.c | core-runtime | to-port | packages/game/src/g_func.ts | g_func.ts | packages/game/src/g_func.ts | non | scripts/verify/quake2-door-phase1.ts<br>scripts/verify/quake2-door-phase4.ts<br>scripts/verify/quake2-door-phase5.ts<br>scripts/verify/quake2-door-phase6.ts<br>scripts/verify/quake2-g-func.ts | multiple-declared-ts-targets |
| Quake-2-master/game/g_items.c | core-runtime | to-port | packages/game/src/g_items.ts | g_items.ts | packages/game/src/g_items.ts | non | scripts/verify/quake2-g-items.ts | multiple-declared-ts-targets |
| Quake-2-master/game/g_local.h | core-runtime | to-port | packages/game/src/g_local.ts | g_local.ts | packages/game/src/g_local.ts | non | scripts/verify/quake2-g-local-header.ts | multiple-declared-ts-targets |
| Quake-2-master/game/g_main.c | core-runtime | to-port | packages/game/src/g_main.ts | g_main.ts | packages/game/src/g_main.ts | non | scripts/verify/quake2-g-main.ts<br>scripts/verify/quake2-g-save.ts | multiple-declared-ts-targets |
| Quake-2-master/game/g_misc.c | core-runtime | to-port | packages/game/src/g_misc.ts | g_misc.ts | packages/game/src/g_misc.ts | non | scripts/verify/quake2-g-misc.ts | multiple-declared-ts-targets |
| Quake-2-master/game/g_monster.c | core-runtime | to-port | packages/game/src/g_monster.ts | g_monster.ts | packages/game/src/g_monster.ts | non | scripts/verify/quake2-g-monster.ts | multiple-declared-ts-targets |
| Quake-2-master/game/g_phys.c | core-runtime | to-port | packages/game/src/g_phys.ts | g_phys.ts | packages/game/src/g_phys.ts | non | scripts/verify/quake2-collision-phase3.ts<br>scripts/verify/quake2-collision-phase4.ts<br>scripts/verify/quake2-collision-phase5.ts<br>scripts/verify/quake2-collision-phase8.ts<br>scripts/verify/quake2-door-phase3.ts<br>scripts/verify/quake2-door-phase5.ts<br>scripts/verify/quake2-g-phys.ts | multiple-declared-ts-targets |
| Quake-2-master/game/g_save.c | core-runtime | to-port | packages/game/src/g_save.ts | g_save.ts | packages/game/src/g_save.ts | non | scripts/verify/quake2-g-main.ts<br>scripts/verify/quake2-g-save.ts | multiple-declared-ts-targets |
| Quake-2-master/game/g_spawn.c | core-runtime | to-port | packages/game/src/g_spawn.ts | g_spawn.ts | packages/game/src/g_spawn.ts | non | scripts/verify/quake2-g-spawn.ts | multiple-declared-ts-targets |
| Quake-2-master/game/g_svcmds.c | core-runtime | to-port | packages/game/src/g_svcmds.ts | g_svcmds.ts | packages/game/src/g_svcmds.ts | non | scripts/verify/quake2-g-main.ts<br>scripts/verify/quake2-g-svcmds.ts | multiple-declared-ts-targets |
| Quake-2-master/game/g_target.c | core-runtime | to-port | packages/game/src/g_target.ts | g_target.ts | packages/game/src/g_target.ts | non | scripts/verify/quake2-cl-parse.ts<br>scripts/verify/quake2-cl-tent.ts<br>scripts/verify/quake2-g-target.ts<br>scripts/verify/quake2-sv-game.ts<br>scripts/verify/quake2-sv-send.ts | multiple-declared-ts-targets |
| Quake-2-master/game/g_trigger.c | core-runtime | to-port | packages/game/src/g_trigger.ts | g_trigger.ts | packages/game/src/g_trigger.ts | non | scripts/verify/quake2-collision-phase7.ts<br>scripts/verify/quake2-door-phase1.ts<br>scripts/verify/quake2-g-trigger.ts | multiple-declared-ts-targets |
| Quake-2-master/game/g_turret.c | core-runtime | to-port | packages/game/src/g_turret.ts | g_turret.ts | packages/game/src/g_turret.ts | non | scripts/verify/quake2-g-turret.ts | multiple-declared-ts-targets |
| Quake-2-master/game/g_utils.c | core-runtime | to-port | packages/game/src/g_utils.ts | g_utils.ts | packages/game/src/g_utils.ts | non | scripts/verify/quake2-collision-phase3.ts<br>scripts/verify/quake2-collision-phase7.ts<br>scripts/verify/quake2-door-phase1.ts<br>scripts/verify/quake2-g-utils.ts | multiple-declared-ts-targets |
| Quake-2-master/game/g_weapon.c | core-runtime | to-port | packages/game/src/g_weapon.ts | g_weapon.ts | packages/game/src/g_weapon.ts | non |  | multiple-declared-ts-targets |
| Quake-2-master/game/game.h | core-runtime | to-port | packages/game/src/game.ts | game.ts | packages/game/src/game.ts | non | scripts/verify/quake2-game-header.ts | multiple-declared-ts-targets |
| Quake-2-master/game/m_actor.c | core-runtime | to-port | packages/game/src/m_actor.ts | m_actor.ts | packages/game/src/m_actor.ts | non | scripts/verify/quake2-local-gameplay-sync.ts<br>scripts/verify/quake2-m-actor-header.ts<br>scripts/verify/quake2-m-actor.ts | multiple-declared-ts-targets |
| Quake-2-master/game/m_actor.h | core-runtime | to-port | packages/game/src/m_actor.ts | m_actor.ts | packages/game/src/m_actor.ts | non | scripts/verify/quake2-m-actor-header.ts | multiple-declared-ts-targets |
| Quake-2-master/game/m_berserk.c | core-runtime | to-port | packages/game/src/m_berserk.ts | m_berserk.ts | packages/game/src/m_berserk.ts | non | scripts/verify/quake2-m-berserk-source-parity.ts<br>scripts/verify/quake2-m-berserk.ts | multiple-declared-ts-targets |
| Quake-2-master/game/m_berserk.h | core-runtime | to-port | packages/game/src/m_berserk.ts | m_berserk.ts | packages/game/src/m_berserk.ts | non | scripts/verify/quake2-m-berserk-header.ts | multiple-declared-ts-targets |
| Quake-2-master/game/m_boss2.c | core-runtime | to-port | packages/game/src/m_boss2.ts | m_boss2.ts | packages/game/src/m_boss2.ts | non | scripts/verify/quake2-m-boss2-source-parity.ts<br>scripts/verify/quake2-m-boss2.ts | multiple-declared-ts-targets |
| Quake-2-master/game/m_boss2.h | core-runtime | to-port | packages/game/src/m_boss2.ts | m_boss2.ts | packages/game/src/m_boss2.ts | non | scripts/verify/quake2-m-boss2-header.ts | multiple-declared-ts-targets |
| Quake-2-master/game/m_boss3.c | core-runtime | to-port | packages/game/src/m_boss3.ts | m_boss3.ts | packages/game/src/m_boss3.ts | non | scripts/verify/quake2-m-boss3-source-parity.ts<br>scripts/verify/quake2-m-boss3.ts | multiple-declared-ts-targets |
| Quake-2-master/game/m_boss31.c | core-runtime | to-port | packages/game/src/m_boss31.ts | m_boss31.ts | packages/game/src/m_boss31.ts | non | scripts/verify/quake2-m-boss31-source-parity.ts<br>scripts/verify/quake2-m-boss31.ts | multiple-declared-ts-targets |
| Quake-2-master/game/m_boss31.h | core-runtime | to-port | packages/game/src/m_boss31.ts | m_boss31.ts | packages/game/src/m_boss31.ts | non | scripts/verify/quake2-m-boss31-header.ts | multiple-declared-ts-targets |
| Quake-2-master/game/m_boss32.c | core-runtime | to-port | packages/game/src/m_boss32.ts | m_boss32.ts | packages/game/src/m_boss32.ts | non | scripts/verify/quake2-m-boss32-source-parity.ts<br>scripts/verify/quake2-m-boss32.ts | multiple-declared-ts-targets |
| Quake-2-master/game/m_boss32.h | core-runtime | to-port | packages/game/src/m_boss32.ts | m_boss32.ts | packages/game/src/m_boss32.ts | non | scripts/verify/quake2-m-boss32-header.ts | multiple-declared-ts-targets |
| Quake-2-master/game/m_brain.c | core-runtime | to-port | packages/game/src/m_brain.ts | m_brain.ts | packages/game/src/m_brain.ts | non | scripts/verify/quake2-m-brain-source-parity.ts<br>scripts/verify/quake2-m-brain.ts | multiple-declared-ts-targets |
| Quake-2-master/game/m_brain.h | core-runtime | to-port | packages/game/src/m_brain.ts | m_brain.ts | packages/game/src/m_brain.ts | non | scripts/verify/quake2-m-brain-header.ts | multiple-declared-ts-targets |
| Quake-2-master/game/m_chick.c | core-runtime | to-port | packages/game/src/m_chick.ts | m_chick.ts | packages/game/src/m_chick.ts | non | scripts/verify/quake2-m-chick-source-parity.ts<br>scripts/verify/quake2-m-chick.ts | multiple-declared-ts-targets |
| Quake-2-master/game/m_chick.h | core-runtime | to-port | packages/game/src/m_chick.ts | m_chick.ts | packages/game/src/m_chick.ts | non | scripts/verify/quake2-m-chick-header.ts | multiple-declared-ts-targets |
| Quake-2-master/game/m_flash.c | core-runtime | to-port | packages/game/src/m_flash.ts | m_flash.ts | packages/game/src/m_flash.ts | non | scripts/verify/quake2-m-flash.ts | multiple-declared-ts-targets |
| Quake-2-master/game/m_flipper.c | core-runtime | to-port | packages/game/src/m_flipper.ts | m_flipper.ts | packages/game/src/m_flipper.ts | non | scripts/verify/quake2-m-flipper-source-parity.ts<br>scripts/verify/quake2-m-flipper.ts | multiple-declared-ts-targets |
| Quake-2-master/game/m_flipper.h | core-runtime | to-port | packages/game/src/m_flipper.ts | m_flipper.ts | packages/game/src/m_flipper.ts | non | scripts/verify/quake2-m-flipper-header.ts | multiple-declared-ts-targets |
| Quake-2-master/game/m_float.c | core-runtime | to-port | packages/game/src/m_float.ts | m_float.ts | packages/game/src/m_float.ts | non | scripts/verify/quake2-m-float-source-parity.ts<br>scripts/verify/quake2-m-float.ts | multiple-declared-ts-targets |
| Quake-2-master/game/m_float.h | core-runtime | to-port | packages/game/src/m_float.ts | m_float.ts | packages/game/src/m_float.ts | non | scripts/verify/quake2-m-float-header.ts | multiple-declared-ts-targets |
| Quake-2-master/game/m_flyer.c | core-runtime | to-port | packages/game/src/m_flyer.ts | m_flyer.ts | packages/game/src/m_flyer.ts | non | scripts/verify/quake2-m-flyer-source-parity.ts<br>scripts/verify/quake2-m-flyer.ts | multiple-declared-ts-targets |
| Quake-2-master/game/m_flyer.h | core-runtime | to-port | packages/game/src/m_flyer.ts | m_flyer.ts | packages/game/src/m_flyer.ts | non | scripts/verify/quake2-m-flyer-header.ts | multiple-declared-ts-targets |
| Quake-2-master/game/m_gladiator.c | core-runtime | to-port | packages/game/src/m_gladiator.ts | m_gladiator.ts | packages/game/src/m_gladiator.ts | non | scripts/verify/quake2-m-gladiator-source-parity.ts<br>scripts/verify/quake2-m-gladiator.ts | multiple-declared-ts-targets |
| Quake-2-master/game/m_gladiator.h | core-runtime | to-port | packages/game/src/m_gladiator.ts | m_gladiator.ts | packages/game/src/m_gladiator.ts | non | scripts/verify/quake2-m-gladiator-header.ts | multiple-declared-ts-targets |
| Quake-2-master/game/m_gunner.c | core-runtime | to-port | packages/game/src/m_gunner.ts | m_gunner.ts | packages/game/src/m_gunner.ts | non | scripts/verify/quake2-m-gunner-source-parity.ts<br>scripts/verify/quake2-m-gunner.ts | multiple-declared-ts-targets |
| Quake-2-master/game/m_gunner.h | core-runtime | to-port | packages/game/src/m_gunner.ts | m_gunner.ts | packages/game/src/m_gunner.ts | non | scripts/verify/quake2-m-gunner-header.ts | multiple-declared-ts-targets |
| Quake-2-master/game/m_hover.c | core-runtime | to-port | packages/game/src/m_hover.ts | m_hover.ts | packages/game/src/m_hover.ts | non | scripts/verify/quake2-m-hover-source-parity.ts<br>scripts/verify/quake2-m-hover.ts | multiple-declared-ts-targets |
| Quake-2-master/game/m_hover.h | core-runtime | to-port | packages/game/src/m_hover.ts | m_hover.ts | packages/game/src/m_hover.ts | non | scripts/verify/quake2-m-hover-header.ts | multiple-declared-ts-targets |
| Quake-2-master/game/m_infantry.c | core-runtime | to-port | packages/game/src/m_infantry.ts | m_infantry.ts | packages/game/src/m_infantry.ts | non | scripts/verify/quake2-m-infantry-source-parity.ts<br>scripts/verify/quake2-m-infantry.ts | multiple-declared-ts-targets |
| Quake-2-master/game/m_infantry.h | core-runtime | to-port | packages/game/src/m_infantry.ts | m_infantry.ts | packages/game/src/m_infantry.ts | non | scripts/verify/quake2-m-infantry-header.ts | multiple-declared-ts-targets |
| Quake-2-master/game/m_insane.c | core-runtime | to-port | packages/game/src/m_insane.ts | m_insane.ts | packages/game/src/m_insane.ts | non | scripts/verify/quake2-m-insane-header.ts<br>scripts/verify/quake2-m-insane.ts | multiple-declared-ts-targets |
| Quake-2-master/game/m_insane.h | core-runtime | to-port | packages/game/src/m_insane.ts | m_insane.ts | packages/game/src/m_insane.ts | non | scripts/verify/quake2-m-insane-header.ts | multiple-declared-ts-targets |
| Quake-2-master/game/m_medic.c | core-runtime | to-port | packages/game/src/m_medic.ts | m_medic.ts | packages/game/src/m_medic.ts | non | scripts/verify/quake2-m-medic-source-parity.ts<br>scripts/verify/quake2-m-medic.ts | multiple-declared-ts-targets |
| Quake-2-master/game/m_medic.h | core-runtime | to-port | packages/game/src/m_medic.ts | m_medic.ts | packages/game/src/m_medic.ts | non | scripts/verify/quake2-m-medic-header.ts | multiple-declared-ts-targets |
| Quake-2-master/game/m_move.c | core-runtime | to-port | packages/game/src/m_move.ts | m_move.ts | packages/game/src/m_move.ts | non | scripts/verify/quake2-m-move.ts | multiple-declared-ts-targets |
| Quake-2-master/game/m_mutant.c | core-runtime | to-port | packages/game/src/m_mutant.ts | m_mutant.ts | packages/game/src/m_mutant.ts | non | scripts/verify/quake2-m-mutant-source-parity.ts<br>scripts/verify/quake2-m-mutant.ts | multiple-declared-ts-targets |
| Quake-2-master/game/m_mutant.h | core-runtime | to-port | packages/game/src/m_mutant.ts | m_mutant.ts | packages/game/src/m_mutant.ts | non | scripts/verify/quake2-m-mutant-header.ts | multiple-declared-ts-targets |
| Quake-2-master/game/m_parasite.c | core-runtime | to-port | packages/game/src/m_parasite.ts | m_parasite.ts | packages/game/src/m_parasite.ts | non | scripts/verify/quake2-m-parasite-source-parity.ts<br>scripts/verify/quake2-m-parasite.ts | multiple-declared-ts-targets |
| Quake-2-master/game/m_parasite.h | core-runtime | to-port | packages/game/src/m_parasite.ts | m_parasite.ts | packages/game/src/m_parasite.ts | non | scripts/verify/quake2-m-parasite-header.ts | multiple-declared-ts-targets |
| Quake-2-master/game/m_player.h | core-runtime | to-port | packages/game/src/m_player.ts | m_player.ts | packages/game/src/m_player.ts | non | scripts/verify/quake2-m-player-header.ts | multiple-declared-ts-targets |
| Quake-2-master/game/m_rider.h | core-runtime | to-port | packages/game/src/m_rider.ts | m_rider.ts | packages/game/src/m_rider.ts | non | scripts/verify/quake2-m-rider-header.ts | multiple-declared-ts-targets |
| Quake-2-master/game/m_soldier.c | core-runtime | to-port | packages/game/src/m_soldier.ts | m_soldier.ts | packages/game/src/m_soldier.ts | non | scripts/verify/quake2-m-soldier-source-parity.ts<br>scripts/verify/quake2-m-soldier.ts | multiple-declared-ts-targets |
| Quake-2-master/game/m_soldier.h | core-runtime | to-port | packages/game/src/m_soldier.ts | m_soldier.ts | packages/game/src/m_soldier.ts | non | scripts/verify/quake2-m-soldier-header.ts | multiple-declared-ts-targets |
| Quake-2-master/game/m_supertank.c | core-runtime | to-port | packages/game/src/m_supertank.ts | m_supertank.ts | packages/game/src/m_supertank.ts | non | scripts/verify/quake2-m-supertank-source-parity.ts<br>scripts/verify/quake2-m-supertank.ts | multiple-declared-ts-targets |
| Quake-2-master/game/m_supertank.h | core-runtime | to-port | packages/game/src/m_supertank.ts | m_supertank.ts | packages/game/src/m_supertank.ts | non | scripts/verify/quake2-m-supertank-header.ts | multiple-declared-ts-targets |
| Quake-2-master/game/m_tank.c | core-runtime | to-port | packages/game/src/m_tank.ts | m_tank.ts | packages/game/src/m_tank.ts | non | scripts/verify/quake2-m-tank-source-parity.ts<br>scripts/verify/quake2-m-tank.ts | multiple-declared-ts-targets |
| Quake-2-master/game/m_tank.h | core-runtime | to-port | packages/game/src/m_tank.ts | m_tank.ts | packages/game/src/m_tank.ts | non | scripts/verify/quake2-m-tank-header.ts | multiple-declared-ts-targets |
| Quake-2-master/game/p_client.c | core-runtime | to-port | packages/game/src/p_client.ts | p_client.ts | packages/game/src/p_client.ts | non | scripts/verify/quake2-p-client.ts | multiple-declared-ts-targets |
| Quake-2-master/game/p_hud.c | core-runtime | to-port | packages/game/src/p_hud.ts | p_hud.ts | packages/game/src/p_hud.ts | non | scripts/verify/quake2-p-hud.ts | multiple-declared-ts-targets |
| Quake-2-master/game/p_trail.c | core-runtime | to-port | packages/game/src/p_trail.ts | p_trail.ts | packages/game/src/p_trail.ts | non | scripts/verify/quake2-p-trail.ts | multiple-declared-ts-targets |
| Quake-2-master/game/p_view.c | core-runtime | to-port | packages/game/src/p_view.ts | p_view.ts | packages/game/src/p_view.ts | non | scripts/verify/quake2-g-main.ts<br>scripts/verify/quake2-p-view.ts | multiple-declared-ts-targets |
| Quake-2-master/game/p_weapon.c | core-runtime | to-port | packages/game/src/p_weapon.ts | p_weapon.ts | packages/game/src/p_weapon.ts | non | scripts/verify/quake2-p-weapon.ts | multiple-declared-ts-targets |
| Quake-2-master/game/q_shared.c | core-runtime | to-port | packages/math/src/q_shared.ts | q_shared.ts | packages/math/src/q_shared.ts<br>packages/qcommon/src/q_shared.ts | non | scripts/verify/quake2-q-shared-header.ts | multiple-declared-ts-targets<br>strict-basename-target-multiple |
| Quake-2-master/game/q_shared.h | core-runtime | to-port | packages/qcommon/src/q_shared.ts | q_shared.ts | packages/math/src/q_shared.ts<br>packages/qcommon/src/q_shared.ts | non | scripts/verify/quake2-q-shared-header.ts | multiple-declared-ts-targets<br>strict-basename-target-multiple |
| Quake-2-master/irix/cd_irix.c | platform-native | voluntarily-excluded |  | cd_irix.ts |  | non |  | strict-basename-target-missing |
| Quake-2-master/irix/glw_imp.c | platform-native | voluntarily-excluded |  | glw_imp.ts |  | non |  | strict-basename-target-missing |
| Quake-2-master/irix/q_shirix.c | platform-native | voluntarily-excluded |  | q_shirix.ts |  | non |  | strict-basename-target-missing |
| Quake-2-master/irix/qgl_irix.c | platform-native | voluntarily-excluded |  | qgl_irix.ts |  | non |  | strict-basename-target-missing |
| Quake-2-master/irix/snd_irix.c | platform-native | voluntarily-excluded |  | snd_irix.ts |  | non |  | strict-basename-target-missing |
| Quake-2-master/irix/sys_irix.c | platform-native | voluntarily-excluded |  | sys_irix.ts |  | non |  | strict-basename-target-missing |
| Quake-2-master/irix/vid_menu.c | platform-native | voluntarily-excluded |  | vid_menu.ts |  | non |  | strict-basename-target-missing |
| Quake-2-master/irix/vid_so.c | platform-native | voluntarily-excluded |  | vid_so.ts |  | non |  | strict-basename-target-missing |
| Quake-2-master/linux/block16.h | platform-native | voluntarily-excluded |  | block16.ts |  | non |  | strict-basename-target-missing |
| Quake-2-master/linux/block8.h | platform-native | voluntarily-excluded |  | block8.ts |  | non |  | strict-basename-target-missing |
| Quake-2-master/linux/cd_linux.c | platform-native | voluntarily-excluded |  | cd_linux.ts |  | non |  | strict-basename-target-missing |
| Quake-2-master/linux/d_ifacea.h | platform-native | voluntarily-excluded |  | d_ifacea.ts |  | non |  | strict-basename-target-missing |
| Quake-2-master/linux/gl_fxmesa.c | platform-native | voluntarily-excluded |  | gl_fxmesa.ts |  | non |  | strict-basename-target-missing |
| Quake-2-master/linux/glob.c | platform-native | voluntarily-excluded |  | glob.ts |  | non |  | strict-basename-target-missing |
| Quake-2-master/linux/glob.h | platform-native | voluntarily-excluded |  | glob.ts |  | non |  | strict-basename-target-missing |
| Quake-2-master/linux/in_linux.c | platform-native | voluntarily-excluded |  | in_linux.ts |  | non |  | strict-basename-target-missing |
| Quake-2-master/linux/net_udp.c | platform-native | voluntarily-excluded |  | net_udp.ts |  | non |  | strict-basename-target-missing |
| Quake-2-master/linux/q_shlinux.c | platform-native | voluntarily-excluded |  | q_shlinux.ts |  | non |  | strict-basename-target-missing |
| Quake-2-master/linux/qasm.h | platform-native | voluntarily-excluded |  | qasm.ts |  | non |  | strict-basename-target-missing |
| Quake-2-master/linux/qgl_linux.c | platform-native | voluntarily-excluded |  | qgl_linux.ts |  | non |  | strict-basename-target-missing |
| Quake-2-master/linux/rw_in_svgalib.c | platform-native | voluntarily-excluded |  | rw_in_svgalib.ts |  | non |  | strict-basename-target-missing |
| Quake-2-master/linux/rw_linux.h | platform-native | voluntarily-excluded |  | rw_linux.ts |  | non |  | strict-basename-target-missing |
| Quake-2-master/linux/rw_svgalib.c | platform-native | voluntarily-excluded |  | rw_svgalib.ts |  | non |  | strict-basename-target-missing |
| Quake-2-master/linux/rw_x11.c | platform-native | voluntarily-excluded |  | rw_x11.ts |  | non |  | strict-basename-target-missing |
| Quake-2-master/linux/snd_linux.c | platform-native | voluntarily-excluded |  | snd_linux.ts |  | non |  | strict-basename-target-missing |
| Quake-2-master/linux/sys_linux.c | platform-native | voluntarily-excluded |  | sys_linux.ts |  | non |  | strict-basename-target-missing |
| Quake-2-master/linux/vid_menu.c | platform-native | voluntarily-excluded |  | vid_menu.ts |  | non |  | strict-basename-target-missing |
| Quake-2-master/linux/vid_so.c | platform-native | voluntarily-excluded |  | vid_so.ts |  | non |  | strict-basename-target-missing |
| Quake-2-master/null/cd_null.c | platform-native | voluntarily-excluded |  | cd_null.ts |  | non |  | strict-basename-target-missing |
| Quake-2-master/null/cl_null.c | platform-native | voluntarily-excluded |  | cl_null.ts |  | non |  | strict-basename-target-missing |
| Quake-2-master/null/glimp_null.c | platform-native | voluntarily-excluded |  | glimp_null.ts |  | non |  | strict-basename-target-missing |
| Quake-2-master/null/in_null.c | platform-native | voluntarily-excluded |  | in_null.ts |  | non |  | strict-basename-target-missing |
| Quake-2-master/null/snddma_null.c | platform-native | voluntarily-excluded |  | snddma_null.ts |  | non |  | strict-basename-target-missing |
| Quake-2-master/null/swimp_null.c | platform-native | voluntarily-excluded |  | swimp_null.ts |  | non |  | strict-basename-target-missing |
| Quake-2-master/null/sys_null.c | platform-native | voluntarily-excluded |  | sys_null.ts |  | non |  | strict-basename-target-missing |
| Quake-2-master/null/vid_null.c | platform-native | voluntarily-excluded |  | vid_null.ts |  | non |  | strict-basename-target-missing |
| Quake-2-master/qcommon/cmd.c | core-runtime | to-port | packages/qcommon/src/cmd.ts | cmd.ts | packages/qcommon/src/cmd.ts | non | scripts/verify/quake2-cmd.ts | multiple-declared-ts-targets |
| Quake-2-master/qcommon/cmodel.c | core-runtime | to-port | packages/qcommon/src/cmodel.ts | cmodel.ts | packages/qcommon/src/cmodel.ts | non | scripts/verify/quake2-cmodel.ts<br>scripts/verify/quake2-collision-phase1.ts | multiple-declared-ts-targets |
| Quake-2-master/qcommon/common.c | core-runtime | to-port | packages/qcommon/src/common.ts | common.ts | packages/qcommon/src/common.ts | non | scripts/verify/quake2-qcommon-header.ts | multiple-declared-ts-targets |
| Quake-2-master/qcommon/crc.c | core-runtime | to-port | packages/qcommon/src/qcommon.ts | crc.ts |  | non | scripts/verify/quake2-crc.ts | multiple-declared-ts-targets<br>strict-basename-target-missing<br>declared-target-not-strict-basename |
| Quake-2-master/qcommon/crc.h | core-runtime | to-port | packages/qcommon/src/qcommon.ts | crc.ts |  | non | scripts/verify/quake2-crc-header.ts | multiple-declared-ts-targets<br>strict-basename-target-missing<br>declared-target-not-strict-basename |
| Quake-2-master/qcommon/cvar.c | core-runtime | to-port | packages/qcommon/src/cvar.ts | cvar.ts | packages/qcommon/src/cvar.ts | non | scripts/verify/quake2-cvar.ts |  |
| Quake-2-master/qcommon/files.c | core-runtime | to-port | packages/filesystem/src/files.ts | files.ts | packages/filesystem/src/files.ts | non | scripts/verify/quake2-files.ts | multiple-declared-ts-targets |
| Quake-2-master/qcommon/md4.c | core-runtime | to-port | packages/qcommon/src/md4.ts | md4.ts | packages/qcommon/src/md4.ts | non | scripts/verify/quake2-md4.ts<br>scripts/verify/quake2-qcommon-header.ts | multiple-declared-ts-targets |
| Quake-2-master/qcommon/net_chan.c | core-runtime | to-port | packages/qcommon/src/net_chan.ts | net_chan.ts | packages/qcommon/src/net_chan.ts | non | scripts/verify/quake2-net-chan.ts | multiple-declared-ts-targets |
| Quake-2-master/qcommon/pmove.c | core-runtime | to-port | packages/qcommon/src/pmove.ts | pmove.ts | packages/qcommon/src/pmove.ts | non | scripts/verify/quake2-cl-pred.ts<br>scripts/verify/quake2-client-pmove-viewheight.ts<br>scripts/verify/quake2-pmove-local-bmodel.ts<br>scripts/verify/quake2-pmove.ts |  |
| Quake-2-master/qcommon/qcommon.h | core-runtime | to-port | packages/qcommon/src/qcommon.ts | qcommon.ts | packages/qcommon/src/qcommon.ts | non | scripts/verify/quake2-qcommon-header.ts | multiple-declared-ts-targets |
| Quake-2-master/qcommon/qfiles.h | core-runtime | to-port | packages/formats/src/qfiles.ts | qfiles.ts | packages/formats/src/qfiles.ts | non | scripts/verify/quake2-qfiles.ts | multiple-declared-ts-targets |
| Quake-2-master/ref_gl/anorms.h | renderer-ref-gl | to-port | packages/qcommon/src/anorms.ts | anorms.ts | packages/qcommon/src/anorms.ts | non | scripts/verify/quake2-anorms.ts |  |
| Quake-2-master/ref_gl/anormtab.h | renderer-ref-gl | to-port | packages/renderer-three/src/anormtab.ts | anormtab.ts | packages/renderer-three/src/anormtab.ts | non | scripts/verify/quake2-anormtab.ts |  |
| Quake-2-master/ref_gl/gl_draw.c | renderer-ref-gl | to-port | packages/renderer-three/src/gl_draw.ts | gl_draw.ts | packages/renderer-three/src/gl_draw.ts | non | scripts/verify/quake2-gl-draw.ts | multiple-declared-ts-targets |
| Quake-2-master/ref_gl/gl_image.c | renderer-ref-gl | to-port | packages/renderer-three/src/gl_image.ts | gl_image.ts | packages/renderer-three/src/gl_image.ts | non | scripts/verify/quake2-gl-image.ts | multiple-declared-ts-targets |
| Quake-2-master/ref_gl/gl_light.c | renderer-ref-gl | to-port | packages/renderer-three/src/gl_light.ts | gl_light.ts | packages/renderer-three/src/gl_light.ts | non | scripts/verify/quake2-gl-light.ts | multiple-declared-ts-targets |
| Quake-2-master/ref_gl/gl_local.h | renderer-ref-gl | to-port | packages/renderer-three/src/gl_local.ts | gl_local.ts | packages/renderer-three/src/gl_local.ts | non | scripts/verify/quake2-gl-local-header.ts<br>scripts/verify/quake2-gl-rmain.ts<br>scripts/verify/quake2-ref-gl-host.ts | multiple-declared-ts-targets |
| Quake-2-master/ref_gl/gl_mesh.c | renderer-ref-gl | to-port | packages/renderer-three/src/gl_mesh.ts | gl_mesh.ts | packages/renderer-three/src/gl_mesh.ts | non | scripts/verify/quake2-alias-orientation-phase6.ts<br>scripts/verify/quake2-gl-mesh.ts | multiple-declared-ts-targets<br>adapter-target-declared |
| Quake-2-master/ref_gl/gl_model.c | renderer-ref-gl | to-port | packages/renderer-three/src/gl-model-loader.ts | gl_model.ts |  | non | scripts/verify/quake2-gl-model-loader-phase1.ts<br>scripts/verify/quake2-gl-model-loader-phase2.ts<br>scripts/verify/quake2-gl-model-loader-phase3.ts<br>scripts/verify/quake2-gl-model-loader-phase4.ts<br>scripts/verify/quake2-gl-model-loader-phase5.ts<br>scripts/verify/quake2-gl-model-loader-phase6.ts<br>scripts/verify/quake2-gl-model-loader-phase7.ts<br>scripts/verify/quake2-gl-model-loader-phase8.ts<br>scripts/verify/quake2-gl-model-loader-phase9.ts | strict-basename-target-missing<br>declared-target-not-strict-basename |
| Quake-2-master/ref_gl/gl_model.h | renderer-ref-gl | to-port | packages/renderer-three/src/gl-model.ts | gl_model.ts |  | non | scripts/verify/quake2-gl-model-header.ts | strict-basename-target-missing<br>declared-target-not-strict-basename |
| Quake-2-master/ref_gl/gl_rmain.c | renderer-ref-gl | to-port | packages/renderer-three/src/gl_rmain.ts | gl_rmain.ts | packages/renderer-three/src/gl_rmain.ts | non | scripts/verify/quake2-gl-rmain.ts<br>scripts/verify/quake2-particle-sync.ts<br>scripts/verify/quake2-ref-gl-host.ts<br>scripts/verify/quake2-refresh-entity-sprite.ts | multiple-declared-ts-targets |
| ... | 64 lignes supplementaires non affichees |

## Sources avec perimetre unknown

Aucun point detecte.

## Corrections factuelles applicables en 01.D

Aucun point detecte.

## Entrees de suivi source absentes du disque

Aucun point detecte.

## Sources C/H non suivies

Aucun point detecte.

## Cibles declarees absentes du disque

Aucun point detecte.

## Fichiers TS non references par le suivi

| TS |
| --- |
| apps/web/src/full-game-command-bridge.ts |
| apps/web/src/full-game-local-session.ts |
| apps/web/src/full-game-local-transport.ts |
| apps/web/src/full-game-render-loop.ts |
| apps/web/src/full-game-render-source.ts |
| apps/web/src/full-game-server-host.ts |
| apps/web/src/full-game.ts |
| apps/web/src/local-collision-adapter.ts |
| apps/web/src/refresh-debug-layer.ts |
| apps/web/src/web-config-commands.ts |
| apps/web/src/web-config-storage.ts |
| apps/web/src/web-map-bootstrap.ts |
| apps/web/src/web-render-bootstrap.ts |
| apps/web/src/web-save-storage.ts |
| apps/web/src/web-shell.ts |
| apps/web/vite.config.ts |
| packages/client/src/local-brush-models.ts |
| packages/client/src/local-client-bootstrap.ts |
| packages/client/src/local-input.ts |
| packages/client/src/local-loop.ts |
| packages/client/src/local-session.ts |
| packages/client/src/render-contracts.ts |
| packages/formats/src/tga.ts |
| packages/memory/src/index.ts |
| packages/platform/src/index.ts |
| packages/platform/src/web-audio-adapter.ts |
| packages/renderer-common/src/index.ts |
| packages/renderer-common/src/sky.ts |
| packages/renderer-three/src/three-beam-sync.ts |
| packages/renderer-three/src/three-dlight-sync.ts |
| packages/renderer-three/src/three-polyblend-overlay.ts |
| packages/shared/src/index.ts |
| packages/shared/src/port-metadata.ts |
| packages/tests-golden/src/index.ts |
| packages/tests-golden/src/snapshots.ts |

## Lignes avec plusieurs cibles TS

| Ligne | Source | Cibles TS |
| --- | --- | --- |
| 41 | client/anorms.h | packages/qcommon/src/anorms.ts<br>packages/client/src/cl_tent.ts |
| 45 | client/cdaudio.h | packages/client/src/cdaudio.ts<br>packages/platform/src/web-cd-audio-adapter.ts |
| 46 | client/cl_cin.c | packages/client/src/cl_cin.ts<br>packages/client/src/cl_scrn.ts<br>packages/client/src/client.ts |
| 47 | client/cl_ents.c | packages/client/src/cl_ents.ts<br>packages/client/src/cl_parse.ts<br>packages/client/src/refresh.ts<br>packages/client/src/view.ts<br>packages/client/src/cl_tent.ts<br>packages/client/src/cl_newfx.ts<br>packages/renderer-three/src/refresh-entity-sync.ts<br>packages/renderer-three/src/md2-mesh-builder.ts |
| 48 | client/cl_fx.c | packages/client/src/cl_fx.ts<br>packages/client/src/cl_newfx.ts<br>packages/client/src/cl_parse.ts<br>packages/client/src/refresh.ts<br>packages/client/src/monster-flash.ts<br>packages/client/src/cl_ents.ts<br>packages/client/src/cl_main.ts<br>packages/client/src/client.ts |
| 49 | client/cl_input.c | packages/client/src/cl_input.ts<br>packages/client/src/input.ts<br>packages/client/src/client.ts |
| 50 | client/cl_inv.c | packages/client/src/cl_inv.ts<br>packages/client/src/cl_parse.ts<br>packages/client/src/cl_scrn.ts |
| 51 | client/cl_main.c | packages/client/src/cl_main.ts<br>packages/client/src/download.ts<br>packages/client/src/precache.ts<br>packages/client/src/sound.ts<br>packages/client/src/cl_parse.ts<br>packages/client/src/sky.ts<br>packages/client/src/client.ts |
| 52 | client/cl_newfx.c | packages/client/src/cl_newfx.ts<br>packages/client/src/cl_tent.ts<br>packages/client/src/cl_fx.ts<br>packages/client/src/cl_parse.ts<br>packages/client/src/refresh.ts |
| 53 | client/cl_parse.c | packages/client/src/cl_parse.ts<br>packages/client/src/download.ts<br>packages/client/src/sound.ts<br>packages/client/src/cl_scrn.ts<br>packages/client/src/sky.ts |
| 55 | client/cl_scrn.c | packages/client/src/cl_scrn.ts<br>packages/client/src/cl_main.ts<br>packages/client/src/client.ts<br>packages/renderer-three/src/gl_draw.ts<br>packages/renderer-three/src/three-gl-draw-adapter.ts |
| 56 | client/cl_tent.c | packages/client/src/cl_tent.ts<br>packages/client/src/cl_parse.ts<br>packages/client/src/cl_fx.ts<br>packages/client/src/cl_newfx.ts<br>packages/client/src/refresh.ts<br>packages/client/src/sound.ts<br>packages/client/src/client.ts |
| 57 | client/cl_view.c | packages/client/src/view.ts<br>packages/client/src/refresh.ts<br>packages/client/src/menu-player-config.ts<br>apps/web/src/local-client-controller.ts<br>packages/renderer-three/src/refresh-entity-sync.ts |
| 58 | client/client.h | packages/client/src/client.ts<br>packages/client/src/keys.ts<br>packages/client/src/index.ts |
| 59 | client/console.c | packages/client/src/console.ts<br>packages/client/src/index.ts |
| 60 | client/console.h | packages/client/src/console.ts<br>packages/client/src/index.ts |
| 61 | client/input.h | packages/client/src/input.ts<br>packages/client/src/index.ts |
| 62 | client/keys.c | packages/client/src/keys.ts<br>packages/client/src/index.ts |
| 63 | client/keys.h | packages/client/src/keys.ts<br>packages/client/src/index.ts |
| 64 | client/menu.c | packages/client/src/menu.ts<br>packages/client/src/menu-main-game.ts<br>packages/client/src/menu-multiplayer.ts<br>packages/client/src/menu-options-keys.ts<br>packages/client/src/menu-player-config.ts<br>packages/client/src/menu-draw.ts<br>packages/client/src/menu-misc.ts<br>packages/client/src/menu-runtime.ts<br>packages/client/src/menu-types.ts<br>packages/client/src/qmenu.ts<br>packages/client/src/keys.ts<br>packages/client/src/vid.ts |
| 65 | client/qmenu.c | packages/client/src/qmenu.ts<br>packages/client/src/index.ts |
| 66 | client/qmenu.h | packages/client/src/qmenu.ts<br>packages/client/src/keys.ts<br>packages/client/src/index.ts |
| 67 | client/ref.h | packages/client/src/ref.ts<br>packages/qcommon/src/q_shared.ts<br>packages/client/src/cl_scrn.ts<br>packages/client/src/index.ts |
| 68 | client/screen.h | packages/client/src/cl_scrn.ts<br>packages/client/src/client.ts<br>packages/client/src/cl_cin.ts |
| 69 | client/snd_dma.c | packages/client/src/snd_dma.ts<br>packages/client/src/snd_loc.ts<br>packages/client/src/snd_mix.ts<br>packages/client/src/index.ts |
| 70 | client/snd_loc.h | packages/client/src/snd_loc.ts<br>packages/client/src/index.ts |
| 71 | client/snd_mem.c | packages/client/src/snd_mem.ts<br>packages/client/src/snd_loc.ts<br>packages/client/src/snd_dma.ts<br>packages/client/src/snd_mix.ts<br>packages/client/src/index.ts |
| 72 | client/snd_mix.c | packages/client/src/snd_mix.ts<br>packages/client/src/snd_loc.ts<br>packages/client/src/snd_dma.ts<br>packages/client/src/index.ts |
| 73 | client/sound.h | packages/client/src/sound-public.ts<br>packages/client/src/snd_loc.ts<br>packages/client/src/snd_dma.ts<br>packages/client/src/index.ts |
| 74 | client/vid.h | packages/client/src/vid.ts<br>packages/client/src/cl_scrn.ts<br>packages/client/src/vid-menu.ts<br>packages/client/src/index.ts |
| 130 | game/g_ai.c | packages/game/src/g_ai.ts<br>packages/game/src/g_monster.ts<br>packages/game/src/m_move.ts<br>packages/game/src/g_utils.ts<br>packages/game/src/p_trail.ts<br>packages/game/src/runtime.ts<br>packages/game/src/index.ts |
| 131 | game/g_chase.c | packages/game/src/g_chase.ts<br>packages/game/src/g_cmds.ts<br>packages/game/src/p_client.ts<br>packages/game/src/p_hud.ts<br>packages/game/src/index.ts |
| 132 | game/g_cmds.c | packages/game/src/g_cmds.ts<br>packages/game/src/g_main.ts<br>packages/game/src/index.ts<br>packages/game/src/g_items.ts<br>packages/game/src/p_hud.ts<br>packages/game/src/p_client.ts<br>packages/game/src/p_weapon.ts |
| 133 | game/g_combat.c | packages/game/src/g_combat.ts<br>packages/game/src/g_weapon.ts<br>packages/game/src/g_utils.ts<br>packages/game/src/g_items.ts<br>packages/game/src/runtime.ts |
| 134 | game/g_func.c | packages/game/src/g_func.ts<br>packages/game/src/g_spawn.ts<br>packages/game/src/g_misc.ts<br>packages/game/src/index.ts |
| 135 | game/g_items.c | packages/game/src/g_items.ts<br>packages/game/src/p_weapon.ts<br>packages/game/src/local-game-bootstrap.ts<br>packages/game/src/g_spawn.ts<br>packages/game/src/g_combat.ts<br>packages/game/src/index.ts |
| 136 | game/g_local.h | packages/game/src/g_local.ts<br>packages/game/src/runtime.ts<br>packages/game/src/g_items.ts<br>packages/game/src/index.ts |
| 137 | game/g_main.c | packages/game/src/g_main.ts<br>packages/game/src/g_svcmds.ts<br>packages/game/src/g_save.ts<br>packages/game/src/index.ts |
| 138 | game/g_misc.c | packages/game/src/g_misc.ts<br>packages/game/src/g_spawn.ts<br>packages/game/src/index.ts |
| 139 | game/g_monster.c | packages/game/src/g_monster.ts<br>packages/game/src/runtime.ts<br>packages/game/src/g_ai.ts<br>packages/game/src/g_items.ts<br>packages/game/src/index.ts |
| 140 | game/g_phys.c | packages/game/src/g_phys.ts<br>packages/game/src/runtime.ts<br>packages/game/src/touch.ts<br>packages/game/src/m_move.ts |
| 141 | game/g_save.c | packages/game/src/g_save.ts<br>packages/game/src/g_main.ts<br>packages/game/src/index.ts |
| 142 | game/g_spawn.c | packages/game/src/g_spawn.ts<br>packages/game/src/g_main.ts<br>packages/formats/src/qfiles.ts<br>packages/game/src/g_items.ts<br>packages/game/src/g_misc.ts |
| 143 | game/g_svcmds.c | packages/game/src/g_svcmds.ts<br>packages/game/src/g_main.ts<br>packages/game/src/index.ts |
| 144 | game/g_target.c | packages/game/src/g_target.ts<br>packages/game/src/g_spawn.ts<br>packages/game/src/runtime.ts<br>packages/game/src/g_main.ts<br>packages/game/src/index.ts |
| 145 | game/g_trigger.c | packages/game/src/g_trigger.ts<br>packages/game/src/g_spawn.ts<br>packages/game/src/index.ts<br>packages/game/src/touch.ts<br>packages/game/src/g_combat.ts<br>packages/game/src/g_items.ts |
| 146 | game/g_turret.c | packages/game/src/g_turret.ts<br>packages/game/src/g_spawn.ts<br>packages/game/src/index.ts |
| 147 | game/g_utils.c | packages/game/src/g_utils.ts<br>packages/game/src/touch.ts<br>packages/game/src/runtime.ts<br>packages/game/src/g_weapon.ts |
| 148 | game/g_weapon.c | packages/game/src/g_weapon.ts<br>packages/game/src/g_combat.ts<br>packages/game/src/g_utils.ts<br>packages/game/src/g_items.ts<br>packages/game/src/runtime.ts |
| 152 | game/game.h | packages/game/src/game.ts<br>packages/game/src/runtime.ts |
| 154 | game/m_actor.c | packages/game/src/m_actor.ts<br>packages/game/src/g_spawn.ts<br>packages/game/src/runtime.ts<br>packages/game/src/g_monster.ts<br>packages/game/src/g_main.ts<br>packages/client/src/local-gameplay-sync.ts |
| 155 | game/m_actor.h | packages/game/src/m_actor.ts<br>packages/game/src/index.ts |
| 156 | game/m_berserk.c | packages/game/src/m_berserk.ts<br>packages/game/src/g_spawn.ts<br>packages/game/src/g_save.ts<br>packages/game/src/index.ts |
| 157 | game/m_berserk.h | packages/game/src/m_berserk.ts<br>packages/game/src/index.ts |
| 158 | game/m_boss2.c | packages/game/src/m_boss2.ts<br>packages/game/src/g_spawn.ts<br>packages/game/src/g_save.ts<br>packages/game/src/index.ts |
| 159 | game/m_boss2.h | packages/game/src/m_boss2.ts<br>packages/game/src/index.ts |
| 160 | game/m_boss3.c | packages/game/src/m_boss3.ts<br>packages/game/src/g_spawn.ts<br>packages/game/src/g_save.ts<br>packages/game/src/index.ts |
| 161 | game/m_boss31.c | packages/game/src/m_boss31.ts<br>packages/game/src/m_boss32.ts<br>packages/game/src/g_spawn.ts<br>packages/game/src/g_save.ts<br>packages/game/src/index.ts |
| 162 | game/m_boss31.h | packages/game/src/m_boss31.ts<br>packages/game/src/index.ts |
| 163 | game/m_boss32.c | packages/game/src/m_boss32.ts<br>packages/game/src/m_boss31.ts<br>packages/game/src/g_spawn.ts<br>packages/game/src/g_save.ts<br>packages/game/src/index.ts |
| 164 | game/m_boss32.h | packages/game/src/m_boss32.ts<br>packages/game/src/index.ts |
| 165 | game/m_brain.c | packages/game/src/m_brain.ts<br>packages/game/src/g_spawn.ts<br>packages/game/src/g_save.ts<br>packages/game/src/index.ts |
| 166 | game/m_brain.h | packages/game/src/m_brain.ts<br>packages/game/src/index.ts |
| 167 | game/m_chick.c | packages/game/src/m_chick.ts<br>packages/game/src/g_spawn.ts<br>packages/game/src/g_save.ts<br>packages/game/src/index.ts |
| 168 | game/m_chick.h | packages/game/src/m_chick.ts<br>packages/game/src/index.ts |
| 169 | game/m_flash.c | packages/game/src/m_flash.ts<br>packages/client/src/monster-flash.ts<br>packages/client/src/cl_fx.ts<br>packages/game/src/m_actor.ts<br>packages/game/src/m_chick.ts<br>packages/game/src/m_flyer.ts<br>packages/game/src/m_float.ts<br>packages/game/src/m_gladiator.ts<br>packages/game/src/m_gunner.ts<br>packages/game/src/m_hover.ts<br>packages/game/src/m_infantry.ts<br>packages/game/src/m_medic.ts<br>packages/game/src/m_tank.ts<br>packages/game/src/m_supertank.ts |
| 170 | game/m_flipper.c | packages/game/src/m_flipper.ts<br>packages/game/src/g_spawn.ts<br>packages/game/src/index.ts<br>packages/game/src/g_save.ts |
| 171 | game/m_flipper.h | packages/game/src/m_flipper.ts<br>packages/game/src/index.ts |
| 172 | game/m_float.c | packages/game/src/m_float.ts<br>packages/game/src/g_spawn.ts<br>packages/game/src/g_save.ts<br>packages/game/src/index.ts |
| 173 | game/m_float.h | packages/game/src/m_float.ts<br>packages/game/src/index.ts |
| 174 | game/m_flyer.c | packages/game/src/m_flyer.ts<br>packages/game/src/g_spawn.ts<br>packages/game/src/g_save.ts<br>packages/game/src/index.ts |
| 175 | game/m_flyer.h | packages/game/src/m_flyer.ts<br>packages/game/src/index.ts |
| 176 | game/m_gladiator.c | packages/game/src/m_gladiator.ts<br>packages/game/src/g_spawn.ts<br>packages/game/src/g_save.ts<br>packages/game/src/index.ts |
| 177 | game/m_gladiator.h | packages/game/src/m_gladiator.ts<br>packages/game/src/index.ts |
| 178 | game/m_gunner.c | packages/game/src/m_gunner.ts<br>packages/game/src/m_flash.ts<br>packages/game/src/g_spawn.ts<br>packages/game/src/g_save.ts<br>packages/game/src/index.ts |
| 179 | game/m_gunner.h | packages/game/src/m_gunner.ts<br>packages/game/src/index.ts |
| 180 | game/m_hover.c | packages/game/src/m_hover.ts<br>packages/game/src/g_spawn.ts<br>packages/game/src/g_save.ts<br>packages/game/src/index.ts |
| 181 | game/m_hover.h | packages/game/src/m_hover.ts<br>packages/game/src/index.ts |
| 182 | game/m_infantry.c | packages/game/src/m_infantry.ts<br>packages/game/src/g_spawn.ts<br>packages/game/src/g_save.ts<br>packages/game/src/g_turret.ts<br>packages/game/src/index.ts |
| 183 | game/m_infantry.h | packages/game/src/m_infantry.ts<br>packages/game/src/index.ts |
| 184 | game/m_insane.c | packages/game/src/m_insane.ts<br>packages/game/src/g_spawn.ts<br>packages/game/src/index.ts |
| 185 | game/m_insane.h | packages/game/src/m_insane.ts<br>packages/game/src/index.ts |
| 186 | game/m_medic.c | packages/game/src/m_medic.ts<br>packages/game/src/g_spawn.ts<br>packages/game/src/g_save.ts<br>packages/game/src/index.ts |
| 187 | game/m_medic.h | packages/game/src/m_medic.ts<br>packages/game/src/index.ts |
| 188 | game/m_move.c | packages/game/src/m_move.ts<br>packages/game/src/runtime.ts<br>packages/game/src/index.ts |
| 189 | game/m_mutant.c | packages/game/src/m_mutant.ts<br>packages/game/src/g_spawn.ts<br>packages/game/src/g_save.ts<br>packages/game/src/index.ts |
| 190 | game/m_mutant.h | packages/game/src/m_mutant.ts<br>packages/game/src/index.ts |
| 191 | game/m_parasite.c | packages/game/src/m_parasite.ts<br>packages/game/src/g_spawn.ts<br>packages/game/src/g_save.ts<br>packages/game/src/index.ts |
| 192 | game/m_parasite.h | packages/game/src/m_parasite.ts<br>packages/game/src/index.ts |
| 193 | game/m_player.h | packages/game/src/m_player.ts<br>packages/game/src/index.ts |
| 194 | game/m_rider.h | packages/game/src/m_rider.ts<br>packages/game/src/index.ts |
| 195 | game/m_soldier.c | packages/game/src/m_soldier.ts<br>packages/game/src/g_combat.ts<br>packages/game/src/runtime.ts<br>packages/game/src/g_spawn.ts<br>packages/game/src/g_save.ts |
| 196 | game/m_soldier.h | packages/game/src/m_soldier.ts<br>packages/game/src/index.ts |
| 197 | game/m_supertank.c | packages/game/src/m_supertank.ts<br>packages/game/src/m_flash.ts<br>packages/game/src/g_spawn.ts<br>packages/game/src/g_save.ts<br>packages/game/src/index.ts |
| 198 | game/m_supertank.h | packages/game/src/m_supertank.ts<br>packages/game/src/index.ts |
| 199 | game/m_tank.c | packages/game/src/m_tank.ts<br>packages/game/src/m_flash.ts<br>packages/game/src/g_spawn.ts<br>packages/game/src/g_save.ts<br>packages/game/src/index.ts |
| 200 | game/m_tank.h | packages/game/src/m_tank.ts<br>packages/game/src/index.ts |
| 201 | game/p_client.c | packages/game/src/p_client.ts<br>packages/game/src/g_items.ts<br>packages/game/src/g_utils.ts<br>packages/game/src/g_misc.ts<br>packages/game/src/p_hud.ts<br>packages/game/src/g_spawn.ts<br>packages/game/src/g_combat.ts<br>packages/game/src/runtime.ts<br>packages/game/src/g_chase.ts<br>packages/game/src/index.ts |
| 202 | game/p_hud.c | packages/game/src/p_hud.ts<br>packages/game/src/runtime.ts<br>packages/game/src/g_main.ts<br>packages/game/src/p_client.ts<br>packages/game/src/p_view.ts<br>packages/game/src/index.ts |
| 203 | game/p_trail.c | packages/game/src/p_trail.ts<br>packages/game/src/g_ai.ts<br>packages/game/src/runtime.ts<br>packages/game/src/index.ts |
| ... | 36 lignes supplementaires non affichees |

## Cibles suspectes dans apps/web ou packages/platform

| Ligne | Source | Cibles TS |
| --- | --- | --- |
| 45 | client/cdaudio.h | packages/client/src/cdaudio.ts<br>packages/platform/src/web-cd-audio-adapter.ts |
| 57 | client/cl_view.c | packages/client/src/view.ts<br>packages/client/src/refresh.ts<br>packages/client/src/menu-player-config.ts<br>apps/web/src/local-client-controller.ts<br>packages/renderer-three/src/refresh-entity-sync.ts |
| 291 | ref_gl/gl_mesh.c | packages/renderer-three/src/gl_mesh.ts<br>packages/renderer-three/src/md2-mesh-builder.ts<br>packages/renderer-three/src/refresh-entity-sync.ts<br>apps/web/src/main.ts<br>apps/web/src/web-demo-loop.ts<br>apps/web/src/local-client-controller.ts |

## Ecarts avec le mapping basename strict

| Source | TS attendu | Cibles declarees | Cibles exactes detectees | Hints phase 02 |
| --- | --- | --- | --- | --- |
| Quake-2-master/client/cl_pred.c | cl_pred.ts | packages/client/src/view.ts |  | naming-or-split-decision, strict-basename-map-missing |
| Quake-2-master/client/cl_view.c | cl_view.ts | packages/client/src/view.ts<br>packages/client/src/refresh.ts<br>packages/client/src/menu-player-config.ts<br>apps/web/src/local-client-controller.ts<br>packages/renderer-three/src/refresh-entity-sync.ts |  | adapter-boundary-review, multiple-targets-to-review, naming-or-split-decision, strict-basename-map-missing |
| Quake-2-master/client/screen.h | screen.ts | packages/client/src/cl_scrn.ts<br>packages/client/src/client.ts<br>packages/client/src/cl_cin.ts |  | multiple-targets-to-review, naming-or-split-decision, strict-basename-map-missing |
| Quake-2-master/client/sound.h | sound.ts | packages/client/src/sound-public.ts<br>packages/client/src/snd_loc.ts<br>packages/client/src/snd_dma.ts<br>packages/client/src/index.ts | packages/client/src/sound.ts | multiple-targets-to-review, naming-or-split-decision |
| Quake-2-master/qcommon/crc.c | crc.ts | packages/qcommon/src/qcommon.ts<br>packages/qcommon/src/index.ts |  | multiple-targets-to-review, naming-or-split-decision, strict-basename-map-missing |
| Quake-2-master/qcommon/crc.h | crc.ts | packages/qcommon/src/qcommon.ts<br>packages/qcommon/src/index.ts |  | multiple-targets-to-review, naming-or-split-decision, strict-basename-map-missing |
| Quake-2-master/ref_gl/gl_model.c | gl_model.ts | packages/renderer-three/src/gl-model-loader.ts |  | naming-or-split-decision, strict-basename-map-missing |
| Quake-2-master/ref_gl/gl_model.h | gl_model.ts | packages/renderer-three/src/gl-model.ts |  | naming-or-split-decision, strict-basename-map-missing |
| Quake-2-master/win32/vid_menu.c | vid_menu.ts | packages/client/src/vid-menu.ts<br>packages/client/src/vid.ts<br>packages/client/src/index.ts |  | multiple-targets-to-review, naming-or-split-decision, strict-basename-map-missing |

## Sources dupliquees dans le suivi

Aucun point detecte.

