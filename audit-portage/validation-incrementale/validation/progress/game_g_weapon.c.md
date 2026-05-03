# Progress - Quake-2-master/game/g_weapon.c

## Etat courant

- Statut: En cours
- Dernier lot traite: `rocket_touch` et temporaires locaux `origin`, `n`.
- Verdict du lot: valide pour `rocket_touch`; `origin` et `n` sont non applicables comme entites autonomes.

## Preuves session

- C source compare: `Quake-2-master/game/g_weapon.c`
- TS cible compare: `packages/game/src/g_weapon.ts`
- Commentaire d'en-tete verifie et mis a jour sur `rocket_touch` (`Original name`, `Source`, `Category`, `Fidelity level`, `Behavior`, `Porting notes`).
- Comparaison C/TS `rocket_touch`: ignore owner, libere sur `SURF_SKY`, `PlayerNoise` pour owner client, calcule `origin = ent.s.origin + ent.velocity * -0.02`, degat direct `MOD_ROCKET` avec normale de plan, debris hors deathmatch/coop sur surfaces non warp/translucides/flowing, splash `MOD_R_SPLASH`, temp entity `TE_ROCKET_EXPLOSION` ou `TE_ROCKET_EXPLOSION_WATER`, puis liberation de l'edict.
- Corrections TS: transmission runtime `plane`/`surf` depuis le callback de projectile `fire_rocket`; branche debris reactivee avec `ThrowDebris(ent, "models/objects/debris2/tris.md2", 2, ent.s.origin, runtime)` et compteur local `rand()%5`.
- Temporaires locaux: `origin` est une constante locale TS couverte par test d'origine explosion; `n` est un compteur local TS couvert par test debris force a 4 iterations.
- Runtime verifie: `rocket_touch` est branche comme callback du projectile cree par `fire_rocket`, appele depuis les collisions `G_RunEntity`/`SV_Impact` portees via `g_phys`, avec forwarding `plane`/`surf` teste.
- `apps/web`: integration attendue indirecte via le runtime local/serveur et le pont full-game; aucune logique parallele web ne remplace le flux rocket impact.
- `packages/renderer-three`: sorties visibles attendues via entite rocket (`EF_ROCKET`, modele/sound), debris visibles et temp entities d'explosion rocket/eau; consommation couverte par le pipeline client/temp entities et `renderer-three`.

## Tests lances

- `npm run verify:g-weapon`
- `npm run verify:p-weapon`
- `npm run verify:g-monster`
- `npm run verify:full-game:server-host`
- `npm run verify:local-gameplay-sync`
- `npm run verify:web-render-order`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

## Corrections

- `packages/game/src/g_weapon.ts`: forwarding `plane`/`surf` du callback `fire_rocket` vers `rocket_touch`; branche debris C reactivee avec `ThrowDebris`; commentaire `rocket_touch` mis a jour.
- `scripts/verify/quake2-g-weapon.ts`: ajout de preuves ciblees pour les branches `rocket_touch` degat direct/splash/temp entity, `SURF_SKY`, debris `rand()%5`, suppression debris sur `SURF_WARP`, et forwarding runtime `plane`/`surf`.

## Prochain lot recommande

- Continuer avec `fire_rocket` et le temporaire local `rocket` si le lot reste petit.

## Blocages

- Aucun blocage observe pendant cette session pour ce lot.
