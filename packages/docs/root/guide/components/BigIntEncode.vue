<script setup lang="ts">
import { computed } from 'vue'
import inspect from 'object-inspect'
import { BigIntTypes, encodeBigInt } from '@scale-codec/core'

const props = defineProps<{
    ty: BigIntTypes
    num: string | number
}>()

const result = computed<string>(() => {
    try {
        const result = encodeBigInt(BigInt(props.num), props.ty)
        return inspect(result)
    } catch (err) {
        return inspect(err)
    }
})
</script>

<template>
    {{ result }}
</template>
