module.exports = {
  extends: ['alloy', 'alloy/typescript'],
  env: {
    es2021: true,
  },
  rules: {
    '@typescript-eslint/consistent-type-definitions': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    'spaced-comment': [
      'error',
      'always',
      {
        markers: ['/'],
      },
    ],
    'sort-imports': [
      'warn',
      {
        ignoreCase: false,
        ignoreDeclarationSort: true,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
        allowSeparatedGroups: false,
      },
    ],
  },
  overrides: [
    {
      files: [
        '**/packages/**/*.spec.ts',
        '**/packages/**/__tests__/*.ts',
        '**/e2e-spa/src/**/*.spec.ts',
        '**packages/*/test/**/*.ts',
      ],
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
      files: ['**/*.vue'],
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
        'vue/html-indent': ['warn', 2],
      },
    },
    {
      files: ['./etc/jakefile.ts', './e2e-spa/etc/jakefile.ts'],
      globals: {
        task: true,
        desc: true,
        namespace: true,
      },
    },
  ],
}
