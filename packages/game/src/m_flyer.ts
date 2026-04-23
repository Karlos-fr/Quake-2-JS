/**
 * File: m_flyer.ts
 * Source: Quake II original / game/m_flyer.h
 * Purpose: Port of the generated flyer model action and frame constants used by the monster flyer model.
 *
 * Porting policy:
 * - Preserve original behavior first.
 * - Preserve original names whenever possible.
 * - Avoid structural refactors unless documented.
 *
 * Deviations:
 * - None.
 *
 * Notes:
 * - This file is a declarative header port generated from the original ModelGen output.
 */

export const ACTION_nothing = 0;
export const ACTION_attack1 = 1;
export const ACTION_attack2 = 2;
export const ACTION_run = 3;
export const ACTION_walk = 4;

export const FRAME_start01 = 0;
export const FRAME_start02 = 1;
export const FRAME_start03 = 2;
export const FRAME_start04 = 3;
export const FRAME_start05 = 4;
export const FRAME_start06 = 5;
export const FRAME_stop01 = 6;
export const FRAME_stop02 = 7;
export const FRAME_stop03 = 8;
export const FRAME_stop04 = 9;
export const FRAME_stop05 = 10;
export const FRAME_stop06 = 11;
export const FRAME_stop07 = 12;
export const FRAME_stand01 = 13;
export const FRAME_stand02 = 14;
export const FRAME_stand03 = 15;
export const FRAME_stand04 = 16;
export const FRAME_stand05 = 17;
export const FRAME_stand06 = 18;
export const FRAME_stand07 = 19;
export const FRAME_stand08 = 20;
export const FRAME_stand09 = 21;
export const FRAME_stand10 = 22;
export const FRAME_stand11 = 23;
export const FRAME_stand12 = 24;
export const FRAME_stand13 = 25;
export const FRAME_stand14 = 26;
export const FRAME_stand15 = 27;
export const FRAME_stand16 = 28;
export const FRAME_stand17 = 29;
export const FRAME_stand18 = 30;
export const FRAME_stand19 = 31;
export const FRAME_stand20 = 32;
export const FRAME_stand21 = 33;
export const FRAME_stand22 = 34;
export const FRAME_stand23 = 35;
export const FRAME_stand24 = 36;
export const FRAME_stand25 = 37;
export const FRAME_stand26 = 38;
export const FRAME_stand27 = 39;
export const FRAME_stand28 = 40;
export const FRAME_stand29 = 41;
export const FRAME_stand30 = 42;
export const FRAME_stand31 = 43;
export const FRAME_stand32 = 44;
export const FRAME_stand33 = 45;
export const FRAME_stand34 = 46;
export const FRAME_stand35 = 47;
export const FRAME_stand36 = 48;
export const FRAME_stand37 = 49;
export const FRAME_stand38 = 50;
export const FRAME_stand39 = 51;
export const FRAME_stand40 = 52;
export const FRAME_stand41 = 53;
export const FRAME_stand42 = 54;
export const FRAME_stand43 = 55;
export const FRAME_stand44 = 56;
export const FRAME_stand45 = 57;
export const FRAME_attak101 = 58;
export const FRAME_attak102 = 59;
export const FRAME_attak103 = 60;
export const FRAME_attak104 = 61;
export const FRAME_attak105 = 62;
export const FRAME_attak106 = 63;
export const FRAME_attak107 = 64;
export const FRAME_attak108 = 65;
export const FRAME_attak109 = 66;
export const FRAME_attak110 = 67;
export const FRAME_attak111 = 68;
export const FRAME_attak112 = 69;
export const FRAME_attak113 = 70;
export const FRAME_attak114 = 71;
export const FRAME_attak115 = 72;
export const FRAME_attak116 = 73;
export const FRAME_attak117 = 74;
export const FRAME_attak118 = 75;
export const FRAME_attak119 = 76;
export const FRAME_attak120 = 77;
export const FRAME_attak121 = 78;
export const FRAME_attak201 = 79;
export const FRAME_attak202 = 80;
export const FRAME_attak203 = 81;
export const FRAME_attak204 = 82;
export const FRAME_attak205 = 83;
export const FRAME_attak206 = 84;
export const FRAME_attak207 = 85;
export const FRAME_attak208 = 86;
export const FRAME_attak209 = 87;
export const FRAME_attak210 = 88;
export const FRAME_attak211 = 89;
export const FRAME_attak212 = 90;
export const FRAME_attak213 = 91;
export const FRAME_attak214 = 92;
export const FRAME_attak215 = 93;
export const FRAME_attak216 = 94;
export const FRAME_attak217 = 95;
export const FRAME_bankl01 = 96;
export const FRAME_bankl02 = 97;
export const FRAME_bankl03 = 98;
export const FRAME_bankl04 = 99;
export const FRAME_bankl05 = 100;
export const FRAME_bankl06 = 101;
export const FRAME_bankl07 = 102;
export const FRAME_bankr01 = 103;
export const FRAME_bankr02 = 104;
export const FRAME_bankr03 = 105;
export const FRAME_bankr04 = 106;
export const FRAME_bankr05 = 107;
export const FRAME_bankr06 = 108;
export const FRAME_bankr07 = 109;
export const FRAME_rollf01 = 110;
export const FRAME_rollf02 = 111;
export const FRAME_rollf03 = 112;
export const FRAME_rollf04 = 113;
export const FRAME_rollf05 = 114;
export const FRAME_rollf06 = 115;
export const FRAME_rollf07 = 116;
export const FRAME_rollf08 = 117;
export const FRAME_rollf09 = 118;
export const FRAME_rollr01 = 119;
export const FRAME_rollr02 = 120;
export const FRAME_rollr03 = 121;
export const FRAME_rollr04 = 122;
export const FRAME_rollr05 = 123;
export const FRAME_rollr06 = 124;
export const FRAME_rollr07 = 125;
export const FRAME_rollr08 = 126;
export const FRAME_rollr09 = 127;
export const FRAME_defens01 = 128;
export const FRAME_defens02 = 129;
export const FRAME_defens03 = 130;
export const FRAME_defens04 = 131;
export const FRAME_defens05 = 132;
export const FRAME_defens06 = 133;
export const FRAME_pain101 = 134;
export const FRAME_pain102 = 135;
export const FRAME_pain103 = 136;
export const FRAME_pain104 = 137;
export const FRAME_pain105 = 138;
export const FRAME_pain106 = 139;
export const FRAME_pain107 = 140;
export const FRAME_pain108 = 141;
export const FRAME_pain109 = 142;
export const FRAME_pain201 = 143;
export const FRAME_pain202 = 144;
export const FRAME_pain203 = 145;
export const FRAME_pain204 = 146;
export const FRAME_pain301 = 147;
export const FRAME_pain302 = 148;
export const FRAME_pain303 = 149;
export const FRAME_pain304 = 150;

export const MODEL_SCALE = 1.0;
