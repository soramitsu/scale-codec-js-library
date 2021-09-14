import { defineComponent, compile } from 'vue';

export default defineComponent({
    name: 'DefArray',
    props: {
        item: {
            type: String,
            required: true,
        },
        len: {
            type: Number,
            required: true,
        },
    },
    render: compile(`
        <with-def-part part="ty-decoded">
            <export>
                <ref :to="item"/>[]
            </export>
        </with-def-part>

        <w t="\n\n" />
        
        <with-def-part part="ty-encodable">
            <export>
                (<ref :to="item" /> | <core id="EncodeAsIs" />)[]
            </export>
        </with-def-part>

        <w t="\n\n" />

        <with-def-part part="fn-encode">
            const <ty-name/>_item_encode = <core id="makeEncoderAsIsRespectable" />(<ref :to="item" />)
        </with-def-part>
        <w t="\n"/>
        const <ty-name/>_len = {{ len }}

        <w t="\n\n" />

        <with-def-part part="fn-decode">
            <export>
                return <core id="decodeArray" />(bytes, <ref :to="item" />, <ty-name/>_len)
            </export>
        </with-def-part>

        <w t="\n\n" />

        <with-def-part part="fn-encode">
            <export>
                return <core id="encodeArray" />(encodable, <ty-name/>_item_encode, <ty-name/>_len)
            </export>
        </with-def-part>
    `),
});
