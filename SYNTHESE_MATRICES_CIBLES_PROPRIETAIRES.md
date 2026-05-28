# Synthese des cibles proprietaires des matrices C/H

Generation: 2026-05-28

Source: `audit-portage/validation-incrementale/validation/matrices/`

## Resume

- Matrices analysees: 142
- Matrices avec une seule valeur non vide dans `Fichier cible proprietaire`: 100
- Matrices sans ligne: 4
- Matrices avec lignes mais sans cible proprietaire renseignee: 0
- Matrices avec plusieurs valeurs distinctes: 38

## Detail

| Matrice | Source | Lignes | Une seule valeur ? | Valeur(s) distincte(s) |
| --- | --- | ---: | --- | --- |
| [client_anorms.h.md](audit-portage/validation-incrementale/validation/matrices/client_anorms.h.md) | `Quake-2-master/client/anorms.h` | 0 | Non - aucune ligne |  |
| [client_cdaudio.h.md](audit-portage/validation-incrementale/validation/matrices/client_cdaudio.h.md) | `Quake-2-master/client/cdaudio.h` | 6 | Oui | `packages/client/src/cdaudio.ts` |
| [client_cl_cin.c.md](audit-portage/validation-incrementale/validation/matrices/client_cl_cin.c.md) | `Quake-2-master/client/cl_cin.c` | 48 | Non - plusieurs valeurs | `packages/client/src/cl_cin.ts`<br>`packages/client/src/cl_scrn.ts` |
| [client_cl_ents.c.md](audit-portage/validation-incrementale/validation/matrices/client_cl_ents.c.md) | `Quake-2-master/client/cl_ents.c` | 52 | Non - plusieurs valeurs | `packages/client/src/cl_ents.ts`<br>`packages/client/src/cl_newfx.ts`<br>`packages/client/src/refresh.ts` |
| [client_cl_fx.c.md](audit-portage/validation-incrementale/validation/matrices/client_cl_fx.c.md) | `Quake-2-master/client/cl_fx.c` | 145 | Oui | `packages/client/src/cl_fx.ts` |
| [client_cl_input.c.md](audit-portage/validation-incrementale/validation/matrices/client_cl_input.c.md) | `Quake-2-master/client/cl_input.c` | 75 | Oui | `packages/client/src/cl_input.ts` |
| [client_cl_inv.c.md](audit-portage/validation-incrementale/validation/matrices/client_cl_inv.c.md) | `Quake-2-master/client/cl_inv.c` | 12 | Oui | `packages/client/src/cl_inv.ts` |
| [client_cl_main.c.md](audit-portage/validation-incrementale/validation/matrices/client_cl_main.c.md) | `Quake-2-master/client/cl_main.c` | 154 | Non - plusieurs valeurs | `packages/client/src/cl_main.ts`<br>`packages/client/src/cl_parse.ts`<br>`packages/client/src/precache.ts` |
| [client_cl_newfx.c.md](audit-portage/validation-incrementale/validation/matrices/client_cl_newfx.c.md) | `Quake-2-master/client/cl_newfx.c` | 123 | Non - plusieurs valeurs | `packages/client/src/cl_fx.ts`<br>`packages/client/src/cl_newfx.ts` |
| [client_cl_parse.c.md](audit-portage/validation-incrementale/validation/matrices/client_cl_parse.c.md) | `Quake-2-master/client/cl_parse.c` | 55 | Non - plusieurs valeurs | `packages/client/src/cl_parse.ts`<br>`packages/client/src/cl_scrn.ts`<br>`packages/client/src/download.ts`<br>`packages/client/src/sound-registration.ts` |
| [client_cl_pred.c.md](audit-portage/validation-incrementale/validation/matrices/client_cl_pred.c.md) | `Quake-2-master/client/cl_pred.c` | 29 | Oui | `packages/client/src/cl_pred.ts` |
| [client_cl_scrn.c.md](audit-portage/validation-incrementale/validation/matrices/client_cl_scrn.c.md) | `Quake-2-master/client/cl_scrn.c` | 111 | Oui | `packages/client/src/cl_scrn.ts` |
| [client_cl_tent.c.md](audit-portage/validation-incrementale/validation/matrices/client_cl_tent.c.md) | `Quake-2-master/client/cl_tent.c` | 105 | Non - plusieurs valeurs | `packages/client/src/cl_fx.ts`<br>`packages/client/src/cl_newfx.ts`<br>`packages/client/src/cl_tent.ts`<br>`packages/client/src/client.ts`<br>`packages/client/src/sound.ts` |
| [client_cl_view.c.md](audit-portage/validation-incrementale/validation/matrices/client_cl_view.c.md) | `Quake-2-master/client/cl_view.c` | 37 | Non - plusieurs valeurs | `packages/client/src/cl_view.ts`<br>`packages/client/src/menu-player-config.ts` |
| [client_client.h.md](audit-portage/validation-incrementale/validation/matrices/client_client.h.md) | `Quake-2-master/client/client.h` | 276 | Non - plusieurs valeurs | `packages/client/src/cl_tent.ts`<br>`packages/client/src/client.ts`<br>`packages/client/src/keys.ts` |
| [client_console.c.md](audit-portage/validation-incrementale/validation/matrices/client_console.c.md) | `Quake-2-master/client/console.c` | 51 | Oui | `packages/client/src/console.ts` |
| [client_console.h.md](audit-portage/validation-incrementale/validation/matrices/client_console.h.md) | `Quake-2-master/client/console.h` | 24 | Oui | `packages/client/src/console.ts` |
| [client_input.h.md](audit-portage/validation-incrementale/validation/matrices/client_input.h.md) | `Quake-2-master/client/input.h` | 6 | Oui | `packages/client/src/input.ts` |
| [client_keys.c.md](audit-portage/validation-incrementale/validation/matrices/client_keys.c.md) | `Quake-2-master/client/keys.c` | 52 | Oui | `packages/client/src/keys.ts` |
| [client_keys.h.md](audit-portage/validation-incrementale/validation/matrices/client_keys.h.md) | `Quake-2-master/client/keys.h` | 99 | Oui | `packages/client/src/keys.ts` |
| [client_menu.c.md](audit-portage/validation-incrementale/validation/matrices/client_menu.c.md) | `Quake-2-master/client/menu.c` | 365 | Non - plusieurs valeurs | `packages/client/src/keys.ts`<br>`packages/client/src/menu-draw.ts`<br>`packages/client/src/menu-main-game.ts`<br>`packages/client/src/menu-misc.ts`<br>`packages/client/src/menu-multiplayer.ts`<br>`packages/client/src/menu-options-keys.ts`<br>`packages/client/src/menu-player-config.ts`<br>`packages/client/src/menu-runtime.ts`<br>`packages/client/src/menu-types.ts`<br>`packages/client/src/menu.ts` |
| [client_qmenu.c.md](audit-portage/validation-incrementale/validation/matrices/client_qmenu.c.md) | `Quake-2-master/client/qmenu.c` | 72 | Oui | `packages/client/src/qmenu.ts` |
| [client_qmenu.h.md](audit-portage/validation-incrementale/validation/matrices/client_qmenu.h.md) | `Quake-2-master/client/qmenu.h` | 61 | Non - plusieurs valeurs | `packages/client/src/keys.ts`<br>`packages/client/src/qmenu.ts` |
| [client_ref.h.md](audit-portage/validation-incrementale/validation/matrices/client_ref.h.md) | `Quake-2-master/client/ref.h` | 50 | Non - plusieurs valeurs | `packages/client/src/cl_scrn.ts`<br>`packages/client/src/ref.ts`<br>`packages/qcommon/src/q_shared.ts` |
| [client_screen.h.md](audit-portage/validation-incrementale/validation/matrices/client_screen.h.md) | `Quake-2-master/client/screen.h` | 24 | Oui | `packages/client/src/cl_scrn.ts` |
| [client_snd_dma.c.md](audit-portage/validation-incrementale/validation/matrices/client_snd_dma.c.md) | `Quake-2-master/client/snd_dma.c` | 103 | Non - plusieurs valeurs | `packages/client/src/snd_dma.ts`<br>`packages/client/src/snd_mix.ts` |
| [client_snd_loc.h.md](audit-portage/validation-incrementale/validation/matrices/client_snd_loc.h.md) | `Quake-2-master/client/snd_loc.h` | 77 | Oui | `packages/client/src/snd_loc.ts` |
| [client_snd_mem.c.md](audit-portage/validation-incrementale/validation/matrices/client_snd_mem.c.md) | `Quake-2-master/client/snd_mem.c` | 34 | Non - plusieurs valeurs | `packages/client/src/snd_dma.ts`<br>`packages/client/src/snd_mem.ts`<br>`packages/client/src/snd_mix.ts` |
| [client_snd_mix.c.md](audit-portage/validation-incrementale/validation/matrices/client_snd_mix.c.md) | `Quake-2-master/client/snd_mix.c` | 41 | Non - plusieurs valeurs | `packages/client/src/snd_dma.ts`<br>`packages/client/src/snd_mix.ts` |
| [client_sound.h.md](audit-portage/validation-incrementale/validation/matrices/client_sound.h.md) | `Quake-2-master/client/sound.h` | 13 | Oui | `packages/client/src/sound.ts` |
| [client_vid.h.md](audit-portage/validation-incrementale/validation/matrices/client_vid.h.md) | `Quake-2-master/client/vid.h` | 10 | Non - plusieurs valeurs | `packages/client/src/cl_scrn.ts`<br>`packages/client/src/vid.ts` |
| [game_g_ai.c.md](audit-portage/validation-incrementale/validation/matrices/game_g_ai.c.md) | `Quake-2-master/game/g_ai.c` | 48 | Oui | `packages/game/src/g_ai.ts` |
| [game_g_chase.c.md](audit-portage/validation-incrementale/validation/matrices/game_g_chase.c.md) | `Quake-2-master/game/g_chase.c` | 14 | Oui | `packages/game/src/g_chase.ts` |
| [game_g_cmds.c.md](audit-portage/validation-incrementale/validation/matrices/game_g_cmds.c.md) | `Quake-2-master/game/g_cmds.c` | 74 | Oui | `packages/game/src/g_cmds.ts` |
| [game_g_combat.c.md](audit-portage/validation-incrementale/validation/matrices/game_g_combat.c.md) | `Quake-2-master/game/g_combat.c` | 36 | Oui | `packages/game/src/g_combat.ts` |
| [game_g_func.c.md](audit-portage/validation-incrementale/validation/matrices/game_g_func.c.md) | `Quake-2-master/game/g_func.c` | 150 | Oui | `packages/game/src/g_func.ts` |
| [game_g_items.c.md](audit-portage/validation-incrementale/validation/matrices/game_g_items.c.md) | `Quake-2-master/game/g_items.c` | 109 | Non - plusieurs valeurs | `packages/game/src/g_items.ts`<br>`packages/game/src/p_weapon.ts` |
| [game_g_local.h.md](audit-portage/validation-incrementale/validation/matrices/game_g_local.h.md) | `Quake-2-master/game/g_local.h` | 620 | Non - plusieurs valeurs | `packages/game/src/g_items.ts`<br>`packages/game/src/g_local.ts`<br>`packages/game/src/runtime.ts` |
| [game_g_main.c.md](audit-portage/validation-incrementale/validation/matrices/game_g_main.c.md) | `Quake-2-master/game/g_main.c` | 75 | Non - plusieurs valeurs | `packages/game/src/g_main.ts`<br>`packages/game/src/g_save.ts`<br>`packages/game/src/g_svcmds.ts` |
| [game_g_misc.c.md](audit-portage/validation-incrementale/validation/matrices/game_g_misc.c.md) | `Quake-2-master/game/g_misc.c` | 119 | Non - plusieurs valeurs | `packages/game/src/g_misc.ts`<br>`packages/game/src/g_spawn.ts` |
| [game_g_monster.c.md](audit-portage/validation-incrementale/validation/matrices/game_g_monster.c.md) | `Quake-2-master/game/g_monster.c` | 45 | Oui | `packages/game/src/g_monster.ts` |
| [game_g_phys.c.md](audit-portage/validation-incrementale/validation/matrices/game_g_phys.c.md) | `Quake-2-master/game/g_phys.c` | 64 | Non - plusieurs valeurs | `packages/game/src/g_phys.ts`<br>`packages/game/src/m_move.ts` |
| [game_g_save.c.md](audit-portage/validation-incrementale/validation/matrices/game_g_save.c.md) | `Quake-2-master/game/g_save.c` | 52 | Non - plusieurs valeurs | `packages/game/src/g_main.ts`<br>`packages/game/src/g_save.ts` |
| [game_g_spawn.c.md](audit-portage/validation-incrementale/validation/matrices/game_g_spawn.c.md) | `Quake-2-master/game/g_spawn.c` | 135 | Non - plusieurs valeurs | `packages/game/src/g_items.ts`<br>`packages/game/src/g_main.ts`<br>`packages/game/src/g_misc.ts`<br>`packages/game/src/g_spawn.ts` |
| [game_g_svcmds.c.md](audit-portage/validation-incrementale/validation/matrices/game_g_svcmds.c.md) | `Quake-2-master/game/g_svcmds.c` | 29 | Oui | `packages/game/src/g_svcmds.ts` |
| [game_g_target.c.md](audit-portage/validation-incrementale/validation/matrices/game_g_target.c.md) | `Quake-2-master/game/g_target.c` | 59 | Non - plusieurs valeurs | `packages/game/src/g_spawn.ts`<br>`packages/game/src/g_target.ts` |
| [game_g_trigger.c.md](audit-portage/validation-incrementale/validation/matrices/game_g_trigger.c.md) | `Quake-2-master/game/g_trigger.c` | 33 | Oui | `packages/game/src/g_trigger.ts` |
| [game_g_turret.c.md](audit-portage/validation-incrementale/validation/matrices/game_g_turret.c.md) | `Quake-2-master/game/g_turret.c` | 27 | Oui | `packages/game/src/g_turret.ts` |
| [game_g_utils.c.md](audit-portage/validation-incrementale/validation/matrices/game_g_utils.c.md) | `Quake-2-master/game/g_utils.c` | 37 | Non - plusieurs valeurs | `packages/game/src/g_utils.ts`<br>`packages/game/src/g_weapon.ts`<br>`packages/game/src/runtime.ts`<br>`packages/game/src/touch.ts` |
| [game_g_weapon.c.md](audit-portage/validation-incrementale/validation/matrices/game_g_weapon.c.md) | `Quake-2-master/game/g_weapon.c` | 69 | Oui | `packages/game/src/g_weapon.ts` |
| [game_game.h.md](audit-portage/validation-incrementale/validation/matrices/game_game.h.md) | `Quake-2-master/game/game.h` | 29 | Non - plusieurs valeurs | `packages/game/src/game.ts`<br>`packages/game/src/runtime.ts` |
| [game_m_actor.c.md](audit-portage/validation-incrementale/validation/matrices/game_m_actor.c.md) | `Quake-2-master/game/m_actor.c` | 69 | Oui | `packages/game/src/m_actor.ts` |
| [game_m_actor.h.md](audit-portage/validation-incrementale/validation/matrices/game_m_actor.h.md) | `Quake-2-master/game/m_actor.h` | 482 | Oui | `packages/game/src/m_actor.ts` |
| [game_m_berserk.c.md](audit-portage/validation-incrementale/validation/matrices/game_m_berserk.c.md) | `Quake-2-master/game/m_berserk.c` | 67 | Oui | `packages/game/src/m_berserk.ts` |
| [game_m_berserk.h.md](audit-portage/validation-incrementale/validation/matrices/game_m_berserk.h.md) | `Quake-2-master/game/m_berserk.h` | 245 | Oui | `packages/game/src/m_berserk.ts` |
| [game_m_boss2.c.md](audit-portage/validation-incrementale/validation/matrices/game_m_boss2.c.md) | `Quake-2-master/game/m_boss2.c` | 80 | Oui | `packages/game/src/m_boss2.ts` |
| [game_m_boss2.h.md](audit-portage/validation-incrementale/validation/matrices/game_m_boss2.h.md) | `Quake-2-master/game/m_boss2.h` | 182 | Oui | `packages/game/src/m_boss2.ts` |
| [game_m_boss3.c.md](audit-portage/validation-incrementale/validation/matrices/game_m_boss3.c.md) | `Quake-2-master/game/m_boss3.c` | 3 | Oui | `packages/game/src/m_boss3.ts` |
| [game_m_boss31.c.md](audit-portage/validation-incrementale/validation/matrices/game_m_boss31.c.md) | `Quake-2-master/game/m_boss31.c` | 108 | Non - plusieurs valeurs | `packages/game/src/m_boss31.ts`<br>`packages/game/src/m_boss32.ts` |
| [game_m_boss31.h.md](audit-portage/validation-incrementale/validation/matrices/game_m_boss31.h.md) | `Quake-2-master/game/m_boss31.h` | 189 | Oui | `packages/game/src/m_boss31.ts` |
| [game_m_boss32.c.md](audit-portage/validation-incrementale/validation/matrices/game_m_boss32.c.md) | `Quake-2-master/game/m_boss32.c` | 111 | Oui | `packages/game/src/m_boss32.ts` |
| [game_m_boss32.h.md](audit-portage/validation-incrementale/validation/matrices/game_m_boss32.h.md) | `Quake-2-master/game/m_boss32.h` | 492 | Oui | `packages/game/src/m_boss32.ts` |
| [game_m_brain.c.md](audit-portage/validation-incrementale/validation/matrices/game_m_brain.c.md) | `Quake-2-master/game/m_brain.c` | 92 | Oui | `packages/game/src/m_brain.ts` |
| [game_m_brain.h.md](audit-portage/validation-incrementale/validation/matrices/game_m_brain.h.md) | `Quake-2-master/game/m_brain.h` | 223 | Oui | `packages/game/src/m_brain.ts` |
| [game_m_chick.c.md](audit-portage/validation-incrementale/validation/matrices/game_m_chick.c.md) | `Quake-2-master/game/m_chick.c` | 115 | Oui | `packages/game/src/m_chick.ts` |
| [game_m_chick.h.md](audit-portage/validation-incrementale/validation/matrices/game_m_chick.h.md) | `Quake-2-master/game/m_chick.h` | 289 | Oui | `packages/game/src/m_chick.ts` |
| [game_m_flash.c.md](audit-portage/validation-incrementale/validation/matrices/game_m_flash.c.md) | `Quake-2-master/game/m_flash.c` | 2 | Oui | `packages/game/src/m_flash.ts` |
| [game_m_flipper.c.md](audit-portage/validation-incrementale/validation/matrices/game_m_flipper.c.md) | `Quake-2-master/game/m_flipper.c` | 61 | Oui | `packages/game/src/m_flipper.ts` |
| [game_m_flipper.h.md](audit-portage/validation-incrementale/validation/matrices/game_m_flipper.h.md) | `Quake-2-master/game/m_flipper.h` | 161 | Oui | `packages/game/src/m_flipper.ts` |
| [game_m_float.c.md](audit-portage/validation-incrementale/validation/matrices/game_m_float.c.md) | `Quake-2-master/game/m_float.c` | 77 | Oui | `packages/game/src/m_float.ts` |
| [game_m_float.h.md](audit-portage/validation-incrementale/validation/matrices/game_m_float.h.md) | `Quake-2-master/game/m_float.h` | 249 | Oui | `packages/game/src/m_float.ts` |
| [game_m_flyer.c.md](audit-portage/validation-incrementale/validation/matrices/game_m_flyer.c.md) | `Quake-2-master/game/m_flyer.c` | 108 | Oui | `packages/game/src/m_flyer.ts` |
| [game_m_flyer.h.md](audit-portage/validation-incrementale/validation/matrices/game_m_flyer.h.md) | `Quake-2-master/game/m_flyer.h` | 157 | Oui | `packages/game/src/m_flyer.ts` |
| [game_m_gladiator.c.md](audit-portage/validation-incrementale/validation/matrices/game_m_gladiator.c.md) | `Quake-2-master/game/m_gladiator.c` | 59 | Oui | `packages/game/src/m_gladiator.ts` |
| [game_m_gladiator.h.md](audit-portage/validation-incrementale/validation/matrices/game_m_gladiator.h.md) | `Quake-2-master/game/m_gladiator.h` | 91 | Oui | `packages/game/src/m_gladiator.ts` |
| [game_m_gunner.c.md](audit-portage/validation-incrementale/validation/matrices/game_m_gunner.c.md) | `Quake-2-master/game/m_gunner.c` | 95 | Oui | `packages/game/src/m_gunner.ts` |
| [game_m_gunner.h.md](audit-portage/validation-incrementale/validation/matrices/game_m_gunner.h.md) | `Quake-2-master/game/m_gunner.h` | 210 | Oui | `packages/game/src/m_gunner.ts` |
| [game_m_hover.c.md](audit-portage/validation-incrementale/validation/matrices/game_m_hover.c.md) | `Quake-2-master/game/m_hover.c` | 96 | Oui | `packages/game/src/m_hover.ts` |
| [game_m_hover.h.md](audit-portage/validation-incrementale/validation/matrices/game_m_hover.h.md) | `Quake-2-master/game/m_hover.h` | 206 | Oui | `packages/game/src/m_hover.ts` |
| [game_m_infantry.c.md](audit-portage/validation-incrementale/validation/matrices/game_m_infantry.c.md) | `Quake-2-master/game/m_infantry.c` | 84 | Oui | `packages/game/src/m_infantry.ts` |
| [game_m_infantry.h.md](audit-portage/validation-incrementale/validation/matrices/game_m_infantry.h.md) | `Quake-2-master/game/m_infantry.h` | 208 | Oui | `packages/game/src/m_infantry.ts` |
| [game_m_insane.c.md](audit-portage/validation-incrementale/validation/matrices/game_m_insane.c.md) | `Quake-2-master/game/m_insane.c` | 92 | Oui | `packages/game/src/m_insane.ts` |
| [game_m_insane.h.md](audit-portage/validation-incrementale/validation/matrices/game_m_insane.h.md) | `Quake-2-master/game/m_insane.h` | 283 | Oui | `packages/game/src/m_insane.ts` |
| [game_m_medic.c.md](audit-portage/validation-incrementale/validation/matrices/game_m_medic.c.md) | `Quake-2-master/game/m_medic.c` | 86 | Non - plusieurs valeurs | `packages/game/src/g_spawn.ts`<br>`packages/game/src/m_medic.ts` |
| [game_m_medic.h.md](audit-portage/validation-incrementale/validation/matrices/game_m_medic.h.md) | `Quake-2-master/game/m_medic.h` | 238 | Oui | `packages/game/src/m_medic.ts` |
| [game_m_move.c.md](audit-portage/validation-incrementale/validation/matrices/game_m_move.c.md) | `Quake-2-master/game/m_move.c` | 31 | Oui | `packages/game/src/m_move.ts` |
| [game_m_mutant.c.md](audit-portage/validation-incrementale/validation/matrices/game_m_mutant.c.md) | `Quake-2-master/game/m_mutant.c` | 92 | Oui | `packages/game/src/m_mutant.ts` |
| [game_m_mutant.h.md](audit-portage/validation-incrementale/validation/matrices/game_m_mutant.h.md) | `Quake-2-master/game/m_mutant.h` | 150 | Oui | `packages/game/src/m_mutant.ts` |
| [game_m_parasite.c.md](audit-portage/validation-incrementale/validation/matrices/game_m_parasite.c.md) | `Quake-2-master/game/m_parasite.c` | 100 | Oui | `packages/game/src/m_parasite.ts` |
| [game_m_parasite.h.md](audit-portage/validation-incrementale/validation/matrices/game_m_parasite.h.md) | `Quake-2-master/game/m_parasite.h` | 119 | Oui | `packages/game/src/m_parasite.ts` |
| [game_m_player.h.md](audit-portage/validation-incrementale/validation/matrices/game_m_player.h.md) | `Quake-2-master/game/m_player.h` | 199 | Oui | `packages/game/src/m_player.ts` |
| [game_m_rider.h.md](audit-portage/validation-incrementale/validation/matrices/game_m_rider.h.md) | `Quake-2-master/game/m_rider.h` | 61 | Oui | `packages/game/src/m_rider.ts` |
| [game_m_soldier.c.md](audit-portage/validation-incrementale/validation/matrices/game_m_soldier.c.md) | `Quake-2-master/game/m_soldier.c` | 145 | Oui | `packages/game/src/m_soldier.ts` |
| [game_m_soldier.h.md](audit-portage/validation-incrementale/validation/matrices/game_m_soldier.h.md) | `Quake-2-master/game/m_soldier.h` | 476 | Oui | `packages/game/src/m_soldier.ts` |
| [game_m_supertank.c.md](audit-portage/validation-incrementale/validation/matrices/game_m_supertank.c.md) | `Quake-2-master/game/m_supertank.c` | 93 | Oui | `packages/game/src/m_supertank.ts` |
| [game_m_supertank.h.md](audit-portage/validation-incrementale/validation/matrices/game_m_supertank.h.md) | `Quake-2-master/game/m_supertank.h` | 255 | Oui | `packages/game/src/m_supertank.ts` |
| [game_m_tank.c.md](audit-portage/validation-incrementale/validation/matrices/game_m_tank.c.md) | `Quake-2-master/game/m_tank.c` | 119 | Oui | `packages/game/src/m_tank.ts` |
| [game_m_tank.h.md](audit-portage/validation-incrementale/validation/matrices/game_m_tank.h.md) | `Quake-2-master/game/m_tank.h` | 295 | Oui | `packages/game/src/m_tank.ts` |
| [game_p_client.c.md](audit-portage/validation-incrementale/validation/matrices/game_p_client.c.md) | `Quake-2-master/game/p_client.c` | 100 | Non - plusieurs valeurs | `packages/game/src/g_chase.ts`<br>`packages/game/src/g_items.ts`<br>`packages/game/src/g_misc.ts`<br>`packages/game/src/p_client.ts` |
| [game_p_hud.c.md](audit-portage/validation-incrementale/validation/matrices/game_p_hud.c.md) | `Quake-2-master/game/p_hud.c` | 25 | Oui | `packages/game/src/p_hud.ts` |
| [game_p_trail.c.md](audit-portage/validation-incrementale/validation/matrices/game_p_trail.c.md) | `Quake-2-master/game/p_trail.c` | 19 | Oui | `packages/game/src/p_trail.ts` |
| [game_p_view.c.md](audit-portage/validation-incrementale/validation/matrices/game_p_view.c.md) | `Quake-2-master/game/p_view.c` | 49 | Non - plusieurs valeurs | `packages/game/src/g_main.ts`<br>`packages/game/src/p_view.ts` |
| [game_p_weapon.c.md](audit-portage/validation-incrementale/validation/matrices/game_p_weapon.c.md) | `Quake-2-master/game/p_weapon.c` | 141 | Non - plusieurs valeurs | `packages/game/src/g_items.ts`<br>`packages/game/src/g_weapon.ts`<br>`packages/game/src/p_weapon.ts`<br>`packages/game/src/runtime.ts` |
| [game_q_shared.c.md](audit-portage/validation-incrementale/validation/matrices/game_q_shared.c.md) | `Quake-2-master/game/q_shared.c` | 106 | Non - plusieurs valeurs | `packages/math/src/q_shared.ts`<br>`packages/qcommon/src/common.ts`<br>`packages/qcommon/src/q_shared.ts`<br>`packages/qcommon/src/system.ts` |
| [game_q_shared.h.md](audit-portage/validation-incrementale/validation/matrices/game_q_shared.h.md) | `Quake-2-master/game/q_shared.h` | 630 | Non - plusieurs valeurs | `packages/game/src/m_flash.ts`<br>`packages/game/src/runtime.ts`<br>`packages/math/src/q_shared.ts`<br>`packages/qcommon/src/common.ts`<br>`packages/qcommon/src/cvar.ts`<br>`packages/qcommon/src/q_shared.ts`<br>`packages/qcommon/src/system.ts` |
| [qcommon_cmd.c.md](audit-portage/validation-incrementale/validation/matrices/qcommon_cmd.c.md) | `Quake-2-master/qcommon/cmd.c` | 72 | Oui | `packages/qcommon/src/cmd.ts` |
| [qcommon_cmodel.c.md](audit-portage/validation-incrementale/validation/matrices/qcommon_cmodel.c.md) | `Quake-2-master/qcommon/cmodel.c` | 195 | Oui | `packages/qcommon/src/cmodel.ts` |
| [qcommon_common.c.md](audit-portage/validation-incrementale/validation/matrices/qcommon_common.c.md) | `Quake-2-master/qcommon/common.c` | 153 | Non - plusieurs valeurs | `packages/memory/src/sizebuf.ts`<br>`packages/qcommon/src/common.ts`<br>`packages/qcommon/src/messages.ts`<br>`packages/qcommon/src/qcommon.ts` |
| [qcommon_crc.c.md](audit-portage/validation-incrementale/validation/matrices/qcommon_crc.c.md) | `Quake-2-master/qcommon/crc.c` | 8 | Non - plusieurs valeurs | `packages/qcommon/src/crc.ts`<br>`packages/qcommon/src/qcommon.ts` |
| [qcommon_crc.h.md](audit-portage/validation-incrementale/validation/matrices/qcommon_crc.h.md) | `Quake-2-master/qcommon/crc.h` | 4 | Oui | `packages/qcommon/src/crc.ts` |
| [qcommon_cvar.c.md](audit-portage/validation-incrementale/validation/matrices/qcommon_cvar.c.md) | `Quake-2-master/qcommon/cvar.c` | 54 | Oui | `packages/qcommon/src/cvar.ts` |
| [qcommon_files.c.md](audit-portage/validation-incrementale/validation/matrices/qcommon_files.c.md) | `Quake-2-master/qcommon/files.c` | 83 | Non - plusieurs valeurs | `packages/filesystem/src/files.ts`<br>`packages/formats/src/pak.ts` |
| [qcommon_md4.c.md](audit-portage/validation-incrementale/validation/matrices/qcommon_md4.c.md) | `Quake-2-master/qcommon/md4.c` | 44 | Oui | `packages/qcommon/src/md4.ts` |
| [qcommon_net_chan.c.md](audit-portage/validation-incrementale/validation/matrices/qcommon_net_chan.c.md) | `Quake-2-master/qcommon/net_chan.c` | 26 | Non - plusieurs valeurs | `packages/qcommon/src/net_chan.ts`<br>`packages/qcommon/src/qcommon.ts` |
| [qcommon_pmove.c.md](audit-portage/validation-incrementale/validation/matrices/qcommon_pmove.c.md) | `Quake-2-master/qcommon/pmove.c` | 95 | Oui | `packages/qcommon/src/pmove.ts` |
| [qcommon_qcommon.h.md](audit-portage/validation-incrementale/validation/matrices/qcommon_qcommon.h.md) | `Quake-2-master/qcommon/qcommon.h` | 321 | Non - plusieurs valeurs | `packages/filesystem/src/files.ts`<br>`packages/memory/src/sizebuf.ts`<br>`packages/qcommon/src/cmd.ts`<br>`packages/qcommon/src/cmodel.ts`<br>`packages/qcommon/src/common.ts`<br>`packages/qcommon/src/cvar.ts`<br>`packages/qcommon/src/md4.ts`<br>`packages/qcommon/src/messages.ts`<br>`packages/qcommon/src/pmove.ts`<br>`packages/qcommon/src/protocol.ts`<br>`packages/qcommon/src/qcommon.ts`<br>`packages/qcommon/src/system.ts` |
| [qcommon_qfiles.h.md](audit-portage/validation-incrementale/validation/matrices/qcommon_qfiles.h.md) | `Quake-2-master/qcommon/qfiles.h` | 226 | Non - plusieurs valeurs | `packages/formats/src/md2.ts`<br>`packages/formats/src/pak.ts`<br>`packages/formats/src/pcx.ts`<br>`packages/formats/src/qfiles.ts`<br>`packages/formats/src/sp2.ts`<br>`packages/formats/src/wal.ts` |
| [ref_gl_anorms.h.md](audit-portage/validation-incrementale/validation/matrices/ref_gl_anorms.h.md) | `Quake-2-master/ref_gl/anorms.h` | 0 | Non - aucune ligne |  |
| [ref_gl_anormtab.h.md](audit-portage/validation-incrementale/validation/matrices/ref_gl_anormtab.h.md) | `Quake-2-master/ref_gl/anormtab.h` | 0 | Non - aucune ligne |  |
| [ref_gl_gl_draw.c.md](audit-portage/validation-incrementale/validation/matrices/ref_gl_gl_draw.c.md) | `Quake-2-master/ref_gl/gl_draw.c` | 15 | Oui | `packages/renderer-three/src/gl_draw.ts` |
| [ref_gl_gl_image.c.md](audit-portage/validation-incrementale/validation/matrices/ref_gl_gl_image.c.md) | `Quake-2-master/ref_gl/gl_image.c` | 76 | Oui | `packages/renderer-three/src/gl_image.ts` |
| [ref_gl_gl_light.c.md](audit-portage/validation-incrementale/validation/matrices/ref_gl_gl_light.c.md) | `Quake-2-master/ref_gl/gl_light.c` | 33 | Oui | `packages/renderer-three/src/gl_light.ts` |
| [ref_gl_gl_local.h.md](audit-portage/validation-incrementale/validation/matrices/ref_gl_gl_local.h.md) | `Quake-2-master/ref_gl/gl_local.h` | 144 | Oui | `packages/renderer-three/src/gl_local.ts` |
| [ref_gl_gl_mesh.c.md](audit-portage/validation-incrementale/validation/matrices/ref_gl_gl_mesh.c.md) | `Quake-2-master/ref_gl/gl_mesh.c` | 25 | Oui | `packages/renderer-three/src/gl_mesh.ts` |
| [ref_gl_gl_model.c.md](audit-portage/validation-incrementale/validation/matrices/ref_gl_gl_model.c.md) | `Quake-2-master/ref_gl/gl_model.c` | 42 | Oui | `packages/renderer-three/src/gl_model.ts` |
| [ref_gl_gl_model.h.md](audit-portage/validation-incrementale/validation/matrices/ref_gl_gl_model.h.md) | `Quake-2-master/ref_gl/gl_model.h` | 31 | Oui | `packages/renderer-three/src/gl_model.ts` |
| [ref_gl_gl_rmain.c.md](audit-portage/validation-incrementale/validation/matrices/ref_gl_gl_rmain.c.md) | `Quake-2-master/ref_gl/gl_rmain.c` | 60 | Oui | `packages/renderer-three/src/gl_rmain.ts` |
| [ref_gl_gl_rmisc.c.md](audit-portage/validation-incrementale/validation/matrices/ref_gl_gl_rmisc.c.md) | `Quake-2-master/ref_gl/gl_rmisc.c` | 8 | Oui | `packages/renderer-three/src/gl_rmisc.ts` |
| [ref_gl_gl_rsurf.c.md](audit-portage/validation-incrementale/validation/matrices/ref_gl_gl_rsurf.c.md) | `Quake-2-master/ref_gl/gl_rsurf.c` | 56 | Oui | `packages/renderer-three/src/gl_rsurf.ts` |
| [ref_gl_gl_warp.c.md](audit-portage/validation-incrementale/validation/matrices/ref_gl_gl_warp.c.md) | `Quake-2-master/ref_gl/gl_warp.c` | 31 | Oui | `packages/renderer-three/src/gl_warp.ts` |
| [ref_gl_qgl.h.md](audit-portage/validation-incrementale/validation/matrices/ref_gl_qgl.h.md) | `Quake-2-master/ref_gl/qgl.h` | 21 | Oui | `packages/renderer-three/src/qgl.ts` |
| [ref_gl_warpsin.h.md](audit-portage/validation-incrementale/validation/matrices/ref_gl_warpsin.h.md) | `Quake-2-master/ref_gl/warpsin.h` | 0 | Non - aucune ligne |  |
| [server_server.h.md](audit-portage/validation-incrementale/validation/matrices/server_server.h.md) | `Quake-2-master/server/server.h` | 116 | Oui | `packages/server/src/server.ts` |
| [server_sv_ccmds.c.md](audit-portage/validation-incrementale/validation/matrices/server_sv_ccmds.c.md) | `Quake-2-master/server/sv_ccmds.c` | 57 | Oui | `packages/server/src/sv_ccmds.ts` |
| [server_sv_ents.c.md](audit-portage/validation-incrementale/validation/matrices/server_sv_ents.c.md) | `Quake-2-master/server/sv_ents.c` | 37 | Oui | `packages/server/src/sv_ents.ts` |
| [server_sv_game.c.md](audit-portage/validation-incrementale/validation/matrices/server_sv_game.c.md) | `Quake-2-master/server/sv_game.c` | 42 | Oui | `packages/server/src/sv_game.ts` |
| [server_sv_init.c.md](audit-portage/validation-incrementale/validation/matrices/server_sv_init.c.md) | `Quake-2-master/server/sv_init.c` | 31 | Oui | `packages/server/src/sv_init.ts` |
| [server_sv_main.c.md](audit-portage/validation-incrementale/validation/matrices/server_sv_main.c.md) | `Quake-2-master/server/sv_main.c` | 83 | Oui | `packages/server/src/sv_main.ts` |
| [server_sv_null.c.md](audit-portage/validation-incrementale/validation/matrices/server_sv_null.c.md) | `Quake-2-master/server/sv_null.c` | 3 | Oui | `packages/server/src/sv_null.ts` |
| [server_sv_send.c.md](audit-portage/validation-incrementale/validation/matrices/server_sv_send.c.md) | `Quake-2-master/server/sv_send.c` | 42 | Oui | `packages/server/src/sv_send.ts` |
| [server_sv_user.c.md](audit-portage/validation-incrementale/validation/matrices/server_sv_user.c.md) | `Quake-2-master/server/sv_user.c` | 49 | Oui | `packages/server/src/sv_user.ts` |
| [server_sv_world.c.md](audit-portage/validation-incrementale/validation/matrices/server_sv_world.c.md) | `Quake-2-master/server/sv_world.c` | 49 | Oui | `packages/server/src/sv_world.ts` |
