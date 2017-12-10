import { readFile, parse } from './../utils';
import { matchesRuleUsage } from './../rule';

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
    const contents = readFile(filePath);
    // We parse .js-files only at the moment
    const ast = filePath.endsWith('.js') ? parse(contents) : null;

    return {
        [filePath]: Object.freeze({
            contents,
            ast,
        }),
    };
};

export const readFilesData = (files: string[]): FileToData => {
    const result = Object.freeze(
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

    return result;
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
        case Level.WARNING:
        default:
            result = {
                warnings: ruleMessages,
            };
    }

    return result;
};

const processRule = (
    definition: RuleDefinition,
    ruleUsage: RuleUsage,
    filesData: FileToData,
    dependencies: FileToDependency,
) => {
    const messageType = ruleUsage.level;

    if (!messageType || Object.values(Level).indexOf(messageType) === -1) {
        return {};
    }

    const reducedFilesData = Object.freeze(
        Object.keys(filesData)
            .filter(i => matchesRuleUsage(i, ruleUsage))
            .reduce(
                (acc, fileName) => ({
                    ...acc,
                    [fileName]: filesData[fileName],
                }),
                {} as FileToData,
            ),
    );

    const ruleMessages = definition.onProject(ruleUsage.config, reducedFilesData, dependencies);
    const ruleApplicationResult = createRuleApplicationResult(messageType, ruleMessages);

    return ruleApplicationResult;
};

export const applyProjectRules = (
    filesData: FileToData,
    dependencies: FileToDependency,
    ruleApplications: RuleApplications,
): RuleToRuleApplicationResult => {
    const result = Object.entries(ruleApplications).reduce(
        (acc, [ruleName, ruleApplication]) => {
            const usage = ruleApplication.usage;
            const definition = ruleApplication.definition;
            let ruleApplicationResult;

            if (Array.isArray(usage)) {
                ruleApplicationResult = usage
                    .map(usage => processRule(definition, usage, filesData, dependencies))
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
            } else {
                ruleApplicationResult = processRule(definition, usage, filesData, dependencies);
            }

            return {
                ...acc,
                [ruleName]: ruleApplicationResult,
            };
        },
        {} as RuleToRuleApplicationResult,
    );

    return result;
};

export { default as readDependencies } from './read-dependencies';
