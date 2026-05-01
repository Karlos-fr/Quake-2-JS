# Progress - game/g_local.h

## Dernier lot valide

- 2026-04-30: debut des macros simples de `g_local.h`.
- Lot traite: `GAME_INCLUDE`, `GAMEVERSION`, `svc_muzzleflash`, `svc_muzzleflash2`, `svc_temp_entity`, `svc_layout`, `svc_inventory`, `svc_stufftext`, `DAMAGE_TIME`, `FALL_TIME`.
- Verdict: 9 constantes runtime validees; `GAME_INCLUDE` marque `Non applicable` car macro C de controle d'inclusion sans equivalent runtime TS.

## Dernier lot traite

- 2026-05-01: lot flags AI medic `AI_MEDIC`, `AI_RESURRECTING`.
- Verdict: `Valide` pour les 2 macros apres ajout d'une assertion ciblee `AI_RESURRECTING` dans le harness header.
- Valeurs H/TS comparees et conformes:
  - `AI_MEDIC = 0x00002000`
  - `AI_RESURRECTING = 0x00004000`
- Cible declarative verifiee: `packages/game/src/g_local.ts`; export public verifie dans `packages/game/src/index.ts`. Les cibles generees `runtime.ts` et `g_items.ts` n'ont pas de definition directe attendue pour ces macros.
- Runtime:
  - Source C: `AI_MEDIC` est pose par `medic_idle`, `medic_search` et `medic_run` quand le medic cible un monstre mort, force `medic_attack`/`medic_checkattack` sur le cable de resurrection, et est efface par `ai_checkattack` quand la cible est de nouveau vivante. `AI_RESURRECTING` est pose pendant `medic_cable_attack`, conserve apres `ED_CallSpawn`, efface par `medic_hook_retract`, et consomme par `M_SetEffects` pour afficher le shell rouge.
  - TS: `packages/game/src/m_medic.ts`, `packages/game/src/g_ai.ts` et `packages/game/src/g_monster.ts` conservent ces branches. Les commentaires d'en-tete de `ai_checkattack` et `M_SetEffects` ont ete verifies avec `Original name`, `Source`, `Category: Ported` et niveau de fidelite; le header de module `g_local.ts` rattache les macros au header original.
- apps/web: aucune reference directe trouvee; pas de logique parallele attendue. Le navigateur doit declencher ce comportement via le runtime serveur/game et consommer ses sorties via le host full-game, les sons/temp entities et les snapshots.
- renderer-three: aucune reference directe aux macros; integration directe gameplay non attendue. Une sortie visible est attendue pour `AI_RESURRECTING`: `M_SetEffects` produit `EF_COLOR_SHELL` et `RF_SHELL_RED`, consommes par le flux renderer via les entites/snapshots; `verify:full-game:three-renderer` OK.
- Tests: verification ciblee `npx tsx -e ...` OK pour valeurs et exports publics; `npm run verify:g-local:header` OK apres ajout de l'assertion `AI_RESURRECTING`; `npm run verify:g-ai` OK; `npm run verify:m-medic` OK; `npm run verify:g-monster` OK; `npm run verify:full-game:server-host` OK; `npm run verify:full-game:three-renderer` OK; `npm run typecheck` OK.

- 2026-05-01: lot flags AI comportement `AI_GOOD_GUY`, `AI_BRUTAL`, `AI_NOSTEP`, `AI_DUCKED`, `AI_COMBAT_POINT`.
- Verdict: `Valide` pour les 5 macros apres ajout d'assertions ciblees dans le harness header.
- Valeurs H/TS comparees et conformes:
  - `AI_GOOD_GUY = 0x00000100`
  - `AI_BRUTAL = 0x00000200`
  - `AI_NOSTEP = 0x00000400`
  - `AI_DUCKED = 0x00000800`
  - `AI_COMBAT_POINT = 0x00001000`
- Cible declarative verifiee: `packages/game/src/g_local.ts`; export public verifie dans `packages/game/src/index.ts`. Les cibles generees `runtime.ts` et `g_items.ts` n'ont pas de definition directe attendue pour ces macros.
- Runtime:
  - Source C: `AI_GOOD_GUY` protege/filtre les allies dans `FindTarget`, `T_Damage`, `monster_use`, `walkmonster_start_go`, `SP_misc_actor`, `SP_misc_insane`, `SP_misc_deadsoldier` et le medic; `AI_BRUTAL` force certains acteurs/tanks a continuer sur les corps jusqu'au seuil gib; `AI_NOSTEP` reduit le pas dans `SV_movestep` et est pose sur `misc_explobox`; `AI_DUCKED` reduit la boite/degats pendant les esquives monstres et tourelle; `AI_COMBAT_POINT` est pose par `FoundTarget`, consomme par `FindTarget`/`ai_run`, et efface par `point_combat_touch`.
  - TS: `packages/game/src/g_ai.ts`, `g_combat.ts`, `g_monster.ts`, `g_misc.ts`, `m_move.ts`, `g_turret.ts`, `m_actor.ts`, `m_tank.ts` et les monstres duck conservent ces branches. Les commentaires d'en-tete de `FoundTarget`, `FindTarget`, `ai_run`, `T_Damage`, `M_MoveFrame`, `SV_movestep`, `turret_driver_think` et des spawns/monstres consultes ont ete verifies quand applicables.
