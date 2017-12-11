import { RuleDefinition } from '../src/types';
const rule: RuleDefinition = require('./hello-world-project.rule');

describe('hello-world-project rule', () => {
    it('returns a preedefined string', () => {
        const result = rule.onProject(
            null,
            {
                foo: {},
                bar: {},
            },
            null,
        );

        expect(result).toEqual(['Hello stricter world']);
    });
});
