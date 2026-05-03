# Progress - Quake-2-master/game/game.h

## Session 2026-05-03

Lot traite:
- `GAME_API_VERSION`
- `SVF_NOCLIENT`
- `SVF_DEADMONSTER`
- `SVF_MONSTER`
- `solid_t`

Verdict:
- `Valide` pour les 5 entites.

Preuves:
- Source C/H lue dans `Quake-2-master/game/game.h`.
- Port TS proprietaire lu dans `packages/game/src/game.ts` et `packages/game/src/runtime.ts`.
- `GAME_API_VERSION` conserve la valeur C `3` dans `packages/game/src/game.ts`.
- `SVF_NOCLIENT`, `SVF_DEADMONSTER` et `SVF_MONSTER` conservent les valeurs C `0x00000001`, `0x00000002`, `0x00000004` via `1 << 0`, `1 << 1`, `1 << 2` dans `packages/game/src/runtime.ts`, puis sont reexportes par `packages/game/src/game.ts` et `packages/game/src/index.ts`.
- `solid_t` conserve `SOLID_NOT=0`, `SOLID_TRIGGER=1`, `SOLID_BBOX=2`, `SOLID_BSP=3` dans `packages/game/src/game.ts`, adosse aux constantes runtime equivalentes.
- Commentaires d'en-tete verifies pour `GAME_API_VERSION` et `solid_t` dans `packages/game/src/game.ts`. Les macros `SVF_*` sont des constantes runtime reexportees; pas de commentaire de fonction applicable.

Integration:
- Runtime: OK. `GAME_API_VERSION` est controle par `SV_InitGameProgs` dans `packages/server/src/sv_game.ts`; les `SVF_*` et `SOLID_*` sont utilises par les flux gameplay/serveur normaux, notamment monstres, triggers, linking, collision et emission de snapshots.
- `apps/web`: OK indirectement. `apps/web/src/full-game-server-host.ts` instancie le runtime serveur via `GetGameApiFunction`; le host consomme les snapshots et ne remplace pas ces constantes par une logique parallele.
- `renderer-three`: OK indirectement. Ces entites ne produisent pas directement de modele, image, particule, beam, dlight, temp entity, areabits, camera ou scene; elles gouvernent la presence/solidite serveur, ensuite consommee via les snapshots et frames client. `verify:full-game:three-renderer` couvre le flux renderer full-game.

Tests lances:
- `npm run verify:game:header` OK
- `npm run verify:server:game` OK
- `npm run verify:g-monster` OK
- `npm run verify:full-game:server-host` OK
- `npm run verify:full-game:three-renderer` OK
- `npm run verify:server:world` KO avant exercice du lot: import manquant `packages/formats/src/bsp.js` dans le harness
- `npm run verify:server:ents` KO avant exercice du lot: meme import manquant
- `npm run verify:server:send` KO avant exercice du lot: meme import manquant

Corrections:
- Aucune correction TS necessaire.
- Matrice `audit-portage/validation-incrementale/validation/matrices/game_game.h.md` mise a jour pour le lot.

Prochain lot recommande:
- `link_s`, puis `MAX_ENT_CLUSTERS` si le lot reste petit.

## Session 2026-05-03 - link_s / MAX_ENT_CLUSTERS

Lot traite:
- `link_s`
- `MAX_ENT_CLUSTERS`

Verdict:
- `Valide` pour les 2 entites.

Preuves:
- Source C/H lue dans `Quake-2-master/game/game.h`: `struct link_s` contient uniquement les pointeurs `prev` et `next`, puis est typedef en `link_t`; `MAX_ENT_CLUSTERS` vaut `16` et dimensionne `edict_t.clusternums`.
- Port TS proprietaire lu dans `packages/game/src/game.ts` et `packages/game/src/runtime.ts`.
- `packages/game/src/game.ts` expose maintenant `link_s = GameAreaLink` et conserve `link_t = link_s`, ce qui represente le tag struct C et son typedef.
- `GameAreaLink` conserve les champs `prev` et `next`, nullable pour l'etat detache initial.
- `MAX_ENT_CLUSTERS` conserve la valeur C `16`; `createRuntimeEntity` initialise `clusternums` avec une capacite `16`, verifiee contre la constante exportee.
- Commentaires d'en-tete verifies et ajoutes/mis a jour dans `packages/game/src/game.ts` pour `link_s`, `link_t` et `MAX_ENT_CLUSTERS`.