- apps/web: aucune reference directe trouvee; pas de logique parallele attendue. Le navigateur declenche ce comportement via le runtime serveur/game et consomme les sorties via le host full-game; `verify:full-game:server-host` OK.
- renderer-three: aucune reference directe aux flags; pas d'integration renderer directe attendue. Ces flags influencent IA, mouvements, boites et degats avant production des entites/snapshots visibles; `verify:full-game:three-renderer` OK confirme le flux renderer.
- Tests: verification ciblee `npx tsx -e ...` OK pour valeurs et exports publics; `npm run verify:g-local:header` OK apres ajout des assertions `AI_GOOD_GUY`/`AI_BRUTAL`/`AI_NOSTEP`/`AI_DUCKED`/`AI_COMBAT_POINT`; `npm run verify:g-ai` OK; `npx tsx ./scripts/verify/quake2-g-combat.ts` OK; `npm run verify:g-monster` OK; `npm run verify:m-move` OK; `npm run verify:g-misc` OK; `npm run verify:g-turret` OK; `npm run verify:m-actor` OK; `npm run verify:m-tank` OK; `npm run verify:m-brain` OK; `npm run verify:m-chick` OK; `npm run verify:m-gunner` OK; `npm run verify:m-infantry` OK; `npm run verify:m-medic` OK; `npm run verify:m-mutant` OK; `npm run verify:m-soldier` OK; `npm run verify:m-insane` OK; `npm run verify:full-game:server-host` OK; `npm run verify:full-game:three-renderer` OK; `npm run typecheck` OK.

- 2026-05-01: lot flags AI poursuite/hold `AI_LOST_SIGHT`, `AI_PURSUIT_LAST_SEEN`, `AI_PURSUE_NEXT`, `AI_PURSUE_TEMP`, `AI_HOLD_FRAME`.
- Verdict: `Valide` pour les 5 macros, sans correction TS necessaire.
- Valeurs H/TS comparees et conformes:
  - `AI_LOST_SIGHT = 0x00000008`
  - `AI_PURSUIT_LAST_SEEN = 0x00000010`
  - `AI_PURSUE_NEXT = 0x00000020`
  - `AI_PURSUE_TEMP = 0x00000040`
  - `AI_HOLD_FRAME = 0x00000080`
- Cible declarative verifiee: `packages/game/src/g_local.ts`; export public verifie dans `packages/game/src/index.ts`. Les cibles generees `runtime.ts` et `g_items.ts` n'ont pas de definition directe attendue pour ces macros.
- Runtime:
  - Source C: `ai_run` efface `AI_LOST_SIGHT` quand l'ennemi est visible, initialise la poursuite perdue avec `AI_LOST_SIGHT | AI_PURSUIT_LAST_SEEN`, consomme `AI_PURSUE_NEXT`, restaure `saved_goal` via `AI_PURSUE_TEMP`, choisit les marqueurs `PlayerTrail`, et pose des objectifs temporaires de correction gauche/droite. `turret_driver_think` pose/efface `AI_LOST_SIGHT` selon la visibilite. `M_MoveFrame` bloque l'avancement et appelle l'AI avec distance 0 quand `AI_HOLD_FRAME` est pose; plusieurs monstres posent/effacent ce flag pendant leurs attaques.
  - TS: `packages/game/src/g_ai.ts`, `packages/game/src/g_turret.ts`, `packages/game/src/g_monster.ts` et les monstres consommateurs conservent ces branches. Les commentaires d'en-tete de `ai_run`, `turret_driver_think` et `M_MoveFrame` ont ete verifies avec `Original name`, `Source`, `Category: Ported` et niveau de fidelite.
- apps/web: aucune reference directe trouvee; pas de logique parallele attendue. Le navigateur declenche ce comportement via le runtime serveur/game et consomme les sorties via le host full-game; `verify:full-game:server-host` OK.
- renderer-three: aucune reference directe aux flags; pas d'integration renderer directe attendue. Ces flags modifient l'IA et les frames avant production des entites/snapshots visibles; `verify:full-game:three-renderer` OK confirme le flux renderer.
- Tests: verification ciblee `npx tsx -e ...` OK pour valeurs et exports publics; `npm run verify:g-local:header` OK; `npm run verify:g-ai` OK; `npm run verify:g-monster` OK; `npm run verify:g-turret` OK; `npm run verify:m-actor` OK; `npm run verify:m-brain` OK; `npm run verify:m-chick` OK; `npm run verify:m-gunner` OK; `npm run verify:m-infantry` OK; `npm run verify:m-medic` OK; `npm run verify:m-soldier` OK; `npm run verify:full-game:server-host` OK; `npm run verify:full-game:three-renderer` OK; `npm run typecheck` OK.

