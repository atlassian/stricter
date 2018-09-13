import matchesRuleUsage from './../utils/matches-rule-usage';
import { RuleUsage } from './../types';

export default (files: string[], directory: string, ruleUsage: RuleUsage): string[] => {
    const result = files.filter(file => matchesRuleUsage(directory, file, ruleUsage));

    return result;
};
