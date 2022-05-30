import { SpyInstance, afterAll, afterEach, beforeEach, expect, test, vi } from 'vitest'
import { WalkerImpl } from '@scale-codec/core'
import { Logger, setCurrentTracker, trackDecode } from '../index'

function runSuccessTrack() {
  WalkerImpl.decode<string>(new Uint8Array([0, 1, 2, 3]), (walker) => {
    return trackDecode('First', walker, (walker) => {
      return trackDecode('Second', walker, (walker) => {
        walker.idx += 4
        return 'Result'
      })
    })
  })
}

function runFailureTrack() {
  expect(() =>
    WalkerImpl.decode(new Uint8Array([4, 2, 3, 1]), (walker) =>
      trackDecode('Whoosh', walker, (walker) =>
        // eslint-disable-next-line max-nested-callbacks
        trackDecode('Shoowh', walker, (walker) => {
          throw new Error('Expected inner error')
        }),
      ),
    ),
  ).toThrowError('Expected inner error')
}
const noop = () => {}
let consoleErrorMock: SpyInstance
let consoleDebugMock: SpyInstance

beforeEach(() => {
  consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(noop)
  consoleDebugMock = vi.spyOn(console, 'debug').mockImplementation(noop)
  setCurrentTracker(null)
})

afterEach(() => {
  vi.resetAllMocks()
  setCurrentTracker(null)
})

afterAll(() => {
  vi.restoreAllMocks()
})

test('Prints debug log if related prop is set', () => {
  new Logger({
    logDecodeSuccesses: true,
  }).mount()

  runSuccessTrack()

  expect(consoleErrorMock).not.toBeCalled()
  expect(consoleDebugMock).toBeCalledTimes(1)
  expect(consoleDebugMock.mock.calls[0]).toMatchInlineSnapshot(`
    [
      "[SCALE] Decode of \\"First\\" succeed

    Decode steps:

    First
        Walk: <offset: 0..4 (+4); 00 01 02 03>
        Result: %O
        Child steps: 1
    First / Second
        Walk: <offset: 0..4 (+4); 00 01 02 03>
        Result: %O
        Child steps: 0
    ",
      "Result",
      "Result",
    ]
  `)
})

test("Doesn't print debug logs by default", () => {
  new Logger().mount()

  runSuccessTrack()

  expect(consoleErrorMock).not.toBeCalled()
  expect(consoleDebugMock).not.toBeCalled()
})

test('Prints error log by default', () => {
  new Logger().mount()

  runFailureTrack()

  expect(consoleDebugMock).not.toBeCalled()
  expect(consoleErrorMock).toBeCalledTimes(1)
  expect(consoleErrorMock.mock.calls[0]).toMatchInlineSnapshot(`
    [
      "[SCALE] Decode of \\"Whoosh\\" failed with error: Error: Expected inner error

    Decode steps:

    Whoosh
        Walk: <offset: 0; 04 02 03 01>
        Result: <not computed>
        Child steps: 1
    Whoosh / Shoowh
        Walk: <offset: 0; 04 02 03 01>
        Result: ERROR - %s
        Child steps: 0
    ",
      [Error: Expected inner error],
    ]
  `)
})

test("Doesn't print error if prop is set", () => {
  new Logger({ logDecodeErrors: false }).mount()

  try {
    runFailureTrack()
  } catch {}

  expect(consoleDebugMock).not.toBeCalled()
  expect(consoleErrorMock).not.toBeCalled()
})

// test('Changes bytesLimit if provided some', () => {
//     new Logger({ bytesPrintLimit: 2, logDecodeSuccesses: true }).mount()

//     runSuccessTrack()
//     runFailureTrack()

//     expect(consoleDebugMock.mock.calls[0]).toMatchSnapshot()
//     expect(consoleErrorMock.mock.calls[0]).toMatchSnapshot()
// })
