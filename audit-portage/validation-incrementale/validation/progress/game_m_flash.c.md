# Progress - Quake-2-master/game/m_flash.c

## Session 2026-05-06

- Lot traite: table declarative complete `monster_flash_offset` et son usage muzzle-flash.
- Verdict: termine; les deux lignes de la matrice sont `Valide`.
- Comparaison C/TS: `npm run verify:m-flash` parse `Quake-2-master/game/m_flash.c` et compare toute la table TS, longueur 212, slot 0, sentinelle finale et offsets corriges importants.
- Commentaires d'en-tete: `packages/game/src/m_flash.ts` declare `Original name: monster_flash_offset`, `Source: game/m_flash.c`, `Category: Ported`, `Fidelity level: Strict`; `packages/client/src/monster-flash.ts` est un adapter de reexport, pas l'ownership principal.
- Runtime: la table est consommee par les monstres TS via `getMonsterFlashOffset`; les tirs de monstres appellent `monster_fire_*`, `emitMonsterMuzzleFlash`, puis `g_main.ts` serialize `svc_muzzleflash2`. Le client reconstruit l'origine visible dans `CL_BuildMuzzleFlash2Effects` avec `getMonsterFlashOffset`.
- apps/web: `apps/web/src/full-game.ts` consomme `onMuzzleFlash2` en appliquant les effets client; `apps/web/src/full-game-render-loop.ts` envoie les frames refresh aux sync Three.
- renderer-three: les sorties visibles attendues sont dlights et particules de muzzle flash; elles sont consommees par `packages/renderer-three/src/three-dlight-sync.ts` et `packages/renderer-three/src/particle-sync.ts` depuis `ClientRefreshFrame`.
- Tests lances: `npm run verify:m-flash`, `npm run verify:cl-fx`, `npm run verify:particle-sync`, `npm run verify:dlight-sync`, `npm run verify:full-game:three-renderer`, `npm run verify:full-game:render-source`.

## Prochain lot recommande

Aucun pour `m_flash.c`; fichier clos. Reprendre le prochain fichier prioritaire depuis `AVANCEMENT_GLOBAL.md`.
