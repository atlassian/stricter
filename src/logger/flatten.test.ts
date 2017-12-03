import { compactFileLogs, compactProjectLogs } from './flatten';

describe('compactFileLogs', () => {
    it('flattens rule application objects', () => {
        const filePath = 'filePath';
        const rule = 'rule';
        const errors = ['error'];
        const warnings = ['warning'];
        const result = compactFileLogs({
            [filePath]: { [rule]: { errors, warnings } },
        });

        expect(result).toEqual([{ filePath, rule, errors, warnings }]);
    });

    it('removes empty entries', () => {
        const filePath = 'filePath';
        const rule = 'rule';
        const errors: string[] = [];
        const warnings: string[] = [];
        const result = compactFileLogs({
            [filePath]: { [rule]: { errors, warnings } },
        });

        expect(result).toEqual([]);
    });
});

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
