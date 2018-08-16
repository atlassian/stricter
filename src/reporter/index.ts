import { LogEntry } from './../types';

export { default as consoleReporter } from './console';
export { default as mochaReporter } from './mocha';
export { default as junitReporter } from './junit';
export { compactProjectLogs } from './flatten';
export const getErrorCount = (projectLogs: LogEntry[]) =>
    Object.values(projectLogs).reduce((acc, i) => acc + ((i.errors && i.errors.length) || 0), 0);
