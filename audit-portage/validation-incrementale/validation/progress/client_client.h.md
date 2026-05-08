# Progress - Quake-2-master/client/client.h

## Etat courant

- Statut: En cours
- Dernier lot traite: premier bloc header `frame_t`, `centity_t`, `MAX_CLIENTWEAPONMODELS`, `clientinfo_t`, `num_cl_weaponmodels`, `CMD_BACKUP`, `client_state_t` et champs generes associes.
- Verdict du lot: Valide pour les types/constantes/globals proprietaires; `Non applicable` pour les lignes correspondant a des champs de structs deja couvertes par leur struct proprietaire.

## Preuves session

- Source lue: `Quake-2-master/client/client.h` lignes de declaration du bloc frame/entity/client state.
- Cible lue: `packages/client/src/client.ts`, `packages/client/src/keys.ts`, integrations `packages/client/src/cl_parse.ts`, `packages/client/src/view.ts`, `packages/client/src/refresh.ts`, `apps/web/src/full-game-render-source.ts`, `apps/web/src/full-game.ts`, `packages/renderer-three/src/refresh-entity-sync.ts`.
- Tests lances: `npm run verify:client:header`, `npm run typecheck`.

## Decisions

- `clientinfo_t` et `client_state_t` gardent des champs/adapters TypeScript supplementaires pour parser/register les ressources et separer les handles renderer; les champs C du lot restent representes.
- Les champs cinematics de `client_state_t` sont regroupes dans `client_cinematic_t`; cette decision est couverte par la ligne `client_state_t`.
- `cmd` dans la matrice est un champ de `client_state_t`; la cible `keys.ts` indiquee par generation est un faux rattachement pour ce lot.
- Runtime: le bloc est atteint par `CL_ParseServerMessage`/`CL_ParseFrame`, `CL_AddEntities`, `V_RenderView`, `CL_SendCmd` et les transitions `CL_Frame` selon les sous-flux deja portes.
- `apps/web`: le navigateur consomme `connstate_t`, `cl.frame`, `cl_parse_entities`, `model_draw`, `clientinfo`, `keydest_t` et declenche le rendu full-game via l'etat client; aucun manque web ouvert pour ce lot.
- `renderer-three`: les sorties visibles du lot (`frame_t.areabits`, entites parsees, modeles, skins, frames, camera/refdef) sont projetees via `apps/web` vers les sync adapters renderer; aucun manque renderer ouvert pour ce lot.

## Prochain lot recommande

Continuer avec `connstate_t`, `dltype_t`, `keydest_t`, `client_static_t` et les champs generes associes jusqu'a `demofile`, en verifiant explicitement le split `keydest_t` dans `packages/client/src/keys.ts`.
