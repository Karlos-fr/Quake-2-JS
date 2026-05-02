# Progress - Quake-2-master/game/g_weapon.c

## Etat courant

- Statut: En cours
- Dernier lot traite: `fire_hit` et temporaires locaux `tr`, `v`, `point`, `range`, `dir`, `aim`.
- Verdict du lot: valide pour `fire_hit`; temporaires non applicables comme entites autonomes.

## Preuves session

- C source compare: `Quake-2-master/game/g_weapon.c`
- TS cible compare: `packages/game/src/g_weapon.ts`
- Runtime verifie: `fire_hit` est appele depuis les callbacks melee des monstres portes (`m_berserk`, `m_chick`, `m_brain`, `m_flipper`, `m_float`, `m_flyer`, `m_gladiator`, `m_infantry`, `m_mutant`). Le test couvre le range frontal reduit par bbox enemy, le trace `MASK_SHOT`, le retarget client/monster, `T_Damage`, la mutation laterale de `aim[1]`, le blocage non damageable et le knockback special.
- `apps/web`: pas de branchement direct attendu pour ce lot; le navigateur passe par le runtime serveur/jeu porte et consomme ensuite les etats d'entites produits.
- `packages/renderer-three`: integration indirecte attendue via les entites runtime; `fire_hit` ne produit pas de temp entity, particule, beam, dlight, image ou modele propre, mais peut modifier damage/velocity/groundentity visibles par les snapshots.

## Tests lances

- `npm run verify:g-weapon`
- `npm run verify:full-game:server-host`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

## Corrections

- `packages/game/src/g_weapon.ts`: correction du range frontal `fire_hit` et de la mutation `aim[1]` pour le coup lateral, conformement au C.
- `scripts/verify/quake2-g-weapon.ts`: extension du harness cible pour `fire_hit`.

## Prochain lot recommande

- Continuer avec `fire_lead` et ses temporaires locaux (`tr`, `dir`, `end`, `r`, `u`, `water_start`, `water`, `content_mask`, `color`) si le lot reste petit; sinon limiter aux branches trace/impact sans eau.

## Blocages

- Aucun.
