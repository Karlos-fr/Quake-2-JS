# Progress - Quake-2-master/game/m_boss3.c

## Etat

- Matrice: `validation/matrices/game_m_boss3.c.md`
- Statut global: A demarrer au debut de session; fichier clos localement, a synchroniser par le coordinateur si necessaire.
- Dernier lot valide: toutes les entites de `m_boss3.c`
- Prochain lot recommande: aucun dans ce fichier

## Lots traites

| Lot | Entites | Statut | Tests | Notes |
| --- | --- | --- | --- | --- |
| boss3 stand-in complet | `Use_Boss3`, `Think_Boss3Stand`, `SP_monster_boss3_stand` | Valide | `verify:m-boss3`, `verify:m-boss3:source-parity`, `verify:cl-fx`, `verify:local-gameplay-sync`, `verify:particle-sync`, `verify:full-game:three-renderer`, `typecheck` | En-tetes verifies. `Use_Boss3` sort `TE_BOSSTPORT` via la file runtime, flush serveur et consommation client temp entity; `Think_Boss3Stand` boucle `FRAME_stand201..FRAME_stand260`; `SP_monster_boss3_stand` est atteint via `g_spawn`/`ED_CallSpawn`, enregistre modele/son, bbox et callbacks, et `g_save` retrouve les fonctions. Correction appliquee au harness `scripts/verify/quake2-cl-fx.ts` pour que la suite liee aux particules aille au bout. |

## Integration runtime / apps-web / renderer-three

- Runtime: integre. Spawn atteint depuis `ED_CallSpawn` via `monster_boss3_stand`; callbacks `use` et `think` poses sur l'entite; `Use_Boss3` draine en `svc_temp_entity` avec `TE_BOSSTPORT`; `g_save` restaure les callbacks.
- apps/web: integre par le flux client normal. Le shell web n'a pas besoin de logique gameplay specifique: `CL_ParseTEnt`/`CL_ExecuteTempEntityEffects` produisent les particules, et le hook web lance le son d'effet autoritatif.
- renderer-three: integre comme consommateur generique. Le stand-in visible est une entite MD2 dans le `refreshFrame`; le boss teleport produit des particules client, consommees par `particle-sync` et `R_DrawParticles`.

## Blocages

Aucun blocage ouvert pour `m_boss3.c`.

## Reprise

Fichier clos cote matrice: 3 lignes `Valide`.
Ne pas revalider ces lignes sauf regression; reprendre le prochain fichier prioritaire dans `AVANCEMENT_GLOBAL.md`.