Integration:
- Runtime: OK. `link_s`/`link_t` est represente par `GameEntity.area`, initialise detache, puis gere avec le linking runtime (`linkGameEntity`/`unlinkGameEntity`) et les callbacks serveur `SV_LinkEdict`/`SV_UnlinkEdict`. `MAX_ENT_CLUSTERS` dimensionne la capacite runtime de `clusternums`, consommee par `SV_LinkEdict` et `SV_BuildClientFrame` pour le filtrage PVS/areabits.
- `apps/web`: OK indirectement. Le host full-game appelle le game API porte, relaie `linkentity`/`unlinkentity` au serveur local et consomme les snapshots produits; aucune logique web parallele ne remplace `link_s` ou la capacite de clusters.
- `renderer-three`: OK indirectement. Le lot ne produit pas directement modeles, frames, images, particules, beams, dlights, temp entities, camera ou scene. Il conditionne toutefois les entites visibles et areabits serveur; ces sorties sont consommees via snapshots/client frames puis par `renderer-three` (`refdef.entities`, `areabits`, scene world/brush models).

Tests lances:
- `npm run verify:game:header` OK
- `npm run verify:server:game` OK
- `npm run verify:server:world` OK
- `npm run verify:server:ents` OK
- `npm run verify:server:send` OK
- `npm run verify:full-game:server-host` OK
- `npm run verify:full-game:three-renderer` OK
- `npm run typecheck` OK

Corrections:
- `packages/game/src/game.ts`: ajout de l'alias exporte `link_s` et conservation de `link_t` comme alias du tag source.
- `scripts/verify/quake2-game-header.ts`: preuve ajoutee pour la forme `link_s`/`link_t`, l'etat detache, la reference `prev` et le stockage `Int32Array` de `clusternums`.
- Matrice `audit-portage/validation-incrementale/validation/matrices/game_game.h.md` mise a jour pour le lot.

Prochain lot recommande:
- `gclient_s`, puis ses champs `ps` et `ping` si le lot reste petit.

## Session 2026-05-03 - gclient_s / ps / ping

Lot traite:
- `gclient_s`
- `ps`
- `ping`

Verdict:
- `Valide` pour les 3 entites.

Preuves:
- Source C/H lue dans `Quake-2-master/game/game.h`: `struct gclient_s` expose le prefixe serveur `player_state_t ps`, puis `int ping`, avant l'extension libre du game DLL.
- Port TS proprietaire lu dans `packages/game/src/game.ts` et `packages/game/src/runtime.ts`.
- `packages/game/src/game.ts` expose maintenant `gclient_s = GameClient` et conserve `gclient_t = gclient_s`, ce qui represente le tag struct C et son typedef.
- `GameClientServerFields.ps` et `GameClientServerFields.ping` exposent explicitement le prefixe serveur; `createGameClient()` initialise `ps` avec `createPlayerState()` et `ping` a `0`.
- Commentaires d'en-tete verifies et mis a jour dans `packages/game/src/game.ts` pour `gclient_s` et `gclient_t`. `ps` et `ping` sont des champs de struct, pas des fonctions; pas de commentaire de fonction applicable.

Integration:
- Runtime: OK. `gclient_s.ps` est modifie par les flux gameplay `ClientThink`, `ClientBeginServerFrame`, HUD, armes et chase, puis clone et serialize par `SV_BuildClientFrame`/`SV_WritePlayerstateToClient`; `ping` est utilise par les scoreboards et commandes serveur.
- `apps/web`: OK indirectement. `apps/web/src/full-game-server-host.ts` cree le client runtime avec `createGameClient()` et transmet les commandes utilisateur au game API porte; le rendu web consomme ensuite les snapshots/playerstate produits, sans remplacer la logique runtime principale.
- `renderer-three`: OK indirectement. `ps` produit des sorties visibles de camera, view blend, HUD stats et weapon model via playerstate/refdef; ces sorties sont consommees par le pipeline client puis `packages/renderer-three` (`refreshFrame.view`, view weapon, polyblend). `ping` ne produit aucune sortie renderer directe.

Tests lances:
- `npm run verify:game:header` OK
- `npm run verify:server:game` OK
- `npm run verify:full-game:server-host` OK
- `npm run verify:full-game:three-renderer` OK
- `npm run typecheck` OK

