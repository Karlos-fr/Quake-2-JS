# PLAN_PORTAGE_BLOCS_QUAKE2.md

# Quake2JS - Plan de portage par blocs entiers

## 1. Objectif

Porter des blocs entiers du code source original Quake II, dans un ordre qui :

- limite les trous fonctionnels ;
- reduit les oublis et anomalies de portage ;
- minimise les effets de bord inter-systemes ;
- consolide le runtime autour de sous-systemes complets plutot que de fonctions isolees.

Le but n'est pas de tout porter fichier par fichier de maniere aveugle.
Le but est de choisir les blocs C les plus coherents et les moins dangereux a porter d'un seul tenant.

## 2. Regle de priorisation

Un bloc est prioritaire s'il remplit la majorite des criteres suivants :

- responsabilite claire et perimetre fonctionnel coherent ;
- dependances deja largement en place ;
- peu de couplage dur avec le serveur ou le rendu ;
- fort impact visible ou audible ;
- forte reduction des comportements partiellement portes.

Un bloc est retarde s'il depend fortement :

- d'un sous-systeme encore instable ;
- d'une orchestration client/serveur incomplete ;
- d'une physique ou collision encore en evolution ;
- d'un backend web pas encore pret.

## 3. Ordre de portage recommande

### Phase 1 - Bloc client effets immediats

#### 1. `client/cl_fx.c`

- [ ] porter le bloc entier

Pourquoi :

- centralise une grande partie des effets client coherents ;
- couvre beaucoup de sons et feedbacks d'armes / ennemis ;
- a peu d'effet de bord sur la simulation serveur ;
- reduit rapidement les anomalies perceptibles.

#### 2. `client/cl_tent.c`

- [ ] porter le bloc entier

Pourquoi :

- complete naturellement `cl_fx.c` ;
- couvre temp entities, explosions, impacts, beams et sons associes ;
- reste majoritairement cote client ;
- ameliore fortement la fidelite sans destabiliser le runtime.

### Phase 2 - Bloc client colonne vertebrale

#### 3. `client/cl_parse.c`

- [ ] porter le bloc de maniere continue et coherente

Pourquoi :

- c'est le coeur du parsing des messages serveur ;
- de nombreuses anomalies viennent de petits manques disperses dans ce fichier ;
- mieux vaut un grand portage structure que des ajouts ponctuels decousus.

Perimetre vise :

- messages serveur manquants ;
- `svc_sound` ;
- configstrings ;
- inventaire ;
- layout ;
- evenements ;
- telechargements si le perimetre actuel les conserve.

#### 4. `client/cl_main.c`

- [ ] porter le bloc d'orchestration client restant

Pourquoi :

- structure la boucle client ;
- stabilise les transitions d'etat, init, restart, hooks son / refresh ;
- complete naturellement `cl_parse.c`.

#### 5. `client/cl_view.c`

- [ ] porter le bloc entier

Pourquoi :

- responsabilite tres claire ;
- faible risque serveur ;
- ameliore la camera, le bob, le kick, le FOV et le ressenti general.

#### 6. `client/cl_pred.c`

- [ ] porter le bloc entier

Pourquoi :

- la prediction est dangereuse lorsqu'elle est semi-portee ;
- ce bloc gagne a etre finalise d'un seul tenant ;
- il reduit les glitches de mouvement, de camera et de collisions ressenties.

### Phase 3 - Bloc joueur gameplay

#### 7. `game/p_view.c`

- [ ] porter le bloc entier

Pourquoi :

- couvre beaucoup de feedbacks joueur critiques ;
- centralise sons eau / lave / slime / damage / loops de vue ;
- forte valeur perceptive avec peu d'effet de bord.

#### 8. `game/p_weapon.c`

- [ ] porter le bloc entier

Pourquoi :

- bloc metier tres coherent ;
- couvre sons, transitions d'armes, hums, no-ammo, cadence ;
- reduit fortement les comportements incoherents cote joueur.

#### 9. `game/g_weapon.c`

- [ ] porter le bloc entier

Pourquoi :

- complete `p_weapon.c` ;
- couvre projectiles, explosions et comportements monde des tirs ;
- limite les divergences entre arme joueur et resultat serveur.

### Phase 4 - Bloc logique de map

#### 10. `game/g_trigger.c`

- [ ] porter le bloc entier

Pourquoi :

- bloc relativement autonome ;
- responsabilite claire ;
- ajoute beaucoup de vie de map avec peu de risques techniques.

#### 11. `game/g_target.c`

- [ ] porter le bloc entier

Pourquoi :

- complete `g_trigger.c` ;
- couvre `target_speaker`, `target_cd` et plusieurs scripts de niveau ;
- utile pour ambiance, narration et logique de map.

#### 12. `game/g_func.c`

