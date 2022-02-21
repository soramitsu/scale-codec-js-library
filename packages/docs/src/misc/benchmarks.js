const raw = import.meta.glob('/../../benchmark/results/*.json')

function transformKey(key) {
    const [, pure] = key.match(/results\/(.+)\.json$/)
    return pure
}

// mapping for convenience
const mapped = Object.fromEntries(Object.entries(raw).map(([k, v]) => [transformKey(k), v]))

export function resultLazy(key) {
    return mapped[key]
}
