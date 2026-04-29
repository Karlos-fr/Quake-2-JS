# Commandes du C original et etat du portage

Ce document recense les commandes trouvees dans le code C original du depot `quake-2-master` et indique leur role ainsi que leur etat dans le port TypeScript/Web.

Legende:

- `Porte full-game`: commande portee et exposee dans le chemin jouable `apps/web/src/full-game.ts` / `full-game.html`.
- `Porte package`: logique portee dans un package, mais pas forcement exposee comme commande console dans `full-game.html`.
- `Partiel`: logique existe partiellement, ou depend d'un contexte non branche dans le full-game Web.
- `Non porte`: pas de commande equivalente identifiee dans le port.
- `Original absent`: commande demandee ou connue ailleurs, mais absente du C original present dans ce depot.

## Noyau qcommon / cvars / filesystem

| Commande | Source C | Role original | Etat portage |
| --- | --- | --- | --- |
| `cmdlist` | `qcommon/cmd.c` | Liste les commandes console enregistrees. | Porte full-game (`packages/qcommon/src/cmd.ts`). |
| `exec` | `qcommon/cmd.c` | Execute un fichier de commandes/config. | Porte full-game. |
| `echo` | `qcommon/cmd.c` | Affiche les arguments dans la console. | Porte full-game. |
| `alias` | `qcommon/cmd.c` | Cree ou liste des alias de commandes. | Porte full-game. |
| `wait` | `qcommon/cmd.c` | Suspend l'execution du buffer de commandes jusqu'a la frame suivante. | Porte full-game. |
| `set` | `qcommon/cvar.c` | Cree/modifie une cvar, avec flags optionnels. | Porte full-game (`packages/qcommon/src/cvar.ts`). |
| `cvarlist` | `qcommon/cvar.c` | Liste les cvars connues. | Porte full-game. |
| `path` | `qcommon/files.c` | Affiche les chemins de recherche du filesystem. | Porte package (`FS_Path_f`), pas expose full-game. |
| `link` | `qcommon/files.c` | Cree/liste des liens virtuels de filesystem. | Porte package (`FS_Link_f`), pas expose full-game. |
| `dir` | `qcommon/files.c` | Liste les fichiers correspondant a un motif. | Porte package (`FS_Dir_f`), pas expose full-game. |
| `z_stats` | `qcommon/common.c` | Affiche les stats de l'allocateur zone. | Non porte comme commande full-game. |
| `error` | `qcommon/common.c` | Declenche une erreur de test. | Non porte comme commande full-game. |
| `quit` | `qcommon/common.c`, `client/cl_main.c` | Quitte le programme/client. | Porte full-game cote client; comportement adapte Web. |

## Console, touches et menus client

| Commande | Source C | Role original | Etat portage |
| --- | --- | --- | --- |
| `toggleconsole` | `client/console.c` | Ouvre/ferme la console. | Porte full-game. |
| `togglechat` | `client/console.c` | Bascule vers la saisie chat. | Porte full-game. |
| `messagemode` | `client/console.c` | Ouvre le chat global. | Porte full-game. |
| `messagemode2` | `client/console.c` | Ouvre le chat equipe. | Porte full-game. |
| `clear` | `client/console.c` | Efface le buffer console. | Porte full-game. |
| `condump` | `client/console.c` | Ecrit le contenu console dans un fichier texte. | Porte full-game avec hook Web. |
| `bind` | `client/keys.c` | Associe une touche a une commande. | Porte full-game. |
| `unbind` | `client/keys.c` | Supprime le binding d'une touche. | Porte full-game. |
| `unbindall` | `client/keys.c` | Supprime tous les bindings. | Porte full-game. |
| `bindlist` | `client/keys.c` | Liste les bindings. | Porte full-game. |
| `menu_main` | `client/menu.c` | Ouvre le menu principal. | Porte full-game. |
| `menu_game` | `client/menu.c` | Ouvre le menu Game. | Porte full-game. |
| `menu_loadgame` | `client/menu.c` | Ouvre le menu de chargement. | Porte full-game. |
| `menu_savegame` | `client/menu.c` | Ouvre le menu de sauvegarde. | Porte full-game. |
| `menu_joinserver` | `client/menu.c` | Ouvre le menu Join Server. | Porte full-game. |
| `menu_addressbook` | `client/menu.c` | Ouvre le carnet d'adresses. | Porte full-game. |
| `menu_startserver` | `client/menu.c` | Ouvre le menu Start Server. | Porte full-game. |
| `menu_dmoptions` | `client/menu.c` | Ouvre les options deathmatch. | Porte full-game. |
| `menu_playerconfig` | `client/menu.c` | Ouvre la configuration joueur. | Porte full-game. |
| `menu_downloadoptions` | `client/menu.c` | Ouvre les options de telechargement. | Porte full-game. |
| `menu_credits` | `client/menu.c` | Affiche les credits. | Porte full-game. |
| `menu_multiplayer` | `client/menu.c` | Ouvre le menu multijoueur. | Porte full-game. |
| `menu_video` | `client/menu.c` | Ouvre le menu video. | Porte full-game. |
| `menu_options` | `client/menu.c` | Ouvre le menu options. | Porte full-game. |
| `menu_keys` | `client/menu.c` | Ouvre le menu touches. | Porte full-game. |
| `menu_quit` | `client/menu.c` | Ouvre la confirmation de sortie. | Porte full-game. |

