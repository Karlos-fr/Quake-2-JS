# Inventaire Portage Quake II - client/ref.h

Date : 2026-04-25

## Identification

- Source C/H principale : `Quake-2-master/client/ref.h`
- Sources C/H secondaires : `Quake-2-master/qcommon/qcommon.h`, `Quake-2-master/game/q_shared.h`
- Package cible principal : `packages/client`
- Fichier TS principal pressenti : `packages/client/src/ref.ts`
- Fichiers TS secondaires pressentis : `packages/qcommon/src/q-shared.ts`, `packages/client/src/index.ts`, `packages/client/src/view.ts`, `packages/renderer-three/src/gl-rmain.ts`, `packages/renderer-three/src/ref-gl-host.ts`
- Domaine : client / contrat public refresh-renderer
- Niveau de fidelite attendu : Strict pour constantes et structures simples ; Close pour les signatures de callbacks avec out-parameters C.
- Statut actuel dans `PORTAGE_QUAKE2.md` : porte
- Statut `Valide` actuel dans `PORTAGE_QUAKE2.md` : valide avant creation formelle de cet audit

## Regles de rattachement

- Regle cible attendue : `1 fichier .h -> 1 fichier .ts`.
- Exception de decoupage documentee : les flags `RF_*` / `RDF_*` et `MAX_LIGHTSTYLES` restent centralises dans `packages/qcommon/src/q-shared.ts`; la facade package expose des aliases `REF_MAX_*`.
- Justification si `1 fichier C != 1 fichier TS` : `client/ref.h` est un header d'interface partage client/renderer. `packages/client/src/ref.ts` reste le point de rattachement principal ; les autres fichiers ne font que fournir constantes partagees, reexports ou consommation runtime.

## Inventaire source

### Fonctions

- [x] Nom : `refexport_t.Init`
  - Source : `client/ref.h`
  - Role : initialiser le refresh module charge.
  - Cible TS pressentie : `packages/client/src/ref.ts`
  - Statut : porte.
  - Notes : callback dans `refexport_t`, stub par defaut dans `createRefExport`.

- [x] Nom : `refexport_t.Shutdown`
  - Source : `client/ref.h`
  - Role : arreter le refresh module avant decharger.
  - Cible TS pressentie : `packages/client/src/ref.ts`
  - Statut : porte.
  - Notes : callback conserve.

- [x] Nom : `BeginRegistration` / `RegisterModel` / `RegisterSkin` / `RegisterPic` / `SetSky` / `EndRegistration`
  - Source : `client/ref.h`
  - Role : cycle d'enregistrement des assets renderer.
  - Cible TS pressentie : `packages/client/src/ref.ts`, consommation `packages/client/src/view.ts`, implementation `packages/renderer-three/src/gl-rmain.ts`
  - Statut : porte.
  - Notes : handles `model_s` / `image_s` opaques.

- [x] Nom : `RenderFrame`
  - Source : `client/ref.h`
  - Role : soumettre un `refdef_t` au renderer.
  - Cible TS pressentie : `packages/client/src/ref.ts`, `packages/renderer-three/src/gl-rmain.ts`
  - Statut : porte et branche.
  - Notes : `V_RenderView` et `CL_BuildRefreshFrame` construisent les donnees consommees par le renderer.

- [x] Nom : `DrawGetPicSize`
  - Source : `client/ref.h`
  - Role : retourner les dimensions d'une image de draw.
  - Cible TS pressentie : `packages/client/src/ref.ts`
  - Statut : porte avec ecart documente.
  - Notes : out-parameters `int *w`, `int *h` remplaces par `RefPictureSize`.

- [x] Nom : `DrawPic` / `DrawStretchPic` / `DrawChar` / `DrawTileClear` / `DrawFill` / `DrawFadeScreen` / `DrawStretchRaw`
  - Source : `client/ref.h`
  - Role : surface de dessin 2D et cinematics.
  - Cible TS pressentie : `packages/client/src/ref.ts`
  - Statut : porte comme contrat.
  - Notes : implementation concrete derriere renderer/adapters.

- [x] Nom : `CinematicSetPalette` / `BeginFrame` / `EndFrame` / `AppActivate`
  - Source : `client/ref.h`
  - Role : gestion palette, frame renderer et activation application.
  - Cible TS pressentie : `packages/client/src/ref.ts`, `packages/renderer-three/src/gl-rmain.ts`
  - Statut : porte comme contrat et branche dans le host renderer.
  - Notes : `Uint8Array | null` represente la palette optionnelle.

