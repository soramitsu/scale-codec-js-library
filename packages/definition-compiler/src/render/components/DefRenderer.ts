import { defineComponent, computed, PropType, compile } from 'vue';
import { MapDef, TypeDef } from '../../definitions';

import DefVec from './DefVec';
import DefTuple from './DefTuple';
import DefStruct from './DefStruct';
import DefEnum from './DefEnum';
import DefSet from './DefSet';
import DefMap from './DefMap';
import DefArray from './DefArray';
import DefBytesArray from './DefBytesArray';

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
            switch (props.def.t) {
                case 'vec':
                    return DefVec;
                case 'tuple':
                    return DefTuple;
                case 'struct':
                    return DefStruct;
                case 'enum':
                    return DefEnum;
                case 'set':
                    return DefSet;
                case 'map':
                    return DefMap;
                case 'array':
                    return DefArray;
                case 'bytes-array':
                    return DefBytesArray;
                default:
                    throw new Error('unimplemented');
            }
        });

        const bindings = computed(() => {
            const { t, ...rest } = props.def;

            if (t === 'map') {
                return {
                    keyRef: (rest as MapDef).key,
                    valueRef: (rest as MapDef).value,
                };
            }

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
