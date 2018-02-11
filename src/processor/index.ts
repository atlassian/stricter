import { readFile, parse } from './../utils';
import { matchesRuleUsage } from './../rule';
import { default as readDependencies } from './../dependencies';

import {
    FileToData,
    FileToDependency,
    Level,
    RuleDefinition,
    RuleUsage,
    RuleApplications,
    RuleApplicationResult,
    RuleToRuleApplicationResult,
} from './../types';

const readFileData = (filePath: string): FileToData => {
    const source = readFile(filePath);
    // We parse .js-files only at the moment
    const ast = filePath.endsWith('.js') ? () => parse(source) : undefined;

    return {
        [filePath]: Object.freeze({
            source,
            ast,
        }),
    };
};

export const readFilesData = (
    files: string[],
    root: string[],
    extensions: string[] | undefined,
): { filesData: FileToData; dependencies: FileToDependency } => {
    const filesData = Object.freeze(
        files.reduce(
            (acc, filePath) => {
                return {
                    ...acc,
                    ...readFileData(filePath),
                };
            },
            {} as FileToData,
        ),
    );

    const dependencies = readDependencies(filesData, root, extensions);

    return {
        filesData,
        dependencies,
    };
};

const createRuleApplicationResult = (
    messageType: string,
    ruleMessages: string[],
): RuleApplicationResult => {
    let result;

    switch (messageType) {
        case Level.ERROR:
            result = {
                errors: ruleMessages,
            };
            break;
        case Level.OFF:
            result = {
                errors: [],
            };
            break;
        case Level.WARNING:
        default:
            result = {
                warnings: ruleMessages,
            };
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
    const reducedFilesData = Object.freeze(
        Object.keys(filesData)
            .filter(i => matchesRuleUsage(directory, i, ruleUsage))
            .reduce(
                (acc, fileName) => ({
                    ...acc,
                    [fileName]: filesData[fileName],
                }),
                {} as FileToData,
            ),
    );

    const ruleMessages = definition.onProject({
        dependencies,
        config: ruleUsage.config,
        files: reducedFilesData,
        rootPath: directory,
    });
    let messageType = ruleUsage.level;

    if (!messageType || Object.values(Level).indexOf(messageType) === -1) {
        messageType = Level.WARNING;
    }

    const ruleApplicationResult = createRuleApplicationResult(messageType, ruleMessages);

    return ruleApplicationResult;
};

export const applyProjectRules = (
    directory: string,
    filesData: FileToData,
    dependencies: FileToDependency,
    ruleApplications: RuleApplications,
): RuleToRuleApplicationResult => {
    const result = Object.entries(ruleApplications).reduce(
        (acc, [ruleName, ruleApplication]) => {
            const usage = Array.isArray(ruleApplication.usage)
                ? ruleApplication.usage
                : [ruleApplication.usage];
            const definition = ruleApplication.definition;
            let ruleApplicationResult;

            ruleApplicationResult = usage
                .map(usage => processRule(directory, definition, usage, filesData, dependencies))
                .reduce(
                    (acc, i) => ({
                        errors: [...(acc.errors || []), ...(i.errors || [])],
                        warnings: [...(acc.warnings || []), ...(i.warnings || [])],
                    }),
                    {
                        errors: [],
                        warnings: [],
                    } as RuleApplicationResult,
                );

            return {
                ...acc,
                [ruleName]: ruleApplicationResult,
            };
        },
        {} as RuleToRuleApplicationResult,
    );

    return result;
};
