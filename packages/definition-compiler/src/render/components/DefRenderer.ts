import { defineComponent, computed, PropType, compile } from 'vue';
import { TypeDef } from '../../definitions';

import DefVec from './DefVec';
import DefTuple from './DefTuple';
import DefStruct from './DefStruct';

export default defineComponent({
    props: {
        tyName: {
            type: String,
            required: true,
        },
        def: {
            type: Object as PropType<TypeDef>,
            required: true,
        },
    },
    setup(props) {
        const specificRenderer = computed(() => {
            if (props.def.t === 'vec') {
                return DefVec;
            }
            if (props.def.t === 'tuple') return DefTuple;
            if (props.def.t === 'struct') return DefStruct;

            throw new Error('unimplemented');
        });

        const bindings = computed(() => {
            const { t, ...rest } = props.def;
            return rest;
        });

        return {
            specific: specificRenderer,
            bindings,
        };
    },
    render: compile(`
        // {{ tyName }}

        <w t="\n\n"/>

        <with-current-type-name :name="tyName">
            <component :is="specific" v-bind="bindings" />
        </with-current-type-name>
    `),
});