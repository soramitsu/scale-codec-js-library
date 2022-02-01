module.exports = {
    extends: ['alloy', 'alloy/typescript'],
    env: {
        es2021: true,
    },
    rules: {
        '@typescript-eslint/consistent-type-definitions': 'off',
        'spaced-comment': [
            'error',
            'always',
            {
                markers: ['/'],
            },
        ],
    },
    overrides: [
        {
            files: ['**/packages/**/*.spec.ts', '**/packages/**/__tests__/*.ts', '**/e2e-spa/src/**/*.spec.ts'],
            env: {
                jest: true,
            },
        },
        {
            plugins: ['cypress'],
            files: ['**/e2e-spa/cypress/**/*.spec.js'],
            env: {
                'cypress/globals': true,
            },
        },
        {
            files: ['**/packages/docs/**/*.vue'],
            extends: ['plugin:vue/vue3-recommended'],
            parser: 'vue-eslint-parser',
            parserOptions: {
                parser: '@typescript-eslint/parser',
                sourceType: 'module',
            },
            globals: {
                defineProps: 'readonly',
                defineEmits: 'readonly',
                defineExpose: 'readonly',
                withDefaults: 'readonly',
            },
            rules: {
                'vue/html-indent': ['warn', 4],
            },
        },
    ],
}
