# Progress - Quake-2-master/game/g_misc.c

## Dernier lot valide

- 2026-04-30: `Use_Areaportal` + `SP_func_areaportal`.
- Correction appliquee dans `packages/game/src/g_misc.ts`: `Use_Areaportal` appelle maintenant `CM_SetAreaPortalState` via `runtime.collision.world` quand disponible, en plus du log de harness.
- Commentaires d'en-tete ajoutes pour les deux fonctions.
- Branchement runtime verifie: `func_areaportal` est enregistre dans `packages/game/src/g_spawn.ts`, exporte via `packages/game/src/index.ts`, et atteignable par le spawn system.
- `apps/web`: aucune logique principale dupliquee pour ce lot.
- `renderer-three`: aucune compensation gameplay; le renderer consomme les areabits produits par le flux serveur/collision.

## Tests de reference lances

- `npm run verify:g-misc`
- `npm run verify:g-spawn`
- `npm run typecheck`
- Controle ad hoc `npx tsx` confirmant: `count` bascule 0/1, `portalopen[style]` bascule 0/1, et `CM_AreasConnected` suit l'ouverture/fermeture.

## Blocages

- Aucun pour ce lot.

## Prochain lot recommande

- `VelocityForDamage`, `VectorScale` (entite C appelee mais cible vide car helper TS `scaleVec3`) et `ClipGibVelocity`, comme petit groupe coherent de helpers gib/debris.
