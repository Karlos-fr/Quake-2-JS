# Progress - Quake-2-master/game/g_weapon.c

## Etat courant

- Statut: En cours
- Dernier lot traite: `fire_blaster` et temporaires locaux `bolt`, `tr`.
- Verdict du lot: valide pour `fire_blaster`; `bolt` et `tr` sont non applicables comme entites autonomes.

## Preuves session

- C source compare: `Quake-2-master/game/g_weapon.c`
- TS cible compare: `packages/game/src/g_weapon.ts`
- Commentaire d'en-tete verifie sur `fire_blaster` (`Original name`, `Source`, `Category`, `Fidelity level`, `Behavior`, `Porting notes`).
- Comparaison C/TS: `dir` normalise; `G_Spawn`/`spawnGameEntity`; `SVF_DEADMONSTER`; origines `s.origin`/`s.old_origin`; angles via `vectoangles`; velocity `dir * speed`; `MOVETYPE_FLYMISSILE`; `MASK_SHOT`; `SOLID_BBOX`; effets OR; `mins`/`maxs` a zero; modele `models/objects/laser/tris.md2`; son `misc/lasfly.wav`; owner/touch/think/dmg/classname; `spawnflags=1` si hyper; linkentity; `check_dodge` pour tireur client; backtrace `self.s.origin -> bolt.s.origin` avec `passent=bolt`, `MASK_SHOT`, recul de 10 unites et appel touch avec plane/surface null si collision immediate.
- Runtime verifie: appele depuis `p_weapon` (`Blaster_Fire`/hyperblaster), `monster_fire_blaster` et `target_blaster`; projectile lie au monde et consomme ensuite par `G_RunFrame`/physique `MOVETYPE_FLYMISSILE` jusqu'au `touch`/`think`.
- `apps/web`: integration attendue indirecte via runtime local/serveur; aucune logique parallele web ne remplace `fire_blaster`. `verify:local-gameplay-sync` passe.
- `packages/renderer-three`: sortie visible attendue pour modele laser, effets/dlights `EF_BLASTER`/hyperblaster et impact `TE_BLASTER`; le flux est produit par runtime/client refresh et consomme via `ClientRefreshFrame` par les adapters renderer. `verify:full-game:three-renderer` passe.

## Tests lances

- `npm run verify:g-weapon`
- `npm run verify:full-game:three-renderer`
- `npm run verify:p-weapon`
- `npm run verify:g-monster`
- `npm run verify:local-gameplay-sync`
- `npm run typecheck`

## Corrections

- `scripts/verify/quake2-g-weapon.ts`: ajout d'une preuve ciblee pour l'etat complet du projectile `fire_blaster` et le backtrace/touch immediat.

## Prochain lot recommande

- Continuer avec `Grenade_Explode` et ses temporaires locaux `origin`, `mod`, `points` si le lot reste coherent.

## Blocages

- Aucun blocage observe pendant cette session pour ce lot.
