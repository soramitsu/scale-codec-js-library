import { defineComponent, compile, PropType } from 'vue';
import { DefEnumVariant } from '../../definitions';

export const Decoders = defineComponent({
    props: {
        variants: {
            type: Array as PropType<DefEnumVariant[]>,
            required: true,
        },
    },
    render: compile(`
        <slot />:  <core id="EnumDecoders"/> = <with-def-part part="fn-decode">
            <fields :items="variants" prop="discriminant">
                <template #value="{ item: { ref, name } }">
                    { v: '{{ name }}'<template v-if="ref">, decode: <ref :to="ref" /></template> }
                </template>
            </fields>
        </with-def-part>
    `),
});

export const Encoders = defineComponent({
    props: {
        variants: {
            type: Array as PropType<DefEnumVariant[]>,
            required: true,
        },
    },
    render: compile(`
        <slot/>: <core id="EnumEncoders"/> = <with-def-part part="fn-encode">
            <fields :items="variants" prop="name">
                <template #value="{ item: { ref, discriminant: d } }">
                    { d: {{ d }}<template v-if="ref">, encode: <core id="makeEncoderAsIsRespectable"/>(<ref :to="ref" />) </template> }
                </template>
            </fields>
        </with-def-part>
    `),
});

const EnumType = defineComponent({
    props: {
        variants: {
            type: Array,
            required: true,
        },
        which: {
            type: String as PropType<'decoded' | 'encodable'>,
            required: true,
        },
    },
    render: compile(`
        <with-def-part :part="'ty-' + which">
            <export>
                <core id="Enum"/>&lt;<fields :items="variants">
                    <template #value="{ value: ref }">
                        <template v-if="ref">
                            <core id="Valuable" />&lt;<ref :to="ref" />
                                <template v-if="which === 'encodable'">
                                    | <core id="EncodeAsIs" />
                                </template>
                            &gt;
                        </template>
                        <template v-else>
                            null
                        </template>
                    </template>
                </fields>&gt;
            </export>
        </with-def-part>
    `),
});

export default defineComponent({
    name: 'DefEnum',
    components: {
        Decoders,
        Encoders,
        EnumType,
    },
    props: {
        variants: {
            type: Array as PropType<DefEnumVariant[]>,
            required: true,
        },
    },
    render: compile(`
        <enum-type :variants="variants" which="decoded" />
        <w t="\n\n" />
        <enum-type :variants="variants" which="encodable" />

        <w t="\n\n" />
        // <ty-name/> enum tools
        <w t="\n\n" />

        <decoders v-bind="{ variants }"> const <ty-name/>_decoders </decoders>
        <w t="\n" />
        <encoders v-bind="{ variants }"> const <ty-name/>_encoders </encoders>

        <w t="\n\n" />
        // <ty-name/> tools end
        <w t="\n\n" />

        <with-def-part part="fn-decode">
            <export> return <core id="decodeEnum" />(bytes, <ty-name/>_decoders) </export>
        </with-def-part>
        <w t="\n\n" />
        <with-def-part part="fn-encode">
            <export> return <core id="encodeEnum" />(encodable, <ty-name/>_encoders) </export>
        </with-def-part>
    `),
});
