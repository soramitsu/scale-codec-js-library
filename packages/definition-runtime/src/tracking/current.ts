import { Decode, Walker } from '@scale-codec/core'
import { CodecTracker, RefineDecodeLocFn, TrackDecodeFn } from './types'

let __currentTracker: null | CodecTracker = null

/**
 * **Caution**: uses global state
 */
export function getCurrentTracker(): null | CodecTracker {
  return __currentTracker
}

/**
 * **Caution**: uses global state
 */
export function setCurrentTracker(tracker: null | CodecTracker) {
  __currentTracker = tracker
}

/**
 * **Caution**: uses global state
 */
export const trackDecode: TrackDecodeFn = <T>(loc: string, walker: Walker, decode: Decode<T>): T => {
  return __currentTracker?.decode?.(loc, walker, decode) ?? decode(walker)
}

/**
 * **Caution**: uses global state
 */
export const trackRefineDecodeLoc: RefineDecodeLocFn = <T>(loc: string, headlessDecode: () => T): T => {
  return __currentTracker?.refineDecodeLoc?.(loc, headlessDecode) ?? headlessDecode()
}
