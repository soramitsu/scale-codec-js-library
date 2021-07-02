import { NamespaceCodegenDefinition } from './types';
import { DefEnum, typeDefToEnum } from './def-enum';
import { assert } from '@scale-codec/util';
import { StdCodecs } from '@scale-codec/namespace';
import { createImportsCounter, getImportsCounterState, ImportsCounter } from './imports-counter';

export interface GenerateOptions {
    namespaceTypeName: string;
    namespaceValueName: string;
    importLib: string;
    structPropsCamelCase?: boolean;
}

type DefMap = Map<string, DefEnum>;

const STD_KEYS = new Set<string>(Object.keys(StdCodecs));

const DEFAULT_STD_IMPORTS = new Set(['StdTypes', 'StdCodecs', 'defNamespace']);

/**
 * TODO batch all validation errors and throw once?
 */
function validate(defmap: DefMap) {
    function assertReference(ref: string, from: string) {
        assert(defmap.has(ref) || STD_KEYS.has(ref), `Undefined reference "${ref}" from "${from}"`);
    }

    for (const [typeName, def] of defmap) {
        assert(!STD_KEYS.has(typeName), `Type name "${typeName}" is forbidden - reserved for STD`);

        def.match({
            Alias(target) {
                assertReference(target, `${typeName} (alias)`);
            },
            Vec({ item }) {
                assertReference(item, `${typeName} (vec)`);
            },
            Array({ item }) {
                assertReference(item, `${typeName} (array)`);
            },
            Tuple({ items }) {
                items.forEach((ref, i) => {
                    assertReference(ref, `${typeName}[${i}] (tuple)`);
                });
            },
            Struct({ fields }) {
                const namesEncountered = new Set<string>();

                fields.forEach(({ name, ref }, i) => {
                    assert(!namesEncountered.has(name), `Duplicated field "${name}" in struct "${typeName}", pos ${i}`);
                    assertReference(ref, `${typeName}.${name} (struct)`);
                });
            },
            Map({ key, value }) {
                assertReference(key, `${typeName} (map key)`);
                assertReference(value, `${typeName} (map value)`);
            },
            Enum({ variants }) {
                // check no discriminant collisions
                // check no name collisions
                // check references

                const discriminantsEncountered = new Set<number>();
                const variantsEncountered = new Set<string>();

                variants.forEach(({ name: variant, discriminant, ref }, i) => {
                    assert(
                        !Number.isNaN(discriminant) && discriminant >= 0 && Number.isInteger(discriminant),
                        `Discriminant should be valid non-negative integer, found: ${discriminant} (enum ${typeName}::${variant})`,
                    );
                    assert(
                        !variantsEncountered.has(variant),
                        `Duplicated variant "${variant}" in enum "${typeName}", pos ${i}`,
                    );
                    assert(
                        !discriminantsEncountered.has(discriminant),
                        `Duplicated discriminant ${discriminant} in enum, "${typeName}::${variant}", pos ${i}`,
                    );
                    ref && assertReference(ref, `${typeName}::${variant} (enum)`);
                });
            },
            EnumOption({ some }) {
                assertReference(some, `${typeName} (option)`);
                assertReference(some, `${typeName} (option)`);
            },
            EnumResult({ ok, err }) {
                assertReference(ok, `${typeName} (result ok)`);
                assertReference(err, `${typeName} (result err)`);
            },
        });
    }
}

function genImports(set: Set<string>, importFrom: string) {
    const items = [...set];
    items.sort();
    return `import { ${items.join(', ')} } from '${importFrom}';`;
}

