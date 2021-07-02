import { NamespaceCodec } from './types';

export function defAlias<N, K extends keyof N>(ref: K): NamespaceCodec<N[K], N> {
    return {
        setup: ({ dynCodec }) => dynCodec(ref),
    };
}
