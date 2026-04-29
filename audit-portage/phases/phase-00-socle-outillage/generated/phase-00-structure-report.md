# Rapport automatique Phase 00

Ce rapport est genere automatiquement par `npm run audit:socle`.
Il ne valide aucun fichier ; il signale les points a examiner.

## Resume

- Sources C/H indexees : 264
- Fichiers TS indexes : 200
- Correspondances exactes attendues : 160
- Sources sans fichier TS identique : 100
- Sources avec plusieurs fichiers TS identiques : 4
- Fichiers TS sans basename source identique : 90
- Fichiers TS avec marqueurs de stub : 61
- Fichiers TS avec marqueurs temporaires/TODO : 26
- Fichiers TS avec header de portage mais sans Source : 55
- Phases avec structure incomplete : 0
- Fonctions C/H extraites : 5302
- Macros C/H extraites : 8116
- Types C/H extraits : 442
- Fonctions TS extraites : 3753
- Types TS extraits : 605

## Structure des phases

| Phase | PLAN.md | tools/ | generated/ |
| --- | --- | --- | --- |
| phase-00-socle-outillage | oui | oui | oui |
| phase-01-referentiel-audit | oui | oui | oui |
| phase-02-source-vers-typescript | oui | oui | oui |
| phase-03-runtime-exhaustif | oui | oui | oui |
| phase-04-apps-web-integration | oui | oui | oui |
| phase-05-renderer-three | oui | oui | oui |
| phase-06-fermeture | oui | oui | oui |

## Sources sans fichier TS identique

