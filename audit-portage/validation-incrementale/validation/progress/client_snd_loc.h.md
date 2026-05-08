# Progress - Quake-2-master/client/snd_loc.h

## Etat

- Statut: Termine pour la matrice courante
- Dernier lot valide: declarations systeme `SNDDMA_Init`, `SNDDMA_GetDMAPos`, `SNDDMA_Shutdown`, `SNDDMA_BeginPainting`, `SNDDMA_Submit`, constantes/globals `MAX_CHANNELS`, `channels`, `paintedtime`, `s_rawend`, `MAX_RAW_SAMPLES`, cvars audio `s_volume`, `s_nosound`, `s_loadas8bit`, `s_khz`, `s_show`, `s_mixahead`, `s_testsound`, `s_primary`, et prototypes externes du header classes par ownership reel.
- Tests de reference:
  - `npm run verify:snd-loc:header` - passe, 2026-05-08
  - `npm run verify:snd-dma` - passe, 2026-05-08
  - `npm run verify:snd-mix` - passe, 2026-05-08
  - `npm run verify:snd-mem` - passe, 2026-05-08
  - `npm run verify:full-game:audio-routing` - passe, 2026-05-08
  - `npm run typecheck` - passe, 2026-05-08

## Decisions

- Ownership confirme dans `packages/client/src/snd_loc.ts`.
- Les structs C sont portees en interfaces TypeScript avec constructeurs explicites de zero-initialisation.
- `sfx_s` est la declaration C de `sfx_t`; la cible reelle est `sfx_t`.
- `playsound_s` est la declaration C de `playsound_t`; la cible reelle est `playsound_t`.
- `sfxcache_t.data[1]` est represente par `Uint8Array`; `dma_t.buffer` par `Uint8Array | null`.
- Les champs generes comme lignes separees dans la matrice sont marques `Non applicable` parce qu'ils sont couverts par la validation de leur struct parente.
- Les hooks `SNDDMA_*` sont des adapters host-side appartenant a `snd_loc.ts` et branches par `apps/web/src/full-game.ts`.
- `MAX_CHANNELS`, `MAX_RAW_SAMPLES`, `channels`, `paintedtime`, `s_rawend` et les cvars audio sont regroupes dans `ClientSoundLocalState` au lieu de globals C.
- `s_nosound` est preserve comme slot de declaration; aucun usage runtime n'a ete trouve dans les sources C consultees.
- Les prototypes `GetWavinfo`, `S_InitScaletable`, `S_LoadSound`, `S_IssuePlaysound`, `S_PaintChannels`, `S_PickChannel`, `S_Spatialize` sont des declarations externes dans `snd_loc.h`: les definitions proprietaires sont respectivement `snd_mem.c`, `snd_mix.c` et `snd_dma.c`; `snd_loc.ts` fournit seulement les adapters de contexte/hook.

## Integration

- Runtime: `S_Init` enregistre les cvars, appelle `SNDDMA_Init`, initialise la table de mixage et remet `paintedtime`; `S_Update_` appelle `SNDDMA_BeginPainting`, `SNDDMA_GetDMAPos`, `S_PaintChannels`, `SNDDMA_Submit`; `S_ClearBuffer` et `S_Shutdown` couvrent aussi Begin/Submit/Shutdown.
- apps/web: `apps/web/src/full-game.ts` cree `ClientSoundLocalContext`, branche `initializeWebSoundDma`, `getWebSoundDmaPosition`, shutdown WebAudio, `audio.playChannel(issued)` et `audio.syncLoopChannels(sndDma.sound.state.channels)` sans bypasser le runtime `snd_dma`.
- renderer-three: non applicable pour ce lot audio; les entites validees ne produisent aucune sortie visible renderer (modeles, frames, images, particules, beams, dlights, temp entities, areabits, camera ou scene).

## Prochain lot recommande

Aucun lot restant dans `client_snd_loc.h.md`: toutes les lignes sont `Valide` ou `Non applicable`. Laisser le coordinateur mettre `AVANCEMENT_GLOBAL.md` a jour.
