import { renderDefinitionTemplate as render } from './templates';

it.only('renders vec', () => {
    expect(render('vec', { self: 'Vec_with_some_ref', item: 'with_some_ref' })).toMatchSnapshot();
});

it('renders tuple', () => {
    expect(
        render('tuple', {
            self: 'Tuple_bool_Person_u64',
            refs: ['bool', 'Person', 'u64'],
        }),
    ).toMatchSnapshot();
});

it('renders struct', () => {
    expect(
        render('struct', {
            self: 'Person',
            fields: [
                { name: 'name', ref: 'str' },
                { name: 'age', ref: 'Compact' },
            ],
        }),
    ).toMatchSnapshot();
});

it('renders enum', () => {
    console.log(
        render('enum', {
            self: 'Message',
            variants: [
                { name: 'Quit', discriminant: 0 },
                { name: 'Greeting', discriminant: 1, ref: 'GreetingMsg' },
            ],
        }),
    );

    expect(
        render('enum', {
            self: 'Message',
            variants: [
                { name: 'Quit', discriminant: 0 },
                { name: 'Greeting', discriminant: 1, ref: 'GreetingMsg' },
            ],
        }),
    ).toMatchSnapshot();
});
