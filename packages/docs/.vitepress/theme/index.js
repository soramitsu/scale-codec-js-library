import ThemeDefault from 'vitepress/theme'
// import BenchmarkReport from './components/BenchmarkReport/BenchmarkReport.vue'
// import LangText from './components/LangText.vue'
import 'virtual:windi.css'
import './style/index.scss'

export default {
    ...ThemeDefault,
    enhanceApp({ app }) {
        // app.component('BenchmarkReport', BenchmarkReport)
    },
}
