import { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import BenchmarkReport from './components/BenchmarkReport.vue'

import { BarController, BarElement, CategoryScale, Chart, Legend, LinearScale, Tooltip } from 'chart.js'
Chart.register(BarElement, BarController, CategoryScale, LinearScale, Legend, Tooltip)

const customTheme: Theme = {
  ...DefaultTheme,
  enhanceApp(ctx) {
    DefaultTheme.enhanceApp(ctx)

    ctx.app.component('BenchmarkReport', BenchmarkReport)
  },
}

export default customTheme
