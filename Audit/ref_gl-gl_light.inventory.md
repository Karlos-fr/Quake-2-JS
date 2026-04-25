# Inventaire Portage Quake II - ref_gl/gl_light.c

Date : 2026-04-25

## Identification

- Source C/H principale : `Quake-2-master/ref_gl/gl_light.c`
- Sources C/H secondaires : `Quake-2-master/ref_gl/gl_local.h`, `Quake-2-master/ref_gl/gl_model.h`
- Package cible principal : `packages/renderer-three`
- Fichier TS principal pressenti : `packages/renderer-three/src/gl-light.ts`
- Fichiers TS secondaires pressentis : `packages/renderer-three/src/gl-rsurf.ts`, `packages/renderer-three/src/gl-rmain.ts`, `packages/renderer-three/src/gl-world-scene-adapter.ts`, `packages/renderer-three/src/index.ts`
- Domaine : renderer GL original, dynamic lights, point lighting, lightmaps BSP
- Niveau de fidelite attendu : Strict pour les calculs CPU/lightmaps, Close pour le rendu flashblend immediate-mode
- Statut actuel dans `PORTAGE_QUAKE2.md` : `A porter` = `✅`, `Porte` = `✅`
- Statut `Valide` actuel dans `PORTAGE_QUAKE2.md` : vide avant audit

## Regles de rattachement

- Regle cible attendue : `1 fichier C = 1 fichier TS`
- Exception de decoupage documentee : aucune pour le port principal ; hooks de consommation exposes vers `gl-rsurf` et `gl-rmain`
- Justification si `1 fichier C != 1 fichier TS` : le comportement source reste dans `gl-light.ts`; les autres fichiers consomment seulement des hooks ou exports.

## Inventaire source

### Fonctions

- [x] Nom : `R_RenderDlight`
  - Source : `gl_light.c:36`
  - Role : construit le triangle fan GL d'une dynamic light flashblend.
  - Cible TS pressentie : `gl-light.ts:106`
  - Statut : porte Close
  - Notes : immediate-mode GL remplace par hook `renderDlight`; geometrie centre/ring preservee.

- [x] Nom : `R_RenderDlights`
  - Source : `gl_light.c:77`
  - Role : active l'etat GL additif et rend toutes les dlights si `gl_flashblend`.
  - Cible TS pressentie : `gl-light.ts:136`
  - Statut : porte Close
  - Notes : etat GL direct remplace par hooks `beginFlashblendDlights` / `endFlashblendDlights`.

- [x] Nom : `R_MarkLights`
  - Source : `gl_light.c:118`
  - Role : traverse le BSP et marque les surfaces touchees par une dlight.
  - Cible TS pressentie : `gl-light.ts:162`
  - Statut : porte Strict
  - Notes : conserve cutoff, recursion, reset `dlightbits` et `dlightframe`.

- [x] Nom : `R_PushDlights`
  - Source : `gl_light.c:164`
  - Role : marque les dynamic lights dans le monde quand `gl_flashblend` est desactive.
  - Cible TS pressentie : `gl-light.ts:213`
  - Statut : porte Strict
  - Notes : branche vers `R_MarkLights`; root `worldmodel.nodes[0]`.

- [x] Nom : `RecursiveLightPoint`
  - Source : `gl_light.c:192`
  - Role : trace BSP vertical et echantillonne les lightmaps statiques au point touche.
  - Cible TS pressentie : `gl-light.ts:272`
  - Statut : porte Strict
  - Notes : conserve recursion, styles, `pointcolor`, `lightspot`, `lightplane`.

- [x] Nom : `R_LightPoint`
  - Source : `gl_light.c:298`
  - Role : calcule l'eclairage statique + dynamique pour une origine d'entite.
  - Cible TS pressentie : `gl-light.ts:377`
  - Statut : porte Strict avec adaptation defensive
  - Notes : utilise `currententity.origin` comme le C quand disponible ; fallback TS sur `p` si aucun current entity n'est lie.

