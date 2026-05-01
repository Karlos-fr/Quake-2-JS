# Progress - Quake-2-master/game/g_misc.c

## Dernier lot valide

- 2026-05-01: `train_use`, `func_train_find`, `misc_viper_use` et `SP_misc_viper`.
- Checklist appliquee:
  - Source C comparee a `packages/game/src/g_misc.ts` et `packages/game/src/g_func.ts`: les deux declarations externes C `train_use`/`func_train_find` sont deleguees au port `g_func.ts`; `misc_viper_use` conserve le retrait de `SVF_NOCLIENT`, le remplacement du callback `use` par `train_use` et l'appel immediat a `train_use`; `SP_misc_viper` conserve le refus sans `target`, le warning source, le free de l'edict, le speed par defaut `300`, `MOVETYPE_PUSH`, `SOLID_NOT`, modele `models/ships/viper/tris.md2`, bbox, think `func_train_find`, first think `level.time + FRAMETIME`, callback `misc_viper_use`, `SVF_NOCLIENT`, `moveinfo` speed/accel/decel et link.
  - Commentaires d'en-tete mis a jour pour `misc_viper_use` et `SP_misc_viper`: original/source/categorie portee/fidelite `Strict` et comportement documente. Les commentaires de `train_use` et `func_train_find` ont ete verifies dans `g_func.ts`.
  - Branchement runtime verifie: `misc_viper` est enregistre dans `g_spawn.ts`, exporte via `index.ts`, dispatchable par `ED_CallSpawn`; le spawn installe `func_train_find` et `misc_viper_use`; l'activation passe par `useGameEntity`/`G_UseTargets` puis `train_use`; le mouvement continue via le flux train et `G_RunFrame`/`SV_RunThink`.
  - `apps/web`: integration attendue car le lot produit un modele MD2 visible apres activation, avec origine/interpolation issues du mouvement train. Aucune logique parallele trouvee; le web consomme les sorties runtime par les flux local/full-game, snapshots et refresh frames.
  - `renderer-three`: integration attendue pour modele MD2, origine, angles/frames eventuelles, presence initialement masquee par `SVF_NOCLIENT`, puis apparition et mouvement dans la scene. Les sorties passent par `ClientRefreshFrame.entities`, configstrings modeles et adapters Three; pas de branchement dedie manquant.
- Corrections appliquees:
  - `packages/game/src/g_misc.ts`: `SP_misc_viper` journalise et libere maintenant l'entite sans target comme le C; commentaires d'en-tete `misc_viper_use` et `SP_misc_viper` mis a jour.
  - `scripts/verify/quake2-g-misc.ts`: test cible ajoute pour free/warning sans target, spawn, speed par defaut/explicite, dispatch `ED_CallSpawn`, `func_train_find`, activation visible et delegation `train_use`.
- Tests lances:
  - `npm run verify:g-misc` OK.
  - `npm run verify:g-spawn` bloque avant scenario sur `ReferenceError: Cannot access 'defaultMonsterDeathUse' before initialization` dans `packages/game/src/g_combat.ts` via `g_monster.ts`.
  - `npm run verify:g-func` bloque sur le meme probleme d'initialisation `defaultMonsterDeathUse`.
  - `npm run verify:local-gameplay-sync` OK.
  - `npm run verify:full-game:three-renderer` OK.
  - `npm run verify:web-render-order` OK.
  - `npm run typecheck` OK.
- Prochain lot recommande: `SP_misc_bigviper`, puis `misc_viper_bomb_touch` / `misc_viper_bomb_prethink` si le lot reste petit.

- 2026-05-01: `misc_deadsoldier_die`, local `n` et `SP_misc_deadsoldier`.
- Checklist appliquee:
  - Source C comparee a `packages/game/src/g_misc.ts`: `misc_deadsoldier_die` conserve le seuil `health > -80`, le son `misc/udeath.wav`, les 4 appels `ThrowGib` organiques et `ThrowHead`; le local `n` est porte par la boucle TS `index < 4`; `SP_misc_deadsoldier` conserve le free deathmatch, `MOVETYPE_NONE`, `SOLID_BBOX`, modele `models/deadbods/dude/tris.md2`, priorite des frames par `spawnflags`, bbox, `DEAD_DEAD`, `DAMAGE_YES`, `SVF_MONSTER | SVF_DEADMONSTER`, callback die et `AI_GOOD_GUY`.
  - Commentaires d'en-tete verifies: `SP_misc_deadsoldier` etait documente; commentaire d'en-tete ajoute pour `misc_deadsoldier_die` avec original/source/categorie/fidelite/comportement.
  - Branchement runtime verifie: `misc_deadsoldier` est enregistre dans `g_spawn.ts`, exporte via `index.ts`, dispatchable par `ED_CallSpawn`; `SP_misc_deadsoldier` installe `die`; `misc_deadsoldier_die` est atteint via le flux damage/die runtime.
  - `apps/web`: integration attendue car le lot produit un modele MD2 visible, puis des gibs/head visibles et un son. Aucune logique parallele trouvee; les flux local/full-game consomment snapshots, modelindices, effets et sons issus du runtime.
  - `renderer-three`: integration attendue pour modele du corps, gibs/head MD2, origine, effets `EF_GIB` et disparition/conversion visible. Les sorties passent par `ClientRefreshFrame.entities`, configstrings modeles et adapters Three; pas de branchement dedie manquant.
- Corrections appliquees:
  - `packages/game/src/g_misc.ts`: commentaire d'en-tete ajoute pour `misc_deadsoldier_die`.
  - `scripts/verify/quake2-g-misc.ts`: test cible ajoute pour spawn, frames par `spawnflags`, deathmatch free, dispatch `ED_CallSpawn`, seuil de gib, son, 4 gibs et head `ThrowHead`.
- Tests lances:
  - `npm run verify:g-misc` OK.
  - `npm run verify:g-spawn` OK.
  - `npm run verify:local-gameplay-sync` OK.
  - `npm run verify:full-game:three-renderer` OK.
  - `npm run verify:web-render-order` OK.
  - `npm run typecheck` OK.
- Prochain lot recommande: `train_use` et `func_train_find`, puis `misc_viper_use` / `SP_misc_viper` si le lot reste petit.

- 2026-05-01: `misc_banner_think` et `SP_misc_banner`.
- Checklist appliquee:
  - Source C comparee a `packages/game/src/g_misc.ts`: `misc_banner_think` conserve `s.frame = (s.frame + 1) % 16` et `nextthink = level.time + FRAMETIME`; `SP_misc_banner` conserve `MOVETYPE_NONE`, `SOLID_NOT`, modele `models/objects/banner/tris.md2`, frame initiale `rand() % 16`, link, callback think et premier think a `level.time + FRAMETIME`.
  - Commentaires d'en-tete verifies pour les deux fonctions: original/source/categorie portee/fidelite et comportement documentes.
  - Branchement runtime verifie: `misc_banner` est enregistre dans `g_spawn.ts`, exporte via `index.ts`, dispatchable par `ED_CallSpawn`; `SP_misc_banner` installe le callback; `misc_banner_think` est atteint via `G_RunFrame`/`SV_RunThink` ou `runPendingThinks`.
  - `apps/web`: integration attendue car le lot produit une entite MD2 visible animee par frames. Aucune logique parallele trouvee; les flux local/full-game consomment snapshots, modelindices et frames issus du runtime.
  - `renderer-three`: integration attendue pour modele MD2, frame courante et presence dans la scene. Les sorties passent par `ClientRefreshFrame.entities`, configstrings modeles et adapters Three; pas de branchement dedie manquant.
- Corrections appliquees:
  - `scripts/verify/quake2-g-misc.ts`: test cible ajoute pour spawn complet, modelindex, frame initiale aleatoire, cadence de think, wrap 15->0, dispatch `ED_CallSpawn` et link visible.
- Tests lances:
  - `npm run verify:g-misc` OK.
  - `npm run verify:g-spawn` OK.
  - `npm run verify:local-gameplay-sync` OK.
  - `npm run verify:full-game:three-renderer` OK.
  - `npm run verify:web-render-order` OK.
  - `npm run typecheck` OK.
- Prochain lot recommande: `misc_deadsoldier_die`, local `n` et `SP_misc_deadsoldier` si le lot reste petit.

