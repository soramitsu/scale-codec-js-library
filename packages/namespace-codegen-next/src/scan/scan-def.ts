import { Result } from '../result';
import { TypeDef, VecDef, CodecCompileFn } from '../types';
import { ScanError } from './errors';
import { scanRef } from './scan-ref';
import { ScanParams } from './types';

export type DefScanResult = Result<CodecCompileFn, ScanError[]>;

/**
 * Scans particular def and finds any errors in it or returns parsed def
 * with info about any found refs in it (with additional info about ref like it's position in def)
 */
export function scanDef(def: TypeDef, params: ScanParams): CodecCompileFn {
    if (typeof def === 'string') {
        return scanAlias(def, params);
    }
    if (def.t === 'vec') {
        return scanVec(def, params);
    }

    // etc

    throw new Error(`unexpected def`);
}

function scanAlias(to: string, params: ScanParams): CodecCompileFn {
    return ({ reExportRef }) => {
        reExportRef(scanRef(to, params));
        return null;
    };
}

function scanVec({ item }: VecDef, params: ScanParams): CodecCompileFn {
    const parsedRef = scanRef(item, params);

    return ({ ref, tool }) => {
        const item = ref(parsedRef);

        return [
            `export type Pure = ${item}.Pure;`,
            `export type Encodable = (${item}.Encodable | ${tool('EncodeSkippable')})[];`,
            `export const { encode, decode } = ${tool('vecCodec')}(${item});`,
        ].join('\n\n');
    };
}
