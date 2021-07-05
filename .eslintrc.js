module.exports = {
    extends: ['alloy', 'alloy/typescript'],
    rules: {
        '@typescript-eslint/consistent-type-definitions': 'off',
    },
    overrides: [
        {
            files: ['**/packages/**/*.spec.ts', '**/packages/**/__tests__/*.ts'],
            env: {
                jest: true,
            },
        },
    ],
};
