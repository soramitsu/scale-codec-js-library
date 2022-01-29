import { Encode, Decode, WalkerImpl, Walker } from '@scale-codec/core'
// import { concatBytes } from '@scale-codec/util'
import { trackDecode, TrackValueInspect, TrackValueInspectable } from './tracking'

// type OptionTupleSome<T> = [T]
// type OptionTuple<T> = null | OptionTupleSome<T>
// type FragmentInternalDecodeTrackFn<V, U> = (input: Uint8Array, decode: Decode<Fragment<V, U>>) => void

const FRAGMENT_VALUE_EMPTY = Symbol('empty')

const isFragmentValueEmpty = <V>(value: typeof FRAGMENT_VALUE_EMPTY | V): value is typeof FRAGMENT_VALUE_EMPTY =>
    value === FRAGMENT_VALUE_EMPTY

function offPropsEnumerability(object: object, props: PropertyKey[]) {
    for (const prop of props) {
        Reflect.defineProperty(object, prop, { enumerable: false })
    }
}

function offPropEnumerabilityWithValue(object: object, prop: PropertyKey, value: any) {
    Reflect.defineProperty(object, prop, { enumerable: false, value, writable: true })
}

function defineReadonlyOwnGetter(object: object, prop: PropertyKey, get: () => any) {
    Reflect.defineProperty(object, prop, {
        enumerable: true,
        get,
    })
}

/**
 * The main atom that contains 2 representations of the same data - encoded bytes and its JS representation
 *
 * @remarks
 *
 * **Immutable!** Never mutate its `value` or `bytes` internals, because it will produce a malfunction in a
 * whole `Fragment`s' tree (if it contains nested instances).
 *
 * Type `Value` represents JS value, `Unwrapped` - JS value with content where all of the `Fragment`s are
 * unwrapped to their values.
 */
export abstract class Fragment<Value, Unwrapped = Value> implements TrackValueInspectable {
    // /**
    //  * Some JS-easy-accessible value of the instance
    //  */
    // public readonly value: Value

    // /**
    //  * SCALE-encoded bytes of the instance
    //  */
    // public readonly bytes: Uint8Array

    // public readonly sizeHint: number;

    private __value: typeof FRAGMENT_VALUE_EMPTY | Value

    private __bytes: null | Uint8Array

    /**
     * @internal
     */
    protected abstract __encode: Encode<Value>

    /**
     * @internal
     */
    protected abstract __decode: Decode<Value>

    // /**
    //  * @internal
    //  */
    // protected abstract __trackDecode: FragmentInternalDecodeTrackFn<Value, Unwrapped>

    // /**
    //  * @internal
    //  */
    public constructor(value: typeof FRAGMENT_VALUE_EMPTY | Value, bytes: null | Uint8Array) {
        if (value === FRAGMENT_VALUE_EMPTY && !bytes)
            throw new Error('Fragment should have either value or bytes or both')

        Reflect.defineProperty(this, '__value', { enumerable: false, value, writable: true })
        Reflect.defineProperty(this, '__bytes', { enumerable: false, value: bytes, writable: true })

        // // Firstly gettere were on the class itself, but it turned out that under the hood
        // // they are defined with `{ enumerable: false }`; also not-own keys & getters aren't visible
        // // by default key-traversing ways, so to make these getters behave like regular props or
        // // computed getters, I decided to use this technique
        // defineReadonlyOwnGetter(this, 'bytes', this.getBytes.bind(this))
        // defineReadonlyOwnGetter(this, 'value', this.getValue.bind(this))

        // implementation details

        // offPropEnumerabilityWithValue(this, '__value', value)
        // offPropEnumerabilityWithValue(this, '__bytes', bytes)
    }

    public [TrackValueInspect]() {
        return this.unwrap()
    }

    public get value(): Value {
        if (isFragmentValueEmpty(this.__value)) {
            this.__value = WalkerImpl.decode(this.__bytes!, this.__decode)
        }
        return this.__value as Value
    }

    public get bytes(): Uint8Array {
        if (!this.__bytes) {
            this.__bytes = WalkerImpl.encode(this.__value as Value, this.__encode)
        }
        return this.__bytes
    }

    public get sizeHint(): number {
        if (this.__bytes) {
            return this.__bytes.byteLength
        }
        return this.__encode.sizeHint(this.__value as Value)
    }

    public runSmartEncode(walker: Walker): void {
        if (this.__bytes) {
            // just copying
            walker.arr.set(this.__bytes, walker.offset)
            walker.offset += this.__bytes.byteLength
        } else {
            // running actual encode function
            this.__encode(this.__value as Value, walker)
        }
    }

    /**
     * Unwraps its contents and all of the nested `Fragment`s
     */
    public abstract unwrap(): Unwrapped
}

// export type FragmentCtor<T, U = T> = new (value: null | OptionTuple<T>, bytes: null | Uint8Array) => Fragment<T, U>

/**
 * Defines how a builder for {@link Fragment} should look like
 */
