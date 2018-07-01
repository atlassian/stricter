import * as path from 'path';
import { listFiles, getMatcher } from './../utils';
import { Config, RuleApplications, RuleDefinitions, RuleUsage } from './../types';
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
            acc[stripOutSuffix(ruleName)] = rule;

            return acc;
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
