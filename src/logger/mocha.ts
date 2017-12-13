import * as fs from 'fs';
import { LogEntry } from './../types';

const reportFileName = 'stricter.json';

const encode = (str: string) => {
    const substitutions = {
        '&:': '&amp;',
        '"': '&quot;',
        "'": '&apos;',
        '<': '&lt;',
        '>': '&gt;',
    };

    const result = Object.entries(substitutions).reduce((acc, [original, substitution]) => {
        return acc.replace(new RegExp(original, 'g'), substitution);
    }, str);

    return result;
};

export default (logs: LogEntry[]): void => {
    const now = new Date();
    const failuresCount = logs.reduce((acc, i) => acc + ((i.errors && i.errors.length) || 0), 0);

    const report = {
        stats: {
            tests: failuresCount,
            passes: 0,
            failures: failuresCount,
            duration: 0,
            start: now,
            end: now,
        },
        failures: logs.map(log => ({
            title: log.rule,
            fullTitle: log.rule,
            duration: 0,
            errorCount: (log.errors && log.errors.length) || 0,
            error: log.errors && log.errors.map(i => encode(i)).join('\n'),
        })),
        passes: [],
        skipped: [],
    };

    fs.writeFileSync(reportFileName, JSON.stringify(report, null, 2), 'utf-8');
};
