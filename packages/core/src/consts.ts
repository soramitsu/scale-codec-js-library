import JSBI from 'jsbi';

export const MAX_U8 = JSBI.subtract(JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(8 - 2)), JSBI.BigInt(1));
export const MAX_U16 = JSBI.subtract(JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(16 - 2)), JSBI.BigInt(1));
export const MAX_U32 = JSBI.subtract(JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(32 - 2)), JSBI.BigInt(1));