function genNamespaceDeclaration(
    defMap: DefMap,
    imports: ImportsCounter,
    opts: {
        namespaceName: string;
    },
): string {
    const NAMESPACE_NAME = opts.namespaceName;

    function nsItem(ref: string): string {
        return `${NAMESPACE_NAME}['${ref}']`;
    }

    const lines = [`export type ${NAMESPACE_NAME} = StdTypes & {`];

    for (const [key, def] of defMap) {
        const defToType: string = def.match({
            Alias(to) {
                return nsItem(to);
            },
            Vec({ item }) {
                return `${nsItem(item)}[]`;
            },
            Array({ item }) {
                return `${nsItem(item)}[]`;
            },
            Tuple({ items }) {
                const mapped = items.map(nsItem);

                return `[${mapped.join(',')}]`;
            },
            Struct({ fields }) {
                const fieldsAsEntries: string[] = fields.map(
                    // TODO camelCase?
                    ({ name, ref }) => `${name}: ${nsItem(ref)}`,
                );

                return `{\n${fieldsAsEntries.join(';\n')} }`;
            },
            Map({ key, value }) {
                return `Map<${nsItem(key)}, ${nsItem(value)}>`;
            },
            Enum({ variants }) {
                const tsVariants: string[] = variants.map(
                    ({ name, ref }) => `${name}: ${ref && `${imports.Valuable}<${nsItem(ref)}>`}`,
                );

                return `${imports.Enum}<{\n${tsVariants.join(';\n')} }>`;
            },
            EnumOption({ some }) {
                return `${imports.Option}<${nsItem(some)}>`;
            },
            EnumResult({ ok, err }) {
                return `${imports.Result}<${nsItem(ok)}, ${nsItem(err)}>`;
            },
        });

        lines.push(`    "${key}": ${defToType};`);
    }

    lines.push('}');

    return lines.join('\n');
}

function genNamespaceValue(
    defmap: DefMap,
    imports: ImportsCounter,
    opts: {
        namespaceType: string;
        namespaceValue: string;
    },
): string {
    // const additionalStdImports = new Set<string>();
    // const helpersProxy = new Proxy(StdDefHelpers, {
    //     get(target, key) {
    //         if (!(key in target)) throw new Error('wtf?');
    //         additionalStdImports.add(key as string);
    //         return target[key as keyof typeof StdDefHelpers];
    //     },
    // }) as typeof StdDefHelpers;

    const lines = [`export const ${opts.namespaceValue} = defNamespace<${opts.namespaceType}>({`, '...StdCodecs,'];

    for (const [key, def] of defmap) {
        const defToType: string = def.match({
            Alias(to) {
                return `${imports.defAlias}('${to}')`;
            },
            Vec({ item }) {
                return `${imports.defVec}('${item}')`;
            },
            Array({ item, len }) {
                return `${imports.defArray}('${item}', ${len})`;
            },
            Tuple({ items }) {
                return `${imports.defTuple}(${items.map((x) => `'${x}'`).join(', ')})`;
            },
            Struct({ fields }) {
                const fieldsAsTuples = fields.map(({ name, ref }) => `['${name}', '${ref}']`).join(',\n');

                return `${imports.defStruct}([\n${fieldsAsTuples}])`;
            },
            Map({ key, value }) {
                return `${imports.defMap}('${key}', '${value}')`;
            },
            Enum({ variants }) {
                const variantsWithDiscriminants = variants
                    .map(({ name, discriminant }) => `${name}: { discriminant: ${discriminant} }`)
                    .join(',');
                const schema = `new ${imports.EnumSchema}({\n${variantsWithDiscriminants} })`;

                const codecsOfValuable = variants
                    .filter((x) => !!x.ref)
                    .map(({ name, ref }) => `${name}: '${ref}'`)
                    .join(',\n');
                const codecs = `{\n${codecsOfValuable} }`;

                return `${imports.defEnum}(${schema}, ${codecs})`;
            },
            EnumOption({ some }) {
                return `${imports.defOption}('${some}')`;
            },
            EnumResult({ ok, err }) {
                return `${imports.defResult}('${ok}', '${err}')`;
            },
        });

        lines.push(`    "${key}": ${defToType},`);
    }

    lines.push('});');

    return lines.join('\n');
}

export function generate(definition: NamespaceCodegenDefinition, opts: GenerateOptions): string {
    // collect all known keys and map definitions into enums!
    // then generate main namespace type, map with types. chech on this stage that all
    // references are valid and report friendly errors
    // then generate namespace actual declaration

    const definitionMap: DefMap = new Map(Object.entries(definition).map(([key, def]) => [key, typeDefToEnum(def)]));
    const importsCounter = createImportsCounter();

    validate(definitionMap);

    const typeDec = genNamespaceDeclaration(definitionMap, importsCounter, {
        namespaceName: opts.namespaceTypeName,
    });

    const valDef = genNamespaceValue(definitionMap, importsCounter, {
        namespaceValue: opts.namespaceValueName,
        namespaceType: opts.namespaceTypeName,
    });

    const { used: additionalStdImports } = getImportsCounterState(importsCounter);

    const imports = genImports(new Set([...additionalStdImports, ...DEFAULT_STD_IMPORTS]), opts.importLib);

    return `${imports}\n\n${typeDec}\n\n${valDef};`;
}
