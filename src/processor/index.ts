import matchesRuleUsage from './../utils/matches-rule-usage';

import {
    FileData,
    FileToData,
    FileToDependency,
    Level,
    RuleDefinition,
    RuleUsage,
    RuleApplications,
    RuleApplicationResult,
    RuleToRuleApplicationResult,
} from './../types';

const createRuleApplicationResult = (
    messageType: string,
    ruleMessages: string[],
    time: number,
): RuleApplicationResult => {
    const result: RuleApplicationResult = {
        time,
        warnings: [],
        errors: [],
    };

    switch (messageType) {
        case Level.ERROR:
            result.errors = ruleMessages;
            break;
        case Level.OFF:
            break;
        case Level.WARNING:
        default:
            result.warnings = ruleMessages;
    }

    return result;
};

const processRule = (
    directory: string,
    definition: RuleDefinition,
    ruleUsage: RuleUsage,
    filesData: FileToData,
    dependencies: FileToDependency,
) => {
    const startTime = process.hrtime();

    const reducedFilesData = Object.keys(filesData)
        .filter(i => matchesRuleUsage(directory, i, ruleUsage))
        .reduce(
            (acc, fileName) => {
                acc[fileName] = filesData[fileName];
                return acc;
            },
            {} as FileToData,
        );

    const ruleMessages = definition.onProject({
        dependencies,
        config: ruleUsage.config,
        include: ruleUsage.include,
        exclude: ruleUsage.exclude,
        files: reducedFilesData,
        rootPath: directory,
    });

    const elapsedTime = process.hrtime(startTime);
    const timeInMs = elapsedTime[0] * 1e3 + elapsedTime[1] / 1e6;

    let messageType = ruleUsage.level;

    if (!messageType || Object.values(Level).indexOf(messageType) === -1) {
        messageType = Level.WARNING;
    }

    const ruleApplicationResult = createRuleApplicationResult(messageType, ruleMessages, timeInMs);

    return ruleApplicationResult;
};

export const applyProjectRules = (
    directory: string,
    filesData: FileToData,
    ruleApplications: RuleApplications,
): RuleToRuleApplicationResult => {
    const dependencies = Object.entries(filesData)
        .filter(([, fileData]: [string, FileData]) => !!fileData.dependencies)
        .reduce(
            (acc, [fileName, fileData]: [string, FileData]) => {
                acc[fileName] = fileData.dependencies as string[];
                return acc;
            },
            {} as FileToDependency,
        );

    const result = Object.entries(ruleApplications).reduce(
        (acc, [ruleName, ruleApplication]) => {
            const usage = Array.isArray(ruleApplication.usage)
                ? ruleApplication.usage
                : [ruleApplication.usage];
            const definition = ruleApplication.definition;

            const ruleApplicationResult = usage
                .map(usage => processRule(directory, definition, usage, filesData, dependencies))
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
        },
        {} as RuleToRuleApplicationResult,
    );

    return result;
};
