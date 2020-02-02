import * as path from 'path';
import { EOL } from 'os';
import { listFiles } from './../utils';
import { RuleDefinitions, ConfigRules } from './../types';
import defaultRules from '../default-rules';
import getPluginRuleDefinitions from './get-plugin-rule-definitions';

export const RULE_SUFFIX = '.rule.js';

const stripOutSuffix = (str: string): string => {
    return str.substring(0, str.length - RULE_SUFFIX.length);
};

export default (
    rules: ConfigRules,
    rulesDir?: string | string[] | undefined,
    pluginNames?: string[] | undefined,
): RuleDefinitions => {
    const rulesToResolve = Object.keys(rules);
    let allRulesResolved: RuleDefinitions = {};

    if (rulesDir) {
        const rulesDirArr = Array.isArray(rulesDir) ? rulesDir : [rulesDir];

        const customRuleFiles = rulesDirArr.reduce(
            (acc, dir) => [...acc, ...listFiles(dir).filter(i => i.endsWith(RULE_SUFFIX))],
            [] as string[],
        );
        allRulesResolved = customRuleFiles.reduce((acc, filePath: string) => {
            const ruleName = stripOutSuffix(path.basename(filePath));

            if (!rulesToResolve.includes(ruleName)) {
                return acc;
            }

            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const rule = require(filePath);

            if (!rule.onProject) {
                throw new Error(`Rule ${ruleName} should have onProject.`);
            }

            acc[ruleName] = rule;

            return acc;
        }, {} as RuleDefinitions);
    }

    const pluginRules = pluginNames ? getPluginRuleDefinitions(pluginNames) : {};

    const externalRules = { ...defaultRules, ...pluginRules };

    allRulesResolved = Object.entries(externalRules).reduce((acc, [ruleName, rule]) => {
        if (!rulesToResolve.includes(ruleName)) {
            return acc;
        }

        acc[ruleName] = rule;

        return acc;
    }, allRulesResolved);

    const foundRules = Object.keys(allRulesResolved);
    const notExistingRules = rulesToResolve.filter(ruleName => !foundRules.includes(ruleName));

    if (notExistingRules.length) {
        throw new Error(
            `Unable to find definitions for following rules:${EOL}${notExistingRules.join(EOL)}`,
        );
    }

    return allRulesResolved;
};