- 2026-05-01: lot premiers flags AI `AI_STAND_GROUND`, `AI_TEMP_STAND_GROUND`, `AI_SOUND_TARGET`.
- Verdict: `Valide` pour les 3 macros apres ajout d'assertions ciblees dans le harness header.
- Valeurs H/TS comparees et conformes:
  - `AI_STAND_GROUND = 0x00000001`
  - `AI_TEMP_STAND_GROUND = 0x00000002`
  - `AI_SOUND_TARGET = 0x00000004`
- Cible declarative verifiee: `packages/game/src/g_local.ts`; export public verifie dans `packages/game/src/index.ts`. Les cibles generees `runtime.ts` et `g_items.ts` n'ont pas de definition directe attendue pour ces macros.
- Runtime:
  - Source C: `FindTarget` pose `AI_SOUND_TARGET` quand un bruit devient cible; `ai_run` pose `AI_STAND_GROUND | AI_TEMP_STAND_GROUND` quand le monstre arrive pres de la cible sonore; `ai_stand` et `ai_checkattack` effacent le stand-ground temporaire dans les memes conditions que le C; `T_Damage` efface `AI_SOUND_TARGET` sur attaque directe.
  - TS: `packages/game/src/g_ai.ts` conserve ces branches dans `FindTarget`, `ai_run`, `ai_stand` et `ai_checkattack`; `packages/game/src/g_combat.ts` nettoie `AI_SOUND_TARGET`; `g_misc`/`g_turret` et les monstres consommateurs conservent les usages `AI_STAND_GROUND`.
- apps/web: aucune reference directe trouvee; pas de logique parallele attendue. Le comportement est declenche par le runtime serveur/game et expose au navigateur via le host full-game; `verify:full-game:server-host` OK.
- renderer-three: aucune reference directe aux flags; pas d'integration renderer directe attendue. Ces flags influencent l'IA avant production des entites/snapshots visibles; `verify:full-game:three-renderer` OK.
- Commentaires/documentation: header de module `packages/game/src/g_local.ts` deja present et rattache a `game/g_local.h`; commentaire source `//monster ai flags` verifie. Commentaires de fonctions existants verifies pour `FindTarget`, `ai_run`, `ai_stand` et `ai_checkattack` avec `Original name`, `Source`, `Category: Ported` et niveau de fidelite.
- Tests: verification ciblee `npx tsx -e ...` OK pour valeurs et exports publics; `npm run verify:g-local:header` OK apres ajout des assertions `AI_STAND_GROUND`/`AI_TEMP_STAND_GROUND`/`AI_SOUND_TARGET`; `npm run verify:g-ai` OK; `npx tsx ./scripts/verify/quake2-g-combat.ts` OK; `npm run verify:g-misc` OK; `npm run verify:g-turret` OK; `npm run verify:g-monster` OK; `npm run verify:m-actor` OK; `npm run verify:m-berserk` OK; `npm run verify:m-chick` OK; `npm run verify:m-gunner` OK; `npm run verify:m-insane` OK; `npm run verify:full-game:server-host` OK; `npm run verify:full-game:three-renderer` OK; `npm run typecheck` OK.

- 2026-05-01: lot types de gib `GIB_ORGANIC`, `GIB_METALLIC`.
- Verdict: `Valide` pour les 2 macros apres ajout d'assertions ciblees dans les harness header et `g_misc`.
- Valeurs H/TS comparees et conformes:
  - `GIB_ORGANIC = 0`
  - `GIB_METALLIC = 1`
- Cible declarative verifiee: `packages/game/src/g_local.ts`; export public verifie dans `packages/game/src/index.ts`. Les cibles generees `runtime.ts` et `g_items.ts` n'ont pas de definition directe attendue pour ces macros.
- Runtime:
  - Source C: `ThrowGib` et `ThrowHead` testent `type == GIB_ORGANIC`; organique donne `MOVETYPE_TOSS`, installe `gib_touch` et applique `vscale = 0.5`, sinon metallique donne `MOVETYPE_BOUNCE` et `vscale = 1.0`.
  - TS: `packages/game/src/g_misc.ts` conserve cette branche pour `ThrowGib` et `ThrowHead`. Les appels organiques couvrent joueurs/corps et monstres biologiques; les appels metalliques couvrent notamment `m_tank`, `m_supertank` et `m_boss32`.
