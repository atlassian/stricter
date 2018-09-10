import logConsole from './console';

describe('consoleReporter', () => {
    const logMock = jest.fn();
    console.log = logMock;

    beforeEach(() => {
        logMock.mockReset();
    });

    it('outputs errors for empty report', () => {
        const empty = {};
        logConsole(empty);

        expect(logMock.mock.calls.length).toBe(1);
    });

    it('outputs warn for every warning', () => {
        const warns = {
            rule1: {
                warnings: ['warning1', 'warning2'],
            },
            rule2: {
                warnings: ['warning1', 'warning2'],
            },
        };
        logConsole(warns);

        expect(logMock.mock.calls.length).toBe(4 + 1);
    });

    it('outputs error for every error', () => {
        const errors = {
            rule1: {
                warnings: ['error1', 'error2'],
            },
            rule2: {
                warnings: ['error1', 'error2'],
            },
        };
        logConsole(errors);

        expect(logMock.mock.calls.length).toBe(4 + 1);
    });
});
