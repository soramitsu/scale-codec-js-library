import { defineComponent } from 'vue';
import { useConfig } from '../config';

export default defineComponent({
    name: 'UseConfig',
    setup(props, { slots }) {
        const config = useConfig();

        return () => slots.default?.(config);
    },
});
