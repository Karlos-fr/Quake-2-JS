# Audit Portage Quake II - ref_gl/gl_light.c

Date : 2026-04-25

## Verdict

Statut : OK ISO branche
Risque principal : le chemin flashblend reste une adaptation par hooks, acceptable pour le renderer web mais a maintenir comme sortie renderer et non comme logique parallele.

## Source verifiee

- Source C/H : `Quake-2-master/ref_gl/gl_light.c`, avec dependances `gl_local.h` et `gl_model.h`
- Port TS : `packages/renderer-three/src/gl-light.ts`
- Consommateurs : `packages/renderer-three/src/gl-rsurf.ts`, `packages/renderer-three/src/gl-rmain.ts`, `packages/renderer-three/src/gl-world-scene-adapter.ts`, `packages/renderer-three/src/index.ts`, `scripts/verify/quake2-gl-light.ts`

## Fiche d'identification

- Fichier audite : `ref_gl/gl_light.c`
- Source C/H principale : `Quake-2-master/ref_gl/gl_light.c`
- Sources C/H secondaires : `Quake-2-master/ref_gl/gl_local.h`, `Quake-2-master/ref_gl/gl_model.h`
- Package : `packages/renderer-three`
- Type de fichier : port renderer GL original
- Statut dans `PORTAGE_QUAKE2.md` : `A porter` = `✅`, `Porte` = `✅`
- Statut `Valide` dans `PORTAGE_QUAKE2.md` : vide avant audit, a passer en `✅`
- Niveau de fidelite annonce : Strict pour lightmaps et marquage BSP, Close pour rendu flashblend hooke
- Role attendu : dynamic lights, point sampling et construction lightmap BSP
- Consommateurs directs : `gl-rsurf.ts`, `gl-rmain.ts`, `gl-world-scene-adapter.ts`
- Consommateurs finaux : renderer Three/WebGL via le pipeline renderer-three ; web indirectement
- Tests existants : `scripts/verify/quake2-gl-light.ts`
- Conclusion audit : OK ISO branche

## Mapping C -> TS

| Source | Type | Fichier TS | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
| `DLIGHT_CUTOFF` | constante | `gl-light.ts` | `DLIGHT_CUTOFF` | Valide | `64` |
| `r_dlightframecount` | global | `gl-light.ts` | `GlLightRuntime.r_dlightframecount` | Valide | runtime explicite |
| `pointcolor` | global | `gl-light.ts` | `GlLightRuntime.pointcolor` | Valide | runtime explicite |
| `lightplane` | global | `gl-light.ts` | `GlLightRuntime.lightplane` | Valide | runtime explicite |
| `lightspot` | global | `gl-light.ts` | `GlLightRuntime.lightspot` | Valide | runtime explicite |
| `s_blocklights` | static | `gl-light.ts` | `GlLightRuntime.s_blocklights` | Valide | buffer type |
| `R_RenderDlight` | fonction | `gl-light.ts` | `R_RenderDlight` | Valide Close | geometrie conservee, GL hooke |
| `R_RenderDlights` | fonction | `gl-light.ts` | `R_RenderDlights` | Valide Close | sequence remplacee par begin/end hooks |
| `R_MarkLights` | fonction | `gl-light.ts` | `R_MarkLights` | Valide Strict | marquage surfaces |
| `R_PushDlights` | fonction | `gl-light.ts` | `R_PushDlights` | Valide Strict | appel amont branche |
| `RecursiveLightPoint` | fonction | `gl-light.ts` | `RecursiveLightPoint` | Valide Strict | sampling lightmaps |
| `R_LightPoint` | fonction | `gl-light.ts` | `R_LightPoint` | Valide Strict | dynamicSource conforme quand current entity liee |
| `R_AddDynamicLights` | fonction | `gl-light.ts` | `R_AddDynamicLights` | Valide Strict | calcul et troncature couverts |
| `R_SetCacheState` | fonction | `gl-light.ts` | `R_SetCacheState` | Valide Strict | cache styles |
| `R_BuildLightMap` | fonction | `gl-light.ts` | `R_BuildLightMap` | Valide Strict | modes mono et clamp couverts |
| appels `gl_rsurf.c` | integration | `gl-light.ts` / `gl-rsurf.ts` | `createGlLightRsurfHooks` | Valide | `setCacheState`, `buildLightMap`, `markBrushModelLights` |
| appels `gl_rmain.c` | integration | `gl-light.ts` / `gl-rmain.ts` | `createGlLightRmainHooks` | Valide | `pushDlights`, `renderDlights`, `lightPoint` |

