import { ScanParams, scanDef, scanRef } from './scan';
import { CodecCompileCtx, CodecCompileFn, NamespaceCodegenDefinition, ParsedRef, TypeDef } from './types';
import { Map, Seq } from 'immutable';

export interface GenerateParams {
    definition: NamespaceCodegenDefinition;
}

export interface GenerateReturn {
    modulesTree: ModulesTree;
}

export type ModulesTree = Record<string, string>;

function scanDefinition(def: NamespaceCodegenDefinition): Map<ParsedRef, CodecCompileFn> {
    const items = Object.entries(def) as [string, TypeDef][];

    const isKnownType = (ref: string): boolean => ref in def;
    const scanParams: ScanParams = { isKnownType };

    return Seq(items)
        .map<[ParsedRef, CodecCompileFn]>(([rawRef, def]) => {
            const refParsed = scanRef(rawRef, scanParams);
            const compile = scanDef(def, scanParams);
            return [refParsed, compile];
        })
        .reduce((acc, [ref, compile]) => acc.set(ref, compile), Map<ParsedRef, CodecCompileFn>());
}

function createCtx(): CodecCompileCtx {
    return {
        ref: (ref) => {
            return 'some_ref';
        },
        tool: (name) => {
            return name;
        },
        compileImports({ selfRef, coreLib }) {
            return 'asdf';
        },
    };
}

function compileModule(ref: ParsedRef, compileFn: CodecCompileFn): string {
    const ctx = createCtx();

    const code = compileFn(ctx);
    const imports = ctx.compileImports({
        selfRef: ref,
        coreLib: '@scale-codec/namespace-next',
    });

    return [code, imports].join('\n\n');
}

function compileModules(data: Map<ParsedRef, CodecCompileFn>): ModulesTree {
    return [...data]
        .map<[ParsedRef, string]>(([ref, compileFn]) => {
            const code = compileModule(ref, compileFn);
            return [ref, code];
        })
        .reduce<ModulesTree>((acc, [ref, code]) => {
            const path = `${ref.join('/')}.ts`;
            acc[path] = code;
            return acc;
        }, {});
}

export async function generate(params: GenerateParams): Promise<GenerateReturn> {
    const scanned = scanDefinition(params.definition);
    return {
        modulesTree: compileModules(scanned),
    };
}
