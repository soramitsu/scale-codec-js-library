export type DefPart = 'ty-decoded' | 'ty-encodable' | 'fn-decode' | 'fn-encode';

export const DefPartSuffixMap: { [K in DefPart]: string } = {
    'fn-decode': '_decode',
    'fn-encode': '_encode',
    'ty-decoded': '_Decoded',
    'ty-encodable': '_Encodable',
};

export function partToSuffix(val: DefPart) {
    return DefPartSuffixMap[val];
}
