import {
    createStructBuilder,
    createSetBuilder,
    ScaleStructBuilder,
    Str,
    U8,
    U32,
    Bool,
    FragmentFromBuilder,
    ScaleSetBuilder,
    Fragment,
    createTupleBuilder,
    ScaleTupleBuilder,
    DefaultTracker,
    ScaleMapBuilder,
    createMapBuilder,
} from './src/lib';

const Tup: ScaleTupleBuilder<[Fragment<number>, Fragment<number>]> = createTupleBuilder('Tup', [U32, U32]);

const MapStrBool: ScaleMapBuilder<Map<Fragment<string>, Fragment<boolean>>> = createMapBuilder('MapStrBool', Str, Bool);

const Bench: ScaleStructBuilder<{
    coords: FragmentFromBuilder<typeof Tup>;
    novel: Fragment<string>;
    map: FragmentFromBuilder<typeof MapStrBool>;
}> = createStructBuilder('Bench', [
    ['coords', Tup],
    ['novel', Str],
    ['map', MapStrBool],
]);

new DefaultTracker().within(() => {
    const benchBytes = Bench.wrap({
        coords: [5, 20002],
        novel: 'Omnia mea mecum porto',
        map: new Map([
            ['4', false],
            ['Henno', true],
        ]),
    }).bytes;

    console.log({ benchBytes });

    const copied = new Uint8Array([...benchBytes]).slice(0, 35);

    const unwrapped = Bench.fromBytes(copied).unwrap();
    console.log({ unwrapped });
});

// const SetStr: ScaleSetBuilder<Set<Fragment<string>>> = createSetBuilder('SetStr', Str);

// const Data: ScaleStructBuilder<{ set: FragmentFromBuilder<typeof SetStr> }> = createStructBuilder('Data', [
//     ['set', SetStr],
// ]);

// const valOk = Data.wrap({ set: new Set(['4141', 'Русский']) });
// const bytes = valOk.bytes;
// console.log(bytes);

// bytes[19] = 0;

// const val = Data.fromBytes(bytes);
// console.log('bytes: %o', val.unwrap());

// const err = new Error(`bla bla\n    at Data <- 00 00 01\n    at VecData <- 10 00 00 01`);
// err.original = new Error('Original error');
// err.decodeStack = [1, 2, 3];
// throw err;
// // console.error(err);
