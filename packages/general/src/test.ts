import { defineEnumCodec, EnumCodecType } from './enum';
import { defineMapCodec } from './map';
import { defineNamespace } from './namespace';
import { defineStructCodec } from './struct';
import { CodecType, NamespaceValue } from './types';
import { StringCodec } from './string';
import { defineTupleCodec, Tuple } from './tuple';
import { defineVecCodec, VecCodecType } from './vec';
import { CodecNumber, u32 } from './numbers';

type NS = {
    Id: CodecType<{
        name: string;
        domain: string;
    }>;
    String: CodecType<string>;
    'BTreeMap<string, Id>': CodecType<Map<string, NamespaceValue<NS, 'Id'>>>;
    'Option<Id>': EnumCodecType<{ None: null; Some: NamespaceValue<NS, 'Id'> }>;
    '()': CodecType<Tuple<[]>>;
    'Vec<u32>': VecCodecType<CodecNumber>;
    u32: CodecType<CodecNumber>;
};

// const OptionId=

const r = defineNamespace<NS>({
    Id: defineStructCodec<NS, NamespaceValue<NS, 'Id'>>([
        ['name', 'String'],
        ['domain', 'String'],
    ]),
    String: StringCodec,
    'BTreeMap<string, Id>': defineMapCodec('String', 'Id'),
    'Option<Id>': defineEnumCodec<NS, NS['Option<Id>'] extends EnumCodecType<infer V> ? V : never>([
        'None',
        ['Some', 'Id'],
    ]),
    '()': defineTupleCodec([]),
    u32: u32,
    'Vec<u32>': defineVecCodec('u32'),
});

r.lookup('BTreeMap<string, Id>');
const a = r.lookup('Option<Id>').create('None').unwrap('Some');
