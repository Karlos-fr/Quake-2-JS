# Progress - Quake-2-master/game/m_hover.c

- Statut: Termine
- Dernier lot valide: fermeture du fichier `m_hover.c` en lot tres elargi: toutes les tables/moves restantes (`hover_frames_stand` a `hover_frames_end_attack`), bloc attaque complet (`hover_reattack`, `hover_fire_blaster`, `hover_move_start_attack`, `hover_move_attack1`, `hover_move_end_attack` et effets associes), transitions `hover_walk`/`hover_start_attack`, pain, deadthink/dead/die et `SP_monster_hover`.
- Entrees non applicables: prototypes C doublons de `hover_run`, `hover_stand`, `hover_dead`, `hover_attack`, `hover_reattack`, `hover_fire_blaster`, `hover_die`; variables locales `effect` et `n`, dont le comportement est valide avec `hover_fire_blaster` et `hover_die`.
- Tests de reference lances:
  - `npm run verify:m-hover`
  - `npm run verify:m-hover:header`
  - `npm run verify:m-hover:source-parity`
  - `npm run verify:local-gameplay-sync`
  - `npm run verify:full-game:render-source`
  - `npm run verify:full-game:three-renderer`
  - `npm run typecheck`
- Decisions runtime/apps-web/renderer-three:
  - Runtime: `monster_hover` est branche via `g_spawn.ts`; `SP_monster_hover`, callbacks, moves et fonctions sont exportes via `packages/game/src/index.ts` et repris par le registre de sauvegarde `g_save.ts`; les sons, gibs, explosions, blaster bolts et muzzleflash sortent par le runtime gameplay.
  - apps/web: le flux navigateur delegue au runtime/full-game porte et consomme les refresh frames, sons et evenements muzzleflash; aucune logique parallele hover ne masque le portage.
  - renderer-three: les sorties visibles attendues sont les entites MD2 `modelindex/frame/oldframe`, les effets de muzzleflash/dlights/particules client et l'explosion temp entity; elles sont consommees indirectement via `ClientRefreshFrame`, `refresh-entity-sync`, `three-dlight-sync` et `particle-sync`.
- Blocages: aucun.
- Prochain lot recommande: aucun pour `m_hover.c`; reprendre `m_hover.h` seulement dans une session separee.
