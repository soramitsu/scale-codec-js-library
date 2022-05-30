<script setup lang="ts">
import { onUnmounted, PropType, ref, watch, computed } from 'vue'
import Chart from 'chart.js/auto'
import type { ReportData } from './types'
import { organizeReportData, ReportDataParsed, expandDatasetEntries } from './util'

const props = defineProps({
  data: {
    type: Object as PropType<ReportData | null>,
    default: null,
  },
  label: String,
})

const dataOrganized = computed<ReportDataParsed | null>(() => props.data && organizeReportData(props.data))

const canvas = ref<null | HTMLCanvasElement>(null)

let chart: Chart | null = null
onUnmounted(() => chart?.destroy())
watch([canvas, dataOrganized], ([el, data]) => {
  console.log(data)
  if (el && data) {
    chart = new Chart(el, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: expandDatasetEntries(data.datasets),
      },
    })
  }
})
</script>

<template>
  <canvas ref="canvas" :aria-label="label" role="img">
    <p>Your browser does not support the canvas element.</p>
  </canvas>
</template>
