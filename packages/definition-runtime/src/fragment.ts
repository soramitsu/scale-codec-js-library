import { Encode, Decode, WalkerImpl, Walker } from '@scale-codec/core'
import { trackDecode, TrackDecodeFn, TrackValueInspect, TrackValueInspectable } from './tracking'

const FRAGMENT_VALUE_EMPTY = Symbol('empty')

const isFragmentValueEmpty = <V>(value: typeof FRAGMENT_VALUE_EMPTY | V): value is typeof FRAGMENT_VALUE_EMPTY =>
    value === FRAGMENT_VALUE_EMPTY

function offPropsEnumerability(object: object, props: PropertyKey[]) {
    for (const prop of props) {
        Reflect.defineProperty(object, prop, { enumerable: false })
    }
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
    private __value: typeof FRAGMENT_VALUE_EMPTY | Value

    private __bytes: null | Uint8Array

    protected abstract __encode: Encode<Value>

    protected abstract __decode: Decode<Value>

    /**
     * For tracking
     */
    protected abstract __name: string

    public constructor(value: typeof FRAGMENT_VALUE_EMPTY | Value, bytes: null | Uint8Array) {
        if (value === FRAGMENT_VALUE_EMPTY && !bytes)
            throw new Error('Fragment should have either value or bytes or both')

        Reflect.defineProperty(this, '__value', { enumerable: false, value, writable: true })
        Reflect.defineProperty(this, '__bytes', { enumerable: false, value: bytes, writable: true })
    }

    public [TrackValueInspect]() {
        return this.unwrap()
    }

    public get value(): Value {
        if (isFragmentValueEmpty(this.__value)) {
            // a bit dirty to implement nice tracking
            WalkerImpl.decode(this.__bytes!, (walker) => {
                trackDecode(this.__name, walker, () => {
                    this.__value = this.__decode(walker)
                    return this
                })
            })
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

    public encode(walker: Walker): void {
        if (this.__bytes) {
            // just copying
            walker.u8.set(this.__bytes, walker.idx)
            walker.idx += this.__bytes.byteLength
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
    fromBuffer: (bufferView: ArrayBufferView) => Fragment<T, U>
    /**
     * Raw `Decode` function. Primarily used by the builder or by other builders internally
     */
    decode: Decode<Fragment<T, U>>
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

export type FragmentOrBuilderValue<T extends Fragment<any> | FragmentBuilder<any>> = T extends Fragment<infer V, any>
    ? V
    : T extends FragmentBuilder<infer V, any>
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

export type UnwrapFragment<T> = T extends Fragment<any, infer U> ? U : T

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
    // useful for track function to catch an actual fragment instead of its value
    const decodeToFragment: Decode<Fragment<T, U>> = (walker) => {
        const value = decode(walker)
        return ctor.fromValue(value)
    }

    const ctor: FragmentBuilder<T, U> = class Self extends Fragment<T, U> {
        public static fromValue(value: T): Self {
            return new Self(value, null)
        }

        public static fromBuffer(bufferView: ArrayBufferView): Self {
            return new Self(FRAGMENT_VALUE_EMPTY, new Uint8Array(bufferView.buffer))
        }

        public static decode(walker: Walker): Fragment<T, U> {
            return trackDecode(name, walker, decodeToFragment)
        }

        public static wrap(unwrappedValue: U): Self {
            return new Self(wrap ? wrap(unwrappedValue) : (unwrappedValue as unknown as T), null)
        }

        public static defineUnwrap(x: U): U {
            return x
        }

        protected __encode = encode
        protected __decode = decode
        protected __name = name

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
