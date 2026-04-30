# Inventaire runtime Phase 03 - Quake-2-master/game/m_flyer.h

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/game/src/m_flyer.ts
- Cibles TS declarees : packages/game/src/m_flyer.ts, packages/game/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| macro | ACTION_nothing | 24 | a-auditer | |
| macro | ACTION_attack1 | 25 | a-auditer | |
| macro | ACTION_attack2 | 26 | a-auditer | |
| macro | ACTION_run | 27 | a-auditer | |
| macro | ACTION_walk | 28 | a-auditer | |
| macro | FRAME_start01 | 30 | a-auditer | |
| macro | FRAME_start02 | 31 | a-auditer | |
| macro | FRAME_start03 | 32 | a-auditer | |
| macro | FRAME_start04 | 33 | a-auditer | |
| macro | FRAME_start05 | 34 | a-auditer | |
| macro | FRAME_start06 | 35 | a-auditer | |
| macro | FRAME_stop01 | 36 | a-auditer | |
| macro | FRAME_stop02 | 37 | a-auditer | |
| macro | FRAME_stop03 | 38 | a-auditer | |
| macro | FRAME_stop04 | 39 | a-auditer | |
| macro | FRAME_stop05 | 40 | a-auditer | |
| macro | FRAME_stop06 | 41 | a-auditer | |
| macro | FRAME_stop07 | 42 | a-auditer | |
| macro | FRAME_stand01 | 43 | a-auditer | |
| macro | FRAME_stand02 | 44 | a-auditer | |
| macro | FRAME_stand03 | 45 | a-auditer | |
| macro | FRAME_stand04 | 46 | a-auditer | |
| macro | FRAME_stand05 | 47 | a-auditer | |
| macro | FRAME_stand06 | 48 | a-auditer | |
| macro | FRAME_stand07 | 49 | a-auditer | |
| macro | FRAME_stand08 | 50 | a-auditer | |
| macro | FRAME_stand09 | 51 | a-auditer | |
| macro | FRAME_stand10 | 52 | a-auditer | |
| macro | FRAME_stand11 | 53 | a-auditer | |
| macro | FRAME_stand12 | 54 | a-auditer | |
| macro | FRAME_stand13 | 55 | a-auditer | |
| macro | FRAME_stand14 | 56 | a-auditer | |
| macro | FRAME_stand15 | 57 | a-auditer | |
| macro | FRAME_stand16 | 58 | a-auditer | |
| macro | FRAME_stand17 | 59 | a-auditer | |
| macro | FRAME_stand18 | 60 | a-auditer | |
| macro | FRAME_stand19 | 61 | a-auditer | |
| macro | FRAME_stand20 | 62 | a-auditer | |
| macro | FRAME_stand21 | 63 | a-auditer | |
| macro | FRAME_stand22 | 64 | a-auditer | |
| macro | FRAME_stand23 | 65 | a-auditer | |
| macro | FRAME_stand24 | 66 | a-auditer | |
| macro | FRAME_stand25 | 67 | a-auditer | |
| macro | FRAME_stand26 | 68 | a-auditer | |
| macro | FRAME_stand27 | 69 | a-auditer | |
| macro | FRAME_stand28 | 70 | a-auditer | |
| macro | FRAME_stand29 | 71 | a-auditer | |
| macro | FRAME_stand30 | 72 | a-auditer | |
| macro | FRAME_stand31 | 73 | a-auditer | |
| macro | FRAME_stand32 | 74 | a-auditer | |
| macro | FRAME_stand33 | 75 | a-auditer | |
| macro | FRAME_stand34 | 76 | a-auditer | |
| macro | FRAME_stand35 | 77 | a-auditer | |
| macro | FRAME_stand36 | 78 | a-auditer | |
| macro | FRAME_stand37 | 79 | a-auditer | |
| macro | FRAME_stand38 | 80 | a-auditer | |
| macro | FRAME_stand39 | 81 | a-auditer | |
| macro | FRAME_stand40 | 82 | a-auditer | |
| macro | FRAME_stand41 | 83 | a-auditer | |
| macro | FRAME_stand42 | 84 | a-auditer | |
| macro | FRAME_stand43 | 85 | a-auditer | |
| macro | FRAME_stand44 | 86 | a-auditer | |
| macro | FRAME_stand45 | 87 | a-auditer | |
| macro | FRAME_attak101 | 88 | a-auditer | |
| macro | FRAME_attak102 | 89 | a-auditer | |
| macro | FRAME_attak103 | 90 | a-auditer | |
| macro | FRAME_attak104 | 91 | a-auditer | |
| macro | FRAME_attak105 | 92 | a-auditer | |
| macro | FRAME_attak106 | 93 | a-auditer | |
| macro | FRAME_attak107 | 94 | a-auditer | |
| macro | FRAME_attak108 | 95 | a-auditer | |
| macro | FRAME_attak109 | 96 | a-auditer | |
| macro | FRAME_attak110 | 97 | a-auditer | |
| macro | FRAME_attak111 | 98 | a-auditer | |
| macro | FRAME_attak112 | 99 | a-auditer | |
| macro | FRAME_attak113 | 100 | a-auditer | |
| macro | FRAME_attak114 | 101 | a-auditer | |
| macro | FRAME_attak115 | 102 | a-auditer | |
| macro | FRAME_attak116 | 103 | a-auditer | |
| macro | FRAME_attak117 | 104 | a-auditer | |
| macro | FRAME_attak118 | 105 | a-auditer | |
| macro | FRAME_attak119 | 106 | a-auditer | |
| macro | FRAME_attak120 | 107 | a-auditer | |
| macro | FRAME_attak121 | 108 | a-auditer | |
| macro | FRAME_attak201 | 109 | a-auditer | |
| macro | FRAME_attak202 | 110 | a-auditer | |
| macro | FRAME_attak203 | 111 | a-auditer | |
| macro | FRAME_attak204 | 112 | a-auditer | |
| macro | FRAME_attak205 | 113 | a-auditer | |
| macro | FRAME_attak206 | 114 | a-auditer | |
| macro | FRAME_attak207 | 115 | a-auditer | |
| macro | FRAME_attak208 | 116 | a-auditer | |
| macro | FRAME_attak209 | 117 | a-auditer | |
| macro | FRAME_attak210 | 118 | a-auditer | |
| macro | FRAME_attak211 | 119 | a-auditer | |
| macro | FRAME_attak212 | 120 | a-auditer | |
| macro | FRAME_attak213 | 121 | a-auditer | |
| macro | FRAME_attak214 | 122 | a-auditer | |
| macro | FRAME_attak215 | 123 | a-auditer | |
| macro | FRAME_attak216 | 124 | a-auditer | |
| macro | FRAME_attak217 | 125 | a-auditer | |
| macro | FRAME_bankl01 | 126 | a-auditer | |
| macro | FRAME_bankl02 | 127 | a-auditer | |
| macro | FRAME_bankl03 | 128 | a-auditer | |
| macro | FRAME_bankl04 | 129 | a-auditer | |
| macro | FRAME_bankl05 | 130 | a-auditer | |
| macro | FRAME_bankl06 | 131 | a-auditer | |
| macro | FRAME_bankl07 | 132 | a-auditer | |
| macro | FRAME_bankr01 | 133 | a-auditer | |
| macro | FRAME_bankr02 | 134 | a-auditer | |
| macro | FRAME_bankr03 | 135 | a-auditer | |
| macro | FRAME_bankr04 | 136 | a-auditer | |
| macro | FRAME_bankr05 | 137 | a-auditer | |
| macro | FRAME_bankr06 | 138 | a-auditer | |
| macro | FRAME_bankr07 | 139 | a-auditer | |
| macro | FRAME_rollf01 | 140 | a-auditer | |
| macro | FRAME_rollf02 | 141 | a-auditer | |
| macro | FRAME_rollf03 | 142 | a-auditer | |
| macro | FRAME_rollf04 | 143 | a-auditer | |
| macro | FRAME_rollf05 | 144 | a-auditer | |
| macro | FRAME_rollf06 | 145 | a-auditer | |
| macro | FRAME_rollf07 | 146 | a-auditer | |
| macro | FRAME_rollf08 | 147 | a-auditer | |
| macro | FRAME_rollf09 | 148 | a-auditer | |
| macro | FRAME_rollr01 | 149 | a-auditer | |
| macro | FRAME_rollr02 | 150 | a-auditer | |
| macro | FRAME_rollr03 | 151 | a-auditer | |
| macro | FRAME_rollr04 | 152 | a-auditer | |
| macro | FRAME_rollr05 | 153 | a-auditer | |
| macro | FRAME_rollr06 | 154 | a-auditer | |
| macro | FRAME_rollr07 | 155 | a-auditer | |
| macro | FRAME_rollr08 | 156 | a-auditer | |
| macro | FRAME_rollr09 | 157 | a-auditer | |
| macro | FRAME_defens01 | 158 | a-auditer | |
| macro | FRAME_defens02 | 159 | a-auditer | |
| macro | FRAME_defens03 | 160 | a-auditer | |
| macro | FRAME_defens04 | 161 | a-auditer | |
| macro | FRAME_defens05 | 162 | a-auditer | |
| macro | FRAME_defens06 | 163 | a-auditer | |
| macro | FRAME_pain101 | 164 | a-auditer | |
| macro | FRAME_pain102 | 165 | a-auditer | |
| macro | FRAME_pain103 | 166 | a-auditer | |
| macro | FRAME_pain104 | 167 | a-auditer | |
| macro | FRAME_pain105 | 168 | a-auditer | |
| macro | FRAME_pain106 | 169 | a-auditer | |
| macro | FRAME_pain107 | 170 | a-auditer | |
| macro | FRAME_pain108 | 171 | a-auditer | |
| macro | FRAME_pain109 | 172 | a-auditer | |
| macro | FRAME_pain201 | 173 | a-auditer | |
| macro | FRAME_pain202 | 174 | a-auditer | |
| macro | FRAME_pain203 | 175 | a-auditer | |
| macro | FRAME_pain204 | 176 | a-auditer | |
| macro | FRAME_pain301 | 177 | a-auditer | |
| macro | FRAME_pain302 | 178 | a-auditer | |
| macro | FRAME_pain303 | 179 | a-auditer | |
| macro | FRAME_pain304 | 180 | a-auditer | |
| macro | MODEL_SCALE | 182 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

