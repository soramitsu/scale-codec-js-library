import { prettyDecodeInput } from '../util';

test('Empty input', () => {
    expect(prettyDecodeInput(new Uint8Array())).toMatchInlineSnapshot(`"<empty>"`);
});

test('8 formatted bytes', () => {
    expect(prettyDecodeInput(new Uint8Array([0, 1, 2, 3, 0, 1, 2, 3]))).toMatchInlineSnapshot(
        `"<00 01 02 03 00 01 02 03 (len: 8)>"`,
    );
});

test('25 bytes - default 20 limit is applied', () => {
    expect(prettyDecodeInput(new Uint8Array(Array.from({ length: 25 }, () => 255)))).toMatchInlineSnapshot(
        `"<ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff... (len: 25)>"`,
    );
});

test('Used some bytes', () => {
    expect(prettyDecodeInput(new Uint8Array([11, 12, 13, 14, 15, 0, 1, 2, 3]), { used: 3 })).toMatchInlineSnapshot(
        `"<[0b 0c 0d] 0e 0f 00 01 02 03 (len: 9, used: 3)>"`,
    );
});

test('Used more than len', () => {
    expect(prettyDecodeInput(new Uint8Array([11, 12, 13, 14, 15]), { used: 20 })).toMatchInlineSnapshot(
        `"<[0b 0c 0d 0e 0f] (len: 5, used: (!) 20)>"`,
    );
});

test('Used more than bytes limit (and len more too)', () => {
    expect(prettyDecodeInput(new Uint8Array([11, 12, 13, 14, 15]), { bytesLimit: 2, used: 4 })).toMatchInlineSnapshot(
        `"<[0b 0c...] ... (len: 5, used: 4)>"`,
    );
});

test('Used more than bytes limit, and used = len', () => {
    expect(prettyDecodeInput(new Uint8Array([11, 12, 13, 14, 15]), { bytesLimit: 2, used: 5 })).toMatchInlineSnapshot(
        `"<[0b 0c...] (len = used = 5)>"`,
    );
});

test('Used more than bytes limit, and used > len', () => {
    expect(prettyDecodeInput(new Uint8Array([11, 12, 13, 14, 15]), { bytesLimit: 2, used: 10 })).toMatchInlineSnapshot(
        `"<[0b 0c...] (len: 5, used: (!) 10)>"`,
    );
});
