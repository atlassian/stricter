import { compactProjectLogs } from './flatten';

describe('compactProjectLogs', () => {
    it('flattens rule application objects', () => {
        const rule = 'rule';
        const errors = ['error'];
        const warnings = ['warning'];
        const result = compactProjectLogs({
            [rule]: { errors, warnings },
        });

        expect(result).toEqual([{ rule, errors, warnings }]);
    });

    it('removes empty entries', () => {
        const rule = 'rule';
        const errors: string[] = [];
        const warnings: string[] = [];
        const result = compactProjectLogs({
            [rule]: { errors, warnings },
        });

        expect(result).toEqual([]);
    });
});
