import { defineComponent, compile, PropType } from 'vue';

export default defineComponent({
    name: 'DefStruct',
    props: {
        fields: {
            type: Array as PropType<{ name: string; ref: string }[]>,
            required: true,
        },
    },
    render: compile(`
        <void-alias v-if="fields.length === 0" />

        <template v-else>
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
                            <ref :to="x" /> | <core id="EncodeAsIs" />
                        </template>
                    </fields>
                </export>
            </with-def-part>

            <w t="\n\n" />

            const <ty-name/>_order: (keyof <ty-name/>_Decoded)[] = [
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
                            <core id="makeEncoderAsIsRespectable"/>( <ref :to="value" /> )
                        </template>
                    </fields>
                </with-def-part>

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
        </template>
    `),
});
