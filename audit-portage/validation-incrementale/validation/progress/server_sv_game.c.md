# Progress - Quake-2-master/server/sv_game.c

## Etat

- Statut: Termine
- Dernier lot valide: fichier complet `sv_game.c`.
- Compteurs: 39 entites, 21 validees, 18 non applicables.

## Lot valide pendant cette session

Bloc complet d'interface serveur/game:

- `PF_Unicast`
- `PF_dprintf`
- `PF_cprintf`
- `PF_centerprintf`
- `PF_error`
- `PF_setmodel`
- `PF_Configstring`
- `PF_WriteChar`
- `PF_WriteByte`
- `PF_WriteShort`
- `PF_WriteLong`
- `PF_WriteFloat`
- `PF_WriteString`
- `PF_WritePos`
- `PF_WriteDir`
- `PF_WriteAngle`
- `PF_inPVS`
- `PF_inPHS`
- `PF_StartSound`
- `SV_ShutdownGameProgs`
- `SV_InitGameProgs`

Les 18 entrees restantes de la matrice sont des variables locales generees comme globales (`p`, `msg`, `argptr`, `n`, `i`, `leafnum`, `cluster`, `mask`) et sont marquees `Non applicable`.

## Preuves

- Comparaison source C `Quake-2-master/server/sv_game.c` vs port TS `packages/server/src/sv_game.ts`.
- Commentaires d'en-tete des fonctions portees verifies.
- Runtime verifie via `createServerRuntimeFacade`, `SV_InitGame`, `SV_SpawnServer`, `SV_Frame`, `SV_SendClientMessages` et les imports exposes au module game.
- `apps/web` verifie via `createFullGameServerHost`, qui instancie le facade serveur et le game API.
- `renderer-three` verifie indirectement via snapshots/configstrings/entities produits par ce pont serveur/game puis consommes par le flux full-game.

## Tests de reference

- `npm run verify:server:game`
- `npm run verify:server:init`
- `npm run verify:server:runtime`
- `npm run verify:full-game:server-host`
- `npm run verify:full-game:server-snapshots`
- `npm run verify:full-game:three-renderer`
- `npm run typecheck`

## Prochain lot recommande

Aucun pour `server/sv_game.c`; reprendre le prochain fichier serveur prioritaire dans `AVANCEMENT_GLOBAL.md`, par exemple `server/sv_init.c`, `server/sv_main.c`, `server/sv_send.c`, `server/sv_user.c` ou `server/sv_world.c` selon coordination.
