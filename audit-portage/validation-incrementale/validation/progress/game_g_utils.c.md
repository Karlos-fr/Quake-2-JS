# Progress - Quake-2-master/game/g_utils.c

## Etat courant

- Statut: Termine
- Dernier lot traite: blocage `vectoangles` -> consommateur `g_weapon.ts`.
- Verdict du lot: valide.

## Preuves session

- C source compare: `Quake-2-master/game/g_utils.c`
- TS cible compare: `packages/game/src/g_utils.ts`
- Commentaire d'en-tete verifie et mis a jour sur `G_ProjectSource` (`Original name`, `Source`, `Category`, `Fidelity level`, `Behavior`, `Porting notes`).
- Comparaison C/TS `G_ProjectSource`: formule composante par composante equivalente a `point + forward * distance[0] + right * distance[1]`, avec ajout direct de `distance[2]` sur Z.
- Difference de signature documentee: le port TS retourne un nouveau `vec3_t` au lieu de muter le parametre C `result`.
- Runtime verifie: helper atteint depuis des flux gameplay normaux, notamment tirs monstres (`monster_fire_*` via fichiers `m_*`), recherche AI et drop d'item; ces flux sont appeles depuis les callbacks runtime portees et les frames gameplay.
- `apps/web`: integration attendue indirecte via le host full-game/local qui execute le runtime porte; aucune logique parallele web ne remplace ce calcul.
- `packages/renderer-three`: consommation attendue indirecte car le helper positionne des projectiles, tirs, traces et items visibles; les sorties passent ensuite par les entites serveur, temp entities, dlights/particules ou frames client consommees par le pipeline renderer.

## Session - G_Find / s

- C source compare: `Quake-2-master/game/g_utils.c`
- TS cible compare: `packages/game/src/g_utils.ts`
- Commentaire d'en-tete verifie sur `G_Find` (`Original name`, `Source`, `Category`, `Fidelity level`, `Behavior`, `Porting notes`).
- Comparaison C/TS `G_Find`: depart au debut si `from == NULL`, reprise juste apres `from`, iteration jusqu'a la fin des edicts, skip des entites non `inuse`, lecture du champ string, skip des champs null/non-string, comparaison insensible a la casse comme `Q_stricmp`, retour `null` en fin de liste.
- Local C `s`: non applicable comme entite autonome; il correspond a la valeur locale TS `value` lue depuis le champ nomme.
- Runtime verifie: helper atteint depuis des flux gameplay normaux (`G_PickTarget`, `G_UseTargets`, spawns/targets, monstres, changement de niveau, points de spawn et intermissions) appeles par les frames serveur/gameplay.
- `apps/web`: integration attendue indirecte via le host full-game/local qui execute le runtime porte; aucune logique parallele web ne remplace cette recherche d'entites.
- `packages/renderer-three`: pas de sortie renderer directe produite par `G_Find`; effets visibles indirects possibles via choix de targets, spawns, camera/intermission ou entites activees, deja consommes par snapshots/refresh frame et adapters renderer.

## Tests lances

- `npm run verify:g-utils`
- `npm run verify:full-game:server-host`
- `npm run verify:local-gameplay-sync`
- `npm run verify:web-render-order`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

Session `G_Find` / `s`:

- `npm run verify:g-utils`
- `npm run verify:full-game:server-host`
- `npm run verify:local-gameplay-sync`
- `npm run verify:web-render-order`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

Session `findradius` / `j`:

- `npm run verify:g-utils`
- `npx tsx ./scripts/verify/quake2-g-combat.ts`
- `npm run verify:g-weapon`
- `npm run verify:full-game:server-host`
- `npm run verify:local-gameplay-sync`
- `npm run verify:web-render-order`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

Session `MAXCHOICES` / `G_PickTarget` / `ent` / `num_choices` / `choice`:

