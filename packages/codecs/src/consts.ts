import JSBI from 'jsbi';

// const MAX_U8 = new BN(2).pow(new BN(8 - 2)).subn(1);
// const MAX_U16 = new BN(2).pow(new BN(16 - 2)).subn(1);
// const MAX_U32 = new BN(2).pow(new BN(32 - 2)).subn(1);

export const BI_m1 = JSBI.BigInt(-1);
export const BI_0 = JSBI.BigInt(0);
export const BI_1 = JSBI.BigInt(1);
export const BI_2 = JSBI.BigInt(2);
export const BI_3 = JSBI.BigInt(3);
export const BI_4 = JSBI.BigInt(4);
export const BI_5 = JSBI.BigInt(5);
export const BI_6 = JSBI.BigInt(6);
export const BI_7 = JSBI.BigInt(7);
export const BI_8 = JSBI.BigInt(8);
export const BI_9 = JSBI.BigInt(9);
export const BI_10 = JSBI.BigInt(10);

export const MAX_U8 = JSBI.subtract(JSBI.exponentiate(BI_2, JSBI.BigInt(8 - 2)), BI_1);
export const MAX_U16 = JSBI.subtract(JSBI.exponentiate(BI_2, JSBI.BigInt(16 - 2)), BI_1);
export const MAX_U32 = JSBI.subtract(JSBI.exponentiate(BI_2, JSBI.BigInt(32 - 2)), BI_1);
