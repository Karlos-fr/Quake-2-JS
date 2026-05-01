# Progress - Quake-2-master/game/g_phys.c

- Statut: En cours
- Dernier lot valide: `SV_TestEntityPosition` avec locales generees `trace` / `mask`.
- Prochain lot recommande: `SV_CheckVelocity` avec sa locale `i`.
- Tests de reference: `npm run verify:g-phys`, `npm run typecheck`
- Blocages: aucun pour le lot valide.

## Session 2026-05-01 - `SV_TestEntityPosition`

- Lot traite: `SV_TestEntityPosition`, `trace`, `mask` (incluant l'entree `mask` dupliquee par la matrice).
- Comparaison C/TS: le port choisit `ent.clipmask || MASK_SOLID`, appelle le bridge collision avec start=end sur la position courante, puis retourne `runtime.entities[0]` si `trace.startsolid`, equivalent au retour C `g_edicts`; sinon `null`.
- Commentaire d'en-tete: present et conforme (`Original name`, `Source`, `Category: Ported`, `Fidelity level`, comportement et notes de portage).
- Runtime: atteignable depuis `G_RunFrame` / `G_RunEntity` via `SV_Physics_Pusher` -> `SV_Push`, ou directement par les helpers de physique exportes.
- apps/web: le flux full/local game installe un bridge collision dans le runtime gameplay; aucune logique parallele web ne remplace cette fonction.
- renderer-three: pas de sortie directe a consommer; la fonction influence les deplacements de pushers, dont les positions `s.origin` visibles sont ensuite exposees au client puis au renderer.
- Correction: ajout d'assertions ciblees dans `scripts/verify/quake2-g-phys.ts`.
- Tests lances: `npm run verify:g-phys` OK; `npm run typecheck` OK en passe de coordination apres integration des lots paralleles.
