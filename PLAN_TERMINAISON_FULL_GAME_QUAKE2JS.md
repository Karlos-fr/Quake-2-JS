# Plan de terminaison full-game Quake2JS

## Resume

Objectif verrouille : terminer `full-game.html` comme boucle solo jouable, source-compatible, avec serveur local authoritative. La session locale niveau A ne doit plus etre la source normale du gameplay ; elle peut rester pour la demo ou des tests transitoires.

Chemin cible unique :

```text
Game/Menu/Console
-> newgame/gamemap
-> SV_Map
-> client local loopback
-> SV_* / game
-> snapshots serveur
-> CL_ParseServerMessage
-> CL_BuildRefreshFrame
-> ref_gl/Three
```

Hors perimetre de ce plan : multijoueur distant, renderer soft, fermeture exhaustive de tout le portage Quake II.

## Changements cles

1. Stabiliser la boucle actuelle
   - Corriger `SV_RunThink` pour respecter le C original : ne pas effacer `ent.think` avant l'appel.
   - Ajouter un test qui fait tourner un monstre sur plusieurs frames et verifie que `monster_think` reste arme.
   - Restaurer `verify:full-game:input-bindings`, actuellement casse par `monster_infantry`.

2. Creer le transport local client / serveur
   - Ajouter un adapter web de transport loopback avec deux files en memoire : `NS_CLIENT -> NS_SERVER` et `NS_SERVER -> NS_CLIENT`.
   - Utiliser deux `QcommonNetRuntime` hookes par `getPacket/sendPacket`, sans socket navigateur.
   - Injecter le `qnet` serveur dans `createFullGameServerHost`.
   - Injecter le `qnet` client dans `ClientMainContext` / `ClientInputContext`.
   - Utiliser le handshake source existant : `CL_CheckForResend -> connect -> SVC_DirectConnect -> client_connect -> new -> configstrings -> baselines -> precache -> begin`.

3. Remplacer la session niveau A dans full-game
   - Etat courant : chemin `full-game.ts` bascule sur le client local authoritative ; il ne depend plus de `FullGameLocalSession` / `createFullGameLocalSession`.
   - `onMapRequested` ne doit plus appeler `createFullGameLocalSession`.
   - `full-game` doit attendre `serverHost.hasActiveGameMap()`, puis laisser `CL_Frame` connecter le client local.
   - La transition vers `mode = "game"` se fait seulement quand le client atteint `ca_active` et que le refresh est pret.
   - `FullGameLocalSession` reste disponible uniquement pour la demo/tests herites, pas pour le chemin final.

4. Faire de `CL_Frame` la boucle client active
   - En mode jeu, remplacer l'avancement manuel client/session par `CL_Frame(mainContext, deltaMs, hooks)`.
   - Les hooks appellent `CL_SendCmd(inputContext)` pour produire les `clc_move`.
   - Apres `CL_Frame`, appeler `serverHost.frame(deltaMs)`, puis drainer les paquets serveur avec `CL_ReadPackets` pour reduire la latence d'un tick.
   - Les `stufftext` serveur doivent continuer a passer par `Cbuf_AddText/Cbuf_Execute`, pas par un raccourci web.

5. Creer une source de rendu serveur
   - Ajouter une source de rendu server-backed qui fournit `ClientRuntime`, `CL_BuildRefreshFrame`, `SCR_BuildScreenState`, `CL_BuildSkySnapshot` et les cvars renderer.
   - Deriver les brush-model snapshots depuis les entites client dont le configstring model commence par `*`.
   - Modifier `FullGameRenderSource` pour ne plus exiger un `GameRuntime`.
   - Remplacer l'acces direct `gameplayRuntime.assets.soundPaths` par un resolver `resolveSoundPath(soundIndex)`.
   - Les sons one-shot serveur passent par les hooks `CL_ParseServerMessage.onStartSound`; les sons de boucle entite passent par `client.cl.sound_precache`.

6. Terminer regles de jeu, mort et changement de niveau
   - Ne rien implementer dans `apps/web` pour la mort, respawn, intermission ou changement de niveau.
   - Verifier que ces transitions passent par `ClientThink`, `ClientBeginServerFrame`, `BeginIntermission`, `ExitLevel`, puis `gamemap`.
   - A chaque changement de map serveur, disposer/recreer le renderer Three si le `CS_MODELS + 1` courant change.
   - Garder save/load sur le host serveur actuel, mais revalider apres bascule authoritative.

7. Nettoyage final
   - Supprimer du chemin `full-game` toute dependance a `createFullGameLocalSession`.
   - Garder les helpers niveau A uniquement comme adapter de demo ou tests explicitement nommes.
   - Mettre a jour `PORTAGE_QUAKE2.md` et le plan realise pour signaler que le chemin full-game est serveur authoritative.
   - Ne pas toucher aux changements non lies dans le worktree.
   - Etat final : `full-game.ts` reste sur le chemin serveur authoritative ; `verify:full-game:demo-cleanup` verrouille l'absence d'import/creation du harnais local legacy.
   - Etat final : les commentaires des adapters/tests distinguent le chemin actif loopback serveur des harnais niveau A conserves pour demo/tests.

## Interfaces a modifier

- `FullGameServerHostOptions` : ajouter `qnet?: QcommonNetRuntime`.
- `FullGameServerHost` : conserver `hasActiveGameMap()` et exposer le nom/path de map courant pour le renderer.
- Nouveau `FullGameLocalTransport` : fournit `clientQnet`, `serverQnet`, et les queues loopback.
- `FullGameRenderSource` : remplacer `gameplayRuntime` obligatoire par :
  - `resolveSoundPath(soundIndex): string | null`
  - optionnellement `drainLocalGameplaySounds?: () => ...` pour la demo niveau A seulement.

## Tests et scenarios

- `npm run typecheck`
- `npm run verify:m-infantry`
- `npm run verify:full-game:input-bindings`
- Nouveau test transport : connect local complet jusqu'a `client_connect`.
- Nouveau test handshake : `newgame -> SV_Map -> connect -> new/configstrings/baselines/precache/begin -> ca_active`.
- Nouveau test authoritative input : `bind w +forward` produit `clc_move`, `SV_ClientThink`, mouvement serveur, snapshot client mis a jour.
- Nouveau test rendu source serveur : `CL_BuildRefreshFrame` issu du snapshot serveur alimente `full-game-render-loop`.
- Nouveau test changement niveau : `target_changelevel` ou `ExitLevel` queue `gamemap`, change la map serveur et recree la source de rendu.
- Nouveau test mort/respawn : degats letaux cote serveur, etat mort visible client, attaque apres delai declenche respawn source.
- Revalider : `verify:full-game:commands`, `server-host`, `server-snapshots`, `save-slots`, `three-renderer`, `gameplay`, `menu`, `cl-main`, `cl-input`, `server:init`, `server:ccmds`, `server:runtime`.
- Nettoyage final : `verify:full-game:demo-cleanup`, `verify:full-game:three-renderer`, `verify:full-game:authoritative-handshake`, `verify:full-game:authoritative-input`, `verify:full-game:render-source`, `verify:full-game:rules-transitions`.

## Hypotheses

- Cible : solo `baseq2` dans navigateur, avec assets locaux deja montes.
- Strategie choisie : serveur d'abord, pas maintien long du niveau A.
- Le transport local reste un adapter web ; aucune logique gameplay ne va dans `apps/web`.
- Les sauvegardes restent sur le backend web synchrone existant tant que les callbacks serveur sont synchrones.
- Les plans deplaces sous `PLANS_REALISES` sont l'historique ; le suivi vivant reste `PORTAGE_QUAKE2.md`.