- `npm run verify:g-utils`
- `npm run verify:full-game:server-host`
- `npm run verify:local-gameplay-sync`
- `npm run verify:web-render-order`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck` (echec hors lot: `apps/web/src/full-game.ts:768`, `unknown` non assignable a `entity_state_t`)

## Corrections

- `packages/game/src/g_utils.ts`: ajout de la note d'en-tete sur la signature TS de `G_ProjectSource`.
- `scripts/verify/quake2-g-utils.ts`: ajout d'un cas mixte couvrant la formule C avec bases non triviales.
- `scripts/verify/quake2-g-utils.ts`: ajout de preuves ciblees pour `G_Find` couvrant reprise apres `from`, skip `inuse`, champ null/non-string, fin de liste, comparaison insensible a la casse et local `s` porte comme `value`.
- `scripts/verify/quake2-g-utils.ts`: ajout de preuves ciblees pour `findradius` couvrant reprise apres `from`, skip `!inuse`, skip `SOLID_NOT`, centre bbox `origin + (mins + maxs) * 0.5`, distance egale au rayon acceptee, fin de liste et local `j` remplace par construction directe du vecteur `eorg`.
- `packages/game/src/g_utils.ts`: ajout de `MAXCHOICES`, utilisation dans `G_PickTarget`, commentaire d'en-tete complete, et correction de fidelite pour distinguer une chaine vide d'un targetname `NULL`.
- `scripts/verify/quake2-g-utils.ts`: ajout de preuves ciblees pour `G_PickTarget` couvrant choix aleatoire borne, chaine vide non-NULL, avertissements `NULL`/cible absente, limite `MAXCHOICES`, et locaux `ent`/`num_choices`/`choice` portes comme valeurs locales TS.

## Prochain lot recommande

- Clarifier les lignes locales restantes `i` et `e` dans la matrice sans traiter les blocages `vectoyaw`/`vectoangles` au-dela du rappel.

## Session - local `v` de `tv`

- C source compare: `Quake-2-master/game/g_utils.c`.
- TS cible compare: `packages/game/src/g_utils.ts`.
- Collision verifiee: la ligne matrice pointait vers `packages/game/src/g_weapon.ts`, mais le `v` de `g_weapon.ts` est un local de `check_dodge` issu de `game/g_weapon.c`, sans ownership sur `game/g_utils.c`.
- Comparaison C/TS: dans `tv`, le C declare `float *v`, affecte `v = vecs[index]`, avance l'index circulaire, ecrit `x/y/z` dans `v[0..2]` puis retourne `v`; le port TS utilise le local `value = tvPool[tvIndex]`, avance `tvIndex`, ecrit les trois composantes et retourne `value`.
- Commentaire d'en-tete verifie sur `tv`: `Original name`, `Source`, `Category`, `Fidelity level`, `Behavior`, `Porting notes`; il documente deja `tvIndex`, et le local `v` est une implementation interne couverte par le comportement teste du pool.
- Runtime verifie: `tv` n'est pas requis comme branchement runtime direct pour le jeu porte courant; les anciens usages C connus comme `droptofloor` sont portes par vecteurs litteraux equivalents, et `tv` reste exporte/teste comme helper de compatibilite.
- `apps/web`: non applicable justifie en direct; le navigateur execute les flux gameplay portes via les hosts full-game/local et ne doit pas declencher ce local de helper.
- `packages/renderer-three`: non applicable justifie; le local `v` de `tv` ne produit ni modele, frame, image, particule, beam, dlight, temp entity, areabits, camera ni scene. Les effets visibles des consommateurs runtime passent par snapshots/adapters existants.
- Correction appliquee: `audit-portage/validation-incrementale/validation/matrices/game_g_utils.c.md` corrige la cible proprietaire vers `packages/game/src/g_utils.ts` / `value` et marque la ligne `Non applicable`.

Session local `v` de `tv`:

- `npm run verify:g-utils`
- `npm run typecheck`

## Session - G_FreeEdict

- C source compare: `Quake-2-master/game/g_utils.c`.
- Declaration H comparee: `Quake-2-master/game/g_local.h`.
- TS cible compare: `packages/game/src/g_utils.ts`.
- Commentaire d'en-tete verifie et complete sur `G_FreeEdict` (`Original name`, `Source`, `Category`, `Fidelity level`, `Behavior`).
- Comparaison C/TS `G_FreeEdict`: le C appelle toujours `gi.unlinkentity(ed)`, retourne sans liberer les edicts proteges `ed - g_edicts <= maxclients + BODY_QUEUE_SIZE`, puis remet l'edict normal a zero, `classname = "freed"`, `freetime = level.time`, `inuse = false`; le port TS appelle maintenant `unlinkGameEntity` avant la garde, conserve les slots proteges en `inuse`, et delegue la remise a zero runtime des slots normaux a `freeGameEntity`.
- Correction appliquee: `packages/game/src/g_utils.ts` deplace l'unlink avant la garde des edicts proteges; `scripts/verify/quake2-g-utils.ts` verifie l'unlink des slots proteges, la liberation des slots normaux, `classname = "freed"` et `freetime = runtime.time`.
- Runtime verifie: `G_FreeEdict` est atteint depuis les flux gameplay normaux portes (`G_UseTargets` delayed/killtarget, items/drop, AI tempgoal, gibs/debris, monstres, boss, projectiles, tourelles, triggers/targets et client/body queue) appeles par spawns, uses, thinks, tirs, morts et frames serveur.
- `apps/web`: integration attendue indirecte via `apps/web/src/full-game-server-host.ts` et le host local/full-game qui executent le runtime serveur porte; aucune logique web parallele ne remplace la liberation d'edicts.
- `packages/renderer-three`: pas de sortie renderer directe propre a la liberation, mais l'effet attendu est visible indirectement par disparition d'entites/modeles/projectiles/gibs et arret de collisions/refresh via snapshots et adapters renderer; tests full-game renderer OK.

Session `G_FreeEdict`:

- `npm run verify:g-utils`
- `npm run typecheck`
- `npm run verify:full-game:server-host`
- `npm run verify:local-gameplay-sync`
- `npm run verify:web-render-order`
- `npm run verify:full-game:three-renderer`

## Session - findradius / j

- C source compare: `Quake-2-master/game/g_utils.c`
- TS cible compare: `packages/game/src/g_utils.ts`
- Commentaire d'en-tete verifie sur `findradius` (`Original name`, `Source`, `Category`, `Fidelity level`, `Behavior`, `Porting notes`).
- Comparaison C/TS `findradius`: depart au debut si `from == NULL`, reprise juste apres `from`, iteration jusqu'a la fin des entites, skip des entites absentes/non `inuse`, skip `SOLID_NOT`, calcul du centre bbox et du vecteur `eorg`, rejet strict seulement si `VectorLength(eorg) > rad`, retour `null` en fin de liste.
- Local C `j`: non applicable comme entite autonome; la boucle C sur les 3 composantes correspond a la construction directe du tuple `eorg` TS, couverte par test.
- Runtime verifie: helper atteint depuis les flux normaux `T_RadiusDamage`, `bfg_explode` et `bfg_think`, eux-memes appeles par explosions, projectiles et pensees gameplay.
- `apps/web`: integration attendue indirecte via les hosts full-game/local qui executent le runtime porte; aucune logique web parallele ne remplace l'enumeration de rayon.
- `packages/renderer-three`: pas de sortie renderer directe produite par `findradius`; les sorties visibles attendues sont indirectes via dommages, morts, explosions, temp entities BFG/rocket, particules/dlights et entites serveur deja consommes par snapshots/refresh frame/adapters renderer.

## Session - MAXCHOICES / G_PickTarget / ent / num_choices / choice

- C source compare: `Quake-2-master/game/g_utils.c`
- TS cible compare: `packages/game/src/g_utils.ts`
- Commentaire d'en-tete verifie et complete sur `G_PickTarget` (`Original name`, `Source`, `Category`, `Fidelity level`, `Behavior`, `Porting notes`).
- Comparaison C/TS `MAXCHOICES`: macro C `#define MAXCHOICES 8` portee comme constante TS locale `MAXCHOICES = 8`, utilisee pour borner le tableau de choix.
- Comparaison C/TS `G_PickTarget`: retour `null` avec warning si targetname `NULL`, recherche successive via `G_Find` sur `targetname`, collecte limitee aux 8 premiers choix, warning et retour `null` si aucun choix, choix final aleatoire parmi les choix collectes. Correction appliquee pour traiter `""` comme chaine C non-NULL.
- Locaux C `ent`, `num_choices`, `choice`: non applicables comme entites autonomes; ils correspondent respectivement a `ent`, `choices.length` et `choices` dans le scope TS de `G_PickTarget`.
- Runtime verifie: `G_PickTarget` est appelee depuis des flux gameplay normaux (`FoundTarget`/combat points, `func_train`, `path_corner`, `point_combat`, acteurs, tourelles et monstres), eux-memes atteignables par spawns, touches, thinks et frames gameplay.
- `apps/web`: integration attendue indirecte via `apps/web/src/full-game-server-host.ts`, qui execute les frames serveur/runtime portees; aucune logique web parallele ne remplace la selection de target.
- `packages/renderer-three`: pas de sortie renderer directe produite par `G_PickTarget`; les effets visibles attendus sont indirects via mouvement de trains/monstres/acteurs/tourelles, evenements de teleportation et entites serveur consommes par snapshots, refresh frames et adapters renderer.

## Blocages

- Aucun blocage courant pour la derniere session. `npm run typecheck` passe.

## Session - G_TouchTriggers

