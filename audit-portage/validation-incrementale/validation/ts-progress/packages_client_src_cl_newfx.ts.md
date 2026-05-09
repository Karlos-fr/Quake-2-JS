# Progress TS - packages/client/src/cl_newfx.ts

- Fichier TS: `packages/client/src/cl_newfx.ts`
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_client_src_cl_newfx.ts.md`
- Dernier lot traite: `createTrailEffect`, `MakeNormalVectors`, `normalizeVector`, `crossProduct`, `dotProduct`, `vectoangles2`, `allocParticle`, `allocDlight`, `resetDlight`, `addScaledVector`, `subtractVec3`, `normalizeVectorCopy`, `floatMod`, `crand`, `normalizeRandomDirection`.
- Verdict du lot: termine. `vectoangles2` est le proprietaire TS attendu pour `Quake-2-master/client/cl_newfx.c` et la matrice C/H `client_cl_newfx.c.md` est deja `Valide`; les helpers locaux New presents dans `cl_newfx.ts` ont maintenant un en-tete explicite `Original name: N/A`, `Source: N/A (local helper)`, `Category: New`; `MakeNormalVectors` et `crand` sont des imports externes non proprietaires; `normalizeVector` et `crossProduct` sont absents de `cl_newfx.ts` et restent des helpers prives de `cl_fx.ts`.
- Tests de reference: `npm run typecheck`.
- Blocages: aucun.
- Decisions importantes: ne pas revalider le comportement des fonctions marquees `Couvert C/H`; la preuve de session est la matrice C/H `client_cl_newfx.c.md` avec statut `Valide` pour `vectoangles2`. `MakeNormalVectors` reste proprietaire dans `cl_fx.ts` d'apres `client_cl_fx.c.md`; `crand` reste proprietaire dans `qcommon.ts` d'apres `qcommon_common.c.md` et `qcommon_qcommon.h.md`. Les helpers locaux New ne sont pas des portages proprietaires et ne doivent pas masquer ces owners. Les sorties particules/dlights restent produites par le runtime client et consommees par les adaptateurs renderer existants.
- Prochain lot recommande: aucun dans la matrice TS actuelle; fichier `packages/client/src/cl_newfx.ts` termine cote validation TS croisee.
