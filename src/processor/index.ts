import { readFile, parse } from './../utils';
import { FileToData, Level, RuleToRuleApplicationResult, RuleApplications } from './../types';

const readFileData = (filePath: string): FileToData => {
    const contents = readFile(filePath);
    // We parse .js-files only at the moment
    const ast = filePath.endsWith('.js') ? parse(contents) : null;

    return {
        [filePath]: {
            contents,
            ast,
        },
    };
};

export const readFilesData = (files: string[]): FileToData => {
    const result = files.reduce(
        (acc, filePath) => {
            return {
                ...acc,
                ...readFileData(filePath),
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
