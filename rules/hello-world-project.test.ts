import { RuleDefinition } from '../src/types';
const rule: RuleDefinition = require('./hello-world-project');

describe('consoleLogger', () => {
    it('runs warn for every warning', () => {
        const result = rule.onProject(
            {
                foo: {},
                bar: {},
            },
            null,
        );

        expect(result).toEqual(['Hello stricter world']);
    });
});
