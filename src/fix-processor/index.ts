import type { RuleToRuleApplicationResult, Logger } from './../types';

export const processFixes = (
    applicationResult: RuleToRuleApplicationResult,
    logger: Logger,
): void => {
    Object.entries(applicationResult).forEach(([ruleName, ruleApplicationResult]) => {
        if (!ruleApplicationResult.fixes) {
            return;
        }

        try {
            ruleApplicationResult.fixes.forEach((fix) => fix());
        } catch (e) {
            logger.error(`Failed to apply fixes for ${ruleName}\n${e}`);
        }
    });
};
