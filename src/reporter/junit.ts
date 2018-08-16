import { LogEntry } from './../types';
import xmlEscape = require('xml-escape');

enum Level {
    WARNING = 'warning',
    ERROR = 'error',
}

interface ReportData {
    failures: number;
    errors: number;
    tests: number;
    rules: { [rule: string]: string[] };
}

// According to https://en.wikipedia.org/wiki/CDATA#Nesting this is how you escape the CDATA end
// sequence in CDATA
const escapeCDATA = (cdata: string): string => {
    return cdata.replace(/\]\]\>/g, ']]]]><![CDATA[>');
};

const reportTemplate = (suite: string) => `<?xml version="1.0" encoding="utf-8"?>
    <testsuites package="stricter">
        ${suite}
    </testsuites>`;

const suiteTemplate = (
    name: string,
    failureCount: number,
    errors: number,
    tests: number,
    testcases: string[],
) => `<testsuite name="${xmlEscape(
    name,
)}" failures="${failureCount}" errors="${errors}" tests="${tests}">
    ${testcases.join('\n')}
</testsuite>`;

const testcaseTemplate = (name: string, failures: string) => `<testcase name="${xmlEscape(name)}">
    ${failures}
</testcase>`;

const testcaseFailure = (type: Level, message: string, detail: string = '') =>
    `<failure type="${type}"${message !== '' ? ` message="${xmlEscape(message)}"` : ''}>${
        detail !== ''
            ? `<![CDATA[
${escapeCDATA(detail)}]]>`
            : ''
    }</failure>`;

export default (logs: LogEntry[]): void => {
    const data: ReportData = logs.reduce(
        (acc: ReportData, log) => {
            if (!acc.rules.hasOwnProperty(log.rule)) {
                acc.rules[log.rule] = [];
            }
            if (log.errors) {
                acc.failures += log.errors.length;
                acc.errors += log.errors.length;
                acc.rules[log.rule].push(testcaseFailure(Level.ERROR, '', log.errors.join('\n')));
            }
            if (log.warnings) {
                acc.failures += log.warnings.length;
                acc.rules[log.rule].push(
                    testcaseFailure(Level.WARNING, '', log.warnings.join('\n')),
                );
            }
            acc.tests += 1;
            return acc;
        },
        { failures: 0, errors: 0, tests: 0, rules: {} },
    );

    const testcases = Object.keys(data.rules).map(rule =>
        testcaseTemplate(rule, data.rules[rule].join('\n')),
    );

    // the JUnit format isn't really designed for a system that doesn't log success, so if we don't
    // have any warnings or failures we still need a dummy testcase so that there's something to parse
    if (testcases.length === 0) {
        data.tests = 1;
        testcases.push(testcaseTemplate('no errors', ''));
    }
    const xml = reportTemplate(
        suiteTemplate('stricter', data.failures, data.errors, data.tests, testcases),
    );

    console.log(xml);
};
