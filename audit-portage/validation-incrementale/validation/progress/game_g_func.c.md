# Progress - Quake-2-master/game/g_func.c

## Dernier lot valide

- 2026-05-01: flags de porte secrete `SECRET_ALWAYS_SHOOT`, `SECRET_1ST_LEFT`, `SECRET_1ST_DOWN`, puis `door_secret_move1` et son doublon matriciel.
- Preuve: comparaison directe `Quake-2-master/game/g_func.c:1874-1900` avec `packages/game/src/g_func.ts:76-78,2090-2101` apres ajout du commentaire d'en-tete de `door_secret_move1`.
- Correction appliquee: commentaire d'en-tete `door_secret_move1` ajoute avec `Original name`, `Source`, `Category: Ported`, `Fidelity level: Strict` et comportement; couverture ciblee renforcee dans `scripts/verify/quake2-g-func.ts`.
- Effets verifies: `SECRET_ALWAYS_SHOOT` force les portes secretes ciblees a rester shootables, les portes sans `targetname` restent shootables par defaut, `SECRET_1ST_LEFT` inverse le premier deplacement lateral, `SECRET_1ST_DOWN` remplace ce premier deplacement par une descente, et `door_secret_move1` programme `nextthink = level.time + 1` avec `think = door_secret_move2`.
- Branchement: `SP_func_door_secret` est referencee par `packages/game/src/g_spawn.ts` pour `func_door_secret`, appelee par `ED_CallSpawn`/`SpawnEntities`; `door_secret_move1` est atteint par `door_secret_use`, lui-meme appele par triggers/use ou par `door_secret_die`, puis par le flux `Move_Calc`/`G_RunFrame`/`G_RunEntity`/`SV_RunThink`.
- Integration: aucune logique parallele `func_door_secret` dans `apps/web`; le navigateur consomme les snapshots runtime, sons et areabits. `packages/renderer-three` ne porte pas la logique gameplay de porte secrete, mais consomme les sorties visibles attendues via les brush models, positions/interpolations et scene/areabits; pas de correction renderer attendue pour ce lot.
- Tests: `npm run verify:g-func` OK; `npm run typecheck` OK; `npm run verify:g-spawn` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:web-render-order` OK.

- 2026-05-01: convoyeur brush `func_conveyor_use` et `SP_func_conveyor`.
- Preuve: comparaison directe `Quake-2-master/game/g_func.c:1819-1858` avec `packages/game/src/g_func.ts:2026-2054` apres ajout des commentaires d'en-tete.
- Correction appliquee: ajout des commentaires d'en-tete `func_conveyor_use` et `SP_func_conveyor` avec `Original name`, `Source`, `Category: Ported`, `Fidelity level: Strict`, comportement et notes d'adapter; couverture ciblee renforcee dans `scripts/verify/quake2-g-func.ts`.
- Effets verifies: `func_conveyor_use` conserve le toggle START_ON, `speed = 0` a l'arret, `speed = count` au redemarrage, clear du flag START_ON, set du flag START_ON, et clear de `count` hors TOGGLE; `SP_func_conveyor` conserve default `speed = 100`, stockage `count` et stop initial hors START_ON, callback `use`, `SOLID_BSP`, setmodel et link runtime.
- Branchement: `SP_func_conveyor` est referencee par `packages/game/src/g_spawn.ts` pour `func_conveyor`, appelee par `ED_CallSpawn`/`SpawnEntities`; `func_conveyor_use` est atteignable via triggers/G_UseTargets. Le mouvement courant du brush est porte par les champs runtime du conveyor et par le flux physique/snapshots normal.
- Integration: aucune logique parallele `func_conveyor` dans `apps/web`; le navigateur consomme les etats runtime local/full-game et les snapshots. `packages/renderer-three` ne porte pas la logique gameplay du convoyeur; il consomme les sorties visibles attendues via les brush models/scene issus des snapshots, donc pas de correction renderer attendue pour ce lot.
- Tests: `npm run verify:g-func` OK; `npm run typecheck` OK; `npm run verify:g-spawn` OK; `npm run verify:local-gameplay-sync` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:web-render-order` OK.

- 2026-05-01: timer de targets `func_timer_think`, `func_timer_use`, doublon matriciel `func_timer_think` et spawn `SP_func_timer`.
- Preuve: comparaison directe `Quake-2-master/game/g_func.c:1771-1816` avec `packages/game/src/g_func.ts:1950-2024` apres ajout des commentaires d'en-tete.
- Correction appliquee: ajout des commentaires d'en-tete `func_timer_think`, `func_timer_use` et `SP_func_timer` avec `Original name`, `Source`, `Category: Ported`, `Fidelity level: Strict`, comportement et notes d'adapter; couverture ciblee renforcee dans `scripts/verify/quake2-g-func.ts`.
- Effets verifies: `func_timer_think` conserve `G_UseTargets(self, activator)` puis la replanification `level.time + wait + crandom() * random`; `func_timer_use` conserve l'affectation `activator`, le toggle off par `nextthink = 0`, la branche delay et l'appel immediat sans delay; `SP_func_timer` conserve `wait = 1`, callbacks `use`/`think`, clamp `random = wait - FRAMETIME` avec warning, START_ON avec `1 + st.pausetime + delay + wait + crandom() * random`, `activator = self` et `SVF_NOCLIENT`.
- Branchement: `SP_func_timer` est referencee par `packages/game/src/g_spawn.ts` pour `func_timer`, appelee par `ED_CallSpawn`/`SpawnEntities`; les callbacks sont atteignables via triggers/G_UseTargets puis `G_RunFrame`/`G_RunEntity`/`SV_RunThink`.
- Integration: aucune logique parallele `func_timer` dans `apps/web`; le navigateur consomme le runtime local/full-game et les effets indirects des targets declenchees. `packages/renderer-three` ne porte pas le timer no-client; les sorties visibles potentielles viennent des targets declenchees et passent par les flux runtime habituels (snapshots, sons, temp entities ou scene selon la cible), donc pas de correction renderer attendue pour ce lot.
- Tests: `npm run verify:g-func` OK; `npm run typecheck` OK; `npm run verify:g-spawn` OK; `npm run verify:local-gameplay-sync` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:web-render-order` OK.

- 2026-05-01: initialisation differee de trigger elevator `trigger_elevator_init` et spawn `SP_trigger_elevator`.
- Preuve: comparaison directe `Quake-2-master/game/g_func.c:1726-1754` avec `packages/game/src/g_func.ts:1904-1925` apres ajout des commentaires d'en-tete.
- Correction appliquee: ajout des commentaires d'en-tete `trigger_elevator_init` et `SP_trigger_elevator` avec `Original name`, `Source`, `Category: Ported`, `Fidelity level: Strict`, comportement et notes d'adapter; couverture ciblee renforcee dans `scripts/verify/quake2-g-func.ts`.
- Effets verifies: `trigger_elevator_init` conserve les warnings target absent, target introuvable et cible non `func_train`, la selection `movetarget = G_PickTarget(self->target)`, l'installation `use = trigger_elevator_use` et `SVF_NOCLIENT`; `SP_trigger_elevator` conserve `think = trigger_elevator_init` et `nextthink = level.time + FRAMETIME`.
- Branchement: `SP_trigger_elevator` est referencee par `packages/game/src/g_spawn.ts` pour `trigger_elevator`, appelee par `ED_CallSpawn`/`SpawnEntities`, puis `trigger_elevator_init` est executee par `G_RunFrame`/`G_RunEntity`/`SV_RunThink`; l'usage rejoint `trigger_elevator_use` puis `train_resume`.
- Integration: aucune logique parallele `trigger_elevator` dans `apps/web`; le navigateur consomme le runtime local/full-game, sons, snapshots et refresh frames. `packages/renderer-three` ne porte pas ce trigger no-client, mais consomme les sorties visibles attendues du train cible via brush models/origines des refresh frames; pas de correction renderer attendue.
- Tests: `npm run verify:g-func` OK; `npm run typecheck` OK; `npm run verify:local-gameplay-sync` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:web-render-order` OK.

