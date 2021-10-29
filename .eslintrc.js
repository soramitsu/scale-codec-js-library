module.exports = {
    extends: ['alloy', 'alloy/typescript'],
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
            plugins: ['vue'],
            extends: ['plugin:vue/vue3-recommended'],
            parserOptions: {
                ecmaVersion: 2020,
                parser: '@typescript-eslint/parser',
            },
            rules: {
                'vue/html-indent': ['warn', 4],
            },
        },
    ],
};
