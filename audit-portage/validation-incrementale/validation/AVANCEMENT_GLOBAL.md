# Avancement global de validation

Ce fichier est le point d'entree operationnel pour reprendre la validation incrementale.

Statuts possibles : `A demarrer`, `En cours`, `Bloque`, `Partiel`, `Termine`, `A revoir`.

| Fichier source | Matrice | Progress | Statut | Entites | Validees | Partielles | Manquantes | Non conformes | Non applicables | Prochain lot | Priorite |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| `Quake-2-master/client/anorms.h` | [`client_anorms.h.md`](matrices/client_anorms.h.md) |  | A revoir | 0 | 0 | 0 | 0 | 0 | 0 |  | Normale |
| `Quake-2-master/client/cdaudio.h` | [`client_cdaudio.h.md`](matrices/client_cdaudio.h.md) |  | A demarrer | 6 | 0 | 0 | 0 | 0 | 0 |  | Normale |
| `Quake-2-master/client/cl_cin.c` | [`client_cl_cin.c.md`](matrices/client_cl_cin.c.md) |  | A demarrer | 48 | 0 | 0 | 0 | 0 | 0 |  | Normale |
| `Quake-2-master/client/cl_ents.c` | [`client_cl_ents.c.md`](matrices/client_cl_ents.c.md) |  | A demarrer | 52 | 0 | 0 | 0 | 0 | 0 |  | Normale |
| `Quake-2-master/client/cl_fx.c` | [`client_cl_fx.c.md`](matrices/client_cl_fx.c.md) |  | A demarrer | 145 | 0 | 0 | 0 | 0 | 0 |  | Normale |
| `Quake-2-master/client/cl_input.c` | [`client_cl_input.c.md`](matrices/client_cl_input.c.md) |  | A demarrer | 75 | 0 | 0 | 0 | 0 | 0 |  | Normale |
| `Quake-2-master/client/cl_inv.c` | [`client_cl_inv.c.md`](matrices/client_cl_inv.c.md) |  | A demarrer | 12 | 0 | 0 | 0 | 0 | 0 |  | Normale |
| `Quake-2-master/client/cl_main.c` | [`client_cl_main.c.md`](matrices/client_cl_main.c.md) |  | A demarrer | 154 | 0 | 0 | 0 | 0 | 0 |  | Normale |
| `Quake-2-master/client/cl_newfx.c` | [`client_cl_newfx.c.md`](matrices/client_cl_newfx.c.md) |  | A demarrer | 123 | 0 | 0 | 0 | 0 | 0 |  | Normale |
| `Quake-2-master/client/cl_parse.c` | [`client_cl_parse.c.md`](matrices/client_cl_parse.c.md) |  | A demarrer | 55 | 0 | 0 | 0 | 0 | 0 |  | Normale |
| `Quake-2-master/client/cl_pred.c` | [`client_cl_pred.c.md`](matrices/client_cl_pred.c.md) |  | A demarrer | 29 | 0 | 0 | 0 | 0 | 0 |  | Normale |
| `Quake-2-master/client/cl_scrn.c` | [`client_cl_scrn.c.md`](matrices/client_cl_scrn.c.md) |  | A demarrer | 111 | 0 | 0 | 0 | 0 | 0 |  | Normale |
| `Quake-2-master/client/cl_tent.c` | [`client_cl_tent.c.md`](matrices/client_cl_tent.c.md) |  | A demarrer | 105 | 0 | 0 | 0 | 0 | 0 |  | Normale |
| `Quake-2-master/client/cl_view.c` | [`client_cl_view.c.md`](matrices/client_cl_view.c.md) |  | A demarrer | 37 | 0 | 0 | 0 | 0 | 0 |  | Normale |
| `Quake-2-master/client/client.h` | [`client_client.h.md`](matrices/client_client.h.md) |  | A demarrer | 276 | 0 | 0 | 0 | 0 | 0 |  | Normale |
| `Quake-2-master/client/console.c` | [`client_console.c.md`](matrices/client_console.c.md) |  | A demarrer | 51 | 0 | 0 | 0 | 0 | 0 |  | Normale |
| `Quake-2-master/client/console.h` | [`client_console.h.md`](matrices/client_console.h.md) |  | A demarrer | 24 | 0 | 0 | 0 | 0 | 0 |  | Normale |
| `Quake-2-master/client/input.h` | [`client_input.h.md`](matrices/client_input.h.md) |  | A demarrer | 6 | 0 | 0 | 0 | 0 | 0 |  | Normale |
| `Quake-2-master/client/keys.c` | [`client_keys.c.md`](matrices/client_keys.c.md) |  | A demarrer | 52 | 0 | 0 | 0 | 0 | 0 |  | Normale |
| `Quake-2-master/client/keys.h` | [`client_keys.h.md`](matrices/client_keys.h.md) |  | A demarrer | 99 | 0 | 0 | 0 | 0 | 0 |  | Normale |
| `Quake-2-master/client/menu.c` | [`client_menu.c.md`](matrices/client_menu.c.md) |  | A demarrer | 365 | 0 | 0 | 0 | 0 | 0 |  | Normale |
| `Quake-2-master/client/qmenu.c` | [`client_qmenu.c.md`](matrices/client_qmenu.c.md) |  | A demarrer | 72 | 0 | 0 | 0 | 0 | 0 |  | Normale |
| `Quake-2-master/client/qmenu.h` | [`client_qmenu.h.md`](matrices/client_qmenu.h.md) |  | A demarrer | 61 | 0 | 0 | 0 | 0 | 0 |  | Normale |
| `Quake-2-master/client/ref.h` | [`client_ref.h.md`](matrices/client_ref.h.md) |  | A demarrer | 50 | 0 | 0 | 0 | 0 | 0 |  | Normale |
| `Quake-2-master/client/screen.h` | [`client_screen.h.md`](matrices/client_screen.h.md) |  | A demarrer | 24 | 0 | 0 | 0 | 0 | 0 |  | Normale |
| `Quake-2-master/client/snd_dma.c` | [`client_snd_dma.c.md`](matrices/client_snd_dma.c.md) |  | A demarrer | 103 | 0 | 0 | 0 | 0 | 0 |  | Normale |
| `Quake-2-master/client/snd_loc.h` | [`client_snd_loc.h.md`](matrices/client_snd_loc.h.md) |  | A demarrer | 77 | 0 | 0 | 0 | 0 | 0 |  | Normale |
| `Quake-2-master/client/snd_mem.c` | [`client_snd_mem.c.md`](matrices/client_snd_mem.c.md) |  | A demarrer | 34 | 0 | 0 | 0 | 0 | 0 |  | Normale |
| `Quake-2-master/client/snd_mix.c` | [`client_snd_mix.c.md`](matrices/client_snd_mix.c.md) |  | A demarrer | 41 | 0 | 0 | 0 | 0 | 0 |  | Normale |
| `Quake-2-master/client/sound.h` | [`client_sound.h.md`](matrices/client_sound.h.md) |  | A demarrer | 13 | 0 | 0 | 0 | 0 | 0 |  | Normale |
| `Quake-2-master/client/vid.h` | [`client_vid.h.md`](matrices/client_vid.h.md) |  | A demarrer | 10 | 0 | 0 | 0 | 0 | 0 |  | Normale |
| `Quake-2-master/game/g_ai.c` | [`game_g_ai.c.md`](matrices/game_g_ai.c.md) | [`game_g_ai.c.md`](progress/game_g_ai.c.md) | Termine | 48 | 26 | 0 | 0 | 0 | 22 | `ai_stand`, puis `ai_walk`/`ai_charge`/`ai_turn` si le lot reste petit, en gardant `FindTarget` pour une session separee. | Haute |
| `Quake-2-master/game/g_chase.c` | [`game_g_chase.c.md`](matrices/game_g_chase.c.md) | [`game_g_chase.c.md`](progress/game_g_chase.c.md) | Termine | 14 | 4 | 0 | 0 | 0 | 10 | Fichier termine cote `g_chase.c`; prochain lot recommande hors fichier: reprendre le prochain fichier prioritaire dans `AVANCEMENT_GLOBAL.md`. | Haute |
| `Quake-2-master/game/g_cmds.c` | [`game_g_cmds.c.md`](matrices/game_g_cmds.c.md) | [`game_g_cmds.c.md`](progress/game_g_cmds.c.md) | Termine | 74 | 74 | 0 | 0 | 0 | 0 | `Cmd_Give_f` et temporaires locaux associes (`name`, `it`, `index`, `i`, `give_all`, `it_ent`). | Haute |
| `Quake-2-master/game/g_combat.c` | [`game_g_combat.c.md`](matrices/game_g_combat.c.md) | [`game_g_combat.c.md`](progress/game_g_combat.c.md) | Termine | 36 | 36 | 0 | 0 | 0 | 0 | Aucun lot restant dans cette matrice: toutes les lignes sont `Valide`. Laisser le coordinateur mettre a jour `AVANCEMENT_GLOBAL.md`. | Haute |
| `Quake-2-master/game/g_func.c` | [`game_g_func.c.md`](matrices/game_g_func.c.md) | [`game_g_func.c.md`](progress/game_g_func.c.md) | En cours | 150 | 81 | 0 | 0 | 0 | 1 | Continuer avec `SP_func_door_rotating`. | Haute |
| `Quake-2-master/game/g_items.c` | [`game_g_items.c.md`](matrices/game_g_items.c.md) | [`game_g_items.c.md`](progress/game_g_items.c.md) | En cours | 109 | 80 | 0 | 0 | 0 | 0 | Reprendre la prochaine entree `A verifier` restante de `game_g_items.c.md` dans l'ordre de la matrice: `Pickup_Powerup`. | Haute |
| `Quake-2-master/game/g_local.h` | [`game_g_local.h.md`](matrices/game_g_local.h.md) | [`game_g_local.h.md`](progress/game_g_local.h.md) | En cours | 620 | 118 | 0 | 0 | 0 | 1 | Continuer avec le prochain petit groupe de champs de `gitem_s`: `icon`, `pickup_name`, `count_width`, puis `quantity`/`ammo` si le lot reste raisonnable. | Haute |
| `Quake-2-master/game/g_main.c` | [`game_g_main.c.md`](matrices/game_g_main.c.md) | [`game_g_main.c.md`](progress/game_g_main.c.md) | Partiel | 75 | 37 | 8 | 0 | 0 | 1 | Continuer avec le prochain symbole `g_main.c` dans la matrice: `ReadLevel`. | Haute |
| `Quake-2-master/game/g_misc.c` | [`game_g_misc.c.md`](matrices/game_g_misc.c.md) | [`game_g_misc.c.md`](progress/game_g_misc.c.md) | En cours | 119 | 45 | 0 | 0 | 0 | 0 | `func_explosive_explode` avec les locaux associes `count` et `mass` si le lot reste coherent. | Haute |
| `Quake-2-master/game/g_monster.c` | [`game_g_monster.c.md`](matrices/game_g_monster.c.md) | [`game_g_monster.c.md`](progress/game_g_monster.c.md) | En cours | 45 | 11 | 0 | 0 | 0 | 0 | `M_CheckGround` avec ses locales `point` et `trace` si le lot reste petit | Haute |
| `Quake-2-master/game/g_phys.c` | [`game_g_phys.c.md`](matrices/game_g_phys.c.md) | [`game_g_phys.c.md`](progress/game_g_phys.c.md) | En cours | 64 | 6 | 0 | 0 | 0 | 0 | `SV_RunThink` avec sa locale `thinktime`. | Haute |
| `Quake-2-master/game/g_save.c` | [`game_g_save.c.md`](matrices/game_g_save.c.md) |  | A demarrer | 52 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/g_spawn.c` | [`game_g_spawn.c.md`](matrices/game_g_spawn.c.md) |  | A demarrer | 135 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/g_svcmds.c` | [`game_g_svcmds.c.md`](matrices/game_g_svcmds.c.md) |  | A demarrer | 29 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/g_target.c` | [`game_g_target.c.md`](matrices/game_g_target.c.md) |  | A demarrer | 59 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/g_trigger.c` | [`game_g_trigger.c.md`](matrices/game_g_trigger.c.md) |  | A demarrer | 33 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/g_turret.c` | [`game_g_turret.c.md`](matrices/game_g_turret.c.md) |  | A demarrer | 27 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/g_utils.c` | [`game_g_utils.c.md`](matrices/game_g_utils.c.md) |  | A demarrer | 37 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/g_weapon.c` | [`game_g_weapon.c.md`](matrices/game_g_weapon.c.md) |  | A demarrer | 69 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/game.h` | [`game_game.h.md`](matrices/game_game.h.md) |  | A demarrer | 29 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/m_actor.c` | [`game_m_actor.c.md`](matrices/game_m_actor.c.md) |  | A demarrer | 69 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/m_actor.h` | [`game_m_actor.h.md`](matrices/game_m_actor.h.md) |  | A demarrer | 482 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/m_berserk.c` | [`game_m_berserk.c.md`](matrices/game_m_berserk.c.md) |  | A demarrer | 67 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/m_berserk.h` | [`game_m_berserk.h.md`](matrices/game_m_berserk.h.md) |  | A demarrer | 245 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/m_boss2.c` | [`game_m_boss2.c.md`](matrices/game_m_boss2.c.md) |  | A demarrer | 80 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/m_boss2.h` | [`game_m_boss2.h.md`](matrices/game_m_boss2.h.md) |  | A demarrer | 182 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/m_boss3.c` | [`game_m_boss3.c.md`](matrices/game_m_boss3.c.md) |  | A demarrer | 3 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/m_boss31.c` | [`game_m_boss31.c.md`](matrices/game_m_boss31.c.md) |  | A demarrer | 108 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/m_boss31.h` | [`game_m_boss31.h.md`](matrices/game_m_boss31.h.md) |  | A demarrer | 189 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/m_boss32.c` | [`game_m_boss32.c.md`](matrices/game_m_boss32.c.md) |  | A demarrer | 111 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/m_boss32.h` | [`game_m_boss32.h.md`](matrices/game_m_boss32.h.md) |  | A demarrer | 492 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/m_brain.c` | [`game_m_brain.c.md`](matrices/game_m_brain.c.md) |  | A demarrer | 92 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/m_brain.h` | [`game_m_brain.h.md`](matrices/game_m_brain.h.md) |  | A demarrer | 223 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/m_chick.c` | [`game_m_chick.c.md`](matrices/game_m_chick.c.md) | [`game_m_chick.c.md`](progress/game_m_chick.c.md) | Termine | 115 | 113 | 0 | 0 | 0 | 2 | aucun, fichier clos | Haute |
| `Quake-2-master/game/m_chick.h` | [`game_m_chick.h.md`](matrices/game_m_chick.h.md) |  | A demarrer | 289 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/m_flash.c` | [`game_m_flash.c.md`](matrices/game_m_flash.c.md) |  | A demarrer | 2 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/m_flipper.c` | [`game_m_flipper.c.md`](matrices/game_m_flipper.c.md) |  | A demarrer | 61 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/m_flipper.h` | [`game_m_flipper.h.md`](matrices/game_m_flipper.h.md) |  | A demarrer | 161 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/m_float.c` | [`game_m_float.c.md`](matrices/game_m_float.c.md) |  | A demarrer | 77 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/m_float.h` | [`game_m_float.h.md`](matrices/game_m_float.h.md) |  | A demarrer | 249 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/m_flyer.c` | [`game_m_flyer.c.md`](matrices/game_m_flyer.c.md) |  | A demarrer | 108 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/m_flyer.h` | [`game_m_flyer.h.md`](matrices/game_m_flyer.h.md) |  | A demarrer | 157 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/m_gladiator.c` | [`game_m_gladiator.c.md`](matrices/game_m_gladiator.c.md) |  | A demarrer | 59 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/m_gladiator.h` | [`game_m_gladiator.h.md`](matrices/game_m_gladiator.h.md) |  | A demarrer | 91 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/m_gunner.c` | [`game_m_gunner.c.md`](matrices/game_m_gunner.c.md) |  | A demarrer | 95 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/m_gunner.h` | [`game_m_gunner.h.md`](matrices/game_m_gunner.h.md) |  | A demarrer | 210 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/m_hover.c` | [`game_m_hover.c.md`](matrices/game_m_hover.c.md) |  | A demarrer | 96 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/m_hover.h` | [`game_m_hover.h.md`](matrices/game_m_hover.h.md) |  | A demarrer | 206 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/m_infantry.c` | [`game_m_infantry.c.md`](matrices/game_m_infantry.c.md) |  | A demarrer | 84 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/m_infantry.h` | [`game_m_infantry.h.md`](matrices/game_m_infantry.h.md) |  | A demarrer | 208 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/m_insane.c` | [`game_m_insane.c.md`](matrices/game_m_insane.c.md) |  | A demarrer | 92 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/m_insane.h` | [`game_m_insane.h.md`](matrices/game_m_insane.h.md) |  | A demarrer | 283 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/m_medic.c` | [`game_m_medic.c.md`](matrices/game_m_medic.c.md) |  | A demarrer | 86 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/m_medic.h` | [`game_m_medic.h.md`](matrices/game_m_medic.h.md) |  | A demarrer | 238 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/m_move.c` | [`game_m_move.c.md`](matrices/game_m_move.c.md) |  | A demarrer | 31 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/m_mutant.c` | [`game_m_mutant.c.md`](matrices/game_m_mutant.c.md) |  | A demarrer | 92 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/m_mutant.h` | [`game_m_mutant.h.md`](matrices/game_m_mutant.h.md) |  | A demarrer | 150 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/m_parasite.c` | [`game_m_parasite.c.md`](matrices/game_m_parasite.c.md) |  | A demarrer | 100 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/m_parasite.h` | [`game_m_parasite.h.md`](matrices/game_m_parasite.h.md) |  | A demarrer | 119 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/m_player.h` | [`game_m_player.h.md`](matrices/game_m_player.h.md) |  | A demarrer | 199 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/m_rider.h` | [`game_m_rider.h.md`](matrices/game_m_rider.h.md) |  | A demarrer | 61 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/m_soldier.c` | [`game_m_soldier.c.md`](matrices/game_m_soldier.c.md) |  | A demarrer | 145 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/m_soldier.h` | [`game_m_soldier.h.md`](matrices/game_m_soldier.h.md) |  | A demarrer | 476 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/m_supertank.c` | [`game_m_supertank.c.md`](matrices/game_m_supertank.c.md) |  | A demarrer | 93 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/m_supertank.h` | [`game_m_supertank.h.md`](matrices/game_m_supertank.h.md) |  | A demarrer | 255 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/m_tank.c` | [`game_m_tank.c.md`](matrices/game_m_tank.c.md) |  | A demarrer | 119 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/m_tank.h` | [`game_m_tank.h.md`](matrices/game_m_tank.h.md) |  | A demarrer | 295 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/p_client.c` | [`game_p_client.c.md`](matrices/game_p_client.c.md) |  | A demarrer | 100 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/p_hud.c` | [`game_p_hud.c.md`](matrices/game_p_hud.c.md) |  | A demarrer | 25 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/p_trail.c` | [`game_p_trail.c.md`](matrices/game_p_trail.c.md) |  | A demarrer | 19 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/p_view.c` | [`game_p_view.c.md`](matrices/game_p_view.c.md) |  | A demarrer | 49 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/p_weapon.c` | [`game_p_weapon.c.md`](matrices/game_p_weapon.c.md) |  | A demarrer | 141 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/q_shared.c` | [`game_q_shared.c.md`](matrices/game_q_shared.c.md) |  | A demarrer | 106 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/game/q_shared.h` | [`game_q_shared.h.md`](matrices/game_q_shared.h.md) |  | A demarrer | 630 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/qcommon/cmd.c` | [`qcommon_cmd.c.md`](matrices/qcommon_cmd.c.md) |  | A demarrer | 72 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/qcommon/cmodel.c` | [`qcommon_cmodel.c.md`](matrices/qcommon_cmodel.c.md) |  | A demarrer | 195 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/qcommon/common.c` | [`qcommon_common.c.md`](matrices/qcommon_common.c.md) |  | A demarrer | 153 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/qcommon/crc.c` | [`qcommon_crc.c.md`](matrices/qcommon_crc.c.md) |  | A demarrer | 8 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/qcommon/crc.h` | [`qcommon_crc.h.md`](matrices/qcommon_crc.h.md) |  | A demarrer | 4 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/qcommon/cvar.c` | [`qcommon_cvar.c.md`](matrices/qcommon_cvar.c.md) |  | A demarrer | 54 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/qcommon/files.c` | [`qcommon_files.c.md`](matrices/qcommon_files.c.md) |  | A demarrer | 83 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/qcommon/md4.c` | [`qcommon_md4.c.md`](matrices/qcommon_md4.c.md) |  | A demarrer | 44 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/qcommon/net_chan.c` | [`qcommon_net_chan.c.md`](matrices/qcommon_net_chan.c.md) |  | A demarrer | 26 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/qcommon/pmove.c` | [`qcommon_pmove.c.md`](matrices/qcommon_pmove.c.md) |  | A demarrer | 95 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/qcommon/qcommon.h` | [`qcommon_qcommon.h.md`](matrices/qcommon_qcommon.h.md) |  | A demarrer | 321 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/qcommon/qfiles.h` | [`qcommon_qfiles.h.md`](matrices/qcommon_qfiles.h.md) |  | A demarrer | 226 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/ref_gl/anorms.h` | [`ref_gl_anorms.h.md`](matrices/ref_gl_anorms.h.md) |  | A revoir | 0 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/ref_gl/anormtab.h` | [`ref_gl_anormtab.h.md`](matrices/ref_gl_anormtab.h.md) |  | A revoir | 0 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/ref_gl/gl_draw.c` | [`ref_gl_gl_draw.c.md`](matrices/ref_gl_gl_draw.c.md) |  | A demarrer | 15 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/ref_gl/gl_image.c` | [`ref_gl_gl_image.c.md`](matrices/ref_gl_gl_image.c.md) |  | A demarrer | 76 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/ref_gl/gl_light.c` | [`ref_gl_gl_light.c.md`](matrices/ref_gl_gl_light.c.md) |  | A demarrer | 33 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/ref_gl/gl_local.h` | [`ref_gl_gl_local.h.md`](matrices/ref_gl_gl_local.h.md) |  | A demarrer | 144 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/ref_gl/gl_mesh.c` | [`ref_gl_gl_mesh.c.md`](matrices/ref_gl_gl_mesh.c.md) |  | A demarrer | 25 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/ref_gl/gl_model.c` | [`ref_gl_gl_model.c.md`](matrices/ref_gl_gl_model.c.md) |  | A demarrer | 42 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/ref_gl/gl_model.h` | [`ref_gl_gl_model.h.md`](matrices/ref_gl_gl_model.h.md) |  | A demarrer | 31 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/ref_gl/gl_rmain.c` | [`ref_gl_gl_rmain.c.md`](matrices/ref_gl_gl_rmain.c.md) |  | A demarrer | 60 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/ref_gl/gl_rmisc.c` | [`ref_gl_gl_rmisc.c.md`](matrices/ref_gl_gl_rmisc.c.md) |  | A demarrer | 8 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/ref_gl/gl_rsurf.c` | [`ref_gl_gl_rsurf.c.md`](matrices/ref_gl_gl_rsurf.c.md) |  | A demarrer | 56 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/ref_gl/gl_warp.c` | [`ref_gl_gl_warp.c.md`](matrices/ref_gl_gl_warp.c.md) |  | A demarrer | 31 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/ref_gl/qgl.h` | [`ref_gl_qgl.h.md`](matrices/ref_gl_qgl.h.md) |  | A demarrer | 21 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/ref_gl/warpsin.h` | [`ref_gl_warpsin.h.md`](matrices/ref_gl_warpsin.h.md) |  | A revoir | 0 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/server/server.h` | [`server_server.h.md`](matrices/server_server.h.md) |  | A demarrer | 116 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/server/sv_ccmds.c` | [`server_sv_ccmds.c.md`](matrices/server_sv_ccmds.c.md) |  | A demarrer | 57 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/server/sv_ents.c` | [`server_sv_ents.c.md`](matrices/server_sv_ents.c.md) |  | A demarrer | 37 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/server/sv_game.c` | [`server_sv_game.c.md`](matrices/server_sv_game.c.md) |  | A demarrer | 42 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/server/sv_init.c` | [`server_sv_init.c.md`](matrices/server_sv_init.c.md) |  | A demarrer | 31 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/server/sv_main.c` | [`server_sv_main.c.md`](matrices/server_sv_main.c.md) |  | A demarrer | 83 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/server/sv_null.c` | [`server_sv_null.c.md`](matrices/server_sv_null.c.md) |  | A demarrer | 3 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/server/sv_send.c` | [`server_sv_send.c.md`](matrices/server_sv_send.c.md) |  | A demarrer | 42 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/server/sv_user.c` | [`server_sv_user.c.md`](matrices/server_sv_user.c.md) |  | A demarrer | 49 | 0 | 0 | 0 | 0 | 0 |  | Haute |
| `Quake-2-master/server/sv_world.c` | [`server_sv_world.c.md`](matrices/server_sv_world.c.md) |  | A demarrer | 49 | 0 | 0 | 0 | 0 | 0 |  | Haute |
