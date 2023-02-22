<script setup lang="ts">
import { computed } from 'vue'
import BenchmarkReportChart from './BenchmarkReportChart.vue'
import reports from '~benchmark-reports'

const props = defineProps<{ reportKey: string }>()

const report = computed(() => {
  if (props.reportKey in reports) {
    return reports[props.reportKey]
  }
  throw new Error(`Invalid report key: ${props.reportKey}`)
})

const chart = computed(() => {
  return {
    title: report.value.name,
    datasets: report.value.results.map((x) => ({ label: x.name, data: [x.ops] })),
  }
})
</script>

<template>
  <BenchmarkReportChart :title="chart.title" :datasets="chart.datasets" />
</template>
