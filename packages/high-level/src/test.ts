import { compileNamespace } from './namespace';
import {
    defineEnumCodec,
    defineStructCodec,
    defineVecCodec,
    Option,
    OptionVariants,
    PrimitiveCodecs,
    PrimitiveTypes,
    MapCodec,
} from './std';

type MyCustomNamespace = PrimitiveTypes & {
    Id: {
        name: string;
        domain: string;
    };
    'BTreeMap<String,Id>': Map<PrimitiveTypes['String'], MyCustomNamespace['Id']>;
    'Option<Id>': Option<MyCustomNamespace['Id']>;
    'Vec<u32>': PrimitiveTypes['u32'][];
};

const codecs = {
    Id: defineStructCodec<MyCustomNamespace, MyCustomNamespace['Id']>([
        ['name', 'String'],
        ['domain', 'String'],
    ]),
    'BTreeMap<String,Id>': MapCodec<MyCustomNamespace, 'String', 'Id'>('String', 'Id'),
    'Option<Id>': defineEnumCodec<MyCustomNamespace, OptionVariants<MyCustomNamespace['Id']>>(['None', ['Some', 'Id']]),
    'Vec<u32>': defineVecCodec<MyCustomNamespace, number>('u32'),
};

const namespace = compileNamespace<MyCustomNamespace>({
    ...PrimitiveCodecs,
    ...codecs,
});

const map: Map<string, MyCustomNamespace['Id']> = namespace.lookup('BTreeMap<String,Id>').decode(new Uint8Array());

const maybeId: Option<MyCustomNamespace['Id']> = codecs['Option<Id>'].create('Some', {
    name: '412',
    domain: '4141',
});

const id: MyCustomNamespace['Id'] = maybeId.unwrap('Some');

namespace.lookup('Id').encode(id);
