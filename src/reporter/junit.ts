import { EOL } from 'os';
import xmlEscape from 'xml-escape';
import { RuleToRuleApplicationResult } from './../types';

interface ReportData {
    failures: number;
    errors: number;
    tests: number;
    time: number;
    rules: {
        [rule: string]: {
            failureList: string[];
            time: number;
        };
    };
}

// According to https://en.wikipedia.org/wiki/CDATA#Nesting this is how you escape the CDATA end
// sequence in CDATA
const escapeCDATA = (cdata: string): string => {
    return cdata.replace(/\]\]\>/g, ']]]]><![CDATA[>');
};

const reportTemplate = (suite: string, time: number) => `<?xml version="1.0" encoding="utf-8"?>
    <testsuites package="stricter" time="${time}">
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

const testcaseTemplate = (
    name: string,
    failures: string,
    time: number,
) => `<testcase name="${xmlEscape(name)}" time="${time}">
    ${failures}
</testcase>`;

const testcaseFailure = (detail: string) =>
    `<failure type="error">${
        detail !== ''
            ? `<![CDATA[
${escapeCDATA(detail)}]]>`
            : ''
    }</failure>`;

export default (report: RuleToRuleApplicationResult): void => {
    const data: ReportData = Object.entries(report).reduce(
        (acc, [rule, applicationResult]) => {
            const failureList: string[] = [];

            if (applicationResult.errors.length) {
                acc.failures += applicationResult.errors.length;
                acc.errors += applicationResult.errors.length;
                failureList.push(testcaseFailure(applicationResult.errors.join(EOL)));
            }

            const timeInS = applicationResult.time / 1000;
            acc.time += timeInS;
            acc.rules[rule] = {
                failureList,
                time: timeInS,
            };
            acc.tests += 1;

            return acc;
        },
        { failures: 0, errors: 0, tests: 0, time: 0, rules: {} } as ReportData,
    );

    const testcases = Object.keys(data.rules).map((rule) =>
        testcaseTemplate(rule, data.rules[rule].failureList.join(EOL), data.rules[rule].time),
    );

    // If we don't have any rules, we still need a dummy testcase so that there's something to parse
    if (testcases.length === 0) {
        data.tests = 1;
        testcases.push(testcaseTemplate('no errors', '', 0));
    }

    const xml = reportTemplate(
        suiteTemplate('stricter', data.failures, data.errors, data.tests, testcases),
        data.time,
    );

    console.log(xml);
};
