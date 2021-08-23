// import {} from 'immutable'

function* intTypes(): Generator<string> {
    for (const t of ['i', 'u']) {
        for (const bits of [8, 16, 32, 64, 128]) {
            yield `${t}${bits}`;
        }
    }
}

const STD = new Set(['str', ...intTypes(), 'Void', 'Compact', 'bool', 'BytesVec']);

/**
 * Checks whether a type reference is a std reference
 */
export function isStd(ref: string): boolean {
    return STD.has(ref);
}
