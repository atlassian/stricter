import chalk from 'chalk';
import { FileToRuleToRuleApplicationResult, RuleToRuleApplicationResult } from './types';

export const consoleLogger = (
    fileResult: FileToRuleToRuleApplicationResult,
    projectResult: RuleToRuleApplicationResult,
): void => {
    Object.entries(fileResult).forEach(([fileName, ruleResult]) => {
        console.log(fileName);
        logRuleApplicationResult(ruleResult);
    });

    logRuleApplicationResult(projectResult);
};

export const logRuleApplicationResult = (result: RuleToRuleApplicationResult): void => {
    const entries = Object.entries(result);

    entries.forEach(([ruleName, applicationResult]) => {
        if (!applicationResult.warnings) {
            return;
        }

        applicationResult.warnings.forEach(warning => {
            console.warn(chalk.yellow('warning: ') + ruleName + ' ' + warning);
        });
    });

    entries.forEach(([ruleName, applicationResult]) => {
        if (!applicationResult.errors) {
            return;
        }

        applicationResult.errors.forEach(error => {
            console.warn(chalk.red('error: ') + ruleName + ' ' + error);
        });
    });
};
