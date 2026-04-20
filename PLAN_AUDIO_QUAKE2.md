# PLAN_AUDIO_QUAKE2.md

# Quake2JS - Plan de portage audio

## 1. Objectif

Porter l'ensemble de la chaine audio de Quake II original vers TypeScript / JavaScript pour le navigateur, en preservant d'abord :

- les declencheurs gameplay et serveur des sons ;
- le protocole de transport des evenements sonores ;
- les regles client de precache, spatialisation, canaux, overrides et loops ;
- la semantique musique de map via `CS_CDTRACK` ;
- le flux PCM brut des cinematics.

Le backend final cible sera base sur `Web Audio`, mais le comportement de reference reste celui du code source original.

## 2. References source

### 2.1 Noyau audio client

- `Quake-2-master/client/sound.h`
- `Quake-2-master/client/snd_loc.h`
- `Quake-2-master/client/snd_dma.c`
- `Quake-2-master/client/snd_mem.c`
- `Quake-2-master/client/snd_mix.c`

### 2.2 Parsing et orchestration client

- `Quake-2-master/client/cl_parse.c`
- `Quake-2-master/client/cl_main.c`
- `Quake-2-master/client/cl_fx.c`
- `Quake-2-master/client/cl_tent.c`
- `Quake-2-master/client/cl_cin.c`

### 2.3 Emission serveur / gameplay

- `Quake-2-master/server/sv_send.c`
- `Quake-2-master/server/sv_game.c`
- `Quake-2-master/game/g_spawn.c`
- `Quake-2-master/game/g_func.c`
- `Quake-2-master/game/g_items.c`
- `Quake-2-master/game/g_misc.c`
- `Quake-2-master/game/g_target.c`
- `Quake-2-master/game/g_trigger.c`
- `Quake-2-master/game/g_weapon.c`
- `Quake-2-master/game/p_client.c`
- `Quake-2-master/game/p_view.c`
- `Quake-2-master/game/p_weapon.c`
- `Quake-2-master/game/m_*.c`

### 2.4 Musique CD

- `Quake-2-master/client/cdaudio.h`
- `Quake-2-master/win32/cd_win.c`
- `Quake-2-master/linux/cd_linux.c`
- `Quake-2-master/null/cd_null.c`

### 2.5 Definitions communes

- `Quake-2-master/game/q_shared.h`

## 3. Perimetre fonctionnel

Le portage audio couvre :

- les sons ponctuels emis par le serveur ;
- les sons ponctuels emis localement par le client ;
- les sons loops attaches aux entites via `ent->s.sound` ;
- les sons d'evenements `EV_*` ;
- le precache des sons de map et d'effets ;
- les sons sexed `*pain`, `*death`, `*jump`, etc. ;
- la spatialisation listener / source ;
- les canaux et les regles d'override ;
- les offsets temporels `timeofs` ;
- la musique de map via `CS_CDTRACK` ;
- l'audio PCM brut des cinematics.

Ne font pas partie d'un portage strict a reproduire tel quel :

- les backends materiels `snd_win.c`, `snd_linux.c`, `snd_irix.c`, `snd_next.m` ;
- les implementations CD-ROM natives `cd_win.c`, `cd_linux.c`.

Ces fichiers serviront seulement a comprendre la semantique attendue et seront remplaces par un adapter web.

## 4. Architecture cible

### 4.1 Couche moteur portee

Packages cibles :

- `packages/qcommon`
- `packages/game`
- `packages/server`
- `packages/client`
- `packages/audio`

Responsabilites :

- produire et transporter des indices de sons et des evenements sonores ;
- conserver la logique Quake II de canaux, attenuation, loops et offsets ;
- decoupler la logique audio du backend navigateur.

### 4.2 Couche adapter web

Packages cibles :

- `packages/platform`
- `apps/web`

Responsabilites :

- charger les assets sonores depuis le filesystem Quake II ;
- decoder les WAV pour `Web Audio` ;
- mapper la logique Quake II vers `AudioContext`, `GainNode`, `PannerNode` et sources bufferisees ;
- gerer le contournement web de la musique CD.

