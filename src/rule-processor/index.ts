import {
    FileData,
    FileToData,
    FileToDependency,
    RuleApplications,
    RuleApplicationResult,
    RuleToRuleApplicationResult,
} from './../types';

import processRule from './process-rule';

export default (
    directory: string,
    filesData: FileToData,
    ruleApplications: RuleApplications,
): RuleToRuleApplicationResult => {
    const dependencies = Object.entries(filesData)
        .filter(([, fileData]: [string, FileData]) => !!fileData.dependencies)
        .reduce((acc, [fileName, fileData]: [string, FileData]) => {
            acc[fileName] = fileData.dependencies as string[];
            return acc;
        }, {} as FileToDependency);

    const result = Object.entries(ruleApplications).reduce((acc, [ruleName, ruleApplication]) => {
        const usage = Array.isArray(ruleApplication.usage)
            ? ruleApplication.usage
            : [ruleApplication.usage];
        const definition = ruleApplication.definition;

        const ruleApplicationResult = usage
            .map((usage) => processRule(directory, definition, usage, filesData, dependencies))
            .reduce(
                (acc, i) => ({
                    errors: acc.errors.concat(i.errors),
                    warnings: acc.warnings.concat(i.warnings),
                    time: acc.time + i.time,
                }),
                {
                    errors: [],
                    warnings: [],
                    time: 0,
                } as RuleApplicationResult,
            );

        acc[ruleName] = ruleApplicationResult;

        return acc;
    }, {} as RuleToRuleApplicationResult);

    return result;
};