- 2026-05-01: spawn de train `SP_func_train`, activation elevator `trigger_elevator_use` et locale matricielle `target`.
- Preuve: comparaison directe `Quake-2-master/game/g_func.c:1654-1724` avec `packages/game/src/g_func.ts:1828-1902`.
- Correction appliquee: ajout des commentaires d'en-tete `SP_func_train` et `trigger_elevator_use` avec `Original name`, `Source`, `Category: Ported`, `Fidelity level: Strict`, comportement et notes d'adapter; couverture ciblee renforcee dans `scripts/verify/quake2-g-func.ts`.
- Effets verifies: `SP_func_train` conserve `MOVETYPE_PUSH`, effacement des angles visibles, callback `blocked`, `TRAIN_BLOCK_STOPS`, dommage par defaut, `SOLID_BSP`, modele inline, son `st.noise`, defaults `speed`, `moveinfo.speed/accel/decel`, callback `use`, link runtime et programmation `func_train_find` au frame suivant; `trigger_elevator_use` conserve la garde train occupe, warnings pathtarget absent/invalide, selection locale `target = G_PickTarget(other->pathtarget)`, affectation `movetarget.target_ent` et reprise via `train_resume`.
- Branchement: `SP_func_train` est referencee par `packages/game/src/g_spawn.ts` pour `func_train`, appelee par `ED_CallSpawn`/`SpawnEntities`, puis ses callbacks rejoignent `G_RunFrame`/`G_RunEntity`/`SV_RunThink`; `trigger_elevator_use` est installee par `trigger_elevator_init`, atteignable via triggers/G_UseTargets et reprend le train par `train_resume`.
- Integration: aucune logique parallele `func_train`/`trigger_elevator` dans `apps/web`; le navigateur consomme les sons runtime, snapshots et refresh frames. `packages/renderer-three` ne porte pas la logique gameplay, mais consomme les sorties visibles attendues via brush models/origines des refresh frames dans la scene; pas de correction renderer attendue pour ce lot.
- Tests: `npm run verify:g-func` OK; `npm run typecheck` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:web-render-order` OK.

- 2026-05-01: resolution et activation de train `func_train_find`, locale matricielle `ent`, `train_use` et doublon d'appel `train_next`.
- Preuve: comparaison directe `Quake-2-master/game/g_func.c:1601-1652` avec `packages/game/src/g_func.ts:1763-1800` apres ajout des commentaires d'en-tete.
- Correction appliquee: ajout des commentaires d'en-tete `func_train_find` et `train_use` avec `Original name`, `Source`, `Category: Ported`, `Fidelity level: Strict`, comportement et notes d'adapter; couverture ciblee ajoutee dans `scripts/verify/quake2-g-func.ts`.
- Effets verifies: warnings `train_find: no target` et `target ... not found`, locale `ent` issue de `G_PickTarget`, transfert `self.target = ent.target`, positionnement `origin = ent.s.origin - mins`, link runtime, auto-start des trains sans `targetname`, conservation des trains cibles en attente, affectation `activator`, retour running non-toggle, stop toggle avec clear `TRAIN_START_ON`/velocity/nextthink, reprise via `train_resume` si `target_ent` existe, et appel `train_next` sinon.
- Branchement: `func_train_find` est programme par `SP_func_train` apres spawn `func_train` via `g_spawn.ts`/`ED_CallSpawn`, puis execute par `G_RunFrame`/`G_RunEntity`/`SV_RunThink`; `train_use` est le callback `use` de `SP_func_train`, appele par triggers/G_UseTargets et rejoint `train_resume` ou `train_next`.
- Integration: aucune logique parallele `func_train` dans `apps/web`; le navigateur consomme le runtime local/full-game, les sons, snapshots et refresh frames. `packages/renderer-three` ne porte pas la logique gameplay; les sorties visibles attendues sont les brush models/origines des trains dans les refresh frames et la scene, couvertes par le flux Three.
- Tests: `npm run verify:g-func` OK; `npm run typecheck` OK; `npm run verify:local-gameplay-sync` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:web-render-order` OK.

- 2026-05-01: locales matricielles restantes de `train_next` (`ent`, `dest`, `first`), puis `train_resume` et sa locale `ent`.
- Preuve: comparaison directe `Quake-2-master/game/g_func.c:1529-1599` avec `packages/game/src/g_func.ts:1697-1761`.
- Correction appliquee: ajout du commentaire d'en-tete de `train_resume` avec `Original name`, `Source`, `Category: Ported`, `Fidelity level: Strict`, comportement et notes d'adapter; couverture ciblee directe ajoutee dans `scripts/verify/quake2-g-func.ts`.
- Effets verifies: `train_next` conserve la locale `ent` issue de `G_PickTarget`, la garde `first` qui autorise un seul `path_corner` teleport, le calcul `dest = ent.origin - self.mins`, la mise a jour `target_ent`, `wait`, `start_origin`, `end_origin`, `endfunc = train_wait` et `TRAIN_START_ON`; `train_resume` reprend depuis `target_ent` existant, recalcule `dest`, restaure les endpoints depuis l'origine courante et programme `Move_Calc(..., train_wait)`.
- Branchement: `train_next` reste atteint par `func_train_find`, `train_wait` et `train_use`; `train_resume` est atteint par `train_use` quand `target_ent` existe et par `trigger_elevator_use` apres selection du `path_corner`, tous deux depuis les callbacks spawn/use du runtime `SP_func_train`/`SP_trigger_elevator` puis `G_RunFrame`/`G_RunEntity`/`SV_RunThink` ou triggers.
- Integration: aucune logique parallele `func_train`/`trigger_elevator` dans `apps/web`; le navigateur consomme les sons runtime, snapshots et refresh frames. `packages/renderer-three` n'a pas a porter la logique gameplay, mais consomme les sorties visibles attendues via brush models/origines des refresh frames dans la scene; pas de correction renderer attendue pour ce lot.
- Tests: `npm run verify:g-func` OK; `npm run typecheck` OK; `npm run verify:local-gameplay-sync` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:web-render-order` OK.

- 2026-05-01: blocage et attente de train `train_blocked`, `train_wait`, locales matricielles `savetarget` et `ent`.
- Preuve: comparaison directe `Quake-2-master/game/g_func.c:1461-1527` avec `packages/game/src/g_func.ts:1616-1679`.
- Correction appliquee: `train_blocked` appelle maintenant `BecomeExplosion1` pour les bloqueurs non-monstre/non-client encore presents apres le crush, afin de produire la temp entity explosion comme le C; commentaires d'en-tete ajoutes pour `train_blocked` et `train_wait`; couverture ciblee ajoutee dans `scripts/verify/quake2-g-func.ts`.
- Effets verifies: dommages 100000/MOD_CRUSH sur debris, emission `TE_EXPLOSION1` et free, debounce `touch_debounce_time`, degats `self.dmg` sur monstre/client, garde `dmg == 0`, declenchement `pathtarget` via cible temporaire, restauration de `target` par `savetarget`, retour si le train est tue, wait positif vers `train_next`, wait negatif toggle avec clear `TRAIN_START_ON`, velocity nulle, `nextthink = 0`, et arret du son de fin hors `FL_TEAMSLAVE`.
- Branchement: `train_blocked` est affectee par `SP_func_train` a `self.blocked` puis appelee par le flux pusher/physique pendant `G_RunFrame`/`G_RunEntity`; `train_wait` est le callback de fin passe par `train_next` a `Move_Calc`, puis execute par `SV_RunThink`/mouvement runtime.
- Integration: aucune logique parallele `func_train` dans `apps/web`; le navigateur consomme les sons runtime, temp entities et snapshots/interpolations de brush models. `packages/renderer-three` consomme les sorties visibles attendues via brush models/origines des snapshots dans la scene, et les explosions passent par le flux temp-entity runtime deja verifie; pas de correction renderer attendue pour ce lot.
- Tests: `npm run verify:g-func` OK; `npm run typecheck` OK; `npm run verify:local-gameplay-sync` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:web-render-order` OK.

