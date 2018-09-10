import getReporter from './get-reporter';
import { ReporterType } from '../types';

jest.mock('./../reporter');

describe('getReporter', () => {
    const mock = require('./../reporter');

    it('returns mocha', () => {
        const result = getReporter(ReporterType.MOCHA);
        expect(result).toBe(mock.mochaReporter);
    });

    it('returns mocha', () => {
        const result = getReporter(ReporterType.JUNIT);
        expect(result).toBe(mock.junitReporter);
    });

    it('returns mocha', () => {
        const result = getReporter(ReporterType.CONSOLE);
        expect(result).toBe(mock.consoleReporter);
    });

    it('returns mocha', () => {
        const result = getReporter('something-else');
        expect(result).toBe(mock.consoleReporter);
    });
});
