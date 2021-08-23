import { StructEncodable } from '../codecs';
import * as str from './std/str';

export type Pure = {
    name: str.Pure;
};

type Encodables = {
    name: str.Encodable;
};

// type B = B

// const b: B = {
//     a: {}
// }

export type Encodable = StructEncodable<Encodables>;

// export /