## Commandes d'entree et de vue client

| Commande | Source C | Role original | Etat portage |
| --- | --- | --- | --- |
| `centerview` | `client/cl_input.c` | Recentre la vue verticale. | Porte full-game. |
| `+moveup` / `-moveup` | `client/cl_input.c` | Debut/fin mouvement haut, nage/vol/echelle. | Porte full-game. |
| `+movedown` / `-movedown` | `client/cl_input.c` | Debut/fin mouvement bas. | Porte full-game. |
| `+left` / `-left` | `client/cl_input.c` | Debut/fin rotation gauche clavier. | Porte full-game. |
| `+right` / `-right` | `client/cl_input.c` | Debut/fin rotation droite clavier. | Porte full-game. |
| `+forward` / `-forward` | `client/cl_input.c` | Debut/fin avance. | Porte full-game. |
| `+back` / `-back` | `client/cl_input.c` | Debut/fin recul. | Porte full-game. |
| `+lookup` / `-lookup` | `client/cl_input.c` | Debut/fin regard vers le haut. | Porte full-game. |
| `+lookdown` / `-lookdown` | `client/cl_input.c` | Debut/fin regard vers le bas. | Porte full-game. |
| `+strafe` / `-strafe` | `client/cl_input.c` | Active/desactive le mode strafe. | Porte full-game. |
| `+moveleft` / `-moveleft` | `client/cl_input.c` | Debut/fin strafe gauche. | Porte full-game. |
| `+moveright` / `-moveright` | `client/cl_input.c` | Debut/fin strafe droite. | Porte full-game. |
| `+speed` / `-speed` | `client/cl_input.c` | Active/desactive vitesse/course. | Porte full-game. |
| `+attack` / `-attack` | `client/cl_input.c` | Debut/fin tir. | Porte full-game. |
| `+use` / `-use` | `client/cl_input.c` | Debut/fin action use. | Porte full-game. |
| `+klook` / `-klook` | `client/cl_input.c` | Active/desactive keyboard look. | Porte full-game. |
| `impulse` | `client/cl_input.c` | Envoie une impulsion numerique au serveur. | Porte full-game. |
| `gun_next` | `client/cl_view.c` | Passe au modele d'arme suivant en debug. | Porte full-game. |
| `gun_prev` | `client/cl_view.c` | Passe au modele d'arme precedent en debug. | Porte full-game. |
| `gun_model` | `client/cl_view.c` | Force un modele d'arme. | Porte full-game. |
| `viewpos` | `client/cl_view.c` | Affiche position et angles du joueur. | Porte full-game. |

## Affichage, son et renderer