- 2026-05-01: `commander_body_think`, `commander_body_use`, `commander_body_drop` et `SP_monster_commander_body`.
- Checklist appliquee:
  - Source C comparee a `packages/game/src/g_misc.ts`: `commander_body_think` conserve le pre-increment de frame, la reschedule tant que `s.frame < 24`, l'arret par `nextthink = 0` et le son `tank/thud.wav` quand la frame source atteint 22; `commander_body_use` installe le think, planifie `level.time + FRAMETIME` et joue `tank/pain.wav`; `commander_body_drop` force `MOVETYPE_TOSS` et ajoute 2 a l'origine Z; `SP_monster_commander_body` conserve `MOVETYPE_NONE`, `SOLID_BBOX`, modele `models/monsters/commandr/tris.md2`, bbox `[-32,-32,0]` / `[32,32,48]`, callback use, `DAMAGE_YES`, `FL_GODMODE`, `RF_FRAMELERP`, precache sons, link et drop a `level.time + 5 * FRAMETIME`.
  - Commentaires d'en-tete verifies pour les quatre fonctions; commentaire de `SP_monster_commander_body` mis a jour pour retirer une note obsolete sur `takedamage`/`FL_GODMODE`.
  - Branchement runtime verifie: `monster_commander_body` est enregistre dans `g_spawn.ts`, exporte via `index.ts`, dispatchable par `ED_CallSpawn`; `SP_monster_commander_body` installe `use` et `think`; `commander_body_drop` et `commander_body_think` sont atteints via `G_RunFrame`/`SV_RunThink` ou `runPendingThinks`, et `commander_body_use` via callback `use`/`G_UseTargets`.
  - `apps/web`: integration attendue car le lot produit un modele MD2 visible, un mouvement drop, des frames animees et des sons. Aucune logique parallele trouvee; les flux local/full-game consomment snapshots, modelindices, frames et sons issus du runtime.
  - `renderer-three`: integration attendue pour modele MD2, origine, frame courante et `RF_FRAMELERP`. Les sorties passent par `ClientRefreshFrame.entities`, configstrings modeles et `refresh-entity-sync`; pas de branchement dedie manquant.
- Corrections appliquees:
  - `packages/game/src/g_misc.ts`: commentaire de portage de `SP_monster_commander_body` corrige.
  - `scripts/verify/quake2-g-misc.ts`: test cible ajoute pour spawn complet, precache sons, drop, use, sons, cadence d'animation, arret, dispatch `ED_CallSpawn` et sortie visible linkee.
- Tests lances:
  - `npm run verify:g-misc` OK.
  - `npm run verify:g-spawn` OK.
  - `npm run verify:full-game:three-renderer` OK.
  - `npm run verify:web-render-order` OK.
  - `npx tsx ./scripts/verify/quake2-entities-phase8.ts` OK.
  - `npm run typecheck` OK.
- Prochain lot recommande: `misc_banner_think` et `SP_misc_banner` si le lot reste petit.

- 2026-05-01: `misc_easterchick2_think` et `SP_misc_easterchick2`.
- Checklist appliquee:
  - Source C comparee a `packages/game/src/g_misc.ts`: `misc_easterchick2_think` conserve le pre-increment de frame, la progression tant que `s.frame < 287`, le wrap a `248` et `nextthink = level.time + FRAMETIME`; `SP_misc_easterchick2` conserve `MOVETYPE_NONE`, `SOLID_BBOX`, bbox `[-32,-32,0]` / `[32,32,32]`, modele `models/monsters/bitch/tris.md2`, frame initiale `248`, callback think, premier think a `level.time + 2 * FRAMETIME` et link.
  - Commentaires d'en-tete verifies pour les deux fonctions: original/source/categorie portee/fidelite `Strict` et comportement documente.
  - Branchement runtime verifie: `misc_easterchick2` est enregistre dans `g_spawn.ts`, exporte via `index.ts`, dispatchable par `ED_CallSpawn`; `SP_misc_easterchick2` installe le callback; `misc_easterchick2_think` est atteint via `G_RunFrame`/`SV_RunThink` ou `runPendingThinks`.
  - `apps/web`: integration attendue car le lot produit une entite MD2 visible animee par frames. Aucune logique parallele trouvee; les flux local/full-game consomment les snapshots, modelindices et frames issus du runtime.
  - `renderer-three`: integration attendue pour modele MD2, frame courante et presence dans la scene. Les sorties passent par `ClientRefreshFrame.entities`, configstrings modeles et adapters Three; pas de branchement dedie manquant.
- Corrections appliquees:
  - `scripts/verify/quake2-g-misc.ts`: test cible ajoute pour spawn complet, modelindex, bbox, frame initiale, cadence de think, wrap 286->248, dispatch `ED_CallSpawn` et link visible.
- Tests lances:
  - `npm run verify:g-misc` OK.
  - `npm run verify:g-spawn` OK.
  - `npm run verify:local-gameplay-sync` OK.
  - `npm run verify:full-game:three-renderer` OK.
  - `npm run verify:web-render-order` OK.
  - `npm run typecheck` OK.
- Prochain lot recommande: `commander_body_think`, `commander_body_use`, `commander_body_drop` et `SP_monster_commander_body` si le lot reste petit.

- 2026-05-01: `misc_easterchick_think` et `SP_misc_easterchick`.
- Checklist appliquee:
  - Source C comparee a `packages/game/src/g_misc.ts`: `misc_easterchick_think` conserve le pre-increment de frame, la progression tant que `s.frame < 247`, le wrap a `208` et `nextthink = level.time + FRAMETIME`; `SP_misc_easterchick` conserve `MOVETYPE_NONE`, `SOLID_BBOX`, bbox `[-32,-32,0]` / `[32,32,32]`, modele `models/monsters/bitch/tris.md2`, frame initiale `208`, callback think, premier think a `level.time + 2 * FRAMETIME` et link.
  - Commentaires d'en-tete verifies pour les deux fonctions: original/source/categorie portee/fidelite `Strict` et comportement documente.
  - Branchement runtime verifie: `misc_easterchick` est enregistre dans `g_spawn.ts`, exporte via `index.ts`, dispatchable par `ED_CallSpawn`; `SP_misc_easterchick` installe le callback; `misc_easterchick_think` est atteint via `G_RunFrame`/`SV_RunThink` ou `runPendingThinks`.
  - `apps/web`: integration attendue car le lot produit une entite MD2 visible animee par frames. Aucune logique parallele trouvee; les flux local/full-game consomment les snapshots, modelindices et frames issus du runtime.
  - `renderer-three`: integration attendue pour modele MD2, frame courante et presence dans la scene. Les sorties passent par `ClientRefreshFrame.entities`, configstrings modeles et adapters Three; pas de branchement dedie manquant.
- Corrections appliquees:
  - `scripts/verify/quake2-g-misc.ts`: test cible ajoute pour spawn complet, modelindex, bbox, frame initiale, cadence de think, wrap 246->208, dispatch `ED_CallSpawn` et link visible.
- Tests lances:
  - `npm run verify:g-misc` OK.
  - `npm run verify:g-spawn` OK.
  - `npm run verify:local-gameplay-sync` OK.
  - `npm run verify:full-game:three-renderer` OK.
  - `npm run verify:web-render-order` OK.
  - `npm run typecheck` OK.
- Prochain lot recommande: `misc_easterchick2_think` et `SP_misc_easterchick2` si le lot reste petit.

- 2026-05-01: `misc_eastertank_think` et `SP_misc_eastertank`.
- Checklist appliquee:
  - Source C comparee a `packages/game/src/g_misc.ts`: `misc_eastertank_think` conserve le pre-increment de frame, la progression tant que `s.frame < 293`, le wrap a `254` et `nextthink = level.time + FRAMETIME`; `SP_misc_eastertank` conserve `MOVETYPE_NONE`, `SOLID_BBOX`, bbox `[-32,-32,-16]` / `[32,32,32]`, modele `models/monsters/tank/tris.md2`, frame initiale `254`, callback think, premier think a `level.time + 2 * FRAMETIME` et link.
  - Commentaires d'en-tete verifies pour les deux fonctions: original/source/categorie portee/fidelite `Strict` et comportement documente.
  - Branchement runtime verifie: `misc_eastertank` est enregistre dans `g_spawn.ts`, exporte via `index.ts`, dispatchable par `ED_CallSpawn`; `SP_misc_eastertank` installe le callback; `misc_eastertank_think` est atteint via `G_RunFrame`/`SV_RunThink` ou `runPendingThinks`.
  - `apps/web`: integration attendue car le lot produit une entite MD2 visible animee par frames. Aucune logique parallele trouvee; les flux local/full-game consomment les snapshots, modelindices et frames issus du runtime.
  - `renderer-three`: integration attendue pour modele MD2, frame courante et presence dans la scene. Les sorties passent par `ClientRefreshFrame.entities`, configstrings modeles et adapters Three; pas de branchement dedie manquant.