- apps/web: aucune reference directe trouvee; pas de logique parallele attendue. Les gibs sont produits par le runtime game et exposes via les entites/snapshots du host full-game; `verify:full-game:server-host` OK.
- renderer-three: aucune reference directe aux constantes; integration directe non attendue. Les sorties visibles sont des entites MD2 avec modelindex/effects produits par `ThrowGib`/`ThrowHead`, consommees par le flux renderer full-game; `verify:full-game:three-renderer` OK.
- Commentaires/documentation: header de module `packages/game/src/g_local.ts` deja present et rattache a `game/g_local.h`; commentaire source `//gib types` verifie. `ThrowGib`/`ThrowHead` restent dans le fichier `g_misc.c` dedie et seront audites dans leur propre ligne/fichier.
- Tests: verification ciblee `npx tsx -e ...` OK pour valeurs et exports publics; `npm run verify:g-local:header` OK apres ajout des assertions `GIB_*`; `npm run verify:g-misc` OK apres ajout d'un cas organique/metallique sur `ThrowGib`; `npm run verify:full-game:server-host` OK; `npm run verify:full-game:three-renderer` OK; `npm run typecheck` OK.

- 2026-05-01: lot range `RANGE_MELEE`, `RANGE_NEAR`, `RANGE_MID`, `RANGE_FAR`.
- Verdict: `Valide` pour les 4 macros apres ajout d'assertions dans le harness header.
- Valeurs H/TS comparees et conformes:
  - `RANGE_MELEE = 0`
  - `RANGE_NEAR = 1`
  - `RANGE_MID = 2`
  - `RANGE_FAR = 3`
- Cible declarative verifiee: `packages/game/src/g_local.ts`; export public verifie dans `packages/game/src/index.ts`. Les cibles generees `runtime.ts` et `g_items.ts` n'ont pas de definition directe attendue pour ces macros.
- Runtime:
  - `g_ai.range` conserve les seuils C stricts: `< MELEE_DISTANCE` donne `RANGE_MELEE`, `< 500` donne `RANGE_NEAR`, `< 1000` donne `RANGE_MID`, sinon `RANGE_FAR`.
  - `FindTarget` rejette `RANGE_FAR`, applique la porte `show_hostile`/`infront` en `RANGE_NEAR`, et impose `infront` en `RANGE_MID` comme dans `game/g_ai.c`.
  - `M_CheckAttack` accepte melee, rejette far, et applique les chances missile near/mid; les decisions boss/soldier/infantry/chick/flyer/gunner/mutant consomment les memes valeurs exportees.
- apps/web: aucune reference directe trouvee; pas de logique parallele attendue. Le navigateur declenche ce comportement via le runtime serveur/game, confirme par `verify:full-game:server-host`.
- renderer-three: aucune reference directe trouvee; pas d'integration renderer directe attendue. Ces constantes orientent l'AI avant production des entites/snapshots; `verify:full-game:three-renderer` confirme que le flux renderer reste branche.
- Commentaires/documentation: header de module `packages/game/src/g_local.ts` deja present et rattache a `game/g_local.h`; commentaire source `//range` verifie. Commentaire de fonction `range` existant dans `packages/game/src/g_ai.ts` avec `Original name`, `Source`, `Category: Ported`, `Fidelity level: Strict`.
- Tests: verification ciblee `npx tsx -e ...` OK pour valeurs et exports publics; `npm run verify:g-local:header` OK apres ajout des assertions `RANGE_*`; `npm run verify:g-ai` OK; `npm run verify:m-boss2` OK; `npm run verify:m-boss31` OK; `npm run verify:m-boss32` OK; `npm run verify:m-infantry` OK; `npm run verify:m-soldier` OK; `npm run verify:m-chick` OK; `npm run verify:m-flyer` OK; `npm run verify:m-gunner` OK; `npm run verify:m-mutant` OK; `npm run verify:full-game:server-host` OK; `npm run verify:full-game:three-renderer` OK; `npm run typecheck` OK.

- 2026-05-01: lot deadflags `DEAD_NO`, `DEAD_DYING`, `DEAD_DEAD`, `DEAD_RESPAWNABLE`.
- Verdict: `Valide` pour les 4 macros apres corrections limitees de lisibilite runtime et du harness full-game utilise comme preuve.
- Valeurs H/TS comparees et conformes:
  - `DEAD_NO = 0`
  - `DEAD_DYING = 1`
  - `DEAD_DEAD = 2`
  - `DEAD_RESPAWNABLE = 3`
