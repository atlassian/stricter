import logConsole from './console';

describe('consoleLogger', () => {
    let errorMock: any;
    let logMock: any;
    let warnMock: any;

    beforeEach(() => {
        console.error = errorMock = jest.fn();
        console.log = logMock = jest.fn();
        console.warn = warnMock = jest.fn();
    });

    it('runs warn for every warning', () => {
        const warn = {
            filePath: 'filePath',
            rule: 'rule',
            warnings: ['warning1', 'warning2'],
        };
        logConsole([warn, warn]);

        expect(warnMock.mock.calls.length).toBe(4);
    });

    it('runs error for every error', () => {
        const error = {
            filePath: 'filePath',
            rule: 'rule',
            errors: ['error1', 'error2'],
        };
        logConsole([error, error]);

        expect(errorMock.mock.calls.length).toBe(4);
    });

    it('log different file names', () => {
        const error1 = {
            filePath: 'filePath1',
            rule: 'rule',
            errors: ['error1'],
        };
        const error2 = {
            filePath: 'filePath2',
            rule: 'rule',
            errors: ['error2'],
        };
        logConsole([error1, error2]);

        expect(logMock.mock.calls.length).toBe(2);
    });

    it("doesn't log same file name twice", () => {
        const error = {
            filePath: 'filePath',
            rule: 'rule',
            errors: ['error1', 'error2'],
        };
        logConsole([error, error]);

        expect(logMock.mock.calls.length).toBe(1);
    });
});
