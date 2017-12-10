import * as path from 'path';
import { listFiles } from './../utils';
import { Config, RuleApplications, RuleDefinition, RuleDefinitions, RuleUsage } from './../types';

export const defaultRules: RuleDefinitions = {};

export const getRuleDefinitions = (config: Config): RuleDefinitions => {
    if (!config.rulesDir) {
        return defaultRules;
    }

    const ruleFiles = listFiles(config.rulesDir).filter(i => i.endsWith('.js'));
    const customRules = ruleFiles.reduce(
        (acc, filePath: string) => {
            const ruleName = path.basename(filePath, path.extname(filePath));

            const rule = require(filePath);

            if ((!rule.onFile && !rule.onProject) || (rule.onFile && rule.onProject)) {
                throw new Error(
                    `Rule ${ruleName} has both onFile and onProject. Should be only one of them.`,
                );
            }

            return {
                ...acc,
                [ruleName]: rule as RuleDefinition,
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

const matchesRuleUsage = (filePath: string, ruleUsage: RuleUsage): boolean => {
    const matchesInclude = !ruleUsage.include || new RegExp(ruleUsage.include).test(filePath);
    const matchesExclude = ruleUsage.exclude && new RegExp(ruleUsage.exclude).test(filePath);

    return matchesInclude && !matchesExclude;
};

export const filterFilesToProcess = (
    files: string[],
    ruleApplications: RuleApplications,
): string[] => {
    const ruleUsages = getRuleUsages(ruleApplications);
    const result = files.filter(i => ruleUsages.some(j => matchesRuleUsage(i, j)));

    return result;
};
