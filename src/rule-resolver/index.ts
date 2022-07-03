import type { ConfigRules, RuleApplications } from './../types';
import { getRuleApplications } from './get-rule-applications';
import { filterRuleDefinitions } from './filter-rule-definitions';
import { getRuleDefinitions } from './get-rule-definitions';

export const resolveRules = async (
    rules: ConfigRules,
    rulesDir: string | string[] | undefined,
    pluginNames: string[] | undefined,
    rulesToVerify: string[] | undefined,
): Promise<RuleApplications> => {
    const ruleDefinitions = await getRuleDefinitions(rules, rulesDir, pluginNames);
    const filteredRuleDefinitions = filterRuleDefinitions(ruleDefinitions, rulesToVerify);
    return getRuleApplications(rules, filteredRuleDefinitions, rulesToVerify);
};
