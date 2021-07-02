import { e2eNamespace } from './ns';

describe('testing inside of e2e', () => {
    test('encode and decode really complex structure', () => {
        expect(e2eNamespace.encode('()', undefined)).toEqual(new Uint8Array([]));
    });
});
