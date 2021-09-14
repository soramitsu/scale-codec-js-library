import { defineComponent, PropType, computed, compile } from 'vue';
import { NamespaceDefinition, TypeDef } from '../definitions';
import { byValue, byString } from 'sort-es';
import { provideConfig } from './config';

import Collector from './components/Collector';
import Preamble from './components/Preamble';
import DefRenderer from './components/DefRenderer';

export default defineComponent({
    components: {
        Collector,
        Preamble,
        DefRenderer,
    },
    props: {
        defmap: {
            type: Object as PropType<NamespaceDefinition>,
            required: true,
        },
        importLib: {
            type: String,
            default: 'sample',
        },
    },
    setup(props) {
        const defsList = computed<{ tyName: String; def: TypeDef }[]>(() => {
            const items = Object.entries(props.defmap);
            items.sort(byValue((x) => x[0], byString()));
            return items.map(([tyName, def]) => ({ tyName, def }));
        });

        provideConfig({
            importLib: props.importLib,
        });

        return {
            defsList,
        };
    },
    render: compile(`
        <collector>
            <preamble />


            <template v-for="x in defsList" :key="x.tyName">
                <w t="\n\n" />
                <def-renderer v-bind="x" />
            </template>
        </collector>
    `),
});
