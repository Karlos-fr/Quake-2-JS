# Progress - Quake-2-master/game/g_svcmds.c

## Session 2026-05-01

- Lot traite: `Svcmd_Test_f`.
- Checklist appliquee: identification matrice/source/cible, comparaison C vs TS, commentaire d'en-tete, branchement runtime, apps/web, renderer-three, tests.
- Verdict: `Svcmd_Test_f` valide. Le C emet `gi.cprintf(NULL, PRINT_HIGH, "Svcmd_Test_f()\n")`; le TS emet le meme message via `context.gi.cprintf(null, PRINT_HIGH, "Svcmd_Test_f()\n")`, sans retour ni effet de bord supplementaire.
- Runtime: atteignable via `ServerCommand` pour la sous-commande `test`, puis via le serveur `SV_ServerCommand_f` qui appelle `ge.ServerCommand()`.
- apps/web: le host navigateur cree l'API game portee avec le hook `writeFile`; pour `sv test`, aucune logique web parallele n'est attendue et le flux doit passer par la commande serveur portee.
- renderer-three: non applicable pour ce lot, car `Svcmd_Test_f` ne produit ni entite visible, modele, frame, image, particule, beam, dlight, temp entity, areabits, camera ou scene.
- Tests lances: `npm run verify:g-svcmds`, `npm run verify:server:ccmds`, `npm run verify:full-game:server-host` OK.
- Corrections TS: aucune.

## Session 2026-05-01 - etat IP filter

- Lot traite: `ipfilter_t`, `mask`, `compare`, `MAX_IPFILTERS`, `numipfilters`.
- Checklist appliquee: identification matrice/source/cible, comparaison C vs TS des struct/constantes/globals, documentation pertinente, branchement runtime, apps/web, renderer-three, tests, mise a jour matrice/progress/global.
- Verdict: lot valide. Le C declare `ipfilter_t { unsigned mask; unsigned compare; }`, `MAX_IPFILTERS` a 1024, `ipfilters[MAX_IPFILTERS]` et `numipfilters`; le TS conserve `mask`/`compare` dans `ipfilter_t`, expose `MAX_IPFILTERS = 1024` et regroupe les globals mutables dans `GameServerCommandState`.
- Initialisation: `createGameServerCommandState()` cree 1024 slots independants `{ mask: 0, compare: 0 }` et `numipfilters: 0`, equivalent a l'etat statique zero-initialise du C.
- Runtime: l'etat est consomme par les commandes `ServerCommand` (`addip`, `removeip`, `listip`, `writeip`) et par `SV_FilterPacket`; `g_main.ts` l'attache a l'export game et l'utilise dans `ClientConnect` pour refuser les IP bannies.
- apps/web: le host full-game consomme l'export game porte; aucune logique web parallele de filtrage IP n'est attendue pour ce lot. Le placeholder web n'est pas le chemin runtime autoritatif.
- renderer-three: non applicable, l'etat IP filter ne produit ni modele, frame, image, particule, beam, dlight, temp entity, areabits, camera ou scene.
- Tests lances: `npm run verify:g-svcmds`, `npm run verify:server:ccmds`, `npm run verify:full-game:server-host`, `npm run typecheck` OK.
- Corrections TS portees: aucune. Test renforce dans `scripts/verify/quake2-g-svcmds.ts` pour prouver l'etat initial et le couple `mask`/`compare`.

## Session 2026-05-01 - StringToFilter

- Lot traite: `StringToFilter` et ses locaux `num`, `b`, `m`.
- Checklist appliquee: identification matrice/source/cible, comparaison C vs TS du parsing d'adresse, validation des erreurs, effets de bord sur `filter.mask`/`filter.compare`, commentaire d'en-tete, branchement runtime, apps/web, renderer-three, tests, mise a jour matrice/progress/global.
- Verdict: lot valide apres correction. Le C refuse une adresse dont l'octet courant ne commence pas par un chiffre, y compris chaine vide ou separateur final; le TS le fait maintenant aussi avant chaque octet. Les octets non nuls reglent le masque a 255, les octets zero ou omis restent wildcard, puis `mask` et `compare` sont packes en little-endian comme le cast C `*(unsigned *)`.
- Locaux: le buffer C `num` est represente par la tranche `source.slice(start, cursor)`; `b[4]` par `bytes`; `m[4]` par `mask`. Les tests prouvent `192.246.40`, `0.0.5.0`, les erreurs `1.` et chaine vide, et le comportement permissif original avec un separateur non point entre runs numeriques.
- Runtime: `StringToFilter` est appelee par `SVCmd_AddIP_f` et `SVCmd_RemoveIP_f`, atteignables via `ServerCommand` et la commande serveur `sv`; les filtres produits sont ensuite consommes par `SV_FilterPacket` dans la gate `ClientConnect`.
- apps/web: le host full-game consomme l'API game portee et son etat serveur; aucune logique web parallele de parsing IP n'est attendue pour ce lot.
- renderer-three: non applicable, le parsing IP ne produit ni modele, frame, image, particule, beam, dlight, temp entity, areabits, camera ou scene.
- Tests lances: `npm run verify:g-svcmds`, `npm run verify:server:ccmds`, `npm run verify:full-game:server-host`, `npm run typecheck` OK.
- Corrections TS portees: `packages/game/src/g_svcmds.ts` refuse maintenant explicitement les octets absents avant `charCodeAt`. Test renforce dans `scripts/verify/quake2-g-svcmds.ts`.

