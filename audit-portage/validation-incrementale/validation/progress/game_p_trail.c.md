# Progress - Quake-2-master/game/p_trail.c

## Session 2026-05-06

- Lot traite: fichier complet `p_trail.c`, incluant `TRAIL_LENGTH`, `trail`, `trail_head`, `trail_active`, `NEXT`, `PREV`, `PlayerTrail_Init`, `PlayerTrail_Add`, `PlayerTrail_New`, `PlayerTrail_PickFirst`, `PlayerTrail_PickNext`, `PlayerTrail_LastSpot`, et les variables locales generees dans la matrice.
- Verdict: termine; les 12 entites proprietaires sont `Valide`, et les 7 lignes locales generees sont `Non applicable`.
- Comparaison C/TS: les globals C sont portes sur `runtime.playerTrail`; les macros `NEXT`/`PREV` gardent le masque circulaire `TRAIL_LENGTH - 1`; les fonctions conservent l'activation hors deathmatch, l'ajout horodate, le yaw par `vectoyaw`, le choix du premier/prochain marqueur et le dernier spot par `PREV(trail_head)`.
- Commentaires d'en-tete: les fonctions portees de `packages/game/src/p_trail.ts` declarent `Original name`, `Source: game/p_trail.c`, `Category: Ported`, `Fidelity level: Close`, comportement et notes de portage.
- Runtime: branche via `g_spawn.ts`/`SpawnEntities` pour `PlayerTrail_Init`, `p_client.ts`/`ClientBeginServerFrame` pour `PlayerTrail_LastSpot` et `PlayerTrail_Add`, et `g_ai.ts`/`ai_run` pour `PlayerTrail_PickFirst` et `PlayerTrail_PickNext`.
- apps/web: pas de logique parallele attendue; `apps/web` utilise le host full-game/local et consomme les effets gameplay via snapshots/playerstate. Le trail joueur est un etat serveur d'IA non rendu directement.
- renderer-three: aucune sortie visible directe attendue pour `p_trail.c`; les marqueurs `player_trail` servent uniquement d'aide d'IA serveur. Les sorties visibles eventuelles sont les positions/yaw des monstres apres poursuite, deja consommees via les entity states MD2/camera du flux client/renderer.
- Tests lances: `npm run verify:p-trail`, `npm run verify:g-ai`, `npm run verify:g-spawn`, `npm run verify:p-client`.
- Correction appliquee: `scripts/verify/quake2-p-trail.ts` renforce pour couvrir les marqueurs `player_trail`, le wrap circulaire, le fallback visible `PREV(marker)` et les no-op inactifs.

## Prochain lot recommande

Aucun pour `p_trail.c`; fichier clos. Reprendre le prochain fichier prioritaire depuis `AVANCEMENT_GLOBAL.md`.

## Blocages

Aucun.
