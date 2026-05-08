# Progress - Quake-2-master/client/snd_mix.c

## Etat courant

- Statut: termine cote matrice fichier
- Dernier lot valide: tout `snd_mix.c`
- Entites validees: `PAINTBUFFER_SIZE`, `S_WriteLinearBlastStereo16`, `S_TransferStereo16`, `S_TransferPaintBuffer`, `S_PaintChannelFrom8`, `S_PaintChannelFrom16`, `S_PaintChannels`, `S_InitScaletable`
- Entites non applicables: scratch pointers et faux locaux generes (`snd_out`, `i`, `val`, `lpos`, `lpaintedtime`, `out_idx`, `count`, `out_mask`, `p`, `step`, `pbuf`, `out`, `end`, `s`, `stop`, `scale`, `data`, `sfx`) et doublons de fonctions generes

## Preuves de session

- Comparaison C/TS: paintbuffer 2048, scaletable 32x256, clamp 16-bit, stereo16 optimise, wrap DMA, mono/8-bit general, raw samples, pending playsounds, loops/autosound, mix 8/16-bit, `paintedtime`.
- Commentaires d'en-tete verifies dans `packages/client/src/snd_mix.ts`.
- Runtime valide via `S_Update_` -> `S_PaintChannels` -> `S_TransferPaintBuffer` -> DMA.
- `apps/web` valide: le flux full-game initialise le DMA WebAudio et consomme le runtime porte via `audio.playChannel(issued)` / `audio.syncLoopChannels(...)`, sans bypass du mixage DMA pour le gameplay. Les raw samples cinematics passent par l'adapter dedie, separe du DMA gameplay.
- `renderer-three` non applicable: ce fichier ne produit aucune sortie visible renderer (modeles, frames, images, particules, beams, dlights, areabits, camera ou scene), uniquement du PCM audio.

## Tests

- `npm run verify:snd-mix`: OK
- `npm run verify:snd-dma`: OK
- `npm run verify:full-game:audio-routing`: OK
- `npm run typecheck`: OK

## Corrections

- `packages/client/src/snd_mix.ts`: correction de `S_TransferStereo16` pour conserver le paintbuffer aplati complet pendant les segments successifs de recirculation DMA.
- `scripts/verify/quake2-snd-mix.ts`: couverture ajoutee pour le wrap stereo16, le transfert mono 8-bit et le mix 8-bit.

## Prochain lot recommande

- Aucun pour `client/snd_mix.c`: toutes les lignes sont `Valide` ou `Non applicable`.
