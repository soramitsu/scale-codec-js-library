<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue'
import { Chart } from 'chart.js'
import colorLib from '@kurkle/color'
import { templateRef, useIntersectionObserver } from '@vueuse/core'
import { Pkg, parseCaseName } from '../re-benchmark'
import { CASE_COLORS } from '../const'

const props = defineProps<{
  title: string
  datasets: { label: string; data: [number] }[]
}>()

function caseColor(pkg: Pkg) {
  return CASE_COLORS[pkg]
}

const canvas = ref<null | HTMLCanvasElement>(null)

let chart: Chart | null = null
onUnmounted(() => chart?.destroy())
watch(canvas, (element) => {
  if (element) {
    chart = new Chart(element, {
      type: 'bar',

      data: {
        labels: [props.title],
        datasets: props.datasets.map((base) => {
          const { pkg, version } = parseCaseName(base.label)

          const color = caseColor(pkg)

          return {
            ...base,
            label: `${pkg} v${version}`,
            backgroundColor: colorLib(color).alpha(0.5).rgbString(),
            borderColor: color,
            borderWidth: 2,
            borderRadius: 4,
          }
        }),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          delay: 200,
          easing: 'easeOutQuint',
        },
        plugins: {
          tooltip: {
            callbacks: {
              label(context) {
                return `${context.dataset.label}: ${context.parsed.y} ops`
              },
            },
          },
        },
      },
    })
  }
})

const shouldRenderCanvas = ref(false)

useIntersectionObserver(
  templateRef<HTMLDivElement>('container'),
  ([{ isIntersecting }]) => {
    if (isIntersecting) shouldRenderCanvas.value = true
  },
  { threshold: 0.3 },
)
</script>

<template>
  <div
    ref="container"
    class="container"
    style="height: 344px"
  >
    <Transition
      name="fade"
      appear
    >
      <canvas
        v-if="shouldRenderCanvas"
        ref="canvas"
        role="img"
      >
        <p>Your browser does not support the canvas element.</p>
      </canvas>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.container {
  height: 360px;
  padding: 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}

.fade {
  &-enter-active {
    transition: opacity 0.5s ease;
  }

  &-enter-from {
    opacity: 0;
  }
}
</style>
