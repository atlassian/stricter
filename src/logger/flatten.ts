import { RuleToRuleApplicationResult, LogEntry } from './../types';

export const compactProjectLogs = (projectResult: RuleToRuleApplicationResult): LogEntry[] => {
    const result = Object.entries(projectResult)
        .map(([rule, applicationResult]) => ({
            rule,
            errors: applicationResult.errors,
            warnings: applicationResult.warnings,
        }))
        .filter(i => (i.warnings && i.warnings.length) || (i.errors && i.errors.length));

    return result;
};
