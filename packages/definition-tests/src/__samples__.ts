import { NamespaceDefinition } from '@scale-codec/definition-compiler';

interface Sample {
    def: NamespaceDefinition;
}

function defineSample(def: NamespaceDefinition): Sample {
    return { def };
}

export const aliases = defineSample({
    B: {
        t: 'alias',
        ref: 'str',
    },
    A: { t: 'alias', ref: 'B' },
    C: { t: 'tuple', items: ['B', 'u8'] },
});
