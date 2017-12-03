import { readFile, parse } from './../utils';
import {
    FileToData,
    FileToRule,
    FileToRuleToRuleApplicationResult,
    Level,
    RuleRequirement,
    RuleToRuleApplicationResult,
    RuleApplications,
    RuleUsage,
} from './../types';

const matchesRuleUsage = (filePath: string, ruleUsage: RuleUsage): boolean => {
    const matchesInclude = !ruleUsage.include || new RegExp(ruleUsage.include).test(filePath);
    const matchesExclude = ruleUsage.exclude && new RegExp(ruleUsage.exclude).test(filePath);

    return matchesInclude && !matchesExclude;
};

const readFileData = (filePath: string, requirement: RuleRequirement): FileToData => {
    if (requirement === RuleRequirement.NONE) {
        return {
            [filePath]: {},
        };
    }

    const contents = readFile(filePath);

    if (requirement === RuleRequirement.CONTENTS) {
        return {
            [filePath]: {
                contents,
            },
        };
    }

    const ast = parse(contents);

    return {
        [filePath]: {
            contents,
            ast,
        },
    };
};

export const mapFilesToRules = (
    fileList: string[],
    ruleApplications: RuleApplications,
): FileToRule => {
    const result = fileList.reduce(
        (acc, filePath) => {
            const matchingRuleApplications = Object.entries(ruleApplications)
                .filter(([name, application]) => {
                    const ruleUsage = application.usage;
                    const ruleDefinition = application.definition;

                    return (
                        ruleDefinition.onFile &&
                        ((Array.isArray(ruleUsage) &&
                            ruleUsage.some(i => matchesRuleUsage(filePath, i))) ||
                            (!Array.isArray(ruleUsage) && matchesRuleUsage(filePath, ruleUsage)))
                    );
                })
                .reduce(
                    (acc, [name, application]) => ({
                        ...acc,
                        [name]: application,
                    }),
                    {} as RuleApplications,
                );

            return {
                ...acc,
                [filePath]: matchingRuleApplications,
            };
        },
        {} as FileToRule,
    );

    return result;
};

export const readFilesData = (filesToRules: FileToRule): FileToData => {
    const result = Object.entries(filesToRules).reduce(
        (acc, [filePath, ruleDefinitions]) => {
            const requirements = Object.values(ruleDefinitions).map(i => i.definition.requirement);
            const requirement: RuleRequirement =
                requirements.indexOf(RuleRequirement.AST) !== -1
                    ? RuleRequirement.AST
                    : requirements.indexOf(RuleRequirement.CONTENTS) !== -1
                      ? RuleRequirement.CONTENTS
                      : RuleRequirement.NONE;

            return {
                ...acc,
                ...readFileData(filePath, requirement),
            };
        },
        {} as FileToData,
    );

    return result;
};

const createRuleApplicationResult = (messageType: string, ruleMessages: string[]) => {
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

export const applyFileRules = (
    filesData: FileToData,
    filesToRules: FileToRule,
): FileToRuleToRuleApplicationResult => {
    const result = Object.entries(filesData).reduce(
        (acc, [filePath, fileData]) => {
            const ruleApplications = filesToRules[filePath];

            const rulesApplicationResults = Object.entries(ruleApplications).reduce(
                (acc, [ruleName, rule]) => {
                    const ruleUsage = rule.usage;
                    const messageType = !Array.isArray(ruleUsage)
                        ? ruleUsage.level
                        : ruleUsage.filter(i => matchesRuleUsage(filePath, i))[0].level;

                    if (!messageType || Object.values(Level).indexOf(messageType) === -1) {
                        return {};
                    }

                    const ruleMessages = rule.definition.onFile(fileData);
                    const ruleApplicationResult = createRuleApplicationResult(
                        messageType,
                        ruleMessages,
                    );

                    const result = {
                        ...acc,
                        [ruleName]: ruleApplicationResult,
                    };

                    return result;
                },
                {} as RuleToRuleApplicationResult,
            );

            return {
                ...acc,
                [filePath]: rulesApplicationResults,
            };
        },
        {} as FileToRuleToRuleApplicationResult,
    );

    return result;
};

export const applyProjectRules = (
    filesData: FileToData,
    ruleApplications: RuleApplications,
): RuleToRuleApplicationResult => {
    const result = Object.entries(ruleApplications)
        .filter(([ruleName, ruleApplication]) => ruleApplication.definition.onProject)
        .reduce(
            (acc, [ruleName, ruleApplication]) => {
                const ruleUsage = ruleApplication.usage;
                const messageType = !Array.isArray(ruleUsage)
                    ? ruleUsage.level
                    : ruleUsage[0].level;

                if (!messageType || Object.values(Level).indexOf(messageType) === -1) {
                    return {};
                }

                const ruleMessages = ruleApplication.definition.onProject(filesData);
                const ruleApplicationResult = createRuleApplicationResult(
                    messageType,
                    ruleMessages,
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
