import fs from 'fs/promises';
import path from 'path';
import { create, SafeString } from 'handlebars';

const bars = create();

async function main() {
    bars.registerPartial('export-encodable', `export type {{ self }}_Encodable = {{> @partial-block }};`);
    bars.registerPartial('export-decoded', `export type {{ self }}_Decoded = {{> @partial-block }};`);

    // bars.registerHelper('export-encodable', (ctx) => {
    //     console.log('context %o', ctx);

    //     return new SafeString(`export type {{ self }}_Encodable = ${ctx.fn(ctx.data.root)};`);

    //     // return ctx.fn(ctx.data.root);
    // });

    bars.registerHelper('ref-encodable', (ref) => {
        return `@ref(${ref})_Encodable`;
    });

    bars.registerHelper('ref-decoded', (ref) => {
        return `@ref(${ref})_Decoded`;
    });

    bars.registerHelper('core', (coreUtilName) => {
        return `@core(${coreUtilName})`;
    });

    const template = bars.compile(`{{#> export-decoded~}} {{ref-decoded ref~}} [] {{~/export-decoded}}

{{#> export-encodable~}} ( {{~ref-encodable ref}} | {{core 'EncodeSkippable'~}} )[] {{~/export-encodable}}`);
    console.log(template({ self: 'Vec_str', ref: 'str' }));
}

main();