## Checklist README

### Fidelite de portage

- [x] Le fichier garde le code C original comme source de verite.
- [x] Les comportements critiques sont portes avant toute modernisation.
- [x] L'ordre logique des appels correspond au source.
- [x] Les branches speciales du source sont conservees.
- [x] Les valeurs numeriques, flags, bitmasks et constantes sont identiques.
- [x] Les conversions numeriques sont explicites.
- [x] Les structures de donnees restent proches du source quand la fidelite compte.
- [x] Les globals C sont remplaces par un runtime/contexte clair.
- [x] Les ecarts volontaires sont documentes.

### Nommage, decoupage, rattachement

- [x] Le nom du fichier preserve la tracabilite avec la source.
- [x] Les fonctions portees conservent le style original.
- [x] Les fonctions nouvelles utilisent `camelCase`.
- [x] Les types/interfaces modernes utilisent `PascalCase`.
- [x] Les constantes source conservent leurs noms et valeurs.
- [x] Le fichier TS a une source C/H principale claire.
- [x] Le rattachement est coherent avec `PORTAGE_QUAKE2.md`.
- [x] Le fichier principal de rattachement est identifiable.
- [x] Le decoupage ne masque pas la lecture du comportement original.
- [x] Le fichier ne devient pas un fourre-tout.
- [x] Les helpers nouveaux restent locaux et subordonnes au portage.

### Commentaires et documentation

- [x] Le fichier a un header de module conforme.
- [x] Le header indique `File`, `Source`, `Purpose`, `Porting policy`, `Deviations`, `Notes`.
- [x] Les fonctions portees ont un header conforme.
- [x] Les fonctions nouvelles ont un header conforme.
- [x] Les deviations importantes sont documentees pres du code concerne.

### Separation runtime / adapter

- [x] Le fichier ne melange pas logique moteur, rendu et UI.
- [x] Un module `Strict` ou `Close` ne depend pas d'un module `Adapter`.
- [x] `packages/platform` ne porte pas le comportement principal audite.
- [x] `apps/web` ne porte pas le comportement principal audite.
- [x] Les hooks remplacent seulement les appels renderer/audio/OS.

## Checklist ISO source

### Comparaison structurelle

- [x] Les fonctions sources correspondantes ont ete lues.
- [x] Les headers `.h` associes ont ete verifies.
- [x] Les constantes utilisees viennent du bon header/source.
- [x] Les structs source ont une representation TS equivalente.
- [x] Les enums et flags conservent leurs valeurs.
- [x] Les variables globales source ont un equivalent runtime clair.
- [x] Les macros utiles sont portees ou documentees.
- [x] Les chemins `#ifdef`, extensions ou variantes sont traites ou documentes.

### Comparaison comportementale

- [x] Les entrees correspondent au source.
- [x] Les sorties correspondent au source.
- [x] Les mutations d'etat correspondent au source.
- [x] Les retours anticipes sont conserves.
- [x] Les boucles et leur ordre sont conserves.
- [x] Les timings sont fideles.
- [x] Les randomisations conservent l'intention source.
- [x] Les listes/pools sont manipules comme dans le source.

### Effets secondaires

- [x] Entites creees/liberees/linkees.
- [x] `think`, `touch`, `use`, `nextthink` mis a jour.
- [x] Etats runtime synchronises.
- [x] Configstrings mises a jour.
- [x] Temp entities mises a jour.
- [x] Sons emis avec les bons parametres.
- [x] Sorties renderer/audio correctement alimentees si applicable.

