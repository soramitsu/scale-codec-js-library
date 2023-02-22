import { defineConfig } from 'vitepress'
import path from 'path'
import { PUBLIC_PACKAGES_UNSCOPED } from '../../../etc/meta'
import vitePluginBenchReports from './vite-plugin-bench-reports'

export default async () =>
  defineConfig({
    srcDir: 'src',
    base: process.env.PUBLIC_PATH || '/',
    title: 'Scale JS',
    description: 'JavaScript SCALE Codec Implementation',
    markdown: {
      attrs: {
        // `typedoc` uses curly braces and markdown breaks because of it
        leftDelimiter: '.{',
        rightDelimiter: '}.',
      },
    },
    themeConfig: {
      nav: [
        {
          text: 'API',
          link: '/api/',
          activeMatch: '/api/',
        },
        {
          text: 'Benchmarks',
          link: '/benchmarks',
        },
      ],
      sidebar: {
        '/api/': [
          {
            text: 'API - Modules',
            items: [
              ...PUBLIC_PACKAGES_UNSCOPED.map((x) => ({
                text: x,
                link: `/api/modules/scale_codec_${x.replace('-', '_')}`,
              })),
            ],
          },
        ],
      },
      socialLinks: [{ icon: 'github', link: 'https://github.com/soramitsu/scale-codec-js-library' }],
    },
    vite: {
      build: {
        target: 'es2020',
      },
      server: {
        fs: {
          allow: [path.resolve(__dirname, '../../benchmark/results')],
        },
      },
      plugins: [vitePluginBenchReports()],
    },
  })
