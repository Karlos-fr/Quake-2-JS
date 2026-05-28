# Progress TS - packages/client/src/cl_parse.ts

- 2026-05-28: fichier recentre sur `client/cl_parse.c`. Les symboles issus de `client/cl_ents.c`, `client/cl_tent.c`, `client/cl_fx.c` et `client/cl_inv.c` sont retires de la matrice proprietaire de `cl_parse.ts`; le fichier conserve les imports/reexports publics et le dispatch `CL_ParseServerMessage`.

- Fichier TS: `packages/client/src/cl_parse.ts`
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_client_src_cl_parse.ts.md`
- Lot traite: grand bloc complet de la matrice courante, depuis `ClientParseHooks` jusqu'a `cloneFrame`.
- Dernier lot valide: 48 symboles audites; les portages proprietaires deja valides dans les matrices C/H liees sont marques `Couvert C/H`, les helpers/paquets locaux sont classes `New` ou `Adapter` avec metadata explicite.
- Tests lances: `npm run verify:cl-parse` (ok), `npm run typecheck` (ok).
- Blocages: aucun dans la matrice TS courante.
- Decisions importantes:
  - `ClientParticleEffectPacket` est classe `New`, pas `Ported`, car c'est un type de payload local; le proprietaire C/H reste `CL_ParseParticles`.
  - `registerClientinfoResources` est classe `Adapter`, rattache a `CL_LoadClientinfo / CL_PrepRefresh`, car il porte la registration backend apres le parsing clientinfo.
  - `CL_ParseLayout` est couvert via `client.h`; l'implementation C source reste le cas `svc_layout` inline dans `client/cl_parse.c`.
- Prochain lot recommande: aucun dans la matrice TS actuelle; verifier `SHOWNET` lors d'une regeneration si le generateur l'ajoute a la matrice.
