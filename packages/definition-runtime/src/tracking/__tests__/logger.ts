import { setCurrentTracker, Logger, trackDecode } from '../index';

function runSuccessTrack() {
    trackDecode('First', new Uint8Array([0, 1, 2, 3]), (bytes) => {
        return trackDecode('Second', bytes, () => {
            return ['Result', 4];
        });
    });
}

function runFailureTrack() {
    try {
        trackDecode('Whoosh', new Uint8Array([4, 2, 3, 1]), (bytes) => {
            return trackDecode('Shoowh', bytes, () => {
                throw new Error('Expected inner error');
            });
        });
    } catch {}
}
const noop = () => {};
let consoleErrorMock: jest.SpyInstance;
let consoleDebugMock: jest.SpyInstance;

beforeEach(() => {
    consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(noop);
    consoleDebugMock = jest.spyOn(console, 'debug').mockImplementation(noop);
    setCurrentTracker(null);
});

afterEach(() => {
    jest.resetAllMocks();
    setCurrentTracker(null);
});

afterAll(() => {
    jest.restoreAllMocks();
});

test('Prints debug log if related prop is set', () => {
    new Logger({
        logDecodeSuccesses: true,
    }).mount();

    runSuccessTrack();

    expect(consoleErrorMock).not.toBeCalled();
    expect(consoleDebugMock).toBeCalledTimes(1);
    expect(consoleDebugMock.mock.calls[0]).toMatchSnapshot();
});

test("Doesn't print debug logs by default", () => {
    new Logger().mount();

    runSuccessTrack();

    expect(consoleErrorMock).not.toBeCalled();
    expect(consoleDebugMock).not.toBeCalled();
});

test('Prints error log by default', () => {
    new Logger().mount();

    runFailureTrack();

    expect(consoleDebugMock).not.toBeCalled();
    expect(consoleErrorMock).toBeCalledTimes(1);
    expect(consoleErrorMock.mock.calls[0]).toMatchSnapshot();
});

test("Doesn't print error if prop is set", () => {
    new Logger({ logDecodeErrors: false }).mount();

    try {
        runFailureTrack();
    } catch {}

    expect(consoleDebugMock).not.toBeCalled();
    expect(consoleErrorMock).not.toBeCalled();
});

test('Changes bytesLimit if provided some', () => {
    new Logger({ bytesPrintLimit: 2, logDecodeSuccesses: true }).mount();

    runSuccessTrack();
    runFailureTrack();

    expect(consoleDebugMock.mock.calls[0]).toMatchSnapshot();
    expect(consoleErrorMock.mock.calls[0]).toMatchSnapshot();
});
