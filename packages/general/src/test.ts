import { createEnumCodec, Enum } from './enum';
import { createCodecMap } from './map';
import { createRoot } from './root';
import { createStructWith } from './struct';
import { CodecTypeOptions } from './types';

type NS = {
    Id: {
        name: string;
        domain: string;
    };
    String: string;
    'BTreeMap<string, Id>': Map<string, NS['Id']>;
    'Option<Id>': Enum<{ None: null; Some: NS['Id'] }>;
};

// const OptionId=

const r = createRoot<NS>({
    Id: createStructWith([
        ['name', 'String'],
        ['domain', 'String'],
    ]),
    String: null as CodecTypeOptions<NS, string>,
    'BTreeMap<string, Id>': createCodecMap('String', 'Id'),
    'Option<Id>': createEnumCodec<NS, NS['Option<Id>'] extends Enum<infer V> ? V : never>(['None', ['Some', 'Id']]),
});

r.lookup('BTreeMap<string, Id>');
r.lookup('Option<Id>').create('None');
