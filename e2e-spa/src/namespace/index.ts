import { Enum, EnumSchema, Option, Result, StdCodecs, StdTypes, Valuable, defAlias, defArray, defEnum, defMap, defNamespace, defOption, defResult, defStruct, defTuple, defVec } from '@scale-codec/namespace';

export type Namespace = StdTypes & {
    "string": Namespace['str'];
    "Option<str>": Option<Namespace['str']>;
    "(string, i32)": [Namespace['string'],Namespace['i32']];
    "(u64, bool, (string, i32))": [Namespace['u64'],Namespace['bool'],Namespace['(string, i32)']];
    "Id": {
name: Namespace['str'];
domain: Namespace['str'];
second_name: Namespace['Option<str>'];
enum: Namespace['CustomEnum'];
attempt: Namespace['Result<(), str>'] };
    "CustomEnum": Enum<{
One: null;
Two: Valuable<Namespace['(u64, bool, (string, i32))']> }>;
    "HashMap<str, Id>": Map<Namespace['str'], Namespace['Id']>;
    "Vec<HashMap<str, Id>>": Namespace['HashMap<str, Id>'][];
    "[Vec<HashMap<str, Id>>; 8]": Namespace['Vec<HashMap<str, Id>>'][];
    "Result<(), str>": Result<Namespace['()'], Namespace['str']>;
}

export const types = defNamespace<Namespace>({
...StdCodecs,
    "string": defAlias('str'),
    "Option<str>": defOption('str'),
    "(string, i32)": defTuple(['string', 'i32']),
    "(u64, bool, (string, i32))": defTuple(['u64', 'bool', '(string, i32)']),
    "Id": defStruct([
['name', 'str'],
['domain', 'str'],
['second_name', 'Option<str>'],
['enum', 'CustomEnum'],
['attempt', 'Result<(), str>']]),
    "CustomEnum": defEnum(new EnumSchema({
One: { discriminant: 0 },Two: { discriminant: 1 } }), {
Two: '(u64, bool, (string, i32))' }),
    "HashMap<str, Id>": defMap('str', 'Id'),
    "Vec<HashMap<str, Id>>": defVec('HashMap<str, Id>'),
    "[Vec<HashMap<str, Id>>; 8]": defArray('Vec<HashMap<str, Id>>', 8),
    "Result<(), str>": defResult('()', 'str'),
});;