| Commande | Source C | Role original | Etat portage |
| --- | --- | --- | --- |
| `timerefresh` | `client/cl_scrn.c` | Benchmark de rendu par rotation de camera. | Porte full-game. |
| `loading` | `client/cl_scrn.c` | Force l'etat/ecran de chargement. | Porte full-game. |
| `sizeup` | `client/cl_scrn.c` | Agrandit la vue 3D / reduit le HUD. | Porte full-game. |
| `sizedown` | `client/cl_scrn.c` | Reduit la vue 3D / agrandit le HUD. | Porte full-game. |
| `sky` | `client/cl_scrn.c` | Change skybox, rotation et axe. | Porte full-game. |
| `play` | `client/snd_dma.c` | Joue un ou plusieurs sons `.wav`. | Porte full-game via mixeur DMA/WebAudio. |
| `stopsound` | `client/snd_dma.c` | Stoppe tous les sons. | Porte full-game. |
| `soundlist` | `client/snd_dma.c` | Liste les sons charges. | Porte full-game. |
| `soundinfo` | `client/snd_dma.c` | Affiche l'etat du systeme son. | Porte full-game. |
| `imagelist` | `ref_gl/gl_rmain.c`, `ref_soft/r_main.c` | Liste les images/textures chargees. | Partiel renderer; pas expose full-game par les imports ref actuels. |
| `screenshot` | `ref_gl/gl_rmain.c`, `ref_soft/r_main.c` | Capture l'ecran. | Partiel/non expose full-game. |
| `modellist` | `ref_gl/gl_rmain.c`, `ref_soft/r_main.c` | Liste les modeles charges. | Partiel/non expose full-game. |
| `gl_strings` | `ref_gl/gl_rmain.c` | Affiche vendor/renderer/version/extensions OpenGL. | Non expose full-game; Three.js/WebGL remplace le chemin GL C. |

## Commandes client generales

| Commande | Source C | Role original | Etat portage |
| --- | --- | --- | --- |
| `cmd` | `client/cl_main.c` | Force l'envoi d'une commande au serveur. | Porte full-game. |
| `pause` | `client/cl_main.c` | Bascule la cvar `paused`. | Porte full-game. |
| `pingservers` | `client/cl_main.c` | Recherche/sonde des serveurs LAN/master. | Porte full-game, adapte au Web. |
| `skins` | `client/cl_main.c` | Recharge les skins clients. | Porte full-game. |
| `userinfo` | `client/cl_main.c` | Affiche la userinfo locale. | Porte full-game. |
| `snd_restart` | `client/cl_main.c` | Redemarre le systeme son. | Porte full-game. |
| `changing` | `client/cl_main.c` | Signale un changement de niveau. | Porte full-game. |
| `disconnect` | `client/cl_main.c` | Deconnecte le client. | Porte full-game. |
| `record` | `client/cl_main.c` | Demarre l'enregistrement d'une demo `.dm2`. | Porte package (`CL_Record_f`), pas expose full-game. |
| `stop` | `client/cl_main.c` | Stoppe l'enregistrement demo. | Porte package (`CL_Stop_f`), pas expose full-game. |
| `connect` | `client/cl_main.c` | Connexion a un serveur. | Porte full-game. |
| `reconnect` | `client/cl_main.c` | Reconnexion au serveur courant. | Porte full-game. |
| `rcon` | `client/cl_main.c` | Envoie une commande remote console. | Porte full-game, limite par contexte Web/local. |
| `setenv` | `client/cl_main.c` | Definit/affiche une variable d'environnement OS. | Porte full-game, adapte sans environnement natif. |
| `precache` | `client/cl_main.c` | Force des chargements de ressources. | Porte full-game. |
| `download` | `client/cl_main.c` | Demarre/reprend un telechargement serveur. | Porte full-game, adapte au stockage Web. |
| `packet` | `client/cl_main.c` | Envoi de paquet arbitraire, commente car dangereux. | Non enregistre dans l'original actif; non porte. |

## Commandes jeu envoyees au serveur

Ces commandes sont traitees par `game/g_cmds.c::ClientCommand`. Certaines sont aussi enregistrees cote client comme commandes forwardees avec callback `NULL` dans `client/cl_main.c`; les autres existent cote serveur et peuvent passer par `cmd <commande>`.

