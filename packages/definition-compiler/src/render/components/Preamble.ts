import { compile, computed, defineComponent } from 'vue';
import { useCollectorAPI } from './Collector';

export default defineComponent({
    props: {
        importFrom: {
            type: String,
            required: true,
        },
    },
    setup() {
        const collector = useCollectorAPI();

        const importsJoined = computed<null | string>(() => {
            if (collector.imports.value.size > 0) {
                const items = [...collector.imports.value];
                items.sort();
                return items.join(',');
            }
            return null;
        });

        return { importsJoined };
    },
    render: compile(`
        <template v-if="importsJoined">
            import { {{importsJoined}} } from '{{importFrom}}' 
        </template>
    `),
});
