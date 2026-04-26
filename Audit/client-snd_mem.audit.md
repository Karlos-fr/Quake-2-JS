# Audit Portage Quake II - client/snd_mem.c

Date : 2026-04-25

## Verdict

Statut : OK ISO branche
Risque principal : faible ; les pointeurs C de parsing RIFF sont remplaces par un etat d'offset explicite, et les allocations cache par `Uint8Array`, avec les conversions critiques couvertes par harnais.

## Source verifiee

- Source C/H : `Quake-2-master/client/snd_mem.c`, avec verification de `Quake-2-master/client/snd_loc.h`
- Port TS : `packages/client/src/snd_mem.ts`
- Consommateurs : `packages/client/src/sound-local.ts`, `packages/client/src/snd_dma.ts`, `packages/client/src/snd_mix.ts`

## Fiche d'identification

- Fichier audite : `client/snd_mem.c`
- Source C/H principale : `Quake-2-master/client/snd_mem.c`
- Sources C/H secondaires : `Quake-2-master/client/snd_loc.h`, `Quake-2-master/client/sound.h`, `Quake-2-master/client/client.h`
- Package : `packages/client`
- Type de fichier : implementation audio cache / WAV parsing
- Statut dans `PORTAGE_QUAKE2.md` : porte
- Statut `Valide` dans `PORTAGE_QUAKE2.md` : vide avant mise a jour
- Niveau de fidelite annonce : Close / Strict selon bloc
- Role attendu : charger les WAV, parser RIFF, resampler et alimenter les caches `sfx_t`.
- Consommateurs directs : `sound-local.ts`, `snd_dma.ts`, `snd_mix.ts`
- Consommateurs finaux : pipeline audio client, registration des sons, mixage channels.
- Tests existants : `npm run verify:snd-mem`, `npm run verify:snd-loc:header`, `npm run verify:snd-dma`
- Conclusion audit : OK ISO branche

## Mapping C -> TS

| Source | Type | Fichier TS | Symbole TS | Statut | Notes |
|---|---|---|---|---|---|
| `cache_full_cycle` | global | `packages/client/src/snd_mem.ts` | `cache_full_cycle` | OK | Conserve pour tracabilite. |
| `S_Alloc` | declaration externe | N/A | N/A | OK avec ecart | Pas de corps source ; allocation TS directe. |
| `ResampleSfx` | fonction | `packages/client/src/snd_mem.ts` | `ResampleSfx` | OK | Conversions 8/16-bit verifiees. |
| `S_LoadSound` | fonction | `packages/client/src/snd_mem.ts` | `S_LoadSound` | OK avec ecart | FS/hooks au lieu de globals C. |
| `GetLittleShort` | helper | `packages/client/src/snd_mem.ts` | `GetLittleShort` | OK | Little-endian signed. |
| `GetLittleLong` | helper | `packages/client/src/snd_mem.ts` | `GetLittleLong` | OK | Little-endian signed. |
| `FindNextChunk` | helper | `packages/client/src/snd_mem.ts` | `FindNextChunk` | OK | Chunk walk et padding conserves. |
| `FindChunk` | helper | `packages/client/src/snd_mem.ts` | `FindChunk` | OK | Etat local. |
| `DumpChunks` | fonction | `packages/client/src/snd_mem.ts` | `DumpChunks` | OK avec ecart | Retourne lignes au lieu de `Com_Printf`. |
| `GetWavinfo` | fonction | `packages/client/src/snd_mem.ts` | `GetWavinfo` | OK | RIFF/WAVE, fmt, cue/LIST, data, bad loop. |

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
- [x] Les timings sont fideles. N/A.
- [x] Les randomisations conservent l'intention source. N/A.
- [x] Les listes/pools sont manipules comme dans le source. N/A pour ce fichier.

### Effets secondaires

- [x] Entites creees/liberees/linkees. N/A.
- [x] `think`, `touch`, `use`, `nextthink` mis a jour. N/A.
- [x] Etats runtime synchronises.
- [x] Configstrings mises a jour. N/A.
- [x] Temp entities mises a jour. N/A.
- [x] Sons emis avec les bons parametres. N/A, fichier de cache.
- [x] Sorties renderer/audio correctement alimentees si applicable.

## Branchement

### Amont / aval

- [x] Le fichier est appele depuis le bon systeme amont.
- [x] Les appels remplacent bien le point d'appel source original.
- [x] Les resultats sont consommes par le module attendu.
- [x] Les donnees ne restent pas dans une structure intermediaire non lue.
- [x] Les comportements source ne sont pas dupliques dans plusieurs chemins divergents.

### Renderer et web

- [x] Si applicable, les sorties sont raccordees a `packages/renderer-common`. N/A.
- [x] Si applicable, les sorties sont raccordees a `packages/renderer-three`. N/A.
- [x] Si applicable, les synchronisations web consomment bien les sorties runtime/client. N/A.
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
- [x] Tests a ajouter identifies. Aucun test bloquant a ajouter pour ce fichier.

## Findings

1. [Info] Aucun finding bloquant.
   - Fichier/ligne : N/A
   - Source originale : `client/snd_mem.c`
   - Impact : N/A
   - Correction recommandee : N/A

## Decision

- Corriger maintenant : non
- Reporter : non
- Documenter : ecarts `Uint8Array`/`DataView`, hooks FS/diagnostics et retour de `DumpChunks` documentes.

## Mise a jour du suivi

- Ligne `PORTAGE_QUAKE2.md` mise a jour : oui
- Nouveau statut `Valide` : ✅
- Fichier d'audit cree dans `Audit/` : `Audit/client-snd_mem.audit.md`