- Corrections appliquees:
  - `scripts/verify/quake2-g-misc.ts`: test cible ajoute pour spawn complet, modelindex, bbox, frame initiale, cadence de think, wrap 292->254, dispatch `ED_CallSpawn` et link visible.
- Tests lances:
  - `npm run verify:g-misc` OK.
  - `npm run verify:g-spawn` OK.
  - `npm run verify:local-gameplay-sync` OK.
  - `npm run verify:full-game:three-renderer` OK.
  - `npm run verify:web-render-order` OK.
  - `npm run typecheck` OK.
- Prochain lot recommande: `misc_easterchick_think` et `SP_misc_easterchick` si le lot reste petit.

- 2026-05-01: `misc_blackhole_use`, `misc_blackhole_think` et `SP_misc_blackhole`.
- Checklist appliquee:
  - Source C comparee a `packages/game/src/g_misc.ts`: `misc_blackhole_use` conserve la liberation immediate par `G_FreeEdict` et garde omis le bloc temp entity commente dans le C; `misc_blackhole_think` conserve l'increment de frame, la boucle 0..18 et le `nextthink = level.time + FRAMETIME`; `SP_misc_blackhole` conserve `MOVETYPE_NONE`, `SOLID_NOT`, bbox `[-64,-64,0]` / `[64,64,8]`, modele `models/objects/black/tris.md2`, `RF_TRANSLUCENT`, callbacks `use`/`think`, premier think a `level.time + 2 * FRAMETIME` et link.
  - Commentaires d'en-tete verifies pour les trois fonctions: original/source/categorie portee/fidelite et comportement documentes, avec note explicite sur le temp entity commente du C pour `misc_blackhole_use`.
  - Branchement runtime verifie: `misc_blackhole` est enregistre dans `g_spawn.ts`, exporte via `index.ts`, dispatchable par `ED_CallSpawn`; `SP_misc_blackhole` installe les callbacks; `misc_blackhole_think` est atteint via `G_RunFrame`/`SV_RunThink` ou `runPendingThinks`; `misc_blackhole_use` est atteint via callback `use`/`G_UseTargets`.
  - `apps/web`: integration attendue car le lot produit un modele MD2 translucide anime, puis sa disparition au use. Aucune logique parallele trouvee; les flux local/full-game consomment snapshots, modelindices et frames issus du runtime.
  - `renderer-three`: integration attendue pour modele MD2, frames, renderfx translucide, presence/disparition dans la scene. Les sorties passent par `ClientRefreshFrame.entities`, configstrings modeles et adapters Three; pas de branchement dedie manquant.
- Corrections appliquees:
  - `scripts/verify/quake2-g-misc.ts`: test cible ajoute pour spawn complet, modelindex, `RF_TRANSLUCENT`, callbacks, cadence de think, wrap frame 18->0, dispatch `ED_CallSpawn`, use/free et absence de temp entity.
- Tests lances:
  - `npm run verify:g-misc` OK.
  - `npm run verify:g-spawn` OK.
  - `npm run verify:local-gameplay-sync` OK.
  - `npm run verify:full-game:three-renderer` OK.
  - `npm run verify:web-render-order` OK.
  - `npx tsx ./scripts/verify/quake2-entities-phase8.ts` OK.
  - `npm run typecheck` OK.
- Prochain lot recommande: `misc_eastertank_think` et `SP_misc_eastertank` si le lot reste petit.

- 2026-05-01: `barrel_delay` et `SP_misc_explobox`.
- Checklist appliquee:
  - Source C comparee a `packages/game/src/g_misc.ts`: `barrel_delay` conserve `DAMAGE_NO`, `nextthink = level.time + 2 * FRAMETIME`, `think = barrel_explode` et `activator = attacker`. `SP_misc_explobox` conserve l'auto-free en deathmatch, le precache debris1/debris2/debris3, `SOLID_BBOX`, `MOVETYPE_STEP`, le modele barrel, bbox, valeurs par defaut `mass = 400`, `health = 10`, `dmg = 150`, `die = barrel_delay`, `DAMAGE_YES`, `AI_NOSTEP`, `touch = barrel_touch`, `think = M_droptofloor`, `nextthink = level.time + 2 * FRAMETIME` et link.
  - Commentaires d'en-tete verifies pour `barrel_delay` et `SP_misc_explobox`: original/source/categorie portee/fidelite et comportement documentes.
  - Branchement runtime verifie: `misc_explobox` est enregistre dans `g_spawn.ts` et dispatchable par `ED_CallSpawn`; le spawn installe les callbacks `die`, `touch` et `think`; `barrel_delay` est appele par le flux damage/die puis `G_RunFrame`/`SV_RunThink` declenche `barrel_explode`.
  - `apps/web`: integration attendue car le lot produit une entite MD2 shootable/poussable, dommages, disparition du barrel, debris et temp entities. Aucune logique parallele trouvee; les flux local/full-game consomment les snapshots runtime, sons et temp entities.
  - `renderer-three`: integration attendue pour le modele barrel, origines/frames, disparition, debris MD2, explosion temp entity, particules/dlights et scene. Les sorties passent par `ClientRefreshFrame.entities`/`lights`, configstrings modeles et adapters Three; pas de branchement dedie manquant.
- Corrections appliquees:
  - `scripts/verify/quake2-g-misc.ts`: assertions ciblees ajoutees pour `barrel_delay`, `SP_misc_explobox`, free deathmatch, precache debris, valeurs explicites preservees, dispatch `ED_CallSpawn` et think `M_droptofloor`.
- Tests lances:
  - `npm run verify:g-misc` OK.
  - `npm run verify:g-spawn` OK.
  - `npm run verify:local-gameplay-sync` OK.
  - `npm run verify:full-game:three-renderer` OK.
  - `npm run verify:web-render-order` OK.
  - `npx tsx ./scripts/verify/quake2-cl-tent.ts` OK.
  - `npm run typecheck` OK.
- Prochain lot recommande: `misc_blackhole_use`, `misc_blackhole_think`, puis `SP_misc_blackhole` si le lot reste petit.

- 2026-05-01: `barrel_explode` et local `spd`.
- Checklist appliquee:
  - Source C comparee a `packages/game/src/g_misc.ts`: `barrel_explode` conserve `T_RadiusDamage(self, activator, dmg, NULL, dmg+40, MOD_BARREL)`, sauvegarde `s.origin`, recentre temporairement sur `absmin + 0.5 * size`, lance 2 debris1 randomises, 4 debris3 aux coins bas, 8 debris2 randomises, restaure l'origine puis choisit `BecomeExplosion2` si grounded sinon `BecomeExplosion1`. Le port TS utilise `self.activator ?? self` comme garde defensive quand l'activator est absent; `barrel_delay` le renseigne dans le flux normal.
  - Local `spd` compare: les trois valeurs C sont conservees, `1.5 * dmg / 200`, `1.75 * dmg / 200`, puis `2 * dmg / 200`.
  - Commentaire d'en-tete verifie pour `barrel_explode`: original/source/categorie portee/fidelite `Close` et comportement documentes.
  - Branchement runtime verifie: `SP_misc_explobox` installe `die = barrel_delay`; `barrel_delay` renseigne `activator`, planifie `think = barrel_explode`, puis `G_RunFrame`/`SV_RunThink` declenche l'explosion. Le flux de dommages passe par `T_RadiusDamage`, debris par `ThrowDebris`, et temp entities par `BecomeExplosion1/2`.
  - `apps/web`: integration attendue car le lot produit dommages, disparition du barrel, debris MD2 visibles et temp entities explosion. Aucune logique parallele trouvee; les flux local/full-game drainent les temp entities et snapshots runtime vers le client.
  - `renderer-three`: integration attendue pour modeles debris, entite barrel liberee, explosion temp entity, particules/dlights et scene. Les debris passent par `ClientRefreshFrame.entities`; les explosions passent par `CL_AddTEntPacket`/`CL_BuildTEntRefresh` puis entites/lumieres consommees par les adapters Three.
- Corrections appliquees:
  - `scripts/verify/quake2-g-misc.ts`: test cible ajoute pour radius damage, origine sauvee/recentree/restauree, compte et modeles des debris, valeurs `spd`, `TE_EXPLOSION1` airborne et `TE_EXPLOSION2` grounded.
