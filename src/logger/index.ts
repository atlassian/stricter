import chalk from 'chalk';
import { RuleToRuleApplicationResult } from './../types';
import logToConsole from './console';
import { compactProjectLogs } from './flatten';

export const consoleLogger = (projectResult: RuleToRuleApplicationResult): number => {
    const projectLogs = compactProjectLogs(projectResult);
    if (projectLogs.length) {
        console.log(chalk.bgBlackBright('Project'));
        logToConsole(projectLogs);
    }

    return projectLogs.length;
};
