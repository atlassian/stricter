import * as path from 'path';
import { listFiles } from './utils';
import { Config, RuleDefinitions } from './types';

const defaultRules: RuleDefinitions = {};

export const getRuleDefinitions = (config: Config): RuleDefinitions => {
    if (!config.rulesDir) {
        return defaultRules;
    }

    const ruleFiles = listFiles(config.rulesDir);
    const customRules: RuleDefinitions = ruleFiles.reduce((acc: RuleDefinitions, filePath: string) => {
        const ruleName = path.basename(filePath, path.extname(filePath));

        return {
            ...acc,
            [ruleName]: require(filePath),
        };
    }, {});

    return { ...defaultRules, ...customRules };
};

export const validateRuleDefinitions = (config: Config, ruleDefinitions: RuleDefinitions) => {
    const usages = Object.keys(config.rules);
    const notExistingRules = usages.filter(i => !ruleDefinitions[i]);

    if (notExistingRules.length) {
        throw new Error(`Unable to find definitions for following rules:\r\n${notExistingRules.join('\r\n')}`);
    }
};
