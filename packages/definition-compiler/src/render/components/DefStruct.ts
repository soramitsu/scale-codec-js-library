import { defineComponent, compile, PropType } from 'vue';

const Fields = defineComponent({
    name: 'Fields',
    props: {
        items: {
            type: Array,
            required: true,
        },
        key: {
            type: String,
            default: 'name',
        },
        value: {
            type: String,
            default: 'ref',
        },
    },
    render: compile(`
        {
            <w t="\n"/>
            <template v-for="item in items">
                <slot name="key" v-bind="{key: item[key]}">{{ item[key] }}</slot>: <slot name="value" v-bind="{value: item[value]}">{{ item[value] }}</slot>,
            </template>
        }
    `),
});

export default defineComponent({
    name: 'DefStruct',
    components: {
        Fields,
    },
    props: {
        fields: {
            type: Array as PropType<{ name: string; ref: string }[]>,
            required: true,
        },
    },
    render: compile(`
        <with-def-part part="ty-decoded">
            <export>
                <fields :items="fields">
                    <template #value="{ value: x }">
                        <ref :to="x" />
                    </template>
                </fields>
            </export>
        </with-def-part>

        <w t="\n\n" />

        <with-def-part part="ty-encodable">
            <export>
                <fields :items="fields">
                    <template #value="{ value: x }">
                        <ref :to="x" /> | <core id="EncodeSkippable" />
                    </template>
                </fields>
            </export>
        </with-def-part>

        <w t="\n\n" />

        // <ty-name/> struct tools

        <w t="\n\n" />

        const <ty-name/>_order = [
            <template v-for="{ name } in fields">
                '{{ name }}',
            </template>
        ]
        <w t="\n" />
        const <ty-name/>_decoders =
            <with-def-part part="fn-decode">
                <fields :items="fields">
                    <template #value="{ value }">
                        <ref :to="value" />
                    </template>
                </fields>
            </with-def-part>
        <w t="\n" />
        const <ty-name/>_encoders =
            <with-def-part part="fn-encode">
                <fields :items="fields">
                    <template #value="{ value }">
                        <core id="wrapSkippableEncode"/>( <ref :to="value" /> )
                    </template>
                </fields>
            </with-def-part>

        <w t="\n\n" />

        // <ty-name/> tools end

        <w t="\n\n" />

        <with-def-part part="fn-decode">
            <export>
                return <core id="decodeStruct" />(bytes, <ty-name/>_decoders, <ty-name/>_order)
            </export>
        </with-def-part>

        <w t="\n\n" />

        <with-def-part part="fn-encode">
            <export>
                return <core id="encodeStruct" />(encodable, <ty-name/>_encoders, <ty-name/>_order)
            </export>
        </with-def-part>
    `),
});
