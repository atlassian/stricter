import { RuleDefinition } from '../src/types';
const rule: RuleDefinition = require('./all-files-project');

describe('consoleLogger', () => {
    it('runs warn for every warning', () => {
        const result = rule.onProject({
            foo: {},
            bar: {},
        });

        expect(result).toEqual(['foo', 'bar']);
    });
});
