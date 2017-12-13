import { LogEntry } from './../types';

export { default as consoleLogger } from './console';
export { default as mochaLogger } from './mocha';
export { compactProjectLogs } from './flatten';
export const getErrorCount = (projectLogs: LogEntry[]) =>
    Object.values(projectLogs).reduce((acc, i) => acc + ((i.errors && i.errors.length) || 0), 0);
