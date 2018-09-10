import { RuleToRuleApplicationResult } from './../types';

export { default as consoleReporter } from './console';
export { default as mochaReporter } from './mocha';
export { default as junitReporter } from './junit';

export const getErrorCount = (report: RuleToRuleApplicationResult) =>
    Object.values(report).reduce((acc, i) => acc + ((i.errors && i.errors.length) || 0), 0);