Notes : les items entites/configstrings/temp entities/audio sont non applicables fonctionnellement a `gl_light.c`; ils sont valides comme sans effet attendu.

## Audit item par item

### `DLIGHT_CUTOFF` / globals

- [x] `DLIGHT_CUTOFF` vaut `64` comme le C.
- [x] `r_dlightframecount`, `pointcolor`, `lightplane`, `lightspot` et `s_blocklights` ont un equivalent unique dans `GlLightRuntime`.
- [x] `s_blocklights` conserve la capacite source `34*34*3`; le type `Float32Array` est une adaptation documentee.

### `R_RenderDlight`

- [x] Rayon `intensity * 0.35` conserve.
- [x] Centre calcule par `origin - vpn * rad`.
- [x] Anneau de 17 points, boucle `16` vers `0`, angle `i/16 * M_PI*2`.
- [x] Couleur et soumission GL remplacees par hook renderer, sans recalcul dans un adapter.

### `R_RenderDlights`

- [x] Retour anticipe si `gl_flashblend` faux.
- [x] `r_dlightframecount = r_framecount + 1`.
- [x] Parcours `r_newrefdef.dlights[0..num_dlights)`.
- [x] Etat GL direct remplace par hooks begin/end.

### `R_MarkLights`

- [x] Retour sur leaf/non-node conserve.
- [x] Distance plan `DotProduct(origin, normal) - dist` conservee.
- [x] Pruning `intensity - DLIGHT_CUTOFF` conserve.
- [x] Reset `dlightbits` quand `dlightframe` change conserve.
- [x] Recursion enfants front/back conservee.

### `R_PushDlights`

- [x] Retour anticipe si `gl_flashblend`.
- [x] `r_dlightframecount = r_framecount + 1`.
- [x] Bit par dlight `1 << index`.
- [x] Branche vers `R_MarkLights` sur root worldmodel.

### `RecursiveLightPoint`

- [x] Leaf retourne `-1`.
- [x] Split front/back/side conserve.
- [x] Interpolation `mid` conservee.
- [x] Recherche front-side puis surfaces puis back-side conservee.
- [x] Surfaces `SURF_DRAWTURB|SURF_DRAWSKY` ignorees.
- [x] Calcul `s/t`, `ds/dt`, shift `>> 4` et offset lightmap conserves.
- [x] Accumulation par styles et `gl_modulate` conservee.
- [x] `lightspot`, `lightplane`, `pointcolor` mutent le runtime comme les globals C.

### `R_LightPoint`

- [x] Fallback no `lightdata` vers `[1,1,1]`.
- [x] Trace verticale `p.z - 2048`.
- [x] Resultat `-1` vers noir, sinon `pointcolor`.
- [x] Dynamic lights ajoutees avec distance depuis `currententity.origin`, comme le C.
- [x] `VectorScale(color, gl_modulate)` final conserve.
- [x] Deviation defensive : si `currententity` n'est pas liee, le TS utilise `p`; le chemin runtime attendu lie l'entite avant usage.

### `R_AddDynamicLights`

- [x] Filtre `surf.dlightbits & (1 << lnum)`.
- [x] Projection sur plan, `frad -= fabs(fdist)`.
- [x] Cutoff `DLIGHT_CUTOFF` conserve.
- [x] Axes texture et `texturemins` conserves.
- [x] Distance approx `sd + (td >> 1)` / `td + (sd >> 1)` conservee.
- [x] Accumulation RGB dans `s_blocklights` conservee.
- [x] Troncature int couverte par test dedie.

### `R_SetCacheState`

- [x] Boucle `MAXLIGHTMAPS` jusqu'a `255`.
- [x] Copie `lightstyles[style].white` dans `cached_light`.

### `R_BuildLightMap`

