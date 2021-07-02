import JSBI from 'jsbi';
import { Enum } from '@scale-codec/enum';
import { Namespace, e2eNamespace } from './ns';

const data: Namespace['[Vec<HashMap<str, Id>>; 8]'] = [
    [
        new Map([
            [
                'some-key',
                {
                    name: 'Alice',
                    second_name: Enum.create('None'),
                    domain: 'wonderland',
                    attempt: Enum.create('Err', 'Oh no!'),
                    enum: Enum.create('Two', [JSBI.BigInt(4412), false, ['nope', JSBI.BigInt(2)]]),
                },
            ],
            [
                'another',
                {
                    name: 'Charlie',
                    second_name: Enum.create('Some', 'Watson'),
                    domain: 'netherland',
                    enum: Enum.create('One'),
                    attempt: Enum.create('Ok', null),
                },
            ],
        ]),
    ],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
];

const encoded = e2eNamespace.encode('[Vec<HashMap<str, Id>>; 8]', data);

e2eNamespace.decode('[Vec<HashMap<str, Id>>; 8]', encoded);
