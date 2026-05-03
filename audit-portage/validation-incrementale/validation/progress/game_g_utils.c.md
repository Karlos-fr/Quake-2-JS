# Progress - Quake-2-master/game/g_utils.c

## Etat courant

- Statut: En cours
- Dernier lot traite: `MAXCHOICES`, `G_PickTarget` avec les locaux C `ent`, `num_choices`, `choice`.
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

- Continuer avec `Think_Delay`, puis `G_UseTargets` et le local `t` si le lot reste coherent.

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

- `npm run typecheck` echoue sur `apps/web/src/full-game.ts:768` (`unknown` non assignable a `entity_state_t`), hors fichiers modifies par ce lot. Les tests cibles runtime/web/renderer listent ci-dessus passent.
