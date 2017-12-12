import { RuleDefinition } from '../src/types';
const rule: RuleDefinition = require('./all-files-project.rule');

describe('all-files-project rule', () => {
    it('returns passed files', () => {
        const result = rule.onProject({
            files: {
                foo: {},
                bar: {},
            },
            dependencies: null,
            rootPath: null,
        });

        expect(result).toEqual(['foo', 'bar']);
    });
});