- 2026-05-01: flags de train `TRAIN_START_ON` / `TRAIN_TOGGLE` / `TRAIN_BLOCK_STOPS`, puis avance `train_next`.
- Preuve: comparaison directe `Quake-2-master/game/g_func.c:1445-1447,1459,1529-1583` avec `packages/game/src/g_func.ts:73-75,1661-1712`.
- Correction appliquee: ajout du commentaire d'en-tete de `train_next` avec `Original name`, `Source`, `Category: Ported`, `Fidelity level: Strict`, comportement et notes d'adapter; couverture renforcee dans `scripts/verify/quake2-g-func.ts`.
- Effets verifies: valeurs des trois flags, `func_train_find` qui arme `TRAIN_START_ON` pour train non cible, `train_use` toggle qui efface `TRAIN_START_ON`, stoppe la vitesse et annule `nextthink`, `SP_func_train` avec `TRAIN_BLOCK_STOPS` qui force `dmg = 0`, `train_next` qui suit un `path_corner` teleport unique, recalcule origin/old_origin/event, met a jour target/target_ent/wait, lance le son de boucle, stocke start/end origins, programme `Move_Calc(..., train_wait)` et conserve `TRAIN_START_ON`.
- Branchement: `func_train` est referencee dans `packages/game/src/g_spawn.ts` et appelee par `ED_CallSpawn`; `SP_func_train` programme `func_train_find`, puis `train_next` est atteint via `G_RunFrame`/`G_RunEntity`/`SV_RunThink` ou via `train_use`/triggers.
- Integration: aucune logique parallele `func_train` dans `apps/web`; le navigateur consomme les sons runtime et snapshots/interpolations de brush models. `packages/renderer-three` consomme les sorties visibles attendues via brush models/origines des snapshots dans la scene; pas de correction renderer attendue pour ce lot.
- Tests: `npm run verify:g-func` OK; `npm run typecheck` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:web-render-order` OK.

- 2026-05-01: spawn de brush eau mobile `SP_func_water`.
- Preuve: comparaison directe `Quake-2-master/game/g_func.c:1378-1435` avec `packages/game/src/g_func.ts:1568-1618`.
- Correction appliquee: `SP_func_water` utilise maintenant `G_SetMovedir(self.angles, self.movedir)` afin d'effacer les angles runtime canoniques comme le C efface `self->s.angles`; auparavant `refreshEntitySpatialState` pouvait reexposer les angles non remis a zero dans `s.angles`. Le commentaire d'en-tete documente les adapters `lip`, modele et sons.
- Effets verifies: `MOVETYPE_PUSH`, `SOLID_BSP`, modele inline, sons `world/mov_watr.wav`/`world/stp_watr.wav` pour water/lava, calcul `pos1`/`pos2` par movedir absolu et `lip`, branche `DOOR_START_OPEN`, `start_origin`/`end_origin`, angles remis a zero, defaults `speed = 25`, `wait = -1`, ajout `DOOR_TOGGLE`, classname remplacee par `func_door`, callback `door_use`, link runtime.
- Branchement: `SP_func_water` est referencee par `packages/game/src/g_spawn.ts` pour `func_water` et appelee par `ED_CallSpawn` pendant `SpawnEntities`; le brush doit etre cible puis active via `door_use`, et le mouvement rejoint `Move_Calc` puis `G_RunFrame`/`G_RunEntity`/`SV_RunThink`.
- Integration: aucune logique parallele `func_water` dans `apps/web`; le navigateur consomme les sons runtime et les snapshots/interpolations de brush models. `packages/renderer-three` consomme les sorties visibles attendues via inline brush models dans `gl-world-scene-adapter`, surfaces d'eau/warp du BSP et refdef/scene; pas d'areaportal propre a `func_water`.
- Tests: `npm run verify:g-func` OK; `npm run typecheck` OK; `npm run verify:g-spawn` OK; `npm run verify:local-gameplay-sync` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:web-render-order` OK.

- 2026-05-01: spawn de porte rotative `SP_func_door_rotating`.
- Preuve: comparaison directe `Quake-2-master/game/g_func.c:1261-1329` avec `packages/game/src/g_func.ts:887-977`.
- Correction appliquee: `SP_func_door_rotating` efface maintenant les angles de spawn comme `VectorClear(ent->s.angles)`, applique le fallback C `distance == 0 -> 90`, initialise `takedamage = DAMAGE_YES` pour les portes shootables, precache `misc/talk.wav` pour les portes a message, applique `EF_ANIM_ALL` sans confondre `X_AXIS` avec un flag anim fast, et relie l'entite apres l'initialisation complete; le commentaire d'en-tete est passe en fidelite `Strict`.
- Effets verifies: axes Z par defaut, `DOOR_X_AXIS`, `DOOR_Y_AXIS`, `DOOR_REVERSE`, `DOOR_START_OPEN`, defaults `speed`/`accel`/`decel`/`wait`/`dmg`, callbacks `blocked`/`use`/`die`/`touch`, `teammaster` solo, sons de porte, message, `moveinfo` origins/angles, `nextthink` et choix `Think_CalcMoveSpeed` ou `Think_SpawnDoorTrigger`.
- Branchement: `SP_func_door_rotating` est referencee par `packages/game/src/g_spawn.ts` pour `func_door_rotating`, appelee par `ED_CallSpawn` pendant `SpawnEntities`, puis ses thinks/callbacks rejoignent `Think_CalcMoveSpeed`, `Think_SpawnDoorTrigger`, `door_use`, `door_blocked`, `door_killed`, `door_touch`, `AngleMove_Calc` et le flux `G_RunFrame`/`G_RunEntity`/`SV_RunThink`.
- Integration: aucune logique parallele `func_door_rotating` dans `apps/web`; le navigateur consomme le runtime serveur/local, les sons, centerprints, areabits et snapshots/interpolations de brush models. `packages/renderer-three` consomme les sorties visibles attendues via brush snapshots, angles de modeles inline rotatifs et areabits; pas de correction renderer attendue.
- Tests: `npm run verify:g-func` OK; `npm run typecheck` OK; `npm run verify:local-gameplay-sync` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:web-render-order` OK.

- 2026-05-01: spawn de porte lineaire `SP_func_door`.
- Preuve: comparaison directe `Quake-2-master/game/g_func.c:1138-1228` avec `packages/game/src/g_func.ts:775-870`.
- Correction appliquee: `SP_func_door` appelle maintenant `G_SetMovedir`, applique le doublement de vitesse deathmatch, initialise `takedamage = DAMAGE_YES` pour les portes shootables, precache `misc/talk.wav` pour les portes a message, applique `EF_ANIM_ALL`/`EF_ANIM_ALLFAST`, puis expose l'entite par `linkGameEntity` apres l'initialisation complete comme le `gi.linkentity` C; le commentaire d'en-tete documente l'adapter runtime/deathmatch.
- Effets verifies: sons de porte par defaut sauf `sounds == 1`, direction/angles remis a zero, defaults `speed`/`accel`/`decel`/`wait`/`dmg`, calcul `pos1`/`pos2` et `moveinfo.distance` avec lip, inversion `DOOR_START_OPEN`, copie `moveinfo`, callbacks `blocked`/`use`/`die`/`touch`, `teammaster` pour porte solo, effets d'animation, `nextthink` et choix `Think_CalcMoveSpeed` ou `Think_SpawnDoorTrigger`.
- Branchement: `SP_func_door` est referencee par `packages/game/src/g_spawn.ts` pour `func_door`, appelee par `ED_CallSpawn` pendant `SpawnEntities`, puis ses thinks/callbacks rejoignent `Think_CalcMoveSpeed`, `Think_SpawnDoorTrigger`, `door_use`, `door_blocked`, `door_killed`, `door_touch`, `Move_Calc` et le flux `G_RunFrame`/`G_RunEntity`/`SV_RunThink`.
- Integration: aucune logique parallele `func_door` dans `apps/web`; le navigateur consomme le runtime serveur/local, les sons, centerprints, areabits et snapshots/interpolations de brush models. `packages/renderer-three` n'a pas a porter le spawn gameplay et consomme les sorties visibles attendues via brush snapshots, inline brush models et areabits; pas de correction renderer attendue.
- Tests: `npm run verify:g-func` OK; `npm run typecheck` OK; `npm run verify:local-gameplay-sync` OK; `npm run verify:full-game:server-host` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:web-render-order` OK.

- 2026-05-01: message tactile de porte `door_touch`.
- Preuve: comparaison directe `Quake-2-master/game/g_func.c:1125-1136` avec `packages/game/src/g_func.ts:743-780`.
- Correction appliquee: `door_touch` emet maintenant une sortie `centerprint` runtime ciblee sur le client touche et le son runtime `misc/talk1.wav` avec canal `CHAN_AUTO`, volume 1 et attenuation `ATTN_NORM`, comme les appels C `gi.centerprintf` et `gi.sound`; le commentaire d'en-tete documente les adapters runtime.
- Effets verifies: retour immediat pour non-client, garde `touch_debounce_time`, passage du debounce a `level.time + 5.0`/`runtime.time + 5.0`, emission du message centerprint de porte vers le client et son talk1 cible sur le joueur.
- Branchement: `door_touch` est affectee par `SP_func_door`, `SP_func_door_rotating` et `SP_func_door_secret` aux portes avec `message`, referencees par `g_spawn.ts`; le callback est atteignable par les flux de contact `SV_Impact`, `G_TouchTriggers` et `G_TouchSolids` pendant `G_RunFrame`/physique locale.
- Integration: `apps/web` ne contient pas de logique parallele `door_touch`; `local-client-controller.ts` draine les centerprints runtime vers `SCR_CenterPrint` et les sons via `drainGameSoundEvents`, puis le navigateur consomme les snapshots/interpolations de brush models. `packages/renderer-three` n'a pas a porter le message gameplay ni le son, et consomme seulement les sorties visibles attendues des portes via brush snapshots/areabits; pas de correction renderer attendue.
- Tests: `npm run verify:g-func` OK; `npm run typecheck` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:web-render-order` OK; `npx tsx ./scripts/verify/quake2-web-first-person-camera.ts` OK.

- 2026-05-01: porte shootable `door_killed` et locale matricielle `ent`.
- Preuve: comparaison directe `Quake-2-master/game/g_func.c:1113-1123` avec `packages/game/src/g_func.ts:723-738`.
- Correction appliquee: `door_killed` applique maintenant `takedamage = DAMAGE_NO` a chaque membre de l'equipe apres restauration `health = max_health`, comme le C; commentaire d'en-tete mis a jour.
- Effets verifies: parcours de l'equipe par la locale C `ent` portee via `forEachDoorTeam`, restauration de la sante master+slave, desactivation des degats master+slave, puis delegation a `door_use(teammaster, attacker, attacker)` qui ouvre l'equipe.
- Branchement: `door_killed` est affectee par `SP_func_door` et `SP_func_door_rotating` aux portes shootables, referencees par `g_spawn.ts`, puis appelee par `T_Damage` via le callback `die`; l'ouverture rejoint `door_use`/`door_go_up`/`Move_Calc` ou `AngleMove_Calc` et le flux `G_RunFrame`/`G_RunEntity`/`SV_RunThink`.
- Integration: aucune logique parallele `func_door` dans `apps/web`; le navigateur consomme le runtime serveur/local, les sons, areabits et snapshots/interpolations de brush models. `packages/renderer-three` ne porte pas la mort gameplay et consomme les sorties visibles attendues via brush snapshots/areabits; pas de correction renderer attendue pour ce lot.
- Tests: `npm run verify:g-func` OK; `npm run typecheck` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:web-render-order` OK.

