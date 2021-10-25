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
export abstract class ScaleInstance<Value, Unwrapped = Value> {
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

export type ScaleInstanceCtor<T, U = T> = new (value: null | OptionTuple<T>, bytes: null | Uint8Array) => ScaleInstance<
    T,
    U
>;

/**
 * Defines how a builder for {@link ScaleInstance} should look like
 */
export interface ScaleBuilder<T, U = T> {
    /**
     * Constructs instance from JS value to give an opportunity to encode it later or use in any
     * other way
     */
    fromValue: (value: T) => ScaleInstance<T, U>;
    /**
     * Constructs instance from SCALE-encoded bytes to give an opportunity to access to its decoded contents
     */
    fromBytes: (bytes: Uint8Array) => ScaleInstance<T, U>;
    /**
     * Raw `Decode` function. Primarily used by the builder or by other builders internally
     */
    decodeRaw: Decode<ScaleInstance<T, U>>;
    /**
     * Constructs instance back from unwrapped value, i.e. works vice versa from {@link ScaleInstance.unwrap}
     */
    wrap: (unwrappedValue: U) => ScaleInstance<T, U>;
}

export type InstanceViaBuilder<T extends ScaleBuilder<any>> = T extends ScaleBuilder<infer V, infer U>
    ? ScaleInstance<V, U>
    : never;

export type BuilderViaInstance<T extends ScaleInstance<any>> = T extends ScaleInstance<infer V, infer U>
    ? ScaleBuilder<V, U>
    : never;

export type InnerValue<T extends ScaleInstance<any> | ScaleBuilder<any>> = T extends ScaleInstance<infer V>
    ? V
    : T extends ScaleBuilder<infer V>
    ? V
    : never;

export type UnwrappedValue<T extends ScaleInstance<any> | ScaleBuilder<any>> = T extends ScaleInstance<any, infer U>
    ? U
    : T extends ScaleBuilder<any, infer U>
    ? U
    : never;

function decodeAndMemorize<T extends ScaleInstance<any>>(
    bytes: Uint8Array,
    decode: Decode<InnerValue<T>>,
    ctor: ScaleInstanceCtor<InnerValue<T>>,
): DecodeResult<T> {
    const [value, bytesCount] = decode(bytes);
    const usedBytes = bytes.slice(0, bytesCount);
    // eslint-disable-next-line new-cap
    const instance = new ctor([value], usedBytes) as T;
    return [instance, bytesCount];
}

function unwrapFallback<T>(scale: ScaleInstance<T, any>): any {
    return scale.value;
}

export type ScaleBuilderUnwrapper<T, U> = (self: ScaleInstance<T, U>) => U;

export type ScaleBuilderWrapper<T, U> = (unwrapped: U) => T;

/**
 * Universal function that specifies necessary stuff to implement {@link ScaleBuilder} protocol
 */
// eslint-disable-next-line max-params
export function createScaleBuilder<T, U = T>(
    name: string,
    encode: Encode<T>,
    decode: Decode<T>,
    unwrap?: ScaleBuilderUnwrapper<T, U>,
    wrap?: ScaleBuilderWrapper<T, U>,
): ScaleBuilder<T, U> {
    const ctor: ScaleBuilder<T, U> = class Self extends ScaleInstance<T, U> {
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

export type UnwrapScale<T> = T extends ScaleInstance<any, infer U> ? U : T;
