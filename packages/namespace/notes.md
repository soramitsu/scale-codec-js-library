Кастомные методы у кодеков

```
type AnyNumber = string | number | BN | BigInt | Uint8Array

AbstractInt extends BN
    isMax
    toBitInt
    ToBn
    isUnsigned

    init(value: AnyNumber, bitLength, isSigned)

Int extends AbstractInt
    init(value: AnyNumber, bitLength)

    static
        with(bitLength, typeName)

UInt
    _как Int_

AbstractArray extends Array
    toArray
    concat
    filter
    map
    includes
    slice

    init(...values: T[])

Vec extends AbstractArray
    init(Type: Constructor | keyof, value: Vec | Bytes | string | unknown[])
        Vec
        bytes
        string
        unknown[]

    static
        decodecVec
        with

    Type
    indexOf

CodecMap extends Map
    init(KeyType, ValueType, rawValue, typeName (Hash or BTree))
        bytes
        string
        Map<any, any>
        undefined

HashMap
BTreeMap extends CodecMap
    static
        with(KeyType, ValType)

BTreeSet extends Set
    init (ValType, rawValue)
        bytes
        string
        string[]
        Set

    static
        with(ValType)

Bool extends Boolean
    isFalse
    isTrue
    init(rawValue)
        Bool
        boolean
        bytes
        number

Text extends String
    init(rawValue)
        null
        Text
        string
        bytes
    setOverride

Enum
    init(definitions, value?, index?)

    static
        with(Types)

    get index
    get isBasic
    get isNone
    get isNull
    get defIndexes
    get defKeys
    get type
    get value

    [as{Variant}]
    [is{Variant}]
    * Proxy may be?

Option & Result extends Enum

Struct extends Map
    init(Types, value)
        { [K in keyof Types]: any }
        Map<unknown, unknown>
        string
        unknown[]

    static
        with(Types)
        typesToMap

    getAtIndex(index) (value by index, not name)
    get(name keyof Types)
    defKeys -> string[]

```

#### Что должно быть реализовано в базовой библиотеке

- [x] Number (u8-256, i8-256, float?)
- [x] String
- [ ] Boolean
- [ ] Enum base + Option & Result
- [x] Struct base
- [x] Map -> HashMap, BTreeMap
- [ ] Vec<любой кодек>
- [ ] Tuple
  - [ ] и пустой тоже

#### Что остаётся на типогенерацию и подгон из типов раста на базу

- [ ] Все числа к ScaleNumber
- [ ] Строки к ScaleString
- [ ] HashMap, BTreeMap к ScaleMap
- [ ] bool -> ScaleBoolean
- [ ] Вектора, срезы, массивы - всё к Vec
- [ ] Работа с кастомными дженериками?
