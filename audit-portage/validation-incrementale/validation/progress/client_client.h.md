# Progress - Quake-2-master/client/client.h

## Etat courant

- Statut: En cours
- Dernier lot traite: gros bloc parse/frame de `MAX_PARSE_ENTITIES`, `cl_parse_entities`, `net_message`, `net_from`, puis prototypes `CL_ParseEntityBits` a `CL_RegisterSounds`.
- Verdict du lot: Valide pour les constantes/globals et prototypes portes; `Non applicable` pour `SmokeAndFlash` (declaration orpheline sans definition C, flux effectif `CL_SmokeAndFlash`) et `CL_RunParticles` (prototype sans definition ni appel C, flux effectif `CL_AddParticles`).

## Preuves session

- Source lue: `Quake-2-master/client/client.h` lignes de declaration du bloc `connstate_t`/`dltype_t`/`keydest_t`/`client_static_t`.
- Cible lue: `packages/client/src/client.ts`, `packages/client/src/keys.ts`, `packages/client/src/index.ts`, integrations `packages/client/src/cl_main.ts`, `packages/client/src/cl_parse.ts`, `packages/client/src/cl_input.ts`, `packages/client/src/console.ts`, `packages/client/src/download.ts`, `apps/web/src/full-game.ts`, `apps/web/src/full-game-local-session.ts`, `apps/web/src/full-game-server-host.ts`, `apps/web/src/local-client-controller.ts`, `packages/renderer-three/src`.
- Tests lances: `npm run verify:client:header`, `npm run verify:keys:header`, `npm run verify:keys`, `npm run verify:full-game:local-transport`, `npm run verify:full-game:authoritative-handshake`, `npm run verify:full-game:input-bindings`, `npm run verify:full-game:render-source`, `npm run verify:full-game:three-renderer`, `npm run typecheck`.
- Session cvars/dlights: source lue `Quake-2-master/client/client.h` cvars + `cdlight_t`; cibles lues `packages/client/src/client.ts`, `packages/client/src/cl_main.ts`, `packages/client/src/cl_input.ts`, `packages/client/src/view.ts`, `packages/client/src/refresh.ts`, `packages/client/src/cl_fx.ts`, `apps/web/src`, `packages/renderer-three/src`.
- Tests lances session cvars/dlights: `npm run verify:client:header`, `npm run verify:cl-main`, `npm run verify:cl-input`, `npm run verify:cl-view`, `npm run verify:dlight-sync`, `npm run verify:full-game:render-source`, `npm run verify:full-game:three-renderer`, `npm run verify:web-render-order`, `npm run typecheck`.
- Test tente non bloquant pour ce lot: `npm run verify:cl-fx` echoue avant cloture sur une attente historique de `CL_BuildRefreshFrame` appelee avec runtime non actif (`EF_ROCKET should expose the original rocket dlight to refresh`).
- Session parse/frame: source lue `Quake-2-master/client/client.h` declarations `MAX_PARSE_ENTITIES`, `cl_parse_entities`, `net_from`, `net_message` et prototypes `CL_ParseEntityBits` a `CL_RegisterSounds`; definitions comparees dans `client/cl_ents.c`, `client/cl_parse.c`, `client/cl_fx.c`, `client/cl_tent.c`, `client/cl_view.c`.
- Cibles lues session parse/frame: `packages/client/src/client.ts`, `packages/client/src/cl_parse.ts`, `packages/client/src/cl_tent.ts`, `packages/client/src/cl_fx.ts`, `packages/client/src/refresh.ts`, `packages/client/src/view.ts`, `packages/client/src/sound.ts`, `packages/client/src/index.ts`, `packages/qcommon/src/qcommon.ts`, `apps/web/src`, `packages/renderer-three/src`.
- Tests lances session parse/frame: `npm run verify:client:header`, `npm run verify:cl-parse`, `npm run verify:cl-tent`, `npm run verify:cl-view`, `npm run verify:dlight-sync`, `npm run verify:particle-sync`, `npm run verify:beam-sync`, `npm run verify:full-game:render-source`, `npm run verify:full-game:three-renderer`, `npm run verify:full-game:authoritative-handshake`, `npm run verify:full-game:audio-routing`, `npm run typecheck`.
- Test tente non bloquant session parse/frame: `npm run verify:cl-fx` echoue sur le meme cas historique `EF_ROCKET should expose the original rocket dlight to refresh`, lie au harness qui appelle `CL_BuildRefreshFrame` avec un runtime non actif.

## Decisions

