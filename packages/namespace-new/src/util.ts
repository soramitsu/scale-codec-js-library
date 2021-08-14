export function wrapOnce<T>(valCb: () => T): () => T {
    let cached: undefined | T;
    return () => {
        if (!cached) cached = valCb();
        return cached;
    };
}
