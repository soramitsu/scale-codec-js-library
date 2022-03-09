/* eslint-disable @typescript-eslint/no-empty-interface */
import { Opaque } from 'type-fest'
import { Codec, Enum, EnumDefToFactoryArgs, Option, U8, Str, dynCodec } from './src/lib'
import {
    ArrayCodecAndFactory,
    createArrayCodec,
    createEnumCodec,
    createMapCodec,
    createOptionCodec,
    createSetCodec,
    createStructCodec,
    createTupleCodec,
    EnumCodecAndFactory,
    MapCodecAndFactory,
    SetCodecAndFactory,
    StructCodecAndFactory,
} from './src/create'

// Array

type CustomArr__actual = Array<number>

interface CustomArr extends Opaque<CustomArr__actual, CustomArr> {}

const CustomArr: ArrayCodecAndFactory<CustomArr__actual, CustomArr> = createArrayCodec<CustomArr__actual, CustomArr>(
    'CustomArr',
    U8,
    32,
)

// Option enum

type CustomOpt__actual = Option<CustomArr>

interface CustomOpt extends Opaque<CustomOpt__actual, CustomOpt> {}

const CustomOpt: EnumCodecAndFactory<CustomOpt> = createOptionCodec<CustomOpt__actual, CustomOpt>(
    'CustomOpt',
    CustomArr,
)

// Some enum

type Message__actual = Enum<'Cogito' | 'Ergo' | 'Sum'>

interface Message extends Opaque<Message__actual, Message> {}

const Message: EnumCodecAndFactory<Message> = createEnumCodec<Message__actual, Message>('Message', [
    [0, 'Cogito'],
    [1, 'Ergo'],
    [2, 'Sum'],
])

// Struct

type CustomStruct__actual = {
    arr: CustomArr
    opt: CustomOpt
}

interface CustomStruct extends Opaque<CustomStruct__actual, CustomStruct> {}

const CustomStruct: StructCodecAndFactory<CustomStruct__actual, CustomStruct> = createStructCodec<
    CustomStruct__actual,
    CustomStruct
>('CustomStruct', [
    ['arr', CustomArr],
    ['opt', CustomOpt],
])

// Tuple

type CustomTuple__actual = [number, CustomArr, CustomStruct]

interface CustomTuple extends Opaque<CustomTuple__actual, CustomTuple> {}

const CustomTuple = createTupleCodec<CustomTuple__actual, CustomTuple>('CustomTuple', [U8, CustomArr, CustomStruct])

// Alias

interface ArrAlias extends CustomArr {}

const ArrAlias: Codec<ArrAlias> = dynCodec(() => ArrAlias)

// Cyclic

type CycleEnum__actual = Option<CycleStruct>

interface CycleEnum extends Opaque<CycleEnum__actual, CycleEnum> {}

const CycleEnum: EnumCodecAndFactory<CycleEnum> = createOptionCodec<CycleEnum__actual, CycleEnum>(
    'CycleEnum',
    dynCodec(() => CycleStruct),
)

type CycleStruct__actual = { enum: CycleEnum }

interface CycleStruct extends Opaque<CycleStruct__actual, CycleStruct> {}

const CycleStruct: StructCodecAndFactory<CycleStruct__actual, CycleStruct> = createStructCodec<
    CycleStruct__actual,
    CycleStruct
>('CycleStruct', [['enum', CycleEnum]])

// Map

type CustomMap__actual = Map<CycleEnum, string>

interface CustomMap extends Opaque<CustomMap__actual, CustomMap> {}

const CustomMap: MapCodecAndFactory<CustomMap__actual, CustomMap> = createMapCodec<CustomMap__actual, CustomMap>(
    'CustomMap',
    CycleEnum,
    Str,
)

// Set

type CustomSet__actual = Set<ArrAlias>

interface CustomSet extends Opaque<CustomSet__actual, CustomSet> {}

const CustomSet: SetCodecAndFactory<CustomSet__actual, CustomSet> = createSetCodec<CustomSet__actual, CustomSet>(
    'CustomSet',
    ArrAlias,
)

// export

export { Message, CustomArr, CustomOpt, CustomStruct, CustomTuple, ArrAlias, CycleEnum, CycleStruct, CustomMap }
