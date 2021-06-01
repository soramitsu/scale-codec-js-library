import { ScaleDecoder, ScaleEncoder } from './core';
import { ScaleNumber } from './numbers';
import { ScaleString } from './string';
import { createStructWith } from './struct';

type GenaratorDefinition = Record<string, ScaleTypeDef>;

type ScaleTypeDef = ScaleStructTypeDef | ScaleEnumTypeDef | ScaleTypeDefAlias;

type ScaleStructTypeDef = {
    type: 'struct';
    fields: [string, string][];
};

type ScaleEnumTypeDef = {
    type: 'enum';
    variants: (string | [string, string])[];
};

type ScaleTypeDefAlias = string;

// Вот есть такая дефиниция:

const definitionRAW: GenaratorDefinition = {
    Account: {
        type: 'struct',
        fields: [
            ['id', 'Id'],
            ['date', 'u64'],
            ['state', 'AccountState'],
        ],
    },
    Id: {
        type: 'struct',
        fields: [
            ['name', 'String'],
            ['domain_name', 'String'],
        ],
    },
    AccountState: {
        type: 'enum',
        variants: ['Ok', ['Locked', 'MyString']],
    },
    MyString: 'String',
};

// И вот что-то такое должно быть на выхлопе

interface Account {
    id: Id;
    date: ScaleDecoder<ScaleNumber>;
    state: AccountState;
}

interface Id {
    name: ScaleDecoder<ScaleString>;
    domainName: ScaleDecoder<ScaleString>;
}

interface AccountState {
    Ok: null;
    Locked: MyString;
}

interface MyString extends ScaleDecoder<ScaleString> {}

const AccountDecoder = createStructWith<Account>([['id']]);
