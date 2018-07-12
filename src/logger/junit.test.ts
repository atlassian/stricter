import logJunit from './junit';

describe('junitLogger', () => {
    const logMock = jest.fn();
    console.log = logMock;

    beforeEach(() => {
        logMock.mockReset();
    });

    it('outputs valid empty xml', () => {
        logJunit([]);
        const output = logMock.mock.calls[0][0];
        expect(output).toMatchSnapshot();
    });

    it('outputs valid complex xml', () => {
        logJunit([
            {
                rule: 'rule1',
                errors: [
                    'error1',
                    `someting 'that' "needs" <escaping> and closes it's CDATA ]]> early`,
                ],
            },
            { rule: 'rule2', warnings: ['rule2-warning'] },
            { rule: 'rule3', errors: ['rule3-error'], warnings: ['rule3-warning'] },
        ]);
        const output = logMock.mock.calls[0][0];
        expect(output).toMatchSnapshot();
    });
});
