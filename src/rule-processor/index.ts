import getDebug from 'debug';
import type {
    FileData,
    FileToData,
    FileToDependency,
    RuleApplications,
    RuleApplicationResult,
    RuleToRuleApplicationResult,
} from './../types';

import { processRule } from './process-rule';

const debug = getDebug('stricter:rule-processor');

export const processRules = (
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
        debug(`Processing rule ${ruleName}`);
        const usage = Array.isArray(ruleApplication.usage)
            ? ruleApplication.usage
            : [ruleApplication.usage];
        const definition = ruleApplication.definition;

        const ruleApplicationResult = usage
            .map((usage) => processRule(directory, definition, usage, filesData, dependencies))
            .reduce(
                (acc, i) => {
                    acc.errors.push(...i.errors);
                    acc.warnings.push(...i.warnings);
                    acc.time += i.time;
                    acc.fixes.push(...i.fixes);
                    return acc;
                },
                {
                    errors: [],
                    warnings: [],
                    time: 0,
                    fixes: [],
                } as RuleApplicationResult,
            );

        acc[ruleName] = ruleApplicationResult;

        return acc;
    }, {} as RuleToRuleApplicationResult);

    return result;
};
