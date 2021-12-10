<script setup lang="ts">
import { encodeCompact } from '@scale-codec/core'
import { hexifyBytes } from '@scale-codec/util'
import { computed } from 'vue'
import objectInspect from 'object-inspect'

const props = defineProps<{
    num: string
    hex?: boolean
}>()

const result = computed(() => {
    try {
        const encoded = encodeCompact(BigInt(props.num))
        return props.hex ? hexifyBytes(encoded) : objectInspect(encoded)
    } catch (err) {
        return err
    }
})
</script>

<template>
    {{ result }}
</template>
