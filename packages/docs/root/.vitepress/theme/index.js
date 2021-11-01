import ThemeDefault from 'vitepress/theme';
import LangText from './components/LangText.vue';
import 'virtual:windi.css';

export default {
    ...ThemeDefault,
    enhanceApp({ app }) {
        app.component('LangText', LangText);
    },
};
