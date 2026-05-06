# Progress - Quake-2-master/game/p_client.c

- Statut: En cours
- Dernier lot valide: gros lot initial `SP_FixCoopSpots` / spawn points / client persistent state / body queue / respawn / `PutClientInServer` / connect-begin-disconnect, jusqu'a `ClientDisconnect`.
- Entites validees: 34 / 40
- Tests de reference:
  - `npm run verify:p-client`
- Decisions:
  - Les lignes de variables locales generees comme `global` ont ete retirees de la matrice; `pm_passent` reste la seule globale proprietaire a valider avec `PM_trace`.
  - Les doublons de declaration/appel de fonctions ont ete dedupliques dans la matrice.
  - `SelectRandomDeathmatchSpawnPoint` a ete corrige pour conserver l'algorithme C original de selection des deux points les plus proches, sans decalage de l'ancien `spot1`.
- Prochain lot recommande: `pm_passent`, `PM_trace`, `CheckBlock`, `PrintPmove`, puis `ClientThink` si le lot reste coherent; garder `ClientBeginServerFrame` pour la fin ou un lot separe.
- Blocages: aucun.
