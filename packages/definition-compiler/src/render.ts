import { createApp, renderApp } from './vue-code';
import { defineComponent, compile, provide, inject, InjectionKey, PropType, computed, reactive, Ref } from 'vue';
import { NamespaceDefinition, TypeDef } from './definitions';
import { byValue, byString } from 'sort-es';

function* stdRefsGen(): Generator<string> {
    for (const i of ['str', 'bool', 'Void', 'Compact', 'BytesVec']) {
        yield i;
    }

    for (const bits of [8, 16, 32, 64, 128]) {
        for (const signed of [false, true]) {
            yield `${signed ? 'i' : 'u'}${bits}`;
        }
    }
}

const STD_REFS = new Set(stdRefsGen());

type DefPart = 'ty-decoded' | 'ty-encodable' | 'fn-decode' | 'fn-encode';

const DefPartSuffixMap: { [K in DefPart]: string } = {
    'fn-decode': '_decode',
    'fn-encode': '_encode',
    'ty-decoded': '_Decoded',
    'ty-encodable': '_Encodable',
};

function partToSuffix(val: DefPart) {
    return DefPartSuffixMap[val];
}

const AddPartSuffix = defineComponent({
    setup() {
        const part = useCurrentDefPart();
        const suffix = partToSuffix(part);
        return { suffix };
    },
    render: compile(`<slot/>{{ suffix }}`),
});

const CURRENT_DEF_PART: InjectionKey<DefPart> = Symbol('def part');
const WithDefPart = defineComponent({
    props: {
        part: {
            type: String as PropType<DefPart>,
            required: true,
        },
    },
    setup(props, { slots }) {
        provide(CURRENT_DEF_PART, props.part);
        return () => slots.default?.();
    },
});
function useCurrentDefPart(): DefPart {
    const val = inject(CURRENT_DEF_PART);
    if (!val) throw new Error('no current def part');
    return val;
}

const CURRENT_TYPE_NAME_KEY: InjectionKey<string> = Symbol('current type name');
const WithCurrentTypeName = defineComponent({
    props: {
        name: {
            type: String,
            required: true,
        },
    },
    setup(props, { slots }) {
        provide(CURRENT_TYPE_NAME_KEY, props.name);
        return () => slots.default?.();
    },
});
const TyName = defineComponent({
    setup() {
        const name = useCurrentTypeName();
        return () => name;
    },
});
function useCurrentTypeName(): string {
    const val = inject(CURRENT_TYPE_NAME_KEY);
    if (!val) throw new Error('No current name');
    return val;
}

const VecDef = defineComponent({
    props: {
        item: {
            type: String,
            required: true,
        },
    },
    render: compile(`
        <with-def-part part="ty-decoded">
            <export>
                <ref :to="item"/>[]
            </export>
        </with-def-part>

        <w-s t="\n\n" />
        
        <with-def-part part="ty-encodable">
            <export>
                (<ref :to="item" /> | <core id="EncodeSkippable" />)[]
            </export>
        </with-def-part>

        <w-s t="\n\n" />

        <with-def-part part="fn-decode">
            <export>
                return <core id="decodeVec" />(bytes, <ref :to="item" />)
            </export>
        </with-def-part>

        <w-s t="\n\n" />

        <with-def-part part="fn-encode">
            <export>
                return <core id="encodeVec" />(encodable, <ref :to="item" />)
            </export>
        </with-def-part>
    `),
});

