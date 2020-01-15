import { ConfigRules, RuleDefinitions, RuleApplications } from './../types';

const applyFilter = (ruleNames: string[], filter: string[] | undefined) => {
    if (!filter) {
        return ruleNames;
    }

    return ruleNames.filter(ruleName => filter.includes(ruleName));
};

export default (
    rules: ConfigRules,
    ruleDefinitions: RuleDefinitions,
    filter: string[] | undefined,
): RuleApplications => {
    const usages = applyFilter(Object.keys(rules), filter);
    const result = usages.reduce((acc, ruleName) => {
        acc[ruleName] = {
            definition: ruleDefinitions[ruleName],
            usage: rules[ruleName],
        };

        return acc;
    }, {} as RuleApplications);

    return result;
};