- [x] Nom : `R_AddDynamicLights`
  - Source : `gl_light.c:359`
  - Role : ajoute les dlights marquees dans `s_blocklights` pour une surface.
  - Cible TS pressentie : `gl-light.ts:431`
  - Statut : porte Strict
  - Notes : conserve cutoff, projection plane, distance Manhattan approx, troncature int via `Math.trunc`.

- [x] Nom : `R_SetCacheState`
  - Source : `gl_light.c:437`
  - Role : copie les `lightstyles[].white` dans `surf.cached_light`.
  - Cible TS pressentie : `gl-light.ts:505`
  - Statut : porte Strict
  - Notes : conserve boucle `MAXLIGHTMAPS` jusqu'au style `255`.

- [x] Nom : `R_BuildLightMap`
  - Source : `gl_light.c:455`
  - Role : combine lightmaps statiques, dlights et modes `gl_monolightmap` en RGBA.
  - Cible TS pressentie : `gl-light.ts:526`
  - Statut : porte Strict
  - Notes : conserve fullbright no samples, multi-styles, clamp/rescale et modes `0`, `A`, `C`, `L`, `I`.

### Structures / types

- [x] Nom : `dlight_t`
  - Source : `gl_local.h` via renderer refdef
  - Role : origine, couleur, intensite des dynamic lights.
  - Representation TS pressentie : `packages/client/src/ref.ts`
  - Statut : consomme
  - Notes : type importe par `gl-light.ts`.

- [x] Nom : `mnode_t` / `mnode_child_t`
  - Source : `gl_model.h`
  - Role : noeuds BSP traverses par `R_MarkLights` et `RecursiveLightPoint`.
  - Representation TS pressentie : `packages/renderer-three/src/gl-model.ts`
  - Statut : consomme
  - Notes : garde `contents == -1` comme test de noeud.

- [x] Nom : `msurface_t`
  - Source : `gl_model.h`
  - Role : surfaces BSP marquees, lightmaps et cache de styles.
  - Representation TS pressentie : `packages/renderer-three/src/gl-model.ts`
  - Statut : consomme
  - Notes : champs `dlightbits`, `dlightframe`, `samples`, `styles`, `cached_light`.

- [x] Nom : `mtexinfo_t`
  - Source : `gl_model.h`
  - Role : axes texture pour projection lightmap.
  - Representation TS pressentie : `packages/renderer-three/src/gl-model.ts`
  - Statut : consomme
  - Notes : `vecs[0/1][3]` conserve.

- [x] Nom : `lightstyle_t`
  - Source : `gl_local.h` / refdef
  - Role : RGB/white des styles d'eclairage.
  - Representation TS pressentie : `packages/client/src/ref.ts`
  - Statut : consomme
  - Notes : utilise par `RecursiveLightPoint`, `R_SetCacheState`, `R_BuildLightMap`.

- [x] Nom : `GlLightRuntime`
  - Source : globals et statics de `gl_light.c`
  - Role : remplace explicitement `r_dlightframecount`, `pointcolor`, `lightspot`, `s_blocklights`, cvars et refdef.
  - Representation TS pressentie : `gl-light.ts:48`
  - Statut : nouveau contexte conforme README
  - Notes : adaptation autorisee pour globals C.

### Enums / constantes / flags / macros utiles

- [x] Nom : `DLIGHT_CUTOFF`
  - Source : `gl_light.c:26`
  - Valeur / role : `64`, seuil minimum des dlights.
  - Cible TS pressentie : `gl-light.ts:38`
  - Statut : porte
  - Notes : valeur identique.

- [x] Nom : `MAXLIGHTMAPS`
  - Source : headers renderer/formats
  - Valeur / role : nombre maximal de styles lightmap par surface.
  - Cible TS pressentie : import `packages/formats/src/index.js`
  - Statut : consomme
  - Notes : boucles source conservees.

