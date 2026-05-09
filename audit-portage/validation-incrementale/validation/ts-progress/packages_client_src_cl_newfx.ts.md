# Progress TS - packages/client/src/cl_newfx.ts

- Fichier TS: `packages/client/src/cl_newfx.ts`
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_client_src_cl_newfx.ts.md`
- Dernier lot traite: `CL_TrackerTrail`, `CL_Tracker_Shell`, `CL_Tracker_Explode`, `CL_TagTrail`, `CL_BlasterTrail2`, `CL_WidowSplash`, `CL_ColorExplosionParticles`, `CL_Heatbeam`, `CL_MonsterPlasma_Shell`, `CL_Widowbeamout`, `CL_Nukeblast`.
- Verdict du lot: couvert C/H en TS croise. Les fonctions exportees sont les proprietaires TS attendus pour `Quake-2-master/client/cl_newfx.c`; leurs entetes TS indiquent `Original name`, `Source: client/cl_newfx.c`, `Category: Ported`, et les lignes C/H correspondantes sont deja `Valide` dans `client_cl_newfx.c.md`.
- Tests de reference: `npm run typecheck`.
- Blocages: aucun.
- Decisions importantes: ne pas revalider le comportement des fonctions marquees `Couvert C/H`; la preuve de session est la matrice C/H `client_cl_newfx.c.md` avec statut `Valide` pour les symboles du lot. Aucun doublon proprietaire trouve; les sorties particules/beams/sustains restent integrees par `cl_fx.ts`, `cl_tent.ts`, `refresh.ts` puis consommees par `renderer-three`.
- Prochain lot recommande: continuer avec les helpers locaux restants `createTrailEffect`, `MakeNormalVectors`, `normalizeVector`, `crossProduct`, `dotProduct`, `vectoangles2`, `allocParticle`, `allocDlight`, `resetDlight`, `addScaledVector`, `subtractVec3`, `normalizeVectorCopy`, `floatMod`, `crand`, `normalizeRandomDirection`.
