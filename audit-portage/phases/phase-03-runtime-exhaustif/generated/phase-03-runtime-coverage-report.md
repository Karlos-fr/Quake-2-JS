# Rapport automatique Phase 03.F

Ce rapport ferme la passe outillee Phase 03. Il consolide les sous-phases 03.A a 03.E et ne transforme aucun fichier en OK ISO sans audit comportemental cible.

## Resume

- Fichiers source runtime retenus : 127
- Fichiers avec symboles C/H indexes : 127
- Fichiers TS runtime indexes : 150
- Symboles source indexes : 14150
- Symboles TS indexes : 16781
- Lignes de parite symbole C -> TS : 14150
- Racines runtime trouvees cote TS : 12/12
- Tables declaratives candidates : 289
- Lignes de matrice de couverture : 14150
- Fichiers audites 03.E : 127
- Verdicts fichier : Partiel=4, A redecouper=123
- Categories declaratives obligatoires non extraites : cvars, network-messages, temp-entities, effects-renderfx, configstrings, precaches

## Matrice Runtime

- Lignes avec symbole TS : 11613
- Lignes sans symbole TS : 2537
- Lignes avec tests lies : 0
- Fichiers sans ligne matrice : 1

## Racines Runtime

| Racine | Statut | C | TS |
| --- | --- | --- | --- |
| Qcommon_Frame | found-in-c-and-ts | Quake-2-master/qcommon/common.c:1491<br>Quake-2-master/qcommon/qcommon.h:772 | packages/qcommon/src/qcommon.ts:1238 |
| SV_Frame | found-in-c-and-ts | Quake-2-master/qcommon/qcommon.h:823<br>Quake-2-master/server/sv_main.c:760<br>Quake-2-master/server/sv_null.c:12 | packages/server/src/host.ts:145<br>packages/server/src/sv_main.ts:981<br>packages/server/src/sv_null.ts:62<br>packages/qcommon/src/qcommon.ts:1555 |
| SV_RunGameFrame | found-in-c-and-ts | Quake-2-master/server/sv_main.c:723 | packages/server/src/sv_main.ts:948 |
| G_RunFrame | found-in-c-and-ts | Quake-2-master/game/g_main.c:87<br>Quake-2-master/game/g_main.c:353 | packages/game/src/g_main.ts:327<br>packages/game/src/g_phys.ts:876 |
| ClientThink | found-in-c-and-ts | Quake-2-master/game/g_main.c:75<br>Quake-2-master/game/p_client.c:1570 | packages/game/src/p_client.ts:1701 |
| ClientBeginServerFrame | found-in-c-and-ts | Quake-2-master/game/g_local.h:756<br>Quake-2-master/game/p_client.c:1755 | packages/game/src/p_client.ts:1835 |
| CL_Frame | found-in-c-and-ts | Quake-2-master/client/cl_main.c:1677<br>Quake-2-master/qcommon/qcommon.h:817 | packages/client/src/cl_main.ts:1037<br>packages/qcommon/src/qcommon.ts:1490 |
| CL_SendCommand | found-in-c-and-ts | Quake-2-master/client/cl_main.c:1649 | packages/client/src/cl_main.ts:1016 |
| CL_SendCmd | found-in-c-and-ts | Quake-2-master/client/cl_input.c:453<br>Quake-2-master/client/client.h:481 | packages/client/src/cl_input.ts:679 |
| CL_ReadPackets | found-in-c-and-ts | Quake-2-master/client/cl_main.c:987<br>Quake-2-master/client/client.h:486 | packages/client/src/cl_main.ts:1398 |
| CL_ParseServerMessage | found-in-c-and-ts | Quake-2-master/client/cl_parse.c:652<br>Quake-2-master/client/client.h:509 | packages/client/src/cl_parse.ts:712 |
| PMove | found-in-c-and-ts | Quake-2-master/qcommon/pmove.c:1240<br>Quake-2-master/qcommon/qcommon.h:685 | packages/client/src/local-gameplay-sync.ts:858<br>packages/qcommon/src/pmove.ts:1310 |

## Atteignabilite

