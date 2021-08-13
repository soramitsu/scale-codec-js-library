import {
  encodeStrCompact,
  decodeStrCompact,
  encodeBigInt,
  decodeBigInt,
  encodeStruct,
  decodeStruct
} from "@scale-codec/core";
import { respectSkip } from "./skip";
import { respectSkippableStructFields } from "./encodables";
import JSBI from "jsbi";
export var Example;
(function(Example2) {
  let str;
  (function(str2) {
    function encode(val) {
      return respectSkip(val, encodeStrCompact);
    }
    str2.encode = encode;
    function decode(bytes) {
      return decodeStrCompact(bytes);
    }
    str2.decode = decode;
  })(str = Example2.str || (Example2.str = {}));
  let u8;
  (function(u82) {
    function encode(val) {
      return respectSkip(val, (num) => encodeBigInt(JSBI.BigInt(num), {
        bits: 8,
        signed: false,
        endianness: "le"
      }));
    }
    u82.encode = encode;
    function decode(bytes) {
      const [num, b] = decodeBigInt(bytes, {
        bits: 8,
        signed: false,
        endianness: "le"
      });
      return [JSBI.toNumber(num), b];
    }
    u82.decode = decode;
  })(u8 = Example2.u8 || (Example2.u8 = {}));
  let Person;
  (function(Person2) {
    const ORDER = ["name", "age"];
    const encoders = respectSkippableStructFields({
      name: Example2.str.encode,
      age: Example2.u8.encode
    });
    function encode(val) {
      return encodeStruct(val, encoders, ORDER);
    }
    Person2.encode = encode;
    const decoders = {
      name: Example2.str.decode,
      age: Example2.u8.decode
    };
    function decode(val) {
      return decodeStruct(val, decoders, ORDER);
    }
    Person2.decode = decode;
  })(Person = Example2.Person || (Example2.Person = {}));
})(Example || (Example = {}));
