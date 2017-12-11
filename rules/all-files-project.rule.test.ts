import { RuleDefinition } from '../src/types';
const rule: RuleDefinition = require('./all-files-project.rule');

describe('all-files-project rule', () => {
    it('returns passed files', () => {
        const result = rule.onProject(
            null,
            {
                foo: {},
                bar: {},
            },
            null,
        );

        expect(result).toEqual(['foo', 'bar']);
    });
});