- Cible declarative verifiee: constantes definies dans `packages/game/src/runtime.ts`, reexportees par `packages/game/src/g_local.ts` et `packages/game/src/index.ts`.
- Runtime:
  - `DEAD_NO` initialise les edicts/clients et est retabli par `PutClientInServer` et les monstres spawned; il garde les armes actives via `p_weapon` quand le joueur est vivant.
  - `DEAD_DEAD` pilote les chemins mort joueur/monstre/corps: `player_die`, morts monstres, `g_combat` pour la comptabilisation, `g_misc`, `g_chase`, et le telefrag `KillBox`.
  - `DEAD_DYING` et `DEAD_RESPAWNABLE` sont declares par le header original mais aucune consommation game originale ou TS trouvee hors exports; conservation stricte des valeurs pour compatibilite header.
  - Correction limitee dans `packages/game/src/g_utils.ts`: `applyTelefragDamage` utilise maintenant `DEAD_DEAD` au lieu du litteral `2`.
- apps/web: aucune reference directe aux constantes; pas de logique parallele attendue. Les transitions joueur mort/respawn passent par le host full-game et `verify:full-game:rules-transitions`/`verify:full-game:server-host` OK.
- renderer-three: aucune reference directe; pas d'integration renderer directe attendue pour les constantes. Les effets visibles passent par les etats d'entites/snapshots apres runtime; `verify:full-game:three-renderer` OK.
- Commentaires/documentation: header de module `packages/game/src/g_local.ts` deja present et rattache a `game/g_local.h`; commentaire source `//deadflag` verifie. Pas de fonction nouvelle dans ce lot.
- Tests: verification ciblee `npx tsx -e ...` OK pour valeurs et exports publics; `npm run verify:g-local:header` OK apres ajout des assertions `DEAD_*`; `npm run verify:g-utils` OK; `npm run verify:p-client` OK; `npm run verify:p-weapon` OK; `npm run verify:g-monster` OK; `npm run verify:g-misc` OK; `npm run verify:g-chase` OK; `npx tsx ./scripts/verify/quake2-g-combat.ts` OK; `npm run verify:m-berserk` OK; `npm run verify:m-chick` OK; `npm run verify:m-tank` OK; `npm run verify:full-game:rules-transitions` OK apres correction de son import vers `packages/client/src/index.js`; `npm run verify:full-game:server-host` OK; `npm run verify:full-game:three-renderer` OK; `npm run typecheck` OK.

- 2026-05-01: lot enums simples `damage_t`, `weaponstate_t`, `ammo_t`.
- Verdict: `Valide` pour les 3 enums apres correction limitee du reexport public depuis le point d'attache header.
- Valeurs H/TS comparees et conformes:
  - `damage_t`: `DAMAGE_NO = 0`, `DAMAGE_YES = 1`, `DAMAGE_AIM = 2`.
  - `weaponstate_t`: `WEAPON_READY = 0`, `WEAPON_ACTIVATING = 1`, `WEAPON_DROPPING = 2`, `WEAPON_FIRING = 3`.
  - `ammo_t`: `AMMO_BULLETS = 0`, `AMMO_SHELLS = 1`, `AMMO_ROCKETS = 2`, `AMMO_GRENADES = 3`, `AMMO_CELLS = 4`, `AMMO_SLUGS = 5`.
- Cibles declaratives:
  - `damage_t` est defini dans `packages/game/src/g_local.ts` et exporte par `packages/game/src/index.ts`.
  - `weaponstate_t` et `ammo_t` sont definis dans `packages/game/src/runtime.ts`; `ammo_t` etait deja reexporte par `packages/game/src/g_local.ts`, et `weaponstate_t` est maintenant reexporte par `packages/game/src/g_local.ts` pour conserver le point d'attache `game/g_local.h`. Les deux restent exportes par `packages/game/src/index.ts`.
- Runtime:
  - `damage_t` alimente `edict.takedamage` pour joueurs, corps, monstres, gibs, fonctions et entites misc; les chemins verifies couvrent notamment `p_client` et les harness monstres deja consommateurs.
  - `weaponstate_t` pilote le cycle d'arme dans `p_weapon` (`ready`, activation, dropping, firing) et l'etat client initialise par `createGameClient`.
  - `ammo_t` sert de tag canonique aux items arme/munitions dans `g_items`, aux quantites/caps d'inventaire, pickups et HUD via la selection d'item.
- apps/web: aucune reference directe aux enums; pas de logique parallele attendue. Le navigateur consomme les sorties runtime via le host full-game et, pour l'HUD ammo, via `packages/client/src/local-gameplay-sync.ts`; `verify:local-gameplay-sync` et `verify:full-game:server-host` OK.
- renderer-three: aucune reference directe; pas d'integration renderer directe attendue. Ces enums ne produisent pas seuls de donnees visibles; les effets passent par etats d'entites, armes, inventaire/HUD et snapshots runtime. `verify:full-game:three-renderer` OK.
- Commentaires/documentation: header de module `packages/game/src/g_local.ts` deja present et rattache a `game/g_local.h`; commentaires d'en-tete existants verifies pour `damage_t`, `weaponstate_t` et `ammo_t` avec `Original name`, `Source`, `Category: Ported`, `Fidelity level: Strict`.
- Tests: verification ciblee `npx tsx -e ...` OK pour valeurs et exports `g_local.ts`/`index.ts`; `npm run verify:g-local:header` OK apres ajout des assertions enum completes; `npm run verify:p-weapon` OK; `npm run verify:g-items` OK; `npm run verify:p-client` OK; `npm run verify:local-gameplay-sync` OK; `npm run verify:full-game:server-host` OK; `npm run verify:full-game:three-renderer` OK; `npm run typecheck` OK.

