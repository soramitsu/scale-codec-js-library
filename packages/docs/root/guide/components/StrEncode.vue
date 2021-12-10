<script setup lang="ts">
import { hexifyBytes } from '@scale-codec/util'
import { encodeStr } from '@scale-codec/core'
import { computed } from 'vue'

const props = defineProps<{
    val: string
}>()

const result = computed(() => hexifyBytes(encodeStr(props.val)))
</script>

<template>
    {{ result }}
</template>
