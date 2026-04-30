# Progress - game/g_local.h

## Dernier lot valide

- 2026-04-30: debut des macros simples de `g_local.h`.
- Lot traite: `GAME_INCLUDE`, `GAMEVERSION`, `svc_muzzleflash`, `svc_muzzleflash2`, `svc_temp_entity`, `svc_layout`, `svc_inventory`, `svc_stufftext`, `DAMAGE_TIME`, `FALL_TIME`.
- Verdict: 9 constantes runtime validees; `GAME_INCLUDE` marque `Non applicable` car macro C de controle d'inclusion sans equivalent runtime TS.

## Dernier lot traite

- 2026-04-30: lot `SPAWNFLAG_NOT_EASY` a `SPAWNFLAG_NOT_COOP`.
- Verdict: `Valide` pour les 5 macros apres correction coordinateur du branchement runtime.
- Valeurs H/TS comparees et conformes:
  - `SPAWNFLAG_NOT_EASY = 0x00000100`
  - `SPAWNFLAG_NOT_MEDIUM = 0x00000200`
  - `SPAWNFLAG_NOT_HARD = 0x00000400`
  - `SPAWNFLAG_NOT_DEATHMATCH = 0x00000800`
  - `SPAWNFLAG_NOT_COOP = 0x00001000`
- Cible declarative verifiee: `packages/game/src/g_local.ts`; exports publics verifies dans `packages/game/src/index.ts`.
- Runtime: le C dans `game/g_spawn.c` utilise ces flags dans `SpawnEntities` pour inhiber les entites selon `deathmatch`/`skill`, appliquer le hack map `command` sur `SPAWNFLAG_NOT_HARD`, puis nettoyer les bits `SPAWNFLAG_NOT_*` apres acceptation. Correction coordinateur appliquee dans `packages/game/src/g_main.ts`: `SpawnEntities` porte ce filtrage/nettoyage avant `ED_CallSpawn`.
- `SPAWNFLAG_NOT_COOP`: le filtre coop est commente dans le C original; le nettoyage du bit reste attendu apres acceptation.
- apps/web: aucune reference directe aux constantes; pas d'integration web directe attendue pour ces macros, le comportement doit passer par le runtime spawn.
- renderer-three: aucune reference directe; pas d'integration renderer directe attendue, les entites visibles doivent etre decidees par le runtime spawn avant exposition au rendu.
- Commentaires d'en-tete: header de module `packages/game/src/g_local.ts` deja present et rattache a `game/g_local.h`; pas de fonction dans ce lot.
- Tests apres correction: `npm run verify:g-spawn` OK avec assertions skill/deathmatch/hack command/nettoyage; `npm run verify:g-local:header` OK; `npm run typecheck` OK.

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
- OK: verification ciblee en ligne:
  - `npx tsx -e "import { SPAWNFLAG_NOT_EASY, SPAWNFLAG_NOT_MEDIUM, SPAWNFLAG_NOT_HARD, SPAWNFLAG_NOT_DEATHMATCH, SPAWNFLAG_NOT_COOP } from './packages/game/src/g_local.ts'; ..."`
- `npm run verify:g-local:header` OK apres correction coordinateur de l'import de harness `g-local.js` vers `g_local.js`.
- `npm run verify:g-local:header` OK pendant le lot spawnflags.
- `npm run verify:g-spawn` OK pendant le lot spawnflags; et OK apres correction coordinateur avec couverture de l'inhibition par `SPAWNFLAG_NOT_*`.

## Passe rapide post-validation

- 2026-04-30: controle cible des 9 lignes deja `Valide` de la matrice. Les branchements runtime visibles restent conformes pour `GAMEVERSION`, `svc_muzzleflash`, `svc_muzzleflash2`, `svc_temp_entity`, `svc_inventory`, `DAMAGE_TIME` et `FALL_TIME`; `svc_layout` et `svc_stufftext` restent des bytes protocole exportes sans branchement runtime TS trouve dans ce lot. Aucune integration directe attendue dans `apps/web` ni `packages/renderer-three`: les recherches ne montrent pas de references a ces constantes dans ces packages, et les sorties visibles passent par les APIs/runtime game ou par des etats UI separes.

## Prochain lot recommande

- Continuer avec les premiers flags `FL_*` si le lot reste petit.

## Blocages

- Aucun blocage sur le lot `SPAWNFLAG_NOT_*` apres correction coordinateur de `SpawnEntities`.
