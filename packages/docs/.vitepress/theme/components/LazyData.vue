<script setup lang="ts">
import { ref } from 'vue'
import { whenever } from '@vueuse/core'

const props = defineProps<{
    getter: () => Promise<any>
    active?: boolean
}>()

const loaded = ref<any>(null)

whenever(
    () => props.active,
    async () => {
        if (!loaded.value) {
            loaded.value = await props.getter()
        }
    },
    { immediate: true },
)
</script>

<template>
    <slot v-bind="{ loaded }" />
</template>
