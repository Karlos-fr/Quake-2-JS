# Progress - Quake-2-master/client/ref.h

## Etat courant

- Statut: En cours
- Dernier lot valide: constantes de capacite refresh (`MAX_DLIGHTS`, `MAX_ENTITIES`, `MAX_PARTICLES`, `MAX_LIGHTSTYLES`), `POWERSUIT_SCALE`, couleurs `SHELL_*`, `entity_s`/`entity_t`, champs generes associes et `ENTITY_FLAGS`.
- Tests de reference lances: `npm run verify:ref:header`, `npm run verify:refresh-entity:alias-flags`, `npm run verify:ref-gl-host`, `npm run typecheck`.

## Decisions et preuves

- `MAX_LIGHTSTYLES` est proprietaire de `packages/qcommon/src/q_shared.ts` et re-exporte par `packages/client/src/ref.ts`, ce qui correspond a son usage configstring partage.
- `entity_s` est porte en `entity_t` dans `packages/client/src/ref.ts`; les noms de champs source sont conserves.
- `createEntity` est un helper nouveau documente comme zero-initialiseur de `entity_t`; `verify:ref:header` verifie maintenant tous les champs zero/null.
- Le flux runtime attendu est present: les entites de refresh sont construites dans `packages/client/src/view.ts`, bornees par `MAX_ENTITIES`, puis materialisees dans `refdef_t`.
- `apps/web` consomme ce flux via le runtime full-game/demo et `createThreeRefreshEntitySync`, sans logique parallele qui remplace `entity_t`.
- `packages/renderer-three` consomme les sorties visibles attendues: modeles, frames/oldframes, origins/oldorigins, angles, skins/skinnum, flags shell/beam/translucency et lightstyles; `POWERSUIT_SCALE` est consomme par l'extrusion shell MD2.

## Corrections appliquees

- `packages/client/src/ref.ts`: ajout du commentaire `Category: New` sur `createEntity`.
- `scripts/verify/quake2-ref-header.ts`: couverture complete des champs par defaut de `createRefEntity`.

## Prochain lot recommande

Valider `dlight_t`, `particle_t`, `lightstyle_t` et leurs champs generes associes, avec attention particuliere aux flux visibles renderer: dlights, particules et lightstyles.
