# Progress TS - packages/game/src/g_phys.ts

- Dernier lot valide: validation croisee complete de `packages/game/src/g_phys.ts`.
- Lot traite: toutes les lignes `Couvert C/H` verifiees contre les matrices C/H, les 9 lignes `A auditer` classees, et les entetes incomplets `Category: New` completes.
- Corrections appliquees: suppression du doublon local `M_CheckGround` au profit du port proprietaire `packages/game/src/g_monster.ts`; ajout des metadonnees `Original name: N/A` et `Source: N/A (...)` sur les helpers locaux `New`.
- Tests de reference: `npm run verify:g-phys`; `npm run typecheck`; `npm run verify:local-gameplay-sync`; `npm run verify:full-game:three-renderer`; `npm run verify:web-render-order`.
- Integration runtime: integree via `G_RunFrame`/`G_RunEntity`, avec le `G_RunFrame` local classe comme helper runtime et le port proprietaire source conserve dans `packages/game/src/g_main.ts`.
- Integration apps/web: non applicable directement; apps/web consomme ce flux par le runtime gameplay/server-backed et les snapshots/evenements produits.
- Integration renderer-three: non applicable directement; renderer-three consomme les positions, angles, sons et sorties visibles en aval sans logique gameplay parallele.
- Blocages: aucun.
- Prochain lot recommande: aucun pour ce fichier TS.
