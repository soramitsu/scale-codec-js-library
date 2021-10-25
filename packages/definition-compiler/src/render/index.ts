import {
    NamespaceDefinition,
    RenderNamespaceDefinitionParams,
    TypeDef,
    DefEnumVariant,
    DefStructField,
} from '../types';
import { Set as SetImmutable } from 'immutable';
import { renderImports, createStateScope } from './util';
import { byValue, byString } from 'sort-es';
import { DefaultAvailableBuilders } from '../const';

function namespaceDefinitionToList(val: NamespaceDefinition): { tyName: string; def: TypeDef }[] {
    const items = Object.entries(val);
    items.sort(byValue((x) => x[0], byString()));
    return items.map(([tyName, def]) => ({ tyName, def }));
}

enum BaseType {
    Instance = 'ScaleInstance',
    Builder = 'ScaleBuilder',
    InstanceViaBuilder = 'InstanceViaBuilder',
    InnerValue = 'InnerValue',
    UnwrappedValue = 'UnwrappedValue',
    Enum = 'Enum',
    Valuable = 'Valuable',
    Option = 'Option',
    Result = 'Result',
}

// =========

interface RenderParams {
    runtimeLib: string;
    runtimeTypes: Set<String>;
    rollupSingleTuples: boolean;
}

const { within: withinRenderParams, use: useRenderParams } = createStateScope<RenderParams>();

// =========

interface ImportsCollector {
    collectRef: (ref: string) => void;
    collectImport: (name: string) => void;
    getRuntimeLibImports: () => Set<string>;
}

function instanceViaBuilder(ref: string): string {
    return `${touchBase(BaseType.InstanceViaBuilder)}<typeof ${touchRef(ref)}>`;
}

function createImportsCollector(): ImportsCollector {
    const { runtimeTypes } = useRenderParams();

    let imports = SetImmutable<string>();

    return {
        getRuntimeLibImports: () => new Set(imports),
        collectRef: (ref) => {
            if (runtimeTypes.has(ref)) {
                imports = imports.add(ref);
            }
        },
        collectImport: (name) => {
            imports = imports.add(name);
        },
    };
}

const { within: withinCollector, use: useCollector } = createStateScope<ImportsCollector>();

// =========

const { within: withinCurrentTyName, use: useCurrentTyName } = createStateScope<string>();

// =========

function renderBuilder(props: { valueTy: string | null; createHelper: string; createHelperArgs: string }): string {
    const ty = useCurrentTyName();
    const helperGeneric = props.valueTy ? `<${props.valueTy}>` : '';

    return `export var ${ty} = ${touchImport(props.createHelper)}${helperGeneric}('${ty}', ${props.createHelperArgs})`;
}

function touchRef(ref: string): string {
    useCollector().collectRef(ref);
    return ref;
}

function touchImport(name: string): string {
    useCollector().collectImport(name);
    return name;
}

function touchBase(ty: BaseType): string {
    useCollector().collectImport(ty);
    return ty;
}

/**
 * ref -> `() => ${ref}`
 */
function refFn(ref: string): string {
    return `() => ${touchRef(ref)}`;
}

function linesJoin(lines: string[], joiner = '\n\n'): string {
    return lines.join(joiner);
}

// =========

function renderAlias(to: string): string {
    return renderBuilder({
        valueTy: [BaseType.InnerValue, BaseType.UnwrappedValue]
            .map((x) => `${touchBase(x)}<typeof ${touchRef(to)}>`)
            .join(', '),
        createHelper: 'createAliasBuilder',
        createHelperArgs: refFn(to),
    });
}

function renderVoidAlias(): string {
    const { runtimeLib } = useRenderParams();

    return renderImport({ nameInModule: 'Void', module: runtimeLib });
}

function renderVec(item: string): string {
    return renderBuilder({
        valueTy: `${instanceViaBuilder(item)}[]`,
        createHelper: 'createVecBuilder',
        createHelperArgs: refFn(item),
    });
}

function renderStruct(fields: DefStructField[]): string {
    if (!fields.length) {
        return renderVoidAlias();
    }

    const valueTypeFields: string[] = fields.map((x) => `${x.name}: ${instanceViaBuilder(x.ref)}`);

    const schemaItems = fields.map((x) => `['${x.name}', ${refFn(x.ref)}]`);
    const schema = `[${schemaItems.join(', ')}]`;

    return renderBuilder({
        valueTy: `{\n    ${valueTypeFields.join(',\n    ')}\n}`,
        createHelper: 'createStructBuilder',
        createHelperArgs: `${schema}`,
    });
}

function renderTuple(refs: string[]): string {
    if (!refs.length) {
        return renderVoidAlias();
    }

    const { rollupSingleTuples } = useRenderParams();
    if (rollupSingleTuples && refs.length === 1) return renderAlias(refs[0]);

    const valueEntries: string[] = refs.map(instanceViaBuilder);
    const codecs: string[] = refs.map(refFn);

    return renderBuilder({
        valueTy: `[\n    ${valueEntries.join(',\n    ')}\n]`,
        createHelper: 'createTupleBuilder',
        createHelperArgs: `[${codecs.join(', ')}]`,
    });
}

