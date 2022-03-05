/* eslint-disable @typescript-eslint/no-empty-interface */
import { Opaque } from 'type-fest'
import { Codec, Enum, EnumDefToFactoryArgs, Option } from './src/lib'

interface DefineOpaque<Actual, Result> {
    define: (actual: Actual) => Result
}

type DefineOpaqueFn<Actual, Result> = (actual: Actual) => Result

type EnumFactory<E, Res> = E extends Enum<infer Def> ? (...args: EnumDefToFactoryArgs<Def>) => Res : never

// Array

type CustomArr__actual = Array<number>

declare const CustomArr: Codec<CustomArr> & DefineOpaqueFn<CustomArr__actual, CustomArr>

interface CustomArr extends Opaque<CustomArr__actual, CustomArr> {}

// Option enum

type CustomOpt__actual = Option<CustomArr>

declare const CustomOpt: Codec<CustomOpt> & EnumFactory<CustomOpt__actual, CustomOpt>

interface CustomOpt extends Opaque<CustomOpt__actual, CustomOpt> {}

// Struct

type CustomStruct__actual = {
    arr: CustomArr
    opt: CustomOpt
}

declare const CustomStruct: Codec<CustomStruct> & DefineOpaqueFn<CustomStruct__actual, CustomStruct>

interface CustomStruct extends Opaque<CustomStruct__actual, CustomStruct> {}

// Tuple

type CustomTuple__actual = [number, CustomArr, CustomStruct]

interface CustomTuple extends Opaque<CustomTuple__actual, CustomTuple> {}

declare const CustomTuple: Codec<CustomTuple> & DefineOpaqueFn<CustomTuple__actual, CustomTuple>

// Alias

interface ArrAlias extends CustomArr {}

declare const ArrAlias: Codec<ArrAlias> & ((value: ArrAlias) => ArrAlias)

// Cyclic

interface CycleEnum extends Opaque<Option<CycleStruct>, CycleEnum> {}

declare const CycleEnum: Codec<CycleEnum> & EnumFactory<Option<CycleStruct>, CycleEnum>

interface CycleStruct extends Opaque<{ enum: CycleEnum }, CycleStruct> {}

declare const CycleStruct: Codec<CycleStruct> & DefineOpaqueFn<{ enum: CycleEnum }, CycleStruct>

// Map

type CustomMap__actual = Map<CycleEnum, string>

interface CustomMap extends Opaque<CustomMap__actual, CustomMap> {}

declare const CustomMap: Codec<CustomMap> & DefineOpaqueFn<CustomMap__actual, CustomMap>

// export

export { CustomArr, CustomOpt, CustomStruct, CustomTuple, ArrAlias, CycleEnum, CycleStruct, CustomMap }
