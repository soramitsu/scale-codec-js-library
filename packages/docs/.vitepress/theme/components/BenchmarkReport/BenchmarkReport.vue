<script setup lang="ts">
import { PropType, ref } from 'vue'
import LazyData from '../LazyData.vue'
import BenchmarkReportChart from './BenchmarkReportChart.vue'
import { ReportData } from './types'
import { useIntersectionObserver, templateRef } from '@vueuse/core'

defineProps({
  lazyData: {
    type: Function as PropType<() => Promise<ReportData[]>>,
    required: true,
  },
  label: String,
})

const intersectionTarget = templateRef('chart')
const isVisible = ref(false)

useIntersectionObserver(intersectionTarget, ([{ isIntersecting }]) => {
  isVisible.value = isIntersecting
})
</script>

<template>
  <ClientOnly>
    <LazyData v-slot="{ loaded }" :getter="lazyData" :active="isVisible">
      <BenchmarkReportChart ref="chart" :data="loaded" :label="label" />
    </LazyData>
  </ClientOnly>
</template>
