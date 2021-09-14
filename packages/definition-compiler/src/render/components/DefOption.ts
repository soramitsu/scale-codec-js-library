import { defineComponent, compile, computed } from 'vue';
import { EnumVariantDef } from '../../definitions';
import { Encoders, Decoders } from './DefEnum';

export default defineComponent({
    name: 'DefSet',
    components: {
        Encoders,
        Decoders,
    },
    props: {
        some: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        return {
            variants: computed<EnumVariantDef[]>(() => [
                {
                    name: 'None',
                    discriminant: 0,
                },
                {
                    name: 'Some',
                    discriminant: 1,
                    ref: props.some,
                },
            ]),
        };
    },
    render: compile(`
        <with-def-part part="ty-decoded">
            <export> <core id="Option"/>&lt;<ref :to="some" />&gt; </export>
        </with-def-part>

        <w t="\n\n" />
        <with-def-part part="ty-encodable">
            <export> <core id="Option"/>&lt;<ref :to="some" /> | <core id="EncodeAsIs" />&gt; </export>
        </with-def-part>

        <w t="\n\n" />
        
        <decoders v-bind="{ variants }"> const <ty-name/>_decoders </decoders>
        <w t="\n" />
        <encoders v-bind="{ variants }"> const <ty-name/>_encoders </encoders>

        <w t="\n\n" />

        <with-def-part part="fn-decode">
            <export> return <core id="decodeEnum"/>(bytes, <ty-name/>_decoders) </export>
        </with-def-part>
        <w t="\n\n" />
        <with-def-part part="fn-encode">
            <export> return <core id="encodeEnum"/>(encodable, <ty-name/>_encoders) </export>
        </with-def-part>
    `),
});