- C source compare: `Quake-2-master/game/g_utils.c`.
- Declaration H comparee: `Quake-2-master/game/g_local.h`.
- TS cible compare: `packages/game/src/touch.ts`.
- Commentaire d'en-tete verifie sur `G_TouchTriggers` (`Original name`, `Source`, `Category`, `Fidelity level`, `Behavior`, `Constraints`).
- Comparaison C/TS `G_TouchTriggers`: rejet des clients/monstres morts, requete `AREA_TRIGGERS` sur les bounds absolues de l'acteur, iteration dans l'ordre retourne par `BoxEdicts`, skip des triggers liberes avant leur tour, skip des triggers sans callback `touch`, appel du callback du trigger avec l'acteur.
- Correction appliquee: `scripts/verify/quake2-g-utils.ts` ajoute des preuves ciblees pour les skips `!inuse`/sans `touch`, les acteurs clients morts et les monstres morts. Pas de correction gameplay necessaire dans `packages/game/src/touch.ts`.
- Runtime verifie: `G_TouchTriggers` est branche via `touchTriggerEntities` depuis les flux normaux portes de physique et mouvement (`g_phys.ts`, `m_move.ts`, `p_client.ts`), atteignables par les frames serveur/gameplay et les mouvements joueur/monstres/pushers.
- `apps/web`: integration attendue indirecte via les hosts full-game/local qui executent le runtime porte; aucune logique web parallele ne remplace la detection de triggers. Les effets touches attendus (portes, plats, trigger_* et sons/messages) passent par le runtime, events et snapshots.
- `packages/renderer-three`: pas de sortie renderer directe propre a `G_TouchTriggers`, mais des sorties visibles peuvent etre produites par les callbacks touches (portes/plats/brush models, changements de solidite, sons, temp entities, particules/dlights selon trigger). Le flux snapshots/refresh frame/adapters Three consomme ces sorties; tests renderer OK.

Session `G_TouchTriggers`:

- `npm run verify:g-utils`
- `npm run verify:collision:phase7`
- `npm run typecheck`
- `npm run verify:full-game:server-host`
- `npm run verify:local-gameplay-sync`
- `npm run verify:web-render-order`
- `npm run verify:full-game:three-renderer`

## Session - G_TouchSolids

- C source compare: `Quake-2-master/game/g_utils.c`.
- Declaration H comparee: `Quake-2-master/game/g_local.h`.
- TS cible compare: `packages/game/src/touch.ts`.
- Commentaire d'en-tete mis a jour sur `G_TouchSolids` (`Original name`, `Source`, `Category`, `Fidelity level`, `Behavior`, `Constraints`, `Porting notes`).
- Comparaison C/TS `G_TouchSolids`: requete `AREA_SOLID` sur les bounds absolues de l'entite, iteration dans l'ordre retourne par `BoxEdicts`, skip des solides liberes avant leur tour, appel du callback de l'entite avec l'ordre C `solid, trigger`, puis arret si le trigger est libere pendant le callback.
- Correction appliquee: `packages/game/src/touch.ts` documente l'ordre d'arguments C et l'adapter `BoxEdicts`; `scripts/verify/quake2-g-utils.ts` couvre la branche trigger sans callback; `scripts/verify/quake2-collision-phase7.ts` aligne le scenario `G_TouchSolids` sur l'ordre d'arguments C.
- Runtime verifie: l'export est present et teste; aucun appel direct C ni TS hors tests n'a ete trouve dans le jeu de base porte. Le commentaire C decrit un helper a appeler apres liaison d'un trigger en gameplay, mais le flux base `trigger_enable` C ne l'appelle pas non plus; pas de branchement runtime ajoute pour eviter d'introduire un comportement absent du source original.
- `apps/web`: integration directe non applicable justifiee; le web execute les hosts full-game/local et ne doit pas compenser ce helper non appele par une logique parallele. Les flux de touches actifs passent par `G_TouchTriggers`/physique et les snapshots/evenements existants.
- `packages/renderer-three`: pas de sortie renderer directe propre a `G_TouchSolids`; s'il etait appele par un mod ou un futur flux gameplay, ses effets visibles seraient indirects via callbacks de trigger, changements d'entites/solidite, sons, temp entities ou snapshots deja consommes par le renderer. Aucun branchement renderer dedie attendu pour le jeu de base.

Session `G_TouchSolids`:

- `npm run verify:g-utils`
- `npm run verify:collision:phase7`
- `npm run typecheck`
- `npm run verify:full-game:server-host`
- `npm run verify:local-gameplay-sync`
- `npm run verify:web-render-order`
- `npm run verify:full-game:three-renderer`

## Session - Think_Delay / G_UseTargets / t

- C source compare: `Quake-2-master/game/g_utils.c`
- TS cible compare: `packages/game/src/runtime.ts` pour `Think_Delay`, `packages/game/src/g_utils.ts` pour `G_UseTargets`.
- Commentaire d'en-tete corrige sur `Think_Delay`: `Original name`, `Source`, `Category: Ported`, `Fidelity level: Strict`, comportement et notes de portage explicites.
- Commentaire d'en-tete verifie et mis a jour sur `G_UseTargets`: `Original name`, `Source`, `Category: Ported`, `Fidelity level: Close`, emission via adapters runtime documentee.
- Comparaison C/TS `Think_Delay`: appel a `G_UseTargets` avec `ent.activator`, puis liberation de l'entite temporaire; le port TS conserve l'ordre avec runtime explicite.
- Comparaison C/TS `G_UseTargets`: branche `delay` avec spawn `DelayedUse`, `nextthink = time + delay`, callback `Think_Delay`, copie `activator`/`message`/`target`/`killtarget`, warning sans activator, puis retour. Branche immediate: message vers activator non-monstre, son `noise_index` ou `misc/talk1.wav`, liberation des `killtarget`, firing des `target`, skip door -> `func_areaportal`, warning self-use, retour si l'entite source a ete liberee.
- Local C `t`: non applicable comme entite autonome; il correspond aux locaux TS `delayed` dans la branche delay et `target` dans les boucles kill/fire targets.
- Corrections appliquees: `packages/game/src/g_utils.ts` emet maintenant `centerprint` et son runtime pour les messages de `G_UseTargets`, respecte le filtre `SVF_MONSTER`, journalise le warning `Think_Delay with no activator`, et utilise les metadonnees son Quake (`CHAN_AUTO`, `ATTN_NORM`). `packages/game/src/runtime.ts` documente `Think_Delay` comme fonction portee et rend `runPendingThinks` tolerant aux slots vides pendant la recherche de thinkers.
- Tests ajoutes: `scripts/verify/quake2-g-utils.ts` couvre la branche delay, la copie des champs, l'execution de `Think_Delay`, la liberation de l'entite temporaire, le warning sans activator, centerprint/son message, activator monstre, killtarget, target.use, self-use et skip `func_areaportal`.
- Runtime verifie: `G_UseTargets` est atteint depuis les flux normaux portes (`g_func`, `g_items`, `g_monster`, `g_misc`, `g_target`, `g_trigger`, `m_actor`), eux-memes appeles par spawns, touches, thinks et frames gameplay; `Think_Delay` est atteint via `runPendingThinks` depuis les entites temporaires schedulees.
- `apps/web`: integration attendue indirecte via le runtime local/full-game. Les centerprints et sons ajoutes sont consommes par `local-client-controller.ts` / `full-game-render-loop.ts`; aucune logique web parallele ne remplace `G_UseTargets`.
- `packages/renderer-three`: pas de sortie renderer directe propre a ces fonctions. Les sorties visibles attendues sont indirectes: entites activees/liberees, portes/triggers, sons, centerprints, changements de scene/areaportals potentiels et snapshots; le flux renderer Three consomme les entites/snapshots/sons via les adapters existants, tests full-game renderer OK.

