import * as path from 'path';
import { EOL } from 'os';
import { listFiles, getMatcher } from './../utils';
import { Config, RuleApplications, RuleDefinitions, RuleUsage } from './../types';
import { unusedFilesRule } from './default-rules';

export const defaultRules: RuleDefinitions = {
    'stricter/unused-files': unusedFilesRule,
};

export const RULE_SUFFIX = '.rule.js';

const stripOutSuffix = (str: string): string => {
    return str.substring(0, str.length - RULE_SUFFIX.length);
};

export const getRuleDefinitions = (config: Config): RuleDefinitions => {
    if (!config.rulesDir) {
        return defaultRules;
    }

    const rulesUsed = Object.keys(config.rules);
    const ruleFiles = listFiles(config.rulesDir).filter(i => i.endsWith(RULE_SUFFIX));
    const customRules = ruleFiles.reduce(
        (acc, filePath: string) => {
            const ruleName = stripOutSuffix(path.basename(filePath));

            if (!rulesUsed.includes(ruleName)) {
                return acc;
            }

            const rule = require(filePath);

            if (!rule.onProject) {
                throw new Error(`Rule ${ruleName} should have onProject.`);
            }

            acc[ruleName] = rule;

            return acc;
        },
        {} as RuleDefinitions,
    );

    const foundRules = Object.keys(customRules);
    const notExistingRules = rulesUsed.filter(ruleName => !foundRules.includes(ruleName));

    if (notExistingRules.length) {
        throw new Error(
            `Unable to find definitions for following rules:${EOL}${notExistingRules.join(EOL)}`,
        );
    }

    return { ...defaultRules, ...customRules };
};

export const filterRuleDefinitions = (
    rules: RuleDefinitions,
    rulesToVerify: string[] | undefined,
): RuleDefinitions => {
    if (!rulesToVerify || !rulesToVerify.length) {
        return rules;
    }

    const result = Object.entries(rules).reduce(
        (acc, [ruleName, ruleDefinition]) => {
            if (!rulesToVerify.includes(ruleName)) {
                return acc;
            }

            acc[ruleName] = ruleDefinition;

            return acc;
        },
        {} as RuleDefinitions,
    );

    return result;
};

export const getRuleApplications = (
    config: Config,
    ruleDefinitions: RuleDefinitions,
    rulesToVerify: string[] | undefined,
): RuleApplications => {
    const usages = Object.keys(config.rules);
    const result = usages.reduce(
        (acc, ruleName) => {
            if (rulesToVerify && !rulesToVerify.includes(ruleName)) {
                return acc;
            }

            acc[ruleName] = {
                definition: ruleDefinitions[ruleName],
                usage: config.rules[ruleName],
            };

            return acc;
        },
        {} as RuleApplications,
    );

    return result;
};

const getRuleUsages = (ruleApplications: RuleApplications): RuleUsage[] => {
    return Object.values(ruleApplications).reduce(
        (acc, i) => {
            if (Array.isArray(i.usage)) {
                return [...acc, ...i.usage];
            }

            return [...acc, i.usage];
        },
        [] as RuleUsage[],
    );
};

export const matchesRuleUsage = (
    directory: string,
    filePath: string,
    ruleUsage: RuleUsage,
): boolean => {
    const relativePath = filePath.replace(directory + path.sep, '');
    const matchesInclude = !ruleUsage.include || getMatcher(ruleUsage.include)(relativePath);
    const matchesExclude = ruleUsage.exclude && getMatcher(ruleUsage.exclude)(relativePath);

    return matchesInclude && !matchesExclude;
};

export const filterFilesToProcess = (
    directory: string,
    files: string[],
    ruleApplications: RuleApplications,
): string[] => {
    const ruleUsages = getRuleUsages(ruleApplications);
    const result = files.filter(i => ruleUsages.some(j => matchesRuleUsage(directory, i, j)));

    return result;
};