Corrections:
- `packages/game/src/game.ts`: ajout de l'alias exporte `gclient_s` et conservation de `gclient_t` comme alias du tag source.
- `scripts/verify/quake2-game-header.ts`: preuves ajoutees pour l'alias `gclient_s`, le typedef `gclient_t`, et les champs serveur `ps`/`ping`.
- Matrice `audit-portage/validation-incrementale/validation/matrices/game_game.h.md` mise a jour pour le lot.

Prochain lot recommande:
- `edict_s`, puis `s`, `client` et `inuse` si le lot reste petit.

## Session 2026-05-03 - edict_s / s / client / inuse

Lot traite:
- `edict_s`
- `s`
- `client`
- `inuse`

Verdict:
- `Valide` pour les 4 entites.

Preuves:
- Source C/H lue dans `Quake-2-master/game/game.h`: `typedef struct edict_s edict_t`, puis `struct edict_s` commence par `entity_state_t s`, `struct gclient_s *client` et `qboolean inuse`.
- Port TS proprietaire lu dans `packages/game/src/game.ts` et `packages/game/src/runtime.ts`.
- `packages/game/src/game.ts` expose maintenant `edict_s = GameEntity` et conserve `edict_t = edict_s`, ce qui represente le tag struct C et son typedef.
- `GameEdictServerFields.s`, `GameEdictServerFields.client` et `GameEdictServerFields.inuse` exposent explicitement le prefixe serveur.
- `createRuntimeEntity()` initialise `s` avec `entity_state_t` numerote et positionne, `client` a `null`, et `inuse` a `true`; `attachGameClient()` remplit le pointeur client runtime.
- Commentaires d'en-tete verifies et mis a jour dans `packages/game/src/game.ts` pour `edict_s` et `edict_t`. `s`, `client` et `inuse` sont des champs de struct, pas des fonctions; pas de commentaire de fonction applicable.

Integration:
- Runtime: OK. `edict_s.s` est alimente par les spawn/runtime/linking, puis clone et serialize par `SV_CreateBaseline`, `SV_BuildClientFrame` et `MSG_WriteDeltaEntity`; `client` est attache aux edicts joueurs par le serveur et consomme par les callbacks game/client; `inuse` filtre frames, traces, BoxEdicts, commandes serveur, free/spawn et snapshots.
- `apps/web`: OK indirectement. Le host full-game instancie le game API porte et consomme les snapshots/playerstate/resultats serveur produits par les edicts; aucune logique web parallele ne remplace `s`, `client` ou `inuse`.
- `renderer-three`: OK indirectement. `s` produit des sorties visibles d'entites, modeles, frames, sons/evenements et positions via les snapshots; `client` alimente playerstate/camera/HUD; `inuse` controle la presence des entites dans les frames. Ces sorties sont consommees par le pipeline client puis `packages/renderer-three` pour `refdef.entities`, camera et scene.

Tests lances:
- `npm run verify:game:header` OK
- `npm run verify:server:game` OK
- `npm run verify:server:ents` OK
- `npm run verify:server:world` OK
- `npm run verify:server:send` OK
- `npm run verify:full-game:server-host` OK
- `npm run verify:full-game:three-renderer` OK
- `npm run typecheck` OK

Corrections:
- `packages/game/src/game.ts`: ajout de l'alias exporte `edict_s` et conservation de `edict_t` comme alias du tag source.
- `scripts/verify/quake2-game-header.ts`: preuves ajoutees pour `edict_s`, `edict_t`, `GameEdictServerFields.s`, `client` et `inuse`.
- Matrice `audit-portage/validation-incrementale/validation/matrices/game_game.h.md` mise a jour pour le lot, avec ajout de la ligne `client` manquante.

Prochain lot recommande:
- `linkcount`, puis `area`, `num_clusters` et `clusternums` si le lot reste coherent.

## Session 2026-05-03 - linkcount / area / num_clusters / clusternums

Lot traite:
- `linkcount`
- `area`
- `num_clusters`
- `clusternums`

Verdict:
- `Valide` pour les 4 entites.

