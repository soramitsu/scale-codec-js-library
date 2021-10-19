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

export const externals = defineSample({
    JustExternalInclusion: {
        t: 'external',
        module: '../externals-sample-help',
    },
    WithCustomExternalName: {
        t: 'external',
        module: '../externals-sample-help',
        nameInModule: 'str',
    },
});

export const enums = defineSample({
    Message: {
        t: 'enum',
        variants: [
            {
                discriminant: 0,
                name: 'Quit',
            },
            {
                discriminant: 1,
                name: 'Greeting',
                ref: 'str',
            },
        ],
    },
    OptionMessage: {
        t: 'option',
        some: 'Message',
    },
});

export const struct = defineSample({
    Character: {
        t: 'struct',
        fields: [
            {
                name: 'name',
                ref: 'str',
            },
            {
                name: 'age',
                ref: 'u8',
            },
        ],
    },
});