| Source | TS attendu |
| --- | --- |
| Quake-2-master/client/adivtab.h | adivtab.ts |
| Quake-2-master/client/asm_i386.h | asm_i386.ts |
| Quake-2-master/client/block16.h | block16.ts |
| Quake-2-master/client/block8.h | block8.ts |
| Quake-2-master/client/cl_pred.c | cl_pred.ts |
| Quake-2-master/client/cl_view.c | cl_view.ts |
| Quake-2-master/client/screen.h | screen.ts |
| Quake-2-master/client/x86.c | x86.ts |
| Quake-2-master/ctf/g_ctf.c | g_ctf.ts |
| Quake-2-master/ctf/g_ctf.h | g_ctf.ts |
| Quake-2-master/ctf/p_menu.c | p_menu.ts |
| Quake-2-master/ctf/p_menu.h | p_menu.ts |
| Quake-2-master/irix/cd_irix.c | cd_irix.ts |
| Quake-2-master/irix/glw_imp.c | glw_imp.ts |
| Quake-2-master/irix/q_shirix.c | q_shirix.ts |
| Quake-2-master/irix/qgl_irix.c | qgl_irix.ts |
| Quake-2-master/irix/snd_irix.c | snd_irix.ts |
| Quake-2-master/irix/sys_irix.c | sys_irix.ts |
| Quake-2-master/irix/vid_menu.c | vid_menu.ts |
| Quake-2-master/irix/vid_so.c | vid_so.ts |
| Quake-2-master/linux/block16.h | block16.ts |
| Quake-2-master/linux/block8.h | block8.ts |
| Quake-2-master/linux/cd_linux.c | cd_linux.ts |
| Quake-2-master/linux/d_ifacea.h | d_ifacea.ts |
| Quake-2-master/linux/gl_fxmesa.c | gl_fxmesa.ts |
| Quake-2-master/linux/glob.c | glob.ts |
| Quake-2-master/linux/glob.h | glob.ts |
| Quake-2-master/linux/in_linux.c | in_linux.ts |
| Quake-2-master/linux/net_udp.c | net_udp.ts |
| Quake-2-master/linux/q_shlinux.c | q_shlinux.ts |
| Quake-2-master/linux/qasm.h | qasm.ts |
| Quake-2-master/linux/qgl_linux.c | qgl_linux.ts |
| Quake-2-master/linux/rw_in_svgalib.c | rw_in_svgalib.ts |
| Quake-2-master/linux/rw_linux.h | rw_linux.ts |
| Quake-2-master/linux/rw_svgalib.c | rw_svgalib.ts |
| Quake-2-master/linux/rw_x11.c | rw_x11.ts |
| Quake-2-master/linux/snd_linux.c | snd_linux.ts |
| Quake-2-master/linux/sys_linux.c | sys_linux.ts |
| Quake-2-master/linux/vid_menu.c | vid_menu.ts |
| Quake-2-master/linux/vid_so.c | vid_so.ts |
| Quake-2-master/null/cd_null.c | cd_null.ts |
| Quake-2-master/null/cl_null.c | cl_null.ts |
| Quake-2-master/null/glimp_null.c | glimp_null.ts |
| Quake-2-master/null/in_null.c | in_null.ts |
| Quake-2-master/null/snddma_null.c | snddma_null.ts |
| Quake-2-master/null/swimp_null.c | swimp_null.ts |
| Quake-2-master/null/sys_null.c | sys_null.ts |
| Quake-2-master/null/vid_null.c | vid_null.ts |
| Quake-2-master/qcommon/crc.c | crc.ts |
| Quake-2-master/qcommon/crc.h | crc.ts |
| Quake-2-master/ref_gl/gl_model.c | gl_model.ts |
| Quake-2-master/ref_gl/gl_model.h | gl_model.ts |
| Quake-2-master/ref_soft/adivtab.h | adivtab.ts |
| Quake-2-master/ref_soft/asm_draw.h | asm_draw.ts |
| Quake-2-master/ref_soft/d_ifacea.h | d_ifacea.ts |
| Quake-2-master/ref_soft/r_aclip.c | r_aclip.ts |
| Quake-2-master/ref_soft/r_alias.c | r_alias.ts |
| Quake-2-master/ref_soft/r_bsp.c | r_bsp.ts |
| Quake-2-master/ref_soft/r_draw.c | r_draw.ts |
| Quake-2-master/ref_soft/r_edge.c | r_edge.ts |
| Quake-2-master/ref_soft/r_image.c | r_image.ts |
| Quake-2-master/ref_soft/r_light.c | r_light.ts |
| Quake-2-master/ref_soft/r_local.h | r_local.ts |
| Quake-2-master/ref_soft/r_main.c | r_main.ts |
| Quake-2-master/ref_soft/r_misc.c | r_misc.ts |
| Quake-2-master/ref_soft/r_model.c | r_model.ts |
| Quake-2-master/ref_soft/r_model.h | r_model.ts |
| Quake-2-master/ref_soft/r_part.c | r_part.ts |
| Quake-2-master/ref_soft/r_poly.c | r_poly.ts |
| Quake-2-master/ref_soft/r_polyse.c | r_polyse.ts |
| Quake-2-master/ref_soft/r_rast.c | r_rast.ts |
| Quake-2-master/ref_soft/r_scan.c | r_scan.ts |
| Quake-2-master/ref_soft/r_sprite.c | r_sprite.ts |
| Quake-2-master/ref_soft/r_surf.c | r_surf.ts |
| Quake-2-master/ref_soft/rand1k.h | rand1k.ts |
| Quake-2-master/solaris/g_so.c | g_so.ts |
| Quake-2-master/solaris/glob.c | glob.ts |
| Quake-2-master/solaris/glob.h | glob.ts |
| Quake-2-master/solaris/net_udp.c | net_udp.ts |
| Quake-2-master/solaris/q_shsolaris.c | q_shsolaris.ts |
| Quake-2-master/solaris/sys_solaris.c | sys_solaris.ts |
| Quake-2-master/win32/cd_win.c | cd_win.ts |
| Quake-2-master/win32/conproc.c | conproc.ts |
| Quake-2-master/win32/conproc.h | conproc.ts |
| Quake-2-master/win32/glw_imp.c | glw_imp.ts |
| Quake-2-master/win32/glw_win.h | glw_win.ts |
| Quake-2-master/win32/in_win.c | in_win.ts |
| Quake-2-master/win32/net_wins.c | net_wins.ts |
| Quake-2-master/win32/q_shwin.c | q_shwin.ts |
| Quake-2-master/win32/qgl_win.c | qgl_win.ts |
| Quake-2-master/win32/resource.h | resource.ts |
| Quake-2-master/win32/rw_ddraw.c | rw_ddraw.ts |
| Quake-2-master/win32/rw_dib.c | rw_dib.ts |
| Quake-2-master/win32/rw_imp.c | rw_imp.ts |
| Quake-2-master/win32/rw_win.h | rw_win.ts |
| Quake-2-master/win32/snd_win.c | snd_win.ts |
| Quake-2-master/win32/sys_win.c | sys_win.ts |
| Quake-2-master/win32/vid_dll.c | vid_dll.ts |
| Quake-2-master/win32/vid_menu.c | vid_menu.ts |
| Quake-2-master/win32/winquake.h | winquake.ts |

## Sources avec plusieurs fichiers TS identiques

