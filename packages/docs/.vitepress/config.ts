import { defineConfig } from 'vitepress';

interface SidebarLink {
    text: string;
    link?: string;
    children?: SidebarLink[];
}

function guideSidebar(): SidebarLink[] {
    return [
        {
            text: 'About the project',
            link: '/',
        },
        {
            text: 'Packages',
            children: [
                {
                    text: '@scale-codec/core',
                    link: '/lib/core',
                },
                {
                    text: '@scale-codec/enum',
                    link: '/lib/enum',
                },
            ],
        },
    ];
}

export default defineConfig({
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
            {
                text: 'Guide',
                link: '/',
                activeMatch: '^/$',
            },
            {
                text: 'API',
                link: '/api/',
                activeMatch: '^/api/',
            },
            {
                text: 'GitHub',
                link: 'https://github.com/soramitsu/scale-codec-js-library',
            },
        ],
        sidebar: {
            '/': guideSidebar(),
        },
        // todo: convenient sidebar for API
    },
});
