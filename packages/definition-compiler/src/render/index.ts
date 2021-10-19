import {
    NamespaceDefinition,
    RenderNamespaceDefinitionParams,
    TypeDef,
    DefEnumVariant,
    DefStructField,
} from '../types';
import { Set as SetImmutable } from 'immutable';
import { renderImports, createStateScope, ImportOptions, replaceDollarVar } from './util';
import { byValue, byString } from 'sort-es';
import { RuntimeLibStds } from '../const';

function namespaceDefinitionToList(val: NamespaceDefinition): { tyName: string; def: TypeDef }[] {
    const items = Object.entries(val);
    items.sort(byValue((x) => x[0], byString()));
    return items.map(([tyName, def]) => ({ tyName, def }));
}

enum TypeEntry {
    TyDecoded,
    TyEncodable,
    FnDecode,
    FnEncode,
}

const TypeEntryList: TypeEntry[] = [TypeEntry.TyDecoded, TypeEntry.TyEncodable, TypeEntry.FnDecode, TypeEntry.FnEncode];

const CodecTypeSuffix: { [K in TypeEntry]: string } = {
    [TypeEntry.TyDecoded]: '_Decoded',
    [TypeEntry.TyEncodable]: '_Encodable',
    [TypeEntry.FnDecode]: '_decode',
    [TypeEntry.FnEncode]: '_encode',
};

function addSuffix(target: string, entry: TypeEntry): string {
    return target + CodecTypeSuffix[entry];
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
    collectRuntime: (name: string) => void;
    getRuntimeLibImports: () => Set<string>;
}

function createImportsCollector(): ImportsCollector {
    let runtimes = SetImmutable<string>();

    return {
        getRuntimeLibImports: () => new Set(runtimes),
        collectRef: (ref) => {
            if (RuntimeLibStds.has(ref)) {
                runtimes = Object.values(CodecTypeSuffix).reduce((set, suffix) => set.add(`${ref}${suffix}`), runtimes);
            }
        },
        collectRuntime: (name) => {
            runtimes = runtimes.add(name);
        },
    };
}

const { within: withinCollector, use: useCollector } = createStateScope<ImportsCollector>();

// =========

const { within: withinCurrentTyName, use: useCurrentTyName } = createStateScope<string>();

// =========

function renderCurrentTyExport(entry: TypeEntry, body: string): string {
    const ty = useCurrentTyName();
    const tySuffixed = addSuffix(ty, entry);

    switch (entry) {
        case TypeEntry.TyDecoded:
            return `export type ${tySuffixed} = ${body}`;
        case TypeEntry.TyEncodable:
            return `export type ${tySuffixed} = ${body}`;
        case TypeEntry.FnDecode: {
            const bodyFinal = replaceDollarVar(body, 'arg', 'bytes');

            return `export function ${tySuffixed}(bytes: Uint8Array): ${runtimeDep('DecodeResult')}<${addSuffix(
                ty,
                TypeEntry.TyDecoded,
            )}> {\n    ${bodyFinal}\n}`;
        }
        case TypeEntry.FnEncode: {
            const bodyFinal = replaceDollarVar(body, 'arg', 'encodable');

            return `export function ${tySuffixed}(encodable: ${addSuffix(
                ty,
                TypeEntry.TyEncodable,
            )}): Uint8Array {\n    ${bodyFinal}\n}`;
        }
    }
}

function tyRef(ref: string, entry: TypeEntry): string {
    useCollector().collectRef(ref);
    return addSuffix(ref, entry);
}

function runtimeDep(name: string): string {
    useCollector().collectRuntime(name);
    return name;
}

function linesJoin(lines: string[], joiner = '\n\n'): string {
    return lines.join(joiner);
}

function refEncodableOrAsIs(ref: string): string {
    return `${tyRef(ref, TypeEntry.TyEncodable)} | ${runtimeDep('EncodeAsIs')}`;
}

function refEncodable(ref: string): string {
    return tyRef(ref, TypeEntry.TyEncodable);
}

function refDecoded(ref: string): string {
    return tyRef(ref, TypeEntry.TyDecoded);
}

function refEncode(ref: string) {
    return tyRef(ref, TypeEntry.FnEncode);
}

function refDecode(ref: string) {
    return tyRef(ref, TypeEntry.FnDecode);
}