- Tests lances:
  - `npm run verify:g-misc` OK.
  - `npm run verify:g-spawn` OK.
  - `npm run verify:local-gameplay-sync` OK.
  - `npm run verify:full-game:three-renderer` OK.
  - `npm run verify:web-render-order` OK.
  - `npx tsx ./scripts/verify/quake2-cl-tent.ts` OK.
  - `npm run typecheck` OK.
- Prochain lot recommande: `barrel_delay`, puis `SP_misc_explobox` si le lot reste petit.

- 2026-05-01: `barrel_touch` et local `ratio`.
- Checklist appliquee:
  - Source C comparee a `packages/game/src/g_misc.ts`: `barrel_touch` conserve les gardes `!other->groundentity` et `other->groundentity == self`, calcule `ratio = other.mass / self.mass`, soustrait `self->s.origin - other->s.origin`, puis appelle `M_walkmove(self, vectoyaw(v), 20 * ratio * FRAMETIME)`. Le TS ajoute une garde defensive `self.mass === 0`, sans effet sur `misc_explobox` normal car `SP_misc_explobox` force `mass = 400` quand absent.
  - Commentaire d'en-tete verifie pour `barrel_touch`: original/source/categorie portee/fidelite et comportement documentes.
  - Branchement runtime verifie: `SP_misc_explobox` installe `self.touch = barrel_touch`, l'entite est liee en `SOLID_BBOX`/`MOVETYPE_STEP`, et `SV_Impact` appelle les touches pendant la physique runtime; le deplacement passe par `M_walkmove` et le collision bridge.
  - `apps/web`: integration attendue car le push de barrel modifie l'origine d'une entite MD2 visible et shootable. Aucune logique parallele trouvee; les flux local/full-game consomment les snapshots/runtime et modelindices existants.
  - `renderer-three`: integration attendue pour le modele barrel MD2, son origine/frame et les changements de scene. Le renderer consomme ces sorties via `ClientRefreshFrame.entities` et les adapters Three; pas de manque ouvert pour ce lot.
- Corrections appliquees:
  - `scripts/verify/quake2-g-misc.ts`: test cible ajoute pour push par acteur grounded, ratio de masse, direction `vectoyaw(self - other)`, et gardes airborne / groundentity == self.
- Tests lances:
  - `npm run verify:g-misc` OK.
  - `npm run verify:g-spawn` OK.
  - `npm run verify:local-gameplay-sync` OK.
  - `npm run verify:full-game:three-renderer` OK.
  - `npm run typecheck` OK.
- Prochain lot recommande: `barrel_explode` avec le local `spd` si le lot reste petit.

- 2026-05-01: ligne generee `G_FreeEdict` associee a `func_explosive`, puis `func_explosive_use` / `func_explosive_spawn` / `SP_func_explosive`.
- Checklist appliquee:
  - Source C comparee a `packages/game/src/g_misc.ts`: `SP_func_explosive` conserve le free deathmatch via `G_FreeEdict`, `MOVETYPE_PUSH`, precache debris1/debris2, `gi.setmodel`, branche trigger-spawn cachee (`SOLID_NOT`, `SVF_NOCLIENT`, `func_explosive_spawn`), branche cible (`func_explosive_use` non shootable), flags `EF_ANIM_ALL`/`EF_ANIM_ALLFAST`, health par defaut 100 et `die = func_explosive_explode` pour les variantes shootables. `func_explosive_spawn` rend le brush solide/visible, efface `use`, applique `KillBox` et relink. `func_explosive_use` appelle l'explosion avec `self` comme inflictor et `other` comme attacker, comme le C.
  - Ligne generee `G_FreeEdict` validee dans ce secteur: deathmatch `SP_func_explosive` et branche `func_explosive_use` sans `dmg` liberent bien le brush; le helper proprietaire reste `G_FreeEdict` dans `packages/game/src/g_utils.ts`, appele par `g_misc.ts`.
  - Commentaires d'en-tete verifies et completes pour `func_explosive_use`, `func_explosive_spawn` et `SP_func_explosive`: original/source/categorie/fidelite et comportement du callback documentes.
  - Branchement runtime verifie: `func_explosive` est enregistre dans `g_spawn.ts` et dispatchable par `ED_CallSpawn`; les variantes shootables passent par `die`, les variantes ciblees par `G_UseTargets`/callback `use`, et les trigger-spawn par le callback one-shot avant collision/frames.
  - `apps/web`: integration attendue car le lot produit un brush inline visible/cache, debris, dommages, sons/evenements et temp entities. Pas de logique parallele trouvee; les flux local/full-game consomment runtime, snapshots, brush model snapshots, temp entities et sons.
  - `renderer-three`: integration attendue pour brush inline de scene, debris MD2, explosion temp entity, particules/dlights et frames. Les brushs passent par `local-brush-models`/`full-game-render-source` vers `gl-world-scene-adapter`; debris et explosions passent par `ClientRefreshFrame.entities`/`lights` puis `refresh-entity-sync` et adapters Three.
- Corrections appliquees:
  - `packages/game/src/g_misc.ts`: commentaires d'en-tete completes pour les callbacks du lot.
  - `scripts/verify/quake2-g-misc.ts`: assertions ciblees ajoutees pour free deathmatch, precache debris, health par defaut, liens inline BSP, trigger-spawn cache/reveal/relink, targeted non-shootable, transmission de `other` par `func_explosive_use`, free via `G_FreeEdict`, et dispatch `ED_CallSpawn`.
- Tests lances:
  - `npm run verify:g-misc` OK.
  - `npm run verify:g-spawn` OK.
  - `npm run verify:local-gameplay-sync` OK.
  - `npm run verify:full-game:three-renderer` OK.
  - `npm run verify:web-render-order` OK.
  - `npm run verify:full-game:server-host` OK.
  - `npx tsx ./scripts/verify/quake2-cl-tent.ts` OK.
  - `npm run typecheck` OK.
- Prochain lot recommande: `barrel_touch` avec le local `ratio` si le lot reste petit.

- 2026-05-01: `func_explosive_explode` et locaux `count` / `mass`.
- Checklist appliquee:
  - Source C comparee a `packages/game/src/g_misc.ts`: le port recentre l'origine bmodel via `absmin + size * 0.5`, coupe `takedamage`, applique `T_RadiusDamage` quand `dmg` est defini, calcule la vitesse d'ejection depuis l'inflictor, utilise `mass || 75`, plafonne les gros debris a `min(mass / 100, 8)`, plafonne les petits debris a `min(mass / 25, 16)`, appelle `G_UseTargets` avec l'attaquant, puis emet `BecomeExplosion1` ou libere l'edict comme le C.
  - Commentaire d'en-tete verifie pour `func_explosive_explode`: `Original name`, source, categorie portee, fidelite `Close`, comportement de rupture du brush en debris et temp entity documentes.
  - Branchement runtime verifie: `func_explosive_explode` est atteint par `SP_func_explosive` via `die` pour les brushs shootables et par le chemin `func_explosive_use` pour les brushs cibles; dommages, cibles, debris, free et temp entity passent par les callbacks runtime normaux.
  - `apps/web`: pas de logique parallele trouvee; integration attendue car l'explosion produit sons/effects, temp entities et debris visibles. Le flux full-game consomme `onTempEntity`, les sons d'effets et les snapshots; le flux local draine `drainGameTempEntityEvents` vers `CL_AddTEntPacket`/`CL_ExecuteTempEntityEffects`.
  - `renderer-three`: integration attendue pour debris MD2 visibles, explosions temp entities, particules/dlights et scene. Les debris sont consommes via packet entities/snapshots et `refresh-entity-sync`; les explosions passent par `CL_AddTEntPacket`, `CL_BuildTEntRefresh`, `ClientRefreshFrame.entities`/`lights`, puis les adapters Three.
- Corrections appliquees:
  - `scripts/verify/quake2-g-misc.ts`: preuve ciblee ajoutee pour `mass` par defaut, plafonds `count` gros/petits debris, origine recentree, vitesse d'ejection, `G_UseTargets`, free sans `dmg`, radius damage avec `dmg` et `TE_EXPLOSION1`.
