import { hexifyBytes } from '@scale-codec/util';
import { TrackValueInspectable, TrackValueInspect } from './types';

export interface PrettyDecodeInputParams {
    /**
     * Max count of stringified bytes
     * @default 20
     */
    bytesLimit?: number;

    /**
     * How many bytes were used in the `DecodeResult` if there was some
     */
    used?: number;
}

function hexLimited(bytes: Uint8Array, limit: number): string {
    const len = bytes.length;
    const cut = len > limit ? bytes.subarray(0, limit) : bytes;
    const ellipsis = len > limit ? '…' : '';
    return `${hexifyBytes(cut)}${ellipsis}`;
}

export function prettyDecodeInput(input: Uint8Array, params?: PrettyDecodeInputParams): string {
    const limit = params?.bytesLimit ?? 20;
    const used = params?.used ?? 0;
    const len = input.length;

    if (!len) {
        return '<empty>';
    }

    const shallPrintTheUsed = used > 0;
    const computedSpaceForTheUsed = Math.min(used, limit);
    const shallPrintTheRest = len > used;
    const howMuchSpaceAvailableForTheRest = limit - computedSpaceForTheUsed;
    const howMuchBytesInTheRest = len - used;
    const computedSpaceForTheRest = Math.max(0, Math.min(howMuchBytesInTheRest, howMuchSpaceAvailableForTheRest));

    const theUsedFormattedPart =
        shallPrintTheUsed && `[${hexLimited(input.subarray(0, used), computedSpaceForTheUsed)}]`;
    const theRestFormattedPart =
        shallPrintTheRest &&
        (computedSpaceForTheRest ? hexLimited(input.subarray(used), computedSpaceForTheRest) : '…');
    const formattedInput = [theUsedFormattedPart, theRestFormattedPart].filter((x) => !!x).join(' ');

    const summary =
        len === used ? `len = used = ${len}` : `len: ${len}${used ? `, used: ${used > len ? '(!) ' : ''}${used}` : ''}`;

    return `${formattedInput} (${summary})`;
}

export function isTrackValueInspectable(value: unknown): value is TrackValueInspectable {
    return typeof value === 'object' && TrackValueInspect in (value as any);
}

export function tryInspectValue(value: any): any {
    if (isTrackValueInspectable(value)) {
        return value[TrackValueInspect]();
    }
    return value;
}