- [x] Nom : callbacks `refimport_t`
  - Source : `client/ref.h`
  - Role : services client importes par le renderer (`Sys_Error`, commandes, console, filesystem, cvars, video).
  - Cible TS pressentie : `packages/client/src/ref.ts`, `packages/renderer-three/src/ref-gl-host.ts`
  - Statut : porte avec ecarts de signatures documentes.
  - Notes : `FS_LoadFile`, `DrawGetPicSize` et `Vid_GetModeInfo` utilisent des retours structures/nullables au lieu de pointeurs de sortie.

- [x] Nom : `GetRefAPI_t`
  - Source : `client/ref.h`
  - Role : unique export linker du refresh module.
  - Cible TS pressentie : `packages/client/src/ref.ts`, `packages/renderer-three/src/gl-rmain.ts`
  - Statut : porte et consomme.
  - Notes : type TS `(imports: refimport_t) => refexport_t`; implementation concrete renderer `GetRefAPI`.

### Structures / types

- [x] Nom : `model_s`
  - Source : `client/ref.h`
  - Role : type opaque renderer pour modeles.
  - Representation TS pressentie : `model_s`
  - Statut : porte.
  - Notes : `unknown`, specialise cote renderer si necessaire.

- [x] Nom : `image_s`
  - Source : `client/ref.h`
  - Role : type opaque renderer pour images/skins.
  - Representation TS pressentie : `image_s`
  - Statut : porte.
  - Notes : `unknown`.

- [x] Nom : `entity_t`
  - Source : `client/ref.h`
  - Role : entite renderer-facing, incluant lerp, skin, flags et donnees RF_BEAM.
  - Representation TS pressentie : `entity_t`
  - Statut : porte.
  - Notes : champs et ordre logique conserves.

- [x] Nom : `dlight_t`
  - Source : `client/ref.h`
  - Role : lumiere dynamique.
  - Representation TS pressentie : `dlight_t`
  - Statut : porte.
  - Notes : `origin`, `color`, `intensity`.

- [x] Nom : `particle_t`
  - Source : `client/ref.h`
  - Role : particule renderer-facing.
  - Representation TS pressentie : `particle_t`
  - Statut : porte.
  - Notes : `origin`, `color`, `alpha`.

- [x] Nom : `lightstyle_t`
  - Source : `client/ref.h`
  - Role : style de lumiere courant.
  - Representation TS pressentie : `lightstyle_t`
  - Statut : porte.
  - Notes : `rgb` et `white` conserves.

- [x] Nom : `refdef_t`
  - Source : `client/ref.h`
  - Role : definition complete d'une frame renderer.
  - Representation TS pressentie : `refdef_t`
  - Statut : porte.
  - Notes : tableaux TS avec compteurs explicites `num_*`, `areabits` en `Uint8Array | null`.

- [x] Nom : `refexport_t`
  - Source : `client/ref.h`
  - Role : API exportee par le refresh module.
  - Representation TS pressentie : `refexport_t`
  - Statut : porte.
  - Notes : function pointers C convertis en callbacks TS.

- [x] Nom : `refimport_t`
  - Source : `client/ref.h`
  - Role : API importee par le refresh module.
  - Representation TS pressentie : `refimport_t`
  - Statut : porte.
  - Notes : out-parameters remplaces par resultats structures/nullables.

### Enums / constantes / flags / macros utiles

- [x] Nom : `MAX_DLIGHTS`, `MAX_ENTITIES`, `MAX_PARTICLES`, `MAX_LIGHTSTYLES`
  - Source : `client/ref.h`, `game/q_shared.h`
  - Valeur / role : tailles fixes renderer, respectivement `32`, `128`, `4096`, `256`.
  - Cible TS pressentie : `packages/client/src/ref.ts`, `packages/qcommon/src/q-shared.ts`
  - Statut : porte.
  - Notes : `MAX_LIGHTSTYLES` reste partage depuis qcommon.

- [x] Nom : `POWERSUIT_SCALE`
  - Source : `client/ref.h`
  - Valeur / role : `4.0F`.
  - Cible TS pressentie : `packages/client/src/ref.ts`
  - Statut : porte.
  - Notes : valeur `4.0`.

