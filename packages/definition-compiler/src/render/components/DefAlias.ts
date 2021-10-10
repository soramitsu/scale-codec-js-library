import { defineComponent } from 'vue';

export default defineComponent({
    name: 'DefAlias',
    props: {
        typeRef: {
            type: String,
            required: true,
        },
    },
    data: () => ({
        types: ['ty-decoded', 'ty-encodable'],
        fns: ['fn-decode', 'fn-encode'],
    }),
    methods: {
        encodeDecodeFnArgName(fn: string): string {
            return fn === 'fn-decode' ? 'bytes' : 'encodable';
        },
    },
    template: `
        <template v-for="x in types" :key="x">
            <with-def-part :part="x">
                <export>
                    <ref :to="typeRef"/>
                </export>
            </with-def-part>
            
            <w t="\n\n" />
        </template>

        <template v-for="(x, i) in fns" :key="x">
            <w v-if="i > 0" t="\n\n" />

            <with-def-part :part="x">
                <export>
                    return <ref :to="typeRef" />({{ encodeDecodeFnArgName(x) }})
                </export>
            </with-def-part>
        </template>
    `,
});