- 2026-05-01: blocage de porte `door_blocked` et locale matricielle `ent`.
- Preuve: comparaison directe `Quake-2-master/game/g_func.c:1076-1111` avec `packages/game/src/g_func.ts:676-715`.
- Correction appliquee: `door_blocked` applique maintenant les dommages C avant la garde `DOOR_CRUSHER`, explose les bloqueurs non-monstre/non-client encore `inuse` via `BecomeExplosion1`, puis conserve les dommages `self.dmg` pour monstres/clients et l'inversion de l'equipe selon `STATE_DOWN` ou autre et `moveinfo.wait >= 0`.
- Effets verifies: appel `T_Damage` 100000/MOD_CRUSH pour objets, explosion temp entity + free si encore present, appel `T_Damage` self.dmg/MOD_CRUSH pour client/monstre, crusher sans inversion, parcours de team par la locale C `ent` portee via `forEachDoorTeam`, `door_go_up` quand l'etat est `STATE_DOWN`, `door_go_down` sinon.
- Branchement: `door_blocked` est affectee par `SP_func_door` et `SP_func_door_rotating`, referencees par `g_spawn.ts`, puis appelee par `SV_Physics_Pusher` via `part.blocked` pendant `G_RunFrame`/`G_RunEntity`.
- Integration: aucune logique parallele `func_door` dans `apps/web`; le navigateur consomme le runtime serveur/local, sons, temp entities, areabits et snapshots/interpolations de brush models. `packages/renderer-three` ne porte pas le blocage gameplay et consomme les sorties visibles attendues via brush snapshots/areabits; l'explosion est une temp entity runtime consommee en aval par le flux client/renderer existant.
- Tests: `npm run verify:g-func` OK; `npm run typecheck` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:web-render-order` OK.

- 2026-05-01: spawn de trigger de porte `Think_SpawnDoorTrigger` et locale matricielle `other`.
- Preuve: comparaison directe `Quake-2-master/game/g_func.c:1038-1073` avec `packages/game/src/g_func.ts:630-672` et helper de bounds `packages/game/src/g_func.ts:2087-2115`.
- Correction appliquee: `Think_SpawnDoorTrigger` teste maintenant le flag `FL_TEAMSLAVE` comme le C, au lieu de se baser seulement sur `teammaster`; le commentaire d'en-tete documente l'adapter `G_Spawn`/`gi.linkentity`.
- Effets verifies: retour immediat pour team slave, merge des bounds absolues du master et de `teamchain`, expansion X/Y de 60 unites, creation du helper local `other` avec owner/`SOLID_TRIGGER`/`MOVETYPE_NONE`/`Touch_DoorTrigger`, link runtime, ouverture d'areaportal sous `DOOR_START_OPEN`, puis appel a `Think_CalcMoveSpeed`.
- Branchement: `Think_SpawnDoorTrigger` est programme par `SP_func_door` et `SP_func_door_rotating` pour les portes non ciblees/non shootables, puis execute par `G_RunFrame`/`G_RunEntity`/`SV_RunThink`; le trigger cree rejoint le flux touch vers `Touch_DoorTrigger`/`door_use`/mouvements de portes.
- Integration: aucune logique parallele `func_door` dans `apps/web`; le navigateur consomme le runtime serveur/local, sons, areabits et snapshots/interpolations de brush models. `packages/renderer-three` ne porte pas le spawn gameplay et consomme les sorties visibles attendues via brush snapshots et areabits; pas de correction renderer attendue.
- Tests: `npm run verify:g-func` OK; `npm run typecheck` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:web-render-order` OK.

- 2026-05-01: trigger de porte `Touch_DoorTrigger`, harmonisation de vitesse `Think_CalcMoveSpeed` et locales `ent`/`min`/`time`/`newspeed`/`ratio`/`dist`.
- Preuve: comparaison directe `Quake-2-master/game/g_func.c:980-1035` avec `packages/game/src/g_func.ts:550-619`.
- Correction appliquee: `Think_CalcMoveSpeed` teste maintenant `FL_TEAMSLAVE` comme le C et conserve la logique `ratio` pour `accel`/`decel` quand ces valeurs ne sont pas egales a l'ancienne `speed`, au lieu de les forcer toutes a `newspeed`.
- Effets verifies: `Touch_DoorTrigger` conserve les gardes mort, non-client/non-monstre, `DOOR_NOMONSTER`, le debounce `level.time + 1.0` et l'appel `door_use(owner, other, other)`; `Think_CalcMoveSpeed` conserve la distance minimale de team, le temps commun, l'ajustement de `speed`, et les branches accel/decel egal ou non a `speed`.
- Branchement: `Touch_DoorTrigger` est affectee au helper cree par `Think_SpawnDoorTrigger`, puis rejoint `door_use`/`door_go_up`/`Move_Calc`/`AngleMove_Calc` et le flux `G_RunFrame`/`G_RunEntity`/`SV_RunThink`; `Think_CalcMoveSpeed` est programme par `SP_func_door` et `SP_func_door_rotating` pour les portes ciblees, shootables ou team members.
- Integration: aucune logique parallele `func_door` dans `apps/web`; le navigateur consomme le runtime serveur/local, sons, areabits et snapshots/interpolations de brush models. `packages/renderer-three` consomme les sorties visibles attendues via brush snapshots et areabits; pas de correction renderer attendue pour ce lot.
- Tests: `npm run verify:g-func` OK; `npm run typecheck` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:web-render-order` OK.

- 2026-05-01: activation de porte `door_use` et locale `ent`.
- Preuve: comparaison directe `Quake-2-master/game/g_func.c:949-978` avec `packages/game/src/g_func.ts:520-539` et helper de parcours `forEachDoorTeam` `packages/game/src/g_func.ts:2142-2148`.
- Correction appliquee: `door_use` teste maintenant le flag `FL_TEAMSLAVE` comme le C, au lieu de se baser seulement sur `teammaster`.
- Effets verifies: retour immediat pour slave, branche `DOOR_TOGGLE` quand l'etat est `STATE_UP`/`STATE_TOP`, parcours de tous les membres `teamchain`, remise a vide de `message`/`touch`, appel `door_go_down` en fermeture toggle et `door_go_up(... activator)` en ouverture.
- Branchement: `door_use` est affectee par `SP_func_door` et `SP_func_door_rotating`, referencees par `g_spawn.ts` pour `func_door`/`func_door_rotating`, puis appelee par triggers/G_UseTargets et par `door_killed`; les mouvements declenches rejoignent `Move_Calc`/`AngleMove_Calc` puis `G_RunFrame`/`G_RunEntity`/`SV_RunThink`.
- Integration: aucune logique parallele `func_door` dans `apps/web`; le navigateur consomme le runtime serveur/local, les sons et les snapshots/interpolations de brush models. `packages/renderer-three` consomme les poses de brush snapshots et areabits via les adapters existants; pas de correction renderer attendue.
- Tests: `npm run verify:g-func` OK; `npm run typecheck` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:web-render-order` OK.