Session `Think_Delay` / `G_UseTargets` / `t`:

- `npm run verify:g-utils`
- `npm run verify:full-game:server-host`
- `npm run verify:local-gameplay-sync`
- `npm run verify:web-render-order`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

## Session - tv / index

- C source compare: `Quake-2-master/game/g_utils.c`.
- TS cible compare: `packages/game/src/g_utils.ts`.
- Commentaire d'en-tete mis a jour sur `tv` (`Original name`, `Source`, `Category`, `Fidelity level`, `Behavior`, `Porting notes`).
- Comparaison C/TS `tv`: signature a trois flottants/nombres, retour d'un vecteur temporaire mutable, pool de 8 vecteurs, incrementation circulaire `(index + 1) & 7`, ecriture des composantes `x/y/z`, puis retour du slot courant.
- Local statique C `index`: non applicable comme entite autonome; il correspond au `tvIndex` module-scope TS et sa rotation est couverte par test.
- Runtime verifie: en C `tv` sert de helper convenience aux vecteurs temporaires de `droptofloor`; le port TS de `droptofloor` utilise des littéraux de vecteurs equivalentes pour `mins`, `maxs` et la destination de trace, donc aucun branchement runtime direct de `tv` n'est requis pour conserver le comportement. Le helper exporte reste disponible et teste pour les futurs consommateurs portes.
- `apps/web`: non applicable justifie pour `tv` en direct; le web ne doit pas declencher ce helper, il execute les flux gameplay portes via le host full-game/local. Les preuves web confirment que le chemin navigateur ne remplace pas ce flux.
- `packages/renderer-three`: pas de sortie visible directe produite par `tv`; les sorties visibles attendues des anciens consommateurs C passent par entites/items/snapshots et sont consommees par le renderer via les adapters existants.
- Corrections appliquees: `packages/game/src/g_utils.ts` documente le lien `index` -> `tvIndex`; `scripts/verify/quake2-g-utils.ts` verifie la rotation/reutilisation du pool de 8 vecteurs et la conservation des slots non reutilises.

Session `tv` / `index`:

- `npm run verify:g-utils`
- `npm run typecheck`
- `npm run verify:full-game:server-host`
- `npm run verify:local-gameplay-sync`
- `npm run verify:web-render-order`
- `npm run verify:full-game:three-renderer`

## Session - vtos / index / s

- C source compare: `Quake-2-master/game/g_utils.c`.
- TS cible compare: `packages/game/src/g_utils.ts`.
- Commentaire d'en-tete mis a jour sur `vtos` (`Original name`, `Source`, `Category`, `Fidelity level`, `Behavior`, `Porting notes`).
- Comparaison C/TS `vtos`: signature vectorielle equivalente, format `(%i %i %i)`, cast entier C represente par `Math.trunc`, pool statique de 8 chaines, incrementation circulaire `(index + 1) & 7`, puis retour de la chaine formatee.
- Local statique C `index`: non applicable comme entite autonome; il correspond a `vtosIndex` module-scope TS et sa rotation est couverte par test.
- Local C `s`: non applicable comme entite autonome; il correspond a `value` local TS, la chaine formatee stockee dans le slot courant.
- Runtime verifie: `vtos` est atteint depuis des flux gameplay normaux de logs/diagnostics portes (`g_ai`, `g_func`, `g_misc`, `g_monster`, `g_target`, `g_trigger`, `g_turret`, `m_actor`) eux-memes appeles par spawns, uses, touches, thinks et frames gameplay.
- `apps/web`: integration attendue indirecte via les hosts full-game/local qui executent le runtime porte et consomment les logs; aucune logique web parallele ne remplace le formatage `vtos`.
- `packages/renderer-three`: pas de sortie visible directe produite par `vtos`; les sorties renderer attendues des entites concernees passent par snapshots, temp entities, sons, particules, areabits ou frames client, pas par cette chaine de diagnostic.
- Corrections appliquees: `packages/game/src/g_utils.ts` documente le mapping `index` -> `vtosIndex` et `s` -> `value`; `scripts/verify/quake2-g-utils.ts` verifie la troncature entiere et la rotation du pool de 8 chaines.

Session `vtos` / `index` / `s`:

- `npm run verify:g-utils`
- `npm run typecheck`
- `npm run verify:full-game:server-host`
- `npm run verify:local-gameplay-sync`
- `npm run verify:web-render-order`
- `npm run verify:full-game:three-renderer`

## Session - G_SetMovedir

- C source compare: `Quake-2-master/game/g_utils.c`.
- TS cible compare: `packages/game/src/g_utils.ts`.
- Commentaire d'en-tete verifie sur `G_SetMovedir` (`Original name`, `Source`, `Category`, `Fidelity level`, `Behavior`).
- Comparaison C/TS: sentinelle `VEC_UP` -> `MOVEDIR_UP`, sentinelle `VEC_DOWN` -> `MOVEDIR_DOWN`, sinon `AngleVectors(angles).forward` dans `movedir`, puis remise a zero des trois composantes de `angles`.
- Runtime verifie: `G_SetMovedir` est atteint depuis les flux normaux portes de spawn/use/think (`g_func`, `g_trigger`, `g_target`, `m_actor`) via `ED_CallSpawn`, callbacks gameplay et frames serveur.
- `apps/web`: integration attendue indirecte via les hosts full-game/local qui executent le runtime porte; aucune logique web parallele ne remplace la conversion `angles` -> `movedir`.
- `packages/renderer-three`: pas de sortie renderer directe propre a la fonction, mais ses consommateurs produisent des sorties visibles indirectes (brush models mouvants, triggers, target_splash particules, target_blaster projectiles, target_laser beams, gibs/spawns). Les snapshots, refresh frames, particules, beams, dlights et brush model snapshots sont consommes par le flux web/renderer existant.
- Correction appliquee: `scripts/verify/quake2-g-utils.ts` couvre maintenant les branches haut, bas et `AngleVectors`, ainsi que l'effacement de `angles`.

