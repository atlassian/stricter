import {
    FileToRuleToRuleApplicationResult,
    RuleToRuleApplicationResult,
    LogEntry,
} from './../types';

export const compactFileLogs = (fileResult: FileToRuleToRuleApplicationResult): LogEntry[] => {
    const result = Object.entries(fileResult)
        .reduce(
            (acc, [filePath, ruleResult]) => {
                const result = Object.entries(ruleResult).map(([rule, applicationResult]) => ({
                    filePath,
                    rule,
                    errors: applicationResult.errors,
                    warnings: applicationResult.warnings,
                }));

                return [...acc, ...result];
            },
            [] as LogEntry[],
        )
        .filter(i => (i.warnings && i.warnings.length) || (i.errors && i.errors.length));

    return result;
};

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
