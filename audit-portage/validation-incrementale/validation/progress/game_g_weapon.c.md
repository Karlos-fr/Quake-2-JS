# Progress - Quake-2-master/game/g_weapon.c

## Etat courant

- Statut: En cours
- Dernier lot traite: `Grenade_Explode` et temporaires locaux `origin`, `mod`, `points`.
- Verdict du lot: valide pour `Grenade_Explode`; `origin`, `points` et les extractions du local `mod` sont non applicables comme entites autonomes.

## Preuves session

- C source compare: `Quake-2-master/game/g_weapon.c`
- TS cible compare: `packages/game/src/g_weapon.ts`
- Commentaire d'en-tete verifie sur `Grenade_Explode` (`Original name`, `Source`, `Category`, `Fidelity level`, `Behavior`, `Porting notes`).
- Comparaison C/TS: `PlayerNoise` si owner client; dommage direct si `enemy`; centre cible via `enemy.s.origin + 0.5 * (mins + maxs)`; `points = dmg - 0.5 * length(offset)` puis troncature; direction `enemy.s.origin - ent.s.origin`; `MOD_HANDGRENADE`/`MOD_GRENADE`; `DAMAGE_RADIUS`; splash `MOD_HELD_GRENADE`/`MOD_HG_SPLASH`/`MOD_G_SPLASH`; ignore `ent.enemy`; origine temp entity `ent.s.origin - 0.02 * ent.velocity`; selection eau/sol/air `TE_GRENADE_EXPLOSION(_WATER)` ou `TE_ROCKET_EXPLOSION(_WATER)`; free edict final.
- Runtime verifie: `Grenade_Explode` est branche comme `think` des projectiles `fire_grenade`/`fire_grenade2`, appele immediatement pour grenade tenue a timer nul, et appele depuis `Grenade_Touch`; ces chemins sont atteignables depuis `p_weapon`, `monster_fire_grenade`, `local-game-bootstrap`, mouvement projectile et callbacks touch/think.
- `apps/web`: integration attendue indirecte via le runtime local/serveur; aucune logique parallele web ne remplace l'explosion grenade. `verify:local-gameplay-sync` et `verify:web-render-order` passent.
- `packages/renderer-three`: sortie visible attendue via temp entities d'explosion, particules, dlights et modeles d'explosion issus du client refresh; `TE_GRENADE_EXPLOSION`, `TE_GRENADE_EXPLOSION_WATER`, `TE_ROCKET_EXPLOSION` et `TE_ROCKET_EXPLOSION_WATER` sont couverts cote client/refresh et consommes par les adapters renderer via `ClientRefreshFrame`. `verify:full-game:three-renderer` passe.

## Tests lances

- `npm run verify:g-weapon`
- `npm run verify:p-weapon`
- `npm run verify:g-monster`
- `npm run verify:local-gameplay-sync`
- `npm run verify:web-render-order`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

## Corrections

- `scripts/verify/quake2-g-weapon.ts`: ajout de preuves ciblees pour le dommage direct, le splash, les mods `MOD_GRENADE`/`MOD_HANDGRENADE`/`MOD_HELD_GRENADE`/`MOD_HG_SPLASH`/`MOD_G_SPLASH`, l'origine temp entity et les variantes `TE_GRENADE_EXPLOSION`, `TE_GRENADE_EXPLOSION_WATER`, `TE_ROCKET_EXPLOSION`, `TE_ROCKET_EXPLOSION_WATER`.

## Prochain lot recommande

- Continuer avec `Grenade_Touch`, puis `fire_grenade` et son temporaire local `grenade` si le lot reste petit.

## Blocages

- Aucun blocage observe pendant cette session pour ce lot.
