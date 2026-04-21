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
| 3.15_Changes.txt | 3.15_Changes.txt | Documentation historique de release Quake II, hors perimetre du runtime et du portage source JS. | ⛔ |  |  |
| 3.16_Changes.txt | 3.16_Changes.txt | Documentation historique de release Quake II, hors perimetre du runtime et du portage source JS. | ⛔ |  |  |
| 3.17_Changes.txt | 3.17_Changes.txt | Documentation historique de release Quake II, hors perimetre du runtime et du portage source JS. | ⛔ |  |  |
| 3.18_changes.txt | 3.18_changes.txt | Documentation historique de release Quake II, hors perimetre du runtime et du portage source JS. | ⛔ |  |  |
| baseq2\config.cfg | config.cfg | Fichier de configuration utilisateur/installation, hors perimetre du portage source moteur vers JS. | ⛔ |  |  |
| baseq2\save\save0\game.ssv | game.ssv | Donnee de sauvegarde runtime, non concernee par le portage source fichier par fichier. | ⛔ |  |  |
| baseq2\save\save0\server.ssv | server.ssv | Donnee de sauvegarde runtime, non concernee par le portage source fichier par fichier. | ⛔ |  |  |
| changes.txt | changes.txt | Documentation historique de release Quake II, hors perimetre du runtime et du portage source JS. | ⛔ |  |  |
| client\adivtab.h | adivtab.h |  |  |  |  |
| client\anorms.h | anorms.h | Header declaratif ferme, rattache principalement a `packages/qcommon/src/anorms.ts` pour la table canonique des 162 directions encodees Quake II (`BYTE_DIRS` / `DirFromByte`) reutilisee telle quelle par les consommateurs de normales encodees et de temporary entities ; `packages/client/src/tent.ts` n'est ici qu'un consommateur. | ✅ | ✅ | packages/qcommon/src/anorms.ts, packages/client/src/tent.ts |
| client\asm_i386.h | asm_i386.h |  |  |  |  |
| client\block16.h | block16.h |  |  |  |  |
| client\block8.h | block8.h |  |  |  |  |
| client\cdaudio.h | cdaudio.h |  |  |  |  |
| client\cl_cin.c | cl_cin.c |  |  |  |  |
| client\cl_ents.c | cl_ents.c | Portage principal rattache a `packages/client/src/entities.ts` pour les entity events, entity states de frame et packet entity snapshots interpoles ; `packages/client/src/parse.ts` reste le fournisseur de paquets/frame data (`CL_ParseEntityBits`, `CL_ParseDelta`, `CL_ParsePlayerstate`, `CL_ParseFrame`, `CL_ParsePacketEntities`) et `packages/client/src/refresh.ts` la projection refresh structuree du resultat ; `renderer-three` n'est plus qu'un consommateur de ces sorties. | 🟠 | 🟠 | packages/client/src/entities.ts, packages/client/src/parse.ts, packages/client/src/refresh.ts, packages/renderer-three/src/refresh-entity-sync.ts, packages/renderer-three/src/md2-mesh-builder.ts, scripts/verify/quake2-entities-phase4.ts, scripts/verify/quake2-entities-phase5.ts, scripts/verify/quake2-entities-phase5-map-flags.ts, scripts/verify/quake2-alias-orientation-phase6.ts, scripts/verify/quake2-entities-phase6-skinnum.ts, scripts/verify/quake2-entities-phase7-origin-audit.ts, scripts/verify/quake2-entities-phase8-scene.ts, scripts/verify/quake2-entities-phase9.ts, scripts/verify/quake2-entities-phase10.ts, scripts/verify/quake2-entities-phase10-maps.ts, scripts/verify/quake2-entities-phase11.ts, RAPPORT_PHASE11_ENTITES.md |
| client\cl_fx.c | cl_fx.c | Portage principal rattache a `packages/client/src/effects.ts` pour les muzzle flashes, dynamic lights, light styles, particules runtime et traductions d'entity events ; `packages/client/src/parse.ts` reste borne a la lecture des paquets source (`CL_ParseMuzzleFlash`, `CL_ParseMuzzleFlash2`), `packages/client/src/refresh.ts` a la projection refresh/audio-ready (`CL_RunDLights`, `CL_AddDLights`, `CL_RunLightStyles`, `CL_AddLightStyles`, `CL_AddParticles`) et `packages/client/src/monster-flash.ts` au sous-module de table `monster_flash_offset` uniquement. | 🟠 | 🟠 | packages/client/src/effects.ts, packages/client/src/parse.ts, packages/client/src/refresh.ts, packages/client/src/monster-flash.ts, packages/client/src/entities.ts, packages/client/src/main.ts, packages/client/src/types.ts |
| client\cl_input.c | cl_input.c | Portage principal actuellement rattache a `packages/client/src/input.ts` pour le suivi des touches, l'ajustement des angles et la construction des usercmds, avec `types.ts` comme support de declarations runtime. | 🟠 | 🟠 | packages/client/src/input.ts, packages/client/src/types.ts |
| client\cl_inv.c | cl_inv.c | Portage principal actuellement rattache a `packages/client/src/parse.ts` pour le parsing de l'inventaire et a `screen.ts` pour la projection HUD associee ; la frontiere exacte entre parsing et presentation reste encore a expliciter. | 🟠 | 🟠 | packages/client/src/parse.ts, packages/client/src/screen.ts |
| client\cl_main.c | cl_main.c | Portage principal actuellement rattache a `packages/client/src/main.ts` pour le bootstrap client, les commandes, les transitions de connexion et l'orchestration generale, avec `download.ts`, `precache.ts`, `sound.ts`, `parse.ts` et `sky.ts` comme sous-blocs extraits encore en cours de clarification. | 🟠 | 🟠 | packages/client/src/main.ts, packages/client/src/download.ts, packages/client/src/precache.ts, packages/client/src/sound.ts, packages/client/src/parse.ts, packages/client/src/sky.ts, packages/client/src/types.ts |
| ref_gl\gl_image.c | gl_image.c | Portage renderer actuellement rattache principalement a `packages/renderer-three/src/quake-sky-resolver.ts` pour le chargement des ressources image du renderer Quake II dans le pipeline navigateur, avec `packages/formats/src/pcx.ts` et `tga.ts` comme parseurs binaires de support et `md2-mesh-builder.ts` comme consommateur pour les skins alias models. | 🟠 | 🟠 | packages/renderer-three/src/quake-sky-resolver.ts, packages/formats/src/pcx.ts, packages/formats/src/tga.ts, packages/renderer-three/src/md2-mesh-builder.ts |
| ref_gl\gl_mesh.c | gl_mesh.c | Portage renderer actuellement rattache principalement a `packages/renderer-three/src/md2-mesh-builder.ts` pour la reconstruction des alias models, le frame lerp et les glcmds, avec `refresh-entity-sync.ts` comme consommateur de scene et des harnais dedies pour l'orientation et les linked models. | 🟠 | 🟠 | packages/renderer-three/src/md2-mesh-builder.ts, packages/renderer-three/src/refresh-entity-sync.ts, scripts/verify/quake2-alias-orientation-phase6.ts, scripts/verify/quake2-entities-phase5.ts |
| ref_gl\gl_rmain.c | gl_rmain.c | Portage renderer actuellement rattache principalement a `packages/renderer-three/src/refresh-entity-sync.ts` pour les conventions de transformation d'entites et d'orientation alias model reprises du renderer original. | 🟠 | 🟠 | packages/renderer-three/src/refresh-entity-sync.ts, scripts/verify/quake2-alias-orientation-phase6.ts |
| ref_gl\gl_warp.c | gl_warp.c | Portage renderer actuellement rattache principalement a `packages/renderer-three/src/sky-scene-adapter.ts` pour le rendu du ciel Quake II, avec `packages/renderer-common/src/sky.ts` comme contrat partage et `quake-sky-resolver.ts` comme chargement des ressources ; `apps/web` n'est qu'un consommateur du resultat. | 🟠 | 🟠 | packages/renderer-three/src/sky-scene-adapter.ts, packages/renderer-common/src/sky.ts, packages/renderer-three/src/quake-sky-resolver.ts, scripts/verify/quake2-sky-phase3.ts, scripts/verify/quake2-sky-phase4.ts, scripts/verify/quake2-sky-phase5.ts |
| client\cl_newfx.c | cl_newfx.c | Portage principal actuellement rattache a `packages/client/src/tent.ts` pour les helpers d'effets et temporary entities etendues, avec `effects.ts` comme support de calculs partages et `refresh.ts` comme consommateur du resultat renderer-ready. | 🟠 | 🟠 | packages/client/src/tent.ts, packages/client/src/effects.ts, packages/client/src/refresh.ts |
| client\cl_parse.c | cl_parse.c | Portage principal actuellement rattache a `packages/client/src/parse.ts` pour le parsing des server messages, configstrings, downloads, sounds et bootstrap client, avec `download.ts`, `sound.ts`, `screen.ts` et `sky.ts` comme sous-blocs extraits ou consommateurs specialises ; les frontieres avec `cl_ents.c` et `cl_main.c` restent encore a resserrer. | 🟠 | 🟠 | packages/client/src/parse.ts, packages/client/src/download.ts, packages/client/src/sound.ts, packages/client/src/screen.ts, packages/client/src/sky.ts, scripts/verify/quake2-sky-phase1.ts, scripts/verify/quake2-sky-phase2.ts, scripts/verify/quake2-entities-phase4.ts |
| client\cl_pred.c | cl_pred.c | Portage principal actuellement rattache a `packages/client/src/view.ts` pour la prediction, les prediction errors et le smoothing de la vue, avec un reste de pilotage encore present cote `apps/web` a rapatrier hors de l'adapter. | 🟠 | 🟠 | packages/client/src/view.ts, scripts/verify/quake2-collision-phase8.ts |
| client\cl_scrn.c | cl_scrn.c | Portage principal actuellement rattache a `packages/client/src/screen.ts` pour les centerprints, overlays, layouts et draw commands HUD, avec `main.ts` et `types.ts` comme supports runtime ; la ligne est retrogradee en `🟠` car des contrats HUD restent encore relies a `renderer-common` et parce que le referentiel melange encore portage principal et consommateurs renderer. | 🟠 | 🟠 | packages/client/src/screen.ts, packages/client/src/main.ts, packages/client/src/types.ts, packages/renderer-common/src/hud-draw.ts, packages/renderer-common/src/hud-resources.ts, packages/renderer-three/src/hud-renderer.ts, packages/renderer-three/src/hud-resource-resolver.ts |
| client\cl_tent.c | cl_tent.c | Portage principal rattache a `packages/client/src/tent.ts` pour l'etat persistant des temporary entities, beams, explosions, force walls, sustains et la sortie refresh associee ; `packages/client/src/parse.ts` reste borne a la lecture des paquets (`CL_ParseTEnt`, `CL_ParseParticles`), `packages/client/src/effects.ts` aux helpers d'effets partages reutilises par `tent.ts`, `packages/client/src/refresh.ts` a la projection de `CL_BuildTEntRefresh` et `sound.ts` a la consommation audio des evenements reconstruits. | 🟠 | 🟠 | packages/client/src/tent.ts, packages/client/src/parse.ts, packages/client/src/effects.ts, packages/client/src/refresh.ts, packages/client/src/sound.ts, packages/client/src/types.ts, scripts/verify/quake2-entities-phase8-scene.ts |
| client\cl_view.c | cl_view.c | Portage principal rattache a `packages/client/src/view.ts` pour la composition de vue logique, les valeurs de camera et les helpers de prediction utilises pour la vue ; `packages/client/src/refresh.ts` reste consommateur de `CL_CalcViewValues` dans `CL_BuildRefreshFrame`, `apps/web/src/local-client-controller.ts` n'est plus qu'un adapter qui applique l'etat de vue a `PerspectiveCamera`, et `packages/renderer-three/src/refresh-entity-sync.ts` ne fait que consommer les entites refresh deja composees. | 🟠 | 🟠 | packages/client/src/view.ts, packages/client/src/refresh.ts, apps/web/src/local-client-controller.ts, packages/renderer-three/src/refresh-entity-sync.ts |
| client\client.h | client.h | Header mixte client actuellement rattache principalement a `packages/client/src/types.ts` pour les declarations runtime, et secondairement a `parse.ts` pour quelques points d'entree encore disperses ; le point principal de rattachement est maintenant `types.ts`, mais la fermeture du header reste incomplete. | 🟠 | 🟠 | packages/client/src/types.ts, packages/client/src/parse.ts |
| client\console.c | console.c | Portage partiel actuellement rattache a `packages/client/src/screen.ts` pour les primitives texte et dessin 2D basse couche reutilisees par le HUD ; les autres responsabilites de console interactive restent encore hors perimetre ou non portees. | 🟠 | 🟠 | packages/client/src/screen.ts |
| client\console.h | console.h |  |  |  |  |
| client\input.h | input.h |  |  |  |  |
| client\keys.c | keys.c |  |  |  |  |
| client\keys.h | keys.h |  |  |  |  |
| client\menu.c | menu.c |  |  |  |  |
| client\qmenu.c | qmenu.c |  |  |  |  |
| client\qmenu.h | qmenu.h |  |  |  |  |
| client\ref.h | ref.h | Header mixte renderer cote client encore incomplet ; aucun fichier TS principal n'est encore etabli de facon suffisamment explicite pour le referentiel, et la fermeture devra distinguer clairement les declarations renderer source des simples consommateurs/adapters Three.js. | 🟠 |  |  |
| client\screen.h | screen.h | Header mixte screen/HUD actuellement rattache principalement a `packages/client/src/screen.ts` pour les declarations de center print, loading plaque, layouts et snapshots, avec quelques declarations restantes de screen loop et cinematic encore a fermer explicitement. | 🟠 | 🟠 | packages/client/src/screen.ts, packages/client/src/types.ts |
| client\snd_dma.c | snd_dma.c |  |  |  |  |
| client\snd_loc.h | snd_loc.h |  |  |  |  |
| client\snd_mem.c | snd_mem.c |  |  |  |  |
| client\snd_mix.c | snd_mix.c |  |  |  |  |
| client\sound.h | sound.h |  |  |  |  |
| client\vid.h | vid.h |  |  |  |  |
| client\x86.c | x86.c |  |  |  |  |
| ctf\2do.txt | 2do.txt | Note de travail/documentation CTF, hors perimetre du runtime Quake II de base porte en JS. | ⛔ |  | |
| ctf\ctf.001 | ctf.001 | Fichier de build/projet CTF d'origine, hors perimetre du portage runtime JS. | ⛔ |  | |
| ctf\ctf.def | ctf.def | Fichier de build/export CTF d'origine, hors perimetre du portage runtime JS. | ⛔ |  | |
| ctf\ctf.dsp | ctf.dsp | Projet IDE Visual Studio historique pour CTF, hors perimetre du portage JS. | ⛔ |  | |
| ctf\ctf.plg | ctf.plg | Artefact de build/projet IDE historique pour CTF, hors perimetre du portage JS. | ⛔ |  | |
| ctf\docs\admin.gif | admin.gif | Ressource de documentation CTF, hors perimetre du portage source runtime. | ⛔ |  | |
| ctf\docs\adminset.gif | adminset.gif | Ressource de documentation CTF, hors perimetre du portage source runtime. | ⛔ |  | |
| ctf\docs\automac.gif | automac.gif | Ressource de documentation CTF, hors perimetre du portage source runtime. | ⛔ |  | |
| ctf\docs\ghost.jpg | ghost.jpg | Ressource de documentation CTF, hors perimetre du portage source runtime. | ⛔ |  | |
| ctf\docs\grapple.jpg | grapple.jpg | Ressource de documentation CTF, hors perimetre du portage source runtime. | ⛔ |  | |
| ctf\docs\layout.jpg | layout.jpg | Ressource de documentation CTF, hors perimetre du portage source runtime. | ⛔ |  | |
| ctf\docs\mainctf_back.jpg | mainctf_back.jpg | Ressource de documentation CTF, hors perimetre du portage source runtime. | ⛔ |  | |
| ctf\docs\menu.gif | menu.gif | Ressource de documentation CTF, hors perimetre du portage source runtime. | ⛔ |  | |
| ctf\docs\q2ctf.html | q2ctf.html | Documentation HTML CTF, hors perimetre du runtime Quake II de base porte en JS. | ⛔ |  | |
| ctf\docs\say_team.gif | say_team.gif | Ressource de documentation CTF, hors perimetre du portage source runtime. | ⛔ |  | |
| ctf\docs\stats.jpg | stats.jpg | Ressource de documentation CTF, hors perimetre du portage source runtime. | ⛔ |  | |
| ctf\docs\tech1.gif | tech1.gif | Ressource de documentation CTF, hors perimetre du portage source runtime. | ⛔ |  | |
| ctf\docs\tech2.gif | tech2.gif | Ressource de documentation CTF, hors perimetre du portage source runtime. | ⛔ |  | |
| ctf\docs\tech3.gif | tech3.gif | Ressource de documentation CTF, hors perimetre du portage source runtime. | ⛔ |  | |
| ctf\docs\tech4.gif | tech4.gif | Ressource de documentation CTF, hors perimetre du portage source runtime. | ⛔ |  | |
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
| ctf\layout.txt | layout.txt | Ressource/layout specifique CTF, hors perimetre du runtime Quake II de base tant que le module CTF n'est pas porte. | ⛔ |  | |
| ctf\m_move.c | m_move.c |  |  |  | |
| ctf\m_player.h | m_player.h |  |  |  | |
| ctf\Makefile.Linux.i386 | Makefile.Linux.i386 | Fichier de build historique CTF sous Linux, hors perimetre du portage JS. | ⛔ |  | |
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
| game\g_combat.c | g_combat.c | Portage principal actuellement rattache a `packages/game/src/g_combat.ts` pour le noyau de resolution des degats, avec `g_weapon.ts`, `g_utils.ts` et `g_items.ts` comme consommateurs ou dependances gameplay ; le fichier reste partiel et doit encore expliciter les branches non portees. | 🟠 | 🟠 | packages/game/src/g_combat.ts, packages/game/src/g_weapon.ts, packages/game/src/g_utils.ts, packages/game/src/g_items.ts, packages/game/src/runtime.ts |
| game\g_func.c | g_func.c | Portage principal actuellement rattache a `packages/game/src/g_func.ts` pour le cycle de vie des brush entities `func_door`, `func_door_rotating` et `func_plat`, y compris `Move_*`, `AngleMove_*`, les transitions haut/bas, les vitesses accelerees, les helper triggers et les callbacks `blocked`, avec `g_spawn.ts` comme support de branchement gameplay et des harnais dedies pour la verification sur cartes chargees. | 🟠 | 🟠 | packages/game/src/g_func.ts, packages/game/src/g_spawn.ts, scripts/verify/quake2-door-phase1.ts, scripts/verify/quake2-door-phase4.ts, scripts/verify/quake2-door-phase5.ts, scripts/verify/quake2-door-phase6.ts |
| game\g_items.c | g_items.c | Portage principal actuellement rattache a `packages/game/src/g_items.ts` pour les definitions d'items, le spawn et les helpers associes, avec `g_spawn.ts` et `g_combat.ts` comme consommateurs gameplay ; la mention de `apps/web` est retiree du referentiel car l'adapter ne doit pas etre lu comme cible de portage principale. | 🟠 | 🟠 | packages/game/src/g_items.ts, packages/game/src/g_spawn.ts, packages/game/src/g_combat.ts, packages/game/src/index.ts |
| game\g_local.h | g_local.h | Header mixte gameplay encore incomplet, actuellement rattache principalement a `packages/game/src/runtime.ts` pour les declarations gameplay deja portees, avec `g_items.ts` comme cible secondaire ; le stub genere n'est plus considere comme cible architecturale. | 🟠 | 🟠 | packages/game/src/runtime.ts, packages/game/src/g_items.ts, packages/game/src/index.ts |
| game\g_main.c | g_main.c |  |  |  | |
| game\g_misc.c | g_misc.c | Portage principal actuellement rattache a `packages/game/src/g_misc.ts` pour le spawn des objets decoratifs et entites monde, notamment `misc_banner`, `misc_blackhole`, les easter entities, `misc_deadsoldier`, les teleporters, les mine lights, les ships, `misc_viper_bomb` et les gibs, avec preservation de l'etat visuel `edict_t->s` et des `think` d'animation, et `g_spawn.ts` comme support de branchement gameplay. | 🟠 | 🟠 | packages/game/src/g_misc.ts, packages/game/src/g_spawn.ts, packages/game/src/index.ts |
| game\g_monster.c | g_monster.c |  |  |  | |
| game\g_phys.c | g_phys.c | Portage principal actuellement rattache a `packages/game/src/g_phys.ts` pour la physique gameplay, les pushers et l'integration des collisions de jeu, avec `runtime.ts` et `touch.ts` comme supports runtime ; l'adapter web n'est plus une cible du referentiel, seulement un consommateur du resultat. | 🟠 | 🟠 | packages/game/src/g_phys.ts, packages/game/src/runtime.ts, packages/game/src/touch.ts, scripts/verify/quake2-door-phase3.ts, scripts/verify/quake2-door-phase5.ts, scripts/verify/quake2-collision-phase3.ts, scripts/verify/quake2-collision-phase4.ts, scripts/verify/quake2-collision-phase5.ts, scripts/verify/quake2-collision-phase8.ts |
| game\g_save.c | g_save.c |  |  |  | |
| game\g_spawn.c | g_spawn.c | Portage principal actuellement rattache a `packages/game/src/g_spawn.ts` pour le registre de spawn, `ED_CallSpawn`, `G_FindTeams` et le dispatch des entites visibles deja supportees, avec `g_items.ts` et `g_misc.ts` comme consommateurs gameplay. | 🟠 | 🟠 | packages/game/src/g_spawn.ts, packages/game/src/g_items.ts, packages/game/src/g_misc.ts, scripts/verify/quake2-door-phase6.ts |
| game\g_svcmds.c | g_svcmds.c |  |  |  | |
| game\g_target.c | g_target.c |  |  |  | |
| game\g_trigger.c | g_trigger.c | Portage principal actuellement rattache a `packages/game/src/g_trigger.ts` pour les triggers et leur flux d'activation, avec `g_spawn.ts` et `touch.ts` comme supports gameplay et des harnais dedies pour les cas de portes et de collisions. | 🟠 | 🟠 | packages/game/src/g_trigger.ts, packages/game/src/g_spawn.ts, packages/game/src/touch.ts, scripts/verify/quake2-door-phase1.ts, scripts/verify/quake2-collision-phase7.ts |
| game\g_turret.c | g_turret.c |  |  |  | |
| game\g_utils.c | g_utils.c | Portage principal actuellement rattache a `packages/game/src/g_utils.ts` pour les utilitaires gameplay, les recherches d'entites et `G_UseTargets`, avec `runtime.ts` et `touch.ts` comme sous-blocs de support et `g_weapon.ts` comme consommateur gameplay. | 🟠 | 🟠 | packages/game/src/g_utils.ts, packages/game/src/runtime.ts, packages/game/src/touch.ts, packages/game/src/g_weapon.ts, scripts/verify/quake2-door-phase1.ts, scripts/verify/quake2-collision-phase3.ts, scripts/verify/quake2-collision-phase7.ts |
| game\g_weapon.c | g_weapon.c | Portage principal actuellement rattache a `packages/game/src/g_weapon.ts` pour les armes monde, projectiles, impacts et explosions principales, avec `g_combat.ts`, `g_utils.ts`, `g_items.ts` et `runtime.ts` comme dependances gameplay explicites ; le branchement final audio/client et certaines reactions monsters restent encore a fermer. | 🟠 | 🟠 | packages/game/src/g_weapon.ts, packages/game/src/g_combat.ts, packages/game/src/g_utils.ts, packages/game/src/g_items.ts, packages/game/src/runtime.ts |
| game\game.001 | game.001 | Fichier de build/projet du module gameplay original, hors perimetre du portage runtime JS. | ⛔ |  | |
| game\game.def | game.def | Fichier de build/export du module gameplay original, hors perimetre du portage runtime JS. | ⛔ |  | |
| game\game.dsp | game.dsp | Projet IDE Visual Studio historique du module gameplay, hors perimetre du portage JS. | ⛔ |  | |
| game\game.h | game.h | Header declarations gameplay/engine actuellement rattachees principalement a `packages/game/src/runtime.ts` pour `edict_t`, le linkage spatial et les contrats moteurs deja portes ; la frontiere avec `g_local.h` reste encore a stabiliser. | 🟠 | 🟠 | packages/game/src/runtime.ts, scripts/verify/quake2-collision-phase2.ts, scripts/verify/quake2-collision-phase3.ts, scripts/verify/quake2-entities-phase4.ts |
| game\game.plg | game.plg | Artefact de build/projet IDE historique du module gameplay, hors perimetre du portage JS. | ⛔ |  | |
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
| game\m_flash.c | m_flash.c | Portage principal ferme, rattache a `packages/client/src/monster-flash.ts` pour la table `monster_flash_offset` et l'accesseur `getMonsterFlashOffset`, avec preservation du fallback d'index nul du code source ; `packages/client/src/effects.ts` n'est qu'un consommateur du resultat pour `CL_ParseMuzzleFlash2`. | ✅ | ✅ | packages/client/src/monster-flash.ts, packages/client/src/effects.ts |
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
| game\p_weapon.c | p_weapon.c | Portage principal actuellement rattache a `packages/game/src/p_weapon.ts` pour la logique joueur des armes, y compris `PlayerNoise`, `Pickup_Weapon`, `ChangeWeapon`, `NoAmmoWeaponChange`, `Weapon_Generic` et l'ensemble des armes joueur du fichier original (`Grenade`, `GrenadeLauncher`, `RocketLauncher`, `Blaster`, `HyperBlaster`, `Machinegun`, `Chaingun`, `Shotgun`, `SuperShotgun`, `Railgun`, `BFG`), avec `runtime.ts` comme support gameplay ; la ligne reste `🟠` tant que certains chemins de tir, projectiles, drop et muzzle flashes dependent encore de hooks explicites vers les blocs gameplay monde non entierement refermes. | 🟠 | 🟠 | packages/game/src/p_weapon.ts, packages/game/src/runtime.ts, packages/game/src/index.ts |
| game\q_shared.c | q_shared.c |  |  |  | |
| game\q_shared.h | q_shared.h | Header partage actuellement rattache principalement a `packages/qcommon/src/q-shared.ts` pour les constantes coeur, les structures communes, les types `entity_state_t` et `player_state_t`, ainsi que les identifiants de muzzle flashes `MZ_*` reutilises par le chemin partage armes/client ; `index.ts` n'est ici qu'un point d'export et non la cible principale du portage. | 🟠 | 🟠 | packages/qcommon/src/q-shared.ts, packages/qcommon/src/index.ts |
| gnu.txt | gnu.txt | Documentation licence/distribution, hors perimetre du runtime et du portage source JS. | ⛔ |  | |
| irix\cd_irix.c | cd_irix.c | Backend CD audio IRIX natif, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| irix\glw_imp.c | glw_imp.c | Couche GL/windowing IRIX native, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| irix\q_shirix.c | q_shirix.c | Glue systeme IRIX native, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| irix\qgl_irix.c | qgl_irix.c | Chargement GL IRIX natif, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| irix\snd_irix.c | snd_irix.c | Backend son IRIX natif, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| irix\sys_irix.c | sys_irix.c | Couche systeme IRIX native, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| irix\vid_menu.c | vid_menu.c | Menu video IRIX natif, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| irix\vid_so.c | vid_so.c | Chargement video/renderer IRIX natif, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| joystick.txt | joystick.txt | Documentation utilisateur/historique, hors perimetre du runtime et du portage source JS. | ⛔ |  | |
| linux\block16.h | block16.h | Header d'optimisation/renderer natif Linux, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| linux\block8.h | block8.h | Header d'optimisation/renderer natif Linux, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| linux\cd_linux.c | cd_linux.c | Backend CD audio Linux natif, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| linux\d_copy.s | d_copy.s | Routine assembleur Linux native, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| linux\d_ifacea.h | d_ifacea.h | Header renderer/asm Linux natif, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| linux\d_polysa.s | d_polysa.s | Routine assembleur Linux native, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| linux\gl_fxmesa.c | gl_fxmesa.c | Backend OpenGL Linux specifique FX/Mesa, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| linux\glob.c | glob.c | Helper systeme Linux natif, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| linux\glob.h | glob.h | Header systeme Linux natif, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| linux\in_linux.c | in_linux.c | Backend input Linux natif, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| linux\Makefile.AXP | Makefile.AXP | Fichier de build Linux historique, hors perimetre du portage JS. | ⛔ |  | |
| linux\Makefile.i386 | Makefile.i386 | Fichier de build Linux historique, hors perimetre du portage JS. | ⛔ |  | |
| linux\math.s | math.s | Routine assembleur Linux native, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| linux\net_udp.c | net_udp.c | Backend reseau UDP Linux natif, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| linux\q_shlinux.c | q_shlinux.c | Glue systeme Linux native, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| linux\qasm.h | qasm.h | Header assembleur Linux natif, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| linux\qgl_linux.c | qgl_linux.c | Chargement GL Linux natif, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| linux\r_aclipa.s | r_aclipa.s | Routine assembleur renderer Linux native, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| linux\r_draw16.s | r_draw16.s | Routine assembleur renderer Linux native, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| linux\r_drawa.s | r_drawa.s | Routine assembleur renderer Linux native, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| linux\r_edgea.s | r_edgea.s | Routine assembleur renderer Linux native, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| linux\r_scana.s | r_scana.s | Routine assembleur renderer Linux native, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| linux\r_spr8.s | r_spr8.s | Routine assembleur renderer Linux native, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| linux\r_surf8.s | r_surf8.s | Routine assembleur renderer Linux native, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| linux\r_varsa.s | r_varsa.s | Routine assembleur renderer Linux native, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| linux\rw_in_svgalib.c | rw_in_svgalib.c | Backend input/rendu Linux SVGALib natif, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| linux\rw_linux.h | rw_linux.h | Header rendu Linux natif, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| linux\rw_svgalib.c | rw_svgalib.c | Backend rendu Linux SVGALib natif, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| linux\rw_x11.c | rw_x11.c | Backend rendu Linux X11 natif, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| linux\snd_linux.c | snd_linux.c | Backend son Linux natif, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| linux\snd_mixa.s | snd_mixa.s | Routine assembleur son Linux native, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| linux\sys_dosa.s | sys_dosa.s | Routine assembleur systeme Linux native, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| linux\sys_linux.c | sys_linux.c | Couche systeme Linux native, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| linux\vid_menu.c | vid_menu.c | Menu video Linux natif, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| linux\vid_so.c | vid_so.c | Chargement video/renderer Linux natif, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| makefile | makefile | Script de build historique du depot natif, hors perimetre du portage runtime JS/TS. | ⛔ |  | |
| makezip | makezip | Script d'empaquetage historique du depot natif, hors perimetre du portage runtime JS/TS. | ⛔ |  | |
| makezip.bat | makezip.bat | Script d'empaquetage historique du depot natif, hors perimetre du portage runtime JS/TS. | ⛔ |  | |
| null\cd_null.c | cd_null.c | Stub backend CD audio nul historique, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| null\cl_null.c | cl_null.c | Stub client nul historique, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| null\glimp_null.c | glimp_null.c | Stub GL/platform nul historique, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| null\in_null.c | in_null.c | Stub input nul historique, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| null\snddma_null.c | snddma_null.c | Stub backend son nul historique, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| null\swimp_null.c | swimp_null.c | Stub software renderer platform nul historique, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| null\sys_null.c | sys_null.c | Stub systeme nul historique, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| null\vid_null.c | vid_null.c | Stub video nul historique, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| qcommon\cmd.c | cmd.c | Portage principal actuellement rattache a `packages/qcommon/src/cmd.ts` pour le command buffer, la tokenization, les aliases et le registre de commandes ; un harnais cible reste encore a ajouter pour fermer proprement la verification. | 🟠 | 🟠 | packages/qcommon/src/cmd.ts |
| qcommon\cmodel.c | cmodel.c | Portage principal actuellement rattache a `packages/qcommon/src/collision.ts` pour le chargement collision BSP, les traces et les inline models, avec des harnais dedies de collision pour la verification. | 🟠 | 🟠 | packages/qcommon/src/collision.ts, scripts/verify/quake2-collision-phase1.ts |
| qcommon\common.c | common.c | Portage principal actuellement rattache a `packages/qcommon/src/common.ts` pour les helpers communs, avec `packages/memory/src/sizebuf.ts` et `binary-io.ts` comme sous-blocs de support de buffer/message et `packages/qcommon/src/runtime.ts` comme couche d'integration. | 🟠 | 🟠 | packages/qcommon/src/common.ts, packages/memory/src/sizebuf.ts, packages/memory/src/binary-io.ts, packages/qcommon/src/messages.ts, packages/qcommon/src/runtime.ts |
| qcommon\crc.c | crc.c |  |  |  | |
| qcommon\crc.h | crc.h |  |  |  | |
| qcommon\cvar.c | cvar.c | Portage principal actuellement rattache a `packages/qcommon/src/cvar.ts` pour les cvars, leurs flags, valeurs latched et setters relies aux commandes ; un harnais cible reste encore a ajouter pour la verification. | 🟠 | 🟠 | packages/qcommon/src/cvar.ts |
| qcommon\files.c | files.c | Portage principal actuellement rattache a `packages/filesystem/src/virtual-filesystem.ts` pour les search paths, le montage et la lecture des fichiers, avec `packages/formats/src/pak.ts` comme parseur de support et `packages/filesystem/src/index.ts` comme point d'export. | 🟠 | 🟠 | packages/filesystem/src/virtual-filesystem.ts, packages/formats/src/pak.ts, packages/filesystem/src/index.ts |
| qcommon\md4.c | md4.c |  |  |  | |
| qcommon\net_chan.c | net_chan.c |  |  |  | |
| qcommon\pmove.c | pmove.c | Portage principal actuellement rattache a `packages/qcommon/src/pmove.ts` pour le mouvement partage, avec des harnais de collision dedies ; l'adapter web n'est plus une cible du referentiel, seulement un consommateur du resultat. | 🟠 | 🟠 | packages/qcommon/src/pmove.ts, scripts/verify/quake2-collision-phase8.ts |
| qcommon\qcommon.h | qcommon.h | Header mixte qcommon actuellement rattache principalement a `packages/qcommon/src/messages.ts` pour les declarations `MSG_*` et contrats immediats, avec `packages/memory/src/sizebuf.ts` et `binary-io.ts` comme sous-blocs ; le stub genere n'est plus considere comme cible architecturale. | 🟠 | 🟠 | packages/qcommon/src/messages.ts, packages/memory/src/sizebuf.ts, packages/memory/src/binary-io.ts, packages/qcommon/src/protocol.ts |
| qcommon\qfiles.h | qfiles.h | Header declaratif ferme, rattache a la famille de modules `packages/formats/src/*` avec `bsp.ts`, `pak.ts`, `pcx.ts`, `wal.ts`, `md2.ts` et `sp2.ts` comme sous-blocs specialises ; `index.ts` n'est qu'un point d'export et non une cible principale concurrente. | ✅ | ✅ | packages/formats/src/bsp.ts, packages/formats/src/pak.ts, packages/formats/src/pcx.ts, packages/formats/src/wal.ts, packages/formats/src/md2.ts, packages/formats/src/sp2.ts, packages/formats/src/index.ts |
| quake2.001 | quake2.001 | Fichier de build/projet historique du depot natif, hors perimetre du portage runtime JS. | ⛔ |  | |
| quake2.bce | quake2.bce | Artefact/projet historique du depot natif, hors perimetre du portage runtime JS. | ⛔ |  | |
| quake2.bcp | quake2.bcp | Artefact/projet historique du depot natif, hors perimetre du portage runtime JS. | ⛔ |  | |
| quake2.dsp | quake2.dsp | Projet IDE Visual Studio historique du depot natif, hors perimetre du portage JS. | ⛔ |  | |
| quake2.dsw | quake2.dsw | Workspace IDE Visual Studio historique du depot natif, hors perimetre du portage JS. | ⛔ |  | |
| quake2.mak | quake2.mak | Script/projet de build historique du depot natif, hors perimetre du portage runtime JS. | ⛔ |  | |
| quake2.opt | quake2.opt | Configuration IDE historique du depot natif, hors perimetre du portage JS. | ⛔ |  | |
| quake2.plg | quake2.plg | Artefact de build/projet IDE historique du depot natif, hors perimetre du portage JS. | ⛔ |  | |
| readme.txt | readme.txt | Documentation historique du depot source original, hors perimetre du runtime et du portage source JS. | ⛔ |  | |
| ref_gl\anorms.h | anorms.h | Header declaratif ferme, referme par le meme port partage que `client/anorms.h`, a savoir `packages/qcommon/src/anorms.ts`, apres verification explicite que la copie renderer correspond bien a la table canonique des 162 directions encodees. | ✅ | ✅ | packages/qcommon/src/anorms.ts |
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
| rhapsody\in_next.m | in_next.m | Backend input Rhapsody/NeXT natif, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| rhapsody\makefile.bak | makefile.bak | Fichier de build historique Rhapsody, hors perimetre du portage JS. | ⛔ |  | |
| rhapsody\notes.txt | notes.txt | Documentation technique Rhapsody historique, hors perimetre du runtime JS. | ⛔ |  | |
| rhapsody\pb.project | pb.project | Projet IDE/Build Rhapsody historique, hors perimetre du portage JS. | ⛔ |  | |
| rhapsody\quake2.iconheader | quake2.iconheader | Ressource application Rhapsody historique, hors perimetre du portage JS. | ⛔ |  | |
| rhapsody\quake2.tiff | quake2.tiff | Ressource application Rhapsody historique, hors perimetre du portage JS. | ⛔ |  | |
| rhapsody\r_next.m | r_next.m | Backend renderer Rhapsody/NeXT natif, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| rhapsody\rhapqw.txt | rhapqw.txt | Documentation historique Rhapsody, hors perimetre du runtime JS. | ⛔ |  | |
| rhapsody\snd_next.m | snd_next.m | Backend son Rhapsody/NeXT natif, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| rhapsody\swimp_rhap.m | swimp_rhap.m | Backend software renderer Rhapsody/NeXT natif, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| rhapsody\sys_rhap.m | sys_rhap.m | Couche systeme Rhapsody/NeXT native, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| rhapsody\vid_next.m | vid_next.m | Backend video Rhapsody/NeXT natif, hors perimetre du portage navigateur/JS. | ⛔ |  | |
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
| solaris\g_so.c | g_so.c | Glue module gameplay partage Solaris native, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| solaris\glob.c | glob.c | Helper systeme Solaris natif, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| solaris\glob.h | glob.h | Header systeme Solaris natif, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| solaris\Makefile.OLD | Makefile.OLD | Fichier de build Solaris historique, hors perimetre du portage JS. | ⛔ |  | |
| solaris\Makefile.Solaris | Makefile.Solaris | Fichier de build Solaris historique, hors perimetre du portage JS. | ⛔ |  | |
| solaris\net_udp.c | net_udp.c | Backend reseau UDP Solaris natif, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| solaris\q_shsolaris.c | q_shsolaris.c | Glue systeme Solaris native, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| solaris\sys_solaris.c | sys_solaris.c | Couche systeme Solaris native, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| unix\makefile | makefile | Fichier de build Unix historique, hors perimetre du portage JS. | ⛔ |  | |
| unix\makefile_old | makefile_old | Fichier de build Unix historique, hors perimetre du portage JS. | ⛔ |  | |
| unix\next\sv_ccmds.o | sv_ccmds.o | Artefact objet binaire Unix historique, hors perimetre du portage source JS. | ⛔ |  | |
| win32\cd_win.c | cd_win.c | Backend CD audio Win32 natif, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| win32\conproc.c | conproc.c | Console glue Win32 native, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| win32\conproc.h | conproc.h | Header console Win32 natif, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| win32\glw_imp.c | glw_imp.c | Couche GL/windowing Win32 native, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| win32\glw_win.h | glw_win.h | Header GL/windowing Win32 natif, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| win32\in_win.c | in_win.c | Backend input Win32 natif, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| win32\net_wins.c | net_wins.c | Backend reseau WinSock natif, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| win32\q_shwin.c | q_shwin.c | Glue systeme Win32 native, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| win32\q2.aps | q2.aps | Ressource/projet Win32 historique, hors perimetre du portage JS. | ⛔ |  | |
| win32\q2.ico | q2.ico | Ressource application Win32 historique, hors perimetre du portage JS. | ⛔ |  | |
| win32\q2.rc | q2.rc | Ressource/build Win32 historique, hors perimetre du portage JS. | ⛔ |  | |
| win32\qe3.ico | qe3.ico | Ressource application Win32 historique, hors perimetre du portage JS. | ⛔ |  | |
| win32\qgl_win.c | qgl_win.c | Chargement GL Win32 natif, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| win32\resource.h | resource.h | Header ressources Win32 natif, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| win32\rw_ddraw.c | rw_ddraw.c | Backend rendu Win32 DirectDraw natif, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| win32\rw_dib.c | rw_dib.c | Backend rendu Win32 DIB natif, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| win32\rw_imp.c | rw_imp.c | Glue rendu Win32 natif, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| win32\rw_win.h | rw_win.h | Header rendu Win32 natif, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| win32\snd_win.c | snd_win.c | Backend son Win32 natif, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| win32\sys_win.c | sys_win.c | Couche systeme Win32 native, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| win32\vid_dll.c | vid_dll.c | Chargement video/renderer Win32 natif, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| win32\vid_menu.c | vid_menu.c | Menu video Win32 natif, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| win32\winquake.aps | winquake.aps | Ressource/projet Win32 historique, hors perimetre du portage JS. | ⛔ |  | |
| win32\winquake.h | winquake.h | Header application Win32 natif, hors perimetre du portage navigateur/JS. | ⛔ |  | |
| win32\winquake.rc | winquake.rc | Ressource/build Win32 historique, hors perimetre du portage JS. | ⛔ |  | |
