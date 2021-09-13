import { defineComponent, compile } from 'vue';

export default defineComponent({
    props: {
        t: {
            type: String,
            required: true,
        },
    },
    render: compile(`{{ t }}`),
});
