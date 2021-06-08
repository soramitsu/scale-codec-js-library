import { RustEnum, RustEnumSchema } from '@scale-codec/core';
import { defNamespace } from './namespace';
import { defEnum, defStruct, defVec, defMap, defTuple, OptionVariants, PrimitiveCodecs, PrimitiveTypes } from './std';

type MyCustomNamespace = PrimitiveTypes & {
    Id: {
        name: string;
        domain: string;
    };
    'BTreeMap<String,Id>': Map<PrimitiveTypes['String'], MyCustomNamespace['Id']>;
    'Option<Id>': RustEnum<OptionVariants<MyCustomNamespace['Id']>>;
    'Vec<u32>': PrimitiveTypes['u32'][];
    '(u32, i8)': [PrimitiveTypes['u32'], PrimitiveTypes['i32']];
};

// FIXME
const OptionId = new RustEnumSchema<OptionVariants<MyCustomNamespace['Id']>>({
    None: { discriminant: 0 },
    Some: { discriminant: 1 },
});

const namespace = defNamespace<MyCustomNamespace>({
    ...PrimitiveCodecs,
    Id: defStruct([
        ['name', 'String'],
        ['domain', 'String'],
    ]),
    '(u32, i8)': defTuple(['u32', 'i8']),
    'Vec<u32>': defVec('u32'),
    'BTreeMap<String,Id>': defMap('String', 'Id'),
    'Option<Id>': defEnum(OptionId, { Some: 'Id' }),
});

const map = namespace.decode('BTreeMap<String,Id>', new Uint8Array());

const maybeId = OptionId.create('Some', {
    name: '412',
    domain: '4141',
});

const id = maybeId.as('Some');

namespace.encode('Id', id);
