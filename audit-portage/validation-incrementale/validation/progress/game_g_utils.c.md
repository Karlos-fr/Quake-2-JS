# Progress - Quake-2-master/game/g_utils.c

## Etat courant

- Statut: En cours
- Dernier lot traite: `G_SetMovedir`.
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

- Continuer avec `vectoyaw` et son local `yaw` si le lot reste petit. La ligne globale `v` restante pointe vers `g_weapon.ts`; elle doit etre clarifiee dans un lot separe sans melanger les ownerships.

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
