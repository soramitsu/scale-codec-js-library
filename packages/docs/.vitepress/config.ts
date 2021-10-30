import { defineConfig } from 'vitepress';
import WindiCSS from 'vite-plugin-windicss';
import path from 'path';

const LIBS = ['core', 'enum', 'util', 'definition-compiler', 'definition-runtime'];

interface SidebarLink {
    text: string;
    link?: string;
    children?: SidebarLink[];
}

function guideSidebar(): SidebarLink[] {
    return [
        {
            text: 'Guide',
            children: [
                { text: 'Intro', link: '/' },
                {
                    text: 'Contribution',
                    link: '/contribution',
                },
            ],
        },
        {
            text: 'Libraries Guides',
            children: LIBS.filter((x) => !/runtime|util/.test(x)).map((x) => ({
                text: x,
                link: `/lib/${x}`,
            })),
        },
        {
            text: 'API',
            link: '/api/',
            children: apiSidebar(),
        },
        {
            text: 'To Do',
            link: '/todo',
        },
    ];
}

function apiSidebar(): SidebarLink[] {
    return LIBS.map((x) => ({
        text: x,
        link: `/api/${x}`,
    }));
}

export default defineConfig({
    base: process.env.PUBLIC_PATH || '/',
    title: 'SCALE codec',
    description: 'Implementation of SCALE codec spec in JavaScript',
    markdown: {
        attrs: {
            // `@microsoft/api-documenter` uses curly braces and markdown breaks because of it
            leftDelimiter: '.{',
            rightDelimiter: '}.',
        },
    },
    themeConfig: {
        nav: [
            // {
            //     text: 'Guide',
            //     link: '/',
            //     activeMatch: '^/$',
            // },
            // {
            //     text: 'API',
            //     link: '/api/',
            //     activeMatch: '^/api/',
            // },
            {
                text: 'GitHub',
                link: 'https://github.com/soramitsu/scale-codec-js-library',
            },
        ],
        sidebar: {
            // '/api/': apiSidebar(),
            '/': guideSidebar(),
        },
        // todo: convenient sidebar for API
    },
    vite: {
        plugins: [WindiCSS({ config: path.resolve(__dirname, '../windi.config.ts') })],
    },
});