| Commande | Source C | Role original | Etat portage |
| --- | --- | --- | --- |
| `players` | `game/g_cmds.c` | Liste les joueurs. | Porte game package; accessible via commande serveur/client command. |
| `say` | `game/g_cmds.c` | Chat global. | Porte full-game. |
| `say_team` | `game/g_cmds.c` | Chat equipe. | Porte full-game. |
| `score` | `game/p_hud.c`, `game/g_cmds.c` | Affiche le scoreboard. | Porte game package; pas enregistre comme commande client directe. |
| `help` | `game/p_hud.c`, `game/g_cmds.c` | Affiche aide/score selon l'etat. | Porte game package; pas enregistre comme commande client directe. |
| `use` | `game/g_cmds.c` | Utilise un objet/inventaire nomme. | Porte full-game. |
| `drop` | `game/g_cmds.c` | Jette un objet/inventaire nomme. | Porte full-game. |
| `give` | `game/g_cmds.c` | Donne objets, munitions, armes, sante; `give all` existe bien dans l'original. | Porte full-game (`packages/game/src/g_cmds.ts`). |
| `god` | `game/g_cmds.c` | Active/desactive l'invulnerabilite. | Porte full-game. |
| `notarget` | `game/g_cmds.c` | Les monstres ignorent le joueur. | Porte full-game. |
| `noclip` | `game/g_cmds.c` | Active/desactive le passage a travers les collisions. | Porte full-game. |
| `inven` | `game/g_cmds.c` | Ouvre/ferme l'inventaire. | Porte full-game. |
| `invnext` | `game/g_cmds.c` | Selectionne l'objet suivant. | Porte full-game. |
| `invprev` | `game/g_cmds.c` | Selectionne l'objet precedent. | Porte full-game. |
| `invnextw` | `game/g_cmds.c` | Selectionne l'arme suivante dans l'inventaire. | Porte game package; pas enregistre comme commande client directe. |
| `invprevw` | `game/g_cmds.c` | Selectionne l'arme precedente dans l'inventaire. | Porte game package; pas enregistre comme commande client directe. |
| `invnextp` | `game/g_cmds.c` | Selectionne le powerup suivant. | Porte game package; pas enregistre comme commande client directe. |
| `invprevp` | `game/g_cmds.c` | Selectionne le powerup precedent. | Porte game package; pas enregistre comme commande client directe. |
| `invuse` | `game/g_cmds.c` | Utilise l'objet actuellement selectionne. | Porte full-game. |
| `invdrop` | `game/g_cmds.c` | Jette l'objet actuellement selectionne. | Porte full-game. |
| `weapprev` | `game/g_cmds.c` | Arme precedente. | Porte full-game. |
| `weapnext` | `game/g_cmds.c` | Arme suivante. | Porte full-game. |
| `weaplast` | `game/g_cmds.c` | Revient a la derniere arme. | Porte game package; pas enregistre comme commande client directe. |
| `kill` | `game/g_cmds.c` | Suicide du joueur apres delai minimal de spawn. | Porte full-game. |
| `putaway` | `game/g_cmds.c` | Ferme inventaire/score/help. | Porte game package; pas enregistre comme commande client directe. |
| `wave` | `game/g_cmds.c` | Animation de geste joueur. | Porte full-game. |
| `playerlist` | `game/g_cmds.c` | Liste detaillee des joueurs. | Porte game package; pas enregistre comme commande client directe. |
| commande inconnue | `game/g_cmds.c` | Dans l'original, devient un message chat (`Cmd_Say_f(..., arg0=true)`). | Porte. C'est pourquoi `fly` affiche `Player: fly`. |
| `fly` | absent de `game/g_cmds.c` | Aucune commande `fly` dans ce code original; seulement des usages internes de `MOVETYPE_FLY`. | Original absent. |

## Commandes operateur serveur