## 5. Phases de mise en oeuvre

### Phase 1 - Fondations protocolaires et types

- [ ] porter toutes les constantes audio de `q_shared.h`
- [ ] verifier / completer les definitions :
  - `SND_VOLUME`
  - `SND_ATTENUATION`
  - `SND_OFFSET`
  - `SND_ENT`
  - `SND_POS`
  - `CHAN_*`
  - `ATTN_*`
  - `CS_SOUNDS`
  - `CS_CDTRACK`
- [ ] formaliser les types audio runtime dans un package dedie
- [ ] definir les structures TS proches de :
  - `sfx_t`
  - `playsound_t`
  - `channel_t`
  - etats musique / raw samples
- [ ] definir les interfaces adapter pour backend web sans casser la fidelite moteur

### Phase 2 - Emission serveur des sons

- [ ] porter `SV_SoundIndex`
- [ ] verifier / completer `gi.soundindex` et stockage dans `CS_SOUNDS`
- [ ] porter strictement `SV_StartSound` depuis `server/sv_send.c`
- [ ] conserver les regles d'encodage de paquet :
  - flags
  - volume
  - attenuation
  - offset
  - entite / canal
  - position optionnelle
- [ ] conserver la logique `PHS` / `ALL`
- [ ] verifier la regle `ATTN_NONE => diffusion globale`
- [ ] raccorder `PF_StartSound` et `positioned_sound`

### Phase 3 - Precache gameplay et configstrings

- [ ] finaliser le port des enregistrements sonores dans `SP_worldspawn`
- [ ] verifier le precache des items dans `g_items.c`
- [ ] verifier le precache des portes / plats / triggers dans `g_func.c`, `g_trigger.c`, `g_target.c`
- [ ] verifier le precache des armes et projectiles dans `g_weapon.c`, `p_weapon.c`
- [ ] verifier le precache des monstres dans `m_*.c`
- [ ] garantir que `runtime.assets.soundPaths` reste iso avec les indices Quake II
- [ ] couvrir les sons loops gameplay via `ent->s.sound`

### Phase 4 - Parsing client des evenements sonores

- [ ] finaliser `CL_RegisterSounds`
- [ ] porter `S_BeginRegistration` / `S_EndRegistration` comme logique de registration runtime
- [ ] finaliser `CL_ParseConfigString` pour :
  - `CS_SOUNDS`
  - `CS_CDTRACK`
- [ ] porter strictement `CL_ParseStartSoundPacket`
- [ ] produire un evenement audio normalise conservant :
  - `sound_num`
  - `volume`
  - `attenuation`
  - `timeofs`
  - `ent`
  - `channel`
  - `position`
- [ ] porter `CL_EntityEvent` pour les sons `EV_*`
- [ ] porter les effets clients de `cl_fx.c`
- [ ] porter les sons temporaires de `cl_tent.c`

### Phase 5 - Runtime audio client Quake II

- [ ] creer `packages/audio` comme coeur logique de portage
- [ ] porter `S_FindName`
- [ ] porter `S_RegisterSound`
- [ ] porter `S_StartSound`
- [ ] porter `S_StartLocalSound`
- [ ] porter `S_PickChannel`
- [ ] porter `S_IssuePlaysound`
- [ ] porter `S_StopAllSounds`
- [ ] porter `S_SpatializeOrigin`
- [ ] porter `S_Spatialize`
- [ ] porter `S_AddLoopSounds`
- [ ] porter `S_Update`
- [ ] conserver la logique d'override par `entnum` + `entchannel`
- [ ] conserver la logique `autosound` des loops par snapshot
- [ ] conserver le drift / scheduling de `timeofs`

### Phase 6 - Chargement et decodage des assets sonores

- [ ] porter `GetWavinfo`
- [ ] porter `S_LoadSound`
- [ ] porter `ResampleSfx`
- [ ] verifier les contraintes Quake II :
  - WAV PCM
  - mono pour les samples gameplay classiques
  - resampling vers le taux runtime
