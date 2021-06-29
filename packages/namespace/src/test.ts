import { Enum, EnumSchema, GetEnumDef, Valuable } from '@scale-codec/core';
import { defNamespaceWithPrimitives } from './namespace';
import { defStruct, defVec, PrimitiveTypes, defEnum } from './std';
import JSBI from 'jsbi';

interface MyNamespace {
    Person: {
        firstName: PrimitiveTypes['String'];
        lastName: PrimitiveTypes['String'];
        age: PrimitiveTypes['u32'];
        gender: MyNamespace['Gender'];
    };
    Gender: Enum<{
        Male: null;
        Female: null;
    }>;
    'Vec<Person>': MyNamespace['Person'][];
    Country: {
        persons: MyNamespace['Vec<Person>'];
        government: MyNamespace['GovernmentType'];
    };
    GovernmentType: Enum<{
        Anarchy: null;
        Dictatorship: Valuable<MyNamespace['DictatorInfo']>;
        Senate: Valuable<MyNamespace['SenateInfo']>;
    }>;
    DictatorInfo: {
        person: MyNamespace['Person'];
        assasinationAttempts: PrimitiveTypes['u32'];
    };
    SenateInfo: {
        senatorsCount: PrimitiveTypes['u32'];
    };
}

const namespace = defNamespaceWithPrimitives<MyNamespace>({
    Person: defStruct([
        ['firstName', 'String'],
        ['lastName', 'String'],
        ['age', 'u32'],
        ['gender', 'Gender'],
    ]),
    Gender: defEnum(
        new EnumSchema<GetEnumDef<MyNamespace['Gender']>>({
            Male: { discriminant: 0 },
            Female: { discriminant: 1 },
        }),
        {},
    ),
    'Vec<Person>': defVec('Person'),
    Country: defStruct([
        ['persons', 'Vec<Person>'],
        ['government', 'GovernmentType'],
    ]),
    GovernmentType: defEnum(
        new EnumSchema<GetEnumDef<MyNamespace['GovernmentType']>>({
            Anarchy: { discriminant: 0 },
            Dictatorship: { discriminant: 1 },
            Senate: { discriminant: 2 },
        }),
        {
            Dictatorship: 'DictatorInfo',
            Senate: 'SenateInfo',
        },
    ),
    DictatorInfo: defStruct([
        ['person', 'Person'],
        ['assasinationAttempts', 'u32'],
    ]),
    SenateInfo: defStruct([['senatorsCount', 'u32']]),
});

const SOME_ENCODED_COUNTRY = new Uint8Array([
    8, 8, 82, 111, 8, 82, 97, 20, 0, 0, 0, 0, 12, 79, 116, 121, 16, 80, 111, 108, 97, 30, 0, 0, 0, 1, 2, 152, 0, 0, 0,
]);

const country = namespace.decode('Country', SOME_ENCODED_COUNTRY);

// Let's print persons
country.persons.forEach(({ firstName, age, gender }) => {
    const genderFormatted: string = gender.match({
        Male: () => '♂',
        Female: () => '♀',
    });

    console.log(`${firstName}, ${age}yo, ${genderFormatted}`);
});

// Conditional enum-behavior
if (country.government.is('Senate')) {
    console.log('Senators count:', country.government.as('Senate').senatorsCount);
}

// encode

const somePerson: MyNamespace['Person'] = {
    firstName: 'Mora',
    lastName: 'Preshy',
    age: JSBI.BigInt(15),
    gender: Enum.create('Male'),
};

const somePersonEncoded = namespace.encode('Person', somePerson);
// somePersonEncoded

// or with automatic type inference
namespace.encode('SenateInfo', {
    senatorsCount: JSBI.BigInt(112),
});

console.log('Decoded: %o', country);

// const map = namespace.decode('BTreeMap<String,Id>', new Uint8Array());

// const maybeId = namespace.decode('Option<Id>', new Uint8Array());
// const maybeIdHandmade: MyCustomNamespace['Option<Id>'] = EnumInstance.create('Some', { name: '4123', domain: '414' });

// const id = maybeId.as('Some');

// namespace.encode('Id', id);

// {
//     namespace.encode('(u32, i8)', []);
// }
