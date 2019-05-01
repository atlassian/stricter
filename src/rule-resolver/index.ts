import { ConfigRules, RuleApplications } from './../types';
import getRuleApplications from './get-rule-applications';
import filterRuleDefinitions from './filter-rule-definitions';
import getRuleDefinitions from './get-rule-definitions';

export default (
    rules: ConfigRules,
    rulesDir: string | string[] | undefined,
    pluginNames: string[] | undefined,
    rulesToVerify: string[] | undefined,
): RuleApplications => {
    const ruleDefinitions = getRuleDefinitions(rules, rulesDir, pluginNames);
    const filteredRuleDefinitions = filterRuleDefinitions(ruleDefinitions, rulesToVerify);
    const ruleApplications = getRuleApplications(rules, filteredRuleDefinitions, rulesToVerify);

    return ruleApplications;
};
