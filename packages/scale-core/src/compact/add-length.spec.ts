import { compactAddLength } from './add-length';

describe('compactAddLength', (): void => {
    it('correctly adds the length prefix', (): void => {
        expect(compactAddLength(Uint8Array.from([12, 13]))).toEqual(Uint8Array.from([2 << 2, 12, 13]));
    });
});