| Source | Cibles |
| --- | --- |
| Quake-2-master/ctf/q_shared.c | packages/math/src/q_shared.ts<br>packages/qcommon/src/q_shared.ts |
| Quake-2-master/ctf/q_shared.h | packages/math/src/q_shared.ts<br>packages/qcommon/src/q_shared.ts |
| Quake-2-master/game/q_shared.c | packages/math/src/q_shared.ts<br>packages/qcommon/src/q_shared.ts |
| Quake-2-master/game/q_shared.h | packages/math/src/q_shared.ts<br>packages/qcommon/src/q_shared.ts |

## Fichiers TS sans basename source identique

| TS | Source header |
| --- | --- |
| apps/web/src/full-game-command-bridge.ts |  |
| apps/web/src/full-game-local-session.ts |  |
| apps/web/src/full-game-local-transport.ts |  |
| apps/web/src/full-game-render-loop.ts |  |
| apps/web/src/full-game-render-source.ts |  |
| apps/web/src/full-game-server-host.ts |  |
| apps/web/src/full-game.ts |  |
| apps/web/src/local-client-controller.ts |  |
| apps/web/src/local-collision-adapter.ts |  |
| apps/web/src/main.ts |  |
| apps/web/src/refresh-debug-layer.ts |  |
| apps/web/src/web-config-commands.ts |  |
| apps/web/src/web-config-storage.ts |  |
| apps/web/src/web-demo-loop.ts |  |
| apps/web/src/web-map-bootstrap.ts |  |
| apps/web/src/web-render-bootstrap.ts |  |
| apps/web/src/web-save-storage.ts |  |
| apps/web/src/web-shell.ts |  |
| apps/web/vite.config.ts |  |
| packages/client/src/download.ts | Quake II original / client/cl_parse.c |
| packages/client/src/index.ts |  |
| packages/client/src/local-brush-models.ts |  |
| packages/client/src/local-client-bootstrap.ts |  |
| packages/client/src/local-gameplay-sync.ts |  |
| packages/client/src/local-input.ts |  |
| packages/client/src/local-loop.ts |  |
| packages/client/src/local-session.ts |  |
| packages/client/src/menu-draw.ts | Quake II original / client/menu.c |
| packages/client/src/menu-main-game.ts | Quake II original / client/menu.c |
| packages/client/src/menu-misc.ts | Quake II original / client/menu.c |
| packages/client/src/menu-multiplayer.ts | Quake II original / client/menu.c |
| packages/client/src/menu-options-keys.ts | Quake II original / client/menu.c |
| packages/client/src/menu-player-config.ts | Quake II original / client/menu.c |
| packages/client/src/menu-runtime.ts | Quake II original / client/menu.c |
| packages/client/src/menu-types.ts | Quake II original / client/menu.c |
| packages/client/src/monster-flash.ts |  |
| packages/client/src/precache.ts | Quake II original / client/cl_main.c |
| packages/client/src/refresh.ts | Quake II original / client/cl_ents.c |
| packages/client/src/render-contracts.ts |  |
| packages/client/src/sky.ts | Quake II original / client/cl_parse.c |
| packages/client/src/sound-public.ts | Quake II original / client/sound.h |
| packages/client/src/vid-menu.ts | Quake II original / win32/vid_menu.c |
| packages/client/src/view.ts | Quake II original / client/cl_view.c and client/cl_pred.c |
| packages/filesystem/src/index.ts |  |
| packages/formats/src/index.ts |  |
| packages/formats/src/md2.ts | Quake II original / qcommon/qfiles.h |
| packages/formats/src/pak.ts | Quake II original / qcommon/qfiles.h and qcommon/files.c |
| packages/formats/src/pcx.ts | Quake II original / qcommon/qfiles.h |
| packages/formats/src/sp2.ts | Quake II original / qcommon/qfiles.h |
| packages/formats/src/tga.ts | Quake II original / ref_gl/gl_image.c |
| packages/formats/src/wal.ts | Quake II original / qcommon/qfiles.h |
| packages/game/src/index.ts |  |
| packages/game/src/local-game-bootstrap.ts |  |
| packages/game/src/runtime.ts | game/g_local.h |
| packages/game/src/touch.ts | Quake II original / game/g_utils.c |
| packages/memory/src/binary-io.ts |  |
| packages/memory/src/index.ts |  |
| packages/memory/src/sizebuf.ts | Quake II original / qcommon/qcommon.h and qcommon/common.c |
| packages/platform/src/index.ts |  |
| packages/platform/src/web-audio-adapter.ts |  |
| packages/platform/src/web-cd-audio-adapter.ts |  |
| packages/qcommon/src/index.ts |  |
| packages/qcommon/src/messages.ts | Quake II original / qcommon/common.c |
| packages/qcommon/src/protocol.ts | Quake II original / qcommon/qcommon.h |
| packages/qcommon/src/runtime.ts |  |
| packages/qcommon/src/system.ts | Quake II original / game/q_shared.h |
| packages/renderer-common/src/index.ts |  |
| packages/renderer-common/src/sky.ts |  |
| packages/renderer-three/src/gl-model-loader.ts | Quake II original / ref_gl/gl_model.c |
| packages/renderer-three/src/gl-model.ts | Quake II original / ref_gl/gl_model.h |
| packages/renderer-three/src/gl-world-scene-adapter.ts |  |
| packages/renderer-three/src/index.ts |  |
| packages/renderer-three/src/md2-mesh-builder.ts | ref_gl/gl_mesh.c |
| packages/renderer-three/src/particle-sync.ts |  |
| packages/renderer-three/src/quake-sky-resolver.ts |  |
| packages/renderer-three/src/ref-gl-bootstrap.ts |  |
| packages/renderer-three/src/ref-gl-host.ts |  |
| packages/renderer-three/src/refresh-entity-sync.ts |  |
| packages/renderer-three/src/sky-scene-adapter.ts | Quake II original / ref_gl/gl_warp.c |
| packages/renderer-three/src/three-beam-sync.ts |  |
| packages/renderer-three/src/three-dlight-sync.ts |  |
| packages/renderer-three/src/three-gl-draw-adapter.ts |  |
| packages/renderer-three/src/three-polyblend-overlay.ts |  |
| packages/server/src/host.ts | server/sv_null.c |
| packages/server/src/index.ts |  |
| packages/server/src/runtime.ts |  |
| packages/shared/src/index.ts |  |
| packages/shared/src/port-metadata.ts |  |
| packages/tests-golden/src/index.ts |  |
| packages/tests-golden/src/snapshots.ts |  |

