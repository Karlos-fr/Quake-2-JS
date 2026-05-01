# Progress TS - apps/web/src/full-game-local-transport.ts

## Etat

- Statut: Termine
- Dernier lot traite: helpers internes `clonePacket` et `cloneAddress`.
- Verdict du dernier lot: `Valide` comme code `Category: New`, helpers locaux apps/web de copie defensive pour le transport local, sans matrice C/H proprietaire.

## Preuves de session

- Lecture de `apps/web/src/full-game-local-transport.ts`.
- Verification des references dans `apps/web/src/full-game.ts` et les scripts `scripts/verify/quake2-full-game-*.ts`.
- Verification du contrat qcommon importe: `QcommonNetRuntime`, `NetPacket`, `createQcommonNetRuntime`, `NET_GetPacket`, `NET_SendPacket`, `createNetAdr`.
- Test lance: `npm run verify:full-game:local-transport`.
- Typecheck lance apres modification de commentaires TS: `npm run typecheck`.
- Verification des doublons: recherche `clonePacket`, `cloneAddress`, `cloneNetAdr` et helpers similaires dans `packages/`, `apps/` et `scripts/`.
- Verification du lot final: `clonePacket` clone `packet.from` via `cloneAddress` et duplique `packet.data`; `cloneAddress` duplique `ip` et `ipx`.

## Decisions

- Le fichier est un adapter apps/web legitime; il ne doit pas etre marque `Couvert C/H` car aucun symbole du lot n'est proprietaire d'une entite C/H.
- Le runtime web l'utilise pour relier le client local et le serveur local via `clientQnet`/`serverQnet`.
- Pas d'integration renderer-three directe attendue: ce lot transporte des paquets qcommon, sans produire lui-meme entites visibles, particules, dlights, beams, camera ou scene.
- Les helpers `clonePacket` et `cloneAddress` restent prives au fichier: les helpers similaires qcommon/server/client sont locaux a leurs packages et ne constituent pas un doublon de portage proprietaire.

## Prochain lot recommande

- Aucun. Fichier termine.
