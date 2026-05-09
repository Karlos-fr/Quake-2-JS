# Progress TS - packages/client/src/client.ts

- Fichier TS: `packages/client/src/client.ts`
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_client_src_client.ts.md`
- Statut: En cours

## Dernier lot valide

Lot du 2026-05-09:

- Symboles traites: `MAX_PARSE_ENTITIES`, `CMD_BACKUP`, `MAX_CLIENTWEAPONMODELS`, `MAX_EXPLOSIONS`, `MAX_BEAMS`, `MAX_LASERS`, `MAX_SUSTAINS`, `MAX_DLIGHTS`, `MAX_PARTICLES`, `INSTANT_PARTICLE`, `client_lightstyle_t`, `client_dlight_t`, `cparticle_t`, `kbutton_t`, `frame_t`, `centity_t`, `clientinfo_t`, `client_beam_t`, `client_tent_entity_t`, `client_explosion_t`, `client_laser_t`, `client_sustain_t`, `client_temp_light_t`, `client_force_wall_t`, `client_tent_state_t`, `client_screen_state_t`, `client_sky_t`, `client_cinematic_t`, `client_precache_state_t`, `client_state_t`, `connstate_t`, `dltype_t`, `client_static_t`, `ClientRuntime`, `createClientTempLight`, `createClientForceWall`, `createClientTentState`, `createClientScreenState`, `createClientSkyState`, `createClientCinematicState`, `createClientState`, `createClientStatic`, `createClientPrecacheState`, `createClientRuntime`.
- Preuves C/H: `client_client.h.md`, `client_cl_fx.c.md`, `client_cl_tent.c.md`, `client_ref.h.md`, `client_cl_cin.c.md` consultes dans cette session; `Quake-2-master/client/client.h` et `Quake-2-master/client/cl_cin.c` relus pour les declarations sources.
- Corrections: commentaires d'en-tete ajoutes/corriges pour les constantes, les types temp-entity reclasses, les etats runtime locaux et les factories du lot; matrice TS mise a jour.
- Tests: `npm run audit:validation:ts-matrices`, `npm run verify:client:header`, `npm run verify:cl-tent`, `npm run verify:cl-scrn`, `npm run verify:cl-parse`, `npm run verify:cinematic:audio-sync`, `npm run typecheck`.

## Decisions

- `MAX_DLIGHTS`, `MAX_PARTICLES` et `client_tent_entity_t` sont des adapters locaux vers `client/ref.h`; le proprietaire canonique `ref.h` reste `packages/client/src/ref.ts`.
- `client_beam_t`, `client_explosion_t` et `client_laser_t` restent heberges dans `client.ts` comme types de stockage runtime; leur comportement est valide via `cl_tent.ts`.
- `client_temp_light_t`, `client_force_wall_t`, `client_tent_state_t`, `client_screen_state_t`, `client_sky_t`, `client_precache_state_t`, `ClientRuntime` et les factories traitees sont des etats/helpers locaux `Category: New` sans proprietaire C/H direct.
- `client_cinematic_t`, `client_state_t`, `connstate_t`, `dltype_t` et `client_static_t` sont couverts par les matrices C/H deja validees.

## Prochain lot recommande

Continuer avec `createFrame`, `createCentity`, `createClientinfo`, `createClientLightstyle`, `createClientDlight`, `createCparticle`, `createClientBeam`, `createClientExplosion`, `createClientTentEntity`, `createClientLaser`, `createClientSustain`, `createKbutton`, `createUsercmd`.

## Blocages

Aucun.
