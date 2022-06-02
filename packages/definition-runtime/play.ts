import {
  CustomArr,
  CustomOpt,
  CustomStruct,
  CustomTuple,
  CycleEnum,
  CycleStruct,
  ArrAlias,
  CustomMap,
} from './play-mod'
import { Enum } from './src/lib'

const arr1 = CustomArr([1, 2, 3])
function test1() {
  CustomArr.toBuffer(arr1)
}

// @ts-expect-error
CustomArr.toBuffer([])

const opt1 = CustomOpt.fromBuffer(new Uint8Array())
const opt2 = CustomOpt('None')

// @ts-expect-error
const opt3 = CustomOpt('Some')

const opt4 = CustomOpt('Some', arr1)

// @ts-expect-error
const opt5 = CustomOpt('Some', [])

// @ts-expect-error
const struct1 = CustomStruct({ arr: [], opt: opt3 })

const struct2 = CustomStruct({ arr: arr1, opt: opt3 })

const tuple1 = CustomTuple.fromBuffer(new Uint8Array())
CustomTuple.toBuffer(tuple1)
// @ts-expect-error
CustomTuple.toBuffer([412, arr1, struct1])
CustomTuple.toBuffer(CustomTuple([412, arr1, struct1]))

const cycleEnum1 = CycleEnum('None')
// @ts-expect-error
const cycleEnum2 = CycleEnum('Some', { enum: cycleEnum1 })
const cycleEnum3 = CycleEnum('Some', CycleStruct({ enum: cycleEnum1 }))

CycleEnum(
  'Some',
  CycleStruct({
    enum: CycleEnum(
      'Some',
      CycleStruct({
        enum: CycleEnum('None'),
      }),
    ),
  }),
)

const map1 = CustomMap(new Map())
const map2 = CustomMap(new Map([[cycleEnum1, '']]))
// @ts-expect-error
const map3 = CustomMap(new Map([[Enum.variant('None'), '']]))
