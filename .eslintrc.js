module.exports = {
    extends: ['alloy', 'alloy/typescript'],
    rules: {
        '@typescript-eslint/consistent-type-definitions': 'off',
    },
    overrides: [
        {
            files: ['**/*.spec.ts', '**/__tests__/*.ts'],
            env: {
                jest: true,
            },
        },
    ],
};
