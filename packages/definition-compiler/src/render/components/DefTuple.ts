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
        <void-alias v-if="items.length === 0" />

        <template v-else>
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
                        <template v-for="x in items"> <ref :to="x"/> | <core id="EncodeAsIs" />,  </template>
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
            const <ty-name />_encoders = ([
                <with-def-part part="fn-encode">
                    <template v-for="x in items"> <ref :to="x" />, </template>
                </with-def-part>
            ] as any).map(<core id="makeEncoderAsIsRespectable" />)

            <w t="\n\n" />

            // <ty-name /> tools end

            <w t="\n\n" />

            <with-def-part part="fn-decode">
                <export>
                    return <core id="decodeTuple" />(bytes, <ty-name />_decoders as any)
                </export>
            </with-def-part>

            <w t="\n\n" />

            <with-def-part part="fn-encode">
                <export>
                    return <core id="encodeTuple" />(encodable, <ty-name />_encoders as any)
                </export>
            </with-def-part>
        </template>
    `),
});
