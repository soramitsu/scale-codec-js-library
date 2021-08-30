import { createApp, renderApp } from './vue-code';
import { defineComponent, compile, provide, inject, InjectionKey, PropType, computed } from 'vue';

export type TemplatesContextMap = {
    map: { key: string; value: string };
    set: { entry: string };
    vec: { item: string };
    array: { item: string; len: number };
    bytes_array: { len: number };
    tuple: { refs: string[] };
    struct: { fields: { name: string; ref: string }[] };
    enum: { variants: { name: string; discriminant: number; ref?: null | string }[] };
    option: { some: string };
};

export interface BaseTemplateContext {
    self: string;
}

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
    `),
});

interface CollectorAPI {
    collectRef: (val: string) => void;
    collectCore: (val: string) => void;
}
const COLLECTOR_KEY: InjectionKey<CollectorAPI> = Symbol('Collector');
const Collector = defineComponent({
    setup(props, { slots }) {
        const refs = new Set<string>();
        const cores = new Set<string>();

        provide(COLLECTOR_KEY, {
            collectCore: (x) => cores.add(x),
            collectRef: (x) => refs.add(x),
        });

        return () => slots.default?.();
    },
});
function useCollectorAPI(): CollectorAPI {
    const val = inject(COLLECTOR_KEY);
    if (!val) throw new Error('no col');
    return val;
}

const Ref = defineComponent({
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

export function renderDefinitionTemplate<T extends keyof TemplatesContextMap, Ctx extends TemplatesContextMap[T]>(
    kind: T,
    ctx: Ctx & BaseTemplateContext,
): string {
    const App = defineComponent<{
        kind: T;
        ctx: Ctx;
    }>({
        props: ['kind', 'ctx'] as any,
        setup(props) {
            const defComponent = VecDef;

            const bindings = computed(() => {
                const { self, ...rest } = props.ctx;
                return rest;
            });

            return {
                defComponent,
                bindings,
            };
        },
        render: compile(`
            <collector>
                <with-current-type-name :name="ctx.self">
                    <component :is="defComponent" v-bind="bindings" />
                </with-current-type-name>
            </collector>
        `),
    });

    const app = createApp(App, { kind, ctx })
        .component('WithDefPart', WithDefPart)
        .component('WithCurrentTypeName', WithCurrentTypeName)
        .component('TyName', TyName)
        .component('Ref', Ref)
        .component('Core', Core)
        .component('WS', WS)
        .component('AddPartSuffix', AddPartSuffix)
        .component('Export', Export)
        .component('Collector', Collector);

    return renderApp(app);
}
