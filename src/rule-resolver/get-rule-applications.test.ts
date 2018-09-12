import getRuleApplications from './get-rule-applications';

describe('getRuleApplications', () => {
    it('throws if non-existing rules found', () => {
        const rule1Usage = {
            include: /rule1/,
        };

        const rule2Usage = {
            exclude: /rule2/,
        };

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
});
