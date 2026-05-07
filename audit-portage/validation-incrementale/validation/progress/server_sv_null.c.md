# Progress - Quake-2-master/server/sv_null.c

## Session 2026-05-07

- Lot traite: `SV_Init`, `SV_Shutdown`, `SV_Frame`.
- Verdict: fichier clos cote `server/sv_null.c`; les 3 fonctions sont `Valide`.
- Source C: `SV_Init(void)`, `SV_Shutdown(char *finalmsg, qboolean reconnect)` et `SV_Frame(float time)` sont des corps vides dans `Quake-2-master/server/sv_null.c`.
- Cible TS proprietaire: `packages/server/src/sv_null.ts` conserve les noms originaux et implemente les trois fonctions en no-op strict; les parametres ignores de `SV_Shutdown` et `SV_Frame` sont explicitement consommes par `void`.
- Commentaires d'en-tete: verifies pour les trois fonctions avec `Original name`, `Source`, `Category: Ported`, `Fidelity level: Strict`, `Behavior` et `Porting notes`.
- Branchement runtime: les stubs proprietaires restent disponibles dans `sv_null.ts`; le point d'entree public `packages/server/src/index.ts` reexporte le pont `packages/server/src/host.ts`, qui conserve le no-op par defaut puis forward vers `configureServerHost` / `configureServerHostFromFacade` quand un runtime serveur complet est attache.
- `apps/web`: applicable seulement via le serveur complet; `apps/web/src/full-game-server-host.ts` appelle `facade.main.SV_Frame` et `facade.main.SV_Shutdown`, donc ne masque pas la logique runtime principale par le stub null.
- `packages/renderer-three`: non applicable justifie; ces trois fonctions null-server ne produisent directement ni entites visibles, ni modeles, frames, images, particules, beams, dlights, temp entities, areabits, camera ou donnees de scene. Les sorties visibles du full-game passent par snapshots client/refdef, pas par `sv_null`.
- Corrections appliquees: aucune correction TS necessaire.
- Tests lances:
  - `npm run verify:server:null` -> ok.
  - `npm run verify:server:runtime` -> ok.
  - `npm run verify:full-game:server-host` -> ok.
  - `npm run typecheck` -> ok.

## Checklist appliquee

- Identification matrice/source/cible confirmee; aucune cible vide, aucun renommage et aucun doublon proprietaire problematique pour `sv_null.ts`.
- Comparaison C vs TS effectuee sur entrees, sorties, valeurs retour, branches, effets de bord et parametres ignores.
- Entetes de fonctions verifies.
- Runtime, `apps/web` et `packages/renderer-three` juges selon l'integration attendue, pas seulement selon les references existantes.
- Tests cibles et typecheck lances pendant la session avant de marquer `Valide`.

## Prochain lot recommande

- Aucun dans `server/sv_null.c`.
- Proposition pour `AVANCEMENT_GLOBAL.md`: `Statut=Termine`, `Validees=3`, `Non applicables=0`, `Prochain lot=Aucun lot restant dans server/sv_null.c: les trois stubs null-server sont valides.`