const Export = defineComponent({
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

interface CollectorAPI {
    collectRef: (val: string) => void;
    collectCore: (val: string) => void;
    imports: Ref<Set<string>>;
}
const COLLECTOR_KEY: InjectionKey<CollectorAPI> = Symbol('Collector');
const Collector = defineComponent({
    setup(props, { slots }) {
        const refs = reactive(new Set<string>());
        const cores = reactive(new Set<string>());

        const imports = computed<Set<string>>(() => {
            return new Set([
                ...cores,
                ...[...refs]
                    .filter((x) => STD_REFS.has(x))
                    .flatMap((x) => Object.values(DefPartSuffixMap).map((sfx) => x + sfx)),
            ]);
        });

        provide(COLLECTOR_KEY, {
            collectCore: (x) => cores.add(x),
            collectRef: (x) => refs.add(x),
            imports,
        });

        return () => slots.default?.();
    },
});
function useCollectorAPI(): CollectorAPI {
    const val = inject(COLLECTOR_KEY);
    if (!val) throw new Error('no col');
    return val;
}

const Preamble = defineComponent({
    props: {
        importFrom: {
            type: String,
            required: true,
        },
    },
    setup() {
        const collector = useCollectorAPI();

        const importsJoined = computed<null | string>(() => {
            if (collector.imports.value.size > 0) {
                const items = [...collector.imports.value];
                items.sort();
                return items.join(',');
            }
            return null;
        });

        return { importsJoined };
    },
    render: compile(`
        <template v-if="importsJoined">
            import { {{importsJoined}} } from '{{importFrom}}' 
        </template>
    `),
});

const RefComponent = defineComponent({
    props: {
        to: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const api = useCollectorAPI();
        api.collectRef(props.to);
        return {};
    },
    render: compile(`
        <add-part-suffix>{{ to }}</add-part-suffix>
    `),
});

const Core = defineComponent({
    props: {
        id: {
            type: String,
            required: true,
        },
    },
    setup({ id }) {
        useCollectorAPI().collectCore(id);
        return {};
    },
    render: compile(`{{ id }}`),
});

const WS = defineComponent({
    props: {
        t: {
            type: String,
            required: true,
        },
    },
    render: compile(`{{ t }}`),
});

const DefRenderer = defineComponent({
    props: {
        tyName: {
            type: String,
            required: true,
        },
        def: {
            type: Object as PropType<TypeDef>,
            required: true,
        },
    },
    setup(props) {
        const specificRenderer = computed(() => {
            if (props.def.t === 'vec') {
                return VecDef;
            }

            throw new Error('unimplemented');
        });

        const bindings = computed(() => {
            const { t, ...rest } = props.def;
            return rest;
        });

        return {
            specific: specificRenderer,
            bindings,
        };
    },
    render: compile(`
        // {{ tyName }}

        <w-s t="\n\n"/>

        <with-current-type-name :name="tyName">
            <component :is="specific" v-bind="bindings" />
        </with-current-type-name>
    `),
});

const App = defineComponent({
    components: {
        Collector,
        Preamble,
        DefRenderer,
    },
    props: {
        defmap: {
            type: Object as PropType<NamespaceDefinition>,
            required: true,
        },
        importLib: {
            type: String,
            default: 'sample',
        },
    },
    setup(props) {
        const defsList = computed<{ tyName: String; def: TypeDef }>(() => {
            const items = Object.entries(props.defmap);
            items.sort(byValue((x) => x[0], byString()));
            return items.map(([tyName, def]) => ({ tyName, def }));
        });

        return {
            defsList,
        };
    },
    render: compile(`
        <collector>
            <preamble :import-from="importLib" />

            <w-s t="\n\n" />

            <template v-for="x in defsList" :key="x.tyName">
                <def-renderer v-bind="x" />
            </template>
        </collector>
    `),
});

export async function renderNamespaceDefinition(
    def: NamespaceDefinition,
    params: {
        importLib: string;
    },
): Promise<string> {
    const app = createApp(App, { defmap: def, importLib: params.importLib })
        .component('WithDefPart', WithDefPart)
        .component('WithCurrentTypeName', WithCurrentTypeName)
        .component('TyName', TyName)
        .component('Ref', RefComponent)
        .component('Core', Core)
        .component('WS', WS)
        .component('AddPartSuffix', AddPartSuffix)
        .component('Export', Export);

    return renderApp(app);
}
