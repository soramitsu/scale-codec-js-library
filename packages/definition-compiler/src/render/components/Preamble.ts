import { compile, computed, defineComponent } from 'vue';
import { useCollectorAPI } from './Collector';

export default defineComponent({
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
        /* eslint-disable */

        <w t="\n" />

        <template v-if="importsJoined">
            <use-config v-slot="{ importLib } ">
                import { {{ importsJoined }} } from '{{ importLib }}' 
            </use-config>
        </template>
    `),
});
