# Progress TS - packages/client/src/cl_ents.ts

## Dernier lot valide

- 2026-05-28: ajout des parseurs proprietaires `client/cl_ents.c` (`CL_ParseEntityBits`, `CL_ParseDelta`, `CL_ParsePlayerstate`, `CL_ParseFrame`, `CL_DeltaEntity`, `CL_ParsePacketEntities`) deplaces depuis `cl_parse.ts`.
- 2026-05-08: fichier complet valide, 7 symboles audites: `ClientEntityEvent`, `ClientInterpolatedEntity`, `CL_FireEntityEvents`, `CL_BuildFrameEntityEventEffects`, `CL_GetFrameEntityStates`, `CL_BuildPacketEntitySnapshots`, `cloneEntityState`.
- `CL_FireEntityEvents` et `CL_BuildPacketEntitySnapshots` sont les proprietaires TS attendus de `CL_FireEntityEvents` et `CL_AddPacketEntities` dans `Quake-2-master/client/cl_ents.c`; la matrice C/H `client_cl_ents.c.md` les marque `Valide`, donc les lignes TS sont `Couvert C/H`.
- Les interfaces et helpers de snapshots/copie sont `Category: New` avec `Original name: N/A` et `Source declaree: N/A (...)`; ils ne masquent pas de portage proprietaire.
- `CL_BuildFrameEntityEventEffects` est un adapter de composition entre `CL_FireEntityEvents` et le port `CL_EntityEvent` de `cl_fx.ts`, pas le proprietaire C/H d'une entite source.

## Preuves de session

- Consignes relues: `README.md`, `CHECKLIST_VALIDATION_TS.md`, `CHECKLIST_VALIDATION_ENTITES.md`, `ORGANISATION_AGENTS.md`.
- Croisement effectue avec `validation/matrices/client_cl_ents.c.md` et `validation/progress/client_cl_ents.c.md`.
- References verifiees: `cl_parse.ts` appelle `CL_FireEntityEvents`, `refresh.ts` appelle `CL_BuildPacketEntitySnapshots`, `apps/web/src/full-game.ts` consomme `ClientEntityEvent`, les scripts de verification couvrent `CL_GetFrameEntityStates`, `CL_BuildFrameEntityEventEffects` et les snapshots packet-entities.
- Integration renderer verifiee via `refresh.ts` puis `packages/renderer-three/src/refresh-entity-sync.ts` et `md2-mesh-builder.ts`, qui consomment modeles, frames, oldframes, backlerp, origins, angles, flags et skins issus du refresh frame.

## Tests lances

- `npm run verify:cl-fx`: OK
- `npm run verify:refresh-entity:alias-flags`: OK
- `npm run verify:refresh-entity:weapon`: OK
- `npm run verify:full-game:render-source`: OK
- `npm run verify:full-game:three-renderer`: OK
- `npm run verify:entities:phase5:map-flags`: OK
- `npm run typecheck`: OK
- `npm run verify:entities:phase4`: echec hors fichier cible sur `base1 refresh frame contains render entities: false != true`; le script lit bien les etats de frame, puis echoue sur la construction du refresh frame.
- `npm run verify:entities:phase5`: echec hors fichier cible sur `linked model refresh entity count: 0 != 4`; le harness construit un refresh frame via `CL_BuildRefreshFrame`, donc l'ecart est a reprendre cote harness/refresh, pas dans les en-tetes TS de `cl_ents.ts`.
- `npm run verify:entities:phase8:scene`: echec hors fichier cible sur `EF_BFG main entity alpha: attendu 0.3, recu 0`; le direct `CL_BuildPacketEntitySnapshots` passe avant l'assertion refresh frame, a reprendre cote harness/refresh.

## Blocages / remarques

- Aucun blocage pour les 7 symboles TS de `cl_ents.ts`.
- Trois scripts historiques lies au refresh frame echouent apres les verifications directes `cl_ents.ts`; ils n'ont pas ete corriges dans cette mission car le perimetre demande est un fichier TS unique.

## Prochain lot recommande

- Aucun, fichier termine.
