# Progress - Quake-2-master/game/g_combat.c

## Dernier lot valide

- 2026-04-30: `SpawnDamage`
  - Source comparee: `Quake-2-master/game/g_combat.c`
  - Cible comparee: `packages/game/src/g_combat.ts`
  - Correction appliquee: commentaire d'en-tete clarifie; le cap `damage > 255` est conserve mais le damage n'est pas serialise, comme la ligne `gi.WriteByte(damage)` commentee dans le C original.
  - Commentaire d'en-tete TS verifie: `Original name`, `Source`, `Category: Ported`, `Fidelity level: Strict`, `Behavior`, `Porting notes`.
  - Branchement runtime verifie: `SpawnDamage` est appele par `CheckPowerArmor`, `CheckArmor` et `T_Damage`; les flux armes passent le hook `emitTempEntity` vers `T_Damage`; `local-game-bootstrap` convertit ce hook en evenement runtime `MULTICAST_PVS`; `local-gameplay-sync` reconstruit le packet client avec `origin` et `dir`.
  - `apps/web`: aucune reference directe trouvee pour `SpawnDamage`; `apps/web/src/full-game.ts` consomme les temp entities cote client, sans remplacer la logique gameplay.
  - `renderer-three`: aucune reference directe trouvee; non applicable pour ce lot.
  - Tests lances: `npx tsx ./scripts/verify/quake2-g-combat.ts`; verification inline `SpawnDamage` couvrant type, origin, dir et absence de payload `damage` avec entree `300`; `npm run typecheck`.

- 2026-04-30: `Killed`
  - Source comparee: `Quake-2-master/game/g_combat.c`
  - Cible comparee: `packages/game/src/g_combat.ts`
  - Correction appliquee: le bookkeeping monstre (`killed_monsters`, score coop, owner medic) est maintenant execute avant le retour special `MOVETYPE_PUSH` / `MOVETYPE_STOP` / `MOVETYPE_NONE`, comme dans le C original.
  - Commentaire d'en-tete TS verifie: `Original name`, `Source`, `Category: Ported`, `Fidelity level: Close`, `Behavior`, `Porting notes`; l'ecart `monster_death_use` via hook reste documente.
  - Branchement runtime verifie: `Killed` est appele par `T_Damage`; `T_Damage` est appele par `T_RadiusDamage` et par les flux armes/runtime references dans `packages/game/src`.
  - `apps/web`: aucune reference directe trouvee pour `Killed`; pas de remplacement de logique gameplay constate pour ce lot.
  - `renderer-three`: aucune reference directe trouvee; non applicable pour ce lot.
  - Tests lances: `npx tsx ./scripts/verify/quake2-g-combat.ts`; verification inline `Killed` couvrant le bookkeeping avant retour `MOVETYPE_NONE`; `npm run typecheck`.

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

- `CheckPowerArmor` avec ses variables locales associees si le lot reste court.

## Blocages

- Aucun pour le lot traite.

## Decisions importantes

- La matrice conserve le statut automatique `A redecouper`; seul le statut de validation manuel de `CanDamage` a ete avance.
