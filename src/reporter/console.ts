import c from 'ansi-colors';
import wrapAnsi from 'wrap-ansi';
import { compactProjectLogs } from './flatten';
import type { RuleToRuleApplicationResult } from './../types';

enum LogType {
    warning = 'warning',
    error = 'error',
}

const getLogColorName = (type: LogType) => {
    switch (type) {
        case LogType.warning:
            return 'yellow';
        case LogType.error:
            return 'red';
    }
};

const logMessage = (type: LogType, rule: string, message: string) => {
    console.log(
        wrapAnsi(
            `${c[getLogColorName(type)](`${type}: `)}${c.gray(rule)} ${message}`,
            process.stdout.columns,
        ),
    );
};

export const reporter = (report: RuleToRuleApplicationResult): void => {
    const logs = compactProjectLogs(report);

    if (!logs.length) {
        console.log('No errors');
        return;
    }

    logs.forEach((log) => {
        if (log.warnings) {
            log.warnings.forEach((warning) => {
                logMessage(LogType.warning, log.rule, warning);
            });
        }

        if (log.errors) {
            log.errors.forEach((error) => {
                logMessage(LogType.error, log.rule, error);
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
