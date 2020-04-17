import { reporter as logJunit } from './junit';

describe('junitReporter', () => {
    const logMock = jest.fn();
    console.log = logMock;

    beforeEach(() => {
        logMock.mockReset();
    });

    it('outputs valid empty xml', () => {
        logJunit({});
        const output = logMock.mock.calls[0][0];
        expect(output).toMatchSnapshot();
    });

    it('outputs valid xml when there is no rules violations', () => {
        logJunit({
            rule1: {
                errors: [],
                warnings: [],
                time: 1,
                fixes: [],
            },
        });
        const output = logMock.mock.calls[0][0];
        expect(output).toMatchSnapshot();
    });

    it('ignores warnings', () => {
        logJunit({
            rule1: {
                errors: [],
                warnings: ['rule2-warning'],
                time: 2,
                fixes: [],
            },
        });
        const output = logMock.mock.calls[0][0];
        expect(output).toMatchSnapshot();
    });

    it('outputs valid complex xml', () => {
        logJunit({
            rule1: {
                errors: [
                    'error1',
                    `someting 'that' "needs" <escaping> and closes it's CDATA ]]> early`,
                ],
                warnings: [],
                time: 1,
                fixes: [],
            },
            rule2: {
                errors: [],
                warnings: ['rule2-warning'],
                time: 2,
                fixes: [],
            },
            rule3: {
                errors: ['rule3-error'],
                warnings: ['rule3-warning'],
                time: 3,
                fixes: [],
            },
        });
        const output = logMock.mock.calls[0][0];
        expect(output).toMatchSnapshot();
    });
});