- 2026-05-01: lot `MELEE_DISTANCE`, `BODY_QUEUE_SIZE`.
- Verdict: `Valide` pour les 2 macros apres correction runtime limitee de la copie de corps.
- Valeurs H/TS comparees et conformes:
  - `MELEE_DISTANCE = 80`
  - `BODY_QUEUE_SIZE = 8`
- Cible declarative verifiee: `packages/game/src/g_local.ts`; export public verifie dans `packages/game/src/index.ts`. `BODY_QUEUE_SIZE` reste aussi miroir local dans `packages/game/src/g_utils.ts` pour eviter un cycle `runtime -> g_utils -> g_local -> runtime`, valeur comparee a 8.
- Runtime:
  - `MELEE_DISTANCE` est consomme par `g_ai.range` avec le seuil strict C `< MELEE_DISTANCE`, et par les attaques melee de `m_berserk`, `m_brain`, `m_chick`, `m_flipper`, `m_flyer`, `m_float`, `m_gladiator`, `m_infantry` et `m_mutant` pour construire les vecteurs `aim`.
  - `BODY_QUEUE_SIZE` pilote `InitBodyQue`, le modulo de `CopyToBodyQue`, et le garde `G_FreeEdict` sur les edicts speciaux `maxclients + BODY_QUEUE_SIZE`.
  - Correction limitee dans `packages/game/src/p_client.ts`: `CopyToBodyQue` copie maintenant aussi `origin` et `angles` runtime depuis `ent.s` avant `linkGameEntity`, sinon le relink resynchronisait `body.s.origin` a `[0,0,0]` malgre la copie C-style de `body.s`.
- apps/web: aucune reference directe trouvee; pas d'integration web parallele attendue. Le comportement passe par le runtime serveur/game et les snapshots/evenements deja branches.
- renderer-three: aucune reference directe trouvee; pas d'integration renderer directe attendue. Les effets visibles passent par les entites exposees apres runtime; `verify:full-game:three-renderer` OK.
- Commentaires/documentation: header de module `packages/game/src/g_local.ts` deja present et rattache a `game/g_local.h`; pas de commentaire source specifique sur ces deux macros.
- Tests: verification ciblee `npx tsx -e ...` OK pour valeurs et seuil strict `range`; `npm run verify:g-local:header` OK; `npm run verify:p-client` OK avec couverture `InitBodyQue`/`CopyToBodyQue`; `npm run verify:g-utils` OK; `npm run verify:m-berserk` OK; `npm run verify:m-brain` OK; `npm run verify:m-chick` OK; `npm run verify:m-flipper` OK; `npm run verify:m-flyer` OK; `npm run verify:m-float` OK; `npm run verify:m-gladiator` OK; `npm run verify:m-infantry` OK; `npm run verify:m-mutant` OK; `npm run verify:full-game:server-host` OK; `npm run verify:full-game:three-renderer` OK; `npm run typecheck` OK.
- Test bloque non lie au lot: `npm run verify:g-ai` echoue plus loin sur `ai_run_melee must turn toward enemy_yaw before checking facing`, attendu `80`, recu `79.9969482421875`; la preuve `MELEE_DISTANCE` de ce lot a ete isolee par verification ciblee.

- 2026-05-01: lot memoire `TAG_GAME`, `TAG_LEVEL`.
- Verdict: `Valide` pour les 2 macros, sans correction TS necessaire.
- Valeurs H/TS comparees et conformes:
  - `TAG_GAME = 765`
  - `TAG_LEVEL = 766`
- Cible declarative verifiee: `packages/game/src/g_local.ts`; export public verifie dans `packages/game/src/index.ts`. Les cibles generees `runtime.ts` et `g_items.ts` n'ont pas de reference directe attendue pour ces macros.
- Runtime:
  - Source C: `TAG_GAME` sert aux allocations persistantes game/clients et est libere a l'unload DLL ou avant `ReadGame`; `TAG_LEVEL` sert aux allocations de strings/level et est libere au chargement de niveau ou a l'unload.
  - TS: les structures game/level sont des objets JS et les chaines sont immutables; les points de liberation conserves appellent `context.gi.FreeTags(TAG_LEVEL)` puis `context.gi.FreeTags(TAG_GAME)` dans `ShutdownGame`, `FreeTags(TAG_GAME)` dans `ReadGame`, et `FreeTags(TAG_LEVEL)` dans `ReadLevel`. `G_CopyString` conserve l'intention niveau via copie JS equivalente.
  - Adapter serveur: `packages/server/src/sv_game.ts` implemente `TagMalloc`/`FreeTags` par tag numerique et le harness direct confirme la liberation par tag.
