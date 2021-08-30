import { defineComponent, compile } from 'vue';
import { createApp, renderApp } from './vue-code';

it('renders just text', () => {
    const app = createApp({
        render: compile(`just text`),
    });

    expect(renderApp(app)).toEqual('just text');
});

it.only('renders child components', () => {
    const Child = defineComponent({
        props: {
            msg: String,
        },
        render: compile(`Message - {{ msg }}`),
    });

    const Ws = defineComponent({
        props: {
            text: String,
        },
        render: ({ text }) => text,
    });

    const app = createApp({
        components: { Child, Ws },
        render: compile(`
            <Child msg="nya" />
            <Ws text=" | " />
            <Child msg="Nya?" />
        `),
    });

    expect(renderApp(app)).toEqual('Message - nya | Message - Nya?');
});
