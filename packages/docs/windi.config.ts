import { defineConfig } from 'windicss/helpers';

export default defineConfig({
    preflight: false,
    extract: {
        include: ['**/*.{md,vue}', '.vitepress/**/*.{ts,md,vue}'],
    },
});