Session `G_SetMovedir`:

- `npm run verify:g-utils`
- `npm run typecheck`
- `npm run verify:full-game:server-host`
- `npm run verify:local-gameplay-sync`
- `npm run verify:web-render-order`
- `npm run verify:full-game:three-renderer`

## Session - vectoyaw / yaw

- C source compare: `Quake-2-master/game/g_utils.c`.
- TS cible compare: `packages/game/src/g_utils.ts`.
- Commentaire d'en-tete mis a jour sur `vectoyaw` (`Original name`, `Source`, `Category`, `Fidelity level`, `Behavior`, `Porting notes`) pour documenter le local C `yaw` et la troncature du cast C via `Math.trunc`.
- Comparaison C/TS `vectoyaw`: branche `vec[PITCH] == 0` portee par `vec[0] === 0`, retour 0 pour vecteur horizontal nul, 90 pour Y positif, -90 pour Y negatif, sinon `atan2(Y, X) * 180 / PI`, troncature entiere puis ajout de 360 si negatif.
- Local C `yaw`: non applicable comme entite autonome; il correspond au local TS `yaw`, couvert par les tests ajoutes.
- Runtime verifie: l'export officiel `g_utils.vectoyaw` est atteint depuis des flux gameplay normaux (`g_ai`, `g_monster`, `g_misc`, `m_actor`, `m_boss*`) appeles par spawns, AI, thinks et frames gameplay. Manque ouvert hors perimetre: `packages/game/src/p_trail.ts` conserve un helper prive `vectoyaw` declare comme port de `game/g_utils.c` au lieu de consommer l'export officiel.
- `apps/web`: integration attendue indirecte via les hosts full-game/local qui executent le runtime porte; aucune logique web parallele ne remplace le calcul yaw. Le manque `p_trail.ts` reste runtime package, pas une compensation web.
- `packages/renderer-three`: pas de sortie renderer directe propre a `vectoyaw`; ses consommateurs produisent des orientations d'entites, mouvements de monstres/acteurs/boss, projectiles ou markers de poursuite qui deviennent visibles via snapshots, frames/modeles/camera/scene selon le flux. Les tests renderer passent, mais le consommateur `p_trail.ts` doit etre aligne dans un lot separe.
- Correction appliquee: `packages/game/src/g_utils.ts` documente le local `yaw`; `scripts/verify/quake2-g-utils.ts` couvre les branches 0, +Y, -Y, diagonale, wrap negatif et troncature C.

Session `vectoyaw` / `yaw`:

- `npm run verify:g-utils`
- `npm run typecheck`
- `npm run verify:full-game:server-host`
- `npm run verify:local-gameplay-sync`
- `npm run verify:web-render-order`
- `npm run verify:full-game:three-renderer`

## Session - vectoangles / forward / pitch / yaw

- C source compare: `Quake-2-master/game/g_utils.c`.
- TS cible compare: `packages/game/src/g_utils.ts`.
- Commentaire d'en-tete mis a jour sur `vectoangles` (`Original name`, `Source`, `Category`, `Fidelity level`, `Behavior`, `Porting notes`) pour documenter les locaux C `forward`, `pitch`, `yaw` et la troncature du cast C via `Math.trunc`.
- Comparaison C/TS `vectoangles`: branche verticale `value1[1] == 0 && value1[0] == 0`, `yaw = 0`, `pitch = 90` ou `270`; sinon branches yaw `atan2(Y, X)`, axe Y positif/negatif, wrap positif, calcul `forward = sqrt(X*X + Y*Y)`, pitch `atan2(Z, forward)`, troncature entiere, wrap positif, puis sortie `[-pitch, yaw, 0]`.
- Locaux C `forward`, `pitch`, `yaw`: non applicables comme entites autonomes; ils correspondent aux locaux TS de meme nom, couverts par les tests ajoutes.
- Runtime verifie: l'export officiel `g_utils.vectoangles` est atteint depuis des flux gameplay normaux (`g_misc`, `g_turret`, `m_boss32`, `m_medic`, `m_parasite`, `m_soldier`, `m_tank`) appeles par spawns, callbacks, tirs, thinks et frames gameplay. Manque ouvert hors perimetre: `packages/game/src/g_weapon.ts` conserve un helper local `vectoangles` au lieu de consommer l'export officiel.
- `apps/web`: integration attendue indirecte via les hosts full-game/local qui executent le runtime porte; aucune logique web parallele ne remplace la conversion angles. Le manque `g_weapon.ts` reste runtime package, pas une compensation web.
- `packages/renderer-three`: pas de sortie renderer directe propre a `vectoangles`; ses consommateurs produisent des orientations de projectiles/entites, tourelles, monstres et impacts visibles via snapshots, modeles/frames, temp entities, dlights, particules, camera ou scene selon le flux. Les tests renderer passent, mais le consommateur `g_weapon.ts` doit etre aligne dans un lot separe.
- Correction appliquee: `packages/game/src/g_utils.ts` documente les locaux `forward`/`pitch`/`yaw`; `scripts/verify/quake2-g-utils.ts` couvre les branches verticales, axes, diagonale, wrap yaw, wrap pitch et troncature C.

Session `vectoangles` / `forward` / `pitch` / `yaw`:

- `npm run verify:g-utils`
- `npm run typecheck`
- `npm run verify:full-game:server-host`
- `npm run verify:local-gameplay-sync`
- `npm run verify:web-render-order`
- `npm run verify:full-game:three-renderer`

## Session - G_CopyString / out

- C source compare: `Quake-2-master/game/g_utils.c`.
- Declaration H comparee: `Quake-2-master/game/g_local.h`.
- TS cible compare: `packages/game/src/g_utils.ts`.
- Commentaire d'en-tete mis a jour sur `G_CopyString` (`Original name`, `Source`, `Category`, `Fidelity level`, `Behavior`, `Porting notes`) pour documenter le local C `out` et l'equivalence `TAG_LEVEL`.
- Comparaison C/TS `G_CopyString`: le C alloue `strlen(in)+1` avec `gi.TagMalloc(..., TAG_LEVEL)`, copie par `strcpy`, puis retourne `out`; le port TS retourne une chaine equivalente nouvelle via expression de copie, les chaines JS etant immutables.
- Local C `out`: non applicable comme entite autonome; il correspond a l'expression de retour TS, couverte par les tests ajoutes.
- Runtime verifie: aucune reference directe C ou TS hors declaration/export/test n'appelle `G_CopyString` dans le port courant; le comportement runtime attendu est conserve par les consommateurs modernes qui stockent directement des chaines JS immutables ou utilisent `ED_NewString` pour les champs map alloues niveau.
- `apps/web`: non applicable justifie pour `G_CopyString` en direct; le web execute le runtime porte et ne doit pas declencher ce helper de copie memoire sans consommateur gameplay.
- `packages/renderer-three`: non applicable justifie; `G_CopyString` ne produit ni modele, frame, image, particule, beam, dlight, temp entity, areabits, camera ni scene. Aucune sortie visible renderer n'est attendue.
- Correction appliquee: `packages/game/src/g_utils.ts` documente `out`/`TAG_LEVEL`; `scripts/verify/quake2-g-utils.ts` couvre la preservation de chaine normale, vide et avec nouvelle ligne.

