# Audit Portage Quake II - client/cl_cin.c

Date : 2026-04-26

## Verdict

Statut : OK avec ecarts documentes
Risque principal : les effets renderer/audio/filesystem natifs sont exposes par hooks et snapshots; le comportement principal reste toutefois dans le package client et les consommateurs finaux sont branches.

## Source verifiee

- Source C/H : `Quake-2-master/client/cl_cin.c`, `Quake-2-master/client/client.h`
- Port TS : `packages/client/src/cinematic.ts`, facade `packages/client/src/screen.ts`, etat `packages/client/src/types.ts`
- Consommateurs : `packages/client/src/parse.ts`, `packages/client/src/input.ts`, `packages/client/src/menu-runtime.ts`, `apps/web/src/full-game.ts`, `packages/renderer-three/src/gl-draw.ts`, harnais `scripts/verify/quake2-screen-header.ts` et `scripts/verify/quake2-cinematic-audio-sync.ts`

## Fiche d'identification

- Fichier audite : `client/cl_cin.c`
- Source C/H principale : `Quake-2-master/client/cl_cin.c`
- Sources C/H secondaires : `Quake-2-master/client/client.h`, `screen.h`, `sound.h`, `cdaudio.h`, `ref.h`
- Package : `packages/client`
- Type de fichier : port client cinematic / image / audio brut
- Statut dans `PORTAGE_QUAKE2.md` : `A porter` ✅, `Porte` ✅
- Statut `Valide` dans `PORTAGE_QUAKE2.md` : vide avant mise a jour
- Niveau de fidelite annonce : `Close`, sous-blocs `Strict`
- Role attendu : porter les cinematics client `.pcx` et `.cin`, leur timing 14 Hz, le decodage Huffman, l'audio brut et le signal de fin `nextserver`
- Consommateurs directs : `screen.ts`, `parse.ts`, `input.ts`
- Consommateurs finaux : web full-game, audio hooks, renderer Three raw/paletted draw
- Tests existants : `quake2-screen-header.ts`, `quake2-cinematic-audio-sync.ts`, `quake2-cl-input.ts`, `quake2-cl-parse.ts`, `quake2-cl-scrn.ts`
- Conclusion audit : OK avec ecarts documentes

## Mapping C -> TS

| Source | Type | Fichier TS | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
| `SCR_LoadPCX` | fonction | `packages/client/src/cinematic.ts`, `packages/formats/src/pcx.ts` | `SCR_PlayCinematic`, `parsePcx` | Valide adapte | chargement par hook, parsing PCX partage |
| `SCR_StopCinematic` | fonction | `packages/client/src/cinematic.ts` | `SCR_StopCinematic` | Valide Close | reset runtime + hooks audio/palette |
| `SCR_FinishCinematic` | fonction | `packages/client/src/cinematic.ts` | `SCR_FinishCinematic` | Valide Strict | `clc_stringcmd`, `nextserver` |
| `SmallestNode1` | fonction | `packages/client/src/cinematic.ts` | `SmallestNode1` | Valide Strict | local |
| `Huff1TableInit` | fonction | `packages/client/src/cinematic.ts` | `Huff1TableInit` | Valide Strict | tables 256/511 conservees |
| `Huff1Decompress` | fonction | `packages/client/src/cinematic.ts` | `Huff1Decompress` | Valide Close | pointer arithmetic remplace par offsets |
| `SCR_ReadNextFrame` | fonction | `packages/client/src/cinematic.ts` | `SCR_ReadNextFrame` | Valide Close | raw samples hook |
| `SCR_RunCinematic` | fonction | `packages/client/src/cinematic.ts` | `SCR_RunCinematic` | Valide Close | pause key_dest, 14 Hz, fin stream |
| `SCR_DrawCinematic` | fonction | `packages/client/src/cinematic.ts` | `SCR_DrawCinematic` | Valide Close | snapshot au lieu d'appel direct renderer |
| `SCR_PlayCinematic` | fonction | `packages/client/src/cinematic.ts` | `SCR_PlayCinematic` | Valide Close | `.pcx` et `.cin` branches |
| `cinematics_t` / `cin` | struct/global | `packages/client/src/types.ts` | `client_cinematic_t` | Valide Close | contexte runtime |
| champs `cl.cinematic*` | etat client | `packages/client/src/types.ts` | `client_cinematic_t` | Valide Close | palette/time/frame/file cursor |

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

