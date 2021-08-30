import { defineComponent, compile } from 'vue';

export default defineComponent({
    name: 'DefSet',
    props: {
        entry: {
            type: String,
            required: true,
        },
    },
    render: compile(`
        <with-def-part part="ty-decoded">
            <export> Set&lt;<ref :to="entry" />&gt; </export>
        </with-def-part>
        <w t="\n\n" />
        <with-def-part part="ty-encodable">
            <export> Set&lt;<ref :to="entry" /> | <core id="EncodeSkippable" />&gt; </export>
        </with-def-part>
        <w t="\n\n" />
        // <ty-name/> set tools
        <w t="\n\n" />
        <with-def-part part="fn-decode">
            const <ty-name/>_entry_encode = <core id="wrapSkippableEncode" />(<ref :to="entry" />)
        </with-def-part>
        <w t="\n\n" />
        // <ty-name/> tools end
        <w t="\n\n" />
        <with-def-part part="fn-decode">
            <export> return <core id="decodeSet"/>(bytes, <ref :to="entry" />) </export>
        </with-def-part>
        <w t="\n\n" />
        <with-def-part part="fn-encode">
            <export> return <core id="encodeSet"/>(encodable, <ty-name/>_entry_encode) </export>
        </with-def-part>
    `),
});