- 2026-05-01: transitions de porte `door_go_down` et `door_go_up`, plus prototype C `door_go_down`.
- Preuve: comparaison directe `Quake-2-master/game/g_func.c:868,900-947` avec `packages/game/src/g_func.ts:456-507`.
- Correction appliquee: `door_go_down` restaure maintenant aussi `takedamage = DAMAGE_YES` quand `max_health` est present, comme le C; `door_go_up` ne modifie plus `self.activator`, ecriture absente du C.
- Effets verifies: `door_go_down` conserve son start/loop hors team slave, restauration health/max_health, `STATE_DOWN`, branche `func_door` vers `Move_Calc(... start_origin, door_hit_bottom)` et branche `func_door_rotating` vers `AngleMove_Calc(... door_hit_bottom)`; `door_go_up` conserve les gardes `STATE_UP` et `STATE_TOP`, la remise de `nextthink` selon `wait`, son start/loop, `STATE_UP`, les branches lineaire/rotative vers `door_hit_top`, `G_UseTargets` et ouverture areaportals.
- Branchement: `door_go_down` est programme par `door_hit_top` et appele par `door_use`/`door_blocked`; `door_go_up` est appele par `door_use`, `Touch_DoorTrigger` et `door_blocked`; les mouvements et callbacks passent par `Move_Calc`/`AngleMove_Calc` puis `G_RunFrame`/`G_RunEntity`/`SV_RunThink`.
- Integration: aucune logique parallele `func_door` dans `apps/web`; le navigateur consomme le runtime serveur/local, les sons et les snapshots/interpolations de brush models. `packages/renderer-three` consomme les poses de brush snapshots et areabits via les adapters existants; pas de correction renderer attendue.
- Tests: `npm run verify:g-func` OK; `npm run typecheck` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:web-render-order` OK.

- 2026-05-01: locale `t` de `door_use_areaportals`, puis callbacks `door_hit_top` / `door_hit_bottom`.
- Preuve: comparaison directe `Quake-2-master/game/g_func.c:854-866,870-899` avec `packages/game/src/g_func.ts:380-453`.
- Correction appliquee: couverture ciblee ajoutee dans `scripts/verify/quake2-g-func.ts` pour verifier `door_hit_top` (son de fin, `s.sound = 0`, `STATE_TOP`, programmation `door_go_down`, cas `DOOR_TOGGLE` sans retour) et `door_hit_bottom` (son de fin, `s.sound = 0`, `STATE_BOTTOM`, fermeture areaportal par la recherche locale `t`/`G_Find` de `door_use_areaportals`). Pas de correction runtime necessaire.
- Effets verifies: `door_use_areaportals` conserve la locale C `t` comme curseur de recherche TS `entity`, filtre uniquement `func_areaportal` et applique le `style`; `door_hit_top` conserve la planification du retour selon `wait` hors toggle; `door_hit_bottom` conserve la fermeture des areaportals apres passage en bas.
- Branchement: `door_hit_top` est callback de `door_go_up` via `Move_Calc`/`AngleMove_Calc`; `door_hit_bottom` est callback de `door_go_down` via `Move_Calc`/`AngleMove_Calc`; ces flux sont atteignables depuis `SP_func_door`/`SP_func_door_rotating`, `g_spawn.ts`, triggers/use/touch et `G_RunFrame`/`SV_RunThink`.
- Integration: aucune logique parallele `func_door`/`func_areaportal` dans `apps/web`; le navigateur consomme le runtime serveur/local, les sons, snapshots et areabits. `packages/renderer-three` ne remplace pas la logique et consomme les brush snapshots/areabits via les adapters renderer.
- Tests: `npm run verify:g-func` OK; `npm run typecheck` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:web-render-order` OK.

- 2026-05-01: locale `dist` de `SP_func_button`, puis `door_use_areaportals`.
- Preuve: comparaison directe `Quake-2-master/game/g_func.c:766,792-793,852-866` avec `packages/game/src/g_func.ts:367-398,1483-1485`.
- Correction appliquee: `door_use_areaportals` appelle maintenant `CM_SetAreaPortalState(runtime.collision.world, entity.style, open)` pour chaque `func_areaportal` cible, comme le `gi.SetAreaPortalState` C; le commentaire d'en-tete documente l'adapter collision et le cas harness sans collision.
- Effets verifies: `dist` reste la locale de calcul bouton `abs_movedir * size - lip` puis `pos2 = pos1 + movedir * dist`; `door_use_areaportals` conserve le retour sans target, la recherche `G_Find` par `targetname`, le filtre `func_areaportal`, et applique l'ouverture/fermeture du portal `style`.
- Branchement: `door_use_areaportals` est appelee par les callbacks de porte/portes secretes (`door_hit_bottom`, `door_go_up`, spawn START_OPEN et secret door) eux-memes atteignables via `SP_func_door`/`SP_func_door_rotating`/`SP_func_door_secret`, `g_spawn.ts`, `SpawnEntities`, triggers/use et le flux `G_RunFrame`/`SV_RunThink`.
- Integration: aucune logique parallele `func_door`/`func_areaportal` dans `apps/web`; le navigateur consomme le runtime serveur/local, les snapshots et areabits. `packages/renderer-three` ne remplace pas cette logique et consomme la visibilite/scene issue du runtime; pas de correction renderer attendue.
- Tests: `npm run verify:g-func` OK; `npm run typecheck` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:web-render-order` OK.

- 2026-05-01: spawn de bouton `SP_func_button`.
- Preuve: comparaison directe `Quake-2-master/game/g_func.c:763-817` avec `packages/game/src/g_func.ts:1447-1505`.
- Correction appliquee: commentaire d'en-tete `SP_func_button` renforce en fidelite `Strict` avec notes de portage; couverture ciblee ajoutee dans `scripts/verify/quake2-g-func.ts` pour defaults speed/accel/decel/wait, pos1/pos2, moveinfo start/end, `use`, `touch`, bouton cible, `sounds = 1`, bouton shootable `die`/`takedamage`/`max_health` et link runtime.
- Effets verifies par lecture: le port conserve `G_SetMovedir`, `MOVETYPE_STOP`, `SOLID_BSP`, `gi.setmodel` via `setGameEntityModel`, son par defaut sauf `sounds == 1`, defaults `speed`/`accel`/`decel`/`wait`, `lip` par defaut 4, calcul `pos1`/`pos2`, callbacks `button_use`/`button_killed`/`button_touch`, `EF_ANIM01`, et copie vers `moveinfo`.
- Branchement: `SP_func_button` est referencee par `g_spawn.ts` pour `func_button`, appelee par `ED_CallSpawn` pendant `SpawnEntities`, puis ses callbacks sont atteignables par triggers/G_UseTargets, contacts et `T_Damage`; les mouvements passent par `Move_Calc` puis `G_RunFrame`/`G_RunEntity`/`SV_RunThink`.
- Integration: aucune logique parallele `func_button` dans `apps/web`; le navigateur consomme le runtime serveur/local, les sons et les snapshots/interpolations de brush models. `packages/renderer-three` doit consommer la sortie visible brush model/origine/angles, et le flux est couvert par les snapshots brush et `refresh-entity-sync`/world adapter; pas de correction renderer attendue.
- Tests: `npm run verify:full-game:three-renderer` OK; `npm run verify:web-render-order` OK; `git diff --check -- packages/game/src/g_func.ts scripts/verify/quake2-g-func.ts ...` OK pendant le lot agent. Apres correction coordinateur du blocage hors lot dans `g_items.ts`, `npm run verify:g-func` et `npm run typecheck` relances OK; statut final `Valide`.

- 2026-05-01: bouton shootable `button_killed`.
- Preuve: comparaison directe `Quake-2-master/game/g_func.c:755-761` avec `packages/game/src/g_func.ts:1430-1444`.
- Correction appliquee: ajout du commentaire d'en-tete `button_killed` et renforcement de `scripts/verify/quake2-g-func.ts` pour couvrir l'activator attaquant, la restauration `health = max_health`, `DAMAGE_NO`, la transition de pression et `button_wait`.
- Effets verifies: le port conserve `self.activator = attacker`, recharge la sante du bouton shootable, desactive les degats pendant le mouvement puis delegue a `button_fire`.
- Branchement: `SP_func_button` affecte `ent.die = button_killed` quand `health` est present; le callback est atteint par `T_Damage` sur bouton shootable, puis `button_fire`/`Move_Calc` passent dans le flux `G_RunFrame`/`G_RunEntity`/`SV_RunThink`.
- Integration: aucune logique parallele dans `apps/web`; le navigateur passe par le runtime serveur/local et consomme les sons/snapshots/interpolations de brush models. `packages/renderer-three` consomme les poses de brush snapshots via `gl-world-scene-adapter`; pas de correction renderer attendue.
- Tests: `npm run verify:g-func` OK; `npm run typecheck` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:web-render-order` OK.

