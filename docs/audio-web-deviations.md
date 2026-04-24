# Ecarts audio web

Cette note documente les ecarts inevitables entre Quake II original et le backend navigateur du portage audio.

## Backend materiel

Le portage ne reproduit pas les backends natifs `snd_win.c`, `snd_linux.c`, `snd_irix.c`, `snd_next.m` ni les backends CD-ROM natifs. Le comportement Quake II conserve dans le runtime reste rattache aux fichiers client `sound.h`, `snd_loc.h`, `snd_dma.c`, `snd_mem.c`, `snd_mix.c` et `cdaudio.h`. Les fichiers web dans `packages/platform` adaptent ce runtime vers `AudioContext`.

## Deverrouillage navigateur

Les navigateurs imposent souvent une gesture utilisateur avant de demarrer ou reprendre un `AudioContext`. Cet ecart est traite dans l'adapter web: le runtime Quake II peut enregistrer, scheduler et mettre a jour ses sons, mais le rendu effectif attend que le contexte audio soit autorise par le navigateur.

## Timing et latence

Quake II original ecrit vers un buffer DMA et pilote `soundtime` a partir de la position materielle. Le navigateur expose un scheduler Web Audio a latence variable. Le portage conserve la logique source de `timeofs`, `paintedtime`, channels, raw samples et loops dans `packages/client`, puis l'adapter projette les buffers vers Web Audio au plus proche. La latence absolue depend du navigateur et du peripherique.

## Spatialisation

La spatialisation Quake II calcule d'abord des volumes gauche/droite dans le runtime porte. Le backend web applique ces volumes via `GainNode` et peut utiliser un `PannerNode` seulement comme projection technique. La reference de fidelite reste le calcul Quake II, pas le modele psychoacoustique propre au navigateur.

## Musique CD

`CS_CDTRACK` garde la semantique logique de piste CD, mais aucune API web ne permet de piloter un lecteur CD-ROM natif. `packages/platform/src/web-cd-audio-adapter.ts` mappe donc les numeros de pistes vers des assets musicaux optionnels. L'absence d'asset musical est un cas supporte et ne doit pas perturber le runtime.

## Cinematics

Les cinematics gardent le flux PCM brut via `S_RawSamples`, mais leur emission effective passe par des `AudioBufferSourceNode`. La synchronisation vise la cadence Quake II des frames `.cin`; la precision finale reste bornee par le scheduler et l'etat de l'`AudioContext`.
