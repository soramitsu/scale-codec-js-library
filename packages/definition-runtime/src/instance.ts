import { Encode, Decode, DecodeResult } from '@scale-codec/core';
import { assert } from '@scale-codec/util';

type OptionTupleSome<T> = [T];
type OptionTuple<T> = null | OptionTupleSome<T>;

export abstract class ScaleInstance<T> {
    private __value: null | OptionTuple<T> = null;

    private __bytes: null | Uint8Array = null;

    protected abstract __encode: Encode<T>;

    protected abstract __decode: Decode<T>;

    public constructor(value: null | OptionTuple<T>, bytes: null | Uint8Array) {
        if (!value && !bytes) throw new Error('ScaleInstance cannot be empty');
        this.__value = value;
        this.__bytes = bytes;
    }

    public get value(): T {
        if (!this.__value) {
            const bytes = this.__bytes!;
            const [val, len] = this.__decode(bytes);
            assert(bytes.length === len, () => `Decoded bytes mismatch: (actual) ${len} vs (expected) ${bytes.length}`);
            this.__value = [val];
        }
        return this.__value[0];
    }

    public get bytes(): Uint8Array {
        if (!this.__bytes) {
            this.__bytes = this.__encode(this.__value![0]);
        }
        return this.__bytes;
    }

    public toJSON() {
        return { value: this.value, bytes: this.bytes };
    }
}

export type ScaleInstanceCtor<T> = new (value: null | OptionTuple<T>, bytes: null | Uint8Array) => ScaleInstance<T>;

export interface ScaleBuilder<T> {
    fromValue: (value: T) => ScaleInstance<T>;
    fromBytes: (bytes: Uint8Array) => ScaleInstance<T>;
    fromBytesRaw: (bytes: Uint8Array) => DecodeResult<ScaleInstance<T>>;
}

export type InstanceViaBuilder<T extends ScaleBuilder<any>> = T extends ScaleBuilder<infer U>
    ? ScaleInstance<U>
    : never;

export type BuilderViaInstance<T extends ScaleInstance<any>> = T extends ScaleInstance<infer U>
    ? ScaleBuilder<U>
    : never;

export type InnerValue<T extends ScaleInstance<any> | ScaleBuilder<any>> = T extends ScaleInstance<infer U>
    ? U
    : T extends ScaleBuilder<infer U>
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

export function createScaleBuilder<T>(name: string, encode: Encode<T>, decode: Decode<T>): ScaleBuilder<T> {
    const ctor: ScaleBuilder<T> = class Self extends ScaleInstance<T> {
        public static fromValue(value: T): Self {
            return new Self([value], null);
        }

        public static fromBytes(bytes: Uint8Array): Self {
            return new Self(null, bytes);
        }

        public static fromBytesRaw(bytes: Uint8Array): DecodeResult<Self> {
            return decodeAndMemorize(bytes, decode, Self);
        }

        protected __encode = encode;
        protected __decode = decode;
    };

    Reflect.defineProperty(ctor, 'name', { value: name });

    return ctor;
}

export type UnwrapScaleInstanceTuple<T extends any[]> = T extends [infer Head, ...infer Tail]
    ? [UnwrapScaleInstance<Head>, ...UnwrapScaleInstanceTuple<Tail>]
    : [];

export type UnwrapScaleInstance<T> = T extends ScaleInstance<any>[]
    ? UnwrapScaleInstanceTuple<T>
    : T extends Set<ScaleInstance<infer V>>
    ? Set<UnwrapScaleInstance<V>>
    : T extends Map<ScaleInstance<infer K>, ScaleInstance<infer V>>
    ? Map<UnwrapScaleInstance<K>, UnwrapScaleInstance<V>>
    : T extends { [K in keyof T]: ScaleInstance<any> }
    ? { [K in keyof T]: UnwrapScaleInstance<T[K]> }
    : T;
