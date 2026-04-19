# PLAN_HUD_QUAKE2.md

# Quake2JS - Plan de portage HUD

## 1. Objectif

Porter le HUD Quake II original de maniere fidele afin d'afficher :

- la status bar principale ;
- les overlays `layout` ;
- l'inventaire ;
- les center prints ;
- les overlays `pause`, `loading`, `net` ;
- puis, a terme, le crosshair et les ecrans 2D associes.

Le but est de reproduire la logique d'origine avant toute stylisation web.

## 2. Sources originales a porter

- [cl_scrn.c](/C:/a/Projets/Quake-2/Quake-2-master/client/cl_scrn.c)
- [cl_inv.c](/C:/a/Projets/Quake-2/Quake-2-master/client/cl_inv.c)
- [client.h](/C:/a/Projets/Quake-2/Quake-2-master/client/client.h)
- [screen.h](/C:/a/Projets/Quake-2/Quake-2-master/client/screen.h)
- [console.c](/C:/a/Projets/Quake-2/Quake-2-master/client/console.c) pour les primitives texte associees
- [cl_view.c](/C:/a/Projets/Quake-2/Quake-2-master/client/cl_view.c) pour les elements 2D comme le crosshair

## 3. Principe de portage

Ne pas porter le HUD comme une UI HTML/DOM metier.

Porter d'abord la logique Quake II telle quelle :

1. lecture des `stats` et `configstrings` ;
2. interpretation du mini langage de layout Quake II ;
3. production d'une liste deterministe d'operations de draw 2D ;
4. rendu de cette liste via un backend web.

## 4. Architecture cible recommandee

### 4.1 Runtime HUD

Dans `packages/client/src/screen.ts` :

- porter la logique issue de `cl_scrn.c` et `cl_inv.c` ;
- construire un snapshot HUD riche ;
- produire une liste de draw commands 2D independantes du backend.

Types cibles a introduire ou completer :

- `ClientScreenHudState`
- `ClientHudLayoutContext`
- `ClientHudDrawCommand`
- `ClientHudPictureCommand`
- `ClientHudTextCommand`
- `ClientHudNumberCommand`
- `ClientHudFillCommand`

### 4.2 Backend de rendu HUD

Ne pas considerer le DOM comme cible finale.

La cible recommandee est un rendu 2D via Three.js, par-dessus la scene 3D :

- scene HUD dediee ;
- camera orthographique dediee ;
- sprites / quads pour les images ;
- glyphes / atlas pour le texte ;
- ordre de draw stable ;
- pixels alignes pour garder un rendu Quake II lisible.

Le DOM peut rester un outil temporaire de debug, mais pas la voie principale du HUD final.

### 4.3 Separation claire

Le pipeline doit etre :

- `client` -> produit des draw commands HUD ;
- `renderer-common` -> decrit les contrats de draw 2D ;
- `renderer-three` -> execute les draw commands avec Three.js ;
- `apps/web` -> orchestre et ne contient pas la logique HUD Quake II.

## 5. Pourquoi Three.js plutot que DOM

Avantages du HUD dans Three.js :

- meme pipeline de rendu que le moteur ;
- rendu stable en `WebGPU` et `WebGL` ;
- meilleure maitrise de l'ordre de composition ;
- plus simple pour mixer HUD, crosshair, overlays et eventuels effets 2D ;
- plus fidele a un pipeline de draw immediat type Quake II.

Le DOM reste acceptable uniquement pour :

- debug temporaire ;
- inspection rapide des donnees ;
- fallback de developpement si necessaire.

## 6. Phases de portage

### Phase A - Completer le snapshot HUD

- ✅ porter totalement `SCR_CenterPrint`, `SCR_CheckDrawCenterString`, `SCR_DrawLoading`, `SCR_DrawPause`, `SCR_DrawNet` sous forme de donnees ;
- ✅ exposer explicitement les drapeaux et etats necessaires au HUD ;
- ✅ conserver `STAT_LAYOUTS`, `cl.layout`, `CS_STATUSBAR`, `inventory`, `selected item`.

Sortie attendue :

- ✅ un `ClientScreenHudState` complet, sans draw direct.

### Phase B - Porter les primitives 2D d'origine

Fonctions a porter en priorite :

- ✅ `SizeHUDString`
- ✅ `DrawHUDString`
- ✅ `SCR_DrawField`
- ✅ `SCR_TouchPics`
- ✅ `Inv_DrawString`
- ✅ `SetStringHighBit`

Objectif :

