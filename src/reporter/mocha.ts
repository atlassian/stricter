import * as fs from 'fs';
import { EOL } from 'os';
import type { RuleToRuleApplicationResult } from './../types';

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

interface Failure {
    title: string;
    fullTitle: string;
    duration: number;
    errorCount: number;
    error: string | undefined;
}

export const reporter = (report: RuleToRuleApplicationResult): void => {
    const now = new Date();
    const testsCount = Object.values(report).length;
    const failuresCount = Object.values(report).reduce(
        (acc, i) => acc + ((i.errors && i.errors.length) || 0),
        0,
    );

    const failures = Object.entries(report).reduce((acc, [rule, applicationResult]) => {
        acc.push({
            title: rule,
            fullTitle: rule,
            duration: applicationResult.time / 1000,
            errorCount: applicationResult.errors.length,
            error: applicationResult.errors.map((i) => encode(i)).join(EOL),
        });

        return acc;
    }, [] as Failure[]);

    const result = {
        failures,
        stats: {
            tests: testsCount,
            passes: testsCount - failuresCount,
            failures: failuresCount,
            duration: 0,
            start: now,
            end: now,
        },
        passes: [],
        skipped: [],
    };

    fs.writeFileSync(reportFileName, JSON.stringify(result, null, 2), 'utf-8');
};
