import { filterRuleDefinitions } from './filter-rule-definitions';

describe('filterRuleDefinitions', () => {
    it('returns rules if no filter is specified', () => {
        const rules = {};
        const result = filterRuleDefinitions(rules, undefined);
        expect(result).toBe(rules);
    });

    it('filters rules', () => {
        const rules = {
            rule1: {
                onProject: () => [],
            },
            rule2: {
                onProject: () => [],
            },
        };

        const result = filterRuleDefinitions(rules, ['rule2']);
        expect(result).toEqual({
            rule2: rules.rule2,
        });
    });
});
