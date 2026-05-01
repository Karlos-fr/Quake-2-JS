# Progress TS - apps/web/src/full-game-server-host.ts

## Etat courant

- Statut: Termine.
- Dernier lot valide: toutes les entites restantes du fichier.
- Tests de reference: `npm run verify:full-game:server-host`, `npm run verify:full-game:save-slots`, `npm run typecheck`.

## Decisions

- Les trois symboles publics du lot sont des adapters web locaux, sans ownership C/H direct.
- Les helpers internes restants sont des entites `Category: New` avec `Original name: N/A` et une `Source` explicite `N/A (...)`.
- L'entete de fichier declare explicitement que le fichier n'est pas un port source direct et que le comportement serveur reste dans `packages/server`.
- Le branchement runtime attendu passe par `createServerRuntimeFacade`, `SV_Frame`, `SV_BuildClientFrame`, `SV_WriteFrameToClient` et `GetGameApiFunction`.
- `apps/web` consomme ce host depuis `full-game.ts`; `renderer-three` n'est pas appele directement par ces symboles, les sorties visibles passent par les snapshots/client frames.
- Les noms `buildSavePath`, `encodeConfigStrings`, `decodeConfigStrings`, `writeFixedString`, `readFixedString` et `concatBytes` existent aussi comme helpers prives dans `packages/server/src/sv_ccmds.ts`; les versions de ce fichier restent des helpers browser-storage locaux et ne revendiquent pas l'ownership C/H.
- `cloneUsercmd` existe aussi comme helper prive dans d'autres packages; ici il sert uniquement a retourner une copie defensive de la derniere commande client locale.

## Prochain lot recommande

- Aucun.

## Blocages

- `npm run verify:full-game:audio-routing` bloque avant verification utile sur l'import inexistant `packages/client/src/types.js` dans `scripts/verify/quake2-full-game-audio-routing.ts`; non corrige ici car hors fichier TS cible.
