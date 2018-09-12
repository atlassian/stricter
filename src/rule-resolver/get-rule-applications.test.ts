import getRuleApplications from './get-rule-applications';

describe('getRuleApplications', () => {
    it('merges definition and usage', () => {
        const rule1Usage = {};
        const rule2Usage = {};

        const rules = {
            rule1: rule1Usage,
            rule2: rule2Usage,
        };

        const rule1 = {
            onProject: () => [],
        };
        const rule2 = {
            onProject: () => [],
        };

        const ruleDefinitions = {
            rule1,
            rule2,
        };

        const result = getRuleApplications(rules, ruleDefinitions, undefined);

        expect(result).toEqual({
            rule1: {
                definition: rule1,
                usage: rule1Usage,
            },
            rule2: {
                definition: rule2,
                usage: rule2Usage,
            },
        });
    });

    it('filters unused rules', () => {
        const rules = {
            rule1: {},
            rule2: {},
        };

        const rule = {
            onProject: () => [],
        };

        const ruleDefinitions = {
            rule1: rule,
            rule2: rule,
        };

        const result = getRuleApplications(rules, ruleDefinitions, ['rule2']);

        expect(Object.keys(result)).toEqual(['rule2']);
    });
});