- apps/web: aucune reference directe a `TAG_GAME`/`TAG_LEVEL`; pas d'integration web parallele attendue. Les effets navigateur passent par le host full-game qui utilise l'import game/server.
- renderer-three: aucune reference directe; pas d'integration renderer attendue. Ces tags ne produisent aucune donnee visible, ils bornent seulement la duree de vie memoire.
- Commentaires/documentation: header de module `packages/game/src/g_local.ts` deja present et rattache a `game/g_local.h`; commentaire source H "memory tags..." verifie. Pas de fonction nouvelle dans ce lot.
- Tests: verification ciblee `npx tsx -e ...` OK pour valeurs et exports publics; `npm run verify:g-local:header` OK; `npm run verify:g-main` OK; `npm run verify:g-save` OK; `npx tsx ./scripts/verify/quake2-sv-game.ts` OK (`npm run verify:sv-game` absent); `npm run verify:full-game:server-host` OK; `npm run verify:full-game:three-renderer` OK; `npm run typecheck` OK.

- 2026-05-01: lot `FL_POWER_ARMOR`, `FL_RESPAWN`, `FRAMETIME`.
- Verdict: `Valide` pour les 3 macros apres correction limitee de l'export public.
- Valeurs H/TS comparees et conformes:
  - `FL_POWER_ARMOR = 0x00001000`
  - `FL_RESPAWN = 0x80000000`
  - `FRAMETIME = 0.1`
- Cible declarative verifiee: `packages/game/src/g_local.ts`; constantes miroir runtime verifiees dans `packages/game/src/runtime.ts`; export public corrige dans `packages/game/src/index.ts` pour `FL_POWER_ARMOR` et `FL_RESPAWN`.
- Runtime:
  - `FL_POWER_ARMOR` est consomme par `PowerArmorType`, `Use_PowerArmor`, `Drop_PowerArmor`, `G_SetStats`, `InitClientResp`, `ClientBeginDeathmatch` et `SaveClientData` comme dans le C: activation/desactivation, type d'armure, sauvegarde des flags persistants et nettoyage au respawn/deathmatch.
  - `FL_RESPAWN` est pose par les chemins item/weapon respawn (`SetRespawn`, pickups deathmatch et give weapon) puis efface dans `Touch_Item` quand l'item respawne.
  - `FRAMETIME` pilote `G_RunFrame`, les schedules `nextthink`, les mouvements/physiques et la synchronisation locale au pas original de 0.1 seconde.
- apps/web: aucune reference directe aux flags; `FRAMETIME` est consomme via `packages/client/src/local-gameplay-sync.ts` et le host full-game appelle le `RunFrame` runtime. Pas d'integration web parallele attendue pour ces bits `edict->flags`.
- renderer-three: aucune reference directe aux flags; pas d'integration renderer directe attendue. Les effets visibles passent par les entites/evenements runtime; `verify:full-game:three-renderer` confirme que la source renderer full-game reste branchee.
- Commentaires/documentation: header de module `packages/game/src/g_local.ts` deja present et rattache a `game/g_local.h`; commentaires source de `FL_POWER_ARMOR` et `FL_RESPAWN` conserves par equivalence declarative; pas de fonction nouvelle dans ce lot.
- Tests: verification ciblee `npx tsx -e ...` OK pour valeurs et exports publics; `npm run verify:g-local:header` OK; `npm run verify:g-items` OK; `npm run verify:g-main` OK; `npm run verify:p-hud` OK; `npm run verify:p-client` OK; `npm run verify:p-weapon` OK; `npm run verify:local-gameplay-sync` OK; `npm run verify:full-game:server-host` OK; `npm run verify:full-game:three-renderer` OK; `npm run typecheck` OK.
- Test bloque non lie au lot: `npx tsx ./scripts/verify/quake2-g-combat.ts` echoue sur `T_Damage subtracts take from health before Killed: attendu -2, recu -22`.

- 2026-05-01: lot flags `FL_WATERJUMP`, `FL_TEAMSLAVE`, `FL_NO_KNOCKBACK`.
- Verdict: `Valide` pour les 3 macros apres correction limitee du commentaire/export public.
- Valeurs H/TS comparees et conformes:
  - `FL_WATERJUMP = 0x00000200`
  - `FL_TEAMSLAVE = 0x00000400`
  - `FL_NO_KNOCKBACK = 0x00000800`
