import { RuleDefinition } from '../src/types';
const rule: RuleDefinition = require('./all-dependants.rule');

describe('all-dependants rule', () => {
    it('returns passed files', () => {
        const file1 = 'file1';
        const file2 = 'file2';
        const file3 = 'file3';

        const result = rule.onProject({
            files: {},
            dependencies: {
                [file1]: [file2],
                [file3]: [file2],
            },
            rootPath: null,
        });

        expect(result).toEqual([JSON.stringify({ [file2]: [file1, file3] })]);
    });
});
