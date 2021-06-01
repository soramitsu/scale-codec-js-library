import { CodecTypeExtensions, CodecTypeOptions, CompatibleNamespaceTypes } from './types';

type Vec<T> = CodecTypeExtensions<{
    yahoo: () => void;
}> &
    T[];

export function createVecCodec<N, T>(typeName: CompatibleNamespaceTypes<N, T>): CodecTypeOptions<N, Vec<T>> {
    return {
        encode: () => null as any,
        decode: () => null as any,
    };
}

// const Vec: {
//     encode:
// }

// const vec = createVecCodec<{ String: string }, string>('String');