Preuves:
- Source C/H lue dans `Quake-2-master/game/game.h`: `struct edict_s` expose `int linkcount`, `link_t area`, `int num_clusters` et `int clusternums[MAX_ENT_CLUSTERS]`.
- Port TS proprietaire lu dans `packages/game/src/game.ts` et `packages/game/src/runtime.ts`.
- `GameEdictServerFields.linkcount`, `area`, `num_clusters` et `clusternums` exposent explicitement le prefixe serveur de `edict_s`; `GameEntity` conserve les memes champs runtime.
- `createRuntimeEntity()` initialise `linkcount` a `0`, `area` comme lien detache `{ prev: null, next: null }`, `num_clusters` a `0` et `clusternums` en `Int32Array(16)`.
- `SV_LinkEdict` cote serveur TS recalcule les leafs/areas/clusters, ecrit `clusternums`, passe `num_clusters` a `-1` quand il faut utiliser `headnode`, incremente `linkcount`, puis insere `area` dans les listes solid/trigger. Le helper gameplay `linkGameEntity()` conserve aussi l'increment Quake II de `linkcount`.
- `SV_BuildClientFrame` consomme `num_clusters` et `clusternums` pour le filtrage PVS/PHS des entites visibles; `SV_AreaEdicts` consomme les liens `area`.
- Commentaires d'en-tete verifies dans `packages/game/src/game.ts` pour `edict_s`, `edict_t` et `GameEdictServerFields`. Le lot contient des champs de struct, pas des fonctions; pas de commentaire de fonction applicable.

Integration:
- Runtime: OK. Les champs sont atteignables via `SV_Frame`/snapshots serveur et les callbacks game `gi.linkentity`/`gi.unlinkentity`; ils sont aussi utilises par `G_RunFrame` indirectement via les appels gameplay a `linkGameEntity` et les comparaisons `groundentity_linkcount`.
- `apps/web`: OK indirectement. `apps/web/src/full-game-server-host.ts` instancie le serveur full-game et appelle le game API porte; les snapshots produits par `SV_BuildClientFrame` sont consommes par le flux web sans logique parallele pour ces champs.
- `renderer-three`: OK indirectement. `linkcount` et `area` ne produisent pas directement une sortie visible. `num_clusters`/`clusternums` conditionnent les entites visibles et les areabits transmis au client; le pipeline client place `areabits`/`refdef.entities` dans la refdef, puis `packages/renderer-three` les consomme pour les entites de scene et la visibilite world/leaf.

Tests lances:
- `npm run verify:game:header` OK
- `npm run verify:server:world` OK
- `npm run verify:server:ents` OK
- `npm run verify:server:send` OK
- `npm run verify:full-game:server-host` OK
- `npm run verify:full-game:three-renderer` OK
- `npm run typecheck` OK

Corrections:
- `scripts/verify/quake2-game-header.ts`: assertions ajoutees pour `linkcount`, le stockage mutable `area`, `num_clusters` et l'ecriture dans `clusternums`.
- Matrice `audit-portage/validation-incrementale/validation/matrices/game_game.h.md` mise a jour pour le lot.

Prochain lot recommande:
- `headnode`, puis `svflags`, `solid`, `clipmask` et `owner` si le lot reste coherent.

## Session 2026-05-03 - headnode / svflags / solid / clipmask / owner

Lot traite:
- `headnode`
- `svflags`
- `solid`
- `clipmask`
- `owner`

Verdict:
- `Valide` pour les 5 entites.

Preuves:
- Source C/H lue dans `Quake-2-master/game/game.h`: `struct edict_s` expose `int headnode`, `int svflags`, `solid_t solid`, `int clipmask` et `edict_t *owner` dans le prefixe serveur.
- Port TS proprietaire lu dans `packages/game/src/game.ts` et `packages/game/src/runtime.ts`.
- `GameEdictServerFields.headnode`, `svflags`, `solid`, `clipmask` et `owner` exposent explicitement le prefixe serveur de `edict_s`; `GameEntity` conserve les memes champs runtime.
- `createRuntimeEntity()` initialise `headnode` a `0`, `svflags` a `0`, `solid` a `SOLID_NOT`, `clipmask` a `0` et `owner` a `null`, comme le stockage C zero-initialise.
- `SV_LinkEdict` ecrit `headnode` quand `num_clusters` passe a `-1`, encode `solid` vers `entity_state_t.solid`, filtre `SVF_DEADMONSTER` et insere les entites selon leur solidite. `SV_BuildClientFrame` filtre `SVF_NOCLIENT`, utilise `headnode` via `CM_HeadnodeVisible`, et masque `state.solid` pour les projectiles appartenant au client courant. `SV_ClipMoveToEntities` applique les exclusions `owner`/`passedict->owner`, `SVF_DEADMONSTER`, `SVF_MONSTER`, `solid` et `clipmask` est consomme par les mouvements gameplay via `SV_Trace`/`gi.trace`.
- Commentaires d'en-tete verifies dans `packages/game/src/game.ts` pour `edict_s`, `edict_t` et `GameEdictServerFields`. Le lot contient des champs de struct, pas des fonctions; pas de commentaire de fonction applicable.