- reproduire le comportement original des nombres, chaines et pictos ;
- conserver les conventions Quake II sur les chiffres `num_*`, `anum_*`, `field_3`, etc.

### Phase C - Porter l'interpreteur de layout

Fonction coeur :

- ✅ `SCR_ExecuteLayoutString`

Tokens a supporter en priorite :

- ✅ `xl`, `xr`, `xv`
- ✅ `yt`, `yb`, `yv`
- ✅ `pic`, `picn`
- ✅ `num`, `hnum`, `anum`, `rnum`
- ✅ `string`, `string2`, `cstring`, `cstring2`
- ✅ `stat_string`
- ✅ `if`, `endif`

Tokens secondaires a suivre ensuite :

- ✅ `client`
- ✅ `ctf`

Sortie attendue :

- une liste de draw commands ordonnee et testable.

### Phase D - Porter la composition HUD d'origine

Fonctions a porter ou completer :

- ✅ `SCR_DrawStats`
- ✅ `SCR_DrawLayout`
- ✅ `CL_DrawInventory`
- ✅ composition equivalente a `SCR_UpdateScreen`

Regles a reproduire :

- status bar toujours evaluee ;
- `layout` si `STAT_LAYOUTS & 1` ;
- inventaire si `STAT_LAYOUTS & 2` ;
- center print ensuite ;
- pause / loading / net au bon moment.

### Phase E - Introduire un backend HUD commun

Dans `packages/renderer-common` :

- ✅ definir les types de draw commands 2D ;
- ✅ definir les atlas / ressources 2D necessaires ;
- ✅ definir le contrat de resolution d'images HUD.

Objectif :

- rendre le HUD independant de Three.js tout en restant rendu-ready.

### Phase F - Construire le renderer HUD Three.js

Dans `packages/renderer-three` :

- ✅ scene HUD orthographique ;
- ✅ quads/sprites pour les images ;
- ✅ systeme de texte bitmap ou atlas de glyphes ;
- ✅ ordre de draw stable ;
- ✅ resize adapte a la fenetre ;
- ✅ support de la superposition avec la scene 3D.

Objectif :

- ✅ afficher le HUD sans DOM metier.

### Phase G - Brancher dans `apps/web`

- ✅ remplacer l'overlay texte DOM actuel par le backend HUD ;
- ✅ garder eventuellement un mini panneau debug separe ;
- ✅ brancher les draw commands HUD a chaque frame ;
- ✅ verifier `WebGPU` et fallback `WebGL`.

## 7. Ordre recommande de mise en oeuvre

1. finir les primitives HUD de `screen.ts`
2. porter `SCR_ExecuteLayoutString`
3. porter `CL_DrawInventory`
4. definir `ClientHudDrawCommand`
5. creer le contrat 2D dans `renderer-common`
6. implementer le renderer HUD dans `renderer-three`
7. remplacer le HUD DOM dans `apps/web`
8. ajouter le crosshair et les overlays restants

## 8. Livrables intermediaires

### Jalons moteur

- `SCR_ExecuteLayoutString` porte et teste sur des layouts reels ;
- `SCR_DrawStats` genere des draw commands correctes ;
- `CL_DrawInventory` genere des draw commands correctes ;
- support des center prints, loading, pause et net.

### Jalons rendu

- un atlas HUD charge depuis les assets Quake II ;
- un renderer 2D Three.js stable ;
- le HUD principal visible sans DOM ;
- l'inventaire visible via `STAT_LAYOUTS & 2`.

## 9. Risques et points d'attention

- le mini langage de layout Quake II est le vrai coeur du HUD ;
- il faut conserver le placement pixel-perfect ;
- il ne faut pas melanger logique HUD et code application web ;
- les noms d'images HUD doivent etre resolus via `CS_IMAGES` et les ressources Quake II reelles ;
- le texte alterne / high bit doit etre traite fidelement ;
- `SCR_UpdateScreen` impose un ordre de composition qu'il faudra respecter.

## 10. Decision technique retenue

Decision recommandee :

- logique HUD dans `packages/client` ;
- draw commands 2D dans `renderer-common` ;
- rendu HUD final dans `renderer-three` ;
- DOM reserve au debug uniquement.

## 11. Premier sous-ensemble a porter maintenant

Le meilleur prochain bloc de travail est :

1. porter `SCR_ExecuteLayoutString` vers des draw commands 2D ;
2. porter `SCR_DrawField` et `DrawHUDString` ;
3. porter `CL_DrawInventory` dans le meme modele ;
4. seulement ensuite remplacer le HUD texte DOM dans `apps/web`.
