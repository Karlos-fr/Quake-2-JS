# Progress - Quake-2-master/game/m_rider.h

- Statut: Termine
- Dernier lot valide: header genere complet, de `FRAME_stand201` a `FRAME_stand260`, plus `MODEL_SCALE`.
- Tests de reference lances:
  - `npm run verify:m-rider:header`
  - `npm run verify:m-boss3`
  - `npm run verify:m-boss3:source-parity`
  - `npm run verify:m-boss32:header`
  - `npm run verify:full-game:render-source`
  - `npm run verify:full-game:three-renderer`
  - `npm run verify:web-render-order`
  - `npm run typecheck`
- Corrections appliquees: extension du harness `scripts/verify/quake2-m-rider-header.ts` pour comparer exhaustivement les 61 `#define` de `Quake-2-master/game/m_rider.h` aux exports de `packages/game/src/m_rider.ts`.

## Session 2026-05-06

- Lot traite: header genere complet, de `FRAME_stand201` a `FRAME_stand260`, plus `MODEL_SCALE`.
- Comparaison H vs TS: le test parse directement `Quake-2-master/game/m_rider.h` et compare chaque macro a l'export homonyme de `packages/game/src/m_rider.ts`; valeurs alignees pour les 61 constantes.
- Ownership/commentaires: cible proprietaire confirmee dans `packages/game/src/m_rider.ts`; le commentaire de fichier documente `Source: Quake II original / game/m_rider.h`, le port declaratif du header ModelGen et l'absence de deviation.
- Runtime: conforme. `m_rider.h` n'est pas inclus par le runtime C du stand-in `m_boss3.c`, qui utilise `m_boss32.h`; le port TS conserve donc `m_rider.ts` comme header declaratif exporte sans forcer une integration runtime divergente. Les flux visibles boss3/makron actifs restent couverts par `m_boss3.ts` et `m_boss32.ts`.
- apps/web: conforme via le runtime porte; aucune logique web parallele rider/boss3 ne remplace ces constantes ou les sorties runtime.
- renderer-three: conforme. Les sorties visibles attendues pour rider/boss3 sont les modeles alias `models/monsters/boss3/rider/tris.md2`, frames, skins et interpolation de scene produits par le runtime/client et consommes par le renderer Three via le flux refresh generique; `m_rider.h` seul ne produit pas de sortie runtime directe.
- Verdict: Valide.
- Prochain lot recommande: aucun dans `m_rider.h`; fichier clos.