Integration:
- Runtime: OK. Les champs sont atteignables depuis `SV_Frame`/snapshots serveur et depuis `G_RunFrame` via les callbacks `gi.linkentity`, `gi.trace`, mouvements gameplay, projectiles, monstres, triggers et ownership.
- `apps/web`: OK indirectement. `apps/web/src/full-game-server-host.ts` instancie le serveur full-game et consomme les snapshots/resultats produits par le runtime porte; aucune logique web parallele ne remplace ces champs.
- `renderer-three`: OK indirectement. `svflags`/`solid`/`owner` conditionnent la presence, la prediction et la solidite des entites dans les snapshots; `headnode` conditionne la visibilite PVS/PHS. Les sorties visibles produites (`refdef.entities`, modeles brush, solidite de prediction, scene) sont consommees par le pipeline client puis `packages/renderer-three`. `clipmask` ne produit pas de sortie renderer directe mais influence les traces runtime qui produisent positions/evenements visibles.

Tests lances:
- `npm run verify:game:header` OK
- `npm run verify:server:world` OK
- `npm run verify:server:ents` OK
- `npm run verify:server:send` OK
- `npm run verify:full-game:server-host` OK
- `npm run verify:full-game:three-renderer` OK
- `npm run typecheck` OK

Corrections:
- `scripts/verify/quake2-game-header.ts`: assertions ajoutees pour l'aliasing et les valeurs initiales de `headnode`, `svflags`, `solid`, `clipmask` et `owner`.
- Matrice `audit-portage/validation-incrementale/validation/matrices/game_game.h.md` mise a jour pour le lot.

Prochain lot recommande:
- `game_import_t`, a traiter seul ou avec une petite famille de callbacks si le lot reste lisible.

## Session 2026-05-03 - game_import_t

Lot traite:
- `game_import_t`

Verdict:
- `Valide` pour `game_import_t`.

Preuves:
- Source C/H lue dans `Quake-2-master/game/game.h`: le `typedef struct game_import_t` declare 44 callbacks engine vers gameplay, couvrant messages, configstrings, indices assets, collision/visibility, linking, Pmove, messages reseau, allocation zone, cvars, arguments de commande, injection console et DebugGraph.
- Port TS proprietaire lu dans `packages/game/src/game.ts`: `interface game_import_t` expose les 44 noms originaux avec types alignes sur les entrees/sorties C; les pointeurs C deviennent callbacks TS, les pointeurs nullable vers `edict_t` sont representes par `edict_t | null`, les buffers/listes C par tableaux TS, et `TagMalloc` retourne `unknown` cote contrat.
- Commentaire d'en-tete verifie dans `packages/game/src/game.ts` pour `game_import_t`: `Original name`, `Source`, `Category: Ported`, `Fidelity level: Strict` et comportement presents.
- Branchement runtime verifie dans `packages/server/src/sv_game.ts`: `SV_InitGameProgs` construit la table `imports: game_import_t`, branche chaque callback sur les procedures serveur/engine correspondantes, appelle `GetGameApiFunction(imports)`, controle `GAME_API_VERSION`, assigne `ge`, puis appelle `ge.Init()`.
- Harness `scripts/verify/quake2-sv-game.ts` exerce la table capturee pendant cette session: print, center/unicast, configstring loading/game, sound/positioned_sound, link/unlink, BoxEdicts, trace, pointcontents, Write*, allocation, cvars, argc/argv/args, AddCommandString, DebugGraph, AreasConnected, SetAreaPortalState, inPVS/inPHS et error.
- Harness `scripts/verify/quake2-game-header.ts` complete avec une preuve typee de la liste exhaustive des 44 cles `keyof game_import_t`.

Integration:
- Runtime: OK. `game_import_t` est atteignable depuis le flux serveur normal via `SV_InitGameProgs`, puis consomme par `GetGameApi`/`G_RunFrame`/callbacks gameplay pour ecrire configstrings, snapshots, sons, temp entities, collisions, Pmove, commandes et prints.
- `apps/web`: OK. `apps/web/src/full-game-server-host.ts` instancie le runtime serveur porte, fournit `getGameApi: (imports) => GetGameApiFunction(imports, ...)`, et cree un runtime gameplay backe par `imports.trace`, `imports.pointcontents`, `imports.linkentity`, `imports.unlinkentity` et `imports.imageindex`; aucune logique web parallele ne remplace la table d'import principale.
- `renderer-three`: OK indirectement. `game_import_t` ne rend rien directement, mais ses callbacks produisent des sorties visibles attendues: configstrings de modeles/images/sons, entites linkees, sounds, temp entities, muzzleflashes, areabits et snapshots. Ces sorties passent par le client full-game puis sont consommees par `packages/renderer-three` via `refreshFrame.entities`, brush models/configstrings, particules, beams, dlights, areabits, camera et scene.

