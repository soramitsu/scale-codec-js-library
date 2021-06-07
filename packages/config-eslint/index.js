module.exports = {
    extends: ['alloy', 'alloy/typescript'],
    overrides: [
        {
            files: ['**/*.spec.ts'],
            env: {
                jest: true,
            },
        },
    ],
};
