# Progress - Quake-2-master/game/g_combat.c

## Dernier lot valide

- 2026-04-30: `CanDamage`
  - Source comparee: `Quake-2-master/game/g_combat.c`
  - Cible comparee: `packages/game/src/g_combat.ts`
  - Correction appliquee: les traces des cibles non-`MOVETYPE_PUSH` ne valident plus `trace.ent == targ`; seul le cas bmodel conserve ce special-case comme le C original.
  - Commentaire d'en-tete TS verifie: `Original name`, `Source`, `Category: Ported`, `Fidelity level: Strict`, `Behavior`, `Porting notes`.
  - Branchement runtime verifie: `CanDamage` est appele par `T_RadiusDamage` et par les chemins armes dans `g_weapon.ts`; `T_Damage`/`T_RadiusDamage` sont appeles depuis plusieurs flux game runtime.
  - `apps/web`: aucune reference directe trouvee pour `CanDamage`; pas de remplacement de logique gameplay constate pour ce lot.
  - `renderer-three`: aucune reference directe trouvee; non applicable pour ce lot.
  - Tests lances: `npx tsx ./scripts/verify/quake2-g-combat.ts`; verification inline `CanDamage` couvrant probes normaux, refus `trace.ent == targ` hors bmodel, et centre `MOVETYPE_PUSH`; `npm run typecheck`.

## Prochain lot recommande

- `Killed` seul, ou `Killed` + son bookkeeping minimal si la comparaison reste courte.

## Blocages

- Aucun pour le lot traite.

## Decisions importantes

- La matrice conserve le statut automatique `A redecouper`; seul le statut de validation manuel de `CanDamage` a ete avance.
