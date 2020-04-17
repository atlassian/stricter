import { getReporter } from './get-reporter';
import { ReporterType } from '../types';

jest.mock('./../reporter');

describe('getReporter', () => {
    const mock = require('./../reporter');

    it('returns mocha', () => {
        const result = getReporter(ReporterType.MOCHA);
        expect(result).toBe(mock.mochaReporter);
    });

    it('returns junit', () => {
        const result = getReporter(ReporterType.JUNIT);
        expect(result).toBe(mock.junitReporter);
    });

    it('returns console', () => {
        const result = getReporter(ReporterType.CONSOLE);
        expect(result).toBe(mock.consoleReporter);
    });

    it('returns console by default', () => {
        const result = getReporter('something-else');
        expect(result).toBe(mock.consoleReporter);
    });
});
