# Progress - game/g_local.h

## Dernier lot valide

- 2026-04-30: debut des macros simples de `g_local.h`.
- Lot traite: `GAME_INCLUDE`, `GAMEVERSION`, `svc_muzzleflash`, `svc_muzzleflash2`, `svc_temp_entity`, `svc_layout`, `svc_inventory`, `svc_stufftext`, `DAMAGE_TIME`, `FALL_TIME`.
- Verdict: 9 constantes runtime validees; `GAME_INCLUDE` marque `Non applicable` car macro C de controle d'inclusion sans equivalent runtime TS.

## Dernier lot traite

- 2026-04-30: lot flags `FL_IMMUNE_LASER`, `FL_GODMODE`, `FL_NOTARGET`.
- Verdict: `Valide` pour les 3 macros apres correction limitee de l'export public.
- Valeurs H/TS comparees et conformes:
  - `FL_IMMUNE_LASER = 0x00000004`
  - `FL_GODMODE = 0x00000010`
  - `FL_NOTARGET = 0x00000020`
- Cible declarative verifiee: `packages/game/src/g_local.ts` et constantes miroir `packages/game/src/runtime.ts`; export public corrige dans `packages/game/src/index.ts` pour `FL_GODMODE` et `FL_NOTARGET`, puis verifie avec `FL_IMMUNE_LASER`.
- Runtime:
  - `FL_IMMUNE_LASER` est consomme par `g_target`/`g_weapon` pour ignorer les degats laser/BFG et pose par `m_boss2`.
  - `FL_GODMODE` est consomme par `g_cmds`, `g_combat`, `p_view`, `p_client` et `g_misc` pour toggle/protection/sauvegarde/feedback.
  - `FL_NOTARGET` est consomme par `g_cmds`, `g_ai`, `g_monster`, `p_weapon` et `p_client` pour toggle, acquisition cible, activation monstre, bruit joueur et savedFlags.
- apps/web: aucune reference directe; pas d'integration web directe attendue pour ces bits `edict->flags`, le comportement passe par le runtime game et ses sorties existantes.
- renderer-three: aucune reference directe; pas d'integration renderer directe attendue. Ces flags ne produisent pas seuls des donnees de scene; ils modifient les decisions gameplay avant emission d'entites/evenements visibles.
- Commentaires d'en-tete: header de module `packages/game/src/g_local.ts` deja present et rattache a `game/g_local.h`; pas de fonction dans ce lot.
- Tests: verification ciblee `npx tsx -e ...` OK pour valeurs et exports `g_local.ts`/`index.ts`; `npm run verify:g-local:header` OK; `npm run verify:g-ai` OK; `npm run verify:g-cmds` OK; `npx tsx ./scripts/verify/quake2-g-combat.ts` OK (`verify:g-combat` absent du package); `npm run verify:g-monster` OK; `npm run verify:m-boss2` OK; `npm run verify:p-view` OK; `npm run verify:p-weapon` OK; `npm run verify:p-client` OK; `npm run verify:g-misc` OK; `npm run verify:g-save` OK; `npm run typecheck` OK.
- Test bloque non lie au lot: `npm run verify:g-target` echoue avant les assertions `target_laser` sur `target_goal must stop CD track when all goals found`, avec une configstring son `misc/secret.wav` supplementaire.

- 2026-04-30: lot premiers flags `FL_*`: `FL_FLY`, `FL_SWIM`, `FL_INWATER`.
- Verdict: `Valide` pour les 3 macros apres correction limitee de l'export public.
- Valeurs H/TS comparees et conformes:
  - `FL_FLY = 0x00000001`
  - `FL_SWIM = 0x00000002`
  - `FL_INWATER = 0x00000008`
- Cible declarative verifiee: `packages/game/src/g_local.ts`; export public corrige dans `packages/game/src/index.ts`.
- Runtime:
  - `FL_FLY`/`FL_SWIM` sont consommes par les flux AI, physique, monstres, triggers et movement (`g_ai`, `g_phys`, `g_monster`, `g_trigger`, `m_move`, `g_combat`, `g_main`).
  - `FL_SWIM` conserve le comportement C de nage/immunite noyade via la logique monstre `M_WorldEffects`.
  - `FL_INWATER` est pose/retire dans les transitions eau joueur (`p_view`) et monstre (`g_monster`).
- apps/web: aucune reference directe; pas d'integration web directe attendue pour ces macros de flags edict, le comportement passe par le runtime game.
- renderer-three: aucune reference directe; pas d'integration renderer directe attendue, ces bits ne produisent pas seuls des donnees visuelles. Les effets visibles passent par les entites/evenements produits par le runtime.
- Commentaires d'en-tete: header de module `packages/game/src/g_local.ts` deja present et rattache a `game/g_local.h`; pas de fonction dans ce lot.
- Tests: verification ciblee `npx tsx -e ...` OK pour valeurs et exports `g_local.ts`/`index.ts`; `npm run verify:g-local:header` OK; `npm run verify:p-view` OK; `npm run verify:m-move` OK; `npm run verify:g-monster` OK; `npm run verify:g-phys` OK; `npm run verify:g-ai` OK; `npm run typecheck` OK.

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

- Continuer avec le prochain petit lot `FL_*`: `FL_IMMUNE_SLIME`, `FL_IMMUNE_LAVA`, `FL_PARTIALGROUND` si coherent.

## Blocages

- `npm run verify:g-target` echoue dans un cas `target_goal`/configstring son avant les assertions `target_laser`; a investiguer dans le lot `g_target` dedie ou avant de s'appuyer sur ce script comme preuve complete de `FL_IMMUNE_LASER`.
- Aucun blocage sur le lot `SPAWNFLAG_NOT_*` apres correction coordinateur de `SpawnEntities`.