Session `G_CopyString` / `out`:

- `npm run verify:g-utils`
- `npm run typecheck`
- `npm run verify:full-game:server-host`
- `npm run verify:local-gameplay-sync`
- `npm run verify:web-render-order`
- `npm run verify:full-game:three-renderer`

## Session - G_InitEdict

- C source compare: `Quake-2-master/game/g_utils.c`.
- Declaration H comparee: `Quake-2-master/game/g_local.h`.
- TS cible compare: `packages/game/src/g_utils.ts`.
- Commentaire d'en-tete verifie et complete sur `G_InitEdict` (`Original name`, `Source`, `Category`, `Fidelity level`, `Behavior`, `Porting notes`).
- Comparaison C/TS `G_InitEdict`: le C pose uniquement `inuse = true`, `classname = "noclass"`, `gravity = 1.0` et `s.number = e - g_edicts`; le port TS pose maintenant uniquement `inuse`, `classname`, `gravity` et `s.number = entity.index`.
- Correction appliquee: `packages/game/src/g_utils.ts` ne remet plus `freetime` a `-1` et ne remplace plus `monsterinfo`; ces nettoyages appartiennent a `G_FreeEdict`/`freeGameEntity` et a l'allocation du slot, pas a `G_InitEdict`.
- Tests ajoutes: `scripts/verify/quake2-g-utils.ts` couvre les quatre champs modifies par `G_InitEdict` et prouve que `freetime`/`monsterinfo` restent preserves.
- Runtime verifie: `G_InitEdict` est atteint depuis les flux normaux portes `G_Spawn`, `ClientBeginDeathmatch`, `ClientBegin`, `player_die`/body queue et les allocations appelees depuis spawns, target_spawner, projectiles/temporaires et connexions client.
- `apps/web`: integration attendue indirecte via `apps/web/src/full-game-server-host.ts` et le host local/full-game qui executent les flux serveur/runtime portes; aucune logique web parallele ne remplace l'initialisation d'edict.
- `packages/renderer-three`: pas de sortie renderer directe produite par `G_InitEdict`; les sorties visibles attendues sont indirectes via les entites initialisees ensuite (modeles, frames, projectiles, temp entities, sons/scene selon le spawn), consommees par snapshots/refresh frame/adapters renderer existants.

Session `G_InitEdict`:

- `npm run verify:g-utils`
- `npm run typecheck`
- `npm run verify:full-game:server-host`
- `npm run verify:local-gameplay-sync`
- `npm run verify:web-render-order`
- `npm run verify:full-game:three-renderer`

## Session - G_Spawn

- C source compare: `Quake-2-master/game/g_utils.c`.
- Declaration H comparee: `Quake-2-master/game/g_local.h`.
- TS cible compare: `packages/game/src/g_utils.ts`.
- Commentaire d'en-tete mis a jour sur `G_Spawn` (`Original name`, `Source`, `Category`, `Fidelity level`, `Behavior`, `Porting notes`) pour documenter le mapping `globals.num_edicts` -> `runtime.entities.length` et l'append via `spawnGameEntity`.
- Comparaison C/TS `G_Spawn`: scan depuis `maxclients + 1`, skip des slots absents ou `inuse`, reuse seulement si `freetime < 2` ou `level.time - freetime > 0.5`, appel `G_InitEdict` sur reuse, erreur `ED_Alloc: no free edicts` si la limite `maxentities` est atteinte, sinon allocation d'un nouveau slot et initialisation.
- Locaux C `i`/`e`: non traites dans cette session conformement au lot demande.
- Correction appliquee: `packages/game/src/g_utils.ts` precise les notes de portage; `scripts/verify/quake2-g-utils.ts` ajoute des preuves pour slots clients proteges, delai de reutilisation, append de nouveau slot, avancee de `globals.num_edicts` et erreur `maxentities`.
- Runtime verifie: `G_Spawn` est atteint depuis les flux normaux portes (`G_UseTargets` delayed, `ED_ParseEdict`/`ED_CallSpawn`, AI combat points, `TossClientWeapon`, gibs/debris, `target_spawner`, boss projectiles temporaires et `SelectSpawnPoint`) appeles par spawns, uses, thinks, tirs, morts et frames gameplay.
- `apps/web`: integration attendue indirecte via `apps/web/src/full-game-server-host.ts` et le host full-game/local qui executent le runtime serveur porte; aucune logique web parallele ne remplace l'allocation d'edicts.
- `packages/renderer-three`: pas de sortie renderer directe propre a l'allocation, mais les entites allouees peuvent produire modeles, frames, projectiles, gibs, sons, temp entities, particules, dlights ou scene via snapshots/refresh frame; le flux client/renderer existant consomme ces sorties, tests full-game renderer OK.

Session `G_Spawn`:

- `npm run verify:g-utils`
- `npm run typecheck`
- `npm run verify:full-game:server-host`
- `npm run verify:local-gameplay-sync`
- `npm run verify:web-render-order`
- `npm run verify:full-game:three-renderer`

## Session - KillBox / tr

