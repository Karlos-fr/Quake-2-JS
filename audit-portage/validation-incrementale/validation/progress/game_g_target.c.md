# Progress - Quake-2-master/game/g_target.c

## Dernier lot valide

- 2026-05-01: `Use_Target_Speaker`, les deux entrees locales `chan`, et `SP_target_speaker`.
- Checklist appliquee:
  - Source C comparee a `packages/game/src/g_target.ts`: `Use_Target_Speaker` conserve le toggle des sons looped par `spawnflags & 3`, le choix `CHAN_VOICE` ou `CHAN_VOICE | CHAN_RELIABLE`, et l'emission positionnee avec `noise_index`, `volume`, `attenuation` et `timeofs` 0. `SP_target_speaker` conserve le warning sans `st.noise`, l'ajout de `.wav`, le `soundindex`, les defaults volume/attenuation, la conversion `attenuation == -1` vers 0, le prestart du looped-on, l'installation du callback et le link entity.
  - Commentaires d'en-tete verifies et completes pour `Use_Target_Speaker` et `SP_target_speaker`: `Original name`, `Source`, `Category: Ported`, `Fidelity level`, `Behavior` et `Porting notes`.
  - Branchement runtime verifie: `target_speaker` est dans la table de spawn `packages/game/src/g_spawn.ts`, exporte via `packages/game/src/index.ts`, dispatchable par `ED_CallSpawn` pendant `SpawnEntities`; le callback `use` emet un `GameSoundEvent`, puis `G_RunFrame` draine vers `gi.positioned_sound`.
  - `apps/web`: integration attendue car les speakers produisent des sons one-shot ou looped consommes dans le navigateur. Pas de logique parallele masquante constatee; le flux full-game/local passe par le runtime porte, les configstrings sons, les paquets `svc_sound`/audio et la synchronisation gameplay locale.
  - `renderer-three`: pas de sortie visible, camera ou scene attendue pour `target_speaker`; les sons sont consommes par le pipeline audio/client. Les entites looped peuvent apparaitre dans les snapshots via `s.sound`, mais aucune consommation renderer-three specifique n'est requise.
- Corrections appliquees:
  - `packages/game/src/g_target.ts`: commentaires d'en-tete completes pour les deux fonctions du lot.
  - `scripts/verify/quake2-g-target.ts`: couverture renforcee pour `CHAN_VOICE`, `CHAN_VOICE | CHAN_RELIABLE`, volume, attenuation `-1`, origine positionnee, looped-on/off, warning sans noise, callback et link.
- Tests lances:
  - `npm run verify:g-target` OK.
  - `npm run verify:full-game:server-host` OK.
  - `npm run verify:local-gameplay-sync` OK.
  - `npm run verify:web-render-order` OK.
  - `npm run verify:full-game:three-renderer` OK.
  - `npm run typecheck` OK.
  - `npm run verify:full-game:audio-routing`, `npm run verify:audio:phase11`, `npm run verify:cl-parse` et `npm run verify:snd-dma` bloques avant scenario par des imports client `.js` inexistants (`types.js` ou `parse.js`), non imputes au lot.
- Prochain lot recommande: `buffer`, `strncpy`, `Use_Target_Help`, le second `strncpy`, puis `SP_target_help` si le lot reste petit.

- 2026-05-01: `Use_Target_Tent` et `SP_target_temp_entity`.
- Checklist appliquee:
  - Source C comparee a `packages/game/src/g_target.ts`: `Use_Target_Tent` conserve l'emission `svc_temp_entity`, le type `ent->style`, l'origine `ent->s.origin` et `MULTICAST_PVS`; le TS represente ces writes par `emitGameTempEntity(runtime, ent.style, ent.s.origin, MULTICAST_PVS, { style })`. `SP_target_temp_entity` conserve uniquement l'installation du callback `use`.
  - Commentaires d'en-tete verifies: les deux fonctions portent `Original name`, `Source`, `Category: Ported` et `Fidelity level`; `Use_Target_Tent` documente l'emission temp entity.
  - Branchement runtime verifie: `target_temp_entity` est enregistre dans `packages/game/src/g_spawn.ts`, exporte via `packages/game/src/index.ts`, dispatchable par `ED_CallSpawn` pendant `SpawnEntities`; `SP_target_temp_entity` installe `use`, l'activation de target appelle `Use_Target_Tent`, puis `G_RunFrame` draine les temp entities vers `gi.WriteByte`, `gi.WritePosition` et `gi.multicast`.
  - `apps/web`: integration attendue car l'entite produit une temp entity visible/sonore selon `style`. Aucune logique parallele trouvee pour masquer le runtime; le flux full-game/local consomme le message serveur via `CL_ParseServerMessage` et construit le `ClientRefreshFrame` utilise par la boucle web.
  - `renderer-three`: integration attendue pour les styles visibles comme `TE_EXPLOSION1` produisant explosion, dlight et entite refresh. La consommation est presente via `CL_ParseTEnt`/`CL_AddTEntPacket`, `CL_BuildTEntRefresh`, `CL_BuildRefreshFrame`, puis `refresh-entity-sync`, `three-dlight-sync` et/ou `particle-sync` selon le style; pas de manque constate pour le style teste.
- Corrections appliquees:
  - Aucune correction TS necessaire.
- Tests lances:
  - `npm run verify:g-target` OK.
- Prochain lot recommande alors: `Use_Target_Speaker`, les entrees locales `chan`, puis `SP_target_speaker` si le lot reste petit.

## Blocages

- Aucun pour ce lot.