- [x] Erreur sur surfaces non lightmap conservee.
- [x] Calcul `smax`, `tmax`, `size` conserve.
- [x] Garde taille `s_blocklights` conservee.
- [x] Branche no samples en fullbright `255`.
- [x] Optimisation un seul style vs multi-styles conservee.
- [x] Scales `gl_modulate * lightstyle.rgb` conserves.
- [x] Ajout dlights si `surf.dlightframe == r_framecount` conserve.
- [x] Conversion float vers int, clamp negatif, max RGB, alpha et rescale `>255` conserves.
- [x] Modes `gl_monolightmap` `0`, `L`, `I`, `C`, `A/default` conserves.
- [x] Stride et ecriture RGBA consommes par `gl-rsurf`.

## Branchement

### Amont / aval

- [x] Le fichier est appele depuis le bon systeme amont.
- [x] Les appels remplacent bien le point d'appel source original.
- [x] Les resultats sont consommes par le module attendu.
- [x] Les donnees ne restent pas dans une structure intermediaire non lue.
- [x] Les comportements source ne sont pas dupliques dans plusieurs chemins divergents.

Notes : `gl-rsurf.ts` consomme `setCacheState`, `buildLightMap` et `markBrushModelLights`; `gl-rmain.ts` consomme `pushDlights`, `renderDlights` et `lightPoint`; `gl-world-scene-adapter.ts` instancie et synchronise le runtime de lumiere pour le rendu monde.

### Renderer et web

- [x] Si applicable, les sorties sont raccordees a `packages/renderer-common`.
- [x] Si applicable, les sorties sont raccordees a `packages/renderer-three`.
- [x] Si applicable, les synchronisations web consomment bien les sorties runtime/client.
- [x] L'effet est visible/consomme et pas seulement present en memoire.

Notes : raccord direct a `packages/renderer-three`; pas de port principal dans `apps/web`.

### Audio

- [x] Si applicable, le son source est enregistre.
- [x] Si applicable, l'evenement audio est emis et consomme correctement.

Notes : non applicable a `gl_light.c`.

## Tests

- [x] Les tests existants couvrent les fonctions principales.
- [x] Les tests couvrent les effets secondaires.
- [x] Les tests couvrent le branchement jusqu'au consommateur final.
- [x] Les tests ne figent pas un comportement non ISO.
- [x] Les tests sont dans `scripts/verify` ou `packages/tests-golden`.
- [x] Tests a ajouter identifies.

Tests existants verifies : `scripts/verify/quake2-gl-light.ts` couvre cutoff, cache state, push/mark, point light, build lightmap, monolightmap, flashblend hooks, skip flashblend, fallback no lightdata, bridge rmain et marquage brush model.

Tests a ajouter plus tard : un test d'integration visuel/map reel peut completer le harnais synthetique, mais il n'est pas bloquant pour cet audit fichier.

## Findings

1. [Info] `R_LightPoint` ajoute un fallback defensif absent du C quand `currententity` n'est pas liee.
   - Fichier/ligne : `packages/renderer-three/src/gl-light.ts:399`
   - Source originale : `gl_light.c:329` utilise directement `currententity->origin`.
   - Impact : pas d'impact sur le chemin runtime branche si `currententity` est renseignee ; fallback utile pour hooks/tests.
   - Correction recommandee : aucune correction bloquante ; conserver comme deviation mineure defensive ou documenter plus explicitement si le runtime evolue.

2. [Info] Le rendu flashblend GL immediate-mode est hooke.
   - Fichier/ligne : `packages/renderer-three/src/gl-light.ts:106`, `gl-light.ts:136`
   - Source originale : `gl_light.c:51` et suivants, appels `qglBegin`, `qglColor3f`, `qglVertex3fv`, `qglEnd`.
   - Impact : adaptation normale renderer web ; la geometrie source reste produite par le port principal.
   - Correction recommandee : aucune.

## Decision

- Corriger maintenant : non
- Reporter : test d'integration visuel sur BSP reel si besoin de couverture renderer end-to-end plus forte
- Documenter : audit et inventaire crees ; README audit clarifie pour creation immediate des fichiers

## Mise a jour du suivi

- Ligne `PORTAGE_QUAKE2.md` mise a jour : `ref_gl\gl_light.c`
- Nouveau statut `Valide` : `✅`
- Fichier d'audit cree dans `Audit/` : `Audit/ref_gl-gl_light.audit.md`
