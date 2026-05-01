# Progress - Quake-2-master/game/g_phys.c

- Statut: En cours
- Dernier lot valide: `SV_CheckVelocity` avec sa locale `i`.
- Prochain lot recommande: `SV_RunThink` avec sa locale `thinktime`.
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

## Session 2026-05-01 - `SV_CheckVelocity`

- Lot traite: `SV_CheckVelocity`, locale `i`.
- Comparaison C/TS: le C parcourt les trois composantes et clamp `ent->velocity[i]` sur `+/-sv_maxvelocity->value`; le TS parcourt les trois composantes, utilise `runtime.maxvelocity` dans les chemins physique normaux, et garde la valeur par defaut 2000 pour les appels directs.
- Commentaire d'en-tete: present et mis a jour avec la note de portage sur le passage explicite de `sv_maxvelocity`.
- Runtime: atteignable depuis `G_RunFrame` / `G_RunEntity` via `SV_Physics_Toss` pour `MOVETYPE_TOSS`, `MOVETYPE_BOUNCE`, `MOVETYPE_FLY`, `MOVETYPE_FLYMISSILE`, et via `SV_Physics_Step` pour `MOVETYPE_STEP`; correction ajoutee pour propager `sv_maxvelocity` depuis `g_main.c` vers le runtime.
- apps/web: le flux full/local game utilise le runtime porte; aucune logique web parallele ne remplace ce clamp. Le clamp influence les positions visibles synchronisees vers le client.
- renderer-three: pas de sortie renderer directe; le clamp influence `origin` / `s.origin`, donc camera/scene/entites visibles consomment les positions resultantes via les snapshots et adapters existants.
- Correction: ajout de `runtime.maxvelocity`, synchronisation depuis `sv_maxvelocity`, passage de la valeur a `SV_CheckVelocity`, et assertions ciblees dans `scripts/verify/quake2-g-phys.ts`.
- Tests lances: `npm run verify:g-phys` OK; `npm run typecheck` OK; `npm run verify:local-gameplay-sync` OK; `npm run verify:full-game:three-renderer` OK; `npm run verify:web-render-order` OK.
