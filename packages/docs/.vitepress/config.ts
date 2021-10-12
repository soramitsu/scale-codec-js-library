import { defineConfig } from 'vitepress';

export default defineConfig({
    title: 'SCALE codec',
    description: 'Implementation of SCALE spec in JavaScript',
    markdown: {
        attrs: {
            // overriding because `@microsoft/api-documenter` uses curly braces
            leftDelimiter: '.{',
            rightDelimiter: '}.',
        },
    },
    themeConfig: {
        nav: [
            { text: 'Intro', link: '/', activeMatch: '^/$' },
            {
                text: 'API',
                link: '/api/',
                activeMatch: '^/api/',
            },
            {
                text: 'GitHub',
                link: 'https://github.com/soramitsu/scale-codec-js-library',
            },
        ],
        // todo: convenient sidebar for API
    },
});