function renderEnum(variants: DefEnumVariant[]): string {
    const definitionTyLines: string[] = variants.map((x) => {
        const right = x.ref ? `${touchBase(BaseType.Valuable)}<${instanceViaBuilder(x.ref)}>` : 'null';
        return `${x.name}: ${right}`;
    });

    const schemaLines: string[] = variants.map((x) => {
        const items = [x.discriminant, `'${x.name}'`];
        x.ref && items.push(refFn(x.ref));
        return `[${items.join(', ')}]`;
    });

    return renderBuilder({
        valueTy: `${touchBase(BaseType.Enum)}<{\n    ${definitionTyLines.join(',\n    ')}\n}>`,
        createHelper: 'createEnumBuilder',
        createHelperArgs: `[${schemaLines.join(', ')}]`,
    });
}

function renderSet(item: string): string {
    return renderBuilder({
        valueTy: `Set<${instanceViaBuilder(item)}>`,
        createHelper: 'createSetBuilder',
        createHelperArgs: refFn(item),
    });
}

function renderMap(key: string, value: string): string {
    return renderBuilder({
        valueTy: `Map<${instanceViaBuilder(key)}, ${instanceViaBuilder(value)}>`,
        createHelper: 'createMapBuilder',
        createHelperArgs: [key, value].map(refFn).join(', '),
    });
}

function renderArray(item: string, len: number): string {
    return renderBuilder({
        valueTy: `${instanceViaBuilder(item)}[]`,
        createHelper: `createArrayBuilder`,
        createHelperArgs: `${refFn(item)}, ${len}`,
    });
}

function renderBytesArray(len: number): string {
    return renderBuilder({
        valueTy: null,
        createHelper: 'createBytesArrayBuilder',
        createHelperArgs: `${len}`,
    });
}

function renderOption(some: string): string {
    return renderBuilder({
        valueTy: `${touchBase(BaseType.Option)}<${instanceViaBuilder(some)}>`,
        createHelper: 'createOptionBuilder',
        createHelperArgs: refFn(some),
    });
}

function renderResult(ok: string, err: string): string {
    return renderBuilder({
        valueTy: `${touchBase(BaseType.Result)}<${instanceViaBuilder(ok)}, ${instanceViaBuilder(err)}>`,
        createHelper: 'createResultBuilder',
        createHelperArgs: [ok, err].map(refFn).join(', '),
    });
}

function renderImport({ nameInModule, module: moduleName }: { nameInModule?: string | null; module: string }): string {
    const ty = useCurrentTyName();

    return linesJoin(
        [renderImports([nameInModule ? { source: nameInModule, as: ty } : ty], moduleName), `export { ${ty} }`],
        '\n',
    );
}

function renderParticularDef(tyName: string, def: TypeDef): string {
    const particularRendered: string = withinCurrentTyName(tyName, () => {
        switch (def.t) {
            case 'alias':
                return renderAlias(def.ref);
            case 'vec':
                return renderVec(def.item);
            case 'struct':
                return renderStruct(def.fields);
            case 'tuple':
                return renderTuple(def.items);
            case 'enum':
                return renderEnum(def.variants);
            case 'set':
                return renderSet(def.entry);
            case 'map':
                return renderMap(def.key, def.value);
            case 'array':
                return renderArray(def.item, def.len);
            case 'bytes-array':
                return renderBytesArray(def.len);
            case 'option':
                return renderOption(def.some);
            case 'result':
                return renderResult(def.ok, def.err);
            case 'import':
                return renderImport(def);
            default: {
                const uncovered: never = def;
                throw new Error(`Undefined type definition: ${uncovered}`);
            }
        }
    });

    return particularRendered;
}

function renderPreamble(): string {
    const { runtimeLib } = useRenderParams();
    const { getRuntimeLibImports: getCoreImports } = useCollector();

    const lines = [];

    const imports = getCoreImports();
    if (imports.size) {
        lines.push(renderImports(imports, runtimeLib));
    }

    return linesJoin(lines);
}

/**
 * Renders provided definition into a valid TypeScript code.
 */
export function renderNamespaceDefinition(
    definition: NamespaceDefinition,
    params?: RenderNamespaceDefinitionParams,
): string {
    return withinRenderParams(
        {
            runtimeLib: params?.runtimeLib ?? '@scale-codec/definition-runtime',
            runtimeTypes: params?.runtimeTypes ?? DefaultAvailableBuilders,
            rollupSingleTuples: params?.rollupSingleTuplesIntoAliases ?? false,
        },
        () =>
            withinCollector(createImportsCollector(), () => {
                const renderedTypes = namespaceDefinitionToList(definition)
                    .map(({ tyName, def }) => renderParticularDef(tyName, def))
                    .join('\n\n');

                const preamble = renderPreamble();

                return [preamble, renderedTypes].join('\n\n').trim() + '\n';
            }),
    );
}
