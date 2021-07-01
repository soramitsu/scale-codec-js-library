import { compactStripLength } from './strip-length';

describe('compactStripLength', (): void => {
    it('correctly removes the length prefix', (): void => {
        expect(compactStripLength(Uint8Array.from([2 << 2, 12, 13]))).toEqual([3, Uint8Array.from([12, 13])]);
    });
});
