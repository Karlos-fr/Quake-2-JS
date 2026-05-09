# Progress TS - packages/client/src/snd_mix.ts

- Statut: Termine
- Dernier lot valide: fichier complet, 16 symboles.
- Prochain lot recommande: Aucun.

## Resume

- 8 symboles portages proprietaires de `Quake-2-master/client/snd_mix.c` marques `Couvert C/H` apres verification dans `client_snd_mix.c.md`: `PAINTBUFFER_SIZE`, `S_WriteLinearBlastStereo16`, `S_TransferStereo16`, `S_TransferPaintBuffer`, `S_PaintChannels`, `S_InitScaletable`, `S_PaintChannelFrom8`, `S_PaintChannelFrom16`.
- 8 symboles `Category: New` valides avec `Original name: N/A` et `Source: N/A (...)` explicites: `ClientSoundMixState`, `createClientSoundMixState`, `flattenPaintbuffer`, `clampPaintSample16`, `toSignedByte`, `clearOrPrimePaintbuffer`, `getPendingPlayHead`, `unlinkPendingPlay`.
- Les wrappers `S_InitScaletable` et `S_PaintChannels` dans `snd_loc.ts` restent des adapters; le portage proprietaire des corps `snd_mix.c` est bien dans ce fichier.

## Tests

- `npm run verify:snd-mix`
- `npm run verify:snd-dma`
- `npm run verify:full-game:audio-routing`
- `npm run typecheck`

## Integration

- Runtime: integre via `S_Init`, `S_Update`, `S_Update_`, `S_PaintChannels`, DMA et raw samples.
- apps/web: integre via `full-game.ts`, les hooks DMA/audio et l'adapter WebAudio.
- renderer-three: non proprietaire; le mixeur produit du son et n'emet pas de donnees de scene renderer.