## Session 2026-05-01 - SV_FilterPacket

- Lot traite: `SV_FilterPacket` et ses locaux `i`, `in`, `m`, `p`.
- Checklist appliquee: identification matrice/source/cible, comparaison C vs TS du filtrage d'adresse entrante, valeurs retour selon `filterban`, effets de bord absents, commentaire d'en-tete, branchement runtime, apps/web, renderer-three, tests, mise a jour matrice/progress/global.
- Verdict: lot valide. Le C scanne l'adresse textuelle dans `m[4]`, packe `in = *(unsigned *)m`, compare chaque entree `(in & ipfilters[i].mask) == ipfilters[i].compare`, puis retourne `filterban` si une entree matche et `!filterban` sinon; le TS conserve ce flux avec `bytes`, `address`, `state.ipfilters[index]` et `getFilterBanValue`.
- Locaux: le local C `i` est represente par `octet` pour la phase de parsing et `index` pour la boucle de filtres; `in` par `address`; `m[4]` par `bytes`; `p` par `cursor`. Les tests prouvent le match reseau `192.246.40`, la non-correspondance, l'inversion `filterban=0`, le separateur permissif original et le packing byte avant comparaison.
- Runtime: `SV_FilterPacket` est consommee par `validateClientConnect` dans `g_main.ts`, appelee par l'export `ClientConnect`; les filtres sont alimentes par `ServerCommand`/`SVCmd_AddIP_f`.
- apps/web: le host full-game cree l'API game portee via `GetGameApiFunction`; l'adresse IP n'est pas filtree par une logique web parallele. Le flux attendu passe par le runtime serveur porte, verifie par `verify:full-game:server-host`.
- renderer-three: non applicable, le filtrage d'adresse decide l'acceptation de connexion et ne produit ni entite visible, modele, frame, image, particule, beam, dlight, temp entity, areabits, camera ou scene.
- Tests lances: `npm run verify:g-svcmds`, `npm run verify:g-main`, `npm run verify:server:ccmds`, `npm run verify:full-game:server-host`, `npm run typecheck` OK.
- Corrections TS portees: aucune dans le port. Test renforce dans `scripts/verify/quake2-g-svcmds.ts`.

## Session 2026-05-01 - SVCmd_AddIP_f

- Lot traite: `SVCmd_AddIP_f` et son local `i`.
- Checklist appliquee: identification matrice/source/cible, comparaison C vs TS de l'ajout IP, validation des messages console, effets de bord sur `numipfilters`/`ipfilters`, commentaire d'en-tete, branchement runtime, apps/web, renderer-three, tests, mise a jour matrice/progress.
- Verdict: lot valide. Le C verifie `gi.argc() < 3`, scanne `ipfilters[0..numipfilters)` jusqu'au premier `compare == 0xffffffff`, agrandit `numipfilters` si aucun slot libre n'existe, refuse la liste pleine avec le meme message, puis appelle `StringToFilter`; le TS conserve ce flux avec `context.gi.argc()`, le local `index`, `FREE_IPFILTER_COMPARE`, `MAX_IPFILTERS` et le meme fallback sentinel apres parse invalide.
- Local: le local C `i` est represente par `index`; les tests prouvent le scan du premier slot libre, la croissance quand aucun slot libre n'est disponible, la liste pleine sans ecrasement, et l'absence d'allocation quand l'argument manque.
- Runtime: `SVCmd_AddIP_f` est atteignable par `ServerCommand` pour `addip`, puis par la commande serveur `sv` via `SV_ServerCommand_f`; les filtres crees sont consommes par `SV_FilterPacket` dans `ClientConnect`.
- apps/web: le host full-game cree l'API game portee avec `GetGameApiFunction`; aucune logique web parallele de filtrage IP n'est attendue pour ce lot, et le flux navigateur doit passer par le runtime serveur porte.
- renderer-three: non applicable, l'ajout d'un filtre IP ne produit ni entite visible, modele, frame, image, particule, beam, dlight, temp entity, areabits, camera ou scene.
- Tests lances: `npm run verify:g-svcmds`, `npm run verify:g-main`, `npm run verify:server:ccmds`, `npm run verify:full-game:server-host`, `npm run typecheck` OK.
- Corrections TS portees: aucune. Test renforce dans `scripts/verify/quake2-g-svcmds.ts` pour couvrir explicitement `SVCmd_AddIP_f`.

