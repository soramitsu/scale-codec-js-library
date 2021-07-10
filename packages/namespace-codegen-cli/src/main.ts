// allowing imports of .ts files
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('esbuild-register');

import { cac } from 'cac';
import consola from 'consola';
import fs from 'fs/promises';
import chalk from 'chalk';
import prompts from 'prompts';
import pathExists from 'path-exists';
import { generate } from '@scale-codec/namespace-codegen';
import packageJson from '../package.json';
import { OptionsRaw, parseRawOptions } from './opts';
import { normalizeRelativePath } from './util';

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
        // parsing options
        const options = parseRawOptions(rawOptions).match({
            Ok: (v) => v,
            Err: (err) => {
                consola.warn(err);
                process.exit(1);
            },
        });

        // normalizing paths
        const normalizedInputPath = normalizeRelativePath(options.input);
        const normalizedOutputPath = normalizeRelativePath(options.output);

        // checking if output already exists
        if (await pathExists(normalizedOutputPath)) {
            if (options.force) {
                consola.info('Output file exists, will be overwritten');
            } else {
                const { confirmation } = await prompts({
                    name: 'confirmation',
                    type: 'confirm',
                    message: 'Output path already exists. Are you sure to overwrite this?',
                });

                if (!confirmation) {
                    process.exit(0);
                }
            }
        }

        // smart definition import
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        let definition: any = require(normalizedInputPath);
        if ('default' in definition) {
            // 99% it is a ES module
            definition = definition.default;
        }

        // generating
        let rawGeneratedCode: string;
        try {
            rawGeneratedCode = generate(definition, {
                importLib: options.genImportFrom,
                namespaceTypeName: options.genNamespaceType,
                namespaceValueName: options.genNamespaceValue,
                structPropsCamelCase: options.genCamel,
            });
        } catch (err) {
            consola.error('Generation failed :<', err);
            process.exit(1);
        }

        // writing
        await fs.writeFile(normalizedOutputPath, rawGeneratedCode, { encoding: 'utf-8' });

        consola.success(chalk`Generated to {green.bold ${normalizedOutputPath}}`);
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
