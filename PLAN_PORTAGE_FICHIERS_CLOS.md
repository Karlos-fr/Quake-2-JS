# Plan de portage par fichiers clos

Objectif: definir un ordre de portage fichier par fichier qui maximise les fermetures nettes, limite les allers-retours entre modules et s'appuie sur l'etat de `PORTAGE_QUAKE2.md` croise avec `c-dependency-tools/data/c-dependency-graph.json`.

## Methode retenue

- Prioriser d'abord les fichiers a frontiere etroite ou deja bien encadres par des headers portes.
- Eviter de commencer par les gros hubs tant que leurs satellites ne sont pas fermes.
- Utiliser les dependances file-to-file visibles dans le graphe quand elles sont exploitables.
- Respecter les noyaux fonctionnels deja visibles dans le port:
  - client: `cl_main.c` et `cl_parse.c` sont des hubs, donc ils viennent tard.
  - renderer GL: `gl_rmain.c` et `gl_rsurf.c` viennent tard car ils se croisent avec `gl_image.c`, `gl_light.c` et `gl_warp.c`.
  - gameplay: fermer d'abord les fichiers de socle monde/items/combat/armes/monstres communs, puis enchainer les monstres individuels.

## Signaux forts issus du croisement

- `client/cl_main.c` depend explicitement de `cl_cin.c`, `cl_fx.c`, `cl_input.c`, `cl_parse.c`, `cl_scrn.c`, `cl_tent.c`, `cl_view.c`, `menu.c`, `snd_dma.c`.
- `client/cl_parse.c` depend explicitement de `cl_ents.c`, `cl_fx.c`, `cl_inv.c`, `cl_tent.c`, `cl_scrn.c`, `snd_dma.c`.
- `client/cl_tent.c` depend explicitement de `cl_fx.c`, `cl_newfx.c`, `cl_view.c`.
- `ref_gl/gl_rmain.c` depend explicitement de `gl_image.c`, `gl_light.c`, `gl_rsurf.c`.
- `ref_gl/gl_rsurf.c` depend explicitement de `gl_image.c`, `gl_light.c`, `gl_warp.c` et se recroise avec `gl_rmain.c`.
- Cote gameplay, `PORTAGE_QUAKE2.md` montre que `g_items.c`, `g_misc.c`, `g_weapon.c`, `g_combat.c`, `g_spawn.c`, `g_monster.c`, `p_weapon.c` restent les blocs ouverts les plus structurants avant fermeture des monstres individuels.

## Ordre recommande

## Phase 3 - Renderer GL en mode fichier clos

1.  ✅`ref_gl/gl_rsurf.c`
    Raison: gros bloc monde/surfaces qui doit arriver apres `gl_image.c`, `gl_light.c`, `gl_warp.c`.

2.  ⚠️`ref_gl/gl_rmain.c`
    Raison: hub renderer final; le graphe le montre dependant de `gl_image.c`, `gl_light.c`, `gl_rsurf.c`.

3.  ⚠️`ref_gl/gl_mesh.c`
    Raison: a fermer apres `gl_rmain.c` si l'objectif est de terminer proprement le pan alias-model restant autour du renderer deja tres avance.

## Phase 5 - Monstres individuels a porter un par un

Ordre recommande: partir des plus simples ou plus frequents, tout en gardant les boss les plus tard.

33. `game/m_insane.c`
34. `game/m_actor.c`
35. `game/m_flipper.c`
36. `game/m_hover.c`
37. `game/m_berserk.c`
38. `game/m_float.c`
39. `game/m_gladiator.c`
40. `game/m_infantry.c`
41. `game/m_gunner.c`
42. `game/m_flyer.c`
43. `game/m_brain.c`
44. `game/m_parasite.c`
45. `game/m_chick.c`
46. `game/m_mutant.c`
47. `game/m_medic.c`
48. `game/m_supertank.c`
49. `game/m_tank.c`
50. `game/m_boss2.c`
51. `game/m_boss31.c`
52. `game/m_boss32.c`
53. `game/m_soldier.c`

Notes:

- `m_soldier.c` est volontairement place tard: important en gameplay, mais plus gros et plus polymorphe que beaucoup d'autres monstres.
- Les boss sont places apres fermeture du socle combat/armes/monstres pour eviter des retours de structure.

## Fichiers a ne pas melanger trop tot

- `client/cl_main.c`
- `client/cl_parse.c`
- `ref_gl/gl_rmain.c`
- `ref_gl/gl_rsurf.c`
- `game/g_combat.c`
- `game/g_weapon.c`
- `game/p_weapon.c`
- `game/g_monster.c`

Ce sont les fichiers ou l'on paie le plus cher les demi-portages. Il vaut mieux y entrer tard, avec les satellites deja fermes.

## Strategie de travail recommandee

- Toujours choisir un seul fichier source C comme unite de fermeture.
- Avant de passer au suivant:
  - verifier que les fonctions du fichier sont toutes presentes ou explicitement hors perimetre;
  - retirer les hooks temporaires inutiles quand ils ne servent plus qu'a simuler ce fichier;
  - ajouter ou etendre un script de verification cible pour ce fichier;
  - mettre a jour `PORTAGE_QUAKE2.md` en `✅` uniquement quand le fichier est vraiment clos.

## Premiere tranche de travail concrete

Si l'objectif est de commencer tout de suite avec le meilleur ratio gain/risque, l'ordre de demarrage recommande est:

1. `client/cl_cin.c`
2. `client/cl_inv.c`
3. `client/snd_mem.c`
4. `client/snd_mix.c`
5. `client/snd_dma.c`
6. `client/keys.c`
7. `client/qmenu.c`
8. `client/menu.c`
9. `client/console.c`
10. `client/cl_input.c`

Cette tranche ferme des blocs satellites, reduit les dettes autour du hub client, et prepare un terrain beaucoup plus propre pour `cl_tent.c`, `cl_parse.c` et `cl_main.c`.
