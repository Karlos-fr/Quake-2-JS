Priorité Haute

win32/vid_dll.c (line 116)
Sert de couche vidéo principale côté client Win32. Il initialise les cvars vidéo, charge/décharge le renderer (ref_soft.dll, ref_gl.dll), fournit l’interface refimport_t au renderer, gère VID_CheckChanges, VID_Init, VID_Shutdown, les changements de mode, le focus de l’application, et une partie du mapping clavier Win32.
Très bon candidat de portage moteur, avec les appels DLL/fenêtre transformés en hooks renderer/web.

win32/in_win.c (line 346)
Backend input Win32. Il gère souris, capture curseur, +mlook, filtrage souris, transformation du mouvement souris en usercmd_t, activation/désactivation selon le focus, joystick, boutons, POV, axes avancés et cvars joy_*.
Intéressant car la logique de mouvement Quake II doit rester fidèle, même si les événements bruts viennent du navigateur.

win32/q_shwin.c (line 41)
Glue système bas niveau Win32 partagée. Il fournit l’allocation hunk (Hunk_Begin, Hunk_Alloc, Hunk_End, Hunk_Free), le temps moteur (Sys_Milliseconds), création de dossiers, et recherche de fichiers (Sys_FindFirst/Next/Close).
Beaucoup est déjà représenté dans packages/qcommon/src/system.ts; il mérite surtout une passe de validation/fermeture.

Priorité Moyenne

win32/snd_win.c (line 593)
Backend audio Win32. Il initialise DirectSound ou waveOut, expose le tampon DMA utilisé par le mixeur Quake II, calcule la position courante de lecture, verrouille/déverrouille le buffer audio, soumet les blocs sonores, et réagit au focus via S_Activate.
Utile pour vérifier que le backend Web Audio respecte bien la logique DMA attendue par snd_dma.c/snd_mix.c.

win32/net_wins.c (line 103)
Backend réseau WinSock. Il convertit les adresses Quake II en sockets, parse les adresses texte, compare les adresses, gère les paquets loopback local client/serveur, ouvre les sockets UDP/IPX, envoie/reçoit des paquets et configure le réseau selon solo/multijoueur.
Déjà largement porté dans qcommon; utile pour audit de fidélité et futur backend navigateur.

win32/qgl_win.c (line 3030)
Chargeur dynamique OpenGL Win32. Il charge opengl32.dll ou un autre driver, résout toutes les fonctions qgl*, expose QGL_Init/QGL_Shutdown, et contient un système de logging des appels GL.
Le chargement DLL n’est pas utile web, mais l’inventaire QGL et le logging sont de bonnes références.

win32/glw_imp.c (line 347)
Couche fenêtre/WGL du renderer OpenGL Win32. Elle crée la fenêtre, choisit le pixel format, initialise le contexte OpenGL, gère fullscreen, swap buffers, début/fin de frame, shutdown et activation de l’application.
À utiliser comme référence pour les hooks GLimp_* du renderer web, pas comme logique moteur directe.

Priorité Basse

win32/cd_win.c (line 435)
Backend CD audio Win32. Il contrôle le lecteur CD via MCI : lecture de pistes, pause, reprise, stop, eject, info disque, commande console cd, boucle audio et activation/désactivation.
Utile seulement si on veut reproduire l’API CD audio originale avec des fichiers audio numériques côté web.

win32/rw_imp.c (line 118)
Couche Win32 du renderer software. Elle crée la fenêtre software, choisit DIB/DirectDraw, initialise le framebuffer software, présente les frames, applique la palette, et gère activation/shutdown.
Pertinent seulement pour un vrai port du renderer software original.

win32/rw_dib.c (line 88)
Backend DIB pour le renderer software. Il crée une DIB section, gère le framebuffer 8-bit, applique la palette, sauvegarde/restaure certaines couleurs système Windows.
Peu utile avec le rendu Three.js, mais référence pour un framebuffer palettisé logiciel.

win32/rw_ddraw.c (line 42)
Backend DirectDraw du renderer software. Il initialise DirectDraw, crée surfaces primaires/backbuffer, gère fullscreen/palette et copie l’image software vers l’écran.
Même intérêt que rw_dib.c : utile uniquement pour renderer software fidèle.

win32/rw_win.h (line 60)
Header commun du renderer software Win32. Il déclare l’état fenêtre/framebuffer software et les fonctions DIB/DirectDraw.
À consulter si rw_imp.c, rw_dib.c ou rw_ddraw.c sont portés.

À Ignorer / Très Faible Intérêt

q2.aps, winquake.aps
Fichiers temporaires/projet Visual Studio générés par l’éditeur de ressources.

q2.ico, qe3.ico
Icônes d’application Windows historiques.

q2.rc, winquake.rc, resource.h
Scripts et IDs de ressources Windows : icônes, dialogues, métadonnées de build. Peu pertinents pour le navigateur.

win32/conproc.c (line 84) / win32/conproc.h (line 22)
Support de console externe/QHOST sous Windows via mémoire partagée. Sert à lire/écrire la console d’un processus hôte.
À ignorer sauf si tu veux reproduire une console externe de debug.

win32/winquake.h (line 28)
Header Win32 global : fenêtre principale, handles DirectSound, état focus/minimized, constantes de style fenêtre.
Utile comme index de dépendances, pas comme port isolé.

win32/glw_win.h
Header privé de la couche GL Win32. Décrit les handles fenêtre/OpenGL et fonctions nécessaires à glw_imp.c.
À consulter seulement si on travaille sur glw_imp.c.

Ordre conseillé : vid_dll.c, puis in_win.c, puis fermeture/audit de q_shwin.c et net_wins.c, puis snd_win.c si on veut solidifier le son web.