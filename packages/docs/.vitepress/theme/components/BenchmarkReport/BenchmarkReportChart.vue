<script setup lang="ts">
import { onUnmounted, PropType, ref, watch } from 'vue'
import Chart from 'chart.js/auto'
import { ReportData } from './types'

const props = defineProps({
    data: {
        type: Object as PropType<ReportData | null>,
        default: null,
    },
    label: String,
})

const canvas = ref<null | HTMLCanvasElement>(null)

let chart: Chart | null = null

onUnmounted(() => chart?.destroy())

watch([canvas, () => props.data], ([el, data]) => {
    if (el && data) {
        chart = new Chart(el, {
            type: 'bar',

            data: {
                labels: data.results.map((x) => x.name),
                datasets: [
                    {
                        label: props.label,
                        data: data.results.map((x) => x.ops),
                    },
                ],
            },
        })
    }
})
</script>

<template>
    <canvas
        ref="canvas"
        :aria-label="label"
        role="img"
    >
        <p>Your browser does not support the canvas element.</p>
    </canvas>
</template>