## Marqueurs de stub

| TS |
| --- |
| apps/web/src/full-game-local-session.ts |
| apps/web/src/full-game.ts |
| apps/web/src/local-collision-adapter.ts |
| apps/web/src/main.ts |
| apps/web/src/web-map-bootstrap.ts |
| apps/web/src/web-shell.ts |
| packages/client/src/cl_cin.ts |
| packages/client/src/cl_fx.ts |
| packages/client/src/cl_parse.ts |
| packages/client/src/cl_scrn.ts |
| packages/client/src/keys.ts |
| packages/client/src/menu-types.ts |
| packages/client/src/precache.ts |
| packages/client/src/refresh.ts |
| packages/client/src/snd_dma.ts |
| packages/client/src/snd_mem.ts |
| packages/client/src/view.ts |
| packages/formats/src/md2.ts |
| packages/formats/src/pak.ts |
| packages/formats/src/pcx.ts |
| packages/formats/src/qfiles.ts |
| packages/formats/src/sp2.ts |
| packages/formats/src/tga.ts |
| packages/formats/src/wal.ts |
| packages/game/src/g_combat.ts |
| packages/game/src/g_items.ts |
| packages/game/src/g_monster.ts |
| packages/game/src/g_phys.ts |
| packages/game/src/g_save.ts |
| packages/game/src/g_utils.ts |
| packages/game/src/m_move.ts |
| packages/game/src/p_weapon.ts |
| packages/memory/src/sizebuf.ts |
| packages/qcommon/src/cmd.ts |
| packages/qcommon/src/cmodel.ts |
| packages/qcommon/src/common.ts |
| packages/qcommon/src/messages.ts |
| packages/qcommon/src/pmove.ts |
| packages/qcommon/src/qcommon.ts |
| packages/qcommon/src/system.ts |
| packages/renderer-three/src/gl_draw.ts |
| packages/renderer-three/src/gl_image.ts |
| packages/renderer-three/src/gl_light.ts |
| packages/renderer-three/src/gl_local.ts |
| packages/renderer-three/src/gl_rmain.ts |
| packages/renderer-three/src/gl_rsurf.ts |
| packages/renderer-three/src/gl_warp.ts |
| packages/renderer-three/src/gl-model-loader.ts |
| packages/renderer-three/src/gl-world-scene-adapter.ts |
| packages/renderer-three/src/qgl.ts |
| packages/renderer-three/src/ref-gl-host.ts |
| packages/renderer-three/src/refresh-entity-sync.ts |
| packages/server/src/sv_ents.ts |
| packages/server/src/sv_game.ts |
| packages/server/src/sv_init.ts |
| packages/server/src/sv_main.ts |
| packages/server/src/sv_null.ts |
| packages/server/src/sv_send.ts |
| packages/server/src/sv_user.ts |
| packages/server/src/sv_world.ts |
| packages/tests-golden/src/snapshots.ts |

