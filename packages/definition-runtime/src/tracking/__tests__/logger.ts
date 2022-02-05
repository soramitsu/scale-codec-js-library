import { WalkerImpl } from '@scale-codec/core'
import { setCurrentTracker, Logger, trackDecode } from '../index'

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
let consoleErrorMock: jest.SpyInstance
let consoleDebugMock: jest.SpyInstance

beforeEach(() => {
    consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(noop)
    consoleDebugMock = jest.spyOn(console, 'debug').mockImplementation(noop)
    setCurrentTracker(null)
})

afterEach(() => {
    jest.resetAllMocks()
    setCurrentTracker(null)
})

afterAll(() => {
    jest.restoreAllMocks()
})

test('Prints debug log if related prop is set', () => {
    new Logger({
        logDecodeSuccesses: true,
    }).mount()

    runSuccessTrack()

    expect(consoleErrorMock).not.toBeCalled()
    expect(consoleDebugMock).toBeCalledTimes(1)
    expect(consoleDebugMock.mock.calls[0]).toMatchSnapshot()
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
    expect(consoleErrorMock.mock.calls[0]).toMatchSnapshot()
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
