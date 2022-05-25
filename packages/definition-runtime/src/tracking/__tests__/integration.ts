import { Decode, Walker } from '@scale-codec/core'
import { setCurrentTracker, DecodeTraceCollector, buildDecodeTraceStepsFmt, CodecTracker, DecodeTrace } from '../index'

// useful for tests here too
import {
  AllInOne,
  ArraySetU8l2,
  Character,
  MapStrU8,
  Msg,
  SetU8,
  TupleMsgMsg,
  VecBool,
} from '@scale-codec/definition-compiler/tests/samples/complexNamespace'

function valueFactory(): AllInOne {
  return AllInOne({
    tuple_with_opts: TupleMsgMsg([Msg('Greeting', 'Gey!'), Msg('Quit')]),
    map: MapStrU8(new Map([['!234', 11]])),
    alias: 'Yo ho ho',
    another_struct: Character({
      name: 'Alice',
    }),
    arr: ArraySetU8l2([SetU8(new Set()), new Set([1, 6, 2, 3, 4, 1, 2, 3, 4]) as SetU8]),
    vec: [false, true, false] as VecBool,
  })
}

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

  afterEach(() => {
    setCurrentTracker(null)
  })

  test('Success case', () => {
    const tracker = new TestTracker()
    setCurrentTracker(tracker)

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    AllInOne.fromBuffer(AllInOne.toBuffer(valueFactory()))

    expect(tracker.lastTrace).toBeTruthy()
    expect(buildDecodeTraceStepsFmt(tracker.lastTrace!, tracker.lastWalker!).assemble()).toMatchSnapshot()
  })

  test('Error case', () => {
    const tracker = new TestTracker()
    setCurrentTracker(tracker)

    const bytes = AllInOne.toBuffer(valueFactory())
    const copy = new Uint8Array([...bytes]).fill(255, 20, 30)

    expect(() => AllInOne.fromBuffer(copy)).toThrow()

    expect(tracker.lastTrace).toBeTruthy()
    expect(buildDecodeTraceStepsFmt(tracker.lastTrace!, tracker.lastWalker!).assemble()).toMatchSnapshot()
  })
})
