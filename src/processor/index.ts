import { readFile, parse } from './../utils';
import { matchesRuleUsage } from './../rule';
import { readDependencies } from './../dependencies';

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

const readFileData = (filePath: string): FileData => {
    const source = readFile(filePath);
    // We parse .js-files only at the moment
    const ast = filePath.endsWith('.js') ? () => parse(source) : undefined;
    let dependencies: string[] | undefined;

    if (ast) {
        try {
            const parsedAst = ast();
            dependencies = readDependencies(parsedAst, filePath);
        } catch (e) {
            console.error(`Unable to parse ${filePath}`);
            throw e;
        }
    }

    return Object.freeze({
        source,
        ast,
        dependencies,
    });
};

export const readFilesData = (files: string[]): FileToData => {
    const filesData = Object.freeze(
        files.reduce(
            (acc, filePath) => {
                acc[filePath] = readFileData(filePath);

                return acc;
            },
            {} as FileToData,
        ),
    );

    return filesData;
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
    ruleApplications: RuleApplications,
): RuleToRuleApplicationResult => {
    const dependencies = Object.entries(filesData)
        .filter(([fileName, fileData]: [string, FileData]) => !!fileData.dependencies)
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

            acc[ruleName] = ruleApplicationResult;

            return acc;
        },
        {} as RuleToRuleApplicationResult,
    );

    return result;
};