- Tests lances:
  - `npm run verify:g-misc` OK.
  - `npm run verify:g-spawn` OK.
  - `npm run verify:local-gameplay-sync` OK.
  - `npm run verify:full-game:three-renderer` OK.
  - `npm run verify:web-render-order` OK.
  - `npm run verify:full-game:server-host` OK.
  - `npx tsx ./scripts/verify/quake2-cl-tent.ts` OK.
  - `npm run typecheck` OK.

- Prochain lot recommande: ligne generee `G_FreeEdict` associee a ce secteur, puis `func_explosive_use` / `func_explosive_spawn` / `SP_func_explosive` si le lot reste coherent.

- 2026-05-01: `func_object_touch` / `func_object_release` / `func_object_use` / `SP_func_object`.
- Checklist appliquee:
  - Source C comparee a `packages/game/src/g_misc.ts`: `SP_func_object` conserve `gi.setmodel`, shrink des bornes d'une unite, `dmg` par defaut a 100, branche plain `SOLID_BSP`/`MOVETYPE_PUSH`/think release a `level.time + 2 * FRAMETIME`, branche trigger-spawn cachee avec `use`, flags `EF_ANIM_ALL`/`EF_ANIM_ALLFAST`, `MASK_MONSTERSOLID` et link. `func_object_release` conserve `MOVETYPE_TOSS` + `func_object_touch`; `func_object_use` conserve reveal, one-shot use, `KillBox` et release; `func_object_touch` conserve les gardes plan/top-plane/damageable puis `T_Damage` `MOD_CRUSH`.
  - Commentaires d'en-tete Strict ajoutes pour les quatre fonctions.
  - Branchement runtime verifie: `func_object` est enregistre dans `g_spawn.ts`, dispatchable par `ED_CallSpawn`, lie au runtime; release atteignable par `runPendingThinks`/frames, use atteignable par `G_UseTargets`/callback `use`, touch atteignable par la physique `SV_Impact` avec plan de trace, avec collisions `SOLID_BSP`, `MOVETYPE_TOSS`, `clipmask` et dommages verifies.
  - `apps/web`: pas de logique parallele trouvee; integration attendue car brush inline visible/cache, trajectoire et solidite doivent venir du runtime. Flux local/full-game verifies via snapshots/brush model adapters et ordre de rendu web.
  - `renderer-three`: integration attendue pour modele inline, etats de scene, solid/svflags visibles et trajectoire. Consommation presente via brush snapshots vers `gl-world-scene-adapter`; pas de compensation gameplay cote renderer.
- Corrections appliquees:
  - `packages/game/src/g_misc.ts`: commentaires d'en-tete de portage ajoutes.
  - `scripts/verify/quake2-g-misc.ts`: couverture directe spawn, release pensee, use trigger-spawn, animation flags, shrink bounds, `MASK_MONSTERSOLID`, dispatch `ED_CallSpawn` et crush top-plane.
- Tests lances:
  - `npm run verify:g-misc` OK.
  - `npm run verify:g-spawn` OK.
  - `npm run verify:local-gameplay-sync` OK.
  - `npm run verify:full-game:three-renderer` OK.
  - `npm run verify:web-render-order` OK.
  - `npm run typecheck` OK.

- Prochain lot recommande: `func_explosive_explode` avec les locaux associes `count` et `mass` si le lot reste coherent.

- 2026-05-01: `func_wall_use` / `SP_func_wall`.
- Checklist appliquee:
  - Source C comparee a `packages/game/src/g_misc.ts`: `func_wall_use` conserve le toggle `SOLID_NOT` vers `SOLID_BSP`, efface/pose `SVF_NOCLIENT`, appelle `KillBox` quand le mur apparait, relink l'entite et supprime `use` hors `TOGGLE`; `SP_func_wall` conserve `MOVETYPE_PUSH`, `gi.setmodel` via `setGameEntityModel`, effets `EF_ANIM_ALL`/`EF_ANIM_ALLFAST`, mur simple solid/link, `TRIGGER_SPAWN` force, warning logique `START_ON` sans `TOGGLE` via ajout du bit, et etat initial visible/cache.
  - Commentaires d'en-tete Strict ajoutes pour `func_wall_use` et `SP_func_wall`.
  - Branchement runtime verifie: `func_wall` est enregistre dans `g_spawn.ts`, dispatch par `ED_CallSpawn`, puis `func_wall_use` est atteignable par `G_UseTargets`/callback `use`; relink et changements `solid`/`svflags` sont exposes aux snapshots/queries pendant les frames serveur.
  - `apps/web`: aucune logique parallele de `func_wall` trouvee; integration attendue car les murs brush visibles/caches doivent atteindre le navigateur. Flux full-game via packet entities/brush snapshots et flux local via `buildBrushModelSnapshots`/`syncLocalGameplayFrame` verifies; `verify:full-game:render-source` reste bloque avant scenario sur import existant `packages/client/src/types.js`.
  - `renderer-three`: integration attendue car sortie visible brush inline (`model`, `solid`, `svflags`, entites de scene). Consommation presente via brush model snapshots passes par `full-game-render-loop` vers `gl-world-scene-adapter`; renderer Three verifie sans compensation gameplay.
- Corrections appliquees:
  - `packages/game/src/g_misc.ts`: commentaires d'en-tete de portage ajoutes.
  - `scripts/verify/quake2-g-misc.ts`: couverture directe de `SP_func_wall`, `func_wall_use`, `START_ON`/`TOGGLE`, effets d'animation, dispatch `ED_CallSpawn` et enregistrement modele inline.
- Tests lances:
  - `npm run verify:g-misc` OK.
  - `npm run verify:g-spawn` OK.
  - `npm run verify:local-gameplay-sync` OK.
  - `npm run verify:full-game:three-renderer` OK.
  - `npm run typecheck` OK.
  - `npm run verify:full-game:render-source` bloque avant scenario sur import existant `packages/client/src/types.js`.

- Prochain lot recommande: `func_object_touch` / `func_object_release` / `func_object_use` / `SP_func_object` si le lot reste coherent.

- 2026-05-01: `START_OFF` / `light_use` / `SP_light`.
- Checklist appliquee:
  - Source C comparee a `packages/game/src/g_misc.ts`: `START_OFF` conserve la valeur macro `1`; `light_use` alterne `CS_LIGHTS + style` entre `"m"` et `"a"` en inversant le bit; `SP_light` libere les lights sans `targetname` ou en deathmatch, n'installe `light_use` que pour `style >= 32`, puis initialise `"a"` ou `"m"` selon `START_OFF`.
  - Commentaires d'en-tete Strict ajoutes pour `light_use` et `SP_light`.
  - Branchement runtime verifie: `light` est enregistre dans `g_spawn.ts`, exporte via `index.ts`, cree par `ED_CallSpawn`; `light_use` est atteignable par `G_UseTargets`/callback `use`; les configstrings gameplay sont videes par `G_RunFrame` vers `gi.configstring` dans le flux serveur.
  - `apps/web`: flux full-game verifie via `SV_Frame` puis copie des `sv.configstrings` vers le client dans `full-game-server-host`; correction appliquee au flux local/browser pour drainer les configstrings gameplay et reparsir les `CS_LIGHTS` en lightstyles client.
  - `renderer-three`: integration attendue car les lightstyles modifient l'eclairage visible des surfaces BSP; consommation presente via `CL_BuildRefreshFrame.lightStyles` puis `gl-world-scene-adapter`/`setLightstyles`.
- Corrections appliquees:
  - `packages/game/src/g_misc.ts`: headers de portage ajoutes.
  - `packages/client/src/local-gameplay-sync.ts`: propagation des configstrings gameplay locales vers `client.cl.configstrings`, avec reparse `CL_SetLightstyle` pour `CS_LIGHTS`.
  - `scripts/verify/quake2-g-misc.ts`: branches `SP_light` et toggle `light_use` couvertes.
  - `scripts/verify/quake2-local-gameplay-sync.ts`: couverture de la propagation lightstyle locale jusqu'au `ClientRefreshFrame`.
- Tests lances:
  - `npm run verify:g-misc` OK.
  - `npx tsx ./scripts/verify/quake2-local-gameplay-sync.ts` OK.
  - `npm run verify:full-game:three-renderer` OK.
  - `npm run verify:gl-light` OK.
  - `npm run verify:gl-rsurf` OK.
  - `npm run typecheck` OK.
  - `npm run verify:cl-parse` bloque avant scenario sur import existant introuvable `packages/client/src/parse.js`.

- Prochain lot recommande: `func_wall_use` / `SP_func_wall`.

