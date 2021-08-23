export type RawRef = string;

export type ParsedRef = string[];

export interface CodecCompileCtxBase {
    ref: (ref: ParsedRef) => string;
    tool: (name: string) => string;
    reExportRef: (ref: ParsedRef) => void;
}

export interface CompileImportsParams {
    coreLib: string;
    selfRef: ParsedRef;
}

export interface CodecCompileCtx extends CodecCompileCtxBase {
    compileImports: (params: CompileImportsParams) => string;
}

export type CodecCompileFn = (ctx: CodecCompileCtx) => string | null;
