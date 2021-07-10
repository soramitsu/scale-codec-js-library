import { cac } from 'cac';
import consola from 'consola';
import packageJson from '../package.json';
import { OptionsRaw, parseRawOptions } from './opts';
import { askForOverwriteIfExists, normalizeRelativePath } from './util';
import { generate } from '@scale-codec/namespace-codegen';
import prettier from 'prettier';
import prettierConfig from '../../../.prettierrc.js';
import fs from 'fs/promises';
import chalk from 'chalk';
import path from 'path';

const cli = cac();

cli.command('', 'Generate namespace from definition')
    .option(
        '-i, --input <file>',
        '[string] Path to input file with namespace definition. Allowed types: .json, .(c|m)?js, .ts',
    )
    .option('-o, --output <file>', '[string] Path to the output TypeScript file')
    .option('-f, --force', '[boolean] Force overwrite output path if it exists')
    .option('--genNamespaceType <identificator>', '[string] Name of generated namespace type')
    .option('--genNamespaceValue <identificator>', '[string] Name of generated namespace value')
    .option('--genImportFrom [packageName]', '[string] Library that contains namespace implementation', {
        default: '@scale-codec/namespace',
    })
    .option('--genCamel', "[boolean] Use 'camelCase' for struct fields or not")
    .action(async (rawOptions: OptionsRaw) => {
        const options = parseRawOptions(rawOptions).match({
            Ok: (v) => v,
            Err: (err) => {
                consola.warn(err);
                process.exit(1);
            },
        });

        if (!options.force) {
            const allowed = await askForOverwriteIfExists(options.output);
            if (!allowed) {
                process.exit(0);
            }
        }

        const normalizedInputPath = normalizeRelativePath(options.input);
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const definition: any = require(normalizedInputPath);

        const rawGeneratedCode = generate(definition, {
            importLib: options.genImportFrom,
            namespaceTypeName: options.genNamespaceType,
            namespaceValueName: options.genNamespaceValue,
            structPropsCamelCase: options.genCamel,
        });

        const formatted = prettier.format(rawGeneratedCode, {
            ...prettierConfig,
            parser: 'typescript',
        });

        const normalizedOutputPath = normalizeRelativePath(options.output);
        await fs.writeFile(normalizedOutputPath, formatted, { encoding: 'utf-8' });

        consola.success(chalk`Generated to {blue ${normalizedOutputPath}}`);
    });

cli.help();
cli.version(packageJson.version);

async function main() {
    try {
        cli.parse(process.argv, { run: false });
        await cli.runMatchedCommand();
    } catch (error) {
        consola.fatal(error);
        process.exit(1);
    }
}
main();
