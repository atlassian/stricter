import { processFixes } from './index';

describe('processFixes', () => {
    const errorMock = jest.fn();
    const originalError = console.error;

    beforeAll(() => {
        console.error = errorMock;
    });

    afterAll(() => {
        console.error = originalError;
    });

    beforeEach(() => {
        errorMock.mockReset();
    });

    it('should invoke fix functions', () => {
        const fix1 = jest.fn();
        const fix2 = jest.fn();

        processFixes({
            rule1: {
                errors: [],
                warnings: [],
                time: 0,
                fixes: [],
            },
            rule2: {
                errors: [],
                warnings: [],
                time: 0,
                fixes: [fix1, fix2],
            },
        });

        expect(fix1).toHaveBeenCalledTimes(1);
        expect(fix2).toHaveBeenCalledTimes(1);
    });

    it('handles fixes throwing errors', () => {
        const failingFix = jest.fn().mockImplementationOnce(() => {
            throw new Error('Fix is broken');
        });

        expect(() =>
            processFixes({
                rule1: {
                    errors: [],
                    warnings: [],
                    time: 0,
                    fixes: [failingFix],
                },
            }),
        ).not.toThrow();

        expect(errorMock).toHaveBeenCalledWith(
            expect.stringContaining('Failed to apply fixes for rule1'),
        );
    });
});