- [x] Nom : `SHELL_*_COLOR`
  - Source : `client/ref.h`
  - Valeur / role : couleurs palette shell.
  - Cible TS pressentie : `packages/client/src/ref.ts`
  - Statut : porte.
  - Notes : valeurs hex conservees, dont `SHELL_RB_COLOR = 0x68`.

- [x] Nom : `ENTITY_FLAGS`
  - Source : `client/ref.h`
  - Valeur / role : `68`.
  - Cible TS pressentie : `packages/client/src/ref.ts`
  - Statut : porte.
  - Notes : verrouille par test.

- [x] Nom : `API_VERSION`
  - Source : `client/ref.h`
  - Valeur / role : version API refresh `3`.
  - Cible TS pressentie : `packages/client/src/ref.ts`
  - Statut : porte.
  - Notes : utilise par `createRefExport` et `GetRefAPI`.

- [x] Nom : `RF_*`, `RDF_*`
  - Source : `game/q_shared.h`
  - Valeur / role : flags renderer et refdef (`RF_BEAM`, `RF_TRANSLUCENT`, `RDF_NOWORLDMODEL`, etc.).
  - Cible TS pressentie : `packages/qcommon/src/q-shared.ts`
  - Statut : porte.
  - Notes : source de verite partagee ; consommee par client et renderer.

## Mapping source -> cible

| Item source | Type | Fichier TS principal | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
| `model_s` | type opaque | `packages/client/src/ref.ts` | `model_s` | Porte | `unknown`. |
| `image_s` | type opaque | `packages/client/src/ref.ts` | `image_s` | Porte | `unknown`. |
| `entity_t` | struct | `packages/client/src/ref.ts` | `entity_t`, `createEntity` | Porte | Consomme par `view.ts` et `gl-rmain.ts`. |
| `dlight_t` | struct | `packages/client/src/ref.ts` | `dlight_t`, `createDlight` | Porte | Consomme par renderer light. |
| `particle_t` | struct | `packages/client/src/ref.ts` | `particle_t`, `createParticle` | Porte | Consomme par renderer particles. |
| `lightstyle_t` | struct | `packages/client/src/ref.ts` | `lightstyle_t`, `createLightstyle` | Porte | Taille via `MAX_LIGHTSTYLES`. |
| `refdef_t` | struct | `packages/client/src/ref.ts` | `refdef_t`, `createRefDef` | Porte | Frame renderer. |
| `refexport_t` | contract | `packages/client/src/ref.ts` | `refexport_t`, `createRefExport` | Porte | Implementation concrete cote renderer. |
| `refimport_t` | contract | `packages/client/src/ref.ts` | `refimport_t`, `createRefImport` | Porte | Host renderer compose les imports. |
| `GetRefAPI_t` | type fonction | `packages/client/src/ref.ts` | `GetRefAPI_t` | Porte | `gl-rmain.ts` fournit `GetRefAPI`. |
| constantes `MAX_*`, `SHELL_*`, `API_VERSION` | macros | `packages/client/src/ref.ts`, `packages/qcommon/src/q-shared.ts` | constantes TS | Porte | Verrouillees par `quake2-ref-header.ts`. |

## Points d'attention

- [x] Nommage de fichier coherent avec la source
- [x] Fichier principal de rattachement identifiable
- [x] Decoupage coherent
- [x] Risque de dispersion a verifier
- [x] Helpers nouveaux a surveiller
- [x] Dependances adapter a surveiller

## Consommateurs a verifier plus tard

- Runtime : `packages/client/src/view.ts`, `packages/client/src/refresh.ts`
- Client : `packages/client/src/index.ts`, `packages/client/src/menu-types.ts`, `packages/client/src/menu-player-config.ts`
- Server : non applicable
- Renderer common : non applicable direct dans ce port
- Renderer three : `packages/renderer-three/src/gl-rmain.ts`, `packages/renderer-three/src/gl-light.ts`, `packages/renderer-three/src/ref-gl-host.ts`, `packages/renderer-three/src/gl-world-scene-adapter.ts`
- Web / platform : `apps/web/src/full-game.ts`
- Audio : non applicable
- Tests existants : `scripts/verify/quake2-ref-header.ts`, `scripts/verify/quake2-ref-gl-host.ts`
