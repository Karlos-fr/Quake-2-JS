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

## Prochain lot recommande

- Continuer avec `StringToFilter` et ses locaux `num`, `b`, `m` si le lot reste centre sur le parsing d'adresse.
