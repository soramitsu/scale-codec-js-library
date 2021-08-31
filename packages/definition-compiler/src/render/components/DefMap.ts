import { defineComponent, compile } from 'vue';

export default defineComponent({
    name: 'DefMap',
    props: {
        keyRef: {
            type: String,
            required: true,
        },
        valueRef: {
            type: String,
            required: true,
        },
    },
    render: compile(`
        <with-def-part part="ty-decoded">
            <export>
                Map&lt;<template v-for="i in [keyRef, valueRef]"> <ref :to="i" />, </template>&gt
            </export>
            </with-def-part>
        <w t="\n\n" />
        <with-def-part part="ty-encodable">
            <export>
                Map&lt;<template v-for="i in [keyRef, valueRef]">
                    <ref :to="i" /> | <core id="EncodeAsIs"/>,
                </template>&gt
            </export>
        </with-def-part>
        <w t="\n\n" />
        <with-def-part part="fn-encode">
            const [<ty-name/>_encode_key, <ty-name/>_encode_value] = [
                <template v-for="i in [keyRef, valueRef]"> <ref :to="i"/>, </template>
            ].map(<core id="makeEncoderAsIsRespectable" />) as [
                <with-def-part part="ty-encodable">
                    <template v-for="i in [keyRef, valueRef]">
                        <core id="Encode"/> &lt; <ref :to="i" /> | <core id="EncodeAsIs"/> &gt;,
                    </template>
                </with-def-part>
            ]
        </with-def-part>
        <w t="\n\n" />
        <with-def-part part="fn-decode">
            <export> return <core id="decodeMap"/>(bytes, <ref :to="keyRef" />, <ref :to="valueRef" />) </export>
        </with-def-part>
        <w t="\n\n" />
        <with-def-part part="fn-encode">
            <export> return <core id="encodeMap"/>(encodable, <ty-name/>_encode_key, <ty-name/>_encode_value) </export>
        </with-def-part>
    `),
});
