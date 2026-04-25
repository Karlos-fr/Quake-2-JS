# Inventaire Portage Quake II - server/sv_null.c

Date : 2026-04-25

## Identification

- Source C/H principale : `Quake-2-master/server/sv_null.c`
- Sources C/H secondaires : aucune inclusion locale dans le fichier source ; signatures historiques rattachees a `server/server.h` et aux types communs `qboolean`
- Package cible principal : `packages/server`
- Fichier TS principal pressenti : `packages/server/src/sv_null.ts`
- Fichiers TS secondaires pressentis : `packages/server/src/host.ts`, `packages/server/src/index.ts`
- Domaine : serveur nul / stubs host pour client reseau pur
- Niveau de fidelite attendu : Strict pour les stubs no-op, Close pour le bridge host configurable
- Statut actuel dans `PORTAGE_QUAKE2.md` : `A porter` = `✅`, `Porte` = `✅`
- Statut `Valide` actuel dans `PORTAGE_QUAKE2.md` : vide avant audit

## Regles de rattachement

- Regle cible attendue : `1 fichier C = 1 fichier TS`
- Exception de decoupage documentee : `host.ts` expose le bridge top-level consomme par le package, mais le port strict du fichier C reste `sv_null.ts`.
- Justification si `1 fichier C != 1 fichier TS` : les trois stubs source sont portes dans `sv_null.ts`; `host.ts` est un bridge nouveau qui preserve le no-op par defaut et permet de brancher `sv_main` quand un runtime serveur existe.

## Inventaire source

### Fonctions

- [x] Nom : `SV_Init`
  - Source : `sv_null.c:4`
  - Role : stub d'initialisation serveur pour builds net-only.
  - Cible TS pressentie : `packages/server/src/sv_null.ts:30`
  - Statut : porte Strict
  - Notes : corps vide conserve ; bridge top-level dans `host.ts:86`.

- [x] Nom : `SV_Shutdown`
  - Source : `sv_null.c:8`
  - Role : stub d'arret serveur ignorant `finalmsg` et `reconnect`.
  - Cible TS pressentie : `packages/server/src/sv_null.ts:45`
  - Statut : porte Strict
  - Notes : no-op conserve ; les parametres TS sont explicitement marques comme inutilises.

- [x] Nom : `SV_Frame`
  - Source : `sv_null.c:12`
  - Role : stub de frame serveur ignorant `time`.
  - Cible TS pressentie : `packages/server/src/sv_null.ts:62`
  - Statut : porte Strict
  - Notes : no-op conserve ; bridge top-level dans `host.ts:112`.

### Structures / types

- [x] Nom : `qboolean`
  - Source : signature C de `SV_Shutdown`
  - Role : booleen C pour le parametre `reconnect`.
  - Representation TS pressentie : `boolean` dans `sv_null.ts`, `qboolean` dans le type de binding `host.ts`
  - Statut : consomme / adapte
  - Notes : adaptation TypeScript explicite, aucune mutation.

- [x] Nom : `ServerHostBindings`
  - Source : nouveau bridge, pas present dans `sv_null.c`
  - Role : permet de garder les entrees `SV_*` no-op par defaut puis de les rediriger vers un runtime serveur.
  - Representation TS pressentie : `packages/server/src/host.ts`
  - Statut : nouveau bridge
  - Notes : consommateur, pas port principal.

### Enums / constantes / flags / macros utiles

- [x] Nom : aucun
  - Source : `sv_null.c`
  - Valeur / role : aucun define, enum, flag ou macro local.
  - Cible TS pressentie : non applicable
  - Statut : non applicable
  - Notes : le fichier ne contient que trois fonctions vides.

## Mapping source -> cible

| Item source | Type | Fichier TS principal | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
| `SV_Init` | fonction | `packages/server/src/sv_null.ts` | `SV_Init` | OK | no-op strict |
| `SV_Shutdown` | fonction | `packages/server/src/sv_null.ts` | `SV_Shutdown` | OK | ignore `finalmsg`, `reconnect` |
| `SV_Frame` | fonction | `packages/server/src/sv_null.ts` | `SV_Frame` | OK | ignore `time` |
| entrees host `SV_*` | bridge | `packages/server/src/host.ts` | `SV_Init`, `SV_Shutdown`, `SV_Frame` | OK | no-op par defaut, configurable |
| facade package | export | `packages/server/src/index.ts` | exports `SV_*` | OK | reexport du bridge host |

## Points d'attention

- [x] Nommage de fichier coherent avec la source
- [x] Fichier principal de rattachement identifiable
- [x] Decoupage coherent
- [x] Risque de dispersion a verifier
- [x] Helpers nouveaux a surveiller
- [x] Dependances adapter a surveiller

## Consommateurs a verifier plus tard

- Runtime : `packages/server/src/host.ts`, `packages/server/src/runtime.ts` via `configureServerHostFromFacade`
- Client : non applicable direct
- Server : `packages/server/src/index.ts`, host bridge, runtime facade
- Renderer common : non applicable
- Renderer three : non applicable
- Web / platform : non applicable direct
- Audio : non applicable
- Tests existants : `scripts/verify/quake2-sv-null.ts`, script npm `verify:server:null`