## Session 2026-05-01 - SVCmd_RemoveIP_f

- Lot traite: `SVCmd_RemoveIP_f`, centre sur la recherche du filtre, le compactage du tableau et les messages `Removed.` / `Didn't find`.
- Checklist appliquee: identification matrice/source/cible, comparaison C vs TS de la suppression IP, validation des messages console, effets de bord sur `numipfilters`/`ipfilters`, commentaire d'en-tete, branchement runtime, apps/web, renderer-three, tests, mise a jour matrice/progress/global.
- Verdict: lot valide apres correction. Le C verifie `gi.argc() < 3`, convertit `gi.argv(2)` avec `StringToFilter`, cherche un match exact `(mask, compare)`, compacte les entrees suivantes vers la gauche, decremente `numipfilters`, emet `Removed.` puis retourne; si aucun match n'est trouve, il emet `Didn't find <ip>.`.
- Compactage: le TS conserve maintenant le comportement C du slot hors plage active apres decrement: il n'efface plus `ipfilters[numipfilters]`, qui garde la valeur stale issue du compactage. Ce slot reste ignore par `addip`, `listip`, `writeip` et `SV_FilterPacket` tant qu'il est hors `numipfilters`.
- Runtime: `SVCmd_RemoveIP_f` est atteignable par `ServerCommand` pour `removeip`, puis par la commande serveur `sv` via `SV_ServerCommand_f`; les filtres retires ne sont plus consommes par `SV_FilterPacket` dans `ClientConnect`.
- apps/web: le host full-game cree l'API game portee avec `GetGameApiFunction`; aucune logique web parallele de filtrage IP n'est attendue pour ce lot, et le flux navigateur doit passer par le runtime serveur porte.
- renderer-three: non applicable, la suppression d'un filtre IP ne produit ni entite visible, modele, frame, image, particule, beam, dlight, temp entity, areabits, camera ou scene.
- Tests lances: `npm run verify:g-svcmds`, `npm run verify:g-main`, `npm run verify:server:ccmds`, `npm run verify:full-game:server-host`, `npm run typecheck` OK.
- Corrections TS portees: `packages/game/src/g_svcmds.ts` n'efface plus le slot final apres compactage. Test renforce dans `scripts/verify/quake2-g-svcmds.ts` pour couvrir explicitement `SVCmd_RemoveIP_f`.

## Session 2026-05-01 - SVCmd_ListIP_f

- Lot traite: `SVCmd_ListIP_f` et ses locaux `i` et `b`.
- Checklist appliquee: identification matrice/source/cible, comparaison C vs TS de l'affichage de liste IP, validation du format console, effets de bord absents, commentaire d'en-tete, branchement runtime, apps/web, renderer-three, tests, mise a jour matrice/progress/global.
- Verdict: lot valide. Le C imprime `Filter list:\n`, parcourt `i=0 ; i<numipfilters ; i++`, caste `ipfilters[i].compare` dans `byte b[4]`, puis imprime `%3i.%3i.%3i.%3i\n`; le TS conserve ce flux avec `index`, `unpackFilterBytes(compare)` et `context.gi.cprintf` au format original.
- Locaux: le local C `i` est represente par `index`; le test prouve que la boucle s'arrete a `numipfilters` et ignore un slot stale hors plage active. Le local C `b[4]` est represente par `bytes`; le test prouve l'ordre little-endian et le padding `%3i`, y compris un octet `200`.
- Runtime: `SVCmd_ListIP_f` est atteignable par `ServerCommand` pour `listip`, puis par la commande serveur `sv` via `SV_ServerCommand_f`; elle ne modifie pas les filtres consommes par `SV_FilterPacket`.
- apps/web: le host full-game cree l'API game portee avec `GetGameApiFunction`; aucune logique web parallele de liste IP n'est attendue pour ce lot, et le flux navigateur doit passer par le runtime serveur porte.
- renderer-three: non applicable, l'affichage console des filtres IP ne produit ni entite visible, modele, frame, image, particule, beam, dlight, temp entity, areabits, camera ou scene.
- Tests lances: `npm run verify:g-svcmds`, `npm run verify:g-main`, `npm run verify:server:ccmds`, `npm run verify:full-game:server-host`, `npm run typecheck` OK.
- Corrections TS portees: aucune dans le port. Test renforce dans `scripts/verify/quake2-g-svcmds.ts` pour couvrir explicitement `SVCmd_ListIP_f`, ses locaux `i` et `b`.

## Prochain lot recommande

- Continuer avec `SVCmd_WriteIP_f`, puis ses locaux `name`, `b`, `i`, `game` et l'adaptation `sprintf` si le lot reste coherent.