function renderDecoded(body: string) {
    return renderCurrentTyExport(TypeEntry.TyDecoded, body);
}

function renderEncodable(body: string) {
    return renderCurrentTyExport(TypeEntry.TyEncodable, body);
}

function renderDecode(body: string) {
    return renderCurrentTyExport(TypeEntry.FnDecode, body);
}

function renderEncode(body: string) {
    return renderCurrentTyExport(TypeEntry.FnEncode, body);
}

function hoistVarName(id: string): string {
    return `__hoisted_${useCurrentTyName()}_${id}__`;
}

function hoistConst(id: string, value: any): [varName: string, content: string] {
    const varName = hoistVarName(id);
    const content = `const ${varName} = ${value}`;
    return [varName, content];
}

function hoistConstWithType(id: string, ty: string, value: any): [varName: string, content: string] {
    const varName = hoistVarName(id);
    const content = `const ${varName}: ${ty} = ${value}`;
    return [varName, content];
}

// =========

function renderAlias(to: string): string {
    return linesJoin([
        renderDecoded(refDecoded(to)),
        renderEncodable(refEncodable(to)),
        renderDecode(`return ${refDecode(to)}($arg)`),
        renderEncode(`return ${refEncode(to)}($arg)`),
    ]);
}

function renderVoidAlias(): string {
    const { runtimeLib } = useRenderParams();

    return renderExternal({ nameInModule: 'Void', module: runtimeLib });
}

function renderVec(item: string): string {
    const [hoistedEncodeVar, hoistedEncode] = hoistConst(
        'item_encode',
        `${runtimeDep('makeEncoderAsIsRespectable')}(${refEncode(item)})`,
    );

    return linesJoin([
        renderDecoded(`${refDecoded(item)}[]`),
        renderEncodable(`(${refEncodableOrAsIs(item)})[]`),
        hoistedEncode,
        renderDecode(`return ${runtimeDep('decodeVec')}($arg, ${refDecode(item)})`),
        renderEncode(`return ${runtimeDep('encodeVec')}($arg, ${hoistedEncodeVar})`),
    ]);
}

function renderStructFields(fields: DefStructField[], mapFn: (ref: string) => string): string {
    return fields.map(({ name, ref }) => `${name}: ${mapFn(ref)}`).join(', ');
}

function renderStruct(fields: DefStructField[]): string {
    if (!fields.length) {
        return renderVoidAlias();
    }

    const ty = useCurrentTyName();

    const decodedFields = renderStructFields(fields, refDecoded);
    const encodableFields = renderStructFields(fields, refEncodableOrAsIs);

    const [hoistedOrderVar, hoistedOrder] = hoistConstWithType(
        'order',
        `(keyof ${addSuffix(ty, TypeEntry.TyDecoded)})[]`,
        `[${fields.map(({ name }) => `'${name}'`).join(', ')}]`,
    );

    const [hoistedDecodersVar, hoistedDecoders] = hoistConst(
        'decoders',
        `{ ${renderStructFields(fields, (ref) => tyRef(ref, TypeEntry.FnDecode))} }`,
    );

    const [hoistedEncodersVar, hoistedEncoders] = hoistConst(
        'encoders',
        `${runtimeDep('helperStructEncoders')}({ ${renderStructFields(fields, (ref) =>
            tyRef(ref, TypeEntry.FnEncode),
        )} })`,
    );

    return linesJoin([
        renderDecoded(`{ ${decodedFields} }`),
        renderEncodable(`{ ${encodableFields} }`),
        linesJoin([hoistedOrder, hoistedDecoders, hoistedEncoders], '\n'),
        renderDecode(`return ${runtimeDep('decodeStruct')}($arg, ${hoistedDecodersVar}, ${hoistedOrderVar})`),
        renderEncode(`return ${runtimeDep('encodeStruct')}($arg, ${hoistedEncodersVar}, ${hoistedOrderVar})`),
    ]);
}

function renderTupleRefs(refs: string[], map: (ref: string) => string): string {
    return refs.map(map).join(', ');
}