| Commande | Source C | Role original | Etat portage |
| --- | --- | --- | --- |
| `heartbeat` | `server/sv_ccmds.c` | Force un heartbeat vers le master server. | Porte package serveur; effet master adapte/local. |
| `kick` | `server/sv_ccmds.c` | Expulse un client. | Porte package serveur. |
| `status` | `server/sv_ccmds.c` | Affiche l'etat serveur et les clients. | Porte package serveur. |
| `serverinfo` | `server/sv_ccmds.c` | Affiche les infos serveur. | Porte package serveur. |
| `dumpuser` | `server/sv_ccmds.c` | Affiche la userinfo d'un client. | Porte package serveur. |
| `map` | `server/sv_ccmds.c` | Lance une map avec killserver/precache. | Porte full-game/serveur. |
| `demomap` | `server/sv_ccmds.c` | Lance une map demo. | Porte package serveur. |
| `gamemap` | `server/sv_ccmds.c` | Change de map avec transition sauvegardee. | Porte full-game/serveur. |
| `setmaster` | `server/sv_ccmds.c` | Configure les master servers. | Porte package serveur, limite par contexte Web. |
| `say` | `server/sv_ccmds.c` | Message console serveur vers tous les joueurs, seulement dedie. | Porte package serveur conditionnel. |
| `serverrecord` | `server/sv_ccmds.c` | Demarre une demo serveur. | Porte package serveur. |
| `serverstop` | `server/sv_ccmds.c` | Stoppe la demo serveur. | Porte package serveur. |
| `save` | `server/sv_ccmds.c` | Sauvegarde la partie. | Porte package serveur; exposition full-game depend du chemin serveur actif. |
| `load` | `server/sv_ccmds.c` | Charge une sauvegarde. | Porte package serveur; exposition full-game depend du chemin serveur actif. |
| `killserver` | `server/sv_ccmds.c` | Arrete le serveur. | Porte full-game/serveur. |
| `sv` | `server/sv_ccmds.c` | Transmet une sous-commande au module game (`ServerCommand`). | Porte package serveur. |

## Sous-commandes `sv` du module game

Ces commandes ne sont pas des commandes console directes: elles passent par `sv <sous-commande>`.

| Sous-commande | Source C | Role original | Etat portage |
| --- | --- | --- | --- |
| `test` | `game/g_svcmds.c` | Commande de test serveur game. | Porte package game. |
| `addip` | `game/g_svcmds.c` | Ajoute un filtre IP. | Porte package game. |
| `removeip` | `game/g_svcmds.c` | Retire un filtre IP. | Porte package game. |
| `listip` | `game/g_svcmds.c` | Liste les filtres IP. | Porte package game. |
| `writeip` | `game/g_svcmds.c` | Ecrit la liste IP dans la config. | Porte package game avec callback d'ecriture. |

## Commandes protocole client vers serveur

Ces commandes sont recues par `server/sv_user.c` depuis le client; elles ne sont pas toutes destinees a etre tapees manuellement.

| Commande | Source C | Role original | Etat portage |
| --- | --- | --- | --- |
| `new` | `server/sv_user.c` | Debut de handshake client. | Porte package serveur. |
| `configstrings` | `server/sv_user.c` | Envoie les configstrings par paquets. | Porte package serveur. |
| `baselines` | `server/sv_user.c` | Envoie les baselines d'entites. | Porte package serveur. |
| `begin` | `server/sv_user.c` | Termine l'entree en jeu. | Porte package serveur. |
| `nextserver` | `server/sv_user.c` | Passe au serveur/map suivant apres cinematic/demo. | Porte package serveur. |
| `disconnect` | `server/sv_user.c` | Deconnecte le client cote serveur. | Porte package serveur. |
| `info` | `server/sv_user.c`, `client/cl_main.c` | Repond avec les infos serveur/protocole. | Porte package serveur; aussi forwardee cote client comme original. |
| `download` | `server/sv_user.c` | Demande un bloc de fichier. | Porte package serveur. |
| `nextdl` | `server/sv_user.c` | Demande le bloc suivant de telechargement. | Porte package serveur. |

## Commandes CTF presentes dans le depot original

Le dossier `quake-2-master/ctf` reprend les commandes base game et ajoute des commandes CTF. Elles ne font pas partie du module `game` de base utilise par le port full-game actuel.

