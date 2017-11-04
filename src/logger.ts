import chalk from 'chalk';
import { FileToRuleToRuleApplicationResult, RuleToRuleApplicationResult } from './types';

export const consoleLogger = (
    fileResult: FileToRuleToRuleApplicationResult,
    projectResult: RuleToRuleApplicationResult,
): void => {
    console.log(chalk.bgBlackBright('Files'));
    Object.entries(fileResult).forEach(([fileName, ruleResult]) => {
        console.log(fileName);
        logRuleApplicationResult(ruleResult);
    });

    console.log(chalk.bgBlackBright('Project'));
    logRuleApplicationResult(projectResult);
};

export const logRuleApplicationResult = (result: RuleToRuleApplicationResult): void => {
    const entries = Object.entries(result);

    entries.forEach(([ruleName, applicationResult]) => {
        if (!applicationResult.warnings) {
            return;
        }

        applicationResult.warnings.forEach(warning => {
            console.warn(chalk.yellow('warning: ') + chalk.gray(ruleName) + ' ' + warning);
        });
    });

    entries.forEach(([ruleName, applicationResult]) => {
        if (!applicationResult.errors) {
            return;
        }

        applicationResult.errors.forEach(error => {
            console.warn(chalk.red('error: ') + chalk.gray(ruleName) + ' ' + error);
        });
    });
};
