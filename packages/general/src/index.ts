interface CodecDefinition<
    R extends CodecDefaultRenders<R> = CodecDefaultRenders<{}>,
    I extends CodecDefaultConstructors = {},
> {
    type: string;
    render: R;
}

type CodecInstance<R extends CodecDefaultRenders<any>> = R & {};

interface CodecDefaultRenders<T extends CodecInstance<any>> {
    bytesLengthHint: (this: T) => number;
    bytes: (this: T, isBare?: boolean) => Uint8Array;
}

interface CodecDefaultConstructors {}

type DefinitionToConstructor<T> = T extends CodecDefinition<infer R, infer I> ? CodecInstance<R> : never;

// ---

function constructCodec<D extends CodecDefinition<any, any>>(def: D): DefinitionToConstructor<D> {
    return null as any;
}

function defineCodec<D extends CodecDefinition<any, any>>(def: D): D {
    return def;
}

const AbstractInt = defineCodec({
    type: 'AbstractInt',
    // static: {},
    render: {
        bytesLengthHint() {
            return 0;
        },
        bytes() {
            return new Uint8Array();
        },
    },
});

const { bytes } = constructCodec(AbstractInt);

bytes();
