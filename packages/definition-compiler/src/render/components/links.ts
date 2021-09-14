import { defineComponent, compile } from 'vue';
import { useCollectorAPI } from './Collector';

export const WS = defineComponent({
    props: {
        t: {
            type: String,
            required: true,
        },
    },
    render: compile(`{{ t }}`),
});

export const TypeReference = defineComponent({
    props: {
        to: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const api = useCollectorAPI();
        api.collectRef(props.to);
        return {};
    },
    render: compile(`
        <add-part-suffix>{{ to }}</add-part-suffix>
    `),
});

export const Core = defineComponent({
    props: {
        id: {
            type: String,
            required: true,
        },
    },
    setup({ id }) {
        useCollectorAPI().collectCore(id);
        return {};
    },
    render: compile(`{{ id }}`),
});