Tests lances:
- `npm run verify:game:header` OK
- `npm run verify:server:game` OK
- `npm run verify:full-game:server-host` OK
- `npm run verify:full-game:three-renderer` OK
- `npm run typecheck` OK

Corrections:
- `scripts/verify/quake2-game-header.ts`: ajout d'une preuve typee des 44 callbacks de `game_import_t`.
- Matrice `audit-portage/validation-incrementale/validation/matrices/game_game.h.md` mise a jour pour le lot.

Prochain lot recommande:
- `game_export_t`, puis `apiversion` si le lot reste petit.

## Session 2026-05-03 - game_export_t

Lot traite:
- `game_export_t`

Verdict:
- `Valide` pour `game_export_t`.

Preuves:
- Source C/H lue dans `Quake-2-master/game/game.h`: le `typedef struct game_export_t` declare `apiversion`, les callbacks `Init`, `Shutdown`, `SpawnEntities`, `WriteGame`, `ReadGame`, `WriteLevel`, `ReadLevel`, `ClientConnect`, `ClientBegin`, `ClientUserinfoChanged`, `ClientDisconnect`, `ClientCommand`, `ClientThink`, `RunFrame`, `ServerCommand`, puis les globals partages `edicts`, `edict_size`, `num_edicts` et `max_edicts`.
- Port TS proprietaire lu dans `packages/game/src/game.ts`: `interface game_export_t` expose les 20 noms originaux, avec pointeurs de fonctions C modelises en callbacks TS, `edict_t[]` pour le tableau `edicts`, et getters runtime acceptes par le contrat pour `num_edicts`/`max_edicts`.
- Commentaire d'en-tete verifie dans `packages/game/src/game.ts` pour `game_export_t`: `Original name`, `Source`, `Category: Ported`, `Fidelity level: Strict` et comportement presents.
- `scripts/verify/quake2-game-header.ts` complete avec une preuve typee exhaustive des 20 cles `keyof game_export_t`.
- `scripts/verify/quake2-g-main.ts` exerce la table produite par `GetGameApi`: version API, callbacks d'init/spawn/save/client/server/frame, `edicts`, `num_edicts` et `max_edicts`.
- `scripts/verify/quake2-sv-game.ts` exerce le branchement serveur: `SV_InitGameProgs` recupere la table exportee, verifie `apiversion`, copie les descripteurs/getters et appelle `Init`.

Integration:
- Runtime: OK. `game_export_t` est atteint depuis `SV_InitGameProgs`, puis ses callbacks sont appeles par les flux serveur normaux: init/shutdown, map loading, saves, connexions client, commandes, `SV_Frame`/`RunFrame`, snapshots et edict helpers.
- `apps/web`: OK. `apps/web/src/full-game-server-host.ts` cree un placeholder compatible puis remplace/encapsule la table via `GetGameApiFunction`; le host full-game declenche les callbacks serveur et consomme les sorties runtime sans logique parallele masquant le game export principal.
- `renderer-three`: OK indirectement. `game_export_t` ne rend rien directement, mais ses callbacks produisent les sorties visibles attendues: edicts/snapshots, modeles, frames, configstrings images/sons, temp entities, sons, areabits, camera/playerstate et scene. Le pipeline full-game les transmet au client puis `packages/renderer-three` les consomme.

Tests lances:
- `npm run verify:game:header` OK
- `npm run verify:g-main` OK
- `npm run verify:server:game` OK
- `npm run verify:full-game:server-host` OK
- `npm run verify:full-game:three-renderer` OK
- `npm run typecheck` OK

Corrections:
- `scripts/verify/quake2-game-header.ts`: ajout d'une preuve typee des 20 champs/callbacks de `game_export_t`.
- Matrice `audit-portage/validation-incrementale/validation/matrices/game_game.h.md` mise a jour pour le lot.

Prochain lot recommande:
- `apiversion` seul, puis `edict_size`, `num_edicts` et `max_edicts` dans un lot separe si coherent.
