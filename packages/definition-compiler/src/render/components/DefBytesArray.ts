import { defineComponent, compile } from 'vue';

export default defineComponent({
    name: 'DefBytesArray',
    props: {
        len: {
            type: Number,
            required: true,
        },
    },
    render: compile(`
        <with-def-part part="ty-decoded"> <export>Uint8Array</export> </with-def-part>
        
        <w t="\n\n" />
        
        <with-def-part part="ty-encodable"> <export>Uint8Array</export> </with-def-part>

        <w t="\n\n" />

        const <ty-name/>_len = {{ len }}

        <w t="\n\n" />

        <with-def-part part="fn-decode">
            <export>
                return <core id="decodeUint8Array" />(bytes, <ty-name/>_len)
            </export>
        </with-def-part>

        <w t="\n\n" />

        <with-def-part part="fn-encode">
            <export>
                return <core id="encodeUint8Array" />(encodable, <ty-name/>_len)
            </export>
        </with-def-part>
    `),
});
