import chalk from 'chalk';
import { LogEntry } from './../types';

export default (logs: LogEntry[]): void => {
    let previousFilePath: string | undefined;

    logs.forEach(log => {
        if (previousFilePath !== log.filePath) {
            previousFilePath = log.filePath;

            if (log.filePath) {
                console.log(chalk.white(log.filePath));
            }
        }

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