- Racines analysees : 12
- Racines tracees C et TS : 11
- Racines avec findings : 12
- Fonctions C atteignables depuis au moins une racine : 648
- Fonctions C non atteintes par ces racines : 1791
- Fonctions TS atteignables depuis au moins une racine : 562
- Fonctions TS non atteintes par ces racines : 2458

## Tables Declaratives

- Tables extraites : 289
- Tables comparees : 289
- Tables matched : 289
- Tables partielles : 0
- Tables sans cible TS : 0
- Categories obligatoires non extraites : cvars, network-messages, temp-entities, effects-renderfx, configstrings, precaches

## Verdicts Fichier

| Verdict | Fichiers |
| --- | --- |
| A redecouper | 123 |
| Partiel | 4 |

## Blocages Phase 02

- Fichiers a redecouper : 123

| Source | TS principale | Findings principaux |
| --- | --- | --- |
| Quake-2-master/client/cdaudio.h | packages/client/src/cdaudio.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/client/cl_cin.c | packages/client/src/cl_cin.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/client/cl_ents.c | packages/client/src/cl_ents.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/client/cl_fx.c | packages/client/src/cl_fx.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/client/cl_input.c | packages/client/src/cl_input.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/client/cl_inv.c | packages/client/src/cl_inv.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/client/cl_main.c | packages/client/src/cl_main.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/client/cl_newfx.c | packages/client/src/cl_newfx.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/client/cl_parse.c | packages/client/src/cl_parse.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/client/cl_scrn.c | packages/client/src/cl_scrn.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/client/cl_tent.c | packages/client/src/cl_tent.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/client/cl_view.c | packages/client/src/cl_view.ts | declared-target-not-strict-basename<br>multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented<br>strict-basename-target-missing |
| Quake-2-master/client/client.h | packages/client/src/client.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/client/console.c | packages/client/src/console.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/client/console.h | packages/client/src/console.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/client/input.h | packages/client/src/input.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/client/keys.c | packages/client/src/keys.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/client/keys.h | packages/client/src/keys.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/client/menu.c | packages/client/src/menu.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/client/qmenu.c | packages/client/src/qmenu.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/client/qmenu.h | packages/client/src/qmenu.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/client/ref.h | packages/client/src/ref.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/client/screen.h | packages/client/src/cl_scrn.ts | declared-target-not-strict-basename<br>multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented<br>strict-basename-target-missing |
| Quake-2-master/client/snd_dma.c | packages/client/src/snd_dma.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/client/snd_loc.h | packages/client/src/snd_loc.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/client/snd_mem.c | packages/client/src/snd_mem.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/client/snd_mix.c | packages/client/src/snd_mix.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/client/sound.h | packages/client/src/sound.ts | declared-target-not-strict-basename<br>multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/client/vid.h | packages/client/src/vid.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/g_ai.c | packages/game/src/g_ai.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/g_chase.c | packages/game/src/g_chase.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/g_cmds.c | packages/game/src/g_cmds.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/g_combat.c | packages/game/src/g_combat.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/g_func.c | packages/game/src/g_func.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/g_items.c | packages/game/src/g_items.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/g_local.h | packages/game/src/g_local.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/g_main.c | packages/game/src/g_main.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/g_misc.c | packages/game/src/g_misc.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/g_monster.c | packages/game/src/g_monster.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/g_phys.c | packages/game/src/g_phys.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/g_save.c | packages/game/src/g_save.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/g_spawn.c | packages/game/src/g_spawn.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/g_svcmds.c | packages/game/src/g_svcmds.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/g_target.c | packages/game/src/g_target.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/g_trigger.c | packages/game/src/g_trigger.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/g_turret.c | packages/game/src/g_turret.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/g_utils.c | packages/game/src/g_utils.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/g_weapon.c | packages/game/src/g_weapon.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/game.h | packages/game/src/game.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/m_actor.c | packages/game/src/m_actor.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/m_actor.h | packages/game/src/m_actor.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/m_berserk.c | packages/game/src/m_berserk.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/m_berserk.h | packages/game/src/m_berserk.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/m_boss2.c | packages/game/src/m_boss2.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/m_boss2.h | packages/game/src/m_boss2.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/m_boss3.c | packages/game/src/m_boss3.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/m_boss31.c | packages/game/src/m_boss31.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/m_boss31.h | packages/game/src/m_boss31.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/m_boss32.c | packages/game/src/m_boss32.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/m_boss32.h | packages/game/src/m_boss32.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/m_brain.c | packages/game/src/m_brain.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/m_brain.h | packages/game/src/m_brain.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/m_chick.c | packages/game/src/m_chick.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/m_chick.h | packages/game/src/m_chick.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/m_flash.c | packages/game/src/m_flash.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/m_flipper.c | packages/game/src/m_flipper.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/m_flipper.h | packages/game/src/m_flipper.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/m_float.c | packages/game/src/m_float.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/m_float.h | packages/game/src/m_float.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/m_flyer.c | packages/game/src/m_flyer.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/m_flyer.h | packages/game/src/m_flyer.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/m_gladiator.c | packages/game/src/m_gladiator.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/m_gladiator.h | packages/game/src/m_gladiator.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/m_gunner.c | packages/game/src/m_gunner.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/m_gunner.h | packages/game/src/m_gunner.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/m_hover.c | packages/game/src/m_hover.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/m_hover.h | packages/game/src/m_hover.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/m_infantry.c | packages/game/src/m_infantry.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/m_infantry.h | packages/game/src/m_infantry.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| Quake-2-master/game/m_insane.c | packages/game/src/m_insane.ts | multiple-declared-ts-targets<br>phase02-structural-status:split-undocumented |
| ... | ... | 43 fichiers supplementaires dans phase-03-runtime-file-audits.json |

