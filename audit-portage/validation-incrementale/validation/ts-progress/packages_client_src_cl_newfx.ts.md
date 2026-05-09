# Progress TS - packages/client/src/cl_newfx.ts

- Fichier TS: `packages/client/src/cl_newfx.ts`
- Matrice TS: `audit-portage/validation-incrementale/validation/ts-matrices/packages_client_src_cl_newfx.ts.md`
- Dernier lot traite: `PARTICLE_GRAVITY`, `CL_ParticleSteamEffect`, `CL_ParticleSteamEffect2`, `CL_ParticleSmokeEffect`, `CL_BlasterParticles2`, `CL_DebugTrail`, `CL_BubbleTrail2`, `CL_ColorFlash`, `CL_Flashlight`, `CL_SmokeTrail`, `CL_ForceWall`, `CL_FlameEffects`, `CL_GenericParticleEffect`.
- Verdict du lot: valide en TS croise. Les fonctions exportees sont les proprietaires TS attendus pour `Quake-2-master/client/cl_newfx.c` et les lignes C/H correspondantes sont deja `Valide`; `PARTICLE_GRAVITY` est un miroir local documente de `client/client.h`.
- Tests de reference: `npm run typecheck`.
- Blocages: aucun.
- Decisions importantes: ne pas revalider le comportement des fonctions marquees `Couvert C/H`; la preuve de session est la matrice C/H `client_cl_newfx.c.md` avec statut `Valide` pour les symboles du lot, et `client_client.h.md` pour `PARTICLE_GRAVITY`.
- Prochain lot recommande: continuer avec `CL_TrackerTrail`, `CL_Tracker_Shell`, `CL_Tracker_Explode`, `CL_TagTrail`, `CL_BlasterTrail2`, `CL_WidowSplash`, `CL_ColorExplosionParticles`, `CL_Heatbeam`, `CL_MonsterPlasma_Shell`, `CL_Widowbeamout`, `CL_Nukeblast`.
