# Progress - Quake-2-master/server/sv_main.c

## Dernier lot valide

- Lot traite: fin du fichier `sv_main.c`, avec `SV_UserinfoChanged`, locaux C generes associes (`val`, `i`), `SV_Init`, `SV_FinalMessage`, local `i`, et `SV_Shutdown`.
- Source C comparee: definitions dans `Quake-2-master/server/sv_main.c`, de `SV_UserinfoChanged` a `SV_Shutdown`.
- Cible TS comparee: `packages/server/src/sv_main.ts`, avec integration runtime dans `SVC_DirectConnect`, `SV_ExecuteClientMessage`, `SV_Init`, `SV_FinalMessage`, `SV_Shutdown`, facade runtime `packages/server/src/runtime.ts`, bridge `packages/server/src/host.ts`, host navigateur `apps/web/src/full-game-server-host.ts`, et consommation visible indirecte via snapshots/renderer.
- Corrections appliquees: `SV_UserinfoChanged` tronque maintenant `cl.name` a 31 caracteres comme `char name[32]` en C; le parsing `rate`/`msg` reproduit le fallback `atoi(...)=0` pour les valeurs invalides; le harness `quake2-sv-main.ts` couvre aussi truncation, high-bit mask, rate min/max/default, `msg` absent/invalide/signe, `ClientUserinfoChanged`, defaults `SV_Init`, `SV_FinalMessage` et lifecycle `SV_Shutdown`.
- Commentaires d'en-tete verifies: `SV_UserinfoChanged`, `SV_Init`, `SV_FinalMessage`, `SV_Shutdown`; commentaire `SV_UserinfoChanged` complete pour documenter la fidelite `strncpy`/`atoi`.
- Branchement runtime: valide; `SV_UserinfoChanged` est atteint depuis `SVC_DirectConnect` et `SV_ExecuteClientMessage`/`clc_userinfo`; `SV_Init` est expose via le bridge runtime; `SV_FinalMessage` est appele par `SV_Shutdown`; `SV_Shutdown` notifie clients/masters, ferme les demos, appelle `SV_ShutdownGameProgs` et remet les etats serveur a zero.
- `apps/web`: valide via `createFullGameServerHost`, qui utilise le runtime serveur porte pour init/lifecycle/shutdown et injecte le userinfo local sans remplacer la logique runtime principale.
- `renderer-three`: aucune integration directe attendue pour init/shutdown/userinfo serveur; les donnees visibles de userinfo passent par `ClientUserinfoChanged` cote game, configstrings/playerstate/snapshots, puis sont consommees par le renderer. Les tests full-game snapshots/three-renderer confirment que le flux visible reste branche.

## Tests lances

- `npm run verify:server:main`
- `npm run verify:server:runtime`
- `npm run verify:server:user`
- `npm run verify:full-game:server-host`
- `npm run verify:full-game:server-snapshots`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

## Decisions importantes

- Les variables `val` et `i` detectees pour `SV_UserinfoChanged` et `SV_FinalMessage` sont des locaux C, pas des entites proprietaires TS separees.
- `SV_UserinfoChanged` reste `Close`: les chaines JS remplacent les buffers C, mais la longueur utile du nom et le comportement `atoi` sont maintenant explicitement reproduits.
- `SV_Shutdown` reste `Close`: les tableaux/objets JS sont remis a zero en place au lieu d'etre liberes avec `Z_Free`, pour conserver les references runtime.
- Toutes les lignes de `server_sv_main.c.md` sont maintenant `Valide` ou `Non applicable`.

## Prochain lot recommande

- Aucun pour `server/sv_main.c`: matrice terminee.

---

## Lot precedent

- Lot traite: heartbeat/shutdown master `HEARTBEAT_SECONDS`, `Master_Heartbeat`, `Master_Shutdown`, plus locaux C generes associes (`string`, `i`).
- Source C comparee: definitions dans `Quake-2-master/server/sv_main.c`, de `HEARTBEAT_SECONDS` a `Master_Shutdown`.
- Cible TS comparee: `packages/server/src/sv_main.ts`, avec integration runtime dans `SV_Frame` et `SV_Shutdown`, facade runtime `packages/server/src/runtime.ts`, bridge top-level `packages/server/src/host.ts`, appel `qcommon` serveur, et adapter navigateur `apps/web/src/full-game-server-host.ts`.
- Corrections appliquees: restauration du nom source `HEARTBEAT_SECONDS` dans `sv_main.ts` et utilisation via `HEARTBEAT_MSEC`; le harness `quake2-sv-main.ts` verifie le seuil 300s, le throttle, le wraparound, les branches dedicated/public et les paquets master shutdown.
- Commentaires d'en-tete verifies: `Master_Heartbeat`, `Master_Shutdown`.
- Branchement runtime: valide; `SV_Frame` appelle `Master_Heartbeat` apres l'envoi client/demo, et `SV_Shutdown` appelle `Master_Shutdown` avant `SV_ShutdownGameProgs`.
- `apps/web`: valide via `createFullGameServerHost.frame()` et `shutdown()`, qui deleguent au runtime serveur porte sans logique parallele.
- `renderer-three`: aucune integration directe attendue; ce lot ne produit pas de modeles, frames, images, particules, beams, dlights, temp entities, areabits, camera ou scene. Les tests full-game snapshots/three-renderer confirment que le flux serveur visible reste intact.

## Tests lances precedents

- `npm run verify:server:main`
- `npm run verify:server:runtime`
- `npm run verify:full-game:server-host`
- `npm run verify:full-game:server-snapshots`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

## Decisions importantes precedentes

- La premiere ligne `Master_Shutdown` de la matrice correspond a la declaration avancee C; elle est marquee `Non applicable` avec justification. La definition plus bas est validee.
- Les cvars `allow_download*`, `sv_enforcetime`, `sv_noreload` et `sv_airaccelerate` restent partagees avec les modules qui les consomment (`sv_user`, `sv_init`) via le facade runtime; `sv_main.ts` conserve leur registration d'origine dans `SV_Init`.
- Les variables locales C detectees par la matrice pour `SV_StatusString` et le bloc connectionless sont marquees `Non applicable`: elles ne sont pas des entites proprietaires TS separees et sont couvertes par les fonctions portees.
- `SVC_RemoteCommand` reste `Close`: le redirect C global `Com_BeginRedirect`/`Com_EndRedirect` est modele par le callback `executeRconCommand` et une reponse out-of-band `print`.
- `SV_ReadPackets` expose un retour `number` TS pour le harness, alors que le C est `void`; ce retour ne change pas les effets runtime.
- `SV_Frame` reste `Close`: l'appel C `rand()` est modele par le callback optionnel `randomInt` du contexte runtime.
- `Master_Heartbeat`/`Master_Shutdown` restent `Close`: le format varargs C `Netchan_OutOfBandPrint(..., "heartbeat\n%s", string)` est modele par interpolation de chaine TS, avec le meme payload OOB.

## Prochain lot recommande precedent

- Continuer avec `SV_UserinfoChanged` et locaux associes (`val`, `i`), puis `SV_Init` si le lot reste coherent.
