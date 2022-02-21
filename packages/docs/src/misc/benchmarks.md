# Benchmarks

<script setup>
import { resultLazy } from './benchmarks.js'
</script>

## Array of Integers

### Encoding

<BenchmarkReport :lazy-data="resultLazy('arr-u64-32-encode')" label="Encoding [u64; 32]" />

### Decoding

<BenchmarkReport :lazy-data="resultLazy('arr-u64-32-decode')" label="Decoding [u64; 32]" />

## Structs

### Encoding

<BenchmarkReport :lazy-data="resultLazy('struct-encode')" label="Encoding Struct" />

### Decoding

<BenchmarkReport :lazy-data="resultLazy('struct-decode')" label="Decoding Struct" />