| Commande | Source C | Role original | Etat portage |
| --- | --- | --- | --- |
| `steam` | `ctf/g_cmds.c` | Alias de `say_team`. | Non porte full-game base game. |
| `team` | `ctf/g_cmds.c` | Change/choisit l'equipe CTF. | Non porte full-game base game. |
| `id` | `ctf/g_cmds.c` | Active/desactive l'identification CTF. | Non porte full-game base game. |
| `yes` / `no` | `ctf/g_cmds.c` | Reponse vote/CTF. | Non porte full-game base game. |
| `ready` / `notready` | `ctf/g_cmds.c` | Etat pret en match CTF. | Non porte full-game base game. |
| `ghost` | `ctf/g_cmds.c` | Mode ghost CTF. | Non porte full-game base game. |
| `admin` | `ctf/g_cmds.c` | Commande admin CTF. | Non porte full-game base game. |
| `stats` | `ctf/g_cmds.c` | Statistiques CTF. | Non porte full-game base game. |
| `warp` | `ctf/g_cmds.c` | Warp/admin CTF. | Non porte full-game base game. |
| `boot` | `ctf/g_cmds.c` | Kick/admin CTF. | Non porte full-game base game. |
| `observer` | `ctf/g_cmds.c` | Mode observateur CTF. | Non porte full-game base game. |

## Commandes dependantes plateforme dans le C original

Ces commandes existent dans des backends OS/renderer du C original, pas dans le chemin Web/Three.js.

| Commande | Source C | Role original | Etat portage |
| --- | --- | --- | --- |
| `cd` | `win32/cd_win.c`, `linux/cd_linux.c` | Controle CD audio. | Remplace/adapte par le systeme audio Web; pas expose comme commande `cd`. |
| `+mlook` / `-mlook` | `win32/in_win.c`, `linux/rw_*.c`, `irix/glw_imp.c` | Active/desactive mouse look dans certains backends. | Non expose full-game; le Web utilise son propre chemin input/pointer lock. |
| `force_centerview` | `linux/rw_*.c`, `irix/glw_imp.c` | Recentre la vue depuis backend renderer/input. | Non expose full-game; `centerview` existe cote client. |
| `joy_advancedupdate` | `win32/in_win.c` | Recalcule la configuration joystick Win32. | Non porte Web. |
| `vid_restart` | `win32/vid_dll.c`, `linux/vid_so.c` | Redemarre la video/renderer. | Non expose full-game; Three.js/WebGL suit un autre cycle. |
| `vid_front` | `win32/vid_dll.c` | Force la fenetre Win32 au premier plan. | Non applicable Web. |
| `showmouse` / `hidemouse` | `rhapsody/in_next.m` | Affiche/cache le curseur sur Rhapsody/NeXT. | Non applicable Web. |
| `vid_scale`, `vid_mode`, `vid_size` | `rhapsody/vid_next.m` | Reglages video Rhapsody/NeXT. | Non applicable Web. |

## Commandes ajoutees par le port Web

Celles-ci ne viennent pas du C original, mais existent dans le port.

| Commande | Origine port | Role | Statut |
| --- | --- | --- | --- |
| `writeconfig` | `apps/web/src/full-game.ts` / client hooks | Ecrit `config.cfg` dans le stockage Web. | Specifique Web. |
| `newgame` | `apps/web/src/full-game.ts` | Lance une nouvelle partie depuis le bridge full-game. | Specifique Web. |

## Notes importantes

- `give all` est bien present dans le C original (`game/g_cmds.c::Cmd_Give_f`) et dans le port (`packages/game/src/g_cmds.ts::Cmd_Give_f`). Comme l'original, il ne produit pas forcement une ligne de confirmation console et ne selectionne pas automatiquement une arme.
- `fly` n'est pas une commande du C original base game dans ce depot. Quand elle est tapee, elle suit le comportement original des commandes inconnues du module game: elle est envoyee comme chat, d'ou une ligne du type `Player: fly`.
- Les commandes `score`, `help`, `players`, `playerlist`, `weaplast`, `putaway`, `invnextw`, `invprevw`, `invnextp` et `invprevp` sont des commandes `ClientCommand` cote module game. Elles ne sont pas toutes enregistrees comme commandes client directes dans `client/cl_main.c`, ce qui correspond aussi au decoupage original.
- Les commandes renderer C (`imagelist`, `screenshot`, `modellist`, `gl_strings`) sont liees aux backends `ref_gl`/`ref_soft`. Dans le port Web, le renderer Three.js n'expose pas encore ces commandes via le chemin `full-game.html`.
