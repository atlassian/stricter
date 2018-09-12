import { RuleUsage, RuleApplications } from './../types';
import matchesRuleUsage from './../utils/matches-rule-usage';

const getRuleUsages = (ruleApplications: RuleApplications): RuleUsage[] => {
    return Object.values(ruleApplications).reduce(
        (acc, i) => (Array.isArray(i.usage) ? acc.concat(i.usage) : acc.concat([i.usage])),
        [] as RuleUsage[],
    );
};

export default (root: string, files: string[], ruleApplications: RuleApplications): string[] => {
    const ruleUsages = getRuleUsages(ruleApplications);
    const result = files.filter(file =>
        ruleUsages.some(usage => matchesRuleUsage(root, file, usage)),
    );

    return result;
};
