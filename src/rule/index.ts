import * as path from 'path';
import { listFiles } from './../utils';
import { Config, RuleApplications, RuleDefinition, RuleDefinitions, RuleUsage } from './../types';
import { unusedFilesRule } from './default-rules';

export const defaultRules: RuleDefinitions = {
    'stricter/unused-files': unusedFilesRule,
};

export const RULE_SUFFIX = '.rule';

const stripOutSuffix = (str: string): string => {
    return str.substring(0, str.length - RULE_SUFFIX.length);
};

export const getRuleDefinitions = (config: Config): RuleDefinitions => {
    if (!config.rulesDir) {
        return defaultRules;
    }

    const ruleFiles = listFiles(config.rulesDir).filter(i => i.endsWith(`${RULE_SUFFIX}.js`));
    const customRules = ruleFiles.reduce(
        (acc, filePath: string) => {
            const ruleName = path.basename(filePath, path.extname(filePath));
            const rule = require(filePath);
            if (!rule.onProject) {
                throw new Error(`Rule ${ruleName} should have onProject.`);
            }

            return {
                ...acc,
                [stripOutSuffix(ruleName)]: rule as RuleDefinition,
            };
        },
        {} as RuleDefinitions,
    );

    return { ...defaultRules, ...customRules };
};

export const getRuleApplications = (
    config: Config,
    ruleDefinitions: RuleDefinitions,
): RuleApplications => {
    const usages = Object.keys(config.rules);
    const notExistingRules = usages.filter(i => !ruleDefinitions[i]);

    if (notExistingRules.length) {
        throw new Error(
            `Unable to find definitions for following rules:\r\n${notExistingRules.join('\r\n')}`,
        );
    }

    const result = usages.reduce(
        (acc, ruleName) => {
            return {
                ...acc,
                [ruleName]: {
                    definition: ruleDefinitions[ruleName],
                    usage: config.rules[ruleName],
                },
            };
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

const checkForRegex = (setting: string | string[], filePath: string) => {
    if (typeof setting === 'string') {
        return new RegExp(setting).test(filePath);
    }

    if (Array.isArray(setting)) {
        return setting.some(i => new RegExp(i).test(filePath));
    }

    return false;
};

export const matchesRuleUsage = (
    directory: string,
    filePath: string,
    ruleUsage: RuleUsage,
): boolean => {
    const relativePath = filePath.replace(directory + path.sep, '');
    const matchesInclude = !ruleUsage.include || checkForRegex(ruleUsage.include, relativePath);
    const matchesExclude = ruleUsage.exclude && checkForRegex(ruleUsage.exclude, relativePath);

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
