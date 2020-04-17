import type { RuleToRuleApplicationResult } from './../types';

export default (applicationResult: RuleToRuleApplicationResult) => {
    Object.entries(applicationResult).forEach(([ruleName, ruleApplicationResult]) => {
        if (!ruleApplicationResult.fixes) {
            return;
        }

        try {
            ruleApplicationResult.fixes.forEach((fix) => fix());
        } catch (e) {
            console.error(`Failed to apply fixes for ${ruleName}\n${e}`);
        }
    });
};
