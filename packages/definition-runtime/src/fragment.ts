import { Encode, Decode, DecodeResult } from '@scale-codec/core';
import { assert } from '@scale-codec/util';

type OptionTupleSome<T> = [T];
type OptionTuple<T> = null | OptionTupleSome<T>;

function offPropsEnumerability(object: object, props: PropertyKey[]) {
    for (const prop of props) {
        Reflect.defineProperty(object, prop, { enumerable: false });
    }
}

function offPropEnumerabilityWithValue(object: object, prop: PropertyKey, value: any) {
    Reflect.defineProperty(object, prop, { enumerable: false, value, writable: true });
}

function defineReadonlyOwnGetter(object: object, prop: PropertyKey, get: () => any) {
    Reflect.defineProperty(object, prop, {
        enumerable: true,
        get,
    });
}

/**
 * The main atom that contains 2 representations of the same data - encoded bytes and its JS representation
 *
 * @remarks
 *
 * **Immutable!** Never mutate its `value` or `bytes` internals, because it will produce a malfunction in a
 * whole `ScaleInstance`s' tree (if it contains nested instances).
 *
 * Type `Value` represents JS value, `Unwrapped` - JS value with content where all of the `ScaleInstance`s are
 * unwrapped to their values.
 */
export abstract class Fragment<Value, Unwrapped = Value> {
    /**
     * Some JS-easy-accessible value of the instance
     */
    public readonly value: Value;

    /**
     * SCALE-encoded bytes of the instance
     */
    public readonly bytes: Uint8Array;

    private __value: null | OptionTuple<Value>;

    private __bytes: null | Uint8Array;

    /**
     * @internal
     */
    protected abstract __encode: Encode<Value>;

    /**
     * @internal
     */
    protected abstract __decode: Decode<Value>;

    /**
     * @internal
     */
    public constructor(value: null | OptionTuple<Value>, bytes: null | Uint8Array) {
        if (!value && !bytes) throw new Error('ScaleInstance should have either value or bytes or both');

        // Firstly gettere were on the class itself, but it turned out that under the hood
        // they are defined with `{ enumerable: false }`; also not-own keys & getters aren't visible
        // by default key-traversing ways, so to make these getters behave like regular props or
        // computed getters, I decided to use this technique
        defineReadonlyOwnGetter(this, 'bytes', this.getBytes.bind(this));
        defineReadonlyOwnGetter(this, 'value', this.getValue.bind(this));

        // implementation details
        offPropEnumerabilityWithValue(this, '__value', value);
        offPropEnumerabilityWithValue(this, '__bytes', bytes);
    }

    private getValue(): Value {
        if (!this.__value) {
            const bytes = this.__bytes!;
            const [val, len] = this.__decode(bytes);
            assert(bytes.length === len, () => `Decoded bytes mismatch: (actual) ${len} vs (expected) ${bytes.length}`);
            this.__value = [val];
        }
        return this.__value[0];
    }

    private getBytes(): Uint8Array {
        if (!this.__bytes) {
            this.__bytes = this.__encode(this.__value![0]);
        }
        return this.__bytes;
    }

    /**
     * Unwraps its contents and all of the nested `ScaleInstance`s
     */
    public abstract unwrap(): Unwrapped;
}

export type ScaleInstanceCtor<T, U = T> = new (value: null | OptionTuple<T>, bytes: null | Uint8Array) => Fragment<
    T,
    U
>;

/**
 * Defines how a builder for {@link Fragment} should look like
 */
export interface FragmentBuilder<T, U = T> {
    /**
     * Constructs instance from JS value to give an opportunity to encode it later or use in any
     * other way
     */
    fromValue: (value: T) => Fragment<T, U>;
    /**
     * Constructs instance from SCALE-encoded bytes to give an opportunity to access to its decoded contents
     */
    fromBytes: (bytes: Uint8Array) => Fragment<T, U>;
    /**
     * Raw `Decode` function. Primarily used by the builder or by other builders internally
     */
    decodeRaw: Decode<Fragment<T, U>>;
    /**
     * Constructs instance back from unwrapped value, i.e. works vice versa from {@link Fragment.unwrap}
     */
    wrap: (unwrappedValue: U) => Fragment<T, U>;
}

export type FragmentFromBuilder<T extends FragmentBuilder<any>> = T extends FragmentBuilder<infer V, infer U>
    ? Fragment<V, U>
    : never;

export type BuilderFromFragment<T extends Fragment<any>> = T extends Fragment<infer V, infer U>
    ? FragmentBuilder<V, U>
    : never;

export type FragmentOrBuilderValue<T extends Fragment<any> | FragmentBuilder<any>> = T extends Fragment<infer V>
    ? V
    : T extends FragmentBuilder<infer V>
    ? V
    : never;

export type FragmentOrBuilderUnwrapped<T extends Fragment<any> | FragmentBuilder<any>> = T extends Fragment<
    any,
    infer U
>
    ? U
    : T extends FragmentBuilder<any, infer U>
    ? U
    : never;

function decodeAndMemorize<T extends Fragment<any>>(
    bytes: Uint8Array,
    decode: Decode<FragmentOrBuilderValue<T>>,
    ctor: ScaleInstanceCtor<FragmentOrBuilderValue<T>>,
): DecodeResult<T> {
    const [value, bytesCount] = decode(bytes);
    const usedBytes = bytes.slice(0, bytesCount);
    // eslint-disable-next-line new-cap
    const instance = new ctor([value], usedBytes) as T;
    return [instance, bytesCount];
}

function unwrapFallback<T>(scale: Fragment<T, any>): any {
    return scale.value;
}

export type FragmentUnwrapFn<T, U> = (self: Fragment<T, U>) => U;

export type FragmentWrapFn<T, U> = (unwrapped: U) => T;

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
    const ctor: FragmentBuilder<T, U> = class Self extends Fragment<T, U> {
        public static fromValue(value: T): Self {
            return new Self([value], null);
        }

        public static fromBytes(bytes: Uint8Array): Self {
            return new Self(null, bytes);
        }

        public static decodeRaw(bytes: Uint8Array): DecodeResult<Self> {
            return decodeAndMemorize(bytes, decode, Self);
        }

        public static wrap(unwrappedValue: U): Self {
            return new Self([wrap ? wrap(unwrappedValue) : (unwrappedValue as any)], null);
        }

        protected __encode = encode;
        protected __decode = decode;

        public constructor(value: null | OptionTuple<T>, bytes: null | Uint8Array) {
            super(value, bytes);

            // implementation details
            offPropsEnumerability(this, ['__encode', '__decode']);
        }

        public unwrap(): U {
            return (unwrap || unwrapFallback)(this) as U;
        }
    };

    Reflect.defineProperty(ctor, 'name', { value: name });

    return ctor;
}

export type UnwrapFragment<T> = T extends Fragment<any, infer U> ? U : T;
