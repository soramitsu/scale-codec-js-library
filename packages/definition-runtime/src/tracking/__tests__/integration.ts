import { Decode, Walker, WalkerImpl } from '@scale-codec/core'
import { Enum } from '../../lib'
import { setCurrentTracker, DecodeTraceCollector, buildDecodeTraceStepsFmt, CodecTracker, DecodeTrace } from '../index'
// useful for tests here too
import { StructA } from '@scale-codec/definition-compiler/tests/samples/unwrapCheck'

describe('Collecting big decode trace and formatting it', () => {
    class TestTracker implements CodecTracker {
        public lastTrace: null | DecodeTrace = null
        public lastWalker: null | Walker = null
        private errored = false
        private depth = 0
        private tracer = new DecodeTraceCollector()

        public decode<T>(loc: string, walker: Walker, decode: Decode<T>): T {
            try {
                this.lastWalker = walker
                this.depth++
                this.tracer.decodeStart(loc, walker)
                const result = decode(walker)
                const trace = this.tracer.decodeSuccess(walker, result)
                trace && (this.lastTrace = trace)
                return result
            } catch (err) {
                if (!this.errored) {
                    this.errored = true
                    this.lastTrace = this.tracer.decodeError(err)
                }
                throw err
            } finally {
                if (!--this.depth) {
                    this.errored = false
                }
            }
        }

        public refineDecodeLoc<T>(loc: string, decode: () => T) {
            this.tracer.refineLoc(loc)
            return decode()
        }
    }

    const fragment = StructA.wrap({
        primitive: true,
        enum: Enum.variant('Empty'),
        map: new Map([
            ['test str', ['tuple value']],
            ['another key', ['tuple value']],
        ]),
        set: new Set([['tuple value'], ['another tuple']]),
        tuple: ['tuple value'],
        array: [true, true, true],
        bytesArray: new Uint8Array([8, 1, 2, 3, 3]),
        vec: [Enum.variant('Opt', Enum.variant('None')), Enum.variant('Res', Enum.variant('Err', 'test str'))],
        alias: ['test str'],
    })

    afterEach(() => {
        setCurrentTracker(null)
    })

    test('Success case', () => {
        const tracker = new TestTracker()
        setCurrentTracker(tracker)

        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        StructA.fromBuffer(fragment.bytes).value

        expect(tracker.lastTrace).toBeTruthy()
        expect(buildDecodeTraceStepsFmt(tracker.lastTrace!, tracker.lastWalker!).assemble()).toMatchSnapshot()
    })

    test('Error case', () => {
        const tracker = new TestTracker()
        setCurrentTracker(tracker)

        const bytes = fragment.bytes
        const copy = new Uint8Array([...bytes]).fill(255, 20, 30)
        expect(() => StructA.fromBuffer(copy).value).toThrow()

        expect(tracker.lastTrace).toBeTruthy()
        expect(buildDecodeTraceStepsFmt(tracker.lastTrace!, tracker.lastWalker!).assemble()).toMatchSnapshot()
    })
})
