# Progress - Quake-2-master/client/client.h

## Etat courant

- Statut: En cours
- Dernier lot traite: bloc persistent `connstate_t`, `dltype_t`, `keydest_t`, `client_static_t` et champs generes associes jusqu'a `demofile`.
- Verdict du lot: Valide pour les enums et le struct proprietaire; `Non applicable` pour les lignes correspondant a des champs de `client_static_t` deja couvertes par la ligne structure.

## Preuves session

- Source lue: `Quake-2-master/client/client.h` lignes de declaration du bloc `connstate_t`/`dltype_t`/`keydest_t`/`client_static_t`.
- Cible lue: `packages/client/src/client.ts`, `packages/client/src/keys.ts`, `packages/client/src/index.ts`, integrations `packages/client/src/cl_main.ts`, `packages/client/src/cl_parse.ts`, `packages/client/src/cl_input.ts`, `packages/client/src/console.ts`, `packages/client/src/download.ts`, `apps/web/src/full-game.ts`, `apps/web/src/full-game-local-session.ts`, `apps/web/src/full-game-server-host.ts`, `apps/web/src/local-client-controller.ts`, `packages/renderer-three/src`.
- Tests lances: `npm run verify:client:header`, `npm run verify:keys:header`, `npm run verify:keys`, `npm run verify:full-game:local-transport`, `npm run verify:full-game:authoritative-handshake`, `npm run verify:full-game:input-bindings`, `npm run verify:full-game:render-source`, `npm run verify:full-game:three-renderer`, `npm run typecheck`.

## Decisions

- `clientinfo_t` et `client_state_t` gardent des champs/adapters TypeScript supplementaires pour parser/register les ressources et separer les handles renderer; les champs C du lot restent representes.
- Les champs cinematics de `client_state_t` sont regroupes dans `client_cinematic_t`; cette decision est couverte par la ligne `client_state_t`.
- `cmd` dans la matrice est un champ de `client_state_t`; la cible `keys.ts` indiquee par generation est un faux rattachement pour ce lot.
- `keydest_t` est volontairement separe dans `packages/client/src/keys.ts`, car le port TS regroupe la destination clavier avec l'etat issu de `keys.c`; le commentaire d'entete TS a ete ajoute et le harness verifie que `client_static_t` ne duplique pas `key_dest`.
- `client_static_t` porte les champs persistants C jusqu'a `demofile`; `netchan` est conserve, et `precache` est un adapter TS pour la reprise de la traversal de downloads.
- Runtime: le bloc est atteint par les transitions `CL_Init`/`CL_Frame`, `CL_Connect_f`, `CL_CheckForResend`, `CL_ConnectionlessPacket`, `CL_ParseServerData`, `CL_ParseServerMessage`, `CL_SendCmd`, `CL_Disconnect` et les commandes demo/download.
- `apps/web`: le navigateur declenche et consomme ce bloc via `full-game.ts`, `full-game-local-session.ts`, `full-game-server-host.ts` et `local-client-controller.ts`; pas de logique parallele masquant `connstate_t`, `keydest_t`, le timing `cls` ou les champs de download/demo.
- `renderer-three`: pas de sortie visible directe depuis `client_static_t`; l'impact visible passe par l'etat `ca_active`, `realtime`/`frametime` et les frames/render-source deja consommes par `apps/web` et `renderer-three`, verifies par `verify:full-game:render-source` et `verify:full-game:three-renderer`.

## Prochain lot recommande

Continuer avec le bloc cvars client de `cl_stereo_separation` a `cl_vwep`, puis `cdlight_t` et ses champs si le lot reste coherent; verifier les flux runtime `V_RenderView`/`SCR_UpdateScreen`/input, `apps/web` render-source et la consommation renderer-three des sorties visibles.
