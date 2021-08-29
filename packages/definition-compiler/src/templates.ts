import Handlebars, { create as createHandlebars } from 'handlebars';
import { Enum, Valuable } from '@scale-codec/enum';

export type TemplatesContextMap = {
    map: { key: string; value: string };
    set: { entry: string };
    vec: { item: string };
    array: { item: string; len: number };
    bytes_array: { len: number };
    tuple: { refs: string[] };
    struct: { fields: { name: string; ref: string }[] };
    enum: { variants: { name: string; discriminant: number; ref?: null | string } };
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

function templateByKind(bars: typeof Handlebars, param: TemplatesEnum): Handlebars.TemplateDelegate {
    return param.match({
        tuple() {
            return bars.compile(
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
            bars.registerHelper(
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

            return bars.compile(`
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
        vec() {
            return bars.compile(
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
    const bars = createHandlebars();
    baseBarsExtend(bars);

    const template = templateByKind(bars, Enum.create(kind));
    return template(ctx);
}
// function vecTemplate(): string {
//     return '';
// }

// renderDefinitionTemplate('vec', 'Vec_str', {
//     item: 'str',
// });