## Marqueurs temporaires ou TODO

| TS |
| --- |
| apps/web/src/web-config-commands.ts |
| packages/client/src/cl_fx.ts |
| packages/client/src/cl_parse.ts |
| packages/client/src/cl_tent.ts |
| packages/client/src/client.ts |
| packages/client/src/download.ts |
| packages/client/src/precache.ts |
| packages/client/src/view.ts |
| packages/game/src/g_items.ts |
| packages/game/src/g_main.ts |
| packages/game/src/g_misc.ts |
| packages/game/src/g_target.ts |
| packages/game/src/g_utils.ts |
| packages/game/src/index.ts |
| packages/game/src/m_berserk.ts |
| packages/game/src/m_insane.ts |
| packages/game/src/p_client.ts |
| packages/game/src/p_view.ts |
| packages/game/src/runtime.ts |
| packages/qcommon/src/cmd.ts |
| packages/qcommon/src/cmodel.ts |
| packages/qcommon/src/common.ts |
| packages/qcommon/src/messages.ts |
| packages/qcommon/src/pmove.ts |
| packages/renderer-three/src/gl_light.ts |
| packages/renderer-three/src/refresh-entity-sync.ts |

## Headers de portage sans Source

| TS |
| --- |
| apps/web/src/full-game-command-bridge.ts |
| apps/web/src/full-game-local-session.ts |
| apps/web/src/full-game-local-transport.ts |
| apps/web/src/full-game-render-loop.ts |
| apps/web/src/full-game-render-source.ts |
| apps/web/src/full-game-server-host.ts |
| apps/web/src/full-game.ts |
| apps/web/src/local-client-controller.ts |
| apps/web/src/local-collision-adapter.ts |
| apps/web/src/main.ts |
| apps/web/src/refresh-debug-layer.ts |
| apps/web/src/web-config-commands.ts |
| apps/web/src/web-config-storage.ts |
| apps/web/src/web-demo-loop.ts |
| apps/web/src/web-map-bootstrap.ts |
| apps/web/src/web-render-bootstrap.ts |
| apps/web/src/web-save-storage.ts |
| apps/web/src/web-shell.ts |
| packages/client/src/index.ts |
| packages/client/src/local-brush-models.ts |
| packages/client/src/local-client-bootstrap.ts |
| packages/client/src/local-gameplay-sync.ts |
| packages/client/src/local-input.ts |
| packages/client/src/local-loop.ts |
| packages/client/src/local-session.ts |
| packages/client/src/monster-flash.ts |
| packages/client/src/render-contracts.ts |
| packages/filesystem/src/index.ts |
| packages/formats/src/index.ts |
| packages/game/src/index.ts |
| packages/game/src/local-game-bootstrap.ts |
| packages/memory/src/binary-io.ts |
| packages/memory/src/index.ts |
| packages/platform/src/web-audio-adapter.ts |
| packages/platform/src/web-cd-audio-adapter.ts |
| packages/qcommon/src/index.ts |
| packages/qcommon/src/runtime.ts |
| packages/renderer-common/src/index.ts |
| packages/renderer-common/src/sky.ts |
| packages/renderer-three/src/gl-world-scene-adapter.ts |
| packages/renderer-three/src/index.ts |
| packages/renderer-three/src/particle-sync.ts |
| packages/renderer-three/src/quake-sky-resolver.ts |
| packages/renderer-three/src/ref-gl-bootstrap.ts |
| packages/renderer-three/src/ref-gl-host.ts |
| packages/renderer-three/src/refresh-entity-sync.ts |
| packages/renderer-three/src/three-beam-sync.ts |
| packages/renderer-three/src/three-dlight-sync.ts |
| packages/renderer-three/src/three-gl-draw-adapter.ts |
| packages/renderer-three/src/three-polyblend-overlay.ts |
| packages/server/src/index.ts |
| packages/server/src/runtime.ts |
| packages/shared/src/port-metadata.ts |
| packages/tests-golden/src/index.ts |
| packages/tests-golden/src/snapshots.ts |

