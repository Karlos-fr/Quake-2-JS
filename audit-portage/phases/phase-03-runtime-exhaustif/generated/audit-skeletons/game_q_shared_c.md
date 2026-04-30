# Inventaire runtime Phase 03 - Quake-2-master/game/q_shared.c

## Rattachement Phase 02

- Statut structurel : split-undocumented
- Cible TS principale : packages/math/src/q_shared.ts
- Cibles TS declarees : packages/math/src/q_shared.ts, packages/qcommon/src/common.ts, packages/qcommon/src/system.ts, packages/qcommon/src/q_shared.ts, packages/qcommon/src/index.ts

## Symboles source

| Type | Symbole | Ligne | Statut Phase 03 | Notes |
| --- | --- | --- | --- | --- |
| macro | DEG2RAD | 22 | a-auditer | |
| function | RotatePointAroundVector | 32 | a-auditer | |
| global | i | 39 | a-auditer | |
| function | AngleVectors | 93 | a-auditer | |
| global | angle | 95 | a-auditer | |
| function | ProjectPointOnPlane | 130 | a-auditer | |
| global | d | 132 | a-auditer | |
| global | inv_denom | 134 | a-auditer | |
| function | PerpendicularVector | 152 | a-auditer | |
| global | pos | 154 | a-auditer | |
| global | i | 155 | a-auditer | |
| global | minelem | 156 | a-auditer | |
| function | R_ConcatRotations | 191 | a-auditer | |
| function | R_ConcatTransforms | 219 | a-auditer | |
| function | Q_fabs | 251 | a-auditer | |
| global | tmp | 258 | a-auditer | |
| global | tmp | 268 | a-auditer | |
| function | LerpAngle | 283 | a-auditer | |
| function | anglemod | 293 | a-auditer | |
| global | i | 305 | a-auditer | |
| function | BoxOnPlaneSide2 | 310 | a-auditer | |
| global | i | 312 | a-auditer | |
| global | sides | 314 | a-auditer | |
| function | BoxOnPlaneSide | 349 | a-auditer | |
| global | sides | 352 | a-auditer | |
| function | ClearBounds | 650 | a-auditer | |
| function | AddPointToBounds | 656 | a-auditer | |
| global | i | 658 | a-auditer | |
| function | VectorCompare | 672 | a-auditer | |
| function | VectorNormalize | 681 | a-auditer | |
| function | VectorNormalize2 | 700 | a-auditer | |
| function | VectorMA | 719 | a-auditer | |
| function | _DotProduct | 727 | a-auditer | |
| function | _VectorSubtract | 732 | a-auditer | |
| function | _VectorAdd | 739 | a-auditer | |
| function | _VectorCopy | 746 | a-auditer | |
| function | CrossProduct | 753 | a-auditer | |
| function | sqrt | 760 | a-auditer | |
| function | VectorLength | 762 | a-auditer | |
| global | i | 764 | a-auditer | |
| global | length | 765 | a-auditer | |
| function | VectorInverse | 775 | a-auditer | |
| function | VectorScale | 782 | a-auditer | |
| function | Q_log2 | 790 | a-auditer | |
| global | answer | 792 | a-auditer | |
| function | COM_SkipPath | 807 | a-auditer | |
| global | last | 809 | a-auditer | |
| function | COM_StripExtension | 826 | a-auditer | |
| function | COM_FileExtension | 838 | a-auditer | |
| global | exten | 840 | a-auditer | |
| global | i | 841 | a-auditer | |
| function | COM_FileBase | 859 | a-auditer | |
| function | COM_FilePath | 888 | a-auditer | |
| global | s | 890 | a-auditer | |
| function | COM_DefaultExtension | 907 | a-auditer | |
| global | src | 909 | a-auditer | |
| global | bigendien | 934 | a-auditer | |
| function | BigShort | 945 | a-auditer | |
| function | LittleShort | 946 | a-auditer | |
| function | BigLong | 947 | a-auditer | |
| function | LittleLong | 948 | a-auditer | |
| function | BigFloat | 949 | a-auditer | |
| function | LittleFloat | 950 | a-auditer | |
| function | ShortSwap | 952 | a-auditer | |
| function | ShortNoSwap | 962 | a-auditer | |
| function | LongSwap | 967 | a-auditer | |
| function | LongNoSwap | 979 | a-auditer | |
| function | FloatSwap | 984 | a-auditer | |
| global | f | 988 | a-auditer | |
| global | b | 989 | a-auditer | |
| function | FloatNoSwap | 1001 | a-auditer | |
| function | Swap_Init | 1011 | a-auditer | |
| global | swaptest | 1013 | a-auditer | |
| function | va | 1050 | a-auditer | |
| global | argptr | 1052 | a-auditer | |
| global | string | 1053 | a-auditer | |
| global | com_token | 1063 | a-auditer | |
| function | COM_Parse | 1072 | a-auditer | |
| global | c | 1074 | a-auditer | |
| global | len | 1075 | a-auditer | |
| global | data | 1076 | a-auditer | |
| global | paged_total | 1159 | a-auditer | |
| function | Com_PageInMemory | 1161 | a-auditer | |
| global | i | 1163 | a-auditer | |
| function | Q_stricmp | 1180 | a-auditer | |
| function | _stricmp | 1183 | a-auditer | |
| function | Q_strncasecmp | 1190 | a-auditer | |
| function | Q_strcasecmp | 1216 | a-auditer | |
| function | Q_strncasecmp | 1218 | a-auditer | |
| function | Com_sprintf | 1223 | a-auditer | |
| global | len | 1225 | a-auditer | |
| global | argptr | 1226 | a-auditer | |
| global | bigbuffer | 1227 | a-auditer | |
| function | Info_ValueForKey | 1253 | a-auditer | |
| global | pkey | 1255 | a-auditer | |
| global | valueindex | 1258 | a-auditer | |
| global | o | 1259 | a-auditer | |
| function | Info_RemoveKey | 1295 | a-auditer | |
| global | start | 1297 | a-auditer | |
| global | pkey | 1298 | a-auditer | |
| global | value | 1299 | a-auditer | |
| global | o | 1300 | a-auditer | |
| function | Info_Validate | 1353 | a-auditer | |
| function | Info_SetValueForKey | 1362 | a-auditer | |
| global | c | 1365 | a-auditer | |
| global | maxsize | 1366 | a-auditer | |

## Atteignabilite

- Racines a verifier : Qcommon_Frame, SV_Frame, G_RunFrame, CL_Frame, PMove selon le fichier.

## Tables declaratives

- A comparer si le fichier contient spawn/items/cvars/commands/messages/effects/tables monstres.

## Tests ou harnais

- A lier via `phase-03-test-links.json` puis verifier manuellement.

## Verdict

- Verdict provisoire : A tester
- Justification :

