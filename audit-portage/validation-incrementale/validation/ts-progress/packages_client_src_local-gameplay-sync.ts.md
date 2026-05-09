# Progress TS - packages/client/src/local-gameplay-sync.ts

- Statut: Termine
- Dernier lot valide: tout le fichier (`PLAYER_TRIGGER_MINS`, `PLAYER_TRIGGER_MAXS`, `PLAYER_DUCKED_MAXS`, `PLAYER_GIB_MINS`, `PLAYER_GIB_MAXS`, `PLAYER_STAND_VIEWHEIGHT`, `LOCAL_VIEWHEIGHT_SMOOTH_SPEED`, `LocalViewMotionState`, `BrushModelInterpolationState`, `createLocalViewMotionState`, `advanceLocalGameplayRuntime`, `updateLocalGameplayPlayer`, `syncLocalGameplayFrame`, `syncLocalGameplayConfigstrings`, `initializeLocalSkyState`, `toLocalClientHudBootstrap`, `syncLocalWeaponPlayerState`, `updateLocalViewWeaponMotion`, `syncLocalGameplayAssetConfigstrings`, `syncLocalGameplayModelClip`, `syncLocalGameplayTransientEffects`, `buildLocalTempEntityPacket`, `readPayloadVec3`, `readPayloadNumber`, `directionToByte`, `applyLocalGameplayActionEffects`, `queueLocalGameplayActionSounds`, `collectVisibleGameplayEntityStates`, `cloneEntityState`, `copyEntityState`, `applyPredictedGameplayHull`, `clamp`, `approachValue`, `parseLocalSkyRotate`, `parseLocalSkyAxis`)
- Prochain lot recommande: Aucun.
- Tests de reference:
  - `npm run verify:local-gameplay-sync`
  - `npm run verify:pmove:local-bmodel`
  - `npm run verify:full-game:newgame`
  - `npm run verify:full-game:three-renderer`
  - `npm run typecheck`
- Decisions:
  - Les 35 symboles audites sont du code `Category: New` sans proprietaire C/H direct.
  - Les en-tetes et la matrice utilisent `Original name: N/A` et `Source: N/A (local gameplay sync bridge)`.
  - La matrice existante ne listait pas `advanceLocalGameplayRuntime`; la ligne a ete ajoutee pour garder la validation du fichier coherente avec les exports actuels.
  - Le fichier est une passerelle runtime locale entre `GameRuntime`, `ClientRuntime`, les flux `cl_fx`/`cl_tent` et les adapters de rendu, pas un remplacement de portage proprietaire C/H.
- Blocages: Aucun.
