# Progress - Quake-2-master/game/m_chick.c

## Etat

- Matrice: `validation/matrices/game_m_chick.c.md`
- Statut global: En cours
- Dernier lot valide: stand/start-run/run/walk tables
- Prochain lot recommande: pain tables et `chick_pain` (`chick_frames_pain1`, `chick_move_pain1`, `chick_frames_pain2`, `chick_move_pain2`, `chick_frames_pain3`, `chick_move_pain3`, `chick_pain`)

## Lots traites

| Lot | Entites | Statut | Tests | Notes |
| --- | --- | --- | --- | --- |
| transitions simples | `chick_stand`, `chick_walk`, `chick_attack1`, `chick_slash`, `chick_melee`, `chick_attack` | Valide | `verify:m-chick`, `verify:m-chick:header`, `verify:m-chick:source-parity`, `typecheck` | Headers ajoutes. |
| branches run/re-attaque | `chick_run`, `chick_rerocket`, `chick_reslash` | Valide | `verify:m-chick`, `verify:m-chick:header`, `verify:m-chick:source-parity`, `typecheck` | Garde TS `self.enemy` documentee pour `chick_rerocket` et `chick_reslash`. |
| sons, fidget et sight | `sound_*`, `ChickMoan`, `chick_frames_fidget`, `chick_move_fidget`, `chick_fidget`, `chick_sight` | Valide | `verify:m-chick`, `verify:m-chick:header`, `verify:m-chick:source-parity`, `typecheck` | Headers completes pour `ChickMoan`, `chick_fidget` et `chick_sight`. |
| stand/start-run/run/walk tables | `chick_frames_stand`, `chick_move_stand`, `chick_frames_start_run`, `chick_move_start_run`, `chick_frames_run`, `chick_move_run`, `chick_frames_walk`, `chick_move_walk` | Valide | `verify:m-chick`, `verify:m-chick:header`, `verify:m-chick:source-parity`, `typecheck` | Aucune correction TS requise. |

## Passe rapide post-validation

Controle cible des lignes deja `Valide`: branchement runtime confirme via `monster_chick` dans `g_spawn`, exports `m_chick` dans `index` et enregistrement save/load par `g_save`. Pas d'integration directe `apps/web` attendue par ligne de comportement ou table: la propagation visible passe par les configstrings client modele/son, le `refreshFrame` et le drain des sons/evenements gameplay. Integration `packages/renderer-three` attendue uniquement comme consommation generique des entites refresh MD2/sprite et des effets client; le modele Chick est `models/monsters/bitch/tris.md2`, les frames proviennent de `currentmove`, les sons precaches/emis et le muzzleflash rocket `MZ2_CHICK_ROCKET_1` sont couverts par les chemins client/audio existants. Aucun statut `Valide` retrograde pendant cette passe.

## Blocages

Aucun blocage connu sur les lots deja traites.

## Reprise

Reprendre avec le prochain lot recommande.
Ne pas revalider les lignes deja marquees `Valide` dans la matrice.
