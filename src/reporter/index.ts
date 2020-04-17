import type { RuleToRuleApplicationResult } from './../types';

export { reporter as consoleReporter } from './console';
export { reporter as mochaReporter } from './mocha';
export { reporter as junitReporter } from './junit';

export const getErrorCount = (report: RuleToRuleApplicationResult) =>
    Object.values(report).reduce((acc, i) => acc + ((i.errors && i.errors.length) || 0), 0);