- `clientinfo_t` et `client_state_t` gardent des champs/adapters TypeScript supplementaires pour parser/register les ressources et separer les handles renderer; les champs C du lot restent representes.
- Les champs cinematics de `client_state_t` sont regroupes dans `client_cinematic_t`; cette decision est couverte par la ligne `client_state_t`.
- `cmd` dans la matrice est un champ de `client_state_t`; la cible `keys.ts` indiquee par generation est un faux rattachement pour ce lot.
- `keydest_t` est volontairement separe dans `packages/client/src/keys.ts`, car le port TS regroupe la destination clavier avec l'etat issu de `keys.c`; le commentaire d'entete TS a ete ajoute et le harness verifie que `client_static_t` ne duplique pas `key_dest`.
- `client_static_t` porte les champs persistants C jusqu'a `demofile`; `netchan` est conserve, et `precache` est un adapter TS pour la reprise de la traversal de downloads.
- Runtime: le bloc est atteint par les transitions `CL_Init`/`CL_Frame`, `CL_Connect_f`, `CL_CheckForResend`, `CL_ConnectionlessPacket`, `CL_ParseServerData`, `CL_ParseServerMessage`, `CL_SendCmd`, `CL_Disconnect` et les commandes demo/download.
- `apps/web`: le navigateur declenche et consomme ce bloc via `full-game.ts`, `full-game-local-session.ts`, `full-game-server-host.ts` et `local-client-controller.ts`; pas de logique parallele masquant `connstate_t`, `keydest_t`, le timing `cls` ou les champs de download/demo.
- `renderer-three`: pas de sortie visible directe depuis `client_static_t`; l'impact visible passe par l'etat `ca_active`, `realtime`/`frametime` et les frames/render-source deja consommes par `apps/web` et `renderer-three`, verifies par `verify:full-game:render-source` et `verify:full-game:three-renderer`.
- Cvars: les cvars client sont rattaches au runtime via `CL_InitLocal` et `CL_InitInput`; `cl_sidespeed` a ete corrige de `350` vers le defaut C `200`, et `cl_lightlevel` cote input pointe maintenant vers le cvar C `r_lightlevel`.
- Runtime rendu: `cl_stereo_separation`/`cl_stereo`, `cl_add_*`, `cl_gun`, `cl_timedemo` et `cl_paused` alimentent le flux `V_RenderView`/`CL_BuildRefreshFrame`; `cl_predict`, `cl_shownet`, `cl_showmiss`, `cl_showclamp`, `cl_vwep`, skins et footsteps sont consommes par parse/prediction/entities selon les ports existants.
- Runtime input/menu/son: `cl_upspeed` a `cl_anglespeedkey`, `cl_run`, `freelook`, `lookspring`, `lookstrafe`, `sensitivity`, `m_*` sont branches via input/menu; `cl_paused` est aussi consomme par audio.
- `cdlight_t`: porte comme `client_dlight_t` dans `client.ts`; le renommage est documente pour eviter la collision avec le `dlight_t` renderer de `client/ref.h`. Les champs C `key`, `color`, `origin`, `radius`, `die`, `decay`, `minlight` sont representes; la matrice marque les champs generes couverts par la ligne structure.
- `apps/web`: le flux web declenche/consomme ces sorties via les render sources full-game et les controllers; pas de logique parallele masquant les toggles runtime dans le lot valide.
- `renderer-three`: les sorties visibles `entities`, `particles`, `dlights`, `lightstyles`, camera/vieworg et stereo arrivent via `ClientRefreshFrame`, `V_RenderView`, `gl-world-scene-adapter`, `refresh-entity-sync` et `three-dlight-sync`; tests render-source, three-renderer, web-render-order et dlight-sync passes.
- `MAX_PARSE_ENTITIES` vaut 1024 comme le C; `createClientRuntime` alloue `cl_parse_entities` a cette taille et `CL_ParseFrame`/packet entities utilisent le masque `MAX_PARSE_ENTITIES - 1` pour le ring-buffer de deltas.
- `net_message` est porte dans `ClientRuntime` pour le parsing client; `net_from` reste qcommon-owned via `QCommonRuntime.net_from`, consomme par `CL_ReadPackets`/`hooks.qnet` avant copie du message sequence dans `ClientRuntime.net_message`. La ligne `net_from` a ete ajoutee manuellement car la matrice generee l'avait omise.
- Prototypes parse/frame: `CL_ParseEntityBits`, `CL_ParseDelta`, `CL_ParseFrame`, `CL_ParseConfigString`, `CL_ParseMuzzleFlash`, `CL_ParseMuzzleFlash2` sont portes dans `cl_parse.ts`; `CL_ParseTEnt`/`CL_AddTEnts`/`CL_SmokeAndFlash` dans `cl_tent.ts`; `CL_SetLightstyle`, `CL_RunDLights`, `CL_RunLightStyles`, `CL_AddDLights`, `CL_AddLightStyles` dans `cl_fx.ts`; `CL_PrepRefresh` dans `view.ts`; `CL_RegisterSounds` dans `sound.ts`.
- `packages/client/src/index.ts` expose maintenant les declarations publiques du lot, dont `CL_AddEntities` comme alias de l'adapter structure `CL_BuildRefreshFrame`.
- Runtime: `CL_ReadPackets`/`CL_ParseServerMessage` atteignent les parseurs depuis le flux normal; `CL_BuildRefreshFrame` appelle lerp/view, packet entities, temp entities, dlights, particles et lightstyles; `CL_PrepRefresh`/`CL_RegisterSounds` sont atteints par le flux precache.
- `apps/web`: le flux web appelle `CL_ParseServerMessage` cote server-host, `CL_PrepRefresh`/`CL_RegisterSounds` dans full-game, consomme `CL_BuildRefreshFrame` via render-source/local-session/local-controller et branche les hooks muzzleflash/temp entity.
- `renderer-three`: applicable et branche pour areabits, camera, entites/modeles/frames/images, particules, beams, dlights, lightstyles et scene via `ClientRefreshFrame`, `gl-world-scene-adapter`, `refresh-entity-sync`, `particle-sync`, `three-beam-sync`, `three-dlight-sync` et `gl_rsurf`/`gl_light`.
- `SmokeAndFlash` dans ce bloc est une declaration sans definition C; le comportement attendu passe par `CL_SmokeAndFlash`, declare plus loin dans `client.h` et valide dans les flux temp entities. `CL_RunParticles` est aussi un prototype orphelin sans definition ni reference C; le comportement runtime des particules est celui de `CL_AddParticles`.

## Prochain lot recommande

Revenir au bloc encore `A verifier` entre `net_message` et les prototypes parse: `DrawString`, `DrawAltString`, `CL_CheckOrDownloadFile`, `CL_AddNetgraph`, puis `cl_sustain`/`MAX_SUSTAINS` et les declarations particules adjacentes si le lot reste coherent.
