# Benchmarks

## `[u64; 32]`

**Encode:**

<BenchmarkReport report-key="array-u64-32.encode" />

**Decode:**

<BenchmarkReport report-key="array-u64-32.decode" />

## Struct with many fields

::: info

A struct with 40 boolean fields is used as a sample.

:::

**Encode:**

<BenchmarkReport report-key="struct.encode" />

**Decode:**

<BenchmarkReport report-key="struct.decode" />

## Deep nested enums

::: info

The following enum was used to create a deep chain:

```rust
enum Chain {
    None,
    Some(Box<Chain>)
}
```

:::

**Encode:**

<BenchmarkReport report-key="option-chain.encode" />

**Decode:**

<BenchmarkReport report-key="option-chain.decode" />

## `Map<String, bool>`

**Encode:**

<BenchmarkReport report-key="map-str-bool.encode" />

**Decode:**

<BenchmarkReport report-key="map-str-bool.decode" />

## `Set<Compact>`

**Encode:**

<BenchmarkReport report-key="set-compact.encode" />

**Decode:**

<BenchmarkReport report-key="set-compact.decode" />

::: info

`@polkadot/types` is missing here, because we haven't figured out how to make equivalent coding with it.

:::
