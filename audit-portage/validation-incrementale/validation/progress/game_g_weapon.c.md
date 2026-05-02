# Progress - Quake-2-master/game/g_weapon.c

## Etat courant

- Statut: En cours
- Dernier lot traite: `blaster_touch` et temporaires locaux `mod`.
- Verdict du lot: valide pour `blaster_touch`; les deux lignes `mod` sont non applicables comme entites autonomes.

## Preuves session

- C source compare: `Quake-2-master/game/g_weapon.c`
- TS cible compare: `packages/game/src/g_weapon.ts`
- Commentaire d'en-tete verifie sur `blaster_touch` (`Original name`, `Source`, `Category`, `Fidelity level`, `Behavior`, `Porting notes`).
- Comparaison C/TS: retour immediat si `other == owner`; surface `SURF_SKY` libere le bolt; owner client emet `PlayerNoise(..., PNOISE_IMPACT)`; cible damageable appelle `T_Damage` avec `dir=self->velocity`, `point=self->s.origin`, `normal=plane->normal`, `damage=self->dmg`, `knockback=1`, `DAMAGE_ENERGY`, et `MOD_HYPERBLASTER` si `spawnflags & 1`, sinon `MOD_BLASTER`; cible non-damageable emet `TE_BLASTER` avec origine et normale; fin libere le bolt.
- Correction runtime: `fire_blaster` transmet maintenant `plane` et `surf` depuis le callback `GameEntityTouch` vers `blaster_touch`, au lieu de perdre la normale de collision.
- Runtime verifie: `fire_blaster` installe `blaster_touch` sur `bolt.touch`; les callbacks physiques `g_phys.ts` peuvent fournir `plane/surface`; test cible `verify:g-weapon` prouve le forwarding de la normale, les branches owner/sky/damage/world, `PlayerNoise`, `G_FreeEdict`, `TE_BLASTER`, `MOD_BLASTER` et `MOD_HYPERBLASTER`.
- `apps/web`: integration attendue indirecte via runtime local/serveur et temp entity `TE_BLASTER`; aucune logique parallele web trouvee. Le test `verify:local-gameplay-sync` contient deja la consommation refresh de `TE_BLASTER`, mais son execution est bloquee dans cette session par une erreur import-time hors lot dans `g_save.ts`.
- `packages/renderer-three`: sortie visible attendue indirecte pour impact blaster (modele explosion, particules, dlight) consommee depuis `ClientRefreshFrame`; pas de branchement direct depuis `g_weapon.ts` attendu. `verify:full-game:three-renderer` passe.

## Tests lances

- `npm run verify:g-weapon`
- `npm run verify:full-game:three-renderer`
- `npm run verify:p-weapon` (bloque avant le lot: `g_save.ts`, `FRAME_attack1 is not defined`)
- `npm run verify:g-monster` (bloque avant le lot: `g_save.ts`, `FRAME_attack1 is not defined`)
- `npm run verify:local-gameplay-sync` (bloque avant le lot: `g_save.ts`, `FRAME_attack1 is not defined`)
- `npm run typecheck` (bloque hors lot: `packages/game/src/g_spawn.ts(645,5): Cannot find name 'applyParsedField'`)

## Corrections

- `packages/game/src/g_weapon.ts`: forwarding `plane`/`surf` du callback `bolt.touch` vers `blaster_touch`; signature du hook optionnel alignee.
- `scripts/verify/quake2-g-weapon.ts`: imports directs pour isoler le harness du barrel `index.ts`; ajout de preuves ciblees pour `blaster_touch` et le callback runtime de `fire_blaster`.

## Prochain lot recommande

- Continuer avec `fire_blaster` et ses temporaires locaux `bolt` et `tr` si le lot reste coherent.

## Blocages

- Tests transverses `verify:p-weapon`, `verify:g-monster` et `verify:local-gameplay-sync` bloques avant execution utile par `g_save.ts` (`FRAME_attack1 is not defined`).
- `npm run typecheck` bloque hors lot par `packages/game/src/g_spawn.ts(645,5)` (`applyParsedField` introuvable).
