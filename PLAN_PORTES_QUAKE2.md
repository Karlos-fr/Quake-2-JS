# Plan Portes Quake II

## Objectif

Porter le pipeline original permettant aux portes, plateformes et ascenseurs de Quake II de :

- spawner correctement depuis les entites de map ;
- reagir aux `trigger_once`, `trigger_multiple`, `trigger_relay` et `func_button` ;
- resoudre les chaines `target` / `targetname` ;
- se deplacer via la logique `MOVETYPE_PUSH` et les `think` serveur originaux ;
- rester compatibles ensuite avec le bridge de rendu Three.js sans deformer le comportement gameplay.

## Source originale a porter

### Gameplay `game/`

- `Quake-2-master/game/g_func.c`
- `Quake-2-master/game/g_trigger.c`
- `Quake-2-master/game/g_utils.c`
- `Quake-2-master/game/g_spawn.c`
- `Quake-2-master/game/g_phys.c`
- `Quake-2-master/game/g_main.c`

### Cas d'usage map confirme

`base1` contient deja les chaines de gameplay a supporter :

- `func_door`
- `func_plat`
- `func_button`
- `trigger_once`
- `trigger_multiple`
- `trigger_relay`

Le systeme proche du spawn / ascenseur repose sur une combinaison de :

- entites de map ;
- activation par trigger ou bouton ;
- dispatch `G_UseTargets` ;
- mouvement via `MOVETYPE_PUSH`.

## Phase 1 - Resolution des cibles

But : permettre aux entites de retrouver et activer leurs cibles comme dans le code original.

- [x] Porter `G_Find` depuis `game/g_utils.c`.
- [x] Porter `G_UseTargets` depuis `game/g_utils.c`.
- [x] Porter la gestion du `delay`, `killtarget`, `target`, `targetname`.
- [x] Verifier que les entites de `base1` resolvent correctement des chaines comme `t4`, `t37`, `t70`, `t75`.
- [x] Ajouter un harnais de verification qui journalise les activations sans rendu.

## Phase 2 - Triggers

But : permettre l'activation correcte des actions map par contact et relai.

- [x] Porter `SP_trigger_multiple`.
- [x] Porter `SP_trigger_once`.
- [x] Porter `SP_trigger_relay`.
- [x] Porter `Touch_Multi`, `Use_Multi`, `multi_trigger`.
- [x] Porter `trigger_relay_use`.
- [x] Rebrancher ces spawners dans le registre d'entites porte.
- [x] Verifier qu'un joueur local peut declencher un trigger volume par presence.

## Phase 3 - Portes

But : reproduire le cycle de vie complet d'une porte Quake II.

- [x] Porter `SP_func_door`.
- [x] Porter `SP_func_door_rotating`.
- [x] Porter `door_use`.
- [x] Porter `door_go_up`.
- [x] Porter `door_hit_top`.
- [x] Porter `door_go_down`.
- [x] Porter `door_hit_bottom`.
- [x] Porter `Touch_DoorTrigger`.
- [x] Porter `Think_SpawnDoorTrigger`.
- [x] Porter `Think_CalcMoveSpeed`.
- [x] Porter `door_blocked`.
- [x] Porter `door_killed` si necessaire pour fidelite gameplay.
- [x] Porter `door_touch` pour les messages de porte verrouillee / ciblee.

## Phase 4 - Plateformes et ascenseurs

But : supporter les plateformes type ascenseur, y compris celles activees par presence.

- [x] Porter `SP_func_plat`.
- [x] Porter `Use_Plat`.
- [x] Porter `Touch_Plat_Center`.
- [x] Porter `plat_spawn_inside_trigger`.
- [x] Porter `plat_go_up`.
- [x] Porter `plat_go_down`.
- [x] Porter `plat_hit_top`.
- [x] Porter `plat_hit_bottom`.
- [x] Porter `plat_blocked`.

## Phase 5 - Mouvement des brush models

But : rendre effectifs les mouvements des portes et plateformes au runtime.

- [x] Porter `Move_Calc`.
- [x] Porter `Move_Begin`.
- [x] Porter `Move_Final`.
- [x] Porter `Move_Done`.
- [x] Porter `Think_AccelMove`.
- [x] Porter `SV_RunThink`.
- [x] Porter `SV_Push`.
- [x] Porter `SV_Physics_Pusher`.
- [x] Porter `G_RunEntity`.
- [x] Rebrancher ce pipeline dans la boucle de frame.

Sans cette phase, une porte peut etre correctement activee mais ne jamais bouger.

## Phase 6 - Spawn et teams

But : garantir que les entites map sont instanciees avec les bonnes liaisons.

- [x] Verifier le mapping des classnames dans `g_spawn.c`.
- [x] Porter ou completer `G_FindTeams`.
- [x] Supporter les groupes `team` pour les portes doubles ou synchronisees.
- [x] Verifier le spawn des brush entities `model "*N"` de `base1`.

## Phase 7 - Integration locale web

But : brancher ces comportements a la boucle locale actuelle sans attendre tout le serveur reseau.

- [x] Ajouter une boucle gameplay locale minimale appelee a chaque frame.
- [x] Y injecter le joueur local comme activator pour les triggers tactiles.
- [x] Recalculer les brush entities mobiles apres mouvement.
- [x] Synchroniser les transformations mobiles avec le rendu BSP / scene.
- [x] Garder cette couche comme `Adapter` clairement separee du port gameplay.

## Phase 8 - Verification ciblee

But : valider la fidelite sur des scenarios concrets avant d'aller plus loin.

- Scenario 1 : porte simple a trigger de proximite.
- Scenario 2 : porte a bouton.
- Scenario 3 : plateforme / ascenseur.
- Scenario 4 : porte double en `team`.
- Scenario 5 : cas `base1` proche du spawn / ascenseur.

## Ordre recommande d'implementation

1. `G_Find` + `G_UseTargets`
2. `trigger_once` / `trigger_multiple` / `trigger_relay`
3. `func_door`
4. `func_plat`
5. `Move_*`
6. `SV_RunThink` + `SV_Physics_Pusher` + `G_RunEntity`
7. verification `base1`

## Resultat attendu

Une fois ce plan realise, le projet doit etre capable de :

- ouvrir une porte Quake II standard sans logique ad hoc ;
- faire fonctionner une plateforme / ascenseur a partir des entites de map ;
- reutiliser ensuite ce socle pour les autres mecanismes brush (`func_train`, `func_button`, `func_door_secret`, etc.).
