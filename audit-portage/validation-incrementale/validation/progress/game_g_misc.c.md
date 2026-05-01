# Progress - Quake-2-master/game/g_misc.c

## Dernier lot valide

- 2026-05-01: helpers gib/debris `VelocityForDamage`, `VectorScale` et `ClipGibVelocity`.
- Checklist appliquee:
  - Source C comparee aux helpers TS dans `packages/game/src/g_misc.ts`: `VelocityForDamage` conserve les tirages `crandom`/`random`, le seuil `damage < 50` et les facteurs `0.7`/`1.2`; `VectorScale` est porte par le helper local `scaleVec3` avec retour tuple; `ClipGibVelocity` conserve les bornes `[-300, 300]` en X/Y et `[200, 500]` en Z.
  - Commentaires d'en-tete ajoutes pour les trois helpers dans `packages/game/src/g_misc.ts`.
  - Branchement runtime verifie: les helpers sont appeles par `ThrowGib`/`ThrowHead`, eux-memes atteignables depuis les morts/gibs de monstres et joueurs; les debris passent par `ThrowDebris` dans les explosions. Les entites dynamiques sont liees au runtime, avancees par `G_RunFrame`/`G_RunEntity`, puis eligibles a `SV_BuildClientFrame` via `modelindex`/`effects`.
  - `apps/web`: pas de logique parallele trouvee pour ces helpers; le flux web consomme les packet entities via le `refreshFrame` full-game/local.
  - `renderer-three`: integration attendue car les gibs/debris sont des modeles MD2 visibles; le renderer consomme les sorties via `refresh-entity-sync` (`refreshFrame.entities`, `modelindex`, `origin`, `angles`, `effects`), sans compensation gameplay.
- Correction appliquee: commentaires de portage ajoutes dans `packages/game/src/g_misc.ts`.
- Tests lances:
  - `npm run verify:g-misc` OK.
  - `npm run verify:refresh-entity:alias-flags` OK.
  - `npm run typecheck` OK.
  - `npm run verify:full-game:render-source` tente mais bloque avant scenario sur import existant manquant `packages/client/src/types.js`.

## Correction des partielles

- 2026-04-30: correction de l'integration visible areaportals (`Use_Areaportal`, `SP_func_areaportal`).
  - Correction appliquee: `packages/client/src/refresh.ts` ajoute `ClientRefreshFrame.areabits` clone depuis `runtime.cl.frame.areabits`; `packages/renderer-three/src/gl-world-scene-adapter.ts` recopie ces bits dans la refdef et appelle `setRefdefState` pendant `update`, avant `R_MarkLeaves`/`R_DrawWorld`.
  - Checklist reprise: source C/TS deja comparee sur `Use_Areaportal`/`SP_func_areaportal`; commentaires d'en-tete TS verifies; branchement runtime `CM_SetAreaPortalState` et spawn/export verifies; `apps/web` passe deja `refreshFrame` au world adapter; `renderer-three` consomme maintenant les `areabits` pour le culling visible des zones fermees.
  - Tests lances: `npm run verify:g-misc`, `npm run verify:g-spawn`, `npx tsx ./scripts/verify/quake2-cl-view.ts`, `npm run verify:gl-rsurf`, `npm run verify:particle-sync`, `npm run verify:beam-sync`, `npm run verify:dlight-sync`, `npm run verify:refresh-entity:sprite`, `npm run verify:refresh-entity:alias-flags`, `npm run verify:refresh-entity:weapon`, `npm run typecheck`.

## Passe rapide post-validation

- 2026-04-30: controle limite aux lignes deja `Valide` de la matrice (`Use_Areaportal`, `SP_func_areaportal`). Verdict documentaire alors corrige en `Partiel`: le branchement runtime game etait present (`CM_SetAreaPortalState`, spawn `func_areaportal`, export `index.ts`), mais l'integration visible attendue n'etait pas complete car `ClientRefreshFrame`/`apps/web` ne propageaient pas les `areabits` vers `renderer-three`; point corrige dans la section precedente.

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

- `gib_think`, `gib_touch`, `gib_die` et `ThrowGib`, comme prochain petit groupe coherent de comportements gib.