export interface FragmentBuilder<T, U = T> {
    /**
     * Constructs instance from JS value to give an opportunity to encode it later or use in any
     * other way
     */
    fromValue: (value: T) => Fragment<T, U>
    /**
     * Constructs instance from SCALE-encoded bytes to give an opportunity to access to its decoded contents
     */
    fromBytes: (bytes: Uint8Array) => Fragment<T, U>
    /**
     * Raw `Decode` function. Primarily used by the builder or by other builders internally
     */
    runDecode: Decode<Fragment<T, U>>
    // encodeRaw: (fragment: Fragment<T, U>, walker: Walker) => void
    // /**
    //  * TODO doc
    //  */
    // encodeSizeHint: (fragment: Fragment<T, U>) => number
    /**
     * Constructs instance back from unwrapped value, i.e. works vice versa from {@link Fragment.unwrap}
     */
    wrap: (unwrappedValue: U) => Fragment<T, U>
    /**
     * Type helper. Returns exactly what is passed to it.
     */
    defineUnwrap: (unwrappedValue: U) => U
}

export type FragmentFromBuilder<T extends FragmentBuilder<any>> = T extends FragmentBuilder<infer V, infer U>
    ? Fragment<V, U>
    : never

export type BuilderFromFragment<T extends Fragment<any>> = T extends Fragment<infer V, infer U>
    ? FragmentBuilder<V, U>
    : never

export type FragmentOrBuilderValue<T extends Fragment<any> | FragmentBuilder<any>> = T extends Fragment<infer V>
    ? V
    : T extends FragmentBuilder<infer V>
    ? V
    : never

export type FragmentOrBuilderUnwrapped<T extends Fragment<any> | FragmentBuilder<any>> = T extends Fragment<
    any,
    infer U
>
    ? U
    : T extends FragmentBuilder<any, infer U>
    ? U
    : never

// function decodeAndMemorize<T extends Fragment<any>>(
//     bytes: Uint8Array,
//     decode: Decode<FragmentOrBuilderValue<T>>,
//     ctor: FragmentCtor<FragmentOrBuilderValue<T>>,
// ): DecodeResult<T> {
//     const [value, bytesCount] = decode(bytes)
//     const usedBytes = bytes.slice(0, bytesCount)
//     // eslint-disable-next-line new-cap
//     const instance = new ctor([value], usedBytes) as T
//     return [instance, bytesCount]
// }

function unwrapFallback<T>(scale: Fragment<T, any>): any {
    return scale.value
}

export type FragmentUnwrapFn<T, U> = (self: Fragment<T, U>) => U

export type FragmentWrapFn<T, U> = (unwrapped: U) => T

/**
 * Universal function that specifies necessary stuff to implement {@link FragmentBuilder} protocol
 */
// eslint-disable-next-line max-params
export function createBuilder<T, U = T>(
    name: string,
    encode: Encode<T>,
    decode: Decode<T>,
    unwrap?: FragmentUnwrapFn<T, U>,
    wrap?: FragmentWrapFn<T, U>,
): FragmentBuilder<T, U> {
    // const decodeTrackable: Decode<T> = (input) => trackDecode(`__decode ${name}`, input, decode);

    // const internalTrackDecode: FragmentInternalDecodeTrackFn<T, U> = (bytes, fn) => trackDecode(name, bytes, fn)

    const ctor: FragmentBuilder<T, U> = class Self extends Fragment<T, U> {
        public static fromValue(value: T): Self {
            return new Self(value, null)
        }

        public static fromBytes(bytes: Uint8Array): Self {
            return new Self(FRAGMENT_VALUE_EMPTY, bytes)
        }

        // public static encodeRaw(fragment: Fragment<T, U>, walker: Walker): void {

        // }

        public static runDecode(walker: Walker): Fragment<T, U> {
            const value = decode(walker)
            return new Self(
                value,
                // pass slice here?
                null,
            )
        }

        // public static encodeSizeHint(fragment: Fragment<T, U>): number {
        //     // return fragment.bytes.byteLength
        // }

        public static wrap(unwrappedValue: U): Self {
            return new Self(wrap ? wrap(unwrappedValue) : (unwrappedValue as unknown as T), null)
        }

        public static defineUnwrap(x: U): U {
            return x
        }

        protected __encode = encode
        protected __decode = decode
        // protected __trackDecode = internalTrackDecode

        public constructor(value: typeof FRAGMENT_VALUE_EMPTY | T, bytes: null | Uint8Array) {
            super(value, bytes)

            // implementation details
            offPropsEnumerability(this, ['__encode', '__decode', '__trackDecode'])
        }

        public unwrap(): U {
            return (unwrap || unwrapFallback)(this) as U
        }

        public [Symbol.toStringTag]() {
            return name
        }
    }

    Reflect.defineProperty(ctor, 'name', { value: name })

    return ctor
}

export type UnwrapFragment<T> = T extends Fragment<any, infer U> ? U : T
