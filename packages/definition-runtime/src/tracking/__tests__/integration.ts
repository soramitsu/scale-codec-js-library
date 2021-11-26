import { DecodeResult, Decode } from '@scale-codec/core';
import {
    Bool,
    Enum,
    FragmentFromBuilder,
    Option,
    Result,
    ScaleArrayBuilder,
    ScaleEnumBuilder,
    ScaleMapBuilder,
    ScaleSetBuilder,
    ScaleStructBuilder,
    ScaleTupleBuilder,
    Str,
    Valuable,
    createAliasBuilder,
    createArrayBuilder,
    createBytesArrayBuilder,
    createEnumBuilder,
    createMapBuilder,
    createOptionBuilder,
    createResultBuilder,
    createSetBuilder,
    createStructBuilder,
    createTupleBuilder,
    createVecBuilder,
    dynBuilder,
} from '../../lib';

import { setCurrentTracker, DecodeTraceCollector, buildDecodeTraceStepsFmt, CodecTracker, DecodeTrace } from '../index';

// Code extracted from `definition-compiler/tests/samples/unwrapCheck.ts`

const AliasA: typeof TupleA = createAliasBuilder(
    'AliasA',
    dynBuilder(() => TupleA),
);

const ArrayA: ScaleArrayBuilder<FragmentFromBuilder<typeof Bool>[]> = createArrayBuilder(
    'ArrayA',
    dynBuilder(() => Bool),
    3,
);

const BytesArrayA = createBytesArrayBuilder('BytesArrayA', 5);

const EnumA: ScaleEnumBuilder<
    Enum<{
        Opt: Valuable<FragmentFromBuilder<typeof OptionA>>;
        Res: Valuable<FragmentFromBuilder<typeof ResultA>>;
        Empty: null;
    }>
> = createEnumBuilder('EnumA', [
    [0, 'Opt', dynBuilder(() => OptionA)],
    [1, 'Res', dynBuilder(() => ResultA)],
    [2, 'Empty'],
]);

const MapA: ScaleMapBuilder<Map<FragmentFromBuilder<typeof Str>, FragmentFromBuilder<typeof TupleA>>> =
    createMapBuilder(
        'MapA',
        dynBuilder(() => Str),
        dynBuilder(() => TupleA),
    );

const OptionA: ScaleEnumBuilder<Option<FragmentFromBuilder<typeof TupleA>>> = createOptionBuilder(
    'OptionA',
    dynBuilder(() => TupleA),
);

const ResultA: ScaleEnumBuilder<Result<FragmentFromBuilder<typeof TupleA>, FragmentFromBuilder<typeof Str>>> =
    createResultBuilder(
        'ResultA',
        dynBuilder(() => TupleA),
        dynBuilder(() => Str),
    );

const SetA: ScaleSetBuilder<Set<FragmentFromBuilder<typeof TupleA>>> = createSetBuilder(
    'SetA',
    dynBuilder(() => TupleA),
);

const StructA: ScaleStructBuilder<{
    primitive: FragmentFromBuilder<typeof Bool>;
    alias: FragmentFromBuilder<typeof AliasA>;
    enum: FragmentFromBuilder<typeof EnumA>;
    map: FragmentFromBuilder<typeof MapA>;
    set: FragmentFromBuilder<typeof SetA>;
    array: FragmentFromBuilder<typeof ArrayA>;
    bytesArray: FragmentFromBuilder<typeof BytesArrayA>;
    vec: FragmentFromBuilder<typeof VecEnumA>;
    tuple: FragmentFromBuilder<typeof TupleA>;
}> = createStructBuilder('StructA', [
    ['primitive', dynBuilder(() => Bool)],
    ['alias', dynBuilder(() => AliasA)],
    ['enum', dynBuilder(() => EnumA)],
    ['map', dynBuilder(() => MapA)],
    ['set', dynBuilder(() => SetA)],
    ['array', dynBuilder(() => ArrayA)],
    ['bytesArray', dynBuilder(() => BytesArrayA)],
    ['vec', dynBuilder(() => VecEnumA)],
    ['tuple', dynBuilder(() => TupleA)],
]);

const TupleA: ScaleTupleBuilder<[FragmentFromBuilder<typeof Str>]> = createTupleBuilder('TupleA', [
    dynBuilder(() => Str),
]);

const VecEnumA: ScaleArrayBuilder<FragmentFromBuilder<typeof EnumA>[]> = createVecBuilder(
    'VecEnumA',
    dynBuilder(() => EnumA),
);

describe('Collecting big decode trace and formatting it', () => {
    class TestTracker implements CodecTracker {
        public lastTrace: null | DecodeTrace = null;
        private errored = false;
        private depth = 0;
        private tracer = new DecodeTraceCollector();

        public decode<T>(loc: string, input: Uint8Array, decode: Decode<T>): DecodeResult<T> {
            try {
                this.depth++;
                this.tracer.decodeStart(loc, input);
                const result = decode(input);
                const trace = this.tracer.decodeSuccess(result);
                trace && (this.lastTrace = trace);
                return result;
            } catch (err) {
                if (!this.errored) {
                    this.errored = true;
                    this.lastTrace = this.tracer.decodeError(err);
                }
                throw err;
            } finally {
                if (!--this.depth) {
                    this.errored = false;
                }
            }
        }

        public refineDecodeLoc<T>(loc: string, decode: () => DecodeResult<T>) {
            this.tracer.refineLoc(loc);
            return decode();
        }
    }

    const fragment = StructA.wrap({
        primitive: true,
        enum: Enum.empty('Empty'),
        map: new Map([
            ['test str', ['tuple value']],
            ['another key', ['tuple value']],
        ]),
        set: new Set([['tuple value'], ['another tuple']]),
        tuple: ['tuple value'],
        array: [true, true, true],
        bytesArray: new Uint8Array([8, 1, 2, 3, 3]),
        vec: [Enum.valuable('Opt', Enum.empty('None')), Enum.valuable('Res', Enum.valuable('Err', 'test str'))],
        alias: ['test str'],
    });

    afterEach(() => {
        setCurrentTracker(null);
    });

    test('Success case', () => {
        const tracker = new TestTracker();
        setCurrentTracker(tracker);

        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        StructA.fromBytes(fragment.bytes).value;

        expect(tracker.lastTrace).toBeTruthy();
        expect(buildDecodeTraceStepsFmt(tracker.lastTrace!).assemble()).toMatchSnapshot();
    });

    test('Error case', () => {
        const tracker = new TestTracker();
        setCurrentTracker(tracker);

        const bytes = fragment.bytes;
        const copy = new Uint8Array([...bytes]).fill(255, 20, 30);
        expect(() => StructA.fromBytes(copy).value).toThrow();

        expect(tracker.lastTrace).toBeTruthy();
        expect(buildDecodeTraceStepsFmt(tracker.lastTrace!).assemble()).toMatchSnapshot();
    });
});
