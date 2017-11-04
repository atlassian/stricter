import { listFiles, readFile, parse } from './utils';
import {
    Config,
    FileToData,
    FileToRule,
    RuleApplicationResults,
    RuleDefinitions,
    RuleRequirement,
    RuleUsage,
} from './types';

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

    const ast = parse(filePath, contents);

    return {
        [filePath]: {
            contents,
            ast,
        },
    };
};

export const mapFilesToRules = (config: Config, ruleDefinitions: RuleDefinitions): FileToRule => {
    if (!config.rules) {
        return {};
    }

    const fileList = listFiles(config.root);
    const ruleNames = Object.keys(config.rules);

    const result = fileList.reduce((acc, filePath) => {
        const matchingRuleDefinitions = ruleNames
            .filter((name: string) => {
                const ruleUsage = config.rules[name];

                return (
                    (Array.isArray(ruleUsage) && ruleUsage.some(i => matchesRuleUsage(filePath, i))) ||
                    (!Array.isArray(ruleUsage) && matchesRuleUsage(filePath, ruleUsage))
                );
            })
            .map(i => ruleDefinitions[i]);

        return {
            ...acc,
            [filePath]: matchingRuleDefinitions,
        };
    }, {});

    return result;
};

export const readFilesData = (filesToRules: FileToRule): FileToData => {
    const result = Object.entries(filesToRules).reduce((acc, [filePath, ruleDefinitions]) => {
        const requirements = Object.values(ruleDefinitions).map(i => i.requirement);
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
    }, {});

    return result;
};

export const applyRules = (filesData: FileToData, filesToRules: FileToRule): RuleApplicationResults => {
    const result = Object.entries(filesData).reduce((acc, [filePath, fileData]) => {
        const ruleDefinitions = filesToRules[filePath];

        const rulesApplicationResults = Object.entries(ruleDefinitions).reduce((acc, [ruleName, rule]) => {
            const ruleApplicationResult = rule.onFile(fileData);
            return {
                ...acc,
                [ruleName]: ruleApplicationResult,
            };
        }, {});

        return {
            ...acc,
            [filePath]: rulesApplicationResults,
        };
    }, {});

    return result;
};
