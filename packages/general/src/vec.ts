import { CodecOptions, CodecType, CompatibleNamespaceTypes } from './types';

export type Vec<T> = T[];

export type VecCodecType<T> = CodecType<Vec<T>>;

export type VecCodecOptions<N, T> = CodecOptions<N, Vec<T>>;

export function defineVecCodec<N, T>(typeName: CompatibleNamespaceTypes<N, T>): VecCodecOptions<N, T> {
    return {
        encode: () => null as any,
        decode: () => null as any,
    };
}

// const Vec: {
//     encode:
// }

// const vec = createVecCodec<{ String: string }, string>('String');