function renderTuple(refs: string[]): string {
    if (!refs.length) {
        return renderVoidAlias();
    }

    const { rollupSingleTuples } = useRenderParams();
    if (rollupSingleTuples && refs.length === 1) return renderAlias(refs[0]);

    const ty = useCurrentTyName();

    const [hoistedDecodersVar, hoistedDecoders] = hoistConst('decoders', `[${renderTupleRefs(refs, refDecode)}]`);
    const [hoistedEncodersVar, hoistedEncoders] = hoistConst(
        'encoders',
        `${runtimeDep('helperTupleEncoders')}<${tyRef(ty, TypeEntry.TyDecoded)}>([${renderTupleRefs(
            refs,
            refEncode,
        )}])`,
    );

    return linesJoin([
        renderDecoded(`[${renderTupleRefs(refs, refDecoded)}]`),
        renderEncodable(`[${renderTupleRefs(refs, refEncodableOrAsIs)}]`),
        linesJoin([hoistedDecoders, hoistedEncoders], '\n'),
        renderDecode(`return ${runtimeDep('decodeTuple')}($arg, ${hoistedDecodersVar} as any)`),
        renderEncode(`return ${runtimeDep('encodeTuple')}($arg, ${hoistedEncodersVar} as any)`),
    ]);
}

function renderEnumType(variants: DefEnumVariant[], mapRef: (ref: string) => string): string {
    const renderedVars = variants
        .map((x) => `${x.name}: ${x.ref ? `${runtimeDep('Valuable')}<${mapRef(x.ref)}>` : 'null'}`)
        .join('\n    ');

    return `${runtimeDep('Enum')}<{\n    ${renderedVars}\n}>`;
}

function hoistEnumSchema(variants: DefEnumVariant[]): [decodersVar: String, encodersVar: string, hoistLine: string] {
    const [hoistedPairsVar, hoistedPairs] = hoistConstWithType(
        'pairs',
        `${runtimeDep('HelperEnumDiscriminantVariantPair')}[]`,
        `[\n    ${variants.map((x) => `[${x.discriminant}, '${x.name}']`).join(',\n    ')}\n]`,
    );

    const valuableVars = variants.filter((x) => !!x.ref);

    const decodersMap = `{\n    ${valuableVars
        .map((x) => `${x.discriminant}: ${refDecode(x.ref!)}`)
        .join(',\n    ')}\n}`;
    const [hoistedDecodersVar, hoistedDecoders] = hoistConst(
        'decoders',
        `${runtimeDep('helperEnumDecoders')}(${hoistedPairsVar}, ${decodersMap})`,
    );

    const encodersMap = `{\n    ${valuableVars.map((x) => `${x.name}: ${refEncode(x.ref!)}`).join(',\n    ')}\n}`;
    const [hoistedEncodersVar, hoistedEncoders] = hoistConst(
        'encoders',
        `${runtimeDep('helperEnumEncoders')}(${hoistedPairsVar}, ${encodersMap})`,
    );

    return [hoistedDecodersVar, hoistedEncodersVar, linesJoin([hoistedPairs, hoistedDecoders, hoistedEncoders], '\n')];
}

function renderEnum(variants: DefEnumVariant[]): string {
    const [hoistedDecodersVar, hoistedEncodersVar, hoistedSchema] = hoistEnumSchema(variants);

    return linesJoin([
        renderDecoded(renderEnumType(variants, refDecoded)),
        renderEncodable(renderEnumType(variants, refEncodableOrAsIs)),
        hoistedSchema,
        renderDecode(`return ${runtimeDep('decodeEnum')}($arg, ${hoistedDecodersVar})`),
        renderEncode(`return ${runtimeDep('encodeEnum')}($arg, ${hoistedEncodersVar})`),
    ]);
}

function renderSet(item: string): string {
    const hoistedEncodeVar = useCurrentTyName() + '_item_encode';
    const hoistedEncode = `const ${hoistedEncodeVar} = ${runtimeDep('makeEncoderAsIsRespectable')}(${refEncode(item)})`;

    return linesJoin([
        renderDecoded(`Set<${refDecoded(item)}>`),
        renderEncodable(`Set<${refEncodableOrAsIs(item)}>`),
        hoistedEncode,
        renderDecode(`return ${runtimeDep('decodeSet')}($arg, ${refDecode(item)})`),
        renderEncode(`return ${runtimeDep('encodeSet')}($arg, ${hoistedEncodeVar})`),
    ]);
}

