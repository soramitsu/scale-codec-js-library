import { Decode, DecodeResult } from '@scale-codec/core';

/**
 * This symbol could be used by tracker to inspect value
 */
export const TrackValueInspect = Symbol('TrackValueInspect');

/**
 * Implement this for the object if you want to handle its inspection in the console
 */
export interface TrackValueInspectable {
    [TrackValueInspect]: () => any;
}

export type TrackDecodeFn = <T>(loc: string, input: Uint8Array, decode: Decode<T>) => DecodeResult<T>;

export type RefineDecodeLocFn = <T>(loc: string, headlessDecode: () => DecodeResult<T>) => DecodeResult<T>;

/**
 * Instance that defines method to track decoding flow
 */
export interface CodecTracker {
    /**
     * Used to track decode step: location, input, and result
     */
    decode?: TrackDecodeFn;
    /**
     * Used to clarify decode location without tracking of the input and the output
     */
    refineDecodeLoc?: RefineDecodeLocFn;
}
