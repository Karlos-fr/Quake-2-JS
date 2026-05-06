# Progress - Quake-2-master/game/m_hover.c

- Statut: En cours
- Dernier lot valide: sons globaux `sound_pain1` a `sound_search2`, `hover_sight`, `hover_search`, definitions comportementales simples `hover_stand`, `hover_run`, `hover_attack`, `hover_dead`; prototypes C doublons du bloc initial marques `Non applicable`.
- Tests de reference lances:
  - `npm run verify:m-hover`
  - `npm run verify:m-hover:header`
  - `npm run verify:m-hover:source-parity`
  - `npm run verify:local-gameplay-sync`
  - `npm run verify:full-game:render-source`
  - `npm run verify:full-game:three-renderer`
- Decisions runtime/apps-web/renderer-three:
  - Runtime: `monster_hover` est branche via `g_spawn.ts`; callbacks/moves exportes et repris par `g_save.ts`; sons et muzzleflash sortent par le runtime gameplay.
  - apps/web: consommation via `drainGameSoundEvents`, `drainMonsterMuzzleFlashEvents` et refresh frame client; pas de logique parallele reperee pour ce lot.
  - renderer-three: consommation attendue indirecte via `ClientRefreshFrame` pour modeles/frames, et via effets client pour le muzzleflash hover; pas de branchement direct gameplay requis.
- Blocages: aucun.
- Prochain lot recommande: valider le bloc attaque complet `hover_reattack`, `hover_fire_blaster`, `hover_move_start_attack`, `hover_move_attack1`, `hover_move_end_attack` et les entrees `effect` associees, puis poursuivre avec `hover_walk`/`hover_start_attack` si le lot reste coherent.
