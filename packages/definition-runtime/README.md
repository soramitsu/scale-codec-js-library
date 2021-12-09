# @scale-codec/definition-runtime ![build status](https://img.shields.io/github/checks-status/soramitsu/scale-codec-js-library/master) ![version](https://img.shields.io/npm/v/@scale-codec/definition-runtime) ![license](https://img.shields.io/npm/l/@scale-codec/definition-runtime)

Base tool to build complex type namespaces with SCALE-codec.

Read the [docs](https://soramitsu.github.io/scale-codec-js-library/guide/namespaces)!

## Example

```ts
import {
    createStructBuilder,
    createOptionBuilder,
    ScaleStructBuilder,
    ScaleEnumBuilder,
    Option,
    dynBuilder,
    Str,
    Fragment,
    FragmentFromBuilder,
    Enum,
} from '@scale-codec/definition-runtime';

// 1. Create builders

const MaybePerson: ScaleEnumBuilder<Option<FragmentFromBuilder<typeof Person>>> = createOptionBuilder(
    'MaybePerson',
    // `dynBuilder` is needed for cyclic deps
    dynBuilder(() => Person),
);

const Person: ScaleStructBuilder<{
    name: Fragment<string>;
    child: FragmentFromBuilder<typeof MaybePerson>;
}> = createStructBuilder('Person', [
    ['name', Str],
    ['child', MaybePerson],
]);

// 2. Use them

const person = Person.wrap({
    name: 'Jane',
    child: Enum.valuable('Some', {
        name: 'Ron',
        child: Enum.empty('None'),
    }),
});

// encode
const encoded = person.bytes;

// decode
const decoded = Person.fromBytes(encoded);

// access - long way with direct access to fragments
const childName = decoded.value.child.value.as('Some').value.name.value;

// access - short way with unwrapping feature
const childNameAgain = decoded.unwrap().child.as('Some').name;
```
