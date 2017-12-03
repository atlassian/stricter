import chalk from 'chalk';
import { FileToRuleToRuleApplicationResult, RuleToRuleApplicationResult } from './../types';
import logToConsole from './console';
import { compactFileLogs, compactProjectLogs } from './flatten';

export const consoleLogger = (
    fileResult: FileToRuleToRuleApplicationResult,
    projectResult: RuleToRuleApplicationResult,
): void => {
    const fileLogs = compactFileLogs(fileResult);
    if (fileLogs.length) {
        console.log(chalk.bgBlackBright('Files'));
        logToConsole(fileLogs);
    }

    const projectLogs = compactProjectLogs(projectResult);
    if (projectLogs.length) {
        console.log(chalk.bgBlackBright('Project'));
        logToConsole(projectLogs);
    }
};
