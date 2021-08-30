import { defineComponent, compile } from 'vue';

export default defineComponent({
    name: 'DefTuple',
    props: {
        items: {
            type: Array,
            required: true,
        },
    },
    render: compile(`
        <with-def-part part="ty-decoded">
            <export>
                [
                    <template v-for="x in items"> <ref :to="x"/>, </template>
                ]<w t="\n" />
            </export>
        </with-def-part>

        <w t="\n\n" />
        
        <with-def-part part="ty-encodable">
            <export>
                [
                    <template v-for="x in items"> <ref :to="x"/> | <core id="EncodeSkippable" />,  </template>
                ]<w t="\n" />
            </export>
        </with-def-part>

        <w t="\n\n" />

        // <ty-name /> tuple-related tools

        <w t="\n\n" />

        const <ty-name />_decoders = [
            <with-def-part part="fn-decode">
                <template v-for="x in items"> <ref :to="x" />, </template>
            </with-def-part>
        ]<w t="\n" />
        const <ty-name />_encoders = [
            <with-def-part part="fn-encode">
                <template v-for="x in items"> <ref :to="x" />, </template>
            </with-def-part>
        ].wrap(<core id="wrapSkippableEncode" />)

        <w t="\n\n" />

        // <ty-name /> tools end

        <w t="\n\n" />

        <with-def-part part="fn-decode">
            <export>
                return <core id="decodeTuple" />(bytes, <ty-name />_decoders)
            </export>
        </with-def-part>

        <w t="\n\n" />

        <with-def-part part="fn-encode">
            <export>
                return <core id="encodeTuple" />(encodable, <ty-name />_encoders)
            </export>
        </with-def-part>
    `),
});
