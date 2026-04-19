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

- Porter `G_Find` depuis `game/g_utils.c`.
- Porter `G_UseTargets` depuis `game/g_utils.c`.
- Porter la gestion du `delay`, `killtarget`, `target`, `targetname`.
- Verifier que les entites de `base1` resolvent correctement des chaines comme `t4`, `t37`, `t70`, `t75`.
- Ajouter un harnais de verification qui journalise les activations sans rendu.

## Phase 2 - Triggers

But : permettre l'activation correcte des actions map par contact et relai.

- Porter `SP_trigger_multiple`.
- Porter `SP_trigger_once`.
- Porter `SP_trigger_relay`.
- Porter `Touch_Multi`, `Use_Multi`, `multi_trigger`.
- Porter `trigger_relay_use`.
- Rebrancher ces spawners dans le registre d'entites porte.
- Verifier qu'un joueur local peut declencher un trigger volume par presence.

## Phase 3 - Portes

But : reproduire le cycle de vie complet d'une porte Quake II.

- Porter `SP_func_door`.
- Porter `SP_func_door_rotating`.
- Porter `door_use`.
- Porter `door_go_up`.
- Porter `door_hit_top`.
- Porter `door_go_down`.
- Porter `door_hit_bottom`.
- Porter `Touch_DoorTrigger`.
- Porter `Think_SpawnDoorTrigger`.
- Porter `Think_CalcMoveSpeed`.
- Porter `door_blocked`.
- Porter `door_killed` si necessaire pour fidelite gameplay.
- Porter `door_touch` pour les messages de porte verrouillee / ciblee.

## Phase 4 - Plateformes et ascenseurs

But : supporter les plateformes type ascenseur, y compris celles activees par presence.

- Porter `SP_func_plat`.
- Porter `Use_Plat`.
- Porter `Touch_Plat_Center`.
- Porter `plat_spawn_inside_trigger`.
- Porter `plat_go_up`.
- Porter `plat_go_down`.
- Porter `plat_hit_top`.
- Porter `plat_hit_bottom`.
- Porter `plat_blocked`.

## Phase 5 - Mouvement des brush models

But : rendre effectifs les mouvements des portes et plateformes au runtime.

- Porter `Move_Calc`.
- Porter `Move_Begin`.
- Porter `Move_Final`.
- Porter `Move_Done`.
- Porter `Think_AccelMove`.
- Porter `SV_RunThink`.
- Porter `SV_Push`.
- Porter `SV_Physics_Pusher`.
- Porter `G_RunEntity`.
- Rebrancher ce pipeline dans la boucle de frame.

Sans cette phase, une porte peut etre correctement activee mais ne jamais bouger.

## Phase 6 - Spawn et teams

But : garantir que les entites map sont instanciees avec les bonnes liaisons.

- Verifier le mapping des classnames dans `g_spawn.c`.
- Porter ou completer `G_FindTeams`.
- Supporter les groupes `team` pour les portes doubles ou synchronisees.
- Verifier le spawn des brush entities `model "*N"` de `base1`.

## Phase 7 - Integration locale web

But : brancher ces comportements a la boucle locale actuelle sans attendre tout le serveur reseau.

- Ajouter une boucle gameplay locale minimale appelee a chaque frame.
- Y injecter le joueur local comme activator pour les triggers tactiles.
- Recalculer les brush entities mobiles apres mouvement.
- Synchroniser les transformations mobiles avec le rendu BSP / scene.
- Garder cette couche comme `Adapter` clairement separee du port gameplay.

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
