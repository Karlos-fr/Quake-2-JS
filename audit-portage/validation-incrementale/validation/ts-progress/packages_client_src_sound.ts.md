# Progress TS - packages/client/src/sound.ts

- Statut: Termine
- Dernier lot valide: fichier complet, `ClientSoundRegistrationHooks` et `CL_RegisterSounds`.
- Prochain lot recommande: Aucun.
- Tests de reference:
  - `npm run verify:cl-parse`
  - `npm run verify:cl-main`
  - `npm run verify:full-game:audio-routing`
  - `npm run verify:client:header`
  - `npm run typecheck`
- Decisions:
  - `ClientSoundRegistrationHooks` est un contrat `Category: New`, sans entite C/H proprietaire directe.
  - `CL_RegisterSounds` est le proprietaire TS attendu de `CL_RegisterSounds` dans `Quake-2-master/client/cl_parse.c`.
  - Les entrees publiques `S_RegisterSound` restent proprietaires dans `sound-public.ts` pour `client/sound.h` et dans `snd_dma.ts` pour `client/snd_dma.c`; `sound.ts` ne masque pas cet ownership.
  - L'integration web passe par les hooks d'enregistrement et conserve les handles backend dans `cl.sound_precache`.
- Blocages: Aucun.
