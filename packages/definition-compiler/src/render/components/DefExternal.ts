import { defineComponent } from 'vue';
import { DefPartSuffixMap } from '../def-part';
import { useCurrentTypeName } from './current-type-name';

export default defineComponent({
    name: 'DefExternal',
    props: {
        nameInModule: {
            type: String,
            default: null,
        },
        module: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const tyName = useCurrentTypeName();

        const defParts = [
            DefPartSuffixMap['ty-decoded'],
            DefPartSuffixMap['ty-encodable'],
            DefPartSuffixMap['fn-decode'],
            DefPartSuffixMap['fn-encode'],
        ];
        const importsJoined = defParts
            .map((suffix) => {
                return props.nameInModule
                    ? `${props.nameInModule}${suffix} as ${tyName}${suffix}`
                    : `${tyName}${suffix}`;
            })
            .join(',');
        const exportsJoined = defParts.map((suffix) => `${tyName}${suffix}`).join(',');

        return { importsJoined, exportsJoined };
    },
    template: `
        import { {{ importsJoined }} } from '{{ module }}'
        <w t="\n" />
        export { {{ exportsJoined }} }
    `,
});
