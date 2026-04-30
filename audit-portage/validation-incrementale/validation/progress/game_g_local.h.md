# Progress - game/g_local.h

## Dernier lot valide

- 2026-04-30: debut des macros simples de `g_local.h`.
- Lot traite: `GAME_INCLUDE`, `GAMEVERSION`, `svc_muzzleflash`, `svc_muzzleflash2`, `svc_temp_entity`, `svc_layout`, `svc_inventory`, `svc_stufftext`, `DAMAGE_TIME`, `FALL_TIME`.
- Verdict: 9 constantes runtime validees; `GAME_INCLUDE` marque `Non applicable` car macro C de controle d'inclusion sans equivalent runtime TS.

## Preuves de session

- Source H lue: `Quake-2-master/game/g_local.h` lignes du debut du fichier.
- Cible TS lue: `packages/game/src/g_local.ts` et `packages/game/src/runtime.ts`.
- Valeurs comparees H/TS:
  - `GAMEVERSION = "baseq2"`
  - `svc_muzzleflash = 1`, `svc_muzzleflash2 = 2`, `svc_temp_entity = 3`, `svc_layout = 4`, `svc_inventory = 5`, `svc_stufftext = 11`
  - `DAMAGE_TIME = 0.5`, `FALL_TIME = 0.3`
- Branchement/justification:
  - `GAMEVERSION` reference par `g_main` et `g_svcmds`.
  - `svc_muzzleflash`, `svc_muzzleflash2`, `svc_temp_entity` ecrits par `g_main` via `WriteByte`.
  - `svc_inventory` ecrit par `g_cmds` via `WriteByte`.
  - `svc_layout` et `svc_stufftext` sont des declarations de bytes protocole exportees; aucun usage runtime trouve dans ce lot.
  - `DAMAGE_TIME` utilise par `p_view` et `p_weapon`; `FALL_TIME` utilise par `p_view`.
  - Aucun usage trouve dans `apps/web` ni `packages/renderer-three`; non applicable pour ce lot declaratif game/protocole.
- Commentaires d'en-tete: le header de module de `packages/game/src/g_local.ts` existe et rattache le fichier a `game/g_local.h`; pas de fonction/adapter dans ce lot.

## Tests de reference

- OK: verification ciblee en ligne:
  - `npx tsx -e "import { GAMEVERSION, svc_muzzleflash, svc_muzzleflash2, svc_temp_entity, svc_layout, svc_inventory, svc_stufftext, DAMAGE_TIME, FALL_TIME } from './packages/game/src/g_local.ts'; ..."`
- `npm run verify:g-local:header` OK apres correction coordinateur de l'import de harness `g-local.js` vers `g_local.js`.

## Prochain lot recommande

- Continuer avec les macros simples suivantes: `SPAWNFLAG_NOT_EASY` a `SPAWNFLAG_NOT_COOP`, puis les premiers flags `FL_*` si le lot reste petit.

## Blocages

- Aucun blocage sur les constantes validees.