- 2026-05-01: contact joueur bouton `button_touch`.
- Preuve: comparaison directe `Quake-2-master/game/g_func.c:743-752` avec `packages/game/src/g_func.ts:1411-1427`.
- Correction appliquee: ajout du commentaire d'en-tete `button_touch` et couverture ciblee dans `scripts/verify/quake2-g-func.ts` pour verifier les gardes non-client/client mort, puis activator client vivant et delegation a `button_fire`.
- Effets verifies: le port conserve les deux retours anticipes C, stocke `self.activator = other` uniquement pour un client vivant, puis lance la pression via `button_fire` avec transition `STATE_UP` et callback `button_wait`.
- Branchement: `button_touch` est affecte a `ent.touch` par `SP_func_button` pour les boutons sans `health` ni `targetname`; le callback est atteignable via les flux de contact `SV_Impact`, `G_TouchTriggers` et `G_TouchSolids`, puis le mouvement passe par `Move_Calc` et les thinks runtime `G_RunFrame`/`G_RunEntity`/`SV_RunThink`.
- Integration: aucune logique parallele dans `apps/web`; le navigateur passe par le runtime serveur/local et consomme les sons/snapshots/interpolations de brush models. `packages/renderer-three` consomme les poses de brush snapshots via `gl-world-scene-adapter`; pas de correction renderer attendue.
- Tests: `npm run verify:g-func` OK; `npm run typecheck` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:web-render-order` OK.

- 2026-05-01: activation ciblee bouton `button_use`.
- Preuve: comparaison directe `Quake-2-master/game/g_func.c:737-740` avec `packages/game/src/g_func.ts:1397-1409`.
- Correction appliquee: ajout du commentaire d'en-tete `button_use`.
- Effets verifies: le port conserve l'affectation de `self.activator = activator` puis delegue la transition de pression a `button_fire`; controle inline OK pour activator, `STATE_UP`, direction, distance restante et callback `button_wait`.
- Branchement: `button_use` est affecte a `ent.use` par `SP_func_button`, lui-meme reference par `g_spawn.ts` pour `func_button`; l'appel est atteignable par triggers/G_UseTargets puis `button_fire`/`Move_Calc` passe dans le flux `G_RunFrame`/`G_RunEntity`/`SV_RunThink`.
- Integration: aucune logique parallele dans `apps/web`; le navigateur passe par le runtime serveur/local et consomme les sons/snapshots/interpolations de brush models. `packages/renderer-three` consomme les poses de brush snapshots via `gl-world-scene-adapter`; pas de correction renderer attendue.
- Tests: inline `npx tsx -e` OK; `npm run verify:g-func` OK; `npm run typecheck` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:web-render-order` OK. Premier essai inline avec imports `.js` bloque par resolution `tsx -e`, relance avec imports `.ts` OK.

- 2026-05-01: depart de pression bouton `button_fire`.
- Preuve: comparaison directe `Quake-2-master/game/g_func.c:726-735` avec `packages/game/src/g_func.ts:1376-1394`.
- Correction appliquee: ajout du commentaire d'en-tete `button_fire` et couverture ciblee dans `scripts/verify/quake2-g-func.ts` pour verifier les gardes `STATE_UP`/`STATE_TOP`, la transition `STATE_UP`, le son start uniquement hors `FL_TEAMSLAVE`, et `Move_Calc` vers `moveinfo.end_origin` avec `button_wait`.
- Effets verifies: le port conserve le refus de retrigger un bouton deja montant/haut, lance la pression vers la position haute, respecte le silence des team slaves et delegue la fin du mouvement a `button_wait`; `emitMoverSound` garde le cas `sound_start == 0` comme le test indirect via sounds/spawn le couvre deja.
- Branchement: `button_fire` est appele par `button_use`, `button_touch` et `button_killed`, eux-memes branches par `SP_func_button`; le mouvement et le callback `button_wait` passent par `Move_Calc` puis le flux `G_RunFrame`/`G_RunEntity`/`SV_RunThink`.
- Integration: aucune logique parallele dans `apps/web`; le navigateur passe par le runtime serveur/local et consomme les sons/snapshots/interpolations de brush models. `packages/renderer-three` consomme les poses de brush snapshots via `gl-world-scene-adapter`; pas de correction renderer attendue.
- Tests: `npm run verify:g-func` OK; `npm run typecheck` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:web-render-order` OK.

- 2026-05-01: attente en position haute bouton `button_wait`.
- Preuve: comparaison directe `Quake-2-master/game/g_func.c:711-724` avec `packages/game/src/g_func.ts:1355-1373`.
- Correction appliquee: ajout du commentaire d'en-tete `button_wait` et couverture ciblee dans `scripts/verify/quake2-g-func.ts` pour verifier `STATE_TOP`, retrait de `EF_ANIM01`, ajout de `EF_ANIM23`, appel `G_UseTargets` avec l'activator, `s.frame = 1`, programmation `nextthink = runtime.time + moveinfo.wait`/`think = button_return` quand `wait >= 0`, et absence de programmation quand `wait < 0`.
- Effets verifies: le port conserve la transition haute du bouton, l'animation active, le declenchement des targets avec l'activator courant, la frame visible pressee et la logique de retour conditionnee par `moveinfo.wait`.
- Branchement: `button_wait` est passe a `Move_Calc` par `button_fire`, puis appele par le flux de mouvement/think pendant `G_RunFrame`/`G_RunEntity`/`SV_RunThink`; `func_button` est cree via `SP_func_button` reference par `g_spawn.ts`.
- Integration: aucune logique parallele dans `apps/web`; le navigateur passe par le runtime serveur/local et consomme les sons/snapshots/interpolations de brush models. `packages/renderer-three` consomme les poses de brush snapshots via `gl-world-scene-adapter`; pas de correction renderer attendue.
- Tests: `npm run verify:g-func` OK; `npm run typecheck` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:web-render-order` OK.

- 2026-05-01: transition de retour bouton `button_return`.
- Preuve: comparaison directe `Quake-2-master/game/g_func.c:699-708` avec `packages/game/src/g_func.ts:1337-1353`.
- Correction appliquee: ajout du commentaire d'en-tete `button_return` et couverture ciblee dans `scripts/verify/quake2-g-func.ts` pour verifier `STATE_DOWN`, `Move_Calc` vers `moveinfo.start_origin` avec `button_done`, `s.frame = 0` et `takedamage = DAMAGE_YES` quand `health` est present.
- Effets verifies: le port conserve la transition de retour du bouton, la destination basse, le callback de fin `button_done`, la remise de frame visible et la reactivation des boutons shootables; le parametre `runtime` sert seulement a remplacer `level.time`/callbacks implicites du C dans `Move_Calc`.
- Branchement: `button_return` est programme par `button_wait` puis execute par le flux de think/mouvement `Move_Calc` pendant `G_RunFrame`/`G_RunEntity`/`SV_RunThink`; `func_button` est cree via `SP_func_button` reference par `g_spawn.ts`.
- Integration: aucune logique parallele dans `apps/web`; le navigateur passe par le runtime serveur/local et consomme les sons/snapshots/interpolations de brush models. `packages/renderer-three` consomme les poses de brush snapshots via `gl-world-scene-adapter`; pas de correction renderer attendue.
- Tests: `npm run verify:g-func` OK; `npm run typecheck` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:web-render-order` OK.

- 2026-05-01: callback de fin de retour bouton `button_done`.
- Preuve: comparaison directe `Quake-2-master/game/g_func.c:692-697` avec `packages/game/src/g_func.ts:1321-1335`.
- Correction appliquee: ajout du commentaire d'en-tete `button_done` et couverture ciblee dans `scripts/verify/quake2-g-func.ts` pour verifier `STATE_BOTTOM`, retrait de `EF_ANIM23` et restauration de `EF_ANIM01`.
- Effets verifies: le port conserve exactement la remise a l'etat bas/idle du bouton apres son retour; pas d'appel de callback ni d'effet supplementaire dans cette fonction.
- Branchement: `button_done` est passe a `Move_Calc` par `button_return`, puis appele par le flux de movement/think pendant `G_RunFrame`/`G_RunEntity`/`SV_RunThink`; le bouton est cree via `SP_func_button` reference par `g_spawn.ts` pour `func_button`.
- Integration: aucune logique parallele dans `apps/web`; le navigateur consomme les sons/runtime et snapshots/interpolations de brush models. `packages/renderer-three` consomme les poses de brush snapshots via `gl-world-scene-adapter`; pas de correction renderer attendue.
- Tests: `npm run verify:g-func` OK; `npm run typecheck` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:web-render-order` OK.

