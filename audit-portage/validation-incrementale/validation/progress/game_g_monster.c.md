# Progress - Quake-2-master/game/g_monster.c

- Statut: En cours
- Dernier lot valide: `monster_fire_bullet`, `monster_fire_shotgun`, `monster_fire_blaster`, `monster_fire_grenade`, `monster_fire_rocket`, `monster_fire_railgun`, `monster_fire_bfg`
- Prochain lot recommande: `M_FliesOff`, `M_FliesOn`, `M_FlyCheck`
- Tests de reference: `npm run verify:g-monster`, `npm run typecheck`
- Blocages: aucun pour le lot valide

## Session courante

- Lot traite: wrappers d'armes monstre `monster_fire_*`.
- Preuves: comparaison directe avec `Quake-2-master/game/g_monster.c`, commentaires d'en-tete TS verifies, test ajoute dans `scripts/verify/quake2-g-monster.ts`, `npm run verify:g-monster` OK, `npm run typecheck` OK.
- Runtime: atteignable depuis `G_RunFrame` via `monster_think`/`M_MoveFrame` puis callbacks d'attaque des monstres portes; le drain `g_main.ts` serialize aussi `svc_muzzleflash2`.
- apps/web: pas d'appel direct attendu; le navigateur consomme ce flux via client/runtime local et source de rendu full-game.
- renderer-three: consommation attendue indirecte par `ClientRefreshFrame`; les muzzleflash2 generent dlights/sons/particules via `CL_BuildMuzzleFlash2Effects` et `local-gameplay-sync`.
