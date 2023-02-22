import {Theme} from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import BenchmarkReport from "./components/BenchmarkReport.vue";

const customTheme: Theme = {
  ...DefaultTheme,
  enhanceApp(ctx) {
    DefaultTheme.enhanceApp(ctx)

    ctx.app.component('BenchmarkReport', BenchmarkReport)
  },
}

export default customTheme
