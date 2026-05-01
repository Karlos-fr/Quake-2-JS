# Progress - Quake-2-master/game/m_chick.c

## Etat

- Matrice: `validation/matrices/game_m_chick.c.md`
- Statut global: En cours
- Dernier lot valide: spawn setup (`SP_monster_chick`)
- Prochain lot recommande: prototype externe `visible`

## Lots traites

| Lot | Entites | Statut | Tests | Notes |
| --- | --- | --- | --- | --- |
| transitions simples | `chick_stand`, `chick_walk`, `chick_attack1`, `chick_slash`, `chick_melee`, `chick_attack` | Valide | `verify:m-chick`, `verify:m-chick:header`, `verify:m-chick:source-parity`, `typecheck` | Headers ajoutes. |
| branches run/re-attaque | `chick_run`, `chick_rerocket`, `chick_reslash` | Valide | `verify:m-chick`, `verify:m-chick:header`, `verify:m-chick:source-parity`, `typecheck` | Garde TS `self.enemy` documentee pour `chick_rerocket` et `chick_reslash`. |
| sons, fidget et sight | `sound_*`, `ChickMoan`, `chick_frames_fidget`, `chick_move_fidget`, `chick_fidget`, `chick_sight` | Valide | `verify:m-chick`, `verify:m-chick:header`, `verify:m-chick:source-parity`, `typecheck` | Headers completes pour `ChickMoan`, `chick_fidget` et `chick_sight`. |
| stand/start-run/run/walk tables | `chick_frames_stand`, `chick_move_stand`, `chick_frames_start_run`, `chick_move_start_run`, `chick_frames_run`, `chick_move_run`, `chick_frames_walk`, `chick_move_walk` | Valide | `verify:m-chick`, `verify:m-chick:header`, `verify:m-chick:source-parity`, `typecheck` | Aucune correction TS requise. |
| pain tables et `chick_pain` | `chick_frames_pain1`, `chick_move_pain1`, `chick_frames_pain2`, `chick_move_pain2`, `chick_frames_pain3`, `chick_move_pain3`, `chick_pain` | Valide | `verify:m-chick`, `verify:m-chick:header`, `verify:m-chick:source-parity`, `verify:local-gameplay-sync`, `verify:refresh-entity:alias-flags`, `verify:refresh-entity:sprite`, `verify:full-game:three-renderer`, `typecheck` | Header ajoute pour `chick_pain`. `verify:full-game:render-source` et `verify:full-game:audio-routing` bloquent avant execution sur l'import manquant `packages/client/src/types.js`. |
| death setup | `chick_dead`, `chick_frames_death2`, `chick_move_death2`, `chick_frames_death1`, `chick_move_death1`, `chick_die`, local `n` | Valide | `verify:m-chick`, `verify:m-chick:header`, `verify:m-chick:source-parity`, `verify:local-gameplay-sync`, `verify:refresh-entity:alias-flags`, `verify:full-game:three-renderer`, `typecheck` | Headers ajoutes pour `chick_dead` et `chick_die`. Renderer-three juge via consommation generique des entites refresh MD2: frames death1/death2 et bbox runtime produits par le serveur, gib models via entites runtime/g_misc; pas de logique gameplay attendue dans renderer. |
| duck/dodge setup | `chick_duck_down`, `chick_duck_hold`, `chick_duck_up`, `chick_frames_duck`, `chick_move_duck`, `chick_dodge` | Valide | `verify:m-chick`, `verify:m-chick:header`, `verify:m-chick:source-parity`, `verify:local-gameplay-sync`, `verify:refresh-entity:alias-flags`, `verify:full-game:three-renderer`, `typecheck` | Headers ajoutes pour les callbacks duck/dodge. `verify:full-game:render-source` et `verify:full-game:audio-routing` bloquent avant execution sur l'import manquant `packages/client/src/types.js`. Renderer-three juge via consommation generique des entites refresh MD2: frames duck01-duck07 et bbox runtime produits par le serveur/client refresh; pas de logique gameplay attendue dans renderer. |
| attack callbacks/setup | `ChickSlash`, `ChickRocket`, `Chick_PreAttack1`, `ChickReload`, `chick_frames_start_attack1`, `chick_move_start_attack1`, `chick_frames_attack1`, `chick_move_attack1`, `chick_frames_end_attack1`, `chick_move_end_attack1` | Valide | `verify:m-chick`, `verify:m-chick:header`, `verify:m-chick:source-parity`, `verify:local-gameplay-sync`, `verify:refresh-entity:alias-flags`, `verify:full-game:three-renderer`, `typecheck`; `verify:full-game:render-source` et `verify:full-game:audio-routing` bloques avant execution sur `packages/client/src/types.js` | Headers ajoutes pour les callbacks. `ChickRocket` garde `self.enemy` nul documentee. Renderer-three juge via consommation generique des entites refresh MD2 pour les frames attak101-attak132, du projectile rocket MD2 `models/objects/rocket/tris.md2` avec `EF_ROCKET`, et du flux client `svc_muzzleflash2`/`CL_BuildActionEffects`/`CL_SmokeAndFlash` pour `MZ2_CHICK_ROCKET_1`; pas de logique gameplay attendue dans renderer. |
| slash setup | `chick_frames_slash`, `chick_move_slash`, `chick_frames_end_slash`, `chick_move_end_slash`, `chick_frames_start_slash`, `chick_move_start_slash` | Valide | `verify:m-chick`, `verify:m-chick:header`, `verify:m-chick:source-parity`, `verify:local-gameplay-sync`, `verify:refresh-entity:alias-flags`, `verify:full-game:three-renderer`, `verify:web-render-order`, `typecheck`; `verify:full-game:render-source` bloque avant execution sur `packages/client/src/types.js` | Aucune correction TS requise. Runtime atteint via `monsterinfo.melee` -> `chick_melee` -> `chick_move_start_slash` -> `chick_slash` -> `chick_move_slash` -> `chick_reslash`/`chick_move_end_slash` depuis `G_RunFrame`/`M_MoveFrame`. Apps/web consomme le `refreshFrame`; renderer-three consomme generiquement les entites MD2, donc les frames attak201-attak216, sans logique gameplay attendue. |
| spawn setup | `SP_monster_chick` | Valide | `verify:m-chick`, `verify:m-chick:header`, `verify:m-chick:source-parity`, `verify:local-gameplay-sync`, `verify:refresh-entity:alias-flags`, `verify:full-game:three-renderer`, `verify:web-render-order`, `typecheck` | Header complete pour `SP_monster_chick`; test spawn renforce pour les callbacks `pain`, `die` et `monsterinfo`. Runtime atteint via `g_spawn`/`ED_CallSpawn`, export `index` et save/load `g_save`; apps/web consomme via serveur local et `refreshFrame`; renderer-three consomme le modele MD2 Chick `models/monsters/bitch/tris.md2` et les frames d'entite refresh generiques. |

## Passe rapide post-validation

Controle cible des lignes deja `Valide`: branchement runtime confirme via `monster_chick` dans `g_spawn`, exports `m_chick` dans `index` et enregistrement save/load par `g_save`. Pas d'integration directe `apps/web` attendue par ligne de comportement ou table: la propagation visible passe par les configstrings client modele/son, le `refreshFrame` et le drain des sons/evenements gameplay. Integration `packages/renderer-three` attendue uniquement comme consommation generique des entites refresh MD2/sprite et des effets client; le modele Chick est `models/monsters/bitch/tris.md2`, les frames proviennent de `currentmove`, les sons precaches/emis et le muzzleflash rocket `MZ2_CHICK_ROCKET_1` sont couverts par les chemins client/audio existants. Aucun statut `Valide` retrograde pendant cette passe.

## Blocages

Blocage externe aux lots traites: `verify:full-game:render-source` et `verify:full-game:audio-routing` echouent avant execution sur l'import manquant `packages/client/src/types.js`.

## Reprise

Reprendre avec le prochain lot recommande.
Ne pas revalider les lignes deja marquees `Valide` dans la matrice.
