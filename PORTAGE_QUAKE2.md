# Suivi des fichiers du depot Quake 2

Fichier genere automatiquement a partir du depot source : C:\a\Projets\Quake-2\Quake-2-master

Le suivi doit etre mis a jour au fur et a mesure du portage.

Convention recommandee pour les colonnes `A porter` et `Porte` :

- `⬜` : pas traite
- `🟡` : a analyser / a cadrer
- `🟠` : en cours
- `✅` : porte
- `⛔` : non porte volontairement

Les colonnes `Description / role`, `A porter`, `Porte` et `Cible` sont a completer manuellement au fil du projet.

| Path | Nom | Description / role | A porter | Porte | Cible |
|---|---|---|---|---|---|
| 3.15_Changes.txt | 3.15_Changes.txt |  | ⛔ |  |  |
| 3.16_Changes.txt | 3.16_Changes.txt |  | ⛔ |  |  |
| 3.17_Changes.txt | 3.17_Changes.txt |  | ⛔ |  |  |
| 3.18_changes.txt | 3.18_changes.txt |  | ⛔ |  |  |
| baseq2\config.cfg | config.cfg |  |  |  |  |
| baseq2\save\save0\game.ssv | game.ssv |  |  |  |  |
| baseq2\save\save0\server.ssv | server.ssv |  |  |  |  |
| changes.txt | changes.txt |  | ⛔ |  |  |
| client\adivtab.h | adivtab.h |  |  |  |  |
| client\anorms.h | anorms.h | Canonical 162-entry Quake II byte-direction lookup table used by temp entities and encoded normals, now mirrored strictly as `BYTE_DIRS` / `DirFromByte` and shared explicitly with the temp-entity and encoded-normal consumers. | ✅ | ✅ | packages/qcommon/src/anorms.ts, packages/client/src/tent.ts |
| client\asm_i386.h | asm_i386.h |  |  |  |  |
| client\block16.h | block16.h |  |  |  |  |
| client\block8.h | block8.h |  |  |  |  |
| client\cdaudio.h | cdaudio.h |  |  |  |  |
| client\cl_cin.c | cl_cin.c |  |  |  |  |
| client\cl_ents.c | cl_ents.c | Entity delta parsing, packet entity reconstruction, frame interpolation inputs and render-side entity staging, now also exercised through a local gameplay-to-client snapshot feed that populates `cl_parse_entities` and `centity_t` for visible world objects, plus a Three.js sync layer consuming `ClientRefreshFrame.entities` as the primary and now exclusive world-object source in the web app for the current scope, with dedicated harnesses covering `EF_ANIM*`, `EF_ROTATE`, `EF_SPINNINGLIGHTS`, `RF_FRAMELERP`, `RF_TRANSLUCENT`, `RF_GLOW`, `EF_POWERSCREEN`, linked `modelindex*` composition, `skinnum`-driven MD2 skin selection, map-driven visible flags, composed-entity slot audits, phase-10 map validation, phase-11 fidelity reporting and origin preservation through the active world-entity pipeline. | 🟠 | 🟠 | packages/client/src/parse.ts, packages/client/src/entities.ts, packages/client/src/refresh.ts, apps/web/src/local-client-controller.ts, packages/renderer-three/src/refresh-entity-sync.ts, packages/renderer-three/src/md2-mesh-builder.ts, apps/web/src/main.ts, scripts/verify/quake2-entities-phase4.ts, scripts/verify/quake2-entities-phase5.ts, scripts/verify/quake2-entities-phase5-map-flags.ts, scripts/verify/quake2-alias-orientation-phase6.ts, scripts/verify/quake2-entities-phase6-skinnum.ts, scripts/verify/quake2-entities-phase7-origin-audit.ts, scripts/verify/quake2-entities-phase8-scene.ts, scripts/verify/quake2-entities-phase9.ts, scripts/verify/quake2-entities-phase10.ts, scripts/verify/quake2-entities-phase10-maps.ts, scripts/verify/quake2-entities-phase11.ts, RAPPORT_PHASE11_ENTITES.md |
| client\cl_fx.c | cl_fx.c | Client-side muzzle flashes, dynamic lights, light-style animation and weapon effect parsing before renderer/audio side effects, with phase-1 `CL_ClearLightStyles` / `CL_RunLightStyles` / `CL_SetLightstyle` / `CL_AddLightStyles` now wired from `CS_LIGHTS`, phase-2 `cdlight_t` / `CL_ClearDlights` / `CL_AllocDlight` / `CL_NewDlight` / `CL_RunDLights` exposed through the refresh snapshot, phase-3 player muzzle-flash light origins, random radii, `minlight`, exact `die` durations, special `MZ_*` cases and `CL_LogoutEffect` metadata, phase-4 `CL_ParseMuzzleFlash2` monster flash origins through `monster_flash_offset`, grouped `MZ2_*` sound/color handling, attenuation variants and secondary particle/smoke markers, phase-5 particle/trail families now backed by a real `cparticle_t` pool plus `CL_ClearParticles` / `CL_AddParticles` integration into the refresh snapshot, phase-6 `CL_EntityEvent` coverage for respawn, teleport, footsteps and fall sounds with `cl_footsteps` wiring, and phase-7 `CL_ClearEffects` now grouped and called through the client clear-state path. | 🟠 | 🟠 | packages/client/src/parse.ts, packages/client/src/effects.ts, packages/client/src/entities.ts, packages/client/src/main.ts, packages/client/src/types.ts, packages/client/src/refresh.ts, packages/client/src/monster-flash.ts |
| client\cl_input.c | cl_input.c | Client key button tracking, angle adjustment and user command construction before transmission. | 🟠 | 🟠 | packages/client/src/input.ts, packages/client/src/types.ts |
| client\cl_inv.c | cl_inv.c | Client inventory parsing plus first inventory-screen text primitives, item list composition and selected-item driven HUD state feeding. | 🟠 | 🟠 | packages/client/src/parse.ts, packages/client/src/screen.ts |
| client\cl_main.c | cl_main.c | Client main loop bootstrap, command forwarding, pause/env wrappers, connect/reconnect transitions, first `rcon` path, first network discovery path, userinfo/sound utility commands, disconnect flow, skin refresh and early precache/download orchestration, including sky environment precache traversal. | 🟠 | 🟠 | packages/client/src/main.ts, packages/client/src/sound.ts, packages/client/src/precache.ts, packages/client/src/download.ts, packages/client/src/parse.ts, packages/client/src/types.ts, packages/client/src/sky.ts |
| ref_gl\gl_image.c | gl_image.c | OpenGL image loading for PCX and TGA assets, including the TGA subset used by Quake II sky environment resources and the PCX-backed MD2 skin path consumed by the Three.js alias-model adapters. | 🟠 | 🟠 | packages/formats/src/pcx.ts, packages/formats/src/tga.ts, packages/renderer-three/src/quake-sky-resolver.ts, packages/renderer-three/src/md2-mesh-builder.ts |
| ref_gl\gl_mesh.c | gl_mesh.c | Alias-model frame lerp, OpenGL strip/fan command rendering, shell handling, `RF_GLOW` pulse lighting and renderer-side pose setup, now partially mirrored by MD2 frame interpolation, `glcmds`-driven mesh reconstruction, opaque/translucent material state and the alias rotation convention applied in the Three.js refresh-entity sync. | 🟠 | 🟠 | packages/renderer-three/src/md2-mesh-builder.ts, packages/renderer-three/src/refresh-entity-sync.ts, scripts/verify/quake2-alias-orientation-phase6.ts, scripts/verify/quake2-entities-phase5.ts |
| ref_gl\gl_rmain.c | gl_rmain.c | Core renderer entity transforms including `R_RotateForEntity`, now referenced directly for the canonical Quake II alias-model axis/sign convention used by the Three.js world-entity adapter. | 🟠 | 🟠 | packages/renderer-three/src/refresh-entity-sync.ts, scripts/verify/quake2-alias-orientation-phase6.ts |
| ref_gl\gl_warp.c | gl_warp.c | Sky setup logic, canonical six-face suffix ordering, environment resource naming and dedicated sky rendering state used by Quake II skyboxes. | 🟠 | 🟠 | packages/renderer-common/src/sky.ts, packages/renderer-three/src/quake-sky-resolver.ts, packages/renderer-three/src/sky-scene-adapter.ts, apps/web/src/main.ts, scripts/verify/quake2-sky-phase3.ts, scripts/verify/quake2-sky-phase4.ts, scripts/verify/quake2-sky-phase5.ts |
| client\cl_newfx.c | cl_newfx.c | Extended client-side visual effects helpers including flashlight, force-wall and sustain-style temp effects. | 🟠 | 🟠 | packages/client/src/tent.ts, packages/client/src/refresh.ts |
| client\cl_parse.c | cl_parse.c | Server message parsing, serverdata, configstrings, downloads, explicit download requests, sound registration, center-print routing, client sky configstring state, sky snapshot bridge and early client bootstrap packets, with the visual delta-field subset (`U_MODEL*`, `U_FRAME*`, `U_EFFECTS*`, `U_RENDERFX*`, `U_OLDORIGIN`, `U_SOUND`, `U_EVENT`, `U_SOLID`) now explicitly validated against local visible-entity snapshots. | 🟠 | 🟠 | packages/client/src/parse.ts, packages/client/src/download.ts, packages/client/src/sound.ts, packages/client/src/screen.ts, packages/client/src/sky.ts, scripts/verify/quake2-sky-phase1.ts, scripts/verify/quake2-sky-phase2.ts, scripts/verify/quake2-entities-phase4.ts |
| client\cl_pred.c | cl_pred.c | Client-side prediction checks, movement prediction integration and predicted view/origin smoothing, now consumed in the web demo through the gameplay-backed collision adapter for moving brush models and the local sky snapshot bridge. | 🟠 | 🟠 | packages/client/src/view.ts, apps/web/src/local-client-controller.ts, scripts/verify/quake2-collision-phase8.ts |
| client\cl_scrn.c | cl_scrn.c | Client screen/HUD state management, center prints, loading/pause/net overlays, `STAT_LAYOUTS` decoding, statusbar snapshotting, HUD text/number/pic primitives, a complete priority-pass `SCR_ExecuteLayoutString` interpreter including `client` and `ctf`, draw-command composition matching `SCR_UpdateScreen` order, shared HUD/resource contracts, and a Three.js HUD execution path over the browser scene. | ✅ | ✅ | packages/client/src/screen.ts, packages/client/src/main.ts, packages/client/src/types.ts, packages/client/src/index.ts, packages/renderer-common/src/hud-draw.ts, packages/renderer-common/src/hud-resources.ts, packages/renderer-three/src/hud-renderer.ts, packages/renderer-three/src/hud-resource-resolver.ts, apps/web/src/main.ts, apps/web/src/local-client-controller.ts |
| client\cl_tent.c | cl_tent.c | Client-side temporary entity parsing for impacts, explosions, beams, player-locked heatbeams, sustains, effect events and the shared temp-entity registration sets, now also covering strict `CL_AllocExplosion` recycling semantics, the full embedded `explosion_t.ent` render state, explicit `ex_mflash` refresh behavior, the auxiliary `CL_ParseParticles`, instant-vs-persistent particle split for `TE_STEAM`, closer beam/lightning slot reconstruction including same-entity override rules, random roll metadata and the short-lightning special case, `CL_AddPlayerBeams` hand handling, third-person heatbeam origin adjustment and the per-frame `CL_Heatbeam` / `CL_MonsterPlasma_Shell` particle side effects, plus exhaustive `CL_ParseTEnt` switch coverage with corrected packet layouts and multi-effect reconstruction for cases such as `TE_GUNSHOT`, `TE_BULLET_SPARKS`, `TE_SHOTGUN`, `TE_BLASTER`, `TE_BLASTER2`, `TE_FLECHETTE`, `TE_EXPLOSION1*`, `TE_BFG_BIGEXPLOSION`, `TE_BLUEHYPERBLASTER`, `TE_BUBBLETRAIL`, `TE_WIDOWBEAMOUT` and `TE_NUKEBLAST`, with the phase-5 helper layer now named explicitly around `CL_ParticleSteamEffect*`, `CL_ParticleSmokeEffect`, `CL_BlasterParticles2`, `CL_BubbleTrail2`, `CL_DebugTrail`, `CL_ColorFlash`, `CL_ColorExplosionParticles` and `CL_WidowSplash`, the refresh-side pass aligned on `CL_AddBeams` / `CL_AddPlayerBeams` / `CL_AddExplosions` / `CL_AddLasers` / `CL_ProcessSustain` including exact sustain-thinker timing semantics, and the temp-entity audio path now matching the original `ric1/2/3`, `spark5/6/7`, `lashit`, `railg`, `rockexp`, `grenexp`, `watrexp`, `lightning` and `disrexp` cases with their proper source semantics. | 🟠 | 🟠 | packages/client/src/parse.ts, packages/client/src/effects.ts, packages/client/src/tent.ts, packages/client/src/types.ts, packages/client/src/refresh.ts, packages/client/src/sound.ts, scripts/verify/quake2-entities-phase8-scene.ts |
| client\cl_view.c | cl_view.c | First-person weapon view setup and client refresh-facing view composition around the current player state, including original crosshair picture usage feeding the shared HUD resource catalog, with `CL_AddViewWeapon` now mirrored through the refresh frame, a camera-bound Three.js view-model sync honoring `gunindex`, `gunframe`, `gunoffset`, `gunangles`, `RF_WEAPONMODEL` and `RF_DEPTHHACK`, plus a first local gameplay loop that drives `Think_Weapon`, attack input and multi-slot weapon switching through the already ported `p_weapon.c` path, and a first local adaptation of the `p_view.c` weapon-motion formulas for bob, delta-angle sway, kick transfer and viewoffset clamping; base-game view-model assets and `skin.pcx` resources have also been verified present in `pak0.pak` for the currently exposed weapon set. | 🟠 | 🟠 | packages/client/src/view.ts, packages/client/src/refresh.ts, packages/renderer-three/src/refresh-entity-sync.ts, apps/web/src/local-client-controller.ts, apps/web/src/main.ts, packages/renderer-common/src/hud-resources.ts |
| client\client.h | client.h | Core client runtime declarations, persistent/static state, frame structures, centities, structured sky state and parser entry points. | 🟠 | 🟠 | packages/client/src/types.ts, packages/client/src/parse.ts |
| client\console.c | console.c | Console drawing helpers including low-level character and string primitives reused by the original HUD path, now partially mirrored by HUD text commands. | 🟠 | 🟠 | packages/client/src/screen.ts |
| client\console.h | console.h |  |  |  |  |
| client\input.h | input.h |  |  |  |  |
| client\keys.c | keys.c |  |  |  |  |
| client\keys.h | keys.h |  |  |  |  |
| client\menu.c | menu.c |  |  |  |  |
| client\qmenu.c | qmenu.c |  |  |  |  |
| client\qmenu.h | qmenu.h |  |  |  |  |
| client\ref.h | ref.h |  |  |  |  |
| client\screen.h | screen.h | Screen/HUD public declarations for center prints, loading plaque, update ordering and screen-side helpers, now partially mirrored through the exported `screen.ts` HUD API (`SCR_CenterPrint`, `SCR_BeginLoadingPlaque`, `SCR_EndLoadingPlaque`, `SCR_TouchPics`, `SCR_DrawStats`, `SCR_DrawLayout`, `SCR_ExecuteLayoutString`, `SCR_BuildHudDrawCommands`, inventory helpers and screen snapshot contracts), while the remaining screen-loop and cinematic declarations are still to close explicitly. | 🟠 | 🟠 | packages/client/src/screen.ts, packages/client/src/index.ts, packages/client/src/types.ts |
| client\snd_dma.c | snd_dma.c |  |  |  |  |
| client\snd_loc.h | snd_loc.h |  |  |  |  |
| client\snd_mem.c | snd_mem.c |  |  |  |  |
| client\snd_mix.c | snd_mix.c |  |  |  |  |
| client\sound.h | sound.h |  |  |  |  |
| client\vid.h | vid.h |  |  |  |  |
| client\x86.c | x86.c |  |  |  |  |
| ctf\2do.txt | 2do.txt |  |  |  | |
| ctf\ctf.001 | ctf.001 |  |  |  | |
| ctf\ctf.def | ctf.def |  |  |  | |
| ctf\ctf.dsp | ctf.dsp |  |  |  | |
| ctf\ctf.plg | ctf.plg |  |  |  | |
| ctf\docs\admin.gif | admin.gif |  |  |  | |
| ctf\docs\adminset.gif | adminset.gif |  |  |  | |
| ctf\docs\automac.gif | automac.gif |  |  |  | |
| ctf\docs\ghost.jpg | ghost.jpg |  |  |  | |
| ctf\docs\grapple.jpg | grapple.jpg |  |  |  | |
| ctf\docs\layout.jpg | layout.jpg |  |  |  | |
| ctf\docs\mainctf_back.jpg | mainctf_back.jpg |  |  |  | |
| ctf\docs\menu.gif | menu.gif |  |  |  | |
| ctf\docs\q2ctf.html | q2ctf.html |  |  |  | |
| ctf\docs\say_team.gif | say_team.gif |  |  |  | |
| ctf\docs\stats.jpg | stats.jpg |  |  |  | |
| ctf\docs\tech1.gif | tech1.gif |  |  |  | |
| ctf\docs\tech2.gif | tech2.gif |  |  |  | |
| ctf\docs\tech3.gif | tech3.gif |  |  |  | |
| ctf\docs\tech4.gif | tech4.gif |  |  |  | |
| ctf\g_ai.c | g_ai.c |  |  |  | |
| ctf\g_chase.c | g_chase.c |  |  |  | |
| ctf\g_cmds.c | g_cmds.c |  |  |  | |
| ctf\g_combat.c | g_combat.c |  |  |  | |
| ctf\g_ctf.c | g_ctf.c |  |  |  | |
| ctf\g_ctf.h | g_ctf.h |  |  |  | |
| ctf\g_func.c | g_func.c |  |  |  | |
| ctf\g_items.c | g_items.c |  |  |  | |
| ctf\g_local.h | g_local.h |  |  |  | |
| ctf\g_main.c | g_main.c |  |  |  | |
| ctf\g_misc.c | g_misc.c |  |  |  | |
| ctf\g_monster.c | g_monster.c |  |  |  | |
| ctf\g_phys.c | g_phys.c |  |  |  | |
| ctf\g_save.c | g_save.c |  |  |  | |
| ctf\g_spawn.c | g_spawn.c |  |  |  | |
| ctf\g_svcmds.c | g_svcmds.c |  |  |  | |
| ctf\g_target.c | g_target.c |  |  |  | |
| ctf\g_trigger.c | g_trigger.c |  |  |  | |
| ctf\g_utils.c | g_utils.c |  |  |  | |
| ctf\g_weapon.c | g_weapon.c |  |  |  | |
| ctf\game.h | game.h |  |  |  | |
| ctf\layout.txt | layout.txt |  |  |  | |
| ctf\m_move.c | m_move.c |  |  |  | |
| ctf\m_player.h | m_player.h |  |  |  | |
| ctf\Makefile.Linux.i386 | Makefile.Linux.i386 |  |  |  | |
| ctf\p_client.c | p_client.c |  |  |  | |
| ctf\p_hud.c | p_hud.c |  |  |  | |
| ctf\p_menu.c | p_menu.c |  |  |  | |
| ctf\p_menu.h | p_menu.h |  |  |  | |
| ctf\p_trail.c | p_trail.c |  |  |  | |
| ctf\p_view.c | p_view.c |  |  |  | |
| ctf\p_weapon.c | p_weapon.c |  |  |  | |
| ctf\q_shared.c | q_shared.c |  |  |  | |
| ctf\q_shared.h | q_shared.h |  |  |  | |
| game\g_ai.c | g_ai.c |  |  |  | |
| game\g_chase.c | g_chase.c |  |  |  | |
| game\g_cmds.c | g_cmds.c |  |  |  | |
| game\g_combat.c | g_combat.c | Premier port du sous-bloc combat requis par `g_weapon.c`, avec `CanDamage`, `SpawnDamage`, `Killed`, `CheckArmor`, `CheckPowerArmor`, `T_RadiusDamage` et un `T_Damage` partiel deja portes dans l'ordre source pour les cas armes (knockback, godmode, invincibilite, blood/sparks, armure standard, power armor, accumulation des damage feedbacks client, sortie de vie vers `die`), tandis que `M_ReactToDamage` et le reste de la resolution complete restent encore explicites ou a porter. | 🟠 | 🟠 | packages/game/src/g_combat.ts, packages/game/src/g_utils.ts, packages/game/src/g_items.ts, packages/game/src/runtime.ts, packages/game/src/index.ts, packages/game/src/g_weapon.ts |
| game\g_func.c | g_func.c | Brush-entity lifecycle port for `func_door`, `func_door_rotating` and `func_plat`, including `Move_*`, `AngleMove_*`, accelerated platform motion, top/bottom transitions, helper trigger spawning and real `blocked` callbacks now validated on map-backed scenarios. | 🟠 | 🟠 | packages/game/src/g_func.ts, packages/game/src/g_spawn.ts, scripts/verify/quake2-door-phase1.ts, scripts/verify/quake2-door-phase4.ts, scripts/verify/quake2-door-phase5.ts, scripts/verify/quake2-door-phase6.ts |
| game\g_items.c | g_items.c | Item-definition and spawn-side visual port covering all visible world item classnames with world models, delayed `droptofloor`, `PrecacheItem`, `SpawnItem`, `FindItem*`, `GetItemByIndex`, `InitItems`, `SetItemNames` and the dedicated `SP_item_health*` path, with a `gitem_t` shape now widened toward the original render-relevant fields and first integration helpers for weapon/ammo metadata (`GetAmmoItemForWeapon`, `FindWeaponItemByThink`, `GetGameItems`), plus the strict armor metadata and selection helpers `gitem_armor_t`-style (`GameItemArmorInfo`, `ArmorIndex`, `GetArmorInfoByItem`, `PowerArmorType`) now consumed by the first `g_combat.c` slice, and the source-only `weapon_blaster` item definition now present so `p_weapon.c` fallback/switch paths remain source-faithful. | 🟠 | 🟠 | packages/game/src/g_items.ts, packages/game/src/g_combat.ts, packages/game/src/g_spawn.ts, packages/game/src/index.ts, apps/web/src/local-client-controller.ts |
| game\g_local.h | g_local.h | Shared gameplay declarations, enums, structs and function prototypes for the base game module, now partially mirrored for item spawn flags, early entity runtime shape, and the first weapon/combat-facing enums/constants from the original header such as `weaponstate_t`, `ammo_t`, `WEAP_*`, damage flags, team/deathmatch flags and the initial `gclient_t` / `edict_t` fields needed by `p_weapon.c`, `g_weapon.c` and the first `g_combat.c` slice (`kick_*`, `v_angle`, `grenade_blew_up`, `invincible_framenum`, `damage_*`, `viewheight`, `waterlevel`, `takedamage`, `mass`, `pain`, `mynoise*`, `teleport_time`, `FL_IMMUNE_LASER`, `FL_GODMODE`, `FL_NO_KNOCKBACK`, `FL_POWER_ARMOR`, `POWER_ARMOR_*`, `powerarmor_time`, `power_armor_type`, `power_armor_power`). | 🟠 | 🟠 | generated/ts-stubs/game/g_local.ts, packages/game/src/runtime.ts, packages/game/src/g_items.ts, packages/game/src/index.ts |
| game\g_main.c | g_main.c |  |  |  | |
| game\g_misc.c | g_misc.c | Decorative/world-object spawn port now covering banner, blackhole, easter tank/chicks, commander body, dead soldier, teleporter pads, mine lights, ships, viper bomb and gib world entities with their visual `edict_t->s` state plus the corresponding animation thinks. | 🟠 | 🟠 | packages/game/src/g_misc.ts, packages/game/src/g_spawn.ts, packages/game/src/index.ts |
| game\g_monster.c | g_monster.c |  |  |  | |
| game\g_phys.c | g_phys.c | Gameplay physics frame port for `SV_RunThink`, `SV_TestEntityPosition`, `SV_Impact`, `SV_PushEntity`, `SV_Push`, `SV_Physics_Pusher` and `G_RunEntity`, now backed by a gameplay collision bridge over world BSP, transformed inline models and linked dynamic boxes, with pushed-state rollback, rider transport, angular compensation and obstacle dispatch. | 🟠 | 🟠 | packages/game/src/g_phys.ts, packages/game/src/runtime.ts, packages/game/src/touch.ts, packages/game/src/index.ts, apps/web/src/local-client-controller.ts, scripts/verify/quake2-door-phase3.ts, scripts/verify/quake2-door-phase5.ts, scripts/verify/quake2-collision-phase3.ts, scripts/verify/quake2-collision-phase4.ts, scripts/verify/quake2-collision-phase5.ts, scripts/verify/quake2-collision-phase8.ts |
| game\g_save.c | g_save.c |  |  |  | |
| game\g_spawn.c | g_spawn.c | Spawn registry port now covering the brush/trigger subset plus first visible item and decorative entity dispatch, including `ED_CallSpawn`, item lookup, `G_FindTeams` and BSP-order team linking. | 🟠 | 🟠 | packages/game/src/g_spawn.ts, packages/game/src/g_items.ts, packages/game/src/g_misc.ts, packages/game/src/index.ts, scripts/verify/quake2-door-phase6.ts |
| game\g_svcmds.c | g_svcmds.c |  |  |  | |
| game\g_target.c | g_target.c |  |  |  | |
| game\g_trigger.c | g_trigger.c | Trigger port for `trigger_once`, `trigger_multiple`, `trigger_relay` and their activation flow (`Touch_Multi`, `Use_Multi`, `multi_trigger`), including dynamic `trigger_enable` re-link behavior validated against the stricter trigger-touch helpers. | 🟠 | 🟠 | packages/game/src/g_trigger.ts, packages/game/src/g_spawn.ts, packages/game/src/touch.ts, scripts/verify/quake2-door-phase1.ts, scripts/verify/quake2-collision-phase7.ts |
| game\g_turret.c | g_turret.c |  |  |  | |
| game\g_utils.c | g_utils.c | Gameplay utility port for entity lookup and `G_UseTargets`, now complemented by strict `findradius` iteration plus `G_TouchTriggers` / `G_TouchSolids` over the runtime spatial query layer used by trigger-touch flow, collision plumbing and the BFG/grenade combat paths. | 🟠 | 🟠 | packages/game/src/g_utils.ts, packages/game/src/runtime.ts, packages/game/src/touch.ts, packages/game/src/g_weapon.ts, packages/game/src/index.ts, scripts/verify/quake2-door-phase1.ts, scripts/verify/quake2-collision-phase3.ts, scripts/verify/quake2-collision-phase7.ts |
| game\g_weapon.c | g_weapon.c | Logique monde des armes et projectiles avec le port du socle de spawn des projectiles (`fire_blaster`, `fire_grenade`, `fire_grenade2`, `fire_rocket`, `fire_bfg`), des armes hitscan (`fire_bullet`, `fire_shotgun`, `fire_rail`), des callbacks d'impact (`blaster_touch`, `Grenade_Touch`, `rocket_touch`, `bfg_touch`) et des pensees/explosions principales (`Grenade_Explode`, `bfg_explode`, `bfg_think`), maintenant rebranchees sur les premiers ports stricts de `findradius`, `CanDamage`, `SpawnDamage`, `Killed`, `CheckArmor`, `CheckPowerArmor`, `T_RadiusDamage` et un `T_Damage` partiel pour les cas armes courants, avec en plus les chemins par defaut de liberation de projectiles, l'explosion immediate des grenades tenues, le son de lancer `hgrent1a`, la variante `TE_ROCKET_EXPLOSION_WATER` et un premier chemin runtime de sons gameplay one-shot via une file `GameSoundEvent`, tandis que les reactions monsters et le branchement final vers un backend audio/client restent encore en attente. | 🟠 | 🟠 | packages/game/src/g_weapon.ts, packages/game/src/g_combat.ts, packages/game/src/g_utils.ts, packages/game/src/g_items.ts, packages/game/src/runtime.ts, packages/game/src/index.ts |
| game\game.001 | game.001 |  |  |  | |
| game\game.def | game.def |  |  |  | |
| game\game.dsp | game.dsp |  |  |  | |
| game\game.h | game.h | Core gameplay entity declarations including `edict_t` spatial fields such as `mins`, `maxs`, `absmin`, `absmax`, `solid`, `clipmask`, `owner`, area linkage and engine query contracts like `linkentity` and `BoxEdicts`, plus tighter runtime-to-`entity_state_t` synchronization for `origin`, `angles`, `solid` and `old_origin`. | 🟠 | 🟠 | packages/game/src/runtime.ts, packages/game/src/index.ts, scripts/verify/quake2-collision-phase2.ts, scripts/verify/quake2-collision-phase3.ts, scripts/verify/quake2-entities-phase4.ts |
| game\game.plg | game.plg |  |  |  | |
| game\m_actor.c | m_actor.c |  |  |  | |
| game\m_actor.h | m_actor.h |  |  |  | |
| game\m_berserk.c | m_berserk.c |  |  |  | |
| game\m_berserk.h | m_berserk.h |  |  |  | |
| game\m_boss2.c | m_boss2.c |  |  |  | |
| game\m_boss2.h | m_boss2.h |  |  |  | |
| game\m_boss3.c | m_boss3.c |  |  |  | |
| game\m_boss31.c | m_boss31.c |  |  |  | |
| game\m_boss31.h | m_boss31.h |  |  |  | |
| game\m_boss32.c | m_boss32.c |  |  |  | |
| game\m_boss32.h | m_boss32.h |  |  |  | |
| game\m_brain.c | m_brain.c |  |  |  | |
| game\m_brain.h | m_brain.h |  |  |  | |
| game\m_chick.c | m_chick.c |  |  |  | |
| game\m_chick.h | m_chick.h |  |  |  | |
| game\m_flash.c | m_flash.c | Port of `monster_flash_offset` for exact monster and turret muzzle-flash origins consumed by the client-side `CL_ParseMuzzleFlash2` path, now closed as a strict shared table plus `getMonsterFlashOffset` accessor preserving the original zero-slot fallback. | ✅ | ✅ | packages/client/src/monster-flash.ts, packages/client/src/effects.ts |
| game\m_flipper.c | m_flipper.c |  |  |  | |
| game\m_flipper.h | m_flipper.h |  |  |  | |
| game\m_float.c | m_float.c |  |  |  | |
| game\m_float.h | m_float.h |  |  |  | |
| game\m_flyer.c | m_flyer.c |  |  |  | |
| game\m_flyer.h | m_flyer.h |  |  |  | |
| game\m_gladiator.c | m_gladiator.c |  |  |  | |
| game\m_gladiator.h | m_gladiator.h |  |  |  | |
| game\m_gunner.c | m_gunner.c |  |  |  | |
| game\m_gunner.h | m_gunner.h |  |  |  | |
| game\m_hover.c | m_hover.c |  |  |  | |
| game\m_hover.h | m_hover.h |  |  |  | |
| game\m_infantry.c | m_infantry.c |  |  |  | |
| game\m_infantry.h | m_infantry.h |  |  |  | |
| game\m_insane.c | m_insane.c |  |  |  | |
| game\m_insane.h | m_insane.h |  |  |  | |
| game\m_medic.c | m_medic.c |  |  |  | |
| game\m_medic.h | m_medic.h |  |  |  | |
| game\m_move.c | m_move.c |  |  |  | |
| game\m_mutant.c | m_mutant.c |  |  |  | |
| game\m_mutant.h | m_mutant.h |  |  |  | |
| game\m_parasite.c | m_parasite.c |  |  |  | |
| game\m_parasite.h | m_parasite.h |  |  |  | |
| game\m_player.h | m_player.h |  |  |  | |
| game\m_rider.h | m_rider.h |  |  |  | |
| game\m_soldier.c | m_soldier.c |  |  |  | |
| game\m_soldier.h | m_soldier.h |  |  |  | |
| game\m_supertank.c | m_supertank.c |  |  |  | |
| game\m_supertank.h | m_supertank.h |  |  |  | |
| game\m_tank.c | m_tank.c |  |  |  | |
| game\m_tank.h | m_tank.h |  |  |  | |
| game\p_client.c | p_client.c |  |  |  | |
| game\p_hud.c | p_hud.c |  |  |  | |
| game\p_trail.c | p_trail.c |  |  |  | |
| game\p_view.c | p_view.c |  |  |  | |
| game\p_weapon.c | p_weapon.c | Logique joueur complete des armes, incluant projection du muzzle source, `PlayerNoise`, `Pickup_Weapon`, changement d'arme, fallback no-ammo, selection / drop / use, automate generique `Weapon_Generic` et l'ensemble des armes joueur du fichier original (`Grenade`, `GrenadeLauncher`, `RocketLauncher`, `Blaster`, `HyperBlaster`, `Machinegun`, `Chaingun`, `Shotgun`, `SuperShotgun`, `Railgun`, `BFG`), avec sorties monde / projectiles / muzzle flashes encore raccordees via des hooks explicites en attente du port de `g_weapon.c`. | ✅ | ✅ | packages/game/src/p_weapon.ts, packages/game/src/runtime.ts, packages/game/src/index.ts |
| game\q_shared.c | q_shared.c |  |  |  | |
| game\q_shared.h | q_shared.h | Shared core declarations, constants, math-adjacent structs, pmove, entity and player state types, now also exporting the original player weapon muzzle-flash ids `MZ_*` for the shared weapon/client effect path. | 🟠 | 🟠 | packages/qcommon/src/q-shared.ts, packages/qcommon/src/index.ts |
| gnu.txt | gnu.txt |  |  |  | |
| irix\cd_irix.c | cd_irix.c |  |  |  | |
| irix\glw_imp.c | glw_imp.c |  |  |  | |
| irix\q_shirix.c | q_shirix.c |  |  |  | |
| irix\qgl_irix.c | qgl_irix.c |  |  |  | |
| irix\snd_irix.c | snd_irix.c |  |  |  | |
| irix\sys_irix.c | sys_irix.c |  |  |  | |
| irix\vid_menu.c | vid_menu.c |  |  |  | |
| irix\vid_so.c | vid_so.c |  |  |  | |
| joystick.txt | joystick.txt |  |  |  | |
| linux\block16.h | block16.h |  |  |  | |
| linux\block8.h | block8.h |  |  |  | |
| linux\cd_linux.c | cd_linux.c |  |  |  | |
| linux\d_copy.s | d_copy.s |  |  |  | |
| linux\d_ifacea.h | d_ifacea.h |  |  |  | |
| linux\d_polysa.s | d_polysa.s |  |  |  | |
| linux\gl_fxmesa.c | gl_fxmesa.c |  |  |  | |
| linux\glob.c | glob.c |  |  |  | |
| linux\glob.h | glob.h |  |  |  | |
| linux\in_linux.c | in_linux.c |  |  |  | |
| linux\Makefile.AXP | Makefile.AXP |  |  |  | |
| linux\Makefile.i386 | Makefile.i386 |  |  |  | |
| linux\math.s | math.s |  |  |  | |
| linux\net_udp.c | net_udp.c |  |  |  | |
| linux\q_shlinux.c | q_shlinux.c |  |  |  | |
| linux\qasm.h | qasm.h |  |  |  | |
| linux\qgl_linux.c | qgl_linux.c |  |  |  | |
| linux\r_aclipa.s | r_aclipa.s |  |  |  | |
| linux\r_draw16.s | r_draw16.s |  |  |  | |
| linux\r_drawa.s | r_drawa.s |  |  |  | |
| linux\r_edgea.s | r_edgea.s |  |  |  | |
| linux\r_scana.s | r_scana.s |  |  |  | |
| linux\r_spr8.s | r_spr8.s |  |  |  | |
| linux\r_surf8.s | r_surf8.s |  |  |  | |
| linux\r_varsa.s | r_varsa.s |  |  |  | |
| linux\rw_in_svgalib.c | rw_in_svgalib.c |  |  |  | |
| linux\rw_linux.h | rw_linux.h |  |  |  | |
| linux\rw_svgalib.c | rw_svgalib.c |  |  |  | |
| linux\rw_x11.c | rw_x11.c |  |  |  | |
| linux\snd_linux.c | snd_linux.c |  |  |  | |
| linux\snd_mixa.s | snd_mixa.s |  |  |  | |
| linux\sys_dosa.s | sys_dosa.s |  |  |  | |
| linux\sys_linux.c | sys_linux.c |  |  |  | |
| linux\vid_menu.c | vid_menu.c |  |  |  | |
| linux\vid_so.c | vid_so.c |  |  |  | |
| makefile | makefile |  |  |  | |
| makezip | makezip |  |  |  | |
| makezip.bat | makezip.bat |  |  |  | |
| null\cd_null.c | cd_null.c |  |  |  | |
| null\cl_null.c | cl_null.c |  |  |  | |
| null\glimp_null.c | glimp_null.c |  |  |  | |
| null\in_null.c | in_null.c |  |  |  | |
| null\snddma_null.c | snddma_null.c |  |  |  | |
| null\swimp_null.c | swimp_null.c |  |  |  | |
| null\sys_null.c | sys_null.c |  |  |  | |
| null\vid_null.c | vid_null.c |  |  |  | |
| qcommon\cmd.c | cmd.c | Command buffer, tokenization, aliases and command registry. | 🟠 | 🟠 | packages/qcommon/src/cmd.ts |
| qcommon\cmodel.c | cmodel.c | BSP collision loading, point contents, transformed point contents, box traces, transformed box traces and inline collision models used by shared movement and client prediction. | 🟠 | 🟠 | packages/qcommon/src/collision.ts, packages/qcommon/src/index.ts, scripts/verify/quake2-collision-phase1.ts |
| qcommon\common.c | common.c | Message IO functions, size buffers, common runtime helpers. | 🟠 | 🟠 | packages/memory/src/sizebuf.ts, packages/memory/src/binary-io.ts, packages/qcommon/src/messages.ts, packages/qcommon/src/common.ts, packages/qcommon/src/runtime.ts |
| qcommon\crc.c | crc.c |  |  |  | |
| qcommon\crc.h | crc.h |  |  |  | |
| qcommon\cvar.c | cvar.c | Dynamic console variables, flags, latched values, info strings and command-facing setters. | 🟠 | 🟠 | packages/qcommon/src/cvar.ts |
| qcommon\files.c | files.c | Filesystem search paths, pack loading, file opening and asset reads. | 🟠 | 🟠 | packages/formats/src/pak.ts, packages/filesystem/src/virtual-filesystem.ts, packages/filesystem/src/index.ts |
| qcommon\md4.c | md4.c |  |  |  | |
| qcommon\net_chan.c | net_chan.c |  |  |  | |
| qcommon\pmove.c | pmove.c | Shared player movement core used by client prediction and server-authoritative simulation, now exercised in the browser through a collision adapter wired to transformed moving brush models. | 🟠 | 🟠 | packages/qcommon/src/pmove.ts, apps/web/src/local-client-controller.ts, scripts/verify/quake2-collision-phase8.ts |
| qcommon\qcommon.h | qcommon.h | Shared declarations for sizebuf_t, MSG_*, protocol and runtime contracts. Stub TypeScript generated. | 🟠 | 🟠 | packages/memory/src/sizebuf.ts, packages/memory/src/binary-io.ts, packages/qcommon/src/messages.ts, generated/ts-stubs/qcommon/qcommon.ts |
| qcommon\qfiles.h | qfiles.h | Binary file format declarations including PAK, PCX, WAL, MD2, SP2 sprite and BSP layouts, now mirrored by dedicated format modules with the remaining declarative BSP constants (`MAX_MAP_*`, `CONTENTS_*`, `SURF_*`, plane tags, `ANGLE_*`, `DVIS_*`) exported alongside the parsed structs and sprite metadata. | ✅ | ✅ | packages/formats/src/pak.ts, packages/formats/src/pcx.ts, packages/formats/src/wal.ts, packages/formats/src/md2.ts, packages/formats/src/sp2.ts, packages/formats/src/bsp.ts, packages/formats/src/index.ts |
| quake2.001 | quake2.001 |  |  |  | |
| quake2.bce | quake2.bce |  |  |  | |
| quake2.bcp | quake2.bcp |  |  |  | |
| quake2.dsp | quake2.dsp |  |  |  | |
| quake2.dsw | quake2.dsw |  |  |  | |
| quake2.mak | quake2.mak |  |  |  | |
| quake2.opt | quake2.opt |  |  |  | |
| quake2.plg | quake2.plg |  |  |  | |
| readme.txt | readme.txt |  |  |  | |
| ref_gl\anorms.h | anorms.h | Renderer-side copy of the canonical 162-entry Quake II byte-direction lookup table, explicitly verified to match `client/anorms.h` and therefore closed through the shared `BYTE_DIRS` / `DirFromByte` port. | ✅ | ✅ | packages/qcommon/src/anorms.ts |
| ref_gl\anormtab.h | anormtab.h |  |  |  | |
| ref_gl\gl_draw.c | gl_draw.c |  |  |  | |
| ref_gl\gl_image.c | gl_image.c |  |  |  | |
| ref_gl\gl_light.c | gl_light.c |  |  |  | |
| ref_gl\gl_local.h | gl_local.h |  |  |  | |
| ref_gl\gl_mesh.c | gl_mesh.c |  |  |  | |
| ref_gl\gl_model.c | gl_model.c |  |  |  | |
| ref_gl\gl_model.h | gl_model.h |  |  |  | |
| ref_gl\gl_rmain.c | gl_rmain.c |  |  |  | |
| ref_gl\gl_rmisc.c | gl_rmisc.c |  |  |  | |
| ref_gl\gl_rsurf.c | gl_rsurf.c |  |  |  | |
| ref_gl\gl_warp.c | gl_warp.c |  |  |  | |
| ref_gl\qgl.h | qgl.h |  |  |  | |
| ref_gl\ref_gl.001 | ref_gl.001 |  |  |  | |
| ref_gl\ref_gl.def | ref_gl.def |  |  |  | |
| ref_gl\ref_gl.dsp | ref_gl.dsp |  |  |  | |
| ref_gl\ref_gl.plg | ref_gl.plg |  |  |  | |
| ref_gl\warpsin.h | warpsin.h |  |  |  | |
| ref_soft\adivtab.h | adivtab.h |  |  |  | |
| ref_soft\anorms.h | anorms.h |  |  |  | |
| ref_soft\asm_draw.h | asm_draw.h |  |  |  | |
| ref_soft\block16.inc | block16.inc |  |  |  | |
| ref_soft\block8.inc | block8.inc |  |  |  | |
| ref_soft\d_if.inc | d_if.inc |  |  |  | |
| ref_soft\d_ifacea.h | d_ifacea.h |  |  |  | |
| ref_soft\qasm.inc | qasm.inc |  |  |  | |
| ref_soft\r_aclip.c | r_aclip.c |  |  |  | |
| ref_soft\r_aclipa.asm | r_aclipa.asm |  |  |  | |
| ref_soft\r_alias.c | r_alias.c |  |  |  | |
| ref_soft\r_bsp.c | r_bsp.c |  |  |  | |
| ref_soft\r_draw.c | r_draw.c |  |  |  | |
| ref_soft\r_draw16.asm | r_draw16.asm |  |  |  | |
| ref_soft\r_drawa.asm | r_drawa.asm |  |  |  | |
| ref_soft\r_edge.c | r_edge.c |  |  |  | |
| ref_soft\r_edgea.asm | r_edgea.asm |  |  |  | |
| ref_soft\r_image.c | r_image.c |  |  |  | |
| ref_soft\r_light.c | r_light.c |  |  |  | |
| ref_soft\r_local.h | r_local.h |  |  |  | |
| ref_soft\r_main.c | r_main.c |  |  |  | |
| ref_soft\r_misc.c | r_misc.c |  |  |  | |
| ref_soft\r_model.c | r_model.c |  |  |  | |
| ref_soft\r_model.h | r_model.h |  |  |  | |
| ref_soft\r_part.c | r_part.c |  |  |  | |
| ref_soft\r_poly.c | r_poly.c |  |  |  | |
| ref_soft\r_polysa.asm | r_polysa.asm |  |  |  | |
| ref_soft\r_polyse.c | r_polyse.c |  |  |  | |
| ref_soft\r_rast.c | r_rast.c |  |  |  | |
| ref_soft\r_scan.c | r_scan.c |  |  |  | |
| ref_soft\r_scana.asm | r_scana.asm |  |  |  | |
| ref_soft\r_spr8.asm | r_spr8.asm |  |  |  | |
| ref_soft\r_sprite.c | r_sprite.c |  |  |  | |
| ref_soft\r_surf.c | r_surf.c |  |  |  | |
| ref_soft\r_surf8.asm | r_surf8.asm |  |  |  | |
| ref_soft\r_varsa.asm | r_varsa.asm |  |  |  | |
| ref_soft\rand1k.h | rand1k.h |  |  |  | |
| ref_soft\ref_soft.001 | ref_soft.001 |  |  |  | |
| ref_soft\ref_soft.def | ref_soft.def |  |  |  | |
| ref_soft\ref_soft.dsp | ref_soft.dsp |  |  |  | |
| ref_soft\ref_soft.plg | ref_soft.plg |  |  |  | |
| rhapsody\in_next.m | in_next.m |  |  |  | |
| rhapsody\makefile.bak | makefile.bak |  |  |  | |
| rhapsody\notes.txt | notes.txt |  |  |  | |
| rhapsody\pb.project | pb.project |  |  |  | |
| rhapsody\quake2.iconheader | quake2.iconheader |  |  |  | |
| rhapsody\quake2.tiff | quake2.tiff |  |  |  | |
| rhapsody\r_next.m | r_next.m |  |  |  | |
| rhapsody\rhapqw.txt | rhapqw.txt |  |  |  | |
| rhapsody\snd_next.m | snd_next.m |  |  |  | |
| rhapsody\swimp_rhap.m | swimp_rhap.m |  |  |  | |
| rhapsody\sys_rhap.m | sys_rhap.m |  |  |  | |
| rhapsody\vid_next.m | vid_next.m |  |  |  | |
| server\server.h | server.h |  |  |  | |
| server\sv_ccmds.c | sv_ccmds.c |  |  |  | |
| server\sv_ents.c | sv_ents.c |  |  |  | |
| server\sv_game.c | sv_game.c |  |  |  | |
| server\sv_init.c | sv_init.c |  |  |  | |
| server\sv_main.c | sv_main.c |  |  |  | |
| server\sv_null.c | sv_null.c |  |  |  | |
| server\sv_send.c | sv_send.c |  |  |  | |
| server\sv_user.c | sv_user.c |  |  |  | |
| server\sv_world.c | sv_world.c |  |  |  | |
| solaris\g_so.c | g_so.c |  |  |  | |
| solaris\glob.c | glob.c |  |  |  | |
| solaris\glob.h | glob.h |  |  |  | |
| solaris\Makefile.OLD | Makefile.OLD |  |  |  | |
| solaris\Makefile.Solaris | Makefile.Solaris |  |  |  | |
| solaris\net_udp.c | net_udp.c |  |  |  | |
| solaris\q_shsolaris.c | q_shsolaris.c |  |  |  | |
| solaris\sys_solaris.c | sys_solaris.c |  |  |  | |
| unix\makefile | makefile |  |  |  | |
| unix\makefile_old | makefile_old |  |  |  | |
| unix\next\sv_ccmds.o | sv_ccmds.o |  |  |  | |
| win32\cd_win.c | cd_win.c |  |  |  | |
| win32\conproc.c | conproc.c |  |  |  | |
| win32\conproc.h | conproc.h |  |  |  | |
| win32\glw_imp.c | glw_imp.c |  |  |  | |
| win32\glw_win.h | glw_win.h |  |  |  | |
| win32\in_win.c | in_win.c |  |  |  | |
| win32\net_wins.c | net_wins.c |  |  |  | |
| win32\q_shwin.c | q_shwin.c |  |  |  | |
| win32\q2.aps | q2.aps |  |  |  | |
| win32\q2.ico | q2.ico |  |  |  | |
| win32\q2.rc | q2.rc |  |  |  | |
| win32\qe3.ico | qe3.ico |  |  |  | |
| win32\qgl_win.c | qgl_win.c |  |  |  | |
| win32\resource.h | resource.h |  |  |  | |
| win32\rw_ddraw.c | rw_ddraw.c |  |  |  | |
| win32\rw_dib.c | rw_dib.c |  |  |  | |
| win32\rw_imp.c | rw_imp.c |  |  |  | |
| win32\rw_win.h | rw_win.h |  |  |  | |
| win32\snd_win.c | snd_win.c |  |  |  | |
| win32\sys_win.c | sys_win.c |  |  |  | |
| win32\vid_dll.c | vid_dll.c |  |  |  | |
| win32\vid_menu.c | vid_menu.c |  |  |  | |
| win32\winquake.aps | winquake.aps |  |  |  | |
| win32\winquake.h | winquake.h |  |  |  | |
| win32\winquake.rc | winquake.rc |  |  |  | |