- 2026-05-01: `SP_info_null` / `SP_info_notnull`.
- Checklist appliquee:
  - Source C comparee a `packages/game/src/g_misc.ts`: `SP_info_null` libere le marqueur positionnel avec `G_FreeEdict`; `SP_info_notnull` conserve le marqueur non-solide en copiant `s.origin` vers `absmin` et `absmax`.
  - Commentaires d'en-tete Strict ajoutes pour `SP_info_null` et `SP_info_notnull`.
  - Branchement runtime verifie: `info_null` et `info_notnull` sont enregistres dans `g_spawn.ts`, exportes par `index.ts`, et dispatches par `ED_CallSpawn`.
  - `apps/web`: aucune logique parallele trouvee; ces entites sont des marqueurs serveur de map, sans commande/HUD/son/snapshot visible attendu cote navigateur.
  - `renderer-three`: pas de sortie visible attendue. `info_null` est libere, `info_notnull` n'est ni lie ni solide et ne produit aucun modele, frame, image, particule, beam, dlight, temp entity, areabits, camera ou scene.
- Corrections appliquees:
  - `packages/game/src/g_misc.ts`: commentaires d'en-tete de portage ajoutes.
  - `scripts/verify/quake2-g-misc.ts`: couverture directe et dispatch spawn pour les deux marqueurs.
- Tests lances:
  - `npm run verify:g-misc` OK.
  - `npm run verify:g-spawn` OK.
  - `npm run verify:full-game:three-renderer` OK.
  - `npm run typecheck` OK.

- 2026-05-01: `TH_viewthing` / `SP_viewthing`.
- Checklist appliquee:
  - Source C comparee a `packages/game/src/g_misc.ts`: `TH_viewthing` conserve le frame loop `(frame + 1) % 7` et `nextthink = time + FRAMETIME`; `SP_viewthing` conserve le diagnostic `viewthing spawned`, `MOVETYPE_NONE`, `SOLID_BBOX`, `RF_FRAMELERP`, bbox `[-16,-16,-24]` / `[16,16,32]`, modele `models/objects/banner/tris.md2`, link, think `TH_viewthing` et premier `nextthink = time + 0.5`.
  - Commentaires d'en-tete Strict verifies pour `TH_viewthing` et `SP_viewthing`.
  - Branchement runtime verifie: `viewthing` est enregistre dans `g_spawn.ts`, exporte par `index.ts`, cree au spawn map, link comme bbox visible et anime par `G_RunFrame`/`G_RunEntity`/`SV_RunThink`.
  - `apps/web`: aucune logique parallele trouvee; le navigateur doit seulement consommer les snapshots/runtime full-game ou local qui contiennent l'entite visible et sa frame.
  - `renderer-three`: integration attendue car sortie visible MD2 + frame; consommation presente via packet entities -> `CL_BuildRefreshFrame` -> `refresh-entity-sync` -> adapter Three, sans logique gameplay cote renderer.
- Corrections appliquees:
  - `packages/game/src/g_misc.ts`: commentaire d'en-tete et diagnostic runtime source pour `SP_viewthing`.
  - `scripts/verify/quake2-g-misc.ts`: couverture directe du spawn, modele, bbox, link runtime, diagnostic et frame loop.
- Tests lances:
  - `npm run verify:g-misc` OK.
  - `npm run verify:full-game:three-renderer` OK.
  - `npm run typecheck` OK.

- 2026-05-01: `SP_point_combat`.
- Checklist appliquee:
  - Source C comparee a `packages/game/src/g_misc.ts`: en deathmatch, `SP_point_combat` appelle `G_FreeEdict` et s'arrete; hors deathmatch, il configure `SOLID_TRIGGER`, installe `point_combat_touch`, pose les bornes `[-8,-8,-16]` / `[8,8,16]`, force `SVF_NOCLIENT`, rafraichit l'etat spatial et link l'entite.
  - Commentaire d'en-tete Strict ajoute pour `SP_point_combat`.
  - Branchement runtime verifie: `point_combat` est enregistre dans `g_spawn.ts`, exporte par `index.ts`, cree au spawn map, utilise par `monster_start_go` comme `combattarget`, puis atteint via touch/runtime pendant les frames serveur.
  - `apps/web`: aucune logique parallele trouvee; le web consomme les positions et etats issus du runtime via les flux full-game/local et `ClientRefreshFrame`.
  - `renderer-three`: integration attendue indirectement car les combat points pilotent les objectifs et pauses de monstres visibles; le renderer consomme les sorties via packet entities -> refresh frame -> adapter Three, sans compensation gameplay.
- Corrections appliquees:
  - `packages/game/src/g_misc.ts`: commentaire d'en-tete `SP_point_combat`.
  - `scripts/verify/quake2-g-misc.ts`: couverture directe de la configuration spawn et du free deathmatch.
- Tests lances:
  - `npm run verify:g-misc` OK.
  - `npm run verify:g-monster` OK.
  - `npm run verify:full-game:three-renderer` OK.
  - `npm run typecheck` OK.

## Lot precedent

- 2026-05-01: `SP_path_corner`, `point_combat_touch` et locaux `activator`, `savetarget`.
- Checklist appliquee:
  - Source C comparee a `packages/game/src/g_misc.ts`: `SP_path_corner` conserve le refus sans `targetname`, le diagnostic source, `SOLID_TRIGGER`, `path_corner_touch`, bbox `[-8,-8,-8]` / `[8,8,8]`, `SVF_NOCLIENT` et link. `point_combat_touch` conserve la garde `movetarget`, le branchement `target`/`G_PickTarget`, le fallback cible manquante, le hold non swim/fly, le cleanup vers `enemy`, l'effacement `AI_COMBAT_POINT`, le `pathtarget` et l'ordre de choix de l'activator.
  - Commentaires d'en-tete Strict ajoutes pour `SP_path_corner` et `point_combat_touch`.
  - Correction appliquee: `SP_path_corner` journalise maintenant le warning source `path_corner with no targetname` avant `G_FreeEdict`.
  - Branchement runtime verifie: `SP_path_corner` et `SP_point_combat` sont enregistres dans `g_spawn.ts` et exportes; les touches sont atteignables via spawn map, mouvement monstre, `SV_Impact`/touch pendant les frames runtime. `point_combat_touch` est valide ici, mais `SP_point_combat` reste le prochain lot documentaire.
  - `apps/web`: aucune logique parallele trouvee; le web consomme les positions/evenements runtime via snapshots, `full-game-render-source`, `local-client-controller` et `ClientRefreshFrame`.
  - `renderer-three`: integration attendue car trajectoires, pauses, teleports et combat points changent les entites visibles; consommation presente via packet entities -> `CL_BuildRefreshFrame` -> `refresh-entity-sync`; aucune compensation gameplay dans le renderer.
- Corrections appliquees:
  - `packages/game/src/g_misc.ts`: import `vtos`, warning source de `SP_path_corner`, headers `SP_path_corner` et `point_combat_touch`.
  - `scripts/verify/quake2-g-misc.ts`: couverture directe de `SP_path_corner` et des branches `point_combat_touch`.
- Tests lances:
  - `npm run verify:g-misc` OK.
  - `npm run verify:g-monster` OK.
  - `npm run verify:full-game:three-renderer` OK.
  - `npm run typecheck` OK.

## Lot precedent

- 2026-05-01: `path_corner_touch` et locaux `v`, `next`, `savetarget`.
- Checklist appliquee:
  - Source C comparee a `packages/game/src/g_misc.ts`: garde initiale `other->movetarget != self` et `other->enemy`, pathtarget avec sauvegarde/restauration du target, `G_UseTargets`, selection `G_PickTarget`, branche TELEPORT `spawnflags & 1`, assignation `goalentity`/`movetarget`, pause `wait`, terminal stand et calcul `ideal_yaw` correspondent.
  - Locaux compares: `v` est porte par `teleportOrigin` et par `subVec3(...)` pour le yaw; `next` reste un `let` reassigne apres TELEPORT; `savetarget` est porte par `saveTarget` et restaure `self.target` apres usage.
  - Commentaire d'en-tete Strict ajoute pour `path_corner_touch`.
  - Branchement runtime verifie: `monster_start_go` choisit les `path_corner`, `M_MoveToGoal`/mouvement monstre atteint `movetarget`, puis `SV_Impact` appelle le touch pendant `G_RunFrame`; `SP_path_corner` est enregistre dans `g_spawn.ts` et exporte.
  - `apps/web`: aucune logique parallele trouvee; le web consomme les positions/evenements issus des snapshots via `full-game-render-source`, `local-client-controller` et `ClientRefreshFrame`.
  - `renderer-three`: integration attendue car les trajectoires/teleports de monstres changent les entites visibles; consommation presente via packet entities -> `CL_BuildRefreshFrame` -> `refresh-entity-sync`, avec `EV_OTHER_TELEPORT` parse cote client.
