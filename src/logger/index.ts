import chalk from 'chalk';
import { FileToRuleToRuleApplicationResult, RuleToRuleApplicationResult } from './../types';
import logRuleApplicationResult from './log-result';

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