- C source compare: `Quake-2-master/game/g_utils.c`.
- Declaration H comparee: `Quake-2-master/game/g_local.h`.
- TS cible compare: `packages/game/src/g_utils.ts`.
- Commentaire d'en-tete mis a jour sur `KillBox` (`Original name`, `Source`, `Category`, `Fidelity level`, `Behavior`, `Porting notes`) pour documenter la trace `ent.s.origin` -> `ent.s.origin`, les bounds, le passant `NULL`, `MASK_PLAYERSOLID` et l'adapter local de telefrag.
- Comparaison C/TS `KillBox`: boucle de traces jusqu'a absence de `tr.ent`, trace avec origin/bounds du candidat, application d'un telefrag 100000 sur chaque blocker, retour `false` si le blocker reste solide, retour `true` quand l'espace est libre. Le port TS garde une garde anti-boucle infinie si l'adapter collision renvoie le meme blocker deja vide, sans changer le contrat C visible.
- Local C `tr`: non applicable comme entite autonome; il correspond au `const tr` local TS dans la boucle `KillBox`, couvert par les tests ajoutes.
- Correction appliquee: `packages/game/src/g_utils.ts` documente l'appel de trace et l'adapter de degats local; `scripts/verify/quake2-g-utils.ts` verifie les parametres de trace, la boucle multi-blockers, l'echec quand un blocker survit, la reussite quand les blockers sont clears, et le garde-fou de blocker repete.
- Runtime verifie: `KillBox` est atteint depuis des flux normaux portes de spawn/gameplay et telefrag (`func_wall_use`, spawns de murs/objets visibles, `SP_CreateCoopSpots`, `SP_FixCoopSpots`, `monster_start_go`, `SP_monster_start`, `SP_target_teleporter`, `teleporter_touch`, `SP_func_door_secret`, `PutClientInServer`) eux-memes atteignables par `ED_CallSpawn`, callbacks `use`/`touch`, spawns client et frames serveur `G_RunFrame`.
- `apps/web`: integration attendue indirecte via `apps/web/src/full-game-server-host.ts` et le host full-game/local qui execute le runtime serveur porte. Aucune logique web parallele ne remplace `KillBox`; les effets attendus passent par teleports, entites serveur, sons/evenements et snapshots.
- `packages/renderer-three`: pas de sortie renderer directe propre a `KillBox`, mais ses effets visibles attendus sont indirects: suppression/disparition d'entites telefraggees, repositionnement de joueurs/monstres/brush models, updates de `solid`, temp entities/sons produits par les flux appelants et snapshots client. Le flux refresh frame / `refresh-entity-sync` / renderer Three consomme ces sorties; tests renderer OK.
- Blocages rappeles hors lot: `vectoyaw` reste partiel tant que `p_trail.ts` garde son doublon prive; `vectoangles` reste partiel tant que `g_weapon.ts` garde son helper local.

Session `KillBox` / `tr`:

- `npm run verify:g-utils`
- `npm run typecheck`
- `npm run verify:full-game:server-host`
- `npm run verify:local-gameplay-sync`
- `npm run verify:web-render-order`
- `npm run verify:full-game:three-renderer`

## Etat apres session local `v` de `tv`

- Dernier lot traite: ligne locale `v` de `tv`.
- Verdict du lot: non applicable comme entite autonome.
- Prochain lot recommande: clarifier les lignes locales restantes `i` et `e` dans la matrice sans traiter les blocages `vectoyaw`/`vectoangles` au-dela du rappel.

## Session - locaux `i` et `e` de `G_Spawn`

- C source compare: `Quake-2-master/game/g_utils.c`.
- TS cible compare: `packages/game/src/g_utils.ts`.
- Collision verifiee: la ligne matrice `i` pointait vers `packages/game/src/g_weapon.ts`, mais aucun ownership de `game/g_utils.c` n'y est attendu; `i` est le compteur local de `G_Spawn`.
- Comparaison C/TS: le C declare `int i` et `edict_t *e`, initialise `e = &g_edicts[maxclients + 1]`, scanne `i=maxclients+1` jusqu'a `globals.num_edicts` en avancant `e`, reutilise un edict libre eligible via `G_InitEdict(e)`, sinon verifie `game.maxentities`, incremente `globals.num_edicts`, initialise et retourne le nouvel `e`. Le port TS utilise `startIndex`, `index` et `entity = runtime.entities[index]`, conserve les skips `!entity`/`inuse`/delai `freetime`, appelle `G_InitEdict(entity)`, verifie `runtime.entities.length >= runtime.maxentities`, puis alloue via `spawnGameEntity(runtime)`.
- Locaux C `i` et `e`: non applicables comme entites autonomes; ils correspondent a `index` et `entity` dans le scope TS de `G_Spawn`, couverts par les preuves deja presentes sur `G_Spawn`.
- Commentaire d'en-tete verifie sur `G_Spawn`: `Original name`, `Source`, `Category`, `Fidelity level`, `Behavior`, `Porting notes`; les notes documentent deja le mapping `globals.num_edicts` -> `runtime.entities.length` et l'append via `spawnGameEntity`.
- Runtime verifie: `G_Spawn` reste atteint depuis les flux normaux portes (`G_UseTargets` delayed, `ED_ParseEdict`/`ED_CallSpawn`, AI combat points, `TossClientWeapon`, gibs/debris, `target_spawner`, boss projectiles temporaires et `SelectSpawnPoint`) appeles par spawns, uses, thinks, tirs, morts et frames gameplay.
- `apps/web`: integration attendue indirecte via le host full-game/local qui execute le runtime serveur porte; aucune logique web parallele ne remplace l'allocation d'edicts ni ces locaux.
- `packages/renderer-three`: pas de sortie renderer directe propre aux locaux `i`/`e`; les entites allouees par `G_Spawn` peuvent produire modeles, frames, projectiles, gibs, sons, temp entities, particules, dlights ou scene via snapshots/refresh frame, consommes par les adapters renderer existants.
- Blocages rappeles hors lot: `vectoyaw` reste partiel tant que `p_trail.ts` garde son doublon prive; `vectoangles` reste partiel tant que `g_weapon.ts` garde son helper local. Ces fichiers n'ont pas ete modifies.

Session locaux `i` et `e` de `G_Spawn`:

- `npm run verify:g-utils`
- `npm run verify:full-game:server-host`
- `npm run verify:local-gameplay-sync`
- `npm run verify:web-render-order`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

## Etat apres session locaux `i` et `e` de `G_Spawn`

- Dernier lot traite: lignes locales `i` et `e` de `G_Spawn`.
- Verdict du lot: non applicable comme entites autonomes.
- Prochain lot recommande: reprendre les blocages separes `vectoyaw` -> `p_trail.ts` ou `vectoangles` -> `g_weapon.ts`, un fichier cible par session.

## Session - blocage `vectoyaw` -> `p_trail.ts`

