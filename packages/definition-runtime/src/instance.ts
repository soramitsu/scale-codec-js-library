import { Encode, Decode, DecodeResult } from '@scale-codec/core';
import { assert } from '@scale-codec/util';

type OptionTupleSome<T> = [T];
type OptionTuple<T> = null | OptionTupleSome<T>;

function offPropEnumerability(object: object, prop: PropertyKey) {
    Reflect.defineProperty(object, prop, { enumerable: false });
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

export abstract class ScaleInstance<T, Unwrapped = T> {
    public value: T;

    public bytes: Uint8Array;

    private __value: null | OptionTuple<T>;

    private __bytes: null | Uint8Array;

    protected abstract __encode: Encode<T>;

    protected abstract __decode: Decode<T>;

    public constructor(value: null | OptionTuple<T>, bytes: null | Uint8Array) {
        if (!value && !bytes) throw new Error('ScaleInstance cannot be empty');

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

    private getValue(): T {
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

    public abstract unwrap(): Unwrapped;
}

export type ScaleInstanceCtor<T, U = T> = new (value: null | OptionTuple<T>, bytes: null | Uint8Array) => ScaleInstance<
    T,
    U
>;

export interface ScaleBuilder<T, U = T> {
    fromValue: (value: T) => ScaleInstance<T, U>;
    fromBytes: (bytes: Uint8Array) => ScaleInstance<T, U>;
    fromBytesRaw: (bytes: Uint8Array) => DecodeResult<ScaleInstance<T, U>>;
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

        public static fromBytesRaw(bytes: Uint8Array): DecodeResult<Self> {
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
            offPropEnumerability(this, '__encode');
            offPropEnumerability(this, '__decode');
        }

        public unwrap(): U {
            return (unwrap || unwrapFallback)(this) as U;
        }
    };

    Reflect.defineProperty(ctor, 'name', { value: name });

    return ctor;
}

export type UnwrapScale<T> = T extends ScaleInstance<any, infer U> ? U : T;