- [x] Nom : `SURF_DRAWTURB`, `SURF_DRAWSKY`
  - Source : `gl_model.h`
  - Valeur / role : surfaces sans lightmap pour point sampling.
  - Cible TS pressentie : `gl-model.ts`
  - Statut : consomme
  - Notes : filtre `RecursiveLightPoint`.

- [x] Nom : `SURF_SKY`, `SURF_TRANS33`, `SURF_TRANS66`, `SURF_WARP`
  - Source : headers surface flags
  - Valeur / role : surfaces invalides pour `R_BuildLightMap`.
  - Cible TS pressentie : `packages/formats/src/index.js`
  - Statut : consomme
  - Notes : erreur conservee.

- [x] Nom : `s_blocklights[34*34*3]`
  - Source : `gl_light.c:353`
  - Valeur / role : buffer temporaire float pour lightmap.
  - Cible TS pressentie : `GlLightRuntime.s_blocklights`
  - Statut : porte
  - Notes : `Float32Array`, taille et garde `size > (bytes >> 4)` conservees via constante.

## Mapping source -> cible

| Item source | Type | Fichier TS principal | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
| `DLIGHT_CUTOFF` | constante | `gl-light.ts` | `DLIGHT_CUTOFF` | OK | valeur `64` |
| `r_dlightframecount` | global | `gl-light.ts` | `GlLightRuntime.r_dlightframecount` | OK | runtime explicite |
| `pointcolor` | global | `gl-light.ts` | `GlLightRuntime.pointcolor` | OK | runtime explicite |
| `lightplane` | global | `gl-light.ts` | `GlLightRuntime.lightplane` | OK | runtime explicite |
| `lightspot` | global | `gl-light.ts` | `GlLightRuntime.lightspot` | OK | runtime explicite |
| `s_blocklights` | static | `gl-light.ts` | `GlLightRuntime.s_blocklights` | OK | `Float32Array` |
| `R_RenderDlight` | fonction | `gl-light.ts` | `R_RenderDlight` | OK Close | hook GL |
| `R_RenderDlights` | fonction | `gl-light.ts` | `R_RenderDlights` | OK Close | hooks GL |
| `R_MarkLights` | fonction | `gl-light.ts` | `R_MarkLights` | OK Strict | recursion BSP |
| `R_PushDlights` | fonction | `gl-light.ts` | `R_PushDlights` | OK Strict | branche `gl_flashblend` |
| `RecursiveLightPoint` | fonction | `gl-light.ts` | `RecursiveLightPoint` | OK Strict | point sampling |
| `R_LightPoint` | fonction | `gl-light.ts` | `R_LightPoint` | OK Strict | fallback defensif documente dans audit |
| `R_AddDynamicLights` | fonction | `gl-light.ts` | `R_AddDynamicLights` | OK Strict | troncature testee |
| `R_SetCacheState` | fonction | `gl-light.ts` | `R_SetCacheState` | OK Strict | cache styles |
| `R_BuildLightMap` | fonction | `gl-light.ts` | `R_BuildLightMap` | OK Strict | modes mono inclus |

## Points d'attention

- [x] Nommage de fichier coherent avec la source
- [x] Fichier principal de rattachement identifiable
- [x] Decoupage coherent
- [x] Risque de dispersion a verifier
- [x] Helpers nouveaux a surveiller
- [x] Dependances adapter a surveiller

## Consommateurs a verifier plus tard

- Runtime : `GlLightRuntime`, `createGlLightRsurfHooks`, `createGlLightRmainHooks`
- Client : `refdef_t`, `dlight_t`, `entity_t` depuis `packages/client/src/ref.ts`
- Server : non applicable
- Renderer common : non applicable direct
- Renderer three : `gl-rsurf.ts`, `gl-rmain.ts`, `gl-world-scene-adapter.ts`, `index.ts`
- Web / platform : consommateurs indirects du renderer, pas port principal
- Audio : non applicable
- Tests existants : `scripts/verify/quake2-gl-light.ts`, script npm `verify:gl-light`