- Corrections appliquees:
  - `packages/game/src/g_misc.ts`: commentaire d'en-tete `path_corner_touch`.
  - `scripts/verify/quake2-g-misc.ts`: couverture ajoutee pour pathtarget/restauration, TELEPORT, wait et terminal stand.
- Tests lances:
  - `npm run verify:g-misc` OK.
  - `npm run verify:g-monster` OK.
  - `npm run verify:full-game:three-renderer` OK.
  - `npm run typecheck` OK.

## Lot precedent

- 2026-05-01: `BecomeExplosion1`, `BecomeExplosion2`.
- Checklist appliquee:
  - Source C comparee a `packages/game/src/g_misc.ts`: les deux fonctions ecrivent un `svc_temp_entity` equivalent via `emitGameTempEntity`, conservent respectivement `TE_EXPLOSION1` et `TE_EXPLOSION2`, copient `self->s.origin`, utilisent `MULTICAST_PVS`, puis appellent `G_FreeEdict`.
  - Correction appliquee: les logs `runtime.log` non presents dans le C ont ete retires; commentaires d'en-tete Strict ajoutes pour les deux fonctions.
  - Branchement runtime verifie: appels directs depuis morts monstres (`m_flyer`, `m_float`, `m_hover`), plateformes bloquantes (`g_func`), explosions de `g_misc` (`func_explosive`, `misc_explobox`, viper bomb/blackhole); les temp entities sont drainees par `G_RunFrame` vers `gi.WriteByte`/`WritePosition`/`multicast` ou par le bridge local.
  - `apps/web`: aucune logique parallele trouvee; le full-game connecte `onTempEntity`, construit `ClientRefreshFrame` via `full-game-render-source` et passe ce frame a la boucle Three/ref_gl.
  - `renderer-three`: integration attendue car sorties temp entities visibles; consommation presente via `CL_AddTEntPacket`/`CL_BuildTEntRefresh`, `CL_BuildRefreshFrame` ajoute les explosions comme entites refresh et dlights, puis `renderer-three` consomme `refreshFrame.entities`/`lights`.
- Tests lances:
  - `npm run verify:g-misc` OK.
  - `npx tsx ./scripts/verify/quake2-cl-tent.ts` OK.
  - `npx tsx ./scripts/verify/quake2-local-gameplay-sync.ts` OK.
  - `npm run verify:full-game:three-renderer` OK.
  - `npm run typecheck` OK.

## Lot precedent

- 2026-05-01: `debris_die`, `ThrowDebris` et local `chunk`.
- Checklist appliquee:
  - Source C comparee a `packages/game/src/g_misc.ts`: `debris_die` libere l'edict; `ThrowDebris` cree un `chunk` par `G_Spawn`, copie l'origine, enregistre le modele, calcule `v = [100*crandom, 100*crandom, 100 + 100*crandom]`, applique `self.velocity + speed*v`, configure `MOVETYPE_BOUNCE`, `SOLID_NOT`, avelocity randomisee, cleanup `5 + random()*5`, frame 0, flags 0, classname `debris`, `DAMAGE_YES`, callback `debris_die`, puis link runtime.
  - Commentaires d'en-tete ajoutes pour `debris_die` et `ThrowDebris`.
  - Branchement runtime verifie: `ThrowDebris` est appele par `func_explosive_explode` et `barrel_explode`; ces flux sont atteignables via entites `func_explosive`/`misc_explobox`, dommages/use/think, puis les debris lies sont eligibles aux snapshots et avances par la physique.
  - `apps/web`: aucune logique parallele de debris trouvee; le navigateur consomme les entites visibles via les flux local/full-game et `ClientRefreshFrame`.
  - `renderer-three`: integration attendue car les debris sont des modeles MD2 visibles; consommation presente via `ClientRefreshFrame.entities`, configstrings `CS_MODELS + modelindex`, `refresh-entity-sync` et verification renderer.
- Corrections appliquees:
  - `packages/game/src/g_misc.ts`: commentaires d'en-tete de portage ajoutes.
  - `scripts/verify/quake2-g-misc.ts`: test cible ajoute pour le chunk debris visible, sa velocite, son cleanup, son callback `debris_die` et son modelindex.
- Tests lances:
  - `npm run verify:g-misc` OK.
  - `npm run verify:refresh-entity:alias-flags` OK.
  - `npm run verify:full-game:three-renderer` OK.
  - `npm run typecheck` OK.

## Lot precedent

- 2026-05-01: `ThrowClientHead` et local `gibname`.
- Checklist appliquee:
  - Source C comparee au port TS deplace dans `packages/game/src/p_client.ts`: le choix aleatoire `gibname` conserve les modeles `head2`/`skull` et les skins 1/0; l'origine Z est augmentee de 32; frame, bbox, `DAMAGE_NO`, `SOLID_NOT`, `EF_GIB`, son, `FL_NO_KNOCKBACK`, `MOVETYPE_BOUNCE`, vitesse ajoutee par `VelocityForDamage`, animation client et nettoyage `think`/`nextthink` des bodies sans client correspondent au C.
  - Commentaire d'en-tete `ThrowClientHead` verifie dans `p_client.ts`; il documente le deplacement depuis le helper `g_misc.c`.
  - Branchement runtime verifie: `player_die` et `body_die` appellent `ThrowClientHead`; ces flux sont atteignables via `T_Damage`/`Killed`/mort joueur et body queue, puis les entites liees sont publiees par snapshots.
  - `apps/web`: aucune logique parallele de client head trouvee; le navigateur consomme les sorties runtime par le flux full-game/local, `modelindex`, effets et snapshots.
  - `renderer-three`: integration attendue car la sortie est un modele MD2 visible avec `EF_GIB`; consommation presente via `ClientRefreshFrame.entities`, resolution `CS_MODELS + modelindex`, `refresh-entity-sync`, et trail `EF_GIB` cote client.
- Corrections appliquees:
  - `scripts/verify/quake2-g-misc.ts`: test cible ajoute pour les deux choix `gibname`, skin, bbox, effets, vitesse, animation client et cleanup body queue.
  - `audit-portage/validation-incrementale/validation/matrices/game_g_misc.c.md`: cible documentee comme port deplace dans `packages/game/src/p_client.ts`.
- Tests lances:
  - `npm run verify:full-game:three-renderer` OK.
  - `npm run verify:g-misc` bloque avant scenario sur import existant `packages/game/src/g_items.ts`: `CONTENTS_SOLID` n'est pas exporte par `packages/qcommon/src/index.js`.
  - `npx tsx ./scripts/verify/quake2-p-client.ts` bloque sur le meme import existant.
  - `npm run verify:refresh-entity:alias-flags` bloque sur le meme import existant.
  - `npm run typecheck` bloque sur `packages/game/src/g_items.ts`: `runtime.collision` possiblement `null`.

## Lot precedent

- 2026-05-01: locaux `gib` / `vscale` de `ThrowGib`, puis `ThrowHead` avec son local `vscale`.
- Checklist appliquee:
  - Source C comparee a `packages/game/src/g_misc.ts`: `gib` reste une entite creee par `G_Spawn`, positionnee dans la bbox source, configuree avec model/effects/damage callbacks, vitesse randomisee puis clipee et liee au runtime; les deux `vscale` conservent `0.5` pour `GIB_ORGANIC` et `1.0` sinon; `ThrowHead` convertit l'entite source elle-meme en gib head, remet skin/frame/bounds/modelindex2, efface `EF_FLIES`, son et `SVF_MONSTER`, conserve `EF_GIB`, `FL_NO_KNOCKBACK`, `DAMAGE_YES`, `gib_die`, type de mouvement, callback touch organique, vitesse, yaw avelocity, cleanup et link.
  - Commentaire d'en-tete ajoute pour `ThrowHead`; commentaire `ThrowGib` deja present et verifie.
  - Branchement runtime verifie: `ThrowHead` est appele par les morts monstres et joueur (`m_*`, `p_client.ts`), `ThrowGib` reste appele par les memes flux; les entites liees sont avancees par `G_RunFrame`/physique et visibles via snapshots.
  - `apps/web`: aucune logique gib/head parallele trouvee; le navigateur consomme le `ClientRefreshFrame` construit depuis le runtime client/full-game (`full-game-render-source`, `full-game-render-loop`).
  - `renderer-three`: integration attendue car sorties visibles MD2 + `EF_GIB`; consommation presente via `refresh-entity-sync`, et les trails `EF_GIB` sont generes cote client par `CL_AddEntityEffects`/`CL_DiminishingTrail`.