function renderMap(key: string, value: string): string {
    const hoistedEncoderKeyVar = hoistVarName('encode_key');
    const hoistedEncoderValueVar = hoistVarName('encode_value');
    const hoistedEncoders = `const [${hoistedEncoderKeyVar}, ${hoistedEncoderValueVar}] = ${runtimeDep(
        'helperMapEncoders',
    )}(${refEncode(key)}, ${refEncode(value)})`;

    return linesJoin([
        renderDecoded(`Map<${refDecoded(key)}, ${refDecoded(value)}>`),
        renderEncodable(`Map<${refEncodableOrAsIs(key)}, ${refEncodableOrAsIs(value)}>`),
        hoistedEncoders,
        renderDecode(`return ${runtimeDep('decodeMap')}($arg, ${refDecode(key)}, ${refDecode(value)})`),
        renderEncode(`return ${runtimeDep('encodeMap')}($arg, ${hoistedEncoderKeyVar}, ${hoistedEncoderValueVar})`),
    ]);
}

function renderArray(item: string, len: number): string {
    const [hoistedLenVar, hoistedLen] = hoistConst('len', len);
    const [hoistedEncodeVar, hoistedEncode] = hoistConst(
        'item_encode',
        `${runtimeDep('makeEncoderAsIsRespectable')}(${refEncode(item)})`,
    );

    return linesJoin([
        renderDecoded(`${refDecoded(item)}[]`),
        renderEncodable(`(${refEncodableOrAsIs(item)})[]`),
        linesJoin([hoistedEncode, hoistedLen], '\n'),
        renderDecode(`return ${runtimeDep('decodeArray')}($arg, ${refDecode(item)}, ${hoistedLenVar})`),
        renderEncode(`return ${runtimeDep('encodeArray')}($arg, ${hoistedEncodeVar}, ${hoistedLenVar})`),
    ]);
}

function renderBytesArray(len: number): string {
    const [hoistedLenVar, hoistedLen] = hoistConst('len', len);

    return linesJoin([
        renderDecoded('Uint8Array'),
        renderEncodable('Uint8Array'),
        hoistedLen,
        renderDecode(`return ${runtimeDep('decodeUint8Array')}($arg, ${hoistedLenVar})`),
        renderEncode(`return ${runtimeDep('encodeUint8Array')}($arg, ${hoistedLenVar})`),
    ]);
}

function renderOption(some: string): string {
    const opt = runtimeDep('Option');

    const [hoistedDecodersVar, hoistedEncodersVar, hoistedSchema] = hoistEnumSchema([
        { discriminant: 0, name: 'None' },
        { discriminant: 1, name: 'Some', ref: some },
    ]);

    return linesJoin([
        renderDecoded(`${opt}<${refDecoded(some)}>`),
        renderEncodable(`${opt}<${refEncodableOrAsIs(some)}>`),
        hoistedSchema,
        renderDecode(`return ${runtimeDep('decodeEnum')}($arg, ${hoistedDecodersVar})`),
        renderEncode(`return ${runtimeDep('encodeEnum')}($arg, ${hoistedEncodersVar})`),
    ]);
}

function renderExternal({
    nameInModule,
    module: moduleName,
}: {
    nameInModule?: string | null;
    module: string;
}): string {
    const ty = useCurrentTyName();

    const importsJoined = renderImports(
        TypeEntryList.map<ImportOptions>((x) => {
            return nameInModule ? { source: addSuffix(nameInModule, x), as: addSuffix(ty, x) } : addSuffix(ty, x);
        }),
        moduleName,
    );
    const exportsJoined = `export { ${TypeEntryList.map((x) => addSuffix(ty, x)).join(', ')} }`;

    return linesJoin([importsJoined, exportsJoined]);
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
            case 'external':
                return renderExternal(def);
            default:
                throw new Error(`Rendering is unimplemented for "${def.t}" type def`);
        }
    });

    return [`// ${tyName}`, particularRendered].join('\n\n');
}

function renderPreamble(): string {
    const { runtimeLib } = useRenderParams();
    const { getRuntimeLibImports: getCoreImports } = useCollector();

    const lines = ['/* eslint-disable */'];

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
            runtimeTypes: params?.runtimeTypes ?? RuntimeLibStds,
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
