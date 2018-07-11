import { getConfig } from './config';
import { getRuleDefinitions, getRuleApplications, filterFilesToProcess } from './rule';
import { applyProjectRules, readFilesData } from './processor';
import {
    consoleLogger,
    junitLogger,
    mochaLogger,
    compactProjectLogs,
    getErrorCount,
} from './logger';
import { listFiles } from './utils';
import { StricterArguments, Reporter } from './types';
import debug, { measure } from './debug';

export default ({
    silent = false,
    reporter = Reporter.CONSOLE,
    configPath,
}: StricterArguments): number => {
    const result = measure('Total', () => {
        debug({
            silent,
            reporter,
            configPath,
        });

        if (!silent) {
            console.log('Stricter: Checking...');
        }

        const config = measure('Read config', () => getConfig(configPath));

        const fileList = measure('Get file list', () => listFiles(config.root, config.exclude));

        const ruleDefinitions = measure('Get rule definitions', () => getRuleDefinitions(config));

        const ruleApplications = measure('Get rule applications', () =>
            getRuleApplications(config, ruleDefinitions),
        );

        const filesToProcess = measure('Get files to process', () =>
            filterFilesToProcess(config.root, fileList, ruleApplications),
        );

        const filesData = measure('Read files data', () => readFilesData(filesToProcess));

        const projectResult = measure('Apply rules', () =>
            applyProjectRules(config.root, filesData, ruleApplications),
        );

        const logs = measure('Massage logs', () => compactProjectLogs(projectResult));

        measure('Write logs', () => {
            if (reporter === Reporter.MOCHA) {
                mochaLogger(logs);
            } else if (reporter === Reporter.JUNIT) {
                junitLogger(logs);
            } else {
                consoleLogger(logs);
            }
        });

        const result = measure('Count errors', () => getErrorCount(logs));

        if (!silent) {
            if (result === 0) {
                console.log('Stricter: No errors');
            } else {
                console.log(`Stricter: ${result} error${result > 1 ? 's' : ''}`);
            }
        }

        return result === 0 ? 0 : 1;
    });

    return result;
};
