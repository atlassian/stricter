import logConsole from './console';

describe('consoleLogger', () => {
    const logMock = jest.fn();
    console.log = logMock;

    beforeEach(() => {
        logMock.mockReset();
    });

    it('runs warn for every warning', () => {
        const warn = {
            rule: 'rule',
            warnings: ['warning1', 'warning2'],
        };
        logConsole([warn, warn]);

        expect(logMock.mock.calls.length).toBe(4 + 1);
    });

    it('runs error for every error', () => {
        const error = {
            rule: 'rule',
            errors: ['error1', 'error2'],
        };
        logConsole([error, error]);

        expect(logMock.mock.calls.length).toBe(4 + 1);
    });
});