- Cible declarative verifiee: `packages/game/src/g_local.ts`; constantes miroir runtime verifiees pour `FL_TEAMSLAVE` et `FL_NO_KNOCKBACK`; export public corrige dans `packages/game/src/index.ts` pour `FL_WATERJUMP` et `FL_NO_KNOCKBACK`.
- Runtime:
  - `FL_WATERJUMP` est une declaration de flag conservee depuis `game/g_local.h`; aucun branchement game runtime direct trouve dans le source C hors definition ni dans le TS.
  - `FL_TEAMSLAVE` est pose par `G_FindTeams`, nettoye lors de la reconstruction des liens et par certains spawns, puis consomme par la physique pusher/toss et les entites team movers.
  - `FL_NO_KNOCKBACK` inhibe le momentum dans `T_Damage` et est pose sur monstres/joueurs morts, gibs, corps, turret driver et misc insane comme dans le C.
- apps/web: aucune reference directe; pas d'integration web directe attendue pour ces bits `edict->flags`. Les effets navigateur passent par le runtime game: positions/linkage d'entites, degats, sons et evenements deja produits par les flux verifies.
- renderer-three: aucune reference directe; pas d'integration renderer directe attendue. Ces flags ne produisent pas seuls de donnees renderer; `FL_TEAMSLAVE` influence les movers avant exposition des entites, et `FL_NO_KNOCKBACK` influence les vitesses/positions via le runtime.
- Commentaires/documentation: header de module `packages/game/src/g_local.ts` deja present et rattache a `game/g_local.h`; commentaire source de `FL_WATERJUMP` conserve; pas de fonction nouvelle dans ce lot.
- Tests: verification ciblee `npx tsx -e ...` OK pour valeurs et exports publics; `npm run verify:g-local:header` OK; `npm run verify:g-spawn` OK; `npm run verify:g-phys` OK; `npm run verify:g-func` OK; `npm run verify:g-items` OK; `npm run verify:g-misc` OK; `npm run verify:g-turret` OK; `npm run verify:m-insane` OK; `npm run verify:p-client` OK; `npx tsx ./scripts/verify/quake2-g-combat.ts` OK; `npm run typecheck` OK.

- 2026-05-01: lot flags `FL_IMMUNE_SLIME`, `FL_IMMUNE_LAVA`, `FL_PARTIALGROUND`.
- Verdict: `Valide` pour les 3 macros apres correction limitee de l'export public et conservation du commentaire source de `FL_PARTIALGROUND`.
- Valeurs H/TS comparees et conformes:
  - `FL_IMMUNE_SLIME = 0x00000040`
  - `FL_IMMUNE_LAVA = 0x00000080`
  - `FL_PARTIALGROUND = 0x00000100`
- Cible declarative verifiee: `packages/game/src/g_local.ts`; export public corrige dans `packages/game/src/index.ts`.
- Runtime:
  - `FL_IMMUNE_LAVA` est consomme par `g_monster`/`M_WorldEffects` pour inhiber les degats lave.
  - `FL_IMMUNE_SLIME` est consomme par `g_monster`/`M_WorldEffects` pour inhiber les degats slime.
  - `FL_PARTIALGROUND` est consomme par `m_move`/`SV_movestep` pour autoriser la correction quand le sol manque partiellement, puis efface quand le check bottom redevient valide; `SV_FixCheckBottom` pose le flag.
- apps/web: aucune reference directe; pas d'integration web directe attendue pour ces bits `edict->flags`. Les effets navigateur potentiels passent par le runtime game deja branche: degats/sorties sonores pour lava/slime et mouvement/positions d'entites.
- renderer-three: aucune reference directe; pas d'integration renderer directe attendue. Ces flags ne produisent pas seuls de donnees renderer; les sorties visibles passent par les etats d'entites/evenements produits par le runtime.
- Commentaires/documentation: header de module `packages/game/src/g_local.ts` deja present et rattache a `game/g_local.h`; commentaire source `FL_PARTIALGROUND` conserve; pas de fonction nouvelle dans ce lot.
- Tests: verification ciblee `npx tsx -e ...` OK pour valeurs, exports publics et branches immunite lava/slime; `npm run verify:g-local:header` OK; `npm run verify:g-monster` OK; `npm run verify:m-move` OK; `npm run typecheck` OK.

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

- Continuer avec les attack states: `AS_STRAIGHT`, `AS_SLIDING`, `AS_MELEE`, `AS_MISSILE`.

## Blocages

- `npm run verify:g-target` echoue dans un cas `target_goal`/configstring son avant les assertions `target_laser`; a investiguer dans le lot `g_target` dedie ou avant de s'appuyer sur ce script comme preuve complete de `FL_IMMUNE_LASER`.
- `npx tsx ./scripts/verify/quake2-g-combat.ts` echoue sur `T_Damage subtracts take from health before Killed: attendu -2, recu -22`; a investiguer dans le lot `g_combat` dedie.
- Aucun blocage sur le lot `SPAWNFLAG_NOT_*` apres correction coordinateur de `SpawnEntities`.
