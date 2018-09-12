import * as path from 'path';
import { EOL } from 'os';
import { listFiles } from './../utils';
import { RuleDefinitions, ConfigRules } from './../types';
import defaultRules from '../default-rules';

export const RULE_SUFFIX = '.rule.js';

const stripOutSuffix = (str: string): string => {
    return str.substring(0, str.length - RULE_SUFFIX.length);
};

export default (rules: ConfigRules, rulesDir?: string | undefined): RuleDefinitions => {
    const rulesToResolve = Object.keys(rules);
    let allRulesResolved: RuleDefinitions = {};

    if (rulesDir) {
        const customRuleFiles = listFiles(rulesDir).filter(i => i.endsWith(RULE_SUFFIX));
        allRulesResolved = customRuleFiles.reduce(
            (acc, filePath: string) => {
                const ruleName = stripOutSuffix(path.basename(filePath));

                if (!rulesToResolve.includes(ruleName)) {
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
    }

    allRulesResolved = Object.entries(defaultRules).reduce((acc, [ruleName, rule]) => {
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
