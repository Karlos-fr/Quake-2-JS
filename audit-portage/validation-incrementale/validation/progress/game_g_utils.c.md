# Progress - Quake-2-master/game/g_utils.c

## Etat courant

- Statut: En cours
- Dernier lot traite: `findradius` avec le local C `j`.
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

## Corrections

- `packages/game/src/g_utils.ts`: ajout de la note d'en-tete sur la signature TS de `G_ProjectSource`.
- `scripts/verify/quake2-g-utils.ts`: ajout d'un cas mixte couvrant la formule C avec bases non triviales.
- `scripts/verify/quake2-g-utils.ts`: ajout de preuves ciblees pour `G_Find` couvrant reprise apres `from`, skip `inuse`, champ null/non-string, fin de liste, comparaison insensible a la casse et local `s` porte comme `value`.
- `scripts/verify/quake2-g-utils.ts`: ajout de preuves ciblees pour `findradius` couvrant reprise apres `from`, skip `!inuse`, skip `SOLID_NOT`, centre bbox `origin + (mins + maxs) * 0.5`, distance egale au rayon acceptee, fin de liste et local `j` remplace par construction directe du vecteur `eorg`.

## Prochain lot recommande

- Continuer avec `MAXCHOICES`, puis `G_PickTarget` et les locaux `ent`, `num_choices`, `choice` si le lot reste coherent.

## Session - findradius / j

- C source compare: `Quake-2-master/game/g_utils.c`
- TS cible compare: `packages/game/src/g_utils.ts`
- Commentaire d'en-tete verifie sur `findradius` (`Original name`, `Source`, `Category`, `Fidelity level`, `Behavior`, `Porting notes`).
- Comparaison C/TS `findradius`: depart au debut si `from == NULL`, reprise juste apres `from`, iteration jusqu'a la fin des entites, skip des entites absentes/non `inuse`, skip `SOLID_NOT`, calcul du centre bbox et du vecteur `eorg`, rejet strict seulement si `VectorLength(eorg) > rad`, retour `null` en fin de liste.
- Local C `j`: non applicable comme entite autonome; la boucle C sur les 3 composantes correspond a la construction directe du tuple `eorg` TS, couverte par test.
- Runtime verifie: helper atteint depuis les flux normaux `T_RadiusDamage`, `bfg_explode` et `bfg_think`, eux-memes appeles par explosions, projectiles et pensees gameplay.
- `apps/web`: integration attendue indirecte via les hosts full-game/local qui executent le runtime porte; aucune logique web parallele ne remplace l'enumeration de rayon.
- `packages/renderer-three`: pas de sortie renderer directe produite par `findradius`; les sorties visibles attendues sont indirectes via dommages, morts, explosions, temp entities BFG/rocket, particules/dlights et entites serveur deja consommes par snapshots/refresh frame/adapters renderer.

## Blocages

- Aucun blocage observe pendant cette session pour ce lot.