Notes : les lignes entites/configstrings/temp entities/think ne s'appliquent pas fonctionnellement a `cl_cin.c`; elles sont cochees comme non concernees apres verification du source.

## Branchement

### Amont / aval

- [x] Le fichier est appele depuis le bon systeme amont.
- [x] Les appels remplacent bien le point d'appel source original.
- [x] Les resultats sont consommes par le module attendu.
- [x] Les donnees ne restent pas dans une structure intermediaire non lue.
- [x] Les comportements source ne sont pas dupliques dans plusieurs chemins divergents.

### Renderer et web

- [x] Si applicable, les sorties sont raccordees a `packages/renderer-common`.
- [x] Si applicable, les sorties sont raccordees a `packages/renderer-three`.
- [x] Si applicable, les synchronisations web consomment bien les sorties runtime/client.
- [x] L'effet est visible/consomme et pas seulement present en memoire.

### Audio

- [x] Si applicable, le son source est enregistre.
- [x] Si applicable, l'evenement audio est emis et consomme correctement.

## Tests

- [x] Les tests existants couvrent les fonctions principales.
- [x] Les tests couvrent les effets secondaires.
- [x] Les tests couvrent le branchement jusqu'au consommateur final.
- [x] Les tests ne figent pas un comportement non ISO.
- [x] Les tests sont dans `scripts/verify` ou `packages/tests-golden`.
- [x] Tests a ajouter identifies.

Tests existants retenus :

- `scripts/verify/quake2-screen-header.ts` couvre PCX, `.cin`, palette, stop, finish, facade `screen.ts`, raw samples et loading plaque.
- `scripts/verify/quake2-cinematic-audio-sync.ts` couvre cadence 14 Hz, slices audio, restart son et fin de stream.
- `scripts/verify/quake2-cl-input.ts` couvre le skip cinematic par input et l'emission `nextserver`.
- `scripts/verify/quake2-cl-parse.ts` couvre le handoff serverdata cinematic vers `SCR_PlayCinematic`.
- `scripts/verify/quake2-cl-scrn.ts` couvre la suppression du draw cinematic pendant loading.

## Findings

1. [Info] `SCR_LoadPCX` n'est pas expose comme fonction TS separee.
   - Fichier/ligne : `packages/client/src/cinematic.ts`, branche PCX de `SCR_PlayCinematic`
   - Source originale : `SCR_LoadPCX` dans `client/cl_cin.c`
   - Impact : pas de perte de comportement; le decodage vit dans `packages/formats/src/pcx.ts`.
   - Correction recommandee : aucune, decoupage documente.

2. [Info] `re.CinematicSetPalette`, `re.DrawStretchRaw`, `S_RawSamples`, `CDAudio_Stop`, `CL_Snd_Restart_f` sont remplaces par hooks/snapshots.
   - Fichier/ligne : `packages/client/src/cinematic.ts`
   - Source originale : side effects renderer/audio de `client/cl_cin.c`
   - Impact : adaptation plateforme necessaire au navigateur; les consommateurs finaux sont branches et testes.
   - Correction recommandee : conserver la documentation et les harnais ciblant les hooks.

## Decision

- Corriger maintenant : non
- Reporter : aucun bloc critique identifie
- Documenter : inventaire et audit crees; `PORTAGE_QUAKE2.md` doit pointer vers les fichiers d'audit et passer `Valide` a ✅

## Mise a jour du suivi

- Ligne `PORTAGE_QUAKE2.md` mise a jour : `client\cl_cin.c`
- Nouveau statut `Valide` : `✅`
- Fichier d'audit cree dans `Audit/` : `Audit/client-cl_cin.audit.md`
