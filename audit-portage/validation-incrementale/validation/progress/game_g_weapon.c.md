# Progress - Quake-2-master/game/g_weapon.c

## Etat courant

- Statut: En cours
- Dernier lot traite: `fire_grenade2` et temporaire local `grenade`.
- Verdict du lot: valide pour `fire_grenade2`; `grenade` est non applicable comme entite autonome.

## Preuves session

- C source compare: `Quake-2-master/game/g_weapon.c`
- TS cible compare: `packages/game/src/g_weapon.ts`
- Commentaire d'en-tete verifie sur `fire_grenade2` (`Original name`, `Source`, `Category`, `Fidelity level`, `Behavior`, `Porting notes`).
- Comparaison C/TS `fire_grenade2`: spawn projectile, origine, velocite avec `vectoangles`/`AngleVectors` et jitter `crandom`, `MOVETYPE_BOUNCE`, `MASK_SHOT`, `SOLID_BBOX`, `EF_GRENADE`, model `models/objects/grenade2/tris.md2`, owner, callback `Grenade_Touch`, timer `nextthink`, callback `Grenade_Explode`, dommages/rayon, classname `hgrenade`, `spawnflags` held/non-held, son `weapons/hgrenc1b.wav`, branche explosion immediate si `timer <= 0`, sinon son `weapons/hgrent1a.wav` et `linkentity`.
- Runtime verifie: `fire_grenade2` est appele par `weapon_grenade_fire`/`Weapon_Grenade`; le projectile positif est lie comme solide et atteignable par callback touch, tandis que le timer zero explose sans link comme le C.
- `apps/web`: integration attendue indirecte via le runtime local/serveur et `local-game-bootstrap`; aucune logique parallele web ne remplace le flux hand grenade.
- `packages/renderer-three`: sortie visible attendue via modele hand grenade, effet `EF_GRENADE`, son/etat d'entite, temp entities d'explosion, particules/dlights/modeles d'explosion consommes via `ClientRefreshFrame` et renderer-three; le flux est couvert par les tests full-game/renderer.

## Tests lances

- `npm run verify:g-weapon`
- `npm run verify:p-weapon`
- `npm run verify:g-monster`
- `npm run verify:local-gameplay-sync`
- `npm run verify:web-render-order`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

## Corrections

- `scripts/verify/quake2-g-weapon.ts`: ajout de preuves ciblees pour l'etat complet du projectile `fire_grenade2`, les branches held/non-held, le son de vol, le son de lancer, le callback touch runtime et l'explosion immediate `timer <= 0`.

## Prochain lot recommande

- Continuer avec `rocket_touch`, puis les temporaires locaux `origin` et `n` si le lot reste petit.

## Blocages

- Aucun blocage observe pendant cette session pour ce lot.
