import { matchesRuleUsage } from './../utils/matches-rule-usage';
import type { RuleUsage } from './../types';

export const filterFiles = (files: string[], directory: string, ruleUsage: RuleUsage): string[] => {
    const result = files.filter((file) => matchesRuleUsage(directory, file, ruleUsage));

    return result;
};
