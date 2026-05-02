# Progress - Quake-2-master/game/g_weapon.c

## Etat courant

- Statut: En cours
- Dernier lot traite: `Grenade_Touch`, `fire_grenade` et temporaire local `grenade`.
- Verdict du lot: valide pour `Grenade_Touch` et `fire_grenade`; `grenade` est non applicable comme entite autonome.

## Preuves session

- C source compare: `Quake-2-master/game/g_weapon.c`
- TS cible compare: `packages/game/src/g_weapon.ts`
- Commentaires d'en-tete verifies sur `Grenade_Touch` et `fire_grenade` (`Original name`, `Source`, `Category`, `Fidelity level`, `Behavior`, `Porting notes`).
- Comparaison C/TS `Grenade_Touch`: ignore le owner; libere sur surface `SURF_SKY`; joue les sons de rebond held/launcher selon `spawnflags`; assigne `enemy` puis route vers `Grenade_Explode` sur cible damageable.
- Comparaison C/TS `fire_grenade`: spawn projectile, origine, velocite avec jitter `crandom`, `MOVETYPE_BOUNCE`, `MASK_SHOT`, `SOLID_BBOX`, `EF_GRENADE`, model `models/objects/grenade/tris.md2`, owner, callback `Grenade_Touch`, timer `nextthink`, callback `Grenade_Explode`, dommages/rayon, classname et `linkentity`.
- Runtime verifie: `fire_grenade` installe un projectile solide lie, atteignable par `SV_Impact`/callback touch via le mouvement projectile; `Grenade_Touch` route ensuite vers `Grenade_Explode` et la temp entity d'explosion.
- `apps/web`: integration attendue indirecte via le runtime local/serveur et les callbacks projectile; aucune logique parallele web ne remplace le flux grenade.
- `packages/renderer-three`: sortie visible attendue via modele de grenade, effets `EF_GRENADE`, temp entities d'explosion, particules/dlights/modeles d'explosion consommes via `ClientRefreshFrame` et renderer-three; le flux est couvert par les tests full-game/renderer.

## Tests lances

- `npm run verify:g-weapon`
- `npm run verify:p-weapon`
- `npm run verify:g-monster`
- `npm run verify:local-gameplay-sync`
- `npm run verify:web-render-order`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

## Corrections

- `scripts/verify/quake2-g-weapon.ts`: ajout de preuves ciblees pour les branches owner/sky/bounce/damage de `Grenade_Touch`, pour l'etat complet du projectile `fire_grenade`, et pour le callback touch runtime qui atteint l'explosion visible.

## Prochain lot recommande

- Continuer avec `fire_grenade2` et son temporaire local `grenade` si le lot reste petit.

## Blocages

- Aucun blocage observe pendant cette session pour ce lot.
