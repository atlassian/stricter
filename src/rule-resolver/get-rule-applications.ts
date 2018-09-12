import { ConfigRules, RuleDefinitions, RuleApplications } from './../types';

export default (
    rules: ConfigRules,
    ruleDefinitions: RuleDefinitions,
    rulesToVerify: string[] | undefined,
): RuleApplications => {
    const usages = Object.keys(rules);
    const result = usages.reduce(
        (acc, ruleName) => {
            if (rulesToVerify && !rulesToVerify.includes(ruleName)) {
                return acc;
            }

            acc[ruleName] = {
                definition: ruleDefinitions[ruleName],
                usage: rules[ruleName],
            };

            return acc;
        },
        {} as RuleApplications,
    );

    return result;
};
