import { EOL } from 'os';
import xmlEscape = require('xml-escape');
import { RuleToRuleApplicationResult } from './../types';

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
    ${testcases.join(EOL)}
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

export default (report: RuleToRuleApplicationResult): void => {
    const data: ReportData = Object.entries(report).reduce(
        (acc, [rule, applicationResult]) => {
            const failureList: string[] = [];

            if (applicationResult.errors) {
                acc.failures += applicationResult.errors.length;
                acc.errors += applicationResult.errors.length;
                failureList.push(
                    testcaseFailure(Level.ERROR, '', applicationResult.errors.join(EOL)),
                );
            }

            if (applicationResult.warnings) {
                acc.failures += applicationResult.warnings.length;
                failureList.push(
                    testcaseFailure(Level.WARNING, '', applicationResult.warnings.join(EOL)),
                );
            }

            acc.rules[rule] = failureList;
            acc.tests += 1;

            return acc;
        },
        { failures: 0, errors: 0, tests: 0, rules: {} } as ReportData,
    );

    const testcases = Object.keys(data.rules).map(rule =>
        testcaseTemplate(rule, data.rules[rule].join(EOL)),
    );

    // If we don't have any rules, we still need a dummy testcase so that there's something to parse
    if (testcases.length === 0) {
        data.tests = 1;
        testcases.push(testcaseTemplate('no errors', ''));
    }

    const xml = reportTemplate(
        suiteTemplate('stricter', data.failures, data.errors, data.tests, testcases),
    );

    console.log(xml);
};
