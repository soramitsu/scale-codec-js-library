import { Encode, StructEncoders, Valuable } from '@scale-codec/core';
import { EncodeSkippable, respectSkip } from './skip';
import mapObj from 'map-obj';

export type StructEncodable<T> = {
    [K in keyof T]: T[K] | EncodeSkippable;
};

export type StructEncodersSkippable<T> = {
    [K in keyof T]: Encode<T[K] | EncodeSkippable>;
};

export function respectSkippableStructFields<T>(structEncoders: StructEncoders<T>): StructEncodersSkippable<T> {
    return mapObj(structEncoders, (key, encode) => {
        return [key, (val) => respectSkip(val, encode)];
    });
}

export type EnumDefEncodable<Def> = {
    [K in keyof Def]: Def[K] extends Valuable<infer V> ? Valuable<V | EncodeSkippable> : Def[K];
};

// export function encodeStruct()
