<script setup lang="ts">
import { computed } from 'vue';
import inspect from 'object-inspect';
import { encodeBigInt, JSBI } from '@scale-codec/core';

const props = defineProps<{
    signed: boolean;
    endianness: 'le' | 'be';
    bits: 8 | 16 | 32 | 64 | 128;
    num: string;
}>();

const result = computed<string>(() => {
    try {
        const result = encodeBigInt(JSBI.BigInt(props.num), props);
        return inspect(result);
    } catch (err) {
        return inspect(err);
    }
});
</script>

<template>
    {{ result }}
</template>
