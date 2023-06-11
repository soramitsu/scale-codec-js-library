# Benchmarks

Benchmark is driven by [`benny`](https://www.npmjs.com/package/benny) framework.

Libraries included:

- `@scale-codec/core` from this project
- `@scale-codec/definition-runtime` also from this project. It is based on the core library, but provides some higher-level utilities, so it is interesting to see how do they affect performance.
- [`@polkadot/types`](https://www.npmjs.com/package/@polkadot/types/v/9.14.2)
- `parity-scale-codec`, or [`scale-codec` on NPM](https://www.npmjs.com/package/scale-codec/v/0.10.2), or [`scale-ts` in GitHub](https://github.com/paritytech/scale-ts/tree/5a6465ac7bf6135f12ef5392a6782343b7f88697)

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

## Nested structs with a single `u32` value

**Encode:**

<BenchmarkReport report-key="struct-deep-u32.encode" />

**Decode:**

<BenchmarkReport report-key="struct-deep-u32.decode" />

## Nested zero-size structs

:::info
This case is not very realistic, by the way.
:::

**Encode:**

<BenchmarkReport report-key="struct-deep-unit.encode" />

**Decode:**

<BenchmarkReport report-key="struct-deep-unit.decode" />

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
