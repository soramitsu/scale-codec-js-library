import { defineComponent, compile, computed } from 'vue';

interface FieldNormalised {
    item: unknown;
    key: unknown;
    value: unknown;
}

export default defineComponent({
    name: 'Fields',
    props: {
        items: {
            type: Array,
            required: true,
        },
        prop: {
            type: String,
            default: 'name',
        },
        value: {
            type: String,
            default: 'ref',
        },
        eachOnANewRow: {
            type: Boolean,
            default: true,
        },
    },
    setup(props) {
        const parsed = computed<FieldNormalised[]>(() => {
            return props.items.map((x: any) => {
                if (x) {
                    return {
                        item: x,
                        key: x[props.prop],
                        value: x[props.value],
                    };
                }

                return {
                    item: x,
                    key: null,
                    value: null,
                };
            });
        });

        return {
            parsed,
        };
    },
    render: compile(`
        {
            <w v-if="eachOnANewRow" t="\n"/>
            <template v-for="{ item, key, value } in parsed">
                <slot name="key" v-bind="{ item, key }">{{ key }}</slot>: <slot name="value" v-bind="{ item, value }">{{ value }}</slot>,
            </template>
        }
    `),
});
