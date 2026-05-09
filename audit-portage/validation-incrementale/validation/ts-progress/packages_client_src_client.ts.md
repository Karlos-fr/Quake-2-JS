# Progress TS - packages/client/src/client.ts

- Fichier TS: `packages/client/src/client.ts`
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_client_src_client.ts.md`
- Statut: En cours

## Dernier lot valide

Lot du 2026-05-09:

- Symboles traites: `MAX_PARSE_ENTITIES`, `CMD_BACKUP`, `MAX_CLIENTWEAPONMODELS`, `MAX_EXPLOSIONS`, `MAX_BEAMS`, `MAX_LASERS`, `MAX_SUSTAINS`, `MAX_DLIGHTS`, `MAX_PARTICLES`, `INSTANT_PARTICLE`, `client_lightstyle_t`, `client_dlight_t`, `cparticle_t`, `kbutton_t`, `frame_t`, `centity_t`, `clientinfo_t`, `client_beam_t`, `client_tent_entity_t`, `client_explosion_t`, `client_laser_t`, `client_sustain_t`.
- Preuves C/H: `client_client.h.md`, `client_cl_fx.c.md`, `client_cl_tent.c.md`, `client_ref.h.md` consultes dans cette session.
- Corrections: commentaires d'en-tete ajoutes/corriges pour les constantes et les types temp-entity reclasses; matrice TS mise a jour.
- Tests: `npm run typecheck`.

## Decisions

- `MAX_DLIGHTS`, `MAX_PARTICLES` et `client_tent_entity_t` sont des adapters locaux vers `client/ref.h`; le proprietaire canonique `ref.h` reste `packages/client/src/ref.ts`.
- `client_beam_t`, `client_explosion_t` et `client_laser_t` restent heberges dans `client.ts` comme types de stockage runtime; leur comportement est valide via `cl_tent.ts`.

## Prochain lot recommande

Continuer avec `client_temp_light_t`, `client_force_wall_t`, `client_tent_state_t`, `client_screen_state_t`, `client_sky_t`, `client_cinematic_t`, `client_precache_state_t`, `client_state_t`, `connstate_t`, `dltype_t`, `client_static_t`, `ClientRuntime`, puis les premiers create helpers si le lot reste raisonnable.

## Blocages

Aucun.