## Restes Runtime

- Fichiers Partiel : 4
- Fichiers avec symboles TS manquants : 82
- Fichiers sans test lie : 127

| Source | Verdict | TS manquants | Findings |
| --- | --- | --- | --- |
| Quake-2-master/client/anorms.h | Partiel | 0 | basename-collision<br>multiple-declared-ts-targets<br>no-runtime-matrix-row |
| Quake-2-master/client/cl_pred.c | Partiel | 8 | declared-target-not-strict-basename<br>header:temporary marker detected<br>missing-linked-test-for-some-symbols<br>missing-ts-symbols:8<br>strict-basename-target-missing<br>unreachable-functions:3 |
| Quake-2-master/qcommon/cvar.c | Partiel | 26 | missing-linked-test-for-some-symbols<br>missing-ts-symbols:26<br>unreachable-functions:5 |
| Quake-2-master/qcommon/pmove.c | Partiel | 25 | header:stub marker detected<br>missing-linked-test-for-some-symbols<br>missing-ts-symbols:25 |

## Transferts Phase 04/05

Les integrations web, plateforme et renderer detectees restent des consommateurs/adapters. Elles ne doivent pas masquer les blocages runtime ci-dessus.

- Fichiers avec cible adapter/platform detectee : 2
- Fichiers mentionnant apps/web, renderer-three ou platform dans les cibles : 4

| Source | Cibles concernees | Findings |
| --- | --- | --- |
| Quake-2-master/client/cdaudio.h | packages/platform/src/web-cd-audio-adapter.ts | adapter-target-declared<br>multiple-declared-ts-targets |
| Quake-2-master/client/cl_ents.c | packages/renderer-three/src/md2-mesh-builder.ts<br>packages/renderer-three/src/refresh-entity-sync.ts | multiple-declared-ts-targets |
| Quake-2-master/client/cl_scrn.c | packages/renderer-three/src/gl_draw.ts<br>packages/renderer-three/src/three-gl-draw-adapter.ts | multiple-declared-ts-targets |
| Quake-2-master/client/cl_view.c | packages/renderer-three/src/refresh-entity-sync.ts | adapter-target-declared<br>declared-target-not-strict-basename<br>multiple-declared-ts-targets<br>strict-basename-target-missing |

## Decision De Fermeture

- Phase 03 outillee fermee : oui, les sorties relancables 03.A-03.F existent.
- Phase 03 comportementale ISO fermee : non, 124 fichiers restent `A redecouper` par statut structurel Phase 02 et 3 restent `Partiel`.
- Prochaine action recommandee : revenir en Phase 02 pour accepter/documenter les splits legitimes ou corriger les rattachements, puis relancer 03.B-03.F.

