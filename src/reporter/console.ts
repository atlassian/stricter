import c from 'ansi-colors';
import { compactProjectLogs } from './flatten';
import type { RuleToRuleApplicationResult } from './../types';

export const reporter = (report: RuleToRuleApplicationResult): void => {
    const logs = compactProjectLogs(report);

    if (!logs.length) {
        console.log('No errors');
        return;
    }

    logs.forEach((log) => {
        if (log.warnings) {
            log.warnings.forEach((warning) => {
                console.log(`${c.yellow('warning: ')}${c.gray(log.rule)} ${warning}`);
            });
        }

        if (log.errors) {
            log.errors.forEach((error) => {
                console.log(`${c.red('error: ')}${c.gray(log.rule)} ${error}`);
            });
        }
    });

    const errorCount = logs.reduce((acc, i) => acc + ((i.errors && i.errors.length) || 0), 0);
    const fixesAreAvailable = Object.values(report).some((i) => i.fixes && i.fixes.length > 0);

    console.log(`${errorCount} error${errorCount > 1 ? 's' : ''}`);

    if (fixesAreAvailable) {
        console.log('Fixes are available. Run "stricter --fix" to apply them.');
    }
};
