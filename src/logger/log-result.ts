import chalk from 'chalk';
import { RuleToRuleApplicationResult } from './../types';

export default (result: RuleToRuleApplicationResult): void => {
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
