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

    const errorCount = Object.values(projectLogs).reduce(
        (acc, i) => acc + ((i.errors && i.errors.length) || 0),
        0,
    );

    return errorCount;
};
