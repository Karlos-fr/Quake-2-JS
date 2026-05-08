# Progress TS - packages/game/src/g_weapon.ts

## Etat courant

- Statut: Termine
- Dernier lot traite: fichier complet, soit les 18 symboles `A auditer` puis les 17 entrees a entete incomplet.
- Verdict du lot: validation TS croisee terminee.

## Preuves session

- Regles lues explicitement: `README.md`, `audit-portage/validation-incrementale/README.md`, `CHECKLIST_VALIDATION_TS.md`, `CHECKLIST_VALIDATION_ENTITES.md`, `ORGANISATION_AGENTS.md`.
- TS cible lu: `packages/game/src/g_weapon.ts`.
- Source C lue: `Quake-2-master/game/g_weapon.c`.
- Matrice C/H lue: `audit-portage/validation-incrementale/validation/matrices/game_g_weapon.c.md`.
- Progress C/H lu: `audit-portage/validation-incrementale/validation/progress/game_g_weapon.c.md`.
- Les 18 portages proprietaires de `game/g_weapon.c` sont couverts par la matrice C/H finale: `fire_hit`, `fire_blaster`, `fire_grenade`, `fire_grenade2`, `fire_rocket`, `fire_bfg`, `fire_bullet`, `fire_shotgun`, `fire_rail`, `blaster_touch`, `Grenade_Touch`, `rocket_touch`, `Grenade_Explode`, `bfg_explode`, `bfg_touch`, `bfg_think`, `check_dodge`, `fire_lead`.
- Recherche doublons/ownership effectuee: pas de doublon proprietaire pour le couple `Original name` + `Source declaree` des 18 portages dans les TS; les occurrences restantes sont appels, exports barrel, wrappers `p_weapon`/`g_monster`, integration locale ou tests.
- Les helpers/bridges locaux ont ete classes `Category: New` avec `Original name: N/A` et `Source: N/A (<raison courte>)` dans les en-tetes et dans la matrice.
- `vectoangles` et `crandom` sont des imports externes, pas des helpers locaux de `g_weapon.ts`: proprietaires respectifs `packages/game/src/g_utils.ts` et `packages/game/src/g_local.ts`.

## Corrections

- `packages/game/src/g_weapon.ts`: ajout des metadonnees d'entete manquantes sur `GameWeaponWorldHooks` et les helpers locaux `New`.
- `audit-portage/validation-incrementale/validation/ts-matrices/packages_game_src_g_weapon.ts.md`: 18 lignes marquees `Couvert C/H`, helpers locaux classes `Non applicable`, imports externes documentes.
- `audit-portage/validation-incrementale/validation/AVANCEMENT_GLOBAL_TS.md`: ligne `g_weapon.ts` mise a jour.

## Integration runtime / apps/web / renderer-three

- Runtime: les portages proprietaires restent couverts par la validation C/H existante; le fichier est appele via `p_weapon`, `g_monster`, `g_target`, `g_turret`, monstres et hooks de `local-game-bootstrap`.
- `apps/web`: integration indirecte via runtime serveur/local, snapshots, sons et temp entities; aucune logique web parallele detectee dans ce lot.
- `packages/renderer-three`: integration indirecte via projectiles visibles, temp entities, beams, particules et refresh client deja documentee dans la matrice/progress C/H; les helpers locaux ne produisent pas de sortie renderer autonome.

## Tests lances

- `npm run verify:g-weapon`
- `npm run typecheck`

## Prochain lot recommande

- Aucun pour `packages/game/src/g_weapon.ts`. Reprendre un autre fichier TS en cours depuis `AVANCEMENT_GLOBAL_TS.md`, par exemple `packages/game/src/g_phys.ts` ou `packages/game/src/g_save.ts`.

## Blocages

- Aucun blocage ouvert pour ce fichier.