- C source compare: `Quake-2-master/game/g_utils.c` pour `vectoyaw`, declaration `game/g_local.h`, et consommateur C `Quake-2-master/game/p_trail.c` (`PlayerTrail_Add`).
- TS cible compare: `packages/game/src/g_utils.ts` pour l'export officiel `vectoyaw` et `packages/game/src/p_trail.ts` pour le consommateur player trail.
- Ownership/doublon verifie: `vectoyaw` appartient a `game/g_utils.c` / `packages/game/src/g_utils.ts`; le helper prive homonyme de `p_trail.ts` etait un doublon de portage non justifie et a ete supprime.
- Comparaison C/TS `vectoyaw`: l'export officiel conserve les branches axe horizontal nul, Y positif, Y negatif, `atan2(Y, X)`, troncature du cast C puis wrap positif. L'ancien helper prive `p_trail.ts` ne tronquait pas et pouvait produire un yaw fractionnel different.
- Comparaison consommateur `PlayerTrail_Add`: le C calcule `temp = spot - trail[PREV(trail_head)]->s.origin` puis affecte `trail[trail_head]->s.angles[1] = vectoyaw(temp)`; le TS calcule le meme `temp` et consomme maintenant l'export officiel `g_utils.vectoyaw`.
- Commentaire d'en-tete verifie: `g_utils.vectoyaw` contient `Original name`, `Source: game/g_utils.c`, `Category: Ported`, `Fidelity level: Strict`, comportement et notes de portage. Le faux en-tete ported du helper prive dans `p_trail.ts` a disparu avec le doublon.
- Runtime verifie: `vectoyaw` est atteint directement par les flux gameplay deja portes et aussi par `PlayerTrail_Add`, appele depuis `p_client.ts` pendant les frames joueur; le trail est consomme par `g_ai.ts` via `PlayerTrail_PickFirst` / `PlayerTrail_PickNext` pour orienter les monstres en poursuite.
- `apps/web`: integration attendue indirecte via les hosts full-game/local qui executent le runtime serveur porte. Aucune logique parallele web ne remplace le calcul yaw ou le player trail; les effets passent par snapshots, etats monstres/joueur et synchronisation locale.
- `packages/renderer-three`: pas de sortie renderer directe propre a `vectoyaw`, mais la sortie runtime attendue est visible indirectement: orientations de markers/monstres, poursuite AI, entites/camera/scene via snapshots client et `refresh-entity-sync`. Aucun adapter renderer dedie n'est requis, et les tests renderer passent.
- Corrections appliquees: `packages/game/src/p_trail.ts` importe `vectoyaw` depuis `./g_utils.js` et supprime le helper prive; `scripts/verify/quake2-p-trail.ts` ajoute une preuve exacte de troncature/wrap C (`[2, -1, 0]` -> `334`) qui aurait echoue avec l'ancien helper fractionnel.
- Matrice mise a jour: la ligne `vectoyaw` passe de `Partiel` a `Valide`; le blocage `p_trail.ts` est ferme.
- Avancement global mis a jour: `g_utils.c` passe a 18 validees, 1 partielle, prochain lot `vectoangles` -> `g_weapon.ts`.
- Blocage restant hors lot: `vectoangles` reste partiel tant que `packages/game/src/g_weapon.ts` garde son helper local.

Session `vectoyaw` -> `p_trail.ts`:

- `npm run verify:p-trail`
- `npm run verify:g-utils`
- `npm run verify:g-ai`
- `npm run verify:full-game:server-host`
- `npm run verify:local-gameplay-sync`
- `npm run verify:web-render-order`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck` (echec hors lot: `packages/client/src/cl_fx.ts:2165`, symbole `spawnTrapParticles` introuvable)

## Etat apres session `vectoyaw` -> `p_trail.ts`

- Dernier lot traite: blocage `vectoyaw` -> consommateur `p_trail.ts`.
- Verdict du lot: valide.
- Prochain lot recommande: reprendre le blocage separe `vectoangles` -> `packages/game/src/g_weapon.ts`; garder ce lot dans une session separee.

## Session - blocage `vectoangles` -> `g_weapon.ts`

- C source compare: `Quake-2-master/game/g_utils.c` pour `vectoangles`, declaration `game/g_local.h`, et consommateur C `Quake-2-master/game/g_weapon.c` (`fire_blaster`, `fire_rocket`, `fire_bfg`, `fire_lead`).
- TS cible compare: `packages/game/src/g_utils.ts` pour l'export officiel `vectoangles` et `packages/game/src/g_weapon.ts` pour le consommateur world weapon.
- Ownership/doublon verifie: `vectoangles` appartient a `game/g_utils.c` / `packages/game/src/g_utils.ts`; le helper prive homonyme de `g_weapon.ts` etait un doublon de portage non justifie et a ete supprime.
- Comparaison C/TS `vectoangles`: l'export officiel conserve les branches verticales, yaw axe Y positif/negatif, wrap positif, calcul `forward`, pitch, troncature du cast C et sortie `[-pitch, yaw, 0]`.
- Comparaison consommateur `g_weapon`: les appels TS de `fire_blaster`, `fire_rocket`, `fire_bfg`, `fire_lead` et `angleVectorsFromDir` consomment maintenant l'export officiel au lieu d'un helper local normalisant/fractionnel. Le cas `fire_rocket([2, -1, 1])` prouve la sortie C `[-24, 334, 0]`.
- Commentaire d'en-tete verifie: `g_utils.vectoangles` contient `Original name`, `Source: game/g_utils.c`, `Category: Ported`, `Fidelity level: Strict`, comportement et notes de portage. Le helper prive `g_weapon.ts` n'existe plus.
- Runtime verifie: `vectoangles` est atteint directement par les flux gameplay portes et par les armes monde (`fire_blaster`, `fire_rocket`, `fire_bfg`, `fire_lead`), appelees depuis tirs joueurs/monstres, projectiles, impacts, thinks et frames serveur.
- `apps/web`: integration attendue indirecte via les hosts full-game/local qui executent le runtime serveur porte. Aucune logique parallele web ne remplace le calcul d'angles des armes; les sorties passent par entites serveur, sons/temp entities et snapshots.
- `packages/renderer-three`: pas de branchement renderer dedie attendu pour le helper, mais les sorties visibles qu'il oriente sont bien des projectiles/modeles/frames, temp entities, particules, dlights, beams et scene consommes par le flux refresh/Three. Les tests renderer passent.
- Corrections appliquees: `packages/game/src/g_weapon.ts` importe `vectoangles` depuis `./g_utils.js` et supprime le helper prive; `scripts/verify/quake2-g-weapon.ts` ajoute une preuve de troncature/wrap C sur les angles de rocket.
- Matrice mise a jour: la ligne `vectoangles` passe de `Partiel` a `Valide`; le blocage `g_weapon.ts` est ferme.
- Avancement global mis a jour: `g_utils.c` passe a `Termine`, 19 validees, 0 partielle, 18 non applicables.

Session `vectoangles` -> `g_weapon.ts`:

- `npm run verify:g-utils`
- `npm run verify:g-weapon`
- `npm run verify:full-game:server-host`
- `npm run verify:local-gameplay-sync`
- `npm run verify:web-render-order`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

## Etat apres session `vectoangles` -> `g_weapon.ts`

- Dernier lot traite: blocage `vectoangles` -> consommateur `g_weapon.ts`.
- Verdict du lot: valide.
- Prochain lot recommande: aucun pour `g_utils.c`; toutes les lignes sont `Valide` ou `Non applicable`.
