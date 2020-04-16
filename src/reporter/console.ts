import chalk from 'chalk';
import { compactProjectLogs } from './flatten';
import { RuleToRuleApplicationResult } from './../types';

export default (report: RuleToRuleApplicationResult): void => {
    const logs = compactProjectLogs(report);

    if (!logs.length) {
        console.log('No errors');
        return;
    }

    logs.forEach((log) => {
        if (log.warnings) {
            log.warnings.forEach((warning) => {
                console.log(`${chalk.yellow('warning: ')}${chalk.gray(log.rule)} ${warning}`);
            });
        }

        if (log.errors) {
            log.errors.forEach((error) => {
                console.log(`${chalk.red('error: ')}${chalk.gray(log.rule)} ${error}`);
            });
        }
    });

    const errorCount = logs.reduce((acc, i) => acc + ((i.errors && i.errors.length) || 0), 0);

    console.log(`${errorCount} error${errorCount > 1 ? 's' : ''}`);
};
