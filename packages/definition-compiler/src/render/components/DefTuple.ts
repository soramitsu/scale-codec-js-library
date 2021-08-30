import { defineComponent, compile } from 'vue';

export default defineComponent({
    props: {
        item: {
            type: String,
            required: true,
        },
    },
    render: compile(`
        <with-def-part part="ty-decoded">
            <export>
                <ref :to="item"/>[]
            </export>
        </with-def-part>

        <w-s t="\n\n" />
        
        <with-def-part part="ty-encodable">
            <export>
                (<ref :to="item" /> | <core id="EncodeSkippable" />)[]
            </export>
        </with-def-part>

        <w-s t="\n\n" />

        <with-def-part part="fn-decode">
            <export>
                return <core id="decodeVec" />(bytes, <ref :to="item" />)
            </export>
        </with-def-part>

        <w-s t="\n\n" />

        <with-def-part part="fn-encode">
            <export>
                return <core id="encodeVec" />(encodable, <ref :to="item" />)
            </export>
        </with-def-part>
    `),
});