- [ ] porter le bloc entier

Pourquoi :

- bloc majeur du monde dynamique ;
- mieux vaut un vrai gros portage coherent qu'un demi-portage de portes, plats et movers ;
- evite les comportements casses partiels.

Perimetre vise :

- portes ;
- plats ;
- boutons ;
- trains ;
- movers ;
- sons et timings associes.

### Phase 5 - Bloc objets et monde

#### 13. `game/g_misc.c`

- [ ] porter le bloc entier

Pourquoi :

- couvre beaucoup d'objets monde et de cas particuliers ;
- complete bien les interactions et le peuplement de map ;
- forte valeur visible avec couplage modere.

#### 14. `game/p_client.c`

- [ ] porter le bloc entier

Pourquoi :

- bloc central du joueur ;
- gere spawn, mort, respawn, deconnexion, plusieurs sons et etats critiques ;
- a plus d'effet de bord, donc il doit venir apres stabilisation du deplacement, de la vue et des armes.

#### 15. `game/g_combat.c`

- [ ] porter le bloc entier

Pourquoi :

- centralise degats, armor, reactions et side effects de combat ;
- beaucoup d'anomalies gameplay viennent d'un combat partiellement porte ;
- plus sur a finaliser en bloc.

### Phase 6 - Bloc monstres

#### 16. `game/g_monster.c`

- [ ] porter le bloc entier

Pourquoi :

- tronc commun de nombreux monstres ;
- prepare un portage plus propre des fichiers `m_*.c` ;
- reduit les anomalies communes avant de traiter chaque IA.

#### 17. `game/m_*.c` par familles

- [ ] porter les monstres par ordre de valeur / dependance

Ordre recommande :

1. [ ] `game/m_soldier.c`
2. [ ] `game/m_infantry.c`
3. [ ] `game/m_gunner.c`
4. [ ] `game/m_gladiator.c`
5. [ ] `game/m_tank.c`
6. [ ] reste des `m_*.c`

Pourquoi :

- chaque fichier monstre est deja un bloc metier coherent ;
- une fois `g_monster.c`, `g_combat.c`, `g_weapon.c`, `cl_fx.c` et `cl_tent.c` stabilises, leur portage devient beaucoup plus fiable.

### Phase 7 - Bloc interface et media

#### 18. `client/cl_scrn.c`

- [ ] finaliser le bloc entier

Pourquoi :

- meme si le HUD est deja bien avance, ce fichier reste la reference pour de nombreux details ;
- faible effet de bord cote serveur ;
- utile pour finir les overlays, transitions d'ecran et comportements HUD residuels.

#### 19. `client/cl_cin.c`

- [ ] porter le bloc entier

Pourquoi :

- bloc tres autonome ;
- depend surtout du rendu 2D et de l'audio brut ;
- peu de risque sur le reste du runtime.

#### 20. `client/snd_dma.c` + `client/snd_mem.c` + `client/snd_mix.c`

- [ ] porter ce sous-systeme comme un seul grand bloc

Pourquoi :

- ces fichiers forment un sous-systeme audio coherent ;
- les porter separement creerait des trous ;
- la logique Quake II doit etre portee ensemble, meme si le backend materiel sera adapte au web.

## 4. Blocs a retarder

### A eviter trop tot

- [ ] `server/*.c` lourds hors besoins immediats
- [ ] `game/p_client.c` tant que joueur, vue et armes ne sont pas stabilises
- [ ] `game/g_combat.c` tant que les armes ne sont pas propres
- [ ] `game/m_*.c` avant `g_monster.c`
- [ ] le sous-systeme audio bas niveau tant qu'on n'est pas pret a le traiter comme un tout

## 5. Sequence pratique immediate

Sequence recommande pour la suite proche :

1. [ ] `client/cl_fx.c`
2. [ ] `client/cl_tent.c`
3. [ ] `game/p_view.c`
4. [ ] `game/p_weapon.c`
5. [ ] `game/g_weapon.c`
6. [ ] `game/g_trigger.c`
7. [ ] `game/g_target.c`
8. [ ] `game/g_func.c`

## 6. Livrables attendus

Chaque bloc porte devra idealement produire :

- le ou les fichiers TS portes ;
- les commentaires de fichier / fonctions conformes au `README.md` ;
- la mise a jour de `PORTAGE_QUAKE2.md` ;
- la mise a jour de `PLAN_QUAKE2JS.md` si le bloc fait bouger le plan principal ;
- un harnais ou une verification ciblee si le bloc est critique.

## 7. Regle de mise a jour

Ce plan devra etre mis a jour au fur et a mesure :

- avec `✅` pour les blocs realises ;
- avec `🟠` pour les blocs entames mais incomplets ;
- avec les ajustements d'ordre si une dependance non prevue apparait.
