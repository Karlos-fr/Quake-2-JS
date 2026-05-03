# Progress - Quake-2-master/game/g_utils.c

## Etat courant

- Statut: En cours
- Dernier lot traite: `G_Spawn`.
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

- Continuer avec `G_FreeEdict` seul. Garder les lignes locales `i`/`e`, la ligne globale `v`, `vectoyaw` et `vectoangles` pour des lots separes sans melanger les ownerships.

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
