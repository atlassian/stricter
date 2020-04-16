import { RuleToRuleApplicationResult, LogEntry } from './../types';

export const compactProjectLogs = (projectResult: RuleToRuleApplicationResult): LogEntry[] => {
    const result = Object.entries(projectResult)
        .map(([rule, applicationResult]) => ({
            rule,
            errors: applicationResult.errors,
            warnings: applicationResult.warnings,
            time: applicationResult.time,
        }))
        .filter((i) => i.warnings.length || i.errors.length);

    return result;
};
