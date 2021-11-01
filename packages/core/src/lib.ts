/**
 * Core SCALE library with tools to encode to and decode SCALE binaries. It includes implementations for
 * primitive types as well as for complex types.
 *
 * @packageDocumentation
 */

export * from './types';
export * from './primitives';
export * from './compact';
export * from './containers';
export * from './util';

// re-export enums
export * from '@scale-codec/enum';

// re-export the exact version of JSBI that is used in core library to remove a requirement of its installation as
// peer dependency
export { default as JSBI } from 'jsbi';
