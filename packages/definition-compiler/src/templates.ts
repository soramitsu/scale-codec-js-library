import Handlebars, { create as createHandlebars, SafeString } from 'handlebars';
import { Enum, Valuable } from '@scale-codec/enum';
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

type TemplatesEnum = Enum<
    {
        [K in keyof TemplatesContextMap]: null;
    }
>;

export interface BaseTemplateContext {
    self: string;
}

// templates

// const VEC_TEMPLATE =

function baseBarsExtend(hbs: typeof Handlebars) {
    hbs.registerPartial('export-encodable', 'export type {{ self }}_Encodable = {{>@partial-block}}');
    hbs.registerPartial('export-decoded', 'export type {{ self }}_Decoded = {{>@partial-block}}');
    hbs.registerPartial(
        'export-decode',
        `export function {{self}}_decode(bytes: Uint8Array): {{core 'DecodeResult'}} {\n{{>@partial-block}}\n\n}`,
    );
    hbs.registerPartial(
        'export-encode',
        `export function {{self}}_encode(encodable: {{self}}_Encodable): Uint8Array {\n{{>@partial-block}}\n\n}`,
    );

    hbs.registerHelper('ref-encodable', (ref) => `@ref(${ref})_Encodable`);
    hbs.registerHelper('ref-decoded', (ref) => `@ref(${ref})_Decoded`);
    hbs.registerHelper('ref-encode', (ref) => `@ref(${ref})_encode`);
    hbs.registerHelper('ref-decode', (ref) => `@ref(${ref})_decode`);
    hbs.registerHelper('core', (util) => `@core(${util})`);

    hbs.registerHelper(
        'join',
        (context: string[], sepOrOpts: string | { fn: () => string }, maybeOpts?: { fn: () => string }) => {
            const separator = typeof sepOrOpts === 'string' ? sepOrOpts : '';
            const block = typeof sepOrOpts === 'string' ? maybeOpts!.fn : sepOrOpts.fn;
            return context.map(block).join(separator);
        },
    );
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
// interface CodegenContext {
//     currentTypeName: string | null;
//     currentDefPart: DefPart;
//     // suffix:
// }

// function useCtx(): CodegenContext {

// }

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

function templateByKind(hbs: typeof Handlebars, param: TemplatesEnum): Handlebars.TemplateDelegate {
    return param.match({
        tuple() {
            return hbs.compile(
                `{{#>export-decoded~}}
[
    {{~#join refs ', '~}}
        {{ref-decoded this}}
    {{~/join~}}
]
{{~/export-decoded}}\n

{{#>export-encodable~}}
[
    {{~#join refs ', ' ~}}
        {{ref-encodable this}} | {{core 'EncodeSkippable'}}
    {{~/join~}}
]
{{~/export-encodable}}\n

const {{self}}_decoders = [ {{~#join refs ', '}} {{~ref-decode this~}} {{/join~}} ]
const {{self}}_encoders = [ {{~#join refs ', '}} {{~ref-encode this~}} {{/join~}} ].map( {{~core 'wrapSkippableEncode'~}} )

{{#>export-decode}}  return {{core 'decodeTuple'}}(bytes, {{self}}_decoders) {{~/export-decode}}

{{#>export-encode}}  return {{core 'encodeTuple'}}(encodable, {{self}}_encoders) {{~/export-encode}}
`,
            );
        },
        struct() {
            hbs.registerHelper(
                'render-fields',
                (
                    fields: { name: string; ref: string }[],
                    joiner: string,
                    ctx: { fn: (ctx: { ref: string }) => string },
                ) => {
                    const rendered = fields
                        .map((x) => {
                            const refTransformed = ctx.fn({ ref: x.ref });
                            return `  ${x.name}: ${refTransformed}`;
                        })
                        .join(joiner);

                    return `{\n${rendered}\n}`;
                },
            );

            return hbs.compile(`
{{~#>export-decoded~}}
  {{#render-fields fields '\n'~}} {{ref-decoded ref}}; {{~/render-fields}}
{{~/export-decoded}}
\n
{{#>export-encodable~}}
  {{#render-fields fields '\n'~}} {{ref-encodable ref}} | {{core 'EncodeSkippable'}}; {{~/render-fields}}
{{~/export-encodable}}
\n
// {{self}} scoped utils

const {{self}}_order = [ {{~#join fields ', ' ~}} '{{name}}' {{~/join~}} ]
const {{self}}_decoders = {{#render-fields fields ',\n'}} {{~ref-decode ref~}} {{/render-fields}}
const {{self}}_encoders = {{#render-fields fields ',\n'~}} {{core 'wrapSkippableEncode'~}} ( {{~ref-encode ref~}} ) {{~/render-fields}}

// utils end

{{#>export-decode}}  return {{core 'decodeStruct'}}(bytes, {{self}}_decoders, {{self}}_order){{/export-decode}}

{{#>export-encode}}  return {{core 'encodeStruct'}}(bytes, {{self}}_encoders, {{self}}_order){{/export-encode}}
`);
        },
        enum() {
            hbs.registerHelper('render-vars-def', (variants: TemplatesContextMap['enum']['variants'], opts) => {
                console.log(opts);

                const renderedVars = variants.map((x) => {
                    // const val = x.ref ? fn()

                    return `  ${x.name}: ;`;
                });

                return `{\n${renderedVars}\n}`;
            });

            hbs.registerPartial(
                'vars-def',
                `{
{{#each variants}}  {{name}}: {{#unless ref~}}
null
{{~else~}}
    {{core 'Valuable'}}<  > 
{{~/unless}};
{{/each}}
}`,
            );

            return hbs.compile(`
{{#>export-decoded~}} {{core 'Enum'}}< {{~#>vars-def~}} {{ref-decoded ref}} {{/vars-def}} > {{~/export-decoded}}
            `);
        },
        vec() {
            const app = createApp({
                render: compile(`
                    <export>
                        <ref suffix="decoded" :to="" />[]
                    </export>
                `),
            });

            return hbs.compile(
                [
                    '{{#>export-decoded}} {{ref-decoded item}}[] {{/export-decoded}}',
                    `{{#>export-encodable~}} ( {{~ref-encodable item}} | {{core 'EncodeSkippable'~}} )[] {{~/export-encodable}}`,
                    `export const {{self}}_item_encode = {{core 'wrapSkippableEncode'}}( {{~ref-encode item~}} )`,
                    `{{#>export-decode}}  return {{core 'decodeVec'}}(bytes, {{ref-decode item}}) {{~/export-decode}}`,
                    `{{#>export-encode}}  return {{core 'encodeVec'}}(encodable, {{self}}_item_encode) {{~/export-encode}}`,
                ].join('\n\n'),
            );
        },
        ...({} as any),
    });
}

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

    // const bars = createHandlebars();
    // baseBarsExtend(bars);

    // const template = templateByKind(bars, Enum.create(kind));
    // return template(ctx);
}
// function vecTemplate(): string {
//     return '';
// }

// renderDefinitionTemplate('vec', 'Vec_str', {
//     item: 'str',
// });