- Corrections appliquees:
  - `packages/game/src/g_misc.ts`: commentaire d'en-tete `ThrowHead`.
  - `scripts/verify/quake2-g-misc.ts`: test cible `ThrowHead` avec hasard controle pour les champs nettoyes et les deux valeurs `vscale`.
- Tests lances:
  - `npm run verify:g-misc` OK.
  - `npm run verify:refresh-entity:alias-flags` OK.
  - `npm run verify:full-game:three-renderer` OK.
  - `npm run typecheck` OK.

## Lot precedent

- 2026-05-01: comportements gib `gib_think`, `gib_touch`, `gib_die` et `ThrowGib`.
- Checklist appliquee:
  - Source C comparee a `packages/game/src/g_misc.ts`: `gib_think` conserve l'increment de frame, le `FRAMETIME` et le basculement vers cleanup a la frame 10; `gib_die` appelle `G_FreeEdict`; `ThrowGib` conserve spawn, origine dans la bbox, model/effects, `FL_NO_KNOCKBACK`, `DAMAGE_YES`, die callback, choix organique/metallique, vitesse randomisee/clipee, avelocity, cleanup et link.
  - Ecart corrige pour `gib_touch`: le C n'emet le son, n'oriente le gib et n'avance le petit `sm_meat` que si un `plane` est fourni. Le TS accepte maintenant le plan runtime, garde le cas sans plan sans effet visuel/sonore, et calcule `self.s.angles` via `vectoangles(AngleVectors(vectoangles(plane.normal)).right)`.
  - Commentaires d'en-tete ajoutes pour `gib_think`, `gib_touch`, `gib_die` et `ThrowGib`.
  - Branchement runtime verifie: `ThrowGib` est appele par les morts monstres/joueurs et cree des entites dynamiques; `gib_touch` est appele par `SV_Impact` avec `trace.plane` pendant `G_RunFrame`/`G_RunEntity`; `gib_think` et `gib_die` sont callbacks de ces gibs.
  - `apps/web`: pas de logique gib parallele trouvee; le flux web consomme les snapshots et sons runtime via les chemins full-game/local.
  - `renderer-three`: integration attendue car les gibs sont des MD2 visibles avec `EF_GIB`; consommation presente via `ClientRefreshFrame.entities`, `refresh-entity-sync` et les trails `EF_GIB` cote client.
- Corrections appliquees:
  - `packages/game/src/g_misc.ts`: headers de portage ajoutes, `gib_touch` aligne sur le plan d'impact C.
  - `scripts/verify/quake2-g-misc.ts`: tests directs ajoutes pour `gib_touch`, `gib_think` et `gib_die`.
- Tests lances:
  - `npm run verify:g-misc` OK.
  - `npm run verify:refresh-entity:alias-flags` OK.
  - `npm run verify:full-game:three-renderer` OK.
  - `npm run typecheck` OK.
  - `npm run verify:full-game:render-source` tente mais bloque avant scenario sur import existant manquant `packages/client/src/types.js`.

## Lot precedent

- 2026-05-01: helpers gib/debris `VelocityForDamage`, `VectorScale` et `ClipGibVelocity`.
- Checklist appliquee:
  - Source C comparee aux helpers TS dans `packages/game/src/g_misc.ts`: `VelocityForDamage` conserve les tirages `crandom`/`random`, le seuil `damage < 50` et les facteurs `0.7`/`1.2`; `VectorScale` est porte par le helper local `scaleVec3` avec retour tuple; `ClipGibVelocity` conserve les bornes `[-300, 300]` en X/Y et `[200, 500]` en Z.
  - Commentaires d'en-tete ajoutes pour les trois helpers dans `packages/game/src/g_misc.ts`.
  - Branchement runtime verifie: les helpers sont appeles par `ThrowGib`/`ThrowHead`, eux-memes atteignables depuis les morts/gibs de monstres et joueurs; les debris passent par `ThrowDebris` dans les explosions. Les entites dynamiques sont liees au runtime, avancees par `G_RunFrame`/`G_RunEntity`, puis eligibles a `SV_BuildClientFrame` via `modelindex`/`effects`.
  - `apps/web`: pas de logique parallele trouvee pour ces helpers; le flux web consomme les packet entities via le `refreshFrame` full-game/local.
  - `renderer-three`: integration attendue car les gibs/debris sont des modeles MD2 visibles; le renderer consomme les sorties via `refresh-entity-sync` (`refreshFrame.entities`, `modelindex`, `origin`, `angles`, `effects`), sans compensation gameplay.
- Correction appliquee: commentaires de portage ajoutes dans `packages/game/src/g_misc.ts`.
- Tests lances:
  - `npm run verify:g-misc` OK.
  - `npm run verify:refresh-entity:alias-flags` OK.
  - `npm run typecheck` OK.
  - `npm run verify:full-game:render-source` tente mais bloque avant scenario sur import existant manquant `packages/client/src/types.js`.

## Correction des partielles

- 2026-04-30: correction de l'integration visible areaportals (`Use_Areaportal`, `SP_func_areaportal`).
  - Correction appliquee: `packages/client/src/refresh.ts` ajoute `ClientRefreshFrame.areabits` clone depuis `runtime.cl.frame.areabits`; `packages/renderer-three/src/gl-world-scene-adapter.ts` recopie ces bits dans la refdef et appelle `setRefdefState` pendant `update`, avant `R_MarkLeaves`/`R_DrawWorld`.
  - Checklist reprise: source C/TS deja comparee sur `Use_Areaportal`/`SP_func_areaportal`; commentaires d'en-tete TS verifies; branchement runtime `CM_SetAreaPortalState` et spawn/export verifies; `apps/web` passe deja `refreshFrame` au world adapter; `renderer-three` consomme maintenant les `areabits` pour le culling visible des zones fermees.
  - Tests lances: `npm run verify:g-misc`, `npm run verify:g-spawn`, `npx tsx ./scripts/verify/quake2-cl-view.ts`, `npm run verify:gl-rsurf`, `npm run verify:particle-sync`, `npm run verify:beam-sync`, `npm run verify:dlight-sync`, `npm run verify:refresh-entity:sprite`, `npm run verify:refresh-entity:alias-flags`, `npm run verify:refresh-entity:weapon`, `npm run typecheck`.

## Passe rapide post-validation

- 2026-04-30: controle limite aux lignes deja `Valide` de la matrice (`Use_Areaportal`, `SP_func_areaportal`). Verdict documentaire alors corrige en `Partiel`: le branchement runtime game etait present (`CM_SetAreaPortalState`, spawn `func_areaportal`, export `index.ts`), mais l'integration visible attendue n'etait pas complete car `ClientRefreshFrame`/`apps/web` ne propageaient pas les `areabits` vers `renderer-three`; point corrige dans la section precedente.

## Lot precedent

- 2026-04-30: `Use_Areaportal` + `SP_func_areaportal`.
- Correction appliquee dans `packages/game/src/g_misc.ts`: `Use_Areaportal` appelle maintenant `CM_SetAreaPortalState` via `runtime.collision.world` quand disponible, en plus du log de harness.
- Commentaires d'en-tete ajoutes pour les deux fonctions.
- Branchement runtime verifie: `func_areaportal` est enregistre dans `packages/game/src/g_spawn.ts`, exporte via `packages/game/src/index.ts`, et atteignable par le spawn system.
- `apps/web`: aucune logique principale dupliquee pour ce lot.
- `renderer-three`: aucune compensation gameplay; le renderer consomme les areabits produits par le flux serveur/collision.

## Tests de reference lances

- `npm run verify:g-misc`
- `npm run verify:g-spawn`
- `npm run typecheck`
- Controle ad hoc `npx tsx` confirmant: `count` bascule 0/1, `portalopen[style]` bascule 0/1, et `CM_AreasConnected` suit l'ouverture/fermeture.

## Blocages

- Aucun pour ce lot.

## Prochain lot recommande

- `START_OFF` / `light_use` / `SP_light` si le lot reste coherent.
