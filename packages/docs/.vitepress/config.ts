import { defineConfigWithTheme, MarkdownOptions } from 'vitepress'
import WindiCSS from 'vite-plugin-windicss'
import path from 'path'
import customHighlight from './highlight'

const LIBS = ['core', 'enum', 'util', 'definition-compiler', 'definition-runtime']

interface SidebarLink {
    text: string
    link?: string
    children?: SidebarLink[]
}

function guideSidebar(): SidebarLink[] {
    return [
        {
            text: 'Getting Started',
            children: [
                {
                    text: 'Introduction',
                    link: '/guide/introduction',
                },
                {
                    text: 'Enums',
                    link: '/guide/enum',
                },
                {
                    text: 'Core',
                    link: '/guide/core',
                },
                {
                    text: 'Definition',
                    link: '/guide/definition',
                },
            ],
        },
    ]
}

function apiSidebar(): SidebarLink[] {
    return [
        {
            text: 'API',
            children: [
                {
                    text: 'Index',
                    link: '/api/',
                },
                ...LIBS.map((x) => ({
                    text: `@scale-codec/${x}`,
                    link: `/api/${x}`,
                })),
            ],
        },
    ]
}

function miscSidebar(): SidebarLink[] {
    return [
        {
            text: 'Miscellaneous',
            children: [
                {
                    text: 'Benchmarks',
                    link: '/misc/benchmarks',
                },
                {
                    text: 'Maintanence',
                    link: '/misc/contribution',
                },
            ],
        },
    ]
}

function nav() {
    return [
        {
            text: 'Guide',
            link: '/guide/introduction',
            activeMatch: '^/guide/',
        },
        {
            text: 'API',
            link: '/api/',
        },
        {
            text: 'Misc',
            items: [
                {
                    text: 'Benchmarks',
                    link: '/misc/benchmarks',
                },
                {
                    text: 'Contribution',
                    link: '/misc/contribution',
                },
            ],
        },
    ]
}

export default async () =>
    defineConfigWithTheme({
        srcDir: 'src',
        base: process.env.PUBLIC_PATH || '/',
        title: 'SCALE Codec JavaScript',
        description: 'JavaScript Implementation of the SCALE Codec',
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        markdown: {
            attrs: {
                // `@microsoft/api-documenter` uses curly braces and markdown breaks because of it
                leftDelimiter: '.{',
                rightDelimiter: '}.',
            },
            highlight: await customHighlight(),
        } as MarkdownOptions & { highlight: any },
        themeConfig: {
            repo: 'soramitsu/scale-codec-js-library',
            docsDir: 'packages/docs/src',
            editLinks: true,
            editLinkText: 'Edit this page',
            lastUpdated: 'Last Updated',

            nav: nav(),
            sidebar: {
                '/guide/': guideSidebar(),
                '/api/': apiSidebar(),
                '/misc/': miscSidebar(),
            },
        },
        vite: {
            plugins: [WindiCSS({ config: path.resolve(__dirname, '../windi.config.ts') })],
            build: {
                target: 'es2020',
            },
            server: {
                fs: {
                    allow: [path.resolve(__dirname, '../../benchmark/results')],
                },
            },
        },
    })
