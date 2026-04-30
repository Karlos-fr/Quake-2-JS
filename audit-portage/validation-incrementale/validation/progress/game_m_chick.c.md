# Progress - Quake-2-master/game/m_chick.c

## Etat

- Matrice: `validation/matrices/game_m_chick.c.md`
- Statut global: En cours
- Dernier lot valide: sons, fidget et sight
- Prochain lot recommande: stand/start-run/run/walk tables (`chick_frames_stand`, `chick_move_stand`, `chick_frames_start_run`, `chick_move_start_run`, `chick_frames_run`, `chick_move_run`, `chick_frames_walk`, `chick_move_walk`)

## Lots traites

| Lot | Entites | Statut | Tests | Notes |
| --- | --- | --- | --- | --- |
| transitions simples | `chick_stand`, `chick_walk`, `chick_attack1`, `chick_slash`, `chick_melee`, `chick_attack` | Valide | `verify:m-chick`, `verify:m-chick:header`, `verify:m-chick:source-parity`, `typecheck` | Headers ajoutes. |
| branches run/re-attaque | `chick_run`, `chick_rerocket`, `chick_reslash` | Valide | `verify:m-chick`, `verify:m-chick:header`, `verify:m-chick:source-parity`, `typecheck` | Garde TS `self.enemy` documentee pour `chick_rerocket` et `chick_reslash`. |
| sons, fidget et sight | `sound_*`, `ChickMoan`, `chick_frames_fidget`, `chick_move_fidget`, `chick_fidget`, `chick_sight` | Valide | `verify:m-chick`, `verify:m-chick:header`, `verify:m-chick:source-parity`, `typecheck` | Headers completes pour `ChickMoan`, `chick_fidget` et `chick_sight`. |

## Blocages

Aucun blocage connu sur les lots deja traites.

## Reprise

Reprendre avec le prochain lot recommande.
Ne pas revalider les lignes deja marquees `Valide` dans la matrice.
