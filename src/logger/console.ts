import chalk from 'chalk';
import { LogEntry } from './../types';

export default (logs: LogEntry[]): void => {
    if (!logs.length) {
        return;
    }

    console.log(chalk.bgBlackBright('Project'));

    logs.forEach(log => {
        if (log.warnings) {
            log.warnings.forEach(warning => {
                console.warn(chalk.yellow('warning: ') + chalk.gray(log.rule) + ' ' + warning);
            });
        }

        if (log.errors) {
            log.errors.forEach(error => {
                console.error(chalk.red('error: ') + chalk.gray(log.rule) + ' ' + error);
            });
        }
    });
};
