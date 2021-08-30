import { compile, defineComponent } from 'vue';
import { useCurrentDefPart } from './current-def-part';

export default defineComponent({
    setup() {
        const part = useCurrentDefPart();
        return { part };
    },
    render: compile(`
        <template v-if="part === 'ty-decoded'">
            export type <ty-name/>_Decoded = <slot/>
        </template>

        <template v-else-if="part === 'ty-encodable'">
            export type <ty-name/>_Encodable = <slot/>
        </template>

        <template v-else-if="part === 'fn-decode'">
            export function <ty-name/>_decode(bytes: Uint8Array): <ty-name/>_Decoded { <slot /> }
        </template>

        <template v-else>
            export function <ty-name/>_encode(encodable: <ty-name/>_Encodable): Uint8Array { <slot /> }
        </template>
    `),
});