- 2026-05-01: spawn de brush tournant `SP_func_rotating`.
- Preuve: comparaison directe `Quake-2-master/game/g_func.c:623-661` avec `packages/game/src/g_func.ts:1272-1312`.
- Correction appliquee: ajout de couverture ciblee dans `scripts/verify/quake2-g-func.ts` pour verifier `solid = SOLID_BSP`, `MOVETYPE_PUSH` ou `MOVETYPE_STOP`, axes par defaut/X/Y selon les flags C, inversion REVERSE, defaults `speed = 100` et `dmg = 2`, valeurs explicites, callbacks `use`/`blocked`, START_ON via `rotating_use`, flags `EF_ANIM_ALL`/`EF_ANIM_ALLFAST`, enregistrement modele inline et liaison runtime.
- Effets verifies: le port initialise le brush comme le C, conserve les flags numeriques de `func_rotating`, branche `rotating_use` et `rotating_blocked`, appelle immediatement `rotating_use` sous START_ON, puis applique effets anim et link. Le `setGameEntityModel` TS est appele avant quelques champs mais la liaison finale apres initialisation conserve l'etat expose; aucune divergence runtime observee dans le harness.
- Branchement: `SP_func_rotating` est referencee dans `packages/game/src/g_spawn.ts` pour `func_rotating`, appelee par `ED_CallSpawn` pendant `SpawnEntities`, puis ses callbacks sont atteignables via triggers/use, touches et pusher physics pendant `G_RunFrame`/`G_RunEntity`.
- Integration: aucune logique parallele dans `apps/web`; le navigateur consomme les sons runtime et les snapshots/interpolations de brush models. `packages/renderer-three` consomme les origines/angles des brush snapshots via `gl-world-scene-adapter`, donc pas de correction renderer attendue.
- Tests: `npm run verify:g-func` OK; `npm run typecheck` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:web-render-order` OK.

- 2026-05-01: callback d'activation `rotating_use`.
- Preuve: comparaison directe `Quake-2-master/game/g_func.c:606-621` avec `packages/game/src/g_func.ts:1248-1269`.
- Correction appliquee: ajout de couverture ciblee dans `scripts/verify/quake2-g-func.ts` pour verifier le demarrage avec `s.sound = moveinfo.sound_middle`, `avelocity = movedir * speed`, branchement `rotating_touch` sous TOUCH_PAIN, puis l'arret avec `s.sound = 0`, `avelocity` nulle et `touch` efface.
- Effets verifies: le port conserve la branche C `!VectorCompare(avelocity, vec3_origin)` pour stopper le brush, et la branche inverse pour relancer la rotation; les parametres C `other`/`activator` restent inutilises comme dans le comportement original.
- Branchement: `rotating_use` est affectee a `ent.use` par `SP_func_rotating`, appelee immediatement pour START_ON, et reste atteignable par les triggers/G_UseTargets puis par le flux runtime normal `G_RunFrame`/physique locale.
- Integration: aucune logique parallele dans `apps/web`; le navigateur consomme les sons runtime et les snapshots/interpolations de brush models. `packages/renderer-three` consomme les angles/origines des brush snapshots via `gl-world-scene-adapter`; pas de correction renderer attendue.
- Tests: `npm run verify:g-func` OK; `npm run typecheck` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:web-render-order` OK.

- 2026-05-01: callback de contact `rotating_touch`.
- Preuve: comparaison directe `Quake-2-master/game/g_func.c:600-604` avec `packages/game/src/g_func.ts:1233-1245`.
- Correction appliquee: ajout de couverture ciblee dans `scripts/verify/quake2-g-func.ts` pour verifier que `rotating_touch` ne blesse pas quand `avelocity` est nulle, puis applique `self.dmg` et `MOD_CRUSH` quand le brush tourne.
- Effets verifies: le port conserve la garde C sur les trois composantes de `avelocity` et delegue a `T_Damage(other, self, self, vec3_origin, other.s.origin, vec3_origin, self.dmg, 1, 0, MOD_CRUSH)`; les parametres C `plane`/`surf` restent inutilises comme dans le comportement original.
- Branchement: `rotating_touch` est affectee au callback `touch` par `rotating_use` quand le flag STOP est actif et par `SP_func_rotating` pour les rotating START_ON/STOP; le callback est appele via `SV_Impact` ou les helpers de touch pendant le flux `G_RunFrame`/physique locale.
- Integration: aucune logique parallele dans `apps/web`; les dommages restent gameplay runtime. Les sorties visibles du brush rotating passent par les snapshots de brush models/angles et sont consommees par `packages/renderer-three/src/gl-world-scene-adapter.ts`.
- Tests: `npm run verify:g-func` OK; `npm run typecheck` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:web-render-order` OK.

- 2026-05-01: callback de blocage `rotating_blocked`.
- Preuve: comparaison directe `Quake-2-master/game/g_func.c:595-598` avec `packages/game/src/g_func.ts:1220-1230`.
- Correction appliquee: ajout de couverture ciblee dans `scripts/verify/quake2-g-func.ts` pour verifier que `SP_func_rotating` branche `rotating_blocked`, que le bloqueur perd `self.dmg` PV et que `runtime.meansOfDeath` vaut `MOD_CRUSH`.
- Effets verifies: `rotating_blocked` delegue a `T_Damage(other, self, self, vec3_origin, other.s.origin, vec3_origin, self.dmg, 1, 0, MOD_CRUSH)` comme le C; le parametre runtime est seulement l'adapter TS requis par le port.
- Branchement: `SP_func_rotating` affecte `ent.blocked = rotating_blocked` quand `dmg` est non nul; le callback est appele par `SV_Physics_Pusher` pendant le flux `G_RunFrame`/`G_RunEntity` si le push/rotation rencontre un obstacle.
- Integration: aucune logique parallele dans `apps/web`; les dommages restent gameplay runtime. Les sorties visibles du brush rotating passent par les snapshots de brush models/angles et sont consommees par `packages/renderer-three/src/gl-world-scene-adapter.ts`.
- Tests: `npm run verify:g-func` OK; `npm run typecheck` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:web-render-order` OK.

- 2026-05-01: spawn de plateforme `SP_func_plat`.
- Preuve: comparaison directe `Quake-2-master/game/g_func.c:513-579` avec `packages/game/src/g_func.ts:1151-1218`.
- Correction appliquee: ajout de couverture ciblee dans `scripts/verify/quake2-g-func.ts` pour les defaults `speed`/`accel`/`decel`/`dmg`, le scaling des proprietes explicites, `solid`/`movetype`, callbacks `blocked`/`use`, `pos1`/`pos2`, etats `STATE_BOTTOM`/`STATE_UP`, `moveinfo` et sons.
- Effets verifies: `SP_func_plat` efface les angles, configure un brush pusher, applique les memes valeurs par defaut que le C, calcule la position basse via `height` ou `lip`, cree le trigger interne, relie l'entite, renseigne `moveinfo` et enregistre les sons `plats/pt1_*`.
- Branchement: `SP_func_plat` est referencee dans la table `g_spawn.ts` pour `func_plat`, appelee par `ED_CallSpawn` pendant `SpawnEntities`, puis ses callbacks sont atteignables par triggers/use/blocked et par le flux `G_RunFrame`/physique locale.
- Integration: aucune logique parallele dans `apps/web`; le navigateur consomme les sons gameplay et les snapshots/interpolations de brush models. `packages/renderer-three` ne porte pas le spawn gameplay et consomme les entites brush via les snapshots/runtime adapters; pas de correction renderer attendue.
- Tests: `npm run verify:g-func` OK; `npm run typecheck` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:web-render-order` OK.

- 2026-05-01: trigger interne de plateforme `Touch_Plat_Center`, `plat_spawn_inside_trigger` et locale `trigger`.
- Preuve: comparaison directe `Quake-2-master/game/g_func.c:436-493` avec `packages/game/src/g_func.ts:1051-1136`.
- Correction appliquee: ajout de couverture ciblee dans `scripts/verify/quake2-g-func.ts` pour les branches non-client/client mort/client vivant, le delai `STATE_TOP`, la creation du helper `plat_trigger`, les bornes 25px/lip, `PLAT_LOW_TRIGGER` et le collapse X/Y; le code runtime etait conforme.
- Effets verifies: `Touch_Plat_Center` conserve les gardes joueur vivant, rebascule du trigger vers `enemy`, declenche `plat_go_up` depuis `STATE_BOTTOM` et retarde la descente depuis `STATE_TOP`; `plat_spawn_inside_trigger` alloue un trigger local `MOVETYPE_NONE`/`SOLID_TRIGGER` avec `enemy = ent` et les memes bounds que le C.
- Branchement: `plat_spawn_inside_trigger` est appelee par `SP_func_plat`; `Touch_Plat_Center` est affectee au helper `touch` puis appelee par le flux trigger (`G_TouchTriggers`/`G_TouchSolids`) pendant l'avancement runtime `G_RunFrame`/physique locale.
- Integration: aucune compensation gameplay dans `apps/web`; le navigateur consomme les sons runtime et les snapshots/interpolations de brush models. `packages/renderer-three` ne porte pas la logique trigger et consomme les brush snapshots via `gl-world-scene-adapter`; pas de correction renderer attendue.
- Tests: `npm run verify:g-func` OK; `npm run typecheck` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:web-render-order` OK; `npm run verify:full-game:render-source` bloque sur import manquant `packages/client/src/types.js` hors lot.

