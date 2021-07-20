import { Enum, Result } from '@scale-codec/enum';

export interface Options {
    genImportFrom: string;
    genNamespaceValue: string;
    genNamespaceType: string;
    genCamel: boolean;
    input: string;
    output: string;
    force: boolean;
}

export interface OptionsRaw {
    genImportFrom: string;
    genNamespaceValue?: string;
    genNamespaceType?: string;
    genCamel?: boolean;
    input?: string;
    output?: string;
    force?: boolean;
}

function assertOption(val: unknown, name: string): asserts val {
    if (!val) {
        throw new Error(`Missing required option: ${name}`);
    }
}

export function parseRawOptions({
    input,
    output,
    genImportFrom,
    genCamel,
    genNamespaceType,
    force,
    genNamespaceValue,
}: OptionsRaw): Result<Options, Error> {
    try {
        assertOption(input, 'input');
        assertOption(output, 'output');
        assertOption(genNamespaceValue, 'genNamespaceValue');
        assertOption(genNamespaceType, 'genNamespaceType');
    } catch (err) {
        return Enum.create('Err', err);
    }

    return Enum.create('Ok', {
        input,
        output,
        genNamespaceType,
        genNamespaceValue,
        genImportFrom,
        genCamel: genCamel ?? false,
        force: force ?? false,
    });
}