- [ ] brancher le chargement via le filesystem deja porte
- [ ] gerer correctement les alias `#` et `*`
- [ ] porter le fallback des sons sexed `S_RegisterSexedSound`

### Phase 7 - Adapter Web Audio

- [ ] creer un backend web dedie dans `packages/platform` ou `apps/web`
- [ ] instancier un `AudioContext` pilote par le runtime
- [ ] mapper un `sfx_t` / cache Quake II vers `AudioBuffer`
- [ ] mapper les sons ponctuels sur `AudioBufferSourceNode`
- [ ] mapper volume et attenuation sur `GainNode`
- [ ] mapper la spatialisation Quake II sur :
  - `PannerNode`
  - ou une spatialisation manuelle si necessaire pour rester fidele
- [ ] gerer les loops `ent->s.sound`
- [ ] gerer le stop / remplacement par canal
- [ ] gerer le mute / pause global

### Phase 8 - Musique de map

- [ ] porter l'interface `CDAudio_*` au niveau logique
- [ ] porter la reaction client a `CS_CDTRACK`
- [ ] definir un mapping web `track -> asset musical`
- [ ] implementer :
  - `play(track, looping)`
  - `stop()`
  - `pause()`
  - `resume()`
  - `update()`
- [ ] gerer le cas ou aucune musique web n'est disponible sans casser le runtime
- [ ] respecter l'arret de la musique lors des cinematics et changements de map

### Phase 9 - Audio des cinematics

- [ ] porter `S_RawSamples`
- [ ] porter la file / buffer logique des raw samples
- [ ] brancher `cl_cin.c` sur le runtime audio porte
- [ ] gerer le flux PCM brut dans le backend web
- [ ] verifier la synchronisation image / son des cinematics

### Phase 10 - Integration web

- [ ] brancher le runtime audio dans `apps/web`
- [ ] connecter le listener a la camera / vue client
- [ ] connecter les snapshots / events du client local
- [ ] connecter les loops des entites visibles
- [ ] connecter l'etat pause / focus navigateur
- [ ] connecter les reglages utilisateur :
  - volume global
  - musique
  - SFX
- [ ] respecter les contraintes de gesture utilisateur avant demarrage audio

### Phase 11 - Verification de fidelite

- [ ] creer des harnais de verification audio cibles
- [ ] verifier la stabilite des indices `soundindex`
- [ ] verifier l'encodage / decodage de `svc_sound`
- [ ] verifier les overrides de canaux
- [ ] verifier les loops `ent->s.sound`
- [ ] verifier les sons sexed
- [ ] verifier les sons de portes / triggers / pickups / armes / monstres
- [ ] verifier `CS_CDTRACK`
- [ ] verifier `S_RawSamples`
- [ ] documenter les ecarts inevitables lies au web

## 6. Ordre de reprise recommande

1. Phase 1
2. Phase 2
3. Phase 4
4. Phase 5
5. Phase 6
6. Phase 7
7. Phase 3
8. Phase 8
9. Phase 9
10. Phase 10
11. Phase 11

## 7. Points de vigilance

- Ne pas confondre logique audio Quake II et backend materiel.
- Ne pas porter `snd_win.c` ou `snd_linux.c` comme modele de structure runtime.
- Ne pas remplacer trop tot les canaux Quake II par une abstraction audio moderne plus floue.
- Preserver la notion de son ponctuel, son loop entite, son local et flux brut cinematic.
- Preserver les indices serveur / client issus de `CS_SOUNDS`.
- Isoler les deviations web dans les adapters, pas dans le coeur porte.

## 8. Livrables attendus

- un runtime audio porte dans `packages/audio`
- un chemin client complet pour `svc_sound`, `EV_*`, loops et precache
- un backend `Web Audio` fonctionnel pour SFX
- une gestion web de la musique de map
- une gestion du flux PCM des cinematics
- des scripts de verification dedies
- la mise a jour de `PORTAGE_QUAKE2.md` au fur et a mesure