- 2026-04-30: callbacks de plateforme `plat_go_up`, `plat_blocked`, `Use_Plat`.
- Preuve: comparaison directe `Quake-2-master/game/g_func.c:395-433` avec `packages/game/src/g_func.ts:990-1048`.
- Correction appliquee: `plat_blocked` ne reduit plus les effets a un log/free local; il appelle `T_Damage` avec 100000 pour les bloqueurs non-monstre/non-client, declenche `BecomeExplosion1` si l'entite est encore `inuse`, applique `T_Damage` avec `self.dmg` aux monstres/clients, puis inverse le mouvement selon `STATE_UP`/`STATE_DOWN`.
- Effets verifies: `plat_go_up` conserve sons start/middle via `startMoverLoop`, STATE_UP et `Move_Calc(... start_origin, plat_hit_top)`; `Use_Plat` retourne si `think` est deja actif puis descend via `plat_go_down`; `plat_blocked` suit les branches C de dommages/explosion et inversion.
- Branchement: `plat_go_up` est appelee par `Touch_Plat_Center` et par `plat_blocked`; `plat_blocked` est affectee a `ent.blocked` par `SP_func_plat` puis appelee par le flux push de `g_phys`; `Use_Plat` est affectee a `ent.use` pour les plateformes ciblees et appelee par les triggers/G_UseTargets. Execution via `G_RunFrame`/`G_RunEntity`/`SV_RunThink` pour les thinks programmes.
- Integration: aucune compensation gameplay dans `apps/web`; les sons gameplay et temp entities sont produits par le runtime. `packages/renderer-three` n'a pas a porter cette logique et consomme les poses/snapshots de brush models; l'explosion devient une temp entity runtime.
- Tests: `npm run verify:g-func` OK; `npm run typecheck` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:full-game:audio-routing` bloque sur import manquant `packages/client/src/types.js` hors lot.

- 2026-04-30: callbacks de plateforme `plat_go_down`, `plat_hit_top`, `plat_hit_bottom` et doublon matrice `plat_go_down`.
- Preuve: comparaison directe `Quake-2-master/game/g_func.c:356-392` avec `packages/game/src/g_func.ts:933-987`.
- Effets verifies: sons start/end via `CHAN_NO_PHS_ADD + CHAN_VOICE`/`ATTN_STATIC`, respect `FL_TEAMSLAVE`, `s.sound`, transitions `STATE_DOWN`/`STATE_TOP`/`STATE_BOTTOM`, `think = plat_go_down`, `nextthink = level.time + 3`, `Move_Calc(... end_origin, plat_hit_bottom)`.
- Branchement: `plat_go_down` est appelee par `Use_Plat`, `Touch_Plat_Center` et le `think` programme par `plat_hit_top`; `plat_hit_top`/`plat_hit_bottom` sont callbacks de fin de `Move_Calc`; execution via `G_RunFrame`/`G_RunEntity`/`SV_RunThink`.
- Integration: aucune compensation gameplay dans `apps/web`; les sons gameplay sont drainables via `drainLocalGameplaySounds`, les poses de brush models passent par snapshots/interpolation. `packages/renderer-three` consomme les brush snapshots via `gl-world-scene-adapter`, donc pas de correction renderer attendue dans ce lot.
- Tests: `npm run verify:g-func` OK; controle inline `npx tsx -e` OK pour les trois callbacks; `npm run verify:full-game:three-renderer` OK; `npm run verify:full-game:audio-routing` bloque sur import manquant `packages/client/src/types.js` hors lot.

- 2026-04-30: suite du mouvement accelere `AccelerationDistance`, `plat_CalcAcceleratedMove`, `plat_Accelerate` et temporaires associes.
- Preuve: comparaison directe `Quake-2-master/game/g_func.c:233-330` avec `packages/game/src/g_func.ts:142-215,2093-2095`.
- Effets verifies: formule `AccelerationDistance`, `move_speed`, branche distance courte, `decel_distance`, calcul de vitesse plafonnee, reprise `next_speed`, deceleration, crossover pleine vitesse vers deceleration, acceleration simple et acceleration/crossover.
- Branchement: `plat_CalcAcceleratedMove` et `plat_Accelerate` sont appeles par `Think_AccelMove`, lui-meme programme par `Move_Calc`; flux execute par `G_RunFrame`/`G_RunEntity`/`SV_RunThink`.
- Integration: aucune logique parallele dans `apps/web`; les deplacements de brush models sortent par snapshots client/serveur. `packages/renderer-three` consomme ces poses via les brush model snapshots, donc pas de correction renderer attendue dans ce lot.
- Tests: `npm run verify:g-func` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:full-game:server-snapshots` bloque sur import manquant `packages/client/src/screen.js` hors lot.

- 2026-04-30: mouvement accelere `Think_AccelMove` et `Move_Calc`.
- Preuve: comparaison directe `Quake-2-master/game/g_func.c:112-140,334-353` avec `packages/game/src/g_func.ts:217-277`.
- Effets verifies: remise a zero `velocity`, calcul `dir`/`remaining_distance`, stockage `endfunc`, branche lineaire `Move_Begin`, branche acceleree `Think_AccelMove`, `current_speed`, `velocity`, `nextthink`, transition `Move_Final` puis `Move_Done`, cas `FL_TEAMSLAVE`/`teammaster`.
- Branchement: `Move_Calc` appelee par portes, plats, boutons, trains et portes secretes; les thinks sont executes par `G_RunFrame`/`G_RunEntity`/`SV_RunThink`.
- Integration: aucune compensation directe dans `apps/web` ou `packages/renderer-three`; les positions de brush models passent par les snapshots/render adapters. Tests full-game web/renderer tentes mais bloques par imports `.js` manquants hors lot.
- Tests: `npm run verify:g-func` OK; harness inline `Move_Calc`/`Think_AccelMove` OK.

- 2026-04-30: mouvement lineaire `Move_Done`, `Move_Final`, `Move_Begin` et variable locale `frames`.
- Preuve: comparaison directe `Quake-2-master/game/g_func.c:76-109` avec `packages/game/src/g_func.ts:76-130`.
- Effets verifies: `velocity`, `think`, `nextthink`, `remaining_distance`, appel `endfunc`, calcul `floor(frames)`.
- Branchement: `Move_Calc` programme/appelle `Move_Begin`; `G_RunFrame` execute les `think` via le runtime game.
- Integration: aucune compensation directe dans `apps/web` ou `packages/renderer-three`.
- Tests: `npm run verify:g-func` OK; test inline `Move_*` OK.

- 2026-04-30: macros initiales `PLAT_LOW_TRIGGER`, `STATE_TOP`, `STATE_BOTTOM`, `STATE_UP`, `STATE_DOWN`, `DOOR_START_OPEN`, `DOOR_REVERSE`, `DOOR_CRUSHER`, `DOOR_NOMONSTER`, `DOOR_TOGGLE`, `DOOR_X_AXIS`, `DOOR_Y_AXIS`.
- Preuve: comparaison directe `Quake-2-master/game/g_func.c:56-69` avec `packages/game/src/runtime.ts:859-870`.
- Branchement: constantes importees par `packages/game/src/g_func.ts` et reexportees par `packages/game/src/index.ts`.
- Integration: aucune reference directe dans `apps/web` ou `packages/renderer-three`; logique runtime uniquement.
- Tests: `npm run verify:g-func` OK.

## Prochain lot recommande

- Continuer avec `door_secret_move2` et `door_secret_move3`, puis leurs doublons matriciels si le lot reste petit.

## Blocages

- `npm run verify:full-game:audio-routing` bloque sur import manquant `packages/client/src/types.js` hors lot.

## Decisions

- Les macros de `g_func.c` sont portees comme constantes runtime partagees dans `packages/game/src/runtime.ts`; ce rattachement reste acceptable car `g_func.ts` les consomme directement et `index.ts` les expose depuis le package game.

## Passe rapide post-validation

- 2026-04-30: controle cible des lignes deja `Valide` de la matrice `game_g_func.c`. Branchement runtime confirme pour les macros via imports/reexports runtime et pour `Move_Done`/`Move_Final`/`Move_Begin`/`frames` via `Move_Calc`, `G_RunFrame`, `G_RunEntity` et `SV_RunThink`; aucune reference symbolique attendue dans `apps/web` ou `packages/renderer-three`, les sorties visibles passant par les snapshots client/refresh et les transforms d'entites/brush models.
