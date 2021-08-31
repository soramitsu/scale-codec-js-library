import { defineComponent } from 'vue';

export default defineComponent({
    name: 'VoidAlias',
    setup() {
        return {
            prefixes: ['Decoded', 'Encodable', 'decode', 'encode'],
        };
    },
    template: `
        // <ty-name /> is just a void alias

        <w t="\n" />

        <use-config v-slot="{ importLib }">
            import {<w t="\n" />
                <template v-for="x in prefixes">
                    Void_{{ x }} as <ty-name/>_{{ x }},
                </template>
            } from '{{ importLib }}';
        </use-config>

        export {
            <template v-for="x in prefixes">
                <ty-name/>_{{ x }},
            </template>
        };
    `,
